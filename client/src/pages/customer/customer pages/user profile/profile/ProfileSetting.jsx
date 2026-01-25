import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  User,
  Mail,
  Shield,
  Key,
  MapPin,
  Plus,
  Trash2,
  Edit2,
  Check,
  Building,
  Home,
  Bookmark,
} from "lucide-react";

import api from "../../../../../api/axios";
import AddAddressModal from "./components/AddAddressModal";
import ChangePasswordModal from "./components/ChangePasswordModal";
import CustomModal from "../../../../../components/CustomModal";

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

  return ReactDOM.createPortal(
    <div className="animate-fade-up fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all min-h-dvh overflow-y-auto">
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
    </div>,
    document.body,
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
    <div className="animate-fade-up bg-gray-50/50 min-h-screen p-4 md:p-8 font-sans pb-24 md:pb-8">
      <CustomModal
        isOpen={modal.isOpen}
        onClose={closeModal}
        onConfirm={modal.onConfirm}
        title={modal.title}
        message={modal.message}
        type={modal.type}
      />

      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight mb-2">
              Profile Settings
            </h1>
            <p className="text-gray-500 font-medium text-lg">
              Manage your personal information and preferences
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Personal Info & Security */}
          <div className="lg:col-span-2 space-y-8">
            {/* Personal Information Card */}
            <section className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300">
              <div className="p-8">
                <div className="flex items-center gap-3 mb-8">
                  <div className="bg-blue-50 p-3 rounded-2xl">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Personal Information
                  </h2>
                </div>

                <form
                  onSubmit={handleSubmit(onSubmitPersonalInfo)}
                  className="space-y-6"
                >
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label
                        htmlFor="fullName"
                        className="text-sm font-bold text-gray-700 ml-1"
                      >
                        Full Name
                      </label>
                      <div className="relative">
                        <input
                          id="fullName"
                          type="text"
                          {...register("fullName", {
                            required: "Full Name is required",
                          })}
                          className={`w-full pl-11 pr-4 py-3.5 bg-gray-50 border ${
                            errors.fullName
                              ? "border-red-300 focus:ring-red-100"
                              : "border-gray-200 focus:border-blue-500 focus:ring-blue-100"
                          } rounded-xl outline-none focus:ring-4 transition-all font-medium text-gray-900`}
                          placeholder="Your Name"
                        />
                        <User className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                      </div>
                      {errors.fullName && (
                        <p className="text-sm text-red-500 font-medium ml-1">
                          {errors.fullName.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="email"
                        className="text-sm font-bold text-gray-700 ml-1"
                      >
                        Email Address
                      </label>
                      <div className="relative">
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
                          className={`w-full pl-11 pr-4 py-3.5 bg-gray-50 border ${
                            errors.email
                              ? "border-red-300 focus:ring-red-100"
                              : "border-gray-200 focus:border-blue-500 focus:ring-blue-100"
                          } rounded-xl outline-none focus:ring-4 transition-all font-medium text-gray-900`}
                          placeholder="name@example.com"
                        />
                        <Mail className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                      </div>
                      {errors.email && (
                        <p className="text-sm text-red-500 font-medium ml-1">
                          {errors.email.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      type="submit"
                      disabled={updateProfileMutation.isPending}
                      className="px-8 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-black hover:shadow-lg hover:-translate-y-0.5 transition-all focus:ring-4 focus:ring-gray-200 disabled:opacity-70 disabled:hover:translate-y-0"
                    >
                      {updateProfileMutation.isPending
                        ? "Saving..."
                        : "Save Changes"}
                    </button>
                  </div>
                </form>
              </div>
            </section>

            {/* Security Section */}
            <section className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300">
              <div className="p-8">
                <div className="flex items-center gap-3 mb-8">
                  <div className="bg-purple-50 p-3 rounded-2xl">
                    <Shield className="w-6 h-6 text-purple-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Login & Security
                  </h2>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-6 bg-gray-50/50 rounded-2xl border border-gray-100">
                  <div className="space-y-1">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                      <Key className="w-4 h-4 text-gray-400" />
                      Password
                    </h3>
                    <p className="text-sm text-gray-500 font-medium">
                      Last changed:{" "}
                      <span className="text-gray-900">
                        {profile?.passwordChangedAt
                          ? new Date(
                              profile.passwordChangedAt,
                            ).toLocaleDateString()
                          : "Never"}
                      </span>
                    </p>
                  </div>
                  <button
                    onClick={() => setIsChangePasswordModalOpen(true)}
                    className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm whitespace-nowrap"
                  >
                    Change Password
                  </button>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column: Addresses */}
          <div className="lg:col-span-1">
            <section className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden h-full">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-50 p-2.5 rounded-xl">
                    <MapPin className="w-5 h-5 text-emerald-600" />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">Addresses</h2>
                </div>
                <button
                  onClick={() => {
                    setIsAddressModalOpen(true);
                    setEditingAddress(null);
                    setIsEditMode(false);
                  }}
                  className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors"
                  title="Add Address"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4 max-h-[800px] overflow-y-auto pr-2 custom-scrollbar">
                {isAddressLoading ? (
                  <div className="space-y-4">
                    {[1, 2].map((i) => (
                      <div
                        key={i}
                        className="h-32 bg-gray-100 rounded-2xl animate-pulse"
                      ></div>
                    ))}
                  </div>
                ) : addressData && addressData.length > 0 ? (
                  <div className="space-y-4">
                    {addressData.map((address) => (
                      <div
                        key={address._id}
                        className="group relative bg-gray-50 hover:bg-white border boundary-gray-100 hover:border-blue-200 rounded-2xl p-5 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300"
                      >
                        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingAddress(address);
                              setIsEditMode(true);
                              setIsAddressModalOpen(true);
                            }}
                            className="p-1.5 bg-white text-blue-600 rounded-lg shadow-sm hover:scale-110 transition-transform"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteAddress(address._id);
                            }}
                            className="p-1.5 bg-white text-red-500 rounded-lg shadow-sm hover:scale-110 transition-transform"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="p-1.5 bg-white rounded-lg shadow-sm">
                              {address.type === "Work" ? (
                                <Building className="w-3.5 h-3.5 text-gray-700" />
                              ) : address.type === "Other" ? (
                                <Bookmark className="w-3.5 h-3.5 text-gray-700" />
                              ) : (
                                <Home className="w-3.5 h-3.5 text-gray-700" />
                              )}
                            </span>
                            <h3 className="font-bold text-gray-900">
                              {address.fullName}
                            </h3>
                            {address.isDefault && (
                              <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                                Default
                              </span>
                            )}
                          </div>

                          <div className="text-sm text-gray-500 leading-relaxed pl-1">
                            {address.street},<br />
                            {address.city}, {address.state} -{" "}
                            {address.postalCode}
                            <br />
                            <span className="text-xs font-semibold text-gray-400 mt-1 block">
                              {address.country}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 px-6">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MapPin className="w-8 h-8 text-gray-300" />
                    </div>
                    <p className="text-gray-900 font-bold mb-1">
                      No addresses found
                    </p>
                    <p className="text-sm text-gray-500 mb-6">
                      Add a shipping address to speed up checkout
                    </p>
                    <button
                      onClick={() => setIsAddressModalOpen(true)}
                      className="text-sm font-bold text-blue-600 hover:text-blue-700 hover:underline"
                    >
                      Add New Address
                    </button>
                  </div>
                )}
              </div>
            </section>
          </div>
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
