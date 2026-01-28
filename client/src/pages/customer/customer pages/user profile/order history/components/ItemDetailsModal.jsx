import React, { useRef } from "react";
import {
  X,
  Calendar,
  MapPin,
  CreditCard,
  Package,
  CheckCircle,
  Wrench,
  Sparkles,
} from "lucide-react";
import { usePopupAnimation } from "../../../../../../hooks/usePopupAnimation";

const ItemDetailsModal = ({ isOpen, onClose, items, order }) => {
  const { components, item } = items;
  const containerRef = useRef(null);
  const overlayRef = useRef(null);
  const modalRef = useRef(null);

  usePopupAnimation({ isOpen, containerRef, overlayRef, modalRef });

  if (!isOpen || Object.values(components).length === 0 || !order) return null;

  const formatPrice = (price) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);

  const getSpecValue = (component) => {
    if (!component) return "N/A";
    return component.name;
  };

  const componentsList = components
    ? [
        { label: "Processor", data: components.cpu },
        { label: "Graphics Card", data: components.gpu },
        { label: "Motherboard", data: components.motherboard },
        { label: "RAM", data: components.ram },
        { label: "Storage", data: components.storage },
        { label: "Cooler", data: components.cooler },
        { label: "Power Supply", data: components.psu },
        { label: "Case", data: components.case },
      ]
    : [];

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
    >
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm opacity-0"
        onClick={onClose}
      ></div>

      <div
        ref={modalRef}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col relative opacity-0 scale-[0.8] translate-y-5"
      >
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-white rounded-lg border border-gray-200 p-1">
              <img
                src={item.image || "https://placehold.co/100"}
                alt={item.name}
                className="w-full h-full object-contain mix-blend-multiply"
              />
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-900 leading-tight flex items-center gap-2 flex-wrap">
                {item.name}
                {item.isCustomBuild && !item.isAiBuild && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-100 text-purple-700 border border-purple-200">
                    <Wrench className="w-3 h-3" /> Custom
                  </span>
                )}
                {item.isAiBuild && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-indigo-100 text-indigo-700 border border-indigo-200">
                    <Sparkles className="w-3 h-3" /> AI Build
                  </span>
                )}
              </h3>
              <p className="text-sm text-gray-500">
                Item ID: <span className="font-mono text-xs">{item._id}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white rounded-full transition-colors text-gray-500 hover:text-gray-900"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Package className="w-4 h-4 text-blue-600" /> Order Info
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order ID</span>
                    <span className="font-medium text-gray-900">
                      {order.orderId}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status</span>
                    <span
                      className={`font-semibold px-2 py-0.5 rounded text-xs ${
                        order.status === "Delivered"
                          ? "bg-green-200 text-green-800"
                          : order.status === "Cancelled"
                            ? "bg-red-200 text-red-800"
                            : "bg-yellow-200 text-yellow-800"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date</span>
                    <span className="font-medium text-gray-900">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Time</span>
                    <span className="font-medium text-gray-900">
                      {new Date(order.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-600" /> Shipping Details
                </h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p className="font-semibold text-gray-900">
                    {order.shippingAddress.fullName}
                  </p>
                  <p>{order.shippingAddress.address}</p>
                  <p>
                    {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                    {order.shippingAddress.postalCode}
                  </p>
                  <p>{order.shippingAddress.country}</p>
                  <p className="mt-2 text-xs text-gray-500">
                    Phone: {order.shippingAddress.phone}
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-gray-600" /> Payment Info
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Method</span>
                    <span className="font-medium text-gray-900">
                      {order.paymentMethod}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Status</span>
                    <span
                      className={`font-semibold px-2 py-0.5 rounded text-xs ${
                        order.isPaid
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {order.isPaid ? "Paid" : "Pending"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2">
              <h4 className="font-bold text-gray-900 mb-4 text-lg flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" /> System
                Specifications
              </h4>

              {componentsList.length > 0 ? (
                <div className="bg-white border rounded-xl overflow-hidden text-sm">
                  {componentsList.map((comp, idx) => (
                    <div
                      key={idx}
                      className={`flex p-4 gap-4 ${
                        idx !== componentsList.length - 1
                          ? "border-b border-gray-100"
                          : ""
                      } hover:bg-gray-50 transition-colors`}
                    >
                      <div className="w-32 shrink-0 text-gray-500 font-medium">
                        {comp.label}
                      </div>
                      <div className="flex-1">
                        {comp.data ? (
                          <div className="flex justify-between items-start gap-4">
                            <div>
                              <p className="font-semibold text-gray-900">
                                {comp.data.name}
                              </p>
                            </div>
                            <span className="font-medium text-gray-900 whitespace-nowrap">
                              {formatPrice(comp.data.price)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">
                            Not selected
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                  <div className="flex p-4 bg-gray-50 border-t border-gray-200 justify-between items-center">
                    <span className="font-bold text-gray-900">Item Total</span>
                    <span className="font-bold text-lg text-gray-900">
                      {formatPrice(
                        (item.price *
                          item.qty *
                          (1 - (item.discount || 0) / 100)) /
                          100,
                      )}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-300">
                  <Package className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">
                    No detailed component specifications available for this
                    item.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemDetailsModal;
