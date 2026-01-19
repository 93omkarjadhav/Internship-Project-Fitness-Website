import asyncHandler from '../utils/asyncHandler.js';
import { resolveUserId } from '../utils/user.js';
import { createMeal, deleteMeal, getMealById, createScheduledMeal, deleteScheduledMeal } from '../services/mealService.js';

export const createMealEntry = asyncHandler(async (req, res) => {
  const userId = resolveUserId(req.body?.userId, req.user);
  const userGuid = req.user.guid;
  const { meal_name, meal_date } = req.body || {};
  
  if (!meal_name || !meal_date) {
    return res.status(400).json({ error: 'meal_name and meal_date are required' });
  }

  const newId = await createMeal(userGuid, userId, req.body);
  const meal = await getMealById(userId, newId);
  res.status(201).json(meal);
});

export const getMealDetails = asyncHandler(async (req, res) => {
  const userId = resolveUserId(req.query.userId, req.user);
  const { id } = req.params;
  const meal = await getMealById(userId, id);
  if (!meal) {
    return res.status(404).json({ error: 'Meal not found' });
  }
  res.json(meal);
});

export const removeMeal = asyncHandler(async (req, res) => {
  const userId = resolveUserId(req.query.userId, req.user);
  const { id } = req.params;
  const deleted = await deleteMeal(userId, id);
  if (!deleted) {
    return res.status(404).json({ error: 'Meal not found' });
  }
  res.json({ message: 'Meal deleted successfully' });
});

export const createScheduledEntry = asyncHandler(async (req, res) => {
  const userId = resolveUserId(req.body?.userId, req.user);
  const userGuid = req.user.guid;
  const { meal_name, scheduled_date, scheduled_time } = req.body || {};
  if (!meal_name || !scheduled_date || !scheduled_time) {
    return res.status(400).json({ error: 'meal_name, scheduled_date and scheduled_time are required' });
  }

  const newId = await createScheduledMeal(userGuid, userId, req.body);
  res.status(201).json({ id: newId });
});

export const removeScheduledEntry = asyncHandler(async (req, res) => {
  const userId = resolveUserId(req.query.userId, req.user);
  const { id } = req.params;
  const deleted = await deleteScheduledMeal(userId, id);
  if (!deleted) {
    return res.status(404).json({ error: 'Scheduled meal not found' });
  }
  res.json({ message: 'Scheduled meal deleted successfully' });
});