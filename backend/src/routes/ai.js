import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
  startConversation,
  listConversations,
  listMessages,
  postMessage,
  getAiPreferences,
  updateCycle,
  getCycle,
  updateConversationTitle,
  deleteConversationHandler,
} from '../controllers/aiChatController.js';

const router = express.Router();

router.use(authenticateToken);

router.post('/chat', startConversation);
router.get('/chat', listConversations);
router.get('/chat/:conversationId', listMessages);
router.post('/chat/:conversationId/send', postMessage);
router.put('/chat/:conversationId', updateConversationTitle);
router.delete('/chat/:conversationId', deleteConversationHandler);

router.get('/preferences', getAiPreferences);
router.get('/cycle', getCycle);
router.put('/cycle', updateCycle);

export default router;

