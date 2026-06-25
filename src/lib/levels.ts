// XP required to go from level N to N+1: (floor(N/10) + 1) * 1000
// Tier 0 (levels 0-9):   1000 XP/level
// Tier 1 (levels 10-19): 2000 XP/level
// Tier 2 (levels 20-29): 3000 XP/level ...
export function xpForLevel(level: number): number {
  return (Math.floor(level / 10) + 1) * 1000;
}

export function calculateProgress(totalXp: number): {
  level: number;
  currentXp: number;
  requiredXp: number;
} {
  let level = 0;
  let consumed = 0;

  while (true) {
    const required = xpForLevel(level);
    if (totalXp < consumed + required) {
      return { level, currentXp: totalXp - consumed, requiredXp: required };
    }
    consumed += required;
    level++;
  }
}
