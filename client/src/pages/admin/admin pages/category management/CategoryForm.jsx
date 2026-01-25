import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Save } from "lucide-react";
import api from "../../../../api/axios";
import CustomModal from "../../../../components/CustomModal";
import { useState } from "react";

const CategoryForm = () => {
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
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      offer: 0,
    },
  });

  const { data } = useQuery({
    queryKey: ["category", id],
    queryFn: async () => {
      if (!isEditMode) return null;

      const res = await api.get(`/admin/category/${id}`);
      return res.data;
    },
    enabled: isEditMode,
  });

  useEffect(() => {
    if (data) {
      setValue("name", data.name);
      setValue("offer", data.offer || 0);
    }
  }, [data]);

  const createMutation = useMutation({
    mutationFn: (data) => api.post("/admin/category", data),
    onSuccess: () => {
      queryClient.invalidateQueries(["adminCategory"]);
      setModal({
        isOpen: true,
        title: "Success",
        message: "Category created successfully",
        type: "success",
        onConfirm: () => navigate("/admin/categories"),
      });
    },
    onError: (error) => {
      setModal({
        isOpen: true,
        title: "Error",
        message: error.response?.data?.message || "Failed to create category",
        type: "error",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data) => api.put(`/admin/category/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["adminCategory"]);
      setModal({
        isOpen: true,
        title: "Success",
        message: "Category updated successfully",
        type: "success",
        onConfirm: () => navigate("/admin/categories"),
      });
    },
    onError: (error) => {
      setModal({
        isOpen: true,
        title: "Error",
        message: error.response?.data?.message || "Failed to update category",
        type: "error",
      });
    },
  });

  const onSubmit = (data) => {
    if (isEditMode) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
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
            {isEditMode ? "Edit Category" : "Create New Category"}
          </h1>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category Name
                </label>
                <input
                  type="text"
                  className={`w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.name ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="e.g. Gaming, Office"
                  {...register("name", {
                    required: "Category Name is required",
                  })}
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category Offer (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="99"
                  className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
                  placeholder="e.g. 10"
                  {...register("offer", {
                    min: { value: 0, message: "Minimum 0%" },
                    max: { value: 99, message: "Maximum 99%" },
                  })}
                />
                {errors.offer && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.offer.message}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  This offer will apply to all products in this category unless
                  the product has a higher individual discount.
                </p>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <Save size={20} />
              {isEditMode ? "Update Category" : "Create Category"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CategoryForm;
