"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import {
  ArrowRight,
  TrendingUp,
  Users,
  DollarSign,
  Globe2,
  BarChart3,
  Zap,
  Shield,
} from "lucide-react";

const Globe = dynamic(() => import("@/components/Globe").then((m) => m.Globe), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full rounded-full bg-[#0d1320]/60 animate-pulse flex items-center justify-center">
      <div className="w-16 h-16 border-2 border-[#007BFF]/30 border-t-[#007BFF] rounded-full animate-spin" />
    </div>
  ),
});

const STATS = [
  { label: "Caribbean Nations", value: "20+", icon: Globe2 },
  { label: "Open Markets", value: "150+", icon: BarChart3 },
  { label: "Trading Volume", value: "$4.2M+", icon: DollarSign },
  { label: "Active Traders", value: "8,500+", icon: Users },
];

const CATEGORIES = [
  { name: "Politics", emoji: "🏛️", gradient: "from-blue-600/20 to-blue-900/5 border-blue-500/25", count: 42 },
  { name: "Sports", emoji: "⚽", gradient: "from-orange-600/20 to-orange-900/5 border-orange-500/25", count: 38 },
  { name: "Crypto", emoji: "₿", gradient: "from-purple-600/20 to-purple-900/5 border-purple-500/25", count: 29 },
  { name: "Economy", emoji: "📈", gradient: "from-green-600/20 to-green-900/5 border-green-500/25", count: 21 },
  { name: "Entertainment", emoji: "🎭", gradient: "from-pink-600/20 to-pink-900/5 border-pink-500/25", count: 15 },
  { name: "Local", emoji: "🌴", gradient: "from-yellow-600/20 to-yellow-900/5 border-yellow-500/25", count: 18 },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Create Account",
    desc: "Sign up in seconds. Deposit using XCD, USD, JMD, TTD, or any major Caribbean currency.",
    icon: Shield,
  },
  {
    step: "02",
    title: "Browse Markets",
    desc: "Explore hundreds of markets — Caribbean elections, cricket leagues, crypto prices, and more.",
    icon: BarChart3,
  },
  {
    step: "03",
    title: "Trade & Win",
    desc: "Buy YES or NO shares at market price. If your prediction lands, cash out your winnings instantly.",
    icon: Zap,
  },
];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
};

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

