import Category from "../models/Category.js";
import Product from "../models/Product.js";
import AppError from "../utils/AppError.js";

export const getCategories = async (req, res) => {
  const { search, page, limit, status } = req.query;

  let query = {};
  if (search) {
    query.name = { $regex: search, $options: "i" };
  }

  if (status) {
    query.isActive = status === "Active" ? true : false;
  }

  const categories = await Category.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(limit * (page - 1));
  const totaldocs = await Category.countDocuments(query);
  const totalPages = Math.ceil(totaldocs / limit);

  res.json({
    categories,
    pagination: {
      totalPages,
      page,
    },
  });
};

export const createCategory = async (req, res) => {
  const { name, offer } = req.body;
  const categoryExists = await Category.findOne({ name });

  if (categoryExists) {
    throw new AppError("Category already exists", 400);
  }

  let { offer: newOffer } = req.body;
  newOffer = newOffer !== undefined ? newOffer : 0;

  const category = await Category.create({ name, offer: newOffer });

  const products = await Product.find({ category: category.name });

  const bulkOps = products.map((product) => {
    const bestDiscount = Math.max(product.discount || 0, newOffer || 0);
    const newEffectivePrice =
      product.base_price - (product.base_price * bestDiscount) / 100;

    return {
      updateOne: {
        filter: { _id: product._id },
        update: {
          category: name,
          final_price: Math.round(newEffectivePrice),
          applied_offer: bestDiscount,
        },
      },
    };
  });

  if (bulkOps.length > 0) {
    await Product.bulkWrite(bulkOps);
  }

  res.status(201).json(category);
};

export const updateCategory = async (req, res) => {
  let { name, offer } = req.body;

  const category = await Category.findById(req.params.id);
  if (!category) throw new AppError("Category not found", 404);

  const products = await Product.find({ category: category.name });

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
          category: name,
          final_price: Math.round(newEffectivePrice),
          applied_offer: bestDiscount,
        },
      },
    };
  });

  if (bulkOps.length > 0) {
    await Product.bulkWrite(bulkOps);
  }

  res.json(updatedCategory);
};

export const deleteCategory = async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (category) {
    category.isActive = !category.isActive;

    await category.save();

    res.json({ message: "Category deactivated" });
  } else {
    throw new AppError("Category not found", 404);
  }
};

export const getCategoryById = async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (category) {
    res.json(category);
  } else {
    throw new AppError("Category not found", 404);
  }
};
