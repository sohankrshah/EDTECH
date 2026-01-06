
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: 'fa-chart-line' },
    { name: 'Search Universities', path: '/search', icon: 'fa-university' },
    { name: 'AI Counselor', path: '/counselor', icon: 'fa-robot' },
    { name: 'My Applications', path: '/applications', icon: 'fa-file-invoice' },
    { name: 'Documents', path: '/documents', icon: 'fa-folder-open' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-indigo-900 text-white shadow-xl h-screen sticky top-0">
        <div className="p-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <i className="fas fa-graduation-cap text-indigo-400"></i>
            EduPath
          </h1>
        </div>
        <nav className="flex-1 px-4 py-4 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive(item.path)
                  ? 'bg-indigo-700 text-white'
                  : 'text-indigo-200 hover:bg-indigo-800 hover:text-white'
              }`}
            >
              <i className={`fas ${item.icon} w-5 text-center`}></i>
              {item.name}
            </Link>
          ))}
        </nav>
        <div className="p-6 border-t border-indigo-800">
          <div className="flex items-center gap-3">
            <img src="https://picsum.photos/seed/user1/40/40" alt="Profile" className="w-10 h-10 rounded-full border-2 border-indigo-400" />
            <div className="text-sm">
              <p className="font-semibold">Alex Chen</p>
              <p className="text-indigo-300">Student</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Nav */}
      <header className="md:hidden bg-indigo-900 text-white p-4 flex justify-between items-center sticky top-0 z-50">
        <h1 className="text-xl font-bold">EduPath</h1>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          <i className={`fas ${isMobileMenuOpen ? 'fa-times' : 'fa-bars'} text-xl`}></i>
        </button>
      </header>

      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-indigo-900 text-white z-40 flex flex-col pt-20 px-6">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className="py-4 border-b border-indigo-800 text-lg flex items-center gap-4"
            >
              <i className={`fas ${item.icon}`}></i>
              {item.name}
            </Link>
          ))}
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        <header className="hidden md:flex items-center justify-between px-8 py-4 bg-white border-b border-slate-200 sticky top-0 z-30">
          <h2 className="text-xl font-semibold text-slate-700">
            {menuItems.find(i => isActive(i.path))?.name || 'Home'}
          </h2>
          <div className="flex items-center gap-4">
            <button className="text-slate-400 hover:text-indigo-600 transition-colors">
              <i className="fas fa-bell text-xl"></i>
            </button>
            <button className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg font-medium hover:bg-indigo-100 transition-colors">
              Help Center
            </button>
          </div>
        </header>
        <div className="p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
