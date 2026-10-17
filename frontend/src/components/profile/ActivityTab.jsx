import React from 'react';
import { Link } from 'react-router-dom';
import { Badge, Button, EmptyState, Skeleton } from '../UI';
import { formatRupees } from '../dashboard/DashboardKit';
import { formatDateTime, formatRelative } from './profileFormat';
import { AlertIcon, ArrowInIcon, ArrowOutIcon, CardIcon, CheckIcon, InboxIcon, SendIcon, XIcon } from './ProfileIcons';

/**
 * One entry per activity kind from GET /api/auth/me/activity.
 * `text` builds the sentence; staff kinds also name the student the approval was for.
 */
const KINDS = {
  // Student events
  requested: { badge: 'Requested', variant: 'neutral', tone: 'slate', Icon: SendIcon, text: () => 'You requested' },
  issued: { badge: 'Issued', variant: 'primary', tone: 'indigo', Icon: ArrowOutIcon, text: () => 'You borrowed' },
  rejected: { badge: 'Rejected', variant: 'danger', tone: 'rose', Icon: XIcon, text: () => 'Your request was declined for' },
  return_requested: { badge: 'Return requested', variant: 'warning', tone: 'amber', Icon: ArrowInIcon, text: () => 'You asked to return' },
  payment_submitted: { badge: 'Payment sent', variant: 'warning', tone: 'amber', Icon: CardIcon, text: () => 'You paid the fine for' },
  returned: { badge: 'Returned', variant: 'success', tone: 'emerald', Icon: CheckIcon, text: () => 'You returned' },
  // Shared kind: a student's fine was approved, or a staff member approved one
  payment_approved: {
    badge: 'Fine paid',
    variant: 'success',
    tone: 'emerald',
    Icon: CardIcon,
    text: (staff) => (staff ? 'You approved the fine payment for' : 'Your fine payment was approved for'),
  },
  // Staff approvals
  issue_approved: { badge: 'Issue approved', variant: 'primary', tone: 'indigo', Icon: ArrowOutIcon, text: () => 'You approved the issue of' },
  return_approved: { badge: 'Return approved', variant: 'success', tone: 'emerald', Icon: ArrowInIcon, text: () => 'You approved the return of' },
};

const TONES = {
  indigo: 'border-indigo-400/25 bg-indigo-500/10 text-indigo-300',
  amber: 'border-amber-400/25 bg-amber-400/10 text-amber-300',
  rose: 'border-rose-400/25 bg-rose-500/10 text-rose-300',
  emerald: 'border-emerald-400/25 bg-emerald-500/10 text-emerald-300',
  slate: 'border-white/10 bg-white/5 text-slate-300',
};

const FALLBACK = { badge: 'Update', variant: 'neutral', tone: 'slate', Icon: AlertIcon, text: () => 'Activity on' };

const ActivityRow = ({ item, staff, role }) => {
  const kind = KINDS[item.kind] || FALLBACK;
  const { Icon } = kind;
  const title = item.book?.title || 'a removed book';

  return (
    <li className="flex gap-3 py-3 first:pt-0 last:pb-0">
      <span className={`grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl border ${TONES[kind.tone]}`} aria-hidden="true">
        <Icon className="h-[18px] w-[18px]" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
          <p className="min-w-0 text-sm leading-snug text-slate-300">
            {kind.text(staff)}{' '}
            {item.book?._id ? (
              <Link to={`/${role}/books/${item.book._id}`} className="font-semibold text-slate-100 hover:text-indigo-300 hover:underline">
                {title}
              </Link>
            ) : (
              <span className="font-semibold text-slate-100">{title}</span>
            )}
            {staff && item.student && (
              <>
                {' '}for <span className="font-semibold text-slate-100">{item.student.name}</span>
                {item.student.libraryId && <span className="text-muted"> ({item.student.libraryId})</span>}
              </>
            )}
            {typeof item.amount === 'number' && item.amount > 0 && (
              <span className="text-slate-400"> · {formatRupees(item.amount)}</span>
            )}
          </p>
          <Badge variant={kind.variant} className="flex-shrink-0">{kind.badge}</Badge>
        </div>
        <time dateTime={item.date} className="mt-0.5 block text-xs text-muted">
          {[formatRelative(item.date), formatDateTime(item.date)].filter(Boolean).join(' · ')}
        </time>
      </div>
    </li>
  );
};

/** Last 10 items: a student's own loans/returns/payments, or the approvals a staff member made */
export const ActivityTab = ({ activity, loading, error, onRetry, role }) => {
  const staff = role === 'librarian' || role === 'admin';

  if (loading) {
    return (
      <ul className="divide-y divide-border" aria-busy="true" aria-label="Loading activity">
        {Array.from({ length: 4 }).map((_, i) => (
          <li key={i} className="flex gap-3 py-3 first:pt-0">
            <Skeleton className="h-10 w-10 !rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          </li>
        ))}
      </ul>
    );
  }

  if (error) {
    return (
      <EmptyState
        bare
        icon={<AlertIcon className="mx-auto h-10 w-10 text-rose-300" />}
        title="Couldn't load your activity"
        message={error}
        action={<Button variant="secondary" fullWidth={false} onClick={onRetry}>Try again</Button>}
      />
    );
  }

  if (!activity.length) {
    return (
      <EmptyState
        bare
        icon={<InboxIcon className="mx-auto h-10 w-10 text-slate-400" />}
        title="No activity yet"
        message={
          staff
            ? 'Issue, return and fine approvals you make will appear here.'
            : 'Your borrow requests, returns and fine payments will appear here.'
        }
      />
    );
  }

  return (
    <>
      <p className="mb-4 text-xs text-muted">
        {staff ? 'Your 10 most recent approvals.' : 'Your 10 most recent loans, returns and payments.'}
      </p>
      <ul className="divide-y divide-border">
        {activity.map((item) => (
          <ActivityRow key={item.id} item={item} staff={staff} role={role} />
        ))}
      </ul>
    </>
  );
};

export default ActivityTab;
