/** Human labels for audit log actions (backend models/AuditLog.js AUDIT_ACTIONS) */
export const AUDIT_ACTION_LABELS = {
  'issue.approve': 'Issue approved',
  'issue.reject': 'Issue rejected',
  'return.approve': 'Return approved',
  'payment.approve': 'Payment verified',
  'loan.admin_issue': 'Desk issue',
  'loan.admin_return': 'Desk return',
  'book.create': 'Book added',
  'book.update': 'Book edited',
  'book.delete': 'Book removed',
  'user.create': 'User created',
  'user.update': 'User edited',
  'user.activate': 'User activated',
  'user.deactivate': 'User deactivated',
  'user.role_change': 'Role changed',
  'user.card_reissue': 'Card reissued',
  'user.library_id_change': 'Library ID changed',
  'fine.waive': 'Fine waived',
  'reservation.staff_cancel': 'Reservation cancelled',
  'reminders.send': 'Reminders sent',
};

// Loan-handling actions shown in staff activity (backend APPROVAL_ACTIONS), in display order
export const STAFF_ACTIVITY_ACTIONS = [
  'issue.approve',
  'issue.reject',
  'return.approve',
  'payment.approve',
  'loan.admin_issue',
  'loan.admin_return',
  'fine.waive',
];

// Chart colours per staff action (distinct on the dark theme)
export const STAFF_ACTION_COLORS = {
  'issue.approve': '#6366F1',
  'issue.reject': '#F43F5E',
  'return.approve': '#10B981',
  'payment.approve': '#F59E0B',
  'loan.admin_issue': '#22D3EE',
  'loan.admin_return': '#A78BFA',
  'fine.waive': '#F472B6',
};

export const auditActionLabel = (action) => AUDIT_ACTION_LABELS[action] || action;
