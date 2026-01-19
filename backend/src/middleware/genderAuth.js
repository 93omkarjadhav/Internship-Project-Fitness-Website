import { pool } from '../db/connection.js';

/**
 * Middleware to check if the user's gender allows access to period tracker features.
 * Only allows access for users with gender 'Female' or null (not set yet).
 * Blocks access for users with gender 'Male' or 'Other'.
 */
export const requireFemaleGender = async (req, res, next) => {
  try {
    // Get user ID from the authenticated user
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'Please log in to access this feature',
      });
    }

    // Query the user's gender from the database
    const [rows] = await pool.query(
      'SELECT gender FROM users WHERE id = ?',
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        message: 'User account not found',
      });
    }

    const userGender = rows[0].gender;

    // Allow access only for Female users or users who haven't set their gender yet
    if (userGender === null || userGender === 'Female') {
      return next();
    }

    // Block access for Male and Other genders
    return res.status(403).json({
      success: false,
      error: 'Access denied',
      message: 'Period tracker is only available for female users',
      code: 'GENDER_RESTRICTION',
    });
  } catch (error) {
    console.error('Error in gender authentication middleware:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'An error occurred while verifying access permissions',
    });
  }
};

/**
 * Middleware variant that checks gender from user_cycle table.
 * This ensures that period cycle data can only be created/accessed for female users.
 */
export const validateGenderForCycleData = async (req, res, next) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'Please log in to access this feature',
      });
    }

    // Query the user's gender
    const [rows] = await pool.query(
      'SELECT gender FROM users WHERE id = ?',
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        message: 'User account not found',
      });
    }

    const userGender = rows[0].gender;

    // Only allow Female users
    if (userGender !== 'Female' && userGender !== null) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'Period tracker features are only available for female users',
        code: 'GENDER_RESTRICTION',
      });
    }

    next();
  } catch (error) {
    console.error('Error validating gender for cycle data:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'An error occurred while validating access',
    });
  }
};


