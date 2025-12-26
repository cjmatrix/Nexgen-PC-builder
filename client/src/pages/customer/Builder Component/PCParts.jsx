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

export const MotherboardSVG = ({ dragType, dragPart }) => (
  <svg viewBox="0 0 300 400" className="w-full h-full drop-shadow-2xl">
    {/* PCB Board - White/Silver */}
    <rect
      x="10"
      y="10"
      width="280"
      height="380"
      rx="10"
      fill="#f8fafc"
      stroke={dragType === "motherboard" ? "#3b82f6" : "#cbd5e1"}
      style={
        dragType === "motherboard"
          ? { filter: "drop-shadow(0 0 5px #3b82f6)" }
          : {}
      }
      strokeWidth="2"
    />

    {/* Circuits - Subtle Silver */}
    <path d="M40 40 L40 360" stroke="#e2e8f0" strokeWidth="2" />
    <path d="M260 40 L260 360" stroke="#e2e8f0" strokeWidth="2" />
    <path
      d="M50 50 H250 V150 H50 Z"
      fill="none"
      stroke="#cbd5e1"
      strokeWidth="1"
      opacity="0.3"
    />

    {/* PSU-Container - Light Gray */}
    <rect
      x="10"
      y="400"
      width="74"
      height="40"
      rx="4"
      fill="#f1f5f9"
      stroke={dragType === "psu" ? "#3b82f6" : "#cbd5e1"}
      style={
        dragType === "psu" ? { filter: "drop-shadow(0 0 5px #3b82f6)" } : {}
      }
      strokeWidth="1"
    />
    <rect
      x="60"
      y="20"
      width="100"
      height="20"
      rx="4"
      fill="#f1f5f9"
      stroke="#cbd5e1"
      strokeWidth="1"
    />

    {/* CPU Socket Area Outline */}
    <rect
      x="100"
      y="80"
      width="100"
      height="100"
      fill="none"
      stroke={dragType === "cpu" ? "#3b82f6" : "#94a3b8"}
      strokeDasharray="4 4"
      opacity="0.5"
      style={
        dragType === "cpu" ? { filter: "drop-shadow(0 0 5px #3b82f6)" } : {}
      }
    />

    {/* RAM Slots - Light Gray */}
    <g transform="translate(220, 60)">
      <rect
        x="0"
        y="0"
        width="10"
        height="140"
        fill="#e2e8f0"
        stroke={dragType === "ram" ? "#3b82f6" : "#cbd5e1"}
        style={
          dragType === "ram" ? { filter: "drop-shadow(0 0 5px #3b82f6)" } : {}
        }
      />
      <rect
        x="15"
        y="0"
        width="10"
        height="140"
        fill="#e2e8f0"
        stroke="#cbd5e1"
      />
      <rect
        x="30"
        y="0"
        width="10"
        height="140"
        fill="#e2e8f0"
        stroke={dragType === "storage" ? "#3b82f6" : "#cbd5e1"}
        style={
          dragType === "storage"
            ? { filter: "drop-shadow(0 0 5px #3b82f6)" }
            : {}
        }
      />
      {/* <rect
        x="45"
        y="0"
        width="10"
        height="140"
        fill="#18181b"
        stroke="#27272a"
      /> */}
    </g>

    {/* PCIe Slots - Dark with subtle metallic accent */}
    {/* <rect
      x="40"
      y="220"
      width="220"
      height="15"
      fill="#18181b"
      stroke="#52525b"
      strokeWidth="1"
    /> */}
    {/* <rect
      x="40"
      y="260"
      width="220"
      height="15"
      fill="#18181b"
      stroke="#27272a"
    /> */}
    <rect
      x="40"
      y="250"
      width="220"
      height="58"
      fill="#f1f5f9"
      stroke={dragType === "gpu" ? "#3b82f6" : "#cbd5e1"}
      style={
        dragType === "gpu" ? { filter: "drop-shadow(0 0 5px #3b82f6)" } : {}
      }
    />

    {/* Chipset Heatsink - Silver */}
    <rect
      x="180"
      y="330"
      width="80"
      height="50"
      rx="5"
      fill="#e2e8f0"
      stroke="#cbd5e1"
      strokeWidth="1"
    />
    <text
      x="220"
      y="360"
      textAnchor="middle"
      fill="#64748b"
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
    className="w-full h-full drop-shadow-[0_5px_15px_rgba(0,0,0,0.3)]"
    {...props}
  >
    <defs>
      {/* Metallic Gradient for IHS (Integrated Heat Spreader) */}
      <linearGradient id="ihsGradient" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#e2e8f0" />
        <stop offset="30%" stopColor="#ffffff" />
        <stop offset="50%" stopColor="#f8fafc" />
        <stop offset="70%" stopColor="#cbd5e1" />
        <stop offset="100%" stopColor="#94a3b8" />
      </linearGradient>

      {/* PCB Substrate Gradient (Green) */}
      <linearGradient id="pcbGradient" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#059669" />
        <stop offset="100%" stopColor="#047857" />
      </linearGradient>

      {/* Gold Contact Gradient */}
      <linearGradient id="goldContact" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#fbbf24" />
        <stop offset="100%" stopColor="#d97706" />
      </linearGradient>
    </defs>

    {/* 1. PCB SUBSTRATE (The Green Board) */}
    {/* Side depth */}
    <rect x="8" y="12" width="84" height="84" rx="2" fill="#064e3b" />
    {/* Main Face */}
    <rect
      x="8"
      y="8"
      width="84"
      height="84"
      rx="2"
      fill="url(#pcbGradient)"
      stroke="#065f46"
      strokeWidth="0.5"
    />

    {/* 2. IHS (The Metal Top) */}
    {/* Side/Shadow depth for 3D look */}
    <path
      d="M15 15 L 85 15 L 85 85 L 15 85 Z"
      fill="#64748b"
      transform="translate(1, 1)"
      opacity="0.5"
    />

    {/* Main IHS Body with "Wings" (Modern Shape) */}
    <path
      d="M20 15 H80 V25 H85 V75 H80 V85 H20 V75 H15 V25 H20 Z"
      fill="url(#ihsGradient)"
      stroke="#94a3b8"
      strokeWidth="0.5"
    />

    {/* IHS Bevel Edge/Highlight */}
    <path
      d="M22 17 H78 V26 H82 V74 H78 V83 H22 V74 H18 V26 H22 Z"
      fill="none"
      stroke="white"
      strokeWidth="0.5"
      opacity="0.6"
    />

    {/* 3. DETAILS */}
    {/* Pin 1 Triangle */}
    <path d="M12 80 L 18 80 L 12 86 Z" fill="url(#goldContact)" />

    {/* Laser Etching Text */}
    <text
      x="50"
      y="45"
      textAnchor="middle"
      fontSize="6"
      fill="#475569"
      fontFamily="monospace"
      fontWeight="bold"
      opacity="0.7"
    >
      NEXGEN
    </text>
    <text
      x="50"
      y="55"
      textAnchor="middle"
      fontSize="8"
      fill="#334155"
      fontWeight="bold"
      fontFamily="sans-serif"
    >
      i9-13900K
    </text>
    <text
      x="50"
      y="62"
      textAnchor="middle"
      fontSize="4"
      fill="#64748b"
      fontFamily="monospace"
    >
      3.00GHZ
    </text>

    {/* Top Hole/Notch Indicator */}
    <circle cx="50" cy="20" r="1.5" fill="#94a3b8" />
  </svg>
);

