import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Users, Wallet, ArrowUpRight, ArrowDownRight, TrendingUp, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

const AdminDashboard = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch('/api/admin/stats', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      if (!res.ok) throw new Error('Failed to fetch admin stats');
      return res.json();
    })
    .then(data => {
      setStats(data);
      setLoading(false);
    })
    .catch(err => {
      console.error(err);
      setError(err.message);
      setLoading(false);
    });
  }, [token]);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (error) return (
    <div className="glass-card p-8 text-center">
      <p className="text-red-400 font-medium">{error}</p>
      <button 
        onClick={() => window.location.reload()}
        className="mt-4 px-6 py-2 bg-gold text-black font-bold rounded-xl"
      >
        Retry
      </button>
    </div>
  );

  if (!stats) return null;

  const cards = [
    { title: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-blue-400' },
    { title: 'Total Deposits', value: `$${stats.totalDeposits.toFixed(2)}`, icon: ArrowUpRight, color: 'text-emerald-400' },
    { title: 'Total Withdrawals', value: `$${stats.totalWithdrawals.toFixed(2)}`, icon: ArrowDownRight, color: 'text-red-400' },
    { title: 'Active Investments', value: `$${stats.activeInvestments.toFixed(2)}`, icon: TrendingUp, color: 'text-gold' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-gold/10 text-gold flex items-center justify-center">
          <ShieldCheck size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-bold font-display">Admin Overview</h1>
          <p className="text-zinc-500 mt-1">Manage the platform and monitor performance.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-6"
          >
            <div className={`p-3 rounded-xl bg-white/5 w-fit mb-4 ${card.color}`}>
              <card.icon size={24} />
            </div>
            <p className="text-zinc-400 text-sm font-medium">{card.title}</p>
            <h3 className="text-2xl font-bold mt-1">{card.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-card p-8">
          <h3 className="text-xl font-bold mb-6">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <Link to="/admin/users" className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-gold/50 transition-all text-center block">
              <Users className="mx-auto mb-3 text-gold" size={24} />
              <span className="font-bold text-sm">Manage Users</span>
            </Link>
            <Link to="/admin/deposits" className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-gold/50 transition-all text-center block">
              <ArrowUpRight className="mx-auto mb-3 text-emerald-500" size={24} />
              <span className="font-bold text-sm">Review Deposits</span>
            </Link>
            <Link to="/admin/withdrawals" className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-gold/50 transition-all text-center block">
              <ArrowDownRight className="mx-auto mb-3 text-red-500" size={24} />
              <span className="font-bold text-sm">Review Withdrawals</span>
            </Link>
            <Link to="/admin/packages" className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-gold/50 transition-all text-center block">
              <TrendingUp className="mx-auto mb-3 text-blue-400" size={24} />
              <span className="font-bold text-sm">Edit Packages</span>
            </Link>
          </div>
        </div>

        <div className="glass-card p-8">
          <h3 className="text-xl font-bold mb-6">System Health</h3>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Database Status</span>
              <span className="text-emerald-500 font-bold">Connected</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">API Latency</span>
              <span className="text-emerald-500 font-bold">12ms</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Server Load</span>
              <span className="text-gold font-bold">Low</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Pending Actions</span>
              <span className="text-red-400 font-bold">3 Requests</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
