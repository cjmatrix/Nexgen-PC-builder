import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  generatePCBuild,
  resetAIState,
  setError,
  setShowPromptBar,
} from "../../../../store/slices/aiSlice";
import { FaMicrochip } from "react-icons/fa";

import { BsStars, BsCpu } from "react-icons/bs";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../../../api/axios";
import CustomModal from "../../../../components/CustomModal";
import { showCustomToast } from "../../../../utils/toastUtils";
import AIBuildLoader from "./components/AIBuildLoader";
import RobotMascot from "./components/RobotMascot";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ArrowRight, Sparkles, RefreshCcw, ShoppingCart } from "lucide-react";
import { resetBuild } from "../../../../store/slices/builderSlice";
import getComponentIcon from "../../../../utils/getComponentIcons";
import { addToCart } from "../../../../store/slices/cartSlice";

gsap.registerPlugin(useGSAP);

const AIPCAssistant = () => {
  const [prompt, setPrompt] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const resultRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    if (location.state?.prompt) {
      setPrompt(location.state.prompt);
    }
  }, [location]);

  const { loading, aiBuild, error, success, showPromptBar } = useSelector(
    (state) => state.ai,
  );
  const { user } = useSelector((state) => state.auth);

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

  useEffect(()=>{
    dispatch(setError(null))
  },[])
  const handleCloseModal = () => {
    if (modalState.onCloseAction) {
      modalState.onCloseAction();
    }
    setModalState((prev) => ({ ...prev, isOpen: false }));
  };

  useGSAP(
    () => {
      const tl = gsap.timeline();

      tl.fromTo(
        ".hero-text",
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, stagger: 0.2, ease: "power3.out" },
      ).fromTo(
        ".input-container",
        { y: 30, opacity: 0, scale: 0.95 },
        { y: 0, opacity: 1, scale: 1, duration: 0.8, ease: "back.out(1.7)" },
        "-=0.5",
      );
    },
    { scope: containerRef },
  );

  useGSAP(() => {
    if (aiBuild && resultRef.current) {
      gsap.fromTo(
        resultRef.current,
        { y: 100, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" },
      );
    }
  }, [aiBuild]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user)
      return navigate("/login", {
        state: { from: location.pathname, savedPrompt: prompt },
      });
    dispatch(resetAIState());
    if (prompt.trim()) {
      try {
        const data = await dispatch(generatePCBuild(prompt)).unwrap();
        dispatch(setShowPromptBar(false));
        showCustomToast(data?.message);
      } catch (err) {
      
      }
    }
  };

  const handleAddToCart = async () => {
    if (!user)
      return navigate("/login", { state: { from: location.pathname } });
    if (!aiBuild) return;

    const componentsSnapshot = {};
    aiBuild.default_config.forEach((comp) => {
      if (comp) {
        componentsSnapshot[comp.category] = {
          componentId: comp._id,
          name: comp.name,
          price: comp.price,
          image: comp.image,
          specs: comp.specs || {},
        };
      }
    });

    const customBuildPayload = {
      name: aiBuild.name,
      totalPrice: aiBuild.base_price,
      components: componentsSnapshot,
      isAiBuild: true,
      aiImages:
        aiBuild.images && aiBuild.images.length > 0 ? aiBuild.images[0] : null,
    };

    try {
      await dispatch(
        addToCart({ quantity: 1, customBuild: customBuildPayload }),
      ).unwrap();

      setModalState({
        isOpen: true,
        type: "success",
        title: "Added to Cart!",
        message: "Your AI-generated build has been added to your cart.",
        showCancel: true,
        confirmText: "Go to Cart",
        cancelText: "Build Another",
        onConfirm: () => navigate("/cart"),
        onCloseAction: () => {
          dispatch(resetAIState());
          setPrompt("");
          dispatch(setShowPromptBar(true));
        },
      });
    } catch (error) {
     
      setModalState({
        isOpen: true,
        type: "error",
        title: "Oops...",
        message: error || "Failed to add to cart",
        showCancel: false,
        confirmText: "OK",
        onConfirm: null,
        onCloseAction: null,
      });
    }
  };

  
  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-gray-50 text-gray-900 selection:bg-purple-100 font-sans overflow-x-hidden relative"
    >
      {/* Dynamic Background (Light Mode) */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-200/40 blur-[120px] rounded-full mix-blend-multiply animate-pulse"></div>
        <div className="absolute bottom-[10%] right-[-5%] w-[600px] h-[600px] bg-blue-200/40 blur-[150px] rounded-full mix-blend-multiply"></div>
        <div className="absolute top-[40%] left-[30%] w-[300px] h-[300px] bg-cyan-200/30 blur-[100px] rounded-full mix-blend-multiply"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-40 mix-blend-soft-light"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col items-center">
        {/* Header */}
        {showPromptBar && (
          <div className="text-center space-y-6 mb-16 max-w-3xl">
            <div className="hero-text inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 shadow-sm mb-4">
              <BsStars className="text-purple-600 animate-pulse" />
              <span className="text-sm font-bold text-gray-600 tracking-wide uppercase">
                Next-Gen PC Building
              </span>
            </div>
            <h1 className="hero-text text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900">
              Design Your Dream <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
                Powered by AI
              </span>
            </h1>
            <p className="hero-text text-lg md:text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
              Describe your needs, budget, or favorite games. Our advanced AI
              architect will instantly design the perfect rig for you.
            </p>
          </div>
        )}

        {showPromptBar && (
          <div className="input-container w-full max-w-3xl">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-white rounded-2xl p-2 shadow-2xl ring-1 ring-gray-100">
                <RobotMascot className="-top-12 right-10 z-0 scale-75" />
                <form
                  onSubmit={handleSubmit}
                  className="relative z-10 bg-white rounded-xl"
                >
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="I want a white-themed PC for 4K video editing and Cyberpunk 2077. Budget is ₹2,00,000..."
                    className="w-full bg-transparent text-lg text-gray-900 placeholder-gray-400 p-6 min-h-[140px] focus:outline-none resize-none rounded-xl"
                    disabled={loading}
                  />
                  <div className="flex justify-between items-center px-4 pb-2 border-t border-gray-100 pt-3 mt-2">
                    <div className="flex gap-2">
                      <span className="text-xs text-gray-500 flex items-center gap-1 font-medium">
                        <Sparkles size={12} className="text-purple-500" />{" "}
                        Gemini Turbo Optimized
                      </span>
                    </div>
                    <button
                      type="submit"
                      disabled={loading || !prompt.trim()}
                      className={`px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg ${
                        loading || !prompt.trim()
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none"
                          : "bg-gray-900 text-white hover:bg-gray-800 hover:scale-105 active:scale-95 shadow-gray-900/20"
                      }`}
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-gray-400 border-t-white rounded-full animate-spin"></div>
                          <span>Designing...</span>
                        </>
                      ) : (
                        <>
                          <span>Generate Build</span>
                          <ArrowRight size={18} />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl flex items-center gap-3 shadow-sm">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                {error }
              </div>
            )}
          </div>
        )}

        {!aiBuild && !showPromptBar && !error&& <AIBuildLoader />}

        {aiBuild && (
          <div
            ref={resultRef}
            className="w-full max-w-5xl mt-12 mb-20 animate-fade-in-up"
          >
            <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-2xl ring-1 ring-black/5">
              <div className="grid grid-cols-1 lg:grid-cols-2">
                {/* Left: Preview */}
                <div className="relative bg-gray-50 p-8 flex items-center justify-center group overflow-hidden border-b lg:border-b-0 lg:border-r border-gray-200">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-100/50 via-transparent to-transparent opacity-70"></div>
                  {aiBuild.images && aiBuild.images.length > 0 ? (
                    <img
                      src={aiBuild.images[0]}
                      alt="PC Preview"
                      className="relative z-10 w-full max-w-sm object-contain drop-shadow-xl transition-transform duration-700 group-hover:scale-105 group-hover:rotate-1"
                    />
                  ) : (
                    <div className="text-gray-400 flex flex-col items-center">
                      <BsCpu className="w-24 h-24 mb-4 opacity-50" />
                      <p className="font-medium">System Diagram</p>
                    </div>
                  )}
                </div>

                {/* Right: Info */}
                <div className="p-8 lg:p-10 flex flex-col bg-white">
                  <div className="mb-auto">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-bold border border-green-200 uppercase tracking-widest">
                        AI Configuration
                      </span>
                      <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200 uppercase tracking-widest">
                        Custom Build
                      </span>
                    </div>
                    <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-4 leading-tight">
                      {aiBuild.name}
                    </h2>
                    <p className="text-gray-600 leading-relaxed border-l-4 border-blue-500 pl-4 py-1 italic bg-blue-50 rounded-r-lg">
                      "{aiBuild.description}"
                    </p>
                  </div>

                  <div className="py-8 border-t border-gray-100 mt-8">
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-gray-500 text-sm font-semibold mb-1">
                          Total Estimated Price
                        </p>
                        <p className="text-4xl font-extrabold text-gray-900 flex items-baseline gap-1">
                          ₹{(aiBuild.base_price / 100).toLocaleString()}
                          <span className="text-lg text-gray-500 font-medium">
                            .00
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <button
                      onClick={() => {
                        dispatch(resetAIState());
                        setPrompt("");
                        dispatch(setShowPromptBar(true));
                      }}
                      className="py-4 rounded-xl font-bold bg-white text-gray-700 hover:bg-gray-50 transition-colors border border-gray-200 shadow-sm flex items-center justify-center gap-2 group"
                    >
                      <RefreshCcw
                        size={18}
                        className="group-hover:-rotate-180 transition-transform duration-500 text-gray-500"
                      />
                      New Build
                    </button>
                    <button
                      onClick={handleAddToCart}
                      className="py-4 rounded-xl font-bold bg-gray-900 text-white hover:bg-black transition-colors shadow-lg shadow-gray-900/20 flex items-center justify-center gap-2"
                    >
                      <ShoppingCart size={18} />
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>

              {/* Components List */}
              <div className="bg-gray-50 border-t border-gray-200 p-8">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <FaMicrochip className="text-blue-600" />
                  Component Breakdown
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {aiBuild.default_config.map(
                    (comp) =>
                      comp && (
                        <div
                          key={comp._id}
                          className="bg-white p-4 rounded-xl border border-gray-200 flex gap-4 hover:shadow-md transition-all hover:border-blue-300 group"
                        >
                          <div className="p-3 bg-gray-50 rounded-lg h-fit text-gray-500 group-hover:text-blue-600 transition-colors">
                            {getComponentIcon(comp.category)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-0.5">
                              {comp.category}
                            </p>
                            <p className="text-sm font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                              {comp.name}
                            </p>
                            <p className="text-xs text-gray-500 mt-1 font-medium">
                              ₹{(comp.price / 100).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ),
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
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
    </div>
  );
};

export default AIPCAssistant;
