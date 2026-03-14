import express from 'express';
import {
  getOperations,
  getOperationById,
  createOperation,
  updateOperation,
  validateOperation
} from '../controllers/operationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getOperations)
  .post(protect, createOperation);

router.route('/:id')
  .get(protect, getOperationById)
  .put(protect, updateOperation);

router.route('/:id/validate')
  .post(protect, validateOperation);

export default router;
