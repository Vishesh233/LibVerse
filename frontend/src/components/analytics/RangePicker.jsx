import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { RANGE_PRESETS, formatRangeLabel, isDayString, presetRange, rangeFromParams, toDayString } from '../../utils/dateRange';

/**
 * The page's date range, kept in the URL (?range=30d|90d|12m or ?range=custom&from=&to=),
 * so a filtered view survives refresh and can be shared.
 * @returns {{ range: { preset, from, to }, setPreset: Function, setCustom: Function }}
 */
export const useRangeParams = () => {
  const [params, setParams] = useSearchParams();
  const key = `${params.get('range') || ''}|${params.get('from') || ''}|${params.get('to') || ''}`;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const range = useMemo(() => rangeFromParams(params), [key]);

  const setPreset = (preset) =>
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete('from');
      next.delete('to');
      if (preset === '12m') next.delete('range');
      else next.set('range', preset);
      return next;
    }, { replace: true });

  const setCustom = (from, to) =>
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('range', 'custom');
      next.set('from', from);
      next.set('to', to);
      return next;
    }, { replace: true });

  return { range, setPreset, setCustom };
};

/**
 * Presets as a radio group (arrow keys move the selection) plus a custom from/to form.
 */
export const RangePicker = ({ range, onPreset, onCustom, className = '' }) => {
  const refs = useRef({});
  const [showCustom, setShowCustom] = useState(range.preset === 'custom');
  const [from, setFrom] = useState(range.from);
  const [to, setTo] = useState(range.to);
  const [error, setError] = useState('');
  const today = toDayString(new Date());

  useEffect(() => {
    setFrom(range.from);
    setTo(range.to);
    if (range.preset === 'custom') setShowCustom(true);
  }, [range.from, range.to, range.preset]);

  const selectPreset = (key) => {
    if (key === 'custom') {
      setShowCustom(true);
      return;
    }
    setShowCustom(false);
    setError('');
    onPreset(key);
  };

  const onKeyDown = (e) => {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    if (!step) return;
    e.preventDefault();
    const current = showCustom ? 'custom' : range.preset;
    const i = RANGE_PRESETS.findIndex((p) => p.key === current);
    const next = RANGE_PRESETS[(i + step + RANGE_PRESETS.length) % RANGE_PRESETS.length].key;
    selectPreset(next);
    refs.current[next]?.focus();
  };

  const apply = (e) => {
    e.preventDefault();
    if (!isDayString(from) || !isDayString(to)) return setError('Choose both dates.');
    if (from > to) return setError('The start date must be on or before the end date.');
    setError('');
    onCustom(from, to);
  };

  const selectedKey = showCustom ? 'custom' : range.preset;

  return (
    <div className={`flex flex-col gap-2 print:hidden ${className}`}>
      <div className="inline-flex w-fit flex-wrap gap-1 rounded-xl border border-border bg-input/70 p-1" role="radiogroup" aria-label="Date range">
        {RANGE_PRESETS.map((p) => {
          const selected = p.key === selectedKey;
          return (
            <button
              key={p.key}
              ref={(node) => { refs.current[p.key] = node; }}
              type="button"
              role="radio"
              aria-checked={selected}
              tabIndex={selected ? 0 : -1}
              onClick={() => selectPreset(p.key)}
              onKeyDown={onKeyDown}
              className={`min-h-[36px] rounded-lg px-3 text-xs font-semibold transition-colors ${
                selected ? 'bg-indigo-500/20 text-white shadow-[0_0_0_1px_rgba(99,102,241,0.3)]' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
              }`}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      {showCustom && (
        <form onSubmit={apply} className="flex flex-wrap items-end gap-2" aria-label="Custom date range">
          <label className="flex flex-col text-xs text-slate-400">
            From
            <input type="date" value={from} max={to || today} onChange={(e) => setFrom(e.target.value)} className="input-amo mt-1 !py-1.5 text-sm" required />
          </label>
          <label className="flex flex-col text-xs text-slate-400">
            To
            <input type="date" value={to} min={from} max={today} onChange={(e) => setTo(e.target.value)} className="input-amo mt-1 !py-1.5 text-sm" required />
          </label>
          <button type="submit" className="btn-primary min-h-[38px] px-4 text-sm">Apply</button>
          {error && <p className="w-full text-xs text-rose-400" role="alert">{error}</p>}
        </form>
      )}

      <p className="text-xs text-slate-500" aria-live="polite">Showing {formatRangeLabel(range)}</p>
    </div>
  );
};

export { presetRange };
