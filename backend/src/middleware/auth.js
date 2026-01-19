import jwt from 'jsonwebtoken';
import { pool } from '../db/connection.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  jwt.verify(token, JWT_SECRET, async (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    try {
      // Ensure user exists and get numeric ID
      const [rows] = await pool.query('SELECT id, user_guid, email FROM users WHERE user_guid = ?', [decoded.guid]);
      
      if (rows.length === 0) {
        return res.status(401).json({ error: 'User not found' });
      }

      const user = rows[0];
      req.user = {
        id: user.id,
        guid: user.user_guid,
        email: user.email,
        ...decoded // Keep other claims
      };
      
      next();
    } catch (dbError) {
      console.error('Auth DB Error:', dbError);
      return res.status(500).json({ error: 'Internal server error during auth' });
    }
  });
};

// Alias for compatibility with profile routes
export const protect = authenticateToken;

