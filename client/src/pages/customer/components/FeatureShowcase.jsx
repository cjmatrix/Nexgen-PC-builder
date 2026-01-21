import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { BrainCircuit, Wrench, Settings2, Zap } from "lucide-react";

gsap.registerPlugin(useGSAP);

const FeatureShowcase = () => {
  const containerRef = useRef(null);
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);

  const features = [
    {
      id: 1,
      title: "AI-Powered Architect",
      subtitle: "Let our advanced AI design your perfect system instantly.",
      icon: <BrainCircuit className="w-4 h-4 fill-current" />,
      tag: "AI Assistant",
      path: "/ai-assistant",
      gradient: "from-purple-600 via-fuchsia-500 to-indigo-600",
      textGradient: "from-purple-200 via-purple-100 to-white",
    },
    {
      id: 2,
      title: "Interactive Builder",
      subtitle: "Drag, drop, and build your dream PC from scratch.",
      icon: <Wrench className="w-4 h-4 fill-current" />,
      tag: "Custom Builder",
      path: "/builder",
      gradient: "from-blue-600 via-cyan-500 to-teal-600",
      textGradient: "from-blue-200 via-cyan-100 to-white",
    },
    {
      id: 3,
      title: "Deep Customization",
      subtitle: "Fine-tune every component for maximum performance.",
      icon: <Settings2 className="w-4 h-4 fill-current" />,
      tag: "Pro Tools",
      path: "/builder",
      gradient: "from-emerald-600 via-green-500 to-lime-600",
      textGradient: "from-emerald-200 via-green-100 to-white",
    },
  ];


  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % features.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [features.length]);

  useGSAP(
    () => {
     
      gsap.fromTo(
        ".feature-content",
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power3.out", stagger: 0.1 },
      );

      // Animate background blob
      gsap.fromTo(
        ".bg-blob",
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 0.2, duration: 1.5, ease: "power2.out" },
      );
    },
    { scope: containerRef, dependencies: [activeIndex] },
  );

  const activeFeature = features[activeIndex];

  return (
    <div className="w-full pt-6 mb-8" ref={containerRef}>
    
      <div className="relative overflow-hidden bg-gray-900 rounded-3xl mx-4 md:mx-8 p-8 md:p-16 text-center text-white shadow-2xl h-[500px] flex flex-col justify-center items-center">
        {/* Dynamic Background Gradient Blob */}
        <div
          key={activeFeature.id}
          className={`bg-blob absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-4xl bg-gradient-to-r ${activeFeature.gradient} opacity-20 blur-[100px] pointer-events-none`}
        />

        <div className="relative z-10 max-w-3xl mx-auto space-y-6">
          {/* Tag */}
          <div className="feature-content inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-yellow-300 font-bold tracking-wide uppercase text-sm">
            {activeFeature.icon}
            {activeFeature.tag}
          </div>

          {/* Title */}
          <h1
            className={`feature-content text-5xl md:text-7xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r ${activeFeature.textGradient}`}
          >
            {activeFeature.title}
          </h1>

          {/* Subtitle */}
          <p className="feature-content text-xl text-gray-300 max-w-2xl mx-auto">
            {activeFeature.subtitle}
          </p>

          {/* Button */}
          <div className="feature-content pt-4">
            <button
              onClick={() => navigate(activeFeature.path)}
              className="px-8 py-3 bg-white text-gray-900 rounded-full font-bold hover:scale-105 transition-transform shadow-lg active:scale-95"
            >
              Explore Now
            </button>
          </div>
        </div>

        {/* Dots */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-20">
          {features.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                activeIndex === idx
                  ? "w-8 bg-white"
                  : "w-2 bg-white/30 hover:bg-white/50"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeatureShowcase;
