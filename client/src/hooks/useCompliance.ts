import { useQuery } from "@tanstack/react-query";
import { complianceApi } from "@/lib/api";
import type { ComplianceMetrics } from "@/types";

export function useComplianceMetrics() {
  return useQuery<ComplianceMetrics>({
    queryKey: ["/api/compliance/metrics"],
    queryFn: async () => {
      const response = await complianceApi.getMetrics();
      return response.json();
    },
  });
}
