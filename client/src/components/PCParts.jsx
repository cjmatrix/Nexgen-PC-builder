import React from "react";

// Neon tech colors
const colors = {
  primary: "#3b82f6", // blue-500
  success: "#22c55e", // green-500
  text: "#e2e8f0", // slate-200
  dark: "#1e293b", // slate-800
  border: "#475569", // slate-600
  accent: "#8b5cf6", // violet-500
};

export const MotherboardSVG = (props) => (
  <svg
    viewBox="0 0 300 400"
    className="w-full h-full drop-shadow-2xl"
    {...props}
  >
    {/* PCB Board - Matte Black */}
    <rect
      x="10"
      y="10"
      width="280"
      height="380"
      rx="10"
      fill="#09090b"
      stroke="#27272a"
      strokeWidth="2"
    />

    {/* Circuits - Subtle Dark Grey */}
    <path d="M40 40 L40 360" stroke="#18181b" strokeWidth="2" />
    <path d="M260 40 L260 360" stroke="#18181b" strokeWidth="2" />
    <path
      d="M50 50 H250 V150 H50 Z"
      fill="none"
      stroke="#27272a"
      strokeWidth="1"
      opacity="0.3"
    />

    {/* VRM Heatsinks - Dark Metallic */}
    <rect
      x="50"
      y="50"
      width="40"
      height="100"
      rx="4"
      fill="#18181b"
      stroke="#27272a"
      strokeWidth="1"
    />
    <rect
      x="60"
      y="20"
      width="100"
      height="20"
      rx="4"
      fill="#18181b"
      stroke="#27272a"
      strokeWidth="1"
    />

    {/* CPU Socket Area Outline */}
    <rect
      x="100"
      y="80"
      width="100"
      height="100"
      fill="none"
      stroke="#3f3f46"
      strokeDasharray="4 4"
      opacity="0.5"
    />

    {/* RAM Slots - Dark Grey (140 height from previous fix) */}
    <g transform="translate(220, 60)">
      <rect
        x="0"
        y="0"
        width="10"
        height="140"
        fill="#18181b"
        stroke="#27272a"
      />
      <rect
        x="15"
        y="0"
        width="10"
        height="140"
        fill="#18181b"
        stroke="#27272a"
      />
      <rect
        x="30"
        y="0"
        width="10"
        height="140"
        fill="#18181b"
        stroke="#27272a"
      />
      <rect
        x="45"
        y="0"
        width="10"
        height="140"
        fill="#18181b"
        stroke="#27272a"
      />
    </g>

    {/* PCIe Slots - Dark with subtle metallic accent */}
    <rect
      x="40"
      y="220"
      width="220"
      height="15"
      fill="#18181b"
      stroke="#52525b"
      strokeWidth="1"
    />
    <rect
      x="40"
      y="260"
      width="220"
      height="15"
      fill="#18181b"
      stroke="#27272a"
    />
    <rect
      x="40"
      y="300"
      width="220"
      height="15"
      fill="#18181b"
      stroke="#27272a"
    />

    {/* Chipset Heatsink - Dark */}
    <rect
      x="180"
      y="330"
      width="80"
      height="50"
      rx="5"
      fill="#18181b"
      stroke="#27272a"
      strokeWidth="1"
    />
    <text
      x="220"
      y="360"
      textAnchor="middle"
      fill="#52525b"
      fontSize="12"
      fontFamily="monospace"
      fontWeight="bold"
    >
      NEXGEN
    </text>
  </svg>
);

export const CpuSVG = (props) => (
  <svg
    viewBox="0 0 100 100"
    className="w-full h-full drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]"
    {...props}
  >
    {/* IHS (Integrated Heat Spreader) */}
    <rect
      x="10"
      y="10"
      width="80"
      height="80"
      rx="4"
      fill="#0f172a"
      stroke="#3b82f6"
      strokeWidth="2"
    />
    {/* Inner details */}
    <rect
      x="35"
      y="25"
      width="30"
      height="30"
      rx="2"
      fill="#1e293b"
      opacity="0.5"
    />

    <text
      x="50"
      y="55"
      textAnchor="middle"
      fontSize="10"
      fill="#e2e8f0"
      fontWeight="bold"
      fontFamily="sans-serif"
    >
      i9-13900K
    </text>
    <circle cx="50" cy="35" r="2" fill="#3b82f6" opacity="0.7" />
  </svg>
);

export const RamSVG = (props) => (
  <svg
    viewBox="0 0 40 200"
    className="w-full h-full drop-shadow-[0_0_15px_rgba(251,191,36,0.3)]"
    {...props}
  >
    {/* Gold Heat Spreader */}
    <rect
      x="10"
      y="5"
      width="20"
      height="260"
      rx="2"
      fill="url(#ramGoldGradient)"
      stroke="#b45309"
      strokeWidth="1"
    />

    {/* Detail Lines */}
    <line
      x1="15"
      y1="20"
      x2="15"
      y2="180"
      stroke="#78350f"
      strokeWidth="1"
      opacity="0.5"
    />
    <line
      x1="25"
      y1="20"
      x2="25"
      y2="180"
      stroke="#78350f"
      strokeWidth="1"
      opacity="0.5"
    />

    <defs>
      <linearGradient id="ramGoldGradient" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#d97706" />
        <stop offset="30%" stopColor="#fbbf24" />
        <stop offset="50%" stopColor="#fcd34d" />
        <stop offset="70%" stopColor="#fbbf24" />
        <stop offset="100%" stopColor="#d97706" />
      </linearGradient>
    </defs>
  </svg>
);

