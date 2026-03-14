import express from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} from '../controllers/productController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getProducts)
  .post(protect, authorize('Admin', 'Inventory Manager'), createProduct);

router.route('/:id')
  .get(protect, getProductById)
  .put(protect, authorize('Admin', 'Inventory Manager'), updateProduct)
  .delete(protect, authorize('Admin'), deleteProduct);

export default router;
