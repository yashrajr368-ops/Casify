from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from backend.extensions import db
from backend.models.user import User
from backend.models.sell_request import SellRequest
from backend.models.exchange import ExchangeRequest
from backend.models.repair import RepairRequest
from backend.models.pickup import Pickup
from backend.utils.auth_decorators import agent_required
from backend.services.notification_service import create_notification

agent_bp = Blueprint('agent', __name__, url_prefix='/api/agent')

@agent_bp.route('/tasks', methods=['GET'])
@agent_required()
def get_agent_tasks():
    user_id = int(get_jwt_identity())

    assigned_sells = SellRequest.query.filter_by(agent_id=user_id).order_by(SellRequest.created_at.desc()).all()
    assigned_exchanges = ExchangeRequest.query.filter_by(agent_id=user_id).order_by(ExchangeRequest.created_at.desc()).all()
    assigned_repairs = RepairRequest.query.filter_by(agent_id=user_id).order_by(RepairRequest.created_at.desc()).all()
    assigned_pickups = Pickup.query.filter_by(agent_id=user_id).order_by(Pickup.created_at.desc()).all()

    # Metrics
    pending_inspections = [s for s in assigned_sells if s.status in ['Agent Assigned', 'Pickup Scheduled', 'Picked Up', 'Inspection']]
    completed_tasks = [s for s in assigned_sells if s.status == 'Completed'] + [r for r in assigned_repairs if r.status == 'Completed']

    return jsonify({
        'success': True,
        'data': {
            'metrics': {
                'total_assigned': len(assigned_sells) + len(assigned_exchanges) + len(assigned_repairs),
                'pending_inspections': len(pending_inspections),
                'assigned_repairs': len(assigned_repairs),
                'completed_tasks': len(completed_tasks)
            },
            'sell_requests': [s.to_dict() for s in assigned_sells],
            'exchange_requests': [e.to_dict() for e in assigned_exchanges],
            'repair_requests': [r.to_dict() for r in assigned_repairs],
            'pickups': [p.to_dict() for p in assigned_pickups]
        }
    }), 200


@agent_bp.route('/inspection/<int:sell_id>', methods=['POST'])
@agent_required()
def submit_inspection(sell_id):
    user_id = int(get_jwt_identity())
    sell_req = SellRequest.query.get(sell_id)

    if not sell_req:
        return jsonify({'success': False, 'message': 'Sell request not found'}), 404

    data = request.get_json() or {}
    final_price = data.get('final_price')
    inspection_notes = data.get('notes', '')
    verified_condition = data.get('verified_condition', 'Good')
    status = data.get('status', 'Final Offer')

    if final_price is None:
        return jsonify({'success': False, 'message': 'Final price is required'}), 400

    sell_req.final_price = float(final_price)
    sell_req.notes = f"Inspection Verified ({verified_condition}): {inspection_notes}"
    sell_req.status = status

    db.session.commit()

    # Notify customer
    create_notification(
        user_id=sell_req.user_id,
        title="Physical Inspection Completed",
        message=f"Agent completed physical verification for {sell_req.request_code}. Final verified offer: Rs {sell_req.final_price:,.2f}.",
        notif_type="success"
    )

    return jsonify({
        'success': True,
        'message': 'Inspection report recorded successfully',
        'data': {
            'sell_request': sell_req.to_dict()
        }
    }), 200
