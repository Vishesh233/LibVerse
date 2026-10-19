import pytest

from model.recommender import BookRecommender, NotTrainedError
from utils.preprocess import book_document, clean_text

from conftest import CATALOGUE


def ids(items):
    return [item['id'] for item in items]


def test_untrained_raises():
    with pytest.raises(NotTrainedError):
        BookRecommender().recommend(['py1'])


def test_reading_a_python_book_ranks_python_books_first(recommender):
    items = recommender.recommend(read_ids=['py1'], limit=3)
    assert ids(items)[0] == 'py2'
    assert set(ids(items[:2])) == {'py2', 'ml1'}
    assert all(item['basis'] == 'content' for item in items[:2])
    assert items[0]['reason'] == 'Because you read Learning Python'


def test_explanation_names_the_closest_read_book(recommender):
    items = recommender.recommend(read_ids=['py1', 'fic1'], limit=5)
    by_id = {item['id']: item for item in items}
    assert by_id['fic2']['reason'] == 'Because you read The Hobbit'
    assert by_id['py2']['reason'] == 'Because you read Learning Python'


def test_read_and_excluded_books_are_never_recommended(recommender):
    items = recommender.recommend(read_ids=['py1'], favourite_genres=['Technology', 'History'],
                                  exclude_ids=['py2', 'his2'], limit=20)
    returned = set(ids(items))
    assert not returned & {'py1', 'py2', 'his2'}


def test_favourite_genres_without_history_explain_by_popularity(recommender):
    items = recommender.recommend(favourite_genres=['History'], limit=5)
    assert ids(items) == ['his2', 'his1', 'his3']  # by popularity
    assert all(item['reason'] == 'Popular in History' and item['basis'] == 'genre' for item in items)


def test_genre_matching_is_case_insensitive(recommender):
    assert ids(recommender.recommend(favourite_genres=['history'], limit=1)) == ['his2']


def test_content_matches_outrank_genre_only_matches(recommender):
    items = recommender.recommend(read_ids=['fic1'], favourite_genres=['History'], limit=10)
    bases = [item['basis'] for item in items]
    assert bases.index('genre') > bases.index('content')
    assert bases == sorted(bases, key=lambda b: b != 'content')
    assert items[0]['id'] == 'fic2'


def test_favourite_genre_boosts_a_content_match(recommender):
    plain = {i['id']: i['score'] for i in recommender.recommend(read_ids=['py1'], limit=10)}
    boosted = {i['id']: i['score'] for i in recommender.recommend(read_ids=['py1'], favourite_genres=['Technology'], limit=10)}
    assert boosted['py2'] > plain['py2']


def test_limit_and_unknown_ids(recommender):
    assert len(recommender.recommend(read_ids=['py1'], favourite_genres=['History'], limit=2)) == 2
    # Ids the model doesn't know are ignored, not errors
    assert recommender.recommend(read_ids=['nope'], exclude_ids=['also-nope'], limit=3) == []


def test_no_signal_returns_nothing(recommender):
    assert recommender.recommend(limit=5) == []


def test_word_level_bigrams_and_stop_words():
    r = BookRecommender()
    r.train(CATALOGUE)
    vocabulary = r._model.vectorizer.vocabulary_
    assert 'machine learning' in vocabulary  # bigram
    assert 'python' in vocabulary  # unigram
    assert 'the' not in vocabulary and 'and' not in vocabulary  # English stop words
    assert not any(len(term) < 2 for term in vocabulary)  # words, not characters


def test_retraining_replaces_the_catalogue(recommender):
    recommender.train([{'id': 'x', 'title': 'Only Book', 'genre': 'History'}])
    assert recommender.size == 1
    assert ids(recommender.recommend(favourite_genres=['History'])) == ['x']


def test_empty_text_still_works_by_genre():
    r = BookRecommender()
    r.train([{'id': 'a', 'genre': 'History'}, {'id': 'b', 'genre': 'History', 'popularity': 4}])
    assert ids(r.recommend(read_ids=['a'], favourite_genres=['History'])) == ['b']


def test_preprocessing():
    assert clean_text('  Hello,   World! C++ ') == 'hello world c'
    assert clean_text(None) == ''
    doc = book_document({'title': 'Dune', 'author': 'Frank Herbert', 'genre': 'Fiction', 'description': 'Desert planet.'})
    assert doc.count('dune') == 2 and doc.count('fiction') == 2 and doc.count('herbert') == 1
