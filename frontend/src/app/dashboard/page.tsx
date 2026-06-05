'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Layers, 
  Percent, 
  Award, 
  Brain, 
  Plus, 
  TrendingUp, 
  ChevronRight, 
  Sparkles, 
  History,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { api, Campaign, AnalyticsData } from '@/lib/api';

// High-fidelity fallback data in case backend server is not running
const MOCK_CAMPAIGNS: Campaign[] = [
  { id: 3, brand: "ClearSkinCo", industry: "Skincare", audience: "Women 20-35", style: "Before/After UGC", goal: "Sales", ctr: 5.2, conversion_rate: 3.5, feedback: "Before/After UGC transition increased retention and drove massive purchases.", created_at: new Date().toISOString() },
  { id: 2, brand: "RadiantSkin", industry: "Skincare", audience: "Women 20-35", style: "Founder Video", goal: "Brand Awareness", ctr: 2.1, conversion_rate: 0.8, feedback: "Founder story video underperformed. Users dropped off quickly.", created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: 1, brand: "GlowSerums", industry: "Skincare", audience: "Women 20-35", style: "UGC", goal: "Sales", ctr: 4.8, conversion_rate: 2.1, feedback: "UGC style was highly engaging and generated high CTR.", created_at: new Date(Date.now() - 172800000).toISOString() }
];

const MOCK_ANALYTICS: AnalyticsData['summary'] = {
  totalCampaigns: 3,
  averageCtr: 4.03,
  bestCampaign: { brand: "ClearSkinCo", style: "Before/After UGC", industry: "Skincare", ctr: 5.2 },
  memoriesStored: 3
};