export const RamSVG = (props) => (
  <svg
    viewBox="0 0 40 200"
    className="w-full h-full drop-shadow-[2px_2px_5px_rgba(0,0,0,0.2)]"
    {...props}
  >
    <defs>
      {/* Brushed Metal Gradient */}
      <linearGradient id="ramMetalGradient" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#94a3b8" />
        <stop offset="10%" stopColor="#e2e8f0" />
        <stop offset="25%" stopColor="#f1f5f9" />
        <stop offset="50%" stopColor="#cbd5e1" />
        <stop offset="90%" stopColor="#64748b" />
        <stop offset="100%" stopColor="#475569" />
      </linearGradient>

      {/* RGB Light Bar Gradient */}
      <linearGradient id="rgbBarGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#3b82f6" />
        <stop offset="50%" stopColor="#60a5fa" />
        <stop offset="100%" stopColor="#3b82f6" />
      </linearGradient>

      {/* Dark Side Depth */}
      <linearGradient id="ramDepthGradient" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#334155" />
        <stop offset="100%" stopColor="#0f172a" />
      </linearGradient>
    </defs>

    {/* 1. PCB BASE (Dark Green sliver at bottom) */}
    <rect x="12" y="180" width="16" height="20" fill="#064e3b" />

    {/* 2. HEAT SPREADER MAIN BODY (3D Thickness) */}
    {/* Left Face (Depth) */}
    <path d="M5 20 L 5 180 L 10 185 L 10 15 Z" fill="url(#ramDepthGradient)" />

    {/* Front Face (Main) */}
    <rect
      x="10"
      y="15"
      width="20"
      height="250"
      rx="1"
      fill="url(#ramMetalGradient)"
      stroke="#64748b"
      strokeWidth="0.5"
    />

    {/* 3. DESIGN DETAILS */}
    {/* Geometric Cuts / Fins */}
    <path d="M10 40 L 30 50 L 30 60 L 10 50 Z" fill="#fff" opacity="0.3" />
    <path d="M10 80 L 30 90 L 30 100 L 10 90 Z" fill="#fff" opacity="0.3" />
    <path d="M10 120 L 30 130 L 30 140 L 10 130 Z" fill="#fff" opacity="0.3" />

    {/* NEXGEN Logo Vertical */}
    <text
      x="-100"
      y="24"
      transform="rotate(-90)"
      textAnchor="middle"
      fontSize="4"
      fill="#1e293b"
      fontWeight="bold"
      letterSpacing="1"
      opacity="0.6"
    >
      NEXGEN PERFORMANCE
    </text>

    {/* 4. RGB LIGHT BAR (Top) */}
    {/* Light diffuser */}
    <rect
      x="8"
      y="5"
      width="24"
      height="10"
      rx="2"
      fill="url(#rgbBarGradient)"
      style={{ filter: "drop-shadow(0 0 4px #3b82f6)" }}
    />
    {/* Refection highlight */}
    <rect
      x="10"
      y="6"
      width="20"
      height="2"
      rx="1"
      fill="white"
      opacity="0.4"
    />

    {/* 5. GOLD PINS (Contacts) */}
    <g transform="translate(12, 185)">
      {/* Pin Array */}
      {[0, 2, 4, 6, 8, 10, 12, 14].map((x) => (
        <rect key={x} x={x} y="0" width="1" height="15" fill="#f59e0b" />
      ))}
    </g>
  </svg>
);

