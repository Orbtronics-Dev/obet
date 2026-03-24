import Link from "next/link";
import type { Market } from "@/lib/api";
import { formatCurrency } from "@/lib/currency";

interface Props {
  market: Market;
}

const CATEGORY_COLORS: Record<string, string> = {
  POLITICS: "bg-blue-500/15 text-blue-300",
  SPORTS: "bg-orange-500/15 text-orange-300",
  CRYPTO: "bg-purple-500/15 text-purple-300",
  ECONOMY: "bg-green-500/15 text-green-300",
  ENTERTAINMENT: "bg-pink-500/15 text-pink-300",
  LOCAL: "bg-yellow-500/15 text-yellow-300",
  OTHER: "bg-gray-500/15 text-gray-300",
};

export function MarketCard({ market }: Props) {
  const yesPercent = Math.round(market.yes_probability * 100);
  const noPercent = 100 - yesPercent;
  const totalPool = market.total_yes_amount + market.total_no_amount;

  return (
    <Link href={`/markets/${market.id}`} className="block h-full">
      <div className="bg-[#0d1320] hover:bg-[#111827] border border-[rgba(0,123,255,0.15)] hover:border-[rgba(0,123,255,0.38)] rounded-xl p-5 transition-all duration-200 cursor-pointer h-full group hover:-translate-y-0.5">
        {/* Top row */}
        <div className="flex items-start justify-between mb-4">
          <span
            className={`text-xs font-semibold px-2.5 py-0.5 rounded-full font-inter ${
              CATEGORY_COLORS[market.category] ?? "bg-gray-500/15 text-gray-300"
            }`}
          >
            {market.category}
          </span>
          <span className="text-xs text-gray-700 font-inter">
            {new Date(market.resolution_date).toLocaleDateString()}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-white font-semibold text-sm leading-snug mb-5 line-clamp-2 font-poppins group-hover:text-gray-100 transition-colors">
          {market.title}
        </h3>

        {/* Probability bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm font-bold mb-2 font-poppins">
            <span className="text-[#007BFF]">{yesPercent}% YES</span>
            <span className="text-red-400">{noPercent}% NO</span>
          </div>
          <div className="h-1.5 bg-[#060810] rounded-full overflow-hidden border border-[rgba(255,255,255,0.03)]">
            <div
              className="h-full bg-gradient-to-r from-[#007BFF] to-[#0099ff] rounded-full transition-all duration-700"
              style={{ width: `${yesPercent}%` }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-600 font-inter">{formatCurrency(totalPool)} pool</span>
          <span
            className={`px-2 py-0.5 rounded-full font-inter font-medium ${
              market.status === "OPEN"
                ? "text-[#007BFF] bg-[#007BFF]/10"
                : "text-gray-600 bg-gray-800/50"
            }`}
          >
            {market.status}
          </span>
        </div>
      </div>
    </Link>
  );
}
