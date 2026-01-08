import React, { useRef, useState } from "react";
import { X, Package, User, MapPin, Monitor } from "lucide-react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import api from "../../../api/axios";
import CustomModal from "../../../components/CustomModal";

const OrderDetailsModal = ({ isOpen, onClose, order: initialOrder }) => {
  const queryClient = useQueryClient();
  const modalRef = useRef(null);
  const [currentStatus, setCurrentStatus] = useState("");

  const [modal, setModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
    onConfirm: null,
  });

  const [returnConfig, setReturnConfig] = useState({
    isOpen: false,
    itemId: null,
    reason: "",
    blacklisted: false,
  });

  const closeModal = () => {
    setModal((prev) => ({ ...prev, isOpen: false }));
  };

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
      setModal({
        isOpen: true,
        title: "Error",
        message: err.response?.data?.message || "Failed to update status",
        type: "error",
      });
    },
  });

  const handleStatusChange = (newStatus) => {
    if (!order) return;
    setModal({
      isOpen: true,
      title: "Confirm Action",
      message: `Are you sure you want to change status to ${newStatus}?`,
      type: "confirmation",
      onConfirm: () =>
        updateStatusMutation.mutate({ id: order._id, status: newStatus }),
    });
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
      setModal({
        isOpen: true,
        title: "Error",
        message: err.response?.data?.message || "Failed to update status",
        type: "error",
      });
    },
  });

  const approveReturnMutation = useMutation({
    mutationFn: async ({ itemId, addToBlacklist }) => {
      const response = await api.put(`/orders/${order._id}/return/approve`, {
        itemId,
        addToBlacklist,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["adminOrders"]);
      queryClient.invalidateQueries(["order", order._id]);
      setModal({
        isOpen: true,
        title: "Success",
        message: "Return approved successfully",
        type: "success",
      });
    },
    onError: (err) => {
      setModal({
        isOpen: true,
        title: "Error",
        message: err.response?.data?.message || "Failed to approve return",
        type: "error",
      });
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
      setModal({
        isOpen: true,
        title: "Success",
        message: "Return rejected successfully",
        type: "success",
      });
    },
    onError: (err) => {
      setModal({
        isOpen: true,
        title: "Error",
        message: err.response?.data?.message || "Failed to reject return",
        type: "error",
      });
    },
  });

  const handleItemCancel = (itemId) => {
    setModal({
      isOpen: true,
      title: "Confirm Cancellation",
      message: itemId
        ? "Are you sure you want to cancel this item?"
        : "Are you sure you want to cancel the entire order?",
      type: "confirmation",
      confirmText: "Yes, Cancel",
      onConfirm: () => cancelItemOrderMuation.mutate({ itemId }),
    });
  };

  const confirmApproveReturn = (item) => {
    setReturnConfig({
      isOpen: true,
      itemId: item._id,
      reason: item.returnReason,
      blacklisted: false,
    });
  };

  const handleReturnApprove = () => {
    approveReturnMutation.mutate({
      itemId: returnConfig.itemId,
      addToBlacklist: returnConfig.blacklisted,
    });
    setReturnConfig({
      isOpen: false,
      itemId: null,
      reason: "",
      blacklisted: false,
    });
  };

  const confirmRejectReturn = (itemId) => {
    setModal({
      isOpen: true,
      title: "Confirm Return Rejection",
      message: "Are you sure you want to reject this return request?",
      type: "confirmation",
      confirmText: "Reject Return",
      onConfirm: () => rejectReturnMutation.mutate({ itemId }),
    });
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
      <CustomModal
        isOpen={modal.isOpen}
        onClose={closeModal}
        onConfirm={modal.onConfirm}
        title={modal.title}
        message={modal.message}
        type={modal.type}
      />

      {/* Return Approval Modal */}
      {returnConfig.isOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-in zoom-in-95">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Approve Return Request
            </h3>

            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 mb-4">
              <p className="text-xs text-gray-500 font-semibold uppercase mb-1">
                Return Reason
              </p>
              <p className="text-gray-800">
                {returnConfig.reason || "No reason provided"}
              </p>
            </div>

            <div className="flex items-center gap-3 mb-6 p-3 border border-red-100 bg-red-50 rounded-lg">
              <input
                type="checkbox"
                id="blacklist"
                checked={returnConfig.blacklisted}
                onChange={(e) =>
                  setReturnConfig((prev) => ({
                    ...prev,
                    blacklisted: e.target.checked,
                  }))
                }
                className="w-5 h-5 rounded border-gray-300 text-red-600 focus:ring-red-500"
              />
              <label
                htmlFor="blacklist"
                className="text-sm font-medium text-gray-900 cursor-pointer select-none"
              >
                Add to Blacklist (Damaged/Defective)
                <span className="block text-xs text-gray-500 font-normal mt-0.5">
                  Item will NOT return to inventory.
                </span>
              </label>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() =>
                  setReturnConfig({
                    isOpen: false,
                    itemId: null,
                    reason: "",
                    blacklisted: false,
                  })
                }
                className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleReturnApprove}
                className="px-4 py-2 bg-green-600 text-white font-medium hover:bg-green-700 rounded-lg shadow-sm"
              >
                Confirm Approval
              </button>
            </div>
          </div>
        </div>
      )}

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
                        <div className="text-right">
                          <p className="font-bold text-gray-900 text-lg">
                            ₹
                            {(
                              (item.price *
                                item.qty *
                                (1 - (item.discount || 0) / 100)) /
                              100
                            ).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 mb-4">
                        Qty: {item.qty} | Price:{" "}
                        {item.discount > 0 ? (
                          <span>
                            <span className="line-through mr-1 text-gray-400">
                              ₹{(item.price / 100).toLocaleString()}
                            </span>
                            <span className="text-green-600 font-bold">
                              ₹
                              {(
                                (item.price * (1 - item.discount / 100)) /
                                100
                              ).toLocaleString()}
                            </span>{" "}
                            <span className="ml-1 text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">
                              {item.discount}% OFF
                            </span>
                          </span>
                        ) : (
                          <span>₹{(item.price / 100).toLocaleString()}</span>
                        )}
                      </p>

                      {/* Display Return Reason if available */}
                      {item.returnReason && (
                        <div className="mb-4 bg-orange-50 border border-orange-100 p-3 rounded-lg">
                          <p className="text-xs text-orange-600 font-bold uppercase mb-1">
                            Return Reason:
                          </p>
                          <p className="text-sm text-gray-800">
                            {item.returnReason}
                          </p>
                        </div>
                      )}
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
                            onClick={() => confirmApproveReturn(item)}
                            className="text-sm font-medium text-green-600 hover:text-green-700 hover:bg-green-50 px-3 py-1.5 rounded-lg border border-green-200 transition-colors"
                          >
                            Approve Return
                          </button>
                          <button
                            onClick={() => confirmRejectReturn(item._id)}
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
