"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { usePlaceBet } from "@/hooks/useMarket";
import { useWallet } from "@/hooks/useWallet";
import { formatCurrency } from "@/lib/currency";
import type { Market } from "@/lib/api";

interface Props {
  market: Market;
  onClose: () => void;
}

export function BetModal({ market, onClose }: Props) {
  const [side, setSide] = useState<"YES" | "NO">("YES");
  const [amount, setAmount] = useState("");
  const { data: wallet } = useWallet();
  const { mutate: placeBet, isPending, error } = usePlaceBet(market.id);

  const amountNum = parseFloat(amount) || 0;
  const relevantPool = side === "YES" ? market.total_yes_amount : market.total_no_amount;
  const totalPool = market.total_yes_amount + market.total_no_amount;
  const newPool = totalPool + amountNum;
  const newRelevantPool = relevantPool + amountNum;
  const estimatedPayout =
    amountNum > 0 && newRelevantPool > 0
      ? (amountNum / newRelevantPool) * newPool * 0.98
      : 0;

  const handleSubmit = () => {
    if (amountNum <= 0) return;
    placeBet({ side, amount: amountNum }, { onSuccess: () => onClose() });
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="bg-[#0d1320] border border-[rgba(0,123,255,0.2)] rounded-2xl p-7 w-full max-w-md shadow-2xl shadow-black/60"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-5">
            <div>
              <h2 className="text-white text-xl font-bold font-poppins">Place Bet</h2>
              <p className="text-gray-500 text-xs mt-1 line-clamp-1 font-inter max-w-[280px]">
                {market.title}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-600 hover:text-white transition-colors mt-0.5"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* YES / NO toggle */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {(["YES", "NO"] as const).map((s) => {
              const prob = Math.round(
                (s === "YES" ? market.yes_probability : market.no_probability) * 100
              );
              const isActive = side === s;
              return (
                <button
                  key={s}
                  onClick={() => setSide(s)}
                  className={`py-3.5 rounded-xl font-bold text-base font-poppins transition-all duration-200 ${
                    isActive
                      ? s === "YES"
                        ? "bg-[#007BFF] text-white shadow-lg shadow-[#007BFF]/25"
                        : "bg-red-500 text-white shadow-lg shadow-red-500/25"
                      : "bg-[#060810] border border-[rgba(0,123,255,0.15)] text-gray-500 hover:text-white hover:border-[rgba(0,123,255,0.35)]"
                  }`}
                >
                  {s} {prob}%
                </button>
              );
            })}
          </div>

          {/* Amount input */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm text-gray-400 font-inter">Amount (USD)</label>
              <span className="text-xs text-gray-600 font-inter">
                Balance: {wallet ? formatCurrency(wallet.balance) : "—"}
              </span>
            </div>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="10.00"
              className="w-full bg-[#060810] text-white border border-[rgba(0,123,255,0.2)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#007BFF] placeholder-gray-700 font-inter transition-colors"
            />
          </div>

          {/* Estimated payout */}
          {estimatedPayout > 0 && (
            <div className="bg-[#060810] border border-[rgba(0,123,255,0.12)] rounded-xl p-4 mb-5">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 font-inter">Est. payout if {side} wins</span>
                <span className="text-white font-bold font-poppins">{formatCurrency(estimatedPayout)}</span>
              </div>
              {amountNum > 0 && (
                <div className="flex justify-between items-center text-xs mt-1.5">
                  <span className="text-gray-700 font-inter">Potential return</span>
                  <span className="text-[#007BFF] font-inter">
                    +{((estimatedPayout / amountNum - 1) * 100).toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Error */}
          {error && (
            <p className="text-red-400 text-sm mb-4 font-inter">{(error as Error).message}</p>
          )}

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-[rgba(0,123,255,0.15)] text-gray-500 hover:text-white hover:border-[rgba(0,123,255,0.35)] transition-colors text-sm font-inter"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isPending || amountNum <= 0}
              className="flex-1 py-3 rounded-xl bg-[#007BFF] hover:bg-[#0056b3] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold font-poppins transition-all duration-200 shadow-lg shadow-[#007BFF]/20 text-sm"
            >
              {isPending ? "Placing…" : `Bet ${side}`}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
