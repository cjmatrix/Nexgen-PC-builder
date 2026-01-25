import React, { useRef } from "react";
import { Link } from "react-router-dom";
import { Home, RefreshCcw, WifiOff } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

const NotFound = () => {
  const containerRef = useRef(null);
  const monitorRef = useRef(null);
  const textRef = useRef(null);
  const cableRef = useRef(null);

  useGSAP(
    () => {
      // Monitor Float Animation
      gsap.to(monitorRef.current, {
        y: -20,
        rotation: 2,
        duration: 3,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
      });

      // Cable Sway
      gsap.to(cableRef.current, {
        rotation: -10,
        transformOrigin: "top center",
        duration: 2,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
      });

      // Glitch Text Effect
      const glitchTimeline = gsap.timeline({ repeat: -1, repeatDelay: 2 });
      glitchTimeline
        .to(textRef.current, { skewX: 20, duration: 0.1, ease: "power4.inOut" })
        .to(textRef.current, {
          skewX: -20,
          duration: 0.1,
          ease: "power4.inOut",
        })
        .to(textRef.current, { skewX: 0, duration: 0.1, ease: "power4.inOut" })
        .to(textRef.current, {
          opacity: 0.5,
          duration: 0.05,
          yoyo: true,
          repeat: 3,
        });

      // Entrance Animation
      gsap.from(".fade-in", {
        y: 30,
        opacity: 0,
        stagger: 0.2,
        duration: 1,
        ease: "power2.out",
      });
    },
    { scope: containerRef },
  );

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 text-center font-sans overflow-hidden relative"
    >
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px] pointer-events-none"></div>

      {/* Main Content */}
      <div className="relative z-10 max-w-2xl w-full flex flex-col items-center">
        {/* SVG Illustration */}
        <div className="relative w-64 h-64 md:w-80 md:h-80 mb-8">
          <svg
            viewBox="0 0 200 200"
            className="w-full h-full drop-shadow-2xl"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Monitor */}
            <g ref={monitorRef}>
              <rect
                x="20"
                y="40"
                width="160"
                height="100"
                rx="10"
                fill="#FFFFFF"
                stroke="#E5E7EB"
                strokeWidth="4"
              />
              <rect
                x="30"
                y="50"
                width="140"
                height="80"
                rx="4"
                fill="#F3F4F6"
              />

              {/* Screen Content - Sad Face */}
              <text
                x="70"
                y="105"
                fontSize="40"
                fill="#EF4444"
                fontFamily="monospace"
                fontWeight="bold"
              >
                :(
              </text>

              {/* Stand */}
              <path d="M70 140 L130 140 L110 170 L90 170 Z" fill="#E5E7EB" />
              <rect
                x="60"
                y="170"
                width="80"
                height="10"
                rx="2"
                fill="#D1D5DB"
              />
            </g>

            {/* Disconnected Cable */}
            <g ref={cableRef} transform="translate(140, 110)">
              <path
                d="M0 0 Q10 20 0 40"
                stroke="#9CA3AF"
                strokeWidth="4"
                fill="none"
              />
              <rect
                x="-5"
                y="40"
                width="10"
                height="15"
                fill="#EF4444"
                rx="2"
              />
              <path
                d="M-2 55 L-2 60 M2 55 L2 60"
                stroke="#EF4444"
                strokeWidth="2"
              />
              <circle cx="0" cy="65" r="3" fill="#EF4444" opacity="0.6">
                <animate
                  attributeName="opacity"
                  values="0.6;0;0.6"
                  dur="1s"
                  repeatCount="indefinite"
                />
              </circle>
            </g>
          </svg>
        </div>

        {/* Text Content */}
        <h1 className="fade-in text-9xl font-black text-gray-900 mb-2 tracking-tighter select-none">
          404
        </h1>
        <h2
          ref={textRef}
          className="fade-in text-2xl md:text-3xl font-bold text-gray-600 mb-8 tracking-wide uppercase"
        >
          System{" "}
          <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-purple-600">
            Error
          </span>
        </h2>

        <p className="fade-in text-gray-500 text-lg md:text-xl font-medium mb-8 max-w-md">
          The component you are looking for seems to be disconnected or does not
          exist in our build.
        </p>

        {/* Buttons */}
        <div className="fade-in flex flex-col sm:flex-row gap-4">
          <Link
            to="/"
            className="group relative px-8 py-3 bg-black text-white font-bold rounded-xl overflow-hidden hover:scale-105 transition-transform shadow-lg shadow-gray-200"
          >
            <span className="relative z-10 flex items-center gap-2">
              <Home className="w-5 h-5" />
              Return Home
            </span>
            <div className="absolute inset-0 bg-linear-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </Link>

          <button
            onClick={() => window.location.reload()}
            className="px-8 py-3 bg-white text-gray-900 font-bold rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2 border border-gray-200 shadow-sm"
          >
            <RefreshCcw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
            Reboot System
          </button>
        </div>
      </div>

      {/* Footer Decorative Elements */}
      <div className="absolute bottom-8 text-gray-400 text-xs font-mono">
        RCR: 404_PAGE_NOT_FOUND // MEMORY_DUMP_COMPLETE
      </div>
    </div>
  );
};

export default NotFound;
