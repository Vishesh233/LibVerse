# Smart Library Management System

A comprehensive full-stack web application for managing a library with AI-powered recommendations.

## Features

✅ **Authentication System**
- User signup/login with JWT authentication
- Role-based access (Student & Admin)

✅ **User Features**
- Browse and search books (by title, author, genre)
- Issue and return books
- View issued books and due dates
- Auto-calculated fines for overdue books
- Book renewals
- Rate and review books

✅ **Admin Features**
- Manage books (add, update, delete)
- Manage users
- Approve/reject book issue requests
- Analytics dashboard (most issued books, active users, total fines)
- View pending requests

✅ **Book Management**
- QR code generation for books
- Book availability tracking
- Genre classification

✅ **Fine System**
- Auto-calculated based on overdue days
- Configurable fine rate (₹10/day default)

✅ **AI Recommendation**
- TF-IDF based recommendations
- Cosine similarity matching
- Genre preference learning

✅ **Modern UI**
- Responsive design with Tailwind CSS
- Dark mode support
- Sidebar navigation
- User-friendly dashboard

## Tech Stack

**Frontend:** React 18, React Router, Axios, Tailwind CSS
**Backend:** Node.js, Express, MongoDB, JWT, QRCode
**AI Service:** Python, Flask, scikit-learn, numpy
**Database:** MongoDB (Local or Cloud)

## Project Structure

```
smart-library-system/
├── frontend/                  # React application
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   ├── pages/            # Page components
│   │   ├── layouts/          # Layout wrappers
│   │   ├── services/         # API service calls
│   │   ├── context/          # Global state (Auth)
│   │   ├── hooks/            # Custom hooks
│   │   ├── utils/            # Helper functions
│   │   └── styles/           # CSS/Tailwind
│   ├── package.json
│   └── .env
│
├── backend/                   # Node.js/Express API
│   ├── config/               # Database configuration
│   ├── models/               # MongoDB schemas
│   ├── controllers/          # Business logic
│   ├── routes/               # API routes
│   ├── middleware/           # Auth & error handling
│   ├── services/             # External services
│   ├── utils/                # Helper functions
│   ├── server.js             # Entry point
│   ├── package.json
│   └── .env
│
├── ai-service/               # Python Flask API
│   ├── model/                # Recommendation engine
│   ├── routes/               # API endpoints
│   ├── utils/                # Preprocessing
│   ├── app.py                # Flask entry point
│   ├── requirements.txt
│   └── .env
│
└── docs/                     # Documentation
```

## Setup Instructions

### Prerequisites

- Node.js v16+
- Python 3.8+
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### 1. Clone Repository

```bash
cd smart-library-system
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file (already provided)
# Update MONGODB_URI if using cloud database

# Start backend server
npm dev
# Server runs on http://localhost:5001
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
# App runs on http://localhost:3000
```

### 4. AI Service Setup

```bash
cd ai-service

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows
venv\Scripts\activate
# Mac/Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start Flask server
python app.py
# Service runs on http://localhost:5000
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Books
- `GET /api/books` - Get all books (with filters)
- `GET /api/books/:id` - Get single book
- `POST /api/books` - Create book (Admin)
- `PUT /api/books/:id` - Update book (Admin)
- `DELETE /api/books/:id` - Delete book (Admin)
- `POST /api/books/:id/review` - Add review

### Transactions
- `POST /api/transactions/issue` - Request issue book (Student)
- `PUT /api/transactions/:id/return` - Return book
- `PUT /api/transactions/:id/renew` - Renew book
- `GET /api/transactions/user/me` - Get user's books
- `GET /api/transactions` - Get all transactions (Admin)
- `PUT /api/transactions/:id/approve` - Approve request (Admin)

### Admin
- `GET /api/admin/dashboard` - Dashboard analytics
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/pending-requests` - Pending issue requests

### AI Service
- `POST /api/recommend` - Get recommendations
- `GET /api/similar/<bookId>` - Get similar books
- `POST /api/train` - Train model
- `POST /api/user-history` - Add user history

## Demo Credentials

**Student Account:**
- Email: student@example.com
- Password: password123

**Admin Account:**
- Email: admin@example.com
- Password: admin123

## Sample Data

Before running the application, add sample books:

```javascript
// Add via MongoDB or POST request to /api/books

{
  title: "The Great Gatsby",
  author: "F. Scott Fitzgerald",
  genre: "Fiction",
  isbn: "978-0743273565",
  totalCopies: 5,
  description: "A classic American novel"
}
```

## Key Features Explained

### Fine Calculation
- Fines calculated automatically based on overdue days
- Formula: `daysOverdue × dailyFineRate (₹10)`
- Deducted from user account automatically on return

### QR Codes
- Auto-generated for each book during creation
- Can be scanned for quick issue/return
- Encoded with book ID and title

### Recommendations
- Based on user reading history and genre preferences
- Uses TF-IDF vectorization + Cosine Similarity
- Trained on all available books

### Role-Based Access
- **Student:** Can issue/return books, view recommendations
- **Admin:** Can manage books, users, approve requests, view analytics

## Best Practices Implemented

✅ Clean code with comments
✅ Modular file structure
✅ JWT authentication
✅ Input validation
✅ Error handling
✅ Responsive UI
✅ Environment variables for config
✅ RESTful API design
✅ Async/await for async operations

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running locally or update connection string in `.env`
- Check if MongoDB server is started: `mongod`

### Backend not running
- Ensure port 5001 is not in use
- Check `.env` file is in backend folder
- Verify Node.js is installed

### Frontend not connecting to backend
- Ensure backend is running on port 5001
- Check `REACT_APP_API_URL` in frontend `.env`
- Check browser console for CORS errors

### AI Service not responding
- Ensure Python virtual environment is activated
- Check all requirements are installed: `pip list`
- Verify Flask is running on port 5000

## Future Enhancements

- 🔊 Voice search using Web Speech API
- 📊 Advanced analytics and charts
- 📧 Email notifications for due dates
- 🔐 Two-factor authentication
- 📱 Mobile app
- 🌐 Multi-language support
- 🏗️ Microservices architecture

## Contributing

Feel free to fork and submit pull requests

## License

MIT License

## Support

For issues or questions, please check the documentation or create an issue in the repository.

---

**Happy Reading!** 📚
