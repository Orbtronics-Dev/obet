"use client";

import { useState } from "react";
import { motion, type Variants } from "framer-motion";
import { Search, SlidersHorizontal } from "lucide-react";
import { useMarkets } from "@/hooks/useMarket";
import { MarketCard } from "@/features/markets/MarketCard";

const CATEGORIES = [
  "ALL",
  "POLITICS",
  "SPORTS",
  "CRYPTO",
  "ECONOMY",
  "ENTERTAINMENT",
  "LOCAL",
  "OTHER",
];

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.38 } },
};

export default function MarketsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useMarkets({
    category: selectedCategory,
    page,
    page_size: 12,
  });

  const markets = data?.items ?? [];
  const filtered = search
    ? markets.filter((m) => m.title.toLowerCase().includes(search.toLowerCase()))
    : markets;

  const totalPages = data ? Math.ceil(data.total / data.page_size) : 1;

  return (
    <div className="min-h-screen bg-[#060810] pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mb-10"
        >
          <h1 className="font-poppins text-3xl lg:text-4xl font-bold text-white mb-2">Markets</h1>
          <p className="text-gray-400 font-inter">Trade on real Caribbean events</p>
        </motion.div>

        {/* Search + sort row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col sm:flex-row gap-3 mb-6"
        >
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
            <input
              type="text"
              placeholder="Search markets..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full bg-[#0d1320] border border-[rgba(0,123,255,0.18)] text-white rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[#007BFF] placeholder-gray-700 transition-colors font-inter"
            />
          </div>
          <button className="flex items-center gap-2 bg-[#0d1320] border border-[rgba(0,123,255,0.18)] text-gray-500 hover:text-white px-5 py-3 rounded-xl text-sm transition-colors font-inter">
            <SlidersHorizontal className="w-4 h-4" />
            Sort
          </button>
        </motion.div>

        {/* Category chips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="flex flex-wrap gap-2 mb-10"
        >
          {CATEGORIES.map((cat) => {
            const isActive = cat === "ALL" ? !selectedCategory : selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => { setSelectedCategory(cat === "ALL" ? undefined : cat); setPage(1); }}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold font-inter transition-all duration-200 ${
                  isActive
                    ? "bg-[#007BFF] text-white shadow-lg shadow-[#007BFF]/20"
                    : "bg-[#0d1320] border border-[rgba(0,123,255,0.18)] text-gray-500 hover:text-white hover:border-[rgba(0,123,255,0.5)]"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </motion.div>

        {/* Market grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 9 }).map((_, i) => (
              <div
                key={i}
                className="bg-[#0d1320] border border-[rgba(0,123,255,0.1)] rounded-xl h-48 animate-pulse"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-24"
          >
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-gray-500 font-inter text-lg">
              No markets found{search ? ` for "${search}"` : ""}
            </p>
          </motion.div>
        ) : (
          <motion.div
            key={`${selectedCategory}-${page}`}
            variants={stagger}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {filtered.map((market) => (
              <motion.div key={market.id} variants={fadeUp}>
                <MarketCard market={market} />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Pagination */}
        {data && data.total > data.page_size && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-center gap-3 mt-14"
          >
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-6 py-2.5 rounded-xl border border-[rgba(0,123,255,0.18)] text-gray-400 hover:text-white hover:border-[#007BFF] disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm font-inter"
            >
              ← Previous
            </button>
            <span className="text-gray-600 text-sm font-inter px-4">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= totalPages}
              className="px-6 py-2.5 rounded-xl border border-[rgba(0,123,255,0.18)] text-gray-400 hover:text-white hover:border-[#007BFF] disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm font-inter"
            >
              Next →
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
