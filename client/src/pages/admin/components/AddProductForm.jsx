import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchComponents,
  selectPart,
  resetBuild,
} from "../../../store/slices/builderSlice";
import { createProduct } from "../../../store/slices/productSlice";
import { useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  Cpu,
  HardDrive,
  Monitor,
  Box,
  Zap,
  Wind,
  Save,
  ArrowLeft,
} from "lucide-react";


const PartSelector = ({
  category,
  label,
  icon: Icon,
  options,
  selected,
  disabled,
  onSelect,
}) => (
  <div
    className={`p-6 bg-white rounded-xl shadow-sm border border-gray-100 ${
      disabled ? "opacity-50 pointer-events-none" : ""
    }`}
  >
    <div className="flex items-center gap-3 mb-4">
      <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
        <Icon size={24} />
      </div>
      <h3 className="text-lg font-semibold text-gray-800">{label}</h3>
    </div>

    <div className="grid grid-cols-1 gap-4">
      {selected ? (
        <div className="flex justify-between items-center p-4 bg-blue-50 border border-blue-100 rounded-lg">
          <div>
            <p className="font-bold text-gray-900">{selected.name}</p>
            <p className="text-sm text-gray-600">
              ₹{(selected.price / 100).toLocaleString()}
            </p>
          </div>
          <button
            onClick={() => onSelect(category, null)} 
            className="text-sm text-red-600 hover:underline font-medium"
          >
            Change
          </button>
        </div>
      ) : (
        <select
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
          onChange={(e) => {
            const part = options.find((o) => o._id === e.target.value);
            onSelect(category, part);
          }}
          defaultValue=""
        >
          <option value="" disabled>
            Select {label}...
          </option>
          {options?.map((opt) => (
            <option key={opt._id} value={opt._id}>
              {opt.name} - ₹{(opt.price / 100).toLocaleString()}
            </option>
          ))}
        </select>
      )}
    </div>
  </div>
);

const AddProductForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { selected, options, totalPrice, estimatedWattage } = useSelector(
    (state) => state.builder
  );

  // const { id } = useParams();
  // console.log("[AddProductForm] Render. Options:", options);
  // console.log("[AddProductForm] Selected:", selected);


  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "Gaming", 
    base_price: "", 
    images: [],
  });


 
  useEffect(() => {
    dispatch(resetBuild());
    dispatch(fetchComponents({ category: "cpu" }));
    dispatch(fetchComponents({ category: "storage" }));
     
  }, [dispatch]);

  useEffect(()=>{
    if(selected.case){
      setFormData(p=>({...p,images:[...p.images,selected?.cooler?.specs.coolerType==='Liquid'?selected.case.specs.image_liquid_cooler:selected.case.specs.image_air_cooler]}))
    }

    return ()=> setFormData(p=>({...p,images:[]}))

  },[selected.case,selected.cooler])
  useEffect(() => {
    if (selected.cpu) {
      dispatch(
        fetchComponents({
          category: "motherboard",
          params: { cpuId: selected.cpu._id },
        })
      );
      dispatch(
        fetchComponents({
          category: "cooler",
          params: { cpuId: selected.cpu._id },
        })
      );
      dispatch(
        fetchComponents({
          category: "gpu",
          params: { maxTier: selected.cpu.tier_level + 1 },
        })
      );
    }
  }, [dispatch, selected.cpu]);

  useEffect(() => {
    if (selected.motherboard) {
      dispatch(
        fetchComponents({
          category: "ram",
          params: { motherboardId: selected.motherboard._id },
        })
      );
      dispatch(
        fetchComponents({
          category: "case",
          params: { motherboardId: selected.motherboard._id },
        })
      );
    }
  }, [dispatch, selected.motherboard]);

  useEffect(() => {
    if (estimatedWattage > 0) {
      dispatch(
        fetchComponents({
          category: "psu",
          params: { minWattage: estimatedWattage + 150 },
        })
      );
    }
  }, [dispatch, estimatedWattage]);

  const handleSelect = (category, component) => {
    dispatch(selectPart({ category, component }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
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
      alert(
        `Please select all components. Missing: ${missingParts.join(", ")}`
      );
      return;
    }

    if (!formData.name || !formData.description) {
      alert("Please fill in all product details.");
      return;
    }

    // Construct Payload
    const productPayload = {
      ...formData,
      base_price: formData.base_price
        ? Number(formData.base_price)
        : totalPrice,
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

    console.log('product payload --------',productPayload)

    try {
      await dispatch(createProduct(productPayload)).unwrap().then((data)=>console.log(data));
      alert("Product Created Successfully!");
      navigate("/admin/products");
    } catch (error) {
      alert(`Error creating product: ${error}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-10 pb-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-200 rounded-full"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            Create New Pre-Built PC
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
                    className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. Nexgen Ultra Gaming PC"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <select
                      className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                    >
                      <option value="Gaming">Gaming</option>
                      <option value="Office">Office</option>
                      <option value="Workstation">Workstation</option>
                    </select>
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
                      value={formData.base_price}
                      onChange={(e) =>
                        setFormData({ ...formData, base_price: e.target.value })
                      }
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Leave empty to use sum of parts cost.
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 h-32"
                    placeholder="Describe the features of this build..."
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </div>

                
              </div>
            </div>

            {/* 2. Component Selection Section */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-800">Configuration</h2>

              <PartSelector
                category="cpu"
                label="Processor (CPU)"
                icon={Cpu}
                options={options.cpu}
                selected={selected.cpu}
                onSelect={handleSelect}
              />
              <PartSelector
                category="motherboard"
                label="Motherboard"
                icon={Box}
                options={options.motherboard}
                selected={selected.motherboard}
                onSelect={handleSelect}
                disabled={!selected.cpu}
              />
              <PartSelector
                category="ram"
                label="Memory (RAM)"
                icon={Box}
                options={options.ram}
                selected={selected.ram}
                onSelect={handleSelect}
                disabled={!selected.motherboard}
              />
              <PartSelector
                category="gpu"
                label="Graphics Card"
                icon={Monitor}
                options={options.gpu}
                selected={selected.gpu}
                onSelect={handleSelect}
                disabled={!selected.cpu}
              />
              <PartSelector
                category="storage"
                label="Storage (SSD)"
                icon={HardDrive}
                options={options.storage}
                selected={selected.storage}
                onSelect={handleSelect}
              />
              <PartSelector
                category="case"
                label="PC Case"
                icon={Box}
                options={options.case}
                selected={selected.case}
                onSelect={handleSelect}
                disabled={!selected.motherboard}
              />
              <PartSelector
                category="cooler"
                label="CPU Cooler"
                icon={Wind}
                options={options.cooler}
                selected={selected.cooler}
                onSelect={handleSelect}
                disabled={!selected.cpu}
              />
              <PartSelector
                category="psu"
                label="Power Supply"
                icon={Zap}
                options={options.psu}
                selected={selected.psu}
                onSelect={handleSelect}
                disabled={!selected.gpu}
              />
            </div>
          </div>

          {/* RIGHT COLUMN: Sticky Summary & Action */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Build Summary
              </h2>

              <div className="aspect-video bg-gray-100 rounded-lg mb-6 flex items-center justify-center overflow-hidden">
               {selected.case ? (
                  <img
                    src={selected?.cooler?.specs.coolerType==='Liquid'?selected.case.specs.image_liquid_cooler:selected.case.specs.image_air_cooler}
                    alt="Case Preview"
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
                    )
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
                {formData.base_price && (
                  <div className="flex justify-between items-center text-lg font-bold text-green-600 mt-2">
                    <span>Selling Price</span>
                    <span>
                      ₹{(Number(formData.base_price) / 100).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              <button
                onClick={handleSubmit}
                className="w-full bg-blue-600 text-white py-3.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <Save size={20} /> Create Product
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProductForm;
