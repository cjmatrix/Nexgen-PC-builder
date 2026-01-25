import React from "react";
import { MapPin, CreditCard, Archive } from "lucide-react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

const OrderSummary = ({
  items,
  summary,
  selectedAddress,
  paymentMethod,
  setPaymentMethod,
  walletBalance,
  isProcessing,
  handlePlaceOrder,
  paypalClientId,
  createPaypalOrder,
  onApprove,
  paypalValidationFailedRef,
  showModal,
  onBack,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left: Items Review */}
      <div className="lg:col-span-2 space-y-6">
        <h2 className="text-xl font-bold text-gray-900">Review Items</h2>
        <div className="space-y-4">
          {items.map((item) => {
            const isCustom = item.isCustomBuild;
            const name = isCustom ? item.customBuild.name : item.product?.name;
            const image = isCustom
              ? "/custom-pc.png"
              : item.product?.images?.[0] || "https://placehold.co/100";
            const description = isCustom
              ? "Custom Configuration"
              : item.product?.description;

            const basePrice = isCustom
              ? item.customBuild.totalPrice
              : item.product?.base_price;
            const finalPrice = isCustom
              ? item.customBuild.totalPrice
              : item.product?.final_price;
            const appliedOffer = isCustom ? 0 : item.product?.applied_offer;

            return (
              <div
                key={item._id}
                className="flex gap-4 p-4 bg-white border border-gray-100 rounded-xl"
              >
                <div className="h-20 w-20 shrink-0 bg-gray-100 rounded-md overflow-hidden">
                  <img
                    src={image}
                    alt={name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900">{name}</h3>
                  <p className="text-sm text-gray-500 line-clamp-1">
                    {description}
                  </p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm font-medium text-gray-500">
                      Qty: {item.quantity}
                    </span>
                    <div className="text-right">
                      {appliedOffer > 0 ? (
                        <div className="flex flex-col items-end">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400 line-through">
                              ₹
                              {(
                                (basePrice * item.quantity) /
                                100
                              ).toLocaleString()}
                            </span>
                            <span className="font-bold text-gray-900">
                              ₹
                              {(
                                (finalPrice * item.quantity) /
                                100
                              ).toLocaleString()}
                            </span>
                          </div>
                          <span className="text-[10px] text-green-600 font-bold bg-green-100 px-1.5 py-0.5 rounded-full mt-1">
                            {appliedOffer}% OFF
                          </span>
                        </div>
                      ) : (
                        <span className="font-bold text-gray-900">
                          ₹
                          {((basePrice * item.quantity) / 100).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
          <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
            <MapPin className="h-4 w-4" /> Shipping To:
          </h3>
          <div className="text-sm text-gray-600">
            <p className="font-semibold">{selectedAddress?.fullName}</p>
            <p>
              {selectedAddress?.street}, {selectedAddress?.city}
            </p>
            <p>
              {selectedAddress?.state}, {selectedAddress?.postalCode}
            </p>
            <p>Phone: {selectedAddress?.phone}</p>
          </div>
        </div>
      </div>

      {/* Right: Payment Summary */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
          <h2 className="text-lg font-bold text-gray-900 mb-6">
            Payment Summary
          </h2>

          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal</span>
              <span>₹{summary.subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Shipping</span>
              <span className="text-green-600">
                {summary.shipping === 0 ? "Free" : `₹${summary.shipping}`}
              </span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Tax (Included)</span>
              <span>₹0</span>
            </div>
            <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
              <span className="font-bold text-lg text-gray-900">Total</span>
              <span className="font-bold text-xl text-gray-900">
                ₹{summary.total.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Method
            </label>

            {/* COD OPTION */}
            <div
              className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all mb-3 ${
                paymentMethod === "COD"
                  ? "border-blue-600 bg-blue-50 text-blue-800 ring-1 ring-blue-600"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => setPaymentMethod("COD")}
            >
              <div className="w-4 h-4 rounded-full border border-gray-400 flex items-center justify-center">
                {paymentMethod === "COD" && (
                  <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                )}
              </div>
              <CreditCard className="h-5 w-5" />
              <span className="font-medium">Cash on Delivery (COD)</span>
            </div>

            {/* WALLET OPTION */}
            <div
              className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all mb-3 ${
                paymentMethod === "wallet"
                  ? "border-blue-600 bg-blue-50 text-blue-800 ring-1 ring-blue-600"
                  : "border-gray-200 hover:border-gray-300"
              } ${
                walletBalance < summary.total
                  ? "opacity-60 cursor-not-allowed"
                  : ""
              }`}
              onClick={() => {
                if (walletBalance >= summary.total) {
                  setPaymentMethod("wallet");
                }
              }}
            >
              <div className="w-4 h-4 rounded-full border border-gray-400 flex items-center justify-center">
                {paymentMethod === "wallet" && (
                  <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                )}
              </div>
              <div className="flex items-center gap-2 flex-1">
                <div className="p-1 bg-purple-100 rounded text-purple-600">
                  <Archive className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="font-medium">Pay with Wallet</span>
                  <span className="text-xs text-gray-500">
                    Balance: ₹{walletBalance?.toLocaleString() || 0}
                  </span>
                </div>
              </div>
              {walletBalance < summary.total && (
                <span className="text-xs text-red-500 font-medium bg-red-50 px-2 py-1 rounded">
                  Insufficient Balance
                </span>
              )}
            </div>

            {/* PAYPAL OPTION */}
            <div
              className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all ${
                paymentMethod === "PayPal"
                  ? "border-blue-600 bg-blue-50 text-blue-800 ring-1 ring-blue-600"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => setPaymentMethod("PayPal")}
            >
              <div className="w-4 h-4 rounded-full border border-gray-400 flex items-center justify-center">
                {paymentMethod === "PayPal" && (
                  <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                )}
              </div>
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg"
                alt="PayPal"
                className="h-5 w-auto"
              />
              <span className="font-medium">PayPal or Credit Card</span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {paymentMethod === "COD" || paymentMethod === "wallet" ? (
              <button
                onClick={handlePlaceOrder}
                disabled={isProcessing}
                className="w-full bg-gray-900 text-white py-3.5 rounded-lg font-bold hover:bg-gray-800 transition-all shadow-lg shadow-gray-900/10 flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isProcessing
                  ? "Processing..."
                  : `Place Order ${
                      paymentMethod === "COD"
                        ? "(COD)"
                        : paymentMethod === "wallet"
                          ? "(Wallet)"
                          : ""
                    }`}
              </button>
            ) : (
              <div className="w-full relative z-0">
                {paypalClientId && (
                  <PayPalScriptProvider
                    options={{ "client-id": paypalClientId, currency: "USD" }}
                  >
                    <PayPalButtons
                      createOrder={createPaypalOrder}
                      onApprove={onApprove}
                      onError={(err) => {
                        console.error("PayPal Error:", err);

                        if (
                          paypalValidationFailedRef &&
                          !paypalValidationFailedRef.current
                        ) {
                          showModal({
                            type: "error",
                            title: "PayPal Payment Failed",
                            message:
                              "There was an issue processing your PayPal payment.",
                          });
                        }
                        if (paypalValidationFailedRef) {
                          paypalValidationFailedRef.current = false; // Reset
                        }
                      }}
                      style={{ layout: "horizontal" }}
                    />
                  </PayPalScriptProvider>
                )}
              </div>
            )}

            <button
              onClick={onBack}
              disabled={isProcessing}
              className="w-full text-gray-600 text-sm font-medium hover:text-gray-900"
            >
              Back to Address
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
