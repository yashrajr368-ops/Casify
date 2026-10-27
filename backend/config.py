import os
from datetime import timedelta
from dotenv import load_dotenv

# Load environment variables from .env file
basedir = os.path.abspath(os.path.dirname(__file__))
load_dotenv(os.path.join(basedir, '.env'))

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'retech-ai-super-secret-production-key-2026')
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'retech-ai-jwt-secret-token-key-2026')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=7)
    
    # SQLite default, MySQL compatible via DATABASE_URL
    _db_env = os.environ.get('DATABASE_URL')
    if not _db_env or _db_env == 'sqlite:///retech_ai.db':
        SQLALCHEMY_DATABASE_URI = f"sqlite:///{os.path.join(basedir, 'retech_ai.db').replace('\\', '/')}"
    else:
        SQLALCHEMY_DATABASE_URI = _db_env
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Upload configurations
    UPLOAD_FOLDER = os.path.join(basedir, 'uploads')
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16 MB max limit
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp'}

class TestingConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    WTF_CSRF_ENABLED = False
