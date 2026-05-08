"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import api from "@/lib/api";
import Cookies from "js-cookie";
import Link from "next/link";
import { BookOpen, Eye, EyeOff, LogIn, ShieldCheck, GraduationCap, UserCog } from "lucide-react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    // We removed the auto-redirect to ensure users can choose to log in again 
    // or switch accounts if they land on this page.
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const res = await api.post("users/login/", { username, password });
      const { access, refresh, role } = res.data;

      Cookies.set("access_token", access, { expires: 1 });
      Cookies.set("refresh_token", refresh, { expires: 7 });
      Cookies.set("user_role", role);

      // Check for 'to' parameter from landing page
      const target = searchParams.get("to");
      
      if (target === "student" && role !== "STUDENT") {
        setError("This account does not have Student access.");
        return;
      }
      if (target === "instructor" && role !== "INSTRUCTOR") {
        setError("This account does not have Instructor access.");
        return;
      }

      if (role === "ADMIN") router.push("/admin-dashboard");
      else if (role === "INSTRUCTOR") router.push("/instructor-dashboard");
      else router.push("/student-dashboard");

    } catch (err: any) {
      setError(err.response?.data?.detail || "Invalid ID or password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Quick-fill helpers for demo/presentation
  const fillDemo = (role: string) => {
    if (role === "admin") { setUsername("admin"); setPassword("admin123"); }
    if (role === "instructor") { setUsername("instructor1"); setPassword("password123"); }
    if (role === "student") { setUsername("student1"); setPassword("password123"); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <Link href="/" className="inline-flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="p-2.5 bg-primary/20 rounded-xl">
              <BookOpen className="w-7 h-7 text-primary" />
            </div>
            <span className="font-extrabold text-3xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
              Nexus LMS
            </span>
          </Link>
          <p className="text-foreground/60 mt-3 text-sm">Sign in with your ID and password</p>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}
          className="glass border border-border rounded-2xl p-8 shadow-xl"
        >
          {/* Error */}
          {error && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
              className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-sm font-medium">
              ⚠️ {error}
            </motion.div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Username / ID */}
            <div>
              <label htmlFor="username" className="block text-sm font-semibold text-foreground/80 mb-1.5">
                Instructor / Student ID
              </label>
              <input
                id="username"
                type="text"
                required
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="e.g. INST-2026-AK7823 or student1"
                className="w-full px-4 py-3 rounded-xl border border-border bg-secondary/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all placeholder:text-foreground/30"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-foreground/80 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPass ? "text" : "password"}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 pr-11 rounded-xl border border-border bg-secondary/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all placeholder:text-foreground/30"
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground transition-colors">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button type="submit" disabled={isLoading}
              className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all disabled:opacity-60 flex items-center justify-center gap-2 shadow-lg shadow-primary/25 active:scale-95">
              {isLoading
                ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><LogIn className="w-4 h-4" /> Sign In</>
              }
            </button>
          </form>

          {/* Role indicator */}
          <div className="mt-6 pt-5 border-t border-border">
            <p className="text-xs text-foreground/50 text-center mb-3 font-semibold uppercase tracking-wide">
              Auto-redirect after login
            </p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Admin", icon: <ShieldCheck className="w-4 h-4 text-red-500" />, color: "bg-red-500/10 text-red-500" },
                { label: "Instructor", icon: <UserCog className="w-4 h-4 text-blue-500" />, color: "bg-blue-500/10 text-blue-500" },
                { label: "Student", icon: <GraduationCap className="w-4 h-4 text-green-500" />, color: "bg-green-500/10 text-green-500" },
              ].map(r => (
                <div key={r.label} className={`flex flex-col items-center gap-1 py-2 rounded-xl ${r.color} text-xs font-semibold`}>
                  {r.icon}{r.label}
                </div>
              ))}
            </div>
          </div>

          {/* Demo Quick Fill */}
          <div className="mt-4 p-3 bg-accent/5 rounded-xl border border-accent/20">
            <p className="text-xs text-foreground/50 mb-2 font-semibold text-center">🎯 Demo Quick-Fill</p>
            <div className="flex gap-2">
              {["admin", "instructor", "student"].map(role => (
                <button key={role} type="button" onClick={() => fillDemo(role)}
                  className="flex-1 py-1.5 text-xs font-semibold rounded-lg bg-secondary/50 hover:bg-primary/10 hover:text-primary transition-all capitalize">
                  {role}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Register link */}
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.3 } }}
          className="text-center text-sm text-foreground/60 mt-6">
          New student?{" "}
          <Link href="/register" className="text-primary font-semibold hover:underline">
            Register here
          </Link>
        </motion.p>
      </div>
    </div>
  );
}
