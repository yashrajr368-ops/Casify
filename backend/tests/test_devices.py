def test_create_device_and_auto_predict(client, auth_headers):
    res = client.post('/api/devices', headers=auth_headers['customer'], json={
        'category': 'Smartphone',
        'brand': 'Apple',
        'model': 'iPhone 13',
        'purchase_year': 2022,
        'ram': 4,
        'storage': 128,
        'battery_health': 88,
        'screen_condition': 'Good',
        'body_condition': 'Good',
        'overall_condition': 'Good',
        'has_box': True,
        'has_charger': True,
        'has_bill': True,
        'has_warranty': False
    })
    assert res.status_code == 201
    data = res.get_json()
    assert data['success'] is True
    assert 'device' in data['data']
    assert 'prediction' in data['data']
    assert data['data']['prediction']['predicted_price'] > 0

def test_create_device_future_year_fails(client, auth_headers):
    res = client.post('/api/devices', headers=auth_headers['customer'], json={
        'category': 'Smartphone',
        'brand': 'Apple',
        'model': 'iPhone 13',
        'purchase_year': 2035
    })
    assert res.status_code == 400
    data = res.get_json()
    assert data['success'] is False

def test_catalog_endpoints(client):
    res = client.get('/api/catalog/categories')
    assert res.status_code == 200
    data = res.get_json()
    assert len(data['data']['categories']) == 4

    res2 = client.get('/api/catalog/brands?category=Smartphone')
    assert res2.status_code == 200
    data2 = res2.get_json()
    assert 'Apple' in data2['data']['brands']
