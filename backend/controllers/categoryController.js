import Category from "../models/Category.js";

export const getCategories = async (req, res) => {
  try {

    const {search,page,limit,status}=req.query;
    
    console.log(page)
    let query={}
    if(search){
      query.name={$regex:search,$options:"i"}
    }

    if(status){
      query.isActive=status==="Active"?true:false
    }

    


    const categories = await Category.find(query).sort({ createdAt: -1 }).limit(limit).skip(limit*(page-1));
    const totaldocs=await Category.countDocuments(query);
    const totalPages= Math.ceil(totaldocs/limit);

    res.json({categories,pagination:{
      totalPages,
      page
    }});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const categoryExists = await Category.findOne({ name });

    if (categoryExists) {
      return res.status(400).json({ message: "Category already exists" });
    }

    const category = await Category.create({ name });
    res.status(201).json(category);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const category = await Category.findById(req.params.id);

    if (category) {
      category.name = name || category.name;
      const updatedCategory = await category.save();
      res.json(updatedCategory);
    } else {
      res.status(404).json({ message: "Category not found" });
    }
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
    console.log(category)
    if (category) {
      res.json(category);
    } else {
      res.status(404).json({ message: "Category not found" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
