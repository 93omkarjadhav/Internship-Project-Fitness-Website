// src/routes/activities.js
import express from "express";
import { pool } from "../db/connection.js";

const router = express.Router();

router.get("/activities", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM activities ORDER BY id ASC");
    res.json({ activities: rows });
  } catch (err) {
    console.error("ACTIVITIES ERROR:", err);
    res.status(500).json({ error: "Failed to fetch activities" });
  }
});

export default router;
