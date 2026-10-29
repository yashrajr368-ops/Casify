import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Modern, premium brand logo for RETECH
 * Features a custom geometric "R" emblem representing circular renewal, tech, and smart valuation.
 */
export const Logo = ({ size = 'md', theme = 'light', showText = true, to = '/' }) => {
  // Dimensions based on size
  const iconSizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-14 h-14'
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl'
  };

  const isDark = theme === 'dark';

  const LogoIcon = (
    <div
      className={`relative ${iconSizes[size] || iconSizes.md} rounded-xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-[1.5px] shadow-md shadow-emerald-950/20 group-hover:shadow-emerald-500/20 group-hover:scale-105 transition-all duration-200 shrink-0`}
    >
      {/* Outer subtle glow/border border gradient */}
      <div className="w-full h-full rounded-[10px] bg-slate-950 flex items-center justify-center overflow-hidden relative">
        {/* Ambient subtle emerald corner glow */}
        <div className="absolute -top-3 -right-3 w-8 h-8 bg-emerald-500/30 rounded-full blur-md pointer-events-none" />
        <div className="absolute -bottom-3 -left-3 w-8 h-8 bg-teal-500/20 rounded-full blur-md pointer-events-none" />

        {/* Custom Modern Geometric 'R' + Circular Re-Tech SVG */}
        <svg
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-4/5 h-4/5 relative z-10"
        >
          <defs>
            <linearGradient id="retechGrad" x1="6" y1="6" x2="34" y2="34" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="60%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
            <linearGradient id="retechAccent" x1="18" y1="8" x2="34" y2="22" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
          </defs>

          {/* Left Vertical Tech Stem */}
          <rect
            x="8"
            y="7"
            width="5"
            height="26"
            rx="2.5"
            fill="url(#retechGrad)"
          />

          {/* Upper Circular Renewal Loop */}
          <path
            d="M13 10.5H23C27.4183 10.5 31 14.0817 31 18.5C31 22.9183 27.4183 26.5 23 26.5H13"
            stroke="url(#retechGrad)"
            strokeWidth="5"
            strokeLinecap="round"
          />

          {/* Forward Dynamic Leg with Precision Angle */}
          <path
            d="M20 23.5L29 33"
            stroke="url(#retechGrad)"
            strokeWidth="5"
            strokeLinecap="round"
          />

          {/* Tech Pulse Node */}
          <circle
            cx="22"
            cy="18.5"
            r="2.5"
            fill="#a7f3d0"
          />
        </svg>
      </div>
    </div>
  );

  const LogoText = showText && (
    <div className="flex items-center">
      <span
        className={`font-black tracking-tight ${textSizes[size] || textSizes.md} ${
          isDark ? 'text-white' : 'text-slate-900'
        } flex items-center transition-colors`}
      >
        RETECH
        <span className="w-2 h-2 rounded-full bg-emerald-500 ml-1 inline-block animate-pulse" />
      </span>
    </div>
  );

  if (to) {
    return (
      <Link to={to} className="flex items-center gap-3 group select-none">
        {LogoIcon}
        {LogoText}
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-3 group select-none">
      {LogoIcon}
      {LogoText}
    </div>
  );
};
