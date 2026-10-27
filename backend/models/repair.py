from datetime import datetime
from backend.extensions import db

class RepairRequest(db.Model):
    __tablename__ = 'repair_requests'

    id = db.Column(db.Integer, primary_key=True)
    request_code = db.Column(db.String(30), unique=True, nullable=False, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    device_id = db.Column(db.Integer, db.ForeignKey('devices.id'), nullable=True)
    device_name = db.Column(db.String(150), nullable=True)  # optional if not in devices
    repair_type = db.Column(db.String(100), nullable=False)  # Screen, Battery, Charging Port, Camera, Speaker, Software, Other
    problem_description = db.Column(db.Text, nullable=False)
    estimated_cost = db.Column(db.Float, nullable=False)
    final_cost = db.Column(db.Float, nullable=True)
    pickup_address = db.Column(db.String(255), nullable=True)
    pickup_date = db.Column(db.String(30), nullable=True)
    pickup_time = db.Column(db.String(30), nullable=True)
    status = db.Column(db.String(50), default='Requested', nullable=False)
    # Requested, Confirmed, Agent Assigned, Device Collected, Under Repair, Ready, Completed, Cancelled
    agent_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    user = db.relationship('User', foreign_keys=[user_id], backref='repair_requests', lazy=True)
    agent = db.relationship('User', foreign_keys=[agent_id], backref='assigned_repair_requests', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'request_code': self.request_code,
            'user_id': self.user_id,
            'user_name': self.user.full_name if self.user else None,
            'user_email': self.user.email if self.user else None,
            'user_phone': self.user.phone if self.user else None,
            'device_id': self.device_id,
            'device_name': self.device_name or (self.device.model if self.device else "Generic Device"),
            'repair_type': self.repair_type,
            'problem_description': self.problem_description,
            'estimated_cost': round(self.estimated_cost, 2),
            'final_cost': round(self.final_cost, 2) if self.final_cost is not None else None,
            'pickup_address': self.pickup_address,
            'pickup_date': self.pickup_date,
            'pickup_time': self.pickup_time,
            'status': self.status,
            'agent_id': self.agent_id,
            'agent_name': self.agent.full_name if self.agent else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
