import React, { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../../api/axios";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Package, CheckCircle2 } from "lucide-react";
import CustomModal from "../../../../components/CustomModal";
import { usePopupAnimation } from "../../../../hooks/usePopupAnimation";

export default function BlacklistComponents() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const containerRef = useRef(null);
  const overlayRef = useRef(null);
  const modalRef = useRef(null);

  const [modal, setModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
    onConfirm: null,
    confirmText: "Confirm",
  });

  usePopupAnimation({
    isOpen: modal.isOpen,
    containerRef,
    overlayRef,
    modalRef,
  });

  const closeModal = () => {
    setModal((prev) => ({ ...prev, isOpen: false }));
  };

 
  const { data: item, isLoading } = useQuery({
    queryKey: ["blacklist", id],
    queryFn: async () => {
      const res = await api.get(`/blacklist/${id}`);
      return res.data;
    },
    enabled: !!id,
  });

  const restoreMutation = useMutation({
    mutationFn: async ({ componentId, quantity }) => {
      const res=await api.post(`/blacklist/${id}/restore`, {
        componentId,
        quantity,
      });

      return res.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(["blacklist", id]);
     
      queryClient.invalidateQueries(["blacklist"]);
      setModal({
        isOpen: true,
        title: "Success",
        message: "Component successfully restored to inventory.",
        type: "success",
        onConfirm: closeModal,
        confirmText: "Close",
      });
    },
    onError: (error) => {
      setModal({
        isOpen: true,
        title: "Error",
        message:
          error.response?.data?.message || "Failed to restore component.",
        type: "error",
        onConfirm: closeModal,
        confirmText: "Close",
      });
    },
  });

  const handleRestoreClick = (comp) => {
    setModal({
      isOpen: true,
      title: "Confirm Restore",
      message: `Are you sure you want to restore ${comp.componentId.name} to inventory? This will increment the stock by ${ item.quantity}.`,
      type: "confirmation",
      confirmText: "Yes, Restore",
      onConfirm: () => {
        restoreMutation.mutate({
          componentId: comp.componentId._id,
          quantity: item.quantity || 1,
        });
        closeModal();
      },
    });
  };

  if (isLoading) return <div className="p-8">Loading...</div>;
  if (!item)
    return <div className="p-8">No blacklist item found (Missing ID).</div>;

  return (
    <div
      ref={containerRef}
      className="p-8 max-w-5xl mx-auto font-sans relative"
    >
      <div
        ref={overlayRef}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 hidden opacity-0"
        onClick={closeModal}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
        <div ref={modalRef} className="pointer-events-auto opacity-0 scale-95">
          <CustomModal
            isOpen={modal.isOpen}
            onClose={closeModal}
            title={modal.title}
            message={modal.message}
            type={modal.type}
            onConfirm={modal.onConfirm}
            confirmText={modal.confirmText}
          />
        </div>
      </div>

      <div className="mb-6">
        <Link
          to="/admin/blacklist"
          className="flex items-center text-gray-500 hover:text-gray-900 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Blacklist
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Inspect Components</h1>
        <p className="text-gray-500 mt-1">
          Review and restore reusable components to inventory from:{" "}
          <span className="font-mono text-gray-700">{item.productName}</span>
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 grid gap-4">
          {item.components && item.components.length > 0 ? (
            item.components.map((comp) => (
              <div
                key={comp.componentId._id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center border border-gray-200 shadow-sm">
                    <Package className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">
                      {comp.componentId.name}
                    </h3>
                    <p className="text-sm text-gray-500 capitalize">
                      {comp.type} • Stock: {comp.componentId.stock}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleRestoreClick(comp)}
                  disabled={restoreMutation.isPending}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {restoreMutation.isPending
                    ? "Restoring..."
                    : "Restore to Stock"}
                </button>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p>All components have been restored or processed.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
