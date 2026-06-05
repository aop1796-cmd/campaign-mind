'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  useAuth,
  UserButton as ClerkUserButton,
  SignInButton as ClerkSignInButton
} from '@clerk/nextjs';

const isClerkEnabled = typeof window !== 'undefined' && !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

// Safe SignedInWrapper using useAuth hook
function SignedInWrapper({ children }: { children: React.ReactNode }) {
  const { userId, isLoaded } = useAuth();
  
  // Wait for Clerk to load
  if (!isLoaded) {
    return (
      <div className="flex items-center gap-1 text-xs text-slate-500 font-mono">
        <div className="w-3 h-3 border-2 border-slate-500/20 border-t-slate-500 rounded-full animate-spin" />
        <span>Syncing...</span>
      </div>
    );
  }
  
  if (!userId) {
    return null;
  }
  
  return <>{children}</>;
}

export function SignedIn({ children }: { children: React.ReactNode }) {
  if (!isClerkEnabled) {
    // In Mock Mode, user is always signed in
    return <>{children}</>;
  }
  return <SignedInWrapper>{children}</SignedInWrapper>;
}

// Safe SignedOutWrapper using useAuth hook
function SignedOutWrapper({ children }: { children: React.ReactNode }) {
  const { userId, isLoaded } = useAuth();
  
  if (!isLoaded || userId) {
    return null;
  }
  
  return <>{children}</>;
}

export function SignedOut({ children }: { children: React.ReactNode }) {
  if (!isClerkEnabled) {
    // In Mock Mode, user is always signed in, so signed out elements are hidden
    return null;
  }
  return <SignedOutWrapper>{children}</SignedOutWrapper>;
}

// Safe SignInButton
export function SignInButton({ children, mode }: { children?: React.ReactNode, mode?: "modal" | "redirect" }) {
  if (!isClerkEnabled) {
    return (
      <Link 
        href="/dashboard" 
        className="px-5 py-2.5 rounded-lg font-medium text-sm bg-gradient-to-r from-violet-600 to-cyan-500 hover:opacity-90 transition-opacity text-white flex items-center justify-center gap-2"
      >
        {children || "Enter App (Demo Mode)"}
      </Link>
    );
  }
  return <ClerkSignInButton mode={mode}>{children}</ClerkSignInButton>;
}

// Safe UserButton (renders avatar with dropdown in mock mode, or real Clerk button)
export function UserButton() {
  const [isOpen, setIsOpen] = useState(false);

  if (isClerkEnabled) {
    return <ClerkUserButton />;
  }

  return (
    <div className="relative z-50">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1.5 rounded-full hover:bg-white/5 transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500/20"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-violet-600 to-cyan-500 flex items-center justify-center text-white font-semibold text-sm">
          AS
        </div>
        <span className="text-sm font-medium text-slate-300 hidden md:inline-block">Alex Strategist</span>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-56 rounded-xl border border-white/5 bg-slate-900/95 p-2 shadow-2xl backdrop-blur-xl animate-float-short">
            <div className="px-3 py-2 border-b border-white/5 mb-1.5">
              <p className="text-sm font-semibold text-slate-200">Alex Strategist</p>
              <p className="text-xs text-slate-400 truncate">alex@campaignmind.ai</p>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-violet-500/10 text-violet-400 mt-1">
                Demo Workspace
              </span>
            </div>
            
            <Link 
              href="/dashboard" 
              className="flex w-full items-center px-3 py-2 text-sm text-slate-300 hover:bg-white/5 rounded-lg transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Dashboard
            </Link>
            
            <Link 
              href="/" 
              className="flex w-full items-center px-3 py-2 text-sm text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors mt-1.5"
              onClick={() => setIsOpen(false)}
            >
              Sign Out
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
