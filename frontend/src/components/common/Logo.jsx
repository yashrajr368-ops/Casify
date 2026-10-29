import React from 'react';
import { Link } from 'react-router-dom';

/**
 * ReTech AI — Official Modern AI Startup Brand Logo
 * Combines a geometric 'R' circuit backbone with neural network bus
 * and sharp modern typography (ReTech + AI accent badge).
 */
export const Logo = ({ size = 'md', theme = 'light', showText = true, to = '/' }) => {
  const iconSizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-14 h-14'
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl'
  };

  const aiBadgeSizes = {
    sm: 'text-[9px] px-1 py-0.2',
    md: 'text-[11px] px-1.5 py-0.5',
    lg: 'text-xs px-2 py-0.5',
    xl: 'text-sm px-2.5 py-1'
  };

  const isDark = theme === 'dark';

  const LogoIcon = (
    <div
      className={`relative ${iconSizes[size] || iconSizes.md} rounded-2xl bg-gradient-to-br from-[#0B1020] to-[#0F172A] p-[1.5px] shadow-md shadow-blue-950/20 group-hover:shadow-cyan-500/20 group-hover:scale-105 transition-all duration-300 shrink-0`}
    >
      {/* Precision Gradient Border Squircle */}
      <div className="w-full h-full rounded-[14px] bg-[#0B1020] flex items-center justify-center overflow-hidden relative border border-blue-500/30">
        {/* Soft Ambient Neural Glow */}
        <div className="absolute -top-3 -right-3 w-8 h-8 bg-cyan-500/20 rounded-full blur-md pointer-events-none" />
        <div className="absolute -bottom-3 -left-3 w-8 h-8 bg-blue-500/20 rounded-full blur-md pointer-events-none" />

        {/* Precision Geometric 'R' Neural & Circuit SVG */}
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-[82%] h-[82%] relative z-10 transition-transform duration-300 group-hover:scale-105"
        >
          <defs>
            <linearGradient id="navPrimaryGrad" x1="20" y1="18" x2="80" y2="82" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#06B6D4" />
            </linearGradient>
          </defs>

          {/* AI Circuit Sub-Trace */}
          <path
            d="M 53 50 L 63 60 H 73"
            stroke="#06B6D4"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeOpacity="0.85"
          />
          <circle cx="73" cy="60" r="3" fill="#06B6D4" />

          {/* Left Main Backbone Spine */}
          <rect
            x="21"
            y="18"
            width="10"
            height="64"
            rx="5"
            fill="url(#navPrimaryGrad)"
          />

          {/* Internal Neural Connection Bus */}
          <line
            x1="31"
            y1="36"
            x2="43"
            y2="36"
            stroke="#06B6D4"
            strokeWidth="2.5"
            strokeDasharray="3 2"
            strokeLinecap="round"
          />
          <circle cx="45" cy="36" r="4" fill="#06B6D4" />
          <circle cx="45" cy="36" r="1.75" fill="#FFFFFF" />

          {/* Upper Neural Loop */}
          <path
            d="M 26 23 H 51 C 61 23 69 29 69 37 C 69 45 61 51 51 51 H 26"
            stroke="url(#navPrimaryGrad)"
            strokeWidth="10"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Apex Neural Junction */}
          <circle cx="69" cy="37" r="5.5" fill="#0B1020" stroke="#06B6D4" strokeWidth="2" />
          <circle cx="69" cy="37" r="2.75" fill="#3B82F6" />

          {/* Dynamic Forward Circuit Leg */}
          <line
            x1="42"
            y1="51"
            x2="70"
            y2="79"
            stroke="url(#navPrimaryGrad)"
            strokeWidth="10"
            strokeLinecap="round"
          />

          {/* Terminal Circuit Pad */}
          <circle cx="70" cy="79" r="5.5" fill="#0B1020" stroke="#06B6D4" strokeWidth="2" />
          <circle cx="70" cy="79" r="2.25" fill="#FFFFFF" />
        </svg>
      </div>
    </div>
  );

  const LogoText = showText && (
    <div className="flex items-center tracking-tight select-none">
      <span
        className={`font-extrabold ${textSizes[size] || textSizes.md} tracking-[-0.03em] ${
          isDark ? 'text-white' : 'text-slate-900'
        } transition-colors`}
      >
        ReTech
      </span>
      <span
        className={`ml-1.5 font-bold uppercase tracking-wider rounded-md border ${
          aiBadgeSizes[size] || aiBadgeSizes.md
        } ${
          isDark
            ? 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30'
            : 'bg-cyan-50 text-cyan-600 border-cyan-200'
        } transition-colors shadow-sm`}
      >
        AI
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
