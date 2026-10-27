from flask import Blueprint, request, jsonify
from backend.models.catalog import DeviceCatalog

catalog_bp = Blueprint('catalog', __name__, url_prefix='/api/catalog')

@catalog_bp.route('', methods=['GET'])
def get_catalog():
    category = request.args.get('category')
    brand = request.args.get('brand')

    query = DeviceCatalog.query.filter_by(is_active=True)
    if category:
        query = query.filter_by(category=category)
    if brand:
        query = query.filter_by(brand=brand)

    items = query.order_by(DeviceCatalog.brand, DeviceCatalog.model).all()
    return jsonify({
        'success': True,
        'message': 'Catalog items retrieved',
        'data': {
            'items': [item.to_dict() for item in items]
        }
    }), 200

@catalog_bp.route('/categories', methods=['GET'])
def get_categories():
    categories = [
        {'id': 'Smartphone', 'name': 'Smartphones', 'icon': 'Smartphone'},
        {'id': 'Laptop', 'name': 'Laptops', 'icon': 'Laptop'},
        {'id': 'Tablet', 'name': 'Tablets', 'icon': 'Tablet'},
        {'id': 'Smartwatch', 'name': 'Smartwatches', 'icon': 'Watch'}
    ]
    return jsonify({
        'success': True,
        'data': {
            'categories': categories
        }
    }), 200

@catalog_bp.route('/brands', methods=['GET'])
def get_brands():
    category = request.args.get('category')
    query = DeviceCatalog.query.filter_by(is_active=True)
    if category:
        query = query.filter_by(category=category)

    distinct_brands = [b[0] for b in query.with_entities(DeviceCatalog.brand).distinct().order_by(DeviceCatalog.brand).all()]
    return jsonify({
        'success': True,
        'data': {
            'brands': distinct_brands
        }
    }), 200

@catalog_bp.route('/models', methods=['GET'])
def get_models():
    category = request.args.get('category')
    brand = request.args.get('brand')

    query = DeviceCatalog.query.filter_by(is_active=True)
    if category:
        query = query.filter_by(category=category)
    if brand:
        query = query.filter_by(brand=brand)

    models = query.order_by(DeviceCatalog.model).all()
    return jsonify({
        'success': True,
        'data': {
            'models': [m.to_dict() for m in models]
        }
    }), 200
