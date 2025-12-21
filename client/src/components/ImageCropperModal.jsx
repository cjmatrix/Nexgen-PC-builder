import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { X, ZoomIn, Check } from "lucide-react";
import getCroppedImg from "../utils/cropUtils";

const ImageCropperModal = ({
  isOpen,
  onClose,
  imageSrc,
  onCropConfirm,
  aspect = 1,
}) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSave = async () => {
    try {
      setIsProcessing(true);
      const croppedImageBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      await onCropConfirm(croppedImageBlob);
      setIsProcessing(false);
      onClose();
    } catch (e) {
      console.error(e);
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[80vh]">
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
          <h3 className="font-bold text-lg text-gray-800">Adjust Image</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800"
          >
            <X size={24} />
          </button>
        </div>

        <div className="relative flex-1 bg-gray-900">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
          />
        </div>

        <div className="p-6 bg-white border-t space-y-4">
          <div className="flex items-center gap-4">
            <ZoomIn className="text-gray-400" size={20} />
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              aria-labelledby="Zoom"
              onChange={(e) => setZoom(e.target.value)}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isProcessing}
              className="px-6 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition flex items-center gap-2"
            >
              {isProcessing ? (
                <span>Processing...</span>
              ) : (
                <>
                  <Check size={18} /> Apply & Upload
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageCropperModal;
