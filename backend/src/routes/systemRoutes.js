import express from 'express';
import {
  checkSystemStatus,
  submitSupportTicket,
  getMyTickets,
  getAllTickets,
  updateTicketStatus,
  updateSystemSettings,
  getSystemSettings
} from '../controllers/systemController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * Public routes - no authentication required
 */

// GET /api/system/status - Check system status (maintenance, updates)
// Query params: version (optional) - e.g., ?version=1.0.0
// This is called by error pages and app initialization
router.get('/status', checkSystemStatus);

// POST /api/system/support - Submit support ticket
// Body: { subject, message, priority (optional) }
// Can be used without authentication (for error pages)
router.post('/support', submitSupportTicket);

// GET /api/system/settings - Get public system settings
router.get('/settings', getSystemSettings);

/**
 * Protected routes - authentication required
 */

// GET /api/system/support/my-tickets - Get user's support tickets
router.get('/support/my-tickets', authenticateToken, getMyTickets);

/**
 * Admin routes - should add admin middleware in production
 */

// GET /api/system/support/all - Get all support tickets (admin)
router.get('/support/all', authenticateToken, getAllTickets);

// PATCH /api/system/support/:id - Update support ticket status (admin)
// Body: { status, assigned_to }
router.patch('/support/:id', authenticateToken, updateTicketStatus);

// PUT /api/system/settings - Update system settings (admin)
// Body: { maintenance_mode, maintenance_end_time, min_app_version, etc. }
router.put('/settings', authenticateToken, updateSystemSettings);

export default router;

