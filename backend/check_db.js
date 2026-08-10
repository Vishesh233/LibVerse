const mongoose = require('mongoose');

async function check() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/libraryDB');
    const Book = require('./models/Book');
    
    // Check category consistency
    const agg = await Book.aggregate([
      { $group: { _id: { $ifNull: ['$category', '$genre'] }, count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    console.log('Categories:', JSON.stringify(agg, null, 2));
    
    const total = await Book.countDocuments();
    console.log('Total books:', total);
    
    const noGenre = await Book.find({ genre: { $exists: false } }).countDocuments();
    console.log('Books without genre:', noGenre);
    
    const noCategory = await Book.find({ category: { $exists: false } }).countDocuments();
    console.log('Books without category:', noCategory);
    
    // Check availability consistency
    const inconsistent = await Book.find({
      $expr: { $ne: [{ $add: ['$availableCopies', '$issuedCopies'] }, '$totalCopies'] }
    }).countDocuments();
    console.log('Books with inconsistent copies:', inconsistent);
    
    const unavailable = await Book.find({ availableCopies: { $lte: 0 } }).countDocuments();
    console.log('Unavailable books:', unavailable);
    
    const zeroAvail = await Book.find({ availableCopies: 0, issuedCopies: 0 }).countDocuments();
    console.log('Books with 0 available and 0 issued:', zeroAvail);
    
    // Check missing fields
    const noIsbn = await Book.find({ isbn: { $exists: false } }).countDocuments();
    const noPublisher = await Book.find({ publisher: { $exists: false } }).countDocuments();
    const noPages = await Book.find({ pages: { $exists: false } }).countDocuments();
    const noLanguage = await Book.find({ language: { $exists: false } }).countDocuments();
    const noRating = await Book.find({ rating: { $exists: false } }).countDocuments();
    const noDescription = await Book.find({ description: { $exists: false } }).countDocuments();
    const noCover = await Book.find({ coverImage: { $exists: false } }).countDocuments();
    const noImageUrl = await Book.find({ imageUrl: { $exists: false } }).countDocuments();
    
    console.log('Missing ISBN:', noIsbn);
    console.log('Missing publisher:', noPublisher);
    console.log('Missing pages:', noPages);
    console.log('Missing language:', noLanguage);
    console.log('Missing rating:', noRating);
    console.log('Missing description:', noDescription);
    console.log('Missing coverImage:', noCover);
    console.log('Missing imageUrl:', noImageUrl);
    
    // Show a few sample books with issues
    const sampleIssues = await Book.find({
      $expr: { $ne: [{ $add: ['$availableCopies', '$issuedCopies'] }, '$totalCopies'] }
    }).limit(5).lean();
    console.log('Sample inconsistent books:', JSON.stringify(sampleIssues.map(b => ({ id: b._id, title: b.title, total: b.totalCopies, available: b.availableCopies, issued: b.issuedCopies })), null, 2));
    
    await mongoose.disconnect();
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

check();
