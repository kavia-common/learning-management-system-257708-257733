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
 * Compatible with PKCE flow using supabase.auth.getSession and onAuthStateChange.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async (uid) => {
    try {
      const { data: profData, error: profErr } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", uid)
        .single();
      if (profErr && profErr.code !== "PGRST116") {
        // eslint-disable-next-line no-console
        console.warn("Error loading profile", profErr);
      }
      setProfile(profData || null);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn("Profile load exception", e);
      setProfile(null);
    }
  };

  useEffect(() => {
    let active = true;

    (async () => {
      setLoading(true);
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const authUser = session?.user ?? null;
        if (!active) return;
        setUser(authUser);
        if (authUser?.id) {
          await loadProfile(authUser.id);
        } else {
          setProfile(null);
        }
      } catch (e) {
        if (!active) return;
        // eslint-disable-next-line no-console
        console.error("Auth init error:", e);
        setUser(null);
        setProfile(null);
      } finally {
        if (active) setLoading(false);
      }
    })();

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!active) return;
      const nextUser = session?.user ?? null;
      setUser(nextUser);
      if (nextUser?.id) {
        await loadProfile(nextUser.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      active = false;
      sub.subscription?.unsubscribe?.();
    };
  }, []);

  const value = useMemo(
    () => ({
      user,
      profile,
      loading,
      // PUBLIC_INTERFACE
      signIn: async (email, password) => {
        // Still available for email/password if configured; PKCE is primary.
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        return data;
      },
      // PUBLIC_INTERFACE
      signOut: async () => {
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
