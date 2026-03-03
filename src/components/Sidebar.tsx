import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  TrendingUp, 
  Wallet, 
  History, 
  Users, 
  LogOut, 
  ShieldCheck,
  Menu,
  X,
  Bot,
  User
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const Sidebar = ({ isOpen, toggle }: { isOpen: boolean; toggle: () => void }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 1024 : false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Invest', path: '/invest', icon: TrendingUp },
    { name: 'Wallet', path: '/wallet', icon: Wallet },
    { name: 'History', path: '/history', icon: History },
    { name: 'Referrals', path: '/referrals', icon: Users },
    { name: 'AI Bot', path: '/bot', icon: Bot },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  if (user?.role === 'admin') {
    menuItems.push({ name: 'Admin Panel', path: '/admin', icon: ShieldCheck });
  }

  return (
    <>
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isOpen && isMobile && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggle}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ x: (isOpen || !isMobile) ? 0 : -300 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className={`fixed top-0 left-0 h-full w-64 bg-zinc-950 border-r border-white/5 z-50`}
      >
        <div className="p-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gold-gradient flex items-center justify-center">
              <Bot className="text-black w-5 h-5" />
            </div>
            <span className="text-xl font-bold gold-text-gradient font-display">AI TRADE</span>
          </Link>
          <button onClick={toggle} className="lg:hidden text-zinc-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <nav className="mt-6 px-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => window.innerWidth < 1024 && toggle()}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive 
                    ? 'bg-gold/10 text-gold border border-gold/20' 
                    : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-8 left-0 w-full px-4">
          <button 
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-400 hover:bg-red-400/10 transition-all"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;
