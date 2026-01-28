import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export const usePopupAnimation = ({ isOpen, containerRef, overlayRef, modalRef }) => {
  useGSAP(
    () => {
     
      if (isOpen) {
        const tl = gsap.timeline();

        
        if (overlayRef?.current) {
           tl.to(overlayRef.current, {
            opacity: 1,
            duration: 0.3,
            ease: "power2.out",
          });
        }

        if (modalRef?.current) {
          tl.to(
            modalRef.current,
            {
              opacity: 1,
              scale: 1,
              y: 0,
              duration: 0.4,
              ease: "back.out(1.5)",
            },
            "-=0.2" 
          );
        }
      }
    },
    { scope: containerRef, dependencies: [isOpen] }
  );
};