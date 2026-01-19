import { v4 as uuidv4 } from 'uuid';
import { pool } from '../../db/connection.js';
import { ApiError } from '../../utils/apiError.js';
import {
  addMemory,
  getCycleData,
  getMemories,
  incrementChatCount,
} from './userService.js';
import { getGeminiReply } from './geminiService.js';

// Get comprehensive user context for AI
const getUserContext = async (userId) => {
  try {
    const [userRows] = await pool.query(
      'SELECT id, email, full_name, gender, dob, country FROM users WHERE id = ?',
      [userId]
    );
    const user = userRows[0] || {};

    const [profileRows] = await pool.query(
      'SELECT calorie_target, protein_target, fat_target, carb_target, food_preference, common_allergies, snack_frequency FROM user_profiles WHERE user_id = ?',
      [userId]
    );
    const profile = profileRows[0] || {};

    let cycleData = null;
    let symptomContext = null;

    if (user.gender === 'Female') {
      cycleData = await getCycleData(userId);

      const [symptomRows] = await pool.query(
        'SELECT symptom_type FROM symptoms WHERE user_id = ? ORDER BY date DESC LIMIT 10',
        [userId]
      );
      if (symptomRows.length > 0) {
        symptomContext = symptomRows.map(s => s.symptom_type);
      }
    }

    const today = new Date().toISOString().split('T')[0];
    const [mealRows] = await pool.query(
      `SELECT 
        COALESCE(SUM(calories), 0) as calories_consumed,
        COALESCE(SUM(protein), 0) as protein_consumed,
        COALESCE(SUM(fat), 0) as fat_consumed,
        COALESCE(SUM(carbs), 0) as carbs_consumed
      FROM meals WHERE user_id = ? AND meal_date = ?`,
      [userId, today]
    );
    const todayNutrition = mealRows[0] || {};

    const contextParts = [];

    if (user.full_name) contextParts.push(`User name: ${user.full_name}`);
    if (user.gender) contextParts.push(`Gender: ${user.gender}`);
    if (user.country) contextParts.push(`Location: ${user.country}`);

    if (profile.calorie_target) {
      contextParts.push(
        `Nutrition targets: ${profile.calorie_target} kcal, Protein ${profile.protein_target}g, Fat ${profile.fat_target}g, Carbs ${profile.carb_target}g`
      );
    }

    if (profile.food_preference) {
      contextParts.push(`Diet preference: ${profile.food_preference}`);
    }

    if (profile.common_allergies) {
      try {
        const allergies = JSON.parse(profile.common_allergies);
        if (Array.isArray(allergies) && allergies.length > 0) {
          contextParts.push(`Allergies: ${allergies.join(', ')}`);
        }
      } catch {}
    }

    if (todayNutrition.calories_consumed > 0 && profile.calorie_target) {
      contextParts.push(
        `Today's intake: ${todayNutrition.calories_consumed} kcal (${Math.round(
          (todayNutrition.calories_consumed / profile.calorie_target) * 100
        )}% of goal)`
      );
    }

    if (cycleData) {
      contextParts.push(
        `Menstrual cycle: ${cycleData.cycle_length_days}-day cycle, ${cycleData.period_length_days}-day period`
      );
    }

    if (symptomContext && symptomContext.length > 0) {
      contextParts.push(`Recent menstrual symptoms: ${symptomContext.join(', ')}`);
    }

    return contextParts.length ? contextParts.join('\n') : null;
  } catch (error) {
    console.error('Error getting user context:', error);
    return null;
  }
};

const checkForOptionsTrigger = () => null;

/* 🔥 FIXED: calendar triggers ONLY for DATE questions */
const checkForCalendarTrigger = async (text, userId) => {
  const lower = text.toLowerCase();

  const dateIntents = [
    'when is my period',
    'when will my period',
    'next period',
    'period date',
    'period calendar',
    'track my period',
    'cycle date',
  ];

  const isDateQuestion = dateIntents.some(intent => lower.includes(intent));
  if (!isDateQuestion) return null;

  const [userRows] = await pool.query(
    'SELECT gender FROM users WHERE id = ?',
    [userId]
  );

  if (userRows.length === 0 || userRows[0].gender !== 'Female') {
    return null;
  }

  const cycleData = await getCycleData(userId);
  if (!cycleData) return null;

  const nextDate = new Date(cycleData.nextPeriodStart);
  const formattedDate = nextDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  return {
    id: Math.random(),
    sender_type: 'ai',
    content: `Your next period is expected in ${cycleData.daysLeft} days (around ${formattedDate}).`,
    avatar: '/Avatar.png',
    time: new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    }),
    calendarData: {
      daysLeft: `${cycleData.daysLeft}d`,
      nextPeriodDate: formattedDate,
      highlightDate: cycleData.nextPeriodStart,
      periodLength: cycleData.period_length_days,
    },
  };
};

