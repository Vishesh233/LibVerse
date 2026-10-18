import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LogoMark } from './LogoMark';
import { useDebounce } from '../hooks/useDebounce';
import { useNotification } from '../hooks/useNotification';
import { adminAPI } from '../services/api';
import { NotificationItem, notificationsPath } from './NotificationItem';
import Avatar from './Avatar';

export const Navbar = ({ isFullscreen, onToggleFullscreen, onOpenMenu }) => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const avatarSrc = !imageError && user?.profileImage ? user.profileImage : undefined;
  // A new photo (e.g. changed on the Profile page) gets a fresh chance to load
  useEffect(() => setImageError(false), [user?.profileImage]);
  const debouncedSearch = useDebounce(searchTerm, 300);
  const { notifications, unreadCount, markAsRead, markAllRead, refreshNotifications } = useNotification();
  const [panelTab, setPanelTab] = useState('all');
  const notificationRef = useRef(null);
  const profileRef = useRef(null);
  const searchRef = useRef(null);

  // Global search effect
  useEffect(() => {
    const performSearch = async () => {
      if (!debouncedSearch.trim()) {
        setSearchResults([]);
        setShowSearchDropdown(false);
        return;
      }

      setSearchLoading(true);
      try {
        const res = await adminAPI.globalSearch(debouncedSearch.trim());
        if (res.data?.success) {
          setSearchResults(res.data.results || []);
          setShowSearchDropdown(true);
        }
      } catch (err) {
        console.error('Search error:', err);
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    };

    performSearch();
  }, [debouncedSearch]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  const profilePath = React.useMemo(() => {
    if (user?.role === 'admin') return '/admin/profile';
    if (user?.role === 'librarian') return '/librarian/profile';
    return '/student/profile';
  }, [user?.role]);

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter' && searchResults.length > 0) {
      // Navigate to the first (best) result
      const bestMatch = searchResults[0];
      navigate(bestMatch.url);
      setShowSearchDropdown(false);
      setSearchTerm('');
    }
  };

  const handleResultClick = (url) => {
    navigate(url);
    setShowSearchDropdown(false);
    setSearchTerm('');
  };

  const panelItems = useMemo(
    () => (panelTab === 'unread' ? notifications.filter((n) => !n.isRead) : notifications),
    [notifications, panelTab]
  );

  const toggleNotifications = () => {
    if (!showNotifications) refreshNotifications(); // opening only refreshes; nothing is marked read
    setShowNotifications(!showNotifications);
  };

  const handleNotificationSelect = (notification) => {
    if (!notification.isRead) {
      markAsRead(notification._id).catch((err) => console.error('Failed to mark notification as read:', err));
    }
    if (notification.link) {
      setShowNotifications(false);
      navigate(notification.link);
    }
  };

  const openAllNotifications = () => {
    setShowNotifications(false);
    navigate(notificationsPath(user?.role));
  };

  return (
    <header className="print:hidden sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-border bg-navbar/95 px-4 text-slate-100 backdrop-blur-md sm:gap-4 sm:px-6">
      {/* Menu button (mobile/tablet: the sidebar lives in a drawer) */}
      {onOpenMenu && (
        <button
          onClick={onOpenMenu}
          className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-xl text-slate-300 transition-colors hover:bg-white/5 hover:text-white lg:hidden"
          aria-label="Open menu"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      )}

      {/* Brand mark on mobile/tablet, where the sidebar is hidden */}
      <LogoMark size="sm" label="LibVerse" className="lg:hidden" />

      {/* Search Input Left */}
      <div ref={searchRef} className="relative flex-1 max-w-2xl mx-auto">
        <svg
          className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleSearchKeyDown}
          onFocus={() => {
            if (searchResults.length > 0) setShowSearchDropdown(true);
          }}
          placeholder="Search books, users, or records..."
          aria-label="Search books, users, or records"
          className="w-full search-glass input-amo input-search pr-4 text-sm"
        />

        {/* Search Results Dropdown */}
        {showSearchDropdown && (
          <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl card text-slate-100 shadow-xl border z-50 overflow-hidden max-h-96 overflow-y-auto" style={{ borderColor: 'var(--border)' }}>
            {searchLoading ? (
              <div className="p-4 text-xs text-slate-400 text-center">Searching...</div>
            ) : searchResults.length === 0 ? (
              <div className="p-4 text-xs text-slate-400 text-center">No results found</div>
            ) : (
              <div className="p-2">
                {searchResults.map((result, idx) => {
                  // Book Result
                  if (result.type === 'book') {
                    return (
                      <button
                        key={`${result.type}-${result.id}-${idx}`}
                        onClick={() => handleResultClick(result.url)}
                        className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-slate-800/50 transition-all duration-200 hover:shadow-lg hover:scale-[1.02] hover:-translate-y-0.5 cursor-pointer flex items-center gap-3 group"
                      >
                        {/* Book Cover Thumbnail */}
                        <div className="flex-shrink-0 w-[52px] h-[60px] rounded-md overflow-hidden bg-slate-800 shadow-md">
                          {result.coverImage ? (
                            <img
                              src={result.coverImage}
                              alt={result.title}
                              loading="lazy"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-800">
                              <svg className="w-6 h-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A9 9 0 006 18c1.052 0 2.062-.18 3-.512m0-13.042A8.967 8.967 0 0118 3.75c1.052 0 2.062.18 3 .512v14.25A9 9 0 0118 18c-1.052 0-2.062-.18-3-.512" />
                              </svg>
                            </div>
                          )}
                        </div>

                        {/* Book Info */}
                        <div className="min-w-0 flex-1 py-0.5">
                          <p className="text-sm font-semibold text-slate-100 truncate group-hover:text-white transition-colors">{result.title}</p>
                          <p className="text-xs text-slate-400 truncate mt-0.5">{result.subtitle}</p>
                        </div>

                        {/* Book Badge */}
                        <span className="text-[10px] font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-md uppercase tracking-wider flex-shrink-0 border border-indigo-500/20">
                          Book
                        </span>
                      </button>
                    );
                  }

                  // User Result
                  if (result.type === 'user') {
                    return (
                      <button
                        key={`${result.type}-${result.id}-${idx}`}
                        onClick={() => handleResultClick(result.url)}
                        className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-slate-800/50 transition-all duration-200 hover:shadow-lg hover:scale-[1.02] hover:-translate-y-0.5 cursor-pointer flex items-center gap-3 group"
                      >
                        {/* User Avatar */}
                        <div className="flex-shrink-0 w-[52px] h-[52px] rounded-full overflow-hidden bg-slate-800 shadow-md ring-2 ring-slate-700">
                          {result.profileImage ? (
                            <img
                              src={result.profileImage}
                              alt={result.title}
                              loading="lazy"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-600 text-white font-bold text-lg">
                              {(result.title || 'U').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                            </div>
                          )}
                        </div>

                        {/* User Info */}
                        <div className="min-w-0 flex-1 py-0.5">
                          <p className="text-sm font-semibold text-slate-100 truncate group-hover:text-white transition-colors">{result.title}</p>
                          <p className="text-xs text-slate-400 truncate mt-0.5">{result.subtitle}</p>
                        </div>

                        {/* User Badge */}
                        <span className="text-[10px] font-semibold text-purple-400 bg-purple-500/10 px-2 py-1 rounded-md uppercase tracking-wider flex-shrink-0 border border-purple-500/20">
                          User
                        </span>
                      </button>
                    );
                  }

                  // Transaction Result (keep existing style)
                  return (
                    <button
                      key={`${result.type}-${result.id}-${idx}`}
                      onClick={() => handleResultClick(result.url)}
                      className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-slate-800/50 transition-all duration-200 hover:shadow-lg hover:scale-[1.02] hover:-translate-y-0.5 cursor-pointer flex items-start gap-3 group"
                    >
                      <span className="text-lg flex-shrink-0">{result.icon}</span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-100 truncate group-hover:text-white transition-colors">{result.title}</p>
                        <p className="text-xs text-slate-400 truncate">{result.subtitle}</p>
                      </div>
                      <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider flex-shrink-0">{result.type}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
        {/* Fullscreen Toggle Button */}
        <button
          onClick={onToggleFullscreen}
          className="hidden h-11 w-11 place-items-center rounded-xl text-slate-300 transition-colors hover:bg-white/5 hover:text-white lg:grid"
          aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
        >
          {isFullscreen ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15L3.75 20.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5M15 15l5.25 5.25" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
            </svg>
          )}
        </button>

        {/* Notifications */}
        <div ref={notificationRef} className="relative">
          <button
            type="button"
            onClick={toggleNotifications}
            className="relative grid h-11 w-11 place-items-center rounded-xl text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
            aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'}
            aria-expanded={showNotifications}
            aria-haspopup="dialog"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute right-1 top-1 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-bold leading-none text-white ring-2 ring-navbar" aria-hidden="true">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div
              role="dialog"
              aria-label="Notifications"
              className="fixed inset-x-3 top-[4.5rem] z-50 overflow-hidden rounded-2xl border border-border bg-surface text-slate-100 shadow-[0_24px_60px_rgba(0,0,0,0.5)] sm:absolute sm:inset-x-auto sm:right-0 sm:top-auto sm:mt-3 sm:w-[24rem]"
            >
              <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
                <div className="flex min-w-0 items-center gap-2">
                  <h3 className="text-sm font-semibold">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="rounded-full border border-cyan-400/30 bg-cyan-400/15 px-2 py-0.5 text-[11px] font-bold text-cyan-200">
                      {unreadCount} unread
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => markAllRead().catch((err) => console.error('Failed to mark all as read:', err))}
                  disabled={unreadCount === 0}
                  className="min-h-[36px] rounded-lg px-2 text-xs font-semibold text-indigo-300 transition-colors hover:text-white disabled:cursor-not-allowed disabled:text-slate-500"
                >
                  Mark all as read
                </button>
              </div>

              <div className="flex gap-1 border-b border-border px-3 py-2" role="tablist" aria-label="Filter notifications">
                {[
                  { key: 'all', label: 'All' },
                  { key: 'unread', label: 'Unread' },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    role="tab"
                    aria-selected={panelTab === tab.key}
                    onClick={() => setPanelTab(tab.key)}
                    className={`min-h-[32px] rounded-lg px-3 text-xs font-semibold transition-colors ${
                      panelTab === tab.key ? 'bg-indigo-500/15 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="max-h-[min(24rem,60vh)] divide-y divide-border overflow-y-auto">
                {panelItems.length === 0 ? (
                  <div className="px-6 py-10 text-center">
                    <p className="text-sm font-semibold text-slate-200">{panelTab === 'unread' ? "You're all caught up" : 'No notifications yet'}</p>
                    <p className="mt-1 text-xs text-slate-400">
                      {panelTab === 'unread' ? 'Nothing unread right now.' : 'Updates about your requests and loans will appear here.'}
                    </p>
                  </div>
                ) : (
                  panelItems.map((notification) => (
                    <NotificationItem key={notification._id} notification={notification} onSelect={handleNotificationSelect} />
                  ))
                )}
              </div>

              <div className="border-t border-border p-2">
                <button
                  type="button"
                  onClick={openAllNotifications}
                  className="min-h-[40px] w-full rounded-lg text-xs font-semibold text-indigo-300 transition-colors hover:bg-white/5 hover:text-white"
                >
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Badge */}
        {isAuthenticated && (
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setShowProfileMenu((prev) => !prev)}
              className="flex min-h-[44px] items-center gap-3 rounded-xl px-2 py-1 text-left transition-colors hover:bg-white/5"
            >
              <Avatar
                name={user?.name || 'G'}
                src={avatarSrc}
                size={9}
                onError={() => setImageError(true)}
              />

              <div className="hidden sm:block">
                <p className="font-bold text-slate-100 text-sm leading-tight">
                  {user?.name || 'User'}
                </p>
                <p className="text-xs text-slate-400 capitalize font-medium">
                  {user?.role === 'librarian' ? 'Librarian' : user?.role === 'admin' ? 'Admin' : 'Student'}
                </p>
              </div>

              <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

              {showProfileMenu && (
              <div className="absolute right-0 mt-3 w-56 rounded-2xl card text-slate-100 shadow-xl overflow-hidden z-50 py-1" style={{ borderColor: 'var(--border)' }}>
                <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
                  <p className="font-semibold text-sm text-slate-100">{user?.name}</p>
                  <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                </div>

                  <button
                    onClick={() => {
                      navigate(profilePath);
                      setShowProfileMenu(false);
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm font-medium text-slate-100 hover:bg-slate-800/50 flex items-center gap-2"
                  >
                  <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Profile Settings
                </button>

                <button
                  onClick={() => {
                    logout();
                    setShowProfileMenu(false);
                    navigate('/login');
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm font-medium text-rose-400 hover:bg-slate-800/50 flex items-center gap-2"
                >
                  <svg className="w-4 h-4 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4-4-4M21 12H9M13 8v-2a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2h6a2 2 0 002-2v-2" />
                  </svg>
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
