import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Wallet, TrendingUp, PieChart, ArrowUpRight, ArrowDownRight, Bot, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Mon', value: 400 },
  { name: 'Tue', value: 300 },
  { name: 'Wed', value: 600 },
  { name: 'Thu', value: 800 },
  { name: 'Fri', value: 500 },
  { name: 'Sat', value: 900 },
  { name: 'Sun', value: 1100 },
];

const Dashboard = () => {
  const { user, token } = useAuth();
  const [stats, setStats] = useState({
    activeInvestment: 0,
    totalProfit: 0,
    referralBonus: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      const res = await fetch('/api/user/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    };
    fetchStats();
  }, [token]);

  const cards = [
    { title: 'Total Balance', value: `$${user?.balance.toFixed(2)}`, icon: Wallet, color: 'text-gold' },
    { title: 'Active Investment', value: `$${stats.activeInvestment.toFixed(2)}`, icon: TrendingUp, color: 'text-blue-400' },
    { title: 'Total Profit', value: `$${stats.totalProfit.toFixed(2)}`, icon: PieChart, color: 'text-emerald-400' },
    { title: 'Referral Bonus', value: `$${stats.referralBonus.toFixed(2)}`, icon: Zap, color: 'text-purple-400' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display">Welcome back, {user?.name}!</h1>
          <p className="text-zinc-500 mt-1">Here's what's happening with your investments today.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-6 py-2.5 rounded-xl bg-gold text-black font-bold hover:bg-gold-light transition-all flex items-center gap-2">
            <ArrowUpRight size={20} /> Deposit
          </button>
          <button className="px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all flex items-center gap-2">
            <ArrowDownRight size={20} /> Withdraw
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl bg-white/5 ${card.color}`}>
                <card.icon size={24} />
              </div>
            </div>
            <p className="text-zinc-400 text-sm font-medium">{card.title}</p>
            <h3 className="text-2xl font-bold mt-1">{card.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart */}
        <div className="lg:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold">Profit Analytics</h3>
            <select className="bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-sm outline-none">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="name" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid #ffffff10', borderRadius: '12px' }}
                  itemStyle={{ color: '#D4AF37' }}
                />
                <Area type="monotone" dataKey="value" stroke="#D4AF37" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Bot Status */}
        <div className="glass-card p-6 flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full gold-gradient flex items-center justify-center">
              <Bot className="text-black" />
            </div>
            <div>
              <h3 className="font-bold">AI Trading Bot</h3>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                <span className="text-xs text-emerald-500 font-medium uppercase tracking-wider">Active & Trading</span>
              </div>
            </div>
          </div>

          <div className="space-y-4 flex-1">
            <div className="p-4 rounded-xl bg-white/5 border border-white/5">
              <p className="text-xs text-zinc-500 uppercase font-bold tracking-widest mb-1">Current Strategy</p>
              <p className="text-sm font-medium">Scalping High-Frequency</p>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/5">
              <p className="text-xs text-zinc-500 uppercase font-bold tracking-widest mb-1">Success Rate</p>
              <p className="text-sm font-medium">94.8%</p>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/5">
              <p className="text-xs text-zinc-500 uppercase font-bold tracking-widest mb-1">Total Trades Today</p>
              <p className="text-sm font-medium">1,248 Trades</p>
            </div>
          </div>

          <button className="mt-6 w-full py-3 rounded-xl border border-gold/30 text-gold font-bold hover:bg-gold/5 transition-all">
            View Live Trades
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
