import React, { createContext, useCallback, useEffect, useRef, useState } from 'react';
import { notificationAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';

export const NotificationContext = createContext();

const PANEL_LIMIT = 10;
const REFRESH_MS = 60 * 1000;

/**
 * The signed-in user's latest notifications (for the navbar panel) and unread count.
 * - Bound to the current user: cleared on logout / user switch, so one account never sees another's items.
 * - unreadCount always comes from the server (no local +1/-1 arithmetic that can drift).
 * - Refreshes on sign-in, window focus and every 60s while the tab is visible.
 */
export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const userId = user?._id || user?.id || null;
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const currentUser = useRef(userId);

  const refreshNotifications = useCallback(async () => {
    if (!userId || !localStorage.getItem('token')) return;
    setLoading(true);
    try {
      const res = await notificationAPI.getNotifications({ limit: PANEL_LIMIT });
      if (currentUser.current !== userId || !res?.data?.success) return; // signed out / switched meanwhile
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    currentUser.current = userId;
    setNotifications([]);
    setUnreadCount(0);
    if (!userId) return undefined;

    refreshNotifications();
    const onFocus = () => refreshNotifications();
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') refreshNotifications();
    }, REFRESH_MS);
    window.addEventListener('focus', onFocus);
    return () => {
      clearInterval(timer);
      window.removeEventListener('focus', onFocus);
    };
  }, [userId, refreshNotifications]);

  /** Mark one notification read; resolves with the server's unread count */
  const markAsRead = useCallback(async (id) => {
    const res = await notificationAPI.markAsRead(id);
    setNotifications((current) => current.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
    if (typeof res?.data?.unreadCount === 'number') setUnreadCount(res.data.unreadCount);
    return res?.data?.unreadCount;
  }, []);

  const markAllRead = useCallback(async () => {
    await notificationAPI.markAllAsRead();
    setNotifications((current) => current.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllRead,
        refreshNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
