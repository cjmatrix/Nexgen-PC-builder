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
    query.isActive = status === "avaialable" ? true : false;
  if (category) query.category = category;
  if (search) query.name = { $regex: search, $options: "i" };

  let sortLogic = { createdAt: -1 }; // Default: Newest first

  // Handle explicit sort parameter
  if (sort === "price_high") sortLogic = { price: -1 };
  else if (sort === "price_low") sortLogic = { price: 1 };
  else if (sort === "stock_low") sortLogic = { stock: 1 };
  else if (sort === "newest") sortLogic = { createdAt: -1 };
  else if (sort === "oldest") sortLogic = { createdAt: 1 };

  // Fallback for status-based sorting (legacy support if needed, or just prioritize explicit sort)
  if (!sort && status === "stock_low") sortLogic = { stock: 1 };

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

module.exports = {
  createComponent,
  getAdminComponents,
  deleteComponent,
};
