import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import PageContainer from '../components/layout/PageContainer';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useAuth } from '../hooks/useAuth';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginWithGoogle, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const from = location.state?.from || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    clearError();
    setIsLoading(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      const message = err.response?.data?.message || err.response?.data?.errors?.[0]?.message || 'Something went wrong. Please try again.';
      setFormError(message);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Google authentication.
   *
   * MVP implementation: Sends a mock JSON payload as the idToken.
   * In production, use the Google Identity Services library to obtain a
   * real credential (ID token) and send it here. The server will verify it
   * using google-auth-library (see server/src/services/authService.js).
   *
   * Example production flow:
   *   import { googleLogout, useGoogleLogin } from '@react-oauth/google';
   *   // Obtain credential then:
   *   await loginWithGoogle({ idToken: credential, email, name });
   */
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setFormError('');
    clearError();
    try {
      const mockPayload = {
        sub: 'google_' + Date.now(),
        email: (email || 'user') + '@gmail.com',
        name: email ? email.split('@')[0] : 'Google User',
      };
      const mockGoogleData = {
        idToken: JSON.stringify(mockPayload),
        email: mockPayload.email,
        name: mockPayload.name,
      };
      await loginWithGoogle(mockGoogleData);
      navigate(from, { replace: true });
    } catch (err) {
      const message = err.response?.data?.message || 'Google login failed. Please try again.';
      setFormError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const showError = formError || error;

  return (
    <PageContainer>
      <div className="max-w-sm mx-auto pt-8">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-full bg-brand-pink flex items-center justify-center mx-auto mb-3">
            <span className="text-white font-display font-bold text-lg">M</span>
          </div>
          <h1 className="text-2xl font-display font-bold text-brand-charcoal">Welcome back</h1>
          <p className="text-brand-charcoal/60 text-sm mt-1">Sign in to your Munch account</p>
        </div>
        {showError ? (
          <div className="bg-error/10 text-error text-sm px-4 py-3 rounded-xl mb-4" role="alert">{showError}</div>
        ) : null}
        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          <Input label="Email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
          <Input label="Password" type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
          <Button type="submit" className="w-full" loading={isLoading}>Sign In</Button>
        </form>
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-brand-charcoal/10" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-brand-cream px-2 text-brand-charcoal/40">or continue with</span>
          </div>
        </div>
        <button type="button" onClick={handleGoogleLogin} disabled={isLoading} className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-brand-charcoal/20 rounded-full text-sm font-medium text-brand-charcoal hover:bg-brand-charcoal/5 transition-colors min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed">
          <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Continue with Google
        </button>
        <p className="text-center text-sm text-brand-charcoal/50 mt-6">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="text-brand-pink font-medium hover:underline">Sign up</Link>
        </p>
      </div>
    </PageContainer>
  );
}
