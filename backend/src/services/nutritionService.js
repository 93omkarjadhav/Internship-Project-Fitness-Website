import { pool } from '../db/connection.js';
import { toISODate, getPastDate } from '../utils/date.js';

const selectProfileSql = `
  SELECT
    up.user_id,
    up.display_name,
    up.calorie_target,
    up.protein_target,
    up.fat_target,
    up.carb_target,
    up.meals_per_day,
    up.hydration_target_ml,
    up.food_preference,
    up.common_allergies,
    up.snack_frequency,
    up.calorie_intake,
    up.other_notes
  FROM user_profiles up
  WHERE up.user_id = ?
`;

export const getProfileSummary = async (userId) => {
  const today = toISODate();
  const [[profile]] = await pool.query(selectProfileSql, [userId]);
  if (!profile) {
    return null;
  }

  // Parse common_allergies JSON if present
  if (profile.common_allergies) {
    try {
      if (typeof profile.common_allergies === 'string') {
        const parsed = JSON.parse(profile.common_allergies);
        profile.common_allergies = Array.isArray(parsed) ? parsed : [parsed];
      } else if (!Array.isArray(profile.common_allergies)) {
        profile.common_allergies = [profile.common_allergies];
      }
    } catch (e) {
      // If parsing fails, treat as single string item if not empty
      if (typeof profile.common_allergies === 'string' && profile.common_allergies.trim()) {
        profile.common_allergies = [profile.common_allergies];
      } else {
        profile.common_allergies = [];
      }
    }
  } else {
    profile.common_allergies = [];
  }

  const [[consumed]] = await pool.query(
    `
      SELECT
        COALESCE(SUM(calories), 0) AS calories,
        COALESCE(SUM(protein), 0)  AS protein,
        COALESCE(SUM(fat), 0)      AS fat,
        COALESCE(SUM(carbs), 0)    AS carbs
      FROM meals
      WHERE user_id = ?
        AND meal_date = ?
    `,
    [userId, today]
  );

  return {
    ...profile,
    consumed: {
      calories: Number(consumed.calories) || 0,
      protein: Number(consumed.protein) || 0,
      fat: Number(consumed.fat) || 0,
      carbs: Number(consumed.carbs) || 0,
    },
  };
};

