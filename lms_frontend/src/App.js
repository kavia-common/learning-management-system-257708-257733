import React, { useState, useEffect, useMemo } from 'react';
import './App.css';
import { BrowserRouter, Link, useNavigate } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import { AuthProvider } from './auth/AuthProvider';
import AddLearningPath from './components/AddLearningPath';
import AddCourse from './components/AddCourse';
import runSupabaseHealthcheck from './health/supabaseHealthcheck';
import supabase from './supabaseClient';

/**
 * PUBLIC_INTERFACE
 * App is the root component. It sets the theme, mounts AuthProvider, and renders routes.
 */
function App() {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Development-only: run a quick Supabase healthcheck once on mount
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      (async () => {
        try {
          const result = await runSupabaseHealthcheck();
          // eslint-disable-next-line no-console
          console.log(
            '[Supabase Healthcheck]',
            result.ok ? 'OK' : 'FAILED',
            result.details
          );
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error('[Supabase Healthcheck] exception', e);
        }
      })();
    }
  }, []);

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  return (
    <div className="page">
      <BrowserRouter>
        <AuthProvider>
          <header className="header-hero">
            <div className="container">
              <TopNav onToggleTheme={toggleTheme} theme={theme} />
            </div>
          </header>

          <main className="container section">
            <div className="card">
              <AppRoutes />
            </div>

            {/* Keep admin utilities accessible via direct routes/components for now */}
            <section className="section" aria-label="Admin utilities">
              <h3 className="h3" style={{ marginBottom: 8 }}>Admin Utilities</h3>
              <div className="row">
                <div className="card" style={{ flex: '1 1 360px' }}>
                  <AddLearningPath />
                </div>
                <div className="card" style={{ flex: '1 1 360px' }}>
                  <AddCourse />
                </div>
              </div>
            </section>

            <p className="text-muted" style={{ marginTop: 16, fontSize: 12 }}>
              <a
                className="link"
                href="https://reactjs.org"
                target="_blank"
                rel="noreferrer"
              >
                Learn React
              </a>
            </p>
          </main>
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

/**
 * PUBLIC_INTERFACE
 * TopNav (Navbar) derives auth state via supabase.auth.getUser and onAuthStateChange,
 * fetches and caches the user's role (from user metadata or profiles table),
 * renders Admin link only for role === 'admin', and shows a brief loading state while role is loading
 * to prevent flashing unauthorized links. No PII is logged.
 *
 * Accessibility: <nav role="navigation" aria-label="Primary">, buttons have aria-labels.
 */
function TopNav({ onToggleTheme, theme }) {
  const navigate = useNavigate();

  // Local auth states: keep small and self-contained for Navbar visibility logic.
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null); // 'admin' | 'employee' | null
  const [loadingRole, setLoadingRole] = useState(true); // prevents flash of Admin link

  // Prefer metadata if available, else fetch from 'profiles'
  const deriveRoleFromUser = (u) => {
    const metaRole =
      u?.user_metadata?.role ||
      u?.app_metadata?.role ||
      u?.app_metadata?.claims?.role ||
      null;
    return metaRole || null;
  };

  // Fetch role from DB as fallback
  const fetchRoleFromProfiles = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .maybeSingle();
      if (error) {
        // eslint-disable-next-line no-console
        console.warn('[Navbar] profiles.role fetch failed');
        return null;
      }
      return data?.role || null;
    } catch {
      // Avoid logging PII or detailed errors
      return null;
    }
  };

  // Memo to keep a stable cache key for localStorage
  const roleCacheKey = useMemo(() => 'navbar:role-cache', []);

  const readCachedRole = (uid) => {
    try {
      const raw = window.localStorage.getItem(roleCacheKey);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (parsed && parsed.userId === uid && typeof parsed.role === 'string') {
        return parsed.role;
      }
      return null;
    } catch {
      return null;
    }
  };

  const writeCachedRole = (uid, r) => {
    try {
      const payload = JSON.stringify({ userId: uid, role: r });
      window.localStorage.setItem(roleCacheKey, payload);
    } catch {
      // ignore storage errors
    }
  };

  useEffect(() => {
    let active = true;

    const hydrate = async () => {
      setLoadingRole(true);
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error) {
          // eslint-disable-next-line no-console
          console.warn('[Navbar] getUser failed');
        }
        const u = data?.user || null;
        if (!active) return;
        setUser(u);

        if (!u?.id) {
          setRole(null);
          setLoadingRole(false);
          return;
        }

        // Try cached role first for quick paint
        const cached = readCachedRole(u.id);
        if (cached) {
          setRole(cached);
          setLoadingRole(false);
          return;
        }

        // Try metadata
        const metaRole = deriveRoleFromUser(u);
        if (metaRole) {
          setRole(metaRole);
          writeCachedRole(u.id, metaRole);
          setLoadingRole(false);
          return;
        }

        // Fallback to DB
        const dbRole = await fetchRoleFromProfiles(u.id);
        setRole(dbRole || 'user');
        writeCachedRole(u.id, dbRole || 'user');
      } finally {
        if (active) setLoadingRole(false);
      }
    };

    hydrate();

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!active) return;
      const nextUser = session?.user ?? null;
      setUser(nextUser);

      // Invalidate and recalc role on user change
      setLoadingRole(true);
      try {
        if (!nextUser?.id) {
          setRole(null);
          // Clear cache
          try {
            window.localStorage.removeItem(roleCacheKey);
          } catch {
            // ignore
          }
          return;
        }

        // Check cached or metadata quickly
        const cached = readCachedRole(nextUser.id);
        if (cached) {
          setRole(cached);
          return;
        }
        const metaRole = deriveRoleFromUser(nextUser);
        if (metaRole) {
          setRole(metaRole);
          writeCachedRole(nextUser.id, metaRole);
          return;
        }

        const dbRole = await fetchRoleFromProfiles(nextUser.id);
        setRole(dbRole || 'user');
        writeCachedRole(nextUser.id, dbRole || 'user');
      } finally {
        setLoadingRole(false);
      }
    });

    return () => {
      active = false;
      sub.subscription?.unsubscribe?.();
    };
  }, [roleCacheKey]);

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // Avoid logging sensitive information
    } finally {
      // Clear cached role and redirect to sign in
      try {
        window.localStorage.removeItem(roleCacheKey);
      } catch {
        // ignore
      }
      if (typeof window !== 'undefined' && window?.location?.replace) {
        window.location.replace('/signin');
      } else if (typeof navigate === 'function') {
        navigate('/signin', { replace: true });
      }
    }
  };

  // Nav rendering with brief loading placeholder for admin link area
  return (
    <div className="topnav">
      <div className="brand">
        <div className="brand-badge" aria-hidden="true">🌊</div>
        <div className="h3" style={{ margin: 0 }}>Ocean LMS</div>
      </div>
      <nav className="nav-links" role="navigation" aria-label="Primary">
        <Link className="nav-link" to="/paths">Paths</Link>
        <Link className="nav-link" to="/dashboard">Employee</Link>

        {/* Admin link area: show nothing while role is loading to avoid flash */}
        {loadingRole ? (
          <button
            className="btn"
            style={{ opacity: 0.6, pointerEvents: 'none' }}
            aria-disabled="true"
            aria-label="Loading navigation"
            title="Loading..."
          >
            Loading…
          </button>
        ) : (
          role === 'admin' && (
            <Link className="nav-link" to="/admin/dashboard">Admin</Link>
          )
        )}

        {!user ? (
          <Link className="nav-link" to="/signin">Sign In</Link>
        ) : (
          <button
            onClick={logout}
            className="btn btn-primary"
            aria-label="Sign out"
          >
            Logout
          </button>
        )}
        <button
          className="btn"
          onClick={onToggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
        </button>
      </nav>
    </div>
  );
}

export default App;
