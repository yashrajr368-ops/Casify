from datetime import datetime
from flask import Blueprint, request, jsonify
from sqlalchemy import func
from backend.extensions import db
from backend.models.user import User
from backend.models.device import Device
from backend.models.prediction import PricePrediction
from backend.models.sell_request import SellRequest
from backend.models.exchange import ExchangeRequest
from backend.models.repair import RepairRequest
from backend.models.catalog import DeviceCatalog
from backend.utils.auth_decorators import admin_required
from backend.services.notification_service import create_notification

admin_bp = Blueprint('admin', __name__, url_prefix='/api/admin')

@admin_bp.route('/dashboard', methods=['GET'])
@admin_required()
def get_dashboard_stats():
    total_users = User.query.filter_by(role='CUSTOMER').count()
    total_agents = User.query.filter_by(role='AGENT').count()
    total_devices = Device.query.count()
    total_valuations = PricePrediction.query.count()
    total_sell_requests = SellRequest.query.count()
    total_exchange_requests = ExchangeRequest.query.count()
    total_repair_requests = RepairRequest.query.count()

    pending_sell = SellRequest.query.filter(SellRequest.status.notin_(['Completed', 'Cancelled'])).count()
    pending_exchange = ExchangeRequest.query.filter(ExchangeRequest.status.notin_(['Completed', 'Cancelled'])).count()
    pending_repair = RepairRequest.query.filter(RepairRequest.status.notin_(['Completed', 'Cancelled'])).count()
    pending_requests = pending_sell + pending_exchange + pending_repair

    # Revenue / volume estimate
    sell_volume = db.session.query(func.sum(SellRequest.estimated_price)).scalar() or 0.0
    repair_volume = db.session.query(func.sum(RepairRequest.estimated_cost)).scalar() or 0.0
    exchange_volume = db.session.query(func.sum(ExchangeRequest.additional_amount)).scalar() or 0.0
    total_volume = round(sell_volume + repair_volume + exchange_volume, 2)

    # Categories distribution
    cat_counts = db.session.query(Device.category, func.count(Device.id)).group_by(Device.category).all()
    categories_data = [{'category': c[0], 'count': c[1]} for c in cat_counts]

    # Brands distribution
    brand_counts = db.session.query(Device.brand, func.count(Device.id)).group_by(Device.brand).order_by(func.count(Device.id).desc()).limit(6).all()
    brands_data = [{'brand': b[0], 'count': b[1]} for b in brand_counts]

    # Repair types distribution
    repair_counts = db.session.query(RepairRequest.repair_type, func.count(RepairRequest.id)).group_by(RepairRequest.repair_type).all()
    repairs_data = [{'type': r[0], 'count': r[1]} for r in repair_counts]

    # Monthly simulated/aggregated transaction activity
    monthly_activity = [
        {'month': 'Jan', 'sell': 12, 'exchange': 4, 'repair': 7},
        {'month': 'Feb', 'sell': 18, 'exchange': 6, 'repair': 10},
        {'month': 'Mar', 'sell': 25, 'exchange': 9, 'repair': 14},
        {'month': 'Apr', 'sell': 22, 'exchange': 8, 'repair': 12},
        {'month': 'May', 'sell': 30, 'exchange': 12, 'repair': 18},
        {'month': 'Jun', 'sell': max(35, total_sell_requests), 'exchange': max(15, total_exchange_requests), 'repair': max(20, total_repair_requests)}
    ]

    return jsonify({
        'success': True,
        'data': {
            'overview': {
                'total_users': total_users,
                'total_agents': total_agents,
                'total_devices': total_devices,
                'total_valuations': total_valuations,
                'total_sell_requests': total_sell_requests,
                'total_exchange_requests': total_exchange_requests,
                'total_repair_requests': total_repair_requests,
                'pending_requests': pending_requests,
                'total_volume': total_volume
            },
            'charts': {
                'categories': categories_data,
                'top_brands': brands_data,
                'repair_types': repairs_data,
                'monthly_activity': monthly_activity
            }
        }
    }), 200


@admin_bp.route('/users', methods=['GET'])
@admin_required()
def list_users():
    role_filter = request.args.get('role')
    query = User.query
    if role_filter:
        query = query.filter_by(role=role_filter.upper())
    users = query.order_by(User.created_at.desc()).all()

    return jsonify({
        'success': True,
        'data': {
            'users': [u.to_dict() for u in users]
        }
    }), 200


@admin_bp.route('/users/<int:user_id>/role', methods=['PUT'])
@admin_required()
def update_user_role(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'success': False, 'message': 'User not found'}), 404

    data = request.get_json() or {}
    new_role = data.get('role', '').upper()
    if new_role not in ['CUSTOMER', 'AGENT', 'ADMIN']:
        return jsonify({'success': False, 'message': 'Invalid role'}), 400

    user.role = new_role
    db.session.commit()

    return jsonify({
        'success': True,
        'message': f'Role updated to {new_role}',
        'data': {'user': user.to_dict()}
    }), 200


