import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { generatePCBuild, resetAIState } from "../../store/slices/aiSlice";
import {
  FaMicrochip,
  FaMemory,
  FaHdd,
  FaBox,
  FaFan,
  FaBolt,
  FaDesktop,
} from "react-icons/fa";
import { BsGpuCard } from "react-icons/bs";
import { MdOutlineSdStorage } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import Swal from "sweetalert2";

let resetTimer = null;

const AIPCAssistant = () => {
  const [prompt, setPrompt] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, aiBuild, error } = useSelector((state) => state.ai);

  useEffect(() => {
    if (resetTimer) {
      clearTimeout(resetTimer);
      resetTimer = null;
    }
    return () => {
      resetTimer = setTimeout(() => {
        dispatch(resetAIState());
        resetTimer = null;
      }, 5 * 60 * 1000);
    };
  }, [dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (prompt.trim()) {
      dispatch(generatePCBuild(prompt));
    }
  };

  const handleAddToCart = async () => {
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
      await api.post("/cart/add", {
        quantity: 1,
        customBuild: customBuildPayload,
      });

      Swal.fire({
        icon: "success",
        title: "Added to Cart!",
        text: "Your AI-generated build has been added to your cart.",
        showCancelButton: true,
        confirmButtonText: "Go to Cart",
        cancelButtonText: "Close",
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/cart");
        }
      });
    } catch (error) {
      console.error("Add to cart failed", error);
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: error.response?.data?.message || "Failed to add to cart",
      });
    }
  };

  const getComponentIcon = (category) => {
    switch (category?.toLowerCase()) {
      case "cpu":
        return <FaMicrochip className="text-blue-500 w-6 h-6" />;
      case "gpu":
        return <BsGpuCard className="text-green-500 w-6 h-6" />;
      case "motherboard":
        return <FaBox className="text-purple-500 w-6 h-6" />;
      case "ram":
        return <FaMemory className="text-yellow-500 w-6 h-6" />;
      case "storage":
        return <FaHdd className="text-red-500 w-6 h-6" />;
      case "case":
        return <FaDesktop className="text-gray-500 w-6 h-6" />;
      case "psu":
        return <FaBolt className="text-yellow-600 w-6 h-6" />;
      case "cooler":
        return <FaFan className="text-cyan-500 w-6 h-6" />;
      default:
        return <FaBox className="text-gray-400 w-6 h-6" />;
    }
  };

  const formatSpecKey = (key) => {
    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase());
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8 mt-32">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
            AI PC Assistant
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Tell our AI what you need, and we'll generate a personalized build
            for you.
          </p>
        </div>

        {/* Input Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 transition-all hover:shadow-2xl">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Describe your ideal PC
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="For example: 'I need a high-end gaming PC for 4K streaming and video editing. My budget is around ₹1,50,000.'"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none resize-none h-32 text-gray-700 placeholder-gray-400"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              className={`w-full py-4 px-6 rounded-xl text-white font-bold text-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#0f172a] hover:bg-[#1e293b] shadow-lg hover:shadow-xl"
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
                  <span>Generating Recommendation...</span>
                </div>
              ) : (
                "Generate Recommendation"
              )}
            </button>
          </form>
          {error && (
            <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg border border-red-100 flex items-center">
              <span className="font-medium">Error:</span>&nbsp;{error}
            </div>
          )}
        </div>

        {/* Result Section */}
        {aiBuild && (
          <div className="space-y-8 animate-fade-in-up">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
              <div className="md:flex">
                {/* Image Section */}
                <div className="md:w-1/2 relative bg-gray-50 min-h-[300px] flex items-center justify-center p-6">
                  {aiBuild.images && aiBuild.images.length > 0 ? (
                    <img
                      src={aiBuild.images[0]}
                      alt={aiBuild.name}
                      className="w-full h-auto max-h-[350px] object-contain drop-shadow-xl"
                    />
                  ) : (
                    <div className="text-gray-400 flex flex-col items-center">
                      <FaDesktop className="w-20 h-20 mb-2" />
                      <span className="text-sm">No Preview Available</span>
                    </div>
                  )}
                </div>

                {/* Build Info */}
                <div className="md:w-1/2 p-8 flex flex-col justify-center space-y-6 bg-white">
                  <div>
                    <div className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-1">
                      AI Recommended Configuration
                    </div>
                    <h3 className="text-3xl font-extrabold text-gray-900 leading-tight">
                      {aiBuild.name}
                    </h3>
                  </div>

                  <p className="text-gray-600 leading-relaxed text-sm border-l-4 border-blue-500 pl-4 py-1 bg-blue-50/50 rounded-r-lg">
                    {aiBuild.description}
                  </p>

                  <div className="pt-6 border-t border-gray-100">
                    <span className="text-gray-500 font-medium text-sm">
                      Estimated Total Price
                    </span>
                    <div className="text-4xl font-extrabold text-gray-900 mt-2 flex items-baseline gap-1">
                      ₹{(aiBuild.base_price / 100).toLocaleString()}
                      <span className="text-sm font-normal text-gray-500">
                        .00
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Components Grid */}
              <div className="p-8 bg-gray-50 border-t border-gray-200">
                <h4 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <FaMicrochip className="text-gray-700" /> Component Breakdown
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Array.isArray(aiBuild.default_config) &&
                    aiBuild.default_config.map(
                      (component) =>
                        component && (
                          <div
                            key={component._id}
                            className="bg-white p-4 rounded-xl shadow-sm border border-gray-200/60 flex items-start space-x-4 hover:shadow-md transition-all hover:border-blue-200 group"
                          >
                            <div className="p-3 bg-gray-50 rounded-lg group-hover:bg-blue-50 transition-colors">
                              {getComponentIcon(component.category)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                                  {component.category}
                                </p>
                                <p className="text-xs font-bold text-gray-900">
                                  ₹{(component.price / 100).toLocaleString()}
                                </p>
                              </div>
                              <p
                                className="font-semibold text-gray-900 line-clamp-1 mb-2"
                                title={component.name}
                              >
                                {component.name}
                              </p>

                              {/* Specs Preview */}
                              {component.specs && (
                                <div className="flex flex-wrap gap-1.5 mt-2">
                                  {Object.entries(component.specs)
                                    .slice(0, 3)
                                    .map(([key, value]) => (
                                      <span
                                        key={key}
                                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200"
                                      >
                                        {key === "vram_gb"
                                          ? `${value}GB`
                                          : value.toString()}
                                      </span>
                                    ))}
                                </div>
                              )}
                            </div>
                          </div>
                        )
                    )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-6 bg-white border-t border-gray-200 flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => dispatch(resetAIState())}
                  className="px-6 py-3 rounded-xl text-gray-700 font-semibold border border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  Clear & Try Again
                </button>
                <button
                  onClick={handleAddToCart}
                  className="bg-[#0f172a] text-white px-8 py-3 rounded-xl font-semibold hover:bg-[#1e293b] transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIPCAssistant;
