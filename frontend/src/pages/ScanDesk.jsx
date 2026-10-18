import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { deskAPI } from '../services/api';
import { MainLayout } from '../layouts/MainLayout';
import { Badge, Button, EmptyState, PageHeader } from '../components/UI';
import { CoverImage } from '../components/CoverImage';
import { DashTabs, formatRupees } from '../components/dashboard/DashboardKit';
import { ScannerPanel } from '../components/desk/ScannerPanel';
import { deskFeedback, unlockSound } from '../utils/deskFeedback';
import { useAuth } from '../hooks/useAuth';

const MODES = [
  { key: 'issue', label: 'Issue' },
  { key: 'return', label: 'Return' },
];
const DUPLICATE_MS = 2000;

const day = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—');
const initials = (name = '') => name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase() || '?';
const same = (a, b) => a && b && String(a) === String(b);

const Notice = ({ notice, onClose }) => {
  if (!notice) return null;
  const tones = {
    error: 'border-rose-400/30 bg-rose-500/10 text-rose-100',
    success: 'border-emerald-400/30 bg-emerald-500/10 text-emerald-50',
    info: 'border-cyan-400/30 bg-cyan-500/10 text-cyan-50',
  };
  return (
    <div className={`flex items-start justify-between gap-3 rounded-2xl border p-3 text-sm ${tones[notice.tone]}`} role={notice.tone === 'error' ? 'alert' : 'status'}>
      <p>{notice.text}</p>
      <button type="button" onClick={onClose} className="text-xs opacity-70 hover:opacity-100" aria-label="Dismiss message">✕</button>
    </div>
  );
};

const StepCard = ({ step, title, done, children, action }) => (
  <section className={`card-glass !p-4 sm:!p-5 ${done ? '!border-emerald-400/25' : ''}`} aria-label={title}>
    <div className="mb-3 flex items-center justify-between gap-2">
      <h2 className="flex items-center gap-2 font-display text-base font-semibold text-slate-100">
        <span className={`grid h-6 w-6 place-items-center rounded-full text-xs font-bold ${done ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/10 text-slate-300'}`} aria-hidden="true">
          {done ? '✓' : step}
        </span>
        {title}
      </h2>
      {action}
    </div>
    {children}
  </section>
);

const Stat = ({ label, value, tone = 'text-slate-100' }) => (
  <div className="min-w-0 rounded-xl border border-border bg-white/[0.03] px-3 py-2">
    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{label}</p>
    <p className={`truncate font-display text-base font-bold ${tone}`}>{value}</p>
  </div>
);

const StudentPanel = ({ student, highlightBookId }) => (
  <div className="space-y-3">
    <div className="flex items-center gap-3">
      <span className="grid h-12 w-12 flex-shrink-0 place-items-center overflow-hidden rounded-full bg-indigo-500/15 font-bold text-indigo-200" aria-hidden="true">
        {student.profileImage ? <img src={student.profileImage} alt="" className="h-full w-full object-cover" /> : initials(student.name)}
      </span>
      <div className="min-w-0">
        <p className="truncate font-semibold text-slate-50">{student.name}</p>
        <p className="text-xs text-slate-400">
          <span className="font-mono">{student.libraryId}</span> · <span className="capitalize">{student.role}</span>
        </p>
      </div>
    </div>
    <div className="grid grid-cols-3 gap-2">
      <Stat label="On loan" value={student.activeLoans} />
      <Stat label="Overdue" value={student.overdueLoans} tone={student.overdueLoans ? 'text-rose-300' : 'text-slate-100'} />
      <Stat label="Unpaid fines" value={formatRupees(student.unpaidFinesTotal)} tone={student.unpaidFinesTotal ? 'text-amber-300' : 'text-slate-100'} />
    </div>
    {student.unpaidFinesTotal > 0 && (
      <p className="rounded-xl border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-100" role="note">
        {formatRupees(student.unpaidFinesTotal)} in unpaid fines
        {student.accruingFines ? ` (${formatRupees(student.payableFines)} fixed, ${formatRupees(student.accruingFines)} still growing)` : ''}. You can still issue books.
      </p>
    )}
    {student.readyReservations.length > 0 && (
      <div className="rounded-xl border border-emerald-400/25 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-50">
        <p className="font-semibold">Ready for pickup</p>
        <ul className="mt-1 space-y-0.5">
          {student.readyReservations.map((r) => (
            <li key={r.reservationId} className={same(r.bookId, highlightBookId) ? 'font-semibold text-white' : ''}>
              “{r.title}” · held until {day(r.expiresAt)}
            </li>
          ))}
        </ul>
      </div>
    )}
  </div>
);

