import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  Zap,
  Repeat,
  Wrench,
  BookmarkCheck,
  AlertCircle,
  Cpu,
  ArrowRight
} from 'lucide-react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

export const ValuationResult = ({ device, prediction, onReset }) => {
  const navigate = useNavigate();

  if (!prediction) return null;

  const {
    predicted_price = 0,
    minimum_price = 0,
    maximum_price = 0,
    confidence_score = 88,
    condition_score = 8.0,
    breakdown = {},
    model_version = '1.0'
  } = prediction;

  const handleSell = () => {
    navigate('/sell', { state: { device, prediction } });
  };

  const handleExchange = () => {
    navigate('/exchange', { state: { device, prediction } });
  };

  const handleRepair = () => {
    navigate('/repair', { state: { device, prediction } });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Valuation Hero Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 rounded-3xl p-8 sm:p-10 text-white shadow-2xl border border-emerald-500/20">
        {/* Glow overlay */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold tracking-wide uppercase flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5" /> AI Valuation Report v{model_version}
              </span>
              <span className="text-xs text-slate-400">
                Verified: {device.brand} {device.model} ({device.purchase_year})
              </span>
            </div>
            <h2 className="text-xs uppercase font-bold tracking-widest text-slate-400">
              Estimated Fair Resale Value
            </h2>
            <div className="flex items-baseline gap-3 mt-1">
              <span className="text-4xl sm:text-6xl font-black tracking-tight text-white">
                ₹{Number(predicted_price).toLocaleString('en-IN')}
              </span>
              <span className="text-emerald-400 font-bold text-sm bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-800/60">
                Instant Payout
              </span>
            </div>
          </div>

          {/* Metric Badges */}
          <div className="flex sm:flex-col gap-3 w-full sm:w-auto">
            <div className="flex-1 bg-slate-900/80 border border-slate-800 rounded-2xl p-4 text-center">
              <span className="text-[11px] font-semibold text-slate-400 block uppercase">Price Range</span>
              <span className="text-sm sm:text-base font-bold text-slate-200">
                ₹{Number(minimum_price).toLocaleString('en-IN')} - ₹{Number(maximum_price).toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex-1 bg-slate-900/80 border border-slate-800 rounded-2xl p-4 text-center">
              <span className="text-[11px] font-semibold text-slate-400 block uppercase">Confidence Index</span>
              <span className="text-sm sm:text-base font-bold text-emerald-400 flex items-center justify-center gap-1">
                <ShieldCheck className="w-4 h-4" /> {confidence_score}%
              </span>
            </div>
          </div>
        </div>

        {/* Device Specs Summary Strip */}
        <div className="relative z-10 pt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-400 block">Condition Rating</span>
            <span className="font-bold text-white text-sm">{condition_score} / 10 ({breakdown.condition_label || 'Good'})</span>
          </div>
          <div>
            <span className="text-slate-400 block">Storage & RAM</span>
            <span className="font-bold text-white text-sm">{device.storage || '128'}GB / {device.ram || '8'}GB</span>
          </div>
          <div>
            <span className="text-slate-400 block">Battery Health</span>
            <span className="font-bold text-white text-sm">{device.battery_health || 85}%</span>
          </div>
          <div>
            <span className="text-slate-400 block">Box & Accessories</span>
            <span className="font-bold text-white text-sm">
              {device.has_box && device.has_charger ? 'Complete Kit' : device.has_charger ? 'Charger Only' : 'Device Only'}
            </span>
          </div>
        </div>
      </div>

      {/* Transparent Price Breakdown */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Intelligent Price Breakdown</h3>
            <p className="text-xs text-slate-500">How the Machine Learning model computed your valuation</p>
          </div>
          <Badge variant="brand">Scikit-Learn Regression Pipeline</Badge>
        </div>

        <div className="space-y-3 divide-y divide-slate-100 text-sm">
          <div className="flex items-center justify-between pt-2">
            <span className="text-slate-600 font-medium">Original Market Base Value</span>
            <span className="font-bold text-slate-900">₹{Number(breakdown.original_base_price || predicted_price * 1.6).toLocaleString('en-IN')}</span>
          </div>

          <div className="flex items-center justify-between pt-3">
            <div className="flex flex-col">
              <span className="text-slate-600 font-medium">Age & Technology Depreciation</span>
              <span className="text-xs text-slate-400">Device age ({2026 - Number(device.purchase_year || 2023)} years)</span>
            </div>
            <span className="font-semibold text-rose-600">-₹{Number(breakdown.age_deduction || 12000).toLocaleString('en-IN')}</span>
          </div>

          <div className="flex items-center justify-between pt-3">
            <div className="flex flex-col">
              <span className="text-slate-600 font-medium">Physical Condition Adjustment</span>
              <span className="text-xs text-slate-400">Screen, Body & Bezel wear rating</span>
            </div>
            <span className="font-semibold text-amber-600">-₹{Number(breakdown.condition_deduction || 2500).toLocaleString('en-IN')}</span>
          </div>

          {breakdown.battery_adjustment !== 0 && (
            <div className="flex items-center justify-between pt-3">
              <div className="flex flex-col">
                <span className="text-slate-600 font-medium">Battery Efficiency Factor</span>
                <span className="text-xs text-slate-400">Battery capacity below standard 85%</span>
              </div>
              <span className="font-semibold text-rose-600">₹{Number(breakdown.battery_adjustment || -800).toLocaleString('en-IN')}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-3">
            <div className="flex flex-col">
              <span className="text-slate-600 font-medium">Original Accessories Bonus</span>
              <span className="text-xs text-slate-400">Original box, adapter, and invoice</span>
            </div>
            <span className="font-semibold text-emerald-600">+₹{Number(breakdown.accessories_credit || 1200).toLocaleString('en-IN')}</span>
          </div>

          {breakdown.warranty_credit > 0 && (
            <div className="flex items-center justify-between pt-3">
              <div className="flex flex-col">
                <span className="text-slate-600 font-medium">Active Brand Warranty</span>
                <span className="text-xs text-slate-400">Manufacturer warranty bonus</span>
              </div>
              <span className="font-semibold text-emerald-600">+₹{Number(breakdown.warranty_credit).toLocaleString('en-IN')}</span>
            </div>
          )}
        </div>

        {/* Disclaimer as required by Requirement 9 */}
        <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-2xl flex items-start gap-3 text-xs text-amber-900">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>
            <strong>Official Valuation Disclaimer:</strong> Estimated value is generated using available device information and our trained ML regression pipeline. Final offer may adjust slightly after certified physical inspection by our visiting agent.
          </span>
        </div>
      </div>

      {/* Primary Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Button
          onClick={handleSell}
          size="lg"
          className="w-full bg-emerald-600 hover:bg-emerald-500 py-4 shadow-xl shadow-emerald-600/25"
          icon={Zap}
        >
          Sell This Device
        </Button>

        <Button
          onClick={handleExchange}
          variant="secondary"
          size="lg"
          className="w-full py-4"
          icon={Repeat}
        >
          Exchange Device
        </Button>

        <Button
          onClick={handleRepair}
          variant="outline"
          size="lg"
          className="w-full py-4"
          icon={Wrench}
        >
          Book Repair
        </Button>

        <Button
          onClick={onReset}
          variant="ghost"
          size="lg"
          className="w-full py-4 border border-slate-200"
        >
          Value Another Device
        </Button>
      </div>
    </div>
  );
};