export const GpuSVG = (props) => (
  <svg
    viewBox="0 0 350 195"
    className="w-full h-full drop-shadow-[0_10px_20px_rgba(0,0,0,0.25)]" // Enhanced drop shadow for depth
    {...props}
  >
    <defs>
      {/* Metallic Gradient for Backplate/Body */}
      <linearGradient id="gpuBodyGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="40%" stopColor="#f1f5f9" />
        <stop offset="100%" stopColor="#e2e8f0" />
      </linearGradient>

      {/* Darker Gradient for Side/Bottom fake depth */}
      <linearGradient id="gpuDepthGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#cbd5e1" />
        <stop offset="100%" stopColor="#94a3b8" />
      </linearGradient>

      {/* Fan Gradient for curvature */}
      <radialGradient id="fanBladeGradient">
        <stop offset="40%" stopColor="#1e293b" />
        <stop offset="90%" stopColor="#334155" />
        <stop offset="100%" stopColor="#475569" />
      </radialGradient>

      {/* Copper Heatpipes */}
      <linearGradient id="copperGradient" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#b45309" />
        <stop offset="50%" stopColor="#d97706" />
        <stop offset="100%" stopColor="#b45309" />
      </linearGradient>
    </defs>

    {/* 1. HEATPIPES (Behind the shroud) */}
    <path
      d="M40 25 Q 50 10, 80 15 T 300 15"
      stroke="url(#copperGradient)"
      strokeWidth="6"
      fill="none"
      opacity="0.8"
    />

    {/* 2. MAIN BODY SHROUD (The Face) */}
    <rect
      x="5"
      y="20" // Moved down slightly to allow for "top" 3D edge
      width="340"
      height="85"
      rx="6"
      fill="url(#gpuBodyGradient)"
      stroke="#cbd5e1"
      strokeWidth="1"
    />

    {/* 3. 3D TOP EDGE (Highlights thickness) */}
    <path
      d="M11 20 L 5 20 L 10 12 L 340 12 L 345 20 L 339 20 Z"
      fill="#f8fafc" // Brighter top
      stroke="#e2e8f0"
      strokeWidth="1"
    />

    {/* 4. SIDE ACCENT / BRANDING PLATE (With metallic sheen) */}
    <rect
      x="20"
      y="45"
      width="140"
      height="35"
      rx="2"
      fill="url(#gpuBodyGradient)"
      stroke="#cbd5e1"
      strokeWidth="1"
      filter="drop-shadow(0 2px 2px rgba(0,0,0,0.1))"
    />
    {/* GeForce Text with slight shine */}
    <text
      x="90"
      y="66"
      textAnchor="middle"
      fontSize="13"
      fill="#334155"
      fontWeight="900"
      fontFamily="sans-serif"
      letterSpacing="1"
    >
      GEFORCE
    </text>
    <text
      x="90"
      y="77"
      textAnchor="middle"
      fontSize="9" // Smaller RTX
      fill="#64748b"
      fontWeight="700"
      fontFamily="sans-serif"
      letterSpacing="2"
    >
      RTX
    </text>

    {/* 5. FAN RECESS AREA (Inset look) */}
    <rect
      x="180"
      y="28"
      width="155"
      height="70"
      rx="8"
      fill="#0f172a" // Dark backing for fans
      stroke="#334155"
      strokeWidth="2"
      opacity="0.9"
    />

    {/* 6. FANS (Detailed & Spinning) */}

    {/* Fan 1 */}
    <g transform="translate(220, 63)">
      {/* Fan Housing Ring */}
      <circle r="32" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />
      <circle r="2" fill="#94a3b8" /> {/* Center Hub Pin */}
      <g>
        <circle r="8" fill="#334155" /> {/* Center Hub */}
        {/* Blades */}
        <path
          d="M0 -30 Q 10 -15, 0 0 Q -10 -15, 0 -30 M-26 -15 Q -10 -10, 0 0 Q -20 5, -26 -15 M-26 15 Q -20 -5, 0 0 Q -10 10, -26 15"
          fill="url(#fanBladeGradient)"
          stroke="#000"
          strokeWidth="0.5"
        />
        <path
          d="M 26 15 Q 20 5, 0 0 Q 10 10, 26 15 M 26 -15 Q 10 -10, 0 0 Q 20 5, 26 -15 M 0 30 Q -10 15, 0 0 Q 10 15, 0 30"
          fill="url(#fanBladeGradient)"
          stroke="#000"
          strokeWidth="0.5"
        />
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 0 0"
          to="360 0 0"
          dur="0.5s" // Faster, realistic spin
          repeatCount="indefinite"
        />
      </g>
    </g>

    {/* Fan 2 */}
    <g transform="translate(295, 63)">
      <circle r="32" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />
      <circle r="2" fill="#94a3b8" />

      <g>
        <circle r="8" fill="#334155" />
        {/* Blades duplicate */}
        <path
          d="M0 -30 Q 10 -15, 0 0 Q -10 -15, 0 -30 M-26 -15 Q -10 -10, 0 0 Q -20 5, -26 -15 M-26 15 Q -20 -5, 0 0 Q -10 10, -26 15"
          fill="url(#fanBladeGradient)"
          stroke="#000"
          strokeWidth="0.5"
        />
        <path
          d="M 26 15 Q 20 5, 0 0 Q 10 10, 26 15 M 26 -15 Q 10 -10, 0 0 Q 20 5, 26 -15 M 0 30 Q -10 15, 0 0 Q 10 15, 0 30"
          fill="url(#fanBladeGradient)"
          stroke="#000"
          strokeWidth="0.5"
        />
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 0 0"
          to="360 0 0"
          dur="0.5s"
          repeatCount="indefinite"
        />
      </g>
    </g>

    {/* 7. RGB ACCENT LINE (Glows) */}
    <rect
      x="180"
      y="28"
      width="155"
      height="2"
      fill="#3b82f6"
      filter="drop-shadow(0 0 2px #3b82f6)"
    />
  </svg>
);

