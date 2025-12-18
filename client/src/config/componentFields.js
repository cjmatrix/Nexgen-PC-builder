export const CATEGORY_SPECS = {
  cpu: [
    {
      name: "socket",
      label: "Socket Type",
      type: "text",
      placeholder: "e.g., LGA1700",
    },
    { name: "cores", label: "Cores", type: "number" },
    { name: "threads", label: "Threads", type: "number" },
    { name: "wattage", label: "TDP (Watts)", type: "number" },
    {
      name: "integratedGraphics",
      label: "Integrated Graphics?",
      type: "checkbox",
    },
  ],
  gpu: [
    { name: "vram_gb", label: "VRAM (GB)", type: "number" },
    { name: "length_mm", label: "Length (mm)", type: "number" },
    { name: "wattage", label: "TDP (Watts)", type: "number" },
    {
      name: "recommendedPsuWattage",
      label: "Rec. PSU (Watts)",
      type: "number",
    },
    { name: "boostClock_mhz", label: "Boost Clock (MHz)", type: "number" },
  ],
  motherboard: [
    {
      name: "socket",
      label: "Socket Type",
      type: "text",
      placeholder: "e.g., LGA1700",
    },
    {
      name: "formFactor",
      label: "Form Factor",
      type: "select",
      options: ["ATX", "mATX", "ITX"],
    },
    {
      name: "ramType",
      label: "RAM Type",
      type: "text",
      placeholder: "e.g., DDR5",
    },
    { name: "ramSlots", label: "RAM Slots", type: "number" },
    { name: "wifi", label: "Has Wi-Fi?", type: "checkbox" },
  ],
  ram: [
    { name: "ramType", label: "Type", type: "text", placeholder: "e.g., DDR5" },
    { name: "capacity_gb", label: "Total Capacity (GB)", type: "number" },
    { name: "speed_mhz", label: "Speed (MHz)", type: "number" },
    {
      name: "modules",
      label: "Modules",
      type: "text",
      placeholder: "e.g., 2x16GB",
    },
  ],
  storage: [
    {
      name: "storageType",
      label: "Type",
      type: "text",
      placeholder: "e.g., SSD-NVME",
    },
    { name: "capacity_gb", label: "Capacity (GB)", type: "number" },
  ],
  case: [
    {
      name: "formFactor",
      label: "Max Mobo Size",
      type: "select",
      options: ["ATX", "mATX", "ITX"],
    },
    { name: "maxGpuLength_mm", label: "Max GPU Length (mm)", type: "number" },
    {
      name: "image_air_cooler",
      label: "Air Cooler Variant Image URL",
      type: "file",
    },
    {
      name: "image_liquid_cooler",
      label: "Liquid Cooler Variant Image URL",
      type: "file",
    },
  ],
  psu: [
    { name: "wattage", label: "Wattage", type: "number" },
    {
      name: "efficiencyRating",
      label: "Efficiency",
      type: "text",
      placeholder: "e.g., Gold",
    },
    {
      name: "modular",
      label: "Modular",
      type: "text",
      placeholder: "e.g., Full",
    },
  ],
  cooler: [
    {
      name: "coolerType",
      label: "Type",
      type: "text",
      placeholder: "e.g., Liquid",
    },
    {
      name: "radiatorSize_mm",
      label: "Size (mm)",
      type: "number",
      placeholder: "0 if Air",
    },
  ],
};
