import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Endpoints whose 401 means "wrong credentials", not "session expired"
const CREDENTIAL_ENDPOINTS = ['/auth/login', '/auth/signup', '/auth/change-password', '/auth/google', '/auth/set-password'];

// Log out on an invalid/expired session or a deactivated account.
// Other 403s are normal permission denials and must not log the user out.
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || '';
    const isCredentialEndpoint = CREDENTIAL_ENDPOINTS.some((path) => url.includes(path));
    const isDeactivated = status === 403 && error.response?.data?.message === 'Account is deactivated';

    if (!isCredentialEndpoint && (status === 401 || isDeactivated)) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.assign('/login');
      }
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authAPI = {
  signup: (data) => apiClient.post('/auth/signup', data),
  login: (data) => apiClient.post('/auth/login', data),
  getCurrentUser: () => apiClient.get('/auth/me'),
  getMyStats: () => apiClient.get('/auth/me/stats'),
  getMyActivity: () => apiClient.get('/auth/me/activity'),
  getReadingStats: () => apiClient.get('/auth/me/reading-stats'),
  // The signed-in member's own library card (signed QR code)
  getMyCard: () => apiClient.get('/auth/me/card'),
  updateProfile: (data) => apiClient.put('/auth/update-profile', data),
  completeOnboarding: (data) => apiClient.put('/auth/complete-onboarding', data),
  updateFavoriteGenres: (data) => apiClient.put('/auth/update-favorite-genres', data),
  changePassword: (data) => apiClient.put('/auth/change-password', data),
  // Forgot password by emailed code (enabled only when the server has SMTP settings)
  getPasswordResetStatus: () => apiClient.get('/auth/password-reset'),
  forgotPassword: (email) => apiClient.post('/auth/forgot-password', { email }),
  resetPassword: (data) => apiClient.post('/auth/reset-password', data),
  // Live demo instance: { enabled }, and one-click sign-in as the demo account for a role
  getDemoStatus: () => apiClient.get('/auth/demo'),
  demoLogin: (role) => apiClient.post('/auth/demo-login', { role }),
  // Sign in with Google (production): { enabled }, sign in / sign up with the ID token,
  // connect or disconnect Google from Settings (current password), first password for Google accounts
  getGoogleStatus: () => apiClient.get('/auth/google'),
  googleLogin: (credential) => apiClient.post('/auth/google', { credential }),
  linkGoogle: (credential, currentPassword) => apiClient.post('/auth/google/link', { credential, currentPassword }),
  unlinkGoogle: (currentPassword) => apiClient.delete('/auth/google/link', { data: { currentPassword } }),
  setPassword: (newPassword) => apiClient.put('/auth/set-password', { newPassword }),
  uploadAvatar: (formData) =>
    apiClient.post('/profile/upload-avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

// Books endpoints
export const booksAPI = {
  getBooks: (params, config = {}) => apiClient.get('/books', { params, ...config }),
  getBookById: (id) => apiClient.get(`/books/${id}`),
  createBook: (data) => apiClient.post('/books', data),
  updateBook: (id, data) => apiClient.put(`/books/${id}`, data),
  deleteBook: (id) => apiClient.delete(`/books/${id}`),
  addReview: (bookId, data) => apiClient.post(`/books/${bookId}/review`, data),
  getRecommendations: () => apiClient.get('/books/recommendations'),
  // Most borrowed books; params: limit (max 20), genre
  getPopular: (params, config = {}) => apiClient.get('/books/popular', { params, ...config }),
  // Staff: titles, copies on the shelf / on loan / held, low and out of stock
  getStockSummary: () => apiClient.get('/books/summary'),
  // Staff: bulk CSV import (check first, then add the valid rows)
  previewImport: (csv) => apiClient.post('/books/import/preview', { csv }),
  importBooks: (csv, checkCovers = false) => apiClient.post('/books/import', { csv, checkCovers }),
  uploadCover: (formData) =>
    apiClient.post('/books/upload-cover', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

// Transactions endpoints
export const transactionsAPI = {
  requestIssueBook: (data) => apiClient.post('/transactions/issue', data),
  returnBook: (id) => apiClient.put(`/transactions/${id}/return`),
  renewBook: (id) => apiClient.put(`/transactions/${id}/renew`),
  getUserTransactions: () => apiClient.get('/transactions/user/me'),
  getAllTransactions: (params, config = {}) => apiClient.get('/transactions', { params, ...config }),
  approveIssueRequest: (id) => apiClient.put(`/transactions/${id}/approve`),
  rejectIssueRequest: (id) => apiClient.put(`/transactions/${id}/reject`),
  approveReturn: (id) => apiClient.put(`/transactions/${id}/approve-return`),
  submitPayment: (id, data) => apiClient.put(`/transactions/${id}/submit-payment`, data),
  approvePayment: (id) => apiClient.put(`/transactions/${id}/approve-payment`),
  getPaymentScreenshot: (id) => apiClient.get(`/transactions/${id}/payment-screenshot`),
  // Staff: waive all or part of an unpaid fine ({ amount, reason })
  waiveFine: (id, data) => apiClient.post(`/transactions/${id}/waive`, data),
};

// Admin endpoints
export const adminAPI = {
  getDashboard: () => apiClient.get('/admin/dashboard'),
  // ?from=YYYY-MM-DD&to=YYYY-MM-DD (default: last 12 months)
  getAnalytics: (params, config = {}) => apiClient.get('/admin/analytics', { params, ...config }),
  getReports: (params, config = {}) => apiClient.get('/admin/reports', { params, ...config }),
  // Admin only: ?actor=&action=&from=&to=&page=&limit=
  getAuditLog: (params, config = {}) => apiClient.get('/admin/audit', { params, ...config }),
  // Admin only: new card version, the old card QR stops working
  reissueCard: (userId) => apiClient.post(`/admin/users/${userId}/reissue-card`),
  getNotifications: () => apiClient.get('/admin/notifications'),
  getAllUsers: (params) => apiClient.get('/admin/users', { params }),
  // Student 360 (librarians: students only); ?historyPage=
  getUserOverview: (id, params, config = {}) => apiClient.get(`/admin/users/${id}/overview`, { params, ...config }),
  getUserCard: (id) => apiClient.get(`/admin/users/${id}/card`),
  // "Find a student": Library ID (any case), name or email
  lookupUsers: (q) => apiClient.get('/admin/users/lookup', { params: { q } }),
  createUser: (data) => apiClient.post('/admin/users', data),
  updateUser: (id, data) => apiClient.put(`/admin/users/${id}`, data),
  deleteUser: (id) => apiClient.delete(`/admin/users/${id}`),
  permanentDeleteUser: (id) => apiClient.delete(`/admin/users/${id}/permanent`),
  getPendingRequests: () => apiClient.get('/admin/pending-requests'),
  sendReminders: () => apiClient.post('/admin/send-reminders'),
  issueBook: (data) => apiClient.post('/admin/issue-book', data),
  returnBook: (data) => apiClient.post('/admin/return-book', data),
  globalSearch: (query) => apiClient.get('/admin/search', { params: { query } }),
};

export const fineAPI = {
  initiatePayment: (fineId) => apiClient.post('/fines/initiate-payment', { fineId }),
};

// Wishlist endpoints
export const wishlistAPI = {
  getWishlist: () => apiClient.get('/wishlist'),
  addToWishlist: (bookId) => apiClient.post(`/wishlist/${bookId}`),
  removeFromWishlist: (bookId) => apiClient.delete(`/wishlist/${bookId}`),
};

// Reservation (waiting list) endpoints
export const reservationsAPI = {
  reserve: (bookId) => apiClient.post('/reservations', { bookId }),
  getMine: () => apiClient.get('/reservations/me'),
  // Staff. params: bookId, status (active|waiting|ready|fulfilled|cancelled|expired|all), page, limit
  getAll: (params) => apiClient.get('/reservations', { params }),
  // Staff: books with an active waiting list. params: page, limit
  getQueues: (params) => apiClient.get('/reservations/queues', { params }),
  cancel: (id) => apiClient.delete(`/reservations/${id}`),
};

// Notification endpoints
export const notificationAPI = {
  // params: page, limit, unread ('true'), category
  getNotifications: (params) => apiClient.get('/notifications', { params }),
  markAsRead: (id) => apiClient.put(`/notifications/read/${id}`),
  markAllAsRead: () => apiClient.put('/notifications/read-all'),
};

export default apiClient;

// Scan desk (staff)
export const deskAPI = {
  // A scanned or typed code: library card, book code, Library ID or ISBN
  resolve: (code, config = {}) => apiClient.get('/admin/desk/resolve', { params: { code }, ...config }),
  issue: (userId, bookId) => apiClient.post('/admin/desk/issue', { userId, bookId }),
  returnLoan: (transactionId) => apiClient.post('/admin/desk/return', { transactionId }),
};
