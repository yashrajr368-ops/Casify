import os
import json
import random
from datetime import datetime, timedelta
from backend.app import create_app
from backend.extensions import db
from backend.models import (
    User, Device, PricePrediction, SellRequest,
    ExchangeRequest, RepairRequest, Pickup,
    Notification, DeviceCatalog
)
from backend.ml.predict import predict_device_price

def seed():
    app = create_app()
    with app.app_context():
        print("Resetting database tables...")
        db.drop_all()
        db.create_all()

        # ==========================================
        # 1. SEED CATALOG ITEMS
        # ==========================================
        print("Seeding Device Catalog...")
        catalog_seeds = [
            # Smartphones
            {'category': 'Smartphone', 'brand': 'Apple', 'model': 'iPhone 15 Pro Max', 'base_price': 159900, 'release_year': 2023, 'ram_options': '8', 'storage_options': '256,512,1024', 'processor': 'Apple A17 Pro'},
            {'category': 'Smartphone', 'brand': 'Apple', 'model': 'iPhone 15 Pro', 'base_price': 134900, 'release_year': 2023, 'ram_options': '8', 'storage_options': '128,256,512', 'processor': 'Apple A17 Pro'},
            {'category': 'Smartphone', 'brand': 'Apple', 'model': 'iPhone 15', 'base_price': 79900, 'release_year': 2023, 'ram_options': '6', 'storage_options': '128,256,512', 'processor': 'Apple A16 Bionic'},
            {'category': 'Smartphone', 'brand': 'Apple', 'model': 'iPhone 14', 'base_price': 69900, 'release_year': 2022, 'ram_options': '6', 'storage_options': '128,256', 'processor': 'Apple A15 Bionic'},
            {'category': 'Smartphone', 'brand': 'Apple', 'model': 'iPhone 13', 'base_price': 59900, 'release_year': 2021, 'ram_options': '4', 'storage_options': '128,256', 'processor': 'Apple A15 Bionic'},
            {'category': 'Smartphone', 'brand': 'Samsung', 'model': 'Galaxy S24 Ultra', 'base_price': 129999, 'release_year': 2024, 'ram_options': '12', 'storage_options': '256,512,1024', 'processor': 'Snapdragon 8 Gen 3'},
            {'category': 'Smartphone', 'brand': 'Samsung', 'model': 'Galaxy S23', 'base_price': 74999, 'release_year': 2023, 'ram_options': '8', 'storage_options': '128,256', 'processor': 'Snapdragon 8 Gen 2'},
            {'category': 'Smartphone', 'brand': 'OnePlus', 'model': 'OnePlus 12', 'base_price': 64999, 'release_year': 2024, 'ram_options': '12,16', 'storage_options': '256,512', 'processor': 'Snapdragon 8 Gen 3'},
            {'category': 'Smartphone', 'brand': 'Google', 'model': 'Pixel 8 Pro', 'base_price': 106999, 'release_year': 2023, 'ram_options': '12', 'storage_options': '128,256,512', 'processor': 'Google Tensor G3'},
            {'category': 'Smartphone', 'brand': 'Xiaomi', 'model': 'Xiaomi 14', 'base_price': 69999, 'release_year': 2024, 'ram_options': '12', 'storage_options': '512', 'processor': 'Snapdragon 8 Gen 3'},

            # Laptops
            {'category': 'Laptop', 'brand': 'Apple', 'model': 'MacBook Pro M3 14"', 'base_price': 169900, 'release_year': 2023, 'ram_options': '8,16,24', 'storage_options': '512,1024', 'processor': 'Apple M3'},
            {'category': 'Laptop', 'brand': 'Apple', 'model': 'MacBook Air M2 13"', 'base_price': 99900, 'release_year': 2022, 'ram_options': '8,16', 'storage_options': '256,512', 'processor': 'Apple M2'},
            {'category': 'Laptop', 'brand': 'Dell', 'model': 'XPS 15 (9530)', 'base_price': 189990, 'release_year': 2023, 'ram_options': '16,32', 'storage_options': '512,1024', 'processor': 'Intel Core i7-13700H'},
            {'category': 'Laptop', 'brand': 'HP', 'model': 'Pavilion 15', 'base_price': 64999, 'release_year': 2023, 'ram_options': '8,16', 'storage_options': '512', 'processor': 'Intel Core i5-1335U'},
            {'category': 'Laptop', 'brand': 'Lenovo', 'model': 'ThinkPad X1 Carbon Gen 11', 'base_price': 174990, 'release_year': 2023, 'ram_options': '16,32', 'storage_options': '512,1024', 'processor': 'Intel Core i7-1365U'},

            # Tablets
            {'category': 'Tablet', 'brand': 'Apple', 'model': 'iPad Pro 11" (4th Gen)', 'base_price': 81900, 'release_year': 2022, 'ram_options': '8,16', 'storage_options': '128,256,512', 'processor': 'Apple M2'},
            {'category': 'Tablet', 'brand': 'Apple', 'model': 'iPad Air (5th Gen)', 'base_price': 59900, 'release_year': 2022, 'ram_options': '8', 'storage_options': '64,256', 'processor': 'Apple M1'},
            {'category': 'Tablet', 'brand': 'Samsung', 'model': 'Galaxy Tab S9', 'base_price': 72999, 'release_year': 2023, 'ram_options': '8,12', 'storage_options': '128,256', 'processor': 'Snapdragon 8 Gen 2'},

            # Smartwatches
            {'category': 'Smartwatch', 'brand': 'Apple', 'model': 'Apple Watch Series 9', 'base_price': 41900, 'release_year': 2023, 'ram_options': '1', 'storage_options': '64', 'processor': 'Apple S9 SiP'},
            {'category': 'Smartwatch', 'brand': 'Samsung', 'model': 'Galaxy Watch 6 Classic', 'base_price': 36999, 'release_year': 2023, 'ram_options': '2', 'storage_options': '16', 'processor': 'Exynos W930'}
        ]

        catalog_objs = []
        for cat in catalog_seeds:
            c = DeviceCatalog(**cat)
            db.session.add(c)
            catalog_objs.append(c)
        db.session.commit()

        # ==========================================
        # 2. SEED USERS (ADMIN, AGENTS, CUSTOMERS)
        # ==========================================
        print("Seeding Users...")
        # Admin Demo
        admin = User(
            full_name="RETECH Administrator",
            email="admin@retechai.com",
            phone="+91 9876543210",
            role="ADMIN",
            address="Technology Park, Sector 5",
            city="Bengaluru",
            state="Karnataka",
            pincode="560100"
        )
        admin.set_password("Admin@123")
        db.session.add(admin)

        # 2 Agents
        agent1 = User(
            full_name="Rohan Verma (Field Agent)",
            email="agent1@retechai.com",
            phone="+91 9876543211",
            role="AGENT",
            address="Hub 4, Outer Ring Road",
            city="Bengaluru",
            state="Karnataka",
            pincode="560103"
        )
        agent1.set_password("Agent@123")

        agent2 = User(
            full_name="Priya Sharma (Field Agent)",
            email="agent2@retechai.com",
            phone="+91 9876543212",
            role="AGENT",
            address="Sector 18, Cyber City",
            city="Gurugram",
            state="Haryana",
            pincode="122002"
        )
        agent2.set_password("Agent@123")
        db.session.add_all([agent1, agent2])

        # 10 Customers
        customer_names = [
            ("Aarav Patel", "aarav@example.com", "9811223344", "Indiranagar", "Bengaluru", "Karnataka", "560038"),
            ("Diya Sen", "diya@example.com", "9822334455", "Salt Lake", "Kolkata", "West Bengal", "700091"),
            ("Kavita Rao", "kavita@example.com", "9833445566", "Banjara Hills", "Hyderabad", "Telangana", "500034"),
            ("Arjun Mehta", "arjun@example.com", "9844556677", "Bandra West", "Mumbai", "Maharashtra", "400050"),
            ("Ananya Nair", "ananya@example.com", "9855667788", "Koramangala", "Bengaluru", "Karnataka", "560034"),
            ("Vikram Singh", "vikram@example.com", "9866778899", "Civil Lines", "Jaipur", "Rajasthan", "302006"),
            ("Sneha Joshi", "sneha@example.com", "9877889900", "Aundh", "Pune", "Maharashtra", "411007"),
            ("Rahul Gupta", "rahul@example.com", "9888990011", "Vasant Kunj", "New Delhi", "Delhi", "110070"),
            ("Pooja Mishra", "pooja@example.com", "9899001122", "Gomti Nagar", "Lucknow", "Uttar Pradesh", "226010"),
            ("Karan Kapoor", "karan@example.com", "9800112233", "Alwarpet", "Chennai", "Tamil Nadu", "600018")
        ]

        customers = []
        for name, email, phone, addr, city, state, pin in customer_names:
            u = User(
                full_name=name,
                email=email,
                phone=phone,
                role="CUSTOMER",
                address=addr,
                city=city,
                state=state,
                pincode=pin
            )
            u.set_password("User@123")
            db.session.add(u)
            customers.append(u)

        db.session.commit()

        # ==========================================
        # 3. SEED 20 DEVICES & PREDICTIONS
        # ==========================================
        print("Seeding 20 Devices and Price Predictions...")
        conditions = ['Excellent', 'Good', 'Fair', 'Poor']
        devices = []
        predictions = []

        sample_specs = [
            ('Smartphone', 'Apple', 'iPhone 14', 2022, 6, 128, 'Apple A15', 88, 'Good', 'Good', 'Good', True, True, True, False),
            ('Smartphone', 'Apple', 'iPhone 13', 2021, 4, 128, 'Apple A15', 82, 'Good', 'Fair', 'Good', True, True, False, False),
            ('Smartphone', 'Samsung', 'Galaxy S23', 2023, 8, 256, 'Snapdragon 8 Gen 2', 92, 'Excellent', 'Excellent', 'Excellent', True, True, True, True),
            ('Smartphone', 'OnePlus', 'OnePlus 12', 2024, 16, 512, 'Snapdragon 8 Gen 3', 98, 'Excellent', 'Excellent', 'Excellent', True, True, True, True),
            ('Smartphone', 'Google', 'Pixel 8 Pro', 2023, 12, 128, 'Google Tensor G3', 90, 'Good', 'Good', 'Good', True, True, True, False),
            ('Smartphone', 'Apple', 'iPhone 15 Pro', 2023, 8, 256, 'Apple A17 Pro', 94, 'Excellent', 'Good', 'Excellent', True, True, True, True),
            ('Smartphone', 'Samsung', 'Galaxy S24 Ultra', 2024, 12, 512, 'Snapdragon 8 Gen 3', 99, 'Excellent', 'Excellent', 'Excellent', True, True, True, True),
            ('Smartphone', 'Xiaomi', 'Xiaomi 14', 2024, 12, 512, 'Snapdragon 8 Gen 3', 96, 'Good', 'Good', 'Good', True, True, True, False),
            ('Laptop', 'Apple', 'MacBook Air M2 13"', 2022, 8, 256, 'Apple M2', 89, 'Good', 'Good', 'Good', True, True, True, False),
            ('Laptop', 'Apple', 'MacBook Pro M3 14"', 2023, 16, 512, 'Apple M3', 96, 'Excellent', 'Excellent', 'Excellent', True, True, True, True),
            ('Laptop', 'Dell', 'XPS 15 (9530)', 2023, 16, 512, 'Intel Core i7', 87, 'Good', 'Fair', 'Good', True, True, False, False),
            ('Laptop', 'HP', 'Pavilion 15', 2023, 16, 512, 'Intel Core i5', 84, 'Good', 'Good', 'Good', True, True, True, False),
            ('Laptop', 'Lenovo', 'ThinkPad X1 Carbon Gen 11', 2023, 16, 512, 'Intel Core i7', 91, 'Excellent', 'Good', 'Good', True, True, True, False),
            ('Tablet', 'Apple', 'iPad Pro 11" (4th Gen)', 2022, 8, 128, 'Apple M2', 88, 'Good', 'Good', 'Good', True, True, True, False),
            ('Tablet', 'Apple', 'iPad Air (5th Gen)', 2022, 8, 64, 'Apple M1', 86, 'Fair', 'Fair', 'Fair', False, True, False, False),
            ('Tablet', 'Samsung', 'Galaxy Tab S9', 2023, 8, 128, 'Snapdragon 8 Gen 2', 93, 'Excellent', 'Excellent', 'Excellent', True, True, True, True),
            ('Smartwatch', 'Apple', 'Apple Watch Series 9', 2023, 1, 64, 'Apple S9', 92, 'Excellent', 'Good', 'Good', True, True, True, True),
            ('Smartwatch', 'Samsung', 'Galaxy Watch 6 Classic', 2023, 2, 16, 'Exynos W930', 88, 'Good', 'Good', 'Good', True, True, False, False),
            ('Smartphone', 'Apple', 'iPhone 15', 2023, 6, 128, 'Apple A16', 95, 'Excellent', 'Excellent', 'Excellent', True, True, True, True),
            ('Laptop', 'Dell', 'Inspiron 15', 2022, 8, 512, 'Intel Core i5', 81, 'Fair', 'Fair', 'Fair', True, True, False, False)
        ]

        for i, spec in enumerate(sample_specs):
            cust = customers[i % len(customers)]
            d = Device(
                user_id=cust.id,
                category=spec[0],
                brand=spec[1],
                model=spec[2],
                purchase_year=spec[3],
                ram=spec[4],
                storage=spec[5],
                processor=spec[6],
                battery_health=spec[7],
                screen_condition=spec[8],
                body_condition=spec[9],
                camera_condition='Good',
                speaker_condition='Good',
                charging_port_condition='Good',
                overall_condition=spec[10],
                has_box=spec[11],
                has_charger=spec[12],
                has_bill=spec[13],
                has_warranty=spec[14],
                created_at=datetime.utcnow() - timedelta(days=random.randint(1, 45))
            )
            db.session.add(d)
            db.session.flush()
            devices.append(d)

            # Predict pricing
            res = predict_device_price({
                'category': d.category,
                'brand': d.brand,
                'model': d.model,
                'purchase_year': d.purchase_year,
                'ram': d.ram,
                'storage': d.storage,
                'battery_health': d.battery_health,
                'screen_condition': d.screen_condition,
                'body_condition': d.body_condition,
                'overall_condition': d.overall_condition,
                'has_box': d.has_box,
                'has_charger': d.has_charger,
                'has_bill': d.has_bill,
                'has_warranty': d.has_warranty
            })

            p = PricePrediction(
                device_id=d.id,
                predicted_price=res['predicted_price'],
                minimum_price=res['minimum_price'],
                maximum_price=res['maximum_price'],
                confidence_score=res['confidence_score'],
                condition_score=res['condition_score'],
                breakdown_json=json.dumps(res['breakdown']),
                model_version=res['model_version'],
                created_at=d.created_at
            )
            db.session.add(p)
            predictions.append(p)

        db.session.commit()

        # ==========================================
        # 4. SEED 10 SELL REQUESTS & PICKUPS
        # ==========================================
        print("Seeding 10 Sell Requests...")
        sell_statuses = [
            'Requested', 'Confirmed', 'Agent Assigned', 'Pickup Scheduled',
            'Picked Up', 'Inspection', 'Final Offer', 'Completed', 'Requested', 'Completed'
        ]

        sell_requests = []
        for i in range(10):
            d = devices[i]
            status = sell_statuses[i]
            assigned_agent = agent1 if i % 2 == 0 else agent2
            agent_id = assigned_agent.id if status not in ['Requested', 'Confirmed'] else None

            est_price = predictions[i].predicted_price
            final_price = round(est_price * random.uniform(0.96, 1.02), -2) if status in ['Final Offer', 'Completed'] else None

            sell_req = SellRequest(
                request_code=f"SELL-2026-{1000 + i}",
                user_id=d.user_id,
                device_id=d.id,
                estimated_price=est_price,
                final_price=final_price,
                pickup_address=d.user.address or "42 MG Road",
                city=d.user.city or "Bengaluru",
                state=d.user.state or "Karnataka",
                pincode=d.user.pincode or "560001",
                pickup_date=(datetime.utcnow() + timedelta(days=i + 1)).strftime('%Y-%m-%d'),
                pickup_time="10:00 AM - 01:00 PM",
                status=status,
                agent_id=agent_id,
                notes="Standard evaluation and physical check required.",
                created_at=datetime.utcnow() - timedelta(days=12 - i)
            )
            db.session.add(sell_req)
            db.session.flush()
            sell_requests.append(sell_req)

            # Pickup record
            pickup = Pickup(
                request_type='sell',
                request_id=sell_req.id,
                user_id=d.user_id,
                agent_id=agent_id,
                address=f"{sell_req.pickup_address}, {sell_req.city}",
                pickup_date=sell_req.pickup_date,
                pickup_time=sell_req.pickup_time,
                status='Completed' if status == 'Completed' else 'Scheduled'
            )
            db.session.add(pickup)

        db.session.commit()

        # ==========================================
        # 5. SEED 5 EXCHANGE REQUESTS
        # ==========================================
        print("Seeding 5 Exchange Requests...")
        targets = [
            ("iPhone 15 Pro Max", 159900.0),
            ("Samsung Galaxy S24 Ultra", 129999.0),
            ("MacBook Pro M3 14\"", 169900.0),
            ("OnePlus 12", 64999.0),
            ("iPad Pro 11\" (4th Gen)", 81900.0)
        ]

        for i in range(5):
            d = devices[10 + i]
            target_name, target_price = targets[i]
            old_val = predictions[10 + i].predicted_price
            additional = max(0.0, target_price - old_val)

            exch = ExchangeRequest(
                request_code=f"EXCH-2026-{2000 + i}",
                user_id=d.user_id,
                old_device_id=d.id,
                target_device_name=target_name,
                target_device_price=target_price,
                old_device_value=old_val,
                additional_amount=additional,
                pickup_address=d.user.address or "88 Brigade Road",
                pickup_date=(datetime.utcnow() + timedelta(days=i + 2)).strftime('%Y-%m-%d'),
                pickup_time="02:00 PM - 05:00 PM",
                status='Confirmed' if i % 2 == 0 else 'Requested',
                agent_id=agent1.id if i % 2 == 0 else None,
                created_at=datetime.utcnow() - timedelta(days=8 - i)
            )
            db.session.add(exch)

        db.session.commit()

        # ==========================================
        # 6. SEED 5 REPAIR REQUESTS
        # ==========================================
        print("Seeding 5 Repair Requests...")
        repairs = [
            ("Screen", "Cracked front glass on top right corner; touch is still responsive.", 3500.0),
            ("Battery", "Battery drains rapidly; health is below 78%, requires replacement.", 1800.0),
            ("Charging Port", "Loose USB-C connector; disconnects during fast charging.", 950.0),
            ("Camera", "Rear ultra-wide lens glass scratched; photos look blurry.", 2400.0),
            ("Speaker", "Earpiece speaker producing static cracking sound during calls.", 1200.0)
        ]

        for i in range(5):
            d = devices[15 + i]
            rep_type, desc, cost = repairs[i]

            rep = RepairRequest(
                request_code=f"REP-2026-{3000 + i}",
                user_id=d.user_id,
                device_id=d.id,
                device_name=f"{d.brand} {d.model}",
                repair_type=rep_type,
                problem_description=desc,
                estimated_cost=cost,
                pickup_address=d.user.address or "15 Richmond Circle",
                pickup_date=(datetime.utcnow() + timedelta(days=i + 1)).strftime('%Y-%m-%d'),
                pickup_time="10:00 AM - 01:00 PM",
                status='Under Repair' if i == 0 else 'Requested',
                agent_id=agent2.id if i == 0 else None,
                created_at=datetime.utcnow() - timedelta(days=5 - i)
            )
            db.session.add(rep)

        db.session.commit()

        # ==========================================
        # 7. SEED NOTIFICATIONS
        # ==========================================
        print("Seeding Notifications...")
        for cust in customers[:5]:
            db.session.add(Notification(
                user_id=cust.id,
                title="Special Exchange Bonus Active",
                message="Get an extra Rs 2,500 exchange bonus on all premium smartphones this month!",
                type="success",
                created_at=datetime.utcnow() - timedelta(days=2)
            ))
        db.session.commit()

        print("\n" + "=" * 60)
        print("  RETECH AI Database Seed Completed Successfully!")
        print("=" * 60)
        print("Demo Credentials:")
        print("  [ADMIN]    Email: admin@retechai.com   Password: Admin@123")
        print("  [AGENT 1]  Email: agent1@retechai.com  Password: Agent@123")
        print("  [AGENT 2]  Email: agent2@retechai.com  Password: Agent@123")
        print("  [CUSTOMER] Email: user1@example.com   Password: User@123")
        print("=" * 60 + "\n")

if __name__ == '__main__':
    seed()
