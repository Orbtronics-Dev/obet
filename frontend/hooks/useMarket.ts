import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { marketsApi } from "@/lib/api";

export function useMarkets(params?: { category?: string; page?: number; page_size?: number }) {
  return useQuery({
    queryKey: ["markets", params],
    queryFn: () => marketsApi.list(params),
  });
}

export function useMarket(id: string) {
  return useQuery({
    queryKey: ["market", id],
    queryFn: () => marketsApi.get(id),
    enabled: !!id,
  });
}

export function usePlaceBet(marketId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { side: "YES" | "NO"; amount: number }) =>
      marketsApi.placeBet(marketId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["market", marketId] });
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
      queryClient.invalidateQueries({ queryKey: ["positions"] });
    },
  });
}
