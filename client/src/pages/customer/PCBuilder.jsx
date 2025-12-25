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
} from "./Builder Component/PCParts";
import ComponentsList from "./Builder Component/ComponentsList";

import DraggablePartCard from "../../components/DraggablePartCard";
import { useDrop } from "react-dnd";

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

const VisualizerPart = ({
  part,
  type,
  index,
  handleSelect,
  selected,
  dragType,
  dragPart,
}) => {
  const ref = useRef(null);
  console.log(part, "partssss");
  useGSAP(() => {
    if (!part) return;

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

  const [{ isOver }, drop] = useDrop(
    () => ({
      accept: "COMPONENT",
      drop: (item) => {
        handleSelect(item);
      },
      collect: (monitor) => ({
        isOver: !!monitor.isOver(),
      }),
    }),
    [handleSelect]
  );

  const isGhost = !part && type === "motherboard";
  if (!part && !isGhost) return null;

  const getStyle = (type) => {
    switch (type) {
      case "cpu":
        return { top: "24%", left: "35.5%", width: "29%", zIndex: 20 };
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
          top: "14.5%",
          left: "65%",
          width: "5%",
          height: "35%",
          zIndex: 15,
        };
      case "gpu":
        return {
          top: "54.5%",
          left: "17%",
          width: "66%",
          height: "22%",
          zIndex: 25,
        };
      case "cooler":
        return { top: "27%", left: "40.5%", width: "19%", zIndex: 30 };
      case "psu":
        return {
          bottom: "4%",
          left: "17%",
          width: "18%",
          height: "20%",
          zIndex: 5,
        };
      case "storage":
        return {
          top: "18%",
          left: "72%",
          width: "5%",
          height: "35%",
          zIndex: 16,
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
    case: () => null,
  }[type];

  return (
    <div
      ref={(node) => {
        ref.current = node;

        drop(node);
      }}
      className={`absolute transition-all duration-300 ${
        isGhost ? " " : "drop-shadow-[0_0_1px_rgba(250,204,21,0.6)] scale-105"
      } `}
      style={getStyle(type)}
    >
      {ComponentSVG ? (
        <ComponentSVG dragType={dragType} part={part} />
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
  const [draggedItem, setDraggedItem] = useState({});

  console.log(draggedItem);

  const { selected, options, totalPrice, estimatedWattage } = useSelector(
    (state) => state.builder
  );

  const containerRef = useRef(null);
  const stepRef = useRef(null);
  const caseFrameRef = useRef(null);

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

    dispatch(fetchComponents({ category: "cpu" }));
    dispatch(fetchComponents({ category: "storage" }));
  }, [id, dispatch]);

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
      dispatch(
        fetchComponents({
          category: "case",
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

  const handleSelect = (item) => {
    dispatch(
      selectPart({ category: STEPS[currentStep].id, component: item.part })
    );
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

  useGSAP(() => {
    if (selected.case && caseFrameRef.current) {
      gsap.to(caseFrameRef.current, {
        keyframes: {
          "0%": {
            boxShadow: "0 0 100px rgba(255, 0, 0, 0.4)",
            borderColor: "rgba(255, 0, 0, 0.8)",
          },
          "33%": {
            boxShadow: "0 0 100px rgba(0, 255, 0, 0.4)",
            borderColor: "rgba(0, 255, 0, 0.8)",
          },
          "66%": {
            boxShadow: "0 0 100px rgba(0, 0, 255, 0.4)",
            borderColor: "rgba(0, 0, 255, 0.8)",
          },
          "100%": {
            boxShadow: "0 0 100px rgba(255, 0, 0, 0.4)",
            borderColor: "rgba(255, 0, 0, 0.8)",
          },
        },
        duration: 6,
        repeat: -1,
        ease: "none",
      });
    } else if (caseFrameRef.current) {
      gsap.killTweensOf(caseFrameRef.current);
      gsap.set(caseFrameRef.current, {
        boxShadow: "none",
        borderColor: "rgba(31, 41, 55, 0.8)",
      });
    }
  }, [selected.case]);

  const currentCategory = STEPS[currentStep].id;
  const currentOptions = options[currentCategory] || [];
  const currentSelection = selected[currentCategory];

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans overflow-hidden flex flex-col ">
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

          <ComponentsList
            steps={STEPS}
            selected={selected}
            totalPrice={totalPrice}
            currentStep={currentStep}
            setCurrentStep={setCurrentStep}
          />

          <div
            ref={caseFrameRef}
            className="relative w-full max-w-[35rem] aspect-3/4 border border-gray-800 bg-black/40 rounded-3xl shadow-2xl backdrop-blur-md overflow-hidden ring-1 ring-white/5 "
          >
            {/* "Case" Frame */}
            <div className=" absolute inset-0 border-20 border-gray-900/80 rounded-3xl pointer-events-none z-20"></div>

            {/* Parts Visualizer */}
            <div className="absolute inset-0 p-8 z-10">
              {STEPS.map((step) => (
                <VisualizerPart
                  key={step.id}
                  part={selected[step.id]}
                  type={step.id}
                  handleSelect={handleSelect}
                  selected={selected}
                  dragPart={draggedItem?.part}
                  dragType={draggedItem?.category}
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
                <DraggablePartCard
                  key={opt._id}
                  handleSelect={handleSelect}
                  currentCategory={currentCategory}
                  opt={opt}
                  selected={selected}
                  setDraggedItem={setDraggedItem}
                ></DraggablePartCard>
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
