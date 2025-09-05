import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "@/lib/api";
import type { DashboardStats, PerformanceData } from "@/types";

export function useDashboardStats() {
  return useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
    queryFn: async () => {
      const response = await dashboardApi.getStats();
      return response.json();
    },
  });
}

export function usePerformanceData() {
  return useQuery<PerformanceData>({
    queryKey: ["/api/dashboard/performance"],
    queryFn: async () => {
      const response = await dashboardApi.getPerformanceData();
      return response.json();
    },
  });
}