export const StorageSVG = ({ label, ...props }) => (
  <svg viewBox="0 0 40 200" className="w-full h-full drop-shadow-md" {...props}>
    {/* Vertical PCB */}
    <rect
      x="10"
      y="-31"
      width="20"
      height="260"
      rx="2"
      fill="#0f172a"
      stroke="#334155"
      strokeWidth="1"
    />

    {/* Label Sticker - Vertical */}
    <rect
      x="12"
      y="30"
      width="16"
      height="120"
      rx="1"
      fill="#334155"
      opacity="0.8"
    />
    <rect x="14" y="32" width="12" height="10" rx="1" fill="#22c55e" />

    {/* Chips (hint) */}
    <rect x="12" y="160" width="16" height="20" rx="1" fill="#cbd5e1" />

    {/* Vertical Text */}
    {/* <text
      x="20"
      y="100"
      textAnchor="middle"
      fontSize="8"
      fill="#e2e8f0"
      fontFamily="sans-serif"
      transform="rotate(90 20 100)"
    >
      {label ? label.substring(0, 15) : "NVMe SSD"}
    </text> */}
  </svg>
);

export const CoolerSVG = ({ part }) => (
  <svg
    viewBox="0 0 120 120"
    className="w-full h-full drop-shadow-[0_0_15px_rgba(59,130,246,0.4)]"
  >
    <rect
      x="10"
      y="10"
      width="100"
      height="100"
      rx="50"
      fill="#ffffff"
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
      {part?.specs?.coolerType === "Liquid" ? "Liquid" : "Air"}
    </text>
  </svg>
);

