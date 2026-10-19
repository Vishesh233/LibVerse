import React, { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Accessible tab list (WAI-ARIA tabs pattern): roving tabindex, Left/Right/Home/End to move,
 * activation follows focus. `tabs`: [{ key, label, icon }]. Panels use id `${idPrefix}-panel-${key}`.
 * Phones: a 2-column grid. From sm up: one row that scrolls sideways when the tabs do not fit, with
 * a fade on the side that has more tabs, and the active tab always scrolled into view.
 */
export const ProfileTabs = ({ tabs, active, onChange, label, idPrefix = 'profile' }) => {
  const refs = useRef({});
  const listRef = useRef(null);
  const [fade, setFade] = useState({ left: false, right: false });

  const updateFade = useCallback(() => {
    const el = listRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setFade({ left: el.scrollLeft > 2, right: max - el.scrollLeft > 2 });
  }, []);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return undefined;
    updateFade();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(updateFade) : null;
    ro?.observe(el);
    el.addEventListener('scroll', updateFade, { passive: true });
    return () => {
      ro?.disconnect();
      el.removeEventListener('scroll', updateFade);
    };
  }, [updateFade, tabs.length]);

  // Keep the active tab visible (only the tab row scrolls, never the page)
  useEffect(() => {
    const el = listRef.current;
    const tab = refs.current[active];
    if (!el || !tab || el.scrollWidth <= el.clientWidth) return;
    const pad = 28; // clear of the fade
    const left = tab.offsetLeft; // the list is the offsetParent: content coordinates, scroll-independent
    const right = left + tab.offsetWidth;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (left - pad < el.scrollLeft) el.scrollTo({ left: Math.max(0, left - pad), behavior: reduce ? 'auto' : 'smooth' });
    else if (right + pad > el.scrollLeft + el.clientWidth) el.scrollTo({ left: right + pad - el.clientWidth, behavior: reduce ? 'auto' : 'smooth' });
  }, [active]);

  const focusTab = (index) => {
    const tab = tabs[(index + tabs.length) % tabs.length];
    onChange(tab.key);
    refs.current[tab.key]?.focus({ preventScroll: true });
  };

  const onKeyDown = (event, index) => {
    const moves = { ArrowRight: index + 1, ArrowLeft: index - 1, Home: 0, End: tabs.length - 1 };
    if (!(event.key in moves)) return;
    event.preventDefault();
    focusTab(moves[event.key]);
  };

  return (
    <div className="profile-tabs" data-fade-left={fade.left || undefined} data-fade-right={fade.right || undefined}>
      <div
        ref={listRef}
        role="tablist"
        aria-label={label}
        className="profile-tabs__list relative grid grid-cols-2 gap-1 rounded-2xl border border-border bg-input/70 p-1 sm:flex [&>*:last-child:nth-child(odd)]:col-span-2"
      >
        {tabs.map((tab, index) => {
          const selected = tab.key === active;
          return (
            <button
              key={tab.key}
              ref={(el) => { refs.current[tab.key] = el; }}
              type="button"
              role="tab"
              id={`${idPrefix}-tab-${tab.key}`}
              aria-selected={selected}
              aria-controls={`${idPrefix}-panel-${tab.key}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => onChange(tab.key)}
              onKeyDown={(e) => onKeyDown(e, index)}
              className={`flex min-h-[40px] flex-shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-3 text-sm font-semibold transition-colors sm:flex-auto ${
                selected
                  ? 'bg-indigo-500/20 text-white shadow-[0_0_0_1px_rgba(99,102,241,0.3)]'
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ProfileTabs;