const BookPanel = ({ book, children }) => (
  <div className="space-y-3">
    <div className="flex gap-3">
      <span className="h-24 w-16 flex-shrink-0 overflow-hidden rounded-lg border border-white/10 bg-input">
        <CoverImage book={{ title: book.title, imageUrl: book.cover }} src={book.cover} alt="" />
      </span>
      <div className="min-w-0">
        <p className="font-semibold leading-snug text-slate-50 line-clamp-2">{book.title}</p>
        <p className="text-sm text-slate-400 line-clamp-1">{book.author}</p>
        <p className="mt-1 text-xs text-slate-500">{[book.genre, book.location && `Shelf ${book.location}`, book.isbn && `ISBN ${book.isbn}`].filter(Boolean).join(' · ')}</p>
      </div>
    </div>
    <div className="grid grid-cols-4 gap-2">
      <Stat label="Free" value={book.availableCopies} tone={book.availableCopies ? 'text-emerald-300' : 'text-rose-300'} />
      <Stat label="On loan" value={book.issuedCopies} />
      <Stat label="Held" value={book.heldCopies} tone={book.heldCopies ? 'text-cyan-300' : 'text-slate-100'} />
      <Stat label="Total" value={book.totalCopies} />
    </div>
    {book.queueLength > 0 && <p className="text-xs text-slate-400">{book.queueLength} student{book.queueLength === 1 ? '' : 's'} waiting in the reservation queue.</p>}
    {children}
  </div>
);

