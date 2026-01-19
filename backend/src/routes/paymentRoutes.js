import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { createOrder, verifyPayment, getUserBookings } from '../controllers/paymentController.js';

const router = express.Router();

// Route 1: Create Order ID (no authentication required for payment)
router.post('/create-order', createOrder);

// Route 2: Verify & Save (no authentication required for payment)
router.post('/verify', verifyPayment);

// Route 3: Get History (requires authentication)
router.get('/bookings/:userId', authenticateToken, getUserBookings);

export default router;


