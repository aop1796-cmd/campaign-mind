'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Layers, 
  Percent, 
  Brain, 
  History, 
  FileSpreadsheet, 
  Clock, 
  CheckCircle2, 
  Loader2, 
  Plus, 
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import { api, CampaignDetail, Memory } from '@/lib/api';

// Fallback detail data for simulation mode
const MOCK_CAMPAIGN_DETAILS: Record<number, CampaignDetail> = {
  1: {
    id: 1, brand: "GlowSerums", industry: "Skincare", audience: "Women 20-35", style: "UGC", goal: "Sales", created_at: new Date(Date.now() - 172800000).toISOString(),
    results: [
      { id: 101, campaign_id: 1, ctr: 4.8, watch_time: 10.5, conversion_rate: 2.1, feedback: "UGC style was highly engaging and generated high CTR.", created_at: new Date(Date.now() - 172800000).toISOString() }
    ],
    memories: [
      { id: 201, campaign_id: 1, memory_text: "Campaign ID 1 for GlowSerums (Skincare industry). Style: UGC. Audience: Women 20-35. Performance: CTR 4.8%, Conversion Rate 2.1%. Client Feedback/Learnings: UGC style was highly engaging and generated high CTR.", created_at: new Date(Date.now() - 172800000).toISOString() }
    ]
  },
  2: {
    id: 2, brand: "RadiantSkin", industry: "Skincare", audience: "Women 20-35", style: "Founder Video", goal: "Brand Awareness", created_at: new Date(Date.now() - 86400000).toISOString(),
    results: [
      { id: 102, campaign_id: 2, ctr: 2.1, watch_time: 15.2, conversion_rate: 0.8, feedback: "Founder story video underperformed. Users dropped off quickly.", created_at: new Date(Date.now() - 86400000).toISOString() }
    ],
    memories: [
      { id: 202, campaign_id: 2, memory_text: "Campaign ID 2 for RadiantSkin (Skincare industry). Style: Founder Video. Audience: Women 20-35. Performance: CTR 2.1%, Conversion Rate 0.8%. Client Feedback/Learnings: Founder story video underperformed. Users dropped off quickly.", created_at: new Date(Date.now() - 86400000).toISOString() }
    ]
  },
  3: {
    id: 3, brand: "ClearSkinCo", industry: "Skincare", audience: "Women 20-35", style: "Before/After UGC", goal: "Sales", created_at: new Date().toISOString(),
    results: [
      { id: 103, campaign_id: 3, ctr: 5.2, watch_time: 18.4, conversion_rate: 3.5, feedback: "Before/After UGC transition increased retention and drove massive purchases.", created_at: new Date().toISOString() }
    ],
    memories: [
      { id: 203, campaign_id: 3, memory_text: "Campaign ID 3 for ClearSkinCo (Skincare industry). Style: Before/After UGC. Audience: Women 20-35. Performance: CTR 5.2%, Conversion Rate 3.5%. Client Feedback/Learnings: Before/After UGC transition increased retention and drove massive purchases.", created_at: new Date().toISOString() }
    ]
  }
};

