import { pool } from '../../db/connection.js';

class UserPreference {
  // Upsert preferences for a user
  static async upsert(pref) {
    const { user_id, user_guid, cycle_length, period_length } = pref;

    // Use the shared user_cycle table in db_week_one_up to persist lengths
    const [result] = await pool.query(
      'SELECT user_id FROM user_cycle WHERE user_id = ?',
      [user_id]
    );

    if (result.length > 0) {
      await pool.query(
        'UPDATE user_cycle SET cycle_length_days = ?, period_length_days = ? WHERE user_id = ?',
        [cycle_length, period_length, user_id]
      );
    } else {
      await pool.query(
        'INSERT INTO user_cycle (user_id, user_guid, cycle_length_days, period_length_days) VALUES (?, ?, ?, ?)',
        [user_id, user_guid, cycle_length, period_length]
      );
    }

    // Return a normalized shape expected by the frontend
    const [rows] = await pool.query(
      'SELECT user_id, cycle_length_days AS cycle_length, period_length_days AS period_length FROM user_cycle WHERE user_id = ?',
      [user_id]
    );
    return rows[0];
  }

  static async getByUser(user_id) {
    const [rows] = await pool.query(
      'SELECT user_id, cycle_length_days AS cycle_length, period_length_days AS period_length FROM user_cycle WHERE user_id = ?',
      [user_id]
    );
    return rows[0] || null;
  }
}

export default UserPreference;


