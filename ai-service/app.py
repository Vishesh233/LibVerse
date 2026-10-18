"""
LibVerse AI recommendation service (Flask)
"""

import os

from dotenv import load_dotenv
from flask import Flask, jsonify
from flask_cors import CORS

load_dotenv()


def create_app():
    app = Flask(__name__)
    app.json.sort_keys = False
    # A full catalogue with descriptions is well under this
    app.config['MAX_CONTENT_LENGTH'] = 10 * 1024 * 1024

    # Only the Node backend calls this service, but keep browsers limited to known origins anyway
    origins = [o.strip() for o in os.getenv('CORS_ORIGINS', 'http://localhost:3000,http://127.0.0.1:3000').split(',') if o.strip()]
    CORS(app, origins=origins)

    from model.recommender import recommender
    from routes.recommend import recommend_bp
    app.register_blueprint(recommend_bp)

    @app.route('/health', methods=['GET'])
    def health():
        return jsonify({'status': 'ok', 'service': 'LibVerse recommendations', 'trainedBooks': recommender.size}), 200

    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'success': False, 'error': 'Route not found'}), 404

    @app.errorhandler(405)
    def method_not_allowed(error):
        return jsonify({'success': False, 'error': 'Method not allowed'}), 405

    @app.errorhandler(413)
    def too_large(error):
        return jsonify({'success': False, 'error': 'Request body too large'}), 413

    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({'success': False, 'error': 'Internal server error'}), 500

    return app


app = create_app()

if __name__ == '__main__':
    PORT = int(os.getenv('PORT', 5000))
    # Safe defaults: debugger off, listen on localhost only (set HOST=0.0.0.0 explicitly to expose it)
    DEBUG = os.getenv('DEBUG', 'False').strip().lower() == 'true'
    HOST = os.getenv('HOST', '127.0.0.1')

    print(f'Starting LibVerse recommendation service on {HOST}:{PORT}...')
    app.run(debug=DEBUG, port=PORT, host=HOST)
