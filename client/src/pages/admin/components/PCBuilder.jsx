import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchComponents ,selectPart } from "../../../store/slices/builderSlice";
import { ShoppingCart, Cpu, HardDrive, Monitor, Box, Zap, Wind } from "lucide-react"; 

// (Import relevant icons)

// Helper component for a single selection row
const PartSelector = ({ category, label, icon: Icon, options, selected, disabled, onSelect }) => (
  <div className={`p-6 bg-white rounded-xl shadow-sm border border-gray-100 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
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
            <p className="text-sm text-gray-600">₹{(selected.price / 100).toLocaleString()}</p>
          </div>
          <button 
            onClick={() => onSelect(category, null)} // Deselect
            className="text-sm text-red-600 hover:underline font-medium"
          >
            Change
          </button>
        </div>
      ) : (
        <select
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
          onChange={(e) => {
            const part = options.find(o => o._id === e.target.value);
            onSelect(category, part);
          }}
          defaultValue=""
        >
          <option value="" disabled>Select {label}...</option>
          {options.map(opt => (
            <option key={opt._id} value={opt._id}>
              {opt.name} - ₹{(opt.price / 100).toLocaleString()}
            </option>
          ))}
        </select>
      )}
    </div>
  </div>
);

const PCBuilder = () => {
  const dispatch = useDispatch();
  const { selected, options, totalPrice, estimatedWattage, loading } = useSelector((state) => state.builder);

  // --- CASCADING LOGIC (The "Brain") ---

  // 1. Initial Load: Fetch CPUs
  useEffect(() => {
    dispatch(fetchComponents({ category: 'cpu' }));
    // Fetch independent parts that don't depend on CPU/Mobo immediately
    dispatch(fetchComponents({ category: 'storage' })); 
    // dispatch(fetchComponents({ category: 'case' })); // Case might depend on GPU/Mobo later
  }, [dispatch]);

  // 2. When CPU Changes -> Fetch Compatible Motherboards & Coolers
  useEffect(() => {
    if (selected.cpu) {
      dispatch(fetchComponents({ 
        category: 'motherboard', 
        params: { cpuId: selected.cpu._id } 
      }));
      dispatch(fetchComponents({ 
        category: 'cooler', 
        params: { cpuId: selected.cpu._id } 
      }));
    }
  }, [dispatch, selected.cpu]);

  // 3. When Motherboard Changes -> Fetch Compatible RAM
  useEffect(() => {
    if (selected.motherboard) {
      dispatch(fetchComponents({ 
        category: 'ram', 
        params: { motherboardId: selected.motherboard._id } 
      }));
      // Also fetch cases now that we know Mobo form factor (optional logic)
      dispatch(fetchComponents({ 
        category: 'case', 
        params: { motherboardId: selected.motherboard._id } 
      }));
    }
  }, [dispatch, selected.motherboard]);

  // 4. When GPU or CPU Changes -> Fetch PSUs (Power Calculation)
  // Note: We fetch GPUs based on CPU Tier to prevent bottleneck
  useEffect(() => {
    if (selected.cpu) {
        dispatch(fetchComponents({
            category: 'gpu',
            params: { maxTier: selected.cpu.tier_level + 1 } // Logic: GPU can be +1 tier of CPU
        }));
    }
  }, [dispatch, selected.cpu]);

  // 5. Fetch PSU based on Wattage (Reactive to all power parts)
  useEffect(() => {
    // Simple calc: total wattage + buffer
    if (estimatedWattage > 0) {
        dispatch(fetchComponents({
            category: 'psu',
            params: { minWattage: estimatedWattage + 150 } // 150W buffer
        }));
    }
  }, [dispatch, estimatedWattage]);


  const handleSelect = (category, component) => {
    dispatch(selectPart({ category, component }));
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Builder Interface */}
        <div className="lg:col-span-2 space-y-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Build Your Custom PC</h1>
            <p className="text-gray-600 mt-2">Select components to create your dream machine. We'll ensure everything is compatible.</p>
          </div>

          {/* Component Steps */}
          <PartSelector 
            category="cpu" label="Processor (CPU)" icon={Cpu} 
            options={options.cpu} selected={selected.cpu} onSelect={handleSelect} 
          />

          <PartSelector 
            category="motherboard" label="Motherboard" icon={Box} 
            options={options.motherboard} selected={selected.motherboard} onSelect={handleSelect} 
            disabled={!selected.cpu} // Locked until CPU picked
          />

          <PartSelector 
            category="ram" label="Memory (RAM)" icon={Box} 
            options={options.ram} selected={selected.ram} onSelect={handleSelect} 
            disabled={!selected.motherboard} // Locked until Mobo picked
          />

          <PartSelector 
            category="gpu" label="Graphics Card" icon={Monitor} 
            options={options.gpu} selected={selected.gpu} onSelect={handleSelect} 
            disabled={!selected.cpu} // Locked until CPU (for bottleneck check)
          />

          <PartSelector 
            category="storage" label="Storage (SSD)" icon={HardDrive} 
            options={options.storage} selected={selected.storage} onSelect={handleSelect} 
          />
          
          <PartSelector 
            category="case" label="PC Case" icon={Box} 
            options={options.case} selected={selected.case} onSelect={handleSelect} 
            disabled={!selected.motherboard}
          />

           <PartSelector 
            category="cooler" label="CPU Cooler" icon={Wind} 
            options={options.cooler} selected={selected.cooler} onSelect={handleSelect} 
            disabled={!selected.cpu}
          />

           <PartSelector 
            category="psu" label="Power Supply" icon={Zap} 
            options={options.psu} selected={selected.psu} onSelect={handleSelect} 
            disabled={!selected.gpu} // Wait for major power draws
          />

        </div>

        {/* RIGHT COLUMN: Summary Sticky Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Build Summary</h2>
            
            {/* Dynamic Image Preview (Based on Case) */}
            <div className="aspect-video bg-gray-100 rounded-lg mb-6 flex items-center justify-center overflow-hidden">
              {selected.case ? (
                <img src={selected.case.image} alt="Case Preview" className="w-full h-full object-cover" />
              ) : (
                <p className="text-gray-400">Select a case to view</p>
              )}
            </div>

            {/* Specs List */}
            <div className="space-y-3 mb-6 max-h-60 overflow-y-auto">
              {Object.entries(selected).map(([key, part]) => (
                part && (
                  <div key={key} className="flex justify-between text-sm">
                    <span className="text-gray-500 capitalize">{key}</span>
                    <span className="font-medium text-gray-800 truncate w-40 text-right">{part.name}</span>
                  </div>
                )
              ))}
            </div>

            <div className="border-t border-gray-100 pt-4 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Estimated Wattage</span>
                <span className="font-medium text-gray-900">{estimatedWattage}W</span>
              </div>
              <div className="flex justify-between items-center text-xl font-bold text-gray-900">
                <span>Total</span>
                <span>₹{(totalPrice / 100).toLocaleString()}</span>
              </div>
            </div>

            <button 
              disabled={!selected.psu || !selected.case} // Simple validation: Disable until done
              className="w-full bg-blue-600 text-white py-3.5 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              <ShoppingCart size={20} /> Add to Cart
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PCBuilder;