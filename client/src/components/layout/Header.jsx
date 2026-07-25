import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <header className="sticky top-0 z-30 bg-brand-cream/95 backdrop-blur-sm border-b border-brand-charcoal/5">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group" aria-label="Munch home">
          <div className="w-8 h-8 rounded-full bg-brand-pink flex items-center justify-center">
            <span className="text-white font-display font-bold text-sm">M</span>
          </div>
          <span className="font-display font-bold text-xl text-brand-charcoal group-hover:text-brand-pink transition-colors">
            Munch
          </span>
        </Link>

        {/* Desktop Right Actions */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            to="/orders"
            className="text-sm font-medium text-brand-charcoal/60 hover:text-brand-charcoal transition-colors px-3 py-2 min-h-[44px] flex items-center"
          >
            Orders
          </Link>
          <Link
            to="/cart"
            className="text-sm font-medium text-brand-charcoal/60 hover:text-brand-charcoal transition-colors px-3 py-2 min-h-[44px] flex items-center gap-1.5"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3.75 3.75 0 00-3.75 3.75h15.75M5.25 4.5l1.5 5.25m0 0l1.25 4.5m-1.25-4.5h12.25a1.125 1.125 0 011.082 1.382l-1.5 5.25a1.125 1.125 0 01-1.082.868H7.5m0 0l-1.078 3.75" />
            </svg>
            Cart
          </Link>
          <Link
            to="/profile"
            className="flex items-center justify-center w-9 h-9 rounded-full bg-brand-pink text-white text-sm font-semibold"
            aria-label="Profile"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          </Link>
        </div>
      </div>
    </header>
  );
}

