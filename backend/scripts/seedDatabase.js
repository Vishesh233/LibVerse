const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Book = require('../models/Book');
const Transaction = require('../models/Transaction');
const Notification = require('../models/Notification');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/libraryDB';

const seedData = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing collections
    await User.deleteMany({});
    await Book.deleteMany({});
    await Transaction.deleteMany({});
    await Notification.deleteMany({});
    console.log('Cleared existing database entries.');

    const hashedPassword = await bcrypt.hash('password123', 10);
    const adminHashedPassword = await bcrypt.hash('admin123', 10);

    // 1. Create Users
    const usersData = [
      {
        name: 'ghr Admin',
        email: 'superadmin@gmail.com',
        password: adminHashedPassword,
        role: 'admin',
        isSuperAdmin: true,
        phone: '9876543299',
        address: 'Central Admin Office, Block A',
        libraryId: 'ADM-0001',
        isActive: true,
        createdAt: new Date('2023-01-01'),
      },
      {
        name: 'Alice Johnson',
        email: 'admin@gmail.com',
        password: adminHashedPassword,
        role: 'librarian',
        isSuperAdmin: false,
        phone: '9876543298',
        address: 'Main Library Desk',
        libraryId: 'LIB-0001',
        isActive: true,
        createdAt: new Date('2023-05-10'),
      },
      {
        name: 'John Doe',
        email: 'john.doe@example.com',
        password: hashedPassword,
        role: 'student',
        phone: '9876543210',
        address: '123 Main St, Tech City',
        libraryId: 'LIB-1001',
        fineAmount: 0,
        isActive: true,
        createdAt: new Date('2024-01-15'),
      },
      {
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        password: hashedPassword,
        role: 'student',
        phone: '9876543211',
        address: '456 Oak Ave, Cyber Park',
        libraryId: 'LIB-1002',
        fineAmount: 0,
        isActive: true,
        createdAt: new Date('2024-02-20'),
      },
      {
        name: 'Bob Wilson',
        email: 'bob.w@example.com',
        password: hashedPassword,
        role: 'student',
        phone: '9876543212',
        address: '789 Pine Rd, Innovation Hub',
        libraryId: 'LIB-1003',
        fineAmount: 0,
        isActive: true,
        createdAt: new Date('2024-03-01'),
      },
      {
        name: 'Emma Davis',
        email: 'emma.d@example.com',
        password: hashedPassword,
        role: 'student',
        phone: '9811223344',
        address: 'Hostel 4, Block B, Campus',
        libraryId: 'LIB-1004',
        fineAmount: 0,
        isActive: false,
        createdAt: new Date('2023-11-12'),
      },
      {
        name: 'Arjun Mehta',
        email: 'arjun@example.com',
        password: hashedPassword,
        role: 'student',
        phone: '9822334455',
        address: 'Hostel 2, Room 304, Campus',
        libraryId: 'LIB-1005',
        fineAmount: 0,
        isActive: true,
        createdAt: new Date('2024-04-05'),
      },
      {
        name: 'Sarah Connor',
        email: 'sarah@example.com',
        password: hashedPassword,
        role: 'student',
        phone: '9844556677',
        address: 'Residency Road 12',
        libraryId: 'LIB-1006',
        fineAmount: 50,
        isActive: true,
        createdAt: new Date('2024-01-10'),
      },
    ];

    const users = await User.insertMany(usersData);
    console.log(`Created ${users.length} users.`);

    const userMap = {};
    users.forEach((u) => {
      userMap[u.email] = u;
    });

    // 2. Create Books
    const booksData = [
      {
        title: 'Clean Code',
        author: 'Robert C. Martin',
        category: 'Programming',
        genre: 'Programming',
        isbn: '978-0132350884',
        totalCopies: 10,
        availableCopies: 7,
        issuedCopies: 3,
        description: 'Even bad code can function. But if code isn\'t clean, it can bring a development organization to its knees.',
        publicationYear: 2008,
        location: 'Shelf A1',
        isActive: true,
      },
      {
        title: '1984',
        author: 'George Orwell',
        category: 'Fiction',
        genre: 'Fiction',
        isbn: '978-0451524935',
        totalCopies: 8,
        availableCopies: 6,
        issuedCopies: 2,
        description: 'A dystopian social science fiction novel.',
        publicationYear: 1949,
        location: 'Shelf D1',
        isActive: true,
      },
      {
        title: 'Sapiens',
        author: 'Yuval Noah Harari',
        category: 'History',
        genre: 'History',
        isbn: '978-0062316097',
        totalCopies: 8,
        availableCopies: 4,
        issuedCopies: 4,
        description: 'A brief history of humankind from the Stone Age to the Silicon Valley.',
        publicationYear: 2011,
        location: 'Shelf C1',
        isActive: true,
      },
      {
        title: 'The Pragmatic Programmer',
        author: 'Andrew Hunt',
        category: 'Programming',
        genre: 'Programming',
        isbn: '978-0201616224',
        totalCopies: 6,
        availableCopies: 4,
        issuedCopies: 2,
        description: 'Your Journey To Mastery in software engineering.',
        publicationYear: 1999,
        location: 'Shelf A2',
        isActive: true,
      },
      {
        title: 'To Kill a Mockingbird',
        author: 'Harper Lee',
        category: 'Fiction',
        genre: 'Fiction',
        isbn: '978-0061120084',
        totalCopies: 5,
        availableCopies: 3,
        issuedCopies: 2,
        description: 'A gripping tale of racial injustice and childhood innocence.',
        publicationYear: 1960,
        location: 'Shelf D2',
        isActive: true,
      },
      {
        title: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
        category: 'Fiction',
        genre: 'Fiction',
        isbn: '978-0743273565',
        totalCopies: 6,
        availableCopies: 4,
        issuedCopies: 2,
        description: 'A classic American novel of the Jazz Age.',
        publicationYear: 1925,
        location: 'Shelf D3',
        isActive: true,
      },
      {
        title: 'Atomic Habits',
        author: 'James Clear',
        category: 'Self-Help',
        genre: 'Self-Help',
        isbn: '978-0735211292',
        totalCopies: 10,
        availableCopies: 7,
        issuedCopies: 3,
        description: 'An easy and proven way to build good habits & break bad ones.',
        publicationYear: 2018,
        location: 'Shelf B1',
        isActive: true,
      },
    ];

    const books = await Book.insertMany(booksData);
    console.log(`Created ${books.length} books.`);

    const bookMap = {};
    books.forEach((b) => {
      bookMap[b.title] = b;
    });

    const now = new Date();
    const daysAgo = (days) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    const daysInFuture = (days) => new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    const superadminUser = userMap['superadmin@gmail.com'];

    // 3. Create Transactions
    const transactionsData = [
      // John Doe - 3 issued books
      {
        userId: userMap['john.doe@example.com']._id,
        bookId: bookMap['Clean Code']._id,
        issueDate: daysAgo(10),
        dueDate: daysInFuture(4),
        status: 'issued',
        isApproved: true,
        approvedBy: superadminUser._id,
        createdAt: daysAgo(10),
      },
      {
        userId: userMap['john.doe@example.com']._id,
        bookId: bookMap['1984']._id,
        issueDate: daysAgo(5),
        dueDate: daysInFuture(9),
        status: 'issued',
        isApproved: true,
        approvedBy: superadminUser._id,
        createdAt: daysAgo(5),
      },
      {
        userId: userMap['john.doe@example.com']._id,
        bookId: bookMap['The Pragmatic Programmer']._id,
        issueDate: daysAgo(2),
        dueDate: daysInFuture(12),
        status: 'issued',
        isApproved: true,
        approvedBy: superadminUser._id,
        createdAt: daysAgo(2),
      },

      // Jane Smith - 2 issued books
      {
        userId: userMap['jane.smith@example.com']._id,
        bookId: bookMap['Sapiens']._id,
        issueDate: daysAgo(8),
        dueDate: daysInFuture(6),
        status: 'issued',
        isApproved: true,
        approvedBy: superadminUser._id,
        createdAt: daysAgo(8),
      },
      {
        userId: userMap['jane.smith@example.com']._id,
        bookId: bookMap['To Kill a Mockingbird']._id,
        issueDate: daysAgo(4),
        dueDate: daysInFuture(10),
        status: 'issued',
        isApproved: true,
        approvedBy: superadminUser._id,
        createdAt: daysAgo(4),
      },

      // Alice Johnson (librarian user) - 1 issued book
      {
        userId: userMap['admin@gmail.com']._id,
        bookId: bookMap['1984']._id,
        issueDate: daysAgo(12),
        dueDate: daysInFuture(2),
        status: 'issued',
        isApproved: true,
        approvedBy: superadminUser._id,
        createdAt: daysAgo(12),
      },

      // Bob Wilson - 4 issued books
      {
        userId: userMap['bob.w@example.com']._id,
        bookId: bookMap['Clean Code']._id,
        issueDate: daysAgo(6),
        dueDate: daysInFuture(8),
        status: 'issued',
        isApproved: true,
        approvedBy: superadminUser._id,
        createdAt: daysAgo(6),
      },
      {
        userId: userMap['bob.w@example.com']._id,
        bookId: bookMap['Sapiens']._id,
        issueDate: daysAgo(3),
        dueDate: daysInFuture(11),
        status: 'issued',
        isApproved: true,
        approvedBy: superadminUser._id,
        createdAt: daysAgo(3),
      },
      {
        userId: userMap['bob.w@example.com']._id,
        bookId: bookMap['The Great Gatsby']._id,
        issueDate: daysAgo(7),
        dueDate: daysInFuture(7),
        status: 'issued',
        isApproved: true,
        approvedBy: superadminUser._id,
        createdAt: daysAgo(7),
      },
      {
        userId: userMap['bob.w@example.com']._id,
        bookId: bookMap['Atomic Habits']._id,
        issueDate: daysAgo(1),
        dueDate: daysInFuture(13),
        status: 'issued',
        isApproved: true,
        approvedBy: superadminUser._id,
        createdAt: daysAgo(1),
      },

      // Sarah Connor - Overdue item
      {
        userId: userMap['sarah@example.com']._id,
        bookId: bookMap['Sapiens']._id,
        issueDate: daysAgo(20),
        dueDate: daysAgo(6),
        status: 'issued',
        isApproved: true,
        approvedBy: superadminUser._id,
        fineAmount: 50,
        createdAt: daysAgo(20),
      },

      // Recent Returned Transactions matching screenshot 3
      {
        userId: userMap['jane.smith@example.com']._id,
        bookId: bookMap['The Great Gatsby']._id,
        issueDate: daysAgo(15),
        dueDate: daysAgo(1),
        returnDate: daysAgo(0),
        status: 'returned',
        isApproved: true,
        fineAmount: 0,
        finePaid: true,
        createdAt: daysAgo(15),
      },
      {
        userId: userMap['bob.w@example.com']._id,
        bookId: bookMap['Sapiens']._id,
        issueDate: daysAgo(18),
        dueDate: daysAgo(4),
        returnDate: daysAgo(1),
        status: 'returned',
        isApproved: true,
        fineAmount: 0,
        finePaid: true,
        createdAt: daysAgo(18),
      },
    ];

    const transactions = await Transaction.insertMany(transactionsData);
    console.log(`Created ${transactions.length} transactions.`);

    console.log('Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error during database seeding:', error);
    process.exit(1);
  }
};

seedData();