export const updateProfileTargets = async (userId, userGuid, payload) => {
  const {
    calorie_target,
    protein_target,
    fat_target,
    carb_target,
    meals_per_day,
    hydration_target_ml,
    food_preference,
    common_allergies,
    snack_frequency,
    calorie_intake,
    other_notes
  } = payload;

  // Check if profile exists
  const [[existing]] = await pool.query('SELECT 1 FROM user_profiles WHERE user_id = ?', [userId]);

  if (existing) {
    const fields = [];
    const params = [];

    if (calorie_target !== undefined) { fields.push('calorie_target = ?'); params.push(calorie_target); }
    if (protein_target !== undefined) { fields.push('protein_target = ?'); params.push(protein_target); }
    if (fat_target !== undefined) { fields.push('fat_target = ?'); params.push(fat_target); }
    if (carb_target !== undefined) { fields.push('carb_target = ?'); params.push(carb_target); }
    if (meals_per_day !== undefined) { fields.push('meals_per_day = ?'); params.push(meals_per_day); }
    if (hydration_target_ml !== undefined) { fields.push('hydration_target_ml = ?'); params.push(hydration_target_ml); }
    
    // New fields support
    if (food_preference !== undefined) { fields.push('food_preference = ?'); params.push(food_preference); }
    if (common_allergies !== undefined) { fields.push('common_allergies = ?'); params.push(JSON.stringify(common_allergies)); }
    if (snack_frequency !== undefined) { fields.push('snack_frequency = ?'); params.push(snack_frequency); }
    if (calorie_intake !== undefined) { fields.push('calorie_intake = ?'); params.push(calorie_intake); }
    if (other_notes !== undefined) { fields.push('other_notes = ?'); params.push(other_notes); }

    if (fields.length > 0) {
      params.push(userId);
      await pool.query(`UPDATE user_profiles SET ${fields.join(', ')} WHERE user_id = ?`, params);
    }
  } else {
    // Create new profile with provided values or defaults
    await pool.query(
      `INSERT INTO user_profiles 
        (user_id, user_guid, calorie_target, protein_target, fat_target, carb_target, meals_per_day, hydration_target_ml,
         food_preference, common_allergies, snack_frequency, calorie_intake, other_notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        userGuid,
        calorie_target || 2000,
        protein_target || 150,
        fat_target || 70,
        carb_target || 250,
        meals_per_day || 3,
        hydration_target_ml || 2500,
        food_preference || '',
        JSON.stringify(common_allergies || []),
        snack_frequency || '',
        calorie_intake || 2000,
        other_notes || ''
      ]
    );
  }

  return getProfileSummary(userId);
};

export const getNutritionScore = async (userId, date = toISODate()) => {
  const [[row]] = await pool.query(
    `
      SELECT up.calorie_target AS target,
             COALESCE(SUM(m.calories), 0) AS consumed
      FROM user_profiles up
      LEFT JOIN meals m
        ON up.user_id = m.user_id
       AND m.meal_date = ?
      WHERE up.user_id = ?
      GROUP BY up.calorie_target
    `,
    [date, userId]
  );

  // If no profile, try to calculate from meals only with default target
  if (!row) {
    const [[consumedRow]] = await pool.query(
      'SELECT COALESCE(SUM(calories), 0) as consumed FROM meals WHERE user_id = ? AND meal_date = ?',
      [userId, date]
    );
    const consumed = consumedRow ? Number(consumedRow.consumed) : 0;
    const target = 2000; // Default
    return Math.round(Math.min((consumed / target) * 100, 100));
  }

  const target = Number(row.target) || 0;
  const consumed = Number(row.consumed) || 0;
  if (!target) return 0;
  return Math.round(Math.min((consumed / target) * 100, 100));
};

export const getNutritionInsight = async (userId, date = toISODate()) => {
  const [[row]] = await pool.query(
    `
      SELECT
        up.calorie_target AS targetCalories,
        up.protein_target,
        up.fat_target,
        up.carb_target,
        COALESCE(SUM(m.calories), 0) AS consumedCalories,
        COALESCE(SUM(m.protein), 0)  AS proteinConsumed,
        COALESCE(SUM(m.fat), 0)      AS fatConsumed,
        COALESCE(SUM(m.carbs), 0)    AS carbsConsumed
      FROM user_profiles up
      LEFT JOIN meals m
        ON up.user_id = m.user_id
       AND m.meal_date = ?
      WHERE up.user_id = ?
      GROUP BY up.calorie_target, up.protein_target, up.fat_target, up.carb_target
    `,
    [date, userId]
  );

  if (!row) {
    // Fallback if no profile exists
    const [[consumed]] = await pool.query(
      `SELECT 
         COALESCE(SUM(calories), 0) as consumedCalories,
         COALESCE(SUM(protein), 0) as proteinConsumed,
         COALESCE(SUM(fat), 0) as fatConsumed,
         COALESCE(SUM(carbs), 0) as carbsConsumed
       FROM meals 
       WHERE user_id = ? AND meal_date = ?`,
       [userId, date]
    );

    const targetCalories = 2000;
    return {
      consumedCalories: consumed ? Number(consumed.consumedCalories) : 0,
      targetCalories,
      totalTargetCalories: targetCalories,
      protein: {
        consumed: consumed ? Number(consumed.proteinConsumed) : 0,
        target: 120,
      },
      fat: {
        consumed: consumed ? Number(consumed.fatConsumed) : 0,
        target: 70,
      },
      carbs: {
        consumed: consumed ? Number(consumed.carbsConsumed) : 0,
        target: 250,
      },
    };
  }

  const targetCalories = Number(row.targetCalories) || 0;
  return {
    consumedCalories: Number(row.consumedCalories) || 0,
    targetCalories,
    totalTargetCalories: targetCalories,
    protein: {
      consumed: Number(row.proteinConsumed) || 0,
      target: Number(row.protein_target) || Math.round((0.3 * targetCalories) / 4),
    },
    fat: {
      consumed: Number(row.fatConsumed) || 0,
      target: Number(row.fat_target) || Math.round((0.25 * targetCalories) / 9),
    },
    carbs: {
      consumed: Number(row.carbsConsumed) || 0,
      target: Number(row.carb_target) || Math.round((0.45 * targetCalories) / 4),
    },
  };
};

export const getNutritionHistory = async (userId, options = {}) => {
  const conditions = ['user_id = ?'];
  const params = [userId];

  if (options.startDate) {
    conditions.push('meal_date >= ?');
    params.push(options.startDate);
  }

  if (options.endDate) {
    conditions.push('meal_date <= ?');
    params.push(options.endDate);
  }

  if (options.mealType) {
    conditions.push('meal_type = ?');
    params.push(options.mealType);
  }

  if (options.search) {
    conditions.push('meal_name LIKE ?');
    params.push(`%${options.search}%`);
  }

  const orderDirection = options.sort === 'oldest' ? 'ASC' : 'DESC';
  const limitClause = options.limit ? `LIMIT ${Number(options.limit)}` : '';

  const sql = `
      SELECT
        id,
        meal_name,
        meal_type,
        calories,
        protein,
        fat,
        carbs,
        fiber,
        DATE_FORMAT(meal_date, '%Y-%m-%d') AS meal_date,
        meal_time
      FROM meals
      WHERE ${conditions.join(' AND ')}
      ORDER BY meal_date ${orderDirection}, meal_time ${orderDirection}
      ${limitClause}
    `;

  const [rows] = await pool.query(sql, params);

  return rows.map((row) => ({
    ...row,
    calories: Number(row.calories) || 0,
    protein: Number(row.protein) || 0,
    fat: Number(row.fat) || 0,
    carbs: Number(row.carbs) || 0,
    fiber: Number(row.fiber) || 0,
  }));
};

export const getWeeklyNutrition = async (userId) => {
  const startDate = toISODate(getPastDate(6));
  const [rows] = await pool.query(
    `
      SELECT DATE(meal_date) AS day,
             COALESCE(SUM(calories), 0) AS calories,
             COALESCE(SUM(protein), 0)  AS protein,
             COALESCE(SUM(fat), 0)      AS fat
      FROM meals
      WHERE user_id = ?
        AND meal_date >= ?
      GROUP BY DATE(meal_date)
    `,
    [userId, startDate]
  );

  const map = new Map(rows.map((row) => [row.day.toISOString().split('T')[0], row]));
  const data = [];
  for (let i = 6; i >= 0; i -= 1) {
    const date = getPastDate(i);
    const key = toISODate(date);
    const item = map.get(key);
    data.push({
      day: date.toLocaleDateString(undefined, { weekday: 'short' }),
      calories: item ? Number(item.calories) : 0,
      protein: item ? Number(item.protein) : 0,
      fat: item ? Number(item.fat) : 0,
    });
  }

  return data;
};

export const getSchedule = async (userId, options = {}) => {
  const conditions = ['user_id = ?'];
  const params = [userId];

  // show future meals
  conditions.push('(meal_date > CURDATE() OR (meal_date = CURDATE() AND meal_time > CURTIME()))');

  if (options.date) {
    conditions.push('meal_date >= ?');
    params.push(options.date);
  }

  const [rows] = await pool.query(
    `
      SELECT
        id,
        meal_name,
        meal_type,
        meal_time AS scheduled_time,
        meal_date AS scheduled_date,
        calories,
        protein,
        fat,
        carbs,
        'scheduled' AS status
      FROM meals
      WHERE ${conditions.join(' AND ')}
      ORDER BY meal_date ASC, meal_time ASC
    `,
    params
  );

  return rows.map((row) => ({
    ...row,
    calories: Number(row.calories) || 0,
    protein: Number(row.protein) || 0,
    fat: Number(row.fat) || 0,
    carbs: Number(row.carbs) || 0,
  }));
};

export const getRecommendations = async (userId, status) => {
  const conditions = ['user_id = ?'];
  const params = [userId];
  if (status && status !== 'all') {
    conditions.push('status = ?');
    params.push(status);
  }

  const [rows] = await pool.query(
    `
      SELECT id,
             title,
             summary,
             focus_area,
             score_delta,
             action_text,
             status
      FROM user_recommendations
      WHERE ${conditions.join(' AND ')}
      ORDER BY created_at DESC
    `,
    params
  );
  return rows;
};

export const updateRecommendationStatus = async (userId, recommendationId, status) => {
  await pool.query(
    'UPDATE user_recommendations SET status = ? WHERE id = ? AND user_id = ?',
    [status, recommendationId, userId]
  );
  const [[row]] = await pool.query(
    `
      SELECT id,
             title,
             summary,
             focus_area,
             score_delta,
             action_text,
             status
      FROM user_recommendations
      WHERE id = ? AND user_id = ?
    `,
    [recommendationId, userId]
  );
  return row || null;
};