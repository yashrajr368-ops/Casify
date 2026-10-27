from datetime import datetime
from backend.extensions import db

class ExchangeRequest(db.Model):
    __tablename__ = 'exchange_requests'

    id = db.Column(db.Integer, primary_key=True)
    request_code = db.Column(db.String(30), unique=True, nullable=False, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    old_device_id = db.Column(db.Integer, db.ForeignKey('devices.id'), nullable=False)
    new_device_id = db.Column(db.Integer, nullable=True)  # can refer to a DeviceCatalog id
    target_device_name = db.Column(db.String(150), nullable=False)
    target_device_price = db.Column(db.Float, nullable=False)
    old_device_value = db.Column(db.Float, nullable=False)
    additional_amount = db.Column(db.Float, nullable=False)  # target_price - old_value
    pickup_address = db.Column(db.String(255), nullable=True)
    pickup_date = db.Column(db.String(30), nullable=True)
    pickup_time = db.Column(db.String(30), nullable=True)
    status = db.Column(db.String(50), default='Requested', nullable=False)
    # Requested, Confirmed, Agent Assigned, Exchange Scheduled, Completed, Cancelled
    agent_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    old_device = db.relationship('Device', foreign_keys=[old_device_id], backref='exchange_requests', lazy=True)
    user = db.relationship('User', foreign_keys=[user_id], backref='exchange_requests', lazy=True)
    agent = db.relationship('User', foreign_keys=[agent_id], backref='assigned_exchange_requests', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'request_code': self.request_code,
            'user_id': self.user_id,
            'user_name': self.user.full_name if self.user else None,
            'user_email': self.user.email if self.user else None,
            'user_phone': self.user.phone if self.user else None,
            'old_device_id': self.old_device_id,
            'old_device': self.old_device.to_dict(include_relations=False) if self.old_device else None,
            'new_device_id': self.new_device_id,
            'target_device_name': self.target_device_name,
            'target_device_price': round(self.target_device_price, 2),
            'old_device_value': round(self.old_device_value, 2),
            'additional_amount': round(self.additional_amount, 2),
            'pickup_address': self.pickup_address,
            'pickup_date': self.pickup_date,
            'pickup_time': self.pickup_time,
            'status': self.status,
            'agent_id': self.agent_id,
            'agent_name': self.agent.full_name if self.agent else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
