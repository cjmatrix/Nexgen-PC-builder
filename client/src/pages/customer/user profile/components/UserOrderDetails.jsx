import React, { useState } from "react";
import {
  X,
  CornerUpLeft,
  Ban,
  Package,
  AlertTriangle,
  Eye,
} from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../../api/axios";
import ItemDetailsModal from "./ItemDetailsModal";
import CustomModal from "../../../../components/CustomModal";

const UserOrderDetails = ({ isOpen, onClose, order }) => {
  const queryClient = useQueryClient();
  const [reason, setReason] = useState("");
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [actionType, setActionType] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  const [viewDetailItem, setViewDetailItem] = useState(null);
  const [isItemDetailsOpen, setIsItemDetailsOpen] = useState(false);

  const [infoModal, setInfoModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
    onConfirm: null,
  });

  const closeInfoModal = () => {
    setInfoModal((prev) => ({ ...prev, isOpen: false }));
    if (infoModal.onConfirm) infoModal.onConfirm();
  };

  const returnMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.put(`/orders/${order?._id}/return`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["myOrders"]);
      handleCloseAction();
      setInfoModal({
        isOpen: true,
        title: "Success",
        message: "Return requested successfully. Waiting for admin approval.",
        type: "success",
        onConfirm: onClose,
      });
    },
    onError: (err) => {
      setInfoModal({
        isOpen: true,
        title: "Return Failed",
        message: err.response?.data?.message || "Return failed",
        type: "error",
      });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.put(`/orders/${order?._id}/cancel`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["myOrders"]);
      handleCloseAction();
      setInfoModal({
        isOpen: true,
        title: "Success",
        message: "Cancellation processed successfully",
        type: "success",
        onConfirm: onClose,
      });
    },
    onError: (err) => {
      setInfoModal({
        isOpen: true,
        title: "Cancellation Failed",
        message: err.response?.data?.message || "Cancellation failed",
        type: "error",
      });
    },
  });

  if (!isOpen || !order) return null;

  const handleActionClick = (type, item = null) => {
    setActionType(type);
    setSelectedItem(item);
    setReason("");
    setIsActionModalOpen(true);
  };

  const handleCloseAction = () => {
    setIsActionModalOpen(false);
    setReason("");
    setSelectedItem(null);
    setActionType(null);
  };

  const handleSubmitAction = () => {
    setIsActionModalOpen(false);
    if (!reason.trim()) {
      setInfoModal({
        isOpen: true,
        title: "Action Required",
        message: "Please provide a reason.",
        type: "info",
      });
      return;
    }
    
    const payload = {
      reason,
      itemId: selectedItem ? selectedItem._id : undefined,
    };

    if (actionType === "cancel") {
     
      cancelMutation.mutate(payload);
    } else if (actionType === "return") {
      
      returnMutation.mutate(payload);
    }
  };

  const canCancel = (itemStatus) => {
    if (
      order.status === "Delivered" ||
      order.status === "Cancelled" ||
      order.status === "Returned"
    )
      return false;

    if (
      itemStatus &&
      (itemStatus === "Cancelled" ||
        itemStatus === "Returned" ||
        itemStatus === "Return Requested" ||
        itemStatus === "Return Approved")
    )
      return false;

    if (!itemStatus) {
      const hasActiveItems = order.orderItems.some(
        (item) =>
          item.status !== "Cancelled" &&
          item.status !== "Returned" &&
          item.status !== "Return Requested" &&
          item.status !== "Return Approved"
      );
      if (!hasActiveItems) return false;
    }

    return true;
  };

  const canReturn = (itemStatus) => {
    if (order.status !== "Delivered") return false;

    if (
      itemStatus &&
      (itemStatus === "Cancelled" ||
        itemStatus === "Returned" ||
        itemStatus === "Return Requested" ||
        itemStatus === "Return Rejected" ||
        itemStatus === "Return Approved")
    )
      return false;

    if (!itemStatus) {
      const hasActiveItems = order.orderItems.some(
        (item) =>
          item.status !== "Cancelled" &&
          item.status !== "Returned" &&
          item.status !== "Return Requested" &&
          item.status !== "Return Approved"
      );
      if (!hasActiveItems) return false;
    }

    return true;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
      <CustomModal
        isOpen={infoModal.isOpen}
        onClose={closeInfoModal}
        title={infoModal.title}
        message={infoModal.message}
        type={infoModal.type}
        confirmText="OK"
      />
      <div
        className={`bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col ${
          isActionModalOpen ? "opacity-50 pointer-events-none" : ""
        }`}
      >
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div>
            <h3 className="font-bold text-lg text-gray-900">
              Order: {order.orderId}
            </h3>
            <p className="text-sm text-gray-500">
              Placed on {new Date(order.createdAt).toLocaleDateString()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="space-y-4">
            {order.orderItems.map((item, idx) => (
              <div
                key={idx}
                className="flex gap-4 p-4 border border-gray-100 rounded-xl hover:border-gray-200 transition-colors cursor-pointer group"
                onClick={() => {
                  setViewDetailItem(item);
                  setIsItemDetailsOpen(true);
                }}
              >
                <div className="w-20 h-20 bg-gray-100 rounded-lg shrink-0 flex items-center justify-center relative overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 object-contain mix-blend-multiply"
                  />
                  <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Eye className="w-6 h-6 text-gray-700" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm group-hover:text-blue-600 transition-colors">
                        {item.name}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">
                        Quantity: {item.qty} |{" "}
                        {item.discount > 0 ? (
                          <span>
                            <span className="line-through mr-1">
                              ₹{(item.price / 100).toLocaleString()}
                            </span>
                            <span className="text-green-600 font-bold">
                              ₹
                              {(
                                (item.price / 100) *
                                (1 - item.discount / 100)
                              ).toLocaleString()}
                            </span>
                          </span>
                        ) : (
                          <span>₹{(item.price / 100).toLocaleString()}</span>
                        )}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900 text-sm">
                        ₹
                        {(
                          (item.price *
                            item.qty *
                            (1 - (item.discount || 0) / 100)) /
                          100
                        ).toLocaleString()}
                      </p>
                      {item.discount > 0 && (
                        <p className="text-[10px] text-green-600 font-bold bg-green-50 px-1.5 py-0.5 rounded-full inline-block mt-1">
                          {item.discount}% OFF
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <span
                      className={`text-xs px-2 py-1 rounded-md font-medium ${
                        item.status === "Cancelled" ||
                        item.status === "Return Rejected"
                          ? "bg-red-50 text-red-600"
                          : item.status === "Returned" ||
                            item.status === "Return Approved"
                          ? "bg-green-50 text-green-600"
                          : item.status === "Return Requested"
                          ? "bg-orange-50 text-orange-600"
                          : "bg-blue-50 text-blue-600"
                      }`}
                    >
                      {item.status || "Active"}
                    </span>

                    <div
                      className="flex gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {canCancel(item.status) && (
                        <button
                          onClick={() => handleActionClick("cancel", item)}
                          className="text-xs text-red-600 hover:text-red-700 font-medium px-2 py-1 hover:bg-red-50 rounded"
                        >
                          Cancel Item
                        </button>
                      )}
                      {canReturn(item.status) && (
                        <button
                          onClick={() => handleActionClick("return", item)}
                          className="text-xs text-orange-600 hover:text-orange-700 font-medium px-2 py-1 hover:bg-orange-50 rounded"
                        >
                          Return Item
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-100 pt-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-500">Subtotal</span>
              <span className="font-medium">
                ₹{(order.itemsPrice / 100).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-500">Shipping</span>
              <span className="font-medium">
                ₹{order.shippingPrice.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-dashed border-gray-200">
              <span>Total</span>
              <span>₹{(order.totalPrice / 100).toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
          {canCancel() && (
            <button
              onClick={() => handleActionClick("cancel")}
              className="px-4 py-2 bg-white border border-red-200 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 transition-colors flex items-center gap-2"
            >
              <Ban className="w-4 h-4" /> Cancel Order
            </button>
          )}
          {canReturn() && (
            <button
              onClick={() => handleActionClick("return")}
              className="px-4 py-2 bg-white border border-orange-200 text-orange-600 text-sm font-medium rounded-lg hover:bg-orange-50 transition-colors flex items-center gap-2"
            >
              <CornerUpLeft className="w-4 h-4" /> Return Order
            </button>
          )}
        </div>
      </div>

      {isActionModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <div className="absolute inset-0" onClick={handleCloseAction}></div>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 relative animate-in zoom-in-95 duration-200 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-2 capitalize">
              {actionType} {selectedItem ? "Item" : "Order"}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Please provide a reason for {actionType}ing this{" "}
              {selectedItem ? "item" : "order"}.
              {actionType === "return"
                ? " This is mandatory."
                : " This is optional but helpful."}
            </p>

            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Type reason here..."
              className="w-full h-24 border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none resize-none mb-4"
            ></textarea>

            <div className="flex justify-end gap-3">
              <button
                onClick={handleCloseAction}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Nevermind
              </button>
              <button
                onClick={handleSubmitAction}
                className={`px-4 py-2 text-sm font-bold text-white rounded-lg shadow-lg transition-all ${
                  actionType === "cancel"
                    ? "bg-red-600 hover:bg-red-700 shadow-red-900/10"
                    : "bg-orange-600 hover:bg-orange-700 shadow-orange-900/10"
                }`}
              >
                Confirm{" "}
                {actionType === "cancel" ? "Cancellation" : "Return Request"}
              </button>
            </div>
          </div>
        </div>
      )}

      <ItemDetailsModal
        isOpen={isItemDetailsOpen}
        onClose={() => setIsItemDetailsOpen(false)}
        item={viewDetailItem}
        order={order}
      />
    </div>
  );
};

export default UserOrderDetails;
