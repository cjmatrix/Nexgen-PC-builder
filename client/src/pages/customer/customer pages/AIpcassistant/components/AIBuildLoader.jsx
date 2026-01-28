import React, { useRef, useState, useEffect } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { BrainCircuit, Cpu, Database, Zap, Search, Cog } from "lucide-react";

gsap.registerPlugin(useGSAP);

const STEPS = [
  {
    text: "Analyzing detailed requirements...",
    icon: <Search className="w-5 h-5 text-blue-500" />,
  },
  {
    text: "Scanning component compatibility...",
    icon: <Cpu className="w-5 h-5 text-purple-500" />,
  },
  {
    text: "Optimizing price-to-performance...",
    icon: <Database className="w-5 h-5 text-pink-500" />,
  },
  {
    text: "Selecting premium parts...",
    icon: <Cog className="w-5 h-5 text-emerald-500 animate-spin-slow" />,
  },
  {
    text: "Finalizing build configuration...",
    icon: <Zap className="w-5 h-5 text-yellow-500" />,
  },
];

const AIBuildLoader = () => {
  const containerRef = useRef(null);
  const [currentStep, setCurrentStep] = useState(0);

  // Advance steps
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < STEPS.length - 1) return prev + 1;
        return prev; // Stop at last step
      });
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  useGSAP(
    () => {
      const tl = gsap.timeline({ repeat: -1 });

      gsap.to(".ring-1", {
        rotation: 360,
        duration: 20,
        ease: "none",
        repeat: -1,
      });
      gsap.to(".ring-2", {
        rotation: -360,
        duration: 15,
        ease: "none",
        repeat: -1,
      });
      gsap.to(".ring-3", {
        rotation: 180,
        duration: 25,
        ease: "none",
        repeat: -1,
      });

      gsap.to(".core-glow", {
        scale: 1.5,
        opacity: 0,
        duration: 2,
        repeat: -1,
        ease: "power2.out",
      });
    },
    { scope: containerRef },
  );

  useGSAP(
    () => {
      gsap.fromTo(
        ".step-text",
        { y: 10, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5 },
      );
    },
    { scope: containerRef, dependencies: [currentStep] },
  );

  return (
    <div
      ref={containerRef}
      className="w-full flex flex-col items-center justify-center py-20 min-h-[500px]"
    >
      {/* Central Tech Orb */}
      <div className="relative w-64 h-64 mb-16 flex items-center justify-center">
        {/* Background Glows */}
        <div className="absolute inset-0 bg-blue-500/10 blur-[60px] rounded-full animate-pulse"></div>
        <div className="absolute inset-0 bg-purple-500/10 blur-[40px] rounded-full animate-pulse delay-75"></div>

        {/* Animated Rings */}
        <div className="ring-1 absolute inset-0 border border-blue-200/50 rounded-full border-dashed"></div>
        <div className="ring-2 absolute inset-4 border border-purple-200/50 rounded-full border-dotted"></div>
        <div className="ring-3 absolute inset-8 border border-gray-200 rounded-full opacity-30"></div>

        {/* Orbiting Particles */}
        <div className="ring-1 absolute inset-0 rounded-full">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.8)]"></div>
        </div>
        <div className="ring-2 absolute inset-4 rounded-full">
          <div className="absolute bottom-0 right-1/2 translate-x-1/2 translate-y-1/2 w-2 h-2 bg-purple-500 rounded-full shadow-[0_0_15px_rgba(168,85,247,0.8)]"></div>
        </div>

        {/* Center Core */}
        <div className="relative z-10 w-24 h-24 bg-white rounded-2xl shadow-2xl flex items-center justify-center border border-gray-100">
          <div className="core-glow absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-2xl -z-10 blur-md"></div>
          <BrainCircuit className="w-12 h-12 text-gray-800" />
        </div>
      </div>

      <div className="w-full max-w-md space-y-6 text-center z-10">
        <h3 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
          Constructing Neural Build
        </h3>

        <div className="h-16 flex flex-col items-center justify-center relative">
          <div className="step-text flex items-center gap-3 text-lg font-medium text-gray-600 bg-white/50 backdrop-blur-sm px-6 py-2 rounded-full border border-gray-200 shadow-sm">
            {STEPS[currentStep].icon}
            {STEPS[currentStep].text}
          </div>
        </div>

        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden relative">
          <div
            className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-1000 ease-out"
            style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
          >
            <div className="absolute inset-0 bg-white/30 w-full animate-[shimmer_1s_infinite]"></div>
          </div>
        </div>

        <p className="text-sm text-gray-500 mt-2 font-medium">
          You can browse other products, we will notify you when it's done.
        </p>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default AIBuildLoader;
