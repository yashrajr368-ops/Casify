from functools import wraps
from flask import jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from backend.models.user import User

def admin_required():
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            verify_jwt_in_request()
            user_id = get_jwt_identity()
            user = User.query.get(user_id)
            if not user or user.role != 'ADMIN':
                return jsonify({
                    'success': False,
                    'message': 'Admin privilege required to perform this action',
                    'error': 'UNAUTHORIZED_ROLE'
                }), 403
            return fn(*args, **kwargs)
        return decorator
    return wrapper

def agent_required():
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            verify_jwt_in_request()
            user_id = get_jwt_identity()
            user = User.query.get(user_id)
            if not user or user.role not in ['AGENT', 'ADMIN']:
                return jsonify({
                    'success': False,
                    'message': 'Agent or Admin privilege required',
                    'error': 'UNAUTHORIZED_ROLE'
                }), 403
            return fn(*args, **kwargs)
        return decorator
    return wrapper
