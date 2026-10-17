const Transaction = require('../models/Transaction');
const Book = require('../models/Book');
const User = require('../models/User');
const { notifyStudent, notifyStaff } = require('./notificationController');
const { calculateFine, getDaysLateOf, getDaysRemaining, isOverdue } = require('../utils/fineCalculator');
const { takeBookCopy, returnBookCopy } = require('../utils/bookStock');
const { toQueryString, toPagination } = require('../utils/escapeRegex');

const DAY_MS = 24 * 60 * 60 * 1000;

const LOAN_DAYS = 14;
const RENEWAL_DAYS = 7;

// Payment screenshots: PNG/JPEG/WEBP data URI, at most ~3 MB once decoded
const SCREENSHOT_PATTERN = /^data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/]+={0,2})$/;
const MAX_SCREENSHOT_BYTES = 3 * 1024 * 1024;
const isValidScreenshot = (value) => {
  if (typeof value !== 'string') return false;
  const match = value.match(SCREENSHOT_PATTERN);
  if (!match) return false;
  const base64 = match[2];
  const decodedBytes = Math.floor((base64.length * 3) / 4) - (base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0);
  return decodedBytes > 0 && decodedBytes <= MAX_SCREENSHOT_BYTES;
};

/**
 * @route POST /api/transactions/issue
 * @desc Request to issue a book
 * @access Private/Student
 */
