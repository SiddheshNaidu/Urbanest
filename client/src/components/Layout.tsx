
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';
import { BottomNav } from './BottomNav';
import { Outlet } from 'react-router-dom';

export const Layout = () => {
  return (
    <div className="flex min-h-screen bg-base">
      <Sidebar />
      <main className="main-content md:ml-[260px] flex-1 flex flex-col min-h-screen">
        <TopNav />
        <div className="p-4 md:p-8 pb-24 md:pb-8 max-w-7xl">
          <Outlet />
        </div>
      </main>
      <BottomNav />
    </div>
  );
};
