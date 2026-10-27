import React from 'react';
import { Sparkles, Shield, Cpu, Award, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-slate-950 text-slate-400 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          {/* Col 1: Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="text-xl font-black tracking-tight text-white">
                RETECH <span className="text-emerald-500">AI</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed text-slate-400">
              Smart Value. Smarter Decisions. India's premier AI-powered platform for used smart device valuation, instant resale, exchanges, and doorstep certified repairs.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-3 py-1.5 rounded-lg w-fit">
              <Cpu className="w-4 h-4" /> Powered by Scikit-Learn & Computer Vision
            </div>
          </div>

          {/* Col 2: Services */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4">
              Services
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/valuation" className="hover:text-emerald-400 transition-colors">Instant AI Valuation</Link></li>
              <li><Link to="/exchange" className="hover:text-emerald-400 transition-colors">Smart Device Exchange</Link></li>
              <li><Link to="/repair" className="hover:text-emerald-400 transition-colors">Doorstep Repair Service</Link></li>
              <li><Link to="/dashboard" className="hover:text-emerald-400 transition-colors">Track Active Requests</Link></li>
            </ul>
          </div>

          {/* Col 3: Categories */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4">
              Categories
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/valuation" className="hover:text-emerald-400 transition-colors">Sell Smartphone</Link></li>
              <li><Link to="/valuation" className="hover:text-emerald-400 transition-colors">Sell Laptop</Link></li>
              <li><Link to="/valuation" className="hover:text-emerald-400 transition-colors">Sell Tablet & iPad</Link></li>
              <li><Link to="/valuation" className="hover:text-emerald-400 transition-colors">Sell Smartwatch</Link></li>
            </ul>
          </div>

          {/* Col 4: Trust & Security */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4">
              Security & Guarantee
            </h4>
            <div className="space-y-3 text-xs text-slate-400">
              <div className="flex items-start gap-2.5">
                <Shield className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>100% Certified Data Wipe & Certified Safe Transactions</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Award className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Transparent AI-driven pricing with 0 hidden deduction fees</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Instant Bank & UPI payout at doorstep inspection</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 RETECH AI. All rights reserved. Original Academic Full-Stack Project.</p>
          <div className="flex items-center gap-6">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Security Compliance</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
