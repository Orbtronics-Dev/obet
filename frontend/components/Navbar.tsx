"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, TrendingUp, Wallet } from "lucide-react";
import { useWallet } from "@/hooks/useWallet";
import { formatCurrency } from "@/lib/currency";
import { clearTokens } from "@/lib/api";
import { useRouter } from "next/navigation";

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { data: wallet } = useWallet();
  const router = useRouter();

  const handleLogout = () => {
    clearTokens();
    router.push("/");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[rgba(0,123,255,0.12)] bg-[#060810]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-[#007BFF] rounded-lg flex items-center justify-center group-hover:bg-[#0056b3] transition-colors">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <span className="font-poppins font-bold text-lg text-white">OBet</span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/markets" className="text-gray-400 hover:text-white transition-colors text-sm font-medium font-inter">
              Markets
            </Link>
            <Link href="/portfolio" className="text-gray-400 hover:text-white transition-colors text-sm font-medium font-inter">
              Portfolio
            </Link>
            <Link href="/wallet" className="text-gray-400 hover:text-white transition-colors text-sm font-medium font-inter">
              Wallet
            </Link>
          </div>

          {/* Desktop right side */}
          <div className="hidden md:flex items-center gap-3">
            {wallet ? (
              <>
                <div className="flex items-center gap-1.5 text-sm bg-[#0d1320] border border-[rgba(0,123,255,0.2)] px-3 py-1.5 rounded-lg">
                  <Wallet className="w-3.5 h-3.5 text-[#007BFF]" />
                  <span className="text-white font-semibold font-inter">{formatCurrency(wallet.balance)}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-sm text-gray-500 hover:text-white transition-colors font-inter"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm text-gray-400 hover:text-white transition-colors px-4 py-2 font-inter"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="text-sm bg-[#007BFF] hover:bg-[#0056b3] text-white px-5 py-2 rounded-xl font-semibold font-poppins transition-all duration-200 shadow-lg shadow-[#007BFF]/20"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden text-gray-400 hover:text-white transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-[rgba(0,123,255,0.12)] bg-[#060810] overflow-hidden"
          >
            <div className="px-4 py-5 space-y-1">
              <Link href="/markets" className="block text-gray-400 hover:text-white py-2.5 text-sm font-inter" onClick={() => setMenuOpen(false)}>
                Markets
              </Link>
              <Link href="/portfolio" className="block text-gray-400 hover:text-white py-2.5 text-sm font-inter" onClick={() => setMenuOpen(false)}>
                Portfolio
              </Link>
              <Link href="/wallet" className="block text-gray-400 hover:text-white py-2.5 text-sm font-inter" onClick={() => setMenuOpen(false)}>
                Wallet
              </Link>
              <div className="pt-4 border-t border-[rgba(0,123,255,0.12)] flex gap-3">
                <Link
                  href="/login"
                  className="flex-1 text-center text-sm text-gray-400 hover:text-white border border-[rgba(0,123,255,0.2)] py-2.5 rounded-xl font-inter transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="flex-1 text-center text-sm bg-[#007BFF] text-white py-2.5 rounded-xl font-semibold font-poppins"
                  onClick={() => setMenuOpen(false)}
                >
                  Get Started
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