export const GpuSVG = (props) => (
  <svg
    viewBox="0 0 350 120"
    className="w-full h-full drop-shadow-[0_0_25px_rgba(0,0,0,0.6)]"
    {...props}
  >
    {/* Main Body - Dark, Sleek */}
    <rect
      x="5"
      y="15"
      width="340"
      height="90"
      rx="4"
      fill="#0f172a"
      stroke="#334155"
      strokeWidth="2"
    />

    {/* Side Plate / Branding Area */}
    <rect
      x="20"
      y="40"
      width="150"
      height="40"
      rx="2"
      fill="#1e293b"
      stroke="#475569"
      strokeWidth="1"
    />
    <text
      x="95"
      y="65"
      textAnchor="middle"
      fontSize="14"
      fill="#e2e8f0"
      fontWeight="bold"
      fontFamily="sans-serif"
    >
      GEFORCE RTX
    </text>

    {/* Fans Container - Slightly recessed */}
    <rect
      x="190"
      y="25"
      width="145"
      height="70"
      rx="4"
      fill="#020617"
      opacity="0.5"
    />

    {/* Fan 1 */}
    <g transform="translate(225, 60)">
      <circle r="30" fill="none" stroke="#334155" strokeWidth="1" />
      <g>
        <path
          d="M0 -30 L0 30 M-26 -15 L26 15 M-26 15 L26 -15"
          stroke="#1e293b"
          strokeWidth="2"
        />
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 0 0"
          to="360 0 0"
          dur="2s"
          repeatCount="indefinite"
        />
      </g>
    </g>

    {/* Fan 2 */}
    <g transform="translate(295, 60)">
      <circle r="30" fill="none" stroke="#334155" strokeWidth="1" />
      <g>
        <path
          d="M0 -30 L0 30 M-26 -15 L26 15 M-26 15 L26 -15"
          stroke="#1e293b"
          strokeWidth="2"
        />
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 0 0"
          to="360 0 0"
          dur="2s"
          repeatCount="indefinite"
        />
      </g>
    </g>
  </svg>
);

export const StorageSVG = (props) => (
  <svg viewBox="0 0 120 40" className="w-full h-full drop-shadow-md" {...props}>
    <rect
      x="2"
      y="10"
      width="116"
      height="20"
      rx="2"
      fill="#0f172a"
      stroke="#334155"
      strokeWidth="1"
    />

    {/* Label Sticker */}
    <rect x="10" y="12" width="100" height="16" rx="1" fill="#1e293b" />

    {/* Green Accent */}
    <rect x="12" y="14" width="10" height="12" rx="1" fill="#22c55e" />

    <text
      x="65"
      y="22"
      textAnchor="middle"
      fontSize="8"
      fill="#e2e8f0"
      fontFamily="sans-serif"
    >
      Samsung 980 Pro
    </text>
  </svg>
);

export const CoolerSVG = (props) => (
  <svg
    viewBox="0 0 120 120"
    className="w-full h-full drop-shadow-[0_0_15px_rgba(59,130,246,0.4)]"
    {...props}
  >
    <rect
      x="10"
      y="10"
      width="100"
      height="100"
      rx="50"
      fill="#1e293b"
      stroke={colors.primary}
      strokeWidth="3"
    />
    <circle cx="60" cy="60" r="40" fill="url(#fanGradient)" opacity="0.8">
      <animateTransform
        attributeName="transform"
        type="rotate"
        from="0 60 60"
        to="360 60 60"
        dur="2s"
        repeatCount="indefinite"
      />
    </circle>
    <defs>
      <radialGradient id="fanGradient">
        <stop offset="30%" stopColor="#1e293b" />
        <stop offset="90%" stopColor="#3b82f6" />
        <stop offset="100%" stopColor="#60a5fa" />
      </radialGradient>
    </defs>
    <text
      x="60"
      y="65"
      textAnchor="middle"
      fontSize="12"
      fill="white"
      fontWeight="bold"
    >
      AIR
    </text>
  </svg>
);

export const PsuSVG = (props) => (
  <svg
    viewBox="0 0 200 120"
    className="w-full h-full drop-shadow-md"
    {...props}
  >
    <rect
      x="5"
      y="10"
      width="190"
      height="100"
      rx="5"
      fill="#0f172a"
      stroke="#eab308"
      strokeWidth="2"
    />
    <g>
      <circle cx="140" cy="60" r="35" fill="#334155" stroke="#475569" />
      <path d="M140 60 L140 30" stroke="#eab308" strokeWidth="2" />
      <animateTransform
        attributeName="transform"
        type="rotate"
        from="0 140 60"
        to="360 140 60"
        dur="2s"
        repeatCount="indefinite"
      />
    </g>
    <text
      x="50"
      y="65"
      textAnchor="middle"
      fontSize="16"
      fill="#eab308"
      fontWeight="bold"
    >
      PSU
    </text>
    <text x="50" y="85" textAnchor="middle" fontSize="10" fill="#94a3b8">
      850W
    </text>
  </svg>
);
