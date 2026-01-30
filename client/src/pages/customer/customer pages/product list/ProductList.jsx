import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPublicProducts } from "../../../../store/slices/productSlice";
import Pagination from "../../../../components/Pagination";
import {
  Search,
  Filter,
  ShoppingCart,
  Eye,
  Cpu,
  Zap,
  Layers,
  HardDrive,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useWishlist } from "../../../../hooks/useWishlist";
import { Heart as HeartIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import FeatureShowcase from "./components/FeatureShowcase";
import api from "../../../../api/axios";
import CustomDropdown from "../../../../components/CustomDropdown";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Transition, SwitchTransition } from "react-transition-group";
import ScrollToTop from "../../../../components/ScrollToTop";

gsap.registerPlugin(useGSAP);

const ProductList = () => {
  const initialRef=useRef(true);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const { items, pagination, loading } = useSelector((state) => state.products);
  const {
    items: wishlistItems,
    addToWishlist,
    removeFromWishlist,
  } = useWishlist();

  const [filters, setFilters] = useState({
    search: "",
    category: "",
    sort: "newest",
  });
  const [page, setPage] = useState(1);
  const [searchInput, setsearchInput] = useState("");
  const gridRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((prev) => {
        if (prev.search === searchInput) return prev;
        return { ...prev, search: searchInput, page: 1 };
      });
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    dispatch(fetchPublicProducts({ ...filters, page }));
  }, [dispatch, filters, page]);

  // Entrance Animations
  useGSAP(
    () => {
      if (loading || items.length === 0) return;

      const tl = gsap.timeline();

      tl.to(
        ".animate-showcase",

        { y: 0, opacity: 1, duration: 0.5, ease: "power3.out" },
      ).to(
        ".animate-filters",

        { y: 0, opacity: 1, duration: 0.8, ease: "power2.out" },
        "-=0.5",
      );
    },
    { scope: containerRef, dependencies: [loading, items] },
  );

  useGSAP(
    () => {
      if(initialRef.current)
      gsap.to(gridRef.current?.querySelectorAll(".product-card"), {
        y: 0,
        opacity: 1,
        duration: 0.6,
        stagger: 0.1,
        ease: "back.out(1.2)",
        onComplete: () =>{ initialRef.current=false;console.log("heyy")},
      });
    },
    { scope: containerRef, dependencies: [loading,items] },
  );

  const isInWishlist = (productId) => {
    if (!wishlistItems) return false;
    return wishlistItems.some((item) => item.product?._id === productId);
  };

  const handleWishlistToggle = async (e, productId) => {
    e.stopPropagation();
    if (isInWishlist(productId)) {
      removeFromWishlist(productId);
    } else {
      addToWishlist(productId);
    }
  };

  const { data: categories } = useQuery({
    queryKey: ["category"],
    queryFn: async () => {
      const response = await api.get("/category");
      return response?.data.categories;
    },
  });

  return (
    <div
      ref={containerRef}
      className="min-h-screen w-full bg-gray-50 font-sans text-gray-900"
    > 
      <ScrollToTop page={page}></ScrollToTop>
      {page === 1 && (
        <div className="animate-showcase -translate-y-[50px] opacity-0">
          <FeatureShowcase />
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 -mt-4 relative z-30">
        <div className="animate-filters relative z-40 translate-y-[20px] opacity-0 flex flex-col md:flex-row justify-between items-center gap-4 mb-8 bg-white/80 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-white/20 ring-1 ring-black/5">
          <div className="relative w-full md:w-96 group">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors"
              size={20}
            />
            <input
              type="text"
              placeholder="Search PCs..."
              className="w-full pl-11 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500/20 text-sm font-medium transition-all"
              value={searchInput}
              onChange={(e) => setsearchInput(e.target.value)}
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <CustomDropdown
              icon={Filter}
              placeholder="Category"
              value={filters.category}
              onChange={(val) =>
                setFilters({ ...filters, category: val, page: 1 })
              }
              options={[
                { label: "All Categories", value: "" },
                ...(categories || []).map((c) => ({
                  label: c.name,
                  value: c.name,
                })),
              ]}
              className="w-full sm:w-56"
            />

            <CustomDropdown
              placeholder="Sort By"
              value={filters.sort}
              onChange={(val) => setFilters({ ...filters, sort: val, page: 1 })}
              options={[
                { label: "Newest", value: "newest" },
                { label: "Price: Low to High", value: "price_asc" },
                { label: "Price: High to Low", value: "price_desc" },
              ]}
              className="w-full sm:w-56"
            />
          </div>
        </div>

        {loading && items.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-gray-200 rounded-2xl h-96 shadow-sm"
              ></div>
            ))}
          </div>
        ) : (
          <SwitchTransition mode="out-in">
            <Transition
              key={page}
              nodeRef={gridRef}
              timeout={500}
              onEnter={() => {
                if (gridRef.current) {
                  gsap.to(
                    gridRef.current.querySelectorAll(".product-card"),

                    {
                      y: 0,
                      opacity: 1,
                      duration: 0.6,
                      stagger: 0.1,
                      ease: "back.out(1.2)",
                    },
                  );
                }
              }}
              onExit={() => {
                if (gridRef.current) {
                  gsap.to(gridRef.current, {
                    y: -20,
                    opacity: 0,
                    duration: 0.3,
                    ease: "power2.in",
                  });
                }
              }}
            >
              <div
                ref={gridRef}
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6 lg:gap-8 mb-12"
              >
                {items.map((product, index) => {
                  const isOutOfStock =
                    product.default_config &&
                    Object.values(product.default_config).some(
                      (component) =>
                        component?.stock < 1 || !component?.isActive,
                    );

                  return (
                    <div
                      key={product._id}
                      onClick={() => navigate(`/products/${product._id}`)}
                      className="product-card opacity-0 translate-y-[20px]  group bg-white rounded-2xl shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col cursor-pointer"
                    >
                      <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                        {isOutOfStock && (
                          <div className="absolute inset-0 bg-black/60 z-30 flex items-center justify-center">
                            <span className="bg-red-600 text-white px-3 py-1 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider shadow-lg">
                              Out of Stock
                            </span>
                          </div>
                        )}
                        {product.applied_offer > 0 && !isOutOfStock && (
                          <div className="absolute top-3 left-3 bg-red-600/90 backdrop-blur text-white text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-lg z-10 border border-red-500/20">
                            {product.applied_offer}% OFF
                          </div>
                        )}
                        <img
                          src={
                            product.images?.[0] ||
                            "https://via.placeholder.com/400x300?text=No+Image"
                          }
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                        />
                        <button
                          onClick={(e) => handleWishlistToggle(e, product._id)}
                          className="absolute top-2 right-2 md:top-3 md:right-3 p-1.5 md:p-2 bg-white/80 backdrop-blur-md rounded-full text-gray-500 hover:text-red-500 hover:bg-white transition-all shadow-md z-20 hover:scale-110 active:scale-95"
                        >
                          <HeartIcon
                            className={`h-4 w-4 md:h-5 md:w-5 ${
                              isInWishlist(product._id)
                                ? "fill-red-500 text-red-500"
                                : "text-gray-600"
                            }`}
                          />
                        </button>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>

                      <div className="p-3 md:p-5 flex flex-col flex-grow relative">
                        <div className="mb-2 md:mb-4">
                          <h3 className="text-sm md:text-lg font-bold text-gray-900 mb-1 md:mb-2 line-clamp-2 md:line-clamp-1 group-hover:text-blue-600 transition-colors">
                            {product.name}
                          </h3>
                          {product.category && (
                            <span className="inline-flex items-center px-2 py-0.5 md:px-2.5 md:py-1 mb-2 md:mb-3 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600 uppercase tracking-widest border border-blue-100">
                              {product.category.name}
                            </span>
                          )}
                          <div className="space-y-3 mb-6 flex-1">
                            {product.default_config?.cpu && (
                              <div className="flex items-center gap-3 text-sm text-gray-600">
                                <Cpu className="w-4 h-4 text-gray-400" />
                                <span className="truncate">
                                  {product.default_config.cpu.name ||
                                    "High Performance CPU"}
                                </span>
                              </div>
                            )}
                            {product.default_config?.gpu && (
                              <div className="flex items-center gap-3 text-sm text-gray-600">
                                <div className="w-4 h-4 flex items-center justify-center bg-gray-100 rounded text-[10px] font-bold text-gray-500">
                                  G
                                </div>
                                <span className="truncate">
                                  {product.default_config.gpu.name ||
                                    "Pro Graphics"}
                                </span>
                              </div>
                            )}
                            {product.default_config?.gpu && (
                              <div className="flex items-center gap-3 text-sm text-gray-600">
                                <div className="w-4 h-4 flex items-center justify-center bg-gray-100 rounded text-[10px] font-bold text-gray-500">
                                  <Layers className="w-4 h-4 text-gray-400" />
                                </div>
                                <span className="truncate">
                                  {product.default_config.ram.name ||
                                    "Pro Graphics"}
                                </span>
                              </div>
                            )}
                            {product.default_config?.gpu && (
                              <div className="flex items-center gap-3 text-sm text-gray-600">
                                <div className="w-4 h-4 flex items-center justify-center bg-gray-100 rounded text-[10px] font-bold text-gray-500">
                                  <HardDrive className="w-4 h-4 text-gray-400" />
                                </div>
                                <span className="truncate">
                                  {product.default_config.storage.name ||
                                    "Pro Graphics"}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="mt-auto pt-3 md:pt-4 border-t border-gray-50 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 md:gap-0">
                          <div>
                            {product.applied_offer > 0 ? (
                              <div className="flex flex-col">
                                <span className="text-[10px] md:text-xs text-gray-400 line-through">
                                  ₹{(product.base_price / 100).toLocaleString()}
                                </span>
                                <p className="text-base md:text-xl font-bold text-gray-900">
                                  ₹
                                  {(
                                    product.final_price / 100 ||
                                    product.base_price / 100
                                  ).toLocaleString()}
                                </p>
                              </div>
                            ) : (
                              <div className="flex flex-col">
                                <span className="text-[10px] md:text-xs text-gray-400 opacity-0">
                                  Starting
                                </span>
                                <p className="text-base md:text-xl font-bold text-gray-900">
                                  ₹{(product.base_price / 100).toLocaleString()}
                                </p>
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => navigate(`/products/${product._id}`)}
                            className="w-full md:w-auto bg-gray-900 text-white px-3 py-2 md:px-5 md:py-2.5 rounded-lg md:rounded-xl text-xs md:text-sm font-semibold hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 transform group-hover:translate-x-1 flex items-center justify-center gap-2"
                          >
                            View
                            <Eye className="w-3 h-3 md:w-4 md:h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Transition>
          </SwitchTransition>
        )}

        {!loading && items.length === 0 && (
          <div className="text-center py-24 bg-white rounded-3xl shadow-sm border border-dashed border-gray-200">
            <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="text-gray-400" size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No products found
            </h3>
            <p className="text-gray-500 max-w-sm mx-auto">
              We couldn't find any PCs matching your search. Try adjusting
              filters or generic terms.
            </p>
          </div>
        )}

        {!loading && items.length > 0 && (
          <div className="mt-12">
            <Pagination pagination={pagination} page={page} setPage={setPage} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductList;
