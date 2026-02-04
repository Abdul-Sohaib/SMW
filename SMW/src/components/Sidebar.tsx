import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Users, Clipboard, UserCheck, Image } from 'lucide-react';

interface SidebarProps {
  activePage: string;
  setActivePage: (page: string) => void;
  userRole: 'admin' | 'superadmin' | null;
}

const Sidebar: React.FC<SidebarProps> = ({ setActivePage, userRole }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/dashboard' },
    { id: 'tasks', label: 'Tasks', icon: Clipboard, path: '/tasks' },
    { id: 'warriors', label: 'Warriors', icon: Users, path: '/warriors' },
    { id: 'userVerification', label: 'User Verification', icon: UserCheck, path: '/user-verification' },
    // { id: 'leaderboard', label: 'Leaderboard', icon: Award, path: '/leaderboard' },
    // { id: 'analytics', label: 'Analytics', icon: BarChart3, path: '/analytics' },
    // { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
  ];

  const superAdminNavItems = [
    { id: 'overview', label: 'Creative', icon: Image, path: '/overview' },
  ];

  return (
    <aside className="w-20 md:w-64 bg-white border-r border-gray-100 flex flex-col h-full z-20">
      <div className="h-16 flex items-center justify-center md:justify-start px-6 border-b border-gray-100">
        <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center">
          <Users size={20} className="text-white" />
        </div>
        <h1 className="ml-3 text-xl font-semibold text-gray-900 hidden md:block">Dgin Admin</h1>
      </div>

      <nav className="flex-1 px-3 py-6 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.id}
            to={item.path}
            className={({ isActive }) =>
              `w-full flex items-center px-3 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-blue-50 text-blue-500'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
            onClick={() => setActivePage(item.id)}
          >
            <item.icon size={22} className="flex-shrink-0" />
            <span className="ml-3 font-medium hidden md:block">{item.label}</span>
          </NavLink>
        ))}
        {userRole === 'superadmin' &&
          superAdminNavItems.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive }) =>
                `w-full flex items-center px-3 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-50 text-blue-500'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
              onClick={() => setActivePage(item.id)}
            >
              <item.icon size={22} className="flex-shrink-0" />
              <span className="ml-3 font-medium hidden md:block">{item.label}</span>
            </NavLink>
          ))}
      </nav>

      <div className="p-4 hidden md:block">
        <div className="p-4 bg-blue-50 rounded-xl">
          <h3 className="font-medium text-blue-900 mb-1">Need Help?</h3>
          <p className="text-sm text-blue-700 mb-3">Reach out to support for assistance with your admin panel.</p>
          <button className="btn btn-primary text-sm w-full">Contact Support</button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;