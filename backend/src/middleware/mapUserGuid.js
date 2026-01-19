import {pool} from "../db/connection.js";

export async function mapUserGuid(req, res, next) {
  try {
    if (!req.user || !req.user.guid) return next();
    console.log("🔥 TOKEN DECODED:", req.user);

    const [rows] = await pool.query(
      "SELECT id FROM users WHERE user_guid = ?",
      [req.user.guid]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: "Invalid GUID" });
    }

    req.user.id = rows[0].id; // Old ID restored for old code
    next();
  } catch (err) {
    console.error("GUID map error:", err);
    res.status(500).json({ error: "Server error" });
  }
}
