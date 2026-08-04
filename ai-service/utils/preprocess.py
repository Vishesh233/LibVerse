"""
Preprocessing utilities for the AI recommendation service
"""

import re
from typing import List, Dict

def clean_text(text):
    """
    Clean text for processing
    
    Args:
        text: Input text
        
    Returns:
        Cleaned text
    """
    if not text:
        return ""
    
    # Convert to lowercase
    text = text.lower()
    
    # Remove special characters
    text = re.sub(r'[^a-zA-Z0-9\s]', ' ', text)
    
    # Remove extra whitespace
    text = re.sub(r'\s+', ' ', text).strip()
    
    return text

def format_book_data(book):
    """
    Format book data for processing
    
    Args:
        book: Book dictionary
        
    Returns:
        Formatted book dictionary
    """
    return {
        '_id': str(book.get('_id', '')),
        'title': clean_text(book.get('title', '')),
        'author': clean_text(book.get('author', '')),
        'genre': book.get('genre', ''),
        'description': clean_text(book.get('description', '')),
    }

def extract_genre_preferences(genres: List[str]) -> List[str]:
    """
    Extract and validate genre preferences
    
    Args:
        genres: List of genres
        
    Returns:
        List of valid genres
    """
    valid_genres = [
        'Fiction', 'Non-Fiction', 'Science', 'Technology',
        'Business', 'Self-Help', 'Biography', 'History', 'Other'
    ]
    
    return [g for g in genres if g in valid_genres]

def prepare_recommendation_data(books: List[Dict]):
    """
    Prepare books data for recommendation model
    
    Args:
        books: List of book dictionaries
        
    Returns:
        Formatted list of books
    """
    return [format_book_data(book) for book in books]
