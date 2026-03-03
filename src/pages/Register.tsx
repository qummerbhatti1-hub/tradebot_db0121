import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bot, Mail, Lock, User, AlertCircle, ArrowRight, Users } from 'lucide-react';
import { motion } from 'motion/react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    referralCode: '',
    otp: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [timer, setTimer] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleSendOtp = async () => {
    if (!formData.email) {
      setError('Please enter your email first');
      return;
    }
    setOtpLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      });
      const data = await res.json();
      if (res.ok) {
        setOtpSent(true);
        setTimer(60); // 60 seconds countdown
        setSuccess('OTP sent to your email');
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to send OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpSent) {
      setError('Please verify your email with OTP first');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess('Registration successful! Redirecting...');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-gold/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-gold/5 rounded-full blur-[120px]"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gold-gradient mb-6 shadow-lg shadow-gold/20">
            <Bot className="text-black w-8 h-8" />
          </div>
          <h1 className="text-4xl font-bold font-display gold-text-gradient">Join AI Trade</h1>
          <p className="text-zinc-500 mt-2">Start your automated investment journey today</p>
        </div>

        <div className="glass-card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
                <input 
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white outline-none focus:border-gold transition-all"
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Email Address</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
                  <input 
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white outline-none focus:border-gold transition-all"
                    placeholder="name@example.com"
                    required
                    disabled={otpSent}
                  />
                </div>
                {!otpSent ? (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={otpLoading}
                    className="px-4 rounded-xl bg-gold/10 text-gold border border-gold/20 font-bold hover:bg-gold/20 transition-all disabled:opacity-50 text-sm whitespace-nowrap"
                  >
                    {otpLoading ? 'Sending...' : 'Send OTP'}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={otpLoading || timer > 0}
                    className="px-4 rounded-xl bg-gold/10 text-gold border border-gold/20 font-bold hover:bg-gold/20 transition-all disabled:opacity-50 text-sm whitespace-nowrap"
                  >
                    {timer > 0 ? `Resend in ${timer}s` : 'Resend OTP'}
                  </button>
                )}
              </div>
            </div>

            {otpSent && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
              >
                <label className="block text-sm font-medium text-zinc-400 mb-2">Verification OTP</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
                  <input 
                    type="text"
                    value={formData.otp}
                    onChange={(e) => setFormData({...formData, otp: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white outline-none focus:border-gold transition-all"
                    placeholder="Enter 6-digit OTP"
                    maxLength={6}
                    required
                  />
                </div>
                <button 
                  type="button"
                  onClick={() => setOtpSent(false)}
                  className="text-xs text-zinc-500 mt-2 hover:text-gold transition-all"
                >
                  Change Email?
                </button>
              </motion.div>
            )}

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
                <input 
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white outline-none focus:border-gold transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Referral Code (Optional)</label>
              <div className="relative">
                <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
                <input 
                  type="text"
                  value={formData.referralCode}
                  onChange={(e) => setFormData({...formData, referralCode: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white outline-none focus:border-gold transition-all"
                  placeholder="REF123"
                />
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-500">
                <AlertCircle size={20} />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            {success && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3 text-emerald-500">
                <AlertCircle size={20} />
                <p className="text-sm font-medium">{success}</p>
              </div>
            )}

            <button 
              type="submit"
              disabled={loading || !otpSent}
              className="w-full py-4 rounded-xl bg-gold text-black font-bold hover:bg-gold-light transition-all flex items-center justify-center gap-2 group shadow-lg shadow-gold/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-white/5 text-center">
            <p className="text-zinc-500">
              Already have an account? {' '}
              <Link to="/login" className="text-gold font-bold hover:text-gold-light">Sign In</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