export default function HomePage() {
  return (
    <main className="bg-[#060810] min-h-screen overflow-x-hidden">
      {/* ── Hero ── */}
      <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/4 w-[600px] h-[600px] bg-[#007BFF]/6 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[#003399]/8 rounded-full blur-[100px]" />
          {/* Grid lines */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "linear-gradient(#007BFF 1px, transparent 1px), linear-gradient(90deg, #007BFF 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full grid lg:grid-cols-2 gap-12 lg:gap-8 items-center py-24 lg:py-0 min-h-screen">
          {/* Left: copy */}
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="flex flex-col gap-7 lg:pr-8"
          >
            <motion.div variants={fadeUp}>
              <span className="inline-flex items-center gap-2 bg-[#007BFF]/10 border border-[#007BFF]/25 text-[#007BFF] text-xs font-semibold px-4 py-1.5 rounded-full font-inter tracking-wide">
                <span className="w-1.5 h-1.5 bg-[#007BFF] rounded-full animate-pulse" />
                Caribbean&apos;s Premier Prediction Market
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="font-poppins text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.08] text-white"
            >
              Predict.{" "}
              <span className="gradient-text">Trade.</span>
              <br />
              Win Real Money.
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="text-gray-400 text-lg leading-relaxed max-w-lg font-inter"
            >
              The Caribbean&apos;s first real-money prediction market. Buy and sell shares on
              politics, sports, crypto, and live events across 20+ island nations — in your
              local currency.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-wrap gap-4">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 bg-[#007BFF] hover:bg-[#0056b3] text-white px-8 py-3.5 rounded-xl font-semibold font-poppins text-sm transition-all duration-200 shadow-lg shadow-[#007BFF]/25 hover:shadow-[#007BFF]/40 hover:-translate-y-0.5"
              >
                Start Trading Free
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/markets"
                className="inline-flex items-center gap-2 border border-[rgba(0,123,255,0.28)] hover:border-[#007BFF] text-gray-300 hover:text-white px-8 py-3.5 rounded-xl font-semibold font-poppins text-sm transition-all duration-200"
              >
                Browse Markets
              </Link>
            </motion.div>

            {/* Stats row */}
            <motion.div
              variants={fadeUp}
              className="grid grid-cols-2 sm:grid-cols-4 gap-5 pt-2 border-t border-[rgba(0,123,255,0.1)]"
            >
              {STATS.map(({ label, value, icon: Icon }) => (
                <div key={label} className="flex flex-col gap-1.5">
                  <Icon className="w-4 h-4 text-[#007BFF]" />
                  <span className="font-poppins font-bold text-2xl text-white">{value}</span>
                  <span className="text-gray-500 text-xs font-inter">{label}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right: Globe */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.1, delay: 0.25, ease: "easeOut" }}
            className="relative h-[400px] lg:h-[580px] flex items-center justify-center"
          >
            {/* Globe glow */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[70%] h-[70%] bg-[#007BFF]/8 rounded-full blur-3xl" />
            </div>

            <div className="w-full h-full">
              <Globe />
            </div>

            {/* Floating market cards */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.1, duration: 0.5 }}
              className="absolute top-[12%] -right-2 sm:right-0 bg-[#0d1320]/95 border border-[rgba(0,123,255,0.25)] rounded-xl px-4 py-3 backdrop-blur-sm shadow-xl"
            >
              <div className="text-xs text-gray-500 mb-1.5 font-inter">Jamaica Elections 2025</div>
              <div className="flex items-center gap-4">
                <span className="text-[#007BFF] font-bold text-sm font-poppins">YES 67%</span>
                <span className="text-red-400 font-bold text-sm font-poppins">NO 33%</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.3, duration: 0.5 }}
              className="absolute bottom-[22%] -left-2 sm:left-0 bg-[#0d1320]/95 border border-[rgba(0,123,255,0.25)] rounded-xl px-4 py-3 backdrop-blur-sm shadow-xl"
            >
              <div className="text-xs text-gray-500 mb-1.5 font-inter">BTC reaches $100K?</div>
              <div className="flex items-center gap-4">
                <span className="text-[#007BFF] font-bold text-sm font-poppins">YES 54%</span>
                <span className="text-red-400 font-bold text-sm font-poppins">NO 46%</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5, duration: 0.5 }}
              className="absolute bottom-[5%] right-[8%] bg-[#0d1320]/95 border border-[rgba(0,123,255,0.25)] rounded-xl px-4 py-3 backdrop-blur-sm shadow-xl"
            >
              <div className="text-xs text-gray-500 mb-1.5 font-inter">Trinidad Carnival Attendance</div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-3 h-3 text-[#007BFF]" />
                <span className="text-[#007BFF] font-bold text-sm font-poppins">$48K pool</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Categories ── */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="mb-14 text-center"
          >
            <motion.p variants={fadeUp} className="text-[#007BFF] text-sm font-semibold font-inter mb-3 tracking-widest uppercase">
              What You Can Trade
            </motion.p>
            <motion.h2 variants={fadeUp} className="font-poppins text-3xl lg:text-4xl font-bold text-white mb-4">
              Markets for Every Corner of the Caribbean
            </motion.h2>
            <motion.p variants={fadeUp} className="text-gray-400 text-lg font-inter max-w-2xl mx-auto">
              From reggae to referendum — if it matters to the region, there&apos;s a market for it.
            </motion.p>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
          >
            {CATEGORIES.map((cat) => (
              <motion.div key={cat.name} variants={fadeUp}>
                <Link
                  href={`/markets?category=${cat.name.toUpperCase()}`}
                  className={`block bg-gradient-to-b ${cat.gradient} border rounded-2xl p-6 text-center transition-all duration-200 hover:-translate-y-1.5 hover:shadow-lg`}
                >
                  <div className="text-3xl mb-3">{cat.emoji}</div>
                  <div className="font-poppins font-semibold text-white text-sm mb-1">{cat.name}</div>
                  <div className="text-gray-500 text-xs font-inter">{cat.count} markets</div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-24 bg-[#0d1320]/40 border-y border-[rgba(0,123,255,0.08)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.p variants={fadeUp} className="text-[#007BFF] text-sm font-semibold font-inter mb-3 tracking-widest uppercase">
              Simple by Design
            </motion.p>
            <motion.h2 variants={fadeUp} className="font-poppins text-3xl lg:text-4xl font-bold text-white">
              How It Works
            </motion.h2>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-6"
          >
            {HOW_IT_WORKS.map((item) => (
              <motion.div
                key={item.step}
                variants={fadeUp}
                className="relative bg-[#0d1320] border border-[rgba(0,123,255,0.15)] rounded-2xl p-8 text-center group hover:border-[rgba(0,123,255,0.35)] transition-colors duration-300"
              >
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#007BFF] text-white text-xs font-bold font-poppins px-3 py-1 rounded-full">
                  {item.step}
                </div>
                <div className="w-12 h-12 bg-[#007BFF]/10 rounded-xl flex items-center justify-center mx-auto mb-5 group-hover:bg-[#007BFF]/20 transition-colors">
                  <item.icon className="w-6 h-6 text-[#007BFF]" />
                </div>
                <h3 className="font-poppins font-bold text-white text-xl mb-3">{item.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed font-inter">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative bg-gradient-to-br from-[#007BFF]/18 via-[#003399]/10 to-transparent border border-[rgba(0,123,255,0.28)] rounded-3xl p-12 lg:p-20 text-center overflow-hidden"
          >
            {/* Background grid */}
            <div
              className="absolute inset-0 opacity-[0.04] pointer-events-none"
              style={{
                backgroundImage:
                  "linear-gradient(#007BFF 1px, transparent 1px), linear-gradient(90deg, #007BFF 1px, transparent 1px)",
                backgroundSize: "40px 40px",
              }}
            />
            {/* Glow */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[400px] h-[200px] bg-[#007BFF]/10 rounded-full blur-3xl" />
            </div>

            <div className="relative">
              <p className="text-[#007BFF] text-sm font-semibold font-inter mb-4 tracking-widest uppercase">
                Join the Caribbean&apos;s trading revolution
              </p>
              <h2 className="font-poppins text-4xl lg:text-5xl font-bold text-white mb-5">
                Ready to Start Predicting?
              </h2>
              <p className="text-gray-400 text-lg mb-10 max-w-2xl mx-auto font-inter leading-relaxed">
                Deposit in XCD, USD, JMD, TTD and more. No minimum. No lock-up.
                Trade on the events that shape the Caribbean.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 bg-[#007BFF] hover:bg-[#0056b3] text-white px-10 py-4 rounded-xl font-bold font-poppins text-base transition-all duration-200 shadow-xl shadow-[#007BFF]/30 hover:shadow-[#007BFF]/50 hover:-translate-y-0.5"
                >
                  Create Free Account
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/markets"
                  className="inline-flex items-center gap-2 bg-white/8 hover:bg-white/14 text-white px-10 py-4 rounded-xl font-bold font-poppins text-base transition-colors duration-200 backdrop-blur-sm border border-white/10"
                >
                  Explore Markets
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-[rgba(0,123,255,0.08)] py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#007BFF] rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <span className="font-poppins font-bold text-white">OBet</span>
            <span className="text-gray-600 text-sm font-inter">© 2025</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-600 font-inter">
            <Link href="/terms" className="hover:text-gray-300 transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-gray-300 transition-colors">Privacy</Link>
            <Link href="/support" className="hover:text-gray-300 transition-colors">Support</Link>
          </div>
          <div className="text-xs text-gray-700 font-inter">Caribbean&apos;s prediction market platform</div>
        </div>
      </footer>
    </main>
  );
}
