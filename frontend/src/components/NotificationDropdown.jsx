import React from 'react';
import { Card, Badge } from './UI';
import { formatDateTime } from '../utils/dateUtils';

export const NotificationDropdown = ({ notifications, unreadCount }) => {
  return (
    <Card className="absolute right-0 mt-2 w-full max-w-sm">
      <div className="border-b border-slate-800 px-4 py-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-100">Notifications</h2>
          <Badge variant="primary" className="capitalize">
            {unreadCount} unread
          </Badge>
        </div>
      </div>
      <div className="max-h-72 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-4 text-sm text-slate-400">
            You have no notifications.
          </div>
        ) : (
          notifications.map((notification) => (
            <div key={notification.id} className="border-b border-slate-800/40 px-4 py-4 last:border-none">
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium text-sm text-slate-100">{notification.title}</p>
                {!notification.read ? (
                  <Badge variant="warning">New</Badge>
                ) : (
                  <Badge variant="primary">Read</Badge>
                )}
              </div>
              <p className="mt-1 text-sm text-slate-300">{notification.message}</p>
              <p className="mt-2 text-xs text-slate-400">{formatDateTime(notification.createdAt)}</p>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};
