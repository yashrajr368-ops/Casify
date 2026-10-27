import React, { useState, useEffect } from 'react';
import { adminAPI, catalogAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Navbar } from '../components/common/Navbar';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Loader } from '../components/common/Loader';
import {
  Users,
  Smartphone,
  TrendingUp,
  Clock,
  DollarSign,
  ShieldCheck,
  Search,
  Filter,
  UserCheck,
  Trash2,
  Edit,
  Plus,
  ArrowRight,
  Repeat,
  Wrench,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

const PIE_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899'];

export const AdminDashboard = () => {
  const { addToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('requests'); // 'requests', 'users', 'catalog'

  // Data states
  const [allRequests, setAllRequests] = useState({ sell_requests: [], exchange_requests: [], repair_requests: [] });
  const [usersList, setUsersList] = useState([]);
  const [agentsList, setAgentsList] = useState([]);
  const [catalogList, setCatalogList] = useState([]);

  // Modals state
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedAgentId, setSelectedAgentId] = useState('');

  const [catalogModalOpen, setCatalogModalOpen] = useState(false);
  const [catalogForm, setCatalogForm] = useState({
    category: 'Smartphone',
    brand: '',
    model: '',
    base_price: '',
    release_year: 2024,
    ram_options: '8,12',
    storage_options: '128,256',
    processor: ''
  });

  const fetchAdminData = async () => {
    try {
      const [dashRes, reqsRes, usersRes, agentsRes, catRes] = await Promise.all([
        adminAPI.getDashboard(),
        adminAPI.getRequests(),
        adminAPI.getUsers(),
        adminAPI.getAgents(),
        catalogAPI.getAll()
      ]);

      if (dashRes.data?.data) setStats(dashRes.data.data);
      if (reqsRes.data?.data) setAllRequests(reqsRes.data.data);
      if (usersRes.data?.data) setUsersList(usersRes.data.data.users || []);
      if (agentsRes.data?.data) {
        const ags = agentsRes.data.data.agents || [];
        setAgentsList(ags);
        if (ags.length > 0) setSelectedAgentId(ags[0].id);
      }
      if (catRes.data?.data) setCatalogList(catRes.data.data.items || []);
    } catch (err) {
      console.error("Admin data error:", err);
      addToast('Failed to load admin analytics', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleAssignAgent = async () => {
    if (!selectedRequest || !selectedAgentId) return;

    try {
      await adminAPI.assignAgent({
        type: selectedRequest.type,
        request_id: selectedRequest.id,
        agent_id: selectedAgentId
      });
      addToast('Agent assigned successfully', 'success');
      setAssignModalOpen(false);
      fetchAdminData();
    } catch (err) {
      addToast('Failed to assign agent', 'error');
    }
  };

  const handleAddCatalog = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.createCatalog(catalogForm);
      addToast('New device added to catalog', 'success');
      setCatalogModalOpen(false);
      fetchAdminData();
    } catch (err) {
      addToast('Failed to create catalog item', 'error');
    }
  };

  const handleDeleteCatalog = async (id) => {
    if (!window.confirm('Are you sure you want to remove this catalog device?')) return;
    try {
      await adminAPI.deleteCatalog(id);
      addToast('Catalog device removed', 'info');
      fetchAdminData();
    } catch (err) {
      addToast('Failed to remove device', 'error');
    }
  };

  const handleChangeRole = async (userId, currentRole) => {
    const nextRole = currentRole === 'CUSTOMER' ? 'AGENT' : currentRole === 'AGENT' ? 'ADMIN' : 'CUSTOMER';
    try {
      await adminAPI.updateUserRole(userId, nextRole);
      addToast(`User role updated to ${nextRole}`, 'success');
      fetchAdminData();
    } catch (err) {
      addToast('Failed to update role', 'error');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Delete this user account?')) return;
    try {
      await adminAPI.deleteUser(userId);
      addToast('User deleted', 'info');
      fetchAdminData();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to delete user', 'error');
    }
  };

  const overview = stats?.overview || {};
  const charts = stats?.charts || {};

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 font-bold text-xs">
                Root System Control
              </span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight mt-1">
              Admin Analytics & Platform Control
            </h1>
            <p className="text-sm text-slate-500">
              Complete real-time oversight of users, device valuations, transactions, and field staff
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              icon={Plus}
              className="bg-purple-700 hover:bg-purple-600"
              onClick={() => setCatalogModalOpen(true)}
            >
              + Add Catalog Device
            </Button>
          </div>
        </div>

        {loading ? (
          <Loader message="Synthesizing platform telemetry..." />
        ) : (
          <>
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="p-5">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Registered Users</span>
                <span className="text-3xl font-black text-slate-900 mt-1 block">{overview.total_users || 0}</span>
                <span className="text-[11px] text-emerald-600 font-bold mt-1 block">+{overview.total_agents || 0} Field Agents</span>
              </Card>

              <Card className="p-5">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Devices Valued</span>
                <span className="text-3xl font-black text-slate-900 mt-1 block">{overview.total_valuations || 0}</span>
                <span className="text-[11px] text-blue-600 font-bold mt-1 block">{overview.total_devices || 0} In User Portfolios</span>
              </Card>

              <Card className="p-5">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Pending Requests</span>
                <span className="text-3xl font-black text-amber-600 mt-1 block">{overview.pending_requests || 0}</span>
                <span className="text-[11px] text-slate-500 font-medium mt-1 block">Requiring Agent Verification</span>
              </Card>

              <Card className="p-5">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Gross Valuation Volume</span>
                <span className="text-3xl font-black text-emerald-600 mt-1 block">
                  ₹{Number(overview.total_volume || 0).toLocaleString('en-IN')}
                </span>
                <span className="text-[11px] text-slate-500 font-medium mt-1 block">Total Transaction Value</span>
              </Card>
            </div>

            {/* Recharts Analytics Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Monthly Activity Bar Chart */}
              <Card className="lg:col-span-2 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-sm">Monthly Transaction Volume (Requests)</h3>
                  <Badge variant="brand">Real-Time Aggregation</Badge>
                </div>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={charts.monthly_activity || []}>
                      <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                      <YAxis stroke="#94a3b8" fontSize={12} />
                      <Tooltip />
                      <Bar dataKey="sell" name="Sell Requests" fill="#10b981" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="exchange" name="Exchanges" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="repair" name="Repairs" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Category Breakdown Pie Chart */}
              <Card className="p-6 space-y-4">
                <h3 className="font-bold text-slate-900 text-sm">Device Category Breakdown</h3>
                <div className="h-64 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={charts.categories || []}
                        dataKey="count"
                        nameKey="category"
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={4}
                      >
                        {(charts.categories || []).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>

            {/* Tab Navigation */}
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
              <button
                type="button"
                onClick={() => setActiveTab('requests')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'requests' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                All Requests ({allRequests.sell_requests?.length + allRequests.exchange_requests?.length + allRequests.repair_requests?.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('users')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'users' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                User & Agent Directory ({usersList.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('catalog')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'catalog' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Device Catalog Manager ({catalogList.length})
              </button>
            </div>

            {/* TAB 1: REQUESTS MANAGEMENT */}
            {activeTab === 'requests' && (
              <Card className="p-0 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-100">
                      <tr>
                        <th className="px-6 py-3.5">Code</th>
                        <th className="px-6 py-3.5">Type</th>
                        <th className="px-6 py-3.5">Customer</th>
                        <th className="px-6 py-3.5">Device Details</th>
                        <th className="px-6 py-3.5">Amount</th>
                        <th className="px-6 py-3.5">Status</th>
                        <th className="px-6 py-3.5">Agent</th>
                        <th className="px-6 py-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {/* Sell Requests */}
                      {(allRequests.sell_requests || []).map((s) => (
                        <tr key={s.request_code} className="hover:bg-slate-50/50">
                          <td className="px-6 py-4 font-mono font-bold text-slate-800">{s.request_code}</td>
                          <td className="px-6 py-4"><Badge variant="success">SELL</Badge></td>
                          <td className="px-6 py-4">{s.user_name || 'Customer'}</td>
                          <td className="px-6 py-4 font-semibold">{s.device ? `${s.device.brand} ${s.device.model}` : 'Device'}</td>
                          <td className="px-6 py-4 font-bold text-emerald-600">₹{Number(s.final_price || s.estimated_price).toLocaleString('en-IN')}</td>
                          <td className="px-6 py-4"><Badge>{s.status}</Badge></td>
                          <td className="px-6 py-4 font-bold text-slate-700">{s.agent_name || <span className="text-slate-400 italic">Unassigned</span>}</td>
                          <td className="px-6 py-4 text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedRequest({ type: 'sell', id: s.id, code: s.request_code });
                                setAssignModalOpen(true);
                              }}
                            >
                              Assign Agent
                            </Button>
                          </td>
                        </tr>
                      ))}

                      {/* Exchange Requests */}
                      {(allRequests.exchange_requests || []).map((e) => (
                        <tr key={e.request_code} className="hover:bg-slate-50/50">
                          <td className="px-6 py-4 font-mono font-bold text-slate-800">{e.request_code}</td>
                          <td className="px-6 py-4"><Badge variant="info">EXCHANGE</Badge></td>
                          <td className="px-6 py-4">{e.user_name || 'Customer'}</td>
                          <td className="px-6 py-4 font-semibold">Upgrade to: {e.target_device_name}</td>
                          <td className="px-6 py-4 font-bold text-blue-600">₹{Number(e.additional_amount).toLocaleString('en-IN')}</td>
                          <td className="px-6 py-4"><Badge>{e.status}</Badge></td>
                          <td className="px-6 py-4 font-bold text-slate-700">{e.agent_name || <span className="text-slate-400 italic">Unassigned</span>}</td>
                          <td className="px-6 py-4 text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedRequest({ type: 'exchange', id: e.id, code: e.request_code });
                                setAssignModalOpen(true);
                              }}
                            >
                              Assign Agent
                            </Button>
                          </td>
                        </tr>
                      ))}

                      {/* Repair Requests */}
                      {(allRequests.repair_requests || []).map((r) => (
                        <tr key={r.request_code} className="hover:bg-slate-50/50">
                          <td className="px-6 py-4 font-mono font-bold text-slate-800">{r.request_code}</td>
                          <td className="px-6 py-4"><Badge variant="warning">REPAIR</Badge></td>
                          <td className="px-6 py-4">{r.user_name || 'Customer'}</td>
                          <td className="px-6 py-4 font-semibold">{r.repair_type} ({r.device_name})</td>
                          <td className="px-6 py-4 font-bold text-amber-600">₹{Number(r.final_cost || r.estimated_cost).toLocaleString('en-IN')}</td>
                          <td className="px-6 py-4"><Badge>{r.status}</Badge></td>
                          <td className="px-6 py-4 font-bold text-slate-700">{r.agent_name || <span className="text-slate-400 italic">Unassigned</span>}</td>
                          <td className="px-6 py-4 text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedRequest({ type: 'repair', id: r.id, code: r.request_code });
                                setAssignModalOpen(true);
                              }}
                            >
                              Assign Agent
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}

            {/* TAB 2: USER DIRECTORY */}
            {activeTab === 'users' && (
              <Card className="p-0 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-100">
                      <tr>
                        <th className="px-6 py-3.5">Name</th>
                        <th className="px-6 py-3.5">Email</th>
                        <th className="px-6 py-3.5">Phone</th>
                        <th className="px-6 py-3.5">Location</th>
                        <th className="px-6 py-3.5">Role</th>
                        <th className="px-6 py-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {usersList.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-50/50">
                          <td className="px-6 py-4 font-bold text-slate-900">{u.full_name}</td>
                          <td className="px-6 py-4 text-slate-600">{u.email}</td>
                          <td className="px-6 py-4 text-slate-500">{u.phone || 'N/A'}</td>
                          <td className="px-6 py-4 text-slate-500">{u.city ? `${u.city}, ${u.state}` : 'N/A'}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                              u.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : u.role === 'AGENT' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right space-x-2">
                            <button
                              type="button"
                              onClick={() => handleChangeRole(u.id, u.role)}
                              className="text-emerald-700 hover:text-emerald-800 font-bold"
                            >
                              Toggle Role
                            </button>
                            {u.email !== 'admin@retechai.com' && (
                              <button
                                type="button"
                                onClick={() => handleDeleteUser(u.id)}
                                className="text-rose-600 hover:text-rose-700 font-bold ml-2"
                              >
                                Delete
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}

            {/* TAB 3: CATALOG MANAGER */}
            {activeTab === 'catalog' && (
              <Card className="p-0 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-100">
                      <tr>
                        <th className="px-6 py-3.5">Category</th>
                        <th className="px-6 py-3.5">Brand</th>
                        <th className="px-6 py-3.5">Model</th>
                        <th className="px-6 py-3.5">Base Retail Price</th>
                        <th className="px-6 py-3.5">Release Year</th>
                        <th className="px-6 py-3.5">Processor</th>
                        <th className="px-6 py-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {catalogList.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/50">
                          <td className="px-6 py-4"><Badge>{item.category}</Badge></td>
                          <td className="px-6 py-4 font-bold text-slate-800">{item.brand}</td>
                          <td className="px-6 py-4 font-semibold text-slate-900">{item.model}</td>
                          <td className="px-6 py-4 font-black text-emerald-600">₹{Number(item.base_price).toLocaleString('en-IN')}</td>
                          <td className="px-6 py-4 text-slate-500">{item.release_year}</td>
                          <td className="px-6 py-4 text-slate-500">{item.processor || 'Standard'}</td>
                          <td className="px-6 py-4 text-right">
                            <button
                              type="button"
                              onClick={() => handleDeleteCatalog(item.id)}
                              className="text-rose-600 hover:text-rose-800 font-bold"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </>
        )}
      </div>

      {/* Assign Agent Modal */}
      <Modal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        title={`Assign Agent to ${selectedRequest?.code}`}
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-500">
            Select a verified field agent to conduct the doorstep verification and inspection:
          </p>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Available Field Staff</label>
            <select
              value={selectedAgentId}
              onChange={(e) => setSelectedAgentId(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold"
            >
              {agentsList.map((a) => (
                <option key={a.id} value={a.id}>{a.full_name} ({a.city || 'Hub'})</option>
              ))}
            </select>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setAssignModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleAssignAgent}>
              Confirm Assignment
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add Catalog Device Modal */}
      <Modal
        isOpen={catalogModalOpen}
        onClose={() => setCatalogModalOpen(false)}
        title="Add New Catalog Hardware Specification"
      >
        <form onSubmit={handleAddCatalog} className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Category</label>
              <select
                value={catalogForm.category}
                onChange={(e) => setCatalogForm({ ...catalogForm, category: e.target.value })}
                className="w-full p-2 rounded-xl border border-slate-200"
              >
                <option value="Smartphone">Smartphone</option>
                <option value="Laptop">Laptop</option>
                <option value="Tablet">Tablet</option>
                <option value="Smartwatch">Smartwatch</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Brand Name</label>
              <input
                type="text"
                required
                value={catalogForm.brand}
                onChange={(e) => setCatalogForm({ ...catalogForm, brand: e.target.value })}
                placeholder="e.g. Apple"
                className="w-full p-2 rounded-xl border border-slate-200"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Model Name</label>
            <input
              type="text"
              required
              value={catalogForm.model}
              onChange={(e) => setCatalogForm({ ...catalogForm, model: e.target.value })}
              placeholder="e.g. iPhone 16 Pro"
              className="w-full p-2 rounded-xl border border-slate-200"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Base Price (INR)</label>
              <input
                type="number"
                required
                value={catalogForm.base_price}
                onChange={(e) => setCatalogForm({ ...catalogForm, base_price: e.target.value })}
                placeholder="119900"
                className="w-full p-2 rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Release Year</label>
              <input
                type="number"
                required
                value={catalogForm.release_year}
                onChange={(e) => setCatalogForm({ ...catalogForm, release_year: parseInt(e.target.value) })}
                placeholder="2024"
                className="w-full p-2 rounded-xl border border-slate-200"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Processor</label>
            <input
              type="text"
              value={catalogForm.processor}
              onChange={(e) => setCatalogForm({ ...catalogForm, processor: e.target.value })}
              placeholder="e.g. Apple A18 Pro"
              className="w-full p-2 rounded-xl border border-slate-200"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setCatalogModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm">
              Save Device to Catalog
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
