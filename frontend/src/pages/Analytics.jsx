import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { adminAPI } from '../services/api';
import { MainLayout } from '../layouts/MainLayout';
import { Button, EmptyState, PageHeader, Skeleton } from '../components/UI';
import { AmountStat, DASH_ICONS, IconTile, SectionCard, SectionLink, formatRupees } from '../components/dashboard/DashboardKit';
import { EChart, CHART_THEME, axisDefaults } from '../components/analytics/EChart';
import { RangePicker, useRangeParams } from '../components/analytics/RangePicker';
import { getGenreAccent } from '../constants/genres';
import { STAFF_ACTIVITY_ACTIONS, STAFF_ACTION_COLORS, auditActionLabel } from '../constants/auditActions';
import { useAuth } from '../hooks/useAuth';

const plural = (n, word, many = `${word}s`) => `${Number(n).toLocaleString('en-IN')} ${n === 1 ? word : many}`;
const sum = (arr = []) => arr.reduce((a, b) => a + (Number(b) || 0), 0);
const maxAt = (arr = []) => arr.reduce((best, v, i) => (v > arr[best] ? i : best), 0);
const truncate = (s, n = 26) => (s && s.length > n ? `${s.slice(0, n - 1)}…` : s || '');

const StatTile = ({ label, value, hint, icon, tone, loading }) => (
  <div className="card-glass flex min-w-0 items-center gap-3 !p-3 sm:!p-4">
    <IconTile icon={icon} tone={tone} className="h-9 w-9 sm:h-11 sm:w-11" />
    <div className="min-w-0">
      <p className="text-xs font-medium leading-tight text-slate-400">{label}</p>
      {loading ? <Skeleton className="mt-1 h-7 w-16" /> : <p className="truncate font-display text-xl font-bold text-slate-50 sm:text-2xl">{value}</p>}
      {hint && !loading && <p className="truncate text-[11px] text-muted">{hint}</p>}
    </div>
  </div>
);

const ChartSkeleton = ({ height = 280 }) => <div className="skeleton w-full rounded-xl" style={{ height }} aria-hidden="true" />;

const NoData = ({ message }) => <EmptyState bare icon="📭" title="Nothing to show yet" message={message} />;

const tooltip = (extra = {}) => ({ ...CHART_THEME.tooltip, ...extra });
const legend = { top: 0, right: 0, textStyle: { color: CHART_THEME.text, fontSize: 11 }, itemWidth: 10, itemHeight: 10, icon: 'roundRect' };

