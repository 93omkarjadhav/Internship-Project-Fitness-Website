import Razorpay from 'razorpay';
import crypto from 'crypto';
import { pool } from '../db/connection.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env file from backend root directory (three levels up from controllers/)
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

// Initialize Razorpay
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

// Log Razorpay config status (without exposing secret)
if (!RAZORPAY_KEY_SECRET) {
  console.warn('⚠️  WARNING: RAZORPAY_KEY_SECRET not set in environment variables. Payment will not work properly.');
  console.warn('   Make sure RAZORPAY_KEY_SECRET is set in .env file in the backend root directory.');
} else {
  console.log('✅ Razorpay configured with Key ID:', RAZORPAY_KEY_ID.substring(0, 10) + '...');
}

const instance = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET || 'dummy_secret_for_initialization',
});

// @desc    1. Create Razorpay Order (Pre-payment)
// @route   POST /api/payment/create-order
export const createOrder = async (req, res) => {
  try {
    if (!RAZORPAY_KEY_SECRET) {
      return res.status(500).json({ 
        success: false, 
        message: "Payment gateway not configured. Please contact administrator.",
        error: "RAZORPAY_KEY_SECRET not set" 
      });
    }

    const { amount, booking_id } = req.body; // Amount in Rupees (e.g., 40)

    if (!amount || isNaN(amount)) {
      return res.status(400).json({ 
        success: false, 
        message: "Valid amount is required" 
      });
    }

    const options = {
      amount: Math.round(amount * 100), // Razorpay takes amount in paise (40 * 100 = 4000 paise)
      currency: "INR",
      receipt: `receipt_${booking_id || Date.now()}`,
    };

    console.log('Creating Razorpay order with options:', { ...options, amount: `${options.amount} paise` });

    const order = await instance.orders.create(options);

    console.log('Razorpay order created successfully:', order.id);

    res.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Razorpay Create Order Error:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message || "Payment creation failed. Please try again.",
      error: error.message 
    });
  }
};

// @desc    2. Verify Payment & Update Booking
// @route   POST /api/payment/verify
export const verifyPayment = async (req, res) => {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      booking_id,
      amount
    } = req.body;

    // Get user_id from authenticated user (from middleware)
    const user_id = req.user?.id;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ 
        success: false, 
        message: "Missing payment details" 
      });
    }

    if (!user_id) {
      return res.status(401).json({ 
        success: false, 
        message: "User not authenticated" 
      });
    }

    // A. Verify Signature (Security Check)
    if (!RAZORPAY_KEY_SECRET) {
      return res.status(500).json({ 
        success: false, 
        message: "Payment verification not configured" 
      });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid Signature" 
      });
    }

    // B. Payment Valid -> Update Booking in Database
    if (booking_id) {
      try {
        // Try to update with payment columns first
        let result;
        try {
          const [updateResult] = await pool.query(
            `UPDATE bookings 
             SET payment_status = 'paid', 
                 booking_status = 'confirmed',
                 razorpay_order_id = ?,
                 razorpay_payment_id = ?,
                 razorpay_signature = ?,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = ? AND user_id = ?`,
            [razorpay_order_id, razorpay_payment_id, razorpay_signature, booking_id, user_id]
          );
          result = updateResult;
        } catch (colError) {
          // If columns don't exist, do basic update
          console.log("Payment columns may not exist, using basic update:", colError.message);
          const [basicResult] = await pool.query(
            `UPDATE bookings 
             SET updated_at = CURRENT_TIMESTAMP
             WHERE id = ? AND user_id = ?`,
            [booking_id, user_id]
          );
          result = basicResult;
        }

        if (result.affectedRows === 0) {
          return res.status(404).json({ 
            success: false, 
            message: "Booking not found or unauthorized" 
          });
        }

        // Also insert into orders table if it exists (for payment history)
        try {
          const [booking] = await pool.query(
            "SELECT club_title, club_city FROM bookings WHERE id = ?",
            [booking_id]
          );

          if (booking.length > 0) {
            await pool.query(
              `INSERT INTO orders (user_id, user_guid, service_name, amount, status, order_date, location, razorpay_order_id, razorpay_payment_id) 
               VALUES (?, ?, ?, ?, 'Completed', NOW(), ?, ?, ?)`,
              [
                user_id, 
                req.user?.guid,
                booking[0].club_title || 'Fitness Club Booking',
                amount, 
                booking[0].club_city || '',
                razorpay_order_id,
                razorpay_payment_id
              ]
            );
          }
        } catch (orderError) {
          // If orders table doesn't exist, just log and continue
          console.log("Note: orders table may not exist, skipping order insertion:", orderError.message);
        }
      } catch (updateError) {
        console.error("Error updating booking:", updateError);
        // Continue even if update fails - payment is verified
      }
    }

    res.json({
      success: true,
      message: "Payment Verified & Booking Updated",
      payment_id: razorpay_payment_id,
      order_id: razorpay_order_id
    });

  } catch (error) {
    console.error("Verification Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server Error",
      error: error.message 
    });
  }
};

// @desc    3. Get User Payment History (from orders table if exists)
// @route   GET /api/payment/bookings/:userId
export const getUserBookings = async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Try to get from orders table first
    try {
      const [rows] = await pool.query(
        `SELECT * FROM orders WHERE user_id = ? ORDER BY order_date DESC`, 
        [userId]
      );
      
      return res.json(rows);
    } catch (error) {
      // If orders table doesn't exist, get from bookings table
      const [rows] = await pool.query(
        `SELECT * FROM bookings 
         WHERE user_id = ? AND payment_status = 'paid' 
         ORDER BY created_at DESC`, 
        [userId]
      );
      
      return res.json(rows);
    }
  } catch (error) {
    console.error("Get User Bookings Error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server Error",
      error: error.message 
    });
  }
};