export const ScanDesk = () => {
  const { isAdmin, isLibrarian } = useAuth();
  const canAccess = isAdmin || isLibrarian;
  const base = isAdmin ? '/admin' : '/librarian';
  const [params, setParams] = useSearchParams();
  const mode = params.get('mode') === 'return' ? 'return' : 'issue';

  const [cameraOn, setCameraOn] = useState(false);
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const [notice, setNotice] = useState(null);
  const lastScan = useRef({ code: '', at: 0 });

  // Issue flow
  const [student, setStudent] = useState(null);
  const [book, setBook] = useState(null);
  const [issueResult, setIssueResult] = useState(null);
  // Return flow
  const [retBook, setRetBook] = useState(null);
  const [retStudent, setRetStudent] = useState(null);
  const [loanId, setLoanId] = useState(null);
  const [returnResult, setReturnResult] = useState(null);

  // Sound is allowed after the first interaction on the page
  useEffect(() => {
    const unlock = () => unlockSound();
    window.addEventListener('pointerdown', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, []);

  const resetAll = () => {
    setStudent(null);
    setBook(null);
    setIssueResult(null);
    setRetBook(null);
    setRetStudent(null);
    setLoanId(null);
    setReturnResult(null);
    setNotice(null);
    lastScan.current = { code: '', at: 0 };
  };

  const changeMode = (next) => {
    if (next === mode) return;
    setCameraOn(false); // the camera stops when switching modes
    resetAll();
    setParams((prev) => {
      const p = new URLSearchParams(prev);
      if (next === 'issue') p.delete('mode');
      else p.set('mode', next);
      return p;
    }, { replace: true });
  };

  const fail = (text) => {
    setNotice({ tone: 'error', text });
    deskFeedback('error');
  };

  const run = async (fn) => {
    busyRef.current = true;
    setBusy(true);
    try {
      await fn();
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  };

  /** Pick the open loan of the scanned book that belongs to this student */
  const matchLoan = (bookData, studentData) => {
    const loan = bookData.openLoans.find((l) => same(l.userId, studentData._id));
    if (loan) {
      setLoanId(loan.transactionId);
      return true;
    }
    fail(`${studentData.name} has no open loan of “${bookData.title}”.`);
    return false;
  };

  const handleResolved = (data) => {
    if (mode === 'issue') {
      if (data.type === 'user') {
        if (data.user.role !== 'student') return fail(`${data.user.name} is a ${data.user.role}. Only students can borrow books.`);
        // The same student again keeps the "Issued ..." confirmation on screen
        if (!same(student?._id, data.user._id)) setIssueResult(null);
        setStudent(data.user);
        setNotice(null);
      } else {
        setBook(data.book);
        setIssueResult(null);
        setNotice(null);
      }
      deskFeedback('success');
      return undefined;
    }
    // Return mode
    if (data.type === 'book') {
      setRetBook(data.book);
      setReturnResult(null);
      setNotice(null);
      const loans = data.book.openLoans;
      if (loans.length === 0) {
        setLoanId(null);
        setNotice({ tone: 'info', text: `“${data.book.title}” has no open loans, so there is nothing to return.` });
      } else if (retStudent) {
        if (!matchLoan(data.book, retStudent)) return undefined;
      } else {
        setLoanId(loans.length === 1 ? loans[0].transactionId : null);
      }
    } else {
      setRetStudent(data.user);
      setNotice(null); // a card scan keeps the last "Returned ..." confirmation; the next book clears it
      if (retBook) {
        if (!matchLoan(retBook, data.user)) return undefined;
      } else if (data.user.loans.length === 0) {
        setNotice({ tone: 'info', text: `${data.user.name} has no books on loan.` });
      }
    }
    deskFeedback('success');
    return undefined;
  };

  const lookup = useCallback(async (raw) => {
    const code = raw.trim();
    const now = Date.now();
    if (!code || busyRef.current) return;
    // The camera sees the same code many times a second: a repeat is ignored until the code has
    // been out of sight for 2 s (every sighting moves the window on)
    if (code === lastScan.current.code && now - lastScan.current.at < DUPLICATE_MS) {
      lastScan.current.at = now;
      return;
    }
    lastScan.current = { code, at: now };
    await run(async () => {
      try {
        const res = await deskAPI.resolve(code);
        handleResolved(res.data);
      } catch (err) {
        fail(err.response?.data?.message || 'Could not look up that code. Check the connection and try again.');
      }
    });
  }, [mode, student, retBook, retStudent]); // eslint-disable-line react-hooks/exhaustive-deps

  const refreshStudent = async (libraryId) => {
    try {
      const r = await deskAPI.resolve(libraryId);
      if (r.data.type === 'user') setStudent(r.data.user);
    } catch {
      /* the panel keeps the previous numbers */
    }
  };

  const doIssue = () => run(async () => {
    try {
      const res = await deskAPI.issue(student._id, book._id);
      setIssueResult({ title: book.title, student: student.name, dueDate: res.data.dueDate, fromHold: res.data.fromHold, fromRequest: res.data.fromRequest });
      setBook(null);
      setNotice(null);
      deskFeedback('success');
      await refreshStudent(student.libraryId);
    } catch (err) {
      fail(err.response?.data?.message || 'The book could not be issued. Try again.');
    }
  });

  const doReturn = () => run(async () => {
    const loan = retBook.openLoans.find((l) => same(l.transactionId, loanId));
    try {
      const res = await deskAPI.returnLoan(loanId);
      setReturnResult({ title: retBook.title, student: loan?.student, fine: res.data.fine, kind: res.data.kind, heldForNext: res.data.heldForNext });
      setRetBook(null);
      setRetStudent(null);
      setLoanId(null);
      setNotice(null);
      deskFeedback('success');
    } catch (err) {
      fail(err.response?.data?.message || 'The return could not be completed. Try again.');
    }
  });

  if (!canAccess) {
    return (
      <MainLayout>
        <EmptyState icon="🔒" title="Staff only" message="The scan desk is for librarians and admins." />
      </MainLayout>
    );
  }

  // Issue checks shown before the server is asked
  const alreadyHas = student && book && student.loans.some((l) => same(l.bookId, book._id));
  const heldForStudent = student && book && book.heldFor.some((h) => same(h.userId, student._id));
  const heldForOthers = book && book.availableCopies <= 0 && book.heldCopies > 0 && !heldForStudent;
  const noCopy = book && book.availableCopies <= 0 && !heldForStudent;
  const canIssue = student && book && !alreadyHas && !noCopy && !busy;
  const firstName = (student?.name || '').split(/\s+/)[0];

  const selectedLoan = retBook?.openLoans.find((l) => same(l.transactionId, loanId)) || null;
  const blockedByFine = selectedLoan && selectedLoan.status !== 'issued' && selectedLoan.payableFine > 0;
  const canReturn = selectedLoan && !blockedByFine && !busy;

  const prompt = mode === 'issue'
    ? (!student ? 'Scan the student’s library card' : !book ? `Scan a book for ${firstName}` : 'Issue the book, or scan another one')
    : (!retBook
      ? (retStudent ? `Scan the book ${retStudent.name.split(/\s+/)[0]} is returning` : 'Scan the book being returned')
      : retBook.openLoans.length > 1 && !loanId ? 'Pick the loan, or scan the student’s card' : 'Confirm the return');

  return (
    <MainLayout>
      <div className="mx-auto max-w-7xl space-y-5 pb-10">
        <PageHeader title="Scan desk" subtitle="Scan library cards and book QR codes to issue and return books at the counter." className="!mb-0" />

        <DashTabs tabs={MODES} active={mode} onChange={changeMode} label="Desk mode" idPrefix="desk" />

        <div id="desk-panel" role="tabpanel" aria-labelledby={`desk-tab-${mode}`} className="grid items-start gap-5 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <div className="lg:sticky lg:top-4">
            <ScannerPanel cameraOn={cameraOn} onCameraChange={setCameraOn} onCode={lookup} prompt={prompt} busy={busy} />
          </div>

          <div className="space-y-4">
            <Notice notice={notice} onClose={() => setNotice(null)} />

            {mode === 'issue' ? (
              <>
                {issueResult && (
                  <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4 text-emerald-50" role="status">
                    <p className="font-semibold">Issued “{issueResult.title}” to {issueResult.student}.</p>
                    <p className="mt-0.5 text-sm">Due back {day(issueResult.dueDate)}.{issueResult.fromHold ? ' Their reserved copy was used.' : ''}{issueResult.fromRequest ? ' Their online request is now this loan.' : ''}</p>
                    <p className="mt-1 text-xs text-emerald-200/80">Scan the next book for {issueResult.student.split(/\s+/)[0]}, or a new card.</p>
                  </div>
                )}

                <StepCard step={1} title="Student" done={!!student} action={student && <button type="button" className="btn-ghost min-h-[32px] px-2 text-xs" onClick={() => { setStudent(null); setIssueResult(null); }}>New student</button>}>
                  {student ? <StudentPanel student={student} highlightBookId={book?._id} /> : <p className="text-sm text-slate-400">Scan the library card, or type the Library ID.</p>}
                </StepCard>

                <StepCard step={2} title="Book" done={!!book} action={book && <button type="button" className="btn-ghost min-h-[32px] px-2 text-xs" onClick={() => setBook(null)}>Clear</button>}>
                  {book ? (
                    <BookPanel book={book}>
                      {alreadyHas && <p className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-100">{student.name} already has this book on loan.</p>}
                      {heldForStudent && <p className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-50">A copy is held for {student.name}’s reservation. Issuing uses it.</p>}
                      {heldForOthers && (
                        <p className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-100">
                          Every copy not on loan is held for another student’s reservation ({book.heldFor.map((h) => h.name).join(', ')}).
                        </p>
                      )}
                      {noCopy && !heldForOthers && <p className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-100">No copy is free right now.</p>}
                    </BookPanel>
                  ) : (
                    <p className="text-sm text-slate-400">{student ? 'Scan the book’s QR label, or type its ISBN.' : 'Scan the card first, then the book (either order works).'}</p>
                  )}
                </StepCard>

                <Button onClick={doIssue} disabled={!canIssue} loading={busy && !!student && !!book} className="min-h-[52px] text-base">
                  {student && book ? `Issue “${book.title.length > 40 ? `${book.title.slice(0, 39)}…` : book.title}” to ${firstName}` : 'Issue book'}
                </Button>
              </>
            ) : (
              <>
                {returnResult && (
                  <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4 text-emerald-50" role="status">
                    <p className="font-semibold">Returned “{returnResult.title}”{returnResult.student ? ` from ${returnResult.student}` : ''}.</p>
                    <p className="mt-0.5 text-sm">
                      {returnResult.kind === 'desk' && returnResult.fine > 0 ? `Fine of ${formatRupees(returnResult.fine)} recorded on their account.` : 'No fine to collect.'}
                    </p>
                    {returnResult.heldForNext && (
                      <p className="mt-1 text-sm text-cyan-100">
                        Put this copy aside: it is held for {returnResult.heldForNext.name}{returnResult.heldForNext.libraryId ? ` (${returnResult.heldForNext.libraryId})` : ''} until {day(returnResult.heldForNext.expiresAt)}.
                      </p>
                    )}
                  </div>
                )}

                {!retBook && retStudent && retStudent.loans.length > 0 && (
                  <StepCard step={1} title={`${retStudent.name}’s loans`} action={<button type="button" className="btn-ghost min-h-[32px] px-2 text-xs" onClick={() => setRetStudent(null)}>Clear</button>}>
                    <p className="mb-2 text-xs text-slate-400">Scan the book, or pick it here:</p>
                    <ul className="space-y-2">
                      {retStudent.loans.map((l) => (
                        <li key={l.transactionId}>
                          <button type="button" onClick={() => lookup(String(l.bookId))} className="flex w-full items-center justify-between gap-3 rounded-xl border border-border bg-white/[0.03] px-3 py-2 text-left text-sm hover:border-indigo-400/30">
                            <span className="min-w-0 truncate text-slate-100">{l.title}</span>
                            <span className="flex-shrink-0 text-xs text-slate-400">due {day(l.dueDate)}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </StepCard>
                )}

                <StepCard step={retStudent && !retBook ? 2 : 1} title="Book" done={!!retBook} action={retBook && <button type="button" className="btn-ghost min-h-[32px] px-2 text-xs" onClick={() => { setRetBook(null); setLoanId(null); }}>Clear</button>}>
                  {retBook ? (
                    <BookPanel book={retBook}>
                      {retBook.openLoans.length > 0 && (
                        <fieldset>
                          <legend className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                            {retBook.openLoans.length === 1 ? 'Open loan' : `${retBook.openLoans.length} open loans: pick one`}
                          </legend>
                          <div className="space-y-2">
                            {retBook.openLoans.map((l) => {
                              const checked = same(l.transactionId, loanId);
                              return (
                                <label key={l.transactionId} className={`flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-2.5 text-sm transition-colors ${checked ? 'border-indigo-400/50 bg-indigo-500/10' : 'border-border bg-white/[0.03] hover:border-slate-500'}`}>
                                  <input type="radio" name="desk-loan" className="mt-1" checked={checked} onChange={() => setLoanId(l.transactionId)} />
                                  <span className="min-w-0 flex-1">
                                    <span className="block font-medium text-slate-100">{l.student} <span className="font-mono text-xs text-slate-400">{l.libraryId}</span></span>
                                    <span className="block text-xs text-slate-400">
                                      Due {day(l.dueDate)}
                                      {l.daysOverdue > 0 ? ` · ${l.daysOverdue} day${l.daysOverdue === 1 ? '' : 's'} late` : ''}
                                      {l.status !== 'issued' ? ` · ${l.status === 'payment_pending' ? 'payment waiting' : 'return requested'}` : ''}
                                    </span>
                                  </span>
                                  {l.status === 'issued'
                                    ? <Badge variant={l.fineIfReturnedNow ? 'warning' : 'success'}>{l.fineIfReturnedNow ? `Fine ${formatRupees(l.fineIfReturnedNow)}` : 'No fine'}</Badge>
                                    : <Badge variant={l.payableFine ? 'danger' : 'success'}>{l.payableFine ? `${formatRupees(l.payableFine)} unpaid` : 'Nothing to pay'}</Badge>}
                                </label>
                              );
                            })}
                          </div>
                        </fieldset>
                      )}
                    </BookPanel>
                  ) : (
                    <p className="text-sm text-slate-400">Scan the book’s QR label, or type its ISBN. You can also start with the student’s card.</p>
                  )}
                </StepCard>

                {selectedLoan && (
                  <StepCard step={retStudent && !retBook ? 3 : 2} title="Confirm">
                    {blockedByFine ? (
                      <p className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-100">
                        {formatRupees(selectedLoan.payableFine)} is still payable on this loan. {selectedLoan.status === 'payment_pending' ? 'Verify the payment' : 'Collect or waive the fine'} on the <Link className="underline" to={`${base}/pending?tab=${selectedLoan.status === 'payment_pending' ? 'payment' : 'return'}`}>Requests page</Link> first.
                      </p>
                    ) : (
                      <p className="text-sm text-slate-300">
                        {selectedLoan.status === 'issued'
                          ? (selectedLoan.fineIfReturnedNow > 0
                            ? <>Returning now records a fine of <strong className="text-amber-300">{formatRupees(selectedLoan.fineIfReturnedNow)}</strong> ({selectedLoan.daysOverdue} days late at ₹5 a day).</>
                            : 'Returned on time: no fine.')
                          : 'The return request has nothing left to pay, so it can be completed now.'}
                      </p>
                    )}
                  </StepCard>
                )}

                <Button onClick={doReturn} disabled={!canReturn} loading={busy && !!selectedLoan} variant="success" className="min-h-[52px] text-base">
                  {selectedLoan ? `Confirm return from ${selectedLoan.student.split(/\s+/)[0]}` : 'Confirm return'}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