export default function DashboardConsole() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [summary, setSummary] = useState<AnalyticsData['summary']>(MOCK_ANALYTICS);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const campaignData = await api.getCampaigns();
        const analyticsData = await api.getAnalytics();
        
        setCampaigns(campaignData);
        setSummary(analyticsData.summary);
        setIsDemoMode(false);
      } catch (err) {
        console.warn("API Offline, falling back to local simulation mode:", err);
        setCampaigns(MOCK_CAMPAIGNS);
        setSummary(MOCK_ANALYTICS);
        setIsDemoMode(true);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
        <span className="text-sm text-slate-400 font-mono">Loading console data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Demo mode warning banner */}
      {isDemoMode && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-300">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-violet-400" />
          <div className="text-xs sm:text-sm">
            <span className="font-bold">Active Simulation Mode:</span> The FastAPI server is currently offline. The console is running on local simulated data. Open the terminal and run the backend command to connect live databases.
          </div>
        </div>
      )}

      {/* Top Welcome Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">System Workspace</h1>
          <p className="text-sm text-slate-400 mt-1">Review live metrics and retrieved campaign memories.</p>
        </div>
        
        <Link 
          href="/dashboard/campaigns"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold text-sm transition-all shadow-lg shadow-violet-500/20 hover:scale-[1.01]"
        >
          <Plus className="w-4.5 h-4.5" />
          <span>Launch Campaign</span>
        </Link>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Card 1: Total Campaigns */}
        <div className="glass-card p-6 flex flex-col justify-between min-h-[140px] relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Campaigns</p>
              <h3 className="text-3xl font-bold text-white mt-2">{summary.totalCampaigns}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="text-xs text-slate-400 mt-4 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span>Active campaigns tracked</span>
          </div>
        </div>

        {/* Card 2: Average CTR */}
        <div className="glass-card p-6 flex flex-col justify-between min-h-[140px] relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Average CTR</p>
              <h3 className="text-3xl font-bold text-white mt-2">{summary.averageCtr}%</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Percent className="w-5 h-5" />
            </div>
          </div>
          <div className="text-xs text-slate-400 mt-4 flex items-center gap-1">
            <span className="text-cyan-400 font-semibold">1.8x</span>
            <span>higher than SaaS benchmark</span>
          </div>
        </div>

        {/* Card 3: Best Campaign */}
        <div className="glass-card p-6 flex flex-col justify-between min-h-[140px] relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Best Campaign</p>
              {summary.bestCampaign ? (
                <>
                  <h3 className="text-xl font-bold text-white mt-2 line-clamp-1">{summary.bestCampaign.brand}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{summary.bestCampaign.style} ({summary.bestCampaign.ctr}%)</p>
                </>
              ) : (
                <h3 className="text-xl font-bold text-slate-400 mt-2">N/A</h3>
              )}
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="text-xs text-slate-400 mt-4 flex items-center gap-1">
            <span className="text-emerald-400 font-semibold">{summary.bestCampaign ? `${summary.bestCampaign.ctr}% CTR` : '0.00%'}</span>
            <span>Top performer recorded</span>
          </div>
        </div>

        {/* Card 4: Memories Stored */}
        <div className="glass-card p-6 flex flex-col justify-between min-h-[140px] relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Memories Stored</p>
              <h3 className="text-3xl font-bold text-white mt-2">{summary.memoriesStored}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Brain className="w-5 h-5" />
            </div>
          </div>
          <div className="text-xs text-slate-400 mt-4 flex items-center gap-1">
            <span className="text-purple-400 font-semibold">Hindsight Substrate</span>
            <span>is active & learning</span>
          </div>
        </div>

      </div>

      {/* Main Panel Content: Recent Campaigns & Memory status */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Recent Campaigns Table */}
        <div className="lg:col-span-8 border border-white/5 rounded-2xl bg-slate-900/30 p-6 glass flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-white">Recent Launch Logs</h3>
              <p className="text-xs text-slate-400 mt-0.5">Campaign performance and execution states.</p>
            </div>
            <Link 
              href="/dashboard/campaigns" 
              className="text-xs font-semibold text-violet-400 hover:text-violet-300 flex items-center gap-1"
            >
              View All <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs md:text-sm">
              <thead>
                <tr className="border-b border-white/5 text-slate-500 font-semibold pb-4">
                  <th className="pb-3 pl-2">Brand</th>
                  <th className="pb-3">Industry</th>
                  <th className="pb-3">Style</th>
                  <th className="pb-3 text-center">CTR</th>
                  <th className="pb-3 text-center">Status</th>
                  <th className="pb-3 pr-2 text-right">Created</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-500 italic">
                      No campaigns logged. Launch your first campaign!
                    </td>
                  </tr>
                ) : (
                  campaigns.slice(0, 5).map((camp) => (
                    <tr 
                      key={camp.id} 
                      className="border-b border-white/5 hover:bg-white/2.5 transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 pl-2 font-bold text-white group-hover:text-violet-400 transition-colors">
                        <Link href={`/dashboard/campaigns/${camp.id}`} className="block">
                          {camp.brand}
                        </Link>
                      </td>
                      <td className="py-3.5 text-slate-300">{camp.industry}</td>
                      <td className="py-3.5 text-slate-300">
                        <span className="px-2 py-0.5 rounded bg-slate-800 border border-white/5 text-[11px] font-mono">
                          {camp.style}
                        </span>
                      </td>
                      <td className="py-3.5 text-center font-bold">
                        {camp.ctr ? (
                          <span className={camp.ctr >= 4.0 ? 'text-emerald-400' : 'text-rose-400'}>
                            {camp.ctr}%
                          </span>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>
                      <td className="py-3.5 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${
                          camp.ctr 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {camp.ctr ? "Completed" : "Awaiting Results"}
                        </span>
                      </td>
                      <td className="py-3.5 pr-2 text-right text-slate-500">
                        {new Date(camp.created_at).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Side: Quick Action & Memory Reflection */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Quick AI Strategist prompt shortcut */}
          <div className="border border-white/5 rounded-2xl bg-gradient-to-br from-violet-900/20 to-slate-900/60 p-6 glass flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/10 rounded-full blur-[40px] pointer-events-none" />
            <div>
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 mb-4">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <h4 className="text-md font-bold text-white">Ad Strategist Console</h4>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Consult the Hindsight strategist to generate memory-personalized creative hooks and script briefs.
              </p>
            </div>
            <Link 
              href="/dashboard/strategist" 
              className="mt-6 w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1 shadow-lg shadow-violet-500/15"
            >
              Consult Strategist <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Quick Stats on memory updates */}
          <div className="border border-white/5 rounded-2xl bg-slate-900/30 p-6 glass flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
                <History className="w-4 h-4 text-purple-400" />
                <span>Memory Timeline Logs</span>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3 text-xs">
                  <div className="w-1.5 h-1.5 rounded-full bg-violet-500 mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="text-slate-300 font-semibold">SKINCARE UGC memory retained</p>
                    <p className="text-slate-500 text-[10px] mt-0.5">Brand: GlowSerums • CTR: 4.8%</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-xs">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="text-slate-300 font-semibold">FOUNDER SKINS memory logged</p>
                    <p className="text-slate-500 text-[10px] mt-0.5">Underperformed • CTR: 2.1%</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-xs">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="text-slate-300 font-semibold">BEFORE/AFTER UGC learning added</p>
                    <p className="text-slate-500 text-[10px] mt-0.5">Top Performer • CTR: 5.2%</p>
                  </div>
                </div>
              </div>
            </div>
            <Link 
              href="/dashboard/memory" 
              className="mt-6 text-center text-xs font-semibold text-slate-400 hover:text-white transition-colors"
            >
              Audit Memory Substrate
            </Link>
          </div>

        </div>

      </div>

    </div>
  );
}
