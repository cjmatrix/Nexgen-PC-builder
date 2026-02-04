import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchComponents,
  selectPart,
  setSelected,
  resetBuild,
} from "../../../../store/slices/builderSlice";
import { addToCart } from "../../../../store/slices/cartSlice";
import {
  useParams,
  useNavigate,
  Navigate,
  useLocation,
} from "react-router-dom";
import api from "../../../../api/axios";
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
import { toast } from "react-toastify";
import {
  MotherboardSVG,
  CpuSVG,
  RamSVG,
  GpuSVG,
  StorageSVG,
  CoolerSVG,
  PsuSVG,
} from "./components/PCParts";
import ComponentsList from "./components/ComponentsList";
import BackgroundGears from "./components/BackgroundGears";
import DragIndicator from "./components/DragIndicator";

import DraggablePartCard from "./components/DraggablePartCard";
import PartSkeleton from "./components/PartSkeleton";
import { useDrop } from "react-dnd";
import CustomModal from "../../../../components/CustomModal";

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
      },
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
    [handleSelect],
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
      className={`absolute transition-all duration-300 z-50 ${
        isGhost
          ? " grayscale "
          : "drop-shadow-[0_0_1px_rgba(250,204,21,0.6)] scale-105"
      } `}
      style={getStyle(type)}
    >
      {ComponentSVG ? (
        <ComponentSVG dragType={dragType} part={part} />
      ) : (
        <div className="w-full h-full bg-blue-100/50 rounded-lg blur-sm border border-blue-200"></div>
      )}
    </div>
  );
};

