import express from 'express';
import {
  getPartners,
  createPartner,
  updatePartner,
  deletePartner,
} from '../controllers/partnerController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(protect, getPartners).post(protect, createPartner);
router
  .route('/:id')
  .put(protect, updatePartner)
  .delete(protect, deletePartner);

export default router;
