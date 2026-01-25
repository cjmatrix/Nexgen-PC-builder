import React, { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  Wrench,
  User,
  Cpu,
  ArrowRight,
  Filter,
  Search,
  Zap,
  Layers,
  HardDrive,
} from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import api from "../../../../api/axios";

gsap.registerPlugin(useGSAP);

const CommunityBuilds = () => {
  const containerRef = useRef(null);
  const navigate = useNavigate();
  const [filter, setFilter] = useState("All");

  const { data: products = [], isLoading: loading } = useQuery({
    queryKey: ["community-builds", filter],
    queryFn: async () => {
      const params = {
        isFeatured: true,
        limit: 50,
      };

      if (filter === "ai_featured") params.buildType = "ai_featured";
      if (filter === "custom_featured") params.buildType = "custom_featured";

      const res = await api.get("/products", { params });
      return res.data.products || [];
    },
    staleTime:0,
  });

  useGSAP(
    () => {
      const tl = gsap.timeline();

      tl.to(
        ".banner-title",

        { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" },
      ).to(
        ".banner-subtitle",
        { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" },
        "-=0.5",
      );
      if (products.length > 0) {
        gsap.to(
          ".build-card",
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            stagger: 0.1,
            ease: "back.out(1.2)",
          },
          "-=0.4",
        );
      }
    },
    { scope: containerRef, dependencies: [products, loading] },
  );

  const getTheme = (type) => {
    if (type === "ai_featured")
      return {
        wrapper:
          "border-purple-200 hover:border-purple-400 hover:shadow-purple-500/20",
        badge: "bg-purple-100 text-purple-700 border-purple-200",
        icon: <Sparkles className="w-3.5 h-3.5 text-purple-600" />,
        text: "AI Architect",
        btn: "bg-purple-600 hover:bg-purple-700",
      };
    return {
      wrapper: "border-blue-200 hover:border-blue-400 hover:shadow-blue-500/20",
      badge: "bg-blue-100 text-blue-700 border-blue-200",
      icon: <Wrench className="w-3.5 h-3.5 text-blue-600" />,
      text: "Custom Build",
      btn: "bg-blue-600 hover:bg-blue-700",
    };
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-gray-50 font-sans pb-20">
      {/* Banner */}
      <div className="relative h-[400px] flex items-center justify-center overflow-hidden bg-gray-900 text-white">
        <div className="absolute inset-0">
          <div className="absolute top-[-50%] left-[-20%] w-[800px] h-[800px] bg-purple-600/30 rounded-full blur-[150px] animate-pulse"></div>
          <div
            className="absolute bottom-[-50%] right-[-20%] w-[800px] h-[800px] bg-blue-600/30 rounded-full blur-[150px] animate-pulse"
            style={{ animationDelay: "2s" }}
          ></div>
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6 text-sm font-medium text-yellow-300">
            <Sparkles className="w-4 h-4" /> Community Showcase
          </div>
          <h1 className="banner-title translate-y-[50px] opacity-0 text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-linear-to-r from-white via-blue-100 to-gray-400">
            Featured Builds
          </h1>
          <p className="banner-subtitle  translate-y-[50px] opacity-0 text-lg md:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Discover exceptional machines crafted by our community and powered
            by our AI. Get inspired by the best builds of the month.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-2 md:p-4 shadow-xl shadow-gray-200/50 border border-white inline-flex gap-2 mx-auto justify-center w-full md:w-auto">
          {[
            {
              id: "All",
              label: "All Builds",
              icon: <Filter className="w-4 h-4" />,
            },
            {
              id: "ai_featured",
              label: "AI Designed",
              icon: <Sparkles className="w-4 h-4" />,
            },
            {
              id: "custom_featured",
              label: "Custom Builds",
              icon: <Wrench className="w-4 h-4" />,
            },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`filter-btn px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all duration-300 ${
                filter === f.id
                  ? "bg-gray-900 text-white shadow-lg scale-105"
                  : "text-gray-500 hover:bg-gray-100/80 hover:text-gray-900"
              }`}
            >
              {f.icon}
              <span className="hidden md:inline">{f.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-[450px] bg-gray-200 rounded-3xl animate-pulse"
              ></div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {products.map((product) => {
              const theme = getTheme(product.buildType);

              return (
                <div
                  key={product._id}
                  onClick={() => navigate(`/products/${product._id}`)}
                  className={`build-card translate-y-[50px] opacity-0 group bg-white rounded-3xl overflow-hidden border ${theme.wrapper} shadow-lg shadow-gray-100 transition-all duration-300 cursor-pointer relative flex flex-col`}
                >
                  {/* Image */}
                  <div className="aspect-4/3 bg-gray-100 relative overflow-hidden">
                    <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-60 z-10 transition-opacity group-hover:opacity-40"></div>
                    <img
                      src={
                        product.images?.[0] || "https://placehold.co/600x400"
                      }
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                    />

                    {/* Floating Badge */}
                    <div
                      className={`absolute top-4 left-4 z-20 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wide border shadow-sm backdrop-blur-md ${theme.badge}`}
                    >
                      {theme.icon}
                      {theme.text}
                    </div>

                    {/* Creator Info */}
                    {product.originalOrderId?.userName && (
                      <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2 text-white">
                        <div className="p-1.5 bg-white/20 backdrop-blur-md rounded-full border border-white/30">
                          <User className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] text-gray-300 font-medium uppercase tracking-wider">
                            Built by
                          </span>
                          <span className="text-sm font-bold leading-none">
                            {product.originalOrderId.userName}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
                      {product.name.replace(/^Featured:\s*/i, "")}
                    </h3>

                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
                      <span className="text-3xl font-extrabold text-gray-900">
                        ₹{(product.final_price / 100).toLocaleString()}
                      </span>
                    </div>

                    {/* Specs List */}
                    <div className="space-y-2 mb-6 flex-1">
                      {/* CPU */}
                      {product.default_config?.cpu && (
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <Cpu className="w-4 h-4 text-gray-400 shrink-0" />
                          <span className="truncate">
                            {product.default_config.cpu.name ||
                              "High Performance CPU"}
                          </span>
                        </div>
                      )}

                      {/* GPU */}
                      {product.default_config?.gpu && (
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <div className="w-4 h-4 flex items-center justify-center bg-gray-100 rounded text-[10px] font-bold text-gray-500 shrink-0">
                            G
                          </div>
                          <span className="truncate">
                            {product.default_config.gpu.name || "Pro Graphics"}
                          </span>
                        </div>
                      )}

                      {/* RAM */}
                      {product.default_config?.ram && (
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <Layers className="w-4 h-4 text-gray-400 shrink-0" />
                          <span className="truncate">
                            {product.default_config.ram.name ||
                              "High Speed RAM"}
                          </span>
                        </div>
                      )}

                      {/* Storage */}
                      {product.default_config?.storage && (
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <HardDrive className="w-4 h-4 text-gray-400 shrink-0" />
                          <span className="truncate">
                            {product.default_config.storage.name ||
                              "Fast SSD Storage"}
                          </span>
                        </div>
                      )}
                    </div>

                    <button
                      className={`w-full py-2.5 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all transform group-hover:translate-x-1 ${theme.btn} text-sm`}
                    >
                      View Details
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900">
              No Featured Builds Found
            </h3>
            <p className="text-gray-500 mt-2">Be the first to get featured!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunityBuilds;
