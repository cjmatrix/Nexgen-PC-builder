import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchComponents,
  selectPart,
  setSelected,
  resetBuild,
} from "../../store/slices/builderSlice";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import {
  Cpu,
  HardDrive,
  Monitor,
  Box,
  Zap,
  Wind,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  AlertCircle,
  ShoppingCart,
  Trash2,
} from "lucide-react";
import {
  MotherboardSVG,
  CpuSVG,
  RamSVG,
  GpuSVG,
  StorageSVG,
  CoolerSVG,
  PsuSVG,
} from "../../components/PCParts";

const STEPS = [
  { id: "cpu", label: "Processor", icon: Cpu },
  { id: "motherboard", label: "Motherboard", icon: Box },
  { id: "ram", label: "Memory", icon: Box },
  { id: "gpu", label: "Graphics Card", icon: Monitor },
  { id: "storage", label: "Storage", icon: HardDrive },
  { id: "cooler", label: "Cooling", icon: Wind },
  { id: "psu", label: "Power Supply", icon: Zap },
  { id: "case", label: "Case", icon: Box },
];

const VisualizerPart = ({ part, type, index }) => {
  const ref = useRef(null);

  useGSAP(() => {
    if (!part) return;

    // Animation for new part entering
    gsap.fromTo(
      ref.current,
      { opacity: 0, scale: 0.5, y: 50, rotation: -10 },
      {
        opacity: 1,
        scale: 1,
        y: 0,
        rotation: 0,
        duration: 0.6,
        ease: "back.out(1.7)",
      }
    );
  }, [part]);

  // Logic to show "Ghost" or "Placeholder" for specific parts (like Motherboard)
  const isGhost = !part && type === "motherboard";
  if (!part && !isGhost) return null; // Only allow rendering if part exists OR it's a ghost motherboard

  // Position logic (Mock positioning for visualizer)
  const getStyle = (type) => {
    switch (type) {
      case "cpu":
        return { top: "30%", left: "44.5%", width: "11%", zIndex: 20 };
      case "motherboard":
        return {
          top: "5%",
          left: "15%",
          width: "70%",
          height: "85%",
          zIndex: 1,
        };
      case "ram":
        return {
          top: "14.5%", // Align with top of slots
          left: "65%", // Align with slots
          width: "5%",
          height: "35%",
          zIndex: 15,
        };
      case "gpu":
        return {
          top: "52%",
          left: "17%",
          width: "66%",
          height: "22%",
          zIndex: 25,
        };
      case "cooler":
        return { top: "27%", left: "40.5%", width: "19%", zIndex: 30 };
      case "psu":
        return {
          bottom: "5%",
          left: "15%",
          width: "35%",
          height: "20%",
          zIndex: 5,
        };
      case "storage":
        return {
          bottom: "45%",
          left: "45%",
          width: "18%",
          height: "5%",
          zIndex: 10,
        };
      default:
        return {};
    }
  };

  const ComponentSVG = {
    cpu: CpuSVG,
    motherboard: MotherboardSVG,
    ram: RamSVG,
    gpu: GpuSVG,
    storage: StorageSVG,
    cooler: CoolerSVG,
    psu: PsuSVG,
    case: () => null, // Case is handled by background
  }[type];

  return (
    <div
      ref={ref}
      className={`absolute transition-all duration-300 ${
        isGhost ? "opacity-30 grayscale" : ""
      } pointer-events-none`}
      style={getStyle(type)}
    >
      {!isGhost && (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-md border border-white/20 px-2 py-1 rounded shadow-xl text-white text-[10px] whitespace-nowrap z-50">
          <span className="font-bold">{part.name}</span>
        </div>
      )}

      {ComponentSVG ? (
        <ComponentSVG />
      ) : (
        <div className="w-full h-full bg-blue-500/30 rounded-lg blur-sm border border-white/20"></div>
      )}
    </div>
  );
};

