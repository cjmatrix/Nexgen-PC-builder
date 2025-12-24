import Category from "../models/Category.js";
import Product from "../models/Product.js";

export const getCategories = async (req, res) => {
  try {
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
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createCategory = async (req, res) => {
  try {
    const { name, offer } = req.body;
    const categoryExists = await Category.findOne({ name });

    if (categoryExists) {
      return res.status(400).json({ message: "Category already exists" });
    }


    offer = offer !== undefined ? offer :0;

    const category = await Category.create({ name, offer });

    const products = await Product.find({ category: category.name });

    


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
    

    res.status(201).json(category);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateCategory = async (req, res) => {
  try {
    let { name, offer } = req.body;

    const category = await Category.findById(req.params.id);
    if (!category)
      return res.status(404).json({ message: "Category not found" });

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
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (category) {
      category.isActive = !category.isActive;

      await category.save();

      res.json({ message: "Category deactivated" });
    } else {
      res.status(404).json({ message: "Category not found" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (category) {
      res.json(category);
    } else {
      res.status(404).json({ message: "Category not found" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
