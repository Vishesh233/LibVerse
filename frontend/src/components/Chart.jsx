import React from 'react';

// Minimal responsive line chart using SVG. Accepts labels and datasets (numbers).
export const LineChart = ({ labels = [], data = [], height = 120, color = '#3b82f6' }) => {
  if (!labels.length || !data.length) return <div className="text-sm text-gray-500">No chart data</div>;

  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const w = Math.max(300, labels.length * 40);
  const h = height;

  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * (w - 20) + 10;
    const y = h - 10 - ((d - min) / range) * (h - 20);
    return `${x},${y}`;
  }).join(' ');

  const areaPath = data.map((d, i) => {
    const x = (i / (data.length - 1)) * (w - 20) + 10;
    const y = h - 10 - ((d - min) / range) * (h - 20);
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ') + ` L ${w - 10} ${h - 10} L 10 ${h - 10} Z`;

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} className="rounded">
        <defs>
          <linearGradient id="chartGrad" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.15" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        <path d={areaPath} fill="url(#chartGrad)" stroke="none" />
        <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

        {/* Points */}
        {data.map((d, i) => {
          const x = (i / (data.length - 1)) * (w - 20) + 10;
          const y = h - 10 - ((d - min) / range) * (h - 20);
          return <circle key={i} cx={x} cy={y} r={2.5} fill={color} />;
        })}
      </svg>
      <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
        {labels.map((l, i) => (
          <div key={i} className="truncate w-24">{l}</div>
        ))}
      </div>
    </div>
  );
};

export default LineChart;
