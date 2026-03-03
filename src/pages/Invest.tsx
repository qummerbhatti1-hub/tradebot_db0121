import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Zap, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface Package {
  id: number;
  name: string;
  min_amount: number;
  duration_days: number;
  daily_profit_percent: number;
}

const Invest = () => {
  const { token, refreshUser } = useAuth();
  const [packages, setPackages] = useState<Package[]>([]);
  const [amount, setAmount] = useState<string>('');
  const [selectedPkg, setSelectedPkg] = useState<Package | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    fetch('/api/packages', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => setPackages(data));
  }, [token]);

  const handleInvest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPkg) return;
    
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/api/invest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          packageId: selectedPkg.id,
          amount: parseFloat(amount)
        })
      });

      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: 'Investment successful!' });
        setAmount('');
        setSelectedPkg(null);
        refreshUser();
      } else {
        setMessage({ type: 'error', text: data.error });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Something went wrong' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-display">Investment Plans</h1>
        <p className="text-zinc-500 mt-1">Choose a plan that fits your investment goals.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {packages.map((pkg) => (
          <motion.div
            key={pkg.id}
            whileHover={{ y: -5 }}
            whileTap={{ scale: 0.98 }}
            className={`glass-card p-8 relative overflow-hidden cursor-pointer transition-all ${
              selectedPkg?.id === pkg.id ? 'border-gold ring-1 ring-gold bg-gold/5' : 'hover:border-white/20'
            }`}
            onClick={() => setSelectedPkg(pkg)}
          >
            {pkg.daily_profit_percent >= 3 && (
              <div className="absolute top-4 right-4 bg-gold text-black text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                Popular
              </div>
            )}
            
            <div className="flex items-center gap-3 mb-6">
              <div className={`p-3 rounded-xl bg-white/5 ${pkg.daily_profit_percent >= 3 ? 'text-gold' : 'text-blue-400'}`}>
                {pkg.daily_profit_percent >= 3 ? <Zap size={24} /> : <Shield size={24} />}
              </div>
              <h3 className="text-2xl font-bold">{pkg.name}</h3>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center py-3 border-b border-white/5">
                <span className="text-zinc-400">Daily Profit</span>
                <span className="text-emerald-400 font-bold">{pkg.daily_profit_percent}%</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-white/5">
                <span className="text-zinc-400">Duration</span>
                <span className="font-bold">{pkg.duration_days} Days</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-white/5">
                <span className="text-zinc-400">Min. Investment</span>
                <span className="font-bold">${pkg.min_amount}</span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-zinc-400">Total Return</span>
                <span className="text-gold font-bold">{pkg.daily_profit_percent * pkg.duration_days + 100}%</span>
              </div>
            </div>

            <button 
              className={`w-full py-4 rounded-xl font-bold transition-all ${
                selectedPkg?.id === pkg.id 
                  ? 'bg-gold text-black' 
                  : 'bg-white/5 text-white hover:bg-white/10'
              }`}
            >
              {selectedPkg?.id === pkg.id ? 'Selected' : 'Select Plan'}
            </button>
          </motion.div>
        ))}
      </div>

      {selectedPkg && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 max-w-2xl mx-auto"
        >
          <h3 className="text-xl font-bold mb-6">Complete Investment</h3>
          <form onSubmit={handleInvest} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Investment Amount ($)</label>
              <input 
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={`Min. $${selectedPkg.min_amount}`}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white outline-none focus:border-gold transition-all"
                required
              />
            </div>

            {message && (
              <div className={`p-4 rounded-xl flex items-center gap-3 ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                <p className="text-sm font-medium">{message.text}</p>
              </div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl bg-gold text-black font-bold hover:bg-gold-light transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : `Invest $${amount || '0'} in ${selectedPkg.name}`}
            </button>
          </form>
        </motion.div>
      )}
    </div>
  );
};

export default Invest;
