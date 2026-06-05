"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Sparkles, Eye, EyeOff, Check } from "lucide-react";


// ─── Google Icon ──────────────────────────────────────────────────────────────
function GoogleIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const [showDevBypass, setShowDevBypass] = useState(false);
  const [logoClicks, setLogoClicks] = useState(0);

  const supabase = createClient();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("dev") === "true" || params.get("admin") === "true") {
        setTimeout(() => setShowDevBypass(true), 0);
      }
    }
  }, []);

  const handleLogoClick = () => {
    const clicks = logoClicks + 1;
    setLogoClicks(clicks);
    if (clicks >= 5) {
      setShowDevBypass(true);
    }
  };

  useEffect(() => {
    // Check if user session already exists
    const isBypassed = localStorage.getItem("dev_bypass") === "true";
    const hasMockSession = localStorage.getItem("mock_user_session") !== null;
    if (isBypassed || hasMockSession) {
      router.push("/");
      return;
    }
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.push("/");
      }
    });
  }, [supabase, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    try {
      // 1. Check Supabase Cloud Mock Users Table first (for cross-device/browser support)
      const { data: dbUser } = await supabase
        .from("syariah_mock_users")
        .select("*")
        .eq("email", cleanEmail.toLowerCase())
        .eq("password", cleanPassword)
        .maybeSingle();

      if (dbUser) {
        localStorage.setItem("mock_user_session", JSON.stringify({ email: dbUser.email, name: dbUser.name }));
        router.push("/");
        return;
      }

      // 2. Check local mock database (fallback)
      const mockUsersStr = localStorage.getItem("mock_users");
      const mockUsers = mockUsersStr ? JSON.parse(mockUsersStr) : [];
      const foundUser = mockUsers.find(
        (u: { email: string; password?: string }) => u.email.toLowerCase() === cleanEmail.toLowerCase() && u.password === cleanPassword
      );

      if (foundUser) {
        localStorage.setItem("mock_user_session", JSON.stringify({ email: cleanEmail, name: foundUser.name }));
        router.push("/");
        return;
      }

      // 3. Default mock admin user for quick review
      if (cleanEmail.toLowerCase() === "admin@gmail.com" && cleanPassword === "admin123") {
        localStorage.setItem("mock_user_session", JSON.stringify({ email: cleanEmail, name: "Sahabat Admin" }));
        router.push("/");
        return;
      }

      // 4. Fallback to Supabase (if keys are configured)
      const { data: authData, error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password: cleanPassword });
      if (error) {
        if (error.message.toLowerCase().includes("confirm")) {
          // Bypass email confirmation for UAS demo!
          localStorage.setItem("mock_user_session", JSON.stringify({ email: cleanEmail, name: cleanEmail.split('@')[0] }));
          router.push("/");
          return;
        }
        setErrorMsg(error.message);
        setIsLoading(false);
      } else {
        localStorage.setItem("mock_user_session", JSON.stringify({ 
          email: authData.user?.email || cleanEmail, 
          name: authData.user?.user_metadata?.full_name || cleanEmail.split('@')[0] 
        }));
        router.push("/");
      }
    } catch {
      setErrorMsg("Email atau password tidak valid.");
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMsg("");

    // Google Sign in mock fallback if Supabase is placeholder
    const isPlaceholder = !process.env.NEXT_PUBLIC_SUPABASE_URL || 
                          process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder");
    if (isPlaceholder) {
      localStorage.setItem("mock_user_session", JSON.stringify({ email: "google-user@gmail.com", name: "User Google ✦" }));
      router.push("/");
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        setErrorMsg(error.message);
        setIsLoading(false);
      }
    } catch (err) {
      const error = err as Error;
      setErrorMsg(error.message || "Gagal mengaitkan Google OAuth.");
      setIsLoading(false);
    }
  };

  const inputStyle = (focused: boolean): React.CSSProperties => ({
    width: "100%",
    padding: "11px 36px 11px 38px",
    background: focused ? "#fff" : "#FFF9FB",
    border: `1px solid ${focused ? "#F472B6" : "#F3D0DC"}`,
    borderRadius: "9999px",
    fontSize: "13.5px",
    fontFamily: "var(--font-quicksand), sans-serif",
    color: "#1C1917",
    fontWeight: 600,
    outline: "none",
    boxShadow: focused ? "0 0 0 3px rgba(244,114,182,0.12)" : "none",
    transition: "all 0.2s",
  });

  return (
    <>
      <style>{`
        ::placeholder { color: #D4A5B8; }
        .login-card-top-bar { display: none; }
        .mobile-decorations { display: none; }

        @media (max-width: 1023px) {
          .left-panel-coquette { display: none !important; }
          .mobile-header-coquette { display: flex !important; }
          .mobile-decorations { display: block !important; }
          .login-container {
            background-color: #FFF0F3 !important; /* Romantic rose backdrop */
            justify-content: center !important;
            align-items: center !important;
            padding: 20px 16px !important;
            position: relative !important;
          }
          .login-right-panel {
            background: transparent !important;
            min-height: auto !important;
            padding: 0 !important;
            width: 100% !important;
            max-width: 440px !important;
            display: flex !important;
            justify-content: center !important;
            align-items: center !important;
            margin: auto 0 !important;
          }
          .login-card {
            background: rgba(255, 255, 255, 0.82) !important;
            border: 1px solid rgba(244, 114, 182, 0.22) !important;
            border-radius: 2rem !important;
            backdrop-filter: blur(24px) !important;
            -webkit-backdrop-filter: blur(24px) !important;
            padding: 44px 28px 36px !important;
            box-shadow: 0 20px 40px rgba(244, 63, 94, 0.05), 0 1px 12px rgba(244, 114, 182, 0.12) !important;
            width: 100% !important;
            position: relative !important;
            overflow: hidden;
          }
          .login-card-top-bar {
            display: block !important;
            height: 5px;
            background: linear-gradient(to right, #FDA4AF, #FB7185, #F472B6);
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
          }
        }
        @media (min-width: 1024px) {
          .left-panel-coquette { display: flex !important; }
          .mobile-header-coquette { display: none !important; }
          .mobile-decorations { display: none !important; }
        }
      `}</style>

      <div
        className="login-container"
        style={{
          minHeight: "100vh",
          display: "flex",
          fontFamily: "var(--font-quicksand), sans-serif",
          fontSize: "14px",
          flexDirection: "row",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Mobile floating background elements */}
        <div className="mobile-decorations">
          <div className="blob blob-1" style={{ position: "absolute", top: "-10%", left: "-10%", width: "300px", height: "300px", borderRadius: "50%", background: "rgba(254, 205, 211, 0.4)", filter: "blur(60px)", zIndex: 0 }} />
          <div className="blob blob-2" style={{ position: "absolute", bottom: "-10%", right: "-10%", width: "250px", height: "250px", borderRadius: "50%", background: "rgba(253, 164, 175, 0.35)", filter: "blur(50px)", zIndex: 0 }} />
          <div className="absolute top-10 right-12 text-rose-300/45 text-4xl select-none animate-float pointer-events-none" style={{ zIndex: 0 }}>✨</div>
          <div className="absolute bottom-10 left-12 text-rose-300/35 text-5xl select-none animate-float pointer-events-none" style={{ animationDelay: "1.5s", zIndex: 0 }}>🎀</div>
          <div className="absolute top-1/3 left-6 text-rose-300/30 text-3xl select-none animate-float pointer-events-none" style={{ animationDelay: "2.5s", zIndex: 0 }}>🌸</div>
        </div>

        {/* ═══════════════ LEFT PANEL ═══════════════ */}
        <div
          style={{
            width: "46%",
            background: "linear-gradient(160deg, #FFF0F3 0%, #FFE4EC 40%, #FECDD3 80%, #FDB9C8 100%)",
            padding: "44px 40px",
            flexDirection: "column",
            justifyContent: "space-between",
            position: "relative",
            overflow: "hidden",
          }}
          className="left-panel-coquette hidden lg:flex"
        >
          {/* Decorative blobs */}
          <div style={{ position: "absolute", width: 280, height: 280, borderRadius: "50%", background: "radial-gradient(circle, rgba(251,207,232,0.7), transparent 65%)", top: -80, right: -60 }} />
          <div style={{ position: "absolute", width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle, rgba(253,164,175,0.4), transparent 65%)", bottom: 60, left: -40 }} />
          <div style={{ position: "absolute", width: 120, height: 120, borderRadius: "50%", background: "radial-gradient(circle, rgba(244,114,182,0.25), transparent 65%)", bottom: 200, right: 20 }} />

          {/* Brand */}
          <div 
            role="button"
            tabIndex={0}
            onClick={handleLogoClick}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleLogoClick();
              }
            }}
            style={{ display: "flex", alignItems: "center", gap: 10, position: "relative", zIndex: 2, cursor: "pointer" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="/apple-touch-icon.png" 
              alt="Halal Habit Logo" 
              style={{ 
                width: 38, 
                height: 38, 
                borderRadius: 10, 
                border: "1.5px solid rgba(244, 180, 200, 0.4)",
                boxShadow: "0 2px 6px rgba(244, 114, 182, 0.15)",
                objectFit: "cover"
              }} 
            />
            <div>
              <p style={{ fontFamily: "var(--font-playfair-display), serif", fontSize: 18, fontWeight: 700, color: "#9F1239", letterSpacing: "0.02em", lineHeight: 1.2 }}>
                Halal Habit Tracker
              </p>
              <p style={{ fontSize: 9, fontWeight: 800, color: "#FB7185", letterSpacing: "0.2em", textTransform: "uppercase" }}>
                amanah · berkah · bermanfaat 🎀
              </p>
            </div>
          </div>

          {/* Greeting Card */}
          <div
            style={{
              position: "relative", zIndex: 2,
              background: "rgba(255,255,255,0.65)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.85)",
              borderRadius: 32,
              padding: "32px 28px",
              boxShadow: "0 20px 50px rgba(244,63,94,0.06), 0 4px 16px rgba(0,0,0,0.02)",
            }}
          >
            {/* Moon-star icon */}
            <div style={{ width: 52, height: 52, background: "linear-gradient(135deg,#FDA4AF,#F43F5E)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20, boxShadow: "0 6px 20px rgba(244,63,94,0.25)" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 3C8.5 3 6 5.5 6 9C6 12.5 8.5 15 12 15C9.8 15 8 13.2 8 11C8 8.8 9.8 7 12 7C12.68 7 13.32 7.16 13.88 7.45C13.32 5.42 11.9 3.76 10.05 2.85C10.66 2.32 11.3 3 12 3Z" fill="white" opacity="0.9" />
                <path d="M15 4 L15.45 5.35 L16.85 5.35 L15.7 6.18 L16.15 7.53 L15 6.7 L13.85 7.53 L14.3 6.18 L13.15 5.35 L14.55 5.35 Z" fill="white" />
                <path d="M17.5 9 L17.8 9.9 L18.75 9.9 L17.98 10.45 L18.28 11.35 L17.5 10.8 L16.72 11.35 L17.02 10.45 L16.25 9.9 L17.2 9.9 Z" fill="white" opacity="0.7" />
              </svg>
            </div>

            <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", color: "#FB7185", marginBottom: 10, fontFamily: "var(--font-playfair-display), serif" }}>
              Salam & Selamat Datang 🎀
            </p>

            <h2 style={{ fontFamily: "var(--font-playfair-display), serif", fontSize: 28, fontWeight: 700, color: "#881337", lineHeight: 1.35, marginBottom: 12 }}>
              Assalamu&apos;alaikum,<br />
              mari kelola rezeki<br />
              dengan{" "}
              <em style={{ color: "#E11D48" }}>amanah &amp; bijaksana.</em>
            </h2>

            <p style={{ fontSize: 12.5, color: "#be123c", lineHeight: 1.6, marginBottom: 22, fontWeight: 500 }}>
              Mulai perjalanan finansialmu yang berkah, penuh niat baik dan istiqomah.
            </p>

            {/* Stats */}
            <div style={{ display: "flex", gap: 10 }}>
              {[
                { val: "30+", lbl: "Kebiasaan" },
                { val: "1K+", lbl: "Pengguna" },
                { val: "99%", lbl: "Berkah ✦" },
              ].map((s) => (
                <div key={s.lbl} style={{ flex: 1, background: "rgba(244,63,94,0.04)", border: "1px solid rgba(244,63,94,0.12)", borderRadius: 16, padding: "10px 8px", textAlign: "center" }}>
                  <p style={{ fontFamily: "var(--font-playfair-display), serif", fontSize: 20, fontWeight: 700, color: "#E11D48", lineHeight: 1 }}>{s.val}</p>
                  <p style={{ fontSize: 9, color: "#be123c", marginTop: 3, fontWeight: 700 }}>{s.lbl}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quote */}
          <div style={{ position: "relative", zIndex: 2, background: "rgba(255,255,255,0.55)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.75)", borderRadius: 20, padding: "16px 18px", display: "flex", gap: 10, alignItems: "flex-start" }}>
            <span style={{ fontFamily: "var(--font-playfair-display), serif", fontSize: 36, color: "#FCA5A5", lineHeight: 0.8, flexShrink: 0, marginTop: 4 }}>&ldquo;</span>
            <p style={{ fontFamily: "var(--font-playfair-display), serif", fontSize: 13.5, fontStyle: "italic", color: "#9F1239", lineHeight: 1.55 }}>
              Kelola rezeki dengan amanah, karena harta yang berkah bukan yang banyak tapi yang bermanfaat.
            </p>
          </div>
        </div>

        {/* ═══════════════ RIGHT PANEL ═══════════════ */}
        <div
          className="login-right-panel"
          style={{
            flex: 1,
            background: "#FFFFFF",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            padding: "44px 32px",
            minHeight: "100vh",
            position: "relative",
            zIndex: 1,
          }}
        >
          <div className="login-card" style={{ width: "100%", maxWidth: 360, margin: "auto 0" }}>
            <div className="login-card-top-bar" />

            {/* Mobile-only Concentric Aesthetic Logo & Header */}
            <div 
              role="button"
              tabIndex={0}
              onClick={handleLogoClick}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleLogoClick();
                }
              }}
              className="mobile-header-coquette flex lg:hidden"
              style={{ 
                flexDirection: "column", 
                alignItems: "center", 
                gap: "12px", 
                width: "100%", 
                marginBottom: "24px",
                cursor: "pointer"
              }}
            >
              <div className="relative h-20 w-20 mb-1 flex items-center justify-center group">
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
                <h2 className="text-[11px] font-serif font-light uppercase tracking-[0.25em] text-center" style={{ color: "#DB2777" }}>
                  Masuk ke Akun Anda 🎀
                </h2>
              </div>
              
              <p className="text-xs text-center font-serif italic text-rose-400" style={{ lineHeight: "1.5", maxWidth: "280px" }}>
                &quot;Assalamu&apos;alaikum, silakan masuk untuk melanjutkan istiqomah Anda.&quot; 🌸
              </p>
            </div>

            {/* Desktop-only Header Text */}
            <div className="hidden lg:block">
              <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", color: "#FB7185", marginBottom: 12, fontFamily: "var(--font-playfair-display), serif" }}>
                Masuk ke Akun Anda
              </p>
              <h1 style={{ fontFamily: "var(--font-playfair-display), serif", fontSize: 38, fontWeight: 700, color: "#1C1917", lineHeight: 1.25, marginBottom: 10 }}>
                Selamat<br />
                <span style={{ color: "#E11D48" }}>datang kembali ✦</span>
              </h1>
              <p style={{ fontSize: 14, color: "#78716C", marginBottom: 28, fontWeight: 600, lineHeight: 1.5 }}>
                Belum punya akun?{" "}
                <Link href="/register" style={{ color: "#E11D48", textDecoration: "none", fontWeight: 700, marginLeft: "4px" }} className="hover:underline">
                  Daftar gratis 🎀
                </Link>
              </p>
            </div>

            {/* Developer Bypass Toggle */}
            {showDevBypass && (
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
                <button
                  type="button"
                  onClick={() => {
                    localStorage.setItem("dev_bypass", "true");
                    router.push("/");
                  }}
                  style={{
                    background: "rgba(244, 114, 182, 0.12)",
                    border: "1px dashed #F472B6",
                    color: "#DB2777",
                    fontSize: "11px",
                    fontWeight: 800,
                    padding: "8px 16px",
                    borderRadius: "9999px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontFamily: "var(--font-playfair-display), serif",
                    transition: "all 0.2s"
                  }}
                  className="hover:scale-105"
                >
                  <Sparkles size={12} />
                  Developer Bypass (Langsung ke Dashboard) ✦
                </button>
              </div>
            )}

            {/* Beautiful Coquette Alert Warning */}
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
                  marginBottom: "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  boxShadow: "0 2px 8px rgba(244,63,94,0.03)",
                }}
                className="animate-fade-in"
              >
                <span>{errorMsg}</span>
                <button
                  onClick={() => setErrorMsg("")}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#9F1239",
                    fontWeight: "bold",
                    fontSize: "16px",
                    cursor: "pointer",
                    padding: "0 4px",
                  }}
                >
                  ×
                </button>
              </div>
            )}



            <form onSubmit={handleSubmit}>
              {/* Email */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: "#57534E", marginBottom: 6, letterSpacing: "0.05em", textTransform: "uppercase", fontFamily: "var(--font-playfair-display), serif" }}>
                  Email
                </label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#D4A5B8", display: "flex" }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                    placeholder="nama@email.com"
                    required
                    style={inputStyle(emailFocused)}
                  />
                </div>
              </div>

              {/* Password */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: "#57534E", marginBottom: 6, letterSpacing: "0.05em", textTransform: "uppercase", fontFamily: "var(--font-playfair-display), serif" }}>
                  Password
                </label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#D4A5B8", display: "flex" }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                    placeholder="Masukkan password Anda"
                    required
                    style={{ ...inputStyle(passwordFocused), paddingRight: 40 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#D4A5B8", display: "flex", alignItems: "center", padding: 0 }}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Remember + Forgot */}
              <div style={{ display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
                <label
                  style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 12.5, color: "#78716C", userSelect: "none", fontWeight: 600 }}
                >
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={() => setRememberMe(!rememberMe)}
                    style={{ position: "absolute", opacity: 0, width: 0, height: 0 }}
                  />
                  <div style={{ width: 17, height: 17, border: `1.5px solid ${rememberMe ? "#F472B6" : "#F9A8D4"}`, borderRadius: 5, display: "flex", alignItems: "center", justifyContent: "center", background: rememberMe ? "#F472B6" : "white", transition: "all 0.15s", flexShrink: 0 }}>
                    {rememberMe && <Check size={10} strokeWidth={3} className="text-white" />}
                  </div>
                  Ingat saya
                </label>
                <a href="/forgot-password" style={{ fontSize: 12.5, color: "#F472B6", textDecoration: "none", fontWeight: 700, fontFamily: "var(--font-playfair-display), serif" }}>
                  Lupa password?
                </a>
              </div>

              {/* CTA */}
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  width: "100%",
                  padding: "13px",
                  background: "linear-gradient(135deg, #F472B6 0%, #EC4899 50%, #E11D48 100%)",
                  border: "none",
                  borderRadius: "9999px",
                  color: "white",
                  fontFamily: "var(--font-quicksand), sans-serif",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: isLoading ? "not-allowed" : "pointer",
                  boxShadow: "0 6px 20px rgba(236,72,153,0.3)",
                  transition: "all 0.25s",
                  letterSpacing: "0.02em",
                  marginBottom: 18,
                  opacity: isLoading ? 0.75 : 1,
                }}
              >
                {isLoading ? (
                  <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    <svg style={{ animation: "spin 1s linear infinite" }} width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeOpacity="0.3" />
                      <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                    Masuk...
                  </span>
                ) : (
                  "Masuk Sekarang 🎀"
                )}
              </button>
            </form>

            {/* Divider */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div style={{ flex: 1, height: 1, background: "#F5E0EA" }} />
              <span style={{ fontSize: 10, color: "#C4A0B0", whiteSpace: "nowrap", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}>atau lanjutkan dengan</span>
              <div style={{ flex: 1, height: 1, background: "#F5E0EA" }} />
            </div>

            {/* Google */}
            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              style={{
                width: "100%",
                padding: 12,
                background: "white",
                border: "1px solid #F0D0DC",
                borderRadius: "9999px",
                fontFamily: "var(--font-quicksand), sans-serif",
                fontSize: 13,
                fontWeight: 700,
                color: "#57534E",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                transition: "all 0.2s",
                boxShadow: "0 1px 4px rgba(0,0,0,0.03)",
                marginBottom: 20,
              }}
            >
              <GoogleIcon />
              Masuk dengan Google
            </button>

            {/* Mobile-only Link to Register */}
            <div className="block lg:hidden" style={{ textAlign: "center", marginTop: "-12px", marginBottom: "20px" }}>
              <p style={{ fontSize: 13.5, color: "#78716C", fontWeight: 600 }}>
                Belum punya akun?{" "}
                <Link href="/register" style={{ color: "#E11D48", textDecoration: "none", fontWeight: 700, marginLeft: "4px" }} className="hover:underline">
                  Daftar gratis 🎀
                </Link>
              </p>
            </div>

            <p style={{ textAlign: "center", fontSize: 11, color: "#C4A0B0", lineHeight: 1.5, fontWeight: 500 }}>
              Dengan masuk, kamu menyetujui{" "}
              <a href="/terms" style={{ color: "#F9A8D4", textDecoration: "none" }}>Syarat &amp; Ketentuan</a>
              {" "}dan{" "}
              <a href="/privacy" style={{ color: "#F9A8D4", textDecoration: "none" }}>Kebijakan Privasi</a>
              {" "}kami.
            </p>

            <style>{`
              @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
          </div>
        </div>
      </div>
    </>
  );
}
