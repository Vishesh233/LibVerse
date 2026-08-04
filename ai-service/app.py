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

# Enable CORS
CORS(app)

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
    DEBUG = os.getenv('DEBUG', 'True') == 'True'
    
    print(f"Starting AI Recommendation Service on port {PORT}...")
    app.run(debug=DEBUG, port=PORT, host='0.0.0.0')
