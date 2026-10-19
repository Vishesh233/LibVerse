import React, { useEffect, useRef } from 'react';

/**
 * Table for server-side lists (the server sorts, filters and pages; this only renders).
 * Same look as the report tables: sticky header, zebra rows, sortable headers with aria-sort.
 * From md down every row becomes a card (cardRender), so nothing is cut off on a phone.
 *
 * @param {object} props
 * @param {{ key, label, sortKey?, align?: 'right'|'center', className?, headerClassName?, render: (row) => node }[]} props.columns
 * @param {object[]} props.rows
 * @param {string} props.caption - what the table lists (screen readers)
 * @param {{ key: string, dir: 'asc'|'desc' }} [props.sort]
 * @param {(sortKey: string) => void} [props.onSort] - clicked a sortable header
 * @param {(row) => void} [props.onRowClick] - whole row opens something (buttons/links inside keep their own job)
 * @param {(row) => boolean} [props.isRowClickable] - rows that open nothing (default: all open)
 * @param {string} [props.rowLabel] - accessible name builder for clickable rows: (row) => string
 * @param {Set<string>} [props.selected] - selected row ids (renders checkboxes when given)
 * @param {(row) => void} [props.onToggle]
 * @param {(all: boolean) => void} [props.onToggleAll] - select/unselect every row on this page
 * @param {(row) => string} [props.selectLabel]
 * @param {(row) => node} props.cardRender - the phone card body for one row
 * @param {boolean} [props.loading]
 * @param {node} [props.empty]
 * @param {number} [props.skeletonRows]
 */
