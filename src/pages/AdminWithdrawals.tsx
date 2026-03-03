import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Check, X, Info, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';

const AdminWithdrawals = () => {
  const { token } = useAuth();
  const [withdrawals, setWithdrawals] = useState<any[]>([]);

  const fetchWithdrawals = () => {
    fetch('/api/admin/withdrawals', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => setWithdrawals(data));
  };

  useEffect(() => {
    fetchWithdrawals();
  }, [token]);

  const handleAction = async (id: number, action: 'approve' | 'reject') => {
    const res = await fetch(`/api/admin/withdrawals/${id}/${action}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) fetchWithdrawals();
  };

  return (
    <div className="space-y-8">
      <Link to="/admin" className="inline-flex items-center gap-2 text-zinc-400 hover:text-gold transition-colors mb-4">
        <ArrowLeft size={18} />
        Back to Admin Dashboard
      </Link>
      <div>
        <h1 className="text-3xl font-bold font-display">Withdrawal Requests</h1>
        <p className="text-zinc-500 mt-1">Review and process user withdrawal requests.</p>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 bg-white/5">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-400">User</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-400">Amount</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-400">Method</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-400">Details</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-400">Status</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {withdrawals.map((w) => (
                <tr key={w.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-medium">{w.user_name}</td>
                  <td className="px-6 py-4 font-bold text-red-400">${w.amount.toFixed(2)}</td>
                  <td className="px-6 py-4 text-zinc-400">{w.method}</td>
                  <td className="px-6 py-4 text-zinc-400 text-xs max-w-xs truncate">
                    {w.account_details}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      w.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500' : 
                      w.status === 'pending' ? 'bg-gold/10 text-gold' : 
                      'bg-red-500/10 text-red-500'
                    }`}>
                      {w.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {w.status === 'pending' && (
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleAction(w.id, 'approve')}
                          className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all"
                        >
                          <Check size={18} />
                        </button>
                        <button 
                          onClick={() => handleAction(w.id, 'reject')}
                          className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminWithdrawals;
