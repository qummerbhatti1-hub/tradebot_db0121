import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Edit2, Ban, Trash2, Search, DollarSign, ArrowLeft } from 'lucide-react';

const AdminUsers = () => {
  const { token } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchUsers = () => {
    fetch('/api/admin/users', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => setUsers(data));
  };

  useEffect(() => {
    fetchUsers();
  }, [token]);

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <Link to="/admin" className="inline-flex items-center gap-2 text-zinc-400 hover:text-gold transition-colors mb-4">
        <ArrowLeft size={18} />
        Back to Admin Dashboard
      </Link>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display">User Management</h1>
          <p className="text-zinc-500 mt-1">View and manage all registered users on the platform.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
          <input 
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-2.5 outline-none focus:border-gold transition-all w-full md:w-64"
          />
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 bg-white/5">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-400">User</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-400">Email</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-400">Balance</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-400">Role</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-gold">
                        <User size={16} />
                      </div>
                      <span className="font-medium">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-zinc-400 text-sm">{u.email}</td>
                  <td className="px-6 py-4 font-bold text-gold">${u.balance.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${u.role === 'admin' ? 'bg-purple-500/10 text-purple-400' : 'bg-blue-500/10 text-blue-400'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 rounded-lg bg-white/5 text-zinc-400 hover:text-gold transition-all">
                        <DollarSign size={18} />
                      </button>
                      <button className="p-2 rounded-lg bg-white/5 text-zinc-400 hover:text-blue-400 transition-all">
                        <Edit2 size={18} />
                      </button>
                      <button className="p-2 rounded-lg bg-white/5 text-zinc-400 hover:text-red-400 transition-all">
                        <Ban size={18} />
                      </button>
                    </div>
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

export default AdminUsers;
