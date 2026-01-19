export const TEAM_D_BASE_PATH = "/wellness";

export const teamDPath = (path = "") => {
  if (!path) return TEAM_D_BASE_PATH;
  const normalized = path.replace(/^\/+/, "");
  return `${TEAM_D_BASE_PATH}/${normalized}`;
};

