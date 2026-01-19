import express from 'express';
import { getUserProfile, updateUserProfile } from '../controllers/profileController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// GET /api/profile - Get user profile (protected)
router.get('/', protect, getUserProfile);

// POST /api/profile - Create or update user profile (protected)
router.post('/', protect, updateUserProfile);

export default router;

