import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const roleMap = {
  student: ['student'],
  librarian: ['librarian'],
  admin: ['admin'],
};

const roleRedirectPath = {
  student: '/student/dashboard',
  librarian: '/librarian',
  admin: '/admin',
};

export const ProtectedRoute = ({ children, requiredRole = null, requireOnboarding = true }) => {
  const { isAuthenticated, user, isRefreshingUser, logout } = useAuth();
  const navigate = useNavigate();
  const knownRole = Object.keys(roleMap).includes(user?.role);

  const isRoleAllowed = React.useMemo(() => {
    if (!requiredRole) return true;
    const allowedRoles = roleMap[requiredRole];
    return allowedRoles?.includes(user?.role);
  }, [requiredRole, user]);

  const needsOnboarding = React.useMemo(() => {
    if (!requireOnboarding) return false;
    return user?.role === 'student' && !user?.isOnboardingCompleted;
  }, [requireOnboarding, user]);

  React.useEffect(() => {
    // Wait for the on-load /auth/me refresh before judging the (possibly stale) stored role
    if (isRefreshingUser) return;
    if (!isAuthenticated) {
      navigate('/login');
    } else if (!knownRole) {
      // Role the app doesn't know (e.g. a removed role): redirecting by role would loop, so sign out
      logout();
      navigate('/login');
    } else if (!isRoleAllowed) {
      const redirect = user?.role === 'student'
        ? roleRedirectPath.student
        : user?.role === 'librarian'
        ? roleRedirectPath.librarian
        : roleRedirectPath.admin;
      navigate(redirect);
    } else if (needsOnboarding) {
      navigate('/student/onboarding');
    }
  }, [isRefreshingUser, isAuthenticated, knownRole, isRoleAllowed, needsOnboarding, navigate, user, logout]);

  if (isAuthenticated && isRefreshingUser) {
    return (
      <div className="min-h-screen grid place-items-center text-sm text-slate-400">Loading your account...</div>
    );
  }
  if (!isAuthenticated) return null;
  if (!knownRole) return null;
  if (!isRoleAllowed) return null;
  if (needsOnboarding) return null;

  return children;
};
