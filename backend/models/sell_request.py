from datetime import datetime
from backend.extensions import db

class SellRequest(db.Model):
    __tablename__ = 'sell_requests'

    id = db.Column(db.Integer, primary_key=True)
    request_code = db.Column(db.String(30), unique=True, nullable=False, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    device_id = db.Column(db.Integer, db.ForeignKey('devices.id'), nullable=False)
    estimated_price = db.Column(db.Float, nullable=False)
    final_price = db.Column(db.Float, nullable=True)
    pickup_address = db.Column(db.String(255), nullable=False)
    city = db.Column(db.String(100), nullable=False)
    state = db.Column(db.String(100), nullable=False)
    pincode = db.Column(db.String(20), nullable=False)
    pickup_date = db.Column(db.String(30), nullable=False)
    pickup_time = db.Column(db.String(30), nullable=False)
    status = db.Column(db.String(50), default='Requested', nullable=False)
    # Statuses: Requested, Confirmed, Agent Assigned, Pickup Scheduled, Picked Up, Inspection, Final Offer, Completed, Cancelled
    agent_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'request_code': self.request_code,
            'user_id': self.user_id,
            'device_id': self.device_id,
            'estimated_price': round(self.estimated_price, 2),
            'final_price': round(self.final_price, 2) if self.final_price is not None else None,
            'pickup_address': self.pickup_address,
            'city': self.city,
            'state': self.state,
            'pincode': self.pincode,
            'pickup_date': self.pickup_date,
            'pickup_time': self.pickup_time,
            'status': self.status,
            'agent_id': self.agent_id,
            'agent_name': self.agent.full_name if self.agent else None,
            'user_name': self.user.full_name if self.user else None,
            'user_email': self.user.email if self.user else None,
            'user_phone': self.user.phone if self.user else None,
            'device': self.device.to_dict(include_relations=False) if self.device else None,
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
