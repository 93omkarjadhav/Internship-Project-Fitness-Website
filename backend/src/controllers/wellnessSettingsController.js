import bcrypt from 'bcryptjs';
import { pool } from '../db/connection.js';

const ensureSecuritySettings = async (userId) => {
  await pool.query(
    'INSERT IGNORE INTO user_security_settings (user_id) VALUES (?)',
    [userId]
  );
};

const ensureNotificationSettings = async (userId) => {
  await pool.query(
    'INSERT IGNORE INTO user_notification_settings (user_id) VALUES (?)',
    [userId]
  );
};

export const getSecuritySettings = async (req, res) => {
  try {
    const userId = req.user?.id;
    await ensureSecuritySettings(userId);
    const [rows] = await pool.query(
      'SELECT * FROM user_security_settings WHERE user_id = ?',
      [userId]
    );
    res.json(rows[0]);
  } catch (error) {
    console.error('Error getting security settings:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateSecuritySettings = async (req, res) => {
  try {
    const userId = req.user?.id;
    await ensureSecuritySettings(userId);

    const {
      enablePin,
      biometricLogin,
      rememberLogin,
      useFaceId,
      accountRecovery,
    } = req.body;

    await pool.query(
      'UPDATE user_security_settings SET ? WHERE user_id = ?',
      [
        {
          enable_pin: enablePin,
          biometric_login: biometricLogin,
          remember_login: rememberLogin,
          use_face_id: useFaceId,
          account_recovery: accountRecovery,
        },
        userId,
      ]
    );

    res.json({ message: 'Security settings updated' });
  } catch (error) {
    console.error('Error updating security settings:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const changePassword = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: 'Password is required' });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [
      hash,
      userId,
    ]);

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const setPasscode = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { passcode } = req.body;

    if (!passcode || passcode.length !== 6) {
      return res
        .status(400)
        .json({ message: 'Passcode must be exactly 6 digits' });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(passcode, salt);

    await pool.query('UPDATE users SET passcode_hash = ? WHERE id = ?', [
      hash,
      userId,
    ]);

    res.json({ message: 'Passcode set successfully' });
  } catch (error) {
    console.error('Error setting passcode:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getNotifications = async (req, res) => {
  try {
    const userId = req.user?.id;
    await ensureNotificationSettings(userId);
    const [rows] = await pool.query(
      'SELECT * FROM user_notification_settings WHERE user_id = ?',
      [userId]
    );
    res.json(rows[0]);
  } catch (error) {
    console.error('Error getting notification settings:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateNotifications = async (req, res) => {
  try {
    const userId = req.user?.id;
    await ensureNotificationSettings(userId);

    const {
      activityReminder,
      pushNotification,
      nutritionReminder,
      aiRecommendations,
      weeklyInsight,
    } = req.body;

    await pool.query(
      'UPDATE user_notification_settings SET ? WHERE user_id = ?',
      [
        {
          activity_reminder: activityReminder,
          push_notification: pushNotification,
          nutrition_reminder: nutritionReminder,
          ai_recommendations: aiRecommendations,
          weekly_insight: weeklyInsight,
        },
        userId,
      ]
    );

    res.json({ message: 'Notification settings updated' });
  } catch (error) {
    console.error('Error updating notifications:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

