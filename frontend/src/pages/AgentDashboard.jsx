import React, { useState, useEffect } from 'react';
import { agentAPI, sellAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Navbar } from '../components/common/Navbar';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Loader } from '../components/common/Loader';
import {
  Cpu,
  MapPin,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  Check,
  User,
  Phone,
  FileCheck
} from 'lucide-react';

export const AgentDashboard = () => {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState({
    metrics: {},
    sell_requests: [],
    exchange_requests: [],
    repair_requests: [],
    pickups: []
  });

  // Inspection modal
  const [inspectionModalOpen, setInspectionModalOpen] = useState(false);
  const [activeTask, setActiveTask] = useState(null);
  const [finalPrice, setFinalPrice] = useState('');
  const [verifiedCondition, setVerifiedCondition] = useState('Good');
  const [inspectionNotes, setInspectionNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchAgentTasks = async () => {
    try {
      const res = await agentAPI.getTasks();
      if (res.data?.data) {
        setTasks(res.data.data);
      }
    } catch (err) {
      console.error("Agent tasks load error:", err);
      addToast('Failed to load agent assignments', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgentTasks();
  }, []);

  const openInspection = (task) => {
    setActiveTask(task);
    setFinalPrice(task.estimated_price || '');
    setVerifiedCondition(task.device?.overall_condition || 'Good');
    setInspectionNotes('');
    setInspectionModalOpen(true);
  };

  const handleInspectionSubmit = async (e) => {
    e.preventDefault();
    if (!finalPrice) {
      addToast('Please enter the verified final price', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await agentAPI.submitInspection(activeTask.id, {
        final_price: parseFloat(finalPrice),
        verified_condition: verifiedCondition,
        notes: inspectionNotes,
        status: 'Completed'
      });
      addToast('Inspection report submitted and customer payout released!', 'success');
      setInspectionModalOpen(false);
      fetchAgentTasks();
    } catch (err) {
      addToast('Failed to submit inspection', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const metrics = tasks.metrics || {};

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold text-xs">
              Field Operations Console
            </span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mt-1">
            Agent Assignments & Inspections
          </h1>
          <p className="text-sm text-slate-500">
            Welcome, {user?.full_name}. Verify hardware, conduct physical diagnostics, and confirm doorstep transactions.
          </p>
        </div>

        {loading ? (
          <Loader message="Loading assigned pickups..." />
        ) : (
          <>
            {/* Quick Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-5">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Assigned Pickups</span>
                <span className="text-3xl font-black text-slate-900 mt-1 block">{metrics.total_assigned || 0}</span>
              </Card>

              <Card className="p-5">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Pending Inspections</span>
                <span className="text-3xl font-black text-amber-600 mt-1 block">{metrics.pending_inspections || 0}</span>
              </Card>

              <Card className="p-5">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Repair Pickups</span>
                <span className="text-3xl font-black text-blue-600 mt-1 block">{metrics.assigned_repairs || 0}</span>
              </Card>

              <Card className="p-5">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Completed Pickups</span>
                <span className="text-3xl font-black text-emerald-600 mt-1 block">{metrics.completed_tasks || 0}</span>
              </Card>
            </div>

            {/* Assigned Sell & Inspection Requests */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-900">Assigned Sell Requests & Doorstep Inspections</h3>

              {tasks.sell_requests.length === 0 ? (
                <Card className="text-center py-10 text-xs text-slate-400">
                  No sell assignments pending.
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tasks.sell_requests.map((s) => (
                    <Card key={s.id} hover className="p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-xs text-slate-700">{s.request_code}</span>
                        <Badge variant={s.status === 'Completed' ? 'success' : 'info'}>{s.status}</Badge>
                      </div>

                      <div className="space-y-1">
                        <h4 className="text-base font-bold text-slate-900">
                          {s.device ? `${s.device.brand} ${s.device.model}` : 'Smart Device'}
                        </h4>
                        <p className="text-xs text-slate-500">
                          Storage: {s.device?.storage}GB • Declared Condition: {s.device?.overall_condition}
                        </p>
                      </div>

                      <div className="p-3 bg-slate-50 rounded-xl space-y-1 text-xs text-slate-600">
                        <div className="flex items-center gap-2">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-semibold">{s.user_name} ({s.user_phone || 'No phone'})</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{s.pickup_address}, {s.city}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{s.pickup_date} ({s.pickup_time})</span>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-slate-400 block uppercase font-bold">Estimated Offer</span>
                          <span className="text-lg font-black text-emerald-600">₹{Number(s.final_price || s.estimated_price).toLocaleString('en-IN')}</span>
                        </div>

                        {s.status !== 'Completed' && (
                          <Button
                            size="sm"
                            icon={FileCheck}
                            className="bg-blue-600 hover:bg-blue-500"
                            onClick={() => openInspection(s)}
                          >
                            Submit Inspection
                          </Button>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Inspection Modal */}
      <Modal
        isOpen={inspectionModalOpen}
        onClose={() => setInspectionModalOpen(false)}
        title={`Field Inspection: ${activeTask?.request_code}`}
      >
        <form onSubmit={handleInspectionSubmit} className="space-y-4 text-xs">
          <p className="text-slate-500">
            Verify hardware operation, display pixels, and cosmetic surfaces. Adjust the final payout amount if discrepancies are discovered.
          </p>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Verified Overall Condition</label>
            <select
              value={verifiedCondition}
              onChange={(e) => setVerifiedCondition(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 font-semibold"
            >
              <option value="Excellent">Excellent - Flawless, zero scratches, battery healthy</option>
              <option value="Good">Good - Minor normal wear, fully functional</option>
              <option value="Fair">Fair - Visible abrasions, body dents, or battery wear</option>
              <option value="Poor">Poor - Cracked body, severe issues, or display lines</option>
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Verified Final Offer Amount (INR) *</label>
            <input
              type="number"
              required
              value={finalPrice}
              onChange={(e) => setFinalPrice(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 font-black text-emerald-700 text-sm"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Inspection Notes & Customer Confirmation</label>
            <textarea
              rows="2"
              value={inspectionNotes}
              onChange={(e) => setInspectionNotes(e.target.value)}
              placeholder="e.g. Device checked on spot. Touch functional, minor scratch on back panel. Customer agreed on revised offer."
              className="w-full p-2.5 rounded-xl border border-slate-200"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setInspectionModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" loading={submitting}>
              Complete & Release Payout
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
