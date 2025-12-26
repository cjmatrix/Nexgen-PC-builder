import React, { useRef } from "react";
import { Hand, MousePointer2 } from "lucide-react"; // Using MousePointer2 as a cursor/hand
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

const DragIndicator = ({ isVisible }) => {
  const containerRef = useRef(null);
  const handRef = useRef(null);
  const pathRef = useRef(null);

  useGSAP(
    () => {
      if (!isVisible) return;

      const tl = gsap.timeline({ repeat: -1, repeatDelay: 1 });

      tl.set(handRef.current, { x: 750, y: 0, opacity: 0, scale: 1 });
      tl.to(handRef.current, { opacity: 1, duration: 0.4 });

      tl.to(handRef.current, { scale: 0.9, duration: 0.2 });

      
      tl.to(handRef.current, {
        x: 0,
        y: 100,
        duration: 1.5,
        ease: "power2.inOut",
       
      });

      tl.to(handRef.current, { scale: 1, duration: 0.2 });

      tl.to(handRef.current, { opacity: 0, duration: 0.4 });
    },
    { scope: containerRef, dependencies: [isVisible] }
  );

  if (!isVisible) return null;

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 left-[30%] pointer-events-none z-40 flex items-center justify-center"
    >
      <div className="relative w-full h-full">
        <div className="absolute top-[40%] left-[35%]-translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] flex items-center justify-center">
        
          <div className="absolute top-[30%] left-[100%] bg-white/90 backdrop-blur px-3 py-1.5 rounded-full shadow-lg border border-gray-100 text-xs font-bold text-blue-600 whitespace-nowrap animate-pulse">
            Drag component here
          </div>
        </div>

        <div
          ref={handRef}
          className="absolute top-[40%] left-[15%]  -translate-x-1/2 -translate-y-1/2 z-50 text-gray-900 drop-shadow-xl"
        >
          <div className="bg-white/90 p-2 rounded-full ring-4 ring-blue-500/20 backdrop-blur-sm">
            <MousePointer2 size={28} className="fill-blue-600 text-white" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DragIndicator;
