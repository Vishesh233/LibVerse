# LibVerse AI recommendation service

A small Flask service that ranks books for the student dashboard's **Picked for you** row.
The Node backend is its only client. When the service is down, slow or not configured, the backend
falls back to its MongoDB genre logic, so the dashboard always shows picks.

## How it ranks

- **Model:** word-level TF-IDF (unigrams + bigrams, English stop words removed, sublinear term
  frequency) over each book's title, author, genre and description. Title and genre count twice.
- **Content match:** for every candidate, cosine similarity to each book the student has read
  (any loan that was handed out). The best match becomes the explanation:
  **"Because you read &lt;title&gt;"**. Books in a favourite genre get a small bonus.
- **Genre match:** books in a favourite genre with no content match, ordered by how often they are
  borrowed: **"Popular in &lt;genre&gt;"**. These always rank below content matches.
- Books the student has read, has on loan, has requested or is waiting for are never returned.
- **Stateless per reader:** the service keeps only the catalogue it was last trained with.
  Everything about the student arrives with each request, so any instance can answer any
  request, and a restart only loses the catalogue (the backend retrains it on the next request).

## API

All routes except `/health` need the header `X-Service-Token: <AI_SERVICE_TOKEN>`.
They return 503 while `AI_SERVICE_TOKEN` is not set and 401 for a wrong token.

| Method | Path | Body | Response |
|---|---|---|---|
| GET | `/health` | – | `{ status, service, trainedBooks }` |
| POST | `/api/train` | `{ books: [{ id, title, author, genre, description, popularity? }] }` | `{ success, trained }` |
| POST | `/api/recommend` | `{ readIds, favouriteGenres, excludeIds, limit (1–50, default 6) }` | `{ success, recommendations: [{ id, score, reason, basis: "content" \| "genre" }] }`, or 409 before the first training |

## When the backend trains it

- on server start, once MongoDB is connected
- after a book is created, edited or deleted (debounced: several edits collapse into one run;
  `AI_RETRAIN_DEBOUNCE_MS`, default 5000)
- when `/api/recommend` answers 409 (the service restarted and lost its catalogue)

`GET /api/books/recommendations` waits at most **1.5 s** for the service. Every book in the
response has `recommendationReason` and `recommendationSource` (`ai` or `fallback`), and the
response has a top-level `source`. The dashboard shows the reason under each card and an **AI**
badge on picks that came from the service.

## Running both services locally

1. Pick a long random token, for example `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.
2. `ai-service/.env` (copy `.env.example`): `AI_SERVICE_TOKEN=<token>`, `PORT=5000`, `HOST=127.0.0.1`, `DEBUG=False`.
3. `backend/.env`: `AI_SERVICE_URL=http://127.0.0.1:5000` and the **same** `AI_SERVICE_TOKEN=<token>`.
4. Start the AI service:
   ```bash
   cd ai-service
   python -m venv venv
   venv\Scripts\activate          # macOS/Linux: source venv/bin/activate
   pip install -r requirements.txt
   python app.py
   ```
5. Start the backend (`cd backend && npm run dev`). It logs `AI recommendations: service available`
   after its first successful training, or `using the MongoDB fallback (...)` when it can't reach the service.

Leave `AI_SERVICE_URL` or `AI_SERVICE_TOKEN` empty to run without the service: everything works,
and **Picked for you** uses the genre fallback.

## Tests

```bash
cd ai-service
pip install -r requirements-dev.txt
python -m pytest
```

`tests/test_recommender.py` covers ranking and explanations; `tests/test_api.py` covers the HTTP
contract (token, validation, the 409 before training).
