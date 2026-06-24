const XP_PER_LEVEL = 1000;

export function calculateProgress(totalXp: number): {
  level: number;
  currentXp: number;
  requiredXp: number;
} {
  const level = Math.floor(totalXp / XP_PER_LEVEL) + 1;
  const currentXp = totalXp % XP_PER_LEVEL;
  return { level, currentXp, requiredXp: XP_PER_LEVEL };
}
