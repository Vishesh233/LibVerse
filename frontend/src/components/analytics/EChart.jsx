import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

// Shared dark styling for every analytics chart
export const CHART_THEME = {
  text: '#94A3B8',
  axis: '#64748B',
  grid: '#1E293B',
  tooltip: {
    backgroundColor: 'rgba(15, 23, 42, 0.96)',
    borderColor: '#334155',
    borderWidth: 1,
    textStyle: { color: '#E2E8F0', fontSize: 12 },
    padding: [8, 12],
    confine: true,
  },
};

export const axisDefaults = {
  axisLine: { lineStyle: { color: CHART_THEME.grid } },
  axisTick: { show: false },
  axisLabel: { color: CHART_THEME.axis, fontSize: 11 },
  splitLine: { lineStyle: { color: CHART_THEME.grid, type: 'dashed' } },
};

/**
 * An echarts canvas sized to its box. The canvas is hidden from assistive tech; `summary` is the
 * text alternative (read by screen readers, shown to nobody else).
 * @param {object} props
 * @param {object} props.option - echarts option
 * @param {string} props.summary - one or two sentences describing what the chart shows
 * @param {number|string} [props.height]
 */
export const EChart = ({ option, summary, height = 300, className = '' }) => {
  const ref = useRef(null);
  const chart = useRef(null);

  useEffect(() => {
    if (!ref.current) return undefined;
    chart.current = echarts.init(ref.current, null, { renderer: 'canvas' });
    const observer = new ResizeObserver(() => chart.current?.resize());
    observer.observe(ref.current);
    return () => {
      observer.disconnect();
      chart.current?.dispose();
      chart.current = null;
    };
  }, []);

  useEffect(() => {
    // Respect reduced motion: no entry animation
    const reduce = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    chart.current?.setOption({ animation: !reduce, backgroundColor: 'transparent', ...option }, true);
  }, [option]);

  return (
    <figure className={`m-0 ${className}`}>
      <div ref={ref} style={{ width: '100%', height }} aria-hidden="true" className="analytics-chart" />
      <figcaption className="sr-only">{summary}</figcaption>
    </figure>
  );
};
