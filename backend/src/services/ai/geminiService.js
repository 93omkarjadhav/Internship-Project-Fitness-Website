import { GoogleGenerativeAI } from '@google/generative-ai';
import { ApiError } from '../../utils/apiError.js';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

let genAI = null;
let model = null;

if (GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 512,
    },
  });
} else {
  console.warn(
    'GEMINI_API_KEY is not set. AI responses will use a fallback message.'
  );
}

export const getGeminiReply = async (
  prompt,
  userMemories = [],
  conversationHistory = [],
  userContext = null
) => {
  if (!genAI || !model) {
    return 'AI service is not configured. Please add GEMINI_API_KEY to continue the conversation.';
  }

  try {
    const fitfareKnowledge = `
FitFare AI GUIDELINES:

- You have access to user-specific data provided in CONTEXT.
- For nutrition questions, use calorie targets, macros, allergies, and intake.
- For menstrual and period questions:
  • Use cycle length, period length, and logged symptoms if provided.
  • Explain possible lifestyle, hormonal, or health-related reasons.
  • Common causes include stress, PCOS/PCOD, anemia, PMS, endometriosis, weight changes, sleep issues.
  • DO NOT give medical diagnosis.
  • DO NOT jump to calendar or dates unless user explicitly asks "when" or "next period".
  • Be supportive, calm, and reassuring.
- If data is missing, explain gently and suggest logging info.

Always answer the user's exact question.
`;

    let contextInfo = '';
    if (userContext) {
      contextInfo = `\n\nCURRENT USER INFORMATION:\n${userContext}`;
    }

    let memoryContext = '';
    if (userMemories.length > 0) {
      memoryContext = `\n\nUSER MEMORIES:\n${userMemories
        .map((memory) => `- ${memory}`)
        .join('\n')}`;
    }

    let historyContext = '';
    if (conversationHistory.length > 0) {
      const recentHistory = conversationHistory.slice(-8);
      historyContext = `\n\nCONVERSATION HISTORY:\n${recentHistory
        .map(
          (msg) =>
            `${msg.sender_type === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
        )
        .join('\n')}`;
    }

    const systemPrompt = `
You are FitFare AI, a friendly, intelligent health & wellness assistant.

You respond like a helpful human, not a robot.
You do NOT use markdown, emojis, bullet points, or special formatting.
You write in simple, natural paragraphs like a chat message.

${fitfareKnowledge}
${contextInfo}
${memoryContext}
${historyContext}

USER QUESTION:
"${prompt}"

IMPORTANT RESPONSE RULES:
- Answer ONLY what the user asked.
- If the question is "why" or "explain", give reasoning.
- If the question is about periods, explain causes using symptoms and cycle info.
- If the question is about dates, then mention timing.
- Be concise, supportive, and clear.

Now write the best possible response:
`;

    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    const text = response.text();

    return text;
  } catch (error) {
    console.error('Error calling Gemini API:', error);

    if (error?.status === 503) {
      return "I'm a bit busy right now. Please try again in a moment 🙂";
    }

    if (error?.status === 429) {
      return "I've reached my usage limit for now. Please try again later.";
    }

    return "I'm having trouble responding right now. Please try again shortly.";
  }
};
