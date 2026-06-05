'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Plus, 
  Layers, 
  Search, 
  Filter, 
  ArrowRight,
  TrendingUp,
  X,
  Sparkles,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { api, Campaign } from '@/lib/api';

const MOCK_CAMPAIGNS: Campaign[] = [
  { id: 3, brand: "ClearSkinCo", industry: "Skincare", audience: "Women 20-35", style: "Before/After UGC", goal: "Sales", ctr: 5.2, conversion_rate: 3.5, feedback: "Before/After UGC transition increased retention and drove massive purchases.", created_at: new Date().toISOString() },
  { id: 2, brand: "RadiantSkin", industry: "Skincare", audience: "Women 20-35", style: "Founder Video", goal: "Brand Awareness", ctr: 2.1, conversion_rate: 0.8, feedback: "Founder story video underperformed. Users dropped off quickly.", created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: 1, brand: "GlowSerums", industry: "Skincare", audience: "Women 20-35", style: "UGC", goal: "Sales", ctr: 4.8, conversion_rate: 2.1, feedback: "UGC style was highly engaging and generated high CTR.", created_at: new Date(Date.now() - 172800000).toISOString() }
];

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  
  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [styleFilter, setStyleFilter] = useState('All');
  
  // Form state
  const [brand, setBrand] = useState('');
  const [industry, setIndustry] = useState('');
  const [audience, setAudience] = useState('');
  const [style, setStyle] = useState('UGC');
  const [goal, setGoal] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Fetch campaigns
  async function loadCampaigns() {
    try {
      setLoading(true);
      const data = await api.getCampaigns();
      setCampaigns(data);
      setIsDemoMode(false);
    } catch (err) {
      console.warn("API Offline, loading mock campaigns:", err);
      setCampaigns(MOCK_CAMPAIGNS);
      setIsDemoMode(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCampaigns();
  }, []);

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brand || !industry || !audience || !goal) {
      setFormError('Please fill out all fields.');
      return;
    }
    
    setSubmitting(true);
    setFormError('');
    
    try {
      if (isDemoMode) {
        // Mock mode local insert
        const newCamp: Campaign = {
          id: campaigns.length + 1,
          brand,
          industry,
          audience,
          style,
          goal,
          created_at: new Date().toISOString()
        };
        setCampaigns([newCamp, ...campaigns]);
        setModalOpen(false);
        resetForm();
      } else {
        const res = await api.createCampaign({ brand, industry, audience, style, goal });
        if (res.status === 'success') {
          setCampaigns([res.campaign, ...campaigns]);
          setModalOpen(false);
          resetForm();
        }
      }
    } catch (err: any) {
      setFormError(err.message || 'Failed to create campaign.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setBrand('');
    setIndustry('');
    setAudience('');
    setStyle('UGC');
    setGoal('');
    setFormError('');
  };

  // Filter campaigns
  const filteredCampaigns = campaigns.filter(c => {
    const matchesSearch = 
      c.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.goal.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStyle = styleFilter === 'All' || c.style === styleFilter;
    
    return matchesSearch && matchesStyle;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Title block */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Campaign Director</h1>
          <p className="text-sm text-slate-400 mt-1">Configure and manage ad campaigns.</p>
        </div>
        
        <button 
          onClick={() => { resetForm(); setModalOpen(true); }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold text-sm transition-all shadow-lg shadow-violet-500/20 hover:scale-[1.01]"
        >
          <Plus className="w-4.5 h-4.5" />
          <span>Launch Campaign</span>
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row items-center gap-4 bg-slate-900/30 p-4 rounded-xl border border-white/5 glass">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search campaigns by brand, industry, or goal..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-white/5 rounded-lg py-2 pl-10 pr-4 text-sm text-slate-200 focus:outline-none focus:border-violet-500/50"
          />
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-500 hidden sm:inline" />
          <select 
            value={styleFilter} 
            onChange={(e) => setStyleFilter(e.target.value)}
            className="w-full md:w-48 bg-slate-950 border border-white/5 rounded-lg py-2 px-3 text-sm text-slate-300 focus:outline-none focus:border-violet-500/50"
          >
            <option value="All">All Creative Styles</option>
            <option value="UGC">UGC</option>
            <option value="Before/After UGC">Before/After UGC</option>
            <option value="Founder Video">Founder Video</option>
            <option value="Static Ad">Static Ad</option>
            <option value="Product Showcase">Product Showcase</option>
          </select>
        </div>
      </div>

      {/* Campaign logs table */}
      <div className="border border-white/5 rounded-2xl bg-slate-900/30 p-6 glass">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
            <span className="text-xs text-slate-400 font-mono">Querying database campaigns...</span>
          </div>
        ) : filteredCampaigns.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <Layers className="w-12 h-12 text-slate-700 mx-auto mb-3" />
            <p className="text-sm font-semibold">No campaigns matched your filters.</p>
            <p className="text-xs text-slate-600 mt-1">Try resetting the search terms or style filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs md:text-sm">
              <thead>
                <tr className="border-b border-white/5 text-slate-500 font-semibold pb-4">
                  <th className="pb-3 pl-2">Brand</th>
                  <th className="pb-3">Industry</th>
                  <th className="pb-3">Style</th>
                  <th className="pb-3 text-center">CTR</th>
                  <th className="pb-3 text-center">Status</th>
                  <th className="pb-3">Goal</th>
                  <th className="pb-3 pr-2 text-right">Created</th>
                </tr>
              </thead>
              <tbody>
                {filteredCampaigns.map((camp) => (
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
                    <td className="py-3.5 text-center font-bold">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${
                        camp.ctr 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {camp.ctr ? "Completed" : "Awaiting Results"}
                      </span>
                    </td>
                    <td className="py-3.5 text-slate-400 truncate max-w-[150px]">{camp.goal}</td>
                    <td className="py-3.5 pr-2 text-right text-slate-500">
                      {new Date(camp.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Campaign Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          
          <div className="relative bg-[#090b16] border border-white/10 rounded-2xl w-full max-w-lg p-6 shadow-2xl glass animate-float-short">
            <button 
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                <Layers className="w-4.5 h-4.5" />
              </div>
              <h2 className="text-lg font-bold text-white">Create New Campaign</h2>
            </div>
            
            <form onSubmit={handleCreateCampaign} className="space-y-4">
              {formError && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase">Brand Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. GlowSerums"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="bg-slate-950 border border-white/5 rounded-lg py-2 px-3 text-sm text-slate-200 focus:outline-none focus:border-violet-500/50"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase">Industry</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Skincare"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="bg-slate-950 border border-white/5 rounded-lg py-2 px-3 text-sm text-slate-200 focus:outline-none focus:border-violet-500/50"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase">Target Audience</label>
                <input 
                  type="text" 
                  placeholder="e.g. Women 20-35 interested in clean beauty"
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  className="bg-slate-950 border border-white/5 rounded-lg py-2 px-3 text-sm text-slate-200 focus:outline-none focus:border-violet-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase">Creative Style</label>
                  <select 
                    value={style}
                    onChange={(e) => setStyle(e.target.value)}
                    className="bg-slate-950 border border-white/5 rounded-lg py-2 px-3 text-sm text-slate-300 focus:outline-none focus:border-violet-500/50"
                  >
                    <option value="UGC">UGC</option>
                    <option value="Before/After UGC">Before/After UGC</option>
                    <option value="Founder Video">Founder Video</option>
                    <option value="Static Ad">Static Ad</option>
                    <option value="Product Showcase">Product Showcase</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase">Campaign Goal</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Increase website sales"
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    className="bg-slate-950 border border-white/5 rounded-lg py-2 px-3 text-sm text-slate-200 focus:outline-none focus:border-violet-500/50"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-white/5 flex gap-3 justify-end">
                <button 
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-xs font-bold transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-gradient-to-r from-violet-600 to-cyan-500 hover:opacity-90 text-white rounded-xl text-xs font-bold transition-opacity flex items-center gap-1 shadow-lg shadow-violet-500/10"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Launch Campaign</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
