import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { exchangeAPI, catalogAPI, devicesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import {
  Repeat,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  Calendar,
  Sparkles
} from 'lucide-react';

export const ExchangeDevicePage = () => {
  const { user, isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [oldDevice, setOldDevice] = useState(location.state?.device || null);
  const [userDevices, setUserDevices] = useState([]);
  const [catalogItems, setCatalogItems] = useState([]);
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    pickup_address: user?.address || '',
    pickup_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    pickup_time: '10:00 AM - 01:00 PM'
  });

  // Fetch available catalog items and user devices
  useEffect(() => {
    const loadData = async () => {
      try {
        const catRes = await catalogAPI.getAll();
        const items = catRes.data?.data?.items || [];
        setCatalogItems(items);
        if (items.length > 0) {
          setSelectedTarget(items[0]);
        }

        if (isAuthenticated) {
          const devRes = await devicesAPI.list();
          const devs = devRes.data?.data?.devices || [];
          setUserDevices(devs);
          if (!oldDevice && devs.length > 0) {
            setOldDevice(devs[0]);
          }
        }
      } catch (err) {
        console.error("Exchange data load notice:", err);
      }
    };
    loadData();
  }, [isAuthenticated]);

  const oldDeviceValue = oldDevice?.latest_prediction?.predicted_price || 22000;
  const targetDevicePrice = selectedTarget?.base_price || 65000;
  const additionalAmount = Math.max(0, targetDevicePrice - oldDeviceValue);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      addToast('Please login to finalize your exchange booking', 'info');
      navigate('/login', { state: { from: location } });
      return;
    }

    if (!oldDevice?.id || !selectedTarget) {
      addToast('Please select both your current device and the upgrade device', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await exchangeAPI.create({
        old_device_id: oldDevice.id,
        new_device_id: selectedTarget.id,
        target_device_name: `${selectedTarget.brand} ${selectedTarget.model}`,
        target_device_price: targetDevicePrice,
        old_device_value: oldDeviceValue,
        pickup_address: form.pickup_address,
        pickup_date: form.pickup_date,
        pickup_time: form.pickup_time
      });

      const exchReq = res.data?.data?.exchange_request;
      addToast(`Exchange request ${exchReq.request_code} placed successfully!`, 'success');
      navigate(`/tracking?code=${exchReq.request_code}&type=exchange&id=${exchReq.id}`);
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to place exchange request', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Smart Device Upgrade & Exchange
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Trade in your existing device and pay only the difference amount at doorstep delivery.
        </p>
      </div>

      {/* Exchange Comparison Ribbon */}
      <div className="bg-slate-950 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        {/* Old Device */}
        <div className="space-y-2 p-4 bg-slate-900/90 rounded-2xl border border-slate-800">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Your Trade-In Device</span>
          <h3 className="text-lg font-bold text-white">
            {oldDevice ? `${oldDevice.brand} ${oldDevice.model}` : 'Generic Smartphone'}
          </h3>
          <span className="text-2xl font-black text-emerald-400 block">
            ₹{Number(oldDeviceValue).toLocaleString('en-IN')}
          </span>
          <span className="text-[11px] text-slate-400">Assessed Trade-In Credit</span>
        </div>

        {/* Transition arrow / Difference */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
            <Repeat className="w-6 h-6" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Net Payable Difference</span>
          <span className="text-3xl font-black text-white block">
            ₹{Number(additionalAmount).toLocaleString('en-IN')}
          </span>
          <span className="text-[10px] text-emerald-400 font-semibold">Doorstep UPI / Card / Cash</span>
        </div>

        {/* New Device */}
        <div className="space-y-2 p-4 bg-slate-900/90 rounded-2xl border border-slate-800">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Desired Upgrade Device</span>
          <h3 className="text-lg font-bold text-white">
            {selectedTarget ? `${selectedTarget.brand} ${selectedTarget.model}` : 'Catalog Item'}
          </h3>
          <span className="text-2xl font-black text-white block">
            ₹{Number(targetDevicePrice).toLocaleString('en-IN')}
          </span>
          <span className="text-[11px] text-slate-400">Brand Certified Retail Price</span>
        </div>
      </div>

      {/* Target Device Selection & Address Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Select Target Device from Catalog */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-bold text-slate-900">Select Your New Device to Upgrade to</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
            {catalogItems.map((item) => {
              const isSelected = selectedTarget?.id === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedTarget(item)}
                  className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/40 shadow-md shadow-emerald-600/10'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-500">{item.brand}</span>
                      <Badge variant={isSelected ? 'success' : 'default'}>{item.category}</Badge>
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm">{item.model}</h4>
                    <p className="text-xs text-slate-500 mt-1">Processor: {item.processor || 'High-Performance'}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-base font-black text-slate-900">
                      ₹{Number(item.base_price).toLocaleString('en-IN')}
                    </span>
                    {isSelected && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Pickup & Exchange Form */}
        <Card className="p-6 space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-600" /> Exchange Address
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Doorstep Address *</label>
              <textarea
                rows="2"
                required
                value={form.pickup_address}
                onChange={(e) => setForm({ ...form, pickup_address: e.target.value })}
                placeholder="Full delivery & pickup address"
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Exchange Date *</label>
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

            <div className="pt-2 border-t border-slate-100">
              <div className="flex justify-between py-1 text-slate-600">
                <span>Net Payable:</span>
                <span className="font-bold text-slate-900">₹{Number(additionalAmount).toLocaleString('en-IN')}</span>
              </div>
            </div>

            <Button
              type="submit"
              loading={loading}
              size="md"
              className="w-full py-3"
              icon={Repeat}
            >
              Confirm Device Exchange
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};
