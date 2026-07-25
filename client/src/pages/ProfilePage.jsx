import { Link } from 'react-router-dom';
import PageContainer from '../components/layout/PageContainer';
import Button from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';
import Skeleton from '../components/ui/Skeleton';

export default function ProfilePage() {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return (
      <PageContainer>
        <h1 className="text-2xl font-display font-bold text-brand-charcoal mb-6">Profile</h1>
        <Skeleton className="h-16 w-full mb-4 rounded-2xl" />
        <Skeleton className="h-24 w-full mb-4 rounded-2xl" />
        <Skeleton className="h-24 w-full rounded-2xl" />
      </PageContainer>
    );
  }

  if (!user) {
    return (
      <PageContainer>
        <h1 className="text-2xl font-display font-bold text-brand-charcoal mb-6">Profile</h1>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-brand-pink/10 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-brand-pink" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          </div>
          <p className="text-brand-charcoal/60 mb-4">Sign in to view your profile</p>
          <Link to="/login" className="inline-flex items-center justify-center px-6 py-2.5 bg-brand-pink text-white rounded-full font-medium text-sm hover:bg-brand-pink-dark transition-colors min-h-[44px]">Sign In</Link>
        </div>
      </PageContainer>
    );
  }

  const initials = user.name ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) : '?';

  return (
    <PageContainer>
      <h1 className="text-2xl font-display font-bold text-brand-charcoal mb-6">Profile</h1>
      <div className="space-y-4">
        <div className="bg-white rounded-2xl p-6 shadow-warm">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-brand-pink flex items-center justify-center text-white font-display font-bold text-lg">{initials}</div>
            <div className="flex-1 min-w-0">
              <p className="font-display font-semibold text-brand-charcoal truncate">{user.name}</p>
              <p className="text-sm text-brand-charcoal/50 truncate">{user.email}</p>
              {user.authProvider === 'google' && (
                <span className="inline-flex items-center gap-1 text-xs text-brand-charcoal/40 mt-0.5">
                  <svg className="w-3 h-3" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                  </svg>
                  Google
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-warm opacity-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-charcoal/5 flex items-center justify-center">
              <svg className="w-5 h-5 text-brand-charcoal/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
            </div>
            <div>
              <h2 className="font-display font-semibold text-brand-charcoal text-sm">Saved Addresses</h2>
              <p className="text-xs text-brand-charcoal/50">Coming soon</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-warm opacity-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-charcoal/5 flex items-center justify-center">
              <svg className="w-5 h-5 text-brand-charcoal/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
              </svg>
            </div>
            <div>
              <h2 className="font-display font-semibold text-brand-charcoal text-sm">Order History</h2>
              <p className="text-xs text-brand-charcoal/50">Coming soon</p>
            </div>
          </div>
        </div>
        <div className="pt-4">
          <Button variant="secondary" className="w-full" onClick={logout}>Sign Out</Button>
        </div>
      </div>
    </PageContainer>
  );
}
