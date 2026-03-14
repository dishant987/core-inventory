import { Category } from '../models/index.js';

// @desc    Get all categories
// @route   GET /api/categories
// @access  Private
export const getCategories = async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};
    if (status === 'deleted') {
      query.isDeleted = true;
    } else {
      query.isDeleted = false;
      if (status && status !== 'all') {
        query.isActive = status === 'active';
      }
    }
    const categories = await Category.find(query).populate('parentId', 'name');
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Private
export const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findOne({ _id: req.params.id });
    if (category) {
      res.json(category);
    } else {
      res.status(404).json({ message: 'Category not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a category
// @route   POST /api/categories
// @access  Private/Admin
export const createCategory = async (req, res) => {
  try {
    const { name, description, parentId, isActive } = req.body;

    const categoryExists = await Category.findOne({ name, isDeleted: false });
    if (categoryExists) {
      return res.status(400).json({ message: 'Category name already exists' });
    }

    const category = new Category({
      name,
      description,
      parentId: parentId || null,
      isActive: isActive !== undefined ? isActive : true,
    });

    const createdCategory = await category.save();
    res.status(201).json(createdCategory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Private/Admin
export const updateCategory = async (req, res) => {
  try {
    const { name, description, parentId, isActive, isDeleted } = req.body;

    const category = await Category.findOne({ _id: req.params.id });

    if (category) {
      category.name = name || category.name;
      category.description = description !== undefined ? description : category.description;
      if (parentId !== undefined) {
        // null is allowed to unset parent
        category.parentId = parentId === "" ? null : parentId;
      }
      category.isActive = isActive !== undefined ? isActive : category.isActive;
      if (isDeleted !== undefined) category.isDeleted = isDeleted;

      const updatedCategory = await category.save();
      res.json(updatedCategory);
    } else {
      res.status(404).json({ message: 'Category not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a category (Soft Delete)
// @route   DELETE /api/categories/:id
// @access  Private/Admin
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findOne({ _id: req.params.id, isDeleted: false });

    if (category) {
      category.isDeleted = true;
      category.isActive = false;
      await category.save();
      res.json({ message: 'Category removed' });
    } else {
      res.status(404).json({ message: 'Category not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