const PCBuilder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState(0);
  const [draggedItem, setDraggedItem] = useState({});

  const { user } = useSelector((state) => state.auth);

  const { selected, options, totalPrice, estimatedWattage, loading } =
    useSelector((state) => state.builder);

  const [showSkeleton, setShowSkeleton] = useState(false);

  useEffect(() => {
    let timer;
    if (loading) {
      timer = setTimeout(() => {
        setShowSkeleton(true);
      }, 500);
    } else {
      setShowSkeleton(false);
    }
    return () => clearTimeout(timer);
  }, [loading]);

  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const currentStepId = STEPS[currentStep].id;

    if (selected[currentStepId] && currentStep < STEPS.length - 1) {
      const timer = setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [selected]);

  const [visible, setVisibile] = useState(true);

  // Modal State
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: "info",
    title: "",
    message: "",
    showCancel: false,
    confirmText: "Confirm",
    cancelText: "Cancel",
    onConfirm: null,
    onCloseAction: null,
  });

  const handleCloseModal = () => {
    if (modalState.onCloseAction) {
      modalState.onCloseAction();
    }
    setModalState((prev) => ({ ...prev, isOpen: false }));
  };

  useEffect(() => {
    if (draggedItem?.part && visible) {
      setVisibile(false);
    }
  }, [draggedItem]);

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
        }),
      );
      dispatch(
        fetchComponents({
          category: "cooler",
          params: {
            cpuId: selected.cpu._id,
            maxHeight: selected.case?.specs?.maxCpuCoolerHeight_mm,
          },
        }),
      );
      dispatch(
        fetchComponents({
          category: "gpu",
          params: {
            maxTier: selected.cpu.tier_level + 1,
            caseId: selected.case?._id,
          },
        }),
      );
    }
  }, [dispatch, selected.cpu, selected.case]);

  useEffect(() => {
    if (selected.motherboard) {
      dispatch(
        fetchComponents({
          category: "ram",
          params: { motherboardId: selected.motherboard._id },
        }),
      );
      dispatch(
        fetchComponents({
          category: "case",
          params: {
            motherboardId: selected.motherboard._id,
            gpuId: selected.gpu?._id,
          },
        }),
      );
    }
  }, [dispatch, selected.motherboard, selected.gpu, selected.cooler]);

  useEffect(() => {
    if (estimatedWattage > 0) {
      dispatch(
        fetchComponents({
          category: "psu",
          params: { minWattage: estimatedWattage + 150 },
        }),
      );
    }
  }, [dispatch, estimatedWattage]);

  useEffect(() => {
    if (selected.case && selected.gpu) {
      const gpuLength = selected.gpu.specs?.length_mm || 0;
      const maxGpuLength = selected.case.specs?.maxGpuLength_mm || 0;

      if (gpuLength > maxGpuLength) {
        toast.warn(
          `Case deselected! Selected Case is too small for ${selected.gpu.name}`,
        );
        dispatch(selectPart({ category: "case", component: null }));
      }
    }

    if (selected.case && selected.motherboard) {
      const moboForm = selected.motherboard.specs?.formFactor?.toUpperCase();
      const caseForm = selected.case.specs?.formFactor?.toUpperCase();

      let isCompatible = true;
      // Logic:
      // ATX Case supports: ATX, mATX, ITX
      // mATX Case supports: mATX, ITX (Usually doesn't support ATX)
      // ITX Case supports: ITX (Usually doesn't support mATX/ATX)

      if (caseForm === "ITX" && moboForm !== "ITX") isCompatible = false;
      if (caseForm === "MATX" && moboForm === "ATX") isCompatible = false;

      if (!isCompatible) {
        toast.warn(
          `Case deselected! ${caseForm} case cannot fit ${moboForm} motherboard.`,
        );
        dispatch(selectPart({ category: "case", component: null }));
      }
    }
  }, [selected.case, selected.gpu, selected.motherboard, dispatch]);

  const handleSelect = (item) => {
    dispatch(
      selectPart({ category: STEPS[currentStep].id, component: item.part }),
    );
  };

  const handleAddToCart = async () => {
    if (!user) {
      return navigate("/login", { state: { from: location.pathname } });
    }

    const requiredParts = [
      "cpu",
      "motherboard",
      "ram",
      "case",
      "psu",
      "gpu",
      "storage",
      "cooler",
    ];
    const missingParts = requiredParts.filter((key) => !selected[key]);

    if (missingParts.length > 0) {
      setModalState({
        isOpen: true,
        type: "error", // Using error icon for incomplete build warning as it's blocking
        title: "Incomplete Build",
        message: `Please select the following components: ${missingParts.join(
          ", ",
        )}`,
        confirmText: "OK",
      });
      return;
    }

    const componentsSnapshot = {};
    Object.keys(selected).forEach((key) => {
      if (selected[key]) {
        componentsSnapshot[key] = {
          componentId: selected[key]._id,
          name: selected[key].name,
          price: selected[key].price,
          image: selected[key].image,
          specs: selected[key].specs || {},
        };
      }
    });

    const customBuildPayload = {
      name: "Custom PC Build",
      totalPrice: totalPrice,
      components: componentsSnapshot,
    };

    try {
      await dispatch(
        addToCart({
          quantity: 1,
          customBuild: customBuildPayload,
        }),
      ).unwrap();

      setModalState({
        isOpen: true,
        type: "success",
        title: "Added to Cart!",
        message: "Your custom build has been added to your cart.",
        showCancel: true,
        confirmText: "Go to Cart",
        cancelText: "Continue Building",
        onConfirm: () => navigate("/cart"),
      });
    } catch (error) {
      console.error("Add to cart failed", error);
      setModalState({
        isOpen: true,
        type: "error",
        title: "Oops...",
        message: error || "Failed to add to cart",
        confirmText: "OK",
      });
    }
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
      { opacity: 1, x: 0, duration: 0.4, ease: "power2.out" },
    );
  }, [currentStep]);

  useGSAP(() => {
    if (selected.case && caseFrameRef.current) {
      gsap.to(caseFrameRef.current, {
        keyframes: {
          "0%": {
            boxShadow: "0 0 50px rgba(255, 0, 0, 0.9)",
            borderColor: "rgba(255, 0, 0, 0.8)",
          },
          "33%": {
            boxShadow: "0 0 50px rgba(0, 255, 0, 0.9)",
            borderColor: "rgba(0, 255, 0, 0.8)",
          },
          "66%": {
            boxShadow: "0 0 50px rgba(0, 0, 255, 0.9)",
            borderColor: "rgba(0, 0, 255, 0.8)",
          },
          "100%": {
            boxShadow: "0 0 50px rgba(255, 0, 0, 0.9)",
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

  const [mobileView, setMobileView] = useState("selection");

  useGSAP(
    () => {
      const tl = gsap.timeline();

      tl.fromTo(
        ".animate-top",
        { y: -50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" },
      )
        .fromTo(
          ".animate-visualizer",
          { scale: 0.9, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.8, ease: "back.out(1.2)" },
          "-=0.6",
        )
        .fromTo(
          ".animate-panel",
          { x: 50, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.8, ease: "power3.out" },
          "-=0.6",
        );
    },
    { scope: containerRef },
  );

  const currentCategory = STEPS[currentStep].id;
  const currentOptions = options[currentCategory] || [];
  const currentSelection = selected[currentCategory];

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-gray-50 via-gray-100 to-gray-200 text-gray-900 font-sans overflow-hidden flex flex-col selection:bg-blue-500/30"
    >
      {/* Top Progress Bar */}
      <DragIndicator isVisible={visible} />

      <div className="animate-top h-16 border-b border-gray-200 flex items-center px-6 overflow-x-auto no-scrollbar bg-white/90 backdrop-blur z-20">
        {STEPS.map((step, idx) => (
          <div
            key={step.id}
            onClick={() => setCurrentStep(idx)}
            className={`flex items-center shrink-0 mr-8 cursor-pointer transition-colors ${
              idx === currentStep
                ? "text-blue-600 font-bold"
                : selected[step.id]
                  ? "text-green-600"
                  : "text-gray-400"
            }`}
          >
            <div
              className={`p-1.5 rounded-full mr-2 ${
                idx === currentStep
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                  : selected[step.id]
                    ? "bg-green-100 text-green-600"
                    : "bg-gray-100 text-gray-400"
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

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* Left: Visualizer (The "Case") */}

        <div
          className={`animate-visualizer flex-1 relative bg-transparent flex items-center justify-center p-4 md:p-10 overflow-hidden perspective-[2000px] ${
            mobileView === "visualizer" ? "block" : "hidden md:flex"
          }`}
        >
          {/* Ambient Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 blur-[100px] rounded-full pointer-events-none mix-blend-multiply"></div>

          {/* Background Grid/Effects */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "linear-gradient(rgba(0, 0, 0, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 0, 0, 0.05) 1px, transparent 1px) ",
              backgroundSize: "40px 40px",
            }}
          ></div>

          {/* New Gear Animation Background */}
          <BackgroundGears />

          {/* Hide ComponentsList on smaller screens to avoid overlap */}
          <div className="hidden xl:block">
            <ComponentsList
              steps={STEPS}
              selected={selected}
              totalPrice={totalPrice}
              currentStep={currentStep}
              setCurrentStep={setCurrentStep}
            />
          </div>

          <div
            ref={caseFrameRef}
            className="relative -top-[3%] w-full max-w-[24rem] md:max-w-[35rem] aspect-3/4 border border-gray-200 bg-gray-400/20 rounded-3xl shadow-xl backdrop-blur-md overflow-hidden ring-1 ring-black/5 scale-110 md:scale-100 origin-center transition-transform duration-500"
          >
            {/* "Case" Frame */}
            <div className=" absolute inset-0 border-20 border-gray-400 rounded-3xl pointer-events-none z-20"></div>

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

            {/* Drag Indicator */}
          </div>
        </div>

        {/* Right: Selection Panel */}

        <div
          className={`animate-panel w-full md:w-[450px] bg-white/80 backdrop-blur-xl border-l border-white/50 flex flex-col z-20 shadow-[-20px_0_40px_rgba(0,0,0,0.05)] relative ${
            mobileView === "selection" ? "block" : "hidden md:flex"
          }`}
        >
          <div className="absolute inset-0 bg-linear-to-b from-white/50 to-transparent pointer-events-none"></div>
          <div className="p-6 border-b border-gray-100/50 relative">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3 tracking-tight">
                {React.createElement(STEPS[currentStep].icon, {
                  className: "text-blue-600 drop-shadow-sm",
                })}
                {STEPS[currentStep].label}
              </h2>
              <div className="text-xs text-blue-700 font-semibold bg-blue-50 border border-blue-100 px-3 py-1 rounded-full shadow-sm">
                Step {currentStep + 1} / {STEPS.length}
              </div>
            </div>
            <p className="text-gray-500 text-sm">
              {selected[currentCategory]
                ? "You have selected a component. Select another to replace it."
                : "Choose a component from the list below."}
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3" ref={stepRef}>
            {showSkeleton ? (
              Array.from({ length: 4 }).map((_, i) => <PartSkeleton key={i} />)
            ) : currentOptions.length === 0 && !loading ? (
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

          <div className="p-6 border-t border-gray-200 bg-gray-50 pb-24 md:pb-6">
            <div className="flex justify-between items-center mb-4 text-sm">
              <div className="text-gray-500 font-medium">Total Estimate</div>
              <div className="text-2xl font-black text-gray-900">
                ₹{(totalPrice / 100).toLocaleString()}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={prevStep}
                disabled={currentStep === 0}
                className="px-4 py-3 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-gray-700 font-bold flex items-center justify-center gap-2 shadow-sm"
              >
                <ChevronLeft size={18} /> Back
              </button>

              {currentStep === STEPS.length - 1 ? (
                <button
                  onClick={handleAddToCart}
                  className="px-4 py-3 rounded-xl bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold transition-all shadow-lg shadow-green-500/30 hover:shadow-green-500/50 flex items-center justify-center gap-2"
                >
                  <ShoppingCart size={18} /> Add To Cart
                </button>
              ) : (
                <button
                  onClick={nextStep}
                  className="px-4 py-3 rounded-xl bg-gray-900 hover:bg-gray-800 text-white font-bold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  Next <ChevronRight size={18} />
                </button>
              )}
            </div>

            <button
              onClick={() => {
                setModalState({
                  isOpen: true,
                  type: "confirmation",
                  title: "Clear Build?",
                  message:
                    "Are you sure you want to clear your current build? This action cannot be undone.",
                  showCancel: true,
                  confirmText: "Yes, Clear It",
                  cancelText: "Cancel",
                  onConfirm: () => {
                    dispatch(resetBuild());
                    setCurrentStep(0);
                  },
                });
              }}
              className="w-full mt-3 px-4 py-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-bold transition-colors flex items-center justify-center gap-2 border border-red-100"
            >
              <Trash2 size={18} /> Clear Build
            </button>
          </div>
        </div>
      </div>

      <CustomModal
        isOpen={modalState.isOpen}
        onClose={handleCloseModal}
        onConfirm={modalState.onConfirm}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
        confirmText={modalState.confirmText}
        cancelText={modalState.cancelText}
        showCancel={modalState.showCancel}
      />

      {/* Mobile View Toggle Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 z-50 flex gap-3 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
        <button
          onClick={() => setMobileView("visualizer")}
          className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
            mobileView === "visualizer"
              ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          <Monitor size={18} /> View Build
        </button>
        <button
          onClick={() => setMobileView("selection")}
          className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
            mobileView === "selection"
              ? "bg-gray-900 text-white shadow-lg"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          <Box size={18} /> Select Parts
        </button>
      </div>
    </div>
  );
};

export default PCBuilder;
