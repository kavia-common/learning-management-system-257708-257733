import React, { useState, useEffect } from 'react';
import './App.css';
import { BrowserRouter, Link } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import { AuthProvider, useAuth } from './auth/AuthProvider';
import AddLearningPath from './components/AddLearningPath';
import AddCourse from './components/AddCourse';

// PUBLIC_INTERFACE
function App() {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  return (
    <div className="App">
      <header className="App-header" style={{ padding: 24, alignItems: 'stretch' }}>
        <BrowserRouter>
          <TopNav onToggleTheme={toggleTheme} theme={theme} />
          <main className="container" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', borderRadius: 12, padding: 16, border: '1px solid var(--border-color)', width: '100%', maxWidth: 1080, margin: '0 auto' }}>
            <AuthProvider>
              <AppRoutes />
              {/* Keep admin utilities accessible via direct routes/components for now */}
              <section style={{ marginTop: 24 }}>
                <h3 style={{ textAlign: 'left', marginBottom: 8 }}>Admin Utilities</h3>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <AddLearningPath />
                  <AddCourse />
                </div>
              </section>
            </AuthProvider>
          </main>
          <p style={{ marginTop: 24, fontSize: 12 }}>
            <a
              className="App-link"
              href="https://reactjs.org"
              target="_blank"
              rel="noreferrer"
            >
              Learn React
            </a>
          </p>
        </BrowserRouter>
      </header>
    </div>
  );
}

function TopNav({ onToggleTheme, theme }) {
  const auth = useAuth(); // Within BrowserRouter and inside AuthProvider usage area, but for top bar, we show limited info

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
      <h1 style={{ margin: 0, fontSize: 24, textAlign: 'left' }}>LMS</h1>
      <nav style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Link className="App-link" to="/paths">Paths</Link>
        <Link className="App-link" to="/employee/dashboard">Employee</Link>
        <Link className="App-link" to="/admin/dashboard">Admin</Link>
        <Link className="App-link" to="/signin">Sign In</Link>
        <button 
          className="theme-toggle" 
          onClick={onToggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
        </button>
      </nav>
    </div>
  );
}

export default App;
