import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
  activePage: string;
  setActivePage: (page: string) => void;
  onLogout: () => void;
  userRole: 'admin' | 'superadmin';
}

const Layout: React.FC<LayoutProps> = ({ children, activePage, setActivePage, onLogout, userRole }) => {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activePage={activePage} setActivePage={setActivePage} userRole={userRole} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar title="" onLogout={onLogout} customFetch={function (): Promise<Response> {
          throw new Error('Function not implemented.');
        } } />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
