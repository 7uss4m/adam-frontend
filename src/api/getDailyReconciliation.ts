import axios from "axios";

export type ReconciliationNote = {
  id: string;
  coins: number;
  status: string;
  created_at: string;
  currencies?: { name: string; boxes?: { name: string } };
  user?: { id: string; user_name: string; email: string };
};

export type ReconciliationOrder = {
  id: string;
  status: string;
  quantity: number;
  total: number;
  created_at: string;
  user?: { id: string; user_name: string; email: string };
  product?: { name: string; categories?: { name: string } };
};

export type DailyReconciliation = {
  date: string;
  notes: ReconciliationNote[];
  orders: ReconciliationOrder[];
  summary: {
    notesCount: number;
    notesSuccessCount: number;
    notesSuccessAmount: number;
    notesPendingCount: number;
    notesPendingAmount: number;
    ordersCount: number;
    ordersTotal: number;
    notesByStatus: { status: string; count: number; amount: number }[];
    ordersByStatus: { status: string; count: number; total: number }[];
  };
};

export default function getDailyReconciliation(token: string, date: string) {
  const apiUrl = `${import.meta.env.VITE_API_URL}dashboard/reconciliation`;
  return axios.get<{ result: DailyReconciliation }>(apiUrl, {
    params: { date },
    headers: {
      Authorization: `Bearer ${token}`,
      "x-api-key": import.meta.env.VITE_API_KEY,
    },
  });
}
