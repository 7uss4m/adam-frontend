import type { Category } from "../../../types/types";
import { categoryAccent, categoryInitials } from "../category-utils";

export { categoryAccent, categoryInitials };

export type SubFilterKey =
  | "all"
  | "active"
  | "inactive"
  | "external"
  | "bundle"
  | "one";

export type DashboardSubCategory = Category & {
  active?: boolean;
  parent_id?: number | null;
  parent_name?: string | null;
  product_count?: number;
  source?: string | null;
  external_id?: number | null;
};

export function subTypeLabel(type: string | undefined, t: (k: string) => string) {
  if (type === "bundle") return t("bundle");
  return t("one");
}
