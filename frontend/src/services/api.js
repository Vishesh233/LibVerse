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
const CREDENTIAL_ENDPOINTS = ['/auth/login', '/auth/signup', '/auth/change-password'];

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
  updateProfile: (data) => apiClient.put('/auth/update-profile', data),
  completeOnboarding: (data) => apiClient.put('/auth/complete-onboarding', data),
  updateFavoriteGenres: (data) => apiClient.put('/auth/update-favorite-genres', data),
  changePassword: (data) => apiClient.put('/auth/change-password', data),
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
  getAllTransactions: (params) => apiClient.get('/transactions', { params }),
  approveIssueRequest: (id) => apiClient.put(`/transactions/${id}/approve`),
  rejectIssueRequest: (id) => apiClient.put(`/transactions/${id}/reject`),
  approveReturn: (id) => apiClient.put(`/transactions/${id}/approve-return`),
  submitPayment: (id, data) => apiClient.put(`/transactions/${id}/submit-payment`, data),
  approvePayment: (id) => apiClient.put(`/transactions/${id}/approve-payment`),
  getPaymentScreenshot: (id) => apiClient.get(`/transactions/${id}/payment-screenshot`),
};

// Admin endpoints
export const adminAPI = {
  getDashboard: () => apiClient.get('/admin/dashboard'),
  getReports: (params) => apiClient.get('/admin/reports', { params }),
  getNotifications: () => apiClient.get('/admin/notifications'),
  getAllUsers: (params) => apiClient.get('/admin/users', { params }),
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

// Notification endpoints
export const notificationAPI = {
  getNotifications: () => apiClient.get('/notifications'),
  markAsRead: (id) => apiClient.put(`/notifications/read/${id}`),
  markAllAsRead: () => apiClient.put('/notifications/read-all'),
};

export default apiClient;
