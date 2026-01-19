import { pool } from '../../db/connection.js';
import Cycle from '../../models/periodTracker/Cycle.js';

export const savePeriodDate = async (req, res) => {
  try {
    const { selectedDate } = req.body;
    console.log("Received request body:", req.body);

    if (!selectedDate) {
      return res.status(400).json({ message: "selectedDate is required" });
    }

    // Handle date strings in YYYY-MM-DD format (local date, no timezone conversion)
    let formattedDate;
    if (typeof selectedDate === 'string') {
      // If already in YYYY-MM-DD format, use it directly
      if (/^\d{4}-\d{2}-\d{2}$/.test(selectedDate)) {
        formattedDate = selectedDate;
      } else {
        // If ISO string, extract date part but be careful with timezone
        // Parse as local date to avoid timezone shift
        const date = new Date(selectedDate);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        formattedDate = `${year}-${month}-${day}`;
      }
    } else if (selectedDate instanceof Date) {
      // Format as local date (YYYY-MM-DD) to avoid timezone issues
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      formattedDate = `${year}-${month}-${day}`;
    } else {
      return res.status(400).json({ message: "Invalid date format" });
    }

    console.log("Formatted date for DB:", formattedDate);

    // Get authenticated user ID from middleware
    const userId = req.user?.id || 1;
    const userGuid = req.user?.guid;
    const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [userId]);
    
    if (users.length === 0) {
      await pool.query(`
        INSERT INTO users (id, email, password_hash, full_name, created_at)
        VALUES (?, 'default@fitfare.com', '$2a$10$dummyhash', 'Default User', NOW())
      `, [userId]);
      console.log('✅ Created default user on-the-fly');
    }

    // Calculate cycle_length from previous cycle
    let cycleLength = null;
    const previousCycles = await Cycle.getAllByUser(userId);
    if (previousCycles.length > 0) {
      const lastCycle = previousCycles[0];
      if (lastCycle.period_start_date) {
        const lastStartDate = new Date(lastCycle.period_start_date);
        lastStartDate.setHours(0, 0, 0, 0);
        const currentStartDate = new Date(formattedDate);
        currentStartDate.setHours(0, 0, 0, 0);
        const diffTime = currentStartDate.getTime() - lastStartDate.getTime();
        const daysDiff = Math.round(diffTime / (1000 * 60 * 60 * 24));

        // Only use positive values; ignore if user logs an earlier date
        if (daysDiff > 0) {
          cycleLength = daysDiff;
          
          // Update the previous cycle's cycle_length if it wasn't set
          if (!lastCycle.cycle_length && cycleLength > 0) {
            await pool.query(
              'UPDATE cycles SET cycle_length = ? WHERE id = ?',
              [cycleLength, lastCycle.id]
            );
          }
        }
      }
    }

    // Create a new cycle entry with the selected date as period_start_date
    const cycleData = {
      user_id: userId,
      user_guid: userGuid || (users[0]?.user_guid), // Use from token or fetched user
      period_start_date: formattedDate,
      period_end_date: null, // Will be updated when user logs end date
      cycle_length: cycleLength,
      period_length: null, // Will be calculated when end date is provided
      flow_intensity: null,
      fluid_type: null,
      notes: null,
    };

    const cycle = await Cycle.create(cycleData);

    console.log("Cycle created successfully:", cycle.id);
    res.status(200).json({ 
      message: "Period start date saved successfully", 
      id: cycle.id,
      cycle: cycle
    });
  } catch (err) {
    console.error("Error saving period date:", err);
    res.status(500).json({ message: "Failed to save date", error: err.message });
  }
};


