import React, { useRef } from "react";
import { Settings, Settings2, Cog } from "lucide-react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

const BackgroundGears = () => {
  const containerRef = useRef(null);

  useGSAP(
    () => {
     
      gsap.to(".gear-cw", {
        rotation: 360,
        duration: 20,
        repeat: -1,
        ease: "none",
      });

      gsap.to(".gear-ccw", {
        rotation: -360,
        duration: 20,
        repeat: -1,
        ease: "none",
      });

      gsap.to(".gear-fast", {
        rotation: 360,
        duration: 10,
        repeat: -1,
        ease: "none",
      });


    },
    { scope: containerRef }
  );

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden pointer-events-none z-0"
    >
     
      <div className="absolute -top-20 -left-20 opacity-[0.1] text-gray-900">
        <Settings size={400} className="gear-cw" />
      </div>
{/* 
      <div className="absolute top-1/4 -right-32 opacity-[0.00] text-gray-900">
        <Settings2 size={500} className="gear-ccw" />
      </div> */}

      <div className="absolute bottom-[50%] right-[4%] opacity-[0.04] text-gray-900">
        <Cog size={300} className="gear-cw" />
      </div>

     
      <div className="absolute top-[15%] left-[20%] opacity-[0.04] text-gray-900">
        <Cog size={120} className="gear-ccw" />
      </div>

      <div className="absolute bottom-[20%] right-[15%] opacity-[0.04] text-gray-900">
        <Settings size={180} className="gear-cw" />
      </div>

     
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(90deg, #000 1px, transparent 1px),
            linear-gradient(180deg, #000 1px, transparent 1px)
          `,
          backgroundSize: "100px 100px",
          maskImage:
            "radial-gradient(circle at center, transparent 30%, black 100%)",
        }}
      />

    
      
    </div>
  );
};

export default BackgroundGears;
