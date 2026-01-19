import { pool } from '../db/connection.js';

/**
 * Middleware to check if user has an active subscription (Plus or Premium)
 * Use this to protect premium features
 */
export const requireSubscription = async (req, res, next) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        type: 'AUTH_REQUIRED'
      });
    }

    // Check user's subscription status
    const [rows] = await pool.execute(
      'SELECT subscription_status, subscription_expires_at FROM users WHERE id = ?',
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        type: 'USER_NOT_FOUND'
      });
    }

    const user = rows[0];

    // Check if subscription is active
    const hasActiveSubscription = 
      user.subscription_status !== 'free' &&
      (user.subscription_expires_at === null || 
       new Date(user.subscription_expires_at) > new Date());

    if (!hasActiveSubscription) {
      return res.status(403).json({
        success: false,
        message: 'This feature requires a subscription. Please upgrade to Plus or Premium.',
        type: 'FEATURE_LOCKED',
        subscription_status: user.subscription_status,
        feature_locked: true
      });
    }

    // User has active subscription, proceed
    req.user.subscription_status = user.subscription_status;
    req.user.subscription_expires_at = user.subscription_expires_at;
    next();

  } catch (error) {
    console.error('Error in requireSubscription middleware:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify subscription',
      error: error.message
    });
  }
};

/**
 * Middleware to check if user has premium subscription specifically
 */
export const requirePremium = async (req, res, next) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        type: 'AUTH_REQUIRED'
      });
    }

    // Check user's subscription status
    const [rows] = await pool.execute(
      'SELECT subscription_status, subscription_expires_at FROM users WHERE id = ?',
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        type: 'USER_NOT_FOUND'
      });
    }

    const user = rows[0];

    // Check if has premium subscription
    const hasPremium = 
      user.subscription_status === 'premium' &&
      (user.subscription_expires_at === null || 
       new Date(user.subscription_expires_at) > new Date());

    if (!hasPremium) {
      return res.status(403).json({
        success: false,
        message: 'This feature requires a Premium subscription. Please upgrade.',
        type: 'FEATURE_LOCKED',
        subscription_status: user.subscription_status,
        feature_locked: true,
        required_tier: 'premium'
      });
    }

    // User has premium subscription, proceed
    req.user.subscription_status = user.subscription_status;
    req.user.subscription_expires_at = user.subscription_expires_at;
    next();

  } catch (error) {
    console.error('Error in requirePremium middleware:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify premium subscription',
      error: error.message
    });
  }
};

/**
 * Helper function to check subscription status (doesn't block request)
 * Adds subscription info to req.user
 */
export const checkSubscription = async (req, res, next) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      // No user authenticated, just continue
      return next();
    }

    // Check user's subscription status
    const [rows] = await pool.execute(
      'SELECT subscription_status, subscription_expires_at FROM users WHERE id = ?',
      [userId]
    );

    if (rows.length > 0) {
      const user = rows[0];
      req.user.subscription_status = user.subscription_status;
      req.user.subscription_expires_at = user.subscription_expires_at;
      req.user.has_active_subscription = 
        user.subscription_status !== 'free' &&
        (user.subscription_expires_at === null || 
         new Date(user.subscription_expires_at) > new Date());
    }

    next();

  } catch (error) {
    console.error('Error in checkSubscription middleware:', error);
    // Don't block the request, just log the error
    next();
  }
};

