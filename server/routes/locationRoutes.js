import express from 'express';
import {
  getLocations,
  getLocationById,
  createLocation,
  updateLocation,
  deleteLocation,
} from '../controllers/locationController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getLocations)
  .post(protect, authorize('Admin'), createLocation);

router.route('/:id')
  .get(protect, getLocationById)
  .put(protect, authorize('Admin'), updateLocation)
  .delete(protect, authorize('Admin'), deleteLocation);

export default router;
