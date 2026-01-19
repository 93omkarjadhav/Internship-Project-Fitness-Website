import {
  createConversation,
  getConversations,
  getMessages,
  sendMessage,
  updateConversation,
  deleteConversation,
} from '../services/ai/chatService.js';
import {
  getPreferences,
  updateCycleData,
  getCycleData,
} from '../services/ai/userService.js';
import { handleApiError } from '../utils/apiError.js';

const getUserId = (req) => req.user?.id || req.userId;

/**
 * Start a new AI conversation
 */
export const startConversation = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { title } = req.body;
    const conversation = await createConversation(userId, title);
    res.status(201).json(conversation);
  } catch (error) {
    handleApiError(res, error);
  }
};

/**
 * List all conversations for a user
 */
export const listConversations = async (req, res) => {
  try {
    const userId = getUserId(req);
    const conversations = await getConversations(userId);
    res.json(conversations);
  } catch (error) {
    handleApiError(res, error);
  }
};

/**
 * List messages for a conversation
 */
export const listMessages = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { conversationId } = req.params;
    const messages = await getMessages(userId, conversationId);
    res.json(messages);
  } catch (error) {
    handleApiError(res, error);
  }
};

/**
 * Send a message to AI
 * (All intelligence handled in chatService + geminiService)
 */
export const postMessage = async (req, res) => {
  try {
    const userId = getUserId(req);
    const userGuid = req.user?.guid || req.userGuid;
    const { conversationId } = req.params;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Message text is required.' 
      });
    }

    const response = await sendMessage(userId, userGuid, conversationId, text);
    res.status(201).json(response);
  } catch (error) {
    handleApiError(res, error);
  }
};

/**
 * Get AI preferences and daily limits
 */
export const getAiPreferences = async (req, res) => {
  try {
    const userId = getUserId(req);
    const data = await getPreferences(userId);
    res.json(data);
  } catch (error) {
    handleApiError(res, error);
  }
};

/**
 * Update menstrual cycle data
 */
export const updateCycle = async (req, res) => {
  try {
    const userId = getUserId(req);
    const userGuid = req.user?.guid;
    const data = await updateCycleData(userId, userGuid, req.body);
    res.json(data);
  } catch (error) {
    handleApiError(res, error);
  }
};

/**
 * Get menstrual cycle data
 */
export const getCycle = async (req, res) => {
  try {
    const userId = getUserId(req);
    const data = await getCycleData(userId);

    if (!data) {
      return res.status(404).json({ message: 'Cycle data not found' });
    }

    res.json(data);
  } catch (error) {
    handleApiError(res, error);
  }
};

/**
 * Update conversation title
 */
export const updateConversationTitle = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { conversationId } = req.params;
    const { title } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Title is required' });
    }

    const result = await updateConversation(userId, conversationId, title.trim());
    res.json(result);
  } catch (error) {
    handleApiError(res, error);
  }
};

/**
 * Delete conversation
 */
export const deleteConversationHandler = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { conversationId } = req.params;

    const result = await deleteConversation(userId, conversationId);
    res.json(result);
  } catch (error) {
    handleApiError(res, error);
  }
};
