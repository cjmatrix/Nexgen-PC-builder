import * as productService from "../services/productService.js";
import AppError from "../utils/AppError.js";

const createProduct = async (req, res) => {
  const product = await productService.createProduct(req.body);
  res.status(201).json({ success: true, data: product });
};

const getAdminProducts = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const { search, category, status } = req.query;

  const result = await productService.getAdminProducts(
    page,
    limit,
    search,
    category,
    status
  );
  res.status(200).json({ success: true, ...result });
};

const getPublicProducts = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const { search, category, sort } = req.query;

  const result = await productService.getPublicProducts({
    page,
    limit,
    search,
    category,
    sort,
  });

  res.status(200).json({ success: true, ...result });
};

const getProductById = async (req, res) => {
  const product = await productService.getProductById(req, req.params.id);
  res.status(200).json({ success: true, data: product });
};

const updateProduct = async (req, res) => {
  const product = await productService.updateProduct(req.params.id, req.body);
  res.status(200).json({ success: true, data: product });
};

const deleteProduct = async (req, res) => {
  const result = await productService.deleteProduct(req.params.id);
  res
    .status(200)
    .json({ success: true, message: "Product deactivated", data: result });
};

export {
  createProduct,
  getAdminProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getPublicProducts,
};
