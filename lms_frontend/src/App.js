import React, { useState, useEffect } from 'react';
import './App.css';
import LearningPathsList from './components/LearningPathsList';
import CoursesList from './components/CoursesList';
import AddLearningPath from './components/AddLearningPath';
import AddCourse from './components/AddCourse';

// PUBLIC_INTERFACE
function App() {
  const [theme, setTheme] = useState('light');
  const [view, setView] = useState('browse'); // 'browse' | 'addPath' | 'addCourse'
  const [selectedPath, setSelectedPath] = useState(null);

  // Effect to apply theme to document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const NavButton = ({ active, onClick, children }) => (
    <button
      onClick={onClick}
      className="btn"
      aria-pressed={active}
      style={{
        background: active ? 'var(--button-bg)' : 'transparent',
        color: active ? 'var(--button-text)' : 'var(--text-primary)',
        border: '1px solid var(--border-color)',
        padding: '8px 12px',
        borderRadius: 8,
        cursor: 'pointer',
        marginRight: 8
      }}
    >
      {children}
    </button>
  );

  return (
    <div className="App">
      <header className="App-header" style={{ padding: 24, alignItems: 'stretch' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h1 style={{ margin: 0, fontSize: 24, textAlign: 'left' }}>LMS</h1>
          <button 
            className="theme-toggle" 
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
          </button>
        </div>

        <nav style={{ textAlign: 'left', marginBottom: 16 }}>
          <NavButton active={view === 'browse'} onClick={() => { setView('browse'); setSelectedPath(null); }}>
            Browse
          </NavButton>
          <NavButton active={view === 'addPath'} onClick={() => { setView('addPath'); setSelectedPath(null); }}>
            Add Path
          </NavButton>
          <NavButton active={view === 'addCourse'} onClick={() => { setView('addCourse'); setSelectedPath(null); }}>
            Add Course
          </NavButton>
        </nav>

        <main className="container" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', borderRadius: 12, padding: 16, border: '1px solid var(--border-color)', width: '100%', maxWidth: 960, margin: '0 auto' }}>
          {view === 'browse' && (
            <div>
              <LearningPathsList onSelect={(p) => setSelectedPath(p)} />
              {selectedPath && (
                <div style={{ marginTop: 16 }}>
                  <h2 style={{ textAlign: 'left', marginBottom: 8 }}>{selectedPath.name}</h2>
                  <CoursesList learningPathId={selectedPath.id} />
                </div>
              )}
            </div>
          )}
          {view === 'addPath' && <AddLearningPath />}
          {view === 'addCourse' && <AddCourse />}
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
      </header>
    </div>
  );
}

export default App;