@admin_bp.route('/users/<int:user_id>', methods=['DELETE'])
@admin_required()
def delete_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'success': False, 'message': 'User not found'}), 404

    if user.email == 'admin@retechai.com':
        return jsonify({'success': False, 'message': 'Root admin cannot be deleted'}), 400

    db.session.delete(user)
    db.session.commit()

    return jsonify({'success': True, 'message': 'User deleted successfully'}), 200


@admin_bp.route('/agents', methods=['GET'])
@admin_required()
def list_agents():
    agents = User.query.filter_by(role='AGENT').all()
    return jsonify({
        'success': True,
        'data': {
            'agents': [a.to_dict() for a in agents]
        }
    }), 200


@admin_bp.route('/requests', methods=['GET'])
@admin_required()
def list_all_requests():
    req_type = request.args.get('type')  # 'sell', 'exchange', 'repair' or None
    result = {}

    if not req_type or req_type == 'sell':
        sells = SellRequest.query.order_by(SellRequest.created_at.desc()).all()
        result['sell_requests'] = [s.to_dict() for s in sells]

    if not req_type or req_type == 'exchange':
        exchanges = ExchangeRequest.query.order_by(ExchangeRequest.created_at.desc()).all()
        result['exchange_requests'] = [e.to_dict() for e in exchanges]

    if not req_type or req_type == 'repair':
        repairs = RepairRequest.query.order_by(RepairRequest.created_at.desc()).all()
        result['repair_requests'] = [r.to_dict() for r in repairs]

    return jsonify({
        'success': True,
        'data': result
    }), 200


@admin_bp.route('/assign-agent', methods=['PUT'])
@admin_required()
def assign_agent():
    data = request.get_json() or {}
    req_type = data.get('type')  # sell, exchange, repair
    req_id = data.get('request_id')
    agent_id = data.get('agent_id')

    if not req_type or not req_id or not agent_id:
        return jsonify({'success': False, 'message': 'Missing parameters'}), 400

    agent = User.query.filter_by(id=int(agent_id), role='AGENT').first()
    if not agent:
        return jsonify({'success': False, 'message': 'Agent not found'}), 404

    target_req = None
    if req_type == 'sell':
        target_req = SellRequest.query.get(int(req_id))
    elif req_type == 'exchange':
        target_req = ExchangeRequest.query.get(int(req_id))
    elif req_type == 'repair':
        target_req = RepairRequest.query.get(int(req_id))

    if not target_req:
        return jsonify({'success': False, 'message': 'Request not found'}), 404

    target_req.agent_id = agent.id
    if target_req.status == 'Requested':
        target_req.status = 'Agent Assigned'

    db.session.commit()

    # Notify customer and agent
    create_notification(
        user_id=target_req.user_id,
        title="Agent Assigned",
        message=f"Agent {agent.full_name} has been assigned to your {req_type} request ({target_req.request_code}).",
        notif_type="info"
    )

    create_notification(
        user_id=agent.id,
        title="New Task Assignment",
        message=f"You have been assigned to handle {req_type} request {target_req.request_code}.",
        notif_type="info"
    )

    return jsonify({
        'success': True,
        'message': f'Agent {agent.full_name} assigned successfully',
        'data': {'request': target_req.to_dict()}
    }), 200


@admin_bp.route('/catalog', methods=['POST'])
@admin_required()
def add_catalog_item():
    data = request.get_json() or {}
    category = data.get('category', '').strip()
    brand = data.get('brand', '').strip()
    model = data.get('model', '').strip()
    base_price = data.get('base_price')
    release_year = data.get('release_year', 2024)

    if not category or not brand or not model or not base_price:
        return jsonify({'success': False, 'message': 'Category, brand, model, and base price are required'}), 400

    item = DeviceCatalog(
        category=category,
        brand=brand,
        model=model,
        base_price=float(base_price),
        release_year=int(release_year),
        ram_options=data.get('ram_options', '8,16'),
        storage_options=data.get('storage_options', '128,256'),
        processor=data.get('processor', ''),
        image_url=data.get('image_url', ''),
        is_active=True
    )
    db.session.add(item)
    db.session.commit()

    return jsonify({
        'success': True,
        'message': 'Catalog device created',
        'data': {'item': item.to_dict()}
    }), 201


@admin_bp.route('/catalog/<int:item_id>', methods=['PUT', 'DELETE'])
@admin_required()
def modify_catalog_item(item_id):
    item = DeviceCatalog.query.get(item_id)
    if not item:
        return jsonify({'success': False, 'message': 'Item not found'}), 404

    if request.method == 'DELETE':
        db.session.delete(item)
        db.session.commit()
        return jsonify({'success': True, 'message': 'Item deleted'}), 200

    data = request.get_json() or {}
    for k in ['category', 'brand', 'model', 'base_price', 'release_year', 'ram_options', 'storage_options', 'processor', 'image_url', 'is_active']:
        if k in data:
            setattr(item, k, data[k])

    db.session.commit()
    return jsonify({'success': True, 'message': 'Item updated', 'data': {'item': item.to_dict()}}), 200
