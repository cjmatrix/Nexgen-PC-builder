import React, { useRef } from "react";
import ReactDOM from "react-dom";
import { Transition } from "react-transition-group";
import { useForm } from "react-hook-form";
import { X, MapPin, Phone, User, Home, Building, Bookmark } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import api from "../../../../../../api/axios";
import { useEffect } from "react";
import { usePopupAnimation } from "../../../../../../hooks/usePopupAnimation";

const AddAddressModal = ({
  isOpen,
  onClose,
  onSubmit,
  isEditMode,
  addressToEdit,
}) => {
  const queryClient = useQueryClient();
  const containerRef = useRef(null);
  const overlayRef = useRef(null);
  const modalRef = useRef(null);

  const { closePopup } = usePopupAnimation({
    isOpen,
    containerRef,
    overlayRef,
    modalRef,
  });

  const onExit = () => {
    closePopup();
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      country: "India",
      type: "Home",
      isDefault: false,
    },
  });

  useEffect(() => {
    if (isOpen && isEditMode && addressToEdit) {
      reset(addressToEdit);
    } else if (isOpen && !isEditMode) {
      reset({
        country: "India",
        type: "Home",
        isDefault: false,
        fullName: "",
        phone: "",
        street: "",
        city: "",
        state: "",
        postalCode: "",
      });
    }
  }, [isOpen, isEditMode, addressToEdit, reset]);

  // const {data:addressData,isError,error}=useQuery({
  //   queryFn: async()=>{
  //      const response=await api.get("/user/address")
  //       console.log(response.data.addresses)
  //      return response.data.addresses

  //   },
  //   queryKey:["userAddress"],
  //   enabled:isEditMode
  // });

  const mutation = useMutation({
    mutationFn: async (newData) => {
      if (isEditMode && addressToEdit) {
        const response = await api.put(
          `user/address/${addressToEdit._id}`,
          newData,
        );
        return response.data;
      } else {
        const response = await api.post("user/address", newData);
        return response.data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["userProfile", "userAddresses"]);
      reset();
      onClose();
    },
    onError: (error) => {
      
    },
  });

  const handleFormSubmit = async (data) => {
    mutation.mutate(data);
  };

  return ReactDOM.createPortal(
    <Transition
      in={isOpen}
      timeout={1000}
      onExit={onExit}
      nodeRef={containerRef}
      unmountOnExit
    >
      <div ref={containerRef}>
        <div
          ref={overlayRef}
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm  overflow-y-auto min-h-dvh opacity-0"
          onClick={() => onClose()}
        >
          <div
            ref={modalRef}
            className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden opacity-0 scale-[0.8] translate-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <MapPin className="text-blue-600" size={24} />
                Add New Address
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <form
              onSubmit={handleSubmit(handleFormSubmit)}
              className="p-6 space-y-6"
            >
              {/* Personal Info Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                    <User size={14} /> Full Name
                  </label>
                  <input
                    type="text"
                    className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-blue-500/20 outline-none transition-all ${
                      errors.fullName
                        ? "border-red-300 focus:border-red-500"
                        : "border-gray-200 focus:border-blue-500"
                    }`}
                    placeholder="John Doe"
                    {...register("fullName", {
                      required: "Full Name is required",
                    })}
                  />
                  {errors.fullName && (
                    <span className="text-xs text-red-500">
                      {errors.fullName.message}
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                    <Phone size={14} /> Phone Number
                  </label>
                  <input
                    type="tel"
                    className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-blue-500/20 outline-none transition-all ${
                      errors.phone
                        ? "border-red-300 focus:border-red-500"
                        : "border-gray-200 focus:border-blue-500"
                    }`}
                    placeholder="+91 9876543210"
                    {...register("phone", {
                      required: "Phone number is required",
                      pattern: {
                        value: /^[0-9+\s-]{10,}$/,
                        message: "Invalid phone number format",
                      },
                    })}
                  />
                  {errors.phone && (
                    <span className="text-xs text-red-500">
                      {errors.phone.message}
                    </span>
                  )}
                </div>
              </div>

              {/* Address Details Section */}
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">
                    Street Address
                  </label>
                  <textarea
                    className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-blue-500/20 outline-none transition-all resize-none ${
                      errors.street
                        ? "border-red-300 focus:border-red-500"
                        : "border-gray-200 focus:border-blue-500"
                    }`}
                    rows="2"
                    placeholder="Enter your street address, apartment, suite, etc."
                    {...register("street", {
                      required: "Street address is required",
                    })}
                  ></textarea>
                  {errors.street && (
                    <span className="text-xs text-red-500">
                      {errors.street.message}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">
                      City
                    </label>
                    <input
                      type="text"
                      className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-blue-500/20 outline-none transition-all ${
                        errors.city
                          ? "border-red-300 focus:border-red-500"
                          : "border-gray-200 focus:border-blue-500"
                      }`}
                      placeholder="City"
                      {...register("city", { required: "City is required" })}
                    />
                    {errors.city && (
                      <span className="text-xs text-red-500">
                        {errors.city.message}
                      </span>
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">
                      State
                    </label>
                    <input
                      type="text"
                      className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-blue-500/20 outline-none transition-all ${
                        errors.state
                          ? "border-red-300 focus:border-red-500"
                          : "border-gray-200 focus:border-blue-500"
                      }`}
                      placeholder="State"
                      {...register("state", { required: "State is required" })}
                    />
                    {errors.state && (
                      <span className="text-xs text-red-500">
                        {errors.state.message}
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">
                      Postal Code
                    </label>
                    <input
                      type="text"
                      className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-blue-500/20 outline-none transition-all ${
                        errors.postalCode
                          ? "border-red-300 focus:border-red-500"
                          : "border-gray-200 focus:border-blue-500"
                      }`}
                      placeholder="ZIP / Postal Code"
                      {...register("postalCode", {
                        required: "Postal Code is required",
                      })}
                    />
                    {errors.postalCode && (
                      <span className="text-xs text-red-500">
                        {errors.postalCode.message}
                      </span>
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">
                      Country
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
                      {...register("country")}
                      readOnly
                    />
                  </div>
                </div>
              </div>

              {/* Preferences Section */}
              <div className="pt-2 border-t border-gray-100 grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 block text-left">
                    Address Type
                  </label>
                  <div className="flex gap-3">
                    {["Home", "Work", "Other"].map((type) => (
                      <label
                        key={type}
                        className="relative flex-1 cursor-pointer group"
                      >
                        <input
                          type="radio"
                          value={type}
                          className="peer sr-only"
                          {...register("type")}
                        />
                        <div className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-gray-200 peer-checked:border-blue-500 peer-checked:bg-blue-50 text-gray-600 peer-checked:text-blue-700 transition-all hover:border-gray-300">
                          {type === "Home" && <Home size={16} />}
                          {type === "Work" && <Building size={16} />}
                          {type === "Other" && <Bookmark size={16} />}
                          <span className="text-sm font-medium">{type}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-start md:justify-end">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        className="peer sr-only"
                        {...register("isDefault")}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </div>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                      Set as default address
                    </span>
                  </label>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 hover:shadow-sm transition-all focus:ring-2 focus:ring-offset-2 focus:ring-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-2.5 rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 text-white font-bold shadow-lg hover:shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isEditMode
                    ? "Update Address"
                    : isSubmitting
                      ? "Saving..."
                      : "Save Address"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Transition>,
    document.body,
  );
};

export default AddAddressModal;
