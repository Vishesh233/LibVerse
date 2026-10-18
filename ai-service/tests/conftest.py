import os
import sys

import pytest

# Tests import app / model / routes the same way app.py does (from the ai-service folder)
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

TOKEN = 'test-service-token'

CATALOGUE = [
    {'id': 'py1', 'title': 'Learning Python', 'author': 'Mark Lutz', 'genre': 'Technology',
     'description': 'A thorough introduction to Python programming: data types, functions, modules and classes.', 'popularity': 3},
    {'id': 'py2', 'title': 'Fluent Python', 'author': 'Luciano Ramalho', 'genre': 'Technology',
     'description': 'Idiomatic Python programming for experienced developers: data model, generators and concurrency.', 'popularity': 9},
    {'id': 'ml1', 'title': 'Hands-On Machine Learning', 'author': 'Aurelien Geron', 'genre': 'Technology',
     'description': 'Practical machine learning with Python, neural networks and deep learning frameworks.', 'popularity': 7},
    {'id': 'his1', 'title': 'The Silk Roads', 'author': 'Peter Frankopan', 'genre': 'History',
     'description': 'A new history of the world told through the trade routes that linked east and west.', 'popularity': 5},
    {'id': 'his2', 'title': 'Sapiens', 'author': 'Yuval Noah Harari', 'genre': 'History',
     'description': 'A brief history of humankind from the stone age to the modern world.', 'popularity': 10},
    {'id': 'his3', 'title': 'The Guns of August', 'author': 'Barbara Tuchman', 'genre': 'History',
     'description': 'The opening month of the First World War and the decisions that led to it.', 'popularity': 2},
    {'id': 'fic1', 'title': 'The Hobbit', 'author': 'J. R. R. Tolkien', 'genre': 'Fiction',
     'description': 'A reluctant hobbit joins a company of dwarves on a quest to reclaim their mountain home from a dragon.', 'popularity': 8},
    {'id': 'fic2', 'title': 'The Fellowship of the Ring', 'author': 'J. R. R. Tolkien', 'genre': 'Fiction',
     'description': 'A hobbit inherits a dangerous ring and sets out on a quest to destroy it.', 'popularity': 6},
]


@pytest.fixture()
def recommender():
    from model.recommender import BookRecommender
    r = BookRecommender()
    r.train(CATALOGUE)
    return r


@pytest.fixture()
def client(monkeypatch):
    monkeypatch.setenv('AI_SERVICE_TOKEN', TOKEN)
    from app import create_app
    from model import recommender as module
    # A fresh, untrained recommender per test
    monkeypatch.setattr(module, 'recommender', module.BookRecommender())
    import routes.recommend as routes
    monkeypatch.setattr(routes, 'recommender', module.recommender)
    app = create_app()
    app.config['TESTING'] = True
    return app.test_client()
