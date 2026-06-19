import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Home, History, User, Settings, Ticket } from 'lucide-react';

const Layout = () => {
  const navItems = [
    { name: 'Home', path: '/', icon: <Home size={24} /> },
    { name: 'History', path: '/history', icon: <History size={24} /> },
    { name: 'Profile', path: '/profile', icon: <User size={24} /> },
    { name: 'Settings', path: '/settings', icon: <Settings size={24} /> },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Top Navbar (Desktop Only) */}
      <nav className="hidden md:flex items-center justify-between px-8 py-4 bg-dark-navy text-white shadow-md">
        <div className="flex items-center gap-2">
          <Ticket className="text-light-navy" size={32} />
          <span className="font-mono text-3xl font-bold tracking-widest text-white">REFP</span>
        </div>
        <div className="flex gap-8">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `text-sm font-semibold transition-colors duration-200 hover:text-light-navy ${
                  isActive ? 'text-light-navy border-b-2 border-light-navy pb-1' : 'text-slate-300'
                }`
              }
            >
              {item.name}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 pb-20 md:pb-0">
        <Outlet />
      </main>

      {/* Bottom Navbar (Mobile Only) */}
      <nav className="md:hidden fixed bottom-0 w-full bg-white border-t border-slate-200 flex justify-around items-center py-3 z-50 pb-safe">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 transition-colors duration-200 ${
                isActive ? 'text-light-navy' : 'text-slate-500 hover:text-slate-800'
              }`
            }
          >
            {item.icon}
            <span className="text-[10px] font-medium">{item.name}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Layout;
