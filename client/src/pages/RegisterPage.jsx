import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageContainer from '../components/layout/PageContainer';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useAuth } from '../hooks/useAuth';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, error, clearError } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    clearError();
    setIsLoading(true);
    try {
      await register(name, email, password);
      navigate('/', { replace: true });
    } catch (err) {
      const message = err.response?.data?.message || err.response?.data?.errors?.[0]?.message || 'Something went wrong. Please try again.';
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
          <h1 className="text-2xl font-display font-bold text-brand-charcoal">Create account</h1>
          <p className="text-brand-charcoal/60 text-sm mt-1">Join Munch and start ordering</p>
        </div>
        {showError ? (
          <div className="bg-error/10 text-error text-sm px-4 py-3 rounded-xl mb-4" role="alert">{showError}</div>
        ) : null}
        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          <Input label="Full Name" type="text" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} required autoComplete="name" />
          <Input label="Email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
          <Input label="Password" type="password" placeholder="Min. 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} autoComplete="new-password" />
          <Button type="submit" className="w-full" loading={isLoading}>Create Account</Button>
        </form>
        <p className="text-center text-sm text-brand-charcoal/50 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-pink font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </PageContainer>
  );
}
