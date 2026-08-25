import React from 'react';

interface TrendScopeLogoProps {
  className?: string;
  size?: number;
}

export function TrendScopeLogo({ className = '', size = 36 }: TrendScopeLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
    >
      <defs>
        <linearGradient id="logoBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0F172A" />
          <stop offset="50%" stopColor="#0B0F19" />
          <stop offset="100%" stopColor="#020617" />
        </linearGradient>
        <linearGradient id="logoCoreGrad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#2563EB" />
          <stop offset="50%" stopColor="#0284C7" />
          <stop offset="100%" stopColor="#06B6D4" />
        </linearGradient>
        <linearGradient id="logoAccentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#818CF8" />
        </linearGradient>
      </defs>

      {/* Outer Squircle Container */}
      <rect width="512" height="512" rx="128" fill="url(#logoBgGrad)" />
      <rect
        width="504"
        height="504"
        x="4"
        y="4"
        rx="124"
        fill="none"
        stroke="url(#logoCoreGrad)"
        strokeWidth="10"
        strokeOpacity="0.5"
      />

      {/* Radar & Globe Latitude Coordinates */}
      <circle cx="256" cy="256" r="180" stroke="#1E293B" strokeWidth="4" strokeDasharray="10 10" />
      <circle cx="256" cy="256" r="130" stroke="#1E3A5F" strokeWidth="4" strokeOpacity="0.7" />
      <circle cx="256" cy="256" r="75" stroke="#0284C7" strokeWidth="3" strokeOpacity="0.5" />
      <ellipse
        cx="256"
        cy="256"
        rx="180"
        ry="85"
        stroke="#1E293B"
        strokeWidth="3"
        strokeOpacity="0.5"
        transform="rotate(-25 256 256)"
      />

      {/* Ascending Momentum Wave */}
      <path
        d="M 120 340 Q 200 320, 240 260 T 380 150"
        stroke="url(#logoCoreGrad)"
        strokeWidth="24"
        strokeLinecap="round"
      />

      {/* Momentum Surge Arrow Head */}
      <path
        d="M 330 150 L 380 150 L 380 200"
        stroke="#38BDF8"
        strokeWidth="22"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Data Nodes */}
      <circle cx="120" cy="340" r="16" fill="#1E293B" stroke="#0284C7" strokeWidth="6" />
      <circle cx="240" cy="260" r="18" fill="#0F172A" stroke="#06B6D4" strokeWidth="8" />
      <circle cx="380" cy="150" r="20" fill="#38BDF8" />
      <circle cx="380" cy="150" r="9" fill="#FFFFFF" />

      {/* Central Star Needle */}
      <path
        d="M 256 195 L 263 245 L 305 256 L 263 267 L 256 315 L 249 267 L 205 256 L 249 245 Z"
        fill="url(#logoAccentGrad)"
      />
      <circle cx="256" cy="256" r="5" fill="#FFFFFF" />
    </svg>
  );
}
