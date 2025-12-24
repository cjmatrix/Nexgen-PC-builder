import Product from "../models/Product.js";
import Category from "../models/Category.js";

const createProduct = async (productData) => {
  if (!productData.slug) {
    productData.slug = productData.name.toLowerCase().split(" ").join("-");
  }


  productData.discount =productData.discount!==undefined?productData.discount:0
  const category=await Category.findOne({name:productData.category})
  if(!category)
    throw new Error('Unmatched category')

  if(productData.discount>category.offer){
    productData.applied_offer=productData.discount
  }else {
    productData.applied_offer = category.offer;
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
      sortLogic = { final_price: 1 };
    }

    if (sort === "price_desc") {
      sortLogic = { final_price: -1 };
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

  // const items=await Product.find({})

  // for(let item of items){
  //   item.applied_offer=0;
  //   await item.save()
  // }

  return {
    products,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
  };
};

const getProductById = async (req, id) => {
  let query = { _id: id };
  if (req.user.role === "customer") {
    query.isActive = true;
  }

  const product = await Product.findOne(query).populate([
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
  const product = await Product.findById(id);

  if (!product) throw new Error("Product not found");

  if (updateData.name && !updateData.slug) {
    updateData.slug = updateData.name.toLowerCase().split(" ").join("-");
  }

  const category = await Category.findOne({ name: updateData.category || product.category});
  
  if (!category) throw new Error("Category not found");


  updateData.discount =
    updateData.discount !== undefined ? updateData.discount : product.discount;

  if (updateData.discount > category.offer) {
    product.applied_offer = updateData.discount;
  } else {
    product.applied_offer = category.offer;
  }

  console.log(updateData.applied_offer);

  Object.keys(updateData).forEach((key) => {
    if (key !== "applied_offer") {
      product[key] = updateData[key];
    }
  });

  await product.save();
  return product;
};

const deleteProduct = async (id) => {
  const product = await Product.findById(id);

  product.isActive = product.isActive ? false : true;

  await product.save();
  return product;
};

export {
  createProduct,
  getAdminProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getPublicProducts,
};
