import { pool } from "../db/connection.js";

const DEFAULT_WEEK = {
  mon: "pending",
  tue: "pending",
  wed: "pending",
  thu: "pending",
  fri: "pending",
  sat: "pending",
  sun: "pending",
};

const ensureStreakRow = async (userId) => {
  await pool.query(
    "INSERT IGNORE INTO user_streaks (user_id) VALUES (?)",
    [userId]
  );
};

export const getStreakData = async (req, res) => {
  try {
    const userId = req.user?.id;

    await ensureStreakRow(userId);

    const [rows] = await pool.query(
      "SELECT * FROM user_streaks WHERE user_id = ?",
      [userId]
    );

    if (!rows.length) {
      return res.status(404).json({ message: "Streak data not found" });
    }

    const row = rows[0];

    // Parse weekly_status safely
    let week = {};
    try {
      week = row.weekly_status ? JSON.parse(row.weekly_status) : {};
    } catch {
      week = {};
    }

    // Always return full 7 days
    week = { ...DEFAULT_WEEK, ...week };

    return res.json({
      user_id: row.user_id,
      current_streak: row.current_streak,
      longest_streak: row.longest_streak,
      last_login_date: row.last_login_date,
      weekly_status: week,
    });
  } catch (error) {
    console.error("Error fetching streak data:", error);
    res.status(500).json({ message: "Server error" });
  }
};
