import re
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from backend.extensions import db
from backend.models.user import User
from backend.services.notification_service import create_notification

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

EMAIL_REGEX = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    full_name = data.get('full_name', '').strip()
    email = data.get('email', '').strip().lower()
    phone = data.get('phone', '').strip()
    password = data.get('password', '')
    confirm_password = data.get('confirm_password', '')
    address = data.get('address', '').strip()
    city = data.get('city', '').strip()
    state = data.get('state', '').strip()
    pincode = data.get('pincode', '').strip()
    role = data.get('role', 'CUSTOMER').upper()

    # Validation
    if not full_name or not email or not password:
        return jsonify({
            'success': False,
            'message': 'Full name, email, and password are required',
            'error': 'VALIDATION_ERROR'
        }), 400

    if not re.match(EMAIL_REGEX, email):
        return jsonify({
            'success': False,
            'message': 'Please provide a valid email address',
            'error': 'INVALID_EMAIL'
        }), 400

    if len(password) < 6:
        return jsonify({
            'success': False,
            'message': 'Password must be at least 6 characters long',
            'error': 'WEAK_PASSWORD'
        }), 400

    if confirm_password and password != confirm_password:
        return jsonify({
            'success': False,
            'message': 'Passwords do not match',
            'error': 'PASSWORD_MISMATCH'
        }), 400

    # Ensure role is valid
    if role not in ['CUSTOMER', 'AGENT', 'ADMIN']:
        role = 'CUSTOMER'

    # Check existing user
    if User.query.filter_by(email=email).first():
        return jsonify({
            'success': False,
            'message': 'An account with this email already exists',
            'error': 'USER_EXISTS'
        }), 409

    # Create new user
    user = User(
        full_name=full_name,
        email=email,
        phone=phone,
        role=role,
        address=address,
        city=city,
        state=state,
        pincode=pincode
    )
    user.set_password(password)

    db.session.add(user)
    db.session.commit()

    # Send welcome notification
    create_notification(
        user_id=user.id,
        title="Welcome to RETECH AI!",
        message="Your account has been created. Turn your old devices into smart value today.",
        notif_type="success"
    )

    access_token = create_access_token(identity=str(user.id))
    return jsonify({
        'success': True,
        'message': 'Account registered successfully',
        'data': {
            'token': access_token,
            'user': user.to_dict()
        }
    }), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not email or not password:
        return jsonify({
            'success': False,
            'message': 'Email and password are required',
            'error': 'MISSING_CREDENTIALS'
        }), 400

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({
            'success': False,
            'message': 'Invalid email or password',
            'error': 'INVALID_CREDENTIALS'
        }), 401

    access_token = create_access_token(identity=str(user.id))
    return jsonify({
        'success': True,
        'message': 'Logged in successfully',
        'data': {
            'token': access_token,
            'user': user.to_dict()
        }
    }), 200


@auth_bp.route('/logout', methods=['POST'])
def logout():
    return jsonify({
        'success': True,
        'message': 'Logged out successfully'
    }), 200


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    if not user:
        return jsonify({
            'success': False,
            'message': 'User not found',
            'error': 'USER_NOT_FOUND'
        }), 404

    return jsonify({
        'success': True,
        'message': 'Profile retrieved',
        'data': {
            'user': user.to_dict()
        }
    }), 200


@auth_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    if not user:
        return jsonify({
            'success': False,
            'message': 'User not found'
        }), 404

    data = request.get_json() or {}
    if 'full_name' in data:
        user.full_name = data['full_name'].strip()
    if 'phone' in data:
        user.phone = data['phone'].strip()
    if 'address' in data:
        user.address = data['address'].strip()
    if 'city' in data:
        user.city = data['city'].strip()
    if 'state' in data:
        user.state = data['state'].strip()
    if 'pincode' in data:
        user.pincode = data['pincode'].strip()

    db.session.commit()

    return jsonify({
        'success': True,
        'message': 'Profile updated successfully',
        'data': {
            'user': user.to_dict()
        }
    }), 200


@auth_bp.route('/change-password', methods=['PUT'])
@jwt_required()
def change_password():
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    if not user:
        return jsonify({'success': False, 'message': 'User not found'}), 404

    data = request.get_json() or {}
    old_password = data.get('old_password', '')
    new_password = data.get('new_password', '')

    if not user.check_password(old_password):
        return jsonify({
            'success': False,
            'message': 'Incorrect existing password',
            'error': 'INCORRECT_OLD_PASSWORD'
        }), 400

    if len(new_password) < 6:
        return jsonify({
            'success': False,
            'message': 'New password must be at least 6 characters',
            'error': 'WEAK_PASSWORD'
        }), 400

    user.set_password(new_password)
    db.session.commit()

    return jsonify({
        'success': True,
        'message': 'Password updated successfully'
    }), 200


@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    if not email:
        return jsonify({'success': False, 'message': 'Email is required'}), 400

    user = User.query.filter_by(email=email).first()
    # In development / college demo mode, provide clear feedback
    return jsonify({
        'success': True,
        'message': f'If an account exists for {email}, a password reset link has been dispatched.',
        'data': {'simulated_reset': True}
    }), 200
