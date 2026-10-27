import random
from datetime import datetime
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from backend.extensions import db
from backend.models.user import User
from backend.models.device import Device
from backend.models.repair import RepairRequest
from backend.models.pickup import Pickup
from backend.services.notification_service import create_notification

repair_bp = Blueprint('repair', __name__, url_prefix='/api/repair')

DEFAULT_REPAIR_ESTIMATES = {
    'Screen': 3500.0,
    'Battery': 1800.0,
    'Charging Port': 950.0,
    'Camera': 2400.0,
    'Speaker': 1200.0,
    'Software': 750.0,
    'Other': 1500.0
}

def generate_repair_code():
    timestamp = datetime.utcnow().strftime('%Y%m')
    rand_hex = f"{random.randint(1000, 9999)}"
    return f"REP-{timestamp}-{rand_hex}"

@repair_bp.route('/estimate', methods=['GET'])
def get_repair_estimate():
    repair_type = request.args.get('repair_type', 'Screen')
    category = request.args.get('category', 'Smartphone')
    base_cost = DEFAULT_REPAIR_ESTIMATES.get(repair_type, 1500.0)

    if category == 'Laptop':
        base_cost *= 1.6
    elif category == 'Tablet':
        base_cost *= 1.3
    elif category == 'Smartwatch':
        base_cost *= 0.9

    return jsonify({
        'success': True,
        'data': {
            'repair_type': repair_type,
            'category': category,
            'estimated_cost': round(base_cost, 2),
            'warranty_period': '6 Months Free Warranty on Repairs'
        }
    }), 200

@repair_bp.route('', methods=['POST'])
@jwt_required()
def create_repair():
    user_id = int(get_jwt_identity())
    data = request.get_json() or {}

    repair_type = data.get('repair_type', '').strip()
    problem_description = data.get('problem_description', '').strip()
    pickup_address = data.get('pickup_address', '').strip()
    pickup_date = data.get('pickup_date', '').strip()
    pickup_time = data.get('pickup_time', '').strip()
    device_id = data.get('device_id')
    device_name = data.get('device_name', 'Smart Device')

    if not repair_type or not problem_description:
        return jsonify({
            'success': False,
            'message': 'Repair type and problem description are required',
            'error': 'VALIDATION_ERROR'
        }), 400

    estimated_cost = data.get('estimated_cost')
    if not estimated_cost:
        estimated_cost = DEFAULT_REPAIR_ESTIMATES.get(repair_type, 1500.0)

    request_code = generate_repair_code()
    repair_req = RepairRequest(
        request_code=request_code,
        user_id=user_id,
        device_id=device_id,
        device_name=device_name,
        repair_type=repair_type,
        problem_description=problem_description,
        estimated_cost=float(estimated_cost),
        pickup_address=pickup_address,
        pickup_date=pickup_date,
        pickup_time=pickup_time,
        status='Requested'
    )
    db.session.add(repair_req)
    db.session.flush()

    if pickup_address and pickup_date:
        pickup = Pickup(
            request_type='repair',
            request_id=repair_req.id,
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
        title="Repair Service Booked",
        message=f"Your repair request {request_code} for {repair_type} service has been registered.",
        notif_type="success"
    )

    return jsonify({
        'success': True,
        'message': 'Repair service booked successfully',
        'data': {
            'repair_request': repair_req.to_dict()
        }
    }), 201


@repair_bp.route('', methods=['GET'])
@jwt_required()
def list_repairs():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)

    if user.role == 'ADMIN':
        requests = RepairRequest.query.order_by(RepairRequest.created_at.desc()).all()
    elif user.role == 'AGENT':
        requests = RepairRequest.query.filter_by(agent_id=user_id).order_by(RepairRequest.created_at.desc()).all()
    else:
        requests = RepairRequest.query.filter_by(user_id=user_id).order_by(RepairRequest.created_at.desc()).all()

    return jsonify({
        'success': True,
        'data': {
            'requests': [r.to_dict() for r in requests]
        }
    }), 200


@repair_bp.route('/<int:request_id>', methods=['GET'])
@jwt_required()
def get_repair(request_id):
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    repair_req = RepairRequest.query.get(request_id)

    if not repair_req:
        return jsonify({'success': False, 'message': 'Repair request not found'}), 404

    if user.role == 'CUSTOMER' and repair_req.user_id != user_id:
        return jsonify({'success': False, 'message': 'Unauthorized'}), 403

    return jsonify({
        'success': True,
        'data': {
            'repair_request': repair_req.to_dict()
        }
    }), 200


@repair_bp.route('/<int:request_id>/status', methods=['PUT'])
@jwt_required()
def update_repair_status(request_id):
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)

    if user.role not in ['ADMIN', 'AGENT']:
        return jsonify({'success': False, 'message': 'Unauthorized'}), 403

    repair_req = RepairRequest.query.get(request_id)
    if not repair_req:
        return jsonify({'success': False, 'message': 'Repair request not found'}), 404

    data = request.get_json() or {}
    new_status = data.get('status')
    final_cost = data.get('final_cost')

    if new_status:
        repair_req.status = new_status
    if final_cost is not None:
        repair_req.final_cost = float(final_cost)

    db.session.commit()

    create_notification(
        user_id=repair_req.user_id,
        title=f"Repair Request Status Updated",
        message=f"Your repair request {repair_req.request_code} is now '{new_status}'.",
        notif_type="info"
    )

    return jsonify({
        'success': True,
        'message': 'Repair request updated',
        'data': {
            'repair_request': repair_req.to_dict()
        }
    }), 200
