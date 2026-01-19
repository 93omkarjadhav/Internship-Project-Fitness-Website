import { pool } from "../db/connection.js"; // MATCHES your project structure

// ===================== CREATE BOOKING =====================
export const createBooking = async (req, res) => {
  try {
    const userId = req.user.id;
    const { club_id, club_data } = req.body;

    let club;

    // Option 1: If full club_data is provided (for hardcoded clubs), use it directly
    if (club_data && (club_data.title || club_data.name) && club_data.price_per_day) {
      club = {
        id: club_data.id || club_id,
        title: club_data.title || club_data.name,
        city: club_data.location || club_data.city || 'Unknown City',
        price_per_day: club_data.price_per_day,
        image_url: club_data.image || club_data.image_url || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80',
        description: club_data.description || 'Fitness Club',
        rating: club_data.rating || 4.5
      };
    } 
    // Option 2: If only club_id is provided, fetch from database
    else if (club_id) {
      const [clubs] = await pool.query(
        "SELECT * FROM clubs WHERE id = ? LIMIT 1",
        [club_id]
      );

      if (clubs.length === 0) {
        return res.status(404).json({ message: "Club not found" });
      }

      const dbClub = clubs[0];
      club = {
        id: dbClub.id,
        title: dbClub.title || dbClub.name,
        city: dbClub.city || dbClub.location,
        price_per_day: dbClub.price_per_day,
        image_url: dbClub.image_url,
        description: dbClub.description,
        rating: dbClub.rating
      };
    } else {
      return res.status(400).json({ message: "club_id or club_data is required" });
    }

    const totalAmount = club.price_per_day;

    // Check if club exists in DB to avoid FK violation
    const [clubExists] = await pool.query("SELECT id FROM clubs WHERE id = ?", [club.id]);
    let validClubId = clubExists.length > 0 ? club.id : null;

    if (!validClubId) {
      console.warn(`⚠️ Warning: Club ID ${club.id} not found in DB. Auto-creating club...`);
      
      // Insert the missing club
      try {
        const [insertResult] = await pool.query(
          `INSERT INTO clubs (title, city, price_per_day, image_url, description, rating)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            club.title, 
            club.city, 
            club.price_per_day, 
            club.image_url, 
            club.description,
            club.rating
          ]
        );
        validClubId = insertResult.insertId;
        console.log(`✅ Auto-created missing club with ID: ${validClubId}`);
      } catch (createErr) {
        console.error("Failed to auto-create club:", createErr);
        // Fallback to error response if creation fails
        return res.status(500).json({ 
          message: "Club not found and failed to auto-create. Please try again.",
          error: createErr.message
        });
      }
    }

    // Insert booking
    try {
      const [result] = await pool.query(
        `INSERT INTO bookings 
         (user_id, user_guid, club_id, club_title, club_city, price_per_day, total_amount)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          req.user.guid,
          validClubId,
          club.title,
          club.city,
          club.price_per_day,
          totalAmount,
        ]
      );

      const [newBooking] = await pool.query(
        "SELECT * FROM bookings WHERE id = ?",
        [result.insertId]
      );

      return res.status(201).json({
        message: "Booking created successfully",
        booking: newBooking[0],
      });
    } catch (insertError) {
      console.error("❌ INSERT Booking Error:", insertError);
      
      // If validClubId was null and it failed, maybe column is NOT NULL.
      // Or some other error.
      return res.status(500).json({ 
        message: "Failed to create booking. Club might not be valid.", 
        error: insertError.message 
      });
    }

  } catch (err) {
    console.error("createBooking ERROR:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};


// ===================== GET MY BOOKINGS =====================
export const getMyBookings = async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await pool.query(
      `SELECT 
          b.*,
          c.image_url,
          c.rating
       FROM bookings b
       LEFT JOIN clubs c ON b.club_id = c.id
       WHERE b.user_id = ?
       ORDER BY b.created_at DESC`,
      [userId]
    );

    return res.json({ bookings: rows });

  } catch (err) {
    console.error("getMyBookings ERROR:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    const [result] = await pool.execute(
      "DELETE FROM bookings WHERE id = ? AND user_id = ?",
      [id, user_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Booking not found or unauthorized" });
    }

    return res.json({ message: "Booking deleted successfully" });
  } catch (err) {
    console.error("DELETE BOOKING ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
