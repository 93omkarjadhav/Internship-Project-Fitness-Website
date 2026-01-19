import asyncHandler from '../utils/asyncHandler.js';
import { resolveUserId } from '../utils/user.js';
import {
  getProfileSummary,
  updateProfileTargets,
  getNutritionScore,
  getNutritionInsight,
  getNutritionHistory,
  getWeeklyNutrition,
  getSchedule,
  getRecommendations,
  updateRecommendationStatus,
} from '../services/nutritionService.js';

export const getProfile = asyncHandler(async (req, res) => {
  const userId = resolveUserId(req.query.userId, req.user);
  const profile = await getProfileSummary(userId);
  // If profile doesn't exist, return default/empty structure instead of 404
  // so frontend can render the page and allow user to save (create) it.
  if (!profile) {
    return res.json({
      user_id: userId,
      display_name: req.user.name || 'User',
      calorie_target: 2000,
      protein_target: 150,
      fat_target: 70,
      carb_target: 200,
      meals_per_day: 3,
      hydration_target_ml: 2000,
      consumed: { calories: 0, protein: 0, fat: 0, carbs: 0 }
    });
  }
  res.json(profile);
});

export const patchProfileTargets = asyncHandler(async (req, res) => {
  const userId = resolveUserId(req.body?.userId, req.user);
  const userGuid = req.user.guid;
  const updated = await updateProfileTargets(userId, userGuid, req.body || {});
  if (!updated) return res.status(400).json({ error: 'No valid fields to update' });
  res.json(updated);
});

export const getScore = asyncHandler(async (req, res) => {
  const userId = resolveUserId(req.query.userId, req.user);
  const { date } = req.query;
  const score = await getNutritionScore(userId, date);
  res.json({ score });
});

export const getInsight = asyncHandler(async (req, res) => {
  const userId = resolveUserId(req.query.userId, req.user);
  const { date } = req.query;
  const insight = await getNutritionInsight(userId, date);
  if (!insight) return res.status(404).json({ error: 'Insight not available' });
  res.json(insight);
});

export const getHistory = asyncHandler(async (req, res) => {
  const userId = resolveUserId(req.query.userId, req.user);
  const history = await getNutritionHistory(userId, {
    startDate: req.query.startDate,
    endDate: req.query.endDate,
    mealType: req.query.mealType,
    search: req.query.search,
    sort: req.query.sort,
    limit: req.query.limit,
  });
  res.json({ items: history });
});

export const getWeekly = asyncHandler(async (req, res) => {
  const userId = resolveUserId(req.query.userId, req.user);
  const weekly = await getWeeklyNutrition(userId);
  res.json({ items: weekly });
});

export const getMealSchedule = asyncHandler(async (req, res) => {
  const userId = resolveUserId(req.query.userId, req.user);
  const schedule = await getSchedule(userId, { date: req.query.date });
  res.json({ items: schedule });
});

export const getRecs = asyncHandler(async (req, res) => {
  const userId = resolveUserId(req.query.userId, req.user);
  const items = await getRecommendations(userId, req.query.status);
  res.json({ items });
});

export const patchRecStatus = asyncHandler(async (req, res) => {
  const userId = resolveUserId(req.body?.userId, req.user);
  const { id } = req.params;
  const { status } = req.body || {};
  if (!status) return res.status(400).json({ error: 'status is required' });
  const updated = await updateRecommendationStatus(userId, id, status);
  if (!updated) return res.status(404).json({ error: 'Recommendation not found' });
  res.json(updated);
});