const PCBuilder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [currentStep, setCurrentStep] = useState(0);

  const { selected, options, totalPrice, estimatedWattage } = useSelector(
    (state) => state.builder
  );

  const containerRef = useRef(null);
  const stepRef = useRef(null);

  // Initial Data Fetching
  useEffect(() => {
    if (id) {
      const fetchProductConfig = async () => {
        try {
          const response = await api.get(`/products/${id}`);
          if (response.data.success && response.data.data.default_config) {
            dispatch(setSelected(response.data.data.default_config));
          }
        } catch (error) {
          console.error("Failed to load product config", error);
        }
      };
      fetchProductConfig();
    }
    // Always fetch initial categories
    dispatch(fetchComponents({ category: "cpu" }));
    dispatch(fetchComponents({ category: "storage" }));
    dispatch(fetchComponents({ category: "case" })); // Pre-fetch case for visualizer background if needed
  }, [id, dispatch]);

  // Dependency Fetching Logic
  useEffect(() => {
    if (selected.cpu) {
      dispatch(
        fetchComponents({
          category: "motherboard",
          params: { cpuId: selected.cpu._id },
        })
      );
      dispatch(
        fetchComponents({
          category: "cooler",
          params: { cpuId: selected.cpu._id },
        })
      );
      dispatch(
        fetchComponents({
          category: "gpu",
          params: { maxTier: selected.cpu.tier_level + 1 },
        })
      );
    }
  }, [dispatch, selected.cpu]);

  useEffect(() => {
    if (selected.motherboard) {
      dispatch(
        fetchComponents({
          category: "ram",
          params: { motherboardId: selected.motherboard._id },
        })
      );
    }
  }, [dispatch, selected.motherboard]);

  useEffect(() => {
    if (estimatedWattage > 0) {
      dispatch(
        fetchComponents({
          category: "psu",
          params: { minWattage: estimatedWattage + 150 },
        })
      );
    }
  }, [dispatch, estimatedWattage]);

  const handleSelect = (part) => {
    dispatch(selectPart({ category: STEPS[currentStep].id, component: part }));
  };

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  useGSAP(() => {
    gsap.fromTo(
      stepRef.current,
      { opacity: 0, x: 50 },
      { opacity: 1, x: 0, duration: 0.4, ease: "power2.out" }
    );
  }, [currentStep]);

  const currentCategory = STEPS[currentStep].id;
  const currentOptions = options[currentCategory] || [];
  const currentSelection = selected[currentCategory];

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans overflow-hidden flex flex-col pt-16">
      {/* Top Progress Bar */}
      <div className="h-16 border-b border-gray-800 flex items-center px-6 overflow-x-auto no-scrollbar bg-gray-900/90 backdrop-blur z-20">
        {STEPS.map((step, idx) => (
          <div
            key={step.id}
            onClick={() => setCurrentStep(idx)}
            className={`flex items-center shrink-0 mr-8 cursor-pointer transition-colors ${
              idx === currentStep
                ? "text-blue-500 font-bold"
                : selected[step.id]
                ? "text-green-500"
                : "text-gray-500"
            }`}
          >
            <div
              className={`p-1.5 rounded-full mr-2 ${
                idx === currentStep
                  ? "bg-blue-500/20"
                  : selected[step.id]
                  ? "bg-green-500/20"
                  : "bg-gray-800"
              }`}
            >
              {selected[step.id] ? (
                <CheckCircle size={16} />
              ) : (
                <step.icon size={16} />
              )}
            </div>
            <span className="text-sm tracking-wide">{step.label}</span>
            {idx < STEPS.length - 1 && (
              <ChevronRight size={14} className="ml-8 text-gray-700" />
            )}
          </div>
        ))}
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left: Visualizer (The "Case") */}
        <div className="flex-1 relative bg-linear-to-br from-gray-950 via-black to-gray-900 flex items-center justify-center p-10 overflow-hidden">
          {/* Background Grid/Effects */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          ></div>

          <div className="relative w-full max-w-2xl aspect-3/4 border border-gray-800 bg-black/40 rounded-3xl shadow-2xl backdrop-blur-md overflow-hidden ring-1 ring-white/5">
            {/* "Case" Frame */}
            <div className="absolute inset-0 border-20 border-gray-900/80 rounded-3xl pointer-events-none z-20"></div>

            {/* Parts Visualizer */}
            <div className="absolute inset-0 p-8 z-10">
              {selected.case && (
                <img
                  src={selected.case.image}
                  alt="Case"
                  className="absolute inset-0 w-full h-full object-cover opacity-50"
                />
              )}

              {STEPS.map((step) => (
                <VisualizerPart
                  key={step.id}
                  part={selected[step.id]}
                  type={step.id}
                />
              ))}
            </div>

            <div className="absolute bottom-10 left-0 w-full text-center z-30">
              <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-linear-to-r from-blue-400 to-purple-500">
                {selected.case ? "Custom Build" : "Select a Case"}
              </h2>
            </div>
          </div>
        </div>

        {/* Right: Selection Panel */}
        <div className="w-[450px] bg-gray-900 border-l border-gray-800 flex flex-col z-20 shadow-[-10px_0_30px_rgba(0,0,0,0.5)]">
          <div className="p-6 border-b border-gray-800">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                {React.createElement(STEPS[currentStep].icon, {
                  className: "text-blue-500",
                })}
                {STEPS[currentStep].label}
              </h2>
              <div className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">
                Step {currentStep + 1} / {STEPS.length}
              </div>
            </div>
            <p className="text-gray-400 text-sm">
              {selected[currentCategory]
                ? "You have selected a component. Select another to replace it."
                : "Choose a component from the list below."}
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3" ref={stepRef}>
            {currentOptions.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                <p>No compatible options found.</p>
                <p className="text-xs mt-2">
                  Try changing previous components.
                </p>
              </div>
            ) : (
              currentOptions.map((opt) => (
                <div
                  key={opt._id}
                  onClick={() => handleSelect(opt)}
                  className={`group p-4 rounded-xl border cursor-pointer w-full text-left transition-all duration-200 hover:scale-[1.02] ${
                    selected[currentCategory]?._id === opt._id
                      ? "bg-blue-600/10 border-blue-500 ring-1 ring-blue-500"
                      : "bg-gray-800/50 border-gray-700 hover:border-gray-500 hover:bg-gray-800"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3
                        className={`font-semibold ${
                          selected[currentCategory]?._id === opt._id
                            ? "text-blue-400"
                            : "text-gray-200"
                        }`}
                      >
                        {opt.name}
                      </h3>
                      <div className="text-xs text-gray-500 mt-1">
                        {opt.specs &&
                          Object.keys(opt.specs)
                            .slice(0, 2)
                            .map((k) => (
                              <span
                                key={k}
                                className="mr-2 inline-block bg-gray-700/50 px-1.5 py-0.5 rounded capitalize"
                              >
                                {k.replace(/([A-Z])/g, " $1").trim()}:{" "}
                                {opt.specs[k]}
                              </span>
                            ))}
                      </div>
                    </div>
                    <div className="font-bold text-blue-300">
                      ₹{(opt.price / 100).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-6 border-t border-gray-800 bg-gray-900">
            <div className="flex justify-between items-center mb-4 text-sm">
              <div className="text-gray-400">Total</div>
              <div className="text-xl font-bold text-white">
                ₹{(totalPrice / 100).toLocaleString()}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={prevStep}
                disabled={currentStep === 0}
                className="px-4 py-3 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-white font-mediums flex items-center justify-center gap-2"
              >
                <ChevronLeft size={18} /> Back
              </button>

              {currentStep === STEPS.length - 1 ? (
                <button
                  onClick={() => {
                    alert("Proceeding to checkout!");
                    // navigate('/checkout');
                  }}
                  className="px-4 py-3 rounded-lg bg-green-600 hover:bg-green-700 text-white font-bold transition-all shadow-[0_0_20px_rgba(22,163,74,0.3)] hover:shadow-[0_0_30px_rgba(22,163,74,0.5)] flex items-center justify-center gap-2"
                >
                  <ShoppingCart size={18} /> Buy Build
                </button>
              ) : (
                <button
                  onClick={nextStep}
                  className="px-4 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] flex items-center justify-center gap-2"
                >
                  Next <ChevronRight size={18} />
                </button>
              )}
            </div>

            <button
              onClick={() => {
                if (
                  window.confirm(
                    "Are you sure you want to clear your current build?"
                  )
                ) {
                  dispatch(resetBuild());
                  setCurrentStep(0);
                }
              }}
              className="w-full mt-3 px-4 py-3 rounded-lg bg-red-600/10 hover:bg-red-600/20 text-red-500 font-medium transition-colors flex items-center justify-center gap-2 border border-red-600/20"
            >
              <Trash2 size={18} /> Clear Build
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PCBuilder;
