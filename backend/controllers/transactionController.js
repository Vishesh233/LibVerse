const Transaction = require('../models/Transaction');
const Book = require('../models/Book');
const User = require('../models/User');
const { createNotification } = require('./notificationController');
const { calculateFine, getDaysRemaining } = require('../utils/fineCalculator');
const { initiatePayment, payFine } = require('./fineController');

/**
 * @route POST /api/transactions/issue
 * @desc Request to issue a book
 * @access Private/Student
 */
exports.requestIssueBook = async (req, res, next) => {
  try {
    const { bookId } = req.body;
    const userId = req.user.id;

    // Check if book exists
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    // Check if book is available
    if (book.availableCopies <= 0) {
      return res.status(400).json({ success: false, message: 'Book is not available' });
    }

    // Prevent duplicate pending/issued requests for the same book by the same user
    const existingTransaction = await Transaction.findOne({
      userId,
      bookId,
      status: { $in: ['pending', 'issued'] },
    });

    if (existingTransaction) {
      return res.status(400).json({
        success: false,
        message: 'You already have a request or issued copy of this book',
      });
    }

    // Create due date (14 days from now)
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);

    // Create transaction request
    const transaction = await Transaction.create({
      userId,
      bookId,
      dueDate,
      status: 'pending',
    });

    // Create notification for student (non-fatal - never fails the main operation)
    try {
      await createNotification(
        userId,
        'student',
        'ISSUE_REQUEST',
        'Issue Request Submitted',
        `Your request to issue "${book.title}" has been submitted and is pending approval.`
      );
    } catch (notifError) {
      console.error('Notification creation failed (non-fatal):', notifError.message);
    }

    res.status(201).json({
      success: true,
      message: 'Book issue request created. Waiting for admin approval.',
      transaction,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route PUT /api/transactions/:id/return
 * @desc Return a book
 * @access Private
 */
exports.returnBook = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    if (transaction.status !== 'issued') {
      return res.status(400).json({ success: false, message: 'Book is not issued' });
    }

    // Calculate fine if overdue
    const fine = calculateFine(transaction.dueDate);
    transaction.fineAmount = fine;

    // Update transaction
    transaction.returnDate = new Date();
    transaction.status = 'returned';

    if (fine > 0) {
      const user = await User.findById(transaction.userId);
      user.fineAmount += fine;
      await user.save();
    }

    await transaction.save();

    // Update book availability
    const book = await Book.findById(transaction.bookId);
    book.availableCopies += 1;
    book.issuedCopies -= 1;
    await book.save();

    // Create notification for student (non-fatal - never fails the main operation)
    try {
      const returnedBook = await Book.findById(transaction.bookId);
      await createNotification(
        transaction.userId,
        'student',
        'BOOK_RETURNED',
        'Book Returned Successfully',
        `You have successfully returned "${returnedBook.title}".${fine > 0 ? ` A fine of ₹${fine} has been generated.` : ''}`
      );
    } catch (notifError) {
      console.error('Notification creation failed (non-fatal):', notifError.message);
    }

    res.status(200).json({
      success: true,
      message: 'Book returned successfully',
      transaction,
      fine: fine > 0 ? `₹${fine}` : 'No fine',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.initiatePayment = require('./fineController').initiatePayment;
exports.payFine = require('./fineController').payFine;

/**
 * @route GET /api/transactions/user/me
 * @desc Get user's transactions
 * @access Private
 */
exports.getUserTransactions = async (req, res, next) => {
  try {
    const transactions = await Transaction.find({ userId: req.user.id })
      .populate('bookId', 'title author coverImage publisher publicationYear genre rating isbn description totalCopies availableCopies issuedCopies')
      .sort('-createdAt');

    // Add fine calculation and days remaining
    const transactionsWithDetails = transactions.map((t) => {
      const daysRemaining = getDaysRemaining(t.dueDate);
      const fine = t.status === 'issued' ? calculateFine(t.dueDate) : t.fineAmount;
      const daysLate = daysRemaining < 0 ? Math.abs(daysRemaining) : 0;

      return {
        ...t.toObject(),
        fine,
        daysRemaining,
        daysLate,
      };
    });

    res.status(200).json({
      success: true,
      count: transactions.length,
      transactions: transactionsWithDetails,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route GET /api/transactions
 * @desc Get all transactions (Admin only)
 * @access Private/Admin
 */
exports.getAllTransactions = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    let filter = {};
    if (status) {
      filter.status = status;
    }

    const skip = (page - 1) * limit;
    const transactions = await Transaction.find(filter)
      .populate('userId', 'name email libraryId')
      .populate('bookId', 'title author')
      .limit(limit * 1)
      .skip(skip)
      .sort('-createdAt');

    const total = await Transaction.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: transactions.length,
      total,
      pages: Math.ceil(total / limit),
      transactions,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route PUT /api/transactions/:id/approve
 * @desc Approve issue request (Admin only)
 * @access Private/Admin
 */
exports.approveIssueRequest = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    if (transaction.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending requests can be approved',
      });
    }

    const book = await Book.findById(transaction.bookId);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    if (book.availableCopies <= 0) {
      return res.status(400).json({ success: false, message: 'Book is not available to approve' });
    }

    // Update transaction
    transaction.isApproved = true;
    transaction.approvedBy = req.user.id;
    transaction.approvalDate = new Date();
    transaction.status = 'issued';

    // Update book
    book.availableCopies -= 1;
    book.issuedCopies += 1;
    await book.save();

    await transaction.save();

    // Create notification for student (non-fatal - never fails the main operation)
    try {
      await createNotification(
        transaction.userId,
        'student',
        'BOOK_ISSUED',
        'Book Issued Successfully',
        `Your request for "${book.title}" has been approved. Please collect the book from the library. Due date: ${new Date(transaction.dueDate).toLocaleDateString()}`
      );
    } catch (notifError) {
      console.error('Notification creation failed (non-fatal):', notifError.message);
    }

    res.status(200).json({
      success: true,
      message: 'Issue request approved',
      transaction,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route PUT /api/transactions/:id/reject
 * @desc Reject a book issue request
 * @access Private/Admin
 */
exports.rejectIssueRequest = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    if (transaction.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Only pending requests can be rejected' });
    }

    transaction.status = 'rejected';
    transaction.returnDate = new Date();
    await transaction.save();

    // Create notification for student (non-fatal - never fails the main operation)
    try {
      const rejectedBook = await Book.findById(transaction.bookId);
      await createNotification(
        transaction.userId,
        'student',
        'RETURN_REQUEST',
        'Issue Request Rejected',
        `Your request for "${rejectedBook.title}" has been rejected. Please contact the library for more information.`
      );
    } catch (notifError) {
      console.error('Notification creation failed (non-fatal):', notifError.message);
    }

    res.status(200).json({ success: true, message: 'Request rejected', transaction });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route PUT /api/transactions/:id/renew
 * @desc Renew a book (extend due date)
 * @access Private
 */
exports.renewBook = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    if (transaction.status !== 'issued') {
      return res.status(400).json({ success: false, message: 'Only issued books can be renewed' });
    }

    if (transaction.renewalCount >= 3) {
      return res.status(400).json({ success: false, message: 'Book cannot be renewed more than 3 times' });
    }

    // Extend due date by 7 days
    transaction.dueDate.setDate(transaction.dueDate.getDate() + 7);
    transaction.renewalCount += 1;

    await transaction.save();

    // Create notification for student (non-fatal - never fails the main operation)
    try {
      const renewedBook = await Book.findById(transaction.bookId);
      await createNotification(
        transaction.userId,
        'student',
        'BOOK_ISSUED',
        'Book Renewed Successfully',
        `"${renewedBook.title}" has been renewed. New due date: ${new Date(transaction.dueDate).toLocaleDateString()}`
      );
    } catch (notifError) {
      console.error('Notification creation failed (non-fatal):', notifError.message);
    }

    res.status(200).json({
      success: true,
      message: 'Book renewed successfully',
      newDueDate: transaction.dueDate,
      transaction,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};