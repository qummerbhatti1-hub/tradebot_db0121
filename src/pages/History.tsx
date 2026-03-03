import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { History as HistoryIcon, ArrowUpRight, ArrowDownRight, TrendingUp, Users, Gift } from 'lucide-react';
import { format } from 'date-fns';

interface Transaction {
  id: number;
  type: string;
  amount: number;
  status: string;
  description: string;
  created_at: string;
}

const History = () => {
  const { token } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    fetch('/api/transactions', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => setTransactions(data));
  }, [token]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'deposit': return <ArrowUpRight className="text-emerald-500" />;
      case 'withdrawal': return <ArrowDownRight className="text-red-500" />;
      case 'profit': return <TrendingUp className="text-gold" />;
      case 'referral': return <Users className="text-purple-400" />;
      case 'capital_return': return <Gift className="text-blue-400" />;
      default: return <HistoryIcon className="text-zinc-400" />;
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-display">Transaction History</h1>
        <p className="text-zinc-500 mt-1">Review all your financial activities on the platform.</p>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 bg-white/5">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-400">Type</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-400">Amount</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-400">Description</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-400">Date</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-400">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                    No transactions found.
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-white/5">
                          {getIcon(tx.type)}
                        </div>
                        <span className="font-medium capitalize">{tx.type.replace('_', ' ')}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-bold ${['deposit', 'profit', 'referral', 'capital_return'].includes(tx.type) ? 'text-emerald-400' : 'text-red-400'}`}>
                        {['deposit', 'profit', 'referral', 'capital_return'].includes(tx.type) ? '+' : '-'}${tx.amount.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-zinc-400 text-sm">
                      {tx.description}
                    </td>
                    <td className="px-6 py-4 text-zinc-400 text-sm">
                      {format(new Date(tx.created_at), 'MMM dd, yyyy HH:mm')}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        tx.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500' : 
                        tx.status === 'pending' ? 'bg-gold/10 text-gold' : 
                        'bg-red-500/10 text-red-500'
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default History;
