"""
Recommendation API route for the AI service
"""

from flask import Blueprint, request, jsonify
from model.recommender import recommender

recommend_bp = Blueprint('recommend', __name__, url_prefix='/api')

@recommend_bp.route('/recommend', methods=['POST'])
def get_recommendations():
    """Get book recommendations for a user"""
    try:
        data = request.get_json()
        
        user_id = data.get('user_id')
        limit = data.get('limit', 5)
        
        if not user_id:
            return jsonify({'error': 'user_id is required'}), 400
        
        # Get recommendations
        rec_indices = recommender.get_recommendations(user_id, num_recommendations=limit)
        
        # Convert indices to book data
        recommendations = []
        for idx in rec_indices:
            if 0 <= idx < len(recommender.books):
                book = recommender.books[idx]
                recommendations.append({
                    '_id': book.get('_id'),
                    'title': book.get('title'),
                    'author': book.get('author'),
                    'genre': book.get('genre'),
                    'reason': 'Based on your reading history'
                })
        
        return jsonify({
            'success': True,
            'user_id': user_id,
            'recommendations': recommendations
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@recommend_bp.route('/similar/<book_id>', methods=['GET'])
def get_similar_books(book_id):
    """Get books similar to a given book"""
    try:
        limit = request.args.get('limit', 5, type=int)
        
        # Get similar books
        similar_indices = recommender.get_similar_books(book_id, num_similar=limit)
        
        # Convert indices to book data
        similar_books = []
        for idx in similar_indices:
            if 0 <= idx < len(recommender.books):
                book = recommender.books[idx]
                similar_books.append({
                    '_id': book.get('_id'),
                    'title': book.get('title'),
                    'author': book.get('author'),
                    'genre': book.get('genre'),
                })
        
        return jsonify({
            'success': True,
            'book_id': book_id,
            'similar_books': similar_books
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@recommend_bp.route('/train', methods=['POST'])
def train_model():
    """Train the recommendation model with books"""
    try:
        data = request.get_json()
        books = data.get('books', [])
        
        if not books:
            return jsonify({'error': 'Books data is required'}), 400
        
        # Train recommender
        recommender.train(books)
        
        return jsonify({
            'success': True,
            'message': f'Model trained with {len(books)} books'
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@recommend_bp.route('/user-history', methods=['POST'])
def add_user_history():
    """Add user's reading history"""
    try:
        data = request.get_json()
        
        user_id = data.get('user_id')
        book_ids = data.get('book_ids', [])
        genres = data.get('genres', [])
        
        if not user_id:
            return jsonify({'error': 'user_id is required'}), 400
        
        # Add user history
        recommender.add_user_history(user_id, book_ids, genres)
        
        return jsonify({
            'success': True,
            'message': 'User history updated'
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
