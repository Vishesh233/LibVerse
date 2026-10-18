import React, { useId, useMemo, useState } from 'react';
import { toCsv, downloadCsv } from '../../utils/csv';

const PAGE_SIZES = [25, 50, 100];

const compare = (a, b) => {
  if (a === b) return 0;
  if (a === null || a === undefined || a === '') return 1; // empty values last
  if (b === null || b === undefined || b === '') return -1;
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  return String(a).localeCompare(String(b), 'en', { numeric: true, sensitivity: 'base' });
};

/**
 * Report table: search, sortable columns, 25/50/100 rows per page, sticky header, zebra rows,
 * cards on phones (<= 640px), CSV of the whole filtered table, every filtered row when printed.
 * @param {object} props
 * @param {{ key, label, value: (row) => *, render?: (row) => node, csv?: (row) => * | false, csvLabel?,
 *   screen?: false, align?: 'right', className?, search?: false, primary?: true, card?: false }[]} props.columns
 *   csv: false leaves a column out of the CSV; screen: false makes it CSV-only (also searchable);
 *   primary: the card title on phones; card: false hides it from the phone card
 * @param {{ label, value: (row) => * }[]} [props.csvColumns] - CSV columns when they differ from the screen
 * @param {object[]} props.rows
 * @param {string} props.caption - table name (screen readers, page nav label)
 * @param {string} props.filename - CSV file name
 * @param {{ key: string, dir: 'asc'|'desc' }} [props.initialSort]
 * @param {node} [props.empty] - shown when there are no rows at all
 * @param {string} [props.searchPlaceholder]
 */
