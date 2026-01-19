import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
  getWellnessProfile,
  updateWellnessProfile,
  deleteAccount,
} from '../controllers/wellnessProfileController.js';
import {
  getSecuritySettings,
  updateSecuritySettings,
  changePassword,
  setPasscode,
  getNotifications,
  updateNotifications,
} from '../controllers/wellnessSettingsController.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/profile', getWellnessProfile);
router.put('/profile', updateWellnessProfile);
router.delete('/account', deleteAccount);

router.get('/security', getSecuritySettings);
router.put('/security', updateSecuritySettings);
router.put('/change-password', changePassword);
router.post('/passcode', setPasscode);

router.get('/notifications', getNotifications);
router.put('/notifications', updateNotifications);

export default router;

