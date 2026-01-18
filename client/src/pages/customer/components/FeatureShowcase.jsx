import React, { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { BrainCircuit, Wrench, Settings2, Sparkles } from "lucide-react";
import { useState } from "react";
import { useEffect } from "react";
gsap.registerPlugin(useGSAP);

const FeatureShowcase = () => {
  const containerRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const timelineRef = useRef(null);
  const previousIndexRef = useRef(0);

  const features = [
    {
      id: 1,
      title: "AI-Powered Architect",
      subtitle: "Let our advanced AI design your perfect system instantly.",
      icon: <BrainCircuit className="w-16 h-16 text-purple-400" />,
      color: "from-purple-900 to-indigo-900",
      accent: "border-purple-500/30",
    },
    {
      id: 2,
      title: "Interactive Builder",
      subtitle: "Drag, drop, and build your dream PC from scratch.",
      icon: <Wrench className="w-16 h-16 text-blue-400" />,
      color: "from-blue-900 to-cyan-900",
      accent: "border-blue-500/30",
    },
    {
      id: 3,
      title: "Deep Customization",
      subtitle: "Fine-tune every component for maximum performance.",
      icon: <Settings2 className="w-16 h-16 text-emerald-400" />,
      color: "from-emerald-900 to-teal-900",
      accent: "border-emerald-500/30",
    },
  ];

  // Auto-play logic
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      handleNext();
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, activeIndex]);

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % features.length);
  };

  const handleDotClick = (index) => {
    setIsAutoPlaying(false); // Pause on manual interaction
    setActiveIndex(index);
    // Restart autoplay after a delay? Or keep it paused?
    // Let's just restart it after a slightly longer delay if needed,
    // or rely on the user to let it go. ideally, we restart.
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  useGSAP(
    () => {
      const prevIndex = previousIndexRef.current;
      const currentIndex = activeIndex;

      if (prevIndex === currentIndex) {
        // Initial Load
        const slides = gsap.utils.toArray(".slide", containerRef.current);
        gsap.set(slides[currentIndex], { xPercent: 0, zIndex: 10, opacity: 1 });
        slides.forEach((s, i) => {
          if (i !== currentIndex)
            gsap.set(s, { xPercent: 100, zIndex: 0, opacity: 0 });
        });
        return;
      }

      const slides = gsap.utils.toArray(".slide", containerRef.current);
      // const direction = currentIndex > prevIndex ? 1 : -1;
      // Handle Wrap-around cases for direction if desired (e.g. 2 -> 0 is "next" so direction 1)
      // But for dots, 0 -> 2 could mean going backwards.
      // Let's settle on: "Slide Left" (Content moves Left) always for Auto.

      const entering = slides[currentIndex];
      const exiting = slides[prevIndex];

      const tl = gsap.timeline({
        onComplete: () => {
          previousIndexRef.current = currentIndex;
        },
      });

      // Reset Entering Slide Position
      // If we want "Left to Right side" literally:
      // Maybe Move Right? (Enter from Left, Exit Right).
      // Standard is usually Enter Right (x: 100), Exit Left (x: -100).

      // User said: "slide direction should left to right side".
      // This implies Move -> Right. (x starts at -100, goes to 0).
      gsap.set(entering, { xPercent: -100, opacity: 1, zIndex: 10 });
      gsap.set(exiting, { zIndex: 1 });

      tl.to(
        exiting,
        { xPercent: 100, duration: 0.8, ease: "power2.inOut" },
        0
      ).to(entering, { xPercent: 0, duration: 0.8, ease: "power2.inOut" }, 0);

      // Also animate content inside for "Parallax" effect?
      tl.fromTo(
        entering.querySelector(".content"),
        { x: -50, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.6, delay: 0.2 },
        0
      );
    },
    { scope: containerRef, dependencies: [activeIndex] }
  );

  return (
    <div className="w-full max-w-7xl mx-auto pt-6 px-4 sm:px-6 lg:px-8 mb-8">
      <div className="relative h-[500px] md:h-[550px] w-full rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl ring-1 ring-black/5 group bg-gray-900">
        <div ref={containerRef} className="relative w-full h-full">
          {features.map((feature, index) => (
            <div
              key={feature.id}
              className="slide absolute inset-0 w-full h-full"
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${feature.color}`}
              ></div>
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>

              <div className="absolute top-0 right-0 w-[400px] md:w-[800px] h-[400px] md:h-[800px] bg-white/5 rounded-full blur-[60px] md:blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
              <div className="absolute bottom-0 left-0 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-black/20 rounded-full blur-[40px] md:blur-[80px] translate-y-1/2 -translate-x-1/4"></div>

              <div className="content relative z-10 w-full h-full flex flex-col justify-center items-center text-center px-4 max-w-5xl mx-auto">
                <div
                  className={`inline-flex p-4 md:p-6 rounded-2xl bg-white/10 backdrop-blur-md mb-6 md:mb-8 border ${feature.accent} shadow-xl`}
                >
                  <div className="w-10 h-10 md:w-16 md:h-16 [&>svg]:w-full [&>svg]:h-full">
                    {feature.icon}
                  </div>
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-black text-white tracking-tight mb-4 md:mb-6 drop-shadow-sm leading-tight">
                  {feature.title}
                </h2>
                <p className="text-base sm:text-lg md:text-2xl text-gray-100 font-medium tracking-wide max-w-xs sm:max-w-md md:max-w-2xl mx-auto leading-relaxed text-balance">
                  {feature.subtitle}
                </p>

                <div className="mt-8 md:mt-10">
                  <button className="px-6 py-2.5 md:px-8 md:py-3 bg-white text-gray-900 rounded-full text-sm md:text-base font-bold hover:scale-105 transition-transform active:scale-95 shadow-lg shadow-white/20">
                    Explore Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Interactive Progress Indicators */}
        <div className="absolute bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 flex gap-3 md:gap-4 z-20 p-1.5 md:p-2 rounded-full bg-black/20 backdrop-blur-md border border-white/10">
          {features.map((_, idx) => (
            <button
              key={idx}
              onClick={() => handleDotClick(idx)}
              className={`relative h-2 md:h-3 rounded-full transition-all duration-300 ${
                activeIndex === idx
                  ? "bg-white w-6 md:w-8"
                  : "w-2 md:w-3 bg-white/50 hover:bg-white/80"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeatureShowcase;
