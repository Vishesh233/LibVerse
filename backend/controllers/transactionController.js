const Transaction = require('../models/Transaction');
const Book = require('../models/Book');
const User = require('../models/User');
const { createNotification } = require('./notificationController');
const { calculateFine, getDaysRemaining } = require('../utils/fineCalculator');

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
      status: { $in: ['pending', 'issued', 'return_requested', 'payment_pending'] },
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

    // Notification for student
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

    // Notify librarians/admins about new request
    try {
      const librarians = await User.find({ role: { $in: ['librarian', 'admin'] }, isActive: true });
      for (const lib of librarians) {
        await createNotification(
          lib._id,
          lib.role,
          'PENDING_APPROVAL',
          'New Book Request',
          `${req.user.name || 'A student'} has requested "${book.title}". Please review and approve.`
        );
      }
    } catch (notifError) {
      console.error('Librarian notification failed (non-fatal):', notifError.message);
    }

    res.status(201).json({
      success: true,
      message: 'Book issue request created. Waiting for librarian approval.',
      transaction,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route PUT /api/transactions/:id/return
 * @desc Student requests to return a book
 * CASE A (no fine): status → return_requested → librarian approves → returned
 * CASE B (fine): status → return_requested + fineAmount set → student pays → payment_pending → librarian approves → returned
 * @access Private/Student
 */
exports.returnBook = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id).populate('bookId', 'title');

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    if (transaction.status !== 'issued') {
      return res.status(400).json({ success: false, message: 'Book is not currently issued' });
    }

    // Only the student who borrowed it can request return, or a librarian/admin acting on their behalf
    const isOwner = transaction.userId.toString() === req.user.id.toString();
    const isLibrarian = ['admin', 'librarian', 'superadmin'].includes(req.user.role);
    if (!isOwner && !isLibrarian) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Calculate fine if overdue
    const fine = calculateFine(transaction.dueDate);

    transaction.fineAmount = fine;
    transaction.status = 'return_requested';
    transaction.returnRequestedAt = new Date();

    await transaction.save();


    const bookTitle = transaction.bookId?.title || 'Book';

    // Notify student
    try {
      await createNotification(
        transaction.userId,
        'student',
        'RETURN_REQUESTED',
        'Return Request Submitted',
        fine > 0
          ? `Your return request for "${bookTitle}" has been submitted. You have a fine of ₹${fine}. Please pay the fine to complete the return.`
          : `Your return request for "${bookTitle}" has been submitted. Waiting for librarian approval.`
      );
    } catch (notifError) {
      console.error('Notification creation failed (non-fatal):', notifError.message);
    }

    // Notify librarians
    try {
      const librarians = await User.find({ role: { $in: ['librarian', 'admin'] }, isActive: true });
      for (const lib of librarians) {
        await createNotification(
          lib._id,
          lib.role,
          'RETURN_REQUEST',
          'Book Return Request',
          `${req.user.name || 'A student'} wants to return "${bookTitle}".${fine > 0 ? ` Fine: ₹${fine}` : ' No fine.'}`
        );
      }
    } catch (notifError) {
      console.error('Librarian notification failed (non-fatal):', notifError.message);
    }

    res.status(200).json({
      success: true,
      message: fine > 0
        ? `Return request submitted. You have a fine of ₹${fine}. Please pay before the librarian can approve.`
        : 'Return request submitted. Waiting for librarian approval.',
      transaction,
      fine: fine > 0 ? fine : 0,
      hasFine: fine > 0,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route PUT /api/transactions/:id/approve-return
 * @desc Librarian approves return (CASE A: no fine, OR after fine is paid)
 * @access Private/Admin
 */
exports.approveReturn = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id).populate('bookId', 'title');

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    if (transaction.status !== 'return_requested') {
      return res.status(400).json({
        success: false,
        message: 'Transaction is not in return_requested status',
      });
    }

    // If there's a fine and it hasn't been paid yet, reject
    if (transaction.fineAmount > 0 && !transaction.finePaid) {
      return res.status(400).json({
        success: false,
        message: `Fine of ₹${transaction.fineAmount} must be paid before approving return`,
      });
    }

    // Complete the return
    transaction.returnDate = new Date();
    transaction.status = 'returned';
    transaction.returnApprovedBy = req.user.id;

    await transaction.save();

    // Update book availability
    const book = await Book.findById(transaction.bookId);
    if (book) {
      book.availableCopies += 1;
      book.issuedCopies = Math.max(0, book.issuedCopies - 1);
      await book.save();
    }

    const bookTitle = transaction.bookId?.title || book?.title || 'Book';

    // Notify student
    try {
      await createNotification(
        transaction.userId,
        'student',
        'RETURN_APPROVED',
        'Book Return Approved',
        `Your return for "${bookTitle}" has been approved. Thank you!`
      );
    } catch (notifError) {
      console.error('Notification creation failed (non-fatal):', notifError.message);
    }

    res.status(200).json({
      success: true,
      message: 'Book return approved successfully',
      transaction,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route PUT /api/transactions/:id/submit-payment
 * @desc Student submits payment (with optional screenshot) for fine
 * Sets status to payment_pending, notifies librarian
 * @access Private/Student
 */
exports.submitPayment = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id).populate('bookId', 'title');

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    if (transaction.userId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (transaction.status !== 'return_requested') {
      return res.status(400).json({
        success: false,
        message: 'Transaction must be in return_requested status to submit payment',
      });
    }

    if (transaction.fineAmount <= 0) {
      return res.status(400).json({ success: false, message: 'No fine to pay' });
    }

    if (transaction.finePaid) {
      return res.status(400).json({ success: false, message: 'Fine is already paid' });
    }

    // Update status
    transaction.status = 'payment_pending';
    transaction.paymentSubmittedAt = new Date();
    if (req.body.paymentScreenshot) {
      transaction.paymentScreenshot = req.body.paymentScreenshot;
    }

    await transaction.save();

    const bookTitle = transaction.bookId?.title || 'Book';

    // Notify student
    try {
      await createNotification(
        transaction.userId,
        'student',
        'PAYMENT_PENDING',
        'Payment Submitted',
        `Your payment of ₹${transaction.fineAmount} for "${bookTitle}" has been submitted. Waiting for librarian verification.`
      );
    } catch (notifError) {
      console.error('Notification creation failed (non-fatal):', notifError.message);
    }

    // Notify librarians
    try {
      const librarians = await User.find({ role: { $in: ['librarian', 'admin'] }, isActive: true });
      for (const lib of librarians) {
        await createNotification(
          lib._id,
          lib.role,
          'PAYMENT_PENDING',
          'Payment Verification Required',
          `${req.user.name || 'A student'} has submitted payment of ₹${transaction.fineAmount} for "${bookTitle}". Please verify and approve.`
        );
      }
    } catch (notifError) {
      console.error('Librarian notification failed (non-fatal):', notifError.message);
    }

    res.status(200).json({
      success: true,
      message: 'Payment submitted successfully. Waiting for librarian verification.',
      transaction,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route PUT /api/transactions/:id/approve-payment
 * @desc Librarian approves payment → fine paid → book returned automatically
 * @access Private/Admin
 */
exports.approvePayment = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id).populate('bookId', 'title');

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    if (transaction.status !== 'payment_pending') {
      return res.status(400).json({
        success: false,
        message: 'Transaction is not in payment_pending status',
      });
    }

    // Mark fine as paid
    transaction.finePaid = true;
    transaction.paymentApprovedBy = req.user.id;
    transaction.paymentApprovedAt = new Date();

    // Complete the return
    transaction.returnDate = new Date();
    transaction.status = 'returned';
    transaction.returnApprovedBy = req.user.id;

    await transaction.save();

    // Deduct fine from user's total fineAmount
    const user = await User.findById(transaction.userId);
    if (user) {
      user.fineAmount = Math.max(0, (user.fineAmount || 0) - transaction.fineAmount);
      await user.save();
    }

    // Update book availability
    const book = await Book.findById(transaction.bookId);
    if (book) {
      book.availableCopies += 1;
      book.issuedCopies = Math.max(0, book.issuedCopies - 1);
      await book.save();
    }

    const bookTitle = transaction.bookId?.title || book?.title || 'Book';

    // Notify student
    try {
      await createNotification(
        transaction.userId,
        'student',
        'PAYMENT_APPROVED',
        'Payment Approved & Book Returned',
        `Your payment of ₹${transaction.fineAmount} for "${bookTitle}" has been verified. Your book has been returned successfully!`
      );
    } catch (notifError) {
      console.error('Notification creation failed (non-fatal):', notifError.message);
    }

    res.status(200).json({
      success: true,
      message: 'Payment approved. Fine marked as paid. Book returned successfully.',
      transaction,
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
      const fine = (t.status === 'issued' || t.status === 'return_requested' || t.status === 'payment_pending')
        ? calculateFine(t.dueDate)
        : t.fineAmount;
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
 * @desc Approve issue request (Librarian/Admin only)
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

    // Notify student
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

    // Notify student
    try {
      const rejectedBook = await Book.findById(transaction.bookId);
      await createNotification(
        transaction.userId,
        'student',
        'RETURN_REQUEST',
        'Issue Request Rejected',
        `Your request for "${rejectedBook?.title || 'the book'}" has been rejected. Please contact the library for more information.`
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

    // Notify student
    try {
      const renewedBook = await Book.findById(transaction.bookId);
      await createNotification(
        transaction.userId,
        'student',
        'BOOK_ISSUED',
        'Book Renewed Successfully',
        `"${renewedBook?.title || 'Book'}" has been renewed. New due date: ${new Date(transaction.dueDate).toLocaleDateString()}`
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



