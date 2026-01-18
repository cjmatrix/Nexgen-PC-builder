import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import api from "../../../../api/axios";
import AddAddressModal from "./AddAddressModal";
import ChangePasswordModal from "./ChangePasswordModal";
import CustomModal from "../../../../components/CustomModal";

const OTPModal = ({ isOpen, onClose, onVerify, email, onResend }) => {
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [timer, setTimer] = useState(30);

  useEffect(() => {
    if (!isOpen || timer <= 0) return;

    const timeoutId = setTimeout(() => {
      setTimer(timer - 1);
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [isOpen, timer]);

  const handleVerify = async () => {
    setIsVerifying(true);
    try {
      await onVerify(otp);
    } catch (error) {
      console.error(error);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    setTimer(30);
    setIsVerifying(true);
    try {
      await onResend(otp);
    } catch (error) {
      console.error(error);
    } finally {
      setIsVerifying(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all">
      <div
        className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold mb-4 text-center">Verify Email</h2>
        <p className="text-sm text-gray-500 mb-6 text-center">
          Enter the verification code sent to{" "}
          <span className="font-semibold">{email}</span>
        </p>
        <input
          type="text"
          className="w-full px-4 py-3 text-center text-2xl tracking-[0.5em] font-bold border border-gray-300 rounded-lg mb-6 focus:ring-2 focus:ring-blue-500 outline-none uppercase"
          maxLength={6}
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
        />
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-lg border border-gray-200 text-gray-700 font-medium hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleVerify}
            disabled={otp.length !== 6 || isVerifying}
            className="flex-1 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isVerifying ? "Verifying..." : "Verify"}
          </button>
        </div>
        <div className="text-center mt-4">
          <p className="text-sm text-gray-500">
            Didn't receive code?{" "}
            {timer > 0 ? (
              <span className="text-gray-400">Resend in {timer}s</span>
            ) : (
              <button
                onClick={handleResend}
                className="text-blue-600 font-semibold hover:underline"
              >
                Resend OTP
              </button>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

const ProfileSetting = () => {
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [isOTPModalOpen, setIsOTPModalOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] =
    useState(false);
  const [pendingEmail, setPendingEmail] = useState("");
  const [modal, setModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
    onConfirm: null,
  });

  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      fullName: "",
      email: "",
    },
  });

  const { data: addressData, isLoading: isAddressLoading } = useQuery({
    queryKey: ["userAddresses"],
    queryFn: async () => {
      const response = await api.get("/user/address");
      return response.data.addresses;
    },
  });

  const handleAddAddress = () => {
    setIsAddressModalOpen(false);
  };

  const {
    data: profile,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["userProfile"],
    queryFn: async () => {
      const response = await api.get("/user/profile");
      reset({
        fullName: response.data.profile.name,
        email: response.data.profile.email,
      });
      return response.data.profile;
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.put("/user/profile", data);
      return response.data;
    },
    onSuccess: (data) => {
      if (data.emailChanged) {
        setPendingEmail(data.pendingMail || data.user.email);
        setIsOTPModalOpen(true);
        console.log(data.user.email);
      } else {
        queryClient.invalidateQueries(["userProfile"]);
        setModal({
          isOpen: true,
          title: "Success",
          message: "Profile updated successfully",
          type: "success",
        });
      }
    },
    onError: (error) => {
      console.error("Update failed:", error);
      setModal({
        isOpen: true,
        title: "Update Failed",
        message: error.response?.data?.message || "Failed to update profile",
        type: "error",
      });
    },
  });

  const verifyOTPMutation = useMutation({
    mutationFn: async (otp) => {
      const response = await api.post("/user/verify-email-change", {
        email: pendingEmail,
        otp,
      });
      return response.data;
    },
    onSuccess: () => {
      setIsOTPModalOpen(false);
      queryClient.invalidateQueries(["userProfile"]);
      setModal({
        isOpen: true,
        title: "Verified",
        message: "Email verified successfully",
        type: "success",
      });
    },
    onError: (error) => {
      console.error("Verification failed:", error);
      setModal({
        isOpen: true,
        title: "Verification Failed",
        message: error.response?.data?.message || "Invalid OTP",
        type: "error",
      });
    },
  });

  const resendOTPMutation = useMutation({
    mutationFn: async () => {
      await api.post("/auth/resend-otp", { email: pendingEmail });
    },
    onSuccess: () =>
      setModal({
        isOpen: true,
        title: "Sent",
        message: "OTP resent successfully",
        type: "success",
      }),
    onError: (err) =>
      setModal({
        isOpen: true,
        title: "Error",
        message: err.message,
        type: "error",
      }),
  });

  const onSubmitPersonalInfo = (data) => {
    const payload = {
      ...data,
      name: data.fullName,
    };
    updateProfileMutation.mutate(payload);
  };

  const handleVerifyOTP = async (otp) => {
    await verifyOTPMutation.mutateAsync(otp);
  };

  const handleResendOTP = async (otp) => {
    await resendOTPMutation.mutateAsync(otp);
  };

  const deleteAddressMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/user/address/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["userAddresses"]);
      setModal({
        isOpen: true,
        title: "Deleted",
        message: "Address deleted successfully",
        type: "success",
      });
    },
    onError: (error) => {
      console.error("Delete failed:", error);
      setModal({
        isOpen: true,
        title: "Error",
        message: error.response?.data?.message || "Failed to delete address",
        type: "error",
      });
    },
  });

  const handleDeleteAddress = (id) => {
    setModal({
      isOpen: true,
      title: "Confirm Deletion",
      message: "Are you sure you want to delete this address?",
      type: "confirmation",
      onConfirm: () => deleteAddressMutation.mutate(id),
    });
  };

  const closeModal = () => {
    setModal((prev) => ({ ...prev, isOpen: false }));
    if (modal.onConfirm && modal.type !== "confirmation") {
      modal.onConfirm();
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen p-8 font-sans">
      <CustomModal
        isOpen={modal.isOpen}
        onClose={closeModal}
        onConfirm={modal.onConfirm}
        title={modal.title}
        message={modal.message}
        type={modal.type}
      />
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Account Settings
        </h1>

        <div className="space-y-8">
          <section className="bg-white p-8 rounded-xl shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Personal Information
            </h2>
            <form onSubmit={handleSubmit(onSubmitPersonalInfo)}>
              <div className="space-y-6">
                <div>
                  <label
                    htmlFor="fullName"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Full Name
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    {...register("fullName", {
                      required: "Full Name is required",
                    })}
                    className={`w-full p-3 border ${
                      errors.fullName ? "border-red-500" : "border-gray-300"
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 transition-shadow`}
                  />
                  {errors.fullName && (
                    <p className="mt-2 text-sm text-red-600">
                      {errors.fullName.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Invalid email address",
                      },
                    })}
                    className={`w-full p-3 border ${
                      errors.email ? "border-red-500" : "border-gray-300"
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 transition-shadow`}
                  />
                  {errors.email && (
                    <p className="mt-2 text-sm text-red-600">
                      {errors.email.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-8">
                <button
                  type="submit"
                  className="px-6 py-3 bg-[#1e293b] text-white font-medium rounded-lg hover:bg-[#334155] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1e293b]"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </section>

          <section className="bg-white p-8 rounded-xl shadow-sm flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Login & Security
              </h2>
              <div>
                <p className="text-base font-medium text-gray-900">Password</p>
                <p className="text-sm text-gray-500">
                  Last change password at :{" "}
                  {profile?.passwordChangedAt
                    ? new Date(profile.passwordChangedAt).toLocaleDateString()
                    : "Never changed"}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsChangePasswordModalOpen(true)}
              className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors focus:outline-none underline-offset-2 hover:underline"
            >
              Change Password
            </button>
          </section>

          <section className="bg-white p-8 rounded-xl shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Saved Addresses
              </h2>
              <button
                onClick={() => setIsAddressModalOpen(true)}
                className="px-4 py-2 bg-[#1e293b] text-white text-sm font-medium rounded-lg hover:bg-[#334155] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1e293b]"
              >
                Add New Address
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {isAddressLoading ? (
                <p>Loading addresses...</p>
              ) : addressData && addressData.length > 0 ? (
                addressData.map((address) => (
                  <div
                    key={address._id}
                    className="border border-gray-200 rounded-xl p-6 flex justify-between bg-gray-50/50"
                  >
                    <div className="text-sm text-gray-700 space-y-1">
                      <p className="font-bold text-gray-900 text-base">
                        {address.fullName}{" "}
                        <span className="text-xs font-normal text-gray-500">
                          ({address.type})
                        </span>
                      </p>
                      <p>{address.street}</p>
                      <p>
                        {address.city}, {address.state} {address.postalCode}
                      </p>
                      <p>{address.country}</p>
                      {address.isDefault && (
                        <span className="text-blue-600 text-xs font-semibold">
                          Default
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col space-y-2 text-sm font-medium text-gray-400">
                      <button
                        className="hover:text-gray-700 transition-colors text-left focus:outline-none"
                        onClick={() => {
                          setEditingAddress(address);
                          setIsEditMode(true);
                          setIsAddressModalOpen(true);
                        }}
                      >
                        edit
                      </button>
                      <button
                        onClick={() => handleDeleteAddress(address._id)}
                        className="hover:text-red-600 transition-colors text-left focus:outline-none"
                      >
                        delete
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No addresses found.</p>
              )}
            </div>
          </section>
        </div>
      </div>

      <AddAddressModal
        isOpen={isAddressModalOpen}
        onClose={() => {
          setIsEditMode(false);
          setIsAddressModalOpen(false);
        }}
        onSubmit={handleAddAddress}
        isEditMode={isEditMode}
        addressToEdit={editingAddress}
      />

      <OTPModal
        isOpen={isOTPModalOpen}
        onClose={() => setIsOTPModalOpen(false)}
        onVerify={handleVerifyOTP}
        email={pendingEmail}
        onResend={handleResendOTP}
      />

      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen}
        onClose={() => setIsChangePasswordModalOpen(false)}
      />
    </div>
  );
};

export default ProfileSetting;
