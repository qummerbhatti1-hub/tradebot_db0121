import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import DashboardLayout from './components/DashboardLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Invest from './pages/Invest';
import Wallet from './pages/Wallet';
import History from './pages/History';
import Referrals from './pages/Referrals';
import Bot from './pages/Bot';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import AdminDeposits from './pages/AdminDeposits';
import AdminWithdrawals from './pages/AdminWithdrawals';
import AdminPackages from './pages/AdminPackages';

import Landing from './pages/Landing';
import AdminUsers from './pages/AdminUsers';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/invest" element={<Invest />} />
            <Route path="/wallet" element={<Wallet />} />
            <Route path="/history" element={<History />} />
            <Route path="/referrals" element={<Referrals />} />
            <Route path="/bot" element={<Bot />} />
            <Route path="/profile" element={<Profile />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/deposits" element={<AdminDeposits />} />
            <Route path="/admin/withdrawals" element={<AdminWithdrawals />} />
            <Route path="/admin/packages" element={<AdminPackages />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
