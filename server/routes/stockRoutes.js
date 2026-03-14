import express from 'express';
import {
  getStock,
  getLedger
} from '../controllers/stockController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getStock);

router.route('/ledger')
  .get(protect, getLedger);

export default router;
