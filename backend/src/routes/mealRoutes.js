import express from 'express';
import { createMealEntry, getMealDetails, removeMeal, createScheduledEntry, removeScheduledEntry } from '../controllers/mealController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Protect all meal routes with JWT auth
router.use(authenticateToken);

// Meals CRUD minimal set used by pages
router.post('/meals', createMealEntry);
router.get('/meals/:id', getMealDetails);
router.delete('/meals/:id', removeMeal);

// Scheduled meals minimal endpoints
router.post('/scheduled-meals', createScheduledEntry);
router.delete('/scheduled-meals/:id', removeScheduledEntry);

export default router;