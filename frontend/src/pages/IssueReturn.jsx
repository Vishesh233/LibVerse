import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { adminAPI, authAPI, booksAPI, deskAPI, transactionsAPI } from '../services/api';
import { MainLayout } from '../layouts/MainLayout';
import { useAuth } from '../hooks/useAuth';
import { useDebounce } from '../hooks/useDebounce';
import { CoverImage } from '../components/CoverImage';
import { Avatar } from '../components/Avatar';
import { ConfirmModal } from '../components/ConfirmModal';
import { Badge, PageHeader, Skeleton } from '../components/UI';
import { CompactEmpty, DASH_ICONS, DashTabs, SectionCard, formatRupees } from '../components/dashboard/DashboardKit';
import { StockMeter } from '../components/staff/ServerTable';
import { calculateFine, getDaysOverdue } from '../utils/fineCalculator';

const DAY = 24 * 60 * 60 * 1000;
const DEFAULT_LOAN_DAYS = 14;
const dayString = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const longDate = (d) => new Date(d).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
const shortDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
const plural = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`;

/**
 * Search-as-you-type picker (combobox): the server searches, arrow keys move, Enter picks.
 * @param {(q: string, signal: AbortSignal) => Promise<object[]>} search
 */
const SearchPicker = ({ label, placeholder, search, renderOption, onPick, disabled = false }) => {
  const id = useId();
  const [text, setText] = useState('');
  const [open, setOpen] = useState(false);
  const [state, setState] = useState({ loading: false, items: [], error: null });
  const [active, setActive] = useState(0);
  const debounced = useDebounce(text, 250);
  const box = useRef(null);

  useEffect(() => {
    const q = debounced.trim();
    if (!q) { setState({ loading: false, items: [], error: null }); return undefined; }
    const controller = new AbortController();
    setState((s) => ({ ...s, loading: true, error: null }));
    search(q, controller.signal)
      .then((items) => { setState({ loading: false, items, error: null }); setActive(0); })
      .catch((err) => { if (err?.name !== 'CanceledError' && err?.code !== 'ERR_CANCELED') setState({ loading: false, items: [], error: 'Search failed. Try again.' }); });
    return () => controller.abort();
  }, [debounced, search]);

  useEffect(() => {
    const onDoc = (e) => { if (box.current && !box.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const pick = (item) => {
    onPick(item);
    setText('');
    setOpen(false);
  };
  const onKey = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setOpen(true); setActive((i) => Math.min(i + 1, state.items.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((i) => Math.max(i - 1, 0)); }
    else if (e.key === 'Enter' && open && state.items[active]) { e.preventDefault(); pick(state.items[active]); }
    else if (e.key === 'Escape') setOpen(false);
  };
  const showList = open && text.trim().length > 0;

  return (
    <div ref={box} className="relative">
      <label htmlFor={id} className="mb-1.5 block text-xs font-semibold text-slate-300">{label}</label>
      <div className="relative">
        <svg className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.2-5.2m0 0A7.5 7.5 0 1 0 5.2 5.2a7.5 7.5 0 0 0 10.6 10.6Z" />
        </svg>
        <input
          id={id}
          type="search"
          role="combobox"
          aria-expanded={showList}
          aria-controls={`${id}-list`}
          aria-autocomplete="list"
          aria-activedescendant={showList && state.items[active] ? `${id}-opt-${active}` : undefined}
          value={text}
          disabled={disabled}
          onChange={(e) => { setText(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKey}
          placeholder={placeholder}
          autoComplete="off"
          className="input-amo input-search w-full"
        />
      </div>
      {showList && (
        <ul id={`${id}-list`} role="listbox" aria-label={label} className="absolute z-30 mt-1 max-h-80 w-full overflow-y-auto rounded-xl border border-border bg-[#0d1424] p-1 shadow-2xl">
          {state.loading && <li className="px-3 py-3 text-sm text-slate-400">Searching…</li>}
          {state.error && <li className="px-3 py-3 text-sm text-rose-200">{state.error}</li>}
          {!state.loading && !state.error && state.items.length === 0 && <li className="px-3 py-3 text-sm text-slate-400">No matches for “{text.trim()}”.</li>}
          {!state.loading && state.items.map((item, i) => (
            <li
              key={item._id}
              id={`${id}-opt-${i}`}
              role="option"
              aria-selected={i === active}
              onMouseEnter={() => setActive(i)}
              onMouseDown={(e) => { e.preventDefault(); pick(item); }}
              className={`cursor-pointer rounded-lg px-3 py-2 ${i === active ? 'bg-indigo-500/15' : ''}`}
            >
              {renderOption(item)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

/** The chosen student with what the desk needs to know before lending */
const StudentContext = ({ student, overview, onClear }) => {
  const s = overview?.stats;
  const owed = s ? (s.finesPayable || 0) + (s.finesAccruing || 0) : 0;
  return (
    <div className={`rounded-2xl border p-4 ${student.isActive === false ? 'border-rose-400/40 bg-rose-500/[0.06]' : 'border-border bg-white/[0.03]'}`}>
      <div className="flex items-start gap-3">
        <Avatar name={student.name} src={student.profileImage} size={11} role={student.role} className="flex-shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-slate-100">{student.name}</p>
          <p className="truncate text-xs text-slate-400"><span className="font-mono">{student.libraryId || 'No Library ID'}</span>{student.role !== 'student' ? ` · ${student.role}` : ''}</p>
        </div>
        <button type="button" onClick={onClear} className="btn-ghost min-h-[36px] px-3 text-xs">Change</button>
      </div>
      {student.isActive === false && <p className="mt-3 text-sm text-rose-200" role="alert">This account is deactivated: books can’t be issued to it.</p>}
      {!overview ? (
        <Skeleton className="mt-3 h-10 w-full" />
      ) : (
        <dl className="mt-3 grid grid-cols-3 gap-2 text-xs">
          <div className="rounded-xl bg-white/[0.03] px-3 py-2"><dt className="text-slate-400">On loan</dt><dd className="mt-0.5 font-display text-lg font-semibold text-slate-50 tabular-nums">{s.onLoan}</dd></div>
          <div className="rounded-xl bg-white/[0.03] px-3 py-2"><dt className="text-slate-400">Overdue</dt><dd className={`mt-0.5 font-display text-lg font-semibold tabular-nums ${s.overdue ? 'text-rose-200' : 'text-slate-50'}`}>{s.overdue}</dd></div>
          <div className="rounded-xl bg-white/[0.03] px-3 py-2"><dt className="text-slate-400">Fines owed</dt><dd className={`mt-0.5 font-display text-lg font-semibold tabular-nums ${owed ? 'text-amber-200' : 'text-slate-50'}`}>{formatRupees(owed)}</dd></div>
        </dl>
      )}
      {overview?.currentLoans?.length > 0 && (
        <p className="mt-2 truncate text-[11px] text-slate-400">Has: {overview.currentLoans.map((l) => l.book?.title).filter(Boolean).join(' · ')}</p>
      )}
    </div>
  );
};

const BookContext = ({ book, onClear, alreadyHas }) => (
  <div className={`rounded-2xl border p-4 ${book.availableCopies > 0 && !alreadyHas ? 'border-border bg-white/[0.03]' : 'border-rose-400/40 bg-rose-500/[0.06]'}`}>
    <div className="flex items-start gap-3">
      <div className="h-20 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-input"><CoverImage book={book} alt="" size="S" /></div>
      <div className="min-w-0 flex-1">
        <p className="font-semibold leading-snug text-slate-100 line-clamp-2">{book.title}</p>
        <p className="truncate text-xs text-slate-400">{book.author}</p>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
          <StockMeter available={book.availableCopies ?? 0} total={book.totalCopies ?? 0} compact />
          {book.location && <span className="text-[11px] text-slate-400">{book.location}</span>}
        </div>
      </div>
      <button type="button" onClick={onClear} className="btn-ghost min-h-[36px] px-3 text-xs">Change</button>
    </div>
    {book.availableCopies <= 0 && <p className="mt-3 text-sm text-rose-200" role="alert">No copy is on the shelf. The student can reserve it instead.</p>}
    {alreadyHas && <p className="mt-3 text-sm text-rose-200" role="alert">This student already has this book.</p>}
  </div>
);

export const IssueReturn = () => {
  const { isAdmin } = useAuth();
  const base = isAdmin ? '/admin' : '/librarian';
  // ?tab=return opens the return list (dashboard "Due today")
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get('tab') === 'return' ? 'return' : 'issue';
  const setTab = (next) => setSearchParams(next === 'return' ? { tab: 'return' } : {}, { replace: true });

  const [loanDays, setLoanDays] = useState(DEFAULT_LOAN_DAYS);
  useEffect(() => {
    // The loan period comes from the server's rules (printed on every library card)
    authAPI.getMyCard().then((r) => { if (r.data?.card?.rules?.loanDays) setLoanDays(r.data.card.rules.loanDays); }).catch(() => {});
  }, []);

  // ---- Issue
  const [student, setStudent] = useState(null);
  const [overview, setOverview] = useState(null);
  const [book, setBook] = useState(null);
  const [duePreset, setDuePreset] = useState('standard'); // standard | 7 | 21 | custom
  const [customDue, setCustomDue] = useState('');
  const [issuing, setIssuing] = useState(false);

  useEffect(() => {
    if (!student) { setOverview(null); return undefined; }
    const controller = new AbortController();
    adminAPI.getUserOverview(student._id, {}, { signal: controller.signal })
      .then((r) => setOverview(r.data.overview))
      .catch(() => setOverview({ stats: { onLoan: 0, overdue: 0, finesPayable: 0, finesAccruing: 0 }, currentLoans: [] }));
    return () => controller.abort();
  }, [student]);

  const searchStudents = useCallback(async (q) => {
    const r = await adminAPI.lookupUsers(q);
    return (r.data.users || []).filter((u) => u.role === 'student');
  }, []);
  const searchBooks = useCallback(async (q, signal) => {
    const r = await booksAPI.getBooks({ q, limit: 8, sort: 'title' }, { signal });
    return r.data.books || [];
  }, []);

  const today = new Date();
  const dueDate = duePreset === 'custom'
    ? (customDue ? new Date(`${customDue}T00:00:00`) : null)
    : new Date(today.getTime() + (duePreset === 'standard' ? loanDays : Number(duePreset)) * DAY);
  const alreadyHas = Boolean(book && overview?.currentLoans?.some((l) => String(l.book?._id) === String(book._id)));
  const canIssue = student && book && student.isActive !== false && book.availableCopies > 0 && !alreadyHas && dueDate && !issuing;

  const issue = async (e) => {
    e.preventDefault();
    if (!canIssue) return;
    setIssuing(true);
    try {
      const res = await adminAPI.issueBook({
        libraryId: student.libraryId,
        bookId: book._id,
        // Standard loans let the server apply its own loan period
        ...(duePreset === 'standard' ? {} : { dueDate: dayString(dueDate) }),
      });
      toast.success(res.data?.message || `“${book.title}” issued to ${student.name}`);
      setBook(null);
      setStudent(null);
      setDuePreset('standard');
      setCustomDue('');
      loadRecent();
      loadLoans();
    } catch (err) {
      toast.error(err.response?.data?.message || 'The book could not be issued');
    } finally {
      setIssuing(false);
    }
  };

  // ---- Return
  const [loans, setLoans] = useState({ loading: true, rows: [], error: null });
  const [filter, setFilter] = useState('');
  const [returning, setReturning] = useState(null);
  const [returnBusy, setReturnBusy] = useState(false);

  const loadLoans = useCallback(async () => {
    try {
      const r = await transactionsAPI.getAllTransactions({ status: 'issued', limit: 100 });
      const rows = (r.data.transactions || []).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
      setLoans({ loading: false, rows, error: null, total: r.data.total || rows.length });
    } catch (err) {
      setLoans({ loading: false, rows: [], error: 'Could not load the loans.' });
    }
  }, []);
  useEffect(() => { loadLoans(); }, [loadLoans]);

  const shownLoans = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return loans.rows;
    return loans.rows.filter((t) => [t.userId?.name, t.userId?.libraryId, t.bookId?.title, t.bookId?.author]
      .some((v) => v && String(v).toLowerCase().includes(q)));
  }, [loans.rows, filter]);

  const confirmReturn = async () => {
    if (!returning) return;
    setReturnBusy(true);
    try {
      const res = await deskAPI.returnLoan(returning._id);
      toast.success(res.data?.message || 'Returned');
      setReturning(null);
      loadLoans();
      loadRecent();
    } catch (err) {
      toast.error(err.response?.data?.message || 'The return could not be recorded');
    } finally {
      setReturnBusy(false);
    }
  };

  // ---- Recent activity (same feed as the dashboard)
  const [recent, setRecent] = useState({ loading: true, rows: [] });
  const loadRecent = useCallback(() => {
    adminAPI.getDashboard()
      .then((r) => setRecent({ loading: false, rows: r.data?.analytics?.recentActivities || [] }))
      .catch(() => setRecent({ loading: false, rows: [] }));
  }, []);
  useEffect(() => { loadRecent(); }, [loadRecent]);

  const overdueCount = loans.rows.filter((t) => getDaysOverdue(t.dueDate) > 0).length;
  const returningFine = returning ? calculateFine(returning.dueDate) : 0;

  return (
    <MainLayout>
      <div className="mx-auto max-w-7xl space-y-6 pb-12">
        <PageHeader
          className="!mb-0"
          title="Issue & return"
          subtitle="Lend a book or take one back at the counter."
          actions={<Link to={`${base}/scan`} className="btn-secondary whitespace-nowrap">Open scan desk</Link>}
        />

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
          <SectionCard className="xl:col-span-8" title={tab === 'issue' ? 'Issue a book' : 'Return a book'} subtitle={tab === 'issue' ? 'Find the student, then the book.' : 'Books out now, the soonest due first. A late return records its fine.'}>
            <DashTabs
              tabs={[{ key: 'issue', label: 'Issue' }, { key: 'return', label: 'Return', count: loans.loading ? undefined : loans.rows.length }]}
              active={tab}
              onChange={setTab}
              label="Issue or return"
              idPrefix="desk"
            />
            <div id="desk-panel" role="tabpanel" aria-labelledby={`desk-tab-${tab}`} className="mt-5">
              {tab === 'issue' ? (
                <form onSubmit={issue} className="space-y-5">
                  {student ? (
                    <StudentContext student={student} overview={overview} onClear={() => setStudent(null)} />
                  ) : (
                    <SearchPicker
                      label="Student"
                      placeholder="Library ID, name or email"
                      search={searchStudents}
                      onPick={setStudent}
                      renderOption={(u) => (
                        <div className="flex items-center gap-3">
                          <Avatar name={u.name} src={u.profileImage} size={8} role={u.role} className="flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-slate-100">{u.name}{u.isActive === false && <span className="ml-1.5 text-xs text-rose-300">inactive</span>}</p>
                            <p className="truncate font-mono text-xs text-slate-400">{u.libraryId}</p>
                          </div>
                        </div>
                      )}
                    />
                  )}

                  {book ? (
                    <BookContext book={book} onClear={() => setBook(null)} alreadyHas={alreadyHas} />
                  ) : (
                    <SearchPicker
                      label="Book"
                      placeholder="Title or author"
                      search={searchBooks}
                      onPick={setBook}
                      renderOption={(b) => (
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-9 flex-shrink-0 overflow-hidden rounded bg-input"><CoverImage book={b} alt="" size="S" /></div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-slate-100">{b.title}</p>
                            <p className="truncate text-xs text-slate-400">{b.author}</p>
                          </div>
                          <StockMeter available={b.availableCopies ?? 0} total={b.totalCopies ?? 0} compact />
                        </div>
                      )}
                    />
                  )}

                  <fieldset>
                    <legend className="mb-1.5 text-xs font-semibold text-slate-300">Due date</legend>
                    <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Loan length">
                      {[['standard', `Standard · ${loanDays} days`], ['7', '7 days'], ['21', '21 days'], ['custom', 'Pick a date']].map(([key, text]) => (
                        <button
                          key={key}
                          type="button"
                          role="radio"
                          aria-checked={duePreset === key}
                          onClick={() => setDuePreset(key)}
                          className={`min-h-[36px] rounded-full border px-3 text-xs font-semibold transition-colors ${duePreset === key ? 'border-indigo-400/50 bg-indigo-500/15 text-white' : 'border-border text-slate-400 hover:border-slate-500 hover:text-slate-200'}`}
                        >
                          {text}
                        </button>
                      ))}
                    </div>
                    {duePreset === 'custom' && (
                      <input
                        type="date"
                        aria-label="Due date"
                        min={dayString(new Date(today.getTime() + DAY))}
                        value={customDue}
                        onChange={(e) => setCustomDue(e.target.value)}
                        className="input-amo mt-2 w-full sm:w-64"
                      />
                    )}
                    {dueDate && <p className="mt-2 text-sm text-slate-300">Due <span className="font-semibold text-slate-100">{longDate(dueDate)}</span></p>}
                  </fieldset>

                  <button type="submit" disabled={!canIssue} className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto">
                    {issuing ? 'Issuing…' : student && book ? `Issue to ${student.name.split(' ')[0]}` : 'Issue book'}
                  </button>
                </form>
              ) : (
                <div>
                  <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="relative w-full sm:max-w-sm">
                      <svg className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.2-5.2m0 0A7.5 7.5 0 1 0 5.2 5.2a7.5 7.5 0 0 0 10.6 10.6Z" />
                      </svg>
                      <input type="search" value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Student, Library ID or book" aria-label="Filter loans" className="input-amo input-search w-full" />
                    </div>
                    <p className="text-xs text-slate-400" aria-live="polite">
                      {loans.loading ? 'Loading…' : `${plural(shownLoans.length, 'loan')}${overdueCount ? ` · ${overdueCount} overdue` : ''}`}
                    </p>
                  </div>
                  {loans.loading ? (
                    <Skeleton lines={4} className="h-16 w-full" />
                  ) : loans.error ? (
                    <CompactEmpty icon={DASH_ICONS.alert} tone="rose" title="Couldn't load loans" message={loans.error} role="alert" />
                  ) : shownLoans.length === 0 ? (
                    <CompactEmpty icon={DASH_ICONS.check} tone="emerald" title={filter ? 'No loan matches' : 'Nothing is out'} message={filter ? 'Try a Library ID or another title.' : 'Every book is on the shelf.'} />
                  ) : (
                    <ul className="divide-y divide-border/70 rounded-xl border border-border">
                      {shownLoans.map((t) => {
                        const late = getDaysOverdue(t.dueDate);
                        const fine = calculateFine(t.dueDate);
                        return (
                          <li key={t._id} className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center">
                            <div className="flex min-w-0 flex-1 items-center gap-3">
                              <div className="h-14 w-10 flex-shrink-0 overflow-hidden rounded bg-input"><CoverImage book={t.bookId || {}} alt="" size="S" /></div>
                              <div className="min-w-0">
                                <p className="truncate text-sm font-medium text-slate-100">{t.bookId?.title || 'Removed book'}</p>
                                <p className="truncate text-xs text-slate-400">{t.userId?.name || 'Deleted user'} · <span className="font-mono">{t.userId?.libraryId || '—'}</span></p>
                              </div>
                            </div>
                            <div className="flex items-center justify-between gap-3 sm:justify-end">
                              {late > 0 ? (
                                <Badge variant="danger">{plural(late, 'day')} late · {formatRupees(fine)}</Badge>
                              ) : (
                                <span className="text-xs text-slate-400">Due {shortDate(t.dueDate)}</span>
                              )}
                              <button type="button" className="btn-secondary min-h-[36px] px-3 text-xs" onClick={() => setReturning(t)}>Return</button>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                  {loans.total > loans.rows.length && <p className="mt-2 text-xs text-slate-400">Showing the {loans.rows.length} loans due soonest of {loans.total}. Filter by student or book, or use the scan desk.</p>}
                </div>
              )}
            </div>
          </SectionCard>

          <SectionCard className="xl:col-span-4" title="Recent activity" subtitle="Latest loan updates">
            {recent.loading ? (
              <Skeleton lines={5} className="h-12 w-full" />
            ) : recent.rows.length === 0 ? (
              <CompactEmpty icon={DASH_ICONS.inbox} tone="slate" title="Nothing yet" message="Loans and returns appear here." />
            ) : (
              <ul className="space-y-1">
                {recent.rows.slice(0, 7).map((a, i) => (
                  <li key={a.id || i} className="flex items-start gap-3 rounded-xl px-2 py-2">
                    <span className={`mt-1.5 h-2 w-2 flex-shrink-0 rounded-full ${a.status === 'Returned' ? 'bg-emerald-400' : a.status === 'Issued' ? 'bg-indigo-300' : a.status === 'Rejected' ? 'bg-rose-400' : 'bg-amber-300'}`} aria-hidden="true" />
                    <div className="min-w-0">
                      <p className="text-sm text-slate-200"><span className="font-semibold text-slate-100">{a.name}</span> · {a.status?.toLowerCase()}</p>
                      <p className="truncate text-xs text-slate-400">{a.book}</p>
                      <p className="text-[11px] text-slate-500">{a.time}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>
        </div>
      </div>

      <ConfirmModal
        isOpen={!!returning}
        title={returning ? `Return “${returning.bookId?.title || 'this book'}”?` : ''}
        description={returning
          ? `${returning.userId?.name || 'The student'} hands it back now.${returningFine > 0 ? ` It is ${plural(getDaysOverdue(returning.dueDate), 'day')} late: a fine of ${formatRupees(returningFine)} is recorded on their account.` : ' No fine.'}${' '}If someone is waiting for it, the copy is held for them.`
          : ''}
        confirmText="Record return"
        onConfirm={confirmReturn}
        onCancel={() => setReturning(null)}
        loading={returnBusy}
      />
    </MainLayout>
  );
};
