import { useQuery } from "@tanstack/react-query";
import getMaintenanceMode from "../api/getMaintenanceMode";

export function useMaintenanceMode(options?: { refetchInterval?: number }) {
  return useQuery({
    queryKey: ["maintenance-mode"],
    queryFn: getMaintenanceMode,
    refetchOnWindowFocus: true,
    staleTime: 15_000,
    refetchInterval: options?.refetchInterval ?? 30_000,
  });
}
