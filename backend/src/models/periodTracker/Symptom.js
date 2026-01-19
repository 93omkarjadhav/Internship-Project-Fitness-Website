import { pool } from '../../db/connection.js';

class Symptom {
  // Create a new symptom
  static async create(symptomData) {
    const { user_id, user_guid, cycle_id, symptom_type, severity, date, notes } = symptomData;

    const query = `
      INSERT INTO symptoms (user_id, user_guid, cycle_id, symptom_type, severity, date, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?);
    `;

    const [result] = await pool.query(query, [user_id, user_guid, cycle_id, symptom_type, severity, date, notes]);
    
    // Get the created symptom
    const [rows] = await pool.query('SELECT * FROM symptoms WHERE id = ?', [result.insertId]);
    return rows[0];
  }

  // Get all symptoms for a cycle
  static async getByCycle(cycleId) {
    const query = `
      SELECT * FROM symptoms 
      WHERE cycle_id = ? 
      ORDER BY date DESC;
    `;
    const [rows] = await pool.query(query, [cycleId]);
    return rows;
  }

  // Get symptom statistics
  static async getStatistics(userId) {
    const query = `
      SELECT 
        s.symptom_type,
        COUNT(*) as occurrence_count,
        ROUND(AVG(
          CASE 
            WHEN s.severity = 'mild' THEN 1
            WHEN s.severity = 'moderate' THEN 2
            WHEN s.severity = 'severe' THEN 3
            ELSE 0
          END
        ), 2) as avg_severity
      FROM symptoms s
      JOIN cycles c ON s.cycle_id = c.id
      WHERE c.user_id = ?
      GROUP BY s.symptom_type
      ORDER BY occurrence_count DESC;
    `;
    const [rows] = await pool.query(query, [userId]);
    return rows;
  }

  // Delete symptom
  static async delete(symptomId) {
    const [rows] = await pool.query('SELECT * FROM symptoms WHERE id = ?', [symptomId]);
    const symptom = rows[0];
    
    await pool.query('DELETE FROM symptoms WHERE id = ?', [symptomId]);
    return symptom;
  }

  // Get most common symptoms for a user
  static async getMostCommon(userId, limit = 5) {
    const query = `
      SELECT 
        s.symptom_type,
        COUNT(*) as count
      FROM symptoms s
      JOIN cycles c ON s.cycle_id = c.id
      WHERE c.user_id = ?
      GROUP BY s.symptom_type
      ORDER BY count DESC
      LIMIT ?;
    `;
    const [rows] = await pool.query(query, [userId, limit]);
    return rows;
  }
}

export default Symptom;


