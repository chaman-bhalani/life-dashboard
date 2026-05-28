/**
 * src/components/AuthGate.tsx
 *
 * Shown when the user is not authenticated.
 * Provides a Login and Register form using Firebase Email/Password auth.
 *
 * Design: matches the existing NotebookLM organic earth / sage green design
 * system (same CSS variables, same border-radius, same font tokens) so there
 * is zero visual discontinuity when the user logs in.
 *
 * Functionality rules:
 *  - No UI changes to the main app
 *  - This screen is ONLY shown when user === null
 *  - Successful auth causes the parent (App.tsx) to show the main app
 */

import { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Leaf, Mail, Lock, UserPlus, LogIn, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { auth, db } from '../firebase';

type AuthMode = 'login' | 'register' | 'forgot-password';

// Maps Firebase auth error codes to friendly, actionable messages.
function friendlyError(code: string): string {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'This email is already registered. Please sign in instead.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/weak-password':
      return 'Password must be at least 6 characters.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Incorrect email or password. Please try again.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please wait a moment and try again.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection.';
    default:
      return 'Something went wrong. Please try again.';
  }
}

export default function AuthGate() {
  const [mode, setMode]           = useState<AuthMode>('login');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [showPass, setShowPass]   = useState(false);
  const [error, setError]         = useState('');
  const [loading, setLoading]     = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  function switchMode(next: AuthMode) {
    setMode(next);
    setError('');
    setPassword('');
    setResetSuccess(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'forgot-password') {
        try {
          await sendPasswordResetEmail(auth, email);
        } catch (err: unknown) {
          const code = (err as { code?: string }).code ?? '';
          // To mitigate email enumeration attacks, if the user doesn't exist, we treat it as success.
          // However, for other structural/runtime errors (like invalid email format, network issues, rate limits),
          // we display the error to the user so they can act.
          if (code !== 'auth/user-not-found') {
            setError(friendlyError(code));
            setLoading(false);
            return;
          }
        }
        setResetSuccess(true);
      } else if (mode === 'register') {
        // 1. Create the Firebase Auth account.
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        // 2. Write the user profile document in Firestore (rules enforce uid match).
        await setDoc(doc(db, 'users', credential.user.uid), {
          email: credential.user.email,
          name: '',
          createdAt: serverTimestamp(),
        });
        // Auth state change in AuthContext will auto-navigate to the main app.
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? '';
      setError(friendlyError(code));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center p-4"
      style={{ backgroundColor: 'var(--color-surface-0)' }}
    >
      <div className="w-full max-w-sm">

        {/* Logo / Brand */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-2xl"
            style={{ backgroundColor: 'var(--color-accent)', boxShadow: '0 4px 16px rgba(74,107,83,0.3)' }}
          >
            <Leaf className="h-6 w-6 text-white" />
          </div>
          <div className="text-center">
            <h1
              className="text-2xl font-bold tracking-tight"
              style={{ color: 'var(--color-text-primary)' }}
            >
              LifeFlow
            </h1>
            <p className="mt-0.5 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              {mode === 'login' 
                ? 'Sign in to your dashboard' 
                : mode === 'register' 
                ? 'Create your account' 
                : 'Recover your account access'}
            </p>
          </div>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-6"
          style={{
            backgroundColor: 'var(--color-surface-1)',
            border: '1px solid var(--color-border-subtle)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03), 0 8px 32px rgba(0,0,0,0.05)',
          }}
        >
          {mode === 'forgot-password' && resetSuccess ? (
            <div className="space-y-6">
              <div
                className="rounded-xl p-4 text-sm leading-relaxed"
                style={{
                  backgroundColor: 'rgba(74, 107, 83, 0.08)',
                  color: 'var(--color-accent)',
                  border: '1px solid rgba(74, 107, 83, 0.2)',
                }}
              >
                If an account matches this email, a reset link has been sent. Please check your inbox and spam folder.
              </div>

              <button
                type="button"
                onClick={() => switchMode('login')}
                className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white transition-all active:scale-[0.98]"
                style={{
                  backgroundColor: 'var(--color-accent)',
                  boxShadow: '0 2px 8px rgba(74,107,83,0.25)',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-accent-hover)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-accent)'; }}
              >
                <ArrowLeft className="h-4 w-4" /> Back to Sign In
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>

              {/* Email */}
              <div>
                <label
                  htmlFor="auth-email"
                  className="mb-1.5 block text-xs font-semibold uppercase tracking-wider"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  Email
                </label>
                <div className="relative">
                  <Mail
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
                    style={{ color: 'var(--color-text-muted)' }}
                  />
                  <input
                    id="auth-email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-xl border py-2.5 pl-10 pr-4 text-sm outline-none transition-colors"
                    style={{
                      backgroundColor: 'var(--color-surface-2)',
                      borderColor: 'var(--color-border-subtle)',
                      color: 'var(--color-text-primary)',
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--color-accent)'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--color-border-subtle)'; }}
                  />
                </div>
              </div>

              {/* Password */}
              {mode !== 'forgot-password' && (
                <div>
                  <label
                    htmlFor="auth-password"
                    className="mb-1.5 block text-xs font-semibold uppercase tracking-wider"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    Password
                  </label>
                  <div className="relative">
                    <Lock
                      className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
                      style={{ color: 'var(--color-text-muted)' }}
                    />
                    <input
                      id="auth-password"
                      type={showPass ? 'text' : 'password'}
                      autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={mode === 'register' ? 'At least 6 characters' : '••••••••'}
                      className="w-full rounded-xl border py-2.5 pl-10 pr-10 text-sm outline-none transition-colors"
                      style={{
                        backgroundColor: 'var(--color-surface-2)',
                        borderColor: 'var(--color-border-subtle)',
                        color: 'var(--color-text-primary)',
                      }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--color-accent)'; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--color-border-subtle)'; }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass((p) => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-0.5 outline-none transition-opacity hover:opacity-70"
                      aria-label={showPass ? 'Hide password' : 'Show password'}
                      style={{ color: 'var(--color-text-muted)' }}
                    >
                      {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {/* Forgot Password Link */}
                  {mode === 'login' && (
                    <div className="mt-1.5 text-right">
                      <button
                        type="button"
                        onClick={() => switchMode('forgot-password')}
                        className="text-xs transition-colors hover:underline"
                        style={{ color: 'var(--color-text-muted)' }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-accent)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-text-muted)'; }}
                      >
                        Forgot password?
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Error message */}
              {error && (
                <p
                  className="rounded-lg px-3 py-2 text-xs font-medium"
                  style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.08)',
                    color: '#ef4444',
                    border: '1px solid rgba(239,68,68,0.2)',
                  }}
                  role="alert"
                >
                  {error}
                </p>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || !email.trim() || (mode !== 'forgot-password' && password.length < 6)}
                className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white transition-all active:scale-[0.98] disabled:opacity-50"
                style={{
                  backgroundColor: 'var(--color-accent)',
                  boxShadow: '0 2px 8px rgba(74,107,83,0.25)',
                }}
                onMouseEnter={(e) => { if (!loading) e.currentTarget.style.backgroundColor = 'var(--color-accent-hover)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-accent)'; }}
              >
                {mode === 'login' ? (
                  <><LogIn className="h-4 w-4" /> {loading ? 'Signing in…' : 'Sign In'}</>
                ) : mode === 'register' ? (
                  <><UserPlus className="h-4 w-4" /> {loading ? 'Creating account…' : 'Create Account'}</>
                ) : (
                  <><Mail className="h-4 w-4" /> {loading ? 'Sending link…' : 'Send Reset Link'}</>
                )}
              </button>
            </form>
          )}

          {/* Mode toggle */}
          <div
            className="mt-5 border-t pt-4 text-center text-xs"
            style={{ borderColor: 'var(--color-border-subtle)', color: 'var(--color-text-secondary)' }}
          >
            {mode === 'forgot-password' ? (
              <button
                type="button"
                onClick={() => switchMode('login')}
                className="flex items-center justify-center gap-1 mx-auto font-semibold transition-colors hover:underline"
                style={{ color: 'var(--color-accent)' }}
              >
                <ArrowLeft className="h-3 w-3" /> Back to Sign In
              </button>
            ) : mode === 'login' ? (
              <>
                Don&apos;t have an account?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('register')}
                  className="font-semibold transition-colors hover:underline"
                  style={{ color: 'var(--color-accent)' }}
                >
                  Create one
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="font-semibold transition-colors hover:underline"
                  style={{ color: 'var(--color-accent)' }}
                >
                  Sign in
                </button>
              </>
            )}
          </div>
        </div>

        {/* Footer note */}
        <p
          className="mt-4 text-center text-[11px]"
          style={{ color: 'var(--color-text-muted)' }}
        >
          Your data is stored securely in Firebase and never shared.
        </p>
      </div>
    </div>
  );
}
