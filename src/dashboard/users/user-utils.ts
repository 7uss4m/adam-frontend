import type { Level } from "../../types/types";

export const LEVEL_COLORS: Record<string, string> = {
  bronze: "#CD7F32",
  silver: "#C0C0C0",
  gold: "#FFD700",
  platinum: "#9206f8",
  diamond: "#B9F2FF",
};

export function getLevelColor(name?: string) {
  if (!name) return "#64748b";
  return LEVEL_COLORS[name.toLowerCase()] || "#64748b";
}

export function getUserLevel(levels: Level[], userProgress: number) {
  if (!levels?.length) return null;
  if (userProgress < levels[0]?.max) {
    return { id: 0, name: "bronze", max: 0, profit: levels[0]?.profit ?? 0 } as Level;
  }
  for (let i = 1; i < levels.length; i++) {
    if (userProgress < levels[i].max) return levels[i - 1];
  }
  return levels[levels.length - 1];
}

export function fmtUsd(n: number) {
  return `$${n.toFixed(2)}`;
}

export function userInitials(name?: string, email?: string) {
  const src = name || email || "?";
  return src.slice(0, 2).toUpperCase();
}
