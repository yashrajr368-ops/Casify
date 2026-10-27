from datetime import datetime
from backend.extensions import db

class Device(db.Model):
    __tablename__ = 'devices'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    category = db.Column(db.String(50), nullable=False)  # Smartphone, Laptop, Tablet, Smartwatch
    brand = db.Column(db.String(100), nullable=False)
    model = db.Column(db.String(100), nullable=False)
    purchase_year = db.Column(db.Integer, nullable=False)
    ram = db.Column(db.Integer, nullable=True)  # in GB
    storage = db.Column(db.Integer, nullable=True)  # in GB
    processor = db.Column(db.String(100), nullable=True)
    battery_health = db.Column(db.Integer, nullable=True)  # 0 - 100 percentage
    screen_condition = db.Column(db.String(50), default='Good')  # Excellent, Good, Fair, Poor
    body_condition = db.Column(db.String(50), default='Good')
    camera_condition = db.Column(db.String(50), default='Good')
    speaker_condition = db.Column(db.String(50), default='Good')
    charging_port_condition = db.Column(db.String(50), default='Good')
    overall_condition = db.Column(db.String(50), default='Good')
    has_box = db.Column(db.Boolean, default=False)
    has_charger = db.Column(db.Boolean, default=False)
    has_bill = db.Column(db.Boolean, default=False)
    has_warranty = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    images = db.relationship('DeviceImage', backref='device', lazy=True, cascade='all, delete-orphan')
    predictions = db.relationship('PricePrediction', backref='device', lazy=True, cascade='all, delete-orphan')
    sell_requests = db.relationship('SellRequest', backref='device', lazy=True)
    repair_requests = db.relationship('RepairRequest', backref='device', lazy=True)

    def to_dict(self, include_relations=True):
        data = {
            'id': self.id,
            'user_id': self.user_id,
            'category': self.category,
            'brand': self.brand,
            'model': self.model,
            'purchase_year': self.purchase_year,
            'ram': self.ram,
            'storage': self.storage,
            'processor': self.processor,
            'battery_health': self.battery_health,
            'screen_condition': self.screen_condition,
            'body_condition': self.body_condition,
            'camera_condition': self.camera_condition,
            'speaker_condition': self.speaker_condition,
            'charging_port_condition': self.charging_port_condition,
            'overall_condition': self.overall_condition,
            'has_box': self.has_box,
            'has_charger': self.has_charger,
            'has_bill': self.has_bill,
            'has_warranty': self.has_warranty,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
        if include_relations:
            data['images'] = [img.to_dict() for img in self.images]
            latest_pred = (
                self.predictions[-1].to_dict()
                if self.predictions else None
            )
            data['latest_prediction'] = latest_pred
        return data


class DeviceImage(db.Model):
    __tablename__ = 'device_images'

    id = db.Column(db.Integer, primary_key=True)
    device_id = db.Column(db.Integer, db.ForeignKey('devices.id'), nullable=False)
    image_path = db.Column(db.String(255), nullable=False)
    image_type = db.Column(db.String(50), default='front')  # front, back, screen, damage, side
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'device_id': self.device_id,
            'image_path': self.image_path,
            'image_type': self.image_type,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
