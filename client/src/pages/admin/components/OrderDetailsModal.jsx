import React, { useRef, useState } from "react";
import { X, Package, User, MapPin, Monitor } from "lucide-react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import api from "../../../api/axios";

const OrderDetailsModal = ({ isOpen, onClose, order: initialOrder }) => {
  const queryClient = useQueryClient();
  const modalRef = useRef(null);
  const [currentStatus, setCurrentStatus] = useState("");

  const { data: order } = useQuery({
    queryKey: ["order", initialOrder?._id],
    queryFn: async () => {
      const response = await api.get(`/orders/${initialOrder._id}`);
      return response.data;
    },
    initialData: initialOrder,
    enabled: !!initialOrder?._id && isOpen,
  });

  const handleBackdropClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      const response = await api.put(`/orders/${id}/status`, { status });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["adminOrders"]);
      queryClient.invalidateQueries(["order", order._id]);
    },
    onError: (err) => {
      alert(err.response?.data?.message || "Failed to update status");
    },
  });

  const handleStatusChange = (newStatus) => {
    if (!order) return;
    if (
      window.confirm(`Are you sure you want to change status to ${newStatus}?`)
    ) {
      updateStatusMutation.mutate({ id: order._id, status: newStatus });
    }
  };

  const cancelItemOrderMuation = useMutation({
    mutationFn: async ({ itemId = undefined }) => {
      const response = await api.put(`/orders/${order._id}/cancel`, {
        itemId,
        reason: "admin cancelled it",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["adminOrders"]);
      queryClient.invalidateQueries(["order", order._id]);
      console.log("successs");
    },
    onError: (err) => {
      alert(err.response?.data?.message || "Failed to update status");
    },
  });

  const approveReturnMutation = useMutation({
    mutationFn: async ({ itemId }) => {
      const response = await api.put(`/orders/${order._id}/return/approve`, {
        itemId,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["adminOrders"]);
      queryClient.invalidateQueries(["order", order._id]);
      alert("Return approved successfully");
    },
    onError: (err) => {
      alert(err.response?.data?.message || "Failed to approve return");
    },
  });

  const rejectReturnMutation = useMutation({
    mutationFn: async ({ itemId }) => {
      const response = await api.put(`/orders/${order._id}/return/reject`, {
        itemId,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["adminOrders"]);
      queryClient.invalidateQueries(["order", order._id]);
      alert("Return rejected successfully");
    },
    onError: (err) => {
      alert(err.response?.data?.message || "Failed to reject return");
    },
  });

  const handleItemCancel = (itemId) => {
    cancelItemOrderMuation.mutate({ itemId });
  };

  if (!isOpen || !order) return null;

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const StatusBadge = ({ status }) => {
    let color = "bg-gray-100 text-gray-800";
    if (status === "Processing") color = "bg-blue-100 text-blue-800";
    if (status === "Shipped") color = "bg-purple-100 text-purple-800";
    if (status === "Delivered") color = "bg-green-100 text-green-800";
    if (status === "Cancelled") color = "bg-red-100 text-red-800";
    if (status === "Return Requested") color = "bg-orange-100 text-orange-800";
    if (status === "Return Approved") color = "bg-green-100 text-green-800";
    if (status === "Return Rejected") color = "bg-red-100 text-red-800";

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${color}`}>
        {status}
      </span>
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
      >
        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Order Details: {order.orderId}
            </h2>
            <p className="text-sm text-gray-500 mt-1">ID: {order._id}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-xs text-gray-500 font-semibold uppercase">
                Order Date
              </p>
              <p className="font-bold text-gray-900 mt-1">
                {formatDate(order.createdAt)}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-xs text-gray-500 font-semibold uppercase">
                Payment Status
              </p>
              <p
                className={`font-bold mt-1 ${
                  order.isPaid ? "text-green-600" : "text-amber-600"
                }`}
              >
                {order.isPaid ? "Paid" : "Pending"}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-xs text-gray-500 font-semibold uppercase">
                Order Status
              </p>
              <div className="mt-1">
                <StatusBadge status={order.status} />
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-xs text-gray-500 font-semibold uppercase">
                Total Amount
              </p>
              <p className="font-bold text-gray-900 mt-1 text-xl">
                ₹{order.totalPrice?.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                <User className="w-5 h-5 text-gray-500" /> Customer Details
              </h3>
              <div className="text-sm text-gray-600 space-y-1 pl-7">
                <p className="font-medium text-gray-900">
                  {order.user?.name || order.shippingAddress.fullName}
                </p>
                <p>{order.user?.email}</p>
                <p>Phone: {order.shippingAddress.phone}</p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-gray-500" /> Shipping Address
              </h3>
              <div className="text-sm text-gray-600 space-y-1 pl-7">
                <p>{order.shippingAddress.address}</p>
                <p>
                  {order.shippingAddress.city},{" "}
                  {order.shippingAddress.postalCode}
                </p>
                <p>{order.shippingAddress.country}</p>
              </div>
            </div>
          </div>

          <hr className="border-gray-100" />

          <div>
            <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2 mb-6">
              <Monitor className="w-5 h-5 text-gray-500" /> Configured PC
              Details
            </h3>

            <div className="grid grid-cols-1 gap-6">
              {order.orderItems.map((item, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-xl overflow-hidden flex flex-col md:flex-row"
                >
                  <div className="bg-gray-100 w-full md:w-48 h-48 flex-shrink-0 flex items-center justify-center">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-32 h-32 object-contain mix-blend-multiply"
                    />
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-gray-900 text-lg">
                          {item.name}
                        </h4>
                        <p className="font-bold text-gray-900 text-lg">
                          ₹{(item.price * item.qty).toLocaleString()}
                        </p>
                      </div>
                      <p className="text-sm text-gray-500 mb-4">
                        Qty: {item.qty} | Price: ₹{item.price.toLocaleString()}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-auto">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-gray-500 uppercase">
                          Item Status:
                        </span>
                        <StatusBadge status={item.status || "Active"} />
                      </div>

                      {item.status !== "Cancelled" &&
                        item.status !== "Return Approved" &&
                        item.status !== "Return Requested" &&
                        order.status !== "Cancelled" &&
                        order.status !== "Return Approved" &&
                        order.status !== "Delivered" && (
                          <button
                            onClick={() => handleItemCancel(item._id)}
                            className="text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg border border-red-200 transition-colors"
                          >
                            Cancel Item
                          </button>
                        )}

                      {item.status === "Return Requested" && (
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              approveReturnMutation.mutate({ itemId: item._id })
                            }
                            className="text-sm font-medium text-green-600 hover:text-green-700 hover:bg-green-50 px-3 py-1.5 rounded-lg border border-green-200 transition-colors"
                          >
                            Approve Return
                          </button>
                          <button
                            onClick={() =>
                              rejectReturnMutation.mutate({ itemId: item._id })
                            }
                            className="text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg border border-red-200 transition-colors"
                          >
                            Reject Return
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 flex justify-between bg-gray-50">
          <div className="flex gap-3">
            <button
              onClick={() => handleItemCancel()}
              disabled={
                order.status === "Cancelled" ||
                order.status === "Delivered" ||
                order.status === "Return Approved"
              }
              className="px-6 py-2.5 rounded-lg border border-red-200 text-red-600 font-medium hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancel Order
            </button>

            <button className="hidden sm:block px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition-colors">
              Generate Invoice
            </button>
          </div>

          <div className="flex gap-3">
            {order.status !== "Delivered" &&
              order.status !== "Cancelled" &&
              order.status !== "Return Approved" && (
                <button
                  onClick={() => {
                    const flow = [
                      "Pending",
                      "Processing",
                      "Shipped",
                      "Out for Delivery",
                      "Delivered",
                    ];
                    const nextIdx = flow.indexOf(order.status) + 1;
                    setCurrentStatus(flow[nextIdx]);
                    if (nextIdx < flow.length)
                      handleStatusChange(flow[nextIdx]);
                  }}
                  className="px-6 py-2.5 rounded-lg bg-gray-900 text-white font-bold hover:bg-gray-800 shadow-lg shadow-gray-900/10 transition-all flex items-center gap-2"
                >
                  {updateStatusMutation.isPending
                    ? "Updating..."
                    : "Next Status"}
                </button>
              )}
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-white bg-white transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;
