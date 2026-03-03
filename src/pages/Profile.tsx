import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Shield, Calendar, Edit2, Save, Camera, Bell, Check } from 'lucide-react';
import { motion } from 'motion/react';

const Profile = () => {
  const { user, token } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [settings, setSettings] = useState({
    email_profit: true,
    email_trade: true,
    email_system: true,
    push_profit: false,
    push_trade: false,
    push_system: false
  });
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      const res = await fetch('/api/user/notifications/settings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    };
    fetchSettings();
  }, [token]);

  const handleSaveSettings = async (newSettings: any) => {
    setSavingSettings(true);
    try {
      const res = await fetch('/api/user/notifications/settings', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(newSettings)
      });
      if (res.ok) {
        setSettings(newSettings);
      }
    } finally {
      setSavingSettings(false);
    }
  };

  const toggleSetting = (key: string) => {
    const newSettings = { ...settings, [key]: !settings[key as keyof typeof settings] };
    handleSaveSettings(newSettings);
  };

  const handleSave = () => {
    // In a real app, this would call an API
    setIsEditing(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePic(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-display">My Profile</h1>
          <p className="text-zinc-500 mt-1">Manage your account settings and personal information.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="glass-card p-8 text-center">
            <div className="relative w-32 h-32 mx-auto mb-6">
              <div className="w-full h-full rounded-full bg-zinc-800 border-2 border-gold flex items-center justify-center text-gold overflow-hidden">
                {profilePic ? (
                  <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User size={64} />
                )}
              </div>
              <label className="absolute bottom-0 right-0 p-2 bg-gold text-black rounded-full shadow-lg hover:bg-gold-light transition-all cursor-pointer">
                <Camera size={16} />
                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
              </label>
            </div>
            <h2 className="text-xl font-bold">{user?.name}</h2>
            <p className="text-zinc-500 text-sm capitalize mb-6">{user?.role}</p>
            
            <div className="pt-6 border-t border-white/5 space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-500">Member Since</span>
                <span className="text-white font-medium">Jan 2024</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-500">Status</span>
                <span className="text-emerald-500 font-bold">Verified</span>
              </div>
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold">Personal Information</h3>
              <button 
                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gold/10 text-gold hover:bg-gold/20 transition-all text-sm font-bold"
              >
                {isEditing ? <><Save size={16} /> Save Changes</> : <><Edit2 size={16} /> Edit Profile</>}
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-zinc-500 mb-2">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                    <input 
                      type="text"
                      disabled={!isEditing}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white outline-none focus:border-gold transition-all disabled:opacity-50"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-500 mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                    <input 
                      type="email"
                      disabled
                      value={user?.email}
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white outline-none focus:border-gold transition-all opacity-50 cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-zinc-500 mb-2">Account Role</label>
                  <div className="relative">
                    <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                    <input 
                      type="text"
                      disabled
                      value={user?.role}
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white outline-none focus:border-gold transition-all opacity-50 cursor-not-allowed capitalize"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-500 mb-2">Registration Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                    <input 
                      type="text"
                      disabled
                      value="2024-01-15"
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white outline-none focus:border-gold transition-all opacity-50 cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Notification Preferences</h3>
              {savingSettings && <span className="text-xs text-gold animate-pulse">Saving...</span>}
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Email Notifications */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                    <Mail size={14} /> Email Alerts
                  </h4>
                  <div className="space-y-3">
                    {[
                      { id: 'email_profit', label: 'Profit Alerts', desc: 'Notify when bot earns profit' },
                      { id: 'email_trade', label: 'Trade Events', desc: 'Notify on new investments' },
                      { id: 'email_system', label: 'System Updates', desc: 'Important platform news' }
                    ].map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                        <div>
                          <p className="text-sm font-bold">{item.label}</p>
                          <p className="text-[10px] text-zinc-500">{item.desc}</p>
                        </div>
                        <button 
                          onClick={() => toggleSetting(item.id)}
                          className={`w-10 h-5 rounded-full transition-all relative ${settings[item.id as keyof typeof settings] ? 'bg-gold' : 'bg-zinc-700'}`}
                        >
                          <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${settings[item.id as keyof typeof settings] ? 'left-6' : 'left-1'}`}></div>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Push Notifications */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                    <Bell size={14} /> Push Notifications
                  </h4>
                  <div className="space-y-3">
                    {[
                      { id: 'push_profit', label: 'Profit Alerts', desc: 'Real-time profit popups' },
                      { id: 'push_trade', label: 'Trade Events', desc: 'Instant trade confirmations' },
                      { id: 'push_system', label: 'System Updates', desc: 'Urgent platform alerts' }
                    ].map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                        <div>
                          <p className="text-sm font-bold">{item.label}</p>
                          <p className="text-[10px] text-zinc-500">{item.desc}</p>
                        </div>
                        <button 
                          onClick={() => toggleSetting(item.id)}
                          className={`w-10 h-5 rounded-full transition-all relative ${settings[item.id as keyof typeof settings] ? 'bg-gold' : 'bg-zinc-700'}`}
                        >
                          <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${settings[item.id as keyof typeof settings] ? 'left-6' : 'left-1'}`}></div>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card p-8">
            <h3 className="text-xl font-bold mb-6">Security Settings</h3>
            <div className="space-y-4">
              <button className="w-full flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:border-gold/30 transition-all group">
                <div className="text-left">
                  <p className="font-bold group-hover:text-gold transition-colors">Change Password</p>
                  <p className="text-xs text-zinc-500">Update your account password for better security</p>
                </div>
                <Edit2 size={18} className="text-zinc-500 group-hover:text-gold transition-colors" />
              </button>
              <button className="w-full flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:border-gold/30 transition-all group">
                <div className="text-left">
                  <p className="font-bold group-hover:text-gold transition-colors">Two-Factor Authentication</p>
                  <p className="text-xs text-zinc-500">Add an extra layer of security to your account</p>
                </div>
                <div className="px-3 py-1 bg-red-500/10 text-red-500 text-[10px] font-bold rounded-full uppercase tracking-wider">Disabled</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
