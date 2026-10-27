from datetime import datetime
from backend.extensions import db

class Pickup(db.Model):
    __tablename__ = 'pickups'

    id = db.Column(db.Integer, primary_key=True)
    request_type = db.Column(db.String(30), nullable=False)  # sell, exchange, repair
    request_id = db.Column(db.Integer, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    agent_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    address = db.Column(db.String(255), nullable=False)
    pickup_date = db.Column(db.String(30), nullable=False)
    pickup_time = db.Column(db.String(30), nullable=False)
    status = db.Column(db.String(50), default='Scheduled', nullable=False)  # Scheduled, Out for Pickup, Completed, Cancelled
    notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    user = db.relationship('User', foreign_keys=[user_id], backref='pickups', lazy=True)
    agent = db.relationship('User', foreign_keys=[agent_id], backref='assigned_pickups', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'request_type': self.request_type,
            'request_id': self.request_id,
            'user_id': self.user_id,
            'user_name': self.user.full_name if self.user else None,
            'user_phone': self.user.phone if self.user else None,
            'agent_id': self.agent_id,
            'agent_name': self.agent.full_name if self.agent else None,
            'address': self.address,
            'pickup_date': self.pickup_date,
            'pickup_time': self.pickup_time,
            'status': self.status,
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
