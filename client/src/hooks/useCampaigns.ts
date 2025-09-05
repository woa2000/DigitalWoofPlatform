import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { campaignsApi } from "@/lib/api";
import type { CampaignSummary } from "@/types";

export function useCampaigns() {
  const queryClient = useQueryClient();

  const query = useQuery<CampaignSummary[]>({
    queryKey: ["/api/campaigns/summary"],
    queryFn: async () => {
      const response = await campaignsApi.getAll();
      return response.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: (campaign: any) => campaignsApi.create(campaign),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns/summary"] });
    },
  });

  return {
    campaigns: query.data,
    isLoading: query.isLoading,
    error: query.error,
    createCampaign: createMutation.mutate,
    isCreating: createMutation.isPending,
  };
}
