import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

// Create a simple AuthContext mock provider
import { createContext } from 'react';

const AuthContext = createContext({ user: null, profile: null });
function MockAuthProvider({ value, children }) {
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Monkey-patch useAuth to use our mock in tests
jest.mock('./AuthProvider', () => {
  const actual = jest.requireActual('./AuthProvider');
  const React = require('react');
  const TestContext = React.createContext({ user: null, profile: null });
  const useAuth = () => React.useContext(TestContext);
  return {
    ...actual,
    useAuth,
    AuthContext: TestContext,
  };
});

describe('ProtectedRoute', () => {
  const AdminPage = () => <div>Admin Secret</div>;
  const Unauthorized = () => <div>Unauthorized</div>;
  const Signin = () => <div>Sign In</div>;

  function renderWithAuth(value, initialEntries = ['/admin']) {
    // Because we mocked useAuth to read from its own TestContext,
    // we provide that exact context value by re-importing here.
    const { AuthContext: TestAuthContext } = require('./AuthProvider');
    return render(
      <TestAuthContext.Provider value={value}>
        <MemoryRouter initialEntries={initialEntries}>
          <Routes>
            <Route
              path="/admin"
              element={
                <ProtectedRoute requireRole="admin">
                  <AdminPage />
                </ProtectedRoute>
              }
            />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/signin" element={<Signin />} />
          </Routes>
        </MemoryRouter>
      </TestAuthContext.Provider>
    );
  }

  test('redirects unauthenticated users to /signin', () => {
    renderWithAuth({ user: null, profile: null });
    expect(screen.getByText(/sign in/i)).toBeInTheDocument();
  });

  test('shows loading placeholder while profile role is loading for authenticated user', () => {
    // user exists but profile is not loaded yet
    renderWithAuth({ user: { id: 'u1' }, profile: null });
    expect(screen.getByText(/checking permissions/i)).toBeInTheDocument();
  });

  test('allows admin user to access when role is admin', () => {
    renderWithAuth({ user: { id: 'u1' }, profile: { role: 'admin' } });
    expect(screen.getByText(/admin secret/i)).toBeInTheDocument();
  });

  test('blocks non-admin user and sends to /unauthorized', () => {
    renderWithAuth({ user: { id: 'u2' }, profile: { role: 'employee' } });
    expect(screen.getByText(/unauthorized/i)).toBeInTheDocument();
  });
});
