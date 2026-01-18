import React, { useState, useEffect } from "react";
import { Cpu, Database, Zap, HardDrive, Fan } from "lucide-react";

const AIBuildLoader = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const steps = [
    "Analyzing detailed requirements...",
    "Scanning component compatibility...",
    "Optimizing performance ratios...",
    "Selecting premium parts...",
    "Finalizing build configuration...",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full flex flex-col items-center justify-center py-16 animate-fade-in-up">
      {/* Central Animation Container */}
      <div className="relative w-64 h-64 mb-12">
        {/* Outer Glow Ring */}
        <div className="absolute inset-0 border-2 border-blue-500/20 rounded-full animate-[spin_8s_linear_infinite]" />
        <div className="absolute inset-4 border-2 border-purple-500/20 rounded-full animate-[spin_6s_linear_infinite_reverse]" />

        {/* Scanning Line */}
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-blue-500/10 to-transparent animate-[scan_3s_ease-in-out_infinite]" />

        {/* Central Tech Core */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            {/* Hexagon Layout of Icons */}
            <div className="absolute -top-12 -left-12 animate-bounce delay-100">
              <Cpu className="text-blue-500 shadow-lg shadow-blue-500/50" />
            </div>
            <div className="absolute -top-12 -right-12 animate-bounce delay-300">
              <Database className="text-purple-500" />
            </div>
            <div className="absolute -bottom-12 -left-12 animate-bounce delay-500">
              <HardDrive className="text-cyan-500" />
            </div>
            <div className="absolute -bottom-12 -right-12 animate-bounce delay-700">
              <Fan className="text-green-500" />
            </div>

            {/* Center Core */}
            <div className="bg-white p-4 rounded-2xl shadow-xl border border-gray-100 relative z-10 animate-pulse">
              <Zap className="w-10 h-10 text-yellow-500 fill-yellow-500" />
            </div>

            {/* Connecting Lines (Simulated with absolute divs) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-0.5 bg-gray-200 -z-0 rotate-45" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-0.5 bg-gray-200 -z-0 -rotate-45" />
          </div>
        </div>
      </div>

      {/* Text Status */}
      <div className="text-center space-y-3">
        <h3 className="text-2xl font-bold text-gray-800 bg-clip-text text-transparent bg-linear-to-r from-blue-600 to-purple-600">
          Constructing Your AI Build
        </h3>
        <p className="text-gray-500 font-medium h-6 min-w-[250px] transition-all duration-300">
          {steps[currentStep]}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="w-64 h-1.5 bg-gray-100 rounded-full mt-6 overflow-hidden">
        <div
          className="h-full bg-linear-to-r from-blue-500 via-purple-500 to-blue-500 w-full animate-[progress_2s_linear_infinite]"
          style={{ backgroundSize: "200% 100%" }}
        />
      </div>

      <style>{`
        @keyframes scan {
          0%, 100% { transform: translateY(-100%); opacity: 0; }
          50% { transform: translateY(0%); opacity: 1; }
        }
        @keyframes progress {
            0% { background-position: 100% 0; }
            100% { background-position: -100% 0; }
        }
      `}</style>
    </div>
  );
};

export default AIBuildLoader;
