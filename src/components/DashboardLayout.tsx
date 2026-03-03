import React, { useState } from 'react';
import { Outlet, Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';
import { Menu, Bell, User } from 'lucide-react';

const DashboardLayout = () => {
  const { user, loading } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (loading) return (
    <div className="h-screen w-full flex items-center justify-center bg-black">
      <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!user) return <Navigate to="/login" />;

  return (
    <div className="min-h-screen bg-black flex">
      <Sidebar isOpen={isSidebarOpen} toggle={() => setIsSidebarOpen(!isSidebarOpen)} />
      
      <main className="flex-1 lg:ml-64 flex flex-col">
        {/* Top Navbar */}
        <header className="h-16 border-b border-white/5 bg-black/50 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-30">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden p-2 hover:bg-white/5 rounded-lg text-zinc-400"
          >
            <Menu size={24} />
          </button>

          <div className="flex-1" />

          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-white/5 rounded-lg text-zinc-400 relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-gold rounded-full border-2 border-black"></span>
            </button>
            <Link to="/profile" className="flex items-center gap-3 pl-4 border-l border-white/10 hover:opacity-80 transition-opacity">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-white">{user.name}</p>
                <p className="text-xs text-zinc-500 capitalize">{user.role}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center text-gold">
                <User size={20} />
              </div>
            </Link>
          </div>
        </header>

        {/* Content */}
        <div className="p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
