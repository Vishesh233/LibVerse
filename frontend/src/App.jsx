import React, { Suspense, lazy, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { NotificationProvider } from './context/NotificationContext';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import { useDemoMode } from './hooks/useDemoMode';
import { ProtectedRoute } from './components/ProtectedRoute';
import { SplashScreen } from './components/SplashScreen';
import { Loader } from './components/Loader';
import { Skeleton } from './components/UI';
import { MainLayout } from './layouts/MainLayout';

// Each page is its own chunk, downloaded the first time its route is opened
const page = (load, name) => lazy(() => load().then((m) => ({ default: m[name] })));
const Login = page(() => import('./pages/Login'), 'Login');
const Signup = page(() => import('./pages/Signup'), 'Signup');
const Dashboard = page(() => import('./pages/Dashboard'), 'Dashboard');
const Books = page(() => import('./pages/Books'), 'Books');
const MyBooks = page(() => import('./pages/MyBooks'), 'MyBooks');
const AdminDashboard = page(() => import('./pages/AdminDashboard'), 'AdminDashboard');
const LibrarianDashboard = page(() => import('./pages/LibrarianDashboard'), 'LibrarianDashboard');
const PayFine = page(() => import('./pages/PayFine'), 'PayFine');
const ManageBooks = page(() => import('./pages/ManageBooks'), 'ManageBooks');
const AddBook = page(() => import('./pages/AddBook'), 'AddBook');
const EditBook = page(() => import('./pages/EditBook'), 'EditBook');
const ManageUsers = page(() => import('./pages/ManageUsers'), 'ManageUsers');
const PendingRequests = page(() => import('./pages/PendingRequests'), 'PendingRequests');
const Analytics = page(() => import('./pages/Analytics'), 'Analytics');
const Profile = page(() => import('./pages/Profile'), 'Profile');
const BookDetails = page(() => import('./pages/BookDetails'), 'BookDetails');
const Wishlist = page(() => import('./pages/Wishlist'), 'Wishlist');
const Fines = page(() => import('./pages/Fines'), 'Fines');
const IssueReturn = page(() => import('./pages/IssueReturn'), 'IssueReturn');
const Reports = page(() => import('./pages/Reports'), 'Reports');
const AuditLog = page(() => import('./pages/AuditLog'), 'AuditLog');
const Onboarding = page(() => import('./pages/Onboarding'), 'Onboarding');
const Notifications = page(() => import('./pages/Notifications'), 'Notifications');
const ScanDesk = page(() => import('./pages/ScanDesk'), 'ScanDesk');
const QrLabels = page(() => import('./pages/QrLabels'), 'QrLabels');
const StudentOverview = page(() => import('./pages/StudentOverview'), 'StudentOverview');
const ImportBooks = page(() => import('./pages/ImportBooks'), 'ImportBooks');
const ForgotPassword = page(() => import('./pages/ForgotPassword'), 'ForgotPassword');
const DemoRedirect = page(() => import('./pages/DemoRedirect'), 'DemoRedirect');
const Privacy = page(() => import('./pages/Privacy'), 'Privacy');
const Terms = page(() => import('./pages/Terms'), 'Terms');

// Pages without the app chrome (sidebar + navbar)
const BARE_PATHS = ['/login', '/signup', '/forgot-password', '/demo', '/privacy', '/terms', '/student/onboarding'];

/** Signup and password reset do not exist on the live demo instance: go to the demo buttons */
const NotOnDemo = ({ children }) => {
  const demoMode = useDemoMode();
  if (demoMode === null) return null;
  return demoMode ? <Navigate to="/login" replace /> : children;
};

/** Shown while a page's chunk downloads: signed-in pages keep the sidebar and navbar in place */
const PageFallback = () => {
  const { isAuthenticated } = useAuth();
  const { pathname } = useLocation();
  if (!isAuthenticated || BARE_PATHS.includes(pathname)) {
    return (
      <div className="min-h-screen grid place-items-center">
        <Loader />
      </div>
    );
  }
  return (
    <MainLayout>
      <div role="status" aria-label="Loading page" className="space-y-6">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-4 w-96 max-w-full" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 w-full !rounded-2xl" />)}
        </div>
        <Skeleton className="h-64 w-full !rounded-2xl" />
      </div>
    </MainLayout>
  );
};

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
            <Suspense fallback={<PageFallback />}>
            <Routes>

          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<NotOnDemo><Signup /></NotOnDemo>} />
          <Route path="/forgot-password" element={<NotOnDemo><ForgotPassword /></NotOnDemo>} />
          {/* Full app: off to the live demo site (VITE_DEMO_APP_URL); demo site: the role picker */}
          <Route path="/demo" element={<DemoRedirect />} />
          {/* Public on both sites, signed in or not */}
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />

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
            path="/librarian/books/labels"
            element={
              <ProtectedRoute requiredRole="librarian">
                <QrLabels />
              </ProtectedRoute>
            }
          />
          <Route
            path="/librarian/scan"
            element={
              <ProtectedRoute requiredRole="librarian">
                <ScanDesk />
              </ProtectedRoute>
            }
          />
          <Route
            path="/librarian/books/import"
            element={
              <ProtectedRoute requiredRole="librarian">
                <ImportBooks />
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
            path="/librarian/users/:id"
            element={
              <ProtectedRoute requiredRole="librarian">
                <StudentOverview />
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
            path="/admin/books/labels"
            element={
              <ProtectedRoute requiredRole="admin">
                <QrLabels />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/scan"
            element={
              <ProtectedRoute requiredRole="admin">
                <ScanDesk />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/books/import"
            element={
              <ProtectedRoute requiredRole="admin">
                <ImportBooks />
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
            path="/admin/users/:id"
            element={
              <ProtectedRoute requiredRole="admin">
                <StudentOverview />
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
            path="/admin/audit"
            element={
              <ProtectedRoute requiredRole="admin">
                <AuditLog />
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
            </Suspense>
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="dark" />
      </NotificationProvider>
      </AuthProvider>
    </Router>
  </div>
  );
}

export default App;