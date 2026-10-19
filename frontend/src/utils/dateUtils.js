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
