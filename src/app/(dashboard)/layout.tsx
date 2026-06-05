"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { User } from "lucide-react";

// ─── Inline SVG Logo ─────────────────────────────────────────────────────────
function HalalLogo({ size = 36 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 38 38"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="logoGradLayout" x1="0" y1="0" x2="38" y2="38" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F472B6" />
          <stop offset="100%" stopColor="#BE185D" />
        </linearGradient>
      </defs>
      <rect width="38" height="38" rx="12" fill="url(#logoGradLayout)" />
      {/* Crescent moon */}
      <path
        d="M22 10C17.03 10 13 14.03 13 19C13 23.97 17.03 28 22 28C19.24 28 17 25.76 17 23C17 20.24 19.24 18 22 18C22.68 18 23.33 18.14 23.91 18.39C23.31 15.88 21.87 13.69 19.89 12.14C20.58 10.8 21.22 10 22 10Z"
        fill="white"
        opacity="0.9"
      />
      {/* Big star */}
      <path
        d="M26 11 L26.6 12.8 L28.5 12.8 L27 13.9 L27.6 15.7 L26 14.6 L24.4 15.7 L25 13.9 L23.5 12.8 L25.4 12.8 Z"
        fill="white"
      />
      {/* Small star */}
      <path
        d="M28.5 19 L28.85 20.05 L29.95 20.05 L29.05 20.7 L29.4 21.75 L28.5 21.1 L27.6 21.75 L27.95 20.7 L27.05 20.05 L28.15 20.05 Z"
        fill="white"
        opacity="0.75"
      />
    </svg>
  );
}

