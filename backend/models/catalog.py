from backend.extensions import db

class DeviceCatalog(db.Model):
    __tablename__ = 'device_catalog'

    id = db.Column(db.Integer, primary_key=True)
    category = db.Column(db.String(50), nullable=False)  # Smartphone, Laptop, Tablet, Smartwatch
    brand = db.Column(db.String(100), nullable=False)
    model = db.Column(db.String(100), nullable=False)
    base_price = db.Column(db.Float, nullable=False)
    release_year = db.Column(db.Integer, nullable=False)
    ram_options = db.Column(db.String(100), nullable=True)  # comma-separated e.g. "4,6,8,12"
    storage_options = db.Column(db.String(100), nullable=True)  # comma-separated e.g. "64,128,256"
    processor = db.Column(db.String(100), nullable=True)
    image_url = db.Column(db.String(255), nullable=True)
    is_active = db.Column(db.Boolean, default=True)

    def to_dict(self):
        return {
            'id': self.id,
            'category': self.category,
            'brand': self.brand,
            'model': self.model,
            'base_price': self.base_price,
            'release_year': self.release_year,
            'ram_options': [int(x.strip()) for x in self.ram_options.split(',') if x.strip()] if self.ram_options else [],
            'storage_options': [int(x.strip()) for x in self.storage_options.split(',') if x.strip()] if self.storage_options else [],
            'processor': self.processor,
            'image_url': self.image_url,
            'is_active': self.is_active
        }
