import express from 'express';
import {
  getClubs,
  getClubById,
  createClub,
  updateClub,
  deleteClub,
  getClubsByPriceRanges
} from '../controllers/clubController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * Public routes - no authentication required
 */

// GET /api/clubs - Get all clubs with optional filters
// Query params: maxPrice, search, location, limit, offset
// Examples:
//   /api/clubs?maxPrice=80
//   /api/clubs?search=gym
//   /api/clubs?location=Pune
router.get('/', getClubs);

// GET /api/clubs/price-ranges - Get clubs grouped by price ranges
router.get('/price-ranges', getClubsByPriceRanges);

// GET /api/clubs/:id - Get single club by ID
router.get('/:id', getClubById);

/**
 * Protected routes - authentication required
 * Admin routes - should add admin middleware in production
 */

// POST /api/clubs - Create new club (admin)
router.post('/', authenticateToken, createClub);

// PUT /api/clubs/:id - Update club (admin)
router.put('/:id', authenticateToken, updateClub);

// DELETE /api/clubs/:id - Delete club (admin)
router.delete('/:id', authenticateToken, deleteClub);

export default router;

