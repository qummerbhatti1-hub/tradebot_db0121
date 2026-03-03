import React, { useState, useEffect } from 'react';
import { Bot, Cpu, Zap, Activity, Shield, Terminal } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const BotPage = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const [activeTrades, setActiveTrades] = useState<any[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const pairs = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'BNB/USDT'];
      const pair = pairs[Math.floor(Math.random() * pairs.length)];
      const type = Math.random() > 0.5 ? 'BUY' : 'SELL';
      const price = (Math.random() * 50000 + 2000).toFixed(2);
      const profit = (Math.random() * 2 - 0.5).toFixed(2);
      
      const newLog = `[${new Date().toLocaleTimeString()}] ${type} ${pair} executed at $${price} (Profit: ${profit}%)`;
      setLogs(prev => [newLog, ...prev].slice(0, 10));

      const newTrade = { id: Date.now(), pair, type, price, profit, time: new Date().toLocaleTimeString() };
      setActiveTrades(prev => [newTrade, ...prev].slice(0, 5));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display">AI Trading Engine</h1>
          <p className="text-zinc-500 mt-1">Real-time monitoring of our high-frequency trading bot.</p>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-bold text-emerald-500 uppercase tracking-widest">System Online</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Status */}
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { label: 'CPU Usage', value: '42%', icon: Cpu, color: 'text-blue-400' },
              { label: 'Latency', value: '14ms', icon: Zap, color: 'text-gold' },
              { label: 'Uptime', value: '99.99%', icon: Shield, color: 'text-emerald-400' },
            ].map((stat) => (
              <div key={stat.label} className="glass-card p-6">
                <div className="flex items-center gap-3 mb-4">
                  <stat.icon className={stat.color} size={20} />
                  <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{stat.label}</span>
                </div>
                <h3 className="text-2xl font-bold">{stat.value}</h3>
              </div>
            ))}
          </div>

          {/* Live Trades */}
          <div className="glass-card p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Activity className="text-gold" size={24} />
                Live Execution
              </h3>
            </div>
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {activeTrades.map((trade) => (
                  <motion.div
                    key={trade.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase ${trade.type === 'BUY' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                        {trade.type}
                      </div>
                      <div>
                        <p className="font-bold">{trade.pair}</p>
                        <p className="text-xs text-zinc-500">{trade.time}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">${trade.price}</p>
                      <p className={`text-xs font-bold ${parseFloat(trade.profit) >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                        {parseFloat(trade.profit) >= 0 ? '+' : ''}{trade.profit}%
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Terminal Logs */}
        <div className="glass-card p-6 bg-zinc-950 border-white/10 flex flex-col h-[600px]">
          <div className="flex items-center gap-2 mb-4 border-b border-white/10 pb-4">
            <Terminal className="text-zinc-500" size={18} />
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">System Logs</span>
          </div>
          <div className="flex-1 overflow-y-auto space-y-2 font-mono text-[10px] text-zinc-400">
            {logs.map((log, i) => (
              <div key={i} className="hover:text-gold transition-colors">
                <span className="text-zinc-600 mr-2">{'>'}</span>
                {log}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BotPage;
