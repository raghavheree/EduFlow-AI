import React, { createContext, useState, useEffect } from 'react';
import type { UserRole, Profile, Department } from '../types';
import { supabase, isSupabaseConfigured, checkSupabaseConnection } from '../lib/supabase';
import type { SupabaseHealthStatus } from '../lib/supabase';
import { DEMO_DEPARTMENTS, DEMO_PROFILES } from './mockData';

interface AuthContextType {
  currentProfile: Profile;
  currentRole: UserRole;
  currentDepartment: Department;
  switchRole: (role: UserRole) => void;
  isLoading: boolean;
  isConfigured: boolean;
  supabaseHealth: SupabaseHealthStatus | null;
  refreshHealth: () => Promise<void>;
  campusName: string;
  academicYear: string;
  currentTerm: string;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRole, setCurrentRole] = useState<UserRole>('student');
  const [currentProfile, setCurrentProfile] = useState<Profile>(DEMO_PROFILES.student);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [supabaseHealth, setSupabaseHealth] = useState<SupabaseHealthStatus | null>(null);

  const campusName = import.meta.env.VITE_CAMPUS_NAME || 'Apex Institute of Technology';
  const academicYear = import.meta.env.VITE_ACADEMIC_YEAR || '2026-2027';
  const currentTerm = import.meta.env.VITE_CURRENT_TERM || 'Fall Semester';

  const checkHealth = async () => {
    const health = await checkSupabaseConnection();
    setSupabaseHealth(health);
  };

  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      await checkHealth();

      if (isSupabaseConfigured()) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const { data: dbProfile } = await supabase
              .from('profiles')
              .select('*, department:departments(*)')
              .eq('id', session.user.id)
              .single();

            if (dbProfile) {
              setCurrentProfile(dbProfile);
              setCurrentRole(dbProfile.role);
            }
          }
        } catch (err) {
          console.warn('[EduFlow AI] Supabase auth check notice:', err);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const switchRole = (newRole: UserRole) => {
    setCurrentRole(newRole);
    setCurrentProfile(DEMO_PROFILES[newRole]);
  };

  const currentDepartment = currentProfile.department || DEMO_DEPARTMENTS[0];

  return (
    <AuthContext.Provider
      value={{
        currentProfile,
        currentRole,
        currentDepartment,
        switchRole,
        isLoading,
        isConfigured: isSupabaseConfigured(),
        supabaseHealth,
        refreshHealth: checkHealth,
        campusName,
        academicYear,
        currentTerm
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { useAuth } from './useAuth';
