import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const roleMap = {
  student: ['student'],
  librarian: ['librarian'],
  admin: ['admin', 'superadmin'],
};

const roleRedirectPath = {
  student: '/student/dashboard',
  librarian: '/librarian',
  admin: '/admin',
};

export const ProtectedRoute = ({ children, requiredRole = null, requireOnboarding = true }) => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

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
    if (!isAuthenticated) {
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
  }, [isAuthenticated, isRoleAllowed, needsOnboarding, navigate, user]);

  if (!isAuthenticated) return null;
  if (!isRoleAllowed) return null;
  if (needsOnboarding) return null;

  return children;
};
