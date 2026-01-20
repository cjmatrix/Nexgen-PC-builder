import mongoose from "mongoose";
import Product from "../models/Product.js";
import Category from "../models/Category.js";
import AppError from "../utils/AppError.js";
import { HTTP_STATUS } from "../constants/httpStatus.js";
import { MESSAGES } from "../constants/responseMessages.js";

const createProduct = async (productData) => {
  if (!productData.slug) {
    productData.slug = productData.name.toLowerCase().split(" ").join("-");
  }

  productData.discount =
    productData.discount !== undefined ? productData.discount : 0;

  const category = await Category.findById(productData.category);

  if (!category)
    throw new AppError(
      MESSAGES.PRODUCT.UNMATCHED_CATEGORY,
      HTTP_STATUS.BAD_REQUEST,
    );

  productData.category = category._id;

  if (productData.discount > category.offer) {
    productData.applied_offer = productData.discount;
  } else {
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
    // Check if category is name or ID. If Name, look it up.
    if (mongoose.Types.ObjectId.isValid(category)) {
      query.category = category;
    } else {
      const catDoc = await Category.findOne({ name: category });
      if (catDoc) query.category = catDoc._id;
    }
  }

  if (status === "active") query.isActive = true;
  if (status === "inactive") query.isActive = false;

  const total = await Product.countDocuments(query);

  const products = await Product.find(query)
    .populate("category")
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

  const activeCategories = await Category.find({ isActive: true });
  const activeCategoryIds = activeCategories.map((cat) => cat._id);

  const query = {
    isActive: true,
    category: { $in: activeCategoryIds },
  };

  if (category) {
    const requestedCategory = activeCategories.find(
      (cat) => cat.name === category,
    );

    if (requestedCategory) {
      query.category = requestedCategory._id;
    } else {
      return {
        products: [],
        total: 0,
        totalPages: 0,
        currentPage: page,
      };
    }
  }

  if (search) {
    query.name = { $regex: search, $options: "i" };
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
    .select(
      "name slug final_price base_price images category isActive discount description applied_offer default_config",
    )
    .populate("category", "name")
    .populate([
      { path: "default_config.cpu", select: "stock isActive" },
      { path: "default_config.gpu", select: "stock isActive" },
      { path: "default_config.motherboard", select: "stock isActive" },
      { path: "default_config.ram", select: "stock isActive" },
      { path: "default_config.storage", select: "stock isActive" },
      { path: "default_config.case", select: "stock isActive" },
      { path: "default_config.psu", select: "stock isActive" },
      { path: "default_config.cooler", select: "stock isActive" },
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

const getProductById = async (req, id) => {
  let query = { _id: id };
  if (req.user.role === "customer") {
    query.isActive = true;
  }

  const product = await Product.findOne(query)
    .populate("category")
    .populate([
      { path: "default_config.cpu" },
      { path: "default_config.gpu" },
      { path: "default_config.motherboard" },
      { path: "default_config.ram" },
      { path: "default_config.storage" },
      { path: "default_config.case" },
      { path: "default_config.psu" },
      { path: "default_config.cooler" },
    ]);

  if (!product)
    throw new AppError(MESSAGES.PRODUCT.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  return product;
};

const updateProduct = async (id, updateData) => {
  const product = await Product.findById(id);

  if (!product)
    throw new AppError(MESSAGES.PRODUCT.NOT_FOUND, HTTP_STATUS.NOT_FOUND);

  if (updateData.name && !updateData.slug) {
    updateData.slug = updateData.name.toLowerCase().split(" ").join("-");
  }

  let category;

  if (updateData.category) {
    category = await Category.findById(updateData.category);
    console.log(category);
    if (!category)
      throw new AppError(
        MESSAGES.PRODUCT.CATEGORY_NOT_FOUND(updateData.category),
        HTTP_STATUS.NOT_FOUND,
      );
  } else {
    category = await Category.findById(product.category);
    if (!category)
      throw new AppError(
        MESSAGES.PRODUCT.ORIGINAL_CATEGORY_NOT_FOUND,
        HTTP_STATUS.NOT_FOUND,
      );
  }

  if (updateData.category) {
    updateData.category = category._id;
  }

  updateData.discount =
    updateData.discount !== undefined ? updateData.discount : product.discount;

  if (updateData.discount > category.offer) {
    product.applied_offer = updateData.discount;
  } else {
    product.applied_offer = category.offer;
  }

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
