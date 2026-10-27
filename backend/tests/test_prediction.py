def test_predict_endpoint_success(client):
    res = client.post('/api/predict', json={
        'category': 'Smartphone',
        'brand': 'Apple',
        'model': 'iPhone 13',
        'purchase_year': 2022,
        'ram': 4,
        'storage': 128,
        'battery_health': 85,
        'screen_condition': 'Good',
        'body_condition': 'Good',
        'overall_condition': 'Good',
        'has_box': True,
        'has_charger': True,
        'has_bill': True,
        'has_warranty': False
    })
    assert res.status_code == 200
    data = res.get_json()
    assert data['success'] is True
    val = data['data']
    assert val['predicted_price'] > 1000.0
    assert val['minimum_price'] <= val['predicted_price']
    assert val['maximum_price'] >= val['predicted_price']
    assert 0 <= val['confidence_score'] <= 100
    assert 0 <= val['condition_score'] <= 10
    assert 'breakdown' in val
    assert 'original_base_price' in val['breakdown']
