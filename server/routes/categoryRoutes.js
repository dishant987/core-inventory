import express from 'express';
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
} from '../controllers/categoryController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getCategories)
  .post(protect, authorize('Admin', 'Inventory Manager'), createCategory);

router.route('/:id')
  .get(protect, getCategoryById)
  .put(protect, authorize('Admin', 'Inventory Manager'), updateCategory)
  .delete(protect, authorize('Admin'), deleteCategory);

export default router;
