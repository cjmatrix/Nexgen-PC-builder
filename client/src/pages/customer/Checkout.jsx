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
import api from "../../api/axios";
import { fetchCart } from "../../store/slices/cartSlice";
import AddAddressModal from "./user profile/components/AddAddressModal"; // Adjust path if needed

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
  const isSubmittingRef = useRef(false); // Ref to prevent double-click race conditions

  // Fetch Cart on Mount
  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  // Fetch Addresses
  const { data: addresses, isLoading: isAddressLoading } = useQuery({
    queryKey: ["userAddresses"],
    queryFn: async () => {
      const response = await api.get("/user/address");
      return response.data.addresses;
    },
  });

  // Create Order Mutation
  const createOrderMutation = useMutation({
    mutationFn: async (orderData) => {
      const response = await api.post("/orders", orderData);
      return response.data;
    },
    onSuccess: () => {
      setStep(3); // Go to Success Step
      dispatch(fetchCart()); // Refresh cart (should be empty)
    },
    onError: (error) => {
      alert(error.response?.data?.message || "Failed to place order");
      setIsProcessing(false);
      isSubmittingRef.current = false;
    },
  });

  const handlePlaceOrder = () => {
    if (isSubmittingRef.current) return; // Immediate lock check
    if (!selectedAddress) return alert("Please select a shipping address");

    isSubmittingRef.current = true;
    setIsProcessing(true);

    const orderData = {
      // items are now built by backend from cart source-of-truth
      shippingAddress: {
        fullName: selectedAddress.fullName,
        address: selectedAddress.street, // Map 'street' to 'address' as per Schema
        city: selectedAddress.city,
        postalCode: selectedAddress.postalCode,
        country: selectedAddress.country,
        phone: selectedAddress.phone,
      },
      paymentMethod: "COD",
      taxPrice: 0,
      shippingPrice: summary.shipping,
      totalPrice: summary.total,
    };

    createOrderMutation.mutate(orderData);
  };

  // Auto-select default address
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

  // Step 1: Address Selection
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
        {addresses?.map((addr) => (
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
        ))}

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

  // Step 2: Order Summary
  const renderStep2 = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left: Items Review */}
      <div className="lg:col-span-2 space-y-6">
        <h2 className="text-xl font-bold text-gray-900">Review Items</h2>
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item._id}
              className="flex gap-4 p-4 bg-white border border-gray-100 rounded-xl"
            >
              <div className="h-20 w-20 shrink-0 bg-gray-100 rounded-md overflow-hidden">
                <img
                  src={item.product?.images?.[0] || "https://placehold.co/100"}
                  alt={item.product.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900">{item.product.name}</h3>
                <p className="text-sm text-gray-500 line-clamp-1">
                  {item.product.description}
                </p>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm font-medium text-gray-500">
                    Qty: {item.quantity}
                  </span>
                  <span className="font-bold text-gray-900">
                    ₹
                    {(
                      (item.product.base_price * item.quantity) /
                      100
                    ).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
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

      {/* Right: Payment & Total */}
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
              {/* Note: User plan said Tax is optional/visual. Keeping logic simple for now */}
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
            <div className="flex items-center gap-3 p-3 border border-blue-200 bg-blue-50 rounded-lg text-blue-800">
              <CreditCard className="h-5 w-5" />
              <span className="font-medium">Cash on Delivery (COD)</span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={handlePlaceOrder}
              disabled={isProcessing}
              className="w-full bg-gray-900 text-white py-3.5 rounded-lg font-bold hover:bg-gray-800 transition-all shadow-lg shadow-gray-900/10 flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isProcessing ? "Processing..." : "Place Order"}
            </button>
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

  // Step 3: Success
  const renderStep3 = () => (
    <div className="max-w-xl mx-auto text-center pt-12 pb-20">
      <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="h-10 w-10" />
      </div>
      <h1 className="text-3xl font-extrabold text-gray-900 mb-4">
        Order Placed Successfully!
      </h1>
      <p className="text-gray-600 mb-8 max-w-sm mx-auto">
        Thank you for your purchase. We have received your order and are getting
        it ready for shipment.
      </p>

      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <Link
          to="/products"
          className="bg-gray-900 text-white px-8 py-3 rounded-lg font-bold hover:bg-gray-800 transition-colors"
        >
          Continue Shopping
        </Link>
        {/* 
               // Future Implementation
               <Link to="/orders" className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-bold hover:bg-gray-50 transition-colors">
                  View Order
               </Link> 
               */}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Steps Indicator */}
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
        {step === 3 && renderStep3()}
      </div>

      <AddAddressModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        onSubmit={() => {
          setIsAddressModalOpen(false);
          queryClient.invalidateQueries(["userAddresses"]);
        }}
        isEditMode={false} // Default add mode
      />
    </div>
  );
};

export default Checkout;
