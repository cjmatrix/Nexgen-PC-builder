import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useWishlist } from "../../../../../hooks/useWishlist";
import { ShoppingCart, Trash2, Heart, ArrowRight } from "lucide-react";
import CustomModal from "../../../../../components/CustomModal";

const Wishlist = () => {
  const navigate = useNavigate();
  const { items, loading, error, removeFromWishlist, moveToCart, moveError } =
    useWishlist();

  const [showErrorModal, setShowErrorModal] = React.useState(false);

  useEffect(() => {
    if (moveError) {
      setShowErrorModal(true);
    }
  }, [moveError]);

  const handleMoveToCart = async (productId) => {
    moveToCart(productId);
  };

  const handleRemove = async (productId) => {
    removeFromWishlist(productId);
  };
  console.log(moveError?.response?.data.message);
  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-up bg-gray-50/50 min-h-screen p-4 md:p-8 font-sans pb-24 md:pb-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-2">
          <Heart className="h-8 w-8 md:h-10 md:w-10 text-red-500 fill-current" />
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
            My Wishlist
          </h1>
        </div>
        <p className="text-gray-500 font-medium text-lg mb-8 ml-11 md:ml-14">
          Save your favorite items for later
        </p>
        {items.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="h-10 w-10 text-gray-300" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Your wishlist is empty
            </h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              Save items you love so you can come back to them later.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 bg-gray-900 text-white px-8 py-3 rounded-lg font-bold hover:bg-gray-800 transition-all"
            >
              Start Shopping <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item) => {
              const product = item.product;
              if (!product) return null;

              return (
                <div
                  key={product._id}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col group hover:shadow-md transition-shadow"
                >
                  <div className="relative aspect-4/3 bg-gray-100 overflow-hidden">
                    <img
                      src={product.images?.[0] || "https://placehold.co/400"}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <button
                      onClick={() => handleRemove(product._id)}
                      className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur rounded-full text-gray-500 hover:text-red-500 transition-colors shadow-sm"
                      title="Remove"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="p-3 flex flex-col flex-1">
                    <Link
                      to={`/products/${product._id}`}
                      className="block mb-2"
                    >
                      <h3 className="font-bold text-gray-900 line-clamp-1 hover:text-blue-600 transition-colors">
                        {product.name}
                      </h3>
                    </Link>

                    <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                      <div>
                        {product.applied_offer > 0 ? (
                          <div className="flex flex-col">
                            <span className="text-xs text-gray-400 line-through">
                              ₹{(product.base_price / 100).toLocaleString()}
                            </span>
                            <span className="font-bold text-gray-900">
                              ₹{(product.final_price / 100).toLocaleString()}
                            </span>
                          </div>
                        ) : (
                          <span className="font-bold text-gray-900">
                            ₹{(product.base_price / 100).toLocaleString()}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => handleMoveToCart(product._id)}
                        className="bg-black ml-4 text-white px-2 py-2 rounded-lg text-xs font-medium hover:bg-gray-800 transition-colors flex items-center gap-2"
                      >
                        <ShoppingCart className="h-4 w-4" />
                        Move to Cart
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {moveError && (
        <CustomModal
          isOpen={showErrorModal}
          onClose={() => setShowErrorModal(false)}
          title="Cannot Move to Cart"
          message={
            moveError.response?.data?.message || "Failed to move item to cart"
          }
          type="error"
          confirmText="Okay"
          onConfirm={() => setShowErrorModal(false)}
        />
      )}
    </div>
  );
};

export default Wishlist;
