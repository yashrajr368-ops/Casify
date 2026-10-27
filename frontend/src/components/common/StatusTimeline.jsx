import React from 'react';
import { Check, Clock, Circle } from 'lucide-react';

const SELL_STEPS = [
  'Requested',
  'Confirmed',
  'Agent Assigned',
  'Pickup Scheduled',
  'Picked Up',
  'Inspection',
  'Final Offer',
  'Completed'
];

export const StatusTimeline = ({ currentStatus = 'Requested', steps = SELL_STEPS }) => {
  const currentIndex = steps.findIndex(
    (s) => s.toLowerCase() === (currentStatus || '').toLowerCase()
  );
  const activeIdx = currentIndex >= 0 ? currentIndex : 0;

  return (
    <div className="w-full py-6">
      <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center">
        {/* Progress bar background (for desktop) */}
        <div className="hidden md:block absolute top-5 left-0 w-full h-1 bg-slate-200 -z-0" />
        <div
          className="hidden md:block absolute top-5 left-0 h-1 bg-emerald-500 transition-all duration-500 -z-0"
          style={{ width: `${(activeIdx / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((step, idx) => {
          const isDone = idx < activeIdx;
          const isCurrent = idx === activeIdx;
          const isPending = idx > activeIdx;

          return (
            <div
              key={step}
              className="flex md:flex-col items-center gap-4 md:gap-2 relative z-10 my-2 md:my-0 w-full md:w-auto"
            >
              {/* Step indicator node */}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 shadow-sm ${
                  isDone
                    ? 'bg-emerald-600 text-white shadow-emerald-500/20 ring-4 ring-emerald-50'
                    : isCurrent
                    ? 'bg-emerald-500 text-white shadow-emerald-500/30 ring-4 ring-emerald-100 animate-pulse'
                    : 'bg-white text-slate-400 border-2 border-slate-200'
                }`}
              >
                {isDone ? (
                  <Check className="w-5 h-5 stroke-[2.5]" />
                ) : isCurrent ? (
                  <Clock className="w-5 h-5 stroke-[2.5]" />
                ) : (
                  <Circle className="w-3.5 h-3.5 fill-current" />
                )}
              </div>

              {/* Step label */}
              <div className="flex flex-col md:items-center text-left md:text-center">
                <span
                  className={`text-xs font-semibold ${
                    isCurrent
                      ? 'text-emerald-700'
                      : isDone
                      ? 'text-slate-800'
                      : 'text-slate-400'
                  }`}
                >
                  {step}
                </span>
                <span className="text-[10px] text-slate-400 hidden md:block">
                  {isDone ? 'Completed' : isCurrent ? 'In Progress' : 'Pending'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
