import React, { useCallback, useEffect, useId, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { adminAPI } from '../services/api';
import { MainLayout } from '../layouts/MainLayout';
import { useAuth } from '../hooks/useAuth';
import { useDebounce } from '../hooks/useDebounce';
import { ConfirmModal } from '../components/ConfirmModal';
import { Avatar } from '../components/Avatar';
import { Badge, Card, EmptyState, PageHeader } from '../components/UI';
import { formatRupees } from '../components/dashboard/DashboardKit';
import { ServerTable, FilterChips, PageFooter } from '../components/staff/ServerTable';

const PAGE_SIZE = 25;
const SORT_KEYS = ['name', 'libraryId', 'role', 'joined'];
const pageFrom = (value) => Math.max(1, parseInt(value, 10) || 1);
const ROLE_BADGE = { admin: 'info', librarian: 'success', student: 'primary' };
const ROLE_LABEL = { admin: 'Admin', librarian: 'Librarian', student: 'Student' };
const joined = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—');

/**
 * "Find a student": Library ID (any case), name or email, then Enter. One match (or an exact
 * Library ID) opens Student 360; several show a short list.
 */
const FindStudent = ({ base, isAdmin }) => {
  const navigate = useNavigate();
  const inputId = useId();
  const [q, setQ] = useState('');
  const [state, setState] = useState({ loading: false, results: null, error: null });

  const submit = async (e) => {
    e.preventDefault();
    const text = q.trim();
    if (!text) return;
    setState({ loading: true, results: null, error: null });
    try {
      const res = await adminAPI.lookupUsers(text);
      const found = res.data.users || [];
      if (found.length === 1) {
        navigate(`${base}/users/${found[0]._id}`);
        return;
      }
      setState({ loading: false, results: found, error: null });
    } catch (err) {
      setState({ loading: false, results: null, error: err.response?.data?.message || 'Search failed. Please try again.' });
    }
  };

  return (
    <Card variant="glass" className="!p-4 sm:!p-5" aria-labelledby={`${inputId}-title`} role="region">
      <h2 id={`${inputId}-title`} className="font-display text-lg font-semibold text-slate-100">Find a {isAdmin ? 'member' : 'student'}</h2>
      <p className="mt-0.5 text-xs text-slate-400">Type a Library ID (any case), a name or an email and press Enter to open their page.</p>
      <form onSubmit={submit} className="mt-3 flex gap-2" role="search">
        <label htmlFor={inputId} className="sr-only">Library ID, name or email</label>
        <input
          id={inputId}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="e.g. LIB-1003, Asha or asha@…"
          autoComplete="off"
          spellCheck="false"
          className="input-amo min-w-0 flex-1 !text-base"
        />
        <button type="submit" disabled={state.loading || !q.trim()} className="btn-primary min-h-[44px] px-5 text-sm">
          {state.loading ? 'Finding…' : 'Find'}
        </button>
      </form>
      {state.error && <p className="mt-2 text-sm text-rose-200" role="alert">{state.error}</p>}
      {state.results && (
        state.results.length === 0 ? (
          <p className="mt-3 text-sm text-slate-400" role="status">Nobody matches “{q.trim()}”.</p>
        ) : (
          <div className="mt-3" role="status">
            <p className="mb-2 text-xs text-slate-400">{state.results.length} matches{state.results.length === 10 ? ' (first 10)' : ''}: pick one</p>
            <ul className="grid gap-2 sm:grid-cols-2">
              {state.results.map((u) => (
                <li key={u._id}>
                  <button type="button" onClick={() => navigate(`${base}/users/${u._id}`)} className="flex w-full items-center gap-3 rounded-xl border border-border bg-white/[0.03] px-3 py-2 text-left hover:border-indigo-400/40">
                    <Avatar name={u.name} src={u.profileImage} size={9} role={u.role} className="flex-shrink-0" />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-slate-100">{u.name}</span>
                      <span className="block truncate text-xs text-slate-400"><span className="font-mono">{u.libraryId || 'No ID'}</span>{u.role !== 'student' ? ` · ${u.role}` : ''}{u.isActive === false ? ' · inactive' : ''}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )
      )}
    </Card>
  );
};

/** Labelled field for the add / edit dialogs */
const Field = ({ label, hint, children }) => (
  <label className="block">
    <span className="mb-1 block text-xs font-semibold text-slate-300">{label}</span>
    {children}
    {hint && <span className="mt-1 block text-[11px] text-slate-400">{hint}</span>}
  </label>
);

const Dialog = ({ title, onClose, children }) => {
  const titleId = useId();
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div role="dialog" aria-modal="true" aria-labelledby={titleId} className="modal-amo w-full max-w-md animate-scale-in">
        <h3 id={titleId} className="mb-4 font-display text-lg font-semibold text-slate-50">{title}</h3>
        {children}
      </div>
    </div>
  );
};

const EMPTY_ADD = { name: '', email: '', password: '', role: 'student', phone: '', libraryId: '' };

export const ManageUsers = () => {
  const { user: currentUser, isAdmin, isLibrarian } = useAuth();
  const navigate = useNavigate();
  const base = isAdmin ? '/admin' : '/librarian';
  // Student 360: admins open anyone, librarians students only (the endpoint enforces the same rule)
  const canOpen = (u) => isAdmin || u.role === 'student';
  // Admins manage everyone; librarians manage student accounts only (enforced by the backend too)
  const canEditUser = (u) => isAdmin || (isLibrarian && u.role === 'student');
  // Nobody can deactivate their own account
  const canToggleStatus = (u) => u._id !== currentUser?._id && canEditUser(u);

  const [searchParams, setSearchParams] = useSearchParams();
  const page = pageFrom(searchParams.get('page'));
  const q = searchParams.get('q') || '';
  const role = ['student', 'librarian', 'admin'].includes(searchParams.get('role')) ? searchParams.get('role') : '';
  const status = ['active', 'inactive'].includes(searchParams.get('status')) ? searchParams.get('status') : '';
  const sortParam = searchParams.get('sort') || '-joined';
  const sortKey = SORT_KEYS.includes(sortParam.replace(/^-/, '')) ? sortParam : '-joined';
  const sort = { key: sortKey.replace(/^-/, ''), dir: sortKey.startsWith('-') ? 'desc' : 'asc' };

  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState(q);
  const debouncedSearch = useDebounce(search, 300);

  const [adding, setAdding] = useState(false);
  const [addForm, setAddForm] = useState(EMPTY_ADD);
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', role: 'student', phone: '', address: '' });
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState(null);
  const [toggleBusy, setToggleBusy] = useState(false);
  const [reissuing, setReissuing] = useState(null);
  const [reissueBusy, setReissueBusy] = useState(false);

  const updateParams = useCallback((changes) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      Object.entries(changes).forEach(([key, value]) => {
        const isDefault = value === '' || value === null || value === undefined
          || (key === 'page' && Number(value) <= 1) || (key === 'sort' && value === '-joined');
        if (isDefault) next.delete(key);
        else next.set(key, String(value));
      });
      return next;
    }, { replace: true });
  }, [setSearchParams]);

  useEffect(() => {
    const value = debouncedSearch.trim();
    if (value !== q) updateParams({ q: value, page: 1 });
  }, [debouncedSearch]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (q !== debouncedSearch.trim()) setSearch(q);
  }, [q]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: PAGE_SIZE, sort: sortKey };
      if (q) params.search = q;
      if (role) params.role = role;
      if (status) params.status = status;
      const res = await adminAPI.getAllUsers(params);
      const serverPages = Math.max(1, res.data.pages || 1);
      if (page > serverPages && (res.data.total || 0) > 0) {
        updateParams({ page: serverPages });
        return;
      }
      setUsers(res.data.users || []);
      setTotal(res.data.total || 0);
      setPages(serverPages);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load the users. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [page, q, role, status, sortKey, updateParams]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const onSort = (key) => {
    const next = sort.key === key ? (sort.dir === 'asc' ? `-${key}` : key) : (key === 'joined' ? '-joined' : key);
    updateParams({ sort: next, page: 1 });
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!addForm.name.trim() || !addForm.email.trim() || addForm.password.length < 6) {
      toast.warning('Enter a name, an email and a password of at least 6 characters.');
      return;
    }
    setSaving(true);
    try {
      const body = { ...addForm, role: isAdmin ? addForm.role : 'student' };
      if (!body.libraryId.trim()) delete body.libraryId;
      const res = await adminAPI.createUser(body);
      toast.success(res.data?.message || 'Account created');
      setAdding(false);
      setAddForm(EMPTY_ADD);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'The account could not be created');
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (u) => {
    setEditing(u);
    setEditForm({ name: u.name, role: u.role, phone: u.phone || '', address: u.address || '' });
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    try {
      const res = await adminAPI.updateUser(editing._id, editForm);
      toast.success(res.data?.message || 'Changes saved');
      setEditing(null);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'The changes could not be saved');
    } finally {
      setSaving(false);
    }
  };

  const confirmToggle = async () => {
    if (!toggling) return;
    setToggleBusy(true);
    try {
      const res = await adminAPI.deleteUser(toggling._id);
      toast.success(res.data?.message || (toggling.isActive === false ? 'Account restored' : 'Account deactivated'));
      setToggling(null);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'The account status could not be changed');
    } finally {
      setToggleBusy(false);
    }
  };

  const confirmReissue = async () => {
    if (!reissuing) return;
    setReissueBusy(true);
    try {
      const res = await adminAPI.reissueCard(reissuing._id);
      toast.success(res.data?.message || 'New card issued');
      setReissuing(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'The card could not be reissued');
    } finally {
      setReissueBusy(false);
    }
  };

  const filtered = Boolean(q || role || status);
  const active = (u) => u.isActive !== false;

  const LoansCell = ({ u }) => (
    <span className="inline-flex items-center gap-2 tabular-nums">
      <span className="text-slate-100">{u.openLoans ?? u.booksIssued ?? 0}</span>
      {u.overdueLoans > 0 && <Badge variant="danger">{u.overdueLoans} overdue</Badge>}
    </span>
  );
  const FinesCell = ({ u }) => (
    <span className={`tabular-nums ${u.finesOwed > 0 ? 'font-semibold text-amber-200' : 'text-slate-500'}`}>
      {u.finesOwed > 0 ? formatRupees(u.finesOwed) : '—'}
    </span>
  );
  const StatusCell = ({ u }) => (active(u) ? <Badge variant="success">Active</Badge> : <Badge variant="neutral">Inactive</Badge>);

  const Actions = ({ u }) => (
    <div className="flex justify-end gap-1">
      {canEditUser(u) && (
        <button type="button" onClick={() => openEdit(u)} aria-label={`Edit ${u.name}`} title="Edit" className="grid h-9 w-9 place-items-center rounded-lg text-slate-400 hover:bg-indigo-500/10 hover:text-indigo-200">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="m16.86 4.49 1.69-1.69a1.88 1.88 0 1 1 2.65 2.65L10.58 16.07a4.5 4.5 0 0 1-1.9 1.13L6 18l.8-2.68a4.5 4.5 0 0 1 1.13-1.9l8.93-8.93Zm0 0L19.5 7.13" /></svg>
        </button>
      )}
      {isAdmin && u.libraryId && (
        <button type="button" onClick={() => setReissuing(u)} aria-label={`Reissue the library card of ${u.name}`} title="Reissue library card" className="grid h-9 w-9 place-items-center rounded-lg text-slate-400 hover:bg-cyan-500/10 hover:text-cyan-200">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" /></svg>
        </button>
      )}
      {canToggleStatus(u) && (
        <button
          type="button"
          onClick={() => setToggling(u)}
          aria-label={active(u) ? `Deactivate ${u.name}` : `Restore ${u.name}`}
          title={active(u) ? 'Deactivate' : 'Restore'}
          className={`grid h-9 w-9 place-items-center rounded-lg ${active(u) ? 'text-slate-400 hover:bg-rose-500/10 hover:text-rose-300' : 'text-emerald-300 hover:bg-emerald-500/10'}`}
        >
          {active(u) ? (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M18.36 18.36A9 9 0 0 1 5.64 5.64m12.72 12.72A9 9 0 0 0 5.64 5.64m12.72 12.72L5.64 5.64" /></svg>
          ) : (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M16.02 9.35h4.99v-.01M2.99 19.64v-4.99m0 0h4.99m-4.99 0 3.18 3.18a8.25 8.25 0 0 0 13.8-3.7M4.03 9.87a8.25 8.25 0 0 1 13.8-3.7l3.18 3.18m0-4.99v4.99" /></svg>
          )}
        </button>
      )}
    </div>
  );

  const columns = [
    {
      key: 'name', label: 'Member', sortKey: 'name', className: 'min-w-[15rem]',
      render: (u) => (
        <div className="flex items-center gap-3">
          <Avatar name={u.name} src={u.profileImage} size={9} role={u.role} className="flex-shrink-0" />
          <div className="min-w-0">
            <p className="truncate font-medium text-slate-100">{u.name}{u._id === currentUser?._id && <span className="ml-1.5 text-xs font-normal text-slate-400">(you)</span>}</p>
            <p className="truncate text-xs text-slate-400">{u.email}</p>
          </div>
        </div>
      ),
    },
    { key: 'libraryId', label: 'Library ID', sortKey: 'libraryId', render: (u) => <span className="whitespace-nowrap font-mono text-xs text-slate-300">{u.libraryId || '—'}</span> },
    { key: 'role', label: 'Role', sortKey: 'role', render: (u) => <Badge variant={ROLE_BADGE[u.role] || 'neutral'}>{ROLE_LABEL[u.role] || u.role}</Badge> },
    { key: 'loans', label: 'On loan', render: (u) => <LoansCell u={u} /> },
    { key: 'fines', label: 'Fines owed', align: 'right', render: (u) => <FinesCell u={u} /> },
    { key: 'joined', label: 'Joined', sortKey: 'joined', render: (u) => <span className="whitespace-nowrap text-slate-400">{joined(u.createdAt)}</span> },
    { key: 'status', label: 'Status', render: (u) => <StatusCell u={u} /> },
    { key: 'actions', label: <span className="sr-only">Actions</span>, align: 'right', render: (u) => <Actions u={u} /> },
  ];

  const card = (u) => (
    <div>
      <div className="flex items-center gap-3">
        <Avatar name={u.name} src={u.profileImage} size={10} role={u.role} className="flex-shrink-0" />
        <div className="min-w-0">
          <p className="truncate font-medium text-slate-100">{u.name}</p>
          <p className="truncate text-xs text-slate-400"><span className="font-mono">{u.libraryId || 'No ID'}</span> · {ROLE_LABEL[u.role] || u.role}</p>
        </div>
      </div>
      <dl className="mt-3 grid grid-cols-3 gap-2 text-xs">
        <div><dt className="text-slate-500">On loan</dt><dd className="mt-0.5"><LoansCell u={u} /></dd></div>
        <div><dt className="text-slate-500">Fines owed</dt><dd className="mt-0.5"><FinesCell u={u} /></dd></div>
        <div><dt className="text-slate-500">Status</dt><dd className="mt-0.5"><StatusCell u={u} /></dd></div>
      </dl>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-[11px] text-slate-500">Joined {joined(u.createdAt)}</span>
        <Actions u={u} />
      </div>
    </div>
  );

  return (
    <MainLayout>
      <div className="mx-auto max-w-7xl space-y-6 pb-12">
        <PageHeader
          className="!mb-0"
          title="Users"
          subtitle={isLibrarian
            ? 'Students you manage and fellow librarians (read only).'
            : 'Every member and staff account.'}
          actions={(
            <button type="button" onClick={() => setAdding(true)} className="btn-primary whitespace-nowrap">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
              Add {isAdmin ? 'user' : 'student'}
            </button>
          )}
        />

        <FindStudent base={base} isAdmin={isAdmin} />

        <Card variant="glass" className="!p-4 sm:!p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <svg className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.2-5.2m0 0A7.5 7.5 0 1 0 5.2 5.2a7.5 7.5 0 0 0 10.6 10.6Z" />
              </svg>
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filter by name, email or Library ID"
                aria-label="Filter users by name, email or Library ID"
                className="input-amo input-search w-full"
              />
            </div>
            <select value={role} onChange={(e) => updateParams({ role: e.target.value, page: 1 })} aria-label="Filter by role" className="input-amo w-full lg:w-48">
              <option value="">All roles</option>
              <option value="student">Students</option>
              <option value="librarian">Librarians</option>
              {isAdmin && <option value="admin">Admins</option>}
            </select>
          </div>
          <div className="mt-3 flex items-center justify-between gap-3">
            <FilterChips
              label="Status"
              value={status}
              onChange={(value) => updateParams({ status: value, page: 1 })}
              options={[{ value: '', label: 'All' }, { value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }]}
            />
            <p className="hidden text-xs text-slate-400 sm:block" aria-live="polite">
              {loading ? 'Loading…' : `${total.toLocaleString('en-IN')} ${total === 1 ? 'account' : 'accounts'}${filtered ? ' match' : ''}`}
            </p>
          </div>
        </Card>

        {error && (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200" role="alert">
            {error}
            <button type="button" className="btn-secondary min-h-[36px] px-3 text-xs" onClick={fetchUsers}>Retry</button>
          </div>
        )}

        <ServerTable
          caption="User accounts"
          columns={columns}
          rows={users}
          loading={loading}
          sort={sort}
          onSort={onSort}
          onRowClick={(u) => navigate(`${base}/users/${u._id}`)}
          isRowClickable={canOpen}
          rowLabel={(u) => (canOpen(u) ? `Open ${u.name} (${u.libraryId || 'no Library ID'})` : u.name)}
          cardRender={card}
          empty={(
            <EmptyState
              icon="👥"
              title={filtered ? 'Nobody matches' : 'No accounts yet'}
              message={filtered ? 'Try another name, role or status.' : 'Add the first student account.'}
              action={filtered && <button type="button" className="btn-secondary" onClick={() => { setSearch(''); updateParams({ q: '', role: '', status: '', page: 1 }); }}>Clear filters</button>}
            />
          )}
        />

        {!loading && <PageFooter page={page} pages={pages} total={total} pageSize={PAGE_SIZE} noun="accounts" onPage={(next) => updateParams({ page: next })} />}
      </div>

      {adding && (
        <Dialog title={isAdmin ? 'Add an account' : 'Add a student'} onClose={() => setAdding(false)}>
          <form onSubmit={handleAddUser} className="space-y-3">
            <Field label="Full name"><input required value={addForm.name} onChange={(e) => setAddForm({ ...addForm, name: e.target.value })} className="input-amo w-full" autoComplete="off" /></Field>
            <Field label="Email"><input type="email" required value={addForm.email} onChange={(e) => setAddForm({ ...addForm, email: e.target.value })} className="input-amo w-full" autoComplete="off" /></Field>
            <Field label="Temporary password" hint="At least 6 characters. Ask them to change it from Settings → Security.">
              <input type="password" required minLength={6} value={addForm.password} onChange={(e) => setAddForm({ ...addForm, password: e.target.value })} className="input-amo w-full" autoComplete="new-password" />
            </Field>
            {isAdmin && (
              <Field label="Role">
                <select value={addForm.role} onChange={(e) => setAddForm({ ...addForm, role: e.target.value })} className="input-amo w-full">
                  <option value="student">Student</option>
                  <option value="librarian">Librarian</option>
                  <option value="admin">Admin</option>
                </select>
              </Field>
            )}
            <div className="grid grid-cols-2 gap-3">
              <Field label="Phone (optional)"><input value={addForm.phone} onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })} className="input-amo w-full" inputMode="tel" /></Field>
              <Field label="Library ID (optional)" hint="Next free ID if empty"><input value={addForm.libraryId} onChange={(e) => setAddForm({ ...addForm, libraryId: e.target.value })} className="input-amo w-full font-mono" /></Field>
            </div>
            <div className="flex justify-end gap-2 pt-3">
              <button type="button" className="btn-ghost" onClick={() => setAdding(false)}>Cancel</button>
              <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Creating…' : 'Create account'}</button>
            </div>
          </form>
        </Dialog>
      )}

      {editing && (
        <Dialog title={`Edit ${editing.name}`} onClose={() => setEditing(null)}>
          <form onSubmit={handleUpdateUser} className="space-y-3">
            <Field label="Full name"><input required value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="input-amo w-full" /></Field>
            <Field label="Role" hint={!isAdmin ? 'Only admins change roles.' : editing._id === currentUser?._id ? 'You can’t change your own role.' : undefined}>
              <select
                value={editForm.role}
                onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                disabled={!isAdmin || editing._id === currentUser?._id}
                className="input-amo w-full disabled:cursor-not-allowed disabled:opacity-60"
              >
                <option value="student">Student</option>
                {isAdmin && <option value="librarian">Librarian</option>}
                {isAdmin && <option value="admin">Admin</option>}
              </select>
            </Field>
            <Field label="Phone (optional)"><input value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} className="input-amo w-full" inputMode="tel" /></Field>
            <Field label="Address (optional)"><input value={editForm.address} onChange={(e) => setEditForm({ ...editForm, address: e.target.value })} className="input-amo w-full" /></Field>
            <div className="flex justify-end gap-2 pt-3">
              <button type="button" className="btn-ghost" onClick={() => setEditing(null)}>Cancel</button>
              <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button>
            </div>
          </form>
        </Dialog>
      )}

      <ConfirmModal
        isOpen={!!toggling}
        title={toggling && active(toggling) ? `Deactivate ${toggling.name}?` : `Restore ${toggling?.name || ''}?`}
        description={toggling && active(toggling)
          ? 'They are signed out and can’t log in until the account is restored. Their loans, fines and history stay as they are.'
          : 'They can log in again straight away.'}
        confirmText={toggling && active(toggling) ? 'Deactivate' : 'Restore'}
        onConfirm={confirmToggle}
        onCancel={() => setToggling(null)}
        loading={toggleBusy}
      />
      <ConfirmModal
        isOpen={!!reissuing}
        title="Reissue library card?"
        description={reissuing ? `${reissuing.name} (${reissuing.libraryId}) gets a new card. Their current card QR, printed or saved, stops working at the desk straight away. They are notified and can open the new card from their profile.` : ''}
        confirmText="Reissue card"
        onConfirm={confirmReissue}
        onCancel={() => setReissuing(null)}
        loading={reissueBusy}
      />
    </MainLayout>
  );
};
