# Sample Data

Sample data to populate the Smart Library Management System database.

## Sample Users

```javascript
// Student Users
[
  {
    name: "Alice Johnson",
    email: "alice@example.com",
    password: "password123",  // hashed in DB
    role: "student",
    phone: "9876543210",
    address: "123 Main St, City",
    libraryId: "LIB-1001"
  },
  {
    name: "Bob Smith",
    email: "bob@example.com",
    password: "password123",
    role: "student",
    phone: "9876543211",
    address: "456 Oak Ave, City",
    libraryId: "LIB-1002"
  },
  {
    name: "Carol White",
    email: "carol@example.com",
    password: "password123",
    role: "student",
    phone: "9876543212",
    address: "789 Pine Rd, City",
    libraryId: "LIB-1003"
  }
]

// Admin User
{
  name: "Admin User",
  email: "admin@example.com",
  password: "admin123",
  role: "admin",
  phone: "9876543299",
  address: "Admin Office",
  libraryId: "ADM-0001"
}
```

## Sample Books

```javascript
[
  {
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    genre: "Fiction",
    isbn: "978-0743273565",
    totalCopies: 5,
    availableCopies: 3,
    issuedCopies: 2,
    description: "A classic American novel of the Jazz Age",
    publicationYear: 1925,
    location: "Shelf A1"
  },
  {
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    genre: "Fiction",
    isbn: "978-0061120084",
    totalCopies: 4,
    availableCopies: 2,
    issuedCopies: 2,
    description: "A gripping tale of racial injustice and childhood innocence",
    publicationYear: 1960,
    location: "Shelf A2"
  },
  {
    title: "1984",
    author: "George Orwell",
    genre: "Fiction",
    isbn: "978-0451524935",
    totalCopies: 6,
    availableCopies: 4,
    issuedCopies: 2,
    description: "A dystopian novel of totalitarianism",
    publicationYear: 1949,
    location: "Shelf A3"
  },
  {
    title: "Sapiens",
    author: "Yuval Noah Harari",
    genre: "Non-Fiction",
    isbn: "978-0062316097",
    totalCopies: 3,
    availableCopies: 1,
    issuedCopies: 2,
    description: "A brief history of humankind",
    publicationYear: 2011,
    location: "Shelf B1"
  },
  {
    title: "A Brief History of Time",
    author: "Stephen Hawking",
    genre: "Science",
    isbn: "978-0553380163",
    totalCopies: 4,
    availableCopies: 3,
    issuedCopies: 1,
    description: "From the Big Bang to Black Holes",
    publicationYear: 1988,
    location: "Shelf C1"
  },
  {
    title: "The Innovators",
    author: "Walter Isaacson",
    genre: "Technology",
    isbn: "978-1476708690",
    totalCopies: 5,
    availableCopies: 4,
    issuedCopies: 1,
    description: "How a group of hackers, geniuses, and geeks created the digital revolution",
    publicationYear: 2014,
    location: "Shelf D1"
  },
  {
    title: "Good to Great",
    author: "Jim Collins",
    genre: "Business",
    isbn: "978-0066620992",
    totalCopies: 3,
    availableCopies: 2,
    issuedCopies: 1,
    description: "Why some companies make the leap and others don't",
    publicationYear: 2001,
    location: "Shelf E1"
  },
  {
    title: "Atomic Habits",
    author: "James Clear",
    genre: "Self-Help",
    isbn: "978-0735211292",
    totalCopies: 7,
    availableCopies: 5,
    issuedCopies: 2,
    description: "Tiny changes, remarkable results",
    publicationYear: 2018,
    location: "Shelf E2"
  },
  {
    title: "Steve Jobs",
    author: "Walter Isaacson",
    genre: "Biography",
    isbn: "978-1451648539",
    totalCopies: 4,
    availableCopies: 2,
    issuedCopies: 2,
    description: "A biography of Steve Jobs",
    publicationYear: 2011,
    location: "Shelf F1"
  },
  {
    title: "The Art of War",
    author: "Sun Tzu",
    genre: "History",
    isbn: "978-0486427287",
    totalCopies: 5,
    availableCopies: 4,
    issuedCopies: 1,
    description: "Ancient Chinese military treatise",
    publicationYear: 1910,
    location: "Shelf G1"
  }
]
```

## MongoDB Insert Commands

```javascript
// Insert sample users
db.users.insertMany([
  {
    name: "Alice Johnson",
    email: "alice@example.com",
    password: "$2a$10$...",  // bcrypt hashed
    role: "student",
    phone: "9876543210",
    address: "123 Main St",
    libraryId: "LIB-1001",
    fineAmount: 0,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
  // ... more users
])

// Insert sample books
db.books.insertMany([
  {
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    genre: "Fiction",
    isbn: "978-0743273565",
    totalCopies: 5,
    availableCopies: 3,
    issuedCopies: 2,
    description: "A classic American novel",
    publicationYear: 1925,
    location: "Shelf A1",
    qrCode: "data:image/png;base64,...",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
  // ... more books
])
```

## API Commands to Add Sample Data

```bash
# 1. Signup/Login to get token
POST http://localhost:5001/api/auth/login
{
  "email": "admin@example.com",
  "password": "admin123"
}
# Save returned token

# 2. Add books (using admin token)
POST http://localhost:5001/api/books
Authorization: Bearer <admin_token>
Content-Type: application/json
{
  "title": "The Great Gatsby",
  "author": "F. Scott Fitzgerald",
  "genre": "Fiction",
  "isbn": "978-0743273565",
  "totalCopies": 5,
  "description": "A classic American novel"
}

# 3. Issue a book (as student)
POST http://localhost:5001/api/transactions/issue
Authorization: Bearer <student_token>
{
  "bookId": "<book_id_from_insert>"
}

# 4. Approve request (as admin)
PUT http://localhost:5001/api/transactions/<transaction_id>/approve
Authorization: Bearer <admin_token>

# 5. Train AI model (optional)
POST http://localhost:5000/api/train
{
  "books": [<all_books>]
}
```

## Sample Fine Calculations

| Issue Date | Due Date | Return Date | Days Overdue | Fine Rate | Total Fine |
|-----------|----------|-------------|--------------|-----------|-----------|
| Jan 15 | Jan 29 | Jan 29 | 0 | ₹10/day | ₹0 |
| Jan 15 | Jan 29 | Feb 2 | 4 | ₹10/day | ₹40 |
| Jan 15 | Jan 29 | Feb 5 | 7 | ₹10/day | ₹70 |

## Sample Analytics Data

```javascript
{
  totalUsers: 150,
  totalBooks: 500,
  issuedBooks: 120,
  overdueBooks: 15,
  totalFines: 2500,
  activeUsers: 45,
  
  mostIssuedBooks: [
    { title: "The Great Gatsby", count: 25 },
    { title: "1984", count: 22 },
    { title: "To Kill a Mockingbird", count: 20 },
    { title: "Sapiens", count: 18 },
    { title: "Atomic Habits", count: 15 }
  ]
}
```

## Bulk Insert Script (Node.js)

```javascript
// db-seed.js
const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./backend/models/User');
const Book = require('./backend/models/Book');

const sampleUsers = [
  // ... user data
];

const sampleBooks = [
  // ... book data
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Clear existing data
    await User.deleteMany({});
    await Book.deleteMany({});
    
    // Insert sample data
    await User.insertMany(sampleUsers);
    await Book.insertMany(sampleBooks);
    
    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
```

Run with: `node db-seed.js`

---

Use this sample data to test the application during development.
