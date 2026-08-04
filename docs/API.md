# API Documentation

Complete REST API reference for Smart Library Management System

## Base URLs

- **Backend:** `http://localhost:5001/api`
- **AI Service:** `http://localhost:5000/api`

## Authentication

All protected endpoints require JWT token in header:
```
Authorization: Bearer <token>
```

---

## Auth Endpoints

### Signup
```http
POST /auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "student",
  "phone": "1234567890",
  "address": "123 Street Name"
}

Response:
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student"
  }
}
```

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student",
    "libraryId": "LIB-1234567890",
    "fineAmount": 50
  }
}
```

### Get Current User
```http
GET /auth/me
Authorization: Bearer <token>

Response:
{
  "success": true,
  "user": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student",
    "libraryId": "LIB-1234567890",
    "fineAmount": 50
  }
}
```

---

## Book Endpoints

### Get All Books
```http
GET /books?title=Harry&author=Rowling&genre=Fiction&page=1&limit=10

Response:
{
  "success": true,
  "count": 2,
  "total": 25,
  "pages": 3,
  "books": [
    {
      "_id": "book_id",
      "title": "Harry Potter and the Sorcerer's Stone",
      "author": "J.K. Rowling",
      "genre": "Fiction",
      "isbn": "978-0439708180",
      "totalCopies": 5,
      "availableCopies": 3,
      "issuedCopies": 2,
      "qrCode": "data:image/png;base64,...",
      "description": "Book description"
    }
  ]
}
```

### Get Single Book
```http
GET /books/:id

Response:
{
  "success": true,
  "book": {
    "_id": "book_id",
    "title": "Harry Potter",
    "author": "J.K. Rowling",
    "genre": "Fiction",
    "totalCopies": 5,
    "availableCopies": 3
  },
  "reviews": [
    {
      "_id": "review_id",
      "rating": 5,
      "comment": "Amazing book!",
      "userId": {
        "_id": "user_id",
        "name": "John Doe",
        "email": "john@example.com"
      }
    }
  ]
}
```

### Create Book (Admin Only)
```http
POST /books
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "title": "New Book",
  "author": "Author Name",
  "genre": "Fiction",
  "isbn": "978-0123456789",
  "totalCopies": 10,
  "description": "Book description",
  "publicationYear": 2023,
  "location": "Shelf A1"
}

Response:
{
  "success": true,
  "message": "Book created successfully",
  "book": { ... }
}
```

### Update Book (Admin Only)
```http
PUT /books/:id
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "totalCopies": 15,
  "location": "Shelf B2"
}
```

### Delete Book (Admin Only)
```http
DELETE /books/:id
Authorization: Bearer <admin_token>

Response:
{
  "success": true,
  "message": "Book deleted successfully"
}
```

### Add Review
```http
POST /books/:id/review
Authorization: Bearer <token>
Content-Type: application/json

{
  "rating": 5,
  "comment": "Excellent book!"
}
```

---

## Transaction Endpoints

### Issue Book Request
```http
POST /transactions/issue
Authorization: Bearer <token>
Content-Type: application/json

{
  "bookId": "book_id"
}

Response:
{
  "success": true,
  "message": "Book issue request created",
  "transaction": {
    "_id": "transaction_id",
    "status": "issued",
    "issueDate": "2024-01-15",
    "dueDate": "2024-01-29",
    "fineAmount": 0
  }
}
```

### Return Book
```http
PUT /transactions/:id/return
Authorization: Bearer <token>

Response:
{
  "success": true,
  "message": "Book returned successfully",
  "transaction": { ... },
  "fine": "₹50"
}
```

### Renew Book
```http
PUT /transactions/:id/renew
Authorization: Bearer <token>

Response:
{
  "success": true,
  "message": "Book renewed successfully",
  "newDueDate": "2024-02-05",
  "transaction": { ... }
}
```

### Get User's Books
```http
GET /transactions/user/me
Authorization: Bearer <token>

