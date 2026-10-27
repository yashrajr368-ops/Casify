import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { notificationAPI } from '../../services/api';
import {
  Sparkles,
  User,
  LogOut,
  Bell,
  Menu,
  X,
  ChevronDown,
  Layers,
  Repeat,
  Wrench,
  ShieldCheck,
  CheckCircle2,
  Cpu
} from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, logout, isAdmin, isAgent } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch notifications
  useEffect(() => {
    if (isAuthenticated) {
      const fetchNotifs = async () => {
        try {
          const res = await notificationAPI.list();
          if (res.data?.data) {
            setNotifications(res.data.data.notifications || []);
            setUnreadCount(res.data.data.unread_count || 0);
          }
        } catch (err) {
          // Silent fallback
        }
      };
      fetchNotifs();
      const timer = setInterval(fetchNotifs, 20000);
      return () => clearInterval(timer);
    }
  }, [isAuthenticated]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const markAllRead = async () => {
    try {
      await notificationAPI.markAllRead();
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (e) {
      console.error(e);
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-slate-950 via-slate-900 to-emerald-800 flex items-center justify-center text-white shadow-md shadow-emerald-950/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-6 h-6 text-emerald-400" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-1.5">
                RETECH <span className="text-emerald-600">AI</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 -mt-1">
                Smart Resale & Repair
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1 lg:gap-2">
            <Link
              to="/"
              className={`px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
                isActive('/') ? 'text-emerald-700 bg-emerald-50/70' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
              }`}
            >
              Home
            </Link>
            <Link
              to="/valuation"
              className={`px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
                isActive('/valuation') ? 'text-emerald-700 bg-emerald-50/70' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
              }`}
            >
              Check Device Value
            </Link>
            <Link
              to="/exchange"
              className={`px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
                isActive('/exchange') ? 'text-emerald-700 bg-emerald-50/70' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
              }`}
            >
              Exchange
            </Link>
            <Link
              to="/repair"
              className={`px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
                isActive('/repair') ? 'text-emerald-700 bg-emerald-50/70' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
              }`}
            >
              Repair
            </Link>
            <a
              href="#how-it-works"
              className="px-3 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100/60 transition-colors"
            >
              How It Works
            </a>
          </div>

          {/* Right Action / Auth Menu */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {/* Notifications Bell */}
                <div className="relative">
                  <button
                    onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                    className="p-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 relative transition-colors"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-emerald-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center ring-2 ring-white animate-pulse">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notification Dropdown */}
                  {notifDropdownOpen && (
                    <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 py-3 z-50 animate-scale-up">
                      <div className="flex items-center justify-between px-4 pb-2 border-b border-slate-100">
                        <span className="text-sm font-bold text-slate-900">Notifications</span>
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllRead}
                            className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>
                      <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                        {notifications.length === 0 ? (
                          <div className="p-4 text-center text-xs text-slate-400">
                            No notifications yet
                          </div>
                        ) : (
                          notifications.slice(0, 5).map((n) => (
                            <div key={n.id} className={`p-3.5 text-left text-xs ${n.is_read ? 'bg-white' : 'bg-emerald-50/40'}`}>
                              <p className="font-semibold text-slate-800">{n.title}</p>
                              <p className="text-slate-500 mt-1 leading-relaxed">{n.message}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Profile Pill & Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center gap-2.5 pl-2.5 pr-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200/70 border border-slate-200 text-slate-800 text-sm font-semibold transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                      {user?.full_name?.charAt(0) || 'U'}
                    </div>
                    <span className="max-w-[120px] truncate">{user?.full_name?.split(' ')[0]}</span>
                    <ChevronDown className="w-4 h-4 text-slate-500" />
                  </button>

                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-scale-up">
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-xs text-slate-400 font-medium">Signed in as</p>
                        <p className="text-sm font-bold text-slate-900 truncate">{user?.email}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                          {user?.role}
                        </span>
                      </div>

                      <div className="py-1">
                        <Link
                          to="/dashboard"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 font-medium"
                        >
                          <Layers className="w-4 h-4 text-slate-500" />
                          Customer Dashboard
                        </Link>

                        {isAdmin && (
                          <Link
                            to="/admin"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-purple-700 hover:bg-purple-50 font-semibold"
                          >
                            <ShieldCheck className="w-4 h-4 text-purple-600" />
                            Admin Console
                          </Link>
                        )}

                        {isAgent && (
                          <Link
                            to="/agent"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-blue-700 hover:bg-blue-50 font-semibold"
                          >
                            <Cpu className="w-4 h-4 text-blue-600" />
                            Agent Field Tasks
                          </Link>
                        )}

                        <Link
                          to="/profile"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 font-medium"
                        >
                          <User className="w-4 h-4 text-slate-500" />
                          Profile Settings
                        </Link>
                      </div>

                      <div className="pt-1 border-t border-slate-100">
                        <button
                          onClick={handleLogout}
                          className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 font-medium"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-bold text-slate-700 hover:text-slate-900 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md shadow-slate-900/20 transition-all hover:scale-[1.02]"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu toggle */}
          <div className="flex items-center md:hidden gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2 animate-slide-up">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg font-medium text-slate-700 hover:bg-slate-100"
          >
            Home
          </Link>
          <Link
            to="/valuation"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg font-medium text-slate-700 hover:bg-slate-100"
          >
            Valuation Wizard
          </Link>
          <Link
            to="/exchange"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg font-medium text-slate-700 hover:bg-slate-100"
          >
            Exchange
          </Link>
          <Link
            to="/repair"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg font-medium text-slate-700 hover:bg-slate-100"
          >
            Repair
          </Link>

          {isAuthenticated ? (
            <>
              <div className="pt-2 border-t border-slate-100 space-y-1">
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg font-medium text-emerald-700 bg-emerald-50"
                >
                  Dashboard
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg font-medium text-purple-700 bg-purple-50"
                  >
                    Admin Console
                  </Link>
                )}
                {isAgent && (
                  <Link
                    to="/agent"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg font-medium text-blue-700 bg-blue-50"
                  >
                    Agent Tasks
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 rounded-lg font-medium text-rose-600 hover:bg-rose-50"
                >
                  Sign Out
                </button>
              </div>
            </>
          ) : (
            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-xl border border-slate-300 font-bold text-slate-700"
              >
                Log In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-xl bg-slate-900 text-white font-bold"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};
