import random
from datetime import datetime
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from backend.extensions import db
from backend.models.user import User
from backend.models.device import Device
from backend.models.sell_request import SellRequest
from backend.models.pickup import Pickup
from backend.services.notification_service import create_notification

sell_bp = Blueprint('selling', __name__, url_prefix='/api/sell')

def generate_request_code():
    timestamp = datetime.utcnow().strftime('%Y%m')
    rand_hex = f"{random.randint(1000, 9999)}"
    return f"SELL-{timestamp}-{rand_hex}"

@sell_bp.route('', methods=['POST'])
@jwt_required()
def create_sell_request():
    user_id = int(get_jwt_identity())
    data = request.get_json() or {}

    device_id = data.get('device_id')
    pickup_address = data.get('pickup_address', '').strip()
    city = data.get('city', '').strip()
    state = data.get('state', '').strip()
    pincode = data.get('pincode', '').strip()
    pickup_date = data.get('pickup_date', '').strip()
    pickup_time = data.get('pickup_time', '').strip()

    if not device_id or not pickup_address or not city or not pincode or not pickup_date:
        return jsonify({
            'success': False,
            'message': 'Device ID, pickup address, city, pincode, and pickup date are required',
            'error': 'VALIDATION_ERROR'
        }), 400

    device = Device.query.get(int(device_id))
    if not device or device.user_id != user_id:
        return jsonify({'success': False, 'message': 'Device not found or unauthorized'}), 404

    # Determine estimated price
    estimated_price = data.get('estimated_price')
    if not estimated_price:
        if device.predictions:
            estimated_price = device.predictions[-1].predicted_price
        else:
            estimated_price = 15000.0

    request_code = generate_request_code()

    sell_req = SellRequest(
        request_code=request_code,
        user_id=user_id,
        device_id=device.id,
        estimated_price=float(estimated_price),
        pickup_address=pickup_address,
        city=city,
        state=state,
        pincode=pincode,
        pickup_date=pickup_date,
        pickup_time=pickup_time,
        status='Requested',
        notes=data.get('notes', '')
    )

    db.session.add(sell_req)
    db.session.flush()

    # Create linked pickup record
    pickup = Pickup(
        request_type='sell',
        request_id=sell_req.id,
        user_id=user_id,
        address=f"{pickup_address}, {city}, {state} - {pincode}",
        pickup_date=pickup_date,
        pickup_time=pickup_time,
        status='Scheduled'
    )
    db.session.add(pickup)
    db.session.commit()

    # User notification
    create_notification(
        user_id=user_id,
        title="Sell Request Created",
        message=f"Your sell request {request_code} for {device.brand} {device.model} has been received. Our team will assign a verification agent soon.",
        notif_type="info"
    )

    return jsonify({
        'success': True,
        'message': 'Sell request submitted successfully',
        'data': {
            'sell_request': sell_req.to_dict()
        }
    }), 201


@sell_bp.route('', methods=['GET'])
@jwt_required()
def list_sell_requests():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)

    if user.role == 'ADMIN':
        requests = SellRequest.query.order_by(SellRequest.created_at.desc()).all()
    elif user.role == 'AGENT':
        requests = SellRequest.query.filter_by(agent_id=user_id).order_by(SellRequest.created_at.desc()).all()
    else:
        requests = SellRequest.query.filter_by(user_id=user_id).order_by(SellRequest.created_at.desc()).all()

    return jsonify({
        'success': True,
        'data': {
            'requests': [r.to_dict() for r in requests]
        }
    }), 200


@sell_bp.route('/<int:request_id>', methods=['GET'])
@jwt_required()
def get_sell_request(request_id):
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    sell_req = SellRequest.query.get(request_id)

    if not sell_req:
        return jsonify({'success': False, 'message': 'Sell request not found'}), 404

    if user.role == 'CUSTOMER' and sell_req.user_id != user_id:
        return jsonify({'success': False, 'message': 'Unauthorized'}), 403

    return jsonify({
        'success': True,
        'data': {
            'sell_request': sell_req.to_dict()
        }
    }), 200


@sell_bp.route('/<int:request_id>/status', methods=['PUT'])
@jwt_required()
def update_sell_status(request_id):
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)

    if user.role not in ['ADMIN', 'AGENT']:
        return jsonify({'success': False, 'message': 'Agent or Admin authorization required'}), 403

    sell_req = SellRequest.query.get(request_id)
    if not sell_req:
        return jsonify({'success': False, 'message': 'Sell request not found'}), 404

    data = request.get_json() or {}
    new_status = data.get('status')
    final_price = data.get('final_price')
    notes = data.get('notes')

    if new_status:
        sell_req.status = new_status
    if final_price is not None:
        sell_req.final_price = float(final_price)
    if notes:
        sell_req.notes = notes

    db.session.commit()

    # Notify customer of progress
    create_notification(
        user_id=sell_req.user_id,
        title=f"Update on {sell_req.request_code}",
        message=f"Your sell request status is now '{sell_req.status}'.",
        notif_type="info"
    )

    return jsonify({
        'success': True,
        'message': 'Sell request updated',
        'data': {
            'sell_request': sell_req.to_dict()
        }
    }), 200
