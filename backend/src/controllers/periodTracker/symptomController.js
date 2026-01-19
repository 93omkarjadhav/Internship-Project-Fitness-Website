import Symptom from '../../models/periodTracker/Symptom.js';
import { pool } from '../../db/connection.js';

export const createSymptom = async (req, res) => {
  try {
    const userId = req.user?.id;
    const userGuid = req.user?.guid;
    const symptom = await Symptom.create({
      ...req.body,
      user_id: userId,
      user_guid: userGuid
    });

    res.status(201).json({
      success: true,
      message: 'Symptom added successfully',
      data: symptom,
    });
  } catch (error) {
    console.error('Error creating symptom:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating symptom',
      error: error.message,
    });
  }
};

export const getSymptomsByCycle = async (req, res) => {
  try {
    const { cycleId } = req.params;
    const symptoms = await Symptom.getByCycle(cycleId);

    res.json({
      success: true,
      data: symptoms,
    });
  } catch (error) {
    console.error('Error fetching symptoms:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching symptoms',
      error: error.message,
    });
  }
};

export const getSymptomStatistics = async (req, res) => {
  try {
    const userId = req.user?.id || 1;
    const stats = await Symptom.getStatistics(userId);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error fetching symptom statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching symptom statistics',
      error: error.message,
    });
  }
};

export const deleteSymptom = async (req, res) => {
  try {
    const { id } = req.params;
    const symptom = await Symptom.delete(id);

    if (!symptom) {
      return res.status(404).json({
        success: false,
        message: 'Symptom not found',
      });
    }

    res.json({
      success: true,
      message: 'Symptom deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting symptom:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting symptom',
      error: error.message,
    });
  }
};

// Week2 functions for direct symptom saving
export const saveSymptoms = async (req, res) => {
  try {
    console.log("Received:", req.body);

    const { selectedSymptoms, selectedDate } = req.body;

    if (!selectedSymptoms || !Array.isArray(selectedSymptoms)) {
      return res.status(400).json({ error: "selectedSymptoms must be an array" });
    }

    // Format date properly for MySQL (optional)
    const formattedDate = selectedDate
      ? new Date(selectedDate).toISOString().split("T")[0]
      : null;

    // Get authenticated user ID from middleware
    const userId = req.user?.id || 1;
    const userGuid = req.user?.guid;

    for (const symptom of selectedSymptoms) {
      await pool.query(
        "INSERT INTO symptoms (user_id, user_guid, symptom_type, date) VALUES (?, ?, ?, ?)",
        [userId, userGuid, symptom, formattedDate || new Date().toISOString().split('T')[0]]
      );
    }

    console.log("Symptoms inserted successfully");
    res.json({ message: "Symptoms saved successfully" });
  } catch (error) {
    console.error("Error inserting symptoms:", error);
    res.status(500).json({ error: "Server error" });
  }
};

export const getSymptoms = async (req, res) => {
  try {
    // Get authenticated user ID from middleware
    const userId = req.user?.id || 1;
    const [rows] = await pool.query(
      "SELECT id, user_id, cycle_id, symptom_type, severity, date, notes, created_at FROM symptoms WHERE user_id = ? ORDER BY created_at DESC",
      [userId]
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error("Error fetching symptoms:", error);
    res.status(500).json({ error: "Server error" });
  }
};


