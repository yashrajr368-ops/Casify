import pytest
from flask_jwt_extended import create_access_token
from backend.app import create_app
from backend.config import TestingConfig
from backend.extensions import db
from backend.models import User, DeviceCatalog, Device, PricePrediction

@pytest.fixture
def app():
    app = create_app(TestingConfig)
    with app.app_context():
        db.create_all()

        # Seed test admin
        admin = User(
            full_name="Admin Test",
            email="admin@test.com",
            role="ADMIN"
        )
        admin.set_password("Admin@123")
        db.session.add(admin)

        # Seed test agent
        agent = User(
            full_name="Agent Test",
            email="agent@test.com",
            role="AGENT"
        )
        agent.set_password("Agent@123")
        db.session.add(agent)

        # Seed test customer
        customer = User(
            full_name="Customer Test",
            email="customer@test.com",
            role="CUSTOMER",
            address="123 Test St",
            city="Bengaluru",
            state="Karnataka",
            pincode="560001"
        )
        customer.set_password("Customer@123")
        db.session.add(customer)

        # Seed sample catalog item
        cat_item = DeviceCatalog(
            category="Smartphone",
            brand="Apple",
            model="iPhone 13",
            base_price=59900.0,
            release_year=2021,
            ram_options="4",
            storage_options="128,256",
            processor="A15 Bionic"
        )
        db.session.add(cat_item)
        db.session.commit()

        yield app

        db.session.remove()
        db.drop_all()

@pytest.fixture
def client(app):
    return app.test_client()

@pytest.fixture
def auth_headers(app):
    with app.app_context():
        admin = User.query.filter_by(email="admin@test.com").first()
        agent = User.query.filter_by(email="agent@test.com").first()
        customer = User.query.filter_by(email="customer@test.com").first()

        admin_token = create_access_token(identity=str(admin.id))
        agent_token = create_access_token(identity=str(agent.id))
        customer_token = create_access_token(identity=str(customer.id))

        return {
            'admin': {'Authorization': f'Bearer {admin_token}'},
            'agent': {'Authorization': f'Bearer {agent_token}'},
            'customer': {'Authorization': f'Bearer {customer_token}'},
            'admin_id': admin.id,
            'agent_id': agent.id,
            'customer_id': customer.id
        }
