"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Clock, DollarSign, TrendingUp, Users } from "lucide-react";
import { useMarket } from "@/hooks/useMarket";
import { BetModal } from "@/features/markets/BetModal";
import { formatCurrency } from "@/lib/currency";

const CATEGORY_STYLES: Record<string, string> = {
  POLITICS: "bg-blue-500/15 text-blue-300 border-blue-500/25",
  SPORTS: "bg-orange-500/15 text-orange-300 border-orange-500/25",
  CRYPTO: "bg-purple-500/15 text-purple-300 border-purple-500/25",
  ECONOMY: "bg-green-500/15 text-green-300 border-green-500/25",
  ENTERTAINMENT: "bg-pink-500/15 text-pink-300 border-pink-500/25",
  LOCAL: "bg-yellow-500/15 text-yellow-300 border-yellow-500/25",
  OTHER: "bg-gray-500/15 text-gray-300 border-gray-500/25",
};

export default function MarketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [betOpen, setBetOpen] = useState(false);
  const { data: market, isLoading } = useMarket(id);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#060810] pt-24 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#007BFF] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!market) {
    return (
      <div className="min-h-screen bg-[#060810] pt-24 flex flex-col items-center justify-center gap-4">
        <div className="text-5xl">🌊</div>
        <p className="text-gray-400 font-inter">Market not found</p>
        <button
          onClick={() => router.push("/markets")}
          className="text-[#007BFF] hover:text-[#3395ff] text-sm font-inter transition-colors"
        >
          Back to markets
        </button>
      </div>
    );
  }

  const yesPercent = Math.round(market.yes_probability * 100);
  const noPercent = 100 - yesPercent;
  const totalPool = market.total_yes_amount + market.total_no_amount;
  const resolutionDate = new Date(market.resolution_date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-[#060810] pt-24 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back button */}
        <motion.button
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-8 text-sm font-inter"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Markets
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="space-y-5"
        >
          {/* Header card */}
          <div className="bg-[#0d1320] border border-[rgba(0,123,255,0.15)] rounded-2xl p-8">
            <div className="flex items-start justify-between gap-4 mb-6">
              <span
                className={`text-xs font-semibold px-3 py-1 rounded-full border font-inter ${
                  CATEGORY_STYLES[market.category] ?? "bg-gray-500/15 text-gray-300 border-gray-500/25"
                }`}
              >
                {market.category}
              </span>
              <div className="flex items-center gap-1.5 text-gray-600 text-xs font-inter shrink-0">
                <Clock className="w-3.5 h-3.5" />
                Closes {resolutionDate}
              </div>
            </div>

            <h1 className="font-poppins text-2xl lg:text-3xl font-bold text-white mb-4 leading-snug">
              {market.title}
            </h1>

            {market.description && (
              <p className="text-gray-400 text-sm leading-relaxed font-inter">{market.description}</p>
            )}
          </div>

          {/* Probability + bet card */}
          <div className="bg-[#0d1320] border border-[rgba(0,123,255,0.15)] rounded-2xl p-8">
            <h2 className="font-poppins font-semibold text-white mb-8 text-lg">Current Odds</h2>

            <div className="flex justify-between items-end mb-5">
              <div>
                <div className="font-poppins font-bold text-5xl text-[#007BFF]">{yesPercent}%</div>
                <div className="text-gray-500 text-sm mt-1.5 font-inter">chance YES</div>
              </div>
              <div className="text-right">
                <div className="font-poppins font-bold text-5xl text-red-400">{noPercent}%</div>
                <div className="text-gray-500 text-sm mt-1.5 font-inter">chance NO</div>
              </div>
            </div>

            {/* Animated progress bar */}
            <div className="h-3 bg-[#060810] rounded-full overflow-hidden mb-8 border border-[rgba(255,255,255,0.04)]">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${yesPercent}%` }}
                transition={{ duration: 1.1, delay: 0.4, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-[#007BFF] to-[#0099ff] rounded-full"
              />
            </div>

            {market.status === "OPEN" ? (
              <button
                onClick={() => setBetOpen(true)}
                className="w-full bg-[#007BFF] hover:bg-[#0056b3] text-white font-poppins font-bold py-4 rounded-xl transition-all duration-200 shadow-lg shadow-[#007BFF]/25 hover:shadow-[#007BFF]/40 text-base hover:-translate-y-0.5"
              >
                Place Your Bet
              </button>
            ) : (
              <div className="text-center py-3.5 text-gray-500 text-sm border border-[rgba(0,123,255,0.1)] rounded-xl font-inter">
                Market is {market.status.toLowerCase()}
                {market.outcome && (
                  <span className="ml-2 text-[#007BFF] font-semibold">· Resolved: {market.outcome}</span>
                )}
              </div>
            )}
          </div>

          {/* Pool stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: DollarSign, label: "Total Pool", value: formatCurrency(totalPool) },
              { icon: TrendingUp, label: "YES Pool", value: formatCurrency(market.total_yes_amount) },
              { icon: Users, label: "NO Pool", value: formatCurrency(market.total_no_amount) },
            ].map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                className="bg-[#0d1320] border border-[rgba(0,123,255,0.12)] rounded-xl p-5 text-center"
              >
                <Icon className="w-4 h-4 text-[#007BFF] mx-auto mb-2" />
                <div className="font-poppins font-bold text-white text-lg">{value}</div>
                <div className="text-gray-600 text-xs mt-1 font-inter">{label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {betOpen && market && <BetModal market={market} onClose={() => setBetOpen(false)} />}
    </div>
  );
}
