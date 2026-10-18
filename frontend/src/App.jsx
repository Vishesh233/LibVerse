import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { NotificationProvider } from './context/NotificationContext';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { SplashScreen } from './components/SplashScreen';

import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Dashboard } from './pages/Dashboard';
import { Books } from './pages/Books';
import { MyBooks } from './pages/MyBooks';
import { AdminDashboard } from './pages/AdminDashboard';
import { LibrarianDashboard } from './pages/LibrarianDashboard';
import { PayFine } from './pages/PayFine';
import { ManageBooks } from './pages/ManageBooks';
import { AddBook } from './pages/AddBook';
import { EditBook } from './pages/EditBook';
import { ManageUsers } from './pages/ManageUsers';
import { PendingRequests } from './pages/PendingRequests';
import { Analytics } from './pages/Analytics';
import { Profile } from './pages/Profile';
import { BookDetails } from './pages/BookDetails';
import { Wishlist } from './pages/Wishlist';
import { Fines } from './pages/Fines';
import { IssueReturn } from './pages/IssueReturn';
import { Reports } from './pages/Reports';
import { Onboarding } from './pages/Onboarding';
import { Notifications } from './pages/Notifications';

// Splash shows once per browser session (a refresh in the same tab session skips it)
const SPLASH_KEY = 'libverse:splash-shown';
const SPLASH_MS = 1800;
// The last part of the splash is its exit (cover wall zooms and fades with the foreground)
const SPLASH_EXIT_MS = 380;

const splashAlreadyShown = () => {
  try {
    return sessionStorage.getItem(SPLASH_KEY) === '1';
  } catch (e) {
    return false; // storage blocked: just show it
  }
};

function App() {
  const [showSplash, setShowSplash] = useState(() => !splashAlreadyShown());
  const [splashExiting, setSplashExiting] = useState(false);

  useEffect(() => {
    if (!showSplash) return undefined;
    try {
      sessionStorage.setItem(SPLASH_KEY, '1'); // set immediately so a refresh during the splash doesn't replay it
    } catch (e) {
      /* storage unavailable */
    }
    const exitTimer = setTimeout(() => setSplashExiting(true), SPLASH_MS - SPLASH_EXIT_MS);
    const timer = setTimeout(() => setShowSplash(false), SPLASH_MS);
    return () => {
      clearTimeout(exitTimer);
      clearTimeout(timer);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (showSplash) return <SplashScreen duration={SPLASH_MS - SPLASH_EXIT_MS} exiting={splashExiting} />;

  return (
    <div className="dark min-h-screen bg-[#020713] text-slate-100">
      <Router>
        <AuthProvider>
          <NotificationProvider>
            <Routes>

          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Student Routes */}
          <Route
            path="/student/onboarding"
            element={
              <ProtectedRoute requiredRole="student" requireOnboarding={false}>
                <Onboarding />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute requiredRole="student" requireOnboarding={false}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/books/:id"
            element={
              <ProtectedRoute requiredRole="student">
                <BookDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/books"
            element={
              <ProtectedRoute requiredRole="student">
                <Books />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/my-books"
            element={
              <ProtectedRoute requiredRole="student">
                <MyBooks />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/wishlist"
            element={
              <ProtectedRoute requiredRole="student">
                <Wishlist />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/fines"
            element={
              <ProtectedRoute requiredRole="student">
                <Fines />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/pay-fine/:fineId"
            element={
              <ProtectedRoute requiredRole="student">
                <PayFine />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/notifications"
            element={
              <ProtectedRoute requiredRole="student">
                <Notifications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/profile"
            element={
              <ProtectedRoute requiredRole="student">
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/settings"
            element={
              <ProtectedRoute requiredRole="student">
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Librarian Routes */}
          <Route
            path="/librarian"
            element={
              <ProtectedRoute requiredRole="librarian">
                <LibrarianDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/librarian/books"
            element={
              <ProtectedRoute requiredRole="librarian">
                <ManageBooks />
              </ProtectedRoute>
            }
          />
          <Route
            path="/librarian/books/add"
            element={
              <ProtectedRoute requiredRole="librarian">
                <AddBook />
              </ProtectedRoute>
            }
          />
          <Route
            path="/librarian/books/:id"
            element={
              <ProtectedRoute requiredRole="librarian">
                <BookDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/librarian/books/:id/edit"
            element={
              <ProtectedRoute requiredRole="librarian">
                <EditBook />
              </ProtectedRoute>
            }
          />
          <Route
            path="/librarian/users"
            element={
              <ProtectedRoute requiredRole="librarian">
                <ManageUsers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/librarian/pending"
            element={
              <ProtectedRoute requiredRole="librarian">
                <PendingRequests />
              </ProtectedRoute>
            }
          />
          <Route
            path="/librarian/issue-return"
            element={
              <ProtectedRoute requiredRole="librarian">
                <IssueReturn />
              </ProtectedRoute>
            }
          />
          <Route
            path="/librarian/analytics"
            element={
              <ProtectedRoute requiredRole="librarian">
                <Analytics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/librarian/reports"
            element={
              <ProtectedRoute requiredRole="librarian">
                <Reports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/librarian/notifications"
            element={
              <ProtectedRoute requiredRole="librarian">
                <Notifications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/librarian/profile"
            element={
              <ProtectedRoute requiredRole="librarian">
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/librarian/settings"
            element={
              <ProtectedRoute requiredRole="librarian">
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/books"
            element={
              <ProtectedRoute requiredRole="admin">
                <ManageBooks />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/books/add"
            element={
              <ProtectedRoute requiredRole="admin">
                <AddBook />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/books/:id"
            element={
              <ProtectedRoute requiredRole="admin">
                <BookDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/books/:id/edit"
            element={
              <ProtectedRoute requiredRole="admin">
                <EditBook />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/issue-return"
            element={
              <ProtectedRoute requiredRole="admin">
                <IssueReturn />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute requiredRole="admin">
                <ManageUsers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/pending"
            element={
              <ProtectedRoute requiredRole="admin">
                <PendingRequests />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/analytics"
            element={
              <ProtectedRoute requiredRole="admin">
                <Analytics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <ProtectedRoute requiredRole="admin">
                <Reports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/notifications"
            element={
              <ProtectedRoute requiredRole="admin">
                <Notifications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/profile"
            element={
              <ProtectedRoute requiredRole="admin">
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute requiredRole="admin">
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Default Redirect */}
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="*" element={<Navigate to="/login" />} />

        </Routes>
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="dark" />
      </NotificationProvider>
      </AuthProvider>
    </Router>
  </div>
  );
}

export default App;