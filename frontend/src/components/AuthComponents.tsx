'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthProvider';

// Safe SignedIn component using our custom auth context
export function SignedIn({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading || !user) {
    return null;
  }
  
  return <>{children}</>;
}

// Safe SignedOut component using our custom auth context
export function SignedOut({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading || user) {
    return null;
  }
  
  return <>{children}</>;
}

// Safe SignInButton with built-in Google Sign-in flow and loading states
export function SignInButton({ children, mode }: { children?: React.ReactNode, mode?: "modal" | "redirect" }) {
  const { signInWithGoogle, isFirebaseEnabled } = useAuth();
  const [signingIn, setSigningIn] = useState(false);
  const router = useRouter();

  const handleSignIn = async () => {
    try {
      setSigningIn(true);
      await signInWithGoogle();
      router.push('/dashboard');
    } catch (e) {
      console.error('Sign in failed:', e);
    } finally {
      setSigningIn(false);
    }
  };

  return (
    <button 
      onClick={handleSignIn}
      disabled={signingIn}
      className="px-5 py-2.5 rounded-lg font-medium text-sm bg-gradient-to-r from-violet-600 to-cyan-500 hover:opacity-90 transition-all text-white flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shadow-lg shadow-violet-500/10 hover:shadow-violet-500/20 active:scale-[0.98]"
    >
      {signingIn ? (
        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      ) : isFirebaseEnabled ? (
        <svg className="w-4 h-4 mr-1 fill-current" viewBox="0 0 24 24">
          <path d="M12.24 10.285V13.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.579-7.859-8s3.529-8 7.859-8c2.46 0 4.105 1.025 5.047 1.926l2.427-2.334C17.955 2.192 15.34 1 12.24 1 6.033 1 12.24s5.033 11.24 11.24 11.24c6.478 0 10.793-4.537 10.793-10.986 0-.74-.08-1.3-.176-1.859H12.24z"/>
        </svg>
      ) : null}
      {children || (isFirebaseEnabled ? "Sign In with Google" : "Enter App (Demo Mode)")}
    </button>
  );
}

// Helper to get user initials
const getInitials = (displayName: string | null, email: string | null) => {
  if (displayName) {
    const parts = displayName.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].substring(0, 2).toUpperCase();
  }
  if (email) {
    return email.substring(0, 2).toUpperCase();
  }
  return 'US';
};

// Safe UserButton component with premium user avatar and drop-down menu
export function UserButton() {
  const { user, logout, isFirebaseEnabled } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  if (!user) {
    return null;
  }

  const handleSignOut = async () => {
    try {
      await logout();
      setIsOpen(false);
      router.push('/');
    } catch (e) {
      console.error('Sign out failed:', e);
    }
  };

  const displayName = user.displayName || "Alex Strategist";
  const email = user.email || "alex@campaignmind.ai";
  const initials = getInitials(user.displayName, user.email);

  return (
    <div className="relative z-50">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1.5 rounded-full hover:bg-white/5 transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500/20"
      >
        {user.photoURL ? (
          <img 
            src={user.photoURL} 
            alt={displayName}
            referrerPolicy="no-referrer"
            className="w-8 h-8 rounded-full object-cover border border-white/10"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-violet-600 to-cyan-500 flex items-center justify-center text-white font-semibold text-sm">
            {initials}
          </div>
        )}
        <span className="text-sm font-medium text-slate-300 hidden md:inline-block">{displayName}</span>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-56 rounded-xl border border-white/5 bg-slate-900/95 p-2 shadow-2xl backdrop-blur-xl animate-float-short">
            <div className="px-3 py-2 border-b border-white/5 mb-1.5">
              <p className="text-sm font-semibold text-slate-200">{displayName}</p>
              <p className="text-xs text-slate-400 truncate">{email}</p>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-violet-500/10 text-violet-400 mt-1">
                {isFirebaseEnabled ? "Live Workspace" : "Demo Workspace"}
              </span>
            </div>
            
            <Link 
              href="/dashboard" 
              className="flex w-full items-center px-3 py-2 text-sm text-slate-300 hover:bg-white/5 rounded-lg transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Dashboard
            </Link>
            
            <button 
              onClick={handleSignOut}
              className="flex w-full items-center px-3 py-2 text-sm text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors mt-1.5 text-left cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </>
      )}
    </div>
  );
}
