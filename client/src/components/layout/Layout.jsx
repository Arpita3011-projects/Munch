import { Outlet } from 'react-router-dom';
import Header from './Header';
import BottomNav from './BottomNav';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pb-16 md:pb-0 max-w-5xl w-full mx-auto">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}

