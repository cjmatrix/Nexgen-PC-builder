import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../../api/axios";
import { fetchCart } from "../../../../store/slices/cartSlice";
import AddAddressModal from "../user profile/profile/components/AddAddressModal";
import PaymentSuccessFull from "./components/PaymentSuccessFull";
import CustomModal from "../../../../components/CustomModal";
import AddressSelection from "./components/AddressSelection";
import OrderSummary from "./components/OrderSummary";

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

  const [lastOrder, setLastOrder] = useState(null);
  const [exchangeRate, setExchangeRate] = useState(0.011);

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const res = await api.get("/wallet");

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
        onSuccess: (data) => {
       
          setLastOrder(data);
          setStep(3);
          dispatch(fetchCart());
        },
      },
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
        setLastOrder(verifyResponse.data.order);
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
            currency_code: "USD",
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

        {step === 1 && (
          <AddressSelection
            addresses={addresses}
            selectedAddress={selectedAddress}
            setSelectedAddress={setSelectedAddress}
            setIsAddressModalOpen={setIsAddressModalOpen}
            onContinue={() => setStep(2)}
          />
        )}
        {step === 2 && (
          <OrderSummary
            items={items}
            summary={summary}
            selectedAddress={selectedAddress}
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            walletBalance={walletBalance}
            isProcessing={isProcessing}
            handlePlaceOrder={handlePlaceOrder}
            paypalClientId={paypalClientId}
            createPaypalOrder={createPaypalOrder}
            onApprove={onApprove}
            paypalValidationFailedRef={paypalValidationFailed}
            showModal={showModal}
            onBack={() => setStep(1)}
          />
        )}
        {step === 3 && <PaymentSuccessFull order={lastOrder} />}
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
