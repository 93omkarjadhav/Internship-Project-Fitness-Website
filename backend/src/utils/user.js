export const resolveUserId = (explicitValue, reqUser = null) => {
  if (reqUser && reqUser.id) return Number(reqUser.id);
  const parsed = Number(explicitValue);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : Number(process.env.DEFAULT_USER_ID || 1);
};

export const sanitizeNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};