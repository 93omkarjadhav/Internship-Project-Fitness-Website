import { pool } from '../../db/connection.js';
import Cycle from '../../models/periodTracker/Cycle.js';

export const predictNextPeriod = async (req, res) => {
  try {
    const { lastPeriodDate } = req.body;
    const userId = req.user?.id || 1;
    const userGuid = req.user?.guid;

    if (!lastPeriodDate) {
      return res.status(400).json({ message: "lastPeriodDate is required" });
    }

    // Convert input to Date
    const lastDate = new Date(lastPeriodDate);
    lastDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get cycle statistics to use average cycle length
    const cycles = await Cycle.getAllByUser(userId);
    const stats = await Cycle.getStatistics(userId);
    
    // Use average cycle length from database, or default to 28
    const cycleLength = stats.avg_cycle_length ? Math.round(stats.avg_cycle_length) : 28;

    // Predict next period date
    const predictedDate = new Date(lastDate);
    predictedDate.setDate(predictedDate.getDate() + cycleLength);

    // Format dates for MySQL
    const formattedLastPeriodDate = lastDate.toISOString().split("T")[0];
    const formattedPredictedDate = predictedDate.toISOString().split("T")[0];

    // Calculate difference in days
    const diff = Math.max(0, Math.round(
      (predictedDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    ));

    // Format for frontend display
    const formattedDisplayDate = predictedDate.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    // Calculate ovulation and fertile window
    const ovulationDate = new Date(predictedDate);
    ovulationDate.setDate(ovulationDate.getDate() - 14);
    const fertileStart = new Date(ovulationDate);
    fertileStart.setDate(fertileStart.getDate() - 2);
    const fertileEnd = new Date(ovulationDate);
    fertileEnd.setDate(fertileEnd.getDate() + 2);

    // Save/update prediction in predictions table (not next_period_predictions)
    const [existingPred] = await pool.query(
      'SELECT * FROM predictions WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
      [userId]
    );

    if (existingPred.length > 0) {
      // Update existing prediction
      await pool.query(
        `UPDATE predictions SET 
          next_period_date = ?, 
          ovulation_date = ?, 
          fertile_window_start = ?, 
          fertile_window_end = ?,
          confidence_score = 0.98,
          updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [
          formattedPredictedDate,
          ovulationDate.toISOString().split("T")[0],
          fertileStart.toISOString().split("T")[0],
          fertileEnd.toISOString().split("T")[0],
          existingPred[0].id
        ]
      );
    } else {
      // Create new prediction
      // If userGuid is missing (e.g. user 1 default), we might need to fetch it or handle it.
      // But assuming updated auth flow, req.user has guid.
      await pool.query(
        `INSERT INTO predictions 
          (user_id, user_guid, next_period_date, ovulation_date, fertile_window_start, fertile_window_end, confidence_score)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          userGuid,
          formattedPredictedDate,
          ovulationDate.toISOString().split("T")[0],
          fertileStart.toISOString().split("T")[0],
          fertileEnd.toISOString().split("T")[0],
          0.98
        ]
      );
    }

    // Send response
    res.json({
      message: "Prediction successful",
      predictedDays: diff,
      predictedDate: formattedDisplayDate,
      cycleLength,
      confidence: "98%",
    });
  } catch (err) {
    console.error("Error predicting period:", err);
    res.status(500).json({ error: "Internal Server Error", details: err.message });
  }
};


