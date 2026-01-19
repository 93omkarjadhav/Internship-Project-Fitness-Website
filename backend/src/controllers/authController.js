import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import pool from '../db/connection.js';
import { sendPasswordResetEmail, sendPasswordResetSMS } from '../utils/emailService.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const RESET_TOKEN_EXPIRY = 1000 * 60 * 60; // 1 hour in milliseconds

// ---------------------- STREAK HELPERS (India timezone) ----------------------

const DEFAULT_WEEK = {
  mon: 'pending',
  tue: 'pending',
  wed: 'pending',
  thu: 'pending',
  fri: 'pending',
  sat: 'pending',
  sun: 'pending',
};

// "Now" in Asia/Kolkata
function nowIndia() {
  // Create a Date object representing current time in Asia/Kolkata
  return new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
}

// Format YYYY-MM-DD from a JS Date (assumes date is already in intended tz)
function fmtYMD(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// "Today" as YYYY-MM-DD in India tz
function todayIndiaStr() {
  return fmtYMD(nowIndia());
}

// Monday (00:00) of week for a Date
function mondayOf(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  const day = (x.getDay() + 6) % 7; // Mon=0..Sun=6
  x.setDate(x.getDate() - day);
  return x.getTime();
}

// Are two YYYY-MM-DD strings in the same ISO week?
function sameIsoWeek(aStr, bStr) {
  return mondayOf(new Date(aStr)) === mondayOf(new Date(bStr));
}

// Yesterday (YYYY-MM-DD) in India tz
function yesterdayIndiaStr() {
  const d = nowIndia();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - 1);
  return fmtYMD(d);
}

// Which weekday key (mon..sun) is "today" in India tz?
function todayWeekdayKey() {
  const idx = (nowIndia().getDay() + 6) % 7; // Mon=0..Sun=6
  return ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'][idx];
}

// Ensure a streak row exists for the user
async function ensureStreakRow(userId) {
  await pool.query('INSERT IGNORE INTO user_streaks (user_id) VALUES (?)', [userId]);
}

// Update daily login streak — called on successful sign-in
async function updateLoginStreak(userId) {
  await ensureStreakRow(userId);

  const today = todayIndiaStr();
  const yesterday = yesterdayIndiaStr();
  const [rows] = await pool.query('SELECT * FROM user_streaks WHERE user_id = ?', [userId]);
  const row = rows[0];

  // Parse weekly_status safely and ensure all 7 keys
  let week = {};
  try {
    week = row?.weekly_status ? JSON.parse(row.weekly_status) : {};
  } catch {
    week = {};
  }
  week = { ...DEFAULT_WEEK, ...week };

  let current = Number(row?.current_streak || 0);
  let longest = Number(row?.longest_streak || 0);

  // last_login_date is a DATE column; convert to YYYY-MM-DD using local getters
  const lastDate = row?.last_login_date ? new Date(row.last_login_date) : null;
  const last = lastDate ? fmtYMD(lastDate) : null;

  if (last === today) {
    // Already logged in today — just mark today's bubble as done
    week[todayWeekdayKey()] = 'done';
  } else if (last === yesterday) {
    // Continue streak
    current += 1;

    // If a new ISO week started between last and today, reset week bubbles first
    if (!sameIsoWeek(last, today)) {
      week = { ...DEFAULT_WEEK };
    }
    week[todayWeekdayKey()] = 'done';
  } else {
    // Missed day(s) or first login — reset to 1
    current = 1;

    // New week? Reset bubbles
    if (!last || !sameIsoWeek(last, today)) {
      week = { ...DEFAULT_WEEK };
    }
    week[todayWeekdayKey()] = 'done';
  }

  if (current > longest) longest = current;

  await pool.query(
    'UPDATE user_streaks SET current_streak = ?, longest_streak = ?, last_login_date = ?, weekly_status = ? WHERE user_id = ?',
    [current, longest, today, JSON.stringify(week), userId]
  );
}

// ---------------------- ORIGINAL CODE (unchanged behavior) ----------------------

const bootstrapUserWellness = async (userId, userGuid) => {
  const queries = [
    'INSERT IGNORE INTO user_security_settings (user_id, user_guid) VALUES (?, ?)',
    'INSERT IGNORE INTO user_notification_settings (user_id, user_guid) VALUES (?, ?)',
    'INSERT IGNORE INTO user_streaks (user_id, user_guid) VALUES (?, ?)',
    'INSERT IGNORE INTO user_preferences (user_id, user_guid, daily_chat_count) VALUES (?, ?, 0)',
    'INSERT IGNORE INTO user_cycle (user_id, user_guid) VALUES (?, ?)',
  ];

  for (const query of queries) {
    await pool.query(query, [userId, userGuid]);
  }
};

