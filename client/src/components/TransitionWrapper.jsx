import React, { useRef } from "react";
import gsap from "gsap";
import Flip from "gsap/Flip";
import { Transition } from "react-transition-group";

gsap.registerPlugin(Flip);

const TransitionWrapper = ({ children, mode = "move", ...props }) => {
  const nodeRef = useRef(null);

  const onExit = () => {
    if (nodeRef.current) {
      let config;

      if (mode === "delete") {
        config = {
          opacity: 0,
          scale: 0.8,
          y: 0,
          x: 0,
          duration: 0.3,
          ease: "power2.in",
        };
      } else {
        config = {
          opacity: 0,
          y: -100,
          x: 100,
          scale: 0.5,
          duration: 0.3,
          ease: "power3.in",
        };
      }

      gsap.to(nodeRef.current, config);
    }
  };

  const onExited = (node) => {
    const parent = nodeRef.current?.parentElement;
    if (parent) {
     
      const siblings = [...parent.children].filter((child) => child !== node);
      const state = Flip.getState(siblings);

      if (props.onExited) props.onExited(node);

      requestAnimationFrame(() => {
        Flip.from(state, {
          duration: 0.3,
          ease: "power2.inOut",
          scale: true,
          absolute: true,
          onEnter: (elements) =>
            gsap.fromTo(
              elements,
              { opacity: 0, scale: 0 },
              { opacity: 1, scale: 1, duration: 1 },
            ),
          onLeave: (elements) =>
            gsap.to(elements, { opacity: 0, scale: 0, duration: 1 }),
        });
      });
    } else {
      if (props.onExited) props.onExited(node);
    }
  };

  return (
    <Transition
      timeout={300}
      onExit={onExit}
      {...props}
      onExited={onExited} //onexted like bell that need ring by manager(wrapoprer) to the boss(transitionGrouup)
      nodeRef={nodeRef}
      unmountOnExit
    >
      {(state) => (
        <div ref={nodeRef} className="w-full">
          {children}
        </div>
      )}
    </Transition>
  );
};

export default TransitionWrapper;
