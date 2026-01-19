import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
  submitFeedback,
  getHelpArticles,
} from '../controllers/wellnessFeedbackController.js';

const router = express.Router();

router.use(authenticateToken);

router.post('/feedback', submitFeedback);
router.get('/help', getHelpArticles);

export default router;