const nav = [
  { name: "Dashboard",   href: "/",           iconClass: "ti ti-layout-dashboard", colorClass: "icon-lavender", iconColor: "#9b7dd4", sub: "Ringkasan harian" },
  { name: "Siklus Haid",  href: "/siklus",     iconClass: "ti ti-calendar-heart",   colorClass: "icon-rose",     iconColor: "#d4809a", sub: "Catat & pantau" },
  { name: "Ibadah",      href: "/ibadah",      iconClass: "ti ti-rosette",          colorClass: "icon-mint",     iconColor: "#5db8a0", sub: "Tracker amalan" },
  { name: "Keuangan",    href: "/keuangan",    iconClass: "ti ti-coin",             colorClass: "icon-peach",    iconColor: "#d4a06a", sub: "Zakat & infak" },
  { name: "AI Advisor",  href: "/ai-advisor",  iconClass: "ti ti-sparkles",         colorClass: "icon-sky",      iconColor: "#6aa8d8", sub: "Konsultasi islami", badge: "AI" },
  { name: "Laporan Keuangan", href: "/zakat",       iconClass: "ti ti-file-text",        colorClass: "icon-rose",     iconColor: "#d4809a", sub: "Unduh rekap & neraca" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const [showProfile, setShowProfile] = useState(false);
  const [userProfile, setUserProfile] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      const isBypassed = localStorage.getItem("dev_bypass") === "true";
      const hasMockSession = localStorage.getItem("mock_user_session") !== null;
      if (isBypassed || hasMockSession) return;

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
      }
    };
    checkUser();
  }, [router, supabase]);

  useEffect(() => {
    const fetchUser = async () => {
      // 1. Check if mock session exists
      const mockSessionStr = localStorage.getItem("mock_user_session");
      if (mockSessionStr) {
        try {
          const session = JSON.parse(mockSessionStr);
          setUserProfile({
            name: session.name || "Sahabat Sholihah",
            email: session.email || "user@example.com"
          });
          return;
        } catch (e) {
          // ignore error
        }
      }

      // 2. Check if dev bypass
      const isBypassed = localStorage.getItem("dev_bypass") === "true";
      if (isBypassed) {
        setUserProfile({
          name: "Sahabat Dev ✦",
          email: "developer@halalhabit.com"
        });
        return;
      }

      // 3. Fallback to Supabase User
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserProfile({
          name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || "Sahabat Halal",
          email: user.email || ""
        });
      } else {
        setUserProfile({
          name: "Sahabat Halal",
          email: "user@example.com"
        });
      }
    };
    fetchUser();
  }, [supabase]);

  const handleLogout = async () => {
    localStorage.removeItem("dev_bypass");
    localStorage.removeItem("mock_user_session");
    await supabase.auth.signOut();
    router.push("/login");
  };

  const [prayerData, setPrayerData] = useState<{
    current: string;
    next: string;
    nextTime: string;
    currentTimeStr: string;
  } | null>(null);

  useEffect(() => {
    const PRAYER_TIMES = [
      { name: "Subuh", time: "04:42" },
      { name: "Dzuhur", time: "11:58" },
      { name: "Ashar", time: "15:18" },
      { name: "Maghrib", time: "17:50" },
      { name: "Isya", time: "19:02" },
    ];

    const updatePrayerTime = () => {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      const timeToMin = (t: string) => {
        const [h, m] = t.split(":").map(Number);
        return h * 60 + m;
      };

      const subuhMin = timeToMin("04:42");
      const dzuhurMin = timeToMin("11:58");
      const asharMin = timeToMin("15:18");
      const maghribMin = timeToMin("17:50");
      const isyaMin = timeToMin("19:02");

      let current = "Isya";
      let next = "Subuh";
      let nextTime = "04:42";

      if (currentMinutes >= subuhMin && currentMinutes < dzuhurMin) {
        current = "Subuh";
        next = "Dzuhur";
        nextTime = "11:58";
      } else if (currentMinutes >= dzuhurMin && currentMinutes < asharMin) {
        current = "Dzuhur";
        next = "Ashar";
        nextTime = "15:18";
      } else if (currentMinutes >= asharMin && currentMinutes < maghribMin) {
        current = "Ashar";
        next = "Maghrib";
        nextTime = "17:50";
      } else if (currentMinutes >= maghribMin && currentMinutes < isyaMin) {
        current = "Maghrib";
        next = "Isya";
        nextTime = "19:02";
      }

      const pad = (num: number) => String(num).padStart(2, "0");
      const currentTimeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}`;

      setPrayerData({ current, next, nextTime, currentTimeStr });
    };

    updatePrayerTime();
    const interval = setInterval(updatePrayerTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-dvh flex flex-col font-sans">
      <style>{`
        .custom-sidebar {
          width: 240px;
          min-height: 620px;
          background: #fdf8fa;
          border-radius: 16px;
          border: 0.5px solid #edd5e0;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          font-family: inherit;
          box-shadow: 0 2px 12px rgba(180, 100, 130, 0.08);
        }

        /* Brand */
        .brand {
          padding: 18px 16px 14px;
          border-bottom: 0.5px solid #edd5e0;
          background: linear-gradient(135deg, #c9748e 0%, #dda0b4 100%);
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .brand-icon {
          width: 34px; height: 34px;
          background: rgba(255,255,255,0.25);
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 17px;
        }
        .brand-text { color: white; }
        .brand-name { font-size: 15px; font-weight: 500; letter-spacing: 0.3px; font-family: var(--font-playfair-display), serif; }
        .brand-sub { font-size: 9px; opacity: 0.8; letter-spacing: 1.6px; text-transform: uppercase; margin-top: 2px; }

        /* Nav */
        .nav-section { padding: 12px 10px 4px; }
        .nav-label {
          font-size: 9px;
          letter-spacing: 1.8px;
          text-transform: uppercase;
          color: #c48fa8;
          padding: 0 8px;
          margin-bottom: 4px;
          font-weight: 500;
        }
        .nav-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 10px;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.15s;
          position: relative;
          text-decoration: none;
        }
        .nav-item:hover { background: rgba(200, 120, 150, 0.07); }
        .nav-item.active {
          background: rgba(200, 120, 150, 0.11);
          border: 0.5px solid rgba(200, 120, 150, 0.2);
        }
        .nav-icon {
          width: 30px; height: 30px;
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          font-size: 15px;
          flex-shrink: 0;
        }
        .icon-lavender { background: #ede8fb; }
        .icon-rose     { background: #fce8f0; }
        .icon-mint     { background: #e4f5f0; }
        .icon-peach    { background: #fef0e6; }
        .icon-sky      { background: #e8f2fc; }

        .nav-item-text { flex: 1; }
        .nav-item-name { font-size: 13px; color: #5c2f43; font-weight: 600; }
        .nav-item.active .nav-item-name { color: #881337; font-weight: 800; }
        .nav-item-sub { font-size: 10px; color: #9c6c84; margin-top: 1px; }
        .nav-item.active .nav-item-sub { color: #6d1531; font-weight: 600; }

        .badge-new {
          font-size: 9px; font-weight: 500;
          background: #f0b8cc; color: #8c3054;
          padding: 2px 7px; border-radius: 20px;
        }
        .badge-ai {
          font-size: 9px; font-weight: 500;
          background: linear-gradient(90deg, #c5b3f0, #f0b8cc);
          color: #5a3070;
          padding: 2px 7px; border-radius: 20px;
        }

        .divider { height: 0.5px; background: #edd5e0; margin: 8px 16px; }

        /* Prayer card */
        .prayer-section {
          margin: 0 10px 14px;
          background: white;
          border-radius: 12px;
          border: 0.5px solid #edd5e0;
          overflow: hidden;
        }
        .prayer-header {
          background: linear-gradient(90deg, #c9748e, #dda0b4);
          padding: 8px 12px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .prayer-title {
          font-size: 10px; letter-spacing: 1.4px;
          text-transform: uppercase; color: rgba(255,255,255,0.88);
          font-weight: 500;
        }
        .prayer-live {
          display: flex; align-items: center; gap: 4px;
          font-size: 10px; color: #ffe0eb;
        }
        .pulse-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #ffe0eb;
          animation: pulse 1.8s ease-in-out infinite;
        }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.25} }

        .prayer-next {
          padding: 8px 12px 7px;
          border-bottom: 0.5px solid #f5e0e8;
          display: flex; align-items: center; justify-content: space-between;
        }
        .prayer-next-label { font-size: 10px; color: #c498ae; }
        .prayer-next-name  { font-size: 13px; font-weight: 500; color: #a05070; }
        .prayer-next-time  { font-size: 15px; font-weight: 500; color: #a05070; font-variant-numeric: tabular-nums; }

        .prayer-list { padding: 5px 0; }
        .prayer-row {
          display: flex; align-items: center;
          padding: 5px 12px;
          transition: background 0.1s;
          cursor: default;
        }
        .prayer-row:hover { background: #fdf3f7; }
        .prayer-row.current { background: #fce8f0; }
        .prayer-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #e8cdd8; margin-right: 8px; flex-shrink: 0;
        }
        .prayer-row.current .prayer-dot { background: #c9748e; }
        .prayer-name { font-size: 12px; color: #8a6070; flex: 1; }
        .prayer-row.current .prayer-name { color: #a05070; font-weight: 500; }
        .prayer-time { font-size: 12px; color: #b898a8; font-variant-numeric: tabular-nums; }
        .prayer-row.current .prayer-time { color: #a05070; font-weight: 500; }
      `}</style>

      {/* Ambient blobs */}
      <div className="blob blob-1" />
      <div className="blob blob-2" />

      {/* ── TOP HEADER ── */}
      <header
        className="sticky top-0 z-50 border-b"
        style={{
          background: "rgba(255, 255, 255, 0.85)",
          borderColor: "var(--border)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      >
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="animate-float flex-shrink-0">
              <HalalLogo size={36} />
            </div>
            <div className="flex flex-col">
              <span className="font-handwriting text-3xl text-rose-900 leading-none mt-1">
                Halal Habit
              </span>
              <span className="text-[9px] font-serif font-light tracking-[0.2em] text-rose-500 uppercase -mt-0.5">
                Tracker 🎀 Advisor
              </span>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Score badge — hidden on very small screens */}
            <div
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs"
              style={{
                background: "rgba(251, 113, 133, 0.05)",
                border: "1px solid var(--border-lg)",
              }}
            >
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-serif font-bold text-rose-800">Skor Halal</span>
              <span className="font-extrabold text-emerald-700">72</span>
              <span
                className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full border font-serif"
                style={{
                  background: "rgba(4, 120, 87, 0.06)",
                  borderColor: "rgba(4, 120, 87, 0.18)",
                  color: "#047857",
                }}
              >
                Consistent
              </span>
            </div>

            {/* Profile Dropdown */}
            <div style={{ position: "relative" }}>
              {/* Avatar Button */}
              <button
                onClick={() => setShowProfile(!showProfile)}
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center"
                }}
                className="focus:outline-none hover:scale-105 transition-all"
                title="Profil Saya"
              >
                <div
                  className="h-9 w-9 rounded-full flex items-center justify-center shadow-sm"
                  style={{
                    background: "linear-gradient(135deg, #f43f5e, #be123c)",
                    padding: "2px",
                  }}
                >
                  <div
                    className="h-full w-full rounded-full flex items-center justify-center"
                    style={{ background: "var(--bg-dark)" }}
                  >
                    <User className="h-4 w-4" style={{ color: "var(--pink-600)" }} />
                  </div>
                </div>
              </button>

              {/* Dropdown Menu Card */}
              {showProfile && (
                <>
                  {/* Invisible backdrop to dismiss when clicking outside */}
                  <div
                    onClick={() => setShowProfile(false)}
                    style={{
                      position: "fixed",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      zIndex: 998,
                      background: "transparent",
                    }}
                  />
                  
                  <div
                    style={{
                      position: "absolute",
                      right: 0,
                      top: "calc(100% + 12px)",
                      width: "280px",
                      background: "rgba(255, 255, 255, 0.95)",
                      backdropFilter: "blur(20px)",
                      WebkitBackdropFilter: "blur(20px)",
                      border: "1px solid var(--border)",
                      borderRadius: "20px",
                      boxShadow: "var(--shadow-pink)",
                      padding: "20px",
                      zIndex: 999,
                      display: "flex",
                      flexDirection: "column",
                      gap: "16px",
                    }}
                    className="animate-fade-in"
                  >
                    {/* User profile details */}
                    <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                      <div
                        style={{
                          width: "44px",
                          height: "44px",
                          borderRadius: "50%",
                          background: "linear-gradient(135deg, #FFF0F3, #FFE4EC)",
                          border: "1.5px solid #FBCFDB",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "16px",
                          fontWeight: 800,
                          color: "#be123c",
                          fontFamily: "var(--font-playfair-display), serif",
                          flexShrink: 0,
                        }}
                      >
                        {userProfile?.name?.charAt(0).toUpperCase() || "S"}
                      </div>
                      <div style={{ overflow: "hidden" }}>
                        <p style={{ fontWeight: 700, color: "#881337", fontSize: "14px", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden", margin: 0 }}>
                          {userProfile?.name || "Sahabat Sholihah"}
                        </p>
                        <p style={{ fontSize: "11px", color: "#be123c", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden", margin: 0 }}>
                          {userProfile?.email || "user@example.com"}
                        </p>
                      </div>
                    </div>

                    <div style={{ height: "1px", background: "#F5E0EA" }} />

                    {/* Skor Halal Status Tracker */}
                    <div
                      style={{
                        background: "rgba(244, 63, 94, 0.03)",
                        border: "1px dashed rgba(244, 63, 94, 0.15)",
                        borderRadius: "14px",
                        padding: "12px",
                      }}
                    >
                      <p style={{ fontSize: "10px", fontWeight: 800, textTransform: "uppercase", color: "#FB7185", letterSpacing: "0.05em", margin: "0 0 6px 0", fontFamily: "var(--font-playfair-display), serif" }}>
                        Keistiqomahan Harian 🎀
                      </p>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "12px", fontWeight: 600, color: "#8a6070" }}>Skor Halal:</span>
                        <span style={{ fontSize: "12px", fontWeight: 800, color: "#047857" }}>72 (Consistent)</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <button
                        onClick={() => {
                          setShowProfile(false);
                          handleLogout();
                        }}
                        style={{
                          width: "100%",
                          padding: "10px",
                          background: "linear-gradient(135deg, #F472B6 0%, #E11D48 100%)",
                          color: "white",
                          border: "none",
                          borderRadius: "9999px",
                          fontSize: "12px",
                          fontWeight: 700,
                          cursor: "pointer",
                          boxShadow: "0 4px 12px rgba(244,63,94,0.2)",
                          transition: "all 0.2s",
                        }}
                        className="hover:opacity-95"
                      >
                        Keluar Akun 🚪
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ── BODY ── */}
      <div className="flex-1 flex max-w-[1440px] w-full mx-auto px-2 sm:px-6 lg:px-8 relative z-10 py-3 sm:py-5 gap-4 lg:gap-6">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block shrink-0" style={{ width: "240px" }}>
          <div className="custom-sidebar sticky top-24">
            
            {/* Brand */}
            <div className="brand">
              <div className="brand-icon">🌙</div>
              <div className="brand-text">
                <div className="brand-name font-serif">Halal Habit</div>
                <div className="brand-sub">Tracker · Advisor</div>
              </div>
            </div>

            {/* Navigation */}
            <div className="nav-section">
              <div className="nav-label">Menu Utama</div>

              {nav.map(({ name, href, iconClass, colorClass, iconColor, sub, badge }) => {
                const active = pathname === href;
                return (
                  <Link
                    key={name}
                    href={href}
                    className={`nav-item ${active ? "active" : ""}`}
                  >
                    <div className={`nav-icon ${colorClass}`}>
                      <i className={iconClass} style={{ fontSize: "15px", color: iconColor }}></i>
                    </div>
                    <div className="nav-item-text">
                      <div className="nav-item-name font-sans">{name}</div>
                      <div className="nav-item-sub font-sans">{sub}</div>
                    </div>
                    {badge && (
                      <span className={badge === "NEW" ? "badge-new font-sans" : "badge-ai font-sans"}>
                        {badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>

            <div className="divider"></div>

            {/* Prayer Times */}
            <div style={{ padding: "0 10px 14px" }}>
              <div className="nav-label" style={{ padding: "0 8px", marginBottom: "8px" }}>Jadwal Sholat</div>
              <div className="prayer-section">
                <div className="prayer-header">
                  <span className="prayer-title font-sans">Hari Ini</span>
                  <span className="prayer-live font-sans">
                    <span className="pulse-dot"></span>
                    Live
                  </span>
                </div>
                {prayerData ? (
                  <>
                    <div className="prayer-next">
                      <div>
                        <div className="prayer-next-label font-sans">Berikutnya · {prayerData.next}</div>
                        <div className="prayer-next-time font-sans">{prayerData.nextTime}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div className="prayer-next-label font-sans">Sekarang</div>
                        <div className="prayer-next-name font-sans">{prayerData.currentTimeStr}</div>
                      </div>
                    </div>
                    <div className="prayer-list">
                      {[
                        { name: "Subuh", time: "04:42" },
                        { name: "Dzuhur", time: "11:58" },
                        { name: "Ashar", time: "15:18" },
                        { name: "Maghrib", time: "17:50" },
                        { name: "Isya", time: "19:02" },
                      ].map((p) => {
                        const isCurrent = prayerData.current === p.name;
                        return (
                          <div key={p.name} className={`prayer-row ${isCurrent ? "current" : ""}`}>
                            <div className="prayer-dot"></div>
                            <span className="prayer-name font-sans">{p.name}</span>
                            <span className="prayer-time font-sans">{p.time}</span>
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <div className="p-4 text-center text-xs text-rose-300 font-sans">
                    Memuat...
                  </div>
                )}
              </div>
            </div>

          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0 pb-28 lg:pb-0 animate-fade-in">
          {children}
        </main>
      </div>

      {/* ── MOBILE BOTTOM NAV ── */}
      <nav
        className="lg:hidden fixed bottom-4 inset-x-4 z-50 rounded-3xl"
        style={{
          background: "rgba(255, 255, 255, 0.85)",
          border: "1px solid var(--border)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          boxShadow: "0 10px 30px rgba(244, 63, 94, 0.08)",
          padding: "6px 8px",
        }}
      >
        <div className="flex items-center justify-around">
          {nav.map(({ name, href, iconClass, badge }) => {
            const active = pathname === href;
            return (
              <Link
                key={name}
                href={href}
                className="flex flex-col items-center justify-center relative rounded-full transition-all duration-300"
                style={{
                  color: active ? "var(--pink-600)" : "var(--text-muted)",
                  background: active ? "rgba(244, 63, 94, 0.08)" : "transparent",
                  width: "38px",
                  height: "38px",
                  boxShadow: active ? "inset 0 1px 3px rgba(244, 63, 94, 0.05)" : "none",
                }}
                title={name}
              >
                <div className="relative flex items-center justify-center">
                  <i className={iconClass} style={{ color: active ? "var(--pink-600)" : "var(--text-dim)", fontSize: "16px" }} />
                  {badge && (
                    <span
                      className="absolute -top-1.5 -right-1.5 h-2 w-2 rounded-full border border-white"
                      style={{ background: "var(--pink-500)" }}
                    />
                  )}
                </div>
                {active && (
                  <span
                    className="absolute bottom-1 h-1 w-1 rounded-full bg-rose-500 shadow-sm"
                  />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
