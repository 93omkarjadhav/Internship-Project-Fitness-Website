import { pool } from '../db/connection.js';

const PROFILE_SELECT = `
  SELECT
    id,
    email,
    full_name,
    country,
    gender,
    dob,
    phone_number,
    address,
    profile_image_url,
    member_since,
    created_at,
    updated_at
  FROM users
  WHERE id = ?
`;

export const getWellnessProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    const [rows] = await pool.query(PROFILE_SELECT, [userId]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching wellness profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateWellnessProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    const {
      fullName,
      country,
      gender,
      dob,
      phone,
      email,
      address,
      profile_image_url,
    } = req.body;

    const updates = {
      full_name: fullName,
      country,
      gender,
      dob,
      phone_number: phone,
      email,
      address,
      profile_image_url,
    };

    const filteredUpdates = Object.entries(updates).reduce(
      (acc, [key, value]) => {
        if (value !== undefined) {
          acc[key] = value;
        }
        return acc;
      },
      {}
    );

    if (Object.keys(filteredUpdates).length === 0) {
      return res.status(400).json({ message: 'No valid fields provided.' });
    }

    await pool.query('UPDATE users SET ? WHERE id = ?', [
      filteredUpdates,
      userId,
    ]);

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating wellness profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user?.id;
    await pool.query('DELETE FROM users WHERE id = ?', [userId]);
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

