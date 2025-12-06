const Component = require("../models/Component");

const createComponent = async (componentData) => {
  const component = await Component.create(componentData);
  return component;
};

const getAdminComponents = async (
  page,
  limit,
  search,
  category,
  status,
  sort
) => {
  const query = {};
  if (status && status !== "stock_low")
    query.isActive = status === "available" ? true : false;
  if (category) query.category = category;
  if (search) query.name = { $regex: search, $options: "i" };

  let sortLogic = { createdAt: -1, _id: 1 }; // Default: Newest first

  // Handle explicit sort parameter
  if (sort === "price_high") sortLogic = { price: -1, _id: 1 };
  else if (sort === "price_low") sortLogic = { price: 1, _id: 1 };
  else if (sort === "stock_low") sortLogic = { stock: 1, _id: 1 };
  else if (sort === "newest") sortLogic = { createdAt: -1, _id: 1 };
  else if (sort === "oldest") sortLogic = { createdAt: 1, _id: 1 };

  // Fallback for status-based sorting (legacy support if needed, or just prioritize explicit sort)
  if (!sort && status === "stock_low") sortLogic = { stock: 1, _id: 1 };

  const total = await Component.countDocuments(query);
  const components = await Component.find(query)
    .sort(sortLogic)
    .limit(limit)
    .skip((page - 1) * limit);

  return {
    components,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
  };
};

const deleteComponent = async (userId) => {
  const component = await Component.findById(userId);

  component.isActive = component.isActive ? false : true;

  component.save();

  return component;
};

const getComponentById = async (id) => {
  const component = await Component.findById(id);
  if (!component) {
    throw new Error("Component not found");
  }
  return component;
};

const updateComponent = async (id, updateData) => {
  const component = await Component.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });
  if (!component) {
    throw new Error("Component not found");
  }
  return component;
};

const getPublicComponents = async (filters, page, limit, sort) => {
  const query = { isActive: true }; // Only show active items to users

  // Basic Filters
  if (filters.category) query.category = filters.category;
  if (filters.search) query.name = { $regex: filters.search, $options: "i" };

  // Direct Tier Filter (if user selects "Show me Tier 3 CPUs")
  if (filters.tier) query.tier_level = Number(filters.tier);

  // --- COMPATIBILITY QUERY BUILDER ---

  // 1. Socket (For Motherboards & Coolers)
  if (filters.socket) {
    if (filters.category === "motherboard") {
      query["specs.socket"] = filters.socket;
    } else if (filters.category === "cooler") {
      query["specs.compatibleSockets"] = filters.socket;
    }
  }

  // 2. RAM Type (For RAM sticks)
  if (filters.ramType && filters.category === "ram") {
    query["specs.ramType"] = filters.ramType;
  }

  // 3. Form Factor (For Cases)
  if (filters.formFactor && filters.category === "case") {
    // Logic: If Mobo is mATX, we need a case that supports mATX.
    // Most ATX cases support mATX too.
    // Simple exact match or $in logic:
    if (filters.formFactor === "ITX") {
      // ITX boards fit in everything usually, but let's be specific if needed
      query["specs.formFactor"] = { $in: ["ATX", "mATX", "ITX"] };
    } else if (filters.formFactor === "mATX") {
      query["specs.formFactor"] = { $in: ["ATX", "mATX"] };
    } else if (filters.formFactor === "ATX") {
      query["specs.formFactor"] = "ATX";
    }
  }

  // 4. GPU Length (For Cases - must be big enough)
  if (filters.minGpuLength) {
    query["specs.maxGpuLength_mm"] = { $gte: Number(filters.minGpuLength) };
  }

  // 5. Case Max Length (For GPUs - must be small enough)
  if (filters.maxGpuLength) {
    query["specs.length_mm"] = { $lte: Number(filters.maxGpuLength) };
  }

  // 6. Wattage (For PSUs)
  if (filters.minWattage) {
    query["specs.wattage"] = { $gte: Number(filters.minWattage) };
  }

  // 7. Bottleneck Check (For GPUs)
  if (filters.maxTier && filters.category === "gpu") {
    query.tier_level = { $lte: Number(filters.maxTier) };
  }

  // Sorting
  let sortOptions = { price: 1 }; // Default cheap to expensive
  if (sort === "price_desc") sortOptions = { price: -1 };
  if (sort === "tier_high") sortOptions = { tier_level: -1 };

  // console.log("--- DEBUG: getPublicComponents ---");
  // console.log("Filters:", JSON.stringify(filters, null, 2));
  // console.log("Constructed Query:", JSON.stringify(query, null, 2));
 
  const total = await Component.countDocuments(query);
  const components = await Component.find(query)
    .sort(sortOptions)
    .limit(limit)
    .skip((page - 1) * limit);

  return {
    components,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
  };
};

module.exports = {
  createComponent,
  getAdminComponents,
  deleteComponent,
  getComponentById,
  updateComponent,
  getPublicComponents,
};
