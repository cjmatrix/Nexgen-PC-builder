import React from "react";
import { Link } from "react-router-dom";
import {
  Cpu,
  Monitor,
  HardDrive,
  CircuitBoard,
  Box,
  Zap,
  Fan,
  Server,
} from "lucide-react";

// Memory Stick icon fallback since lucide might not have 'MemoryStick' specific enough, using CircuitBoard or similar.
// Actually Lucide has 'MemoryStick'. Let's check avail, if not fallback.
// I'll use simple icons mapping.

const categories = [
  {
    id: "cpu",
    title: "Processors (CPU)",
    icon: <Cpu size={40} className="text-blue-500" />,
    description: "Manage CPUs, cores, and clock speeds.",
    color: "bg-blue-50 border-blue-200 hover:border-blue-400",
  },
  {
    id: "gpu",
    title: "Graphics Cards (GPU)",
    icon: <Monitor size={40} className="text-purple-500" />, // Monitor usually represents display but often used for GPU context if no better icon. Or 'Cpu' again? Let's use 'Monitor' or 'Zap'.
    description: "Manage GPUs, VRAM, and chipsets.",
    color: "bg-purple-50 border-purple-200 hover:border-purple-400",
  },
  {
    id: "motherboard",
    title: "Motherboards",
    icon: <CircuitBoard size={40} className="text-green-500" />,
    description: "Manage sockets, chipsets, and form factors.",
    color: "bg-green-50 border-green-200 hover:border-green-400",
  },
  {
    id: "ram",
    title: "Memory (RAM)",
    icon: <Server size={40} className="text-indigo-500" />, // Server often looks like rack/ram slots
    description: "Manage DDR4/DDR5 modules and speeds.",
    color: "bg-indigo-50 border-indigo-200 hover:border-indigo-400",
  },
  {
    id: "storage",
    title: "Storage (SSD/HDD)",
    icon: <HardDrive size={40} className="text-red-500" />,
    description: "Manage NVMe, SATA SSDs and HDDs.",
    color: "bg-red-50 border-red-200 hover:border-red-400",
  },
  {
    id: "case",
    title: "PC Cases",
    icon: <Box size={40} className="text-slate-500" />,
    description: "Manage sizing, airflow, and aesthetics.",
    color: "bg-slate-50 border-slate-200 hover:border-slate-400",
  },
  {
    id: "psu",
    title: "Power Supplies",
    icon: <Zap size={40} className="text-orange-500" />,
    description: "Manage wattages and efficiency ratings.",
    color: "bg-orange-50 border-orange-200 hover:border-orange-400",
  },
  {
    id: "cooler",
    title: "Cooling Systems",
    icon: <Fan size={40} className="text-cyan-500" />,
    description: "Manage AIOs, Air Coolers, and Fans.",
    color: "bg-cyan-50 border-cyan-200 hover:border-cyan-400",
  },
];

const ComponentManagement = () => {
  return (
    <div className="animate-fade-up font-sans">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Component Inventory
        </h1>
        <p className="text-gray-600">
          Select a category to manage its stock, pricing, and specifications.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {categories.map((cat) => (
          <Link
            to={`/admin/components/${cat.id}`}
            key={cat.id}
            className={`block p-6 rounded-2xl border transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${cat.color} bg-white`}
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-4 bg-white rounded-full shadow-sm">
                {cat.icon}
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">{cat.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{cat.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ComponentManagement;
