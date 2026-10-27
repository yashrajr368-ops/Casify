import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { repairAPI, devicesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import {
  Wrench,
  Smartphone,
  Battery,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  Upload,
  Cpu,
  Tv,
  Camera,
  Volume2,
  Sparkles
} from 'lucide-react';

const REPAIR_TYPES = [
  { id: 'Screen', name: 'Screen Replacement', icon: Tv, desc: 'Cracked outer glass or flickering OLED/LCD display' },
  { id: 'Battery', name: 'Battery Replacement', icon: Battery, desc: 'Fast drain, swelling, or low peak performance' },
  { id: 'Charging Port', name: 'Charging Port Repair', icon: Cpu, desc: 'Loose USB-C / Lightning port or slow charging' },
  { id: 'Camera', name: 'Camera & Lens Fix', icon: Camera, desc: 'Scratched lens, autofocus failure or blur' },
  { id: 'Speaker', name: 'Speaker & Mic Service', icon: Volume2, desc: 'Muffled earpiece, distorted audio, dead mic' },
  { id: 'Software', name: 'OS & Software Recovery', icon: Sparkles, desc: 'Bootloop, update crashes, performance clean' },
  { id: 'Other', name: 'General Diagnostic', icon: Wrench, desc: 'Water damage or unlisted hardware defects' }
];

export const RepairPage = () => {
  const { user, isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedType, setSelectedType] = useState('Screen');
  const [category, setCategory] = useState('Smartphone');
  const [problemDesc, setProblemDesc] = useState('');
  const [deviceName, setDeviceName] = useState('Smartphone');
  const [estimatedCost, setEstimatedCost] = useState(3500);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    pickup_address: user?.address || '',
    pickup_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    pickup_time: '10:00 AM - 01:00 PM'
  });

  // Fetch dynamic estimate from backend
  useEffect(() => {
    const fetchEstimate = async () => {
      try {
        const res = await repairAPI.getEstimate(selectedType, category);
        if (res.data?.data) {
          setEstimatedCost(res.data.data.estimated_cost);
        }
      } catch (err) {
        // Fallback default
        setEstimatedCost(selectedType === 'Screen' ? 3500 : 1800);
      }
    };
    fetchEstimate();
  }, [selectedType, category]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      addToast('Please login to finalize your repair appointment', 'info');
      navigate('/login', { state: { from: location } });
      return;
    }

    if (!problemDesc.trim()) {
      addToast('Please describe the issue with your device', 'error');
      return;
    }

    if (!form.pickup_address || !form.pickup_date) {
      addToast('Please enter your pickup address and date', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await repairAPI.create({
        repair_type: selectedType,
        problem_description: problemDesc,
        device_name: deviceName,
        estimated_cost: estimatedCost,
        ...form
      });

      const repReq = res.data?.data?.repair_request;
      addToast(`Repair appointment ${repReq.request_code} booked successfully!`, 'success');
      navigate(`/tracking?code=${repReq.request_code}&type=repair&id=${repReq.id}`);
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to book repair', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Doorstep Certified Device Repair
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Genuine OEM-grade replacement parts with a 6-month free warranty. We collect, repair, and return to your door.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left 2 Cols: Repair Type Selection & Issue Description */}
        <div className="lg:col-span-2 space-y-6">
          {/* Repair Category Selector */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
              1. What needs fixing?
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {REPAIR_TYPES.map((type) => {
                const Icon = type.icon;
                const isSelected = selectedType === type.id;
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setSelectedType(type.id)}
                    className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/40 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{type.name}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{type.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Device details & problem description */}
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1.5">
                2. Device Brand & Model
              </label>
              <input
                type="text"
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
                placeholder="e.g. iPhone 13 or MacBook Air M1"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1.5">
                3. Describe the Problem
              </label>
              <textarea
                rows="3"
                value={problemDesc}
                onChange={(e) => setProblemDesc(e.target.value)}
                placeholder="Detail what happened, touch response issues, battery drop percentage, etc."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Right Col: Price Estimate & Pickup Scheduling */}
        <div className="space-y-6">
          <Card className="p-6 bg-slate-950 text-white border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Transparent Quote</span>
              <Badge variant="brand">OEM Grade</Badge>
            </div>

            <div>
              <span className="text-xs text-slate-400 block uppercase">Estimated Repair Cost</span>
              <span className="text-3xl font-black text-emerald-400">
                ₹{Number(estimatedCost).toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-slate-400 block mt-1">Includes labor, parts & doorstep return</span>
            </div>

            <div className="space-y-2 text-xs text-slate-400 pt-3 border-t border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>6-Month Free Repair Warranty</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Pay after inspection & test run</span>
              </div>
            </div>
          </Card>

          <Card className="p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600" /> Schedule Device Collection
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Collection Address *</label>
                <textarea
                  rows="2"
                  required
                  value={form.pickup_address}
                  onChange={(e) => setForm({ ...form, pickup_address: e.target.value })}
                  placeholder="Where should our technician collect your device?"
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Collection Date *</label>
                <input
                  type="date"
                  required
                  value={form.pickup_date}
                  onChange={(e) => setForm({ ...form, pickup_date: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Time Slot</label>
                <select
                  value={form.pickup_time}
                  onChange={(e) => setForm({ ...form, pickup_time: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-semibold"
                >
                  <option value="10:00 AM - 01:00 PM">10:00 AM - 01:00 PM</option>
                  <option value="02:00 PM - 05:00 PM">02:00 PM - 05:00 PM</option>
                </select>
              </div>

              <Button
                type="submit"
                loading={loading}
                size="md"
                className="w-full py-3 mt-2"
                icon={Wrench}
              >
                Book Repair Service
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};
