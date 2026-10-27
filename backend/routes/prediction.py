from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, verify_jwt_in_request
from backend.models.prediction import PricePrediction
from backend.models.device import Device
from backend.models.catalog import DeviceCatalog
from backend.ml.predict import predict_device_price

prediction_bp = Blueprint('prediction', __name__, url_prefix='/api')

@prediction_bp.route('/predict', methods=['POST'])
def run_prediction():
    """
    Publicly accessible or authenticated valuation calculator.
    Allows instant quotation during wizard step-through.
    """
    data = request.get_json() or {}
    category = data.get('category', 'Smartphone')
    brand = data.get('brand', 'Apple')
    model = data.get('model', 'iPhone 13')

    # Look up catalog for accurate baseline
    catalog_item = DeviceCatalog.query.filter_by(
        category=category,
        brand=brand,
        model=model
    ).first()

    original_price = catalog_item.base_price if catalog_item else data.get('original_price')

    prediction_result = predict_device_price(data, original_price=original_price)

    # Optional: If user is authenticated and device_id is provided, link prediction
    try:
        verify_jwt_in_request(optional=True)
        user_id = get_jwt_identity()
        device_id = data.get('device_id')
        if user_id and device_id:
            from backend.extensions import db
            device = Device.query.get(int(device_id))
            if device and device.user_id == int(user_id):
                record = PricePrediction(
                    device_id=device.id,
                    predicted_price=prediction_result['predicted_price'],
                    minimum_price=prediction_result['minimum_price'],
                    maximum_price=prediction_result['maximum_price'],
                    confidence_score=prediction_result['confidence_score'],
                    condition_score=prediction_result['condition_score'],
                    breakdown_json=jsonify(prediction_result['breakdown']).get_data(as_text=True),
                    model_version='1.0'
                )
                db.session.add(record)
                db.session.commit()
                prediction_result['id'] = record.id
    except Exception:
        pass

    return jsonify({
        'success': True,
        'message': 'Prediction evaluated successfully',
        'data': prediction_result
    }), 200


@prediction_bp.route('/predictions', methods=['GET'])
@jwt_required()
def list_predictions():
    user_id = int(get_jwt_identity())
    user_device_ids = [d.id for d in Device.query.filter_by(user_id=user_id).all()]
    predictions = PricePrediction.query.filter(PricePrediction.device_id.in_(user_device_ids)).order_by(PricePrediction.created_at.desc()).all()

    return jsonify({
        'success': True,
        'data': {
            'predictions': [p.to_dict() for p in predictions]
        }
    }), 200


@prediction_bp.route('/predictions/<int:prediction_id>', methods=['GET'])
@jwt_required()
def get_prediction(prediction_id):
    prediction = PricePrediction.query.get(prediction_id)
    if not prediction:
        return jsonify({'success': False, 'message': 'Prediction not found'}), 404

    return jsonify({
        'success': True,
        'data': {
            'prediction': prediction.to_dict()
        }
    }), 200
