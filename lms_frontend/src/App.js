import React, { useState, useEffect } from 'react';
import './App.css';
import { BrowserRouter, Link, useNavigate } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import { AuthProvider, useAuth } from './auth/AuthProvider';
import AddLearningPath from './components/AddLearningPath';
import AddCourse from './components/AddCourse';
import runSupabaseHealthcheck from './health/supabaseHealthcheck';

// PUBLIC_INTERFACE
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
            <section className="section">
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

function TopNav({ onToggleTheme, theme }) {
  const auth = useAuth();
  const navigate = useNavigate();

  const logout = async () => {
    try {
      await auth.signOut();
      navigate('/signin');
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Sign out failed', e);
    }
  };

  return (
    <div className="topnav">
      <div className="brand">
        <div className="brand-badge" aria-hidden="true">🌊</div>
        <div className="h3" style={{ margin: 0 }}>Ocean LMS</div>
      </div>
      <nav className="nav-links">
        <Link className="nav-link" to="/paths">Paths</Link>
        <Link className="nav-link" to="/dashboard">Employee</Link>
        <Link className="nav-link" to="/admin/dashboard">Admin</Link>
        {!auth.user ? (
          <Link className="nav-link" to="/signin">Login</Link>
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
