import express from 'express';
import {
  getProfile,
  patchProfileTargets,
  getScore,
  getInsight,
  getHistory,
  getWeekly,
  getMealSchedule,
  getRecs,
  patchRecStatus,
} from '../controllers/nutritionController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Protect all nutrition routes with JWT auth
router.use(authenticateToken);

// Profile
router.get('/nutrition/profile', getProfile);
router.patch('/nutrition/profile', patchProfileTargets);

// Metrics
router.get('/nutrition/score', getScore);
router.get('/nutrition/insight', getInsight);
router.get('/nutrition/history', getHistory);
router.get('/nutrition/weekly', getWeekly);

// Schedule
router.get('/nutrition/schedule', getMealSchedule);

// Recommendations
router.get('/nutrition/recommendations', getRecs);
router.patch('/nutrition/recommendations/:id', patchRecStatus);

export default router;