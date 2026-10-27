import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Navbar } from '../common/Navbar';
import {
  LayoutDashboard,
  Smartphone,
  Repeat,
  Wrench,
  User,
  ShieldCheck,
  Cpu,
  LogOut,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';

export const DashboardLayout = ({ children, title, subtitle }) => {
  const { user, logout, isAdmin, isAgent } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Mobile Sidebar Toggle */}
          <div className="lg:hidden w-full flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200">
            <span className="font-bold text-slate-800 text-sm">Dashboard Navigation</span>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg bg-slate-100 text-slate-700"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Sidebar Navigation */}
          <aside
            className={`w-full lg:w-64 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-6 ${
              sidebarOpen ? 'block' : 'hidden lg:block'
            }`}
          >
            {/* User greeting */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Account</p>
              <p className="text-sm font-bold text-slate-900 truncate mt-0.5">{user?.full_name}</p>
              <span className="inline-block mt-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                {user?.role}
              </span>
            </div>

            {/* Navigation groups */}
            <div className="space-y-1">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">Main Menu</p>
              <Link
                to="/dashboard"
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  isActive('/dashboard')
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>

              <Link
                to="/valuation"
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  isActive('/valuation')
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                Valuation & Sell
              </Link>

              <Link
                to="/exchange"
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  isActive('/exchange')
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Repeat className="w-4 h-4" />
                Device Exchange
              </Link>

              <Link
                to="/repair"
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  isActive('/repair')
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Wrench className="w-4 h-4" />
                Book Repair
              </Link>

              <Link
                to="/profile"
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  isActive('/profile')
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <User className="w-4 h-4" />
                Profile Settings
              </Link>
            </div>

            {/* Admin or Agent sections */}
            {(isAdmin || isAgent) && (
              <div className="space-y-1 pt-4 border-t border-slate-100">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">Management</p>

                {isAdmin && (
                  <Link
                    to="/admin"
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                      isActive('/admin')
                        ? 'bg-purple-700 text-white shadow-md shadow-purple-700/20'
                        : 'text-purple-700 hover:bg-purple-50'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4" />
                    Admin Control Center
                  </Link>
                )}

                {isAgent && (
                  <Link
                    to="/agent"
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                      isActive('/agent')
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                        : 'text-blue-700 hover:bg-blue-50'
                    }`}
                  >
                    <Cpu className="w-4 h-4" />
                    Agent Field Tasks
                  </Link>
                )}
              </div>
            )}

            <div className="pt-4 border-t border-slate-100">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </aside>

          {/* Main Dashboard Content Area */}
          <main className="flex-1 w-full space-y-6">
            {(title || subtitle) && (
              <div className="mb-6">
                {title && <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">{title}</h1>}
                {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
              </div>
            )}
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};
