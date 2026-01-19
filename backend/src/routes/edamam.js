import express from "express";
import fetch from "node-fetch";

const router = express.Router();

router.get("/nutrition", async (req, res) => {
  try {
    const { food } = req.query;

    const url = `https://api.edamam.com/api/food-database/v2/parser?app_id=${process.env.EDAMAM_APP_ID}&app_key=${process.env.EDAMAM_APP_KEY}&ingr=${encodeURIComponent(food)}`;

    const response = await fetch(url);
    const data = await response.json();

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Edamam fetch failed" });
  }
});

export default router;
