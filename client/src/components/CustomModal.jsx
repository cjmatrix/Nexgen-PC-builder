import React, { useEffect, useRef } from "react";
import { X, AlertTriangle, CheckCircle, Info } from "lucide-react";

const CustomModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = "info",
  confirmText = "Confirm",
  cancelText = "Cancel",
  showCancel = false,
}) => {
  const modalRef = useRef(null);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  let icon = <Info className="w-12 h-12 text-blue-500" />;
  let buttonColor = "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500";
  let iconBg = "bg-blue-100";

  switch (type) {
    case "success":
      icon = <CheckCircle className="w-12 h-12 text-green-500" />;
      buttonColor = "bg-green-600 hover:bg-green-700 focus:ring-green-500";
      iconBg = "bg-green-100";
      break;
    case "error":
      icon = <X className="w-12 h-12 text-red-500" />;
      buttonColor = "bg-red-600 hover:bg-red-700 focus:ring-red-500";
      iconBg = "bg-red-100";
      break;
    case "confirmation":
      icon = <AlertTriangle className="w-12 h-12 text-amber-500" />;
      buttonColor = "bg-amber-600 hover:bg-amber-700 focus:ring-amber-500";
      iconBg = "bg-amber-100";
      break;
    default:
      break;
  }

  const handleBackdropClick = (e) => {
    e.stopPropagation();
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-100 overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        <div className="p-6 text-center">
          <div
            className={`mx-auto flex items-center justify-center w-20 h-20 rounded-full mb-6 ${iconBg}`}
          >
            {icon}
          </div>

          <h3 className="text-2xl font-bold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-500 mb-8 leading-relaxed">{message}</p>

          <div className="flex gap-3 justify-center">
            {(type === "confirmation" || showCancel) && (
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-white text-gray-700 font-semibold border border-gray-300 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:ring-offset-2 transition-all duration-200"
              >
                {cancelText}
              </button>
            )}

            <button
              onClick={() => {
                if (onConfirm) onConfirm();
                onClose();
              }}
              className={`px-8 py-2.5 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${buttonColor}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomModal;
