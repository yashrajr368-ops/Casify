import React, { useState } from 'react';
import { Upload, X, CheckCircle, AlertTriangle, Eye, Image as ImageIcon } from 'lucide-react';

export const ImageUploader = ({ onImagesChange }) => {
  const [images, setImages] = useState({
    front: null,
    back: null,
    screen: null,
    damage: null
  });

  const [previews, setPreviews] = useState({
    front: null,
    back: null,
    screen: null,
    damage: null
  });

  const slots = [
    { key: 'front', label: 'Front Body', desc: 'Full frontal view with bezels' },
    { key: 'back', label: 'Back Panel', desc: 'Rear panel & camera module' },
    { key: 'screen', label: 'Screen Display', desc: 'Display turned ON to check pixels' },
    { key: 'damage', label: 'Defects / Scratches', desc: 'Close-up of any dent or crack (optional)' },
  ];

  const handleFile = (key, file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image format (PNG, JPG, JPEG, WEBP)');
      return;
    }

    const updatedImages = { ...images, [key]: file };
    setImages(updatedImages);

    const reader = new FileReader();
    reader.onload = () => {
      const updatedPreviews = { ...previews, [key]: reader.result };
      setPreviews(updatedPreviews);
      if (onImagesChange) {
        onImagesChange(updatedImages, updatedPreviews);
      }
    };
    reader.readAsDataURL(file);
  };

  const removeImage = (key) => {
    const updatedImages = { ...images, [key]: null };
    const updatedPreviews = { ...previews, [key]: null };
    setImages(updatedImages);
    setPreviews(updatedPreviews);
    if (onImagesChange) {
      onImagesChange(updatedImages, updatedPreviews);
    }
  };

  return (
    <div className="space-y-4">
      <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200/70 text-xs text-emerald-800 flex items-start gap-2.5">
        <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        <span>
          <strong>AI Visual Verification:</strong> Uploading clear, well-lit photos helps our computer vision module verify your physical condition score and increases final price certainty.
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {slots.map((slot) => {
          const preview = previews[slot.key];

          return (
            <div
              key={slot.key}
              className={`relative border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center text-center transition-all ${
                preview
                  ? 'border-emerald-500/50 bg-emerald-50/20'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 bg-white'
              }`}
            >
              {preview ? (
                <div className="w-full flex flex-col items-center gap-3">
                  <div className="relative w-full h-32 rounded-xl overflow-hidden shadow-inner border border-slate-200">
                    <img
                      src={preview}
                      alt={slot.label}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(slot.key)}
                      className="absolute top-2 right-2 p-1 bg-rose-600 text-white rounded-full shadow hover:bg-rose-700 transition-colors"
                      title="Remove image"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    {slot.label}
                  </span>
                </div>
              ) : (
                <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer py-4">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 mb-2">
                    <Upload className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-slate-800">{slot.label}</span>
                  <span className="text-[11px] text-slate-400 mt-1 max-w-[150px] leading-tight">
                    {slot.desc}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFile(slot.key, e.target.files[0])}
                  />
                </label>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
