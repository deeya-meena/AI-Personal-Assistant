"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { insforge } from '../../lib/insforge';

interface User {
  id: string;
  email?: string;
  emailVerified?: boolean;
  profile?: {
    name?: string;
    avatar_url?: string;
  };
}

interface UserProfile {
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await insforge.database
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (data && !error) {
        setProfile(data as any);
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
    }
  };

  const syncUser = async (authUser: any, name?: string): Promise<UserProfile | null> => {
    if (!authUser) return null;

    try {
      const { data: existing, error: checkError } = await insforge.database
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking user existence:', checkError);
      }

      if (!existing && !checkError) {
        const isPhoneEmail = authUser.email?.startsWith('phone_') && authUser.email?.endsWith('@auth.aura.ai');
        let phoneNumber = null;
        let authProvider = 'email';
        
        if (isPhoneEmail) {
          const cleanPhone = authUser.email.split('@')[0].replace('phone_', '');
          phoneNumber = '+' + cleanPhone;
          authProvider = 'phone';
        }

        const newProfile = {
          id: authUser.id,
          email: authUser.email || null,
          name: name || authUser.profile?.name || (isPhoneEmail ? phoneNumber : authUser.email?.split('@')[0]) || 'Aura User',
          avatar_url: authUser.profile?.avatar_url || null,
          phone_number: phoneNumber,
          auth_provider: authProvider,
          verification_method: isPhoneEmail ? 'sms' : null,
          last_login_at: new Date().toISOString()
        };

        const { error: insertError } = await insforge.database
          .from('users')
          .insert([newProfile]);
        
        if (insertError) {
          console.error('Failed to sync user to database:', insertError);
        } else {
          setProfile(newProfile);
          return newProfile;
        }
      } else if (existing) {
        const lastLogin = new Date().toISOString();
        const updatedProfile = {
          ...existing,
          last_login_at: lastLogin
        };
        
        await insforge.database
          .from('users')
          .update({ last_login_at: lastLogin })
          .eq('id', authUser.id);

        setProfile(updatedProfile as any);
        return updatedProfile as any;
      }
    } catch (err) {
      console.error('Error during database sync:', err);
    }
    return null;
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  useEffect(() => {
    const loadUser = async () => {
      try {
        const { data, error } = await insforge.auth.getCurrentUser();
        if (data?.user) {
          setUser(data.user as any);
          await syncUser(data.user);
        }
      } catch (err) {
        console.error('Error fetching current user:', err);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await insforge.auth.signOut();
      setUser(null);
      setProfile(null);
    } catch (err) {
      console.error('Error signing out:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, refreshProfile, syncUser, signOut: handleSignOut }}>
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
