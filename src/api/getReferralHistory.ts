import axios from "axios"

export interface ReferredUser {
  id: string
  user_name: string
  email: string
}

export interface PointsHistory {
  id: string
  points_earned: number
  charge_amount: number
  percentage: number
  created_at: string
  referred: ReferredUser
}

export interface Pagination {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
}

export interface ReferralHistoryResponse {
  result: {
    pointsHistory: PointsHistory[]
    pagination: Pagination
  }
}

// Reusable axios client
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,

})

export default async function getReferralPointsHistory(
  page = 1,
  limit = 10,
  opts?: {
    signal?: AbortSignal
    token?: string | null // optional Bearer
  }
): Promise<ReferralHistoryResponse> {
  const { signal, token } = opts ?? {}

  const { data } = await api.get<ReferralHistoryResponse>("/referral-points/history", {
    params: { page, limit },
    signal,
    headers: {
      "x-api-key": import.meta.env.VITE_API_KEY,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })

  return data
}
