import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import pool from '../db/connection.js';

// Configure Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || 'your-google-client-id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'your-google-client-secret',
      callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3001/api/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log('Google OAuth callback received:', profile.id);
        
        const email = profile.emails?.[0]?.value;
        
        if (!email) {
          return done(new Error('No email found in Google profile'), undefined);
        }

        // Check if user exists
        const [existingUsers] = await pool.query(
          'SELECT id, email FROM users WHERE email = ?',
          [email]
        );

        if (existingUsers.length > 0) {
          // User exists, return existing user
          console.log('Existing Google user found:', email);
          return done(null, existingUsers[0]);
        }

        // Create new user (no password needed for Google users)
        const { v4: uuidv4 } = await import('uuid');
        const userGuid = uuidv4();

        const [insertResult] = await pool.query(
          'INSERT INTO users (email, user_guid, password_hash) VALUES (?, ?, ?)',
          [email, userGuid, 'GOOGLE_OAUTH'] // Special marker for OAuth users
        );

        const newUser = {
          id: insertResult.insertId,
          user_guid: userGuid,
          email,
        };

        console.log('New Google user created:', email);
        return done(null, newUser);
      } catch (error) {
        console.error('Google OAuth error:', error);
        return done(error, undefined);
      }
    }
  )
);

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const [users] = await pool.query('SELECT id, email FROM users WHERE id = ?', [id]);
    if (users.length > 0) {
      done(null, users[0]);
    } else {
      done(new Error('User not found'), null);
    }
  } catch (error) {
    done(error, null);
  }
});

export default passport;

