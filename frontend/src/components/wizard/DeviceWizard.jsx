import React, { useState, useEffect } from 'react';
import { catalogAPI, devicesAPI, predictionAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { ImageUploader } from './ImageUploader';
import { ValuationResult } from './ValuationResult';
import { Button } from '../common/Button';
import {
  Smartphone,
  Laptop,
  Tablet,
  Watch,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  CheckCircle2,
  Cpu,
  ShieldAlert,
  HelpCircle,
  UploadCloud
} from 'lucide-react';

const CATEGORIES = [
  { id: 'Smartphone', name: 'Smartphone', icon: Smartphone, desc: 'iPhone, Galaxy, OnePlus, Pixel & more' },
  { id: 'Laptop', name: 'Laptop', icon: Laptop, desc: 'MacBook, Dell, HP, ThinkPad, Asus' },
  { id: 'Tablet', name: 'Tablet & iPad', icon: Tablet, desc: 'iPad Pro, Galaxy Tab, Xiaomi Pad' },
  { id: 'Smartwatch', name: 'Smartwatch', icon: Watch, desc: 'Apple Watch, Galaxy Watch, WearOS' },
];

const CONDITIONS = ['Excellent', 'Good', 'Fair', 'Poor'];

export const DeviceWizard = () => {
  const { isAuthenticated } = useAuth();
  const { addToast } = useToast();

  const [step, setStep] = useState(1);
  const [loadingBrands, setLoadingBrands] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);
  const [brands, setBrands] = useState([]);
  const [models, setModels] = useState([]);

  // Form State
  const [formData, setFormData] = useState({
    category: 'Smartphone',
    brand: '',
    model: '',
    purchase_year: 2023,
    ram: 8,
    storage: 128,
    processor: '',
    battery_health: 88,
    screen_condition: 'Good',
    body_condition: 'Good',
    camera_condition: 'Good',
    speaker_condition: 'Good',
    charging_port_condition: 'Good',
    overall_condition: 'Good',
    has_box: true,
    has_charger: true,
    has_bill: true,
    has_warranty: false
  });

  const [uploadedFiles, setUploadedFiles] = useState({});
  const [evaluating, setEvaluating] = useState(false);
  const [valuationResult, setValuationResult] = useState(null);
  const [createdDevice, setCreatedDevice] = useState(null);

  // Load brands when category changes
  useEffect(() => {
    const fetchBrands = async () => {
      setLoadingBrands(true);
      try {
        const res = await catalogAPI.getBrands(formData.category);
        const fetchedBrands = res.data?.data?.brands || [];
        setBrands(fetchedBrands);
        if (fetchedBrands.length > 0 && !fetchedBrands.includes(formData.brand)) {
          setFormData((prev) => ({ ...prev, brand: fetchedBrands[0], model: '' }));
        }
      } catch (err) {
        // Fallback common brands
        setBrands(['Apple', 'Samsung', 'OnePlus', 'Google', 'Xiaomi']);
      } finally {
        setLoadingBrands(false);
      }
    };
    fetchBrands();
  }, [formData.category]);

  // Load models when brand changes
  useEffect(() => {
    if (!formData.brand) return;
    const fetchModels = async () => {
      setLoadingModels(true);
      try {
        const res = await catalogAPI.getModels(formData.category, formData.brand);
        const fetchedModels = res.data?.data?.models || [];
        setModels(fetchedModels);
        if (fetchedModels.length > 0) {
          const firstModel = fetchedModels[0];
          setFormData((prev) => ({
            ...prev,
            model: firstModel.model,
            processor: firstModel.processor || prev.processor,
            ram: firstModel.ram_options?.[0] || prev.ram,
            storage: firstModel.storage_options?.[0] || prev.storage,
            purchase_year: firstModel.release_year || prev.purchase_year
          }));
        }
      } catch (err) {
        setModels([]);
      } finally {
        setLoadingModels(false);
      }
    };
    fetchModels();
  }, [formData.category, formData.brand]);

  const handleNext = () => {
    if (step === 2 && (!formData.brand || !formData.model)) {
      addToast('Please select your device brand and model', 'error');
      return;
    }
    setStep((prev) => Math.min(7, prev + 1));
  };

  const handlePrev = () => {
    setStep((prev) => Math.max(1, prev - 1));
  };

  // Step 7: AI Valuation Analysis Trigger
  useEffect(() => {
    if (step === 7) {
      const runValuation = async () => {
        setEvaluating(true);
        try {
          // If authenticated, persist device to database
          if (isAuthenticated) {
            const devRes = await devicesAPI.create(formData);
            const dev = devRes.data?.data?.device;
            const pred = devRes.data?.data?.prediction;
            setCreatedDevice(dev);
            setValuationResult(pred);

            // Upload any photos attached
            if (dev?.id && uploadedFiles) {
              for (const [key, file] of Object.entries(uploadedFiles)) {
                if (file) {
                  const form = new FormData();
                  form.append('image', file);
                  form.append('image_type', key);
                  try {
                    await devicesAPI.uploadImage(dev.id, form);
                  } catch (imgErr) {
                    console.error("Image upload notice:", imgErr);
                  }
                }
              }
            }
          } else {
            // Guest instant prediction
            const predRes = await predictionAPI.predict(formData);
            setCreatedDevice(formData);
            setValuationResult(predRes.data?.data);
          }
        } catch (err) {
          console.error(err);
          addToast(err.response?.data?.message || 'Valuation analysis encountered an issue', 'error');
          setStep(6);
        } finally {
          setTimeout(() => {
            setEvaluating(false);
          }, 1200);
        }
      };

      runValuation();
    }
  }, [step, isAuthenticated]);

  const handleReset = () => {
    setValuationResult(null);
    setCreatedDevice(null);
    setStep(1);
  };

  if (valuationResult && !evaluating) {
    return (
      <ValuationResult
        device={createdDevice || formData}
        prediction={valuationResult}
        onReset={handleReset}
      />
    );
  }

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 sm:p-10">
      {/* Wizard Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-2">
          <span>STEP {step} OF 6</span>
          <span className="text-emerald-600">
            {step === 1 && 'Select Device Category'}
            {step === 2 && 'Brand & Model Selection'}
            {step === 3 && 'Specifications & Battery'}
            {step === 4 && 'Condition Assessment'}
            {step === 5 && 'Accessories & Warranty'}
            {step === 6 && 'Photo Verification'}
            {step === 7 && 'AI Valuation'}
          </span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
          <div
            className="bg-emerald-600 h-full rounded-full transition-all duration-300"
            style={{ width: `${(Math.min(step, 6) / 6) * 100}%` }}
          />
        </div>
      </div>

      {/* STEP 1: CATEGORY */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="text-center sm:text-left">
            <h2 className="text-xl font-bold text-slate-900">What device are you evaluating?</h2>
            <p className="text-sm text-slate-500 mt-1">Select the category to begin your valuation</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isSelected = formData.category === cat.id;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, category: cat.id })}
                  className={`p-5 rounded-2xl border-2 text-left flex items-start gap-4 transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/40 shadow-md shadow-emerald-600/10'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                      isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{cat.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{cat.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 2: BRAND & MODEL */}
      {step === 2 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Select Brand & Model</h2>
            <p className="text-sm text-slate-500 mt-1">
              Choose from our catalog of {formData.category.toLowerCase()} devices
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Brand
              </label>
              <div className="flex flex-wrap gap-2">
                {brands.map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setFormData({ ...formData, brand: b })}
                    className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all cursor-pointer ${
                      formData.brand === b
                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Model
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-1">
                {models.map((m) => {
                  const isSelected = formData.model === m.model;
                  return (
                    <button
                      key={m.id || m.model}
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          model: m.model,
                          processor: m.processor || formData.processor,
                          purchase_year: m.release_year || formData.purchase_year
                        })
                      }
                      className={`p-3.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/50 text-emerald-950 font-bold'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <span className="text-sm">{m.model}</span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: SPECIFICATIONS */}
      {step === 3 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Device Specifications</h2>
            <p className="text-sm text-slate-500 mt-1">Provide exact hardware configurations</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Purchase Year</label>
              <select
                value={formData.purchase_year}
                onChange={(e) => setFormData({ ...formData, purchase_year: parseInt(e.target.value) })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {[2025, 2024, 2023, 2022, 2021, 2020, 2019].map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Internal Storage (GB)</label>
              <select
                value={formData.storage}
                onChange={(e) => setFormData({ ...formData, storage: parseInt(e.target.value) })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {[64, 128, 256, 512, 1024].map((s) => (
                  <option key={s} value={s}>{s >= 1024 ? '1 TB' : `${s} GB`}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">RAM Capacity (GB)</label>
              <select
                value={formData.ram}
                onChange={(e) => setFormData({ ...formData, ram: parseInt(e.target.value) })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {[1, 2, 4, 6, 8, 12, 16, 32].map((r) => (
                  <option key={r} value={r}>{r} GB</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Battery Health (%)</label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="60"
                  max="100"
                  value={formData.battery_health}
                  onChange={(e) => setFormData({ ...formData, battery_health: parseInt(e.target.value) })}
                  className="w-full accent-emerald-600"
                />
                <span className="w-12 text-center text-sm font-bold text-emerald-700 bg-emerald-50 py-1 rounded-lg border border-emerald-200">
                  {formData.battery_health}%
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: PHYSICAL CONDITION */}
      {step === 4 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Physical & Functional Condition</h2>
            <p className="text-sm text-slate-500 mt-1">Honest assessment ensures guaranteed valuation</p>
          </div>

          <div className="space-y-4">
            {['screen_condition', 'body_condition', 'overall_condition'].map((field) => {
              const label = field === 'screen_condition'
                ? 'Screen / Display Condition'
                : field === 'body_condition'
                ? 'Body, Frame & Bezels'
                : 'Overall Functional Performance';

              return (
                <div key={field} className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50">
                  <span className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2.5">
                    {label}
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {CONDITIONS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setFormData({ ...formData, [field]: c })}
                        className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          formData[field] === c
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 5: ACCESSORIES */}
      {step === 5 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Accessories & Verification</h2>
            <p className="text-sm text-slate-500 mt-1">Original accessories add extra bonus value to your quote</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { key: 'has_box', label: 'Original Retail Box', bonus: '+₹500 bonus' },
              { key: 'has_charger', label: 'Original Power Adapter & Cable', bonus: '+₹800 bonus' },
              { key: 'has_bill', label: 'Valid Purchase Bill / Invoice', bonus: '+₹600 bonus' },
              { key: 'has_warranty', label: 'Under Manufacturer Warranty', bonus: '+5% value boost' }
            ].map((acc) => {
              const checked = formData[acc.key];
              return (
                <label
                  key={acc.key}
                  className={`p-4 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all ${
                    checked
                      ? 'border-emerald-600 bg-emerald-50/40 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => setFormData({ ...formData, [acc.key]: e.target.checked })}
                      className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
                    />
                    <div>
                      <span className="block text-sm font-bold text-slate-800">{acc.label}</span>
                      <span className="text-xs text-emerald-600 font-semibold">{acc.bonus}</span>
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 6: IMAGE UPLOAD */}
      {step === 6 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">AI Visual Verification (Optional)</h2>
            <p className="text-sm text-slate-500 mt-1">
              Upload photos of your device. Our computer vision module performs edge and abrasion analysis.
            </p>
          </div>

          <ImageUploader
            onImagesChange={(files) => setUploadedFiles(files)}
          />
        </div>
      )}

      {/* STEP 7: AI ANALYZING LOADING STATE */}
      {step === 7 && evaluating && (
        <div className="py-16 flex flex-col items-center justify-center text-center space-y-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-emerald-50 border-4 border-emerald-500/20 flex items-center justify-center">
              <Sparkles className="w-12 h-12 text-emerald-600 animate-pulse" />
            </div>
            <div className="absolute inset-0 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>

          <div className="space-y-2 max-w-sm">
            <h3 className="text-xl font-black text-slate-900">
              AI is analyzing your device...
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Synthesizing market depreciation curves, hardware specifications, and physical condition parameters using trained Scikit-Learn regression models.
            </p>
          </div>
        </div>
      )}

      {/* Wizard Footer Controls */}
      {step < 7 && (
        <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
          <Button
            onClick={handlePrev}
            disabled={step === 1}
            variant="outline"
            icon={ChevronLeft}
          >
            Back
          </Button>

          <Button
            onClick={handleNext}
            icon={step === 6 ? Sparkles : ChevronRight}
            className={step === 6 ? 'bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-600/25' : ''}
          >
            {step === 6 ? 'Run AI Valuation' : 'Next Step'}
          </Button>
        </div>
      )}
    </div>
  );
};
