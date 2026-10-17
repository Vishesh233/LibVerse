import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { MainLayout } from '../layouts/MainLayout';
import { Button, Card, EmptyState, PageHeader, Skeleton } from '../components/UI';
import { Pagination } from '../components/Pagination';
import { NotificationItem, NOTIFICATION_CATEGORIES } from '../components/NotificationItem';
import { notificationAPI } from '../services/api';
import { useNotification } from '../hooks/useNotification';

const PAGE_SIZE = 20;
const READ_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread' },
];

const chipClass = (selected) =>
  `min-h-[36px] flex-shrink-0 rounded-full border px-3.5 text-xs font-semibold transition-colors ${
    selected
      ? 'border-indigo-400/40 bg-indigo-500/15 text-white'
      : 'border-border text-slate-400 hover:border-slate-500 hover:text-slate-200'
  }`;

/** Full notification history for the signed-in user (students, librarians and admins share it) */
export const Notifications = () => {
  const navigate = useNavigate();
  const { unreadCount, markAsRead, markAllRead, refreshNotifications } = useNotification();
  const [readFilter, setReadFilter] = useState('all');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ notifications: [], pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [markingAll, setMarkingAll] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, limit: PAGE_SIZE };
      if (readFilter === 'unread') params.unread = 'true';
      if (category) params.category = category;
      const res = await notificationAPI.getNotifications(params);
      setData({
        notifications: res.data.notifications || [],
        pages: res.data.pages || 1,
        total: res.data.total || 0,
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [page, readFilter, category]);

  useEffect(() => {
    load();
  }, [load]);

  // A filter change starts again at page 1
  const changeFilter = (setter) => (value) => {
    setter(value);
    setPage(1);
  };

  const handleSelect = async (notification) => {
    if (!notification.isRead) {
      try {
        await markAsRead(notification._id);
        setData((d) => ({
          ...d,
          notifications: d.notifications.map((n) => (n._id === notification._id ? { ...n, isRead: true } : n)),
        }));
      } catch (err) {
        toast.error('Could not mark the notification as read');
      }
    }
    if (notification.link) navigate(notification.link);
  };

  const handleMarkAll = async () => {
    setMarkingAll(true);
    try {
      await markAllRead();
      await load();
      refreshNotifications();
      toast.success('All notifications marked as read');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not mark all as read');
    } finally {
      setMarkingAll(false);
    }
  };

  const filtered = readFilter === 'unread' || category;

  return (
    <MainLayout>
      <div className="mx-auto max-w-3xl">
        <PageHeader
          title="Notifications"
          subtitle={unreadCount > 0 ? `${unreadCount} unread` : 'You are all caught up'}
          actions={
            <Button variant="secondary" size="sm" fullWidth={false} loading={markingAll} disabled={unreadCount === 0} onClick={handleMarkAll}>
              Mark all as read
            </Button>
          }
        />

        <div className="mb-4 space-y-3">
          <div className="flex gap-2" role="group" aria-label="Read status">
            {READ_FILTERS.map((f) => (
              <button key={f.key} type="button" aria-pressed={readFilter === f.key} onClick={() => changeFilter(setReadFilter)(f.key)} className={chipClass(readFilter === f.key)}>
                {f.label}
              </button>
            ))}
          </div>
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0" role="group" aria-label="Type">
            <button type="button" aria-pressed={!category} onClick={() => changeFilter(setCategory)('')} className={chipClass(!category)}>
              All types
            </button>
            {NOTIFICATION_CATEGORIES.map((c) => (
              <button
                key={c.key}
                type="button"
                aria-pressed={category === c.key}
                onClick={() => changeFilter(setCategory)(c.key)}
                className={chipClass(category === c.key)}
              >
                <span className="mr-1.5 inline-block h-2 w-2 rounded-full align-middle" style={{ background: c.color }} aria-hidden="true" />
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <Card variant="glass" className="!p-0 overflow-hidden">
          {loading ? (
            <div className="divide-y divide-border">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex gap-3 px-4 py-4">
                  <Skeleton className="h-9 w-9 !rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3.5 w-1/2" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <EmptyState bare icon="⚠️" title="Couldn't load notifications" message={error} action={<Button fullWidth={false} variant="secondary" onClick={load}>Try again</Button>} />
          ) : data.notifications.length === 0 ? (
            <EmptyState
              bare
              icon="🔔"
              title={filtered ? 'Nothing matches these filters' : 'No notifications yet'}
              message={filtered ? 'Try another filter.' : 'Updates about requests, returns, fines and reminders will appear here.'}
            />
          ) : (
            <div className="divide-y divide-border" aria-live="polite">
              {data.notifications.map((n) => (
                <NotificationItem key={n._id} notification={n} onSelect={handleSelect} wrapMessage />
              ))}
            </div>
          )}
        </Card>

        {!loading && !error && data.total > 0 && (
          <p className="mt-3 text-center text-xs text-muted">
            {data.total} notification{data.total === 1 ? '' : 's'}
          </p>
        )}
        <Pagination currentPage={page} totalPages={data.pages} onPageChange={setPage} />
      </div>
    </MainLayout>
  );
};
