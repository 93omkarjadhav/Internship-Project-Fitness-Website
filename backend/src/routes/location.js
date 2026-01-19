import express from "express";
import fetch from "node-fetch";

const router = express.Router();

router.get("/reverse-geocode", async (req, res) => {
  const { lat, lon } = req.query;

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
      {
        headers: {
          "User-Agent": "FitFareApp/1.0"
        }
      }
    );

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("Reverse geocode error:", err);
    res.status(500).json({ error: "Failed to get location" });
  }
});

export default router;
