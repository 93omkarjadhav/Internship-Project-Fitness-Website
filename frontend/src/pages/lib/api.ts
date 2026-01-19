// Minimal client for Nutrition API endpoints used by Nutrition pages

export type ProfileSummary = {
  user_id: number;
  display_name: string;
  calorie_target: number;
  protein_target: number;
  fat_target: number;
  carb_target: number;
  meals_per_day: number;
  hydration_target_ml: number;
  consumed: {
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
  };
};

export type NutritionInsight = {
  consumedCalories: number;
  targetCalories: number;
  totalTargetCalories: number;
  protein: { consumed: number; target: number };
  fat: { consumed: number; target: number };
  carbs: { consumed: number; target: number };
};

export type WeeklyPoint = {
  day: string; // e.g., Mon, Tue
  calories: number;
  protein: number;
  fat: number;
};

export type MealData = {
  id: number;
  meal_name: string;
  meal_type: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  fiber?: number;
  meal_date: string; // YYYY-MM-DD
  meal_time: string; // HH:mm:ss
  notes?: string;
};

const toQuery = (params: Record<string, any> = {}) => {
  const usp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && String(v).length > 0) {
      usp.append(k, String(v));
    }
  });
  const s = usp.toString();
  return s ? `?${s}` : '';
};

// Attach JWT Authorization header from localStorage for protected endpoints
const authHeaders = (extra: Record<string, string> = {}) => {
  const token = localStorage.getItem('auth_token');
  return token
    ? { Authorization: `Bearer ${token}`, ...extra }
    : { ...extra };
};

export async function fetchProfile(params: { userId?: string } = {}): Promise<ProfileSummary> {
  const res = await fetch(`/api/nutrition/profile${toQuery(params)}`, {
    credentials: 'include',
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch profile');
  return res.json();
}

export async function updateProfile(payload: Partial<ProfileSummary> & { userId?: string }): Promise<ProfileSummary> {
  const res = await fetch(`/api/nutrition/profile`, {
    method: 'PATCH',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to update profile');
  return res.json();
}

export async function fetchNutritionScore(params: { userId?: string; date?: string } = {}): Promise<number> {
  const res = await fetch(`/api/nutrition/score${toQuery(params)}`, { credentials: 'include', headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to fetch score');
  const data = await res.json();
  return Number(data.score) || 0;
}

export async function fetchNutritionInsight(params: { userId?: string; date?: string } = {}): Promise<NutritionInsight> {
  const res = await fetch(`/api/nutrition/insight${toQuery(params)}`, { credentials: 'include', headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to fetch insight');
  return res.json();
}

export async function fetchNutritionHistory(params: {
  userId?: string;
  startDate?: string;
  endDate?: string;
  mealType?: string;
  search?: string;
  sort?: 'newest' | 'oldest';
  limit?: number;
} = {}): Promise<MealData[]> {
  const res = await fetch(`/api/nutrition/history${toQuery(params)}`, { credentials: 'include', headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to fetch history');
  const data = await res.json();
  return Array.isArray(data.items) ? data.items : [];
}

export async function fetchWeeklyNutrition(params: { userId?: string } = {}): Promise<WeeklyPoint[]> {
  const res = await fetch(`/api/nutrition/weekly${toQuery(params)}`, { credentials: 'include', headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to fetch weekly');
  const data = await res.json();
  return Array.isArray(data.items) ? data.items : [];
}

export async function fetchMealById(id: string | number, params: { userId?: string } = {}): Promise<MealData> {
  const res = await fetch(`/api/meals/${id}${toQuery(params)}`, { credentials: 'include', headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to fetch meal');
  return res.json();
}

export async function createMeal(payload: Omit<MealData, 'id'> & { userId?: string }): Promise<MealData> {
  const res = await fetch(`/api/meals`, {
    method: 'POST',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to create meal');
  return res.json();
}

export async function deleteMeal(id: string | number, params: { userId?: string } = {}): Promise<void> {
  const res = await fetch(`/api/meals/${id}${toQuery(params)}`, { method: 'DELETE', credentials: 'include', headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to delete meal');
}

export async function deleteScheduledMeal(id: string | number, params: { userId?: string } = {}): Promise<void> {
  const res = await fetch(`/api/scheduled-meals/${id}${toQuery(params)}`, { method: 'DELETE', credentials: 'include', headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to delete scheduled meal');
}