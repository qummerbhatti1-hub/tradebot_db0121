import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Users, Copy, CheckCircle2, Gift, Share2 } from 'lucide-react';
import { motion } from 'motion/react';

const Referrals = () => {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  const referralLink = `${window.location.origin}/register?ref=${user?.referral_code}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(user?.referral_code || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-display">Referral Program</h1>
        <p className="text-zinc-500 mt-1">Invite your friends and earn 5% bonus on their investments.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Referral Link Card */}
          <div className="glass-card p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl gold-gradient flex items-center justify-center">
                <Share2 className="text-black" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Your Referral Link</h3>
                <p className="text-zinc-500 text-sm">Share this link to invite new users.</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-zinc-300 font-mono text-sm truncate">
                {referralLink}
              </div>
              <button 
                onClick={copyToClipboard}
                className="px-8 py-4 rounded-xl bg-gold text-black font-bold hover:bg-gold-light transition-all flex items-center justify-center gap-2 whitespace-nowrap"
              >
                {copied ? <CheckCircle2 size={20} /> : <Copy size={20} />}
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
            </div>
          </div>

          {/* How it works */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { step: '01', title: 'Share Link', desc: 'Send your referral link to your friends.' },
              { step: '02', title: 'They Invest', desc: 'Your friend registers and makes an investment.' },
              { step: '03', title: 'Earn Bonus', desc: 'You instantly receive 5% of their investment.' },
            ].map((item) => (
              <div key={item.step} className="glass-card p-6">
                <span className="text-4xl font-black text-white/5 block mb-4">{item.step}</span>
                <h4 className="font-bold mb-2">{item.title}</h4>
                <p className="text-sm text-zinc-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Sidebar */}
        <div className="space-y-6">
          <div className="glass-card p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-purple-500/10 text-purple-400 flex items-center justify-center mx-auto mb-4">
              <Gift size={32} />
            </div>
            <p className="text-zinc-400 text-sm font-medium">Total Referral Earnings</p>
            <h3 className="text-4xl font-bold mt-2 text-gold">$0.00</h3>
          </div>

          <div className="glass-card p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center mx-auto mb-4">
              <Users size={32} />
            </div>
            <p className="text-zinc-400 text-sm font-medium">Total Referrals</p>
            <h3 className="text-4xl font-bold mt-2">0</h3>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Referrals;
