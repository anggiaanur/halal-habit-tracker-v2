"use client";

import React, { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Mail, ArrowRight, ArrowLeft } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      // 1. Intercept mock users and show simulation notice
      const mockUsersStr = typeof window !== "undefined" ? localStorage.getItem("mock_users") : null;
      const mockUsers = mockUsersStr ? JSON.parse(mockUsersStr) : [];
      const isMockAccount = mockUsers.some((u: { email: string }) => u.email.toLowerCase() === email.toLowerCase()) || 
                            email.toLowerCase() === "admin@gmail.com";

      if (isMockAccount) {
        setTimeout(() => {
          setSuccessMsg("Simulasi Sukses: Tautan reset password telah dikirim! (Catatan: Ini adalah akun lokal simulasi, sehingga tidak ada email fisik asli yang dikirim) 🌸");
          setEmail("");
          setIsLoading(false);
        }, 1000);
        return;
      }

      // 2. Real Supabase reset password
      const isPlaceholder = !process.env.NEXT_PUBLIC_SUPABASE_URL || 
                            process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder");
      
      if (isPlaceholder) {
        // Mock success response for testing
        setTimeout(() => {
          setSuccessMsg("Tautan reset password (simulasi) telah dikirim ke email Anda! 🌸");
          setEmail("");
          setIsLoading(false);
        }, 1000);
        return;
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login`, // Redirect back to login after resetting
      });

      if (error) {
        setErrorMsg(error.message);
      } else {
        setSuccessMsg("Tautan reset password telah dikirim ke email Anda! Silakan periksa kotak masuk 🌸");
        setEmail("");
      }
    } catch (err) {
      const error = err as Error;
      setErrorMsg(error.message || "Terjadi kesalahan saat memproses permintaan.");
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
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-rose-300 to-pink-400 opacity-20 blur-md group-hover:opacity-45 transition duration-500" />
            <div className="absolute inset-0 rounded-full border border-rose-300/50 group-hover:rotate-45 transition-transform duration-700" />
            
            <div className="absolute inset-1.5 rounded-full bg-white/50 border border-white/80 backdrop-blur-md flex items-center justify-center shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="/apple-touch-icon.png" 
                alt="Halal Habit Logo" 
                className="h-11 w-11 rounded-xl shadow-inner object-cover"
              />
            </div>
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", width: "100%" }}>
            <h1 className="text-5xl font-handwriting text-rose-900 tracking-wide text-center">
              Halal Habit
            </h1>
            <h2 className="text-[11px] font-serif font-light uppercase tracking-[0.25em] text-center" style={{ color: "var(--pink-600)" }}>
              Lupa Kata Sandi 🎀
            </h2>
          </div>
        </div>

        <p className="text-xs text-center text-rose-900/70" style={{ lineHeight: "1.6", margin: "0 auto", maxWidth: "320px" }}>
          Masukkan alamat email Anda yang terdaftar. Kami akan mengirimkan tautan untuk mengatur ulang kata sandi Anda. 🌸
        </p>

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

          {/* Submit Button */}
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
            <span style={{ fontWeight: "700" }}>{isLoading ? "Mengirim..." : "Kirim Tautan Reset 🎀"}</span>
            <ArrowRight className="h-4.5 w-4.5" />
          </button>
        </form>

        {/* Back to Login Link */}
        <div style={{ borderTop: "1px solid var(--border)", paddingTop: "24px", textAlign: "center" }}>
          <Link href="/login" style={{ color: "var(--pink-700)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: "700" }} className="hover:underline">
            <ArrowLeft className="h-4 w-4" /> Kembali ke Halaman Masuk
          </Link>
        </div>
      </div>
    </div>
  );
}
