import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { userAPI, devicesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Loader } from '../components/common/Loader';
import {
  Smartphone,
  TrendingUp,
  Clock,
  CheckCircle2,
  Plus,
  Repeat,
  Wrench,
  Zap,
  ArrowRight,
  ShieldCheck,
  Calendar,
  AlertCircle
} from 'lucide-react';

export const CustomerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    devices_added: 0,
    valuations_performed: 0,
    active_requests: 0,
    completed_transactions: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [userDevices, setUserDevices] = useState([]);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [dashRes, devRes] = await Promise.all([
          userAPI.getDashboard(),
          devicesAPI.list()
        ]);
        if (dashRes.data?.data) {
          setStats(dashRes.data.data.stats || {});
          setRecentActivities(dashRes.data.data.recent_activities || []);
        }
        if (devRes.data?.data) {
          setUserDevices(devRes.data.data.devices || []);
        }
      } catch (err) {
        console.error("Dashboard data load notice:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const getStatusBadge = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'completed') return <Badge variant="success">Completed</Badge>;
    if (s.includes('final offer')) return <Badge variant="brand">Final Offer</Badge>;
    if (s.includes('assigned') || s.includes('scheduled')) return <Badge variant="info">{status}</Badge>;
    if (s === 'requested') return <Badge variant="warning">Requested</Badge>;
    return <Badge>{status}</Badge>;
  };

  return (
    <DashboardLayout
      title={`Hello, ${user?.full_name?.split(' ')[0]} 👋`}
      subtitle="Welcome to your RETECH AI device command center"
    >
      {loading ? (
        <Loader message="Loading your dashboard portfolio..." />
      ) : (
        <div className="space-y-8">
          {/* Top 4 KPI Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <span className="text-2xl font-black text-slate-900 block">{stats.devices_added}</span>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Devices Added</span>
              </div>
            </Card>

            <Card className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <span className="text-2xl font-black text-slate-900 block">{stats.valuations_performed}</span>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">AI Valuations</span>
              </div>
            </Card>

            <Card className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <span className="text-2xl font-black text-slate-900 block">{stats.active_requests}</span>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Requests</span>
              </div>
            </Card>

            <Card className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-2xl font-black text-slate-900 block">{stats.completed_transactions}</span>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Completed</span>
              </div>
            </Card>
          </div>

          {/* Quick Actions Strip */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-950 rounded-3xl p-6 sm:p-8 text-white shadow-lg space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold">Quick Actions</h3>
                <p className="text-xs text-slate-400">Instantly execute device lifecycle requests</p>
              </div>
              <div className="flex flex-wrap gap-2.5">
                <Link to="/valuation">
                  <Button size="sm" icon={Plus} className="bg-emerald-600 hover:bg-emerald-500">
                    Add & Value Device
                  </Button>
                </Link>
                <Link to="/exchange">
                  <Button size="sm" variant="secondary" icon={Repeat} className="bg-slate-800 hover:bg-slate-700">
                    Exchange Device
                  </Button>
                </Link>
                <Link to="/repair">
                  <Button size="sm" variant="outline" icon={Wrench} className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700">
                    Book Repair
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* User's Devices Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Your Registered Devices</h3>
                <p className="text-xs text-slate-500">Devices currently valued and linked to your profile</p>
              </div>
              <Link to="/valuation" className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                + Value Another <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {userDevices.length === 0 ? (
              <Card className="text-center py-12 space-y-4 border-dashed">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">No Devices Registered Yet</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                    Add your used smartphone, laptop, tablet, or smartwatch to receive an instant ML price estimate.
                  </p>
                </div>
                <Link to="/valuation">
                  <Button size="sm" icon={Plus}>Start Device Valuation</Button>
                </Link>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {userDevices.map((dev) => {
                  const latestVal = dev.latest_prediction?.predicted_price;
                  return (
                    <Card key={dev.id} hover className="flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="default">{dev.category}</Badge>
                          <span className="text-[11px] text-slate-400 font-semibold">{dev.purchase_year}</span>
                        </div>
                        <h4 className="text-base font-bold text-slate-900">{dev.brand} {dev.model}</h4>
                        <p className="text-xs text-slate-500 mt-1">
                          Condition: {dev.overall_condition} • Battery: {dev.battery_health || 85}%
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-slate-400 block uppercase font-bold">Resale Quote</span>
                          <span className="text-lg font-black text-emerald-600">
                            {latestVal ? `₹${Number(latestVal).toLocaleString('en-IN')}` : 'Calculating...'}
                          </span>
                        </div>
                        <div className="flex gap-1.5">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => navigate('/sell', { state: { device: dev, prediction: dev.latest_prediction } })}
                          >
                            Sell
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate('/exchange', { state: { device: dev, prediction: dev.latest_prediction } })}
                          >
                            Exchange
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent Activity Table */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Recent Service Requests</h3>
                <p className="text-xs text-slate-500">Live timeline updates for your sell, exchange, and repair bookings</p>
              </div>
            </div>

            {recentActivities.length === 0 ? (
              <Card className="text-center py-8 text-xs text-slate-400">
                No active or historical requests found.
              </Card>
            ) : (
              <Card className="p-0 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-100">
                      <tr>
                        <th className="px-6 py-3.5">Request ID</th>
                        <th className="px-6 py-3.5">Type & Device</th>
                        <th className="px-6 py-3.5">Status</th>
                        <th className="px-6 py-3.5">Amount</th>
                        <th className="px-6 py-3.5">Date</th>
                        <th className="px-6 py-3.5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {recentActivities.map((act) => (
                        <tr key={act.code} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4 font-mono font-bold text-slate-800">
                            {act.code}
                          </td>
                          <td className="px-6 py-4 text-slate-900 font-semibold">
                            {act.title}
                          </td>
                          <td className="px-6 py-4">
                            {getStatusBadge(act.status)}
                          </td>
                          <td className="px-6 py-4 font-bold text-emerald-600">
                            ₹{Number(act.amount || 0).toLocaleString('en-IN')}
                          </td>
                          <td className="px-6 py-4 text-slate-500">
                            {new Date(act.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Link
                              to={`/tracking?code=${act.code}&type=${act.type}&id=${act.id}`}
                              className="text-emerald-600 hover:text-emerald-700 font-bold"
                            >
                              Track Status →
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};
