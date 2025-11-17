import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import supabase from "../supabaseClient";

/**
 * PUBLIC_INTERFACE
 * AuthContext provides authenticated user, profile (with role), loading state,
 * and auth actions (signIn, signOut).
 */
const AuthContext = createContext({
  user: null,
  profile: null,
  loading: true,
  // Actions
  signIn: async (_email, _password) => {},
  signOut: async () => {},
});

// PUBLIC_INTERFACE
/**
 * AuthProvider wraps the app, subscribes to Supabase auth state, and loads the user's profile.
 * - Uses Supabase v2 APIs: getSession and onAuthStateChange
 * - Loads profile from 'profiles' table keyed by auth user id.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadSessionAndProfile = async () => {
    setLoading(true);
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (error) throw error;

      const authUser = session?.user ?? null;
      setUser(authUser);

      if (authUser) {
        const { data: profData, error: profErr } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", authUser.id)
          .single();
        if (profErr && profErr.code !== "PGRST116") {
          // PGRST116: No rows found; tolerate if profile not yet created
          // eslint-disable-next-line no-console
          console.warn("Error loading profile", profErr);
        }
        setProfile(profData || null);
      } else {
        setProfile(null);
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("Auth load error:", e);
      setUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessionAndProfile();

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const nextUser = session?.user ?? null;
      setUser(nextUser);

      if (nextUser) {
        const { data: profData, error: profErr } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", nextUser.id)
          .single();
        if (profErr && profErr.code !== "PGRST116") {
          // eslint-disable-next-line no-console
          console.warn("Error loading profile on auth change", profErr);
        }
        setProfile(profData || null);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      sub.subscription?.unsubscribe?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo(
    () => ({
      user,
      profile,
      loading,
      // PUBLIC_INTERFACE
      signIn: async (email, password) => {
        /** Sign in using email/password with Supabase v2 API. */
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        return data;
      },
      // PUBLIC_INTERFACE
      signOut: async () => {
        /** Sign out current session. */
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
      },
    }),
    [user, profile, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// PUBLIC_INTERFACE
/**
 * useAuth hook to access auth state in components.
 */
export function useAuth() {
  return useContext(AuthContext);
}

export default AuthProvider;
