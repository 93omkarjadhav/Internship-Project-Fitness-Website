import express from 'express';
import {
  getReferralCode,
  getContacts,
  inviteContact,
  addContact,
  validateReferralCode,
} from '../controllers/referralController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.get('/code', authenticateToken, getReferralCode);
router.get('/contacts', authenticateToken, getContacts);
router.post('/contacts/invite/:contactId', authenticateToken, inviteContact);
router.post('/contacts/add', authenticateToken, addContact);
router.post('/validate', validateReferralCode); // Can be used during signup

export default router;

