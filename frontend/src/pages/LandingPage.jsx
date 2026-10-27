import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Smartphone,
  Laptop,
  Tablet,
  Watch,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Repeat,
  Wrench,
  ArrowRight,
  TrendingUp,
  Cpu,
  Award,
  Users,
  Clock
} from 'lucide-react';
import { Button } from '../components/common/Button';

export const LandingPage = () => {
  const stats = [
    { label: 'Devices Valued', value: '65,000+', icon: TrendingUp },
    { label: 'Devices Sold', value: '42,000+', icon: CheckCircle2 },
    { label: 'Successful Exchanges', value: '18,500+', icon: Repeat },
    { label: 'Customer Satisfaction', value: '99.4%', icon: Award }
  ];

  const steps = [
    { step: '01', title: 'Select Device', desc: 'Pick your smartphone, laptop, tablet, or smartwatch model from our verified catalog.' },
    { step: '02', title: 'Enter Details', desc: 'Provide purchase year, storage, RAM, battery health, and functional condition.' },
    { step: '03', title: 'AI Evaluates', desc: 'Our trained Scikit-learn regression models calculate fair market valuation in milliseconds.' },
    { step: '04', title: 'Get Price & Choose', desc: 'Instant fair quote. Choose whether to Sell for instant cash, Exchange, or Book Repair.' },
    { step: '05', title: 'Free Doorstep Pickup', desc: 'A certified field agent verifies your device at your doorstep and processes instant payout.' }
  ];

  const categories = [
    { title: 'Smartphones', count: '100+ Models', icon: Smartphone, link: '/valuation', desc: 'Apple iPhone, Samsung Galaxy, OnePlus, Pixel, Xiaomi' },
    { title: 'Laptops', count: '75+ Models', icon: Laptop, link: '/valuation', desc: 'MacBook Pro/Air, Dell XPS, HP Pavilion, ThinkPad' },
    { title: 'Tablets & iPads', count: '40+ Models', icon: Tablet, link: '/valuation', desc: 'iPad Pro, iPad Air, Galaxy Tab, Xiaomi Pad' },
    { title: 'Smartwatches', count: '30+ Models', icon: Watch, link: '/valuation', desc: 'Apple Watch Ultra, Series 9, Galaxy Watch 6' },
  ];

  return (
    <div className="space-y-24 pb-20">
      {/* HERO SECTION */}
      <section className="relative pt-12 sm:pt-20 overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-6 animate-fade-in shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Intelligent Valuation & Resale Engine v1.0</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-slate-900 tracking-tight max-w-4xl mx-auto leading-[1.1]">
            Turn Your Old Device Into{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600">
              Smart Value
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-base sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            AI-powered device valuation, resale, exchange, and repair — all in one place. Powered by trained machine learning pricing models and computer vision inspection.
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/valuation">
              <Button size="lg" className="w-full sm:w-auto px-8 py-4 text-base" icon={Zap}>
                Check Device Value
              </Button>
            </Link>
            <Link to="/exchange">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto px-8 py-4 text-base" icon={Repeat}>
                Explore Exchange
              </Button>
            </Link>
          </div>

          {/* Hero Visual Mockup Card */}
          <div className="mt-14 max-w-4xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-8 text-left grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-slate-950 text-white flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                  <Cpu className="w-4 h-4" /> Machine Learning Pricing
                </span>
                <h4 className="text-lg font-bold">iPhone 14 (128GB)</h4>
                <p className="text-xs text-slate-400 mt-1">Excellent Condition • 91% Battery</p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-800">
                <span className="text-xs text-slate-400 block">AI Resale Estimate</span>
                <span className="text-2xl font-black text-emerald-400">₹38,500</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200/70 text-emerald-950 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                  <Repeat className="w-4 h-4" /> Smart Exchange
                </span>
                <h4 className="text-lg font-bold">MacBook Air M2</h4>
                <p className="text-xs text-emerald-700/80 mt-1">Upgrade to MacBook Pro M3</p>
              </div>
              <div className="mt-6 pt-4 border-t border-emerald-200/60">
                <span className="text-xs text-emerald-700 block">Exchange Credit</span>
                <span className="text-2xl font-black text-emerald-900">₹62,000</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-blue-50 border border-blue-200/70 text-blue-950 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-blue-700 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                  <Wrench className="w-4 h-4" /> Doorstep Repair
                </span>
                <h4 className="text-lg font-bold">Galaxy S23 Display</h4>
                <p className="text-xs text-blue-700/80 mt-1">Original Glass • 6 Mo Warranty</p>
              </div>
              <div className="mt-6 pt-4 border-t border-blue-200/60">
                <span className="text-xs text-blue-700 block">Certified Repair</span>
                <span className="text-2xl font-black text-blue-900">₹4,200</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS STRIP */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm text-center flex flex-col items-center justify-center hover:shadow-md transition-shadow"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-2xl sm:text-3xl font-black text-slate-900">{item.value}</span>
                <span className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* CATEGORIES SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Supported Hardware</span>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight mt-1">
            Choose What You Want to Value
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            Instant valuation models trained specifically for each category’s hardware specs and depreciation profile.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <Link
                key={idx}
                to={cat.link}
                className="group bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:border-emerald-500/50 hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-800 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors mb-5">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                    {cat.title}
                  </h3>
                  <span className="inline-block text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full mt-1">
                    {cat.count}
                  </span>
                  <p className="text-xs text-slate-500 mt-3 leading-relaxed">
                    {cat.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-700 group-hover:text-emerald-600">
                  <span>Start Valuation</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="bg-slate-900 py-20 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Seamless 5-Step Process</span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight mt-2 text-white">
              How RETECH AI Works
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              From instant ML valuation to certified doorstep pickup and immediate UPI payment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {steps.map((s, idx) => (
              <div
                key={idx}
                className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-5 flex flex-col justify-between"
              >
                <div>
                  <span className="text-2xl font-black text-emerald-400 opacity-60 block mb-2">{s.step}</span>
                  <h3 className="text-base font-bold text-white mb-2">{s.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{s.desc}</p>
                </div>
                {idx < 4 && (
                  <div className="hidden md:block text-slate-600 mt-4 text-center">
                    ↓
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI INTELLIGENCE HIGHLIGHT SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-3xl p-8 sm:p-14 border border-slate-800 relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center relative z-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-4 border border-emerald-500/30">
                <Cpu className="w-3.5 h-3.5" /> High-Accuracy Machine Learning
              </div>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
                Powered by Intelligent Valuation Pipeline
              </h2>
              <p className="mt-4 text-sm sm:text-base text-slate-400 leading-relaxed">
                Rather than arbitrary rule tables, RETECH AI uses an ensemble of gradient-boosted and random forest regressors trained across 1,500+ real-world historical resale transactions.
              </p>

              <div className="mt-8 grid grid-cols-2 gap-4 text-xs">
                {[
                  'Device Age & Release Cycles',
                  'Brand & Model Residuals',
                  'Storage & RAM Multipliers',
                  'Battery Health Decay Curve',
                  'Screen & Bezel Condition',
                  'Original Box & Accessories',
                  'Bill & Warranty Impact',
                  'Computer Vision Surface Check'
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-2 text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <Link to="/valuation">
                  <Button size="lg" icon={Zap}>
                    Run Free Device Valuation
                  </Button>
                </Link>
              </div>
            </div>

            {/* Visual breakdown mockup */}
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 text-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-700 text-slate-300">
                <span className="font-bold">ML Evaluation Engine</span>
                <span className="text-emerald-400 font-mono font-bold">R² Score: 0.98</span>
              </div>
              <div className="space-y-2.5">
                <div>
                  <div className="flex justify-between text-[11px] mb-1 text-slate-400">
                    <span>Baseline Hardware Residual</span>
                    <span className="text-white font-bold">78%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-1.5">
                    <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '78%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] mb-1 text-slate-400">
                    <span>Battery Health Factor</span>
                    <span className="text-white font-bold">89%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-1.5">
                    <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '89%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] mb-1 text-slate-400">
                    <span>Physical Integrity Confidence</span>
                    <span className="text-white font-bold">94%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-1.5">
                    <div className="bg-teal-400 h-1.5 rounded-full" style={{ width: '94%' }} />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-700 text-[11px] text-slate-400 leading-relaxed">
                ✓ Mathematical uncertainty bounds generate guaranteed min-max purchase bids.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BOTTOM CTA SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="bg-emerald-600 text-white rounded-3xl p-10 sm:p-14 shadow-xl shadow-emerald-600/20 relative overflow-hidden">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
            Ready to Discover What Your Device is Worth?
          </h2>
          <p className="mt-3 text-sm sm:text-base text-emerald-100 max-w-xl mx-auto">
            Take 60 seconds to get your certified valuation report. Zero commitment, instant fair offer.
          </p>
          <div className="mt-8 flex justify-center">
            <Link to="/valuation">
              <Button size="lg" className="bg-slate-950 text-white hover:bg-slate-900 border-0 px-8 py-4 text-base shadow-2xl">
                Get Your Device Value Now
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
