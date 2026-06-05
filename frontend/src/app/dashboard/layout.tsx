'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Layers, 
  Brain, 
  Sparkles, 
  LineChart, 
  Menu, 
  X,
  Database,
  Wifi,
  WifiOff
} from 'lucide-react';
import { UserButton } from '@/components/AuthComponents';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [backendStatus, setBackendStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const pathname = usePathname();

  // Navigation Items
  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Campaigns', href: '/dashboard/campaigns', icon: Layers },
    { name: 'Memory Substrate', href: '/dashboard/memory', icon: Brain },
    { name: 'AI Strategist', href: '/dashboard/strategist', icon: Sparkles },
    { name: 'Analytics', href: '/dashboard/analytics', icon: LineChart },
  ];

  // Check backend server connection health
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/campaigns', {
          method: 'GET',
          signal: AbortSignal.timeout(2000)
        });
        if (res.ok) {
          setBackendStatus('connected');
        } else {
          setBackendStatus('disconnected');
        }
      } catch (err) {
        setBackendStatus('disconnected');
      }
    };
    checkHealth();
    const interval = setInterval(checkHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-screen bg-[#03040b] text-slate-100 overflow-hidden font-sans">
      
      {/* MOBILE SIDEBAR MOBILE DRAWER */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR CONTAINER */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 flex flex-col w-64 border-r border-white/5 bg-[#080914]/90 backdrop-blur-xl transition-transform duration-300 lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header Logo */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-white/5">
          <Link href="/" className="flex items-center gap-2" onClick={() => setSidebarOpen(false)}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 to-cyan-500 flex items-center justify-center">
              <Brain className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              Campaign<span className="text-violet-400">Mind</span>
            </span>
          </Link>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Nav Items */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-violet-600/15 border-l-2 border-violet-500 text-white'
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-violet-400' : 'text-slate-500'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* System Health / Connection Status */}
        <div className="p-4 border-t border-white/5 bg-slate-950/20 text-xs">
          <div className="flex items-center justify-between text-slate-400 px-2">
            <span className="flex items-center gap-1.5 font-mono">
              <Database className="w-3.5 h-3.5 text-slate-500" />
              Firestore DB
            </span>
            <span className="flex items-center gap-1 text-[10px]">
              {backendStatus === 'connected' && (
                <>
                  <Wifi className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                  <span className="text-emerald-400 font-bold uppercase">Online</span>
                </>
              )}
              {backendStatus === 'disconnected' && (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-rose-500" />
                  <span className="text-rose-500 font-bold uppercase">Offline</span>
                </>
              )}
              {backendStatus === 'checking' && (
                <span className="text-slate-500 animate-pulse">Syncing...</span>
              )}
            </span>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT VIEW */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        
        {/* Top Navbar */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-white/5 bg-[#080914]/40 backdrop-blur-md relative z-30">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold text-slate-100 hidden md:block">
              {pathname === '/dashboard' && "System Console"}
              {pathname.startsWith('/dashboard/campaigns') && "Campaign Director"}
              {pathname === '/dashboard/memory' && "Hindsight Memory Substrate"}
              {pathname === '/dashboard/strategist' && "AI Senior Strategist"}
              {pathname === '/dashboard/analytics' && "Memory Analytics"}
            </h2>
          </div>

          {/* User profile buttons */}
          <div className="flex items-center gap-4">
            {backendStatus === 'disconnected' && (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <WifiOff className="w-3 h-3" /> API Server Connection Error. Run backend first!
              </span>
            )}
            <UserButton />
          </div>
        </header>

        {/* Scrollable Workspace Container */}
        <main className="flex-1 overflow-y-auto bg-[#03040b] p-6 relative">
          {children}
        </main>
      </div>

    </div>
  );
}
