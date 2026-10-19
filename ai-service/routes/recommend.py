"""
Recommendation API (stateless per reader: everything about the reader comes with the request)

  POST /api/train      { books: [{id, title, author, genre, description, popularity?}], catalog? }
  POST /api/recommend  { readIds, favouriteGenres, excludeIds, limit, catalog? }

`catalog` (optional, a-z 0-9 _ -, at most 32 characters) keeps separate catalogues apart when
several backends share this service (e.g. the live demo and production): each is trained and
queried by its own name. Without it the default catalogue is used.

Both require the X-Service-Token header to equal AI_SERVICE_TOKEN (503 while it is not set).
"""

import hmac
import os
import re
import threading
from functools import wraps

from flask import Blueprint, jsonify, request

from model.recommender import BookRecommender, NotTrainedError, recommender

recommend_bp = Blueprint('recommend', __name__, url_prefix='/api')

MAX_BOOKS = 20000
MAX_IDS = 2000
MAX_LIMIT = 50
DEFAULT_LIMIT = 6
CATALOG_NAME = re.compile(r'^[a-z0-9_-]{1,32}$')
MAX_CATALOGS = 8

# Named catalogues (the default one is `recommender`)
_named = {}
_named_lock = threading.Lock()


def _catalog_name(data):
    """None for the default catalogue, the name, or False when it is malformed"""
    name = data.get('catalog')
    if name in (None, '', 'default'):
        return None
    if not isinstance(name, str) or not CATALOG_NAME.match(name):
        return False
    return name


def _recommender_for(name, create=False):
    """The recommender of a catalogue; None when it does not exist (or the limit is reached)"""
    if name is None:
        return recommender
    with _named_lock:
        found = _named.get(name)
        if found is None and create and len(_named) < MAX_CATALOGS:
            found = _named[name] = BookRecommender()
        return found


def catalog_sizes():
    """Books trained per catalogue, for /health"""
    with _named_lock:
        named = {name: r.size for name, r in _named.items()}
    return {'default': recommender.size, **named}


def require_service_token(view):
    """Allow only callers that send X-Service-Token equal to AI_SERVICE_TOKEN"""
    @wraps(view)
    def wrapper(*args, **kwargs):
        expected = os.getenv('AI_SERVICE_TOKEN', '')
        if not expected:
            return jsonify({'success': False, 'error': 'AI_SERVICE_TOKEN is not configured'}), 503
        provided = request.headers.get('X-Service-Token', '')
        if not hmac.compare_digest(provided.encode('utf-8'), expected.encode('utf-8')):
            return jsonify({'success': False, 'error': 'Unauthorized'}), 401
        return view(*args, **kwargs)
    return wrapper


def _bad(message):
    return jsonify({'success': False, 'error': message}), 400


def _string_list(data, key):
    """A list of strings from the body (missing = empty); None when the value is malformed"""
    value = data.get(key, [])
    if value is None:
        return []
    if not isinstance(value, list) or len(value) > MAX_IDS or not all(isinstance(v, str) for v in value):
        return None
    return value


@recommend_bp.route('/train', methods=['POST'])
@require_service_token
def train():
    data = request.get_json(silent=True)
    books = data.get('books') if isinstance(data, dict) else None
    catalog = _catalog_name(data) if isinstance(data, dict) else None
    if catalog is False:
        return _bad('catalog must be 1-32 characters: a-z, 0-9, _ or -')
    if not isinstance(books, list) or not books:
        return _bad('books must be a non-empty list')
    if len(books) > MAX_BOOKS:
        return _bad(f'At most {MAX_BOOKS} books')
    seen = set()
    for book in books:
        if not isinstance(book, dict) or not isinstance(book.get('id'), str) or not book['id']:
            return _bad('Every book needs a string id')
        if book['id'] in seen:
            return _bad('Book ids must be unique')
        seen.add(book['id'])
        for field in ('title', 'author', 'genre', 'description'):
            if book.get(field) is not None and not isinstance(book[field], str):
                return _bad(f'{field} must be a string')
        popularity = book.get('popularity')
        if popularity is not None and (isinstance(popularity, bool) or not isinstance(popularity, (int, float)) or popularity < 0):
            return _bad('popularity must be a number >= 0')

    target = _recommender_for(catalog, create=True)
    if target is None:
        return _bad(f'At most {MAX_CATALOGS} named catalogues')
    count = target.train(books)
    return jsonify({'success': True, 'trained': count}), 200


@recommend_bp.route('/recommend', methods=['POST'])
@require_service_token
def recommend():
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return _bad('Send a JSON object')
    catalog = _catalog_name(data)
    if catalog is False:
        return _bad('catalog must be 1-32 characters: a-z, 0-9, _ or -')
    read_ids = _string_list(data, 'readIds')
    genres = _string_list(data, 'favouriteGenres')
    exclude_ids = _string_list(data, 'excludeIds')
    if read_ids is None or genres is None or exclude_ids is None:
        return _bad(f'readIds, favouriteGenres and excludeIds must be lists of at most {MAX_IDS} strings')
    limit = data.get('limit', DEFAULT_LIMIT)
    if isinstance(limit, bool) or not isinstance(limit, int) or not 1 <= limit <= MAX_LIMIT:
        return _bad(f'limit must be a whole number from 1 to {MAX_LIMIT}')

    try:
        target = _recommender_for(catalog)
        if target is None:
            raise NotTrainedError(f'The catalogue "{catalog}" has not been trained yet')
        items = target.recommend(read_ids, genres, exclude_ids, limit)
    except NotTrainedError as error:
        # 409: the caller should send /api/train first (the Node backend retrains and falls back)
        return jsonify({'success': False, 'error': str(error)}), 409
    return jsonify({'success': True, 'recommendations': items}), 200
