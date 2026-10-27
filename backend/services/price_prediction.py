import json
from backend.extensions import db
from backend.models.prediction import PricePrediction
from backend.models.catalog import DeviceCatalog
from backend.ml.predict import predict_device_price

def calculate_and_save_prediction(device, commit=True):
    """
    Looks up catalog reference for baseline original pricing if available,
    runs the Scikit-learn ML prediction pipeline, creates a PricePrediction record,
    and returns the prediction dictionary.
    """
    # Try finding matching catalog item for accurate base price
    catalog_item = DeviceCatalog.query.filter_by(
        category=device.category,
        brand=device.brand,
        model=device.model
    ).first()

    original_price = catalog_item.base_price if catalog_item else None

    # Run ML prediction
    device_data = {
        'category': device.category,
        'brand': device.brand,
        'model': device.model,
        'purchase_year': device.purchase_year,
        'ram': device.ram,
        'storage': device.storage,
        'battery_health': device.battery_health,
        'screen_condition': device.screen_condition,
        'body_condition': device.body_condition,
        'overall_condition': device.overall_condition,
        'has_box': device.has_box,
        'has_charger': device.has_charger,
        'has_bill': device.has_bill,
        'has_warranty': device.has_warranty
    }

    result = predict_device_price(device_data, original_price=original_price)

    prediction_record = PricePrediction(
        device_id=device.id,
        predicted_price=result['predicted_price'],
        minimum_price=result['minimum_price'],
        maximum_price=result['maximum_price'],
        confidence_score=result['confidence_score'],
        condition_score=result['condition_score'],
        breakdown_json=json.dumps(result['breakdown']),
        model_version=result['model_version']
    )

    if commit:
        db.session.add(prediction_record)
        db.session.commit()
        result['id'] = prediction_record.id
        result['device_id'] = device.id
        result['created_at'] = prediction_record.created_at.isoformat()

    return result
