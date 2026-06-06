'use client';

import React, { useState } from 'react';
import { 
  Sparkles, 
  Brain, 
  Search, 
  TrendingUp, 
  Clock, 
  FileText, 
  ListChecks, 
  BadgeCheck, 
  AlertCircle,
  Play,
  Copy,
  CheckCircle2,
  Terminal,
  Loader2
} from 'lucide-react';
import { api, StrategyResponse } from '@/lib/api';

export default function StrategistPage() {
  // Input Form States
  const [industry, setIndustry] = useState('Skincare');
  const [style, setStyle] = useState('UGC');
  const [audience, setAudience] = useState('Women 20-35 interested in clean beauty');
  const [goal, setGoal] = useState('Increase serum sales');

  // Execution states
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [result, setResult] = useState<StrategyResponse | null>(null);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const addLog = (message: string, delay: number) => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        setLogs(prev => [...prev, `[system] ${message}`]);
        resolve();
      }, delay);
    });
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!industry || !style || !audience || !goal) {
      setErrorMsg("Please fill out all fields.");
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setResult(null);
    setLogs([]);

    try {
      // Step 1: Simulated System log execution
      await addLog("Initializing strategist agent context...", 100);
      await addLog(`Querying Hindsight memory substrate for parameters: [Industry: ${industry}, Style: ${style}]`, 300);
      
      // Send actual request
      const response = await api.generateStrategy({ industry, style, audience, goal });
      
      await addLog(`Recall query finished: found ${response.retrievedMemories.length} relevant campaign memory nodes.`, 400);
      await addLog("Reflecting on historical performance and client feedback feedback...", 300);
      
      if (response.retrievedMemories.length > 0) {
        const topCtr = Math.max(...response.retrievedMemories.map(m => m.ctr || 0));
        await addLog(`Identified top performing historical CTR: ${topCtr}%`, 250);
      } else {
        await addLog("No matching memories found. Performing benchmark fallback.", 250);
      }
      
      await addLog("Synthesizing context prompts for Groq LLM (Llama-3-8B-8192)...", 300);
      await addLog("Groq JSON generation completed successfully.", 400);
      
      setResult(response);
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Failed to generate strategy. Make sure the backend server is running.");
      setLogs(prev => [...prev, `[error] Execution aborted: ${err.message}`]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyScript = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.strategy.adScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">AI Senior Strategist</h1>
        <p className="text-sm text-slate-400 mt-1">Harness the memories of past campaigns to build optimized marketing strategies.</p>
      </div>

      {/* Main Grid Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Brief Parameters Form */}
        <div className="lg:col-span-5 space-y-6">
          <div className="border border-white/5 rounded-2xl bg-slate-900/30 p-6 glass">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-violet-400" />
              <span>Campaign Brief Builder</span>
            </h3>

            <form onSubmit={handleGenerate} className="space-y-4">
              
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase">Industry</label>
                <input 
                  type="text" 
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  placeholder="e.g. Skincare, Finance, SaaS"
                  className="bg-slate-950 border border-white/5 rounded-lg py-2.5 px-3 text-sm text-slate-200 focus:outline-none focus:border-violet-500/50"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase">Creative Style</label>
                <select 
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  className="bg-slate-950 border border-white/5 rounded-lg py-2.5 px-3 text-sm text-slate-300 focus:outline-none focus:border-violet-500/50"
                >
                  <option value="UGC">UGC</option>
                  <option value="Before/After UGC">Before/After UGC</option>
                  <option value="Founder Video">Founder Video</option>
                  <option value="Static Ad">Static Ad</option>
                  <option value="Product Showcase">Product Showcase</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase">Target Audience</label>
                <input 
                  type="text" 
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  placeholder="e.g. Women 20-35"
                  className="bg-slate-950 border border-white/5 rounded-lg py-2.5 px-3 text-sm text-slate-200 focus:outline-none focus:border-violet-500/50"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase">Campaign Goal</label>
                <input 
                  type="text" 
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder="e.g. Increase product sales"
                  className="bg-slate-950 border border-white/5 rounded-lg py-2.5 px-3 text-sm text-slate-200 focus:outline-none focus:border-violet-500/50"
                />
              </div>

              {errorMsg && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <button 
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:opacity-90 text-white rounded-xl text-xs font-bold transition-opacity flex items-center justify-center gap-2 shadow-lg shadow-violet-500/15"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Recalling memories...</span>
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4" />
                    <span>Consult Memory & Generate</span>
                  </>
                )}
              </button>

            </form>
          </div>

          {/* Real-time System Terminal Logs */}
          {logs.length > 0 && (
            <details className="group border border-white/5 rounded-2xl bg-slate-950 p-4 font-mono text-[10px] text-slate-400 overflow-hidden" open={false}>
              <summary className="flex items-center justify-between cursor-pointer select-none text-slate-500 uppercase font-bold text-[9px] tracking-wider hover:text-slate-350 list-none [&::-webkit-details-marker]:hidden">
                <div className="flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-violet-400" />
                  <span>Memory Substrate Logs ({logs.length})</span>
                </div>
                <span className="text-[8px] text-slate-500 group-open:hidden">Expand Logs</span>
                <span className="text-[8px] text-slate-500 hidden group-open:inline">Collapse Logs</span>
              </summary>
              <div className="mt-3 space-y-1.5 max-h-[160px] overflow-y-auto pt-2 border-t border-white/5">
                {logs.map((log, idx) => (
                  <div key={idx} className={log.startsWith('[error]') ? 'text-rose-400' : 'text-slate-400'}>
                    {log}
                  </div>
                ))}
              </div>
            </details>
          )}

        </div>

        {/* Right Side: Generation Outputs */}
        <div className="lg:col-span-7 space-y-6">
          
          {!result && !loading ? (
            /* Cold state */
            <div className="border border-dashed border-white/10 rounded-2xl p-16 text-center text-slate-500 bg-slate-900/10 flex flex-col items-center justify-center">
              <Brain className="w-16 h-16 text-slate-800 mb-4 animate-pulse" />
              <h3 className="text-md font-bold text-white mb-1">Strategist Awaiting Input</h3>
              <p className="text-xs max-w-sm">
                Submit a brief parameter set on the left. CampaignMind will inspect Hindsight databases and generate a memory-powered ad strategy.
              </p>
            </div>
          ) : loading ? (
            /* Generating state */
            <div className="border border-white/5 rounded-2xl bg-[#090b16] p-12 glass text-center space-y-4 flex flex-col items-center justify-center min-h-[400px]">
              <div className="w-12 h-12 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
              <p className="text-sm font-bold text-white">Consulting Hindsight Agent</p>
              <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                Reading previous campaign performance tables, evaluating CTR and conversion vectors, and planning the creative script...
              </p>
            </div>
          ) : (
            /* Result displays */
            <div className="space-y-6">
              
              {/* Recalled Memories Summary */}
              <div className="border border-white/5 rounded-2xl bg-slate-900/30 p-5 glass">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Retrieved Memories Matched ({result!.retrievedMemories.length})
                </h4>
                
                {result!.retrievedMemories.length === 0 ? (
                  <div className="p-4 rounded-xl border border-dashed border-white/5 text-center text-xs text-slate-500 font-mono">
                    No relevant historical context discovered. Performing default generation.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {result!.retrievedMemories.map((m, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-white/5 text-xs">
                        <div>
                          <span className="font-bold text-white">{m.brand}</span>
                          <span className="ml-2 text-slate-400">({m.style})</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] text-slate-500 font-mono">Relevance: {m.match_score}/6</span>
                          <span className={`font-bold ${m.ctr && m.ctr >= 4.0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            CTR: {m.ctr}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Main output panels */}
              <div className="border border-white/5 rounded-2xl bg-[#090b16] p-6 glass space-y-6">
                
                {/* Header info */}
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-violet-500/10 border border-violet-500/20 text-violet-400">
                      Style: {result!.strategy.creativeStyle}
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      Groq Llama-3 Output
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs font-semibold relative group">
                    <span className="text-slate-500">Confidence:</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold ${
                      result!.strategy.confidence === "High" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                      result!.strategy.confidence === "Medium" ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" :
                      "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    }`}>
                      {result!.strategy.confidence}
                    </span>
                    <div className="w-3.5 h-3.5 rounded-full bg-slate-800 text-[10px] text-slate-400 flex items-center justify-center cursor-help select-none hover:text-white transition-colors">
                      ?
                    </div>
                    <div className="absolute bottom-full right-0 mb-2 w-56 p-2.5 rounded-lg bg-slate-950 border border-white/10 shadow-2xl text-[10px] text-slate-350 leading-relaxed font-normal opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 z-50">
                      <span className="font-bold text-white block mb-0.5">Hindsight Confidence</span>
                      Confidence scales based on the match count of historical campaign memory nodes found in the SQLite substrate for the chosen brief.
                    </div>
                  </div>
                </div>

                {/* Hook display card */}
                <div className="bg-gradient-to-tr from-violet-600/10 to-fuchsia-600/10 border border-violet-500/20 rounded-2xl p-5 relative overflow-hidden">
                  <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest block mb-2">
                    Recommended Hook
                  </span>
                  <p className="text-lg md:text-xl font-extrabold text-white leading-relaxed italic">
                    &ldquo;{result!.strategy.recommendedHook}&rdquo;
                  </p>
                </div>

                {/* Insights and rationale */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  <div className="space-y-3">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase">
                      <ListChecks className="w-4 h-4 text-cyan-400" />
                      <span>Hindsight Insights</span>
                    </div>
                    <ul className="text-xs text-slate-300 space-y-2 pl-4 list-disc">
                      {result!.strategy.memoryInsights.map((insight, idx) => (
                        <li key={idx} className="leading-relaxed">{insight}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase">
                      <BadgeCheck className="w-4 h-4 text-violet-400" />
                      <span>Strategic Rationale</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {result!.strategy.strategy}
                    </p>
                  </div>
                </div>

                {/* Script Display */}
                <div className="pt-4 border-t border-white/5 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase">
                      <FileText className="w-4 h-4 text-purple-400" />
                      <span>Creative Ad Script</span>
                    </div>
                    <button 
                      onClick={handleCopyScript}
                      className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
                    >
                      {copied ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Script</span>
                        </>
                      )}
                    </button>
                  </div>
                  
                  <div className="bg-slate-950 p-4 rounded-xl border border-white/5 font-mono text-xs text-slate-300 leading-relaxed whitespace-pre-line select-all">
                    {result!.strategy.adScript}
                  </div>
                </div>

              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
