'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Brain, 
  Sparkles, 
  TrendingUp, 
  Search, 
  Shield, 
  ChevronRight, 
  ArrowRight, 
  CheckCircle2, 
  Play, 
  RotateCcw,
  BarChart3,
  Lightbulb,
  History
} from 'lucide-react';
import { SignInButton } from '@/components/AuthComponents';

export default function LandingPage() {
  const [demoStep, setDemoStep] = useState(1);
  const [demoLoading, setDemoLoading] = useState(false);

  // Define the outputs for the 3 steps of the demo
  const demoData = [
    {
      step: 1,
      title: "Step 1: The First Request (Cold Start)",
      request: "Create a new skincare ad campaign for organic glowing serum.",
      recalledMemories: [],
      memoryInsights: [
        "No past skincare campaign memory found in Hindsight substrate.",
        "Using general marketing benchmarks for direct response."
      ],
      recommendedHook: "Tired of dull skin? Meet your new daily skincare routine.",
      creativeStyle: "Founder Story / Direct Response",
      strategy: "Since we have no campaign history for skincare, we are launching with a standard founder story ad to introduce the brand and build trust.",
      confidence: "Low",
      script: "Founder: 'I created this skincare line because I couldn't find anything that actually worked for my sensitive skin... Formulated with organic botanicals, it hydrates without clogging pores.'"
    },
    {
      step: 2,
      title: "Step 2: Stored learning (UGC CTR 4.8%)",
      request: "Create a new skincare ad campaign for organic glowing serum.",
      recalledMemories: [
        { brand: "GlowSerums", style: "UGC", ctr: 4.8, feedback: "UGC style was highly engaging and generated high CTR." }
      ],
      memoryInsights: [
        "UGC style ads generated highest CTR (4.8%) in past skincare campaigns.",
        "Observation: Authentic creator style resonated strongly with beauty audience."
      ],
      recommendedHook: "POV: Your skin is glowing and you didn't have to spend $500 at the spa.",
      creativeStyle: "User-Generated Content (UGC)",
      strategy: "Hindsight recall identified a highly successful UGC campaign (ID: 1) with a 4.8% CTR. Client feedback shows UGC styled creatives outperformed standard brand videos. We are doubling down on UGC style.",
      confidence: "Medium",
      script: "Creator: 'Okay, I literally never do this but I had to share this skincare hack. My skin has never been this clear... This is the CampaignMind serum. It feels so lightweight and absorbs instantly!'"
    },
    {
      step: 3,
      title: "Step 3: Stored multi-learning (The Senior Strategist)",
      request: "Create a new skincare ad campaign for organic glowing serum.",
      recalledMemories: [
        { brand: "ClearSkinCo", style: "Before/After UGC", ctr: 5.2, feedback: "Before/After UGC transition increased retention." },
        { brand: "GlowSerums", style: "UGC", ctr: 4.8, feedback: "UGC style was highly engaging and generated high CTR." },
        { brand: "RadiantSkin", style: "Founder Video", ctr: 2.1, feedback: "Founder story videos underperformed. Users dropped off." }
      ],
      memoryInsights: [
        "Before/After UGC ads generated the highest overall CTR (5.2%).",
        "UGC formatting outperformed brand-narratives (4.8% vs 2.1% CTR).",
        "Client feedback confirms Before/After comparisons dramatically increased watch-time."
      ],
      recommendedHook: "This 30-second transformation is why this serum has gone viral twice.",
      creativeStyle: "Before/After UGC",
      strategy: "Hindsight analysis shows Before/After UGC style is the clear winner (5.2% CTR), driving the highest retention. UGC styling continues to perform, while Founder style remains low (2.1% CTR). Our recommendation is a Before/After transition UGC ad.",
      confidence: "High",
      script: "Creator: 'I was so skeptical about this serum, but look at my skin after just two weeks. It cleared up my redness and literally gave me a glass-skin finish. Link is below, trust me, you need to try this!'"
    }
  ];

  const handleStepClick = (step: number) => {
    setDemoLoading(true);
    setTimeout(() => {
      setDemoStep(step);
      setDemoLoading(false);
    }, 450);
  };

  const activeDemo = demoData[demoStep - 1];

  return (
    <div className="flex flex-col min-h-screen bg-[#03040b] text-slate-100 overflow-hidden relative">
      
      {/* Glow Effects in Background */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute top-[800px] right-1/4 w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[140px] pointer-events-none -z-10" />
      
      {/* Header */}
      <header className="sticky top-0 z-40 w-full glass border-b border-white/5">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
              Campaign<span className="text-violet-400">Mind</span>
            </span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#demo" className="hover:text-violet-400 transition-colors">Memory Demo</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          </nav>

          <div className="flex items-center gap-4">
            <SignInButton>
              <span>Dashboard</span>
            </SignInButton>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 pt-20 pb-24 text-center relative">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-xs font-semibold mb-6 animate-pulse-slow">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Introducing AI Ad Campaign Memory</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6 leading-tight">
            Stop Starting Every Ad Campaign <br />
            <span className="text-gradient">From Scratch</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mb-10 leading-relaxed">
            The first AI agent that continuously remembers every campaign hook, creative style, client feedback, and CTR performance. Become 10x smarter with every ad you run.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/dashboard"
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 hover:opacity-95 text-white font-semibold flex items-center gap-2 shadow-lg shadow-violet-500/25 transition-all hover:scale-[1.02]"
            >
              Get Started Free <ArrowRight className="w-4 h-4" />
            </Link>
            <a 
              href="#demo"
              className="px-8 py-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-semibold transition-colors flex items-center gap-2"
            >
              See Memory Demo <Play className="w-4 h-4 text-violet-400" />
            </a>
          </div>

          {/* Interactive stats / preview */}
          <div className="mt-16 w-full border border-white/5 rounded-2xl bg-slate-900/40 p-4 md:p-6 glass shadow-2xl relative">
            <div className="absolute -top-4 -left-4 w-12 h-12 border-t-2 border-l-2 border-violet-500/30 rounded-tl-xl" />
            <div className="absolute -bottom-4 -right-4 w-12 h-12 border-b-2 border-r-2 border-cyan-500/30 rounded-br-xl" />
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-4">
              <div className="text-left px-4">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Campaign Memory</p>
                <p className="text-3xl font-bold text-white mt-1">100%</p>
                <p className="text-xs text-violet-400 mt-1">Zero learnings lost</p>
              </div>
              <div className="text-left px-4 border-l border-white/5">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Avg CTR Boost</p>
                <p className="text-3xl font-bold text-white mt-1">+45%</p>
                <p className="text-xs text-cyan-400 mt-1">Through pattern recall</p>
              </div>
              <div className="text-left px-4 border-l border-white/5">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Confidence Level</p>
                <p className="text-3xl font-bold text-white mt-1">98%</p>
                <p className="text-xs text-emerald-400 mt-1">Data-backed strategies</p>
              </div>
              <div className="text-left px-4 border-l border-white/5">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Time Saved</p>
                <p className="text-3xl font-bold text-white mt-1">20 hrs</p>
                <p className="text-xs text-purple-400 mt-1">Per campaign launch</p>
              </div>
            </div>
          </div>
          
        </div>
      </section>

      {/* Problem Statement Grid */}
      <section id="features" className="container mx-auto px-6 py-20 border-t border-white/5">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4">
            Why Generic AI Tools <span className="text-gradient">Fail</span>
          </h2>
          <p className="text-slate-400">
            Standard AI chatbots don&apos;t know what campaigns you ran yesterday, which hooks worked, or what your clients liked. CampaignMind solves this with Hindsight memory.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="glass-card p-8 rounded-2xl relative">
            <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 mb-6">
              <History className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">1. Continuous Learning</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Every campaign result, client feedback, and CTR metric you submit is processed, summarized, and retained in our persistent Hindsight substrate.
            </p>
          </div>

          <div className="glass-card p-8 rounded-2xl relative">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-6">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">2. Contextual Recall</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              When creating a new ad brief, our memory agent instantly searches similar audiences, industries, and creative styles from your entire campaign archive.
            </p>
          </div>

          <div className="glass-card p-8 rounded-2xl relative">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-6">
              <Lightbulb className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">3. Senior Reflection</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Instead of generic advice, our AI acts like a veteran strategist who has run all your campaigns, pointing out exactly what to double down on and what to avoid.
            </p>
          </div>

        </div>
      </section>

      {/* Memory Demo Section (The Hero Demo Flow) */}
      <section id="demo" className="container mx-auto px-6 py-20 border-t border-white/5 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-violet-600/5 to-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-block px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 text-xs font-semibold mb-4">
            Interactive Product Demo
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4">
            Watch CampaignMind <span className="text-gradient">Get Smarter</span>
          </h2>
          <p className="text-slate-400">
            Click through the steps below to simulate launching skincare ads. Watch the Hindsight memory substrate gather learnings and dynamically shift recommended strategies.
          </p>
        </div>

        {/* Demo Interface */}
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Steps selector */}
          <div className="lg:col-span-4 flex flex-row lg:flex-col gap-4 overflow-x-auto lg:overflow-x-visible pb-4 lg:pb-0">
            
            {[1, 2, 3].map((stepNum) => (
              <button
                key={stepNum}
                onClick={() => handleStepClick(stepNum)}
                className={`flex-1 text-left p-5 rounded-xl border transition-all duration-300 focus:outline-none min-w-[240px] lg:min-w-0 ${
                  demoStep === stepNum
                    ? 'border-violet-500 bg-violet-600/10 shadow-lg shadow-violet-500/5'
                    : 'border-white/5 bg-slate-900/30 hover:border-white/10 hover:bg-slate-900/50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                    demoStep === stepNum ? 'bg-violet-500 text-white' : 'bg-slate-800 text-slate-400'
                  }`}>
                    Phase {stepNum}
                  </span>
                  {demoStep > stepNum && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                </div>
                <h4 className="font-bold text-white text-sm md:text-base">
                  {stepNum === 1 && "Cold Start Strategy"}
                  {stepNum === 2 && "UGC Learning Stored"}
                  {stepNum === 3 && "Complete Strategy Memory"}
                </h4>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                  {stepNum === 1 && "AI gives general advice since memory is completely empty."}
                  {stepNum === 2 && "Memory retrieves the 4.8% CTR skincare UGC campaign."}
                  {stepNum === 3 && "Compares 3 different campaigns to pinpoint winning & underperforming styles."}
                </p>
              </button>
            ))}

            <button 
              onClick={() => handleStepClick(1)}
              className="px-4 py-3 border border-dashed border-white/10 hover:border-white/20 text-xs text-slate-400 rounded-xl flex items-center justify-center gap-2 hover:bg-white/5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset Demo Flow
            </button>
          </div>

          {/* Interactive Screen Display */}
          <div className="lg:col-span-8 border border-white/5 rounded-2xl bg-[#090b16] shadow-2xl flex flex-col justify-between overflow-hidden min-h-[500px]">
            
            {/* Window header */}
            <div className="bg-slate-950 px-5 py-3.5 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/50" />
                <span className="w-3 h-3 rounded-full bg-amber-500/50" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/50" />
                <span className="text-xs text-slate-500 font-mono ml-2">hindsight_strategist.py</span>
              </div>
              <span className="text-[10px] text-violet-400 font-mono uppercase font-bold tracking-wider">
                {demoLoading ? "Recalling..." : "Active Memory Context"}
              </span>
            </div>

            {demoLoading ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 py-16">
                <div className="w-10 h-10 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
                <span className="text-sm text-slate-400 font-mono">Searching Hindsight memory substrate...</span>
              </div>
            ) : (
              <div className="p-6 flex-1 flex flex-col gap-6 text-sm">
                
                {/* Search Input Bar */}
                <div className="bg-slate-900/50 border border-white/5 rounded-xl p-4 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase">
                    <Search className="w-3.5 h-3.5 text-violet-400" />
                    <span>Brief Request</span>
                  </div>
                  <p className="text-white font-medium text-sm md:text-base italic">
                    &ldquo;{activeDemo.request}&rdquo;
                  </p>
                </div>

                {/* Retrieved Context Cards */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Hindsight Memories Retrieved ({activeDemo.recalledMemories.length})
                    </span>
                    <span className="text-xs font-mono text-slate-500">
                      Confidence: <span className={
                        activeDemo.confidence === "High" ? "text-emerald-400" :
                        activeDemo.confidence === "Medium" ? "text-cyan-400" : "text-amber-500"
                      }>{activeDemo.confidence}</span>
                    </span>
                  </div>
                  
                  {activeDemo.recalledMemories.length === 0 ? (
                    <div className="border border-dashed border-white/5 rounded-xl p-6 text-center text-slate-500 text-xs font-mono">
                      No memories matched. Core memory database is cold.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {activeDemo.recalledMemories.map((m, idx) => (
                        <div key={idx} className="border border-white/5 rounded-xl p-3 bg-slate-900/30 flex flex-col justify-between">
                          <div>
                            <p className="text-xs font-bold text-white">{m.brand}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{m.style}</p>
                          </div>
                          <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/5">
                            <span className="text-[10px] text-slate-500">CTR</span>
                            <span className={`text-xs font-extrabold ${m.ctr >= 4 ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {m.ctr}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* AI Outputs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-white/5 pt-4">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase">
                      <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Memory Insights</span>
                    </div>
                    <ul className="text-xs text-slate-300 flex flex-col gap-1.5 pl-4 list-disc">
                      {activeDemo.memoryInsights.map((insight, idx) => (
                        <li key={idx}>{insight}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase">
                      <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                      <span>Recommended Strategy</span>
                    </div>
                    <div className="text-xs text-slate-300">
                      <p><span className="font-bold text-white">Style:</span> {activeDemo.creativeStyle}</p>
                      <p className="mt-1"><span className="font-bold text-white">Hook:</span> &ldquo;{activeDemo.recommendedHook}&rdquo;</p>
                      <p className="mt-1 text-slate-400 leading-relaxed italic">{activeDemo.strategy}</p>
                    </div>
                  </div>
                </div>

                {/* Script Display */}
                <div className="bg-slate-900/30 border border-white/5 rounded-xl p-3.5 mt-auto flex flex-col gap-1.5">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider font-mono">
                    Generated Ad Script (Personalized)
                  </span>
                  <p className="text-xs text-slate-300 font-mono whitespace-pre-line leading-relaxed">
                    {activeDemo.script}
                  </p>
                </div>

              </div>
            )}
            
            {/* Window Footer Action */}
            <div className="bg-slate-950/80 px-6 py-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-xs text-slate-400">
                {demoStep === 1 && "Next: Store a highly successful 4.8% CTR UGC Skincare ad."}
                {demoStep === 2 && "Next: Store underperforming founder videos (2.1% CTR) & viral Before/After UGC (5.2% CTR)."}
                {demoStep === 3 && "CampaignMind successfully acts like a senior strategist."}
              </span>
              
              {demoStep < 3 ? (
                <button
                  onClick={() => handleStepClick(demoStep + 1)}
                  className="w-full sm:w-auto px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1"
                >
                  Store Result & Run Next Phase <ChevronRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <Link
                  href="/dashboard"
                  className="w-full sm:w-auto px-5 py-2 bg-gradient-to-r from-violet-600 to-cyan-500 hover:opacity-90 text-white rounded-lg text-xs font-bold transition-all text-center flex items-center justify-center gap-1"
                >
                  Enter Full Dashboard <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>

          </div>

        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="container mx-auto px-6 py-20 border-t border-white/5">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4">
            Predictable Plans for <span className="text-gradient">Growing Brands</span>
          </h2>
          <p className="text-slate-400">
            Start retaining your campaign memory today. Choose the plan that fits your monthly campaign volume.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          
          <div className="glass-card p-8 rounded-2xl flex flex-col justify-between border border-white/5 relative">
            <div>
              <h4 className="text-lg font-bold text-white mb-2">Starter</h4>
              <p className="text-xs text-slate-400 mb-6">For single brands and indie makers.</p>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-extrabold text-white">$49</span>
                <span className="text-xs text-slate-500">/mo</span>
              </div>
              <ul className="text-sm text-slate-300 flex flex-col gap-3.5 mb-8">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-violet-400 flex-shrink-0" />
                  <span>Up to 10 stored campaigns</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-violet-400 flex-shrink-0" />
                  <span>Standard Hindsight memory retrieval</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-violet-400 flex-shrink-0" />
                  <span>Llama-3-8B AI Strategist</span>
                </li>
              </ul>
            </div>
            <Link href="/dashboard" className="w-full py-3 border border-white/10 hover:border-white/20 hover:bg-white/5 text-sm font-semibold rounded-xl text-center transition-colors">
              Get Started Free
            </Link>
          </div>

          <div className="glass-card p-8 rounded-2xl flex flex-col justify-between border-2 border-violet-500/50 bg-[#0c0d1b] relative">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-violet-600 text-white font-bold text-[10px] uppercase tracking-wider">
              Most Popular
            </div>
            <div>
              <h4 className="text-lg font-bold text-white mb-2">Professional</h4>
              <p className="text-xs text-slate-400 mb-6">For expanding brands and fast agencies.</p>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-extrabold text-white">$149</span>
                <span className="text-xs text-slate-500">/mo</span>
              </div>
              <ul className="text-sm text-slate-300 flex flex-col gap-3.5 mb-8">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-violet-400 flex-shrink-0" />
                  <span className="font-semibold text-white">Unlimited stored campaigns</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-violet-400 flex-shrink-0" />
                  <span>Deep reflection & patterns mapping</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-violet-400 flex-shrink-0" />
                  <span>Llama-3-70B Advanced Strategist</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-violet-400 flex-shrink-0" />
                  <span>CSV Campaign Import & Exports</span>
                </li>
              </ul>
            </div>
            <Link href="/dashboard" className="w-full py-3 bg-gradient-to-r from-violet-600 to-cyan-500 hover:opacity-90 text-sm font-semibold rounded-xl text-center text-white transition-opacity shadow-lg shadow-violet-500/20">
              Start Professional Trial
            </Link>
          </div>

          <div className="glass-card p-8 rounded-2xl flex flex-col justify-between border border-white/5 relative">
            <div>
              <h4 className="text-lg font-bold text-white mb-2">Agency Suite</h4>
              <p className="text-xs text-slate-400 mb-6">For multi-account teams managing 50+ clients.</p>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-extrabold text-white">$399</span>
                <span className="text-xs text-slate-500">/mo</span>
              </div>
              <ul className="text-sm text-slate-300 flex flex-col gap-3.5 mb-8">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-violet-400 flex-shrink-0" />
                  <span>Multi-client workspaces (Client isolation)</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-violet-400 flex-shrink-0" />
                  <span>Dedicated custom fine-tuned memory</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-violet-400 flex-shrink-0" />
                  <span>Full API Access for webhook integrations</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-violet-400 flex-shrink-0" />
                  <span>Personal account strategist</span>
                </li>
              </ul>
            </div>
            <Link href="/dashboard" className="w-full py-3 border border-white/10 hover:border-white/20 hover:bg-white/5 text-sm font-semibold rounded-xl text-center transition-colors">
              Talk to Sales
            </Link>
          </div>

        </div>
      </section>

      {/* CTA Footer */}
      <section className="container mx-auto px-6 py-20 border-t border-white/5 text-center relative">
        <div className="max-w-3xl mx-auto rounded-3xl bg-gradient-to-tr from-slate-900/60 to-violet-950/20 p-12 md:p-16 border border-violet-500/10 relative overflow-hidden glass">
          <div className="absolute top-0 right-0 w-80 h-80 bg-violet-600/10 rounded-full blur-[80px] pointer-events-none -z-10" />
          
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6">
            Get Smarter With Every Ad
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto mb-10 text-sm md:text-base">
            Join marketing teams who are already building high-converting ads by preserving their historical learnings in an AI memory bank.
          </p>
          <div className="flex items-center justify-center">
            <Link 
              href="/dashboard"
              className="px-8 py-4 bg-gradient-to-r from-violet-600 to-cyan-500 hover:opacity-95 text-white font-bold rounded-xl transition-all shadow-lg shadow-violet-500/20 flex items-center gap-2"
            >
              Access Demo Workspace <ArrowRight className="w-4.5 h-4.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 py-10 border-t border-white/5">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-violet-600/20 flex items-center justify-center">
              <Brain className="w-3.5 h-3.5 text-violet-400" />
            </div>
            <span className="font-bold text-white text-xs">CampaignMind © 2026</span>
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-slate-300">Privacy Policy</a>
            <a href="#" className="hover:text-slate-300">Terms of Service</a>
            <a href="#" className="hover:text-slate-300">Documentation</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
