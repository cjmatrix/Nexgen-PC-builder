import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle,
  Truck,
  CreditCard,
  ChevronRight,
  Plus,
  Archive,
  MapPin,
} from "lucide-react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import api from "../../api/axios";
import { fetchCart } from "../../store/slices/cartSlice";
import AddAddressModal from "./user profile/components/AddAddressModal";
import PaymentSuccessFull from "./PaymentSuccessFull";
import CustomModal from "../../components/CustomModal";

const Checkout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const {
    items,
    summary,
    loading: cartLoading,
  } = useSelector((state) => state.cart);

  const [step, setStep] = useState(1);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [paypalClientId, setPaypalClientId] = useState("");
  const [walletBalance, setWalletBalance] = useState(0);
  const isSubmittingRef = useRef(false);
  const paypalValidationFailed = useRef(false);

  const [exchangeRate, setExchangeRate] = useState(0.011);

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const res = await api.get("/wallet");
        console.log(res.data);
        setWalletBalance(res?.data?.data.balance / 100);
      } catch (error) {
        console.error("Failed to fetch wallet balance", error);
      }
    };
    fetchWallet();
  }, []);

  useEffect(() => {
  const fetchConfig = async () => {
    try {
     
      const { data } = await api.get("/payment/config");
      if (data.rate) setExchangeRate(data.rate);
    } catch (error) {
      console.error("Failed to load currency config");
    }
  };
  fetchConfig();
  }, []);

  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    type: "info",
    title: "",
    message: "",
    onConfirm: undefined,
    confirmText: "OK",
    cancelText: "Cancel",
  });

  const showModal = ({
    type = "info",
    title,
    message,
    onConfirm,
    confirmText = "OK",
    cancelText = "Cancel",
  }) => {
    setModalConfig({
      isOpen: true,
      type,
      title,
      message,
      onConfirm,
      confirmText,
      cancelText,
    });
  };

  const closeModal = () => {
    setModalConfig((prev) => ({ ...prev, isOpen: false }));
  };

  useEffect(() => {
    const getPaypalConfig = async () => {
      try {
        const { data } = await api.get("/payment/paypal/config");
        setPaypalClientId(data.clientId);
      } catch (error) {
        console.error("Failed to load PayPal config", error);
      }
    };
    getPaypalConfig();
  }, []);

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  const { data: addresses, isLoading: isAddressLoading } = useQuery({
    queryKey: ["userAddresses"],
    queryFn: async () => {
      const response = await api.get("/user/address");
      return response.data.addresses;
    },
  });

  const createOrderMutation = useMutation({
    mutationFn: async (orderData) => {
      const response = await api.post("/orders", orderData);
      return response.data;
    },
    onError: (error) => {
      showModal({
        type: "error",
        title: "Order Failed",
        message: error.response?.data?.message || "Failed to place order",
      });
      setIsProcessing(false);
      isSubmittingRef.current = false;
    },
  });

  const handlePlaceOrder = async () => {
    if (isSubmittingRef.current) return;

    try {
      const response = await api.get("/cart/validate");
    } catch (error) {
      setModalConfig({
        isOpen: true,
        type: "error",
        title: "Checkout Failed",
        message: error.response?.data?.message || "Something went wrong",
      });
      return;
    }

    if (!selectedAddress) {
      return showModal({
        type: "confirmation",
        title: "Address Required",
        message: "Please select a shipping address to continue.",
        confirmText: "Add Address",
        onConfirm: () => setIsAddressModalOpen(true),
      });
    }

    isSubmittingRef.current = true;
    setIsProcessing(true);

    const orderData = {
      shippingAddress: {
        fullName: selectedAddress.fullName,
        address: selectedAddress.street,
        city: selectedAddress.city,
        postalCode: selectedAddress.postalCode,
        country: selectedAddress.country,
        phone: selectedAddress.phone,
      },
      paymentMethod: paymentMethod,
      taxPrice: 0,
      shippingPrice: summary.shipping,
      totalPrice: summary.total,
    };

    createOrderMutation.mutate(
      { ...orderData, paymentMethod: paymentMethod },
      {
        onSuccess: () => {
          setStep(3);
          dispatch(fetchCart());
        },
      }
    );
  };

  const onApprove = async (data, actions) => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setIsProcessing(true);
    let orderId = undefined;
    try {
      const details = await actions.order.capture();

      const orderData = {
        shippingAddress: {
          fullName: selectedAddress.fullName,
          address: selectedAddress.street,
          city: selectedAddress.city,
          postalCode: selectedAddress.postalCode,
          country: selectedAddress.country,
          phone: selectedAddress.phone,
        },
        paymentMethod: "PayPal",
        taxPrice: 0,
        shippingPrice: summary.shipping,
        totalPrice: summary.total,
        isPaid: false,
        paymentResult: {
          id: details.id,
          status: details.status,
          update_time: details.update_time,
          email_address: details.payer.email_address,
        },
      };

      const createdOrder = await createOrderMutation.mutateAsync(orderData);
      if (createdOrder) {
        orderId = createdOrder._id;
      } else {
        return showModal({
          type: "error",
          title: "Order Creation Failed",
          message:
            "Order could not be created internally. Please contact support.",
        });
      }

      const verifyResponse = await api.post("/payment/paypal/verify", {
        r_orderID: details.id,
        db_orderID: createdOrder._id,
      });

      if (verifyResponse.data.verified) {
        setStep(3);
        dispatch(fetchCart());
      } else {
        showModal({
          type: "error",
          title: "Verification Failed",
          message:
            "Payment was captured but server verification failed. Please check your order status.",
          confirmText: "Check Order",
          onConfirm: () => navigate(`/payment/retry/${orderId}`),
        });
      }
    } catch (err) {
      console.error("Payment Error:", err);

      isSubmittingRef.current = false;
      setIsProcessing(false);

      const msg = err.response?.data?.message || "Payment processing failed";

      showModal({
        type: "error",
        title: "Payment Error",
        message: msg,
        confirmText: orderId ? "Retry Payment" : "OK",
        onConfirm: orderId
          ? () => navigate(`/payment/retry/${orderId}`)
          : undefined,
      });
    }
  };

  const createPaypalOrder = async (data, actions) => {
    paypalValidationFailed.current = false;
    try {
      const response = await api.get("/cart/validate");
    } catch (error) {
      console.log("Validation failed");
      paypalValidationFailed.current = true;
      setModalConfig({
        isOpen: true,
        type: "error",
        title: "Checkout Failed",
        message: error.response?.data?.message || "Something went wrong",
      });
      throw error;
    }

    const totalInRupees = summary.total;
     const currentRate = exchangeRate || 0.011; 
    const totalInUsd = (totalInRupees * currentRate).toFixed(2);

    return actions.order.create({
       purchase_units: [
        {
          description: "PC Order",
          amount: {
            value: totalInUsd, // NOW SENDING USD VALUE
            currency_code: "USD"
          },
        },
      ],
    });
  };

  useEffect(() => {
    if (addresses && addresses.length > 0 && !selectedAddress) {
      const defaultAddr = addresses.find((a) => a.isDefault);
      if (defaultAddr) setSelectedAddress(defaultAddr);
    }
  }, [addresses, selectedAddress]);

  if (cartLoading || isAddressLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center pt-20">
        Loading Checkout...
      </div>
    );
  }

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">
          Select Shipping Address
        </h2>
        <button
          onClick={() => setIsAddressModalOpen(true)}
          className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          <Plus className="h-4 w-4" /> Add New Address
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {addresses?.map((addr) => {
          return (
            <div
              key={addr._id}
              onClick={() => setSelectedAddress(addr)}
              className={`cursor-pointer border rounded-xl p-4 transition-all ${
                selectedAddress?._id === addr._id
                  ? "border-blue-600 bg-blue-50 ring-1 ring-blue-600"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="font-bold text-gray-900">{addr.fullName}</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-gray-200 text-gray-700">
                  {addr.type}
                </span>
              </div>
              <div className="text-sm text-gray-600 space-y-0.5">
                <p>{addr.street}</p>
                <p>
                  {addr.city}, {addr.state} {addr.postalCode}
                </p>
                <p>{addr.country}</p>
                <p className="mt-2 text-gray-500">{addr.phone}</p>
              </div>
            </div>
          );
        })}

        {(!addresses || addresses.length === 0) && (
          <div className="col-span-full py-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-300">
            <p className="text-gray-500 mb-2">No addresses saved.</p>
            <button
              onClick={() => setIsAddressModalOpen(true)}
              className="text-blue-600 font-medium hover:underline"
            >
              Add your first address
            </button>
          </div>
        )}
      </div>

      <div className="flex justify-end pt-6">
        <button
          onClick={() => setStep(2)}
          disabled={!selectedAddress}
          className="bg-gray-900 text-white px-8 py-3 rounded-lg font-bold hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          Continue to Summary <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  const renderStep2 = () => (
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
            {/* WALLET OPTION */}
            <div
              className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all ${
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

                        if (!paypalValidationFailed.current) {
                          showModal({
                            type: "error",
                            title: "PayPal Payment Failed",
                            message:
                              "There was an issue processing your PayPal payment.",
                          });
                        }
                        paypalValidationFailed.current = false; // Reset
                      }}
                      style={{ layout: "horizontal" }}
                    />
                  </PayPalScriptProvider>
                )}
              </div>
            )}

            <button
              onClick={() => setStep(1)}
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

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {step < 3 && (
          <div className="flex justify-center mb-12">
            <div className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  step >= 1
                    ? "bg-gray-900 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                1
              </div>
              <span
                className={`ml-3 font-medium ${
                  step >= 1 ? "text-gray-900" : "text-gray-500"
                }`}
              >
                Address
              </span>
            </div>
            <div className="w-20 h-1 bg-gray-200 mx-4 relative">
              <div
                className={`absolute top-0 left-0 h-full bg-gray-900 transition-all duration-300 ${
                  step >= 2 ? "w-full" : "w-0"
                }`}
              ></div>
            </div>
            <div className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  step >= 2
                    ? "bg-gray-900 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                2
              </div>
              <span
                className={`ml-3 font-medium ${
                  step >= 2 ? "text-gray-900" : "text-gray-500"
                }`}
              >
                Summary
              </span>
            </div>
            <div className="w-20 h-1 bg-gray-200 mx-4 relative">
              <div
                className={`absolute top-0 left-0 h-full bg-gray-900 transition-all duration-300 ${
                  step >= 3 ? "w-full" : "w-0"
                }`}
              ></div>
            </div>
            <div className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  step >= 3
                    ? "bg-gray-900 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                3
              </div>
              <span
                className={`ml-3 font-medium ${
                  step >= 3 ? "text-gray-900" : "text-gray-500"
                }`}
              >
                Done
              </span>
            </div>
          </div>
        )}

        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && <PaymentSuccessFull />}
      </div>

      <AddAddressModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        onSubmit={() => {
          setIsAddressModalOpen(false);
          queryClient.invalidateQueries(["userAddresses"]);
        }}
        isEditMode={false}
      />

      <CustomModal
        isOpen={modalConfig.isOpen}
        onClose={closeModal}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        onConfirm={modalConfig.onConfirm}
        confirmText={modalConfig.confirmText}
        cancelText={modalConfig.cancelText}
      />
    </div>
  );
};

export default Checkout;
