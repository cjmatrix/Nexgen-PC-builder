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
    .populate("default_config.cpu", "name") // Optional: populate to show component names if needed
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

const getProductById = async (id) => {
  const product = await Product.findById(id).populate([
    { path: 'default_config.cpu' },
    { path: 'default_config.gpu' },
    { path: 'default_config.motherboard' },
    { path: 'default_config.ram' },
    { path: 'default_config.storage' },
    { path: 'default_config.case' },
    { path: 'default_config.psu' },
    { path: 'default_config.cooler' },
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
 
  const product = await Product.findByIdAndUpdate(
    id, 
    { isActive: false }, 
    { new: true }
  );
  return product;
};

module.exports = {
  createProduct,
  getAdminProducts,
  getProductById,
  updateProduct,
  deleteProduct
};