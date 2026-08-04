import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { notificationAPI } from '../services/api';

const STORAGE_KEY = 'smart-library-notifications';
export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Fetch notifications from backend
  const fetchNotifications = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    setLoading(true);
    try {
      const res = await notificationAPI.getNotifications();
      if (res?.data?.success) {
        const rawNotifications = res.data.notifications || [];
        const formattedNotifications = rawNotifications.map((notif) => ({
          id: notif._id,
          _id: notif._id,
          title: notif.title,
          message: notif.message,
          type: notif.type,
          isRead: notif.isRead,
          read: notif.isRead,
          createdAt: notif.createdAt,
          userId: notif.userId,
          role: notif.role,
        }));
        setNotifications(formattedNotifications);
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load notifications on mount and when user changes
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchNotifications();
    }
  }, [fetchNotifications]);

  const addNotification = useCallback((notification) => {
    setNotifications((current) => {
      const newNotification = {
        ...notification,
        id: notification.id || notification.notificationId || `${Date.now()}-${Math.random()}`,
        createdAt: notification.createdAt || new Date().toISOString(),
        read: notification.read ?? notification.isRead ?? false,
        isRead: notification.isRead ?? notification.read ?? false,
      };

      // Check if notification already exists
      if (current.some((item) => item.id === newNotification.id || item.notificationId === newNotification.notificationId)) {
        return current;
      }

      return [newNotification, ...current];
    });
    setUnreadCount((prev) => prev + 1);
  }, []);

  const markAsRead = useCallback(async (notificationId) => {
    try {
      await notificationAPI.markAsRead(notificationId);
      setNotifications((current) =>
        current.map((item) =>
          item.notificationId === notificationId || item.id === notificationId
            ? { ...item, isRead: true, read: true }
            : item
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  }, []);

  const markAllRead = useCallback(async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications((current) => current.map((item) => ({ ...item, isRead: true, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  const refreshNotifications = useCallback(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        markAsRead,
        markAllRead,
        clearNotifications,
        refreshNotifications,
        unreadCount,
        loading,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
