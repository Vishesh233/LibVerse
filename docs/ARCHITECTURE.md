# Architecture Overview

This document describes the system architecture of the Smart Library Management System.

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Layer                             │
├─────────────────────────────────────────────────────────────────┤
│  React Frontend (Port 3000)                                     │
│  ├── Pages: Login, Dashboard, Books, MyBooks, AdminDashboard   │
│  ├── Components: Navbar, Sidebar, Cards, Modals               │
│  ├── Services: API calls with Axios                           │
│  ├── Context: AuthContext for state management                │
│  └── Styling: Tailwind CSS + Custom CSS                       │
└─────────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────────┐
│                        API Layer                                │
├─────────────────────────────────────────────────────────────────┤
│  Express.js Backend (Port 5001)                                │
│  ├── Routes:                                                   │
│  │   ├── /auth - Authentication                               │
│  │   ├── /books - Book management                             │
│  │   ├── /transactions - Issue/Return                         │
│  │   └── /admin - Admin operations                            │
│  │                                                             │
│  ├── Controllers: Business logic                              │
│  ├── Middleware: Auth, Error handling, CORS                   │
│  └── Services: External API calls (AI Service)                │
└─────────────────────────────────────────────────────────────────┘
                            ↕
        ┌───────────────────┬─────────────────┐
        ↓                   ↓                 ↓
 ┌─────────────┐    ┌──────────────┐  ┌──────────────┐
 │  MongoDB    │    │ AI Service   │  │  File        │
 │  (Port      │    │ (Port 5000)  │  │  Storage     │
 │  27017)     │    │              │  │ (QR Codes)   │
 │             │    │  Flask       │  │              │
 │ Collections:│    │  ├─ Model    │  │              │
 │ ├─ Users    │    │  ├─ Routes   │  │              │
 │ ├─ Books    │    │  └─ Utils    │  │              │
 │ ├─ Trans.   │    │              │  │              │
 │ └─ Reviews  │    │ ML-based rec │  │              │
 └─────────────┘    └──────────────┘  └──────────────┘
```

## Component Relations

### Frontend Components

```
App.jsx
├── AuthProvider (Context)
├── AuthContext (Global State)
│   ├── user
│   ├── token
│   ├── isAuthenticated
│   └── login/logout methods
│
└── Routes
    ├── Login / Signup
    ├── ProtectedRoute
    │   └── Dashboard
    │       ├── AdminDashboard (Admin)
    │       └── StudentDashboard (Student)
    ├── Books (Browse)
    ├── MyBooks (My Issued Books)
    ├── Profile
    └── Admin Pages
```

### Backend Architecture

```
server.js (Entry Point)
├── Middleware
│   ├── CORS
│   ├── Express Parser
│   └── Error Handler
│
├── Routes
│   ├── authRoutes
│   │   └── authController
│   ├── bookRoutes
│   │   └── bookController
│   ├── transactionRoutes
│   │   └── transactionController
│   └── adminRoutes
│       └── adminController
│
├── Models (MongoDB)
│   ├── User Schema
│   ├── Book Schema
│   ├── Transaction Schema
│   └── Review Schema
│
├── Utils
│   ├── fineCalculator.js
│   ├── qrGenerator.js
│   └── Authentication
│
└── Services
    └── recommendationService.js (Calls AI Service)
```

### AI Service Architecture

```
app.py (Flask Entry Point)
│
├── Routes
│   └── recommend_bp
│       ├── /recommend (POST)
│       ├── /similar/:book_id (GET)
│       ├── /train (POST)
│       └── /user-history (POST)
│
├── Model
│   └── recommender.py
│       ├── BookRecommender Class
│       ├── train(books)
│       ├── get_recommendations(user_id)
│       └── get_similar_books(book_id)
│
└── Utils
    └── preprocess.py
        ├── clean_text()
        ├── format_book_data()
        └── prepare_recommendation_data()
```

## Data Flow

### User Registration Flow

```
Frontend (Signup Form)
    ↓
axios POST /auth/signup
    ↓
Backend authController.signup()
    ↓
Validate input
    ↓
Hash password
    ↓
Create User in MongoDB
    ↓
Generate JWT token
    ↓
Send response with token
    ↓
Frontend stores token & user in localStorage
    ↓
Redirect to Dashboard
```

### Book Issue Flow

```
Frontend (Books Page)
    ↓
User clicks "Issue Book"
    ↓
axios POST /transactions/issue { bookId }
    ↓