export const DataTable = ({ columns, csvColumns, rows, caption, filename, initialSort, empty = null, searchPlaceholder = 'Search this table' }) => {
  const searchId = useId();
  const [sort, setSort] = useState(initialSort || { key: columns[0].key, dir: 'asc' });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    const searchable = columns.filter((c) => c.search !== false);
    return rows.filter((row) => searchable.some((c) => {
      const v = c.searchText ? c.searchText(row) : c.value(row);
      return v !== null && v !== undefined && String(v).toLowerCase().includes(q);
    }));
  }, [rows, columns, query]);

  const sorted = useMemo(() => {
    const col = columns.find((c) => c.key === sort.key) || columns[0];
    const out = [...filtered].sort((x, y) => compare(col.value(x), col.value(y)));
    return sort.dir === 'desc' ? out.reverse() : out;
  }, [filtered, columns, sort]);

  const shown = columns.filter((c) => c.screen !== false);
  const primary = shown.find((c) => c.primary) || shown[0];
  const pages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const current = Math.min(page, pages);
  const start = (current - 1) * pageSize;
  const pageRows = sorted.slice(start, start + pageSize);

  const toggleSort = (key) => {
    setSort((prev) => (prev.key === key ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }));
    setPage(1);
  };

  // The whole filtered table in the current order, with the original separate columns
  const exportCsv = () => {
    const cols = csvColumns || columns.filter((c) => c.csv !== false).map((c) => ({ label: c.csvLabel || c.label, value: c.csv || c.value }));
    downloadCsv(filename, toCsv(cols, sorted));
  };

  if (!rows.length) return empty;

  const cell = (c, row) => (c.render ? c.render(row) : c.value(row));

  return (
    <div className="min-w-0">
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between print:hidden">
        <div className="relative w-full sm:max-w-xs">
          <label htmlFor={searchId} className="sr-only">{`Search ${caption}`}</label>
          <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.2-5.2m0 0A7.5 7.5 0 1 0 5.2 5.2a7.5 7.5 0 0 0 10.6 10.6Z" />
          </svg>
          <input
            id={searchId}
            type="search"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1); }}
            placeholder={searchPlaceholder}
            className="input-amo w-full !min-h-[38px] !py-1.5 !pl-9 text-sm"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-xs text-slate-400" aria-live="polite">
            {sorted.length === rows.length ? `${rows.length.toLocaleString('en-IN')} rows` : `${sorted.length.toLocaleString('en-IN')} of ${rows.length.toLocaleString('en-IN')} rows`}
          </p>
          <label className="flex items-center gap-1.5 text-xs text-slate-400">
            Rows
            <select
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
              className="input-amo !min-h-[34px] !w-auto !py-1 !pl-2 !pr-7 text-xs"
              aria-label="Rows per page"
            >
              {PAGE_SIZES.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </label>
          <button type="button" onClick={exportCsv} disabled={!sorted.length} className="btn-secondary min-h-[34px] px-3 text-xs disabled:opacity-50">
            Export CSV
          </button>
        </div>
      </div>

      {sorted.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-slate-400">No rows match “{query}”.</p>
      ) : (
        <>
          {/* Tablet and up (and print): table with a sticky header */}
          <div className="report-table-wrap hidden max-h-[70vh] overflow-auto rounded-xl border border-border sm:block print:block print:max-h-none">
            <table className="report-table w-full min-w-[720px] text-left text-sm">
              <caption className="sr-only">{caption}{pages > 1 ? `, page ${current} of ${pages}` : ''}</caption>
              <thead className="sticky top-0 z-10 bg-[#111727] text-[11px] uppercase tracking-wider text-slate-400 shadow-[0_1px_0_rgba(255,255,255,0.08)]">
                <tr>
                  {shown.map((c) => {
                    const active = sort.key === c.key;
                    return (
                      <th
                        key={c.key}
                        scope="col"
                        aria-sort={active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}
                        className={`whitespace-nowrap px-3 py-2.5 font-semibold ${c.align === 'right' ? 'text-right' : ''}`}
                      >
                        <button
                          type="button"
                          onClick={() => toggleSort(c.key)}
                          className={`inline-flex min-h-[28px] items-center gap-1 rounded hover:text-slate-100 ${active ? 'text-slate-100' : ''} ${c.align === 'right' ? 'flex-row-reverse' : ''}`}
                        >
                          {c.label}
                          <span aria-hidden="true" className={active ? 'opacity-100' : 'opacity-30'}>{active && sort.dir === 'desc' ? '▼' : '▲'}</span>
                        </button>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {sorted.map((row, i) => {
                  const onPage = i >= start && i < start + pageSize;
                  return (
                    <tr key={row._id || row.key || i} className={`${onPage ? '' : 'hidden print:table-row'} border-t border-border/70 even:bg-white/[0.025] hover:bg-white/[0.05]`}>
                      {shown.map((c) => (
                        <td key={c.key} className={`px-3 py-2 align-middle text-slate-300 ${c.align === 'right' ? 'text-right tabular-nums' : ''} ${c.className || ''}`}>
                          {cell(c, row)}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Phones: one card per row */}
          <ul className="space-y-2 sm:hidden print:hidden" aria-label={caption}>
            {pageRows.map((row, i) => (
              <li key={row._id || row.key || i} className="rounded-xl border border-border bg-white/[0.03] p-3">
                <div className="min-w-0 font-medium text-slate-100">{cell(primary, row)}</div>
                <dl className="mt-2 grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1 text-xs">
                  {shown.filter((c) => c !== primary && c.card !== false).map((c) => (
                    <React.Fragment key={c.key}>
                      <dt className="text-slate-500">{c.label}</dt>
                      <dd className={`min-w-0 text-slate-300 ${c.align === 'right' ? 'tabular-nums' : ''}`}>{cell(c, row)}</dd>
                    </React.Fragment>
                  ))}
                </dl>
              </li>
            ))}
          </ul>

          {pages > 1 && (
            <nav className="mt-3 flex items-center justify-end gap-2 text-xs print:hidden" aria-label={`${caption} pages`}>
              <button type="button" className="btn-secondary min-h-[34px] px-3" disabled={current <= 1} onClick={() => setPage(current - 1)}>Previous</button>
              <span className="text-slate-400" aria-live="polite">Page {current} of {pages}</span>
              <button type="button" className="btn-secondary min-h-[34px] px-3" disabled={current >= pages} onClick={() => setPage(current + 1)}>Next</button>
            </nav>
          )}
        </>
      )}
    </div>
  );
};

export default DataTable;
