from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from backend.models.user import User
from backend.models.device import Device
from backend.models.prediction import PricePrediction
from backend.models.sell_request import SellRequest
from backend.models.exchange import ExchangeRequest
from backend.models.repair import RepairRequest

users_bp = Blueprint('users', __name__, url_prefix='/api/users')

@users_bp.route('/dashboard', methods=['GET'])
@jwt_required()
def get_user_dashboard():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({'success': False, 'message': 'User not found'}), 404

    # Devices count
    devices = Device.query.filter_by(user_id=user_id).order_by(Device.created_at.desc()).all()
    device_ids = [d.id for d in devices]

    # Valuations count
    valuations_count = PricePrediction.query.filter(PricePrediction.device_id.in_(device_ids)).count() if device_ids else 0

    # Sell, exchange, repair requests
    sell_requests = SellRequest.query.filter_by(user_id=user_id).order_by(SellRequest.created_at.desc()).all()
    exchange_requests = ExchangeRequest.query.filter_by(user_id=user_id).order_by(ExchangeRequest.created_at.desc()).all()
    repair_requests = RepairRequest.query.filter_by(user_id=user_id).order_by(RepairRequest.created_at.desc()).all()

    active_sell = [s for s in sell_requests if s.status not in ['Completed', 'Cancelled']]
    active_exchange = [e for e in exchange_requests if e.status not in ['Completed', 'Cancelled']]
    active_repair = [r for r in repair_requests if r.status not in ['Completed', 'Cancelled']]
    active_requests_count = len(active_sell) + len(active_exchange) + len(active_repair)

    completed_sell = [s for s in sell_requests if s.status == 'Completed']
    completed_exchange = [e for e in exchange_requests if e.status == 'Completed']
    completed_repair = [r for r in repair_requests if r.status == 'Completed']
    completed_transactions_count = len(completed_sell) + len(completed_exchange) + len(completed_repair)

    # Combined recent activities
    recent_activities = []
    for s in sell_requests[:5]:
        recent_activities.append({
            'type': 'sell',
            'code': s.request_code,
            'title': f"Sell Request - {s.device.brand} {s.device.model}" if s.device else "Sell Request",
            'status': s.status,
            'amount': s.final_price or s.estimated_price,
            'created_at': s.created_at.isoformat(),
            'id': s.id
        })
    for e in exchange_requests[:5]:
        recent_activities.append({
            'type': 'exchange',
            'code': e.request_code,
            'title': f"Exchange for {e.target_device_name}",
            'status': e.status,
            'amount': e.additional_amount,
            'created_at': e.created_at.isoformat(),
            'id': e.id
        })
    for r in repair_requests[:5]:
        recent_activities.append({
            'type': 'repair',
            'code': r.request_code,
            'title': f"Repair - {r.repair_type} Service",
            'status': r.status,
            'amount': r.final_cost or r.estimated_cost,
            'created_at': r.created_at.isoformat(),
            'id': r.id
        })

    # Sort descending by date
    recent_activities.sort(key=lambda x: x['created_at'], reverse=True)

    return jsonify({
        'success': True,
        'data': {
            'stats': {
                'devices_added': len(devices),
                'valuations_performed': valuations_count,
                'active_requests': active_requests_count,
                'completed_transactions': completed_transactions_count
            },
            'recent_devices': [d.to_dict(include_relations=False) for d in devices[:4]],
            'recent_activities': recent_activities[:8]
        }
    }), 200
