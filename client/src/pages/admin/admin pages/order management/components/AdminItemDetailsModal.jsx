import { useNavigate } from "react-router-dom";
import { useRef } from "react";
import { X, Package, CheckCircle, Wrench, Sparkles, Star } from "lucide-react";
import { usePopupAnimation } from "../../../../../hooks/usePopupAnimation";
const AdminItemDetailsModal = ({ isOpen, onClose, items }) => {
  const { components, item, order } = items;
  const navigate = useNavigate();

  const containerRef = useRef(null);
  const overlayRef = useRef(null);
  const modalRef = useRef(null);

  usePopupAnimation({ isOpen, containerRef, overlayRef, modalRef });

  if (!isOpen || !item) return null;

  const modifiedComponents = Object.fromEntries(
    Object.entries(components).map(([key, value]) => {
    
      const { componentId, ...rest } = value;
      return [key, { _id: componentId, ...rest }];
    }),
  );

  const handleFeatureBuild = () => {
    const productData = {
      name: `Featured: ${item.name}`,
      price: item.price,
      description: "Professionally configured custom build.",
      image: item.image,
      isFeaturedBuild: true,
      buildType: item.isAiBuild ? "ai_featured" : "custom_featured",
      components: modifiedComponents,
      originalOrderId: order._id,
    };
    navigate("/admin/products/create", { state: { prefill: productData } });
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);

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
      onClick={(e) => e.stopPropagation()}
    >
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm opacity-0"
        onClick={onClose}
      ></div>

      <div
        ref={modalRef}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col relative opacity-0 scale-[0.8] translate-y-5"
      >
        {/* Header */}
        <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-gray-100 flex justify-between items-start sm:items-center bg-gray-50">
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
          <div className="flex items-center gap-2">
            {(item.isCustomBuild || item.isAiBuild) && (
              <button
                onClick={handleFeatureBuild}
                className="bg-purple-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 hover:bg-purple-700 text-sm font-medium transition-colors shadow-sm whitespace-nowrap animate-heartbeat"
              >
                <Star className="w-4 h-4" />
                <span className="hidden sm:inline">Feature Build</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-white rounded-full transition-colors text-gray-500 hover:text-gray-900"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <h4 className="font-bold text-gray-900 mb-4 text-lg flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" /> System
            Specifications
          </h4>

          {componentsList.length > 0 ? (
            <div className="bg-white border rounded-xl overflow-hidden text-sm">
              {componentsList.map((comp, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col sm:flex-row p-3 sm:p-4 gap-2 sm:gap-4 ${
                    idx !== componentsList.length - 1
                      ? "border-b border-gray-100"
                      : ""
                  } hover:bg-gray-50 transition-colors`}
                >
                  <div className="w-full sm:w-32 shrink-0 text-gray-500 font-medium text-xs sm:text-sm uppercase sm:normal-case tracking-wide sm:tracking-normal">
                    {comp.label}
                  </div>
                  <div className="flex-1 min-w-0">
                    {comp.data ? (
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-2 sm:gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 mb-2 truncate">
                            {comp.data.name}
                          </p>
                          {comp.data.specs &&
                            Object.keys(comp.data.specs).length > 0 && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 bg-gray-50/50 p-2 sm:p-3 rounded-lg border border-gray-100/50">
                                {Object.entries(comp.data.specs).map(
                                  ([key, value]) => (
                                    <div
                                      key={key}
                                      className="flex items-center gap-2 text-xs"
                                    >
                                      <span className="text-gray-500 font-medium capitalize whitespace-nowrap">
                                        {key.replace(/([A-Z])/g, " $1")}:
                                      </span>
                                      <span className="text-gray-700 font-semibold truncate">
                                        {value}
                                      </span>
                                    </div>
                                  ),
                                )}
                              </div>
                            )}
                        </div>
                        <span className="font-medium text-gray-900 whitespace-nowrap self-end sm:self-start bg-gray-100 sm:bg-transparent px-2 py-1 rounded sm:p-0 text-sm sm:text-base">
                          {formatPrice(comp.data.price / 100)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-400 italic text-sm">
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
                    (item.price * item.qty * (1 - (item.discount || 0) / 100)) /
                      100,
                  )}
                </span>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-300">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">
                No detailed component specifications available for this item.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminItemDetailsModal;
