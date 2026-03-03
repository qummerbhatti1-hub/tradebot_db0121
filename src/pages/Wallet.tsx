import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowUpRight, ArrowDownRight, CreditCard, Smartphone, Landmark, CheckCircle2, AlertCircle, History, Upload, FileText, Clock, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';

const Wallet = () => {
  const { user, token, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>('deposit');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('');
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [fetchingTransactions, setFetchingTransactions] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchHistory = async () => {
    setFetchingTransactions(true);
    try {
      const [depRes, withRes] = await Promise.all([
        fetch('/api/user/deposits', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/user/withdrawals', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      
      if (depRes.ok && withRes.ok) {
        const deps = await depRes.json();
        const withs = await withRes.json();
        
        // Combine and sort by date
        const combined = [
          ...deps.map((d: any) => ({ ...d, type: 'deposit' })),
          ...withs.map((w: any) => ({ ...w, type: 'withdrawal' }))
        ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        
        setTransactions(combined.slice(0, 5)); // Show only last 5
      }
    } catch (err) {
      console.error("Failed to fetch history:", err);
    } finally {
      setFetchingTransactions(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchHistory();
    }
  }, [token]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProofFile(e.target.files[0]);
    }
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proofFile) {
      setMessage({ type: 'error', text: 'Please upload payment proof screenshot' });
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ 
          amount: parseFloat(amount), 
          method, 
          proofImg: proofFile.name 
        })
      });
      if (res.ok) {
        setShowConfirmation(true);
        setAmount('');
        setProofFile(null);
        fetchHistory();
      } else {
        const data = await res.json();
        setMessage({ type: 'error', text: data.error });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Connection error' });
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ amount: parseFloat(amount), method, accountDetails: details })
      });
      if (res.ok) {
        setMessage({ type: 'success', text: 'Withdrawal request submitted!' });
        setAmount('');
        setDetails('');
        refreshUser();
        fetchHistory();
      } else {
        const data = await res.json();
        setMessage({ type: 'error', text: data.error });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Connection error' });
    } finally {
      setLoading(false);
    }
  };

  const methods = [
    { id: 'Easypaisa', name: 'Easypaisa', icon: Smartphone, color: 'text-emerald-500' },
    { id: 'JazzCash', name: 'JazzCash', icon: Smartphone, color: 'text-red-500' },
    { id: 'Bank', name: 'Bank Transfer', icon: Landmark, color: 'text-blue-500' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-display">My Wallet</h1>
          <p className="text-zinc-500 mt-1">Manage your funds and transactions.</p>
        </div>
        <div className="glass-card px-6 py-3 flex items-center gap-3">
          <p className="text-zinc-400 text-sm">Balance:</p>
          <p className="text-2xl font-bold text-gold">${user?.balance.toFixed(2)}</p>
        </div>
      </div>

      <div className="flex p-1 bg-white/5 rounded-2xl border border-white/5">
        <button 
          onClick={() => { setActiveTab('deposit'); setMessage(null); setShowConfirmation(false); }}
          className={`flex-1 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'deposit' ? 'bg-gold text-black' : 'text-zinc-400 hover:text-white'}`}
        >
          <ArrowUpRight size={20} /> Deposit
        </button>
        <button 
          onClick={() => { setActiveTab('withdraw'); setMessage(null); setShowConfirmation(false); }}
          className={`flex-1 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'withdraw' ? 'bg-gold text-black' : 'text-zinc-400 hover:text-white'}`}
        >
          <ArrowDownRight size={20} /> Withdraw
        </button>
      </div>

      <div className="glass-card p-8">
        <h3 className="text-xl font-bold mb-8">
          {activeTab === 'deposit' ? 'Add Funds to Wallet' : 'Withdraw Funds to Account'}
        </h3>

        {!showConfirmation ? (
          <form onSubmit={activeTab === 'deposit' ? handleDeposit : handleWithdraw} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {methods.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    setMethod(m.id);
                    setMessage(null);
                  }}
                  className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 relative overflow-hidden group ${
                    method === m.id 
                      ? 'border-gold bg-gold/10 shadow-lg shadow-gold/5' 
                      : 'border-white/5 bg-white/5 hover:border-white/10 hover:bg-white/10'
                  }`}
                >
                  {method === m.id && (
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-2 right-2 w-6 h-6 bg-gold rounded-full flex items-center justify-center"
                    >
                      <CheckCircle2 className="text-black w-4 h-4" />
                    </motion.div>
                  )}
                  <m.icon className={`${m.color} transition-transform group-hover:scale-110`} size={32} />
                  <span className={`font-bold transition-colors ${method === m.id ? 'text-gold' : 'text-zinc-400'}`}>
                    {m.name}
                  </span>
                </button>
              ))}
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Amount ($)</label>
                <input 
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white text-xl font-bold outline-none focus:border-gold transition-all"
                  required
                />
              </div>

              {activeTab === 'withdraw' && (
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">Account Details (Number/IBAN)</label>
                  <textarea 
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    placeholder="Enter your account number or IBAN details"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white outline-none focus:border-gold transition-all h-32"
                    required
                  />
                </div>
              )}

              {activeTab === 'deposit' && method && (
                <div className="space-y-6">
                  <div className="p-6 rounded-2xl bg-gold/5 border border-gold/20">
                    <h4 className="font-bold text-gold mb-2">Payment Instructions</h4>
                    <p className="text-sm text-zinc-300 leading-relaxed">
                      Please send <strong>${amount || '0'}</strong> to the following {method} account:
                      <br /><br />
                      <strong>Account Name:</strong> AI Trade Admin
                      <br />
                      <strong>Account Number:</strong> 03123456789
                      <br /><br />
                      After payment, please upload the screenshot below.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">Upload Payment Proof (Screenshot)</label>
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className={`w-full border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all ${
                        proofFile ? 'border-gold bg-gold/5' : 'border-white/10 hover:border-white/20 bg-white/5'
                      }`}
                    >
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        className="hidden" 
                        accept="image/*"
                      />
                      {proofFile ? (
                        <>
                          <FileText className="text-gold" size={32} />
                          <p className="text-sm font-medium text-gold">{proofFile.name}</p>
                          <p className="text-xs text-zinc-500">Click to change file</p>
                        </>
                      ) : (
                        <>
                          <Upload className="text-zinc-500" size={32} />
                          <p className="text-sm font-medium text-zinc-400">Click or drag image to upload</p>
                          <p className="text-xs text-zinc-600">Supports JPG, PNG, WEBP</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {message && (
                <div className={`p-4 rounded-xl flex items-center gap-3 ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                  {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                  <p className="text-sm font-medium">{message.text}</p>
                </div>
              )}

              <button 
                type="submit"
                disabled={loading || !method || !amount}
                className="w-full py-4 rounded-xl bg-gold text-black font-bold hover:bg-gold-light transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-gold/10"
              >
                {loading ? 'Processing...' : `Submit ${activeTab === 'deposit' ? 'Deposit' : 'Withdrawal'} Request`}
              </button>
            </div>
          </form>
        ) : (
          <AnimatePresence>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="p-8 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-4"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto">
                <CheckCircle2 className="text-emerald-500" size={32} />
              </div>
              <h3 className="text-xl font-bold text-emerald-500">Deposit Request Submitted!</h3>
              <div className="space-y-2 text-sm text-zinc-400">
                <p>Your request has been received and is currently <span className="text-gold font-bold">Pending Approval</span>.</p>
                <p className="flex items-center justify-center gap-2"><Clock size={14} /> Estimated processing time: 1-2 hours</p>
              </div>
              <button 
                onClick={() => setShowConfirmation(false)}
                className="px-6 py-2 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-600 transition-all"
              >
                Got it
              </button>
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      <div className="glass-card overflow-hidden">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <History size={20} className="text-gold" />
            Recent Activity
          </h3>
          <Link to="/history" className="text-xs font-bold text-gold hover:text-gold-light flex items-center gap-1 uppercase tracking-widest">
            View All <ChevronRight size={14} />
          </Link>
        </div>
        
        <div className="divide-y divide-white/5">
          {fetchingTransactions ? (
            <div className="p-12 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm text-zinc-500">Loading history...</p>
            </div>
          ) : transactions.length > 0 ? (
            transactions.map((tx) => (
              <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    tx.type === 'deposit' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                  }`}>
                    {tx.type === 'deposit' ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                  </div>
                  <div>
                    <p className="font-bold text-sm capitalize">{tx.type} via {tx.method}</p>
                    <p className="text-xs text-zinc-500">{format(new Date(tx.created_at), 'MMM dd, yyyy • hh:mm a')}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${tx.type === 'deposit' ? 'text-emerald-500' : 'text-red-500'}`}>
                    {tx.type === 'deposit' ? '+' : '-'}${tx.amount.toFixed(2)}
                  </p>
                  <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                    tx.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500' : 
                    tx.status === 'pending' ? 'bg-gold/10 text-gold' : 'bg-red-500/10 text-red-500'
                  }`}>
                    {tx.status}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center">
              <p className="text-zinc-500 text-sm">No recent transactions found.</p>
            </div>
          )}
        </div>
      </div>

      <div className="text-center">
        <Link 
          to="/history" 
          className="inline-flex items-center gap-2 text-zinc-400 hover:text-gold transition-colors font-medium"
        >
          <History size={18} />
          View Transaction History
        </Link>
      </div>
    </div>
  );
};

export default Wallet;
