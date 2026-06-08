// mocks/mockReferralApi.ts
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

// ---- Generate a fixed, deterministic dataset (e.g., 57 rows)
const TOTAL = 57
const seedUsers = Array.from({ length: TOTAL }, (_, i) => {
  const idx = i + 1
  const amount = ((idx % 7) + 1) * 10 // 10..70
  const percentage = [5, 7, 10, 12, 15][idx % 5] // cycle
  const points = Math.round((amount * percentage) / 100)

  const created = new Date()
  created.setDate(created.getDate() - idx)

  const user: PointsHistory = {
    id: String(idx),
    points_earned: points,
    charge_amount: amount,
    percentage,
    created_at: created.toISOString(),
    referred: {
      id: String(1000 + idx),
      user_name: `User_${idx.toString().padStart(2, "0")}`,
      email: `user${idx}@example.com`,
    },
  }
  return user
})

// ---- Fake API with pagination
export async function fetchReferralHistory(
  page = 1,
  limit = 10
): Promise<ReferralHistoryResponse> {
  // simulate latency
  await new Promise((r) => setTimeout(r, 400))

  const itemsPerPage = Math.max(1, limit)
  const totalItems = seedUsers.length
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage))
  const currentPage = Math.min(Math.max(1, page), totalPages)

  const start = (currentPage - 1) * itemsPerPage
  const end = start + itemsPerPage
  const slice = seedUsers.slice(start, end)

  return {
    result: {
      pointsHistory: slice,
      pagination: {
        currentPage,
        totalPages,
        totalItems,
        itemsPerPage,
      },
    },
  }
}
