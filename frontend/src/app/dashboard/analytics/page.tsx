'use client';

import React, { useState, useEffect } from 'react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { 
  LineChart, 
  BarChart3, 
  Brain, 
  Percent, 
  Layers, 
  History,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { api, AnalyticsData } from '@/lib/api';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Fallback Mock Analytics Data
const MOCK_ANALYTICS: AnalyticsData = {
  ctrTrends: [
    { date: new Date(Date.now() - 172800000).toISOString().split('T')[0], avg_ctr: 4.8, count: 1 },
    { date: new Date(Date.now() - 86400000).toISOString().split('T')[0], avg_ctr: 2.1, count: 1 },
    { date: new Date().toISOString().split('T')[0], avg_ctr: 5.2, count: 1 }
  ],
  industryPerformance: [
    { industry: "Skincare", avg_ctr: 4.03, count: 3 }
  ],
  stylePerformance: [
    { style: "Before/After UGC", avg_ctr: 5.2, count: 1 },
    { style: "UGC", avg_ctr: 4.8, count: 1 },
    { style: "Founder Video", avg_ctr: 2.1, count: 1 }
  ],
  memoryGrowth: [
    { date: new Date(Date.now() - 172800000).toISOString().split('T')[0], count: 1 },
    { date: new Date(Date.now() - 86400000).toISOString().split('T')[0], count: 2 },
    { date: new Date().toISOString().split('T')[0], count: 3 }
  ],
  summary: {
    totalCampaigns: 3,
    averageCtr: 4.03,
    bestCampaign: { brand: "ClearSkinCo", style: "Before/After UGC", industry: "Skincare", ctr: 5.2 },
    memoriesStored: 3
  }
};

