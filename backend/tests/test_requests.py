def test_sell_and_exchange_and_repair_flow(client, auth_headers):
    # 1. Create device
    dev_res = client.post('/api/devices', headers=auth_headers['customer'], json={
        'category': 'Smartphone',
        'brand': 'Apple',
        'model': 'iPhone 13',
        'purchase_year': 2022,
        'ram': 4,
        'storage': 128
    })
    assert dev_res.status_code == 201
    device_id = dev_res.get_json()['data']['device']['id']

    # 2. Create sell request
    sell_res = client.post('/api/sell', headers=auth_headers['customer'], json={
        'device_id': device_id,
        'pickup_address': '123 Test St',
        'city': 'Bengaluru',
        'state': 'Karnataka',
        'pincode': '560001',
        'pickup_date': '2026-09-20',
        'pickup_time': '10:00 AM - 01:00 PM'
    })
    assert sell_res.status_code == 201
    sell_data = sell_res.get_json()['data']['sell_request']
    assert sell_data['status'] == 'Requested'
    sell_id = sell_data['id']

    # 3. Customer cannot access admin endpoints
    adm_forbidden = client.get('/api/admin/dashboard', headers=auth_headers['customer'])
    assert adm_forbidden.status_code == 403

    # 4. Admin accesses dashboard
    adm_res = client.get('/api/admin/dashboard', headers=auth_headers['admin'])
    assert adm_res.status_code == 200
    assert 'overview' in adm_res.get_json()['data']

    # 5. Admin assigns agent
    assign_res = client.put('/api/admin/assign-agent', headers=auth_headers['admin'], json={
        'type': 'sell',
        'request_id': sell_id,
        'agent_id': auth_headers['agent_id']
    })
    assert assign_res.status_code == 200
    assert assign_res.get_json()['data']['request']['agent_id'] == auth_headers['agent_id']

    # 6. Agent inspects device and submits final offer
    insp_res = client.post(f'/api/agent/inspection/{sell_id}', headers=auth_headers['agent'], json={
        'final_price': 25000.0,
        'notes': 'Device verified in good shape, minor bezel scratch.',
        'verified_condition': 'Good',
        'status': 'Final Offer'
    })
    assert insp_res.status_code == 200
    assert insp_res.get_json()['data']['sell_request']['final_price'] == 25000.0

    # 7. Create exchange request
    exch_res = client.post('/api/exchange', headers=auth_headers['customer'], json={
        'old_device_id': device_id,
        'target_device_name': 'iPhone 15 Pro Max',
        'target_device_price': 140000.0,
        'old_device_value': 25000.0,
        'pickup_address': '123 Test St',
        'pickup_date': '2026-09-22'
    })
    assert exch_res.status_code == 201
    assert exch_res.get_json()['data']['exchange_request']['additional_amount'] == 115000.0

    # 8. Create repair request
    rep_res = client.post('/api/repair', headers=auth_headers['customer'], json={
        'repair_type': 'Screen',
        'problem_description': 'Cracked front glass',
        'pickup_address': '123 Test St',
        'pickup_date': '2026-09-23'
    })
    assert rep_res.status_code == 201
    assert rep_res.get_json()['data']['repair_request']['repair_type'] == 'Screen'
