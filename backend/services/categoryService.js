import Category from "../models/Category.js";
import Product from "../models/Product.js";
import AppError from "../utils/AppError.js";


const getAllCategories = async (queryParams, user) => {
  const { search, page, limit, status } = queryParams;

  let query = {};
  if (search) {
    query.name = { $regex: search, $options: "i" };
  }

  if (status) {
    query.isActive = status === "Active" ? true : false;
  }

  if (user.role === "customer") {
    query.isActive = true;
  }

  const categories = await Category.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(limit * (page - 1));
  const totaldocs = await Category.countDocuments(query);
  const totalPages = Math.ceil(totaldocs / limit);

  return {
    categories,
    totalPages,
    page,
  };
};


const createNewCategory = async (data) => {
  const { name, offer } = data;
  const categoryExists = await Category.findOne({ name });

  if (categoryExists) {
    throw new AppError("Category already exists", 400);
  }

  let newOffer = offer !== undefined ? offer : 0;

  const category = await Category.create({ name, offer: newOffer });

  const products = await Product.find({ category: category._id });

  const bulkOps = products.map((product) => {
    const bestDiscount = Math.max(product.discount || 0, newOffer || 0);
    const newEffectivePrice =
      product.base_price - (product.base_price * bestDiscount) / 100;

    return {
      updateOne: {
        filter: { _id: product._id },
        update: {
          final_price: Math.round(newEffectivePrice),
          applied_offer: bestDiscount,
        },
      },
    };
  });

  if (bulkOps.length > 0) {
    await Product.bulkWrite(bulkOps);
  }

  return category;
};


const modifyCategory = async (id, data) => {
  let { name, offer } = data;

  const category = await Category.findById(id);
  if (!category) throw new AppError("Category not found", 404);

  const products = await Product.find({ category: category._id });

  offer = offer !== undefined ? offer : category.offer;

  category.name = name;
  category.offer = offer;
  const updatedCategory = await category.save();

  const bulkOps = products.map((product) => {
    const bestDiscount = Math.max(product.discount || 0, offer || 0);
    const newEffectivePrice =
      product.base_price - (product.base_price * bestDiscount) / 100;

    return {
      updateOne: {
        filter: { _id: product._id },
        update: {
          final_price: Math.round(newEffectivePrice),
          applied_offer: bestDiscount,
        },
      },
    };
  });

  if (bulkOps.length > 0) {
    await Product.bulkWrite(bulkOps);
  }

  return updatedCategory;
};


const toggleCategoryStatus = async (id) => {
  const category = await Category.findById(id);

  if (category) {
    category.isActive = !category.isActive;
    await category.save();
    return { message: "Category status updated" };
  } else {
    throw new AppError("Category not found", 404);
  }
};


const findCategoryById = async (id) => {
  const category = await Category.findById(id);

  if (category) {
    return category;
  } else {
    throw new AppError("Category not found", 404);
  }
};

export default {
  getAllCategories,
  createNewCategory,
  modifyCategory,
  toggleCategoryStatus,
  findCategoryById,
};
