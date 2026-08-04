import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import * as echarts from 'echarts';
import { MainLayout } from '../layouts/MainLayout';
import { adminAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';

export const Reports = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('all');
  const barChartRef = useRef(null);
  const lineChartRef = useRef(null);
  const barChartInstance = useRef(null);
  const lineChartInstance = useRef(null);

  // Live update simulation
  useEffect(() => {
    if (loading || !reports) return;

    const interval = setInterval(() => {
      // Simulate live data updates for bar chart
      if (barChartInstance.current) {
        const currentOption = barChartInstance.current.getOption();
        if (currentOption && currentOption.series) {
          barChartInstance.current.setOption({
            series: currentOption.series.map(series => ({
              ...series,
              data: series.data.map(value => 
                Math.max(0, value + Math.floor(Math.random() * 5) - 2)
              )
            }))
          });
        }
      }

      // Simulate live data updates for line chart
      if (lineChartInstance.current) {
        const currentOption = lineChartInstance.current.getOption();
        if (currentOption && currentOption.series && currentOption.series[0]) {
          const currentData = currentOption.series[0].data;
          const newData = currentData.map(val => Math.max(0, val + Math.floor(Math.random() * 200) - 100));
          lineChartInstance.current.setOption({
            series: [{
              ...currentOption.series[0],
              data: newData
            }]
          });
        }
      }
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [loading, reports]);

  useEffect(() => {
    loadReports();
  }, [timeRange]);

  useEffect(() => {
    if (!loading && reports) {
      initBarChart();
      initLineChart();
    }

    return () => {
      if (barChartInstance.current) {
        barChartInstance.current.dispose();
      }
      if (lineChartInstance.current) {
        lineChartInstance.current.dispose();
      }
    };
  }, [loading, reports]);

  useEffect(() => {
    const handleResize = () => {
      barChartInstance.current?.resize();
      lineChartInstance.current?.resize();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const loadReports = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getReports();
      if (res.data?.success) {
        setReports(res.data.reports);
      }
    } catch (err) {
      console.error('Error fetching reports:', err);
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const initBarChart = () => {
    if (!barChartRef.current) return;

    barChartInstance.current = echarts.init(barChartRef.current);

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const issuedData = reports?.chartData?.issued || [45, 52, 48, 61, 55, 67, 72, 68, 75, 80, 78, 85];
    const returnedData = reports?.chartData?.returned || [40, 48, 45, 58, 52, 63, 68, 64, 70, 75, 73, 80];

    const option = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          crossStyle: {
            color: '#6366F1'
          },
          lineStyle: {
            color: '#6366F1',
            type: 'dashed',
            width: 1
          }
        },
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        borderColor: '#1E293B',
        borderWidth: 1,
        textStyle: {
          color: '#F8FAFC',
          fontSize: 13
        },
        padding: [12, 16],
        formatter: function (params) {
          const month = params[0].axisValue;
          let result = `<div style="font-weight: 600; margin-bottom: 8px; color: #F8FAFC; font-size: 14px;">${month}</div>`;
          params.forEach(param => {
            const color = param.color;
            result += `<div style="display: flex; align-items: center; gap: 8px; margin-top: 4px;">
                        <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: ${color}; box-shadow: 0 0 10px ${color};"></span>
                        <span style="color: #94A3B8;">${param.seriesName}:</span>
                        <span style="color: #F8FAFC; font-weight: 600;">${param.value}</span>
                      </div>`;
          });
          return result;
        }
      },
      legend: {
        data: ['Issued', 'Returned'],
        top: 0,
        right: 0,
        textStyle: {
          color: '#94A3B8',
          fontSize: 12
        },
        itemWidth: 12,
        itemHeight: 12,
        itemGap: 20
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '15%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: months,
        axisLine: {
          lineStyle: {
            color: '#1E293B'
          }
        },
        axisTick: {
          show: false
        },
        axisLabel: {
          color: '#64748B',
          fontSize: 11,
          fontWeight: 500
        }
      },
      yAxis: {
        type: 'value',
        name: 'Books Count',
        nameTextStyle: {
          color: '#64748B',
          fontSize: 11,
          padding: [0, 0, 0, 0]
        },
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        splitLine: {
          lineStyle: {
            color: '#1E293B',
            type: 'dashed'
          }
        },
        axisLabel: {
          color: '#64748B',
          fontSize: 11
        }
      },
      series: [
        {
          name: 'Issued',
          type: 'bar',
          data: issuedData,
          barWidth: '35%',
          barGap: '20%',
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#6366F1' },
              { offset: 1, color: '#4F46E5' }
            ]),
            borderRadius: [8, 8, 0, 0]
          },
          emphasis: {
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#818CF8' },
                { offset: 1, color: '#6366F1' }
              ]),
              shadowColor: 'rgba(99, 102, 241, 0.8)',
              shadowBlur: 20,
              borderRadius: [8, 8, 0, 0]
            }
          },
          animationDuration: 1500,
          animationEasing: 'cubicOut',
          animationDelay: function (idx) {
            return idx * 50;
          }
        },
        {
          name: 'Returned',
          type: 'bar',
          data: returnedData,
          barWidth: '35%',
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#10B981' },
              { offset: 1, color: '#059669' }
            ]),
            borderRadius: [8, 8, 0, 0]
          },
          emphasis: {
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#34D399' },
                { offset: 1, color: '#10B981' }
              ]),
              shadowColor: 'rgba(16, 185, 129, 0.8)',
              shadowBlur: 20,
              borderRadius: [8, 8, 0, 0]
            }
          },
          animationDuration: 1500,
          animationEasing: 'cubicOut',
          animationDelay: function (idx) {
            return idx * 50 + 25;
          }
        }
      ]
    };

    barChartInstance.current.setOption(option, true);
  };

  const initLineChart = () => {
    if (!lineChartRef.current) return;

    lineChartInstance.current = echarts.init(lineChartRef.current);

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const finesData = reports?.finesData || [1200, 1800, 1500, 2100, 1900, 2400, 2200, 2600, 2300, 2800, 2500, 3000];

    const option = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          crossStyle: {
            color: '#6366F1'
          },
          lineStyle: {
            color: '#6366F1',
            type: 'dashed',
            width: 1
          }
        },
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        borderColor: '#1E293B',
        borderWidth: 1,
        textStyle: {
          color: '#F8FAFC',
          fontSize: 13
        },
        padding: [12, 16],
        formatter: function (params) {
          const value = params[0].value;
          return `<div style="font-weight: 600; margin-bottom: 4px; color: #F8FAFC;">${params[0].axisValue}</div>
                  <div style="color: #6366F1; font-weight: 600;">Fine Amount: ₹${value}</div>`;
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '20',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: months,
        axisLine: {
          lineStyle: {
            color: '#1E293B'
          }
        },
        axisTick: {
          show: false
        },
        axisLabel: {
          color: '#64748B',
          fontSize: 11,
          fontWeight: 500
        }
      },
      yAxis: {
        type: 'value',
        name: 'Fine Amount (₹)',
        nameTextStyle: {
          color: '#64748B',
          fontSize: 11,
          padding: [0, 0, 0, 0]
        },
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        splitLine: {
          lineStyle: {
            color: '#1E293B',
            type: 'dashed'
          }
        },
        axisLabel: {
          color: '#64748B',
          fontSize: 11,
          formatter: '₹{value}'
        }
      },
      series: [
        {
          name: 'Fine Amount',
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 8,
          data: finesData,
          lineStyle: {
            width: 3,
            color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
              { offset: 0, color: '#6366F1' },
              { offset: 1, color: '#7C3AED' }
            ]),
            shadowColor: 'rgba(99, 102, 241, 0.5)',
            shadowBlur: 15,
            shadowOffsetY: 5
          },
          itemStyle: {
            color: '#6366F1',
            borderColor: '#fff',
            borderWidth: 2,
            shadowColor: 'rgba(99, 102, 241, 0.6)',
            shadowBlur: 12
          },
          emphasis: {
            scale: 1.8,
            itemStyle: {
              color: '#818CF8',
              borderColor: '#fff',
              borderWidth: 3,
              shadowColor: 'rgba(99, 102, 241, 1)',
              shadowBlur: 25
            },
            lineStyle: {
              width: 4,
              shadowColor: 'rgba(99, 102, 241, 0.8)',
              shadowBlur: 20
            }
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(99, 102, 241, 0.3)' },
              { offset: 0.5, color: 'rgba(99, 102, 241, 0.1)' },
              { offset: 1, color: 'rgba(99, 102, 241, 0.02)' }
            ])
          },
          animationDuration: 2000,
          animationEasing: 'cubicOut',
          animationDelay: function (idx) {
            return idx * 100;
          }
        }
      ]
    };

    lineChartInstance.current.setOption(option, true);
  };

  const reportCards = [
    {
      title: 'Total Books Issued',
      value: reports?.totalBooksIssued || 0,
      icon: '📚',
      color: 'indigo',
    },
    {
      title: 'Active Members',
      value: reports?.activeMembers || 0,
      icon: '👥',
      color: 'emerald',
    },
    {
      title: 'Fines Collected',
      value: `₹${reports?.totalFinesCollected || 0}`,
      icon: '💰',
      color: 'amber',
    },
    {
      title: 'Overdue Items',
      value: reports?.overdueItems || 0,
      icon: '⏰',
      color: 'rose',
    },
  ];

  const getColorClasses = (color) => {
    const colors = {
      indigo: { bg: 'bg-indigo-500/10', text: 'text-indigo-300', border: 'border-indigo-500/20' },
      emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-300', border: 'border-emerald-500/20' },
      amber: { bg: 'bg-amber-500/10', text: 'text-amber-300', border: 'border-amber-500/20' },
      rose: { bg: 'bg-rose-500/10', text: 'text-rose-300', border: 'border-rose-500/20' },
    };
    return colors[color] || colors.indigo;
  };

  const pageTitle = user?.role === 'librarian' ? 'Librarian Reports' : 'Admin Reports';

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto space-y-6 pb-14">
        {/* Page Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">{pageTitle}</h1>
            <p className="mt-2 text-slate-400">Comprehensive analytics and insights</p>
          </div>

          {/* Time Range Dropdown */}
          <div className="relative">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="appearance-none bg-card border border-border text-slate-100 rounded-xl px-4 py-2.5 pr-10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="6months">Last 6 Months</option>
              <option value="year">Last Year</option>
              <option value="all">All Time</option>
            </select>
            <svg className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-slate-400">Loading reports...</div>
          </div>
        ) : (
          <>
            {/* Top Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {reportCards.map((card, idx) => {
                const colorClasses = getColorClasses(card.color);
                return (
                  <div
                    key={idx}
                    className="bg-card rounded-3xl border border-border p-6 shadow-card transition hover:-translate-y-0.5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className={`rounded-2xl px-4 py-3 text-2xl ${colorClasses.bg}`}>
                        {card.icon}
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="text-3xl font-extrabold text-white leading-none">{card.value}</p>
                      <p className="mt-2 text-xs text-slate-400 font-medium">{card.title}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Books Issued vs Returned Chart */}
              <div className="card p-6">
                <h3 className="font-bold text-slate-100 text-lg mb-2">Books Issued vs Returned</h3>
                <p className="text-xs text-slate-400 mb-6">Monthly transaction overview</p>

                <div ref={barChartRef} style={{ width: '100%', height: '350px' }} />

                {/* Legend */}
                <div className="flex items-center gap-6 mt-4 pt-4 border-t border-border">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-indigo-600"></span>
                    <span className="text-xs text-slate-400">Issued</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                    <span className="text-xs text-slate-400">Returned</span>
                  </div>
                </div>
              </div>

              {/* Fines Collected Chart */}
              <div className="card p-6">
                <h3 className="font-bold text-slate-100 text-lg mb-2">Fines Collected</h3>
                <p className="text-xs text-slate-400 mb-6">Revenue overview by month</p>

                <div ref={lineChartRef} style={{ width: '100%', height: '350px' }} />

                {/* Total */}
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400 font-medium">Total Collected</span>
                    <span className="text-xl font-bold text-amber-300">
                      ₹{reports?.totalFinesCollected || 10900}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Borrowed Books Table */}
            <div className="card p-6">
              <h3 className="font-bold text-slate-100 text-lg mb-6">Top Borrowed Books</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Rank</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Book Title</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Author</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Times Borrowed</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Category</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(reports?.topBorrowedBooks || [
                      { rank: 1, title: 'Clean Code', author: 'Robert C. Martin', timesBorrowed: 128, category: 'Technology' },
                      { rank: 2, title: 'The Pragmatic Programmer', author: 'Andrew Hunt & David Thomas', timesBorrowed: 96, category: 'Technology' },
                      { rank: 3, title: 'Design Patterns', author: 'Erich Gamma et al.', timesBorrowed: 84, category: 'Technology' },
                      { rank: 4, title: 'Atomic Habits', author: 'James Clear', timesBorrowed: 72, category: 'Self-Help' },
                      { rank: 5, title: 'The Alchemist', author: 'Paulo Coelho', timesBorrowed: 64, category: 'Fiction' },
                    ]).map((book, idx) => (
                      <tr
                        key={book._id || idx}
                        className="border-b border-slate-800/40 hover:bg-slate-900/30 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-xs ${
                            book.rank === 1 ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20' :
                            book.rank === 2 ? 'bg-slate-300/10 text-slate-300 border border-slate-300/20' :
                            book.rank === 3 ? 'bg-orange-500/10 text-orange-300 border border-orange-500/20' :
                            'bg-slate-800/50 text-slate-400'
                          }`}>
                            {book.rank}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-semibold text-slate-100">{book.title || book.bookTitle}</p>
                        </td>
                        <td className="px-4 py-3 text-slate-300">{book.author}</td>
                        <td className="px-4 py-3">
                          <span className="font-semibold text-indigo-300">{book.timesBorrowed || book.count}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex rounded-full bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 text-xs font-semibold text-indigo-300">
                            {book.category}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
};