import { pool } from '../../db/connection.js';

class Cycle {
  // Create a new cycle
  static async create(cycleData) {
    const {
      user_id,
      user_guid,
      period_start_date,
      period_end_date,
      cycle_length,
      period_length,
      flow_intensity,
      fluid_type,
      notes,
    } = cycleData;

    const query = `
      INSERT INTO cycles (
        user_id, user_guid, period_start_date, period_end_date, 
        cycle_length, period_length,
        flow_intensity, fluid_type, notes
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
    `;

    const [result] = await pool.query(query, [
      user_id,
      user_guid,
      period_start_date,
      period_end_date,
      cycle_length || null,
      period_length || null,
      flow_intensity,
      fluid_type,
      notes,
    ]);

    // Get the created cycle
    const [rows] = await pool.query('SELECT * FROM cycles WHERE id = ?', [result.insertId]);
    return rows[0];
  }

  // Get all cycles for a user
  static async getAllByUser(userId) {
    const query = `
      SELECT * FROM cycles 
      WHERE user_id = ? 
      ORDER BY period_start_date DESC;
    `;
    const [rows] = await pool.query(query, [userId]);
    return rows;
  }

  // Get single cycle by ID
  static async getById(cycleId) {
    const query = `SELECT * FROM cycles WHERE id = ?;`;
    const [rows] = await pool.query(query, [cycleId]);
    return rows[0];
  }

  // Update cycle
  static async update(cycleId, updateData) {
    const {
      period_end_date,
      flow_intensity,
      fluid_type,
      notes,
    } = updateData;

    const query = `
      UPDATE cycles 
      SET 
        period_end_date = COALESCE(?, period_end_date),
        flow_intensity = COALESCE(?, flow_intensity),
        fluid_type = COALESCE(?, fluid_type),
        notes = COALESCE(?, notes),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?;
    `;

    await pool.query(query, [period_end_date, flow_intensity, fluid_type, notes, cycleId]);
    
    // Return updated cycle
    const [rows] = await pool.query('SELECT * FROM cycles WHERE id = ?', [cycleId]);
    return rows[0];
  }

  // Delete cycle
  static async delete(cycleId) {
    const [rows] = await pool.query('SELECT * FROM cycles WHERE id = ?', [cycleId]);
    const cycle = rows[0];
    
    await pool.query('DELETE FROM cycles WHERE id = ?', [cycleId]);
    return cycle;
  }

  // Get cycle statistics
  static async getStatistics(userId) {
    const query = `
      SELECT 
        AVG(CASE WHEN cycle_length > 0 THEN cycle_length END) as avg_cycle_length,
        AVG(CASE WHEN period_length > 0 THEN period_length END) as avg_period_length,
        COUNT(*) as total_cycles
      FROM cycles 
      WHERE user_id = ?;
    `;
    const [rows] = await pool.query(query, [userId]);
    return rows[0];
  }

  // Get recent cycles with symptoms
  static async getRecentWithSymptoms(userId, limit = 10) {
    const query = `
      SELECT 
        c.*,
        GROUP_CONCAT(
          DISTINCT CONCAT(
            '{"id":', COALESCE(s.id, 'null'), ',',
            '"symptom_type":"', COALESCE(s.symptom_type, ''), '",',
            '"severity":"', COALESCE(s.severity, ''), '",',
            '"date":"', COALESCE(s.date, ''), '"}'
          )
          SEPARATOR ','
        ) as symptoms_json
      FROM cycles c
      LEFT JOIN symptoms s ON c.id = s.cycle_id
      WHERE c.user_id = ?
      GROUP BY c.id
      ORDER BY c.period_start_date DESC
      LIMIT ?;
    `;
    const [rows] = await pool.query(query, [userId, limit]);
    
    // Parse symptoms JSON
    return rows.map(row => {
      let symptoms = [];
      if (row.symptoms_json) {
        try {
          symptoms = JSON.parse(`[${row.symptoms_json}]`);
        } catch (e) {
          console.error('Error parsing symptoms:', e);
        }
      }
      delete row.symptoms_json;
      return {
        ...row,
        symptoms
      };
    });
  }
}

export default Cycle;