export const PsuSVG = ({ part }) => (
  <svg
    viewBox="0 0 170 120"
    className="w-full h-full drop-shadow-[5px_5px_15px_rgba(0,0,0,0.2)]"
  >
    <defs>
      {/* Matte White Chassis Gradient */}
      <linearGradient id="psuBodyGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="100%" stopColor="#f1f5f9" />
      </linearGradient>

      {/* Dark Side/Bottom Depth */}
      <linearGradient id="psuDepthGradient" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#cbd5e1" />
        <stop offset="100%" stopColor="#94a3b8" />
      </linearGradient>

      {/* Hex Mesh Pattern for Fan */}
      <pattern
        id="hexMesh"
        x="0"
        y="0"
        width="8"
        height="8"
        patternUnits="userSpaceOnUse"
      >
        <path
          d="M4 0 L8 2 L8 6 L4 8 L0 6 L0 2 Z"
          fill="none"
          stroke="#cbd5e1"
          strokeWidth="0.5"
        />
      </pattern>
    </defs>

    {/* 1. 3D CHASSIS */}
    {/* Right Depth Face */}
    <path
      d="M 185 10 L 195 15 L 195 105 L 185 100 Z"
      fill="url(#psuDepthGradient)"
    />
    {/* Bottom Depth Face */}
    <path d="M 5 100 L 15 105 L 195 105 L 185 100 Z" fill="#94a3b8" />

    {/* Main Face */}
    <rect
      x="5"
      y="10"
      width="180"
      height="90"
      rx="2"
      fill="url(#psuBodyGradient)"
      stroke="#cbd5e1"
      strokeWidth="1"
    />

    {/* 2. FAN GRILLE AREA (Left Side) */}
    {/* Recessed Fan Area */}
    <circle cx="55" cy="55" r="35" fill="#1e293b" stroke="#cbd5e1" />

    {/* Spinning Fan Blades */}
    <g transform="translate(55, 55)">
      <g opacity="0.8">
        <path
          d="M0 -32 Q 15 -15, 0 0 Q -15 -15, 0 -32 M-28 -16 Q -15 -8, 0 0 Q -30 10, -28 -16 M-28 16 Q -30 -10, 0 0 Q -15 8, -28 16 M0 32 Q -15 15, 0 0 Q 15 15, 0 32 M28 16 Q 15 8, 0 0 Q 30 -10, 28 16 M28 -16 Q 30 10, 0 0 Q 15 -8, 28 -16"
          fill="#334155"
        />
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 0 0"
          to="360 0 0"
          dur="0.5s"
          repeatCount="indefinite"
        />
      </g>
      {/* Center Hub */}
      <circle r="6" fill="#cbd5e1" />
      <circle r="4" fill="white" opacity="0.5" /> {/* Shine */}
    </g>

    {/* Grille Overlay (Wire Guard) */}
    <circle
      cx="55"
      cy="55"
      r="35"
      fill="none"
      stroke="#cbd5e1"
      strokeWidth="2"
      opacity="0.5"
    />
    <path
      d="M55 20 L55 90 M20 55 L90 55"
      stroke="#cbd5e1"
      strokeWidth="1"
      opacity="0.5"
    />

    {/* 3. MODULAR PORTS (Right Side) */}
    <g transform="translate(100, 25)">
      <text
        x="0"
        y="-5"
        fontSize="6"
        fill="#64748b"
        fontFamily="sans-serif"
        fontWeight="bold"
      >
        MODULAR OUTPUT
      </text>
      {/* 24-Pin ATX */}
      <rect x="0" y="0" width="30" height="12" rx="1" fill="#334155" />
      <rect
        x="1"
        y="1"
        width="28"
        height="10"
        fill="none"
        stroke="#0f172a"
        strokeWidth="1"
        strokeDasharray="2 2"
      />

      {/* PCIe / CPU Ports */}
      <rect x="35" y="0" width="12" height="12" rx="1" fill="#334155" />
      <rect x="50" y="0" width="12" height="12" rx="1" fill="#334155" />
      <rect x="0" y="18" width="12" height="12" rx="1" fill="#334155" />
      <rect x="15" y="18" width="12" height="12" rx="1" fill="#334155" />

      {/* SATA / Molex */}
      <rect x="35" y="18" width="27" height="12" rx="1" fill="#334155" />

      {/* Labels */}
      <text x="0" y="40" fontSize="4" fill="#94a3b8">
        MB
      </text>
      <text x="35" y="40" fontSize="4" fill="#94a3b8">
        PCIe/CPU
      </text>
    </g>

    {/* 4. BRANDING & LABEL */}
    <rect
      x="110"
      y="70"
      width="60"
      height="20"
      rx="1"
      fill="#e2e8f0"
      opacity="0.5"
    />
    <text
      x="140"
      y="82"
      textAnchor="middle"
      fontSize="6"
      fill="#0f172a"
      fontWeight="bold"
      fontFamily="sans-serif"
    >
      NEXGEN
    </text>
    <text
      x="140"
      y="88"
      textAnchor="middle"
      fontSize="4"
      fill="#3b82f6"
      fontWeight="bold"
    >
      1000W PLATINUM
    </text>
  </svg>
);
