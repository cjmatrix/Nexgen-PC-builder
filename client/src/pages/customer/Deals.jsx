import React, { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { Timer, Zap, Tag, ShoppingCart, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../../api/axios";

const Deals = () => {
  const containerRef = useRef(null);

  const { data, isLoading } = useQuery({
    queryKey: ["deals-products"],
    queryFn: async () => {
      const response = await api.get("/products", {
        params: { limit: 12, sort: "price_desc", hasDiscount: true },
      });
      return response.data;
    },
  });

  useGSAP(
    () => {
      gsap.to(".hero-text", {
        y: 0,
        opacity: 1,
        duration: 1,
        stagger: 0.2,
        ease: "power3.out",
      });

      if (data?.products && data.products.length > 0) {
        gsap.to(".deal-card", {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.1,
          ease: "power3.out",
        });
      }
    },
    { scope: containerRef, dependencies: [data] },
  );

  const formatTime = (val) => (val < 10 ? `0${val}` : val);

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-gray-50 pt-20 pb-12 font-sans"
    >
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gray-900 rounded-3xl mx-4 md:mx-8 mb-12 p-8 md:p-16 text-center text-white shadow-2xl">
        {/* Background Gradient Blob */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-4xl bg-gradient-to-r from-violet-600 via-fuchsia-500 to-indigo-600 opacity-20 blur-[100px] pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-yellow-300 font-bold tracking-wide uppercase text-sm hero-text opacity-0 translate-y-12">
            <Zap className="w-4 h-4 fill-current" />
            Flash Sale Live
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight hero-text bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-400 opacity-0 translate-y-12">
            Epic Tech Deals
          </h1>

          <p className="text-xl text-gray-300 max-w-2xl mx-auto hero-text opacity-0 translate-y-12">
            Grab premium components at unbeatable prices.
          </p>
        </div>
      </div>

      {/* Deals Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Tag className="w-6 h-6 text-violet-600" />
            Hot Picks
          </h2>
          <Link
            to="/products"
            className="text-violet-600 font-medium hover:text-violet-700 flex items-center gap-1 group"
          >
            View All Products
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="deals-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {data?.products?.map((product, index) => (
              <Link
                key={product._id}
                to={`/products/${product._id}`}
                className="deal-card translate-y-[50px] opacity-0 group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col"
              >
                {/* Image Container */}
                <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                  {product.applied_offer > 0 && (
                    <div className="absolute top-3 left-3 z-10 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                      -{product.applied_offer}% OFF
                    </div>
                  )}

                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />

                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col">
                  <div className="text-xs font-medium text-violet-600 mb-2 uppercase tracking-wide">
                    {product.brand}
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1 line-clamp-1 group-hover:text-violet-600 transition-colors">
                    {product.name}
                  </h3>

                  {/* Rating Mock */}
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-3 h-3 ${i < 4 ? "text-yellow-400" : "text-gray-300"}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                    <span className="text-xs text-gray-400 ml-1">(42)</span>
                  </div>

                  <div className="mt-auto flex items-center justify-between">
                    <div>
                      {product.applied_offer > 0 && (
                        <div className="text-sm text-gray-400 line-through">
                          ₹{product.base_price?.toLocaleString()}
                        </div>
                      )}
                      <div className="text-lg font-bold text-gray-900">
                        ₹{product.final_price?.toLocaleString()}
                      </div>
                    </div>
                    <button className="p-2 bg-gray-100 rounded-full text-gray-600 group-hover:bg-violet-600 group-hover:text-white transition-all duration-300 hover:scale-105 shadow-sm">
                      <ShoppingCart className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Deals;
