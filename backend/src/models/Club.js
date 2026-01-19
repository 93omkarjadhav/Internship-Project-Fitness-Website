import { pool } from '../db/connection.js';

class Club {
  /**
   * Fetch all clubs with optional price filter
   * @param {number} maxPrice - Maximum price per day (optional)
   * @returns {Promise<Array>} Array of club objects
   */
  static async findByPrice(maxPrice = 9999) {
    try {
      const sql = `
        SELECT 
          id, 
          name, 
          description, 
          location, 
          price_per_day, 
          rating, 
          image_url,
          facilities,
          opening_hours,
          contact_number,
          created_at
        FROM clubs 
        WHERE price_per_day <= ? 
        ORDER BY rating DESC, price_per_day ASC
      `;
      const [rows] = await pool.execute(sql, [maxPrice]);
      
      // Parse JSON facilities field
      return rows.map(club => ({
        ...club,
        facilities: typeof club.facilities === 'string' 
          ? JSON.parse(club.facilities) 
          : club.facilities
      }));
    } catch (error) {
      console.error('Error fetching clubs by price:', error);
      throw error;
    }
  }

  /**
   * Search clubs by name, location, or price
   * @param {string} term - Search term
   * @returns {Promise<Array>} Array of matching club objects
   */
  static async search(term) {
    try {
      const sql = `
        SELECT 
          id, 
          name, 
          description, 
          location, 
          price_per_day, 
          rating, 
          image_url,
          facilities,
          opening_hours,
          contact_number,
          created_at
        FROM clubs 
        WHERE name LIKE ? 
          OR location LIKE ? 
          OR description LIKE ?
          OR CAST(price_per_day AS CHAR) LIKE ?
        ORDER BY rating DESC
      `;
      const searchTerm = `%${term}%`;
      const [rows] = await pool.execute(sql, [searchTerm, searchTerm, searchTerm, searchTerm]);
      
      // Parse JSON facilities field
      return rows.map(club => ({
        ...club,
        facilities: typeof club.facilities === 'string' 
          ? JSON.parse(club.facilities) 
          : club.facilities
      }));
    } catch (error) {
      console.error('Error searching clubs:', error);
      throw error;
    }
  }

  /**
   * Get club by ID
   * @param {number} id - Club ID
   * @returns {Promise<Object>} Club object
   */
  static async findById(id) {
    try {
      const sql = `
        SELECT 
          id, 
          name, 
          description, 
          location, 
          price_per_day, 
          rating, 
          image_url,
          facilities,
          opening_hours,
          contact_number,
          created_at
        FROM clubs 
        WHERE id = ?
      `;
      const [rows] = await pool.execute(sql, [id]);
      
      if (rows.length === 0) {
        return null;
      }

      const club = rows[0];
      return {
        ...club,
        facilities: typeof club.facilities === 'string' 
          ? JSON.parse(club.facilities) 
          : club.facilities
      };
    } catch (error) {
      console.error('Error fetching club by ID:', error);
      throw error;
    }
  }

  /**
   * Get all clubs (with pagination)
   * @param {number} limit - Number of records to fetch
   * @param {number} offset - Offset for pagination
   * @returns {Promise<Array>} Array of club objects
   */
  static async findAll(limit = 50, offset = 0) {
    try {
      const sql = `
        SELECT 
          id, 
          name, 
          description, 
          location, 
          price_per_day, 
          rating, 
          image_url,
          facilities,
          opening_hours,
          contact_number,
          created_at
        FROM clubs 
        ORDER BY rating DESC, price_per_day ASC
        LIMIT ? OFFSET ?
      `;
      // Ensure limit and offset are integers
      const limitInt = parseInt(limit, 10);
      const offsetInt = parseInt(offset, 10);
      const [rows] = await pool.execute(sql, [limitInt, offsetInt]);
      
      // Parse JSON facilities field
      return rows.map(club => ({
        ...club,
        facilities: typeof club.facilities === 'string' 
          ? JSON.parse(club.facilities) 
          : club.facilities
      }));
    } catch (error) {
      console.error('Error fetching all clubs:', error);
      throw error;
    }
  }

  /**
   * Get clubs by location
   * @param {string} location - Location name
   * @returns {Promise<Array>} Array of club objects
   */
  static async findByLocation(location) {
    try {
      const sql = `
        SELECT 
          id, 
          name, 
          description, 
          location, 
          price_per_day, 
          rating, 
          image_url,
          facilities,
          opening_hours,
          contact_number,
          created_at
        FROM clubs 
        WHERE location LIKE ?
        ORDER BY rating DESC, price_per_day ASC
      `;
      const [rows] = await pool.execute(sql, [`%${location}%`]);
      
      // Parse JSON facilities field
      return rows.map(club => ({
        ...club,
        facilities: typeof club.facilities === 'string' 
          ? JSON.parse(club.facilities) 
          : club.facilities
      }));
    } catch (error) {
      console.error('Error fetching clubs by location:', error);
      throw error;
    }
  }

  /**
   * Create a new club
   * @param {Object} clubData - Club data
   * @returns {Promise<Object>} Created club object with ID
   */
  static async create(clubData) {
    try {
      const {
        name,
        description,
        location,
        price_per_day,
        rating = 0,
        image_url,
        facilities = [],
        opening_hours,
        contact_number
      } = clubData;

      const sql = `
        INSERT INTO clubs (
          name, 
          description, 
          location, 
          price_per_day, 
          rating, 
          image_url, 
          facilities, 
          opening_hours, 
          contact_number
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const facilitiesJson = JSON.stringify(facilities);
      const [result] = await pool.execute(sql, [
        name,
        description,
        location,
        price_per_day,
        rating,
        image_url,
        facilitiesJson,
        opening_hours,
        contact_number
      ]);

      return {
        id: result.insertId,
        ...clubData,
        facilities
      };
    } catch (error) {
      console.error('Error creating club:', error);
      throw error;
    }
  }

  /**
   * Update club by ID
   * @param {number} id - Club ID
   * @param {Object} clubData - Updated club data
   * @returns {Promise<boolean>} Success status
   */
  static async update(id, clubData) {
    try {
      const fields = [];
      const values = [];

      // Build dynamic update query
      Object.keys(clubData).forEach(key => {
        if (key === 'facilities') {
          fields.push(`${key} = ?`);
          values.push(JSON.stringify(clubData[key]));
        } else {
          fields.push(`${key} = ?`);
          values.push(clubData[key]);
        }
      });

      if (fields.length === 0) {
        return false;
      }

      values.push(id);
      const sql = `UPDATE clubs SET ${fields.join(', ')} WHERE id = ?`;
      const [result] = await pool.execute(sql, values);

      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error updating club:', error);
      throw error;
    }
  }

  /**
   * Delete club by ID
   * @param {number} id - Club ID
   * @returns {Promise<boolean>} Success status
   */
  static async delete(id) {
    try {
      const sql = 'DELETE FROM clubs WHERE id = ?';
      const [result] = await pool.execute(sql, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting club:', error);
      throw error;
    }
  }
}

export default Club;

