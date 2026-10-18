import React, { useMemo, useState } from 'react';
import { toCsv, downloadCsv } from '../../utils/csv';

const PAGE_SIZE = 25;

const compare = (a, b) => {
  if (a === b) return 0;
  if (a === null || a === undefined || a === '') return 1; // empty values last
  if (b === null || b === undefined || b === '') return -1;
  if (a instanceof Date || b instanceof Date) return new Date(a) - new Date(b);
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  return String(a).localeCompare(String(b), 'en', { numeric: true, sensitivity: 'base' });
};

/**
 * Sortable table with CSV export of the current order. On screen it pages by 25 rows; printed,
 * every row is shown.
 * @param {object} props
 * @param {{ key, label, value: (row) => *, render?: (row) => node, csv?: (row) => * | false, screen?: false, align?: 'right', className? }[]} props.columns
 *   csv: false leaves a column out of the CSV; screen: false makes it CSV-only
 * @param {object[]} props.rows
 * @param {string} props.caption - table name (screen readers; also the CSV file name part)
 * @param {string} props.filename - CSV file name
 * @param {{ key: string, dir: 'asc'|'desc' }} [props.initialSort]
 * @param {node} [props.empty] - shown when there are no rows
 */
export const SortableTable = ({ columns, rows, caption, filename, initialSort, empty = null, toolbar = null }) => {
  const [sort, setSort] = useState(initialSort || { key: columns[0].key, dir: 'asc' });
  const [page, setPage] = useState(1);

  const sorted = useMemo(() => {
    const col = columns.find((c) => c.key === sort.key) || columns[0];
    const out = [...rows].sort((x, y) => compare(col.value(x), col.value(y)));
    return sort.dir === 'desc' ? out.reverse() : out;
  }, [rows, columns, sort]);

  const shown = columns.filter((c) => c.screen !== false);
  const pages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const start = (current - 1) * PAGE_SIZE;

  const toggleSort = (key) => {
    setSort((prev) => (prev.key === key ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }));
    setPage(1);
  };

  const exportCsv = () => {
    const csvColumns = columns.filter((c) => c.csv !== false).map((c) => ({ label: c.csvLabel || c.label, value: c.csv || c.value }));
    downloadCsv(filename, toCsv(csvColumns, sorted));
  };

  return (
    <div className="min-w-0">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 print:hidden">
        <p className="text-xs text-slate-400">{sorted.length.toLocaleString('en-IN')} row{sorted.length === 1 ? '' : 's'}</p>
        <div className="flex flex-wrap items-center gap-2">
          {toolbar}
          <button type="button" onClick={exportCsv} disabled={!sorted.length} className="btn-secondary min-h-[36px] px-3 text-xs disabled:opacity-50">
            Export CSV
          </button>
        </div>
      </div>

      {sorted.length === 0 ? empty : (
        <>
          <div className="report-table-wrap overflow-x-auto rounded-xl border border-border">
            <table className="report-table w-full min-w-[640px] text-left text-sm">
              <caption className="sr-only">{caption}{sorted.length > PAGE_SIZE ? `, page ${current} of ${pages}` : ''}</caption>
              <thead className="bg-white/[0.03] text-[11px] uppercase tracking-wider text-slate-400">
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
                          className={`inline-flex min-h-[28px] items-center gap-1 rounded hover:text-slate-100 ${active ? 'text-slate-100' : ''}`}
                        >
                          {c.label}
                          <span aria-hidden="true" className={active ? 'opacity-100' : 'opacity-30'}>{active && sort.dir === 'desc' ? '▼' : '▲'}</span>
                        </button>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {sorted.map((row, i) => {
                  const onPage = i >= start && i < start + PAGE_SIZE;
                  return (
                    <tr key={row._id || row.key || i} className={`${onPage ? '' : 'hidden print:table-row'} hover:bg-white/[0.02]`}>
                      {shown.map((c) => (
                        <td key={c.key} className={`px-3 py-2.5 align-top text-slate-300 ${c.align === 'right' ? 'text-right tabular-nums' : ''} ${c.className || ''}`}>
                          {c.render ? c.render(row) : c.value(row)}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

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
