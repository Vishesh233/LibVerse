"""
Smart Library AI Recommendation Service
Flask API for book recommendations using ML
"""

from flask import Flask, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)

# CORS allowlist: CORS_ORIGINS (comma-separated), default the local frontend dev server
CORS_ORIGINS = [o.strip() for o in os.getenv('CORS_ORIGINS', 'http://localhost:3000,http://127.0.0.1:3000').split(',') if o.strip()]
CORS(app, origins=CORS_ORIGINS)

# Configuration
app.config['JSON_SORT_KEYS'] = False

# Register blueprints
from routes.recommend import recommend_bp
app.register_blueprint(recommend_bp)

# Health check endpoint
@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'AI Service is running',
        'service': 'Book Recommendation Engine'
    }), 200

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Route not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    PORT = int(os.getenv('PORT', 5000))
    # Safe defaults: debugger off, listen on localhost only (set HOST=0.0.0.0 explicitly to expose it)
    DEBUG = os.getenv('DEBUG', 'False').strip().lower() == 'true'
    HOST = os.getenv('HOST', '127.0.0.1')

    print(f"Starting AI Recommendation Service on {HOST}:{PORT}...")
    app.run(debug=DEBUG, port=PORT, host=HOST)
