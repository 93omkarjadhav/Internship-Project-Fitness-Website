import express from 'express';
import {
  createCycle,
  getAllCycles,
  getCycleById,
  updateCycle,
  deleteCycle,
  getCycleStatistics,
  getCycleInsights,
  getDashboard,
} from '../../controllers/periodTracker/cycleController.js';

const router = express.Router();

// Middleware will be applied at the app level for gender-based access control
router.post('/', createCycle);
router.get('/dashboard', getDashboard);
router.get('/', getAllCycles);
router.get('/statistics', getCycleStatistics);
router.get('/insights', getCycleInsights);
router.get('/:id', getCycleById);
router.put('/:id', updateCycle);
router.delete('/:id', deleteCycle);

export default router;


