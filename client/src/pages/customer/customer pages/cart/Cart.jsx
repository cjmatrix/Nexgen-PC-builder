import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { Minus, Plus, Trash2, ArrowRight, Tag, X } from "lucide-react";
import { TransitionGroup } from "react-transition-group";
import TransitionWrapper from "../../../../components/TransitionWrapper";
import CustomModal from "../../../../components/CustomModal";
import api from "../../../../api/axios";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  fetchCart,
  removeFromCart,
  updateQuantity,
  applyCoupon,
  removeCoupon,
} from "../../../../store/slices/cartSlice";

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, summary, loading, coupon } = useSelector(
    (state) => state.cart,
  );
  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState("");
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    type: "info",
    title: "",
    message: "",
  });

  const [optimisticQty, setOptimisticQty] = useState({});
  const [optiCart, setOptiCart] = useState([]);

  useEffect(() => {
    let qtyObj = {};
    setOptimisticQty(() => {
      items?.length !== 0 &&
        items.forEach((item) => {
          qtyObj[item.isCustomBuild ? item?._id : item.product?._id] =
            item.quantity;
        });

      return qtyObj;
    });
  }, [items]);

  useEffect(() => {
    if (items) setOptiCart(items);
  }, [items]);

  console.log(optimisticQty);
  const closeModal = () => {
    setModalConfig((prev) => ({ ...prev, isOpen: false }));
  };

  const { data: availableCoupons, isLoading: couponsLoading } = useQuery({
    queryKey: ["adminCoupons"],
    queryFn: async () => {
      const res = await api.get("/coupons/available");
      return res.data.coupons;
    },
    enabled: isCouponModalOpen,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  const [errors, setErrors] = useState({});

  const handleApplyCoupon = async (codeToApply) => {
    if (!couponCode && !codeToApply) return;
    setCouponError("");

    try {
      await dispatch(applyCoupon(codeToApply || couponCode)).unwrap();
      setCouponCode("");
    } catch (error) {
      setCouponError(error);
    }

    //------------or-----------
    //   dispatch(applyCoupon(couponCode))
    // .unwrap()
    // .then((data) => {
    //    console.log("Success:", data);
    //    // Clear error, maybe close modal
    //    setCouponError(null);
    // })
    // .catch((errorMessage) => {
    //    // 'errorMessage' is your string "You have already used..."
    //    setCouponError(errorMessage);
    // });
  };

  const handleRemoveCoupon = async () => {
    try {
      await dispatch(removeCoupon()).unwrap();
    } catch (error) {
      console.error("Failed to remove coupon", error);
    }
  };

  const handleUpdateQuantity = async (productId, newQuantity, op) => {
    if (newQuantity < 1) return;
    try {
      await dispatch(updateQuantity({ productId, quantity: newQuantity }))
        .unwrap()
        .then()
        .catch((error) => {
          setOptimisticQty((prev) => ({
            ...prev,
            [productId]:
              op === "plus" ? prev[productId] - 1 : prev[productId] + 1,
          }));

          throw error;
        });
      setErrors((prev) => ({ ...prev, [productId]: null }));
    } catch (error) {
      setErrors((prev) => ({ ...prev, [productId]: error }));
    }
  };


  const handleRemove = async (productId) => {
    const previousCart = optiCart;
    setOptiCart((prev) =>
      prev.filter((item) =>
        item.isCustomBuild
          ? item._id !== productId
          : item.product._id !== productId,
      ),
    );
    await dispatch(removeFromCart(productId))
      .unwrap()
      .then()
      .catch((error) => {
      
        setOptiCart(previousCart);
        toast.error("Failed To Remove From Cart")
      });
  };

  const handleCheckout = async () => {
    try {
      const response = await api.get("/cart/validate");
      navigate("/checkout");
    } catch (error) {
      setModalConfig({
        isOpen: true,
        type: "error",
        title: "Checkout Failed",
        message: error.response?.data?.message || "Something went wrong",
      });
      return;
    }
  };

  if (loading && items.length === 0) {
    return (
      <div className="min-h-screen pt-24 pb-12 flex justify-center items-center">
        <p className="text-gray-500">Loading cart...</p>
      </div>
    );
  }

  return (
    <>
      <div className="animate-fade-up min-h-screen bg-gray-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8 font-sans">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-8">
            Your Cart
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <TransitionGroup component={null}>
                {optiCart.map((item) => {
                  const isCustom = item.isCustomBuild;
                  const name = isCustom
                    ? item.customBuild.name
                    : item.product?.name;
                  const image =
                    isCustom && !item.isAiBuild
                      ? "/custom-pc.png"
                      : isCustom && item.isAiBuild
                        ? item.customBuild.aiImages || "/custom-pc.png"
                        : item.product?.images?.[0] ||
                          "https://placehold.co/400";

                  let description = item.product?.description;
                  if (isCustom && item.customBuild?.components) {
                    const comps = item.customBuild.components;
                    const cpu = comps.cpu?.name || "";
                    const gpu = comps.gpu?.name || "";
                    description = [cpu, gpu].filter(Boolean).join(" • ");
                  }

                  const basePrice = isCustom
                    ? item.customBuild.totalPrice
                    : item.product?.base_price;
                  const finalPrice = isCustom
                    ? item.customBuild.totalPrice
                    : item.product?.final_price;
                  const appliedOffer = isCustom
                    ? 0
                    : item.product?.applied_offer;

                  const removeId = isCustom ? item._id : item.product?._id;

                  return (
                    <TransitionWrapper key={item._id} mode="delete">
                      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col sm:flex-row gap-6">
                        {/* Image */}
                        <div className="w-full sm:w-40 h-40 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          {!isCustom && item.product?._id ? (
                            <Link
                              to={`/products/${item.product._id}`}
                              className="block w-full h-full"
                            >
                              <img
                                src={image}
                                alt={name}
                                className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                              />
                            </Link>
                          ) : (
                            <img
                              src={image}
                              alt={name}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>

                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="text-xl font-bold text-gray-900">
                                {!isCustom && item.product?._id ? (
                                  <Link
                                    to={`/products/${item.product._id}`}
                                    className="hover:text-blue-600 transition-colors"
                                  >
                                    {name}
                                  </Link>
                                ) : (
                                  name
                                )}
                              </h3>
                            </div>

                            <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                              {description}
                            </p>

                            <button
                              onClick={() =>
                                handleRemove(
                                  isCustom ? item._id : item.product?._id,
                                )
                              }
                              className="inline-flex items-center text-sm text-gray-400 hover:text-red-500 transition-colors bg-gray-50 hover:bg-red-50 px-3 py-1.5 rounded-lg"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Remove
                            </button>
                          </div>

                          <div className="flex justify-between items-end mt-4 sm:mt-0">
                            <div>
                              {appliedOffer > 0 ? (
                                <div className="flex flex-col items-start bg-gray-50 p-2 rounded-lg">
                                  <span className="text-xs text-gray-400 line-through">
                                    ₹{(basePrice / 100).toLocaleString()}
                                  </span>
                                  <span className="text-lg font-bold text-gray-900">
                                    ₹ {(finalPrice / 100).toLocaleString()}
                                  </span>
                                  <span className="text-[10px] text-green-600 font-bold bg-green-100 px-1.5 py-0.5 rounded-full mt-0.5">
                                    {appliedOffer}% OFF
                                  </span>
                                </div>
                              ) : (
                                <div className="text-lg font-bold text-gray-900">
                                  ₹ {(basePrice / 100).toLocaleString()}
                                </div>
                              )}
                            </div>

                            <div className="flex flex-col items-end gap-1">
                              <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-1">
                                <button
                                  onClick={() => {
                                    setOptimisticQty((prev) => ({
                                      ...prev,
                                      [item.isCustomBuild
                                        ? item._id
                                        : item.product._id]:
                                        prev[
                                          item.isCustomBuild
                                            ? item._id
                                            : item.product._id
                                        ] - 1,
                                    }));

                                    handleUpdateQuantity(
                                      isCustom ? item._id : item.product?._id,
                                      item.quantity - 1,
                                      "minus",
                                    );
                                  }}
                                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded-md transition-all shadow-sm disabled:opacity-50"
                                  disabled={loading || item.quantity <= 1}
                                >
                                  <Minus className="h-4 w-4" />
                                </button>
                                <span className="text-sm font-semibold w-8 text-center">
                                  {
                                    optimisticQty[
                                      item.isCustomBuild
                                        ? item._id
                                        : item.product._id
                                    ]
                                  }
                                </span>
                                <button
                                  onClick={() => {
                                    setOptimisticQty((prev) => ({
                                      ...prev,
                                      [item.isCustomBuild
                                        ? item._id
                                        : item.product._id]:
                                        prev[
                                          item.isCustomBuild
                                            ? item._id
                                            : item.product._id
                                        ] + 1,
                                    }));
                                    handleUpdateQuantity(
                                      isCustom ? item._id : item.product?._id,
                                      item.quantity + 1,
                                      "plus",
                                    );
                                  }}
                                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded-md transition-all shadow-sm"
                                  disabled={loading}
                                >
                                  <Plus className="h-4 w-4" />
                                </button>
                              </div>

                              {errors[
                                isCustom ? item._id : item.product?._id
                              ] && (
                                <p className="text-red-500 text-xs font-medium">
                                  {
                                    errors[
                                      isCustom ? item._id : item.product?._id
                                    ]
                                  }
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </TransitionWrapper>
                  );
                })}
              </TransitionGroup>
            </div>

            {/* Order Summary */}
            {items.length !== 0 && (
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
                  <h2 className="text-lg font-bold text-gray-900 mb-6">
                    Order Summary
                  </h2>

                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium text-gray-900">
                        ₹{summary.subtotal.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Coupon</span>
                      <span className="font-medium text-red-600">
                        ₹{summary.couponDiscount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total Discount</span>
                      <span className="font-medium text-green-600">
                        -₹{summary.discount.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Shipping</span>
                      <span className="font-medium text-gray-900">
                        {summary.shipping === 0
                          ? "Free"
                          : `₹${summary.shipping}`}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tax</span>
                      <span className="text-gray-500 italic">
                        Calculated at checkout
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-4 mb-6">
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Coupon Code
                      </label>

                      {coupon ? (
                        <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3">
                          <div>
                            <p className="text-sm font-medium text-green-800">
                              Coupon Applied
                            </p>
                            <p className="text-xs text-green-600 font-bold uppercase">
                              {coupon.code}
                            </p>
                          </div>
                          <button
                            onClick={handleRemoveCoupon}
                            className="text-gray-400 hover:text-red-500 transition-colors p-1"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value)}
                            placeholder="Enter coupon code"
                            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none uppercase"
                          />
                          <button
                            onClick={() => handleApplyCoupon()}
                            disabled={!couponCode}
                            className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Apply
                          </button>
                        </div>
                      )}

                      {/* Available Coupons Button */}
                      <button
                        onClick={() => setIsCouponModalOpen(true)}
                        className="text-blue-600 text-xs font-semibold mt-2 hover:underline flex items-center gap-1"
                      >
                        <Tag className="h-3 w-3" /> View Available Coupons
                      </button>

                      {couponError && (
                        <p className="text-red-500 text-xs mt-2">
                          {couponError}
                        </p>
                      )}
                    </div>

                    <div className="flex justify-between items-center mb-6">
                      <span className="text-base font-bold text-gray-900">
                        Total
                      </span>
                      <span className="text-xl font-bold text-gray-900">
                        ₹{summary.total.toLocaleString()}
                      </span>
                    </div>

                    <button
                      onClick={() => handleCheckout()}
                      className="w-full bg-gray-900 text-white py-3.5 rounded-lg font-bold hover:bg-gray-800 transition-all shadow-lg shadow-gray-900/10 flex items-center justify-center gap-2"
                    >
                      Proceed to Checkout <ArrowRight className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {items.length === 0 && (
            <div
              className="animate-fade-up text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100 opacity-0"
              style={{
                animationDelay: "300ms",
              }}
            >
              <h2 className="text-xl font-medium text-gray-900 mb-4">
                Your cart is empty
              </h2>
              <Link
                to="/products"
                className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
              >
                Continue Shopping <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Available Coupons Modal */}
      {isCouponModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <Tag className="h-5 w-5 text-blue-600" /> Available Coupons
              </h3>
              <button
                onClick={() => setIsCouponModalOpen(false)}
                className="p-1 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="p-4 max-h-[60vh] overflow-y-auto space-y-3">
              {couponsLoading ? (
                <div className="text-center py-8 text-gray-500">
                  Loading offers...
                </div>
              ) : availableCoupons?.length > 0 ? (
                availableCoupons.map((c) => (
                  <div
                    key={c._id}
                    className="relative overflow-hidden bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl p-5 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 hover:-translate-y-1 transition-all duration-300 group"
                  >
                    {/* Decorative Circle */}
                    <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
                    <div className="absolute -left-6 -bottom-6 w-20 h-20 bg-black/10 rounded-full blur-xl"></div>

                    <div className="relative z-10 flex justify-between items-center gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-black text-white text-xl tracking-wider uppercase drop-shadow-md">
                            {c.code}
                          </span>
                          <span className="px-2 py-0.5 bg-white/20 backdrop-blur-md rounded-md text-[10px] font-bold text-white uppercase tracking-wider">
                            Active
                          </span>
                        </div>
                        <p className="text-white/90 font-medium text-sm mb-3">
                          {c.discountType === "percentage"
                            ? `${c.discountValue}% OFF`
                            : `₹${c.discountValue} FLAT OFF`}
                        </p>
                        <div className="text-[10px] text-white/70 font-mono space-y-0.5">
                          <p>Min order: ₹{c.minOrderValue}</p>
                          <p>
                            Expires:{" "}
                            {new Date(c.expiryDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setCouponCode(c.code);
                          handleApplyCoupon(c.code);
                          setIsCouponModalOpen(false);
                        }}
                        className="flex-shrink-0 bg-white text-purple-600 text-xs font-bold px-4 py-2 rounded-lg shadow-md hover:bg-gray-50 active:scale-95 transition-all"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No coupons available for you right now.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <CustomModal
        isOpen={modalConfig.isOpen}
        onClose={closeModal}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        confirmText="Okay"
        onConfirm={closeModal}
      />
    </>
  );
};

export default Cart;
