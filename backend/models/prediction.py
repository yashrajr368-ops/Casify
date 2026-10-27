import json
from datetime import datetime
from backend.extensions import db

class PricePrediction(db.Model):
    __tablename__ = 'price_predictions'

    id = db.Column(db.Integer, primary_key=True)
    device_id = db.Column(db.Integer, db.ForeignKey('devices.id'), nullable=False)
    predicted_price = db.Column(db.Float, nullable=False)
    minimum_price = db.Column(db.Float, nullable=False)
    maximum_price = db.Column(db.Float, nullable=False)
    confidence_score = db.Column(db.Float, nullable=False)  # 0 to 100 percentage
    condition_score = db.Column(db.Float, nullable=False)   # 0 to 10 scale
    breakdown_json = db.Column(db.Text, nullable=True)     # detailed itemized valuation
    model_version = db.Column(db.String(20), default='1.0')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        breakdown = {}
        if self.breakdown_json:
            try:
                breakdown = json.loads(self.breakdown_json)
            except Exception:
                breakdown = {}
        return {
            'id': self.id,
            'device_id': self.device_id,
            'predicted_price': round(self.predicted_price, 2),
            'minimum_price': round(self.minimum_price, 2),
            'maximum_price': round(self.maximum_price, 2),
            'confidence_score': round(self.confidence_score, 1),
            'condition_score': round(self.condition_score, 1),
            'breakdown': breakdown,
            'model_version': self.model_version,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
