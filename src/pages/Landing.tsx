import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bot, TrendingUp, Shield, Zap, ArrowRight, Globe, Users, Cpu, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const Landing = () => {
  const [liveTrades, setLiveTrades] = useState<any[]>([]);

  useEffect(() => {
    const users = ['Alex M.', 'Sarah K.', 'John D.', 'Elena R.', 'Mike T.', 'Sofia L.', 'David W.', 'Emma B.'];
    const pairs = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'BNB/USDT', 'XRP/USDT', 'ADA/USDT'];
    
    const generateTrade = () => ({
      id: Math.random().toString(36).substr(2, 9),
      user: users[Math.floor(Math.random() * users.length)],
      pair: pairs[Math.floor(Math.random() * pairs.length)],
      amount: (Math.random() * 500 + 50).toFixed(2),
      profit: (Math.random() * 25 + 5).toFixed(2),
      time: 'Just now'
    });

    setLiveTrades(Array.from({ length: 5 }, generateTrade));

    const interval = setInterval(() => {
      setLiveTrades(prev => [generateTrade(), ...prev.slice(0, 4)]);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-gold selection:text-black">
      {/* Navbar */}
      <nav className="h-20 border-b border-white/5 flex items-center justify-between px-6 md:px-12 sticky top-0 bg-black/50 backdrop-blur-xl z-50">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl gold-gradient flex items-center justify-center">
            <Bot className="text-black" />
          </div>
          <span className="text-2xl font-bold font-display gold-text-gradient">AI TRADE</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm font-medium text-zinc-400 hover:text-gold transition-colors">Features</a>
          <a href="#plans" className="text-sm font-medium text-zinc-400 hover:text-gold transition-colors">Plans</a>
          <a href="#about" className="text-sm font-medium text-zinc-400 hover:text-gold transition-colors">About</a>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm font-bold hover:text-gold transition-colors">Sign In</Link>
          <Link to="/register" className="px-6 py-2.5 rounded-full bg-gold text-black font-bold hover:bg-gold-light transition-all">Get Started</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-full pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-gold/20 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-gold/10 rounded-full blur-[120px]"></div>
        </div>

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8"
          >
            <span className="w-2 h-2 bg-gold rounded-full animate-pulse"></span>
            <span className="text-xs font-bold uppercase tracking-widest text-gold">Next-Gen Trading AI is Live</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-8xl font-black font-display leading-[1.1] mb-8"
          >
            Invest Smarter with <br />
            <span className="gold-text-gradient">Artificial Intelligence</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto mb-12"
          >
            Join thousands of investors using our high-frequency AI trading bots to generate consistent daily profits. Secure, automated, and professional.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/register" className="w-full sm:w-auto px-10 py-5 rounded-2xl bg-gold text-black font-black text-lg hover:bg-gold-light transition-all flex items-center justify-center gap-2 shadow-2xl shadow-gold/20">
              Start Investing Now <ArrowRight size={24} />
            </Link>
            <Link to="/login" className="w-full sm:w-auto px-10 py-5 rounded-2xl bg-white/5 border border-white/10 text-white font-bold text-lg hover:bg-white/10 transition-all">
              View Live Demo
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-24 pt-12 border-t border-white/5"
          >
            {[
              { label: 'Active Users', value: '12K+' },
              { label: 'Total Invested', value: '$4.2M' },
              { label: 'Daily Trades', value: '850K+' },
              { label: 'Avg. Daily ROI', value: '2.5%' },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl md:text-4xl font-black gold-text-gradient">{stat.value}</p>
                <p className="text-zinc-500 text-sm font-medium mt-1 uppercase tracking-widest">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 px-6 bg-zinc-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold font-display mb-4">Why Choose AI Trade?</h2>
            <p className="text-zinc-500 max-w-2xl mx-auto">Our platform combines cutting-edge technology with professional financial strategies.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Cpu, title: 'Advanced AI Engine', desc: 'Our proprietary algorithms analyze millions of data points per second to execute winning trades.' },
              { icon: Shield, title: 'Secure & Regulated', desc: 'Your funds are protected by multi-layer security and institutional-grade encryption.' },
              { icon: Zap, title: 'Instant Withdrawals', desc: 'Access your profits anytime with our automated withdrawal processing system.' },
              { icon: TrendingUp, title: 'Consistent ROI', desc: 'Earn stable daily profits ranging from 2% to 4% depending on your selected plan.' },
              { icon: Users, title: 'Referral Rewards', desc: 'Earn 5% instant commission on every investment made by your referred partners.' },
              { icon: Globe, title: 'Global Access', desc: 'Trade from anywhere in the world with our mobile-responsive dashboard.' },
            ].map((feature, i) => (
              <div key={i} className="glass-card p-8 hover:border-gold/30 transition-all group">
                <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:gold-gradient group-hover:text-black transition-all">
                  <feature.icon size={28} />
                </div>
                <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
                <p className="text-zinc-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Investment Plans Section */}
      <section id="plans" className="py-32 px-6 bg-black relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none">
          <div className="absolute top-0 left-0 w-[30%] h-[30%] bg-gold/5 rounded-full blur-[100px]"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold font-display mb-4">Investment Plans</h2>
            <p className="text-zinc-500 max-w-2xl mx-auto">Choose a plan that fits your financial goals and start earning today.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'Basic Plan', min: 10, daily: 2, duration: 7, popular: false, icon: Shield },
              { name: 'Premium Plan', min: 50, daily: 3, duration: 14, popular: true, icon: Zap },
              { name: 'Ultimate Plan', min: 200, daily: 4, duration: 30, popular: false, icon: TrendingUp },
            ].map((plan, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className={`glass-card p-8 relative flex flex-col ${plan.popular ? 'border-gold ring-1 ring-gold/20' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gold text-black text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-xl shadow-gold/20">
                    Most Popular
                  </div>
                )}

                <div className="flex items-center gap-4 mb-8">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${plan.popular ? 'bg-gold text-black' : 'bg-white/5 text-gold'}`}>
                    <plan.icon size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{plan.name}</h3>
                    <p className="text-zinc-500 text-xs uppercase tracking-wider">AI Trading Bot</p>
                  </div>
                </div>

                <div className="mb-8">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black gold-text-gradient">{plan.daily}%</span>
                    <span className="text-zinc-500 font-medium">/ Daily</span>
                  </div>
                </div>

                <div className="space-y-4 mb-10 flex-1">
                  <div className="flex justify-between items-center py-3 border-b border-white/5">
                    <span className="text-zinc-500 text-sm">Minimum Deposit</span>
                    <span className="font-bold text-white">${plan.min}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-white/5">
                    <span className="text-zinc-500 text-sm">Duration</span>
                    <span className="font-bold text-white">{plan.duration} Days</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-white/5">
                    <span className="text-zinc-500 text-sm">Total Return</span>
                    <span className="font-bold text-emerald-500">{plan.daily * plan.duration + 100}%</span>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <span className="text-zinc-500 text-sm">Withdrawal</span>
                    <span className="font-bold text-white">Anytime</span>
                  </div>
                </div>

                <Link 
                  to="/register" 
                  className={`w-full py-4 rounded-xl font-black text-center transition-all ${
                    plan.popular 
                      ? 'bg-gold text-black hover:bg-gold-light shadow-lg shadow-gold/10' 
                      : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'
                  }`}
                >
                  Get Started
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Trades Section */}
      <section className="py-24 px-6 bg-zinc-950/50 border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-16">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-4">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500">Live Activity</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold font-display">Recent AI Bot Trades</h2>
              <p className="text-zinc-500 mt-2">Real-time execution of our high-frequency trading algorithms.</p>
            </div>
            <div className="flex gap-4">
              <div className="glass-card px-6 py-4 text-center">
                <p className="text-2xl font-bold text-gold">854</p>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Trades Today</p>
              </div>
              <div className="glass-card px-6 py-4 text-center">
                <p className="text-2xl font-bold text-emerald-500">94.2%</p>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Win Rate</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {liveTrades.map((trade) => (
                <motion.div
                  key={trade.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="glass-card p-4 flex items-center justify-between group hover:border-gold/30 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gold">
                      <Activity size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-sm">{trade.user}</p>
                      <p className="text-xs text-zinc-500">{trade.time}</p>
                    </div>
                  </div>
                  
                  <div className="hidden sm:block">
                    <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Trading Pair</p>
                    <p className="font-mono font-bold text-sm">{trade.pair}</p>
                  </div>

                  <div className="hidden md:block">
                    <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Amount</p>
                    <p className="font-bold text-sm">${trade.amount}</p>
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Profit</p>
                    <p className="text-emerald-500 font-bold flex items-center justify-end gap-1">
                      <TrendingUp size={14} /> +${trade.profit}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg gold-gradient flex items-center justify-center">
                <Bot className="text-black w-5 h-5" />
              </div>
              <span className="text-xl font-bold font-display gold-text-gradient">AI TRADE</span>
            </div>
            <p className="text-zinc-500 max-w-sm mb-8">
              The world's most advanced AI-driven investment platform. Automated trading for everyone.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-6">Platform</h4>
            <ul className="space-y-4 text-zinc-500 text-sm">
              <li><Link to="/login" className="hover:text-gold transition-colors">Dashboard</Link></li>
              <li><Link to="/invest" className="hover:text-gold transition-colors">Investment Plans</Link></li>
              <li><Link to="/bot" className="hover:text-gold transition-colors">AI Bot Status</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-6">Support</h4>
            <ul className="space-y-4 text-zinc-500 text-sm">
              <li><a href="#" className="hover:text-gold transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-gold transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-gold transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-white/5 text-center text-zinc-600 text-xs">
          © 2026 AI Trade Bot Investment Platform. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Landing;