Response:
{
  "success": true,
  "count": 3,
  "transactions": [
    {
      "_id": "transaction_id",
      "bookId": { "title": "...", "author": "..." },
      "status": "issued",
      "issueDate": "2024-01-15",
      "dueDate": "2024-01-29",
      "fine": 0,
      "daysRemaining": 14
    }
  ]
}
```

### Get All Transactions (Admin)
```http
GET /transactions?status=issued&page=1&limit=10
Authorization: Bearer <admin_token>

Response:
{
  "success": true,
  "count": 25,
  "total": 156,
  "pages": 7,
  "transactions": [ ... ]
}
```

### Approve Issue Request (Admin)
```http
PUT /transactions/:id/approve
Authorization: Bearer <admin_token>

Response:
{
  "success": true,
  "message": "Issue request approved",
  "transaction": { ... }
}
```

---

## Admin Endpoints

### Dashboard Analytics
```http
GET /admin/dashboard
Authorization: Bearer <admin_token>

Response:
{
  "success": true,
  "analytics": {
    "totalUsers": 150,
    "totalBooks": 500,
    "issuedBooks": 120,
    "overdueBooks": 15,
    "totalFines": 2500,
    "activeUsers": 45,
    "mostIssuedBooks": [
      {
        "_id": "book_id",
        "book": [{ "title": "...", "author": "..." }],
        "count": 25
      }
    ]
  }
}
```

### Get All Users (Admin)
```http
GET /admin/users?page=1&limit=10
Authorization: Bearer <admin_token>

Response:
{
  "success": true,
  "count": 10,
  "total": 150,
  "pages": 15,
  "users": [ ... ]
}
```

### Update User (Admin)
```http
PUT /admin/users/:id
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "isActive": true,
  "fineAmount": 0
}
```

### Delete User (Admin)
```http
DELETE /admin/users/:id
Authorization: Bearer <admin_token>

Response:
{
  "success": true,
  "message": "User deactivated successfully"
}
```

### Get Pending Requests (Admin)
```http
GET /admin/pending-requests
Authorization: Bearer <admin_token>

Response:
{
  "success": true,
  "count": 5,
  "requests": [
    {
      "_id": "transaction_id",
      "userId": { "name": "...", "email": "...", "libraryId": "..." },
      "bookId": { "title": "...", "author": "..." },
      "isApproved": false,
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ]
}
```

---

## AI Service Endpoints

### Get Recommendations
```http
POST /api/recommend
Content-Type: application/json

{
  "user_id": "user_id",
  "limit": 5
}

Response:
{
  "success": true,
  "user_id": "user_id",
  "recommendations": [
    {
      "_id": "book_id",
      "title": "Recommended Book",
      "author": "Author Name",
      "genre": "Fiction",
      "reason": "Based on your reading history"
    }
  ]
}
```

### Get Similar Books
```http
GET /api/similar/:book_id?limit=5

Response:
{
  "success": true,
  "book_id": "book_id",
  "similar_books": [
    {
      "_id": "book_id",
      "title": "Similar Book",
      "author": "Author Name",
      "genre": "Fiction"
    }
  ]
}
```

### Train Model
```http
POST /api/train
Content-Type: application/json

{
  "books": [
    {
      "_id": "book_id",
      "title": "Book Title",
      "author": "Author",
      "genre": "Fiction",
      "description": "..."
    }
  ]
}

Response:
{
  "success": true,
  "message": "Model trained with 500 books"
}
```

### Add User History
```http
POST /api/user-history
Content-Type: application/json

{
  "user_id": "user_id",
  "book_ids": ["book_id1", "book_id2"],
  "genres": ["Fiction", "Mystery"]
}

Response:
{
  "success": true,
  "message": "User history updated"
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation error message"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Not authorized to access this route"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "User is not authorized to access this route"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### 500 Server Error
```json
{
  "success": false,
  "message": "Server error message"
}
```

---

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Server Error

---

## Rate Limiting

Currently no rate limiting implemented. Consider adding for production.

---

## Pagination

All list endpoints support pagination:
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)

Example: `/books?page=2&limit=20`
