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
    <defs>
      {/* Matte White PCB Gradient */}
      <linearGradient id="moboPcbGradient" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#f8fafc" />
        <stop offset="100%" stopColor="#e2e8f0" />
      </linearGradient>

      {/* Silver Heatsink Gradient */}
      <linearGradient id="heatsinkGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#f1f5f9" />
        <stop offset="50%" stopColor="#cbd5e1" />
        <stop offset="100%" stopColor="#94a3b8" />
      </linearGradient>

      {/* Dark Port/Slot Gradient */}
      <linearGradient id="slotGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#334155" />
        <stop offset="100%" stopColor="#0f172a" />
      </linearGradient>

      {/* Striped Pattern for Heatsinks */}
      <pattern
        id="heatsinkFins"
        x="0"
        y="0"
        width="4"
        height="4"
        patternUnits="userSpaceOnUse"
      >
        <line
          x1="0"
          y1="0"
          x2="0"
          y2="4"
          stroke="#94a3b8"
          strokeWidth="0.5"
          opacity="0.5"
        />
      </pattern>
    </defs>
    {/* 1. PCB BASE BOARD */}
    <rect
      x="10"
      y="10"
      width="280"
      height="380"
      rx="10"
      fill="url(#moboPcbGradient)"
      stroke={dragType === "motherboard" ? "#3b82f6" : "#cbd5e1"}
      strokeWidth="2"
      style={
        dragType === "motherboard"
          ? { filter: "drop-shadow(0 0 5px #3b82f6)" }
          : {}
      }
    />
    {/* 2. CIRCUIT TRACES (Subtle background details) */}
    <path
      d="M40 40 L40 360 M260 40 L260 360 M50 350 L250 350"
      stroke="#cbd5e1"
      strokeWidth="1"
      fill="none"
      opacity="0.5"
    />
    <path
      d="M100 100 L 150 150 L 200 100"
      stroke="#cbd5e1"
      strokeWidth="0.5"
      fill="none"
      opacity="0.5"
    />
    {/* 3. VRM HEATSINKS (Top & Left Power Delivery) */}
    {/* Top Heatsink */}
    <rect
      x="60"
      y="20"
      width="100"
      height="25"
      rx="2"
      fill="url(#heatsinkGradient)"
      stroke="#cbd5e1"
      strokeWidth="1"
    />
    <rect
      x="62"
      y="22"
      width="96"
      height="21"
      fill="url(#heatsinkFins)"
      opacity="0.3"
    />
    {/* I/O Shroud (Left Side) */}
    <path
      d="M15 20 L 50 20 L 50 150 L 15 150 Z"
      fill="url(#heatsinkGradient)"
      stroke="#cbd5e1"
      strokeWidth="1"
    />
    <text
      writingMode="tb"
      x="25"
      y="50"
      fontSize="12"
      fill="#64748b"
      fontWeight="bold"
      fontFamily="sans-serif"
      opacity="0.7"
      style={{ letterSpacing: "3px" }}
    >
      PRO SERIES
    </text>
    {/* 4. CPU SOCKET (LGA 1700 style) */}
    <rect
      x="100"
      y="80"
      width="100"
      height="100"
      rx="4"
      fill="#f1f5f9"
      stroke={dragType === "cpu" ? "#3b82f6" : "#cbd5e1"}
      strokeWidth="2"
      style={
        dragType === "cpu" ? { filter: "drop-shadow(0 0 5px #3b82f6)" } : {}
      }
    />
    {/* Inner Mechanism */}
    <rect
      x="110"
      y="90"
      width="80"
      height="80"
      rx="2"
      fill="#e2e8f0"
      stroke="#cbd5e1"
    />
    <rect
      x="120"
      y="100"
      width="60"
      height="60"
      fill="none"
      stroke="#94a3b8"
      strokeDasharray="2 2"
    />
    {/* Locking Lever */}
    <path
      d="M195 90 L 195 160 L 205 160"
      stroke="#cbd5e1"
      strokeWidth="2"
      fill="none"
    />
    {/* 5. RAM SLOTS (DIMM) */}
    <g transform="translate(220, 60)">
      {/* 4 DIMM Slots with realistic latch details */}
      {[0, 15, 30, 45].map((xOffset, i) => (
        <g key={i}>
          {/* Main Slot Body */}
          <rect
            x={xOffset}
            y="0"
            width="10"
            height="140"
            fill={i % 2 === 0 ? "#cbd5e1" : "#334155"} // Alternating colors
            stroke={(dragType === "ram" && i!==0) ? "#3b82f6" : "#475569"}
            strokeWidth="0"
            style={
              ((dragType === "ram" && i!==2 && i!==3) || dragType === "storage" &&i!==0 &&i!==1  && i!==3)
                ? { filter: "drop-shadow(0 0 2px #3b82f6)" }
                : {}
            }
          />
          {/* Top Latch */}
          {/* <rect
            x={xOffset - 1}
            y="-5"
            width="12"
            height="5"
            fill="#334155"
            rx="1"
          /> */}
          {/* Bottom Latch */}
          {/* <rect
            x={xOffset - 1}
            y="140"
            width="12"
            height="5"
            fill="#334155"
            rx="1"
          /> */}
        </g>
      ))}
    </g>
    {/* 6. PCIE SLOTS (x16 and M.2) */}
    {/* Top M.2 Heatsink (Above GPU) */}
    <rect
      x="100"
      y="190"
      width="100"
      height="25"
      rx="2"
      fill="url(#heatsinkGradient)"
      stroke="#cbd5e1"
      strokeWidth="1"
    />
    <text x="150" y="205" textAnchor="middle" fontSize="6" fill="#64748b">
      M.2_1 GEN5
    </text>
    {/* Main x16 Slot (Reinforced) */}
    <rect
      x="40"
      y="235"
      width="220"
      height="12"
      fill="#e2e8f0" // Steel Armor Look
      stroke="#94a3b8"
      strokeWidth="1"
    />
    <rect x="42" y="237" width="216" height="8" fill="#0f172a" />{" "}
    {/* The Slot itself */}
    {/* GPU Placeholder Area (Matches GPU drag target) */}
    <rect
      x="40"
      y="250"
      width="220"
      height="58"
      fill="none" // Transparent styling placeholder
      stroke={dragType === "gpu" ? "#3b82f6" : "none"}
      style={
        dragType === "gpu" ? { filter: "drop-shadow(0 0 5px #3b82f6)" } : {}
      }
    />
    {/* Secondary PCIe Slots */}
    <rect x="40" y="310" width="220" height="8" fill="#334155" rx="1" />
    {/* <rect x="40" y="330" width="220" height="8" fill="#334155" rx="1" /> */}
    {/* 7. CHIPSET HEATSINK (Bottom Right) */}
    <rect
      x="180"
      y="330"
      width="90"
      height="60" // Slightly larger cover
      rx="4"
      fill="url(#heatsinkGradient)"
      stroke="#cbd5e1"
      strokeWidth="1"
    />
    {/* Chipset Branding / RGB Zone */}
    <rect
      x="190"
      y="340"
      width="70"
      height="40"
      rx="2"
      fill="#f8fafc"
      opacity="0.5"
    />
    {/* Stylized Logo */}
    <path d="M200 350 L 210 350 L 205 370 Z" fill="#3b82f6" opacity="0.8" />
    <text
      x="225"
      y="365"
      textAnchor="middle"
      fill="#334155"
      fontSize="10"
      fontFamily="monospace"
      fontWeight="bold"
    >
      NEXGEN
    </text>
    {/* 8. AUDIO CAPACITORS (Bottom Left) */}
    <circle cx="30" cy="350" r="5" fill="#fbbf24" stroke="#d97706" />
    <circle cx="30" cy="365" r="5" fill="#fbbf24" stroke="#d97706" />
    <circle cx="30" cy="380" r="5" fill="#fbbf24" stroke="#d97706" />
    <path d="M25 330 L 25 385" stroke="#cbd5e1" strokeWidth="0.5" />{" "}
    {/* Audio Trace Separation */}
    {/* 9. PSU SHROUD INDICATOR (Bottom) */}
    <rect
      x="10"
      y="400" // Kept original Y
      width="74"
      height="40"
      fill="none"
      stroke={dragType === "psu" ? "#3b82f6" : "none"}
    />
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
  <svg
    viewBox="0 0 40 300"
    className="w-full h-full drop-shadow-[2px_2px_5px_rgba(0,0,0,0.2)]"
    {...props}
  >
    <defs>
      <linearGradient id="ssdGold" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#b45309" />
        <stop offset="50%" stopColor="#fbbf24" />
        <stop offset="100%" stopColor="#b45309" />
      </linearGradient>
      <linearGradient id="ssdPcb" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#1e293b" />
        <stop offset="100%" stopColor="#0f172a" />
      </linearGradient>
      <linearGradient id="ssdLabel" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#f8fafc" />
        <stop offset="100%" stopColor="#e2e8f0" />
      </linearGradient>
    </defs>
    {/* 1. M.2 PCB BODY */}
    {/* Side depth (Thickness) */}
    <path d="M5 20 L 5 180 L 10 185 L 10 15 Z" fill="#020617" opacity="0.6" />
    {/* Main Face PCB */}
    <rect
      x="10"
      y="15"
      width="20"
      height="260"
      rx="1"
      fill="url(#ssdPcb)"
      stroke="#334155"
      strokeWidth="0.5"
    />
    {/* 2. GOLD CONNECTOR PINS (M-Key Style) */}
    <g transform="translate(10, 175)">
      {/* Contact Pads */}
      <rect x="2" y="5" width="2" height="10" fill="url(#ssdGold)" />
      <rect x="5" y="5" width="2" height="10" fill="url(#ssdGold)" />
      <rect x="8" y="5" width="2" height="10" fill="url(#ssdGold)" />
      <rect x="11" y="5" width="2" height="10" fill="url(#ssdGold)" />
      <rect x="14" y="5" width="2" height="10" fill="url(#ssdGold)" />
      {/* Notch Cutout */}
      <rect x="16.5" y="5" width="1" height="10" fill="#0f172a" />
    </g>
    {/* 3. COMPONENT CHIPS */}
    {/* Controller Chip (Square) */}
    <rect
      x="12"
      y="35"
      width="16"
      height="16"
      fill="#334155"
      stroke="#475569"
      strokeWidth="0.5"
    />
    <circle cx="20" cy="43" r="2" fill="#475569" /> {/* Chip Logo */}
    {/* NAND Flash Chips */}
    <rect
      x="12"
      y="60"
      width="16"
      height="30"
      fill="#1e293b"
      stroke="#334155"
      strokeWidth="0.5"
    />
    <rect
      x="12"
      y="95"
      width="16"
      height="30"
      fill="#1e293b"
      stroke="#334155"
      strokeWidth="0.5"
    />
    {/* 4. THERMAL LABEL / STICKER */}
    <rect
      x="11"
      y="55"
      width="18"
      height="80"
      rx="1"
      fill="url(#ssdLabel)"
      opacity="0.95"
    />
    {/* Branding Text on Sticker */}
    <text
      x="-95"
      y="20"
      transform="rotate(-90)"
      textAnchor="middle"
      fontSize="4"
      fill="#0f172a"
      fontWeight="bold"
      letterSpacing="1"
    >
      NEXGEN SSD
    </text>
    <text
      x="-95"
      y="26"
      transform="rotate(-90)"
      textAnchor="middle"
      fontSize="3"
      fill="#3b82f6"
      fontWeight="bold"
    >
      GEN5 NVMe
    </text>
    {/* 5. MOUNTING SCREW HOLE (Top Semi-circle) */}
    <path
      d="M15 15 A 5 5 0 0 0 25 15 L 25 15 L 15 15 Z"
      fill="#0f172a"
      stroke="none"
    />
    <circle cx="20" cy="15" r="2.5" fill="#e2e8f0" stroke="#94a3b8" />
    <path
      d="M19 15 L 21 15 M 20 14 L 20 16"
      stroke="#fbbf24"
      strokeWidth="0.5"
    />{" "}
    {/* Screw Head */}
  </svg>
);

