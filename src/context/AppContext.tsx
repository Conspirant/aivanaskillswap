import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  karma_points: number;
  trust_score: number;
  location: string;
  bio: string | null;
  timezone: string | null;
  role: string;
  skills: string[];
  auth_user_id: string;
  created_at: string;
  updated_at: string;
}

interface AppContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchProfile = useCallback(async (userId: string, authUser: User) => {
    try {
      const { data, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('auth_user_id', userId)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (data) {
        setProfile(data);
        return data;
      }

      // Auto-create profile if it doesn't exist
      const { data: newProfile, error: createError } = await supabase
        .from('users')
        .insert({
          auth_user_id: userId,
          email: authUser.email || '',
          name: authUser.email?.split('@')[0] || 'New User',
          role: 'learner',
          skills: [],
          location: 'Not specified',
        })
        .select()
        .single();
      
      if (createError) {
        toast({
          title: 'Profile Creation Failed',
          description: createError.message,
          variant: 'destructive'
        });
        throw createError;
      }

      setProfile(newProfile);
      return newProfile;
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  }, [toast]);
  
  const loadUserAndProfile = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data: { session } } = await supabase.auth.getSession();
    const authUser = session?.user || null;
    setUser(authUser);

    if (authUser) {
      await fetchProfile(authUser.id, authUser);
    }
    
    setLoading(false);
  }, [fetchProfile]);

  useEffect(() => {
    loadUserAndProfile();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      const authUser = session?.user || null;
      setUser(authUser);
      if (authUser) {
        loadUserAndProfile();
      } else {
        setProfile(null);
        navigate('/');
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [loadUserAndProfile, navigate]);

  const value = { user, profile, loading, error, refetch: loadUserAndProfile };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppContextProvider');
  }
  return context;
}; 