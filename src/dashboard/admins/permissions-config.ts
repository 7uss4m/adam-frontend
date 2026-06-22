export const ALL_PERMISSIONS = [
  "dashboard", "users", "admins", "clients", "activity_logs",
  "categories", "products",
  "orders", "charges", "debts", "reconciliation",
  "ads", "levels", "currencies",
  "inventory", "reports", "boxes", "notes", "notifications", "info",
] as const;

export type Permission = typeof ALL_PERMISSIONS[number];

export const PERMISSION_GROUPS = [
  {
    labelKey: "management_group",
    permissions: ["dashboard", "users", "admins", "clients", "activity_logs"] as Permission[],
  },
  {
    labelKey: "catalog_group",
    permissions: ["categories", "products"] as Permission[],
  },
  {
    labelKey: "sales_group",
    permissions: ["orders", "charges", "debts", "reconciliation"] as Permission[],
  },
  {
    labelKey: "content_group",
    permissions: ["ads", "levels", "currencies"] as Permission[],
  },
  {
    labelKey: "system_group",
    permissions: ["inventory", "reports", "boxes", "notes", "notifications", "info"] as Permission[],
  },
] as const;

export const PERMISSION_LABEL_KEYS: Record<string, string> = {
  dashboard: "perm_dashboard",
  users: "perm_users",
  admins: "perm_admins",
  clients: "perm_clients",
  activity_logs: "perm_activity_logs",
  categories: "perm_categories",
  products: "perm_products",
  orders: "perm_orders",
  charges: "perm_charges",
  debts: "perm_debts",
  reconciliation: "perm_reconciliation",
  ads: "perm_ads",
  levels: "perm_levels",
  currencies: "perm_currencies",
  inventory: "perm_inventory",
  reports: "perm_reports",
  boxes: "perm_boxes",
  notes: "perm_notes",
  notifications: "perm_notifications",
  info: "perm_info",
};
