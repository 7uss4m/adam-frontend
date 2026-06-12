import axios from "axios";

export type DashboardOrderStatus = {
  pinding: number;
  success: number;
  reject: number;
  accept: number;
  wait: number;
};

export type DashboardRecentOrder = {
  id: string;
  status: string;
  total: number;
  quantity: number;
  created_at: string;
  user?: { email?: string; user_name?: string };
  product?: { name?: string };
};

export type DashboardRecentCharge = {
  id: string;
  coins: number;
  status: string;
  created_at: string;
  user?: { email?: string; user_name?: string };
};

export type DashboardStats = {
  role: "admin" | "orders";
  overview: {
    users: { total: number; newToday: number; newThisMonth: number };
    orders: {
      total: number;
      today: number;
      thisMonth: number;
      pending: number;
      totalRevenue: number;
      todayRevenue: number;
      monthRevenue: number;
    };
    products: {
      total: number;
      active: number;
      inactive: number;
      withOffers: number;
      sources: string[];
    };
    categories: number;
    clients: number;
    charges: {
      total: number;
      pending: number;
      success: number;
      totalAmount: number;
      monthAmount: number;
    };
    debts: { usersWithDebt: number; totalCoins: number };
    userBalances: { totalDollar: number };
  };
  orderStatusBreakdown: DashboardOrderStatus;
  recentOrders: DashboardRecentOrder[];
  recentCharges: DashboardRecentCharge[];
  chart: {
    labels: string[];
    orderCounts: number[];
    revenues: number[];
    chargeAmounts: number[];
  };
};

export default function getDashboardStats(token: string) {
  const apiUrl = `${import.meta.env.VITE_API_URL}dashboard/stats`;
  return axios
    .get<{ result: DashboardStats }>(apiUrl, {
      headers: {
        "x-api-key": import.meta.env.VITE_API_KEY,
        Authorization: `Bearer ${token}`,
      },
    })
    .then((res) => res);
}
