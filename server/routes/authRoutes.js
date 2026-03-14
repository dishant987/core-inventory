import express from 'express';
import { signup, login, forgotPassword, resetPassword, myProfile, logout, verifyOTP } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/verify-otp', verifyOTP);

// Protected routes
router.get('/my-profile', protect, myProfile);
router.post('/logout', protect, logout);

export default router;
