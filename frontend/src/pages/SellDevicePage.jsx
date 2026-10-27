import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { sellAPI, devicesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import {
  Zap,
  MapPin,
  Calendar,
  Clock,
  ShieldCheck,
  AlertCircle,
  Smartphone,
  ArrowRight
} from 'lucide-react';

export const SellDevicePage = () => {
  const { user, isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const stateDevice = location.state?.device;
  const statePrediction = location.state?.prediction;

  const [device, setDevice] = useState(stateDevice || null);
  const [prediction, setPrediction] = useState(statePrediction || null);
  const [userDevices, setUserDevices] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    pickup_address: user?.address || '',
    city: user?.city || 'Bengaluru',
    state: user?.state || 'Karnataka',
    pincode: user?.pincode || '560001',
    pickup_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    pickup_time: '10:00 AM - 01:00 PM',
    notes: ''
  });

  // If no device passed in state, fetch user's devices
  useEffect(() => {
    if (!device && isAuthenticated) {
      devicesAPI.list().then((res) => {
        const devs = res.data?.data?.devices || [];
        setUserDevices(devs);
        if (devs.length > 0) {
          setDevice(devs[0]);
          setPrediction(devs[0].latest_prediction);
        }
      });
    }
  }, [device, isAuthenticated]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      addToast('Please login to finalize your pickup request', 'info');
      navigate('/login', { state: { from: location } });
      return;
    }

    if (!device?.id) {
      addToast('Please select or evaluate a device first', 'error');
      return;
    }

    if (!form.pickup_address || !form.city || !form.pincode || !form.pickup_date) {
      addToast('Please fill all required address & scheduling fields', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await sellAPI.create({
        device_id: device.id,
        estimated_price: prediction?.predicted_price || 15000,
        ...form
      });

      const sellReq = res.data?.data?.sell_request;
      addToast(`Sell request ${sellReq.request_code} created successfully!`, 'success');
      navigate(`/tracking?code=${sellReq.request_code}&type=sell&id=${sellReq.id}`);
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to submit sell request', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Schedule Free Doorstep Pickup
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Lock in your AI valuation offer. Our certified executive will verify hardware and initiate instant bank transfer.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Device & Price Summary */}
        <div className="space-y-6">
          <Card className="bg-slate-950 text-white border-slate-800 p-6 space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                <Zap className="w-3.5 h-3.5" /> Guaranteed Quote
              </span>
              <Badge variant="brand">Ready for Pickup</Badge>
            </div>

            {device ? (
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">{device.brand} {device.model}</h3>
                <p className="text-xs text-slate-400">
                  {device.storage}GB • {device.overall_condition} Condition • {device.purchase_year}
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-400">No device selected</p>
            )}

            <div className="pt-4 border-t border-slate-800">
              <span className="text-[11px] text-slate-400 block uppercase font-bold">Offer Value</span>
              <span className="text-3xl font-black text-emerald-400">
                ₹{Number(prediction?.predicted_price || 18500).toLocaleString('en-IN')}
              </span>
            </div>

            <div className="space-y-2 text-xs text-slate-400 pt-2 border-t border-slate-800/80">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Zero pickup or convenience charges</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Certified on-spot data wipe guarantee</span>
              </div>
            </div>
          </Card>

          {userDevices.length > 1 && (
            <Card className="p-4 space-y-2">
              <label className="text-xs font-bold text-slate-700 block">Switch Selling Device</label>
              <select
                className="w-full text-xs p-2 rounded-lg border border-slate-200"
                value={device?.id}
                onChange={(e) => {
                  const selected = userDevices.find((d) => d.id === parseInt(e.target.value));
                  if (selected) {
                    setDevice(selected);
                    setPrediction(selected.latest_prediction);
                  }
                }}
              >
                {userDevices.map((d) => (
                  <option key={d.id} value={d.id}>{d.brand} {d.model} ({d.storage}GB)</option>
                ))}
              </select>
            </Card>
          )}
        </div>

        {/* Right Column: Address & Schedule Form */}
        <div className="lg:col-span-2">
          <Card className="p-8 space-y-6">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-600" /> Pickup & Scheduling Information
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Complete Street Address *
                </label>
                <input
                  type="text"
                  required
                  value={form.pickup_address}
                  onChange={(e) => setForm({ ...form, pickup_address: e.target.value })}
                  placeholder="Flat / House No., Apartment name, Street"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">State *</label>
                  <input
                    type="text"
                    required
                    value={form.state}
                    onChange={(e) => setForm({ ...form, state: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Pincode *</label>
                  <input
                    type="text"
                    required
                    value={form.pincode}
                    onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Preferred Date *
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="date"
                      required
                      value={form.pickup_date}
                      onChange={(e) => setForm({ ...form, pickup_date: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Preferred Time Slot *
                  </label>
                  <div className="relative">
                    <Clock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <select
                      value={form.pickup_time}
                      onChange={(e) => setForm({ ...form, pickup_time: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="10:00 AM - 01:00 PM">10:00 AM - 01:00 PM (Morning)</option>
                      <option value="02:00 PM - 05:00 PM">02:00 PM - 05:00 PM (Afternoon)</option>
                      <option value="05:00 PM - 08:00 PM">05:00 PM - 08:00 PM (Evening)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Pickup Instructions / Landmarks (Optional)
                </label>
                <textarea
                  rows="2"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="e.g. Near city park, call before arriving"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl flex items-start gap-3 text-xs text-emerald-900">
                <AlertCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  By booking this pickup, you confirm that the device is legally owned and free from cloud or carrier locks. Payment is credited directly into your bank or UPI account during inspection.
                </span>
              </div>

              <Button
                type="submit"
                loading={loading}
                size="lg"
                className="w-full py-4 text-base mt-2"
                icon={Zap}
              >
                Confirm Pickup & Sell Device
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};
