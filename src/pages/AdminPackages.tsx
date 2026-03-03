import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { TrendingUp, Plus, Edit2, Trash2, Save, X, CheckCircle, XCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface Package {
  id: number;
  name: string;
  min_amount: number;
  duration_days: number;
  daily_profit_percent: number;
  active: number;
}

const AdminPackages = () => {
  const { token } = useAuth();
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<Package>>({});
  const [isAdding, setIsAdding] = useState(false);
  const [newForm, setNewForm] = useState<Partial<Package>>({
    name: '',
    min_amount: 10,
    duration_days: 7,
    daily_profit_percent: 2
  });

  useEffect(() => {
    fetchPackages();
  }, [token]);

  const fetchPackages = async () => {
    try {
      const res = await fetch('/api/admin/packages', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setPackages(data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch packages');
      setLoading(false);
    }
  };

  const handleEdit = (pkg: Package) => {
    setEditingId(pkg.id);
    setEditForm(pkg);
  };

  const handleSave = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/packages/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(editForm)
      });
      if (res.ok) {
        setEditingId(null);
        fetchPackages();
      }
    } catch (err) {
      console.error('Failed to update package');
    }
  };

  const handleAdd = async () => {
    try {
      const res = await fetch('/api/admin/packages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newForm)
      });
      if (res.ok) {
        setIsAdding(false);
        setNewForm({
          name: '',
          min_amount: 10,
          duration_days: 7,
          daily_profit_percent: 2
        });
        fetchPackages();
      }
    } catch (err) {
      console.error('Failed to add package');
    }
  };

  const toggleStatus = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/packages/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchPackages();
      }
    } catch (err) {
      console.error('Failed to toggle status');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gold/10 text-gold flex items-center justify-center">
            <TrendingUp size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-bold font-display">Investment Packages</h1>
            <p className="text-zinc-500 mt-1">Create and manage investment plans for users.</p>
          </div>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gold text-black font-bold hover:bg-gold-light transition-all shadow-lg shadow-gold/10"
        >
          <Plus size={20} />
          Add Package
        </button>
      </div>

      {isAdding && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 border-gold/30"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold">Create New Package</h3>
            <button onClick={() => setIsAdding(false)} className="text-zinc-500 hover:text-white">
              <X size={24} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">Package Name</label>
              <input 
                type="text"
                value={newForm.name}
                onChange={(e) => setNewForm({...newForm, name: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-gold transition-all"
                placeholder="e.g. Diamond Plan"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">Min Amount ($)</label>
              <input 
                type="number"
                value={newForm.min_amount}
                onChange={(e) => setNewForm({...newForm, min_amount: Number(e.target.value)})}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-gold transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">Duration (Days)</label>
              <input 
                type="number"
                value={newForm.duration_days}
                onChange={(e) => setNewForm({...newForm, duration_days: Number(e.target.value)})}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-gold transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">Daily Profit (%)</label>
              <input 
                type="number"
                step="0.1"
                value={newForm.daily_profit_percent}
                onChange={(e) => setNewForm({...newForm, daily_profit_percent: Number(e.target.value)})}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-gold transition-all"
              />
            </div>
          </div>
          <div className="mt-8 flex justify-end gap-4">
            <button 
              onClick={() => setIsAdding(false)}
              className="px-6 py-3 rounded-xl bg-white/5 text-white font-bold hover:bg-white/10 transition-all"
            >
              Cancel
            </button>
            <button 
              onClick={handleAdd}
              className="px-8 py-3 rounded-xl bg-gold text-black font-bold hover:bg-gold-light transition-all shadow-lg shadow-gold/10"
            >
              Create Package
            </button>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {packages.map((pkg) => (
          <motion.div 
            key={pkg.id}
            layout
            className={`glass-card p-6 border-l-4 ${pkg.active ? 'border-l-emerald-500' : 'border-l-red-500'}`}
          >
            {editingId === pkg.id ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">Name</label>
                    <input 
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-gold transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">Min Amount ($)</label>
                    <input 
                      type="number"
                      value={editForm.min_amount}
                      onChange={(e) => setEditForm({...editForm, min_amount: Number(e.target.value)})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-gold transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">Duration (Days)</label>
                    <input 
                      type="number"
                      value={editForm.duration_days}
                      onChange={(e) => setEditForm({...editForm, duration_days: Number(e.target.value)})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-gold transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">Daily Profit (%)</label>
                    <input 
                      type="number"
                      step="0.1"
                      value={editForm.daily_profit_percent}
                      onChange={(e) => setEditForm({...editForm, daily_profit_percent: Number(e.target.value)})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-gold transition-all"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <button 
                    onClick={() => setEditingId(null)}
                    className="p-3 rounded-xl bg-white/5 text-zinc-400 hover:text-white transition-all"
                  >
                    <X size={20} />
                  </button>
                  <button 
                    onClick={() => handleSave(pkg.id)}
                    className="p-3 rounded-xl bg-gold text-black hover:bg-gold-light transition-all"
                  >
                    <Save size={20} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 flex-1">
                  <div>
                    <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-1">Package</p>
                    <h4 className="text-lg font-bold">{pkg.name}</h4>
                  </div>
                  <div>
                    <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-1">Min Amount</p>
                    <h4 className="text-lg font-bold">${pkg.min_amount}</h4>
                  </div>
                  <div>
                    <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-1">Duration</p>
                    <h4 className="text-lg font-bold">{pkg.duration_days} Days</h4>
                  </div>
                  <div>
                    <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-1">Daily Profit</p>
                    <h4 className="text-lg font-bold text-emerald-500">{pkg.daily_profit_percent}%</h4>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => toggleStatus(pkg.id)}
                    className={`p-3 rounded-xl transition-all ${pkg.active ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20' : 'bg-red-500/10 text-red-500 hover:bg-red-500/20'}`}
                    title={pkg.active ? 'Deactivate' : 'Activate'}
                  >
                    {pkg.active ? <CheckCircle size={20} /> : <XCircle size={20} />}
                  </button>
                  <button 
                    onClick={() => handleEdit(pkg)}
                    className="p-3 rounded-xl bg-white/5 text-zinc-400 hover:text-gold hover:bg-gold/10 transition-all"
                  >
                    <Edit2 size={20} />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AdminPackages;
