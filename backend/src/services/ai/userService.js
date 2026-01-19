import { pool } from '../../db/connection.js';
import { ApiError } from '../../utils/apiError.js';

const getTodayDate = () => {
  const today = new Date();
  const offset = today.getTimezoneOffset();
  const local = new Date(today.getTime() - offset * 60 * 1000);
  return local.toISOString().split('T')[0];
};

/* ===========================
   EXISTING CODE (UNCHANGED)
   =========================== */

export const getPreferences = async (userId) => {
  const today = getTodayDate();
  const [rows] = await pool.query(
    'SELECT * FROM user_preferences WHERE user_id = ?',
    [userId]
  );

  let preferences;

  if (rows.length === 0) {
    // Fetch user_guid to insert with preferences
    const [userRows] = await pool.query('SELECT user_guid FROM users WHERE id = ?', [userId]);
    const userGuid = userRows[0]?.user_guid;

    await pool.query(
      'INSERT INTO user_preferences (user_id, user_guid, last_chat_date, daily_chat_count) VALUES (?, ?, ?, 0)',
      [userId, userGuid, today]
    );
    preferences = {
      user_id: userId,
      theme: 'system',
      ai_persona: 'friendly',
      gender_identity: 'prefer-not-say',
      daily_chat_count: 0,
      last_chat_date: today,
    };
  } else {
    preferences = rows[0];
    const lastChatDate = preferences.last_chat_date
      ? new Date(preferences.last_chat_date).toISOString().split('T')[0]
      : null;

    if (lastChatDate !== today) {
      await pool.query(
        'UPDATE user_preferences SET daily_chat_count = 0, last_chat_date = ? WHERE user_id = ?',
        [today, userId]
      );
      preferences.daily_chat_count = 0;
      preferences.last_chat_date = today;
    }
  }

  const chatsLeft = 100 - preferences.daily_chat_count;

  return {
    ...preferences,
    aiModelName: 'Gemini 2.5 Flash',
    chatsLeft: chatsLeft < 0 ? 0 : chatsLeft,
    chatLimit: 100,
  };
};

export const incrementChatCount = async (userId) => {
  const today = getTodayDate();
  await pool.query(
    `UPDATE user_preferences
     SET daily_chat_count = daily_chat_count + 1, last_chat_date = ?
     WHERE user_id = ?`,
    [today, userId]
  );
};

export const getMemories = async (userId) => {
  const [rows] = await pool.query(
    'SELECT memory_text FROM user_memory WHERE user_id = ? ORDER BY created_at DESC',
    [userId]
  );
  return rows.map((row) => row.memory_text);
};

export const addMemory = async (userId, userGuid, memoryText) => {
  const [rows] = await pool.query(
    'SELECT id FROM user_memory WHERE user_id = ? AND memory_text = ?',
    [userId, memoryText]
  );

  if (rows.length > 0) {
    return { message: 'I already have that memory saved!' };
  }

  await pool.query(
    'INSERT INTO user_memory (user_id, user_guid, memory_text) VALUES (?, ?, ?)',
    [userId, userGuid, memoryText]
  );

  return { message: 'Got it! I will remember that.' };
};

export const getCycleData = async (userId) => {
  const [userRows] = await pool.query(
    'SELECT gender FROM users WHERE id = ?',
    [userId]
  );

  if (userRows.length === 0 || userRows[0].gender !== 'Female') {
    return null;
  }

  const [rows] = await pool.query(
    'SELECT * FROM user_cycle WHERE user_id = ?',
    [userId]
  );

  if (rows.length === 0) return null;

  const cycle = rows[0];
  const lastDate = new Date(cycle.last_period_start);
  const nextPeriodStart = new Date(
    lastDate.setDate(lastDate.getDate() + cycle.cycle_length_days)
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffMs = nextPeriodStart - today;
  const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  return {
    ...cycle,
    nextPeriodStart: nextPeriodStart.toISOString().split('T')[0],
    daysLeft,
  };
};

/* ===========================
   🔥 NEW: PERIOD REASONING CONTEXT
   =========================== */
export const getCycleContext = async (userId) => {
  const [userRows] = await pool.query(
    'SELECT gender FROM users WHERE id = ?',
    [userId]
  );

  if (userRows.length === 0 || userRows[0].gender !== 'Female') {
    return null;
  }

  const [cycleRows] = await pool.query(
    'SELECT cycle_length_days, period_length_days, last_period_start FROM user_cycle WHERE user_id = ?',
    [userId]
  );

  const [predictionRows] = await pool.query(
    'SELECT next_period_date FROM predictions WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
    [userId]
  );

  const [symptomRows] = await pool.query(
    'SELECT symptom_type FROM symptoms WHERE user_id = ? ORDER BY date DESC LIMIT 10',
    [userId]
  );

  if (cycleRows.length === 0 && symptomRows.length === 0) return null;

  const cycle = cycleRows[0] || {};
  const symptoms = symptomRows.map(s => s.symptom_type);
  const irregular = cycle.cycle_length_days && cycle.cycle_length_days > 35;

  return {
    cycleLength: cycle.cycle_length_days,
    periodLength: cycle.period_length_days,
    lastPeriodStart: cycle.last_period_start,
    nextPeriod: predictionRows[0]?.next_period_date,
    symptoms,
    irregular,
  };
};
export const updateCycleData = async (
  userId,
  userGuid,
  { last_period_start, cycle_length_days = 28, period_length_days = 5 }
) => {
  if (!last_period_start) {
    throw new ApiError(400, '`last_period_start` is required.');
  }

  const [userRows] = await pool.query(
    'SELECT gender FROM users WHERE id = ?',
    [userId]
  );

  if (userRows.length === 0) {
    throw new ApiError(404, 'User not found.');
  }

  if (userRows[0].gender !== null && userRows[0].gender !== 'Female') {
    throw new ApiError(403, 'Period tracking is only available for female users.');
  }

  await pool.query(
    `INSERT INTO user_cycle (user_id, user_guid, last_period_start, cycle_length_days, period_length_days)
     VALUES (?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       last_period_start = VALUES(last_period_start),
       cycle_length_days = VALUES(cycle_length_days),
       period_length_days = VALUES(period_length_days)`,
    [userId, userGuid, last_period_start, cycle_length_days, period_length_days]
  );

  return getCycleData(userId);
};
