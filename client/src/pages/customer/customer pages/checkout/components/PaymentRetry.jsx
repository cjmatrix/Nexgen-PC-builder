/* client/src/pages/customer/PaymentRetry.jsx */
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import api from "../../../../../api/axios";
import { AlertCircle } from "lucide-react";
import PaymentSuccessFull from "./PaymentSuccessFull";
import CustomModal from "../../../../../components/CustomModal";

const PaymentRetry = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [paypalClientId, setPaypalClientId] = useState("");
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);

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
    const fetchData = async () => {
      try {
        const [configRes, orderRes] = await Promise.all([
          api.get("/payment/paypal/config"),
          api.get(`/orders/${orderId}`),
        ]);
        setPaypalClientId(configRes.data.clientId);
        setOrder(orderRes.data);
      } catch (error) {
        showModal({
          type: "error",
          title: "Error",
          message: "Error fetching order details",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [orderId]);

  const onApprove = async (data, actions) => {
    try {
      const details = await actions.order.capture();

      const verifyResponse = await api.post("/payment/paypal/verify", {
        r_orderID: details.id,
        db_orderID: order._id,
      });

      if (verifyResponse.data.verified) {
        setSuccess(true);
      }
    } catch (err) {
      console.error(err);
      showModal({
        type: "error",
        title: "Payment Failed",
        message: "Payment Failed again. Please try again.",
      });
    }
  };

  const [exchangeRate, setExchangeRate] = useState(0.011);

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

  if (loading) return <div>Loading...</div>;

  if (success) return <PaymentSuccessFull></PaymentSuccessFull>;

  return (
    <div className="max-w-xl mx-auto pt-20 px-4">
      <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-center gap-3 mb-6">
        <AlertCircle />
        <div>
          <h3 className="font-bold">Payment Failed</h3>
          <p className="text-sm">
            Don't worry, your order is saved. Please try paying again.
          </p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow border">
        <h2 className="text-xl font-bold mb-4">Order Summary</h2>
        <div className="flex justify-between mb-6">
          <span>Total Amount:</span>
          <span className="font-bold text-xl">
            ₹{(order.totalPrice / 100).toLocaleString()}
          </span>
        </div>

        {paypalClientId && (
          <PayPalScriptProvider
            options={{ "client-id": paypalClientId, currency: "USD" }}
          >
            <PayPalButtons
              createOrder={(data, actions) => {
                const totalInRupees = order.totalPrice / 100;
                const totalInUsd = (totalInRupees * exchangeRate).toFixed(2);
                return actions.order.create({
                  purchase_units: [
                    {
                      amount: {
                        value: totalInUsd,
                        currency_code: "USD",
                      },
                    },
                  ],
                });
              }}
              onApprove={onApprove}
            />
          </PayPalScriptProvider>
        )}
      </div>

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

export default PaymentRetry;
