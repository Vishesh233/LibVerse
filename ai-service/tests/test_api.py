from conftest import CATALOGUE, TOKEN

AUTH = {'X-Service-Token': TOKEN}


def train(client):
    return client.post('/api/train', json={'books': CATALOGUE}, headers=AUTH)


def test_health(client):
    res = client.get('/health')
    assert res.status_code == 200
    assert res.get_json()['trainedBooks'] == 0


def test_train_requires_the_service_token(client):
    assert client.post('/api/train', json={'books': CATALOGUE}).status_code == 401
    assert client.post('/api/train', json={'books': CATALOGUE}, headers={'X-Service-Token': 'wrong'}).status_code == 401


def test_service_token_not_configured_is_503(client, monkeypatch):
    monkeypatch.delenv('AI_SERVICE_TOKEN')
    assert train(client).status_code == 503
    assert client.post('/api/recommend', json={}, headers=AUTH).status_code == 503


def test_recommend_requires_the_service_token(client):
    train(client)
    assert client.post('/api/recommend', json={'readIds': ['py1']}).status_code == 401


def test_recommend_before_training_is_409(client):
    res = client.post('/api/recommend', json={'readIds': ['py1']}, headers=AUTH)
    assert res.status_code == 409


def test_train_then_recommend(client):
    res = train(client)
    assert res.status_code == 200 and res.get_json()['trained'] == len(CATALOGUE)
    assert client.get('/health').get_json()['trainedBooks'] == len(CATALOGUE)

    res = client.post('/api/recommend', headers=AUTH, json={
        'readIds': ['py1'], 'favouriteGenres': ['History'], 'excludeIds': ['ml1'], 'limit': 4,
    })
    assert res.status_code == 200
    items = res.get_json()['recommendations']
    assert len(items) == 4
    assert items[0] == {'id': 'py2', 'score': items[0]['score'], 'reason': 'Because you read Learning Python', 'basis': 'content'}
    assert 'ml1' not in [i['id'] for i in items] and 'py1' not in [i['id'] for i in items]
    assert [i['reason'] for i in items[1:]] == ['Popular in History'] * 3


def test_train_validation(client):
    for body in ({}, {'books': []}, {'books': 'x'}, {'books': [{'title': 'no id'}]},
                 {'books': [{'id': 'a'}, {'id': 'a'}]}, {'books': [{'id': 'a', 'title': 5}]},
                 {'books': [{'id': 'a', 'popularity': -1}]}, {'books': [{'id': 'a', 'popularity': True}]}):
        assert client.post('/api/train', json=body, headers=AUTH).status_code == 400, body
    assert client.post('/api/train', data='not json', headers=AUTH, content_type='application/json').status_code == 400


def test_recommend_validation(client):
    train(client)
    for body in ({'readIds': 'py1'}, {'readIds': [1]}, {'favouriteGenres': [None]}, {'excludeIds': {}},
                 {'limit': 0}, {'limit': 51}, {'limit': '3'}, {'limit': True}, {'readIds': ['x'] * 2001}):
        assert client.post('/api/recommend', json=body, headers=AUTH).status_code == 400, str(body)[:60]
    assert client.post('/api/recommend', json=[1], headers=AUTH).status_code == 400


def test_unknown_route_and_method(client):
    assert client.get('/api/nope').status_code == 404
    assert client.get('/api/recommend').status_code == 405


def test_old_stateful_routes_are_gone(client):
    assert client.post('/api/user-history', json={}, headers=AUTH).status_code == 404
    assert client.get('/api/similar/py1').status_code == 404


def test_named_catalogues_are_kept_apart(client):
    demo = [{'id': 'd1', 'title': 'Demo Python', 'author': 'A', 'genre': 'Technology', 'description': 'Python programming basics.'},
            {'id': 'd2', 'title': 'Demo Python Two', 'author': 'B', 'genre': 'Technology', 'description': 'More Python programming.'}]
    assert client.post('/api/train', json={'books': CATALOGUE, 'catalog': 'production'}, headers=AUTH).status_code == 200
    assert client.post('/api/train', json={'books': demo, 'catalog': 'demo'}, headers=AUTH).status_code == 200
    prod = client.post('/api/recommend', json={'readIds': ['py1'], 'catalog': 'production'}, headers=AUTH).get_json()
    demo_res = client.post('/api/recommend', json={'readIds': ['d1'], 'catalog': 'demo'}, headers=AUTH).get_json()
    assert prod['recommendations'] and all(not r['id'].startswith('d') for r in prod['recommendations'])
    assert [r['id'] for r in demo_res['recommendations']] == ['d2']
    # The default catalogue is separate and still untrained
    assert client.post('/api/recommend', json={'readIds': ['py1']}, headers=AUTH).status_code == 409
    assert client.post('/api/recommend', json={'readIds': ['py1'], 'catalog': 'other'}, headers=AUTH).status_code == 409
    health = client.get('/health').get_json()
    assert health['catalogs'] == {'default': 0, 'production': len(CATALOGUE), 'demo': 2}
    assert health['trainedBooks'] == len(CATALOGUE) + 2


def test_catalogue_name_validation(client):
    for name in ['Has Space', 'x' * 33, 7, ['demo'], '../etc']:
        assert client.post('/api/train', json={'books': CATALOGUE, 'catalog': name}, headers=AUTH).status_code == 400, name
        assert client.post('/api/recommend', json={'readIds': [], 'catalog': name}, headers=AUTH).status_code == 400, name
