import { Outlet } from 'react-router-dom';
import { TopNav } from './TopNav';
import { Sidebar } from './Sidebar';
import { MainContent } from './MainContent';
import { Footer } from './Footer';
import { useUIStore } from '@/stores/useUIStore';

export function AppLayout() {
  const sidebarCollapsed = useUIStore(s => s.sidebarCollapsed);
  return (
    <div className="flex h-screen flex-col bg-ice text-navy">
      <TopNav />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <MainContent collapsed={sidebarCollapsed}>
          <Outlet />
        </MainContent>
      </div>
      <Footer />
    </div>
  );
}
