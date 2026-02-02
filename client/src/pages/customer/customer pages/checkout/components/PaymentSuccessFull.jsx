import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  CheckCircle,
  Package,
  ArrowRight,
  ShoppingBag,
  Receipt,
  Copy,
  MapPin,
  Calendar,
  CreditCard,
  Truck,
} from "lucide-react";
import gsap from "gsap";
import { toast } from "react-toastify";

const PaymentSuccessFull = ({ order }) => {
  const containerRef = useRef(null);
  const iconRef = useRef(null);
  const contentRef = useRef(null);
  const gridRef = useRef(null);
  const buttonsRef = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    tl.fromTo(
      containerRef.current,
      { opacity: 0, scale: 0.95 },
      { opacity: 1, scale: 1, duration: 0.5 },
    )
      .fromTo(
        iconRef.current,
        { scale: 0, rotate: -45 },
        { scale: 1, rotate: 0, duration: 0.6, ease: "back.out(1.7)" },
        "-=0.3",
      )
      .fromTo(
        contentRef.current.children,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.1 },
        "-=0.2",
      )
      .fromTo(
        gridRef.current.children,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.15 },
        "-=0.2",
      )
      .fromTo(
        buttonsRef.current.children,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.1 },
        "-=0.2",
      );
  }, []);

  const copyOrderId = () => {
    if (order?.orderId) {
      navigator.clipboard.writeText(order.orderId);
      toast.success("Order ID copied from clipboard!");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return new Date().toLocaleDateString();
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPrice = (price) => {
    return ((price || 0) / 100).toLocaleString("en-IN", {
      maximumFractionDigits: 2,
      style: "currency",
      currency: "INR",
    });
  };

  return (
    <div ref={containerRef} className="max-w-5xl mx-auto pt-8 pb-16 px-4">
      {/* Header Section */}
      <div className="text-center mb-12">
        <div
          ref={iconRef}
          className="w-20 h-20 bg-gradient-to-tr from-green-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-green-500/30 ring-4 ring-green-50"
        >
          <CheckCircle className="h-10 w-10 text-white" strokeWidth={3} />
        </div>

        <div ref={contentRef} className="space-y-3">
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">
            Order Placed Successfully!
          </h1>
          <p className="text-gray-500 text-lg max-w-md mx-auto leading-relaxed">
            Thank you for your purchase. We've received your order and are
            getting it ready for shipment.
          </p>
        </div>
      </div>

      {/* Content Grid */}
      <div
        ref={gridRef}
        className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12"
      >
        {/* Left Col: Order Items */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 overflow-hidden">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-gray-400" />
              Order Items ({order?.orderItems?.length || 0})
            </h3>
            <div className="space-y-6">
              {order?.orderItems?.map((item, idx) => (
                <div key={idx} className="flex gap-4 group">
                  <div className="w-20 h-20 bg-gray-50 rounded-lg overflow-hidden border border-gray-100 shrink-0">
                    <img
                      src={item.image || "https://placehold.co/100"}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-900 truncate pr-4">
                      {item.name}
                    </h4>
                    <p className="text-sm text-gray-500 mb-2">
                      Qty: {item.qty}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900">
                        {formatPrice(item.price)}
                      </span>
                      {item.discount > 0 && (
                        <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                          {item.discount}% OFF
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Price Breakdown */}
            <div className="mt-8 pt-6 border-t border-gray-100 space-y-3">
              <div className="flex justify-between text-gray-600 text-sm">
                <span>Subtotal</span>
                <span>{formatPrice(order?.itemsPrice)}</span>
              </div>
              <div className="flex justify-between text-gray-600 text-sm">
                <span>Shipping</span>
                <span>{formatPrice(order?.shippingPrice)}</span>
              </div>
              <div className="flex justify-between text-gray-900 font-bold text-lg pt-2 border-t border-gray-100 mt-2">
                <span>Total Paid</span>
                <span className="text-blue-600">
                  {formatPrice(order?.totalPrice)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Details Sidebar */}
        <div className="space-y-6">
          {/* Order Info Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-500" />
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Receipt className="w-4 h-4" /> Order Summary
            </h3>

            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-400 font-medium mb-1">
                  Order ID
                </p>
                <div
                  onClick={copyOrderId}
                  className="flex items-center gap-2 group cursor-pointer"
                >
                  <span className="font-mono font-bold text-gray-900 bg-gray-50 px-2.5 py-1 rounded border border-gray-200 group-hover:bg-blue-50 group-hover:border-blue-200 transition-colors text-sm">
                    {order?.orderId || "..."}
                  </span>
                  <Copy className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-400 font-medium mb-1">Date</p>
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  {formatDate(order?.createdAt)}
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-400 font-medium mb-1">
                  Payment Method
                </p>
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                  <CreditCard className="w-4 h-4 text-gray-400" />
                  {order?.paymentMethod}
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-400 font-medium mb-1">Status</p>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide inline-flex items-center gap-1.5 ${
                    order?.isPaid || order?.paymentMethod === "wallet"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${order?.isPaid || order?.paymentMethod === "wallet" ? "bg-green-500" : "bg-yellow-500"}`}
                  />
                  {order?.status || "Pending"}
                </span>
              </div>
            </div>
          </div>

          {/* Shipping Address Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4" /> Shipping To
            </h3>
            <div className="text-sm text-gray-600 leading-relaxed">
              <p className="font-bold text-gray-900 mb-1">
                {order?.shippingAddress?.fullName}
              </p>
              <p>{order?.shippingAddress?.address}</p>
              <p>
                {order?.shippingAddress?.city},{" "}
                {order?.shippingAddress?.postalCode}
              </p>
              <p className="mb-2">{order?.shippingAddress?.country}</p>
              <p className="flex items-center gap-2 text-gray-500 mt-2 pt-2 border-t border-gray-50">
                <span className="w-4 h-4 flex items-center justify-center bg-gray-100 rounded-full text-[10px]">
                  📞
                </span>
                {order?.shippingAddress?.phone}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div
        ref={buttonsRef}
        className="flex flex-col sm:flex-row justify-center gap-4"
      >
        <Link
          to="/user/orders"
          className="flex items-center justify-center gap-2 bg-white text-gray-900 px-8 py-4 rounded-xl font-bold border-2 border-gray-200 hover:border-gray-900 hover:bg-gray-50 transition-all duration-300 group shadow-sm hover:shadow-md"
        >
          <Package className="w-5 h-5 text-gray-500 group-hover:text-gray-900 transition-colors" />
          Go to My Orders
        </Link>
        <Link
          to="/products"
          className="flex items-center justify-center gap-2 bg-gray-900 text-white px-8 py-4 rounded-xl font-bold hover:bg-gray-800 hover:shadow-xl hover:shadow-gray-900/20 transform hover:-translate-y-0.5 transition-all duration-300"
        >
          <ShoppingBag className="w-5 h-5" />
          Continue Shopping <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    </div>
  );
};

export default PaymentSuccessFull;
