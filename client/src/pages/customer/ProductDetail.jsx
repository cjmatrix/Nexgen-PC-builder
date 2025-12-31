import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchProductById,
  fetchPublicProductById,
} from "../../store/slices/productSlice";
import { addToCart } from "../../store/slices/cartSlice";
import { useWishlist } from "../../hooks/useWishlist";

import { ShoppingCart, Settings, ArrowLeft, Heart } from "lucide-react";

import Swal from "sweetalert2";

const ProductDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
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
    }
  }, [dispatch, id]);

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const isOutOfStock =
    product?.default_config &&
    Object.values(product.default_config).some(
      (component) => component?.stock < 1
    );

  console.log(product);
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
        title: "Added to Cart",
        showConfirmButton: false,
        timer: 1500,
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Failed to Add",
        text: error, // This will be the message from backend: "Not enough stock..."
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <div className="pt-24 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate("/products")}
          className="flex items-center text-gray-500 hover:text-gray-900 mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Products
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            <div className="p-8 bg-gray-50 flex flex-col items-center justify-center border-r border-gray-100">
              <div
                className="relative w-full aspect-4/3 mb-6 overflow-hidden rounded-xl bg-white shadow-sm cursor-zoom-in group"
                onMouseMove={handleMouseMove}
                onMouseEnter={() => setIsZooming(true)}
                onMouseLeave={() => setIsZooming(false)}
              >
                <img
                  src={displayImages[selectedImage]}
                  alt={product.name}
                  className={`w-full h-full object-contain transition-transform duration-200 ${
                    isZooming ? "scale-150" : "scale-100"
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

              <div className="flex space-x-4 overflow-x-auto py-2">
                {displayImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === index
                        ? "border-gray-900 ring-2 ring-gray-900/20"
                        : "border-transparent hover:border-gray-300"
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

            <div className="p-8 lg:p-12 flex flex-col justify-center">
              <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
                {product.name}
              </h1>
              {product.applied_offer > 0 ? (
                <div className="mb-6">
                  <div className="flex items-center gap-3">
                    <p className="text-3xl font-bold text-red-600">
                      ₹{(product.final_price / 100).toLocaleString()}
                    </p>
                    <span className="bg-red-100 text-red-700 text-sm font-bold px-3 py-1 rounded-full">
                      {product.applied_offer}% OFF
                    </span>
                  </div>
                  <p className="text-gray-400 text-lg line-through mt-1">
                    MRP: ₹{(product.base_price / 100).toLocaleString()}
                  </p>
                </div>
              ) : (
                <p className="text-3xl font-bold text-blue-600 mb-6">
                  ₹{(product.base_price / 100).toLocaleString()}
                </p>
              )}
              <p className="text-gray-600 mb-8 leading-relaxed text-lg">
                {product.description}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <button
                  onClick={() =>
                    navigate(`/products/customization/${product._id}`)
                  }
                  className="flex-1 bg-gray-900 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-800 transition-all shadow-lg shadow-gray-900/20 flex items-center justify-center gap-2"
                >
                  <Settings className="h-5 w-5" />
                  Customize This
                </button>
                <button
                  onClick={() => handleAddToCart(id)}
                  disabled={isOutOfStock}
                  className={`flex-1 px-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${
                    isOutOfStock
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed border-2 border-gray-300"
                      : "bg-white text-gray-900 border-2 border-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <ShoppingCart className="h-5 w-5" />
                  {isOutOfStock ? "Out of Stock" : "Add to Cart"}
                </button>
                <button
                  onClick={handleWishlistToggle}
                  className={`px-4 py-4 rounded-xl border-2 transition-all ${
                    isInWishlist
                      ? "bg-red-50 border-red-200 text-red-500"
                      : "bg-white border-gray-200 text-gray-400 hover:border-red-200 hover:text-red-500"
                  }`}
                  title={
                    isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"
                  }
                >
                  <Heart
                    className={`h-6 w-6 ${isInWishlist ? "fill-current" : ""}`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Specifications */}
          <div className="p-8 lg:p-12 border-t border-gray-100 bg-white">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              Full Specifications
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
              {product.default_config &&
                Object.entries(product.default_config).map(
                  ([category, component], index) =>
                    component && (
                      <div
                        key={index}
                        className="border-b border-gray-100 pb-6 last:border-0"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
                              {category}
                            </h3>
                            <p className="text-lg font-bold text-gray-900 leading-tight">
                              {component.name}
                            </p>
                          </div>
                        </div>

                        {component.specs &&
                          Object.keys(component.specs).length > 0 && (
                            <div className="bg-gray-50 rounded-lg p-3 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                              {Object.entries(component.specs).map(
                                ([key, value], i) => (
                                  <div
                                    key={i}
                                    className="flex items-center justify-between border-b border-gray-200 last:border-0 pb-1 last:pb-0 border-dashed"
                                  >
                                    <span className="text-gray-500 capitalize">
                                      {!key.includes("image") &&
                                        key.replace(/([A-Z])/g, " $1").trim()}
                                    </span>
                                    <span className="font-medium text-gray-900 text-right ml-2">
                                      {!key.includes("image") &&
                                        value.toString()}
                                    </span>
                                  </div>
                                )
                              )}
                            </div>
                          )}
                      </div>
                    )
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
