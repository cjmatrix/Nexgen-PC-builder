import mongoose from "mongoose";

const baseOptions = {
  discriminatorKey: "category",
  collection: "components",
  timestamps: true,
};

const componentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a component name"],
      trim: true,
      unique: true,
    },
    price: {
      type: Number,
      required: [true, "Please add a price"],
      min: [0, "Price cannot be negative"],

      get: (v) => Math.round(v),
      set: (v) => Math.round(v),
    },
    stock: {
      type: Number,
      required: [true, "Please add stock quantity"],
      min: [0, "Stock cannot be negative"],
      default: 0,
    },
    image: {
      type: String,
      required: [true, "Please upload an image URL"],
    },
    tier_level: {
      type: Number,
      required: [true, "Please assign a tier level (1-5)"],
      min: 1,
      max: 5,
      description: "1=Entry, 2=Budget, 3=Mid, 4=High, 5=Ultra",
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  baseOptions
);

const Component = mongoose.model("Component", componentSchema);

const CpuSchema = new mongoose.Schema({
  specs: {
    socket: { type: String, required: true, uppercase: true, trim: true },
    cores: { type: Number, required: true },
    threads: { type: Number, required: true },
    wattage: { type: Number, required: true },
    integratedGraphics: { type: Boolean, default: false },
  },
});

const GpuSchema = new mongoose.Schema({
  specs: {
    vram_gb: { type: Number, required: true },
    length_mm: { type: Number, required: true },
    wattage: { type: Number, required: true },
    recommendedPsuWattage: { type: Number, required: true },
    boostClock_mhz: { type: Number },
    pcieStandard: { type: String, uppercase: true, trim: true },
  },
});

const MotherboardSchema = new mongoose.Schema({
  specs: {
    socket: { type: String, required: true, uppercase: true, trim: true }, // Must match CPU
    formFactor: { type: String, required: true,},
    ramType: { type: String, required: true, uppercase: true, trim: true },
    ramSlots: { type: Number, required: true },
    chipset: { type: String, uppercase: true, trim: true }, // e.g. "Z790"
    wifi: { type: Boolean, default: false },
  },
});

const RamSchema = new mongoose.Schema({
  specs: {
    ramType: { type: String, required: true, trim: true },
    capacity_gb: { type: Number, required: true },
    speed_mhz: { type: Number, required: true },
    modules: { type: String, required: true },
    casLatency: { type: Number },
  },
});

const StorageSchema = new mongoose.Schema({
  specs: {
    storageType: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    capacity_gb: { type: Number, required: true },
    readSpeed_mbps: { type: Number },
  },
});

const CaseSchema = new mongoose.Schema({
  specs: {
    formFactor: { type: String, required: true,},
    maxGpuLength_mm: { type: Number, required: true },
    maxCpuCoolerHeight_mm: { type: Number },
    powerSupplySupport: {
      type: String,
      default: "ATX",
      uppercase: true,
      trim: true,
    },

    image_air_cooler: { type: String },
    image_liquid_cooler: { type: String },
  },
});

const PsuSchema = new mongoose.Schema({
  specs: {
    wattage: { type: Number, required: true },
    efficiencyRating: {
      type: String,
    },
    modular: { type: String },
  },
});

const CoolerSchema = new mongoose.Schema({
  specs: {
    coolerType: { type: String, required: true, uppercase: true, trim: true },
    radiatorSize_mm: { type: Number },
    fanSize_mm: { type: Number },
    compatibleSockets: [{ type: String }],
  },
});

Component.discriminator("cpu", CpuSchema);
Component.discriminator("gpu", GpuSchema);
Component.discriminator("motherboard", MotherboardSchema);
Component.discriminator("ram", RamSchema);
Component.discriminator("storage", StorageSchema);
Component.discriminator("case", CaseSchema);
Component.discriminator("psu", PsuSchema);
Component.discriminator("cooler", CoolerSchema);

export default Component;
