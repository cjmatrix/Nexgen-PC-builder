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
    className="w-full h-full drop-shadow-lg"
    {...props}
  >
    {/* PCB Board */}
    <rect
      x="10"
      y="10"
      width="280"
      height="380"
      rx="10"
      fill="#0f172a"
      stroke={colors.border}
      strokeWidth="2"
    />

    {/* Circuits */}
    <path d="M40 40 L40 360" stroke="#1e293b" strokeWidth="2" />
    <path d="M260 40 L260 360" stroke="#1e293b" strokeWidth="2" />
    <path
      d="M50 50 H250 V150 H50 Z"
      fill="none"
      stroke={colors.primary}
      strokeWidth="1"
      opacity="0.3"
    />

    {/* VRM Heatsinks */}
    <rect x="50" y="50" width="40" height="100" rx="4" fill="#334155" />
    <rect x="60" y="20" width="100" height="20" rx="4" fill="#334155" />

    {/* CPU Socket Area Outline (for alignment) */}
    <rect
      x="100"
      y="80"
      width="100"
      height="100"
      fill="none"
      stroke="#64748b"
      strokeDasharray="4 4"
    />

    {/* RAM Slots */}
    <g transform="translate(220, 60)">
      <rect
        x="0"
        y="0"
        width="10"
        height="180"
        fill="#1e293b"
        stroke={colors.border}
      />
      <rect
        x="15"
        y="0"
        width="10"
        height="180"
        fill="#1e293b"
        stroke={colors.border}
      />
      {/* <rect
        x="30"
        y="0"
        width="10"
        height="180"
        fill="#1e293b"
        stroke={colors.border}
      />
      <rect
        x="45"
        y="0"
        width="10"
        height="180"
        fill="#1e293b"
        stroke={colors.border}
      /> */}
    </g>

    {/* PCIe Slots */}
    <rect
      x="40"
      y="220"
      width="220"
      height="15"
      fill="#1e293b"
      stroke={colors.primary}
    />
    <rect
      x="40"
      y="260"
      width="220"
      height="15"
      fill="#1e293b"
      stroke={colors.border}
    />
    <rect
      x="40"
      y="300"
      width="220"
      height="15"
      fill="#1e293b"
      stroke={colors.border}
    />

    {/* Chipset Heatsink */}
    <rect x="180" y="330" width="80" height="50" rx="5" fill="#334155" />
    <text
      x="220"
      y="360"
      textAnchor="middle"
      fill="#94a3b8"
      fontSize="12"
      fontFamily="monospace"
    >
      CHIPSET
    </text>
  </svg>
);

export const CpuSVG = (props) => (
  <svg
    viewBox="0 0 100 100"
    className="w-full h-full drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]"
    {...props}
  >
    <rect
      x="5"
      y="5"
      width="90"
      height="90"
      rx="8"
      fill="#e2e8f0"
      stroke={colors.primary}
      strokeWidth="2"
    />
    <rect x="25" y="25" width="50" height="50" fill="#94a3b8" />
    <circle cx="50" cy="50" r="10" fill="#64748b" opacity="0.5" />
    <text
      x="50"
      y="85"
      textAnchor="middle"
      fontSize="8"
      fill="#475569"
      fontWeight="bold"
    >
      PROCESSOR
    </text>
  </svg>
);

export const RamSVG = (props) => (
  <svg
    viewBox="0 0 40 200"
    className="w-full h-full drop-shadow-[0_0_10px_rgba(34,197,94,0.3)]"
    {...props}
  >
    <rect
      x="5"
      y="5"
      width="30"
      height="190"
      rx="4"
      fill="#1e293b"
      stroke={colors.success}
      strokeWidth="2"
    />
    {/* RGB Strip */}
    <rect
      x="12"
      y="10"
      width="16"
      height="180"
      rx="2"
      fill="url(#ramGradient)"
    />
    <defs>
      <linearGradient id="ramGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#22c55e" />
        <stop offset="50%" stopColor="#3b82f6" />
        <stop offset="100%" stopColor="#8b5cf6" />
      </linearGradient>
    </defs>
  </svg>
);

export const GpuSVG = (props) => (
  <svg
    viewBox="0 0 350 120"
    className="w-full h-full drop-shadow-[0_0_20px_rgba(139,92,246,0.4)]"
    {...props}
  >
    {/* Backplate */}
    <rect
      x="10"
      y="10"
      width="330"
      height="100"
      rx="8"
      fill="#1e293b"
      stroke={colors.accent}
      strokeWidth="2"
    />

    {/* Fan 1 */}
    <g>
      <circle
        cx="80"
        cy="60"
        r="35"
        fill="#334155"
        stroke={colors.border}
        strokeWidth="1"
      />
      <path
        d="M80 60 L80 25 M80 60 L110 80 M80 60 L50 80"
        stroke="#475569"
        strokeWidth="2"
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 80 60"
          to="360 80 60"
          dur="1.5s"
          repeatCount="indefinite"
        />
      </path>
    </g>

    {/* Fan 2 */}
    <g>
      <circle
        cx="175"
        cy="60"
        r="35"
        fill="#334155"
        stroke={colors.border}
        strokeWidth="1"
      />
      <path
        d="M175 60 L175 25 M175 60 L205 80 M175 60 L145 80"
        stroke="#475569"
        strokeWidth="2"
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 175 60"
          to="360 175 60"
          dur="1.5s"
          repeatCount="indefinite"
        />
      </path>
    </g>

    {/* Fan 3 */}
    <g>
      <circle
        cx="270"
        cy="60"
        r="35"
        fill="#334155"
        stroke={colors.border}
        strokeWidth="1"
      />
      <path
        d="M270 60 L270 25 M270 60 L300 80 M270 60 L240 80"
        stroke="#475569"
        strokeWidth="2"
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 270 60"
          to="360 270 60"
          dur="1.5s"
          repeatCount="indefinite"
        />
      </path>
    </g>

    {/* Branding */}
    <rect
      x="20"
      y="10"
      width="310"
      height="10"
      fill={colors.accent}
      opacity="0.8"
    />
  </svg>
);

export const StorageSVG = (props) => (
  <svg viewBox="0 0 120 40" className="w-full h-full drop-shadow-md" {...props}>
    <rect
      x="2"
      y="5"
      width="116"
      height="30"
      rx="4"
      fill="#0f172a"
      stroke={colors.success}
      strokeWidth="1"
    />
    <text
      x="60"
      y="25"
      textAnchor="middle"
      fontSize="10"
      fill="#22c55e"
      fontFamily="monospace"
    >
      NVMe SSD
    </text>
    <rect x="100" y="5" width="15" height="30" fill="#eab308" opacity="0.8" />
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
