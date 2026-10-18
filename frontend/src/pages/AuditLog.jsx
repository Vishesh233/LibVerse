import React, { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { adminAPI } from '../services/api';
import { MainLayout } from '../layouts/MainLayout';
import { Badge, Button, Card, EmptyState, PageHeader, Skeleton } from '../components/UI';
import { Pagination } from '../components/Pagination';
import { AUDIT_ACTION_LABELS, auditActionLabel } from '../constants/auditActions';
import { isDayString } from '../utils/dateRange';
import { useAuth } from '../hooks/useAuth';

const PAGE_SIZE = 20;

const ACTION_TONE = (action) => {
  if (action.startsWith('fine.')) return 'info';
  if (action.endsWith('reject') || action.endsWith('delete') || action.endsWith('deactivate') || action.endsWith('cancel')) return 'danger';
  if (action.startsWith('user.')) return 'warning';
  if (action.startsWith('book.')) return 'neutral';
  return 'success';
};

const when = (d) => new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' });

/** Extra detail under the summary: a waiver's reason, edited field names */
const Details = ({ meta }) => {
  if (!meta) return null;
  if (meta.reason) return <p className="mt-1 text-xs text-slate-400">Reason: {meta.reason}</p>;
  return null;
};

const ActorName = ({ entry }) => (
  <span>
    <span className="font-medium text-slate-100">{entry.actor?.name || 'Deleted user'}</span>
    <span className="block text-[11px] capitalize text-slate-500">{entry.actor?.role || entry.actorRole}</span>
  </span>
);

export const AuditLog = () => {
  const { isAdmin } = useAuth();
  const [params, setParams] = useSearchParams();
  const actor = params.get('actor') || '';
  const action = params.get('action') || '';
  const from = isDayString(params.get('from')) ? params.get('from') : '';
  const to = isDayString(params.get('to')) ? params.get('to') : '';
  const page = Math.max(1, Number(params.get('page')) || 1);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  const setFilter = useCallback((changes) => {
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      Object.entries(changes).forEach(([k, v]) => (v ? next.set(k, String(v)) : next.delete(k)));
      if (!('page' in changes)) next.delete('page');
      if (next.get('page') === '1') next.delete('page');
      return next;
    }, { replace: true });
  }, [setParams]);

  useEffect(() => {
    if (!isAdmin) return undefined;
    const controller = new AbortController();
    setLoading(true);
    adminAPI
      .getAuditLog({ actor: actor || undefined, action: action || undefined, from: from || undefined, to: to || undefined, page, limit: PAGE_SIZE }, { signal: controller.signal })
      .then((res) => {
        setData(res.data);
        setError(null);
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        setError(err.response?.data?.message || 'We couldn’t load the audit log right now.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [isAdmin, actor, action, from, to, page, reloadKey]);

  if (!isAdmin) {
    return (
      <MainLayout>
        <EmptyState icon="🔒" title="Admins only" message="The audit log is available to admins." />
      </MainLayout>
    );
  }

  const hasFilters = !!(actor || action || from || to);
  const entries = data?.entries || [];

  return (
    <MainLayout>
      <div className="mx-auto max-w-7xl space-y-5 pb-10">
        <PageHeader title="Audit log" subtitle="Every approval, desk loan, waiver, book and account change made by staff, newest first." className="!mb-0" />

        <Card variant="glass" className="!p-4">
          <form className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[repeat(4,minmax(0,1fr))_auto] lg:items-end" onSubmit={(e) => e.preventDefault()} aria-label="Audit log filters">
            <label className="flex min-w-0 flex-col text-xs text-slate-400">
              Staff member
              <select value={actor} onChange={(e) => setFilter({ actor: e.target.value })} className="input-amo mt-1 w-full">
                <option value="">Everyone</option>
                {(data?.actors || []).map((a) => (
                  <option key={a._id} value={a._id}>{a.name} ({a.role})</option>
                ))}
              </select>
            </label>
            <label className="flex min-w-0 flex-col text-xs text-slate-400">
              Action
              <select value={action} onChange={(e) => setFilter({ action: e.target.value })} className="input-amo mt-1 w-full">
                <option value="">All actions</option>
                {Object.entries(AUDIT_ACTION_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </label>
            <label className="flex min-w-0 flex-col text-xs text-slate-400">
              From
              <input type="date" value={from} max={to || undefined} onChange={(e) => setFilter({ from: e.target.value })} className="input-amo mt-1 w-full" />
            </label>
            <label className="flex min-w-0 flex-col text-xs text-slate-400">
              To
              <input type="date" value={to} min={from || undefined} onChange={(e) => setFilter({ to: e.target.value })} className="input-amo mt-1 w-full" />
            </label>
            <Button type="button" variant="ghost" fullWidth={false} disabled={!hasFilters} onClick={() => setParams(new URLSearchParams(), { replace: true })} className="w-full lg:w-auto">
              Clear
            </Button>
          </form>
        </Card>

        <p className="text-xs text-slate-400" aria-live="polite">
          {data ? `${data.total.toLocaleString('en-IN')} entr${data.total === 1 ? 'y' : 'ies'}${hasFilters ? ' match these filters' : ''}` : ' '}
        </p>

        {error && !loading ? (
          <EmptyState icon="⚠️" title="Couldn't load the audit log" message={error} action={<Button fullWidth={false} onClick={() => setReloadKey((k) => k + 1)}>Try again</Button>} />
        ) : loading && !data ? (
          <Card className="space-y-3" aria-busy="true" aria-label="Loading audit log">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
          </Card>
        ) : entries.length === 0 ? (
          <EmptyState
            icon="🗂️"
            title={hasFilters ? 'No entries match these filters' : 'No staff actions recorded yet'}
            message={hasFilters ? 'Try another staff member, action or date.' : 'Approvals, desk loans, waivers and account changes appear here as staff make them.'}
            action={hasFilters ? <Button fullWidth={false} variant="secondary" onClick={() => setParams(new URLSearchParams(), { replace: true })}>Clear filters</Button> : null}
          />
        ) : (
          <div className={`transition-opacity ${loading ? 'opacity-60' : ''}`} aria-busy={loading || undefined}>
            {/* Tablet and up: table */}
            <Card className="hidden !p-0 sm:block">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <caption className="sr-only">Audit log entries, newest first</caption>
                  <thead className="bg-white/[0.03] text-[11px] uppercase tracking-wider text-slate-400">
                    <tr>
                      <th scope="col" className="whitespace-nowrap px-4 py-3">When</th>
                      <th scope="col" className="px-4 py-3">Staff</th>
                      <th scope="col" className="px-4 py-3">Action</th>
                      <th scope="col" className="px-4 py-3">What happened</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {entries.map((e) => (
                      <tr key={e._id} className="align-top hover:bg-white/[0.02]">
                        <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-400"><time dateTime={e.createdAt}>{when(e.createdAt)}</time></td>
                        <td className="px-4 py-3"><ActorName entry={e} /></td>
                        <td className="whitespace-nowrap px-4 py-3"><Badge variant={ACTION_TONE(e.action)}>{auditActionLabel(e.action)}</Badge></td>
                        <td className="px-4 py-3 text-slate-300">{e.summary}<Details meta={e.meta} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Phones: cards */}
            <ul className="space-y-3 sm:hidden" aria-label="Audit log entries, newest first">
              {entries.map((e) => (
                <li key={e._id} className="card-glass !p-4">
                  <div className="flex items-start justify-between gap-2">
                    <Badge variant={ACTION_TONE(e.action)}>{auditActionLabel(e.action)}</Badge>
                    <time dateTime={e.createdAt} className="text-[11px] text-slate-500">{when(e.createdAt)}</time>
                  </div>
                  <p className="mt-2 text-sm text-slate-200">{e.summary}</p>
                  <Details meta={e.meta} />
                  <p className="mt-2 text-xs text-slate-400">By {e.actor?.name || 'Deleted user'} · <span className="capitalize">{e.actor?.role || e.actorRole}</span></p>
                </li>
              ))}
            </ul>

            <Pagination currentPage={page} totalPages={data?.pages || 1} onPageChange={(p) => setFilter({ page: p })} />
          </div>
        )}
      </div>
    </MainLayout>
  );
};
