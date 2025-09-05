import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { brandVoiceApi } from "@/lib/api";
import type { BrandVoiceProfile } from "@/types";

export function useBrandVoice() {
  const queryClient = useQueryClient();

  const query = useQuery<BrandVoiceProfile>({
    queryKey: ["/api/brand-voice/profile"],
    queryFn: async () => {
      const response = await brandVoiceApi.getActive();
      return response.json();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      brandVoiceApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/brand-voice/profile"] });
    },
  });

  return {
    ...query,
    updateBrandVoice: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
  };
}
