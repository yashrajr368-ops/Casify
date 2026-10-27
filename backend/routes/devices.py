import os
import uuid
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from backend.extensions import db
from backend.models.user import User
from backend.models.device import Device, DeviceImage
from backend.services.price_prediction import calculate_and_save_prediction
from backend.services.condition_analysis import analyze_device_image

devices_bp = Blueprint('devices', __name__, url_prefix='/api/devices')

def allowed_file(filename):
    allowed = current_app.config.get('ALLOWED_EXTENSIONS', {'png', 'jpg', 'jpeg', 'webp'})
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in allowed

@devices_bp.route('', methods=['POST'])
@jwt_required()
def create_device():
    user_id = int(get_jwt_identity())
    data = request.get_json() or {}

    category = data.get('category', '').strip()
    brand = data.get('brand', '').strip()
    model = data.get('model', '').strip()
    purchase_year = data.get('purchase_year')

    if not category or not brand or not model or not purchase_year:
        return jsonify({
            'success': False,
            'message': 'Category, brand, model, and purchase year are required',
            'error': 'VALIDATION_ERROR'
        }), 400

    try:
        purchase_year = int(purchase_year)
    except ValueError:
        return jsonify({'success': False, 'message': 'Invalid purchase year'}), 400

    if purchase_year > 2026:
        return jsonify({'success': False, 'message': 'Purchase year cannot be in the future'}), 400

    battery_health = data.get('battery_health')
    if battery_health is not None:
        try:
            battery_health = max(0, min(100, int(battery_health)))
        except ValueError:
            battery_health = 85

    device = Device(
        user_id=user_id,
        category=category,
        brand=brand,
        model=model,
        purchase_year=purchase_year,
        ram=data.get('ram'),
        storage=data.get('storage'),
        processor=data.get('processor'),
        battery_health=battery_health,
        screen_condition=data.get('screen_condition', 'Good'),
        body_condition=data.get('body_condition', 'Good'),
        camera_condition=data.get('camera_condition', 'Good'),
        speaker_condition=data.get('speaker_condition', 'Good'),
        charging_port_condition=data.get('charging_port_condition', 'Good'),
        overall_condition=data.get('overall_condition', 'Good'),
        has_box=bool(data.get('has_box')),
        has_charger=bool(data.get('has_charger')),
        has_bill=bool(data.get('has_bill')),
        has_warranty=bool(data.get('has_warranty'))
    )

    db.session.add(device)
    db.session.commit()

    # Automatically compute ML price prediction
    prediction_result = calculate_and_save_prediction(device, commit=True)

    return jsonify({
        'success': True,
        'message': 'Device registered and evaluated successfully',
        'data': {
            'device': device.to_dict(),
            'prediction': prediction_result
        }
    }), 201


@devices_bp.route('', methods=['GET'])
@jwt_required()
def list_devices():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)

    # Admin can view all devices or filter by user
    if user.role == 'ADMIN':
        requested_user = request.args.get('user_id')
        if requested_user:
            devices = Device.query.filter_by(user_id=int(requested_user)).order_by(Device.created_at.desc()).all()
        else:
            devices = Device.query.order_by(Device.created_at.desc()).all()
    else:
        devices = Device.query.filter_by(user_id=user_id).order_by(Device.created_at.desc()).all()

    return jsonify({
        'success': True,
        'message': 'Devices retrieved',
        'data': {
            'devices': [d.to_dict() for d in devices]
        }
    }), 200


@devices_bp.route('/<int:device_id>', methods=['GET'])
@jwt_required()
def get_device(device_id):
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    device = Device.query.get(device_id)

    if not device:
        return jsonify({'success': False, 'message': 'Device not found'}), 404

    if user.role != 'ADMIN' and device.user_id != user_id:
        return jsonify({'success': False, 'message': 'Unauthorized access to device'}), 403

    return jsonify({
        'success': True,
        'data': {
            'device': device.to_dict()
        }
    }), 200


@devices_bp.route('/<int:device_id>', methods=['PUT'])
@jwt_required()
def update_device(device_id):
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    device = Device.query.get(device_id)

    if not device:
        return jsonify({'success': False, 'message': 'Device not found'}), 404

    if user.role != 'ADMIN' and device.user_id != user_id:
        return jsonify({'success': False, 'message': 'Unauthorized access'}), 403

    data = request.get_json() or {}
    for field in ['purchase_year', 'ram', 'storage', 'processor', 'battery_health',
                  'screen_condition', 'body_condition', 'camera_condition',
                  'speaker_condition', 'charging_port_condition', 'overall_condition',
                  'has_box', 'has_charger', 'has_bill', 'has_warranty']:
        if field in data:
            setattr(device, field, data[field])

    db.session.commit()

    # Recalculate price prediction
    prediction_result = calculate_and_save_prediction(device, commit=True)

    return jsonify({
        'success': True,
        'message': 'Device updated and re-evaluated',
        'data': {
            'device': device.to_dict(),
            'prediction': prediction_result
        }
    }), 200


@devices_bp.route('/<int:device_id>', methods=['DELETE'])
@jwt_required()
def delete_device(device_id):
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    device = Device.query.get(device_id)

    if not device:
        return jsonify({'success': False, 'message': 'Device not found'}), 404

    if user.role != 'ADMIN' and device.user_id != user_id:
        return jsonify({'success': False, 'message': 'Unauthorized access'}), 403

    db.session.delete(device)
    db.session.commit()

    return jsonify({
        'success': True,
        'message': 'Device removed successfully'
    }), 200


@devices_bp.route('/<int:device_id>/images', methods=['POST'])
@jwt_required()
def upload_device_image(device_id):
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    device = Device.query.get(device_id)

    if not device:
        return jsonify({'success': False, 'message': 'Device not found'}), 404

    if user.role != 'ADMIN' and device.user_id != user_id:
        return jsonify({'success': False, 'message': 'Unauthorized'}), 403

    if 'image' not in request.files:
        return jsonify({'success': False, 'message': 'No image file uploaded'}), 400

    file = request.files['image']
    if file.filename == '':
        return jsonify({'success': False, 'message': 'Empty filename'}), 400

    if not allowed_file(file.filename):
        return jsonify({'success': False, 'message': 'Allowed image formats: png, jpg, jpeg, webp'}), 400

    image_type = request.form.get('image_type', 'front')
    upload_dir = current_app.config['UPLOAD_FOLDER']
    os.makedirs(upload_dir, exist_ok=True)

    extension = file.filename.rsplit('.', 1)[1].lower()
    unique_filename = f"{uuid.uuid4().hex}_{secure_filename(file.filename)}"
    save_path = os.path.join(upload_dir, unique_filename)
    file.save(save_path)

    # Perform CV prototype condition analysis
    cv_analysis = analyze_device_image(save_path)

    device_img = DeviceImage(
        device_id=device.id,
        image_path=f"/uploads/{unique_filename}",
        image_type=image_type
    )
    db.session.add(device_img)
    db.session.commit()

    return jsonify({
        'success': True,
        'message': 'Image uploaded and inspected successfully',
        'data': {
            'image': device_img.to_dict(),
            'cv_analysis': cv_analysis
        }
    }), 201
