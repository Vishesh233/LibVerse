import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import json

class BookRecommender:
    """
    AI-powered book recommendation engine using TF-IDF and Cosine Similarity
    """
    
    def __init__(self):
        self.vectorizer = TfidfVectorizer(analyzer='char', ngram_range=(2, 3))
        self.book_vectors = None
        self.books = []
        self.user_history = {}
    
    def train(self, books):
        """
        Train the model with available books
        
        Args:
            books: List of book dictionaries with 'title', 'author', 'genre', 'description'
        """
        self.books = books
        
        # Combine text features for TF-IDF
        book_texts = []
        for book in books:
            text = f"{book.get('title', '')} {book.get('author', '')} {book.get('genre', '')} {book.get('description', '')}"
            book_texts.append(text)
        
        # Create TF-IDF vectors
        if book_texts:
            self.book_vectors = self.vectorizer.fit_transform(book_texts)
    
    def add_user_history(self, user_id, book_ids, genres):
        """
        Add user's book history
        
        Args:
            user_id: User ID
            book_ids: List of book IDs user has read
            genres: List of preferred genres
        """
        self.user_history[user_id] = {
            'book_ids': book_ids,
            'genres': genres
        }
    
    def get_recommendations(self, user_id, num_recommendations=5):
        """
        Get book recommendations for a user
        
        Args:
            user_id: User ID
            num_recommendations: Number of books to recommend
            
        Returns:
            List of recommended book indices
        """
        if self.book_vectors is None or len(self.books) == 0:
            return []
        
        # Get user history
        history = self.user_history.get(user_id, {})
        read_books = set(history.get('book_ids', []))
        preferred_genres = history.get('genres', [])
        
        # Calculate similarity scores
        scores = np.zeros(len(self.books))
        
        # Genre-based scoring
        for idx, book in enumerate(self.books):
            if str(book.get('_id', '')) not in read_books:
                # Genre match score
                if book.get('genre') in preferred_genres:
                    scores[idx] += 2.0
                
                # Content similarity score
                if read_books and self.book_vectors is not None:
                    read_indices = [i for i, b in enumerate(self.books) 
                                  if str(b.get('_id', '')) in read_books]
                    
                    if read_indices:
                        similarities = []
                        for read_idx in read_indices:
                            sim = cosine_similarity(
                                self.book_vectors[idx:idx+1],
                                self.book_vectors[read_idx:read_idx+1]
                            )[0][0]
                            similarities.append(sim)
                        
                        scores[idx] += np.mean(similarities)
        
        # Get top recommendations
        recommended_indices = np.argsort(scores)[::-1][:num_recommendations]
        
        return [int(idx) for idx in recommended_indices if scores[idx] > 0]
    
    def get_similar_books(self, book_id, num_similar=5):
        """
        Get books similar to a given book
        
        Args:
            book_id: Book ID
            num_similar: Number of similar books to return
            
        Returns:
            List of similar book indices
        """
        if self.book_vectors is None:
            return []
        
        # Find book index
        book_idx = None
        for idx, book in enumerate(self.books):
            if str(book.get('_id', '')) == str(book_id):
                book_idx = idx
                break
        
        if book_idx is None:
            return []
        
        # Calculate similarities
        similarities = cosine_similarity(
            self.book_vectors[book_idx:book_idx+1],
            self.book_vectors
        )[0]
        
        # Get top similar books (excluding the book itself)
        similar_indices = np.argsort(similarities)[::-1][1:num_similar+1]
        
        return [int(idx) for idx in similar_indices]


# Global recommender instance
recommender = BookRecommender()
