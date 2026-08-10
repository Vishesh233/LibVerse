const mongoose = require('mongoose');

async function check() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/libraryDB');
    const Book = require('./backend/models/Book');
    
    const agg = await Book.aggregate([
      { $group: { _id: { $ifNull: ['$category', '$genre'] }, count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    console.log('Categories:', JSON.stringify(agg, null, 2));
    
    const total = await Book.countDocuments();
    console.log('Total books:', total);
    
    const sample = await Book.findOne();
    console.log('Sample fields:', Object.keys(sample.toObject()));
    
    const csBooks = await Book.find({ $or: [{ genre: 'Computer Science' }, { category: 'Computer Science' }] }).countDocuments();
    console.log('CS books:', csBooks);
    
    const noGenre = await Book.find({ genre: { $exists: false } }).countDocuments();
    console.log('Books without genre:', noGenre);
    
    const noCategory = await Book.find({ category: { $exists: false } }).countDocuments();
    console.log('Books without category:', noCategory);
    
    await mongoose.disconnect();
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

check();
