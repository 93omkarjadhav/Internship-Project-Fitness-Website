import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { getStreakData } from '../controllers/wellnessStreakController.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/streak', getStreakData);

export default router;

