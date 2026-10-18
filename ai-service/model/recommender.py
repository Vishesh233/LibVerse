"""
Content-based book recommender: word-level TF-IDF (unigrams + bigrams, English stop words)
over each book's title, author, genre and description, ranked by cosine similarity.

The service keeps only the catalogue it was trained with. Everything about a reader
(what they read, their favourite genres, what to leave out) arrives with each request,
so the service holds no per-user state and any instance can answer any request.
"""

import threading

import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer

from utils.preprocess import book_document

# A read book has to share at least this much (cosine similarity) with a candidate to be its reason
MIN_CONTENT_SIMILARITY = 0.05
# Bonus for a candidate in one of the reader's favourite genres (cosine scores are 0..1)
FAVOURITE_GENRE_BONUS = 0.15
# Popularity only orders books inside the genre-based results (never outranks a content match)
POPULARITY_WEIGHT = 0.05


class NotTrainedError(RuntimeError):
    """Raised when recommendations are asked for before /api/train was called"""


class _Model:
    """One trained catalogue (immutable once built, so it can be swapped atomically)"""

    def __init__(self, books):
        self.ids = [str(b['id']) for b in books]
        self.titles = [str(b.get('title') or '').strip() for b in books]
        self.genres = [str(b.get('genre') or '').strip() for b in books]
        self.index = {book_id: i for i, book_id in enumerate(self.ids)}

        popularity = np.array([float(b.get('popularity') or 0) for b in books], dtype=float)
        top = popularity.max() if len(popularity) else 0
        self.popularity = popularity / top if top > 0 else popularity

        self.vectorizer = TfidfVectorizer(
            analyzer='word',
            ngram_range=(1, 2),
            stop_words='english',
            sublinear_tf=True,
        )
        documents = [book_document(b) for b in books]
        try:
            # Rows are L2-normalised, so a dot product is the cosine similarity
            self.matrix = self.vectorizer.fit_transform(documents)
        except ValueError:
            # Every document empty after stop words: no content signal, genres still work
            self.matrix = None


class BookRecommender:
    def __init__(self):
        self._model = None
        self._lock = threading.Lock()

    @property
    def size(self):
        model = self._model
        return len(model.ids) if model else 0

    def train(self, books):
        """Replace the catalogue. books: [{id, title, author, genre, description, popularity?}]"""
        model = _Model(books)
        with self._lock:
            self._model = model
        return len(model.ids)

    def recommend(self, read_ids=(), favourite_genres=(), exclude_ids=(), limit=6):
        """
        Rank catalogue books for one reader.

        Returns [{id, score, reason, basis}] best first, where basis is "content" (similar to a
        book they read: "Because you read <title>") or "genre" ("Popular in <genre>").
        """
        model = self._model
        if model is None:
            raise NotTrainedError('The recommender has not been trained yet')

        read = [model.index[i] for i in dict.fromkeys(str(x) for x in read_ids) if i in model.index]
        skip = set(read) | {model.index[str(x)] for x in exclude_ids if str(x) in model.index}
        favourites = {g.strip().lower() for g in favourite_genres if isinstance(g, str) and g.strip()}

        n = len(model.ids)
        content = np.zeros(n)
        because = np.full(n, -1)
        if read and model.matrix is not None:
            sims = (model.matrix @ model.matrix[read].T).toarray()  # n x len(read)
            best = sims.argmax(axis=1)
            content = sims[np.arange(n), best]
            because = np.array([read[j] for j in best])

        results = []
        for i in range(n):
            if i in skip:
                continue
            genre = model.genres[i]
            in_favourite = genre.lower() in favourites
            if content[i] >= MIN_CONTENT_SIMILARITY:
                score = content[i] + (FAVOURITE_GENRE_BONUS if in_favourite else 0)
                reason = f'Because you read {model.titles[because[i]]}'
                basis = 'content'
            elif in_favourite:
                # Below every content match, ordered by how often the book is borrowed
                score = POPULARITY_WEIGHT * model.popularity[i]
                reason = f'Popular in {genre}' if genre else 'Popular with readers'
                basis = 'genre'
            else:
                continue
            results.append((score, -model.popularity[i], model.titles[i].lower(), i, reason, basis))

        results.sort(key=lambda r: (-r[0], r[1], r[2]))
        return [
            {'id': model.ids[i], 'score': round(float(score), 4), 'reason': reason, 'basis': basis}
            for score, _, _, i, reason, basis in results[:limit]
        ]


# One recommender per process
recommender = BookRecommender()
