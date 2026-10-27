import json

def test_register_success(client):
    res = client.post('/api/auth/register', json={
        'full_name': 'New User',
        'email': 'newuser@test.com',
        'phone': '9876543210',
        'password': 'Password@123',
        'confirm_password': 'Password@123'
    })
    assert res.status_code == 201
    data = res.get_json()
    assert data['success'] is True
    assert 'token' in data['data']
    assert data['data']['user']['email'] == 'newuser@test.com'

def test_register_duplicate_email(client):
    res = client.post('/api/auth/register', json={
        'full_name': 'Duplicate User',
        'email': 'customer@test.com',
        'password': 'Password@123',
        'confirm_password': 'Password@123'
    })
    assert res.status_code == 409
    data = res.get_json()
    assert data['success'] is False
    assert data['error'] == 'USER_EXISTS'

def test_register_password_mismatch(client):
    res = client.post('/api/auth/register', json={
        'full_name': 'Mismatch User',
        'email': 'mismatch@test.com',
        'password': 'Password@123',
        'confirm_password': 'DifferentPassword'
    })
    assert res.status_code == 400
    data = res.get_json()
    assert data['error'] == 'PASSWORD_MISMATCH'

def test_login_success(client):
    res = client.post('/api/auth/login', json={
        'email': 'customer@test.com',
        'password': 'Customer@123'
    })
    assert res.status_code == 200
    data = res.get_json()
    assert data['success'] is True
    assert 'token' in data['data']
    assert data['data']['user']['role'] == 'CUSTOMER'

def test_login_invalid_credentials(client):
    res = client.post('/api/auth/login', json={
        'email': 'customer@test.com',
        'password': 'WrongPassword'
    })
    assert res.status_code == 401
    data = res.get_json()
    assert data['success'] is False

def test_get_current_user_authenticated(client, auth_headers):
    res = client.get('/api/auth/me', headers=auth_headers['customer'])
    assert res.status_code == 200
    data = res.get_json()
    assert data['data']['user']['email'] == 'customer@test.com'

def test_get_current_user_unauthorized(client):
    res = client.get('/api/auth/me')
    assert res.status_code == 401
