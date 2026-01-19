import express from 'express';
import passport from '../config/passport.js';
import jwt from 'jsonwebtoken';
import { signUp, signIn, forgotPassword, forgotPasswordSMS, resetPassword, verifyResetToken, verifyAuth, updatePhoneNumber } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Existing email/password routes
router.post('/signup', signUp);
router.post('/signin', signIn);
router.post('/forgot-password', forgotPassword);
router.post('/forgot-password-sms', forgotPasswordSMS);
router.post('/reset-password', resetPassword);
router.post('/verify-reset-token', verifyResetToken);
router.post('/update-phone', updatePhoneNumber);
router.get('/me', authenticateToken, verifyAuth);

// Google OAuth routes
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { 
    session: false,
    failureRedirect: process.env.CLIENT_URL || 'http://localhost:5173'
  }),
  (req, res) => {
    try {
      const user = req.user;
      
      if (!user) {
        return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}?error=auth_failed`);
      }

      // Generate JWT token for Google user
      const token = jwt.sign(
        { id: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      // Redirect to frontend with token
      res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/auth/google/success?token=${token}`);
    } catch (error) {
      console.error('Google callback error:', error);
      res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}?error=server_error`);
    }
  }
);

export default router;

