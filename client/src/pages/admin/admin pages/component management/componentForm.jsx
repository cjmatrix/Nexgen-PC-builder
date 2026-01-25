import React, { useEffect, useState } from "react";
import { Upload, ChevronLeft, Cross } from "lucide-react";
import CustomModal from "../../../../components/CustomModal";
import ImageCropperModal from "../../../../components/ImageCropperModal";
import { CATEGORY_SPECS } from "../../../../config/componentFields";
import api from "../../../../api/axios";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import {
  createComponent,
  updateComponent,
  fetchComponentById,
} from "../../../../store/slices/componentSlice";

const ComponentForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isEditMode = !!id;

  const [modal, setModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
    onConfirm: null,
  });

  const [isCropOpen, setIsCropOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);
  const [uploadTarget, setUploadTarget] = useState(null);

  const handleFileSelect = (e, target) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setImageSrc(reader.result);
        setUploadTarget(target);
        setIsCropOpen(true);
      });
      reader.readAsDataURL(file);
    }
  };

  const handleCropConfirm = async (croppedImageBlob) => {
    try {
      const formData = new FormData();
      formData.append("image", croppedImageBlob);

      const res = await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (uploadTarget.type === "main") {
        setValue("image", res.data.imageUrl);
      } else if (uploadTarget.type === "spec") {
        setValue(`specs.${uploadTarget.name}`, res.data.imageUrl);
      }

      setIsCropOpen(false);
      setImageSrc(null);
      setUploadTarget(null);
    } catch (e) {
      console.error(e);
      setModal({
        isOpen: true,
        title: "Error",
        message: "Something went wrong uploading the image",
        type: "error",
      });
    }
  };

  const closeModal = () => {
    setModal((prev) => ({ ...prev, isOpen: false }));
  };

  const { loading } = useSelector((state) => state.components);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      price: "",
      stock: "",
      category: "",
      tier_level: "1",
      image: "",
      specs: {},
    },
  });

  const category = watch("category");
  const image = watch("image");
  const specs = watch("specs");

  useEffect(() => {
    if (isEditMode) {
      dispatch(fetchComponentById(id))
        .unwrap()
        .then((data) => {
          reset({
            name: data.name,
            price: data.price / 100, 
            stock: data.stock,
            category: data.category,
            tier_level: String(data.tier_level),
            image: data.image,
            specs: data.specs || {},
          });
        })
        .catch((err) => {
          console.error("Failed to fetch component:", err);
          setModal({
            isOpen: true,
            title: "Error",
            message: "Failed to fetch component details",
            type: "error",
            onConfirm: () => navigate("/admin/components"),
          });
        });
    }
  }, [id, isEditMode, dispatch, navigate, reset]);

  const onSubmit = async (data) => {
    const payload = {
      ...data,
      tier_level: Number(data.tier_level),
      price: Number(data.price) * 100, // Convert Rupees to Paisa
      stock: Number(data.stock),
    };

    console.log(data)

    try {
      if (isEditMode) {
        await dispatch(updateComponent({ id, data: payload })).unwrap();
        setModal({
          isOpen: true,
          title: "Success",
          message: "Component Updated Successfully!",
          type: "success",
          onConfirm: () => navigate("/admin/components"),
        });
      } else {
        await dispatch(createComponent(payload)).unwrap();
        setModal({
          isOpen: true,
          title: "Success",
          message: "Component Created Successfully!",
          type: "success",
          onConfirm: () => navigate("/admin/components"),
        });
      }
    } catch (error) {
      console.error("Error saving component:", error);
      setModal({
        isOpen: true,
        title: "Error",
        message: `Error ${isEditMode ? "updating" : "creating"} component`,
        type: "error",
      });
    }
  };

  const renderSpecField = (field) => {
    const commonClasses =
      "w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition";

    if (field.type === "select") {
      return (
        <select className={commonClasses} {...register(`specs.${field.name}`)}>
          <option value="" disabled>
            Select {field.label}
          </option>
          {field.options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      );
    }

    if (field.type === "checkbox") {
      return (
        <div className="flex items-center h-10">
          <input
            type="checkbox"
            className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
            {...register(`specs.${field.name}`)}
          />
          <span className="ml-2 text-gray-700">{field.label}</span>
        </div>
      );
    }

    if (field.type === "file") {
      const specImage = specs?.[field.name];
      return (
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-600 mb-1">
            {field.label}
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-gray-500 bg-gray-50 hover:bg-gray-100 transition relative">
            {specImage ? (
              <div className="relative w-full h-48 flex justify-center">
                <img
                  src={specImage}
                  alt="Preview"
                  className="h-full object-contain rounded-md"
                />
                <button
                  type="button"
                  onClick={() => setValue(`specs.${field.name}`, "")}
                  className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                >
                  <Cross size={16} className="rotate-45" />
                </button>
              </div>
            ) : (
              <>
                <Upload size={32} className="mb-2" />
                <p className="text-sm text-gray-500">Click to upload image</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    handleFileSelect(e, { type: "spec", name: field.name })
                  }
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </>
            )}
          </div>
        </div>
      );
    }

    return (
      <input
        type={field.type}
        placeholder={field.placeholder || ""}
        className={commonClasses}
        {...register(`specs.${field.name}`)}
      />
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8 flex justify-center">
      <CustomModal
        isOpen={modal.isOpen}
        onClose={closeModal}
        onConfirm={modal.onConfirm}
        title={modal.title}
        message={modal.message}
        type={modal.type}
      />
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 border-b pb-4">
          <h1 className="text-2xl font-bold text-gray-800">
            {isEditMode ? "Edit Inventory Item" : "Add New Inventory Item"}
          </h1>

          <Link to="/admin/components">
            <button className="flex items-center text-gray-500 hover:text-gray-800 transition">
              <ChevronLeft size={18} /> Back to Inventory
            </button>
          </Link>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* SECTION A: Universal Details */}
          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-4">
              Section A: Universal Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-2 md:col-span-1">
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Product Name
                </label>
                <input
                  type="text"
                  className={`w-full border rounded-md p-2 ${
                    errors.name ? "border-red-500" : "border-gray-300"
                  }`}
                  {...register("name", {
                    required: "Product Name is required",
                  })}
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Price (₹)
                </label>
                <input
                  type="number"
                  className={`w-full border rounded-md p-2 ${
                    errors.price ? "border-red-500" : "border-gray-300"
                  }`}
                  {...register("price", { required: "Price is required" })}
                />
                {errors.price && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.price.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Stock Quantity
                </label>
                <input
                  type="number"
                  className={`w-full border rounded-md p-2 ${
                    errors.stock ? "border-red-500" : "border-gray-300"
                  }`}
                  {...register("stock", { required: "Stock is required" })}
                />
                {errors.stock && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.stock.message}
                  </p>
                )}
              </div>

              {/* Image Upload Section */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Product Image
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-gray-500 bg-gray-50 hover:bg-gray-100 transition relative">
                  {image ? (
                    <div className="relative w-full h-48 flex justify-center">
                      <img
                        src={image}
                        alt="Preview"
                        className="h-full object-contain rounded-md"
                      />
                      <button
                        type="button"
                        onClick={() => setValue("image", "")}
                        className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                      >
                        <Cross size={16} className="rotate-45" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Upload size={32} className="mb-2" />
                      <p className="text-sm text-gray-500">
                        Click to upload image
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileSelect(e, { type: "main" })}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION B: Category Selector */}
          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-4">
              Section B: The Category Selector
            </h2>
            <select
              className={`w-full border border-gray-300 rounded-md p-3 text-lg ${
                isEditMode ? "bg-gray-200 appearance-none" : ""
              }`}
              disabled={isEditMode}
              {...register("category", { required: "Category is required" })}
            >
              <option value="">Select Category...</option>
              {Object.keys(CATEGORY_SPECS).map((cat) => (
                <option key={cat} value={cat}>
                  {cat.toUpperCase()}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="text-red-500 text-xs mt-1">
                {errors.category.message}
              </p>
            )}
            {isEditMode && (
              <p className="text-sm text-gray-500 mt-1">
                Category cannot be changed during edit.
              </p>
            )}
          </div>

          {/* SECTION C: Dynamic Technical Specs */}
          {category && CATEGORY_SPECS[category] && (
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 fade-in">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">
                Section C: Technical Specs ({category.toUpperCase()})
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 1. Render Specific Fields based on Category */}
                {CATEGORY_SPECS[category].map((field) => (
                  <div key={field.name}>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      {field.label}
                    </label>
                    {renderSpecField(field)}
                  </div>
                ))}

                {/* 2. Tier Level (Universal Spec) */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Performance Tier
                  </label>
                  <select
                    className="w-full border border-gray-300 rounded-md p-2"
                    {...register("tier_level")}
                  >
                    <option value="1">Tier 1 - Entry</option>
                    <option value="2">Tier 2 - Budget</option>
                    <option value="3">Tier 3 - Mid-Range</option>
                    <option value="4">Tier 4 - High-End</option>
                    <option value="5">Tier 5 - Ultra</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex justify-end gap-4 border-t pt-6">
            <Link to="/admin/components">
              <button
                type="button"
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </Link>

            <button
              type="submit"
              className="px-6 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800"
            >
              {isEditMode ? "Update Component" : "Save Component"}
            </button>
          </div>
        </form>
      </div>
      <ImageCropperModal
        isOpen={isCropOpen}
        onClose={() => setIsCropOpen(false)}
        imageSrc={imageSrc}
        onCropConfirm={handleCropConfirm}
      />
    </div>
  );
};

export default ComponentForm;
