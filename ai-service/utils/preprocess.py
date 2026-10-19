"""
Text preparation for the recommender
"""

import re

# Field weights: the title and genre say most about a book, so they count twice
TEXT_FIELDS = (('title', 2), ('author', 1), ('genre', 2), ('description', 1))


def clean_text(text):
    """Lower-case, keep letters/digits (including accented letters) and collapse whitespace"""
    if not text:
        return ''
    text = str(text).lower()
    text = re.sub(r'[^\w\s]|_', ' ', text)
    return re.sub(r'\s+', ' ', text).strip()


def book_document(book):
    """The text TF-IDF sees for one book: title, author, genre and description"""
    parts = []
    for field, weight in TEXT_FIELDS:
        value = clean_text(book.get(field))
        if value:
            parts.extend([value] * weight)
    return ' '.join(parts)