export const signUp = async (req, res) => {
  try {
    const { email, password, gender } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Validate gender if provided
    if (gender && !['Female', 'Male', 'Other'].includes(gender)) {
      return res.status(400).json({ error: 'Gender must be Female, Male, or Other' });
    }

    // Password strength validation
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        error:
          'Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
      });
    }

    // Check if user exists
    const [existingUser] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Default phone number for new sign-ups
    const defaultPhoneNumber = '+917387742121';

    const userGuid = uuidv4();

    // Create user with gender
    const [insertResult] = await pool.query(
      'INSERT INTO users (email, password_hash, phone_number, gender, user_guid) VALUES (?, ?, ?, ?, ?)',
      [email, passwordHash, defaultPhoneNumber, gender || null, userGuid]
    );
    
    // fetch GUID now
    const [guidRows] = await pool.query(
      'SELECT user_guid FROM users WHERE id = ?',
      [insertResult.insertId]
    );
    
    const user = { id: insertResult.insertId, user_guid: guidRows[0].user_guid, email, gender: gender || null };
    
    await bootstrapUserWellness(user.id, user.user_guid);

    // Generate JWT token
    const token = jwt.sign({ guid: user.user_guid, email: user.email }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });
    

    res.status(201).json({
      user: {
        guid: user.user_guid,
        email: user.email,
      },
      token,
    });
  } catch (error) {
    console.error('Sign up error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const signIn = async (req, res) => {
  try {
    const { email, password, keepSignedIn } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const [rows] = await pool.query(
      'SELECT id, user_guid, email, password_hash FROM users WHERE email = ?',
      [email]
    );
    

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = rows[0];
    await bootstrapUserWellness(user.id);

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // ⭐ Update daily login streak (India timezone) on successful sign-in
    await updateLoginStreak(user.id, user.user_guid);

    // Generate JWT token
    const token = jwt.sign(
      { guid: user.user_guid, email: user.email },
      JWT_SECRET,
      { expiresIn: keepSignedIn ? '365d' : JWT_EXPIRES_IN }
    );
    

    res.json({
      user: {
        guid: user.user_guid,
        email: user.email,
      },
      token,
    });
  } catch (error) {
    console.error('Sign in error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Find user
    const [rows] = await pool.query('SELECT id, email FROM users WHERE email = ?', [email]);

    if (rows.length === 0) {
      // Don't reveal if email exists
      return res.json({ message: 'If the email exists, a password reset link will be sent' });
    }

    const user = rows[0];

    // Generate reset token
    const resetToken = uuidv4();
    const expiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRY);

    // Invalidate old tokens
    await pool.query('UPDATE password_reset_tokens SET used = true WHERE user_id = ?', [user.id]);

    // Save new token
    await pool.query(
      'INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
      [user.id, resetToken, expiresAt]
    );

    // Send email
    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:8080'}/reset-password?token=${resetToken}`;
    await sendPasswordResetEmail(email, resetUrl);

    res.json({ message: 'If the email exists, a password reset link will be sent' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const forgotPasswordSMS = async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    // Find user by phone number
    const [rows] = await pool.query('SELECT id, email FROM users WHERE phone_number = ?', [
      phoneNumber,
    ]);

    if (rows.length === 0) {
      // Don't reveal if phone exists
      return res.json({ message: 'If the phone number exists, a password reset link will be sent' });
    }

    const user = rows[0];

    // Generate reset token
    const resetToken = uuidv4();
    const expiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRY);

    // Invalidate old tokens
    await pool.query('UPDATE password_reset_tokens SET used = true WHERE user_id = ?', [user.id]);

    // Save new token
    await pool.query(
      'INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
      [user.id, resetToken, expiresAt]
    );

    // Send SMS
    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:8080'}/reset-password?token=${resetToken}`;
    await sendPasswordResetSMS(phoneNumber, resetUrl);

    res.json({ message: 'If the phone number exists, a password reset link will be sent via SMS' });
  } catch (error) {
    console.error('Forgot password SMS error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const verifyResetToken = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    // Find token
    const [rows] = await pool.query(
      'SELECT user_id, expires_at, used FROM password_reset_tokens WHERE token = ?',
      [token]
    );

    if (rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    const tokenData = rows[0];

    if (tokenData.used) {
      return res.status(400).json({ error: 'Token has already been used' });
    }

    if (new Date(tokenData.expires_at) < new Date()) {
      return res.status(400).json({ error: 'Token has expired' });
    }

    res.json({ valid: true });
  } catch (error) {
    console.error('Verify reset token error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token: resetToken, password } = req.body;

    if (!resetToken || !password) {
      return res.status(400).json({ error: 'Token and password are required' });
    }

    // Password strength validation
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        error:
          'Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
      });
    }

    // Find token
    const [tokenRows] = await pool.query(
      'SELECT user_id, expires_at, used FROM password_reset_tokens WHERE token = ?',
      [resetToken]
    );

    if (tokenRows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    const tokenData = tokenRows[0];

    if (tokenData.used) {
      return res.status(400).json({ error: 'Token has already been used' });
    }

    if (new Date(tokenData.expires_at) < new Date()) {
      return res.status(400).json({ error: 'Token has expired' });
    }

    // Hash new password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Update password
    await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [
      passwordHash,
      tokenData.user_id,
    ]);

    // Mark token as used
    await pool.query('UPDATE password_reset_tokens SET used = true WHERE token = ?', [resetToken]);

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const verifyAuth = async (req, res) => {
  try {
    // const userId = req.user?.id;
    const userGuid = req.user?.guid;


    if (!userGuid) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get user details including gender
    const [rows] = await pool.query(
      'SELECT id, user_guid, email, gender, full_name, profile_image_url FROM users WHERE user_guid = ?', 
       [userGuid]
    );
    
    if (rows.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }

    res.json({
      user: rows[0],
    });
  } catch (error) {
    console.error('Verify auth error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updatePhoneNumber = async (req, res) => {
  try {
    const { email, phoneNumber } = req.body;

    if (!email || !phoneNumber) {
      return res.status(400).json({ error: 'Email and phone number are required' });
    }

    // Find user by email
    const [users] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update phone number
    await pool.query('UPDATE users SET phone_number = ? WHERE email = ?', [phoneNumber, email]);

    res.json({ message: 'Phone number updated successfully' });
  } catch (error) {
    console.error('Update phone number error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
