import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

const CustomDropdown = ({
  options = [],
  value,
  onChange,
  placeholder = "Select...",
  icon: Icon,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const optionsRef = useRef(null);


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

 
  useGSAP(() => {
    if (isOpen) {
      gsap.fromTo(
        optionsRef.current,
        {
          y: -10,
          opacity: 0,
          scaleY: 0.95,
          display: "block",
        },
        {
          y: 0,
          opacity: 1,
          scaleY: 1,
          duration: 0.2,
          ease: "power2.out",
          display: "block",
        },
      );
    } else {
      gsap.to(optionsRef.current, {
        y: -10,
        opacity: 0,
        scaleY: 0.95,
        duration: 0.15,
        ease: "power2.in",
        onComplete: () => {
          if (optionsRef.current) optionsRef.current.style.display = "none";
        },
      });
    }
  }, [isOpen]);

  const handleSelect = (option) => {
    const selectedValue = typeof option === "object" ? option.value : option;
    onChange(selectedValue);
    setIsOpen(false);
  };

  const getLabel = (option) => {
    return typeof option === "object" ? option.label : option;
  };

  const getValue = (option) => {
    return typeof option === "object" ? option.value : option;
  };

  
  const selectedOption = options.find((opt) => getValue(opt) === value);
  const currentLabel = selectedOption ? getLabel(selectedOption) : placeholder;

  return (
    <div
      ref={dropdownRef}
      className={`relative min-w-[180px] font-sans ${className} `}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-3 px-4 py-2.5 bg-white border border-gray-200 rounded-xl shadow-sm hover:border-blue-300 hover:shadow-md transition-all duration-200 text-left ${
          isOpen ? "ring-2 ring-blue-100 border-blue-400" : ""
        }`}
      >
        <div className="flex items-center gap-2 truncate">
          {Icon && <Icon size={18} className="text-gray-500 shrink-0" />}
          <span
            className={`text-sm font-medium ${
              value ? "text-gray-900" : "text-gray-500"
            }`}
          >
            {currentLabel}
          </span>
        </div>
        <ChevronDown
          size={16}
          className={`text-gray-400 transition-transform duration-300 ${
            isOpen ? "rotate-180 text-blue-500" : ""
          }`}
        />
      </button>

      <div
        ref={optionsRef}
        className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-xl z-[100] overflow-hidden hidden transform origin-top"
      >
        <div className="max-h-60 overflow-y-auto py-1 custom-scrollbar">
          {options.length > 0 ? (
            options.map((option, idx) => {
              const optValue = getValue(option);
              const isSelected = optValue === value;

              return (
                <button
                  key={idx}
                  onClick={() => handleSelect(option)}
                  className={`w-full flex items-center justify-between px-4 py-2 text-sm text-left transition-colors ${
                    isSelected
                      ? "bg-blue-50 text-blue-600 font-medium"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <span className="truncate">{getLabel(option)}</span>
                  {isSelected && <Check size={14} className="text-blue-600" />}
                </button>
              );
            })
          ) : (
            <div className="px-4 py-3 text-sm text-gray-400 text-center italic">
              No options
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomDropdown;
