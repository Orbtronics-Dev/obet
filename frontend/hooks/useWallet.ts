import { useMutation, useQuery } from "@tanstack/react-query";
import { walletApi } from "@/lib/api";

export function useWallet() {
  return useQuery({
    queryKey: ["wallet"],
    queryFn: () => walletApi.get(),
  });
}

export function useTransactions() {
  return useQuery({
    queryKey: ["transactions"],
    queryFn: () => walletApi.transactions(),
  });
}

export function useDeposit() {
  return useMutation({
    mutationFn: (data: { amount_usd: number }) => walletApi.deposit(data),
    onSuccess: (data) => {
      window.location.href = data.checkout_url;
    },
  });
}
