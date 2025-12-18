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

const AIPCAssistant = () => {
  const [prompt, setPrompt] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, aiBuild, error } = useSelector((state) => state.ai);

  useEffect(() => {
    return () => {
      dispatch(resetAIState());
    };
  }, [dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (prompt.trim()) {
      dispatch(generatePCBuild(prompt));
    }
  };

  const getComponentIcon = (category) => {
    switch (category.toLowerCase()) {
      case "cpu":
        return <FaMicrochip className="text-blue-500" />;
      case "gpu":
        return <BsGpuCard className="text-green-500" />;
      case "motherboard":
        return <FaBox className="text-purple-500" />;
      case "ram":
        return <FaMemory className="text-yellow-500" />;
      case "storage":
        return <FaHdd className="text-red-500" />;
      case "case":
        return <FaDesktop className="text-gray-500" />;
      case "psu":
        return <FaBolt className="text-yellow-600" />;
      case "cooler":
        return <FaFan className="text-cyan-500" />;
      default:
        return <FaBox className="text-gray-400" />;
    }
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
              placeholder="For example: 'I need a high-end gaming PC for 4K streaming and video editing. My budget is around $2500.'"
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
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="md:flex">
                {/* Image Section */}
                <div className="md:w-1/2 relative bg-gray-100 min-h-[300px]">
                  {aiBuild.images && aiBuild.images.length > 0 ? (
                    <img
                      src={aiBuild.images[0]}
                      alt={aiBuild.name}
                      className="w-full h-full object-cover absolute inset-0 transition-transform duration-700 hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <FaDesktop className="w-20 h-20" />
                    </div>
                  )}
                </div>

                {/* Build Info */}
                <div className="md:w-1/2 p-8 flex flex-col justify-center space-y-6">
                  <div className="text-sm font-semibold text-blue-600 uppercase tracking-wider">
                    AI Recommended Build
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 leading-tight">
                    {aiBuild.name}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {aiBuild.description}
                  </p>
                  <div className="pt-4 border-t border-gray-100">
                    <span className="text-gray-500 font-medium">
                      Estimated Total Price:
                    </span>
                    <div className="text-3xl font-bold text-gray-900 mt-1">
                      ₹{aiBuild.base_price.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Components Grid */}
              <div className="p-8 bg-gray-50 border-t border-gray-100">
                <h4 className="text-xl font-bold text-gray-900 mb-6">
                  Core Components
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(aiBuild.default_config).map(
                    ([key, component]) =>
                      component && (
                        <div
                          key={key}
                          className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-start space-x-4 hover:shadow-md transition-shadow"
                        >
                          <div className="p-3 bg-gray-50 rounded-lg">
                            {getComponentIcon(key)}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                              {key}
                            </p>
                            <p className="font-semibold text-gray-900 line-clamp-2">
                              {component.name}
                            </p>
                          </div>
                        </div>
                      )
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-8 bg-white border-t border-gray-100 flex justify-end">
                <button
                  onClick={() => navigate(`/products/${aiBuild._id}`)}
                  className="bg-[#0f172a] text-white px-8 py-3 rounded-xl font-semibold hover:bg-[#1e293b] transition-colors shadow-lg hover:shadow-xl"
                >
                  Customize This Build
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
