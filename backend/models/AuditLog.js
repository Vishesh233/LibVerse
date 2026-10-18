const mongoose = require('mongoose');

/**
 * Who did what, as staff. Written by utils/audit.js; read by GET /api/admin/audit and the
 * staff-activity analytics. Summaries are short, human readable and never contain emails.
 */
const AUDIT_ACTIONS = [
  'issue.approve',
  'issue.reject',
  'return.approve',
  'payment.approve',
  'loan.admin_issue',
  'loan.admin_return',
  'book.create',
  'book.update',
  'book.delete',
  'user.create',
  'user.update',
  'user.activate',
  'user.deactivate',
  'user.role_change',
  'user.card_reissue',
  'user.library_id_change',
  'fine.waive',
  'reservation.staff_cancel',
  'reminders.send',
];

// Actions that count as handling a loan (staff activity in analytics)
const APPROVAL_ACTIONS = [
  'issue.approve',
  'issue.reject',
  'return.approve',
  'payment.approve',
  'loan.admin_issue',
  'loan.admin_return',
  'fine.waive',
];

const auditLogSchema = new mongoose.Schema(
  {
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    actorRole: {
      type: String,
      enum: ['student', 'librarian', 'admin'],
      required: true,
    },
    action: {
      type: String,
      enum: AUDIT_ACTIONS,
      required: true,
    },
    targetType: {
      type: String,
      enum: ['Transaction', 'Book', 'User', 'Reservation', 'System'],
      required: true,
    },
    targetId: mongoose.Schema.Types.ObjectId,
    summary: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },
    // Small structured details (amounts, changed field names, counts); never personal data
    meta: {
      type: mongoose.Schema.Types.Mixed,
      default: undefined,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ actorId: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

module.exports = AuditLog;
module.exports.AUDIT_ACTIONS = AUDIT_ACTIONS;
module.exports.APPROVAL_ACTIONS = APPROVAL_ACTIONS;
