import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import api from "../../../../api/axios";

const ChangePasswordModal = ({ isOpen, onClose }) => {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm();

  const [genericError, setGenericError] = useState("");

  const newPassword = watch("newPassword");

  const changePasswordMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.put("/auth/change-password", data);
      return response.data;
    },
    onSuccess: (data) => {
      alert(data.message);
      reset();
      onClose();
    },
    onError: (error) => {
      setGenericError(
        error.response?.data?.message || "Failed to change password"
      );
    },
  });

  const onSubmit = (data) => {
    setGenericError("");
    changePasswordMutation.mutate({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    });
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold mb-4 text-center text-gray-900">
          Change Password
        </h2>

        {genericError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {genericError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Current Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Password
            </label>
            <input
              type="password"
              {...register("currentPassword", {
                required: "Current password is required",
              })}
              className={`w-full p-3 border ${
                errors.currentPassword ? "border-red-500" : "border-gray-300"
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50`}
              placeholder="Enter current password"
            />
            {errors.currentPassword && (
              <p className="mt-1 text-sm text-red-600">
                {errors.currentPassword.message}
              </p>
            )}
          </div>

    
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <input
              type="password"
              {...register("newPassword", {
                required: "New password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters",
                },
              })}
              className={`w-full p-3 border ${
                errors.newPassword ? "border-red-500" : "border-gray-300"
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50`}
              placeholder="Enter new password"
            />
            {errors.newPassword && (
              <p className="mt-1 text-sm text-red-600">
                {errors.newPassword.message}
              </p>
            )}
          </div>

          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              {...register("confirmPassword", {
                required: "Please confirm your new password",
                validate: (value) =>
                  value === newPassword || "Passwords do not match",
              })}
              className={`w-full p-3 border ${
                errors.confirmPassword ? "border-red-500" : "border-gray-300"
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50`}
              placeholder="Confirm new password"
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={changePasswordMutation.isPending}
              className="flex-1 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {changePasswordMutation.isPending
                ? "Updating..."
                : "Update Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
