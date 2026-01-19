export const toISODate = (date = new Date()) => date.toISOString().split('T')[0];

export const getPastDate = (daysAgo) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date;
};