export const ServerTable = ({
  columns, rows, caption, sort, onSort, onRowClick, isRowClickable = () => true, rowLabel, selected, onToggle, onToggleAll, selectLabel,
  cardRender, loading = false, empty = null, skeletonRows = 8,
}) => {
  const selectable = Boolean(selected && onToggle);
  const allOnPage = selectable && rows.length > 0 && rows.every((r) => selected.has(r._id));
  const someOnPage = selectable && rows.some((r) => selected.has(r._id));
  const headerBox = useRef(null);
  useEffect(() => {
    if (headerBox.current) headerBox.current.indeterminate = someOnPage && !allOnPage;
  }, [someOnPage, allOnPage]);

  const rowClick = (row) => (e) => {
    if (!onRowClick || !isRowClickable(row) || e.target.closest('button, a, input, select, label')) return;
    onRowClick(row);
  };
  const rowKey = (row) => (e) => {
    if (!onRowClick || !isRowClickable(row) || e.target !== e.currentTarget) return;
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onRowClick(row); }
  };

  if (!loading && rows.length === 0) return empty;

  const alignClass = (c) => (c.align === 'right' ? 'text-right' : c.align === 'center' ? 'text-center' : '');

  return (
    <div className="min-w-0">
      {/* md and up: table */}
      <div className="staff-table-wrap relative hidden overflow-x-auto rounded-xl border border-border md:block">
        <table className="staff-table w-full text-left text-sm" aria-busy={loading || undefined}>
          <caption className="sr-only">{caption}</caption>
          <thead className="bg-[#111727] text-[11px] uppercase tracking-wider text-slate-400 shadow-[0_1px_0_rgba(255,255,255,0.08)]">
            <tr>
              {selectable && (
                <th scope="col" className="w-11 px-3 py-2.5">
                  <input
                    ref={headerBox}
                    type="checkbox"
                    className="staff-check"
                    checked={allOnPage}
                    onChange={() => onToggleAll?.(!allOnPage)}
                    aria-label={allOnPage ? 'Unselect every row on this page' : 'Select every row on this page'}
                  />
                </th>
              )}
              {columns.map((c) => {
                const active = sort && c.sortKey && sort.key === c.sortKey;
                return (
                  <th
                    key={c.key}
                    scope="col"
                    aria-sort={c.sortKey ? (active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none') : undefined}
                    className={`whitespace-nowrap px-3 py-2.5 font-semibold ${alignClass(c)} ${c.headerClassName || ''}`}
                  >
                    {c.sortKey && onSort ? (
                      <button
                        type="button"
                        onClick={() => onSort(c.sortKey)}
                        className={`inline-flex min-h-[28px] items-center gap-1 rounded uppercase tracking-wider hover:text-slate-100 ${active ? 'text-slate-100' : ''} ${c.align === 'right' ? 'flex-row-reverse' : ''}`}
                      >
                        {c.label}
                        <span aria-hidden="true" className={active ? 'opacity-100' : 'opacity-30'}>{active && sort.dir === 'desc' ? '▼' : '▲'}</span>
                      </button>
                    ) : (
                      c.label
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: skeletonRows }).map((_, i) => (
                <tr key={i} className="border-t border-border/70">
                  {selectable && <td className="px-3 py-3"><div className="skeleton h-4 w-4" /></td>}
                  {columns.map((c) => (
                    <td key={c.key} className="px-3 py-3"><div className={`skeleton h-4 ${c.key === columns[0].key ? 'w-48' : 'w-16'}`} /></td>
                  ))}
                </tr>
              ))
              : rows.map((row) => {
                const isSelected = selectable && selected.has(row._id);
                const clickable = Boolean(onRowClick) && isRowClickable(row);
                return (
                  <tr
                    key={row._id}
                    onClick={rowClick(row)}
                    onKeyDown={rowKey(row)}
                    tabIndex={clickable ? 0 : undefined}
                    aria-label={clickable && rowLabel ? rowLabel(row) : undefined}
                    aria-selected={selectable ? isSelected : undefined}
                    className={`border-t border-border/70 even:bg-white/[0.02] transition-colors ${clickable ? 'cursor-pointer hover:bg-indigo-500/[0.07] focus-visible:bg-indigo-500/[0.09] focus-visible:outline-none' : 'hover:bg-white/[0.04]'} ${isSelected ? '!bg-cyan-400/[0.08]' : ''}`}
                  >
                    {selectable && (
                      <td className="w-11 px-3 py-2.5 align-middle">
                        <input
                          type="checkbox"
                          className="staff-check"
                          checked={isSelected}
                          onChange={() => onToggle(row)}
                          aria-label={selectLabel ? selectLabel(row) : 'Select row'}
                        />
                      </td>
                    )}
                    {columns.map((c) => (
                      <td key={c.key} className={`px-3 py-2.5 align-middle text-slate-300 ${alignClass(c)} ${c.align === 'right' ? 'tabular-nums' : ''} ${c.className || ''}`}>
                        {c.render(row)}
                      </td>
                    ))}
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      {/* Phones and small tablets: one card per row */}
      <ul className="relative space-y-2.5 md:hidden" aria-label={caption} aria-busy={loading || undefined}>
        {loading
          ? Array.from({ length: Math.min(skeletonRows, 5) }).map((_, i) => (
            <li key={i} className="rounded-2xl border border-border bg-white/[0.03] p-4"><div className="skeleton h-16 w-full" /></li>
          ))
          : rows.map((row) => {
            const isSelected = selectable && selected.has(row._id);
            const clickable = Boolean(onRowClick) && isRowClickable(row);
            return (
              <li
                key={row._id}
                onClick={rowClick(row)}
                onKeyDown={rowKey(row)}
                tabIndex={clickable ? 0 : undefined}
                aria-label={clickable && rowLabel ? rowLabel(row) : undefined}
                className={`staff-card relative rounded-2xl border bg-white/[0.03] p-4 transition-colors ${isSelected ? 'border-cyan-400/50 bg-cyan-400/[0.06]' : 'border-border'} ${clickable ? 'cursor-pointer hover:border-indigo-400/40' : ''}`}
              >
                {selectable && (
                  <label className="absolute right-3 top-3 grid h-9 w-9 cursor-pointer place-items-center rounded-xl border border-white/10 bg-slate-950/60">
                    <input
                      type="checkbox"
                      className="staff-check"
                      checked={isSelected}
                      onChange={() => onToggle(row)}
                      aria-label={selectLabel ? selectLabel(row) : 'Select'}
                    />
                  </label>
                )}
                <div className={selectable ? 'pr-11' : ''}>{cardRender(row)}</div>
              </li>
            );
          })}
      </ul>
    </div>
  );
};

/** Segmented filter (radio group): [{ value, label, count? }] */
export const FilterChips = ({ options, value, onChange, label }) => (
  <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-1.5">
    {options.map((o) => {
      const active = o.value === value;
      return (
        <button
          key={o.value || 'all'}
          type="button"
          role="radio"
          aria-checked={active}
          onClick={() => onChange(o.value)}
          className={`inline-flex min-h-[36px] items-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition-colors ${
            active ? 'border-indigo-400/50 bg-indigo-500/15 text-white' : 'border-border text-slate-400 hover:border-slate-500 hover:text-slate-200'
          }`}
        >
          {o.label}
          {o.count !== undefined && o.count !== null && (
            <span className={`rounded-full px-1.5 text-[10px] tabular-nums ${active ? 'bg-white/15 text-white' : 'bg-white/[0.06] text-slate-400'}`}>{o.count}</span>
          )}
        </button>
      );
    })}
  </div>
);

/** "Showing 1–25 of 59" + pager, for server-paged lists */
export const PageFooter = ({ page, pages, total, pageSize, onPage, noun = 'rows' }) => {
  if (!total) return null;
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);
  return (
    <div className="mt-4 flex flex-col items-center justify-between gap-3 text-xs text-slate-400 sm:flex-row">
      <p aria-live="polite">
        Showing <span className="font-semibold text-slate-200 tabular-nums">{from.toLocaleString('en-IN')}–{to.toLocaleString('en-IN')}</span> of{' '}
        <span className="font-semibold text-slate-200 tabular-nums">{total.toLocaleString('en-IN')}</span> {noun}
      </p>
      {pages > 1 && (
        <nav className="flex items-center gap-2" aria-label={`${noun} pages`}>
          <button type="button" className="btn-secondary min-h-[36px] px-3 text-xs" disabled={page <= 1} onClick={() => onPage(page - 1)}>
            <span aria-hidden="true">←</span> Previous
          </button>
          <span className="tabular-nums">Page {page} of {pages}</span>
          <button type="button" className="btn-secondary min-h-[36px] px-3 text-xs" disabled={page >= pages} onClick={() => onPage(page + 1)}>
            Next <span aria-hidden="true">→</span>
          </button>
        </nav>
      )}
    </div>
  );
};

/** "X of Y" with a small bar; tone by how much is left on the shelf */
export const StockMeter = ({ available = 0, total = 0, compact = false }) => {
  const ratio = total > 0 ? available / total : 0;
  const tone = available <= 0 ? 'out' : available * 5 <= total ? 'low' : 'ok';
  const colors = { out: 'bg-rose-400', low: 'bg-amber-300', ok: 'bg-emerald-400' };
  const text = { out: 'text-rose-200', low: 'text-amber-200', ok: 'text-emerald-200' };
  return (
    <div className={`relative ${compact ? 'inline-flex items-center gap-2' : 'min-w-[7.5rem]'}`}>
      <p className={`text-sm font-semibold tabular-nums ${text[tone]}`}>
        {available} <span className="font-normal text-slate-400">of</span> {total}
        <span className="sr-only">{tone === 'out' ? ', none on the shelf' : tone === 'low' ? ', low stock' : ' available'}</span>
      </p>
      {!compact && (
        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.08]" aria-hidden="true">
          <div className={`h-full rounded-full ${colors[tone]}`} style={{ width: `${Math.round(ratio * 100)}%` }} />
        </div>
      )}
    </div>
  );
};
