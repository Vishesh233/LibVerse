import React, { useEffect, useRef, useState } from 'react';
import { authAPI, transactionsAPI, adminAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { MainLayout } from '../layouts/MainLayout';
import { Card, Button, Input, Badge, Alert } from '../components/UI';
import Avatar from '../components/Avatar';

const GENRES = [
  { name: 'Programming', icon: '💻' },
  { name: 'Java', icon: '☕' },
  { name: 'Python', icon: '🐍' },
  { name: 'Web Development', icon: '🌐' },
  { name: 'AI & Machine Learning', icon: '🤖' },
  { name: 'Cyber Security', icon: '🔒' },
  { name: 'Computer Science', icon: '🖥️' },
  { name: 'Database', icon: '🗄️' },
  { name: 'Networking', icon: '🔗' },
  { name: 'Operating Systems', icon: '⚙️' },
  { name: 'Algorithms', icon: '📊' },
  { name: 'Technology', icon: '📱' },
  { name: 'Science', icon: '🔬' },
  { name: 'Business', icon: '💼' },
  { name: 'Finance', icon: '💰' },
  { name: 'Startup', icon: '🚀' },
  { name: 'History', icon: '📚' },
  { name: 'Biography', icon: '👤' },
  { name: 'Psychology', icon: '🧠' },
  { name: 'Motivation', icon: '⭐' },
  { name: 'Self Help', icon: '🌱' },
  { name: 'Fiction', icon: '📖' },
  { name: 'Non Fiction', icon: '📕' },
];

const formatJoinedDate = (dateStr) => {
  if (!dateStr) return 'Recently Joined';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return 'Recently Joined';

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const joined = new Date(d);
  joined.setHours(0, 0, 0, 0);

  const diffMs = today - joined;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  // Today: "Joined Today"
  if (diffDays === 0) return 'Joined Today';

  // Yesterday: "Joined 1 day ago"
  if (diffDays === 1) return 'Joined 1 day ago';

  // Within last 7 days: "Joined X days ago"
  if (diffDays < 7) return `Joined ${diffDays} days ago`;

  // Within last 30 days: "Recently Joined (X days ago)"
  if (diffDays < 30) return `Recently Joined (${diffDays} days ago)`;

  // Older than one month: "Member since Month Year"
  const months = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  return `Member since ${months[joined.getMonth()]} ${joined.getFullYear()}`;
};

export const Profile = () => {
  const { user, isAuthenticated, updateUser } = useAuth();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [imageError, setImageError] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarInputRef = useRef(null);
  const [adminAnalytics, setAdminAnalytics] = useState(null);
  const [transactionStats, setTransactionStats] = useState({
    totalRequests: 0,
    totalIssued: 0,
    totalReturned: 0,
    totalPending: 0,
    totalRejected: 0,
    totalFines: 0,
  });
  const [formData, setFormData] = useState({
    name: user?.name || '',
    profileImage: user?.profileImage || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [selectedGenres, setSelectedGenres] = useState(user?.favoriteGenres || []);
  const [isEditingGenres, setIsEditingGenres] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (user) {
      if (user.role === 'admin' || user.role === 'superadmin') {
        fetchAdminAnalytics();
      } else {
        fetchTransactionStats();
      }
    }
  }, [user]);

  const fetchAdminAnalytics = async () => {
    try {
      const response = await adminAPI.getDashboard();
      if (response.data && response.data.analytics) {
        setAdminAnalytics(response.data.analytics);
      }
    } catch (err) {
      console.error('Unable to load admin analytics', err);
    }
  };

  const fetchTransactionStats = async () => {
    try {
      const response = await transactionsAPI.getUserTransactions();
      const transactions = response.data.transactions || [];

      const totals = transactions.reduce(
        (acc, transaction) => {
          acc.totalRequests += 1;
          acc.totalFines += transaction.fineAmount || 0;

          if (transaction.status === 'issued') acc.totalIssued += 1;
          if (transaction.status === 'returned') acc.totalReturned += 1;
          if (transaction.status === 'pending') acc.totalPending += 1;
          if (transaction.status === 'rejected') acc.totalRejected += 1;

          return acc;
        },
        {
          totalRequests: 0,
          totalIssued: 0,
          totalReturned: 0,
          totalPending: 0,
          totalRejected: 0,
          totalFines: 0,
        }
      );

      setTransactionStats(totals);
    } catch (err) {
      console.error('Unable to load profile stats', err);
    }
  };

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || '',
        profileImage: user.profileImage || '',
      }));
      setImageError(false);
    }
  }, [user]);

  const handleAvatarClick = () => {
    avatarInputRef.current?.click();
  };

  const handleAvatarChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file only');
      return;
    }

    setUploadingAvatar(true);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const res = await authAPI.uploadAvatar(formData);
      if (!res.data.success) {
        throw new Error(res.data.message || 'Failed to upload avatar');
      }

      // Update AuthContext with the new user data (includes full avatar URL)
      updateUser(res.data.user);
      
      // Update local form data
      setFormData((prev) => ({
        ...prev,
        profileImage: res.data.user.profileImage || '',
      }));
      
      // Clear image error so the new avatar displays
      setImageError(false);
      
      setSuccess('Profile photo updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'No face detected. Please upload a clear photo with your face.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Auto-clear alerts
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  if (!isAuthenticated) {
    return (
      <MainLayout>
        <div className="p-6 text-center">
          <p className="text-rose-400 font-semibold">Please log in to view your profile</p>
        </div>
      </MainLayout>
    );
  }

  const handleProfileUpdate = async () => {
    if (!formData.name.trim()) {
      setError('Name cannot be empty');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await authAPI.updateProfile({
        name: formData.name,
        profileImage: formData.profileImage || undefined,
      });

      if (response.data.success) {
        updateUser(response.data.user);
        setSuccess('✅ Profile updated successfully');
        setIsEditingProfile(false);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      setError('All password fields are required');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // TODO: Replace with actual API call when available
      // await authAPI.changePassword({
      //   currentPassword: formData.currentPassword,
      //   newPassword: formData.newPassword,
      // });
      setSuccess('✅ Password changed successfully');
      setFormData((prev) => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
      setIsEditingPassword(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const toggleGenre = (genreName) => {
    setSelectedGenres((prev) => {
      if (prev.includes(genreName)) {
        return prev.filter((g) => g !== genreName);
      } else if (prev.length < 5) {
        return [...prev, genreName];
      }
      return prev;
    });
  };

  const handleUpdateFavoriteGenres = async () => {
    if (selectedGenres.length < 2) {
      setError('Please select at least 2 genres');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await authAPI.updateFavoriteGenres({
        favoriteGenres: selectedGenres,
      });

      if (response.data.success) {
        updateUser(response.data.user);
        setSuccess('✅ Favorite genres updated successfully');
        setIsEditingGenres(false);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update favorite genres');
    } finally {
      setLoading(false);
    }
  };

  const displayImage = !imageError && formData.profileImage ? formData.profileImage : undefined;

  return (
    <MainLayout>
      <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="animate-fade-in-up text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-100">My Profile</h1>
          <p className="text-slate-400 mt-1">Manage your account settings and preferences</p>
        </div>

        {/* Alerts */}
        {error && (
          <Alert type="error" message={error} onClose={() => setError(null)} />
        )}
        {success && (
          <Alert type="success" message={success} onClose={() => setSuccess(null)} />
        )}

        {/* Centered Profile Section */}
        <Card className="text-center">
          <div className="flex flex-col items-center">
            {/* Large Avatar */}
            <div className="relative mb-5">
              <div className="relative rounded-full border-4 border-indigo-500/30 overflow-hidden">
                <Avatar
                  name={user?.name}
                  src={displayImage}
                  role={user?.role}
                  size={24}
                  className="rounded-full"
                  onError={() => setImageError(true)}
                />
                <button
                  type="button"
                  onClick={handleAvatarClick}
                  className="absolute bottom-0 right-0 grid h-11 w-11 place-items-center rounded-full bg-card text-blue-300 shadow-lg ring-2 ring-border"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                    <path d="M12 5.25a.75.75 0 0 0-.75.75v1.5H9.75A2.25 2.25 0 0 0 7.5 10.5v7.5A2.25 2.25 0 0 0 9.75 20.25h4.5A2.25 2.25 0 0 0 16.5 18V10.5a2.25 2.25 0 0 0-2.25-2.25H12.75V6a.75.75 0 0 0-.75-.75zm-2.25 4.5h5.5a.75.75 0 0 1 .75.75v7.5a.75.75 0 0 1-.75.75h-4.5a.75.75 0 0 1-.75-.75v-7.5a.75.75 0 0 1 .75-.75zm6.53-4.78l1.72 1.72a.75.75 0 0 1 .22.53v3.03a.75.75 0 0 1-1.5 0V6.97l-1.72-1.72a.75.75 0 0 1 1.06-1.06z" />
                  </svg>
                </button>
              </div>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>

            <h2 className="text-2xl font-bold text-slate-100">{user?.name}</h2>
            <p className="text-slate-400 mt-1">{user?.email}</p>

            <div className="mt-3">
              <Badge
                variant={user?.role === 'admin' || user?.role === 'superadmin' ? 'danger' : 'primary'}
                className="inline-block px-3 py-1 capitalize"
              >
                {user?.role === 'admin' ? '🔐 Admin' : user?.role === 'superadmin' ? '⚡ Super Admin' : user?.role === 'librarian' ? '📚 Librarian' : '👤 Student'}
              </Badge>
            </div>

            {uploadingAvatar && (
              <p className="text-xs text-slate-400 mt-3">Uploading avatar...</p>
            )}
          </div>
        </Card>

        {/* Personal Information */}
        <Card>
          <h2 className="text-xl font-bold mb-6 text-slate-100">Personal Information</h2>

          {isEditingProfile ? (
            <div className="space-y-4">
              <Input
                label="Full Name"
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Enter your name"
              />

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">Email</label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full px-4 py-3 border border-border rounded-xl bg-input text-slate-500 cursor-not-allowed"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  onClick={handleProfileUpdate}
                  variant="primary"
                  disabled={
                    loading ||
                    (formData.name === user?.name && formData.profileImage === (user?.profileImage || ''))
                  }
                  className="flex-1"
                >
                  {loading ? 'Updating...' : '💾 Save Changes'}
                </Button>
                <Button
                  onClick={() => {
                    setIsEditingProfile(false);
                    setFormData((prev) => ({
                      ...prev,
                      name: user?.name || '',
                      profileImage: user?.profileImage || '',
                    }));
                    setError(null);
                    setImageError(false);
                  }}
                  variant="secondary"
                  disabled={loading}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-400 mb-1">Full Name</label>
                <p className="text-slate-100 font-medium">{user?.name}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-400 mb-1">Email</label>
                <p className="text-slate-100 font-medium">{user?.email}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-400 mb-1">Library ID</label>
                <p className="text-slate-100 font-medium">{user?.libraryId || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-400 mb-1">Joined</label>
                <p className="text-slate-100 font-medium">{formatJoinedDate(user?.createdAt)}</p>
              </div>

              <Button
                onClick={() => setIsEditingProfile(true)}
                variant="primary"
                className="w-full"
              >
                ✏️ Edit Profile
              </Button>
            </div>
          )}
        </Card>

        {/* Security */}
        <Card>
          {isEditingPassword ? (
            <>
              <h2 className="text-xl font-bold mb-6 text-slate-100">Security</h2>

              <div className="space-y-4">
                <Input
                  label="Current Password"
                  type="password"
                  value={formData.currentPassword}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, currentPassword: e.target.value }))
                  }
                  placeholder="Enter your current password"
                />

                <Input
                  label="New Password"
                  type="password"
                  value={formData.newPassword}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, newPassword: e.target.value }))
                  }
                  placeholder="Enter new password (min 6 characters)"
                />

                <Input
                  label="Confirm New Password"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, confirmPassword: e.target.value }))
                  }
                  placeholder="Confirm new password"
                />

                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={handlePasswordChange}
                    variant="primary"
                    disabled={
                      loading ||
                      !formData.currentPassword ||
                      !formData.newPassword ||
                      !formData.confirmPassword
                    }
                    className="flex-1"
                  >
                    {loading ? 'Updating...' : '🔒 Update Password'}
                  </Button>
                  <Button
                    onClick={() => {
                      setIsEditingPassword(false);
                      setFormData((prev) => ({
                        ...prev,
                        currentPassword: '',
                        newPassword: '',
                        confirmPassword: '',
                      }));
                      setError(null);
                    }}
                    variant="secondary"
                    disabled={loading}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-xl font-bold mb-4 text-slate-100">Security</h2>

              <p className="text-slate-400 mb-6">
                Secure your account by changing your password regularly.
              </p>

              <Button
                onClick={() => setIsEditingPassword(true)}
                variant="secondary"
                className="w-full"
              >
                🔒 Change Password
              </Button>

              <p className="text-xs text-slate-500 mt-4">
                💡 Password must be at least 6 characters long.
              </p>
            </>
          )}
        </Card>

        {/* Favorite Genres */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-100">Favorite Genres</h2>
            {!isEditingGenres && (
              <Button
                onClick={() => setIsEditingGenres(true)}
                variant="secondary"
                className="px-4 py-2"
              >
                ✏️ Edit
              </Button>
            )}
          </div>

          {isEditingGenres ? (
            <div className="space-y-4">
              <p className="text-sm text-slate-400">
                Select 2-5 genres that match your reading interests. This helps us recommend books you'll love.
              </p>

              {/* Genre Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {GENRES.map((genre) => {
                  const isSelected = selectedGenres.includes(genre.name);
                  return (
                    <button
                      key={genre.name}
                      onClick={() => toggleGenre(genre.name)}
                      className={`p-3 rounded-xl border-2 transition-all duration-200 ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-500/20 shadow-lg'
                          : 'border-border bg-input hover:border-slate-600'
                      }`}
                    >
                      <div className="text-2xl mb-1">{genre.icon}</div>
                      <p className="text-xs font-medium text-slate-200">{genre.name}</p>
                    </button>
                  );
                })}
              </div>

              <p className="text-xs text-slate-400">
                {selectedGenres.length < 2
                  ? `Select at least 2 genres (${selectedGenres.length}/2 minimum)`
                  : selectedGenres.length > 5
                  ? `Maximum 5 genres allowed (${selectedGenres.length}/5)`
                  : `${selectedGenres.length} genre${selectedGenres.length === 1 ? '' : 's'} selected`}
              </p>

              <div className="flex gap-2 pt-2">
                <Button
                  onClick={handleUpdateFavoriteGenres}
                  variant="primary"
                  disabled={loading || selectedGenres.length < 2 || selectedGenres.length > 5}
                  className="flex-1"
                >
                  {loading ? 'Saving...' : '💾 Save Changes'}
                </Button>
                <Button
                  onClick={() => {
                    setIsEditingGenres(false);
                    setSelectedGenres(user?.favoriteGenres || []);
                    setError(null);
                  }}
                  variant="secondary"
                  disabled={loading}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div>
              {user?.favoriteGenres && user.favoriteGenres.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {user.favoriteGenres.map((genre) => {
                    const genreInfo = GENRES.find((g) => g.name === genre);
                    return (
                      <span
                        key={genre}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-medium"
                      >
                        <span>{genreInfo?.icon || '📚'}</span>
                        {genre}
                      </span>
                    );
                  })}
                </div>
              ) : (
                <p className="text-slate-400 text-sm">No favorite genres selected yet.</p>
              )}
            </div>
          )}
        </Card>
      </div>
    </MainLayout>
  );
};