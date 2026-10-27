import React from 'react';
import { DeviceWizard } from '../components/wizard/DeviceWizard';
import { Sparkles, Shield, Cpu, Award } from 'lucide-react';

export const ValuationPage = () => {
  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
      {/* Title Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold uppercase tracking-wider border border-emerald-200">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Smart AI Valuation Engine</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Calculate Your Device Market Value
        </h1>
        <p className="text-sm text-slate-500">
          Answer a few quick questions about specifications and condition to unlock an instant, verified resale price.
        </p>
      </div>

      {/* Main Wizard */}
      <DeviceWizard />

      {/* Trust Badges */}
      <div className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 text-center text-xs text-slate-500">
        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 flex items-center justify-center gap-2">
          <Cpu className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Trained Regression Pipeline</span>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 flex items-center justify-center gap-2">
          <Shield className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Certified Data Security</span>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 flex items-center justify-center gap-2">
          <Award className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Free Doorstep Evaluation</span>
        </div>
      </div>
    </div>
  );
};
