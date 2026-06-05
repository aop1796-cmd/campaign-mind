'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { isFirebaseConfigured, auth, googleProvider } from '@/lib/firebase';
import { onIdTokenChanged, signInWithPopup, signOut as firebaseSignOut, User } from 'firebase/auth';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  isFirebaseEnabled: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithGoogle: async () => {},
  logout: async () => {},
  isFirebaseEnabled: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const localAuth = auth;
    if (!isFirebaseConfigured || !localAuth) {
      // Demo mode: automatically log in a default mock user
      setUser({
        uid: 'mock_user_123',
        email: 'alex@campaignmind.ai',
        displayName: 'Alex Strategist',
        photoURL: null,
      });
      // Store a mock token in local storage so that API requests identify this mock user
      if (typeof window !== 'undefined') {
        localStorage.setItem('firebase_id_token', 'mock_token_123');
      }
      setLoading(false);
      return;
    }

    // Live mode: listen to Firebase auth state changes
    const unsubscribe = onIdTokenChanged(localAuth, async (firebaseUser: User | null) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
        });
        
        try {
          const token = await firebaseUser.getIdToken();
          localStorage.setItem('firebase_id_token', token);
        } catch (error) {
          console.error('Error getting Firebase ID token:', error);
          localStorage.removeItem('firebase_id_token');
        }
      } else {
        setUser(null);
        localStorage.removeItem('firebase_id_token');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const localAuth = auth;
    const localProvider = googleProvider;
    if (!isFirebaseConfigured || !localAuth || !localProvider) {
      // In demo mode, sign in is instant
      setUser({
        uid: 'mock_user_123',
        email: 'alex@campaignmind.ai',
        displayName: 'Alex Strategist',
        photoURL: null,
      });
      localStorage.setItem('firebase_id_token', 'mock_token_123');
      return;
    }

    try {
      setLoading(true);
      await signInWithPopup(localAuth, localProvider);
    } catch (error) {
      console.error('Google Sign-In failed:', error);
      setLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    const localAuth = auth;
    if (!isFirebaseConfigured || !localAuth) {
      // Demo mode logout clears user
      setUser(null);
      localStorage.removeItem('firebase_id_token');
      return;
    }

    try {
      setLoading(true);
      await firebaseSignOut(localAuth);
    } catch (error) {
      console.error('Sign-out failed:', error);
      setLoading(false);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signInWithGoogle,
        logout,
        isFirebaseEnabled: isFirebaseConfigured,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
