// hooks/useReferralPointsHistory.ts
import { useQuery, keepPreviousData } from "@tanstack/react-query"
import getReferralPointsHistory, { ReferralHistoryResponse } from "../api/getReferralHistory"
import { fetchReferralHistory } from "./mock"

export function useReferralPointsHistory(page = 1, limit = 10) {
  return useQuery<ReferralHistoryResponse>({
    queryKey: ["referralPointsHistory", page, limit],
    queryFn: ({ signal }) => getReferralPointsHistory(page, limit, { signal, token: localStorage.getItem("token") }),
    placeholderData: keepPreviousData,

  })
}


export function useMockReferralHistory(page = 1, limit = 10) {
  return useQuery<ReferralHistoryResponse>({
    queryKey: ["mockReferralHistory", page, limit],
    queryFn: () => fetchReferralHistory(page, limit),
    placeholderData: keepPreviousData, // v5 replacement for keepPreviousData
    staleTime: 5_000,
  })
}
