import { pool } from '../db/connection.js';

// Convert GUID to numeric ID
async function getNumericUserId(userGuid) {
  const [rows] = await pool.query(
    "SELECT id FROM users WHERE user_guid = ?",
    [userGuid]
  );

  if (!rows.length) {
    throw new Error("Invalid user GUID - user not found");
  }

  return rows[0].id;
}

export const createMeal = async (userGuid, userId, payload) => {
  console.log("➡️ createMeal userGuid:", userGuid, "userId:", userId);

  const {
    meal_name,
    meal_type = 'Other',
    calories = 0,
    protein = 0,
    fat = 0,
    carbs = 0,
    fiber = 0,
    meal_date,
    meal_time = '12:00:00',
    notes = null,
  } = payload;

  const [result] = await pool.query(
    `
      INSERT INTO meals (
        user_id,
        user_guid,
        meal_name,
        meal_type,
        calories,
        protein,
        fat,
        carbs,
        fiber,
        meal_date,
        meal_time,
        notes
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [userId, userGuid, meal_name, meal_type, calories, protein, fat, carbs, fiber, meal_date, meal_time, notes]
  );

  return result.insertId;
};

export const getMealById = async (userId, mealId) => {
  const [[row]] = await pool.query(
    `
      SELECT
        id,
        meal_name,
        meal_type,
        calories,
        protein,
        fat,
        carbs,
        fiber,
        meal_date,
        meal_time,
        notes
      FROM meals
      WHERE id = ? AND user_id = ?
    `,
    [mealId, userId]
  );

  if (!row) return null;
  return {
    ...row,
    calories: Number(row.calories) || 0,
    protein: Number(row.protein) || 0,
    fat: Number(row.fat) || 0,
    carbs: Number(row.carbs) || 0,
    fiber: Number(row.fiber) || 0,
  };
};

export const deleteMeal = async (userId, mealId) => {
  const [result] = await pool.query(
    'DELETE FROM meals WHERE id = ? AND user_id = ?',
    [mealId, userId]
  );

  return result.affectedRows > 0;
};

export const createScheduledMeal = async (userGuid, userId, payload) => {
  const {
    meal_name,
    meal_type = 'Meal',
    scheduled_time,
    calories = 0,
    protein = 0,
    fat = 0,
    carbs = 0,
    scheduled_date,
  } = payload;

  const [result] = await pool.query(
    `
      INSERT INTO scheduled_meals (
        user_id,
        user_guid,
        meal_name,
        meal_type,
        scheduled_time,
        calories,
        protein,
        fat,
        carbs,
        scheduled_date,
        status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'scheduled')
    `,
    [userId, userGuid, meal_name, meal_type, scheduled_time, calories, protein, fat, carbs, scheduled_date]
  );

  return result.insertId;
};

export const deleteScheduledMeal = async (userId, id) => {
  const [result] = await pool.query(
    'DELETE FROM scheduled_meals WHERE id = ? AND user_id = ?',
    [id, userId]
  );

  return result.affectedRows > 0;
};
