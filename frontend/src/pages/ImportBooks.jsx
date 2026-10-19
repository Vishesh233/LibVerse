import React, { useId, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { booksAPI } from '../services/api';
import { MainLayout } from '../layouts/MainLayout';
import { useAuth } from '../hooks/useAuth';
import { Badge, EmptyState, PageHeader } from '../components/UI';
import { DASH_ICONS, IconTile, SectionCard } from '../components/dashboard/DashboardKit';
import { ServerTable, FilterChips } from '../components/staff/ServerTable';
import { GENRES } from '../constants/genres';
import { toCsv, downloadCsv } from '../utils/csv';

const MAX_BYTES = 2 * 1024 * 1024;
const COLUMNS = [
  { key: 'title', required: true, hint: 'Book title' },
  { key: 'author', required: true, hint: 'One or more authors' },
  { key: 'genre', required: true, hint: 'One of the catalogue genres' },
  { key: 'isbn', hint: '13 digits, hyphens allowed' },
  { key: 'year', hint: 'Publication year' },
  { key: 'publisher' },
  { key: 'pages' },
  { key: 'copies', hint: 'Defaults to 1' },
  { key: 'description' },
  { key: 'location', hint: 'Shelf, e.g. A-3' },
];
const TEMPLATE_ROWS = [
  { title: 'The Pragmatic Programmer', author: 'David Thomas, Andrew Hunt', genre: 'Programming', isbn: '978-0135957059', year: 2019, publisher: 'Addison-Wesley', pages: 352, copies: 3, description: 'Practical advice for working programmers, from careers to code.', location: 'B-2' },
  { title: 'Getting Things Done', author: 'David Allen', genre: 'Self-Help', isbn: '9780143126560', year: 2015, publisher: 'Penguin Books', pages: 352, copies: 2, description: 'A method for capturing tasks and deciding the next action for each.', location: 'D-1' },
];
const STATUS = {
  ready: { label: 'Ready', variant: 'success' },
  imported: { label: 'Added', variant: 'success' },
  duplicate: { label: 'Duplicate', variant: 'warning' },
  error: { label: 'Needs a fix', variant: 'danger' },
};
const plural = (n, w) => `${n.toLocaleString('en-IN')} ${w}${n === 1 ? '' : 's'}`;
const copies = (n) => `${n.toLocaleString('en-IN')} ${n === 1 ? 'copy' : 'copies'}`;

const downloadTemplate = () => {
  const csv = toCsv(COLUMNS.map((c) => ({ label: c.key, value: (r) => r[c.key] })), TEMPLATE_ROWS);
  downloadCsv('libverse-books-template.csv', csv);
};

const Tile = ({ label, value, tone, icon, hint }) => (
  <div className="flex items-center gap-3 rounded-2xl border border-border bg-white/[0.03] p-4">
    <IconTile icon={icon} tone={tone} />
    <div className="min-w-0">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="font-display text-2xl font-semibold tabular-nums text-slate-50">{value}</p>
      {hint && <p className="truncate text-[11px] text-slate-500">{hint}</p>}
    </div>
  </div>
);

/** Staff: add many books from a CSV file. The server checks every row before anything is saved. */
export const ImportBooks = () => {
  const { isAdmin } = useAuth();
  const base = isAdmin ? '/admin' : '/librarian';
  const inputId = useId();
  const fileInput = useRef(null);

  const [file, setFile] = useState(null); // { name, size, text }
  const [dragging, setDragging] = useState(false);
  const [checking, setChecking] = useState(false);
  const [preview, setPreview] = useState(null);
  const [fileError, setFileError] = useState('');
  const [filter, setFilter] = useState('');
  const [checkCovers, setCheckCovers] = useState(true);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null);

  const resetAll = () => {
    setFile(null); setPreview(null); setResult(null); setFileError(''); setFilter('');
    if (fileInput.current) fileInput.current.value = '';
  };

  const readFile = async (picked) => {
    if (!picked) return;
    setResult(null); setPreview(null); setFileError(''); setFilter('');
    if (!/\.csv$/i.test(picked.name) && picked.type !== 'text/csv') {
      setFileError('Choose a .csv file. In Excel or Google Sheets: File → Save as / Download → CSV (UTF-8).');
      return;
    }
    if (picked.size > MAX_BYTES) {
      setFileError('The file is larger than 2 MB. Split it into smaller files (up to 1,000 books each).');
      return;
    }
    const text = await picked.text();
    setFile({ name: picked.name, size: picked.size, text });
    setChecking(true);
    try {
      const res = await booksAPI.previewImport(text);
      setPreview(res.data);
    } catch (err) {
      setFileError(err.response?.data?.message || 'The file could not be checked. Try again.');
    } finally {
      setChecking(false);
    }
  };

  const runImport = async () => {
    if (!file || !preview?.summary.ready) return;
    setImporting(true);
    try {
      const res = await booksAPI.importBooks(file.text, checkCovers);
      setResult(res.data);
      if (res.data.imported) toast.success(res.data.message);
      else toast.info(res.data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || 'The import could not be completed');
    } finally {
      setImporting(false);
    }
  };

  // Rows to show: the import result once there is one, otherwise the preview
  const rows = useMemo(() => {
    if (result) {
      const byLine = new Map((preview?.rows || []).map((r) => [r.line, r]));
      return result.rows.map((r) => ({ ...byLine.get(r.line), ...r, book: byLine.get(r.line)?.book || { title: r.title, author: r.author } }));
    }
    return preview?.rows || [];
  }, [preview, result]);
  const problems = rows.filter((r) => r.status === 'error' || r.status === 'duplicate');
  const shown = (filter === 'problems' ? problems : filter === 'ok' ? rows.filter((r) => r.status === 'ready' || r.status === 'imported') : rows)
    .map((r) => ({ ...r, _id: String(r.line) }));

  const downloadProblems = () => {
    const csv = toCsv([
      { label: 'Line', value: (r) => r.line },
      { label: 'Title', value: (r) => r.book?.title || '' },
      { label: 'Author', value: (r) => r.book?.author || '' },
      { label: 'Status', value: (r) => STATUS[r.status]?.label || r.status },
      { label: 'Problems', value: (r) => (r.errors || []).join('; ') },
    ], problems);
    downloadCsv(`libverse-import-problems-${new Date().toISOString().slice(0, 10)}.csv`, csv);
  };

  const columns = [
    { key: 'line', label: 'Line', align: 'right', className: 'w-14 text-slate-500', render: (r) => r.line },
    {
      key: 'book', label: 'Book', className: 'min-w-[14rem]',
      render: (r) => (
        <div className="min-w-0">
          {r.bookId ? (
            <Link to={`${base}/books/${r.bookId}`} className="font-medium text-slate-100 line-clamp-2 hover:text-indigo-200 hover:underline">{r.book?.title}</Link>
          ) : (
            <p className="font-medium text-slate-100 line-clamp-2">{r.book?.title || <span className="italic text-slate-500">No title</span>}</p>
          )}
          <p className="text-xs text-slate-400 line-clamp-1">{r.book?.author || '—'}</p>
        </div>
      ),
    },
    { key: 'genre', label: 'Genre', render: (r) => (r.book?.genre ? <span className="whitespace-nowrap text-slate-300">{r.book.genre}</span> : '—') },
    { key: 'isbn', label: 'ISBN', render: (r) => <span className="whitespace-nowrap font-mono text-xs text-slate-400">{r.book?.isbn || '—'}</span> },
    { key: 'copies', label: 'Copies', align: 'right', render: (r) => r.book?.totalCopies ?? '—' },
    {
      key: 'status', label: 'Status', className: 'min-w-[14rem]',
      render: (r) => (
        <div>
          <Badge variant={STATUS[r.status]?.variant || 'neutral'}>{STATUS[r.status]?.label || r.status}</Badge>
          {r.errors?.length > 0 && (
            <ul className="mt-1 space-y-0.5 text-xs text-slate-300">
              {r.errors.map((e) => <li key={e}>{e}</li>)}
            </ul>
          )}
        </div>
      ),
    },
  ];

  const card = (r) => (
    <div>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] text-slate-500">Line {r.line}</p>
          <p className="font-medium leading-snug text-slate-100 line-clamp-2">{r.book?.title || <span className="italic text-slate-500">No title</span>}</p>
          <p className="text-xs text-slate-400 line-clamp-1">{r.book?.author || '—'}{r.book?.genre ? ` · ${r.book.genre}` : ''}</p>
        </div>
        <Badge variant={STATUS[r.status]?.variant || 'neutral'}>{STATUS[r.status]?.label || r.status}</Badge>
      </div>
      {r.errors?.length > 0 && <ul className="mt-2 space-y-0.5 text-xs text-slate-300">{r.errors.map((e) => <li key={e}>{e}</li>)}</ul>}
    </div>
  );

  const s = preview?.summary;
  const readyCount = s?.ready || 0;

  return (
    <MainLayout>
      <div className="mx-auto max-w-7xl space-y-6 pb-28">
        <PageHeader
          className="!mb-0"
          title="Import books"
          subtitle="Add many books at once from a CSV file. Every row is checked before anything is saved."
          actions={(
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={downloadTemplate} className="btn-secondary whitespace-nowrap">Download template</button>
              <Link to={`${base}/books`} className="btn-ghost whitespace-nowrap">Back to books</Link>
            </div>
          )}
        />

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
          <SectionCard className="xl:col-span-7" title="1. Choose a CSV file" subtitle="Up to 1,000 books and 2 MB per file, saved as CSV (UTF-8).">
            <label
              htmlFor={inputId}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => { e.preventDefault(); setDragging(false); readFile(e.dataTransfer.files?.[0]); }}
              className={`flex min-h-[9rem] cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-4 py-6 text-center transition-colors ${dragging ? 'border-cyan-400/70 bg-cyan-400/[0.06]' : 'border-white/15 hover:border-indigo-400/50 hover:bg-white/[0.02]'}`}
            >
              <svg className="h-8 w-8 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" /></svg>
              {file ? (
                <span className="text-sm text-slate-200"><span className="font-semibold">{file.name}</span> <span className="text-slate-400">· {(file.size / 1024).toFixed(1)} KB · choose another</span></span>
              ) : (
                <span className="text-sm text-slate-200"><span className="font-semibold text-indigo-200">Choose a file</span> or drop it here</span>
              )}
              <span className="text-xs text-slate-400">Start from the template so the header row is right.</span>
              <input
                id={inputId}
                ref={fileInput}
                type="file"
                accept=".csv,text/csv"
                className="sr-only"
                onChange={(e) => readFile(e.target.files?.[0])}
              />
            </label>
            {checking && <p className="mt-3 text-sm text-slate-300" role="status">Checking every row…</p>}
            {fileError && <p className="mt-3 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200" role="alert">{fileError}</p>}
          </SectionCard>

          <SectionCard className="xl:col-span-5" title="Columns" subtitle="Header names are not case sensitive; other columns are ignored.">
            <ul className="flex flex-wrap gap-1.5" aria-label="Columns">
              {COLUMNS.map((c) => (
                <li key={c.key} title={c.hint} className={`rounded-full border px-2.5 py-1 font-mono text-xs ${c.required ? 'border-indigo-400/40 bg-indigo-500/10 text-indigo-100' : 'border-border text-slate-300'}`}>
                  {c.key}{c.required && <span className="text-rose-300" aria-label="required">*</span>}
                </li>
              ))}
            </ul>
            <ul className="mt-3 space-y-1 text-xs text-slate-400">
              <li><span className="text-rose-300">*</span> required. Copies defaults to 1.</li>
              <li>ISBN: the 13-digit ISBN (978… or 979…), hyphens allowed.</li>
              <li>Duplicates (same ISBN, or same title and author) are skipped.</li>
            </ul>
            <details className="mt-3 text-xs text-slate-400">
              <summary className="cursor-pointer font-semibold text-slate-300 hover:text-white">Genres ({GENRES.length})</summary>
              <p className="mt-2 leading-relaxed">{GENRES.join(' · ')}</p>
            </details>
          </SectionCard>
        </div>

        {(preview || result) && (
          <SectionCard
            title={result ? 'Import finished' : '2. Check the rows'}
            subtitle={result
              ? `${plural(result.imported, 'book')} added (${copies(result.copies)})${result.skipped ? `, ${plural(result.skipped, 'row')} skipped` : ''}.`
              : 'Fix problem rows in your spreadsheet and choose the file again, or import the ready rows now.'}
            action={problems.length > 0 && <button type="button" onClick={downloadProblems} className="btn-secondary min-h-[36px] px-3 text-xs">Download problems (CSV)</button>}
          >
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {result ? (
                <>
                  <Tile label="Added" value={result.imported} tone="emerald" icon={DASH_ICONS.check} hint={copies(result.copies)} />
                  <Tile label="Skipped" value={result.skipped} tone={result.skipped ? 'amber' : 'slate'} icon={DASH_ICONS.alert} hint="errors and duplicates" />
                  <Tile label="Covers found" value={result.covers ? result.covers.found : '—'} tone="cyan" icon={DASH_ICONS.book} hint={result.covers ? `of ${result.covers.checked} checked on Open Library` : 'not checked'} />
                  <Tile label="Rows in file" value={rows.length} tone="indigo" icon={DASH_ICONS.library} />
                </>
              ) : (
                <>
                  <Tile label="Ready to add" value={s.ready} tone="emerald" icon={DASH_ICONS.check} />
                  <Tile label="Need a fix" value={s.errors} tone={s.errors ? 'rose' : 'slate'} icon={DASH_ICONS.alert} />
                  <Tile label="Duplicates" value={s.duplicates} tone={s.duplicates ? 'amber' : 'slate'} icon={DASH_ICONS.library} hint="already in the catalogue or the file" />
                  <Tile label="Rows in file" value={s.total} tone="indigo" icon={DASH_ICONS.book} />
                </>
              )}
            </div>

            {preview?.columns?.ignored?.length > 0 && !result && (
              <p className="mt-3 text-xs text-slate-400">Ignored columns: <span className="font-mono">{preview.columns.ignored.join(', ')}</span></p>
            )}

            <div className="mb-3 mt-5 flex flex-wrap items-center justify-between gap-3">
              <FilterChips
                label="Show rows"
                value={filter}
                onChange={setFilter}
                options={[
                  { value: '', label: 'All', count: rows.length },
                  { value: 'ok', label: result ? 'Added' : 'Ready', count: rows.length - problems.length },
                  { value: 'problems', label: 'Problems', count: problems.length },
                ]}
              />
            </div>
            <ServerTable
              caption="Rows in the CSV file"
              columns={columns}
              rows={shown}
              cardRender={card}
              empty={<EmptyState bare icon="✅" title="Nothing here" message={filter === 'problems' ? 'Every row is fine.' : 'No rows in this view.'} />}
            />
          </SectionCard>
        )}
      </div>

      {/* Import bar */}
      {preview && (
        <div className="fixed inset-x-0 bottom-0 z-30 px-3 pb-3 sm:px-6 sm:pb-5 lg:pl-[17rem]" role="region" aria-label="Import">
          <div className="mx-auto flex max-w-5xl flex-col gap-3 rounded-2xl border border-indigo-400/30 bg-slate-950/95 p-3 shadow-2xl backdrop-blur-md sm:flex-row sm:items-center sm:justify-between">
            {result ? (
              <>
                <p className="text-sm text-slate-200" aria-live="polite">
                  <strong className="text-emerald-200">{plural(result.imported, 'book')}</strong> added to the catalogue.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Link to={`${base}/books?sort=-added`} className="btn-primary min-h-[40px] px-4 text-xs">See them in Books</Link>
                  <button type="button" className="btn-ghost min-h-[40px] px-3 text-xs" onClick={resetAll}>Import another file</button>
                </div>
              </>
            ) : (
              <>
                <label className="flex cursor-pointer items-start gap-2.5 text-sm text-slate-200">
                  <input type="checkbox" className="staff-check mt-0.5" checked={checkCovers} onChange={(e) => setCheckCovers(e.target.checked)} />
                  <span>
                    Look up covers on Open Library
                    <span className="block text-xs text-slate-400">Uses each ISBN; can take up to 30 seconds.</span>
                  </span>
                </label>
                <div className="flex flex-wrap gap-2">
                  <button type="button" className="btn-primary min-h-[40px] px-4 text-xs" disabled={!readyCount || importing} onClick={runImport}>
                    {importing ? 'Adding books…' : readyCount ? `Add ${plural(readyCount, 'book')}` : 'No rows ready'}
                  </button>
                  <button type="button" className="btn-ghost min-h-[40px] px-3 text-xs" onClick={resetAll} disabled={importing}>Cancel</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </MainLayout>
  );
};
