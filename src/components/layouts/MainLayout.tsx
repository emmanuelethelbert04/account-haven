import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export function MainLayout() {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className={isHomePage ? 'flex-1' : 'flex-1 pt-14 sm:pt-16'}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
