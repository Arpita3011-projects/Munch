import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

/**
 * Primary navigation links shown to every user.
 */
const NAV_LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/menu', label: 'Menu' },
  { to: '/favorites', label: 'Favorites' },
];

/**
 * Cart icon used in desktop + mobile header.
 */
const CartIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3.75 3.75 0 00-3.75 3.75h15.75M5.25 4.5l1.5 5.25m0 0l1.25 4.5m-1.25-4.5h12.25a1.125 1.125 0 011.082 1.382l-1.5 5.25a1.125 1.125 0 01-1.082.868H7.5m0 0l-1.078 3.75" />
  </svg>
);

/**
 * App header with auth-aware navigation.
 *
 * Guests:  Home · Menu · Favorites            (Login) (Sign Up)
 * Users:   Home · Menu · Favorites · Orders   (Profile) (Logout)
 * Admins:  + Admin Dashboard link to /admin
 *
 * Mobile uses a hamburger menu that includes the same links plus the
 * auth actions (Login / Sign Up or Profile / Logout).
 */
export default function Header() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const headerRef = useRef(null);

  const isAdmin = user?.role === 'admin';
  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?';

  const closeMenu = () => setMobileOpen(false);

  // Close the mobile menu when clicking outside the header.
  useEffect(() => {
    if (!mobileOpen) return;
    const onPointerDown = (e) => {
      if (headerRef.current && !headerRef.current.contains(e.target)) {
        closeMenu();
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [mobileOpen]);

  // Close the mobile menu with the Escape key.
  useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') closeMenu();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [mobileOpen]);

  // Prevent body scroll while the mobile menu is open.
  useEffect(() => {
    if (!mobileOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [mobileOpen]);

  const handleLogout = () => {
    closeMenu();
    logout();
    navigate('/');
  };

  const navLinkClass = ({ isActive }) =>
    `inline-flex items-center text-sm font-medium px-3 py-2 rounded-full transition-colors min-h-[44px] ${
      isActive
        ? 'text-brand-pink font-semibold'
        : 'text-brand-charcoal/60 hover:text-brand-charcoal hover:bg-brand-charcoal/5'
    }`;

  const mobileLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-colors min-h-[44px] ${
      isActive
        ? 'bg-brand-pink/10 text-brand-pink font-semibold'
        : 'text-brand-charcoal/70 hover:bg-brand-charcoal/5 hover:text-brand-charcoal'
    }`;

  const mobileStaticLinkClass =
    'flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium text-brand-charcoal/70 hover:bg-brand-charcoal/5 hover:text-brand-charcoal transition-colors min-h-[44px]';

  // ----- Desktop auth actions (right aligned) -----
  const renderDesktopAuth = () => {
    if (loading) {
      return (
        <div className="flex items-center gap-2" aria-hidden="true">
          <span className="w-20 h-10 rounded-full bg-brand-charcoal/10 animate-pulse" />
          <span className="w-24 h-10 rounded-full bg-brand-charcoal/10 animate-pulse" />
        </div>
      );
    }

    if (isAuthenticated) {
      return (
        <div className="flex items-center gap-1.5">
          <Link
            to="/profile"
            className="inline-flex items-center gap-2 pl-1.5 pr-3.5 py-1.5 rounded-full bg-brand-charcoal/5 hover:bg-brand-charcoal/10 transition-colors min-h-[44px]"
            aria-label="Profile"
          >
            <span className="w-8 h-8 rounded-full bg-brand-pink text-white text-xs font-bold flex items-center justify-center">
              {initials}
            </span>
            <span className="text-sm font-semibold text-brand-charcoal max-w-[140px] truncate">
              {user?.name || 'Profile'}
            </span>
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold text-brand-charcoal/60 hover:text-error hover:bg-error/5 transition-colors min-h-[44px]"
            aria-label="Logout"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
              />
            </svg>
            Logout
          </button>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2">
        <Link
          to="/login"
          className="inline-flex items-center justify-center px-5 py-2.5 rounded-full border-2 border-brand-pink text-brand-pink text-sm font-semibold hover:bg-brand-pink hover:text-white transition-all min-h-[44px]"
        >
          Login
        </Link>
        <Link
          to="/register"
          className="inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-brand-pink text-white text-sm font-semibold hover:bg-brand-pink-dark transition-all min-h-[44px] shadow-sm"
        >
          Sign Up
        </Link>
      </div>
    );
  };

  // ----- Mobile auth actions (inside hamburger menu) -----
  const renderMobileAuth = () => {
    if (loading) {
      return (
        <div className="space-y-2" aria-hidden="true">
          <span className="block h-11 rounded-2xl bg-brand-charcoal/10 animate-pulse" />
          <span className="block h-11 rounded-2xl bg-brand-charcoal/10 animate-pulse" />
        </div>
      );
    }

    if (isAuthenticated) {
      return (
        <div className="pt-3 border-t border-brand-charcoal/5 mt-3 space-y-1">
          <p className="px-4 pt-2 pb-1 text-[10px] font-bold text-brand-charcoal/30 uppercase tracking-widest">
            Account
          </p>
          <Link to="/profile" onClick={closeMenu} className={mobileStaticLinkClass}>
            <span className="w-8 h-8 rounded-full bg-brand-pink text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
              {initials}
            </span>
            <span className="truncate">{user?.name || 'Profile'}</span>
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium text-error/80 hover:bg-error/5 transition-colors min-h-[44px]"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
              />
            </svg>
            Logout
          </button>
        </div>
      );
    }

    return (
      <div className="pt-3 border-t border-brand-charcoal/5 mt-3 space-y-2">
        <Link
          to="/login"
          onClick={closeMenu}
          className="flex items-center justify-center w-full px-5 py-3 rounded-full border-2 border-brand-pink text-brand-pink text-sm font-semibold hover:bg-brand-pink hover:text-white transition-all min-h-[44px]"
        >
          Login
        </Link>
        <Link
          to="/register"
          onClick={closeMenu}
          className="flex items-center justify-center w-full px-5 py-3 rounded-full bg-brand-pink text-white text-sm font-semibold hover:bg-brand-pink-dark transition-all min-h-[44px]"
        >
          Sign Up
        </Link>
      </div>
    );
  };

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-40 bg-brand-cream/95 backdrop-blur-sm border-b border-brand-charcoal/5"
    >
      <div className="w-full px-4 md:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" onClick={closeMenu} className="flex items-center gap-2 group shrink-0" aria-label="Munch home">
          <div className="w-8 h-8 rounded-full bg-brand-pink flex items-center justify-center">
            <span className="text-white font-display font-bold text-sm">M</span>
          </div>
          <span className="font-display font-bold text-xl text-brand-charcoal group-hover:text-brand-pink transition-colors">
            Munch
          </span>
        </Link>

        {/* Desktop primary nav */}
        <nav className="hidden md:flex items-center gap-1" aria-label="Primary navigation">
          {NAV_LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className={navLinkClass}>
              {link.label}
            </NavLink>
          ))}
          {isAuthenticated && (
            <NavLink to="/orders" className={navLinkClass}>
              Orders
            </NavLink>
          )}
          {isAuthenticated && isAdmin && (
            <NavLink to="/admin" className={navLinkClass}>
              Admin Dashboard
            </NavLink>
          )}
        </nav>

        {/* Desktop right actions */}
        <div className="hidden md:flex items-center gap-1.5">
          <Link
            to="/cart"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-charcoal/60 hover:text-brand-charcoal transition-colors px-3 py-2 rounded-full min-h-[44px]"
          >
            <CartIcon />
            Cart
          </Link>
          {renderDesktopAuth()}
        </div>

        {/* Mobile right actions */}
        <div className="flex md:hidden items-center gap-1">
          <Link
            to="/cart"
            aria-label="Cart"
            className="p-2 min-h-[44px] flex items-center text-brand-charcoal/60 hover:text-brand-charcoal transition-colors"
          >
            <CartIcon className="w-6 h-6" />
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav-menu"
            className="p-2 min-h-[44px] flex items-center text-brand-charcoal/70 hover:text-brand-charcoal transition-colors"
          >
            {mobileOpen ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile hamburger menu */}
      {mobileOpen && (
        <div
          id="mobile-nav-menu"
          className="md:hidden bg-brand-cream border-t border-brand-charcoal/5 max-h-[calc(100vh-3.5rem)] overflow-y-auto pb-safe"
        >
          <div className="max-w-5xl mx-auto px-4 py-4">
            <nav aria-label="Mobile navigation" className="space-y-1">
              {NAV_LINKS.map((link) => (
                <NavLink key={link.to} to={link.to} end={link.end} onClick={closeMenu} className={mobileLinkClass}>
                  {link.label}
                </NavLink>
              ))}
              <Link to="/cart" onClick={closeMenu} className={mobileStaticLinkClass}>
                <CartIcon className="w-5 h-5 text-brand-charcoal/40" />
                Cart
              </Link>
              {isAuthenticated && (
                <NavLink to="/orders" onClick={closeMenu} className={mobileLinkClass}>
                  Orders
                </NavLink>
              )}
              {isAuthenticated && isAdmin && (
                <NavLink to="/admin" onClick={closeMenu} className={mobileLinkClass}>
                  Admin Dashboard
                </NavLink>
              )}
            </nav>
            {renderMobileAuth()}
          </div>
        </div>
      )}
    </header>
  );
}