export const CoolerSVG = ({ part }) => {
  const isLiquid = part?.specs?.coolerType === "Liquid";

  return (
    <svg
      viewBox="0 0 120 120"
      className="w-full h-full drop-shadow-[0_5px_15px_rgba(0,0,0,0.2)]"
    >
      <defs>
        {/* Pump Block / Heatsink Base Gradient */}
        <linearGradient id="coolerBaseGradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#f1f5f9" />
        </linearGradient>

        {/* Display / Fan Center Gradient */}
        <radialGradient id="centerGradient" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#020617" />
        </radialGradient>

        {/* Copper Pipes / Contact Gradient */}
        <linearGradient id="copperPipe" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#b45309" />
          <stop offset="50%" stopColor="#d97706" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>
      </defs>

      {/* 1. MOUNTING BRACKET (X-Shape behind) */}
      <path
        d="M10 10 L 110 110 M 110 10 L 10 110"
        stroke="#cbd5e1"
        strokeWidth="6"
        strokeLinecap="round"
      />

      {isLiquid ? (
        <>
          {/* --- LIQUID AIO PUMP HEAD --- */}
          {/* Tubes exiting the block */}
          <path
            d="M95 40 C 110 40, 115 35, 120 30"
            stroke="#1e293b"
            strokeWidth="8"
            fill="none"
          />
          <path
            d="M95 80 C 110 80, 115 85, 120 90"
            stroke="#1e293b"
            strokeWidth="8"
            fill="none"
          />

          {/* Main Pump Housing */}
          <rect
            x="15"
            y="15"
            width="90"
            height="90"
            rx="20"
            fill="url(#coolerBaseGradient)"
            stroke="#e2e8f0"
            strokeWidth="1"
            filter="drop-shadow(0 4px 6px rgba(0,0,0,0.1))"
          />

          {/* Infinity Mirror Display Ring */}
          <circle
            cx="60"
            cy="60"
            r="32"
            fill="#0f172a"
            stroke="#334155"
            strokeWidth="1"
          />

          {/* RGB Ring Glint */}
          <circle
            cx="60"
            cy="60"
            r="30"
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2"
            filter="drop-shadow(0 0 4px #3b82f6)"
            opacity="0.8"
          />

          {/* Display Content (Temp) */}
          <circle cx="60" cy="60" r="28" fill="url(#centerGradient)" />
          <text
            x="60"
            y="65"
            textAnchor="middle"
            fontSize="14"
            fill="white"
            fontWeight="bold"
            fontFamily="sans-serif"
          >
            35°C
          </text>
          <text
            x="60"
            y="75"
            textAnchor="middle"
            fontSize="9"
            fill="white"
            fontWeight="bold"
            fontFamily="sans-serif"
            opacity="0.8"
          >
            LIQUID
          </text>
        </>
      ) : (
        <>
          {/* --- AIR COOLER HEATSINK --- */}
          {/* Heatpipes */}
          <path
            d="M20 10 V 110 M100 10 V 110"
            stroke="url(#copperPipe)"
            strokeWidth="4"
          />

          {/* Fins Stack (Top Down View) */}
          <rect
            x="15"
            y="15"
            width="90"
            height="90"
            rx="4"
            fill="#e2e8f0"
            stroke="#94a3b8"
          />
          {[25, 35, 45, 55, 65, 75, 85, 95].map((y) => (
            <line
              key={y}
              x1="15"
              y1={y}
              x2="105"
              y2={y}
              stroke="#cbd5e1"
              strokeWidth="1"
            />
          ))}

          {/* Center Fan Hub */}
          <circle
            cx="60"
            cy="60"
            r="35"
            fill="none"
            stroke="#cbd5e1"
            strokeWidth="2"
          />
          <circle cx="60" cy="60" r="10" fill="#334155" />

          {/* Fan Blades Spin */}
          <g transform="translate(60, 60)" opacity="0.6">
            <path
              d="M0 -30 Q 15 -10, 0 0 Q -15 -10, 0 -30 M0 30 Q -15 10, 0 0 Q 15 10, 0 30 M-30 0 Q -10 15, 0 0 Q -10 -15, -30 0 M30 0 Q 10 -15, 0 0 Q 10 15, 30 0"
              fill="#64748b"
            >
              <animateTransform
                attributeName="transform"
                type="rotate"
                from="0 0 0"
                to="360 0 0"
                dur="0.5s"
                repeatCount="indefinite"
              />
            </path>
          </g>

          <text
            x="60"
            y="60" // Centered on hub
            textAnchor="middle"
            fontSize="4"
            fill="#e2e8f0"
            fontWeight="bold"
            dy="1.5"
          >
            NEXGEN
          </text>
        </>
      )}
    </svg>
  );
};

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
