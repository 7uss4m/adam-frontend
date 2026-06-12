import type { Category } from "../../types/types";

const PALETTE = [
  "#06b6d4",
  "#8b5cf6",
  "#10b981",
  "#f59e0b",
  "#ec4899",
  "#6366f1",
  "#14b8a6",
  "#f97316",
];

export function categoryAccent(id: number) {
  return PALETTE[Math.abs(Number(id)) % PALETTE.length];
}

export function categoryInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export type CategoryFilterKey = "all" | "active" | "inactive" | "external";

export type DashboardCategory = Category & {
  active?: boolean;
  sub_count?: number;
  product_count?: number;
  source?: string | null;
  external_id?: number | null;
};
