import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { Minus, Plus, Trash2, ArrowRight } from "lucide-react";
import api from "../../api/axios";
import {
  fetchCart,
  removeFromCart,
  updateQuantity,
} from "../../store/slices/cartSlice";

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, summary, loading } = useSelector((state) => state.cart);

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  const [errors, setErrors] = useState({});

  const handleUpdateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      await dispatch(
        updateQuantity({ productId, quantity: newQuantity })
      ).unwrap();
      setErrors((prev) => ({ ...prev, [productId]: null }));
    } catch (error) {
      setErrors((prev) => ({ ...prev, [productId]: error }));
    }
  };

  const handleRemove = (productId) => {
    dispatch(removeFromCart(productId));
  };

  const handleCheckout = async () => {
    try {
      const response = await api.get("/cart/validate");
      navigate("/checkout");
    } catch (error) {
      alert(error.response.data.message);
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
  console.log("heyy");
  return (
    <>
      <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8 font-sans">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-8">
            Your Cart
          </h1>

          {items.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
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
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                {items.map((item) => (
                  <div
                    key={item._id}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col sm:flex-row gap-6"
                  >
                    {/* Image */}
                    <div className="w-full sm:w-40 h-40 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={
                          item.product?.images?.[0] ||
                          "https://placehold.co/400"
                        }
                        alt={item.product?.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-xl font-bold text-gray-900">
                            {item.product?.name}
                          </h3>
                        </div>

                        <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                          {item.product?.description}
                        </p>

                        <button
                          onClick={() => handleRemove(item.product?._id)}
                          className="inline-flex items-center text-sm text-gray-400 hover:text-red-500 transition-colors bg-gray-50 hover:bg-red-50 px-3 py-1.5 rounded-lg"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove
                        </button>
                      </div>

                      <div className="flex justify-between items-end mt-4 sm:mt-0">
                        <div>
                          {item.product?.discount > 0 ? (
                            <div className="flex flex-col items-start bg-gray-50 p-2 rounded-lg">
                              <span className="text-xs text-gray-400 line-through">
                                ₹
                                {(
                                  item.product?.base_price / 100
                                ).toLocaleString()}
                              </span>
                              <span className="text-lg font-bold text-gray-900">
                                ₹{" "}
                                {(item.product?.final_price/100).toLocaleString()}
                              </span>
                              <span className="text-[10px] text-green-600 font-bold bg-green-100 px-1.5 py-0.5 rounded-full mt-0.5">
                                {item.product?.applied_offer}% OFF
                              </span>
                            </div>
                          ) : (
                            <div className="text-lg font-bold text-gray-900">
                              ₹{" "}
                              {(
                                item.product?.base_price / 100
                              ).toLocaleString()}
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col items-end gap-1">
                          <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-1">
                            <button
                              onClick={() =>
                                handleUpdateQuantity(
                                  item.product?._id,
                                  item.quantity - 1
                                )
                              }
                              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded-md transition-all shadow-sm disabled:opacity-50"
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="text-sm font-semibold w-8 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                handleUpdateQuantity(
                                  item.product?._id,
                                  item.quantity + 1
                                )
                              }
                              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded-md transition-all shadow-sm"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                          {errors[item.product?._id] && (
                            <p className="text-red-500 text-xs font-medium">
                              {errors[item.product?._id]}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
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
                      <span className="text-gray-600">Discount</span>
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
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Enter coupon code"
                          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                        />
                        <button className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
                          Apply
                        </button>
                      </div>
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
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Cart;
