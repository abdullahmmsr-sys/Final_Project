import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../config/supabase';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Helper function to add timeout to any promise
const withTimeout = (promise, timeoutMs = 10000, errorMessage = 'Operation timed out') => {
  return Promise.race([
    promise,
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
    )
  ]);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user profile from profiles table
  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await withTimeout(
        supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single(),
        8000,
        'Profile fetch timed out'
      );

      if (error) {
        // If profile doesn't exist, that's okay
        if (error.code === 'PGRST116') {
          console.log('Profile not found, will be created on first update');
          return null;
        }
        throw error;
      }
      setProfile(data);
      return data;
    } catch (err) {
      console.error('Error fetching profile:', err);
      return null;
    }
  };

  // Initialize auth state
  useEffect(() => {
    let isMounted = true;
    
    const initializeAuth = async () => {
      try {
        console.log('Initializing auth...');
        const { data: { session }, error } = await withTimeout(
          supabase.auth.getSession(),
          5000,
          'Session fetch timed out'
        );
        
        if (error) {
          console.error('Session error:', error);
        }
        
        if (isMounted && session?.user) {
          console.log('User found:', session.user.email);
          setUser(session.user);
          // Don't await profile fetch - let it happen in background
          fetchProfile(session.user.id);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    // Ensure loading ends after max 5 seconds
    const timeout = setTimeout(() => {
      if (isMounted) {
        console.log('Auth timeout reached, setting loading to false');
        setLoading(false);
      }
    }, 5000);

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user);
          fetchProfile(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile(null);
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          setUser(session.user);
        }
      }
    );

    return () => {
      isMounted = false;
      clearTimeout(timeout);
      subscription?.unsubscribe();
    };
  }, []);

  // Sign up with email and password
  const signUp = async (email, password, fullName) => {
    setError(null);
    try {
      const { data, error } = await withTimeout(
        supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName
            }
          }
        }),
        15000,
        'Sign up timed out'
      );

      if (error) throw error;
      return { success: true, data };
    } catch (err) {
      console.error('Sign up error:', err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  // Sign in with email and password
  const signIn = async (email, password) => {
    setError(null);
    try {
      const { data, error } = await withTimeout(
        supabase.auth.signInWithPassword({
          email,
          password
        }),
        15000,
        'Sign in timed out'
      );

      if (error) throw error;
      return { success: true, data };
    } catch (err) {
      console.error('Sign in error:', err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  // Sign out - with local state clear even if Supabase fails
  const signOut = async () => {
    console.log('Signing out...');
    try {
      // Try to sign out from Supabase with timeout
      await withTimeout(
        supabase.auth.signOut(),
        5000,
        'Sign out timed out'
      );
    } catch (err) {
      console.error('Sign out error (continuing anyway):', err);
    }
    
    // Always clear local state regardless of Supabase response
    setUser(null);
    setProfile(null);
    setError(null);
    
    return { success: true };
  };

  // Update profile with timeout
  const updateProfile = async (updates) => {
    if (!user) return { success: false, error: 'Not authenticated' };

    try {
      console.log('Updating profile:', updates);
      
      // Use upsert to create profile if it doesn't exist
      const { data, error } = await withTimeout(
        supabase
          .from('profiles')
          .upsert({
            id: user.id,
            ...updates,
            updated_at: new Date().toISOString()
          })
          .select()
          .single(),
        10000,
        'Profile update timed out'
      );

      if (error) throw error;
      
      setProfile(data);
      console.log('Profile updated:', data);
      return { success: true, data };
    } catch (err) {
      console.error('Profile update error:', err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  // Reset password
  const resetPassword = async (email) => {
    try {
      const { error } = await withTimeout(
        supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`
        }),
        10000,
        'Password reset timed out'
      );
      
      if (error) throw error;
      return { success: true };
    } catch (err) {
      console.error('Password reset error:', err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    setError(null);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });

      if (error) throw error;
      return { success: true, data };
    } catch (err) {
      console.error('Google sign in error:', err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const value = {
    user,
    profile,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    signInWithGoogle,
    updateProfile,
    resetPassword,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