export default function CampaignDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = Number(params.id);

  const [campaign, setCampaign] = useState<CampaignDetail | null>(null);
  const [relatedMemories, setRelatedMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Form state for reporting results
  const [ctr, setCtr] = useState('');
  const [watchTime, setWatchTime] = useState('');
  const [conversionRate, setConversionRate] = useState('');
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const loadCampaign = async () => {
    try {
      setLoading(true);
      const data = await api.getCampaign(campaignId);
      setCampaign(data);
      
      // Load related memories from general memories endpoint matching industry/style
      const allMems = await api.getMemories();
      const filtered = allMems.filter(m => 
        m.campaign_id !== campaignId && 
        (m.industry === data.industry || m.style === data.style)
      );
      setRelatedMemories(filtered);
      setIsDemoMode(false);
    } catch (err) {
      console.warn("API Offline, loading mock campaign details for ID:", campaignId);
      const mockData = MOCK_CAMPAIGN_DETAILS[campaignId];
      if (mockData) {
        setCampaign(mockData);
        // Mock related memories
        const related = Object.values(MOCK_CAMPAIGN_DETAILS)
          .filter(c => c.id !== campaignId)
          .map(c => c.memories[0])
          .filter(Boolean);
        setRelatedMemories(related);
      } else {
        // Fallback for custom user created campaigns in mock mode
        const defaultCamp: CampaignDetail = {
          id: campaignId,
          brand: "User Brand",
          industry: "Skincare",
          audience: "General",
          style: "UGC",
          goal: "Conversions",
          created_at: new Date().toISOString(),
          results: [],
          memories: []
        };
        setCampaign(defaultCamp);
      }
      setIsDemoMode(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (campaignId) {
      loadCampaign();
    }
  }, [campaignId]);

  const handleSubmitResults = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ctr || !watchTime || !conversionRate || !feedback) {
      setErrorMsg("Please fill out all results fields.");
      return;
    }
    
    setSubmitting(true);
    setErrorMsg('');

    const parsedCtr = parseFloat(ctr);
    const parsedWatchTime = parseFloat(watchTime);
    const parsedConvRate = parseFloat(conversionRate);

    try {
      if (isDemoMode) {
        // Simulated local results report
        const newResult = {
          id: Date.now(),
          campaign_id: campaignId,
          ctr: parsedCtr,
          watch_time: parsedWatchTime,
          conversion_rate: parsedConvRate,
          feedback,
          created_at: new Date().toISOString()
        };
        
        const newMemory = {
          id: Date.now() + 1,
          campaign_id: campaignId,
          memory_text: `Campaign ID ${campaignId} for ${campaign?.brand} (${campaign?.industry} industry). Style: ${campaign?.style}. Performance: CTR ${parsedCtr}%, Conv Rate ${parsedConvRate}%. Feedback: ${feedback}`,
          created_at: new Date().toISOString()
        };

        if (campaign) {
          const updated: CampaignDetail = {
            ...campaign,
            results: [newResult, ...campaign.results],
            memories: [newMemory, ...campaign.memories]
          };
          setCampaign(updated);
          // Save to local session mocks
          MOCK_CAMPAIGN_DETAILS[campaignId] = updated;
        }
      } else {
        await api.addCampaignResults(campaignId, {
          ctr: parsedCtr,
          watch_time: parsedWatchTime,
          conversion_rate: parsedConvRate,
          feedback
        });
        await loadCampaign();
      }
      
      // Clear inputs
      setCtr('');
      setWatchTime('');
      setConversionRate('');
      setFeedback('');
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to submit campaign performance.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
        <span className="text-sm text-slate-400 font-mono">Loading campaign details...</span>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="text-center py-16 space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h3 className="text-lg font-bold text-white">Campaign Not Found</h3>
        <Link href="/dashboard/campaigns" className="text-xs text-violet-400 hover:underline flex items-center justify-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to campaigns
        </Link>
      </div>
    );
  }

  const hasResults = campaign.results.length > 0;
  const latestResult = hasResults ? campaign.results[0] : null;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      
      {/* Back to campaigns link */}
      <div>
        <Link 
          href="/dashboard/campaigns"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Campaigns</span>
        </Link>
      </div>

      {/* Main Campaign Header details */}
      <div className="border border-white/5 rounded-2xl bg-slate-900/30 p-6 md:p-8 glass relative">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-violet-500/10 border border-violet-500/20 text-violet-400 font-mono">
                ID: #{campaign.id}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Created on {new Date(campaign.created_at).toLocaleDateString()}
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-white mt-2 tracking-tight">{campaign.brand}</h1>
            <p className="text-sm text-slate-400 mt-1 italic">Goal: {campaign.goal}</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <span className="px-3 py-1.5 rounded-xl bg-slate-950 border border-white/5 text-xs text-slate-300">
              <span className="text-slate-500 mr-1.5">Industry:</span> {campaign.industry}
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-slate-950 border border-white/5 text-xs text-slate-300 font-mono">
              <span className="text-slate-500 mr-1.5">Style:</span> {campaign.style}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 pt-8 border-t border-white/5">
          <div>
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Target Audience</h4>
            <p className="text-sm text-slate-200 mt-1.5 font-medium">{campaign.audience}</p>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</h4>
            <div className="mt-1.5">
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                hasResults 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              }`}>
                {hasResults ? "Completed & Memory Retained" : "Awaiting Performance Results"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Results & Client Feedback / Form OR Memory */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Results Info Panel */}
        <div className="md:col-span-7 space-y-8">
          
          {hasResults ? (
            /* Show Results card */
            <div className="border border-white/5 rounded-2xl bg-slate-900/30 p-6 glass">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-cyan-400" />
                <span>Campaign Results</span>
              </h3>
              
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-slate-950 p-4 rounded-xl border border-white/5">
                  <p className="text-[10px] font-semibold text-slate-500 uppercase">CTR</p>
                  <p className={`text-2xl font-extrabold mt-1 ${latestResult!.ctr >= 4.0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {latestResult!.ctr}%
                  </p>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl border border-white/5">
                  <p className="text-[10px] font-semibold text-slate-500 uppercase">Avg Watch Time</p>
                  <p className="text-2xl font-extrabold mt-1 text-white">
                    {latestResult!.watch_time}s
                  </p>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl border border-white/5">
                  <p className="text-[10px] font-semibold text-slate-500 uppercase">Conv. Rate</p>
                  <p className="text-2xl font-extrabold mt-1 text-cyan-400">
                    {latestResult!.conversion_rate}%
                  </p>
                </div>
              </div>

              <div className="bg-slate-950/50 p-4 rounded-xl border border-white/5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase mb-2">
                  <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
                  <span>Client Feedback & Learnings</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed italic">
                  &ldquo;{latestResult!.feedback}&rdquo;
                </p>
              </div>
            </div>
          ) : (
            /* Results Entry Form */
            <div className="border border-white/5 rounded-2xl bg-slate-900/30 p-6 glass">
              <div className="mb-4">
                <h3 className="text-lg font-bold text-white">Report Performance Results</h3>
                <p className="text-xs text-slate-400 mt-0.5">Submit metrics to finalize the campaign and generate the AI Hindsight memory.</p>
              </div>

              <form onSubmit={handleSubmitResults} className="space-y-4">
                {errorMsg && (
                  <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-400 uppercase">CTR (%)</label>
                    <input 
                      type="number" 
                      step="0.1"
                      placeholder="e.g. 4.8"
                      value={ctr}
                      onChange={(e) => setCtr(e.target.value)}
                      className="bg-slate-950 border border-white/5 rounded-lg py-2 px-3 text-sm text-slate-200 focus:outline-none focus:border-violet-500/50"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-400 uppercase">Watch Time (s)</label>
                    <input 
                      type="number" 
                      step="0.1"
                      placeholder="e.g. 10.5"
                      value={watchTime}
                      onChange={(e) => setWatchTime(e.target.value)}
                      className="bg-slate-950 border border-white/5 rounded-lg py-2 px-3 text-sm text-slate-200 focus:outline-none focus:border-violet-500/50"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-400 uppercase">Conv. Rate (%)</label>
                    <input 
                      type="number" 
                      step="0.1"
                      placeholder="e.g. 2.1"
                      value={conversionRate}
                      onChange={(e) => setConversionRate(e.target.value)}
                      className="bg-slate-950 border border-white/5 rounded-lg py-2 px-3 text-sm text-slate-200 focus:outline-none focus:border-violet-500/50"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase">Client Feedback & Qualitative Learnings</label>
                  <textarea 
                    rows={4}
                    placeholder="Describe why this succeeded or failed, hooks that did well, style notes, etc..."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    className="bg-slate-950 border border-white/5 rounded-lg py-2 px-3 text-sm text-slate-200 focus:outline-none focus:border-violet-500/50 resize-none"
                  />
                </div>

                <button 
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-gradient-to-r from-violet-600 to-cyan-500 hover:opacity-90 text-white rounded-xl text-xs font-bold transition-opacity flex items-center justify-center gap-1.5 shadow-lg shadow-violet-500/15"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Submit Results & Retain Memory</span>
                </button>
              </form>
            </div>
          )}

        </div>

        {/* Memory Panel */}
        <div className="md:col-span-5 space-y-6">
          
          {/* Stored Hindsight Memory */}
          <div className="border border-white/5 rounded-2xl bg-slate-900/30 p-6 glass flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-violet-600/5 rounded-full blur-[40px] pointer-events-none" />
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
              <Brain className="w-4.5 h-4.5 text-violet-400" />
              <span>Hindsight Memory Log</span>
            </div>

            {campaign.memories.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-white/5 rounded-xl">
                <p className="text-xs text-slate-500 font-mono">Memory node is cold.</p>
                <p className="text-[10px] text-slate-600 mt-1 max-w-[180px] mx-auto">Submit campaign results to activate Hindsight memory retention.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-violet-500/5 border border-violet-500/10 font-mono text-[11px] text-violet-300 leading-relaxed">
                  {campaign.memories[0].memory_text}
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                  <span>Timestamp</span>
                  <span>{new Date(campaign.memories[0].created_at).toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>

          {/* Related Memories list */}
          <div className="border border-white/5 rounded-2xl bg-slate-900/30 p-6 glass">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
              <History className="w-4.5 h-4.5 text-cyan-400" />
              <span>Similar Context Memories</span>
            </div>

            {relatedMemories.length === 0 ? (
              <div className="text-center py-6 border border-dashed border-white/5 rounded-xl text-[10px] text-slate-600 font-mono">
                No similar historical context found.
              </div>
            ) : (
              <div className="space-y-3 max-h-[240px] overflow-y-auto pr-1">
                {relatedMemories.map((m) => (
                  <div key={m.id} className="p-3 rounded-xl border border-white/5 bg-slate-950 hover:border-white/10 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-white">Campaign ID #{m.campaign_id}</span>
                      <span className="text-[10px] text-slate-500">{new Date(m.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                      {m.memory_text}
                    </p>
                    <Link 
                      href={`/dashboard/campaigns/${m.campaign_id}`}
                      className="inline-flex items-center gap-0.5 text-[9px] font-bold text-violet-400 hover:text-violet-300 mt-2"
                    >
                      View Node <Plus className="w-2.5 h-2.5" />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
