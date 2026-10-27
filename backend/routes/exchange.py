import random
from datetime import datetime
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from backend.extensions import db
from backend.models.user import User
from backend.models.device import Device
from backend.models.exchange import ExchangeRequest
from backend.models.pickup import Pickup
from backend.services.notification_service import create_notification

exchange_bp = Blueprint('exchange', __name__, url_prefix='/api/exchange')

def generate_exchange_code():
    timestamp = datetime.utcnow().strftime('%Y%m')
    rand_hex = f"{random.randint(1000, 9999)}"
    return f"EXCH-{timestamp}-{rand_hex}"

@exchange_bp.route('', methods=['POST'])
@jwt_required()
def create_exchange():
    user_id = int(get_jwt_identity())
    data = request.get_json() or {}

    old_device_id = data.get('old_device_id')
    target_device_name = data.get('target_device_name', '').strip()
    target_device_price = data.get('target_device_price')
    pickup_address = data.get('pickup_address', '').strip()
    pickup_date = data.get('pickup_date', '').strip()
    pickup_time = data.get('pickup_time', '').strip()

    if not old_device_id or not target_device_name or not target_device_price:
        return jsonify({
            'success': False,
            'message': 'Old device, target device, and target price are required',
            'error': 'VALIDATION_ERROR'
        }), 400

    old_device = Device.query.get(int(old_device_id))
    if not old_device or old_device.user_id != user_id:
        return jsonify({'success': False, 'message': 'Device not found or unauthorized'}), 404

    # Determine old device value
    old_device_value = data.get('old_device_value')
    if not old_device_value:
        if old_device.predictions:
            old_device_value = old_device.predictions[-1].predicted_price
        else:
            old_device_value = 12000.0

    target_device_price = float(target_device_price)
    old_device_value = float(old_device_value)
    additional_amount = max(0.0, target_device_price - old_device_value)

    request_code = generate_exchange_code()
    exchange_req = ExchangeRequest(
        request_code=request_code,
        user_id=user_id,
        old_device_id=old_device.id,
        new_device_id=data.get('new_device_id'),
        target_device_name=target_device_name,
        target_device_price=target_device_price,
        old_device_value=old_device_value,
        additional_amount=additional_amount,
        pickup_address=pickup_address,
        pickup_date=pickup_date,
        pickup_time=pickup_time,
        status='Requested'
    )
    db.session.add(exchange_req)
    db.session.flush()

    if pickup_address and pickup_date:
        pickup = Pickup(
            request_type='exchange',
            request_id=exchange_req.id,
            user_id=user_id,
            address=pickup_address,
            pickup_date=pickup_date,
            pickup_time=pickup_time or '10:00 AM - 01:00 PM',
            status='Scheduled'
        )
        db.session.add(pickup)

    db.session.commit()

    create_notification(
        user_id=user_id,
        title="Exchange Request Initiated",
        message=f"Your exchange request {request_code} to upgrade to {target_device_name} has been placed.",
        notif_type="success"
    )

    return jsonify({
        'success': True,
        'message': 'Exchange request placed successfully',
        'data': {
            'exchange_request': exchange_req.to_dict()
        }
    }), 201


@exchange_bp.route('', methods=['GET'])
@jwt_required()
def list_exchanges():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)

    if user.role == 'ADMIN':
        requests = ExchangeRequest.query.order_by(ExchangeRequest.created_at.desc()).all()
    elif user.role == 'AGENT':
        requests = ExchangeRequest.query.filter_by(agent_id=user_id).order_by(ExchangeRequest.created_at.desc()).all()
    else:
        requests = ExchangeRequest.query.filter_by(user_id=user_id).order_by(ExchangeRequest.created_at.desc()).all()

    return jsonify({
        'success': True,
        'data': {
            'requests': [r.to_dict() for r in requests]
        }
    }), 200


@exchange_bp.route('/<int:request_id>', methods=['GET'])
@jwt_required()
def get_exchange(request_id):
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    exchange_req = ExchangeRequest.query.get(request_id)

    if not exchange_req:
        return jsonify({'success': False, 'message': 'Exchange request not found'}), 404

    if user.role == 'CUSTOMER' and exchange_req.user_id != user_id:
        return jsonify({'success': False, 'message': 'Unauthorized'}), 403

    return jsonify({
        'success': True,
        'data': {
            'exchange_request': exchange_req.to_dict()
        }
    }), 200


@exchange_bp.route('/<int:request_id>/status', methods=['PUT'])
@jwt_required()
def update_exchange_status(request_id):
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)

    if user.role not in ['ADMIN', 'AGENT']:
        return jsonify({'success': False, 'message': 'Unauthorized'}), 403

    exchange_req = ExchangeRequest.query.get(request_id)
    if not exchange_req:
        return jsonify({'success': False, 'message': 'Exchange request not found'}), 404

    data = request.get_json() or {}
    new_status = data.get('status')
    if new_status:
        exchange_req.status = new_status
        db.session.commit()

        create_notification(
            user_id=exchange_req.user_id,
            title=f"Exchange Request Status Updated",
            message=f"Your exchange request {exchange_req.request_code} is now '{new_status}'.",
            notif_type="info"
        )

    return jsonify({
        'success': True,
        'message': 'Exchange status updated',
        'data': {
            'exchange_request': exchange_req.to_dict()
        }
    }), 200
