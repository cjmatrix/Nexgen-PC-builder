import React, { useState, useEffect } from "react";
import { Upload, ChevronLeft } from "lucide-react";
import { Cross } from "lucide-react";
import { CATEGORY_SPECS } from "../../../config/componentFields";
import api from "../../../api/axios";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  createComponent,
  updateComponent,
  fetchComponentById,
} from "../../../store/slices/componentSlice";

const ComponentForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isEditMode = !!id;

  const [baseData, setBaseData] = useState({
    name: "",
    price: "",
    stock: "",
    category: "",
    tier_level: 1,
    image: "",
  });

  const [specs, setSpecs] = useState({});
  const { loading } = useSelector((state) => state.components);

  console.log(specs)

  useEffect(() => {
    if (isEditMode) {
      dispatch(fetchComponentById(id))
        .unwrap()
        .then((data) => {
          setBaseData({
            name: data.name,
            price: data.price,
            stock: data.stock,
            category: data.category,
            tier_level: data.tier_level,
            image: data.image,
          });
          setSpecs(data.specs || {});
        })
        .catch((err) => {
          console.error("Failed to fetch component:", err);
          alert("Failed to fetch component details");
          navigate("/admin/components");
        });
    }
  }, [id, isEditMode, dispatch, navigate]);

  const handleBaseChange = (e) => {
    setBaseData({ ...baseData, [e.target.name]: e.target.value });
  };

  const handleCategoryChange = (e) => {
    const newCategory = e.target.value;
    setBaseData({ ...baseData, category: newCategory });
    setSpecs({});
  };

  const handleSpecChange = (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setSpecs({ ...specs, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...baseData,
      specs: specs,
    };

    try {
      if (isEditMode) {
        await dispatch(updateComponent({ id, data: payload })).unwrap();
        alert("Component Updated Successfully!");
      } else {
        await dispatch(createComponent(payload)).unwrap();
        alert("Component Created Successfully!");
      }
      navigate("/admin/components");
    } catch (error) {
      console.error("Error saving component:", error);
      alert(`Error ${isEditMode ? "updating" : "creating"} component`);
    }
  };

  const renderSpecField = (field) => {
    const commonClasses =
      "w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition";

    if (field.type === "select") {
      return (
        <select
          name={field.name}
          onChange={handleSpecChange}
          className={commonClasses}
          value={specs[field.name] || ""}
        >
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
            name={field.name}
            onChange={handleSpecChange}
            checked={!!specs[field.name]}
            className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
          />
          <span className="ml-2 text-gray-700">{field.label}</span>
        </div>
      );
    }

    if(field.type==="file"){
      return(
               <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-600 mb-1">
                
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-gray-500 bg-gray-50 hover:bg-gray-100 transition relative">
                  {specs[field.name] && specs[field.name] !== "" ? (
                    <div className="relative w-full h-48 flex justify-center">
                      <img
                        src={specs[field.name]}
                        alt="Preview"
                        className="h-full object-contain rounded-md"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setSpecs((prev) => ({ ...prev ,[field.name]:""}))
                        }
                        className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                      >
                        <Cross size={16} className="rotate-45" />{" "}
                       
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
                        onChange={async (e) => {
                          const file = e.target.files[0];
                          if (!file) return;

                          const formData = new FormData();
                          formData.append("image", file);

                          try {
                            // Show loading state if needed
                            const res = await api.post("/upload", formData, {
                              headers: {
                                "Content-Type": "multipart/form-data",
                              },
                            });
                            setSpecs((prev) => ({
                              ...prev,
                              [field.name]: res.data.imageUrl,
                            }));
                          } catch (error) {
                            console.error("Upload failed", error);
                            alert("Image upload failed");
                          }
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </>
                  )}
                </div>
              </div>     

      )
    }

    return (
      <input
        type={field.type}
        name={field.name}
        placeholder={field.placeholder || ""}
        onChange={handleSpecChange}
        value={specs[field.name] || ""}
        className={commonClasses}
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

        <form onSubmit={handleSubmit} className="space-y-8">
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
                  required
                  type="text"
                  name="name"
                  value={baseData.name}
                  onChange={handleBaseChange}
                  className="w-full border border-gray-300 rounded-md p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Price (₹)
                </label>
                <input
                  required
                  type="number"
                  name="price"
                  value={baseData.price}
                  onChange={handleBaseChange}
                  className="w-full border border-gray-300 rounded-md p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Stock Quantity
                </label>
                <input
                  required
                  type="number"
                  name="stock"
                  value={baseData.stock}
                  onChange={handleBaseChange}
                  className="w-full border border-gray-300 rounded-md p-2"
                />
              </div>

              {/* Image Upload Section */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Product Image
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-gray-500 bg-gray-50 hover:bg-gray-100 transition relative">
                  {baseData.image && baseData.image !== "" ? (
                    <div className="relative w-full h-48 flex justify-center">
                      <img
                        src={baseData.image}
                        alt="Preview"
                        className="h-full object-contain rounded-md"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setBaseData((prev) => ({ ...prev, image: "" }))
                        }
                        className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                      >
                        <Upload size={16} className="rotate-45" />{" "}
                        {/* Using rotate to mimic X */}
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
                        onChange={async (e) => {
                          const file = e.target.files[0];
                          if (!file) return;

                          const formData = new FormData();
                          formData.append("image", file);

                          try {
                            // Show loading state if needed
                            const res = await api.post("/upload", formData, {
                              headers: {
                                "Content-Type": "multipart/form-data",
                              },
                            });
                            setBaseData((prev) => ({
                              ...prev,
                              image: res.data.imageUrl,
                            }));
                          } catch (error) {
                            console.error("Upload failed", error);
                            alert("Image upload failed");
                          }
                        }}
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
              name="category"
              value={baseData.category}
              onChange={handleCategoryChange}
              className={`w-full border border-gray-300 rounded-md p-3 text-lg ${
                isEditMode ? "bg-gray-200 appearance-none" : ""
              }`}
              disabled={isEditMode} // Disable category change in edit mode to prevent schema mismatch issues
            >
              <option value="">Select Category...</option>
              {Object.keys(CATEGORY_SPECS).map((cat) => (
                <option key={cat} value={cat}>
                  {cat.toUpperCase()}
                </option>
              ))}
            </select>
            {isEditMode && (
              <p className="text-sm text-gray-500 mt-1">
                Category cannot be changed during edit.
              </p>
            )}
          </div>

          {/* SECTION C: Dynamic Technical Specs */}
          {baseData.category && (
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 fade-in">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">
                Section C: Technical Specs ({baseData.category.toUpperCase()})
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 1. Render Specific Fields based on Category */}
                {CATEGORY_SPECS[baseData.category].map((field) => (
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
                    name="tier_level"
                    onChange={handleBaseChange}
                    value={baseData.tier_level}
                    className="w-full border border-gray-300 rounded-md p-2"
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
    </div>
  );
};

export default ComponentForm;
