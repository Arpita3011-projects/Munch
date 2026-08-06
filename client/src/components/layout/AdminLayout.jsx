import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const adminNavItems = [
  {
    to: '/admin',
    label: 'Dashboard',
    end: true,
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
      </svg>
    ),
  },
  {
    to: '/admin/menu',
    label: 'Menu',
    end: false,
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 12l4.179 2.25m0 0L12 16.5l5.571-2.25m-11.142 0L12 16.5m0 0l5.571-2.25m0-4.5L21.75 12l-4.179 2.25m0-4.5L12 4.5l-5.571 3" />
      </svg>
    ),
  },
  {
    to: '/admin/orders',
    label: 'Orders',
    end: false,
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
      </svg>
    ),
  },
];

function AdminNavLink({ item, onClick }) {
  return (
    <NavLink
      to={item.to}
      end={item.end}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-2.5 px-4 py-2.5 rounded-full text-sm font-semibold transition-colors min-h-[44px] ${
          isActive
            ? 'bg-brand-pink text-white shadow-sm'
            : 'text-brand-charcoal/60 hover:text-brand-charcoal hover:bg-brand-charcoal/5'
        }`
      }
    >
      {item.icon}
      {item.label}
    </NavLink>
  );
}

/**
 * Admin shell — sticky sidebar on desktop, horizontal nav on tablet/mobile.
 * Only rendered after AdminRoute has confirmed the user has the admin role.
 */
export default function AdminLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-brand-cream">
      {/* Sidebar / nav */}
      <aside className="md:w-60 md:min-h-screen bg-white border-b md:border-b-0 md:border-r border-brand-charcoal/5 shrink-0 sticky top-0 z-30">
        <div className="flex md:flex-col items-center md:items-stretch justify-between gap-2 px-4 py-3 md:p-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-brand-pink flex items-center justify-center">
              <span className="text-white font-display font-bold text-sm">M</span>
            </div>
            <div className="hidden md:block">
              <p className="font-display font-bold text-brand-charcoal leading-none">Munch Admin</p>
              <p className="text-[11px] text-brand-charcoal/40 mt-1">Order management</p>
            </div>
          </div>

          <nav className="flex md:flex-col gap-1.5 overflow-x-auto no-scrollbar" aria-label="Admin navigation">
            {adminNavItems.map((item) => (
              <AdminNavLink key={item.to} item={item} />
            ))}
          </nav>

          <div className="hidden md:flex items-center justify-between gap-2 border-t border-brand-charcoal/5 pt-4">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-brand-charcoal truncate">{user?.name}</p>
              <p className="text-[11px] text-brand-pink font-medium uppercase tracking-wider">Admin</p>
            </div>
            <button
              type="button"
              onClick={logout}
              className="p-2 rounded-full text-brand-charcoal/40 hover:text-brand-charcoal hover:bg-brand-charcoal/5 transition-colors min-h-[44px] flex items-center"
              aria-label="Log out"
              title="Log out"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 px-4 py-6 md:px-8 md:py-8 max-w-6xl w-full">
        <Outlet />
      </main>
    </div>
  );
}