Backend transactionController.requestIssueBook()
    ↓
Check book availability
    ↓
Create Transaction (pending approval)
    ↓
Send response
    ↓
Frontend shows "Waiting for approval"
    ↓
Admin approves in Admin Panel
    ↓
Backend approves and updates book count
    ↓
Student sees status change
```

### Recommendation Flow

```
Backend (When needed)
    ↓
Get user's transaction history
    ↓
Send to AI Service: POST /api/user-history
    ↓
AI updates user profile
    ↓
Request recommendations: POST /api/recommend
    ↓
AI returns book recommendations
    ↓
Backend formats response
    ↓
Frontend displays recommendations
```

## Database Schema

### User Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String ("student" | "admin"),
  phone: String,
  address: String,
  libraryId: String (unique),
  profileImage: String,
  isActive: Boolean,
  fineAmount: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### Book Collection
```javascript
{
  _id: ObjectId,
  title: String,
  author: String,
  genre: String,
  description: String,
  isbn: String (unique),
  publicationYear: Number,
  totalCopies: Number,
  availableCopies: Number,
  issuedCopies: Number,
  qrCode: String,
  coverImage: String,
  location: String,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Transaction Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  bookId: ObjectId (ref: Book),
  issueDate: Date,
  dueDate: Date,
  returnDate: Date,
  status: String ("issued" | "returned" | "overdue"),
  fineAmount: Number,
  finePaid: Boolean,
  isApproved: Boolean,
  approvedBy: ObjectId (ref: User),
  approvalDate: Date,
  renewalCount: Number,
  createdAt: Date,
  updatedAt: Date
}
```

## Authentication Flow

```
JWT Authentication Process
│
├── User Login
│   ├── POST /auth/login
│   ├── Verify email & password
│   ├── Generate JWT: jwt.sign({ id }, secret, { expiresIn: '30d' })
│   └── Return token to client
│
├── Token Storage
│   ├── Frontend stores token in localStorage
│   └── Attach to all requests: Authorization: Bearer <token>
│
├── Protected Route Access
│   ├── Middleware: authMiddleware.protect
│   ├── Verify token: jwt.verify(token, secret)
│   ├── Extract user ID
│   ├── Get user from DB
│   └── Attach to request: req.user
│
└── Role-Based Access
    ├── Middleware: isAdmin
    └── Middleware: isStudent
```

## Security Measures

1. **Password Hashing:** bcryptjs with salt rounds
2. **JWT Tokens:** Secure token-based authentication
3. **Role-Based Access Control (RBAC):** Student vs Admin roles
4. **Input Validation:** Express validator
5. **CORS:** Cross-origin requests restricted
6. **Environment Variables:** Sensitive data in .env files
7. **MongoDB:** Indexed fields for performance

## Performance Optimizations

1. **Database Indexing:** On email, ISBN, libraryId
2. **Pagination:** All list endpoints support pagination
3. **Select Specific Fields:** Don't return password in responses
4. **Caching:** Consider Redis for sessions
5. **Lazy Loading:** Frontend components loaded on demand
6. **API Response Compression:** Gzip compression

## Scalability Considerations

1. **Microservices:** Already separated AI service
2. **Load Balancing:** Use nginx/HAProxy for traffic distribution
3. **Database Replication:** MongoDB replica sets
4. **Caching Layer:** Redis for session & data caching
5. **CDN:** For static assets
6. **API Rate Limiting:** Implement rate limiter middleware

## Deployment Architecture

```
┌──────────────────────────────────┐
│     Client (Browser)             │
└──────────────────┬───────────────┘
                   │
┌──────────────────▼───────────────┐
│   Nginx / Load Balancer          │
└──────────────────┬───────────────┘
        ┌──────────┼──────────┐
        │          │          │
┌───────▼──┐ ┌────▼──────┐ ┌─▼──────────┐
│ React    │ │ Express   │ │ Flask AI   │
│ Frontend │ │ Backend   │ │ Service    │
│ (3000)   │ │ (5001)    │ │ (5000)     │
└────┬─────┘ └────┬──────┘ └─┬──────────┘
     │            │          │
     └────────────┼──────────┘
                  │
           ┌──────▼──────┐
           │  MongoDB    │
           │  Database   │
           └─────────────┘
```

## Monitoring & Logging

Recommended additions:
- Winston/Morgan for logging
- Sentry for error tracking
- APM tools for performance monitoring
- Prometheus/Grafana for metrics

---

This architecture supports current requirements and can be scaled for enterprise use.
