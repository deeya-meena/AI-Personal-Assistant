"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { insforge } from '../../lib/insforge';

export interface User {
  id: string;
  email?: string;
  emailVerified?: boolean;
  name?: string;
  avatar_url?: string | null;
  auth_provider?: string;
  profile?: {
    name?: string;
    avatar_url?: string;
  };
}

export interface UserProfile {
  id: string;
  email: string | null;
  name: string | null;
  avatar_url: string | null;
  phone_number?: string | null;
  auth_provider?: string | null;
  verification_method?: string | null;
  last_login_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  syncUser: (user: any, name?: string) => Promise<UserProfile | null>;
  signOut: () => Promise<void>;
  setUserState: (user: User | null, profile?: UserProfile | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const res = await fetch('/api/auth/session');
      if (res.ok) {
        const data = await res.json();
        if (data?.user) {
          setProfile({
            id: data.user.id,
            email: data.user.email || null,
            name: data.user.name || null,
            avatar_url: data.user.avatar_url || null,
            phone_number: data.user.phone_number || null,
            auth_provider: data.user.auth_provider || 'email',
            verification_method: null,
            last_login_at: data.user.lastLoginAt || new Date().toISOString(),
          });
        }
      }
    } catch (err) {
      console.error('[AuthContext] Error fetching profile:', err);
    }
  }, []);

  const syncUser = useCallback(async (authUser: any, name?: string): Promise<UserProfile | null> => {
    if (!authUser) return null;

    const updatedProfile: UserProfile = {
      id: authUser.id,
      email: authUser.email || null,
      name: name || authUser.name || authUser.profile?.name || authUser.email?.split('@')[0] || 'Aura User',
      avatar_url: authUser.avatar_url || authUser.profile?.avatar_url || null,
      phone_number: authUser.phone_number || null,
      auth_provider: authUser.auth_provider || 'email',
      verification_method: null,
      last_login_at: new Date().toISOString(),
    };

    setProfile(updatedProfile);
    setUser({
      id: authUser.id,
      email: authUser.email,
      name: updatedProfile.name || undefined,
      avatar_url: updatedProfile.avatar_url,
      emailVerified: authUser.email_verified ?? true,
      auth_provider: updatedProfile.auth_provider || 'email',
    });

    return updatedProfile;
  }, []);

  const setUserState = useCallback((newUser: User | null, newProfile?: UserProfile | null) => {
    setUser(newUser);
    if (newProfile !== undefined) {
      setProfile(newProfile);
    } else if (newUser) {
      setProfile({
        id: newUser.id,
        email: newUser.email || null,
        name: newUser.name || newUser.email?.split('@')[0] || 'Aura User',
        avatar_url: newUser.avatar_url || null,
        auth_provider: newUser.auth_provider || 'email',
        last_login_at: new Date().toISOString(),
      });
    } else {
      setProfile(null);
    }
  }, []);

  const loadUser = useCallback(async () => {
    try {
      // 1. Try local session endpoint first (cookie-based or token)
      const res = await fetch('/api/auth/session');
      if (res.ok) {
        const data = await res.json();
        if (data?.user) {
          const u: User = {
            id: data.user.id,
            email: data.user.email,
            name: data.user.name,
            avatar_url: data.user.avatar_url,
            emailVerified: data.user.email_verified,
            auth_provider: data.user.auth_provider,
          };
          setUser(u);
          await syncUser(data.user);
          return;
        }
      }

      // 2. Fallback to insforge SDK getCurrentUser()
      const { data: sdkData, error } = await insforge.auth.getCurrentUser();
      if (!error && sdkData?.user) {
        setUser(sdkData.user as any);
        await syncUser(sdkData.user);
      } else {
        setUser(null);
        setProfile(null);
      }
    } catch (err) {
      console.warn('[AuthContext] Session verification note:', err);
      setUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [syncUser]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const refreshProfile = useCallback(async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  }, [user, fetchProfile]);

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      await insforge.auth.signOut();
    } catch (err) {
      console.error('[AuthContext] Error signing out:', err);
    } finally {
      setUser(null);
      setProfile(null);
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        refreshProfile,
        syncUser,
        signOut: handleSignOut,
        setUserState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
