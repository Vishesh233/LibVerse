import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { authAPI } from '../../services/api';
import { Card, Badge, Skeleton } from '../UI';
import Avatar from '../Avatar';
import { formatRupees } from '../dashboard/DashboardKit';
import { formatMemberSince, ROLE_LABELS } from './profileFormat';
import { BookIcon, CalendarIcon, CameraIcon, CheckIcon, CopyIcon, GraduationIcon, ShieldIcon } from './ProfileIcons';

// Same limits as /api/profile/upload-avatar, checked first so the user gets an instant answer
const AVATAR_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const AVATAR_MAX_BYTES = 10 * 1024 * 1024;

const ROLE_BADGES = {
  student: { variant: 'primary', icon: <GraduationIcon className="h-3.5 w-3.5" /> },
  librarian: { variant: 'info', icon: <BookIcon className="h-3.5 w-3.5" /> },
  admin: { variant: 'danger', icon: <ShieldIcon className="h-3.5 w-3.5" /> },
};

/** Clipboard API with a textarea fallback for non-secure origins */
const copyText = async (text) => {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const el = document.createElement('textarea');
  el.value = text;
  el.setAttribute('readonly', '');
  el.style.position = 'fixed';
  el.style.opacity = '0';
  document.body.appendChild(el);
  el.select();
  const ok = document.execCommand('copy');
  document.body.removeChild(el);
  if (!ok) throw new Error('Copy failed');
};

const Stat = ({ label, value, loading }) => (
  <div className="flex min-w-0 flex-col rounded-2xl border border-border bg-white/[0.03] px-2 py-2.5 text-center">
    <dt className="text-[11px] font-medium leading-tight text-slate-400">{label}</dt>
    {/* mt-auto keeps the numbers on one line when a label wraps */}
    <dd className="mt-auto truncate pt-1 font-display text-xl font-bold leading-tight text-slate-50">
      {loading ? <Skeleton className="mx-auto h-6 w-10" /> : value}
    </dd>
  </div>
);

const StudentStats = ({ stats, loading }) => (
  <dl className="grid grid-cols-3 gap-2">
    <Stat label="Books read" value={stats?.booksRead ?? '—'} loading={loading} />
    <Stat label="Borrowed now" value={stats?.currentlyBorrowed ?? '—'} loading={loading} />
    <Stat label="Fines paid" value={stats ? formatRupees(stats.finesPaid) : '—'} loading={loading} />
  </dl>
);

const StaffStats = ({ stats, loading }) => (
  <>
    <dl className="grid grid-cols-2 gap-2">
      <Stat label="Approved this month" value={stats?.approvalsThisMonth ?? '—'} loading={loading} />
      <Stat label="Approved in total" value={stats?.approvalsTotal ?? '—'} loading={loading} />
    </dl>
    {stats && !loading && (
      <p className="mt-2 text-center text-[11px] leading-snug text-muted">
        {stats.issueApprovals} issue · {stats.returnApprovals} return · {stats.paymentApprovals} payment approvals
      </p>
    )}
  </>
);

/** Left column: avatar with "Change photo", identity, Library ID, member since and the caller's stats */
export const ProfileCard = ({ user, stats, statsLoading, onUserChange }) => {
  const [uploading, setUploading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileRef = useRef(null);
  const copiedTimer = useRef(null);

  useEffect(() => setImageError(false), [user?.profileImage]);
  useEffect(() => () => clearTimeout(copiedTimer.current), []);

  const isStaff = user?.role === 'librarian' || user?.role === 'admin';
  const roleBadge = ROLE_BADGES[user?.role] || ROLE_BADGES.student;
  const memberSince = formatMemberSince(user?.createdAt);
  const avatarSrc = !imageError && user?.profileImage ? user.profileImage : undefined;

  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = ''; // picking the same file again should still trigger a change
    if (!file) return;
    if (!AVATAR_TYPES.includes(file.type)) {
      toast.error('Please choose a JPG, PNG or WEBP image');
      return;
    }
    if (file.size > AVATAR_MAX_BYTES) {
      toast.error('Please choose an image under 10 MB');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const res = await authAPI.uploadAvatar(formData);
      if (!res.data?.success) throw new Error(res.data?.message || 'Failed to upload photo');
      onUserChange({ profileImage: res.data.user?.profileImage || res.data.avatarUrl });
      toast.success('Profile photo updated');
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await copyText(user.libraryId);
      toast.success('Copied');
      setCopied(true);
      clearTimeout(copiedTimer.current);
      copiedTimer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Could not copy the Library ID');
    }
  };

  return (
    <Card variant="glass" className="!p-5 sm:!p-6">
      <div className="flex flex-col items-center text-center">
        <div className="rounded-full bg-gradient-to-br from-indigo-500/60 via-cyan-400/40 to-transparent p-[3px] shadow-glow-accent">
          <div className="rounded-full bg-surface p-1">
            <Avatar
              key={avatarSrc || 'initials'}
              name={user?.name}
              src={avatarSrc}
              role={user?.role}
              size={24}
              className="!text-3xl font-display font-bold"
              onError={() => setImageError(true)}
            />
          </div>
        </div>

        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          aria-busy={uploading || undefined}
          className="mt-3 inline-flex min-h-[36px] items-center gap-1.5 rounded-lg px-3 text-xs font-semibold text-cyan-300 transition-colors hover:bg-white/5 hover:text-cyan-200 disabled:cursor-wait disabled:opacity-60"
        >
          {uploading ? (
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" />
          ) : (
            <CameraIcon className="h-4 w-4" />
          )}
          {uploading ? 'Uploading...' : 'Change photo'}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept={AVATAR_TYPES.join(',')}
          onChange={handleFile}
          className="hidden"
          aria-hidden="true"
          tabIndex={-1}
        />

        <h2 className="mt-2 max-w-full break-words font-display text-2xl font-bold leading-tight text-slate-50">
          {user?.name}
        </h2>
        <Badge variant={roleBadge.variant} size="md" className="mt-2 inline-flex items-center gap-1.5">
          {roleBadge.icon}
          {ROLE_LABELS[user?.role] || 'Member'}
        </Badge>

        <div className="mt-4 w-full space-y-2 text-sm">
          {user?.libraryId && (
            <div className="flex items-center justify-between gap-2 rounded-xl border border-border bg-input/60 py-1 pl-3 pr-1">
              <span className="min-w-0 text-left">
                <span className="block text-[11px] font-medium text-muted">Library ID</span>
                <span className="block truncate font-mono text-sm font-semibold tracking-wide text-slate-100">{user.libraryId}</span>
              </span>
              <button
                type="button"
                onClick={handleCopy}
                aria-label="Copy Library ID"
                title="Copy Library ID"
                className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-lg text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
              >
                {copied ? <CheckIcon className="h-4 w-4 text-emerald-300" /> : <CopyIcon className="h-4 w-4" />}
              </button>
            </div>
          )}
          {memberSince && (
            <p className="flex items-center justify-center gap-1.5 text-xs text-slate-400">
              <CalendarIcon className="h-3.5 w-3.5" />
              <span>Member since <time dateTime={user.createdAt}>{memberSince}</time></span>
            </p>
          )}
        </div>
      </div>

      <div className="mt-5 border-t border-border pt-4">
        <h3 className="sr-only">{isStaff ? 'Your approvals' : 'Your reading'}</h3>
        {isStaff ? <StaffStats stats={stats} loading={statsLoading} /> : <StudentStats stats={stats} loading={statsLoading} />}
      </div>
    </Card>
  );
};

export default ProfileCard;
