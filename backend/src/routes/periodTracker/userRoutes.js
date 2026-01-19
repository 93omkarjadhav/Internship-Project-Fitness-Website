import express from 'express';
import { savePreferences, getPreferences } from '../../controllers/periodTracker/userController.js';

const router = express.Router();

// Middleware will be applied at the app level for gender-based access control
router.post('/preferences', savePreferences);
router.get('/preferences', getPreferences);

export default router;


