import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Save } from "lucide-react";
import api from "../../../../api/axios";
import CustomModal from "../../../../components/CustomModal";

const CouponForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditMode = !!id;

  const [modal, setModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
    onConfirm: null,
  });

  const closeModal = () => {
    setModal((prev) => ({ ...prev, isOpen: false }));
  };

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, dirtyFields },
  } = useForm({
    defaultValues: {
      code: "",
      discountType: "percentage",
      discountValue: 0,
      minOrderValue: 0,
      maxDiscountAmount: null,
      expiryDate: "",
      usageLimit: 1000,
    },
  });

  const discountType = watch("discountType");

  const { data } = useQuery({
    queryKey: ["coupon", id],
    queryFn: async () => {
      if (!isEditMode) return null;
      const res = await api.get(`/coupons/${id}`);
      return res.data.coupon;
    },
    enabled: isEditMode,
  });

  useEffect(() => {
    if (data) {
      reset({
        code: data.code,
        discountType: data.discountType,
        discountValue: data.discountValue,
        minOrderValue: data.minOrderValue,
        maxDiscountAmount: data.maxDiscountAmount,
        expiryDate: new Date(data.expiryDate).toISOString().split("T")[0],
        usageLimit: data.usageLimit,
      });
    }
  }, [data, setValue]);

  const createMutation = useMutation({
    mutationFn: (data) => api.post("/coupons", data),
    onSuccess: () => {
      queryClient.invalidateQueries(["adminCoupons"]);
      setModal({
        isOpen: true,
        title: "Success",
        message: "Coupon created successfully",
        type: "success",
        onConfirm: () => navigate("/admin/coupons"),
      });
    },
    onError: (error) => {
      setModal({
        isOpen: true,
        title: "Error",
        message: error.response?.data?.message || "Failed to create coupon",
        type: "error",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data) => api.patch(`/coupons/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["adminCoupons"]);
      setModal({
        isOpen: true,
        title: "Success",
        message: "Coupon updated successfully",
        type: "success",
        onConfirm: () => navigate("/admin/coupons"),
      });
    },
    onError: (error) => {
      setModal({
        isOpen: true,
        title: "Error",
        message: error.response?.data?.message || "Failed to update coupon",
        type: "error",
      });
    },
  });

  const onSubmit = (formData) => {
    if (isEditMode) {
      const changedData = Object.fromEntries(
        Object.keys(dirtyFields).map((key) => [key, formData[key]]),
      );
      console.log(changedData.length);
      if (Object.keys(changedData).length === 0) {
        return setModal({
          isOpen: true,
          title: "Warning",
          message: "Nothing changed yet",
          type: "warning",
        });
      }

      updateMutation.mutate(changedData);
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-10 pb-12 px-4 sm:px-6 lg:px-8 font-sans">
      <CustomModal
        isOpen={modal.isOpen}
        onClose={closeModal}
        onConfirm={modal.onConfirm}
        title={modal.title}
        message={modal.message}
        type={modal.type}
      />
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-200 rounded-full"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditMode ? "Edit Coupon" : "Create New Coupon"}
          </h1>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Coupon Code
              </label>
              <input
                type="text"
                className={`w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 uppercase ${
                  errors.code ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="e.g. SUMMER25"
                {...register("code", { required: "Coupon Code is required" })}
              />
              {errors.code && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.code.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Discount Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Discount Type
                </label>
                <select
                  className="w-full p-3 border bg-white border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  {...register("discountType")}
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (₹)</option>
                </select>
              </div>

              {/* Discount Value */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Discount Value
                </label>
                <input
                  type="number"
                  min="0"
                  className={`w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.discountValue ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="e.g. 10 or 500"
                  {...register("discountValue", {
                    required: "Value is required",
                    min: { value: 0, message: "Must be positive" },
                    validate: (value) => {
                      if (discountType === "percentage" && value > 100)
                        return "Percentage cannot exceed 100%";

                      const minOrder = watch("minOrderValue");
                      if (
                        discountType === "fixed" &&
                        minOrder &&
                        Number(value) >= Number(minOrder)
                      ) {
                        return "Fixed discount must be less than Minimum Order Value";
                      }

                      return true;
                    },
                  })}
                />
                {errors.discountValue && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.discountValue.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Expiry Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expiry Date
                </label>
                <input
                  type="date"
                  className={`w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.expiryDate ? "border-red-500" : "border-gray-300"
                  }`}
                  {...register("expiryDate", {
                    required: "Expiry Date is required",
                  })}
                />
                {errors.expiryDate && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.expiryDate.message}
                  </p>
                )}
              </div>

              {/* Usage Limit */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Usage Limit
                </label>
                <input
                  type="number"
                  className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Total allowed uses"
                  {...register("usageLimit", {
                    min: { value: 1, message: "At least 1" },
                  })}
                />
              </div>
            </div>

            {/* Min Order Value */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Order Value (₹)
              </label>
              <input
                type="number"
                min="0"
                className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. 1000"
                {...register("minOrderValue")}
              />
              <p className="text-xs text-gray-500 mt-1">
                Optional: Apply this coupon only for orders above this amount.
              </p>
            </div>

            {/* Max Discount Amount (Only for Percentage) */}
            {discountType === "percentage" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Maximum Discount Amount (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. 2000"
                  {...register("maxDiscountAmount")}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Optional: Cap the maximum discount value for percentage
                  coupons.
                </p>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <Save size={20} />
              {isEditMode ? "Update Coupon" : "Create Coupon"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CouponForm;
