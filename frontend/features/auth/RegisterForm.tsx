"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";
import { authApi, setTokens } from "@/lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";

const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  first_name: z.string().min(1, "First name required"),
  last_name: z.string().min(1, "Last name required"),
});

type FormData = z.infer<typeof schema>;

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setError(null);
    try {
      await authApi.register(data);
      const result = await authApi.login({ email: data.email, password: data.password });
      setTokens(result.access_token, result.refresh_token);
      router.push("/markets");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed");
    }
  };

  return (
    <div className="min-h-screen bg-[#060810] flex items-center justify-center px-4 relative overflow-hidden py-24">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#007BFF]/5 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-[#007BFF] rounded-xl flex items-center justify-center group-hover:bg-[#0056b3] transition-colors">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="font-poppins font-bold text-xl text-white">OBet</span>
          </Link>
        </div>

        <div className="bg-[#0d1320] border border-[rgba(0,123,255,0.18)] rounded-2xl p-8 shadow-2xl shadow-black/40">
          <h1 className="font-poppins text-2xl font-bold text-white mb-1">Create your account</h1>
          <p className="text-gray-500 text-sm font-inter mb-8">Join thousands of Caribbean traders</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1.5 font-inter">First name</label>
                <input
                  {...register("first_name")}
                  placeholder="Alex"
                  className="w-full bg-[#060810] text-white border border-[rgba(0,123,255,0.18)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#007BFF] placeholder-gray-700 font-inter transition-colors"
                />
                {errors.first_name && (
                  <p className="text-red-400 text-xs mt-1.5 font-inter">{errors.first_name.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5 font-inter">Last name</label>
                <input
                  {...register("last_name")}
                  placeholder="Martin"
                  className="w-full bg-[#060810] text-white border border-[rgba(0,123,255,0.18)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#007BFF] placeholder-gray-700 font-inter transition-colors"
                />
                {errors.last_name && (
                  <p className="text-red-400 text-xs mt-1.5 font-inter">{errors.last_name.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1.5 font-inter">Email</label>
              <input
                {...register("email")}
                type="email"
                placeholder="you@example.com"
                className="w-full bg-[#060810] text-white border border-[rgba(0,123,255,0.18)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#007BFF] placeholder-gray-700 font-inter transition-colors"
              />
              {errors.email && (
                <p className="text-red-400 text-xs mt-1.5 font-inter">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1.5 font-inter">Password</label>
              <input
                {...register("password")}
                type="password"
                placeholder="At least 8 characters"
                className="w-full bg-[#060810] text-white border border-[rgba(0,123,255,0.18)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#007BFF] placeholder-gray-700 font-inter transition-colors"
              />
              {errors.password && (
                <p className="text-red-400 text-xs mt-1.5 font-inter">{errors.password.message}</p>
              )}
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/25 rounded-xl px-4 py-3">
                <p className="text-red-400 text-sm font-inter">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#007BFF] hover:bg-[#0056b3] disabled:opacity-50 text-white font-bold font-poppins py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-[#007BFF]/20 mt-2"
            >
              {isSubmitting ? "Creating account…" : "Create Account"}
            </button>
          </form>

          <p className="text-gray-600 text-sm text-center mt-6 font-inter">
            Already have an account?{" "}
            <Link href="/login" className="text-[#007BFF] hover:text-[#3395ff] transition-colors font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
