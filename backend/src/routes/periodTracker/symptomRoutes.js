import express from 'express';
import {
  createSymptom,
  getSymptomsByCycle,
  getSymptomStatistics,
  deleteSymptom,
  saveSymptoms,
  getSymptoms,
} from '../../controllers/periodTracker/symptomController.js';

const router = express.Router();

// Middleware will be applied at the app level for gender-based access control
// Existing routes
router.post('/', createSymptom);
router.get('/statistics', getSymptomStatistics);
router.get('/cycle/:cycleId', getSymptomsByCycle);
router.delete('/:id', deleteSymptom);

// Week2 routes (for compatibility)
router.post('/save', saveSymptoms);
router.get('/list', getSymptoms);

export default router;


