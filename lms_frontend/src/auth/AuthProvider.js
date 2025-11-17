import React, { createContext, useContext, useEffect, useMemo, useState, useRef } from "react";
import supabase from "../supabaseClient";

/**
 * PUBLIC_INTERFACE
 * AuthContext provides authenticated user, profile (with role),
 * and auth actions (signIn, signOut). No global loading gate is enforced.
 */
const AuthContext = createContext({
  user: null,
  profile: null,
  // Actions
  signIn: async (_email, _password) => {},
  signOut: async () => {},
});

// PUBLIC_INTERFACE
/**
 * AuthProvider wraps the app, subscribes to Supabase auth state, and loads the user's profile.
 * Children render immediately; no UI is blocked by a global loading state.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  // an incrementing token to ensure we set profile for the latest user only
  const loadTokenRef = useRef(0);

  // Load a user's profile by id and set into context
  const loadProfile = async (uid) => {
    const tokenAtStart = ++loadTokenRef.current;
    try {
      const { data: profData, error: profErr } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", uid)
        .maybeSingle();
      if (loadTokenRef.current !== tokenAtStart) {
        // Stale request; ignore to avoid race conditions
        return;
      }
      if (profErr) {
        // eslint-disable-next-line no-console
        console.warn("Error loading profile", profErr);
      }
      setProfile(profData || null);
    } catch (e) {
      if (loadTokenRef.current !== tokenAtStart) return;
      // eslint-disable-next-line no-console
      console.warn("Profile load exception", e);
      setProfile(null);
    }
  };

  useEffect(() => {
    let active = true;

    // Initial session hydrate (non-blocking for UI)
    (async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();
        if (error) {
          // eslint-disable-next-line no-console
          console.warn("getSession error:", error.message);
        }
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
      }
    })();

    // Subscribe to auth state changes
    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!active) return;
      const nextUser = session?.user ?? null;
      setUser(nextUser);

      // Refresh profile whenever user changes
      try {
        if (nextUser?.id) {
          await loadProfile(nextUser.id);
        } else {
          setProfile(null);
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn("onAuthStateChange profile load failed", e);
        setProfile(null);
      }
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
      // PUBLIC_INTERFACE
      signIn: async (email, password) => {
        // Email/password sign-in only.
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        // onAuthStateChange will populate profile after sign-in
        return data;
      },
      // PUBLIC_INTERFACE
      signOut: async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        // After sign out, clear state promptly
        setUser(null);
        setProfile(null);
      },
    }),
    [user, profile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * PUBLIC_INTERFACE
 * useAuth hook to access auth state in components.
 */
export function useAuth() {
  return useContext(AuthContext);
}

export default AuthProvider;
