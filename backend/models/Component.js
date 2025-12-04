const mongoose = require('mongoose');

// ======================================================
// 1. Define Base Schema Options
// ======================================================
const baseOptions = {
  discriminatorKey: 'category', // This tells Mongoose to look at the 'category' field
  collection: 'components',     // All parts are stored in the 'components' collection
  timestamps: true              // Adds createdAt and updatedAt automatically
};

// ======================================================
// 2. The Base Schema (Fields common to ALL parts)
// ======================================================
const componentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a component name'],
    trim: true,
    unique: true
  },
  price: {
    type: Number,
    required: [true, 'Please add a price'],
    min: [0, 'Price cannot be negative'],
    // Helper to ensure we always store integers (e.g. 10000 paise instead of 100.00)
    get: v => Math.round(v),
    set: v => Math.round(v)
  },
  stock: {
    type: Number,
    required: [true, 'Please add stock quantity'],
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  image: {
    type: String,
    required: [true, 'Please upload an image URL']
  },
  tier_level: {
    type: Number,
    required: [true, 'Please assign a tier level (1-5)'],
    min: 1,
    max: 5,
    description: "1=Entry, 2=Budget, 3=Mid, 4=High, 5=Ultra"
  },
  isActive: {
    type: Boolean,
    default: true, // Used for Soft Delete
    index: true
  }
  // The 'category' field is added automatically by Mongoose due to baseOptions
}, baseOptions);

// Initialize the Base Model
const Component = mongoose.model('Component', componentSchema);

// ======================================================
// 3. Define Specific Schemas (The "Specs" for each type)
// ======================================================

// --- CPU Schema ---
const CpuSchema = new mongoose.Schema({
  specs: {
    socket: { type: String, required: true }, // e.g., "LGA1700"
    cores: { type: Number, required: true },
    threads: { type: Number, required: true },
    wattage: { type: Number, required: true }, // TDP
    integratedGraphics: { type: Boolean, default: false }
  }
});

// --- GPU Schema ---
const GpuSchema = new mongoose.Schema({
  specs: {
    vram_gb: { type: Number, required: true },
    length_mm: { type: Number, required: true }, // Crucial for Case fit
    wattage: { type: Number, required: true },
    recommendedPsuWattage: { type: Number, required: true }, // Crucial for PSU calc
    boostClock_mhz: { type: Number },
    pcieStandard: { type: String } // e.g. "PCIe 4.0"
  }
});

// --- Motherboard Schema ---
const MotherboardSchema = new mongoose.Schema({
  specs: {
    socket: { type: String, required: true }, // Must match CPU
    formFactor: { type: String, enum: ['ATX', 'mATX', 'ITX'], required: true },
    ramType: { type: String, enum: ['DDR4', 'DDR5'], required: true },
    ramSlots: { type: Number, required: true },
    chipset: { type: String }, // e.g. "Z790"
    wifi: { type: Boolean, default: false }
  }
});

// --- RAM Schema ---
const RamSchema = new mongoose.Schema({
  specs: {
    ramType: { type: String, enum: ['DDR4', 'DDR5'], required: true },
    capacity_gb: { type: Number, required: true }, // Total size (e.g., 32)
    speed_mhz: { type: Number, required: true },
    modules: { type: String, required: true }, // e.g., "2x16GB"
    casLatency: { type: Number }
  }
});

// --- Storage Schema ---
const StorageSchema = new mongoose.Schema({
  specs: {
    storageType: { type: String, enum: ['SSD-NVME', 'SSD-SATA', 'HDD'], required: true },
    capacity_gb: { type: Number, required: true },
    readSpeed_mbps: { type: Number }
  }
});

// --- Case Schema ---
const CaseSchema = new mongoose.Schema({
  specs: {
    formFactor: { type: String, enum: ['ATX', 'mATX', 'ITX'], required: true }, // Max size supported
    maxGpuLength_mm: { type: Number, required: true },
    maxCpuCoolerHeight_mm: { type: Number },
    powerSupplySupport: { type: String, enum: ['ATX', 'SFX'], default: 'ATX' },
    // Visuals for the Builder
    image_air_cooler: { type: String },
    image_liquid_cooler: { type: String }
  }
});

// --- PSU Schema ---
const PsuSchema = new mongoose.Schema({
  specs: {
    wattage: { type: Number, required: true },
    efficiencyRating: { type: String, enum: ['Bronze', 'Silver', 'Gold', 'Platinum', 'Titanium'] },
    modular: { type: String, enum: ['Full', 'Semi', 'Non'] }
  }
});

// --- Cooler Schema ---
const CoolerSchema = new mongoose.Schema({
  specs: {
    coolerType: { type: String, enum: ['Air', 'Liquid'], required: true },
    radiatorSize_mm: { type: Number }, // e.g., 240, 360 (0 if Air)
    fanSize_mm: { type: Number },
    compatibleSockets: [{ type: String }] // Array: ["LGA1700", "AM5"]
  }
});

// ======================================================
// 4. Register Discriminators
// ======================================================
// This maps the 'category' string to the specific schema

Component.discriminator('cpu', CpuSchema);
Component.discriminator('gpu', GpuSchema);
Component.discriminator('motherboard', MotherboardSchema);
Component.discriminator('ram', RamSchema);
Component.discriminator('storage', StorageSchema);
Component.discriminator('case', CaseSchema);
Component.discriminator('psu', PsuSchema);
Component.discriminator('cooler', CoolerSchema);

module.exports = Component;