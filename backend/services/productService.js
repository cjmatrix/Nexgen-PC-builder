const Product = require("../models/Product");

const createProduct = async (productData) => {
  if (!productData.slug) {
    productData.slug = productData.name.toLowerCase().split(" ").join("-");
  }
  const product = await Product.create(productData);
  return product;
};

const getAdminProducts = async (page, limit, search, category, status) => {
  const query = {};

  if (search) {
    query.name = { $regex: search, $options: "i" };
  }

  if (category) {
    query.category = category;
  }

  if (status === "active") query.isActive = true;
  if (status === "inactive") query.isActive = false;

  const total = await Product.countDocuments(query);

  const products = await Product.find(query)
    .populate("default_config.cpu", "name") 
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip((page - 1) * limit);

  return {
    products,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
  };
};

const getPublicProducts = async ({ page, limit, search, category, sort }) => {
  let sortLogic = { createdAt: -1 };

  const query = { isActive: true };
  if (search) {
    query.name = { $regex: search, $options: "i" };
  }

  if (category) {
    query.category = category;
  }

  if (sort) {
    if (sort === "price_asc") {
      sortLogic = { base_price: 1 };
    }

    if (sort === "price_desc") {
      sortLogic = { base_price: -1 };
    }
  }

  const total = await Product.countDocuments(query);
  const products = await Product.find(query)
    .populate([
      { path: "default_config.cpu", select: "name" },
      { path: "default_config.gpu", select: "name" },
      { path: "default_config.motherboard", select: "name" },
      { path: "default_config.ram", select: "name" },
      { path: "default_config.storage", select: "name" },
      { path: "default_config.case", select: "name" },
      { path: "default_config.psu", select: "name" },
      { path: "default_config.cooler", select: "name" },
    ])
    .sort(sortLogic)
    .limit(limit)
    .skip((page - 1) * limit);

  return {
    products,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
  };
};

const getProductById = async (id) => {
  const product = await Product.findById(id).populate([
    { path: "default_config.cpu" },
    { path: "default_config.gpu" },
    { path: "default_config.motherboard" },
    { path: "default_config.ram" },
    { path: "default_config.storage" },
    { path: "default_config.case" },
    { path: "default_config.psu" },
    { path: "default_config.cooler" },
  ]);

  if (!product) throw new Error("Product not found");
  return product;
};

const updateProduct = async (id, updateData) => {
  if (updateData.name && !updateData.slug) {
    updateData.slug = updateData.name.toLowerCase().split(" ").join("-");
  }

  const product = await Product.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });

  if (!product) throw new Error("Product not found");
  return product;
};

const deleteProduct = async (id) => {
  const product = await Product.findById(id);

  product.isActive = product.isActive ? false : true;

  await product.save();
  return product;
};

module.exports = {
  createProduct,
  getAdminProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getPublicProducts,
};