export default function AnalyticsConsole() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Monitor theme class changes on <html> tag
  useEffect(() => {
    const isLight = document.documentElement.classList.contains('light');
    setTheme(isLight ? 'light' : 'dark');

    const observer = new MutationObserver(() => {
      const currentLight = document.documentElement.classList.contains('light');
      setTheme(currentLight ? 'light' : 'dark');
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        setLoading(true);
        const result = await api.getAnalytics();
        setData(result);
        setIsDemoMode(false);
      } catch (err) {
        console.warn("API Offline, fallback to mock charts data:", err);
        setData(MOCK_ANALYTICS);
        setIsDemoMode(true);
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, []);

  // Theme-responsive styling configuration
  const isLight = theme === 'light';
  const gridColor = isLight ? 'rgba(15, 23, 42, 0.06)' : 'rgba(255, 255, 255, 0.03)';
  const labelColor = isLight ? '#475569' : '#64748b';
  const tooltipBg = isLight ? '#ffffff' : '#090b16';
  const tooltipTitle = isLight ? '#0f172a' : '#ffffff';
  const tooltipBody = isLight ? '#334155' : '#cbd5e1';
  const tooltipBorder = isLight ? 'rgba(15, 23, 42, 0.08)' : 'rgba(255, 255, 255, 0.08)';

  const baseChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: tooltipBg,
        titleColor: tooltipTitle,
        bodyColor: tooltipBody,
        borderColor: tooltipBorder,
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8,
        bodyFont: {
          family: 'monospace',
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: gridColor,
        },
        ticks: {
          color: labelColor,
          font: {
            size: 10,
          }
        }
      }
    }
  };

  const ctrChartOptions = {
    ...baseChartOptions,
    scales: {
      ...baseChartOptions.scales,
      y: {
        grid: {
          color: gridColor,
        },
        ticks: {
          color: labelColor,
          font: {
            size: 10,
          },
          callback: function(value: any) {
            return value + '%';
          }
        }
      }
    }
  };

  const countChartOptions = {
    ...baseChartOptions,
    scales: {
      ...baseChartOptions.scales,
      y: {
        grid: {
          color: gridColor,
        },
        ticks: {
          color: labelColor,
          font: {
            size: 10,
          },
          callback: function(value: any) {
            if (value % 1 === 0) {
              return value;
            }
            return null;
          }
        }
      }
    }
  };


  if (loading || !data) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
        <span className="text-sm text-slate-400 font-mono">Synthesizing metrics databases...</span>
      </div>
    );
  }

  // 1. CTR Trends over time
  const ctrTrendsData = {
    labels: data.ctrTrends.map(item => item.date),
    datasets: [
      {
        label: 'Average CTR (%)',
        data: data.ctrTrends.map(item => item.avg_ctr),
        borderColor: '#a78bfa',
        backgroundColor: 'rgba(167, 139, 250, 0.05)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#8b5cf6',
      }
    ]
  };

  // 2. Industry Performance
  const industryPerfData = {
    labels: data.industryPerformance.map(item => item.industry),
    datasets: [
      {
        label: 'CTR (%)',
        data: data.industryPerformance.map(item => item.avg_ctr),
        backgroundColor: 'rgba(6, 182, 212, 0.75)',
        borderRadius: 6,
        borderWidth: 0,
        barThickness: 32
      }
    ]
  };

  // 3. Style Performance
  const stylePerfData = {
    labels: data.stylePerformance.map(item => item.style),
    datasets: [
      {
        label: 'CTR (%)',
        data: data.stylePerformance.map(item => item.avg_ctr),
        backgroundColor: 'rgba(139, 92, 246, 0.75)',
        borderRadius: 6,
        borderWidth: 0,
        barThickness: 32
      }
    ]
  };

  // 4. Memory Growth
  const memoryGrowthData = {
    labels: data.memoryGrowth.map(item => item.date),
    datasets: [
      {
        label: 'Memories Count',
        data: data.memoryGrowth.map(item => item.count),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.05)',
        tension: 0.2,
        fill: true,
        pointBackgroundColor: '#059669',
      }
    ]
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Memory Analytics</h1>
        <p className="text-sm text-slate-400 mt-1">Review statistical graphs detailing learning velocity and style performance.</p>
      </div>

      {/* Demo warning */}
      {isDemoMode && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-300">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-violet-400" />
          <span className="text-xs sm:text-sm">
            <span className="font-bold">Active Simulation Mode:</span> Charts are displaying fallback data since the FastAPI backend is not active. Connect the backend to visualize live database telemetry.
          </span>
        </div>
      )}

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-900/10 border border-white/5 rounded-2xl p-4 glass">
        <div className="p-3">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">Total Campaigns</span>
          <span className="text-2xl font-bold text-white mt-1 block">{data.summary.totalCampaigns}</span>
        </div>
        <div className="p-3 border-l border-white/5">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">Average CTR</span>
          <span className="text-2xl font-bold text-violet-400 mt-1 block">{data.summary.averageCtr}%</span>
        </div>
        <div className="p-3 border-l border-white/5">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">Memories Stored</span>
          <span className="text-2xl font-bold text-emerald-400 mt-1 block">{data.summary.memoriesStored}</span>
        </div>
        <div className="p-3 border-l border-white/5">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">Best Performer</span>
          <span className="text-xs font-bold text-cyan-400 mt-2 block truncate">
            {data.summary.bestCampaign ? `${data.summary.bestCampaign.brand} (${data.summary.bestCampaign.ctr}%)` : 'N/A'}
          </span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Graph 1: CTR Trends */}
        <div className="border border-white/5 rounded-2xl bg-slate-900/30 p-6 glass flex flex-col h-[340px]">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
              <LineChart className="w-4.5 h-4.5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">CTR Trends over Time</h4>
              <p className="text-[10px] text-slate-500">Average Click-Through Rates per launch</p>
            </div>
          </div>
          <div className="flex-1 relative min-h-0">
            <Line data={ctrTrendsData} options={ctrChartOptions} />
          </div>
        </div>

        {/* Graph 2: Memory Growth */}
        <div className="border border-white/5 rounded-2xl bg-slate-900/30 p-6 glass flex flex-col h-[340px]">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Brain className="w-4.5 h-4.5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Memory Substrate Growth</h4>
              <p className="text-[10px] text-slate-500">Accumulated Hindsight memory nodes over time</p>
            </div>
          </div>
          <div className="flex-1 relative min-h-0">
            <Line data={memoryGrowthData} options={countChartOptions} />
          </div>
        </div>

        {/* Graph 3: Creative Style Performance */}
        <div className="border border-white/5 rounded-2xl bg-slate-900/30 p-6 glass flex flex-col h-[340px]">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
              <BarChart3 className="w-4.5 h-4.5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Style Performance</h4>
              <p className="text-[10px] text-slate-500">Average Click-Through Rate by creative style</p>
            </div>
          </div>
          <div className="flex-1 relative min-h-0">
            <Bar data={stylePerfData} options={ctrChartOptions} />
          </div>
        </div>

        {/* Graph 4: Industry Performance */}
        <div className="border border-white/5 rounded-2xl bg-slate-900/30 p-6 glass flex flex-col h-[340px]">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <BarChart3 className="w-4.5 h-4.5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Industry Performance</h4>
              <p className="text-[10px] text-slate-500">Average Click-Through Rate by industry category</p>
            </div>
          </div>
          <div className="flex-1 relative min-h-0">
            <Bar data={industryPerfData} options={ctrChartOptions} />
          </div>
        </div>

      </div>

    </div>
  );
}
