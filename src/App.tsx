import { AuthProvider, useAuth } from './contexts/AuthContext';
import { StoreProvider } from './store';
import Layout from './components/Layout';
import AuthGate from './components/AuthGate';

/**
 * AuthenticatedApp
 *
 * Rendered only when the user is signed in. Wraps the full app with
 * StoreProvider so Firestore listeners can access the authenticated user.
 */
function AuthenticatedApp() {
  return (
    <StoreProvider>
      <Layout />
    </StoreProvider>
  );
}

/**
 * AppShell
 *
 * Reads auth state and decides what to render:
 *   - While Firebase resolves the initial auth state: blank screen (prevents flash).
 *   - Not authenticated: login / register screen.
 *   - Authenticated: full application.
 */
function AppShell() {
  const { user, loading } = useAuth();

  if (loading) {
    // Show a minimal blank screen matching the app background while Firebase
    // resolves the session cookie. Avoids a flash of the login page on refresh.
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ backgroundColor: 'var(--color-surface-0)' }}
      />
    );
  }

  if (!user) {
    return <AuthGate />;
  }

  return <AuthenticatedApp />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}
