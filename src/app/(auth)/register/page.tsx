"use client";

import React, { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Sparkles, User, Mail, Lock, ArrowRight } from "lucide-react";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    const cleanName = name.trim();
    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    try {
      // 1. Save user to mock localStorage database
      const mockUsersStr = localStorage.getItem("mock_users");
      const mockUsers = mockUsersStr ? JSON.parse(mockUsersStr) : [];
      
      if (mockUsers.some((u: any) => u.email.toLowerCase() === cleanEmail.toLowerCase())) {
        setErrorMsg("Email sudah terdaftar.");
        setIsLoading(false);
        return;
      }

      mockUsers.push({ name: cleanName, email: cleanEmail, password: cleanPassword });
      localStorage.setItem("mock_users", JSON.stringify(mockUsers));

      // 2. Save user to Supabase Cloud Mock Users Table (for cross-device/browser support)
      const { error: dbError } = await supabase.from("syariah_mock_users").insert({
        name: cleanName,
        email: cleanEmail.toLowerCase(),
        password: cleanPassword
      });

      if (dbError) {
        if (dbError.code === "23505") { // Unique violation code in Postgres
          setErrorMsg("Email sudah terdaftar di database cloud.");
          setIsLoading(false);
          return;
        }
        console.warn("Supabase mock DB insert warning:", dbError.message);
      }

      // 3. Attempt real Supabase signup if configured
      const isPlaceholder = !process.env.NEXT_PUBLIC_SUPABASE_URL || 
                            process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder");
      if (!isPlaceholder) {
        const { error } = await supabase.auth.signUp({
          email: cleanEmail,
          password: cleanPassword,
          options: {
            data: {
              full_name: cleanName,
            },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) {
          console.warn("Supabase signup warning:", error.message);
        }
      }

      setSuccessMsg("Pendaftaran berhasil! Silakan masuk menggunakan akun baru Anda 🌸");
      // Clear inputs
      setName("");
      setEmail("");
      setPassword("");
    } catch (err: any) {
      setErrorMsg(err.message || "Terjadi kesalahan saat mendaftar.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden bg-rose-50/40"
      style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}
    >
      {/* Ambient background decoration */}
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      
      {/* Coquette aesthetic floaters */}
      <div className="absolute top-10 right-12 text-rose-300/40 text-4xl select-none animate-float pointer-events-none">✨</div>
      <div className="absolute bottom-10 left-12 text-rose-300/30 text-5xl select-none animate-float pointer-events-none" style={{ animationDelay: "1.5s" }}>🎀</div>
      <div className="absolute top-1/3 left-10 text-rose-300/25 text-3xl select-none animate-float pointer-events-none" style={{ animationDelay: "2.5s" }}>🌸</div>

      {/* Card */}
      <div 
        className="glass-card w-full max-w-md relative z-10 animate-fade-in shadow-xl rounded-[2rem] border border-rose-100/70"
        style={{
          padding: "44px 36px",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
          boxShadow: "var(--shadow-card), var(--shadow-pink)"
        }}
      >
        
        {/* Glow bar at top of card */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-rose-300 via-rose-400 to-pink-400" />
        
        {/* Concentric Aesthetic Logo & Header */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", width: "100%" }}>
          <div className="relative h-20 w-20 mb-1 flex items-center justify-center group cursor-pointer">
            {/* Outer glowing aura */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-rose-300 to-pink-400 opacity-20 blur-md group-hover:opacity-45 transition duration-500" />
            
            {/* Outer thin rotating ring */}
            <div className="absolute inset-0 rounded-full border border-rose-300/50 group-hover:rotate-45 transition-transform duration-700" />
            
            {/* Middle glass block */}
            <div className="absolute inset-1.5 rounded-full bg-white/50 border border-white/80 backdrop-blur-md flex items-center justify-center shadow-sm">
              {/* Inner gradient circle */}
              <div className="h-11 w-11 rounded-full bg-gradient-to-tr from-rose-400 to-pink-500 flex items-center justify-center shadow-inner relative overflow-hidden">
                <Sparkles className="h-5 w-5 text-white animate-float" />
                <div className="absolute -top-2 -right-2 w-5 h-5 bg-white/20 rounded-full blur-xs" />
              </div>
            </div>
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", width: "100%" }}>
            <h1 className="text-5xl font-handwriting text-rose-900 tracking-wide text-center">
              Halal Habit
            </h1>
            <h2 className="text-[11px] font-serif font-light uppercase tracking-[0.25em] text-center" style={{ color: "var(--pink-600)" }}>
              Daftar Akun Baru 🎀
            </h2>
          </div>
          
          {/* Slogan */}
          <p className="text-xs text-center font-serif italic text-rose-400" style={{ lineHeight: "1.5", maxWidth: "280px" }}>
            &quot;Beauty that blooms from within, nurtured with care and halal practices.&quot; 🌸
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div
            style={{
              background: "#FFE4E6",
              borderLeft: "4px solid #F43F5E",
              padding: "12px 16px",
              borderRadius: "0 16px 16px 0",
              fontSize: "12px",
              fontFamily: "var(--font-playfair-display), serif",
              color: "#9F1239",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span>{errorMsg}</span>
            <button onClick={() => setErrorMsg("")} style={{ background: "none", border: "none", color: "#9F1239", fontWeight: "bold", cursor: "pointer" }}>×</button>
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div
            style={{
              background: "#ECFDF5",
              borderLeft: "4px solid #10B981",
              padding: "12px 16px",
              borderRadius: "0 16px 16px 0",
              fontSize: "12px",
              fontFamily: "var(--font-playfair-display), serif",
              color: "#065F46",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span>{successMsg}</span>
            <button onClick={() => setSuccessMsg("")} style={{ background: "none", border: "none", color: "#065F46", fontWeight: "bold", cursor: "pointer" }}>×</button>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%" }}>
          {/* Name */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label className="text-[11px] font-extrabold tracking-widest font-serif uppercase pl-0.5" style={{ color: "var(--text-muted)", lineHeight: "1" }}>
              Nama Lengkap
            </label>
            <div className="relative">
              <User
                className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4"
                style={{ color: "var(--text-dim)" }}
              />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nama Lengkap Anda"
                className="input-pink text-sm font-semibold rounded-full"
                style={{ height: "46px", paddingLeft: "42px" }}
              />
            </div>
          </div>

          {/* Email */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label className="text-[11px] font-extrabold tracking-widest font-serif uppercase pl-0.5" style={{ color: "var(--text-muted)", lineHeight: "1" }}>
              Alamat Email
            </label>
            <div className="relative">
              <Mail
                className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4"
                style={{ color: "var(--text-dim)" }}
              />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@anda.com"
                className="input-pink text-sm font-semibold rounded-full"
                style={{ height: "46px", paddingLeft: "42px" }}
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label className="text-[11px] font-extrabold tracking-widest font-serif uppercase pl-0.5" style={{ color: "var(--text-muted)", lineHeight: "1" }}>
              Kata Sandi
            </label>
            <div className="relative">
              <Lock
                className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4"
                style={{ color: "var(--text-dim)" }}
              />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan kata sandi baru"
                className="input-pink text-sm font-semibold rounded-full"
                style={{ height: "46px", paddingLeft: "42px" }}
              />
            </div>
          </div>

          {/* Register Button */}
          <button 
            type="submit" 
            disabled={isLoading}
            className="btn-pink w-full flex items-center justify-center gap-2 select-none rounded-full py-3"
            style={{ 
              height: "46px", 
              marginTop: "8px", 
              opacity: isLoading ? 0.75 : 1, 
              cursor: isLoading ? "not-allowed" : "pointer" 
            }}
          >
            <span style={{ fontWeight: "700" }}>{isLoading ? "Mendaftar..." : "Daftar Akun Baru 🎀"}</span>
            <ArrowRight className="h-4.5 w-4.5" />
          </button>
        </form>

        {/* Divider & Switch Path */}
        <div style={{ borderTop: "1px solid var(--border)", paddingTop: "24px", textAlign: "center", display: "flex", flexDirection: "column", gap: "16px" }}>
          <p className="text-sm font-serif" style={{ color: "var(--text-muted)", lineHeight: "1.5" }}>
            Sudah memiliki akun?{" "}
            <Link href="/login" className="font-extrabold hover:underline" style={{ color: "var(--pink-700)", marginLeft: "4px" }}>
              Masuk Sekarang 🎀
            </Link>
          </p>
          
          {/* Disclaimer */}
          <p className="text-[11px] font-serif italic" style={{ color: "var(--text-dim)", lineHeight: "1.5" }}>
            🌸 Mari gabung untuk rezeki dan kebiasaan yang penuh berkah.
          </p>
        </div>
      </div>
    </div>
  );
}
