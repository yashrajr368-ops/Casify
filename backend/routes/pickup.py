from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from backend.extensions import db
from backend.models.user import User
from backend.models.pickup import Pickup

pickup_bp = Blueprint('pickup', __name__, url_prefix='/api/pickup')

@pickup_bp.route('', methods=['POST'])
@jwt_required()
def schedule_pickup():
    user_id = int(get_jwt_identity())
    data = request.get_json() or {}

    request_type = data.get('request_type', 'sell')
    request_id = data.get('request_id')
    address = data.get('address', '').strip()
    pickup_date = data.get('pickup_date', '').strip()
    pickup_time = data.get('pickup_time', '').strip()

    if not request_id or not address or not pickup_date:
        return jsonify({
            'success': False,
            'message': 'Request ID, address, and date are required',
            'error': 'VALIDATION_ERROR'
        }), 400

    pickup = Pickup(
        request_type=request_type,
        request_id=int(request_id),
        user_id=user_id,
        address=address,
        pickup_date=pickup_date,
        pickup_time=pickup_time or '10:00 AM - 01:00 PM',
        status='Scheduled',
        notes=data.get('notes')
    )

    db.session.add(pickup)
    db.session.commit()

    return jsonify({
        'success': True,
        'message': 'Pickup scheduled successfully',
        'data': {
            'pickup': pickup.to_dict()
        }
    }), 201


@pickup_bp.route('', methods=['GET'])
@jwt_required()
def list_pickups():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)

    if user.role == 'ADMIN':
        pickups = Pickup.query.order_by(Pickup.created_at.desc()).all()
    elif user.role == 'AGENT':
        pickups = Pickup.query.filter_by(agent_id=user_id).order_by(Pickup.created_at.desc()).all()
    else:
        pickups = Pickup.query.filter_by(user_id=user_id).order_by(Pickup.created_at.desc()).all()

    return jsonify({
        'success': True,
        'data': {
            'pickups': [p.to_dict() for p in pickups]
        }
    }), 200


@pickup_bp.route('/<int:pickup_id>/status', methods=['PUT'])
@jwt_required()
def update_pickup_status(pickup_id):
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)

    if user.role not in ['ADMIN', 'AGENT']:
        return jsonify({'success': False, 'message': 'Unauthorized'}), 403

    pickup = Pickup.query.get(pickup_id)
    if not pickup:
        return jsonify({'success': False, 'message': 'Pickup not found'}), 404

    data = request.get_json() or {}
    new_status = data.get('status')
    notes = data.get('notes')

    if new_status:
        pickup.status = new_status
    if notes:
        pickup.notes = notes

    db.session.commit()

    return jsonify({
        'success': True,
        'message': 'Pickup status updated',
        'data': {
            'pickup': pickup.to_dict()
        }
    }), 200
