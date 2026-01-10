import categoryService from "../services/categoryService.js";

export const getCategories = async (req, res) => {
  const { categories, totalPages, page } =
    await categoryService.getAllCategories(req.query, req.user);

  res.json({
    categories,
    pagination: {
      totalPages,
      page,
    },
  });
};

export const createCategory = async (req, res) => {
  const category = await categoryService.createNewCategory(req.body);
  res.status(201).json(category);
};

export const updateCategory = async (req, res) => {
  const updatedCategory = await categoryService.modifyCategory(
    req.params.id,
    req.body
  );
  res.json(updatedCategory);
};

export const deleteCategory = async (req, res) => {
  const result = await categoryService.toggleCategoryStatus(req.params.id);
  res.json(result);
};

export const getCategoryById = async (req, res) => {
  const category = await categoryService.findCategoryById(req.params.id);
  res.json(category);
};
