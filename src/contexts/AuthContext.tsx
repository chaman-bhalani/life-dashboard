/**
 * src/contexts/AuthContext.tsx
 *
 * Provides the current Firebase Auth user throughout the app.
 * Uses onAuthStateChanged so the UI always reflects the real auth state,
 * even after token expiry or sign-out on another tab.
 */

import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { onAuthStateChanged } from "firebase/auth";
import type { User } from "firebase/auth";
import { auth } from "../firebase";

interface AuthContextValue {
  /** The currently authenticated Firebase user, or null if not signed in. */
  user: User | null;
  /** True while Firebase is resolving the initial auth state (prevents flash of login screen). */
  loading: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Subscribe to auth state changes. The unsubscribe function is returned
    // from useEffect cleanup so we don't leak the listener.
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

/** Hook to access the current auth state from any component. */
export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}