const checkForMemoryTrigger = async (text, userId, userGuid) => {
  const match = text.toLowerCase().match(/^(?:remember that|remember) ([\w\s.,'’-]+)/i);
  if (!match) return null;

  const result = await addMemory(userId, userGuid, match[1].trim());
  return {
    id: Math.random(),
    sender_type: 'ai',
    content: result.message,
    avatar: '/Avatar.png',
    time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
  };
};

const checkForMemoryRecallTrigger = async (text, userId) => {
  const lower = text.toLowerCase();
  if (
    ![
      'what is my name',
      'what do you remember about me',
      'what do you know about me',
    ].some(t => lower.startsWith(t))
  ) {
    return null;
  }

  const memories = await getMemories(userId);
  return {
    id: Math.random(),
    sender_type: 'ai',
    content:
      memories.length === 0
        ? "You haven't asked me to remember anything yet."
        : "Here's what I remember:\n" + memories.map(m => `- ${m}`).join('\n'),
    avatar: '/Avatar.png',
    time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
  };
};

export const createConversation = async (userId, title = 'New Chat') => {
  const id = uuidv4();
  // Get user_guid from database since this function might be called without req context
  const [rows] = await pool.query('SELECT user_guid FROM users WHERE id = ?', [userId]);
  const userGuid = rows[0]?.user_guid;

  await pool.query(
    'INSERT INTO conversations (id, user_id, user_guid, title) VALUES (?, ?, ?, ?)',
    [id, userId, userGuid, title]
  );
  return { id, user_id: userId, title };
};

export const getConversations = async (userId) => {
  const [rows] = await pool.query(
    'SELECT * FROM conversations WHERE user_id = ? ORDER BY created_at DESC',
    [userId]
  );
  return rows;
};

export const getMessages = async (userId, conversationId) => {
  const [rows] = await pool.query(
    'SELECT id FROM conversations WHERE id = ? AND user_id = ?',
    [conversationId, userId]
  );
  if (rows.length === 0) {
    throw new ApiError(404, 'Conversation not found or access denied.');
  }

  const [messages] = await pool.query(
    'SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC',
    [conversationId]
  );

  return messages.map((msg) => ({
    ...msg,
    avatar: msg.sender_type === 'user' ? '/UserAvatar.png' : '/Avatar.png',
    time: new Date(msg.created_at).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    }),
  }));
};

export const sendMessage = async (userId, userGuid, conversationId, text) => {
  if (!text || !text.trim()) {
    throw new ApiError(400, 'Message text is required.');
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Insert user message (messages table doesn't have user_guid column)
    await connection.query(
      'INSERT INTO messages (conversation_id, sender_type, content) VALUES (?, ?, ?)',
      [conversationId, 'user', text]
    );

    await incrementChatCount(userId);

    const memoryResponse = await checkForMemoryTrigger(text, userId, userGuid);
    if (memoryResponse) {
      await connection.commit();
      return memoryResponse;
    }

    const recallResponse = await checkForMemoryRecallTrigger(text, userId);
    if (recallResponse) {
      await connection.commit();
      return recallResponse;
    }

    const calendarResponse = await checkForCalendarTrigger(text, userId, userGuid);
    if (calendarResponse) {
      await connection.commit();
      return calendarResponse;
    }

    const [historyMessages] = await connection.query(
      'SELECT sender_type, content FROM messages WHERE conversation_id = ? ORDER BY created_at DESC LIMIT 10',
      [conversationId]
    );

    const aiText = await getGeminiReply(
      text,
      await getMemories(userId),
      historyMessages.reverse(),
      await getUserContext(userId)
    );

    const [aiResult] = await connection.query(
      'INSERT INTO messages (conversation_id, sender_type, content) VALUES (?, ?, ?)',
      [conversationId, 'ai', aiText]
    );

    await connection.commit();

    return {
      id: aiResult.insertId,
      conversation_id: conversationId,
      sender_type: 'ai',
      content: aiText,
      avatar: '/Avatar.png',
      time: new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
  } catch (error) {
    await connection.rollback();
    console.error('Error sending AI message:', error);
    throw error;
  } finally {
    connection.release();
  }
};

/**
 * Update conversation title
 */
export const updateConversation = async (userId, conversationId, title) => {
  // First verify the conversation belongs to the user
  const [rows] = await pool.query(
    'SELECT id FROM conversations WHERE id = ? AND user_id = ?',
    [conversationId, userId]
  );
  
  if (rows.length === 0) {
    throw new ApiError(404, 'Conversation not found or access denied.');
  }

  // Update the title
  await pool.query(
    'UPDATE conversations SET title = ? WHERE id = ? AND user_id = ?',
    [title, conversationId, userId]
  );

  return { success: true, message: 'Conversation updated successfully' };
};

/**
 * Delete conversation and all its messages
 */
export const deleteConversation = async (userId, conversationId) => {
  // First verify the conversation belongs to the user
  const [rows] = await pool.query(
    'SELECT id FROM conversations WHERE id = ? AND user_id = ?',
    [conversationId, userId]
  );
  
  if (rows.length === 0) {
    throw new ApiError(404, 'Conversation not found or access denied.');
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Delete all messages first (due to foreign key constraint)
    await connection.query(
      'DELETE FROM messages WHERE conversation_id = ?',
      [conversationId]
    );

    // Delete the conversation
    await connection.query(
      'DELETE FROM conversations WHERE id = ? AND user_id = ?',
      [conversationId, userId]
    );

    await connection.commit();

    return { success: true, message: 'Conversation deleted successfully' };
  } catch (error) {
    await connection.rollback();
    console.error('Error deleting conversation:', error);
    throw error;
  } finally {
    connection.release();
  }
};
