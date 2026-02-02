import categoryService from "../services/categoryService.js";
import { HTTP_STATUS } from "../constants/httpStatus.js";

export const getCategories = async (req, res) => {
  const { categories, totalPages, page } =
    await categoryService.getAllCategories(req.query, req.user);

  res.status(HTTP_STATUS.OK).json({
    categories,
    pagination: {
      totalPages,
      page,
    },
  });
};

export const createCategory = async (req, res) => {
  const category = await categoryService.createNewCategory(req.body);
  res.status(HTTP_STATUS.CREATED).json(category);
};

export const updateCategory = async (req, res) => {
  const updatedCategory = await categoryService.modifyCategory(
    req.params.id,
    req.body,
  );
  res.status(HTTP_STATUS.OK).json(updatedCategory);
};

export const deleteCategory = async (req, res) => {
  const result = await categoryService.toggleCategoryStatus(req.params.id);
  res.status(HTTP_STATUS.OK).json(result);
};

export const getCategoryById = async (req, res) => {
  const category = await categoryService.findCategoryById(req.params.id);
  res.status(HTTP_STATUS.OK).json(category);
};
