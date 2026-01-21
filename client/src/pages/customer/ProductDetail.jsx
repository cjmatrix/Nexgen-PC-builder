import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchProductById,
  fetchPublicProductById,
} from "../../store/slices/productSlice";
import { addToCart } from "../../store/slices/cartSlice";
import { useWishlist } from "../../hooks/useWishlist";
import {
  ShoppingCart,
  Settings,
  ArrowLeft,
  Heart,
  Check,
  Truck,
  ShieldCheck,
} from "lucide-react";
import {
  FaMicrochip,
  FaMemory,
  FaHdd,
  FaBox,
  FaFan,
  FaBolt,
  FaDesktop,
  FaServer,
} from "react-icons/fa";
import { BsGpuCard, BsCpu } from "react-icons/bs";
import Swal from "sweetalert2";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

const ProductDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const containerRef = useRef(null);

  const {
    currentProduct: product,
    loading,
    error,
  } = useSelector((state) => state.products);

  const {
    items: wishlistItems,
    addToWishlist,
    removeFromWishlist,
  } = useWishlist();

  const [selectedImage, setSelectedImage] = useState(0);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [isZooming, setIsZooming] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchPublicProductById(id));

      setSelectedImage(0);
    }
  }, [dispatch, id]);

  useGSAP(
    () => {
      if (!product || loading) return;

      const tl = gsap.timeline();

      tl.fromTo(
        ".animate-left",
        { x: -50, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.8, ease: "power3.out", stagger: 0.1 },
      )
        .fromTo(
          ".animate-right",
          { x: 50, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.8, ease: "power3.out", stagger: 0.1 },
          "-=0.6",
        )
        .fromTo(
          ".spec-item",
          { y: 20, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.5,
            stagger: 0.05,
            ease: "back.out(1.5)",
          },
          "-=0.4",
        );
    },
    { scope: containerRef, dependencies: [product, loading] },
  );

 const getComponentIcon = (category) => {
    const iconClass = "w-5 h-5";
    switch (category?.toLowerCase()) {
      case "cpu":
        return <BsCpu className={`${iconClass} text-blue-500`} />;
      case "gpu":
        return <BsGpuCard className={`${iconClass} text-green-500`} />;
      case "motherboard":
        return <FaBox className={`${iconClass} text-purple-500`} />;
      case "ram":
        return <FaMemory className={`${iconClass} text-yellow-500`} />;
      case "storage":
        return <FaHdd className={`${iconClass} text-red-500`} />;
      case "case":
        return <FaDesktop className={`${iconClass} text-gray-500`} />;
      case "psu":
        return <FaBolt className={`${iconClass} text-yellow-600`} />;
      case "cooler":
        return <FaFan className={`${iconClass} text-cyan-500`} />;
      default:
        return <FaBox className={`${iconClass} text-gray-400`} />;
    }
  };

  const isInWishlist = wishlistItems?.some((item) => item.product?._id === id);

  const handleWishlistToggle = async () => {
    if (isInWishlist) {
      removeFromWishlist(id);
    } else {
      addToWishlist(id);
    }
  };

  if (loading || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium animate-pulse">
          Loading Product Details...
        </p>
      </div>
    );
  }

  const isOutOfStock =
    product?.default_config &&
    Object.values(product.default_config).some(
      (component) => component?.stock < 1 || !component?.isActive,
    );

  const images =
    product.images && product.images.length > 0
      ? product.images
      : ["https://via.placeholder.com/800x600?text=No+Image"];

  const displayImages = [...images];
  while (displayImages.length < 3 && images.length > 0) {
    displayImages.push(images[0]);
  }

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.target.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPosition({ x, y });
  };

  const handleAddToCart = async () => {
    try {
      await dispatch(addToCart({ productId: id })).unwrap();
      Swal.fire({
        icon: "success",
        title: "Added to Cart!",
        text: `${product.name} is now in your cart.`,
        showConfirmButton: false,
        timer: 1500,
        background: "#fff",
        iconColor: "#2563eb",
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: error || "Failed to add to cart",
      });
    }
  };

  const getComponentName = (val) => {
    if (typeof val === "string") return val;
    if (typeof val === "object" && val?.name) return val.name;
    return "Included";
  };

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-gray-50 font-sans text-gray-900 pb-20"
    >
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-[-10%] w-[800px] h-[800px] bg-blue-100/40 blur-[120px] rounded-full mix-blend-multiply"></div>
        <div className="absolute bottom-0 left-[-10%] w-[600px] h-[600px] bg-purple-100/40 blur-[100px] rounded-full mix-blend-multiply"></div>
      </div>

      <div className="relative pt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        {/* Breadcrumb / Back */}
        <button
          onClick={() => navigate("/products")}
          className="group flex items-center text-gray-500 hover:text-blue-600 mb-8 transition-colors duration-300"
        >
          <div className="p-2 rounded-full bg-white border border-gray-200 shadow-sm group-hover:shadow-md mr-3 transition-all">
            <ArrowLeft className="h-4 w-4" />
          </div>
          <span className="font-medium">Back to Products</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* LEFT: Image Gallery */}
          <div className="lg:col-span-7 animate-left space-y-6 sticky top-24">
            <div className="bg-white rounded-3xl p-8 shadow-xl shadow-gray-200/50 border border-white ring-1 ring-gray-100 relative overflow-hidden group">
              <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
                <button
                  onClick={handleWishlistToggle}
                  className={`p-3 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 ${isInWishlist ? "bg-red-50 text-red-500" : "bg-white text-gray-400 hover:text-red-500"}`}
                >
                  <Heart
                    className={`w-6 h-6 ${isInWishlist ? "fill-current" : ""}`}
                  />
                </button>
              </div>

              <div
                className="relative w-full aspect-[4/3] overflow-hidden rounded-xl cursor-crosshair"
                onMouseMove={handleMouseMove}
                onMouseEnter={() => setIsZooming(true)}
                onMouseLeave={() => setIsZooming(false)}
              >
                <img
                  src={displayImages[selectedImage]}
                  alt={product.name}
                  className={`w-full h-full object-contain transition-transform duration-200 ease-linear origin-center drop-shadow-lg ${
                    isZooming ? "scale-[2]" : "scale-100"
                  }`}
                  style={
                    isZooming
                      ? {
                          transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                        }
                      : {}
                  }
                />
              </div>
            </div>

            {/* Thumbnails */}
            <div className="flex gap-4 overflow-x-auto pb-2 px-1">
              {displayImages.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative min-w-[80px] h-20 rounded-xl overflow-hidden border-2 transition-all duration-300 transform ${
                    selectedImage === index
                      ? "border-blue-600 ring-2 ring-blue-600/20 scale-105"
                      : "border-transparent bg-white shadow-sm hover:scale-105"
                  }`}
                >
                  <img
                    src={img}
                    alt={`View ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT: Product Info */}
          <div className="lg:col-span-5 animate-right space-y-8">
            {/* Title & Badge */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-50 text-blue-600 border border-blue-100">
                  Premium Build
                </span>
                {isOutOfStock && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-50 text-red-600 border border-red-100">
                    Out of Stock
                  </span>
                )}
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight tracking-tight mb-2">
                {product.name}
              </h1>
              <div className="flex items-center gap-1.5 text-yellow-500 text-sm font-medium">
                {"★".repeat(5)}{" "}
                <span className="text-gray-400 ml-1">(No reviews yet)</span>
              </div>
            </div>

            {/* Price */}
            <div className="p-6 rounded-2xl bg-white border border-gray-100 shadow-sm">
              {product.applied_offer > 0 ? (
                <div className="flex items-baseline gap-4">
                  <h2 className="text-4xl font-extrabold text-gray-900">
                    ₹{(product.final_price / 100).toLocaleString()}
                  </h2>
                  <div className="flex flex-col">
                    <span className="text-lg text-gray-400 line-through font-medium">
                      ₹{(product.base_price / 100).toLocaleString()}
                    </span>
                    <span className="text-sm font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-md self-start">
                      {product.applied_offer}% OFF
                    </span>
                  </div>
                </div>
              ) : (
                <h2 className="text-4xl font-extrabold text-blue-600">
                  ₹{(product.base_price / 100).toLocaleString()}
                </h2>
              )}
              <p className="text-gray-500 text-sm mt-2 flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" /> Inclusive of all
                taxes
              </p>
            </div>

            {/* Description */}
            <p className="text-gray-600 leading-relaxed text-lg border-l-2 border-gray-200 pl-4">
              {product.description}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              <div className="flex gap-4">
                <button
                  onClick={() => handleAddToCart(id)}
                  disabled={isOutOfStock}
                  className={`flex-1 py-4 px-6 rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg transition-all duration-300 transform active:scale-[0.98] ${
                    isOutOfStock
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-gray-900 text-white hover:bg-black hover:shadow-gray-900/30"
                  }`}
                >
                  <ShoppingCart className="w-5 h-5" />
                  {isOutOfStock ? "Unavailable" : "Add to Cart"}
                </button>

                <button
                  onClick={() =>
                    navigate(`/products/customization/${product._id}`)
                  }
                  className="flex-1 py-4 px-6 rounded-xl font-bold text-lg border-2 border-gray-200 text-gray-700 bg-white hover:border-gray-900 hover:text-gray-900 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <Settings className="w-5 h-5" />
                  Customize
                </button>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50/50">
                <Truck className="w-6 h-6 text-blue-600" />
                <div>
                  <p className="text-sm font-bold text-gray-900">
                    Free Shipping
                  </p>
                  <p className="text-xs text-gray-500">Across all regions</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50/50">
                <ShieldCheck className="w-6 h-6 text-green-600" />
                <div>
                  <p className="text-sm font-bold text-gray-900">
                    2 Year Warranty
                  </p>
                  <p className="text-xs text-gray-500">On-site support</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Specifications Grid */}
        <div className="mt-20">
          <div className="flex items-center gap-4 mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              Technical Specifications
            </h2>
            <div className="h-0.5 flex-1 bg-gray-100"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {product.default_config &&
              Object.entries(product.default_config).map(
                ([category, component], index) =>
                  component && (
                    <div
                      key={index}
                      className="spec-item bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 group"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-gray-50 rounded-xl group-hover:bg-blue-50 transition-colors">
                          {getComponentIcon(category)}
                        </div>
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-400 bg-gray-50 px-2 py-1 rounded-md">
                          {category}
                        </span>
                      </div>

                      <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2">
                        {component.name}
                      </h3>

                      {component.specs &&
                        Object.keys(component.specs).length > 0 && (
                          <div className="space-y-2 mt-4 pt-4 border-t border-gray-50">
                            {Object.entries(component.specs)
                              .slice(0, 3)
                              .map(([key, value], i) => (
                                <div
                                  key={i}
                                  className="flex justify-between text-sm"
                                >
                                  <span className="text-gray-500 capitalize">
                                    {key.replace(/([A-Z])/g, " $1").trim()}
                                  </span>
                                  <span className="font-medium text-gray-900">
                                    {value.toString()}
                                  </span>
                                </div>
                              ))}
                          </div>
                        )}
                    </div>
                  ),
              )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