exports.requestIssueBook = async (req, res, next) => {
  try {
    const { bookId } = req.body;
    const userId = req.user.id;

    // Check if book exists and has not been removed from the catalogue
    const book = await Book.findById(bookId);
    if (!book || book.isActive === false) {
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

    // Provisional due date; the loan period is reset when the request is approved
    const dueDate = new Date(Date.now() + LOAN_DAYS * DAY_MS);

    // Create transaction request
    const transaction = await Transaction.create({
      userId,
      bookId,
      dueDate,
      status: 'pending',
    });

    // Student: confirmation of their own request
    await notifyStudent(userId, {
      type: 'ISSUE_REQUEST',
      title: 'Request sent',
      message: `Your request for "${book.title}" was sent to the library and is waiting for approval.`,
      link: '/student/my-books?tab=pending',
      meta: { transactionId: transaction._id, bookId: book._id },
    });

    // Staff: one notification per active librarian/admin
    await notifyStaff({
      type: 'PENDING_APPROVAL',
      title: 'New issue request',
      message: `${req.user.name || 'A student'} requested "${book.title}".`,
      path: '/pending?tab=issue',
      meta: { transactionId: transaction._id, bookId: book._id },
    });

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
    const isLibrarian = ['admin', 'librarian'].includes(req.user.role);
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

    // Student: confirmation of their own return request
    await notifyStudent(transaction.userId, {
      type: 'RETURN_REQUESTED',
      title: 'Return request sent',
      message: fine > 0
        ? `Your return request for "${bookTitle}" was sent. A fine of ₹${fine} is due; pay it so the library can complete the return.`
        : `Your return request for "${bookTitle}" was sent. Hand the book in at the library to complete the return.`,
      link: fine > 0 ? `/student/pay-fine/${transaction._id}` : '/student/my-books?tab=return_requested',
      meta: { transactionId: transaction._id, bookId: transaction.bookId },
    });

    // Staff: one notification per active librarian/admin (named after the borrower, even when staff filed it)
    const borrower = isOwner ? req.user : await User.findById(transaction.userId).select('name').catch(() => null);
    await notifyStaff({
      type: 'RETURN_REQUEST',
      title: 'New return request',
      message: `${borrower?.name || 'A student'} wants to return "${bookTitle}".${fine > 0 ? ` Fine: ₹${fine}.` : ' No fine.'}`,
      path: '/pending?tab=return',
      meta: { transactionId: transaction._id, bookId: transaction.bookId },
    });

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

    // Complete the return atomically - only one approval can move it out of return_requested
    const returned = await Transaction.findOneAndUpdate(
      {
        _id: transaction._id,
        status: 'return_requested',
        $or: [{ fineAmount: { $lte: 0 } }, { finePaid: true }],
      },
      { $set: { status: 'returned', returnDate: new Date(), returnApprovedBy: req.user.id } },
      { new: true }
    ).populate('bookId', 'title');

    if (!returned) {
      return res.status(400).json({
        success: false,
        message: 'Transaction is not in return_requested status',
      });
    }

    // Update book availability
    const book = await returnBookCopy(transaction.bookId?._id || transaction.bookId);

    const bookTitle = returned.bookId?.title || book?.title || 'Book';

    // Student: return completed
    await notifyStudent(returned.userId, {
      type: 'RETURN_APPROVED',
      title: 'Return approved',
      message: `Your return of "${bookTitle}" has been approved. Thank you!`,
      link: '/student/my-books?tab=returned',
      meta: { transactionId: returned._id, bookId: returned.bookId },
    });

    res.status(200).json({
      success: true,
      message: 'Book return approved successfully',
      transaction: returned,
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

    if (req.body.paymentScreenshot !== undefined && !isValidScreenshot(req.body.paymentScreenshot)) {
      return res.status(400).json({
        success: false,
        message: 'Payment screenshot must be a PNG, JPEG or WEBP image of at most 3 MB',
      });
    }

    // Update status
    transaction.status = 'payment_pending';
    transaction.paymentSubmittedAt = new Date();
    if (req.body.paymentScreenshot) {
      transaction.paymentScreenshot = req.body.paymentScreenshot;
    }

    await transaction.save();

    const bookTitle = transaction.bookId?.title || 'Book';

    // Student: confirmation of their own payment
    await notifyStudent(transaction.userId, {
      type: 'PAYMENT_PENDING',
      title: 'Payment submitted',
      message: `Your payment of ₹${transaction.fineAmount} for "${bookTitle}" was submitted and is waiting for verification.`,
      link: '/student/my-books?tab=payment_pending',
      meta: { transactionId: transaction._id, bookId: transaction.bookId },
    });

    // Staff: one notification per active librarian/admin
    await notifyStaff({
      type: 'PAYMENT_PENDING',
      title: 'New payment to verify',
      message: `${req.user.name || 'A student'} paid ₹${transaction.fineAmount} for "${bookTitle}". Please verify the payment.`,
      path: '/pending?tab=payment',
      meta: { transactionId: transaction._id, bookId: transaction.bookId },
    });

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

    // Mark fine as paid and complete the return atomically - only from payment_pending
    const now = new Date();
    const returned = await Transaction.findOneAndUpdate(
      { _id: transaction._id, status: 'payment_pending' },
      {
        $set: {
          finePaid: true,
          paymentApprovedBy: req.user.id,
          paymentApprovedAt: now,
          returnDate: now,
          status: 'returned',
          returnApprovedBy: req.user.id,
        },
      },
      { new: true }
    ).populate('bookId', 'title');

    if (!returned) {
      return res.status(400).json({
        success: false,
        message: 'Transaction is not in payment_pending status',
      });
    }

    // Deduct fine from user's total fineAmount
    const user = await User.findById(returned.userId);
    if (user) {
      user.fineAmount = Math.max(0, (user.fineAmount || 0) - returned.fineAmount);
      await user.save();
    }

    // Update book availability
    const book = await returnBookCopy(transaction.bookId?._id || transaction.bookId);

    const bookTitle = returned.bookId?.title || book?.title || 'Book';

    // Student: payment verified and return completed
    await notifyStudent(returned.userId, {
      type: 'PAYMENT_APPROVED',
      title: 'Payment approved',
      message: `Your payment of ₹${returned.fineAmount} for "${bookTitle}" was verified and the book is returned.`,
      link: '/student/fines',
      meta: { transactionId: returned._id, bookId: returned.bookId },
    });

    res.status(200).json({
      success: true,
      message: 'Payment approved. Fine marked as paid. Book returned successfully.',
      transaction: returned,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.initiatePayment = require('./fineController').initiatePayment;

/**
 * @route GET /api/transactions/user/me
 * @desc Get user's transactions
 * @access Private
 */
exports.getUserTransactions = async (req, res, next) => {
  try {
    const transactions = await Transaction.find({ userId: req.user.id })
      .populate('bookId', 'title author coverImage imageUrl publisher publicationYear genre rating isbn description totalCopies availableCopies issuedCopies')
      .sort('-createdAt');

    // Add fine calculation and days remaining
    const transactionsWithDetails = transactions.map((t) => {
      const daysRemaining = getDaysRemaining(t.dueDate);
      // Only an issued loan's fine still grows; once a return is requested the stored fine is frozen
      const fine = t.status === 'issued' ? calculateFine(t.dueDate) : t.fineAmount;
      const daysLate = getDaysLateOf(t);

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
    const status = toQueryString(req.query.status);
    const { limit, skip } = toPagination(req.query.page, req.query.limit, 10);

    let filter = {};
    if (status) {
      filter.status = status;
    }

    // Lists never carry the (large) screenshot itself - only whether one exists
    const docs = await Transaction.find(filter)
      .select('-paymentScreenshot')
      .populate('userId', 'name email libraryId')
      .populate('bookId', 'title author')
      .limit(limit)
      .skip(skip)
      .sort('-createdAt');

    const withScreenshot = await Transaction.find({
      _id: { $in: docs.map((t) => t._id) },
      paymentScreenshot: { $exists: true, $nin: [null, ''] },
    }).select('_id');
    const screenshotIds = new Set(withScreenshot.map((t) => t._id.toString()));

    const transactions = docs.map((t) => ({ ...t.toObject(), hasScreenshot: screenshotIds.has(t._id.toString()) }));

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
 * @route GET /api/transactions/:id/payment-screenshot
 * @desc Get the payment screenshot of one transaction (for verification)
 * @access Private/Staff
 */
exports.getPaymentScreenshot = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id).select('paymentScreenshot');

    if (!transaction || !transaction.paymentScreenshot) {
      return res.status(404).json({ success: false, message: 'No payment screenshot found' });
    }

    res.status(200).json({ success: true, paymentScreenshot: transaction.paymentScreenshot });
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
    if (!book || book.isActive === false) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    // 1. Atomically claim the request (pending -> issued). The loan period starts now.
    const now = new Date();
    const issued = await Transaction.findOneAndUpdate(
      { _id: transaction._id, status: 'pending' },
      {
        $set: {
          status: 'issued',
          isApproved: true,
          approvedBy: req.user.id,
          approvalDate: now,
          issueDate: now,
          dueDate: new Date(now.getTime() + LOAN_DAYS * DAY_MS),
        },
      },
      { new: true }
    );

    if (!issued) {
      return res.status(400).json({
        success: false,
        message: 'Only pending requests can be approved',
      });
    }

    // 2. Atomically take a copy; if none is left, put the request back to pending
    const updatedBook = await takeBookCopy(book._id);
    if (!updatedBook) {
      await Transaction.updateOne(
        { _id: transaction._id, status: 'issued' },
        {
          $set: {
            status: 'pending',
            isApproved: false,
            issueDate: transaction.issueDate,
            dueDate: transaction.dueDate,
          },
          $unset: { approvedBy: '', approvalDate: '' },
        }
      );
      return res.status(400).json({ success: false, message: 'Book is not available to approve' });
    }

    // Student: request approved
    await notifyStudent(issued.userId, {
      type: 'BOOK_ISSUED',
      title: 'Request approved',
      message: `Your request for "${book.title}" was approved. Collect it from the library. Due date: ${new Date(issued.dueDate).toLocaleDateString()}.`,
      link: '/student/my-books?tab=issued',
      meta: { transactionId: issued._id, bookId: book._id },
    });

    res.status(200).json({
      success: true,
      message: 'Issue request approved',
      transaction: issued,
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

    // Student: request rejected
    const rejectedBook = await Book.findById(transaction.bookId).select('title').catch(() => null);
    await notifyStudent(transaction.userId, {
      type: 'ISSUE_REJECTED',
      title: 'Request rejected',
      message: `Your request for "${rejectedBook?.title || 'the book'}" was rejected. Please contact the library for details.`,
      link: '/student/my-books?tab=rejected',
      meta: { transactionId: transaction._id, bookId: transaction.bookId },
    });

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

    // Only the borrower or staff may renew
    const isOwner = transaction.userId.toString() === req.user.id.toString();
    const isStaff = ['admin', 'librarian'].includes(req.user.role);
    if (!isOwner && !isStaff) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (transaction.status !== 'issued') {
      return res.status(400).json({ success: false, message: 'Only issued books can be renewed' });
    }

    // Calendar-day rule (same as fines): a book due today is not overdue yet and can still be renewed
    if (isOverdue(transaction.dueDate)) {
      return res.status(400).json({
        success: false,
        message: 'Overdue books cannot be renewed. Please return the book and pay the fine.',
      });
    }

    if (transaction.renewalCount >= 3) {
      return res.status(400).json({ success: false, message: 'Book cannot be renewed more than 3 times' });
    }

    // Extend due date by 7 days. Assign a new Date: in-place setDate() is not detected by Mongoose and was never saved.
    transaction.dueDate = new Date(transaction.dueDate.getTime() + RENEWAL_DAYS * DAY_MS);
    transaction.renewalCount += 1;
    // New due date: the "due soon" reminder may fire again for it
    if (transaction.remindersSent) transaction.remindersSent.dueSoon = undefined;

    await transaction.save();

    // Student: renewal confirmed
    const renewedBook = await Book.findById(transaction.bookId).select('title').catch(() => null);
    await notifyStudent(transaction.userId, {
      type: 'BOOK_RENEWED',
      title: 'Book renewed',
      message: `"${renewedBook?.title || 'Book'}" has been renewed. New due date: ${new Date(transaction.dueDate).toLocaleDateString()}.`,
      link: '/student/my-books?tab=issued',
      meta: { transactionId: transaction._id, bookId: transaction.bookId },
    });

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