export const Analytics = () => {
  const { isAdmin, isLibrarian } = useAuth();
  const canAccess = isAdmin || isLibrarian;
  const base = isAdmin ? '/admin' : '/librarian';
  const { range, setPreset, setCustom } = useRangeParams();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!canAccess) return undefined;
    const controller = new AbortController();
    setLoading(true);
    adminAPI
      .getAnalytics({ from: range.from, to: range.to }, { signal: controller.signal })
      .then((res) => {
        setData(res.data.analytics);
        setError(null);
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        setError(err.response?.data?.message || 'We couldn’t load analytics right now.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [canAccess, range.from, range.to, reloadKey]);

  const retry = useCallback(() => setReloadKey((k) => k + 1), []);

  const charts = useMemo(() => {
    if (!data) return null;
    const labels = data.labels;
    const period = data.range.bucket === 'day' ? 'day' : 'month';
    const many = labels.length > 14;
    const categoryAxis = { type: 'category', data: labels, ...axisDefaults, splitLine: { show: false }, axisLabel: { ...axisDefaults.axisLabel, hideOverlap: true, rotate: many ? 35 : 0 } };
    const valueAxis = (fmt) => ({ type: 'value', minInterval: 1, ...axisDefaults, axisLine: { show: false }, ...(fmt ? { axisLabel: { ...axisDefaults.axisLabel, formatter: fmt } } : {}) });
    const grid = { left: 8, right: 12, top: 36, bottom: 4, containLabel: true };

    // Loans issued vs returned
    const { issued, returned } = data.loansSeries;
    const busiest = maxAt(issued);
    const loans = {
      empty: sum(issued) + sum(returned) === 0,
      summary: `Loans per ${period}, ${labels[0]} to ${labels[labels.length - 1]}: ${plural(sum(issued), 'loan')} issued and ${plural(sum(returned), 'book')} returned.${
        sum(issued) ? ` Busiest ${period}: ${labels[busiest]} with ${plural(issued[busiest], 'loan')} issued.` : ''
      }`,
      option: {
        tooltip: tooltip({ trigger: 'axis', axisPointer: { type: 'shadow' } }),
        legend,
        grid,
        xAxis: categoryAxis,
        yAxis: valueAxis(),
        series: [
          { name: 'Issued', type: 'bar', data: issued, itemStyle: { color: '#6366F1', borderRadius: [4, 4, 0, 0] }, barMaxWidth: 22 },
          { name: 'Returned', type: 'bar', data: returned, itemStyle: { color: '#10B981', borderRadius: [4, 4, 0, 0] }, barMaxWidth: 22 },
        ],
      },
    };

    // Fines per period: collected + waived (stacked), charged as a line
    const { charged, collected, waived } = data.finesSeries;
    const fines = {
      empty: sum(charged) + sum(collected) + sum(waived) === 0,
      summary: `Fines per ${period}: ${formatRupees(sum(charged))} charged, ${formatRupees(sum(collected))} collected and ${formatRupees(sum(waived))} waived in this period.`,
      option: {
        tooltip: tooltip({ trigger: 'axis', valueFormatter: (v) => formatRupees(v) }),
        legend,
        grid,
        xAxis: categoryAxis,
        yAxis: valueAxis((v) => `₹${v}`),
        series: [
          { name: 'Collected', type: 'bar', stack: 'settled', data: collected, itemStyle: { color: '#10B981' }, barMaxWidth: 22 },
          { name: 'Waived', type: 'bar', stack: 'settled', data: waived, itemStyle: { color: '#F472B6', borderRadius: [4, 4, 0, 0] }, barMaxWidth: 22 },
          { name: 'Charged', type: 'line', data: charged, smooth: true, symbolSize: 6, itemStyle: { color: '#F59E0B' }, lineStyle: { width: 2 } },
        ],
      },
    };

    // Overdue aging (now)
    const agingColors = ['#FBBF24', '#FB923C', '#F43F5E'];
    const aging = {
      empty: sum(data.aging.map((b) => b.loans)) === 0,
      summary: `Loans overdue right now by days late: ${data.aging.map((b) => `${b.label}: ${plural(b.loans, 'loan')} (${formatRupees(b.fine)} in fines)`).join('; ')}.`,
      option: {
        tooltip: tooltip({
          trigger: 'item',
          formatter: (p) => `${p.name}<br/>${plural(p.value, 'loan')} · ${formatRupees(data.aging[p.dataIndex].fine)} growing`,
        }),
        grid: { ...grid, top: 26 },
        xAxis: { type: 'category', data: data.aging.map((b) => b.label), ...axisDefaults, splitLine: { show: false } },
        yAxis: valueAxis(),
        series: [{
          type: 'bar',
          data: data.aging.map((b, i) => ({ value: b.loans, itemStyle: { color: agingColors[i], borderRadius: [6, 6, 0, 0] } })),
          barMaxWidth: 56,
          label: { show: true, position: 'top', color: CHART_THEME.text, fontSize: 11 },
        }],
      },
    };

    // Catalogue vs borrowed per genre (genres with any books or loans, most borrowed first)
    const genreRows = data.byGenre.filter((g) => g.catalogue > 0 || g.borrowed > 0).slice(0, 12);
    const genreOrdered = [...genreRows].reverse(); // top row first in a horizontal chart
    const topGenre = genreRows.find((g) => g.borrowed > 0);
    const genres = {
      empty: genreRows.length === 0,
      height: Math.max(220, genreRows.length * 34 + 50),
      summary: `Books in the catalogue and loans in this period per genre. ${
        topGenre ? `Most borrowed: ${topGenre.genre} with ${plural(topGenre.borrowed, 'loan')} from ${plural(topGenre.catalogue, 'book')}.` : 'No loans in this period.'
      } ${genreRows.map((g) => `${g.genre}: ${g.catalogue} books, ${g.borrowed} loans`).join('; ')}.`,
      option: {
        tooltip: tooltip({ trigger: 'axis', axisPointer: { type: 'shadow' } }),
        grid: { ...grid, top: 8 },
        yAxis: { type: 'category', data: genreOrdered.map((g) => g.genre), ...axisDefaults, splitLine: { show: false } },
        xAxis: valueAxis(),
        series: [
          { name: 'Catalogue', type: 'bar', data: genreOrdered.map((g) => g.catalogue), itemStyle: { color: '#475569', borderRadius: [0, 4, 4, 0] }, barMaxWidth: 12 },
          {
            name: 'Borrowed',
            type: 'bar',
            data: genreOrdered.map((g) => ({ value: g.borrowed, itemStyle: { color: getGenreAccent(g.genre), borderRadius: [0, 4, 4, 0] } })),
            itemStyle: { color: '#6366F1' },
            barMaxWidth: 12,
          },
        ],
      },
    };

    // Top 10 borrowed books
    const books = [...data.topBooks].reverse();
    const topBooks = {
      empty: data.topBooks.length === 0,
      height: Math.max(220, data.topBooks.length * 34 + 30),
      summary: data.topBooks.length
        ? `Most borrowed books in this period: ${data.topBooks.map((b) => `${b.rank}. ${b.title} (${plural(b.loans, 'loan')})`).join('; ')}.`
        : 'No books were borrowed in this period.',
      option: {
        tooltip: tooltip({
          trigger: 'item',
          formatter: (p) => {
            const b = books[p.dataIndex];
            return `${b.title}<br/><span style="color:#94A3B8">${b.author} · ${b.genre}</span><br/>${plural(b.loans, 'loan')} · ${plural(b.borrowers, 'borrower')}`;
          },
        }),
        grid: { ...grid, top: 8 },
        yAxis: { type: 'category', data: books.map((b) => truncate(b.title)), ...axisDefaults, splitLine: { show: false } },
        xAxis: valueAxis(),
        series: [{
          type: 'bar',
          data: books.map((b) => ({ value: b.loans, itemStyle: { color: getGenreAccent(b.genre), borderRadius: [0, 4, 4, 0] } })),
          barMaxWidth: 16,
          label: { show: true, position: 'right', color: CHART_THEME.text, fontSize: 11 },
        }],
      },
    };

    // Staff activity from the audit log
    const staffRows = [...data.staffActivity].reverse();
    const usedActions = STAFF_ACTIVITY_ACTIONS.filter((a) => data.staffActivity.some((s) => s.counts[a]));
    const staff = {
      empty: data.staffActivity.length === 0,
      height: Math.max(200, staffRows.length * 40 + 60),
      summary: data.staffActivity.length
        ? `Loan actions per staff member in this period: ${data.staffActivity.map((s) => `${s.name}: ${s.total} (${usedActions.filter((a) => s.counts[a]).map((a) => `${s.counts[a]} ${auditActionLabel(a).toLowerCase()}`).join(', ')})`).join('; ')}.`
        : 'No staff actions were recorded in this period.',
      option: {
        tooltip: tooltip({ trigger: 'axis', axisPointer: { type: 'shadow' } }),
        legend: { ...legend, type: 'scroll', left: 0, right: 0 },
        grid: { ...grid, top: 34 },
        yAxis: { type: 'category', data: staffRows.map((s) => truncate(s.name, 18)), ...axisDefaults, splitLine: { show: false } },
        xAxis: valueAxis(),
        series: usedActions.map((a) => ({
          name: auditActionLabel(a),
          type: 'bar',
          stack: 'actions',
          data: staffRows.map((s) => s.counts[a] || 0),
          itemStyle: { color: STAFF_ACTION_COLORS[a] },
          barMaxWidth: 18,
        })),
      },
    };

    return { loans, fines, aging, genres, topBooks, staff };
  }, [data]);

  if (!canAccess) {
    return (
      <MainLayout>
        <EmptyState icon="🔒" title="Staff only" message="Analytics is available to librarians and admins." />
      </MainLayout>
    );
  }

  const s = data?.summary;
  const f = data?.fines;
  const r = data?.reservations;
  const showSkeleton = loading && !data;

  return (
    <MainLayout>
      <div className="mx-auto max-w-7xl space-y-5 pb-10">
        <PageHeader
          title="Analytics"
          subtitle="Loans, fines, overdue books, genres and staff activity from library records."
          actions={<SectionLink to={`${base}/reports${window.location.search}`}>Open reports</SectionLink>}
          className="!mb-0"
        />

        <RangePicker range={range} onPreset={setPreset} onCustom={setCustom} />

        {error && !loading ? (
          <EmptyState
            icon="⚠️"
            title="Couldn't load analytics"
            message={error}
            action={<Button fullWidth={false} onClick={retry}>Try again</Button>}
          />
        ) : (
          <div className={`space-y-5 transition-opacity ${loading && data ? 'opacity-60' : ''}`} aria-busy={loading || undefined}>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 2xl:grid-cols-6">
              <StatTile label="Loans issued" value={s?.loansIssued?.toLocaleString('en-IN')} icon={DASH_ICONS.book} tone="indigo" loading={showSkeleton} />
              <StatTile label="Books returned" value={s?.loansReturned?.toLocaleString('en-IN')} icon={DASH_ICONS.undo} tone="emerald" loading={showSkeleton} />
              <StatTile label="Active borrowers" value={s?.activeBorrowers} hint={s ? `${s.currentBorrowers} borrowing now` : ''} icon={DASH_ICONS.userPlus} tone="cyan" loading={showSkeleton} />
              <StatTile label="Overdue now" value={s?.overdueNow} icon={DASH_ICONS.alert} tone="rose" loading={showSkeleton} />
              <StatTile label="Fines collected" value={f && formatRupees(f.collected)} icon={DASH_ICONS.card} tone="amber" loading={showSkeleton} />
              <StatTile label="Outstanding now" value={f && formatRupees(f.outstanding)} hint={f ? `${formatRupees(f.accruing)} still growing` : ''} icon={DASH_ICONS.clock} tone="violet" loading={showSkeleton} />
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              <SectionCard id="an-loans" title="Loans issued vs returned" subtitle={data ? `Per ${data.range.bucket}` : ' '}>
                {showSkeleton ? <ChartSkeleton /> : charts.loans.empty ? <NoData message="No books were issued or returned in this period." /> : (
                  <EChart option={charts.loans.option} summary={charts.loans.summary} height={280} />
                )}
              </SectionCard>

              <SectionCard id="an-fines" title="Fines" subtitle="Charged, collected and waived in this period; outstanding as of now">
                {showSkeleton ? <ChartSkeleton /> : (
                  <>
                    <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                      <AmountStat label="Charged" value={formatRupees(f.charged)} hint={plural(f.chargedLoans, 'loan')} tone="text-amber-300" />
                      <AmountStat label="Collected" value={formatRupees(f.collected)} tone="text-emerald-300" />
                      <AmountStat label="Waived" value={formatRupees(f.waived)} tone="text-pink-300" />
                      <AmountStat label="Outstanding" value={formatRupees(f.outstanding)} hint={`${formatRupees(f.outstandingFixed)} fixed + ${formatRupees(f.accruing)} growing`} tone="text-rose-300" />
                    </div>
                    {charts.fines.empty ? <NoData message="No fines were charged, paid or waived in this period." /> : (
                      <EChart option={charts.fines.option} summary={charts.fines.summary} height={220} />
                    )}
                  </>
                )}
              </SectionCard>

              <SectionCard id="an-aging" title="Overdue right now" subtitle="Issued loans past their due date, by days late">
                {showSkeleton ? <ChartSkeleton height={240} /> : charts.aging.empty ? <NoData message="No loan is overdue right now." /> : (
                  <EChart option={charts.aging.option} summary={charts.aging.summary} height={240} />
                )}
              </SectionCard>

              <SectionCard id="an-res" title="Reservations" subtitle="Created and closed in this period; queues as of now">
                {showSkeleton ? <ChartSkeleton height={160} /> : (
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    <AmountStat label="Created" value={r.created} />
                    <AmountStat label="Fulfilled" value={r.fulfilled} tone="text-emerald-300" />
                    <AmountStat label="Expired" value={r.expired} tone="text-amber-300" />
                    <AmountStat label="Cancelled" value={r.cancelled} tone="text-slate-300" />
                    <AmountStat label="Waiting now" value={r.waitingNow} tone="text-indigo-300" />
                    <AmountStat label="Held now" value={r.readyNow} tone="text-cyan-300" hint="Copies set aside" />
                  </div>
                )}
              </SectionCard>

              <SectionCard id="an-genres" title="Catalogue vs borrowed by genre" subtitle="Grey: active books now · coloured: loans issued in this period">
                {showSkeleton ? <ChartSkeleton /> : charts.genres.empty ? <NoData message="The catalogue is empty." /> : (
                  <EChart option={charts.genres.option} summary={charts.genres.summary} height={charts.genres.height} />
                )}
              </SectionCard>

              <SectionCard id="an-top" title="Top 10 borrowed books" subtitle="Loans issued in this period">
                {showSkeleton ? <ChartSkeleton /> : charts.topBooks.empty ? <NoData message="No books were borrowed in this period." /> : (
                  <EChart option={charts.topBooks.option} summary={charts.topBooks.summary} height={charts.topBooks.height} />
                )}
              </SectionCard>
            </div>

            <SectionCard id="an-staff" title="Staff activity" subtitle="Approvals, desk loans and waivers per staff member (from the audit log)">
              {showSkeleton ? <ChartSkeleton height={200} /> : charts.staff.empty ? (
                <NoData message="No staff actions were recorded in this period. Actions are recorded from the moment the audit log was turned on." />
              ) : (
                <EChart option={charts.staff.option} summary={charts.staff.summary} height={charts.staff.height} />
              )}
            </SectionCard>
          </div>
        )}
      </div>
    </MainLayout>
  );
};
