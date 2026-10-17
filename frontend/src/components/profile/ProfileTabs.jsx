import React, { useRef } from 'react';

/**
 * Accessible tab list (WAI-ARIA tabs pattern): roving tabindex, Left/Right/Home/End to move,
 * activation follows focus. `tabs`: [{ key, label, icon }]. Panels use id `${idPrefix}-panel-${key}`.
 */
export const ProfileTabs = ({ tabs, active, onChange, label, idPrefix = 'profile' }) => {
  const refs = useRef({});

  const focusTab = (index) => {
    const tab = tabs[(index + tabs.length) % tabs.length];
    onChange(tab.key);
    refs.current[tab.key]?.focus();
  };

  const onKeyDown = (event, index) => {
    const moves = { ArrowRight: index + 1, ArrowLeft: index - 1, Home: 0, End: tabs.length - 1 };
    if (!(event.key in moves)) return;
    event.preventDefault();
    focusTab(moves[event.key]);
  };

  // Phones: a 2-column grid (an odd last tab spans both) so no label is cut off; a single row from sm up
  return (
    <div
      role="tablist"
      aria-label={label}
      className="grid grid-cols-2 gap-1 rounded-2xl border border-border bg-input/70 p-1 sm:flex [&>*:last-child:nth-child(odd)]:col-span-2"
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
            className={`flex min-h-[40px] flex-1 flex-shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-3 text-sm font-semibold transition-colors ${
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
  );
};

export default ProfileTabs;
