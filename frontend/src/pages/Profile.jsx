import React, { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { MainLayout } from '../layouts/MainLayout';
import { Card, PageHeader } from '../components/UI';
import { ProfileCard } from '../components/profile/ProfileCard';
import { ProfileTabs } from '../components/profile/ProfileTabs';
import { PersonalInfoTab } from '../components/profile/PersonalInfoTab';
import { SecurityTab } from '../components/profile/SecurityTab';
import { PreferencesTab } from '../components/profile/PreferencesTab';
import { ActivityTab } from '../components/profile/ActivityTab';
import { ActivityIcon, HeartIcon, LockIcon, UserIcon } from '../components/profile/ProfileIcons';

const TABS = [
  { key: 'personal', label: 'Personal info', icon: <UserIcon />, description: 'Your name and contact details.' },
  { key: 'security', label: 'Security', icon: <LockIcon />, description: 'Change the password you sign in with.' },
  { key: 'preferences', label: 'Reading preferences', icon: <HeartIcon />, description: 'Genres used for your recommendations.', studentOnly: true },
  { key: 'activity', label: 'Activity', icon: <ActivityIcon />, description: 'What happened recently on your account.' },
];

export const Profile = () => {
  const { user, updateUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const isStudent = user?.role === 'student';

  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [activity, setActivity] = useState([]);
  const [activityLoading, setActivityLoading] = useState(true);
  const [activityError, setActivityError] = useState(null);

  const tabs = TABS.filter((t) => !t.studentOnly || isStudent);
  const requested = searchParams.get('tab');
  const activeTab = tabs.some((t) => t.key === requested) ? requested : 'personal';
  const active = tabs.find((t) => t.key === activeTab);
  const setActiveTab = (key) =>
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (key === 'personal') next.delete('tab');
      else next.set('tab', key);
      return next;
    }, { replace: true });

  const loadStats = useCallback(async () => {
    try {
      const res = await authAPI.getMyStats();
      setStats(res.data?.stats || null);
    } catch {
      setStats(null); // the card shows "—" rather than wrong numbers
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const loadActivity = useCallback(async () => {
    setActivityLoading(true);
    try {
      const res = await authAPI.getMyActivity();
      setActivity(Array.isArray(res.data?.activity) ? res.data.activity : []);
      setActivityError(null);
    } catch (err) {
      setActivityError(err.response?.data?.message || 'Please try again in a moment.');
    } finally {
      setActivityLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
    loadActivity();
  }, [loadStats, loadActivity]);

  // Merge, so fields the response doesn't carry are kept; the Navbar reads the same stored user
  const handleUserChange = useCallback((changes) => updateUser({ ...user, ...changes }), [user, updateUser]);

  if (!user) return null; // ProtectedRoute only renders this page for a signed-in user

  return (
    <MainLayout>
      <div className="mx-auto max-w-6xl">
        <PageHeader title="My profile" subtitle="Your account details, security and activity." className="!mb-6" />

        <div className="grid items-start gap-5 lg:grid-cols-12 lg:gap-6">
          <aside className="min-w-0 lg:col-span-4" aria-label="Profile summary">
            <ProfileCard user={user} stats={stats} statsLoading={statsLoading} onUserChange={handleUserChange} />
          </aside>

          <Card variant="glass" className="min-w-0 !p-4 sm:!p-6 lg:col-span-8">
            <ProfileTabs tabs={tabs} active={activeTab} onChange={setActiveTab} label="Profile sections" />

            <section
              id={`profile-panel-${activeTab}`}
              role="tabpanel"
              aria-labelledby={`profile-tab-${activeTab}`}
              tabIndex={0}
              className="mt-5 rounded-xl focus-visible:outline-offset-4"
            >
              <header className="mb-5">
                <h2 className="font-display text-lg font-semibold text-slate-100">{active.label}</h2>
                <p className="mt-0.5 text-sm text-slate-400">{active.description}</p>
              </header>

              {activeTab === 'personal' && <PersonalInfoTab user={user} onUserChange={handleUserChange} />}
              {activeTab === 'security' && <SecurityTab user={user} />}
              {activeTab === 'preferences' && <PreferencesTab user={user} onUserChange={handleUserChange} />}
              {activeTab === 'activity' && (
                <ActivityTab
                  activity={activity}
                  loading={activityLoading}
                  error={activityError}
                  onRetry={loadActivity}
                  role={user.role}
                />
              )}
            </section>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};
