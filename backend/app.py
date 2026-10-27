import os
from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
from backend.config import Config
from backend.extensions import db, jwt

# Import Blueprints
from backend.routes.auth import auth_bp
from backend.routes.users import users_bp
from backend.routes.devices import devices_bp
from backend.routes.prediction import prediction_bp
from backend.routes.selling import sell_bp
from backend.routes.exchange import exchange_bp
from backend.routes.repair import repair_bp
from backend.routes.pickup import pickup_bp
from backend.routes.notifications import notifications_bp
from backend.routes.admin import admin_bp
from backend.routes.agent import agent_bp
from backend.routes.catalog import catalog_bp

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)

    # Ensure upload directory exists
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

    # Register Blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(users_bp)
    app.register_blueprint(devices_bp)
    app.register_blueprint(prediction_bp)
    app.register_blueprint(sell_bp)
    app.register_blueprint(exchange_bp)
    app.register_blueprint(repair_bp)
    app.register_blueprint(pickup_bp)
    app.register_blueprint(notifications_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(agent_bp)
    app.register_blueprint(catalog_bp)

    # Static file serving for uploads
    @app.route('/uploads/<path:filename>')
    def serve_upload(filename):
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

    # Health check endpoint
    @app.route('/api/health', methods=['GET'])
    def health_check():
        return jsonify({
            'success': True,
            'message': 'RETECH AI Backend API is operational',
            'status': 'healthy',
            'version': '1.0.0'
        }), 200

    # JWT Error handlers
    @jwt.unauthorized_loader
    def unauthorized_callback(callback):
        return jsonify({
            'success': False,
            'message': 'Authorization token is missing or invalid',
            'error': 'UNAUTHORIZED'
        }), 401

    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({
            'success': False,
            'message': 'Authorization token has expired. Please log in again.',
            'error': 'TOKEN_EXPIRED'
        }), 401

    @jwt.invalid_token_loader
    def invalid_token_callback(callback):
        return jsonify({
            'success': False,
            'message': 'Invalid token signature',
            'error': 'INVALID_TOKEN'
        }), 401

    # Standard error handlers
    @app.errorhandler(400)
    def bad_request(e):
        return jsonify({'success': False, 'message': 'Bad request', 'error': 'BAD_REQUEST'}), 400

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({'success': False, 'message': 'Requested resource was not found', 'error': 'NOT_FOUND'}), 404

    @app.errorhandler(413)
    def file_too_large(e):
        return jsonify({'success': False, 'message': 'File exceeds maximum upload size (16MB)', 'error': 'FILE_TOO_LARGE'}), 413

    @app.errorhandler(500)
    def internal_error(e):
        return jsonify({'success': False, 'message': 'An internal server error occurred', 'error': 'INTERNAL_ERROR'}), 500

    # Auto-create tables on startup
    with app.app_context():
        db.create_all()

    return app

if __name__ == '__main__':
    application = create_app()
    print("\n" + "=" * 60)
    print("  RETECH AI Backend Server Running on http://127.0.0.1:5000")
    print("=" * 60 + "\n")
    application.run(host='0.0.0.0', port=5000, debug=True)
