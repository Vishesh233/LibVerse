const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a book title'],
      trim: true,
    },
    author: {
      type: String,
      required: [true, 'Please provide author name'],
      trim: true,
    },
    genre: {
      type: String,
      required: [true, 'Please provide genre'],
      enum: [
        'Self-Help',
        'Programming',
        'Computer Science',
        'Finance',
        'Business',
        'Fiction',
        'Non-Fiction',
        'History',
        'Biography',
        'Science',
        'Technology',
        'Startup',
        'Motivation',
        'Psychology',
        'Database',
        'Networking',
        'Cyber Security',
        'AI & Machine Learning',
      ],
    },
    description: String,
    isbn: {
      type: String,
      unique: true,
      sparse: true,
    },
    publisher: {
      type: String,
      trim: true,
    },
    publishedYear: Number,
    publicationYear: Number,
    imageUrl: String,
    pages: Number,
    language: String,
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    totalCopies: {
      type: Number,
      required: true,
      default: 1,
    },
    availableCopies: {
      type: Number,
      required: true,
      default: 1,
    },
    issuedCopies: {
      type: Number,
      default: 0,
    },
    // Copies set aside for a ready reservation (utils/bookStock.js).
    // Invariant: availableCopies + issuedCopies + heldCopies === totalCopies
    heldCopies: {
      type: Number,
      default: 0,
      min: 0,
    },
    // Set when the last free copy goes; cleared when a copy is free again, which sends the
    // one "back in stock" notification to students who wishlisted the book
    restockAlertPending: {
      type: Boolean,
      default: false,
    },
    // Legacy: a PNG data URL stored by older versions (kept readable, no longer written).
    // The desk QR is "LV1:B:<bookId>", generated on the fly by the frontend.
    qrCode: String,
    coverImage: String,
    location: String, // shelf location in library
    isActive: {
      type: Boolean,
      default: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Book', bookSchema);