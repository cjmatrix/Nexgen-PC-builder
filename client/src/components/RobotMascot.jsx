import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

const RobotMascot = ({ className = "" }) => {
  const containerRef = useRef(null);
  const floaterRef = useRef(null);
  const eyesRef = useRef(null);
  const leftHandRef = useRef(null);
  const rightHandRef = useRef(null);

  useGSAP(
    () => {
      // Idle Float (Inner Element)
      gsap.to(floaterRef.current, {
        y: -5,
        duration: 1.5,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
      });

      // Blink
      const blink = () => {
        if (!eyesRef.current) return;
        gsap.to(eyesRef.current, {
          scaleY: 0.1,
          duration: 0.1,
          yoyo: true,
          repeat: 1,
          onComplete: () => {
            gsap.delayedCall(Math.random() * 3 + 2, blink);
          },
        });
      };
      blink();

   
      const tl = gsap.timeline({ repeat: -1, repeatDelay: 2 });

      // Start: Neutral (Visible at start)

      tl.to(containerRef.current, {
        y: 40, // Hide down
        opacity: 0,
        duration: 0.5,
        ease: "back.in(1.7)",
      })
        .to(containerRef.current, {
          duration: 1.5, // Wait hidden
        })
        .to(containerRef.current, {
          y: -5, // Peek up 
          opacity: 1,
          duration: 0.8,
          ease: "back.out(1.7)",
        })
        .to(
          [leftHandRef.current, rightHandRef.current],
          {
            y: -2,
            duration: 0.2,
            yoyo: true,
            repeat: 3,
          },
          "-=0.4",
        ) // Tapping hands
        .to(containerRef.current, {
          rotate: 5,
          duration: 0.2,
          yoyo: true,
          repeat: 3, 
          keyframes: { rotate: [0, 5, -5, 5, 0] },
          ease: "power1.inOut",
        })
        .to(containerRef.current, {
          duration: 2, // Stay visible
        })
        .to(containerRef.current, {
       
          duration: 0,
        });
    },
    { scope: containerRef },
  );

  return (
    <div
      ref={containerRef}
      className={`absolute pointer-events-none select-none ${className}`}
      style={{ width: 60, height: 60 }}
    >
      <div ref={floaterRef} className="w-full h-full">
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-lg"
        >
        
          {/* Antenna */}
          <line
            x1="50"
            y1="20"
            x2="50"
            y2="10"
            stroke="#8b5cf6"
            strokeWidth="3"
          />
          <circle
            cx="50"
            cy="10"
            r="4"
            fill="#f472b6"
            className="animate-pulse"
          />

          {/* Head */}
          <rect
            x="20"
            y="20"
            width="60"
            height="50"
            rx="12"
            fill="#fff"
            stroke="#8b5cf6"
            strokeWidth="3"
          />

          {/* Face Screen */}
          <rect x="28" y="30" width="44" height="24" rx="6" fill="#1e1b4b" />

          {/* Eyes (Grouped for blinking) */}
          <g ref={eyesRef} transform-origin="50 42">
            <circle cx="38" cy="42" r="4" fill="#38bdf8" />
            <circle cx="62" cy="42" r="4" fill="#38bdf8" />
          </g>

          {/* Mouth */}
          <path
            d="M45 48 Q50 50 55 48"
            stroke="#38bdf8"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Hands */}
          <circle
            ref={leftHandRef}
            cx="15"
            cy="65"
            r="8"
            fill="#fff"
            stroke="#8b5cf6"
            strokeWidth="3"
          />
          <circle
            ref={rightHandRef}
            cx="85"
            cy="65"
            r="8"
            fill="#fff"
            stroke="#8b5cf6"
            strokeWidth="3"
          />
        </svg>
      </div>
    </div>
  );
};

export default RobotMascot;
