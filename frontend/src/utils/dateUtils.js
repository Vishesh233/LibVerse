export const formatDate = (date) => {
  if (!date) return 'N/A';
  const d = new Date(date);
  return isNaN(d) ? 'N/A' : d.toLocaleDateString('en-IN');
};

export const formatDateTime = (date) => {
  if (!date) return 'N/A';
  const d = new Date(date);
  return isNaN(d) ? 'N/A' : d.toLocaleString('en-IN');
};

export const dueLabel = (dueDate) => {
  if (!dueDate) return 'N/A';
  const d = new Date(dueDate);
  if (isNaN(d)) return 'N/A';

  const today = new Date();
  // normalize dates to remove time
  const t = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const dd = new Date(d.getFullYear(), d.getMonth(), d.getDate());

  const diff = Math.ceil((dd - t) / (1000 * 60 * 60 * 24));
  if (diff === 0) return 'Due Today';
  if (diff > 0) return `Due in ${diff} day${diff > 1 ? 's' : ''}`;
  const overdue = Math.abs(diff);
  return `Overdue by ${overdue} day${overdue > 1 ? 's' : ''}`;
};
