import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import {
  fetchComponents,
  selectPart,
  resetBuild,
  setSelected,
} from "../../../../store/slices/builderSlice";
import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import {
  createProduct,
  updateProduct,
  fetchProductById,
} from "../../../../store/slices/productSlice";
import { useLocation } from "react-router-dom";
import {
  Cpu,
  HardDrive,
  Monitor,
  Box,
  Zap,
  Wind,
  Save,
  ArrowLeft,
  Upload,
  X,
  Check,
  ZoomIn,
  Sparkles,
  Wrench,
} from "lucide-react";
import api from "../../../../api/axios";
import CustomModal from "../../../../components/CustomModal";
import ImageCropperModal from "../../../../components/ImageCropperModal";
import PartSelector from "./components/PartSelector";
import { toast } from "react-toastify";

const AddProductForm = () => {
  const location = useLocation();
  const prefill = location?.state?.prefill;

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { selected, options, totalPrice, estimatedWattage } = useSelector(
    (state) => state.builder,
  );

  const { id } = useParams();
  const isEditMode = !!id || !!location.state;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    trigger,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      description: "",
      category: "Gaming",
      base_price: "",
      discount: 0,
      images: [],
    },
  });
  
  const images = watch("images");
  const basePrice = watch("base_price");

  const [isCropOpen, setIsCropOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);
  const [compImage,setCompImage]=useState("")
  const [currentImageIndex, setCurrentImageIndex] = useState(null);

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

  const onFileChange = async (e, index) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setImageSrc(reader.result);
        setCurrentImageIndex(index);
        setIsCropOpen(true);
      });
      reader.readAsDataURL(file);
    }
  };

  const handleCropConfirm = async (croppedImageBlob) => {
    try {
      const uploadData = new FormData();
      uploadData.append("image", croppedImageBlob);

      const res = await api.post("/upload", uploadData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const currentImages = images || [];
      const newImages = [...currentImages];
      newImages[currentImageIndex] = res.data.imageUrl;
      setValue("images", newImages);

      setIsCropOpen(false);
      setImageSrc(null);
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

  useEffect(()=>{
   isEditMode && selected?.case && setCompImage(selected?.case?.image)
  },[selected?.case])
 

  useEffect(() => {
    if (isEditMode && !location.state) {
      dispatch(fetchProductById(id))
        .unwrap()
        .then((data) => {
          reset({
            name: data.name,
            description: data.description,
            category: data.category?._id || data.category,
            base_price: data.base_price / 100,
            discount: data.discount || 0,
            images: data.images || [],
          });
          dispatch(setSelected(data.default_config));
        })
        .catch((err) => {
          console.error("Failed to fetch component:", err);
          setModal({
            isOpen: true,
            title: "Error",
            message: "Failed to fetch product details",
            type: "error",
            onConfirm: () => navigate("/admin/products"),
          });
        });
    } else if (isEditMode && location.state) {
      reset({
        name: prefill.name,
        description: prefill.description,
        base_price: prefill.price / 100,
        images: [prefill.image],
      });
      dispatch(setSelected(prefill.components));
    }
  }, [isEditMode, id, navigate, dispatch, reset, prefill]);

  useEffect(() => {
    if (!isEditMode && !location.state) {
      dispatch(resetBuild());
    }
    dispatch(fetchComponents({ category: "cpu" }));
    dispatch(fetchComponents({ category: "storage" }));
  }, [dispatch, isEditMode, location.state]);

  useEffect(() => {
    if (selected.cpu && selected.cpu._id) {
      dispatch(
        fetchComponents({
          category: "motherboard",
          params: { cpuId: selected.cpu._id },
        }),
      );
      dispatch(
        fetchComponents({
          category: "cooler",
          params: {
            cpuId: selected.cpu._id,
            maxHeight: selected.case?.specs?.maxCpuCoolerHeight_mm,
          },
        }),
      );
      const maxTier =
        typeof selected.cpu.tier_level === "number"
          ? selected.cpu.tier_level + 1
          : undefined;

      dispatch(
        fetchComponents({
          category: "gpu",
          params: {
            maxTier,
            caseId: selected.case?._id,
          },
        }),
      );
    }
  }, [dispatch, selected.cpu, selected.case]);

  useEffect(() => {
    if (selected.motherboard && selected.motherboard._id) {
      dispatch(
        fetchComponents({
          category: "ram",
          params: { motherboardId: selected.motherboard._id },
        }),
      );
      dispatch(
        fetchComponents({
          category: "case",
          params: {
            motherboardId: selected.motherboard._id,
            gpuId: selected.gpu?._id,
          },
        }),
      );
    }
  }, [dispatch, selected.motherboard, selected.gpu]);

  useEffect(() => {
    if (estimatedWattage > 0) {
      dispatch(
        fetchComponents({
          category: "psu",
          params: { minWattage: estimatedWattage + 150 },
        }),
      );
    }
  }, [dispatch, estimatedWattage]);

  useEffect(() => {
    if (selected.case && selected.gpu) {
      const gpuLength = selected.gpu.specs?.length_mm || 0;
      const maxGpuLength = selected.case.specs?.maxGpuLength_mm || 0;

      if (gpuLength > maxGpuLength) {
        toast.warn(
          `Case deselected! ${selected.gpu.name} is too long for this case.`,
        );
        dispatch(selectPart({ category: "case", component: null }));
      }
    }

    if (selected.case && selected.motherboard) {
      const moboForm = selected.motherboard.specs?.formFactor?.toUpperCase();
      const caseForm = selected.case.specs?.formFactor?.toUpperCase();

      let isCompatible = true;
      // Logic:
      // ATX Case supports: ATX, mATX, ITX
      // mATX Case supports: mATX, ITX (Usually doesn't support ATX)
      // ITX Case supports: ITX (Usually doesn't support mATX/ATX)

      if (caseForm === "ITX" && moboForm !== "ITX") isCompatible = false;
      if (caseForm === "MATX" && moboForm === "ATX") isCompatible = false;

      if (!isCompatible) {
        toast.warn(
          `Case deselected! ${caseForm} case cannot fit ${moboForm} motherboard.`,
        );
        dispatch(selectPart({ category: "case", component: null }));
      }
    }
  }, [selected.case, selected.gpu, selected.motherboard, dispatch]);

  const handleSelect = (category, component) => {

    setCompImage(component?.image)
    dispatch(selectPart({ category, component }));
  };

  const onSubmit = async (data) => {
    const requiredParts = [
      "cpu",
      "motherboard",
      "ram",
      "gpu",
      "storage",
      "case",
      "psu",
      "cooler",
    ];
    const missingParts = requiredParts.filter((part) => !selected[part]);

    if (missingParts.length > 0) {
      setModal({
        isOpen: true,
        title: "Validation Error",
        message: `Please select all components. Missing: ${missingParts.join(
          ", ",
        )}`,
        type: "error",
      });
      return;
    }

    const productPayload = {
      ...data,
      base_price: data.base_price ? Number(data.base_price) * 100 : totalPrice,
      default_config: {
        cpu: selected.cpu._id,
        motherboard: selected.motherboard._id,
        ram: selected.ram._id,
        gpu: selected.gpu._id,
        storage: selected.storage._id,
        case: selected.case._id,
        psu: selected.psu._id,
        cooler: selected.cooler._id,
      },
    };
    productPayload.originalOrderId = null;
    productPayload.buildType = "standard";
    productPayload.isFeaturedBuild = false;

    if (prefill) {
      productPayload.isFeaturedBuild = prefill.isFeaturedBuild;
      productPayload.originalOrderId = prefill.originalOrderId;
      productPayload.buildType = prefill.buildType;
    }

    try {
      if (isEditMode && !location.state) {
        await dispatch(updateProduct({ id, data: productPayload })).unwrap();
        setModal({
          isOpen: true,
          title: "Success",
          message: "Product Updated Successfully!",
          type: "success",
          onConfirm: () => navigate("/admin/products"),
        });
      } else {
        const successMsg = prefill
          ? "Featured Build Added to Inventory!"
          : "Product Created Successfully!";

        await dispatch(createProduct(productPayload)).unwrap();
        setModal({
          isOpen: true,
          title: "Success",
          message: successMsg,
          type: "success",
          onConfirm: () => navigate("/admin/products"),
        });
      }
    } catch (error) {
      setModal({
        isOpen: true,
        title: "Error",
        message: `Error creating product: ${error}`,
        type: "error",
      });
    }
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ["adminCategory"],
    queryFn: async () => {
      const response = await api.get("/admin/category");

      return response.data;
    },
  });

  useEffect(() => {
    if (
      data?.categories &&
      data.categories.length > 0 &&
      (!isEditMode || (location.state && !prefill.category))
    ) {
      setValue("category", data.categories[0]._id);
    }
  }, [data?.categories, isEditMode]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mb-4"></div>
        <p className="text-gray-600 font-medium">Loading Product Details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-red-500">
        Error loading data. Please try again.
      </div>
    );
  }

  return (
    <div className="animate-fade-up min-h-screen bg-gray-50 pt-10 pb-12 px-4 sm:px-6 lg:px-8 font-sans">
      <CustomModal
        isOpen={modal.isOpen}
        onClose={closeModal}
        onConfirm={modal.onConfirm}
        title={modal.title}
        message={modal.message}
        type={modal.type}
      />
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <ArrowLeft size={24} />
          </button>

          <div className="flex items-center gap-3">
            {prefill?.buildType?.includes("ai") ? (
              <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600 shadow-sm border border-indigo-200">
                <Sparkles size={24} />
              </div>
            ) : prefill?.buildType?.includes("custom") ? (
              <div className="p-2 bg-purple-100 rounded-lg text-purple-600 shadow-sm border border-purple-200">
                <Wrench size={24} />
              </div>
            ) : null}

            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {prefill
                  ? "Promote Featured Build"
                  : isEditMode
                    ? "Edit Pre-Built PC"
                    : "Create New Pre-Built PC"}
              </h1>
              {prefill && (
                <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                  <ZoomIn size={14} />
                  Converting{" "}
                  <span className="font-semibold text-gray-700 uppercase tracking-wide">
                    {prefill.buildType === "ai_featured" ? "AI" : "Custom"}
                  </span>{" "}
                  generated build into a store product
                </p>
              )}
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* LEFT COLUMN: Product Details & Builder */}
          <div className="lg:col-span-2 space-y-8">
            {/* 1. Product Details Section */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Product Details
              </h2>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name
                  </label>
                  <input
                    type="text"
                    className={`w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.name ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="e.g. Nexgen Ultra Gaming PC"
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    {data?.categories && (
                      <select
                        className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        {...register("category")}
                      >
                        {data.categories.map((category) => {
                          return (
                            <option value={category._id} key={category._id}>
                              {category.name}
                            </option>
                          );
                        })}
                      </select>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Custom Price (Optional)
                    </label>
                    <input
                      type="number"
                      className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={`Calculated: ₹${(
                        totalPrice / 100
                      ).toLocaleString()}`}
                      {...register("base_price", {
                        validate: (value) => {
                          if (value)
                            return (
                              value >= totalPrice / 100 ||
                              "Price should be greater or equal to total cost"
                            );
                        },
                        onChange: () => trigger("base_price"),
                      })}
                    />
                    {errors.base_price && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.base_price.message}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Leave empty to use sum of parts cost.
                    </p>
                  </div>

                  {/* --- NEW DISCOUNT INPUT --- */}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Discount (%)
                    </label>
                    <input
                      type="number"
                      className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                      {...register("discount", {
                        min: { value: 0, message: "Min 0%" },
                        max: { value: 99, message: "Max 99%" },
                        onChange: () => trigger("discount"),
                      })}
                    />
                    {!errors.discount && (
                      <p className="text-xs text-gray-500 mt-1">
                        Final Price: ₹
                        {(
                          (watch("base_price") || totalPrice / 100) *
                          (1 - (watch("discount") || 0) / 100)
                        ).toLocaleString()}
                      </p>
                    )}
                    {errors.discount && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.discount.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    className={`w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 h-32 ${
                      errors.description ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Describe the features of this build..."
                    {...register("description", {
                      required: "Description is required",
                    })}
                  />
                  {errors.description && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.description.message}
                    </p>
                  )}
                </div>
              </div>
              {/* Image Upload Section */}
              <div className="col-span-2 mt-4">
                <label className="block text-sm font-medium text-gray-600 mb-3">
                  Product Images (Max 3)
                </label>
                <div className="grid grid-cols-3 gap-4">
                  {[0, 1, 2].map((index) => (
                    <div
                      key={index}
                      className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-500 bg-gray-50 hover:bg-gray-100 transition relative overflow-hidden"
                    >
                      {images && images[index] ? (
                        <div className="relative w-full h-full group">
                          <img
                            src={images[index]}
                            alt={`Product ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newImages = [...images];
                              newImages.splice(index, 1);
                              setValue("images", newImages);
                            }}
                            className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                          >
                            <Upload size={16} className="rotate-45" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <Upload size={24} className="mb-2 text-gray-400" />
                          <p className="text-xs text-gray-500 text-center px-2">
                            Upload Image {index + 1}
                          </p>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => onFileChange(e, index)}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-800">Configuration</h2>

              <PartSelector
                category="cpu"
                label="Processor (CPU)"
                icon={Cpu}
                options={options.cpu}
                selected={selected.cpu}
                onSelect={handleSelect}
                setCompImage={setCompImage}
              />
              <PartSelector
                category="motherboard"
                label="Motherboard"
                icon={Box}
                options={options.motherboard}
                selected={selected.motherboard}
                onSelect={handleSelect}
                disabled={!selected.cpu}
                setCompImage={setCompImage}
              />
              <PartSelector
                category="ram"
                label="Memory (RAM)"
                icon={Box}
                options={options.ram}
                selected={selected.ram}
                onSelect={handleSelect}
                disabled={!selected.motherboard}
                setCompImage={setCompImage}
              />
              <PartSelector
                category="gpu"
                label="Graphics Card"
                icon={Monitor}
                options={options.gpu}
                selected={selected.gpu}
                onSelect={handleSelect}
                disabled={!selected.cpu}
                setCompImage={setCompImage}
              />
              <PartSelector
                category="storage"
                label="Storage (SSD)"
                icon={HardDrive}
                options={options.storage}
                selected={selected.storage}
                onSelect={handleSelect}
                setCompImage={setCompImage}
              />
              <PartSelector
                category="case"
                label="PC Case"
                icon={Box}
                options={options.case}
                selected={selected.case}
                onSelect={handleSelect}
                disabled={!selected.motherboard}
                setCompImage={setCompImage}
              />
              <PartSelector
                category="cooler"
                label="CPU Cooler"
                icon={Wind}
                options={options.cooler}
                selected={selected.cooler}
                onSelect={handleSelect}
                disabled={!selected.cpu}
                setCompImage={setCompImage}
              />
              <PartSelector
                category="psu"
                label="Power Supply"
                icon={Zap}
                options={options.psu}
                selected={selected.psu}
                onSelect={handleSelect}
                disabled={!selected.gpu}
                setCompImage={setCompImage}
              />
            </div>
          </div>

          {/* RIGHT COLUMN: Sticky Summary & Action */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  Build Summary
                </h2>
                {prefill && (
                  <span
                    className={`px-2 py-1 text-xs font-bold rounded uppercase tracking-wider border ${
                      prefill.buildType?.includes("ai")
                        ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                        : "bg-purple-50 text-purple-700 border-purple-200"
                    }`}
                  >
                    {prefill.buildType === "ai_featured"
                      ? "AI Feature"
                      : "User Feature"}
                  </span>
                )}
              </div>

              <div className="aspect-video bg-gray-100 rounded-lg mb-6 flex items-center justify-center overflow-hidden">
                {compImage? (
                  <img
                    src={
                     compImage
                    }
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <p className="text-gray-400">Preview</p>
                )}
              </div>

              <div className="space-y-3 mb-6 max-h-60 overflow-y-auto">
                {Object.entries(selected).map(
                  ([key, part]) =>
                    part && (
                      <div key={key} className="flex justify-between text-sm">
                        <span className="text-gray-500 capitalize">{key}</span>
                        <span className="font-medium text-gray-800 truncate w-40 text-right">
                          {part.name}
                        </span>
                      </div>
                    ),
                )}
              </div>

              <div className="border-t border-gray-100 pt-4 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Estimated Wattage</span>
                  <span className="font-medium text-gray-900">
                    {estimatedWattage}W
                  </span>
                </div>
                <div className="flex justify-between items-center text-xl font-bold text-gray-900">
                  <span>Total Cost</span>
                  <span>₹{(totalPrice / 100).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-orange-600">Discount</span>
                  <span className="font-small text-orange-600">
                    {watch("discount") ? watch("discount") + " %" : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between items-center text-lg font-bold text-green-600 mt-2">
                  <span>Final Price</span>
                  <span>
                    ₹
                    {(
                      (watch("base_price") || totalPrice / 100) *
                      (1 - (watch("discount") || 0) / 100)
                    ).toLocaleString()}
                  </span>
                </div>
                {basePrice && (
                  <div className="flex justify-between items-center text-lg font-bold text-green-600 mt-2">
                    <span>Selling Price</span>
                    <span>₹{Number(basePrice).toLocaleString()}</span>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <Save size={20} />{" "}
                {isEditMode && !prefill
                  ? "Update Product"
                  : isEditMode && prefill
                    ? "Add To Inventory"
                    : "Create Product"}
              </button>
            </div>
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

export default AddProductForm;
