"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  TrendingUp, TrendingDown, Award, Flame,
  ChevronRight, CheckCircle2, Sparkles, ArrowUpRight,
  Calendar, Moon, Wallet, HeartHandshake, MessageSquare, Plus, Check
} from "lucide-react";

export default function Dashboard() {
  // State untuk mensimulasikan Mode Haid (True/False) secara interaktif
  const [isMasaHaid, setIsMasaHaid] = useState(false);

  // State untuk Pencatatan Siklus Haid
  const [showLogModal, setShowLogModal] = useState(false);
  const [lastStart, setLastStart] = useState("28 Mei 2026");
  const [cycleLength, setCycleLength] = useState(28);
  const [periodDuration, setPeriodDuration] = useState(7);
  const [notes, setNotes] = useState("");
  const [loggedCycles, setLoggedCycles] = useState([
    { id: 1, start: "28 April 2026", end: "4 Mei 2026", duration: 7, note: "Normal, nyeri hari pertama" },
    { id: 2, start: "31 Maret 2026", end: "6 April 2026", duration: 6, note: "Lancar, minum teh herbal" }
  ]);

  // Date selections state for cycle logger
  const [logDay, setLogDay] = useState("1");
  const [logMonth, setLogMonth] = useState("Juni");
  const [logYear, setLogYear] = useState("2026");

  // Daftar Ibadah Normal (Saat Suci)
  const ibadahNormal = [
    { name: "Sholat 5 Waktu Wajib", progress: 100, done: true },
    { name: "Membaca Al-Qur'an (Tilawah)", progress: 60, done: true },
    { name: "Dzikir Pagi & Petang", progress: 80, done: true },
    { name: "Sedekah Harian Berkah", progress: 100, done: true },
    { name: "Sholat Sunnah Rawatib/Tahajjud", progress: 40, done: false },
  ];

  // Daftar Amalan Pengganti (Saat Masa Haid)
  const amalanHaid = [
    { name: "Dzikir Pagi & Petang", progress: 90, done: true },
    { name: "Mendengarkan Murottal & Tadabbur", progress: 100, done: true },
    { name: "Mendengarkan Kajian Ilmu", progress: 50, done: false },
    { name: "Sedekah Harian Berkah", progress: 100, done: true },
    { name: "Berdoa & Istighfar Sebelum Tidur", progress: 100, done: true },
  ];

  const transactions = [
    { desc: "Beli Vitamin & Suplemen", amount: 85_000, type: "out", tag: "kebutuhan", date: "Hari ini" },
    { desc: "Gaji Freelance UI Design", amount: 1_500_000, type: "in", tag: "halal", date: "Kemarin" },
    { desc: "Belanja Pakaian Impulsif", amount: 350_000, type: "out", tag: "boros", date: "28 Mei" },
    { desc: "Beli Bahan Makanan Mingguan", amount: 120_000, type: "out", tag: "kebutuhan", date: "27 Mei" },
  ];

  const currentIbadahList = isMasaHaid ? amalanHaid : ibadahNormal;

  const fmt = (n: number) =>
    "Rp " + new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(n);

  const scoreValue = isMasaHaid ? 95 : 72; // Haid mode score based on active alternative rewards
  const circumference = 2 * Math.PI * 52;
  const dashOffset = circumference * (1 - scoreValue / 100);

  const handleAddCycleLog = (e: React.FormEvent) => {
    e.preventDefault();
    const formattedDate = `${logDay} ${logMonth} ${logYear}`;
    
    // Calculate end date based on duration
    const formattedEndDate = `${Number(logDay) + periodDuration} ${logMonth} ${logYear}`;

    const newLog = {
      id: Date.now(),
      start: formattedDate,
      end: formattedEndDate,
      duration: periodDuration,
      note: notes || "Tercatat lewat Dashboard"
    };

    setLoggedCycles([newLog, ...loggedCycles]);
    setLastStart(formattedDate);
    setNotes("");
    setShowLogModal(false);
    setIsMasaHaid(true); // Automatically toggle on Haid mode
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", transition: "all 0.5s ease" }}>
      
      {/* ── Top-Right Mode Haid Switcher ── */}
      <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
        <div 
          className="glass-card" 
          style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "12px", 
            padding: "8px 16px", 
            borderRadius: "9999px",
            background: "rgba(255, 255, 255, 0.8)",
            border: "1px solid var(--border)"
          }}
        >
          <span className="text-xs font-bold font-serif text-rose-950">
            {isMasaHaid ? "Mode Haid: Aktif 🩸" : "Mode Haid: Nonaktif ⚪"}
          </span>
          <button
            onClick={() => setIsMasaHaid(!isMasaHaid)}
            style={{
              position: "relative",
              width: "44px",
              height: "24px",
              borderRadius: "9999px",
              background: isMasaHaid ? "#F43F5E" : "#E2E8F0",
              border: "none",
              cursor: "pointer",
              transition: "background-color 0.25s ease",
              padding: "2px",
              display: "flex",
              alignItems: "center"
            }}
            type="button"
            aria-label="Toggle Mode Haid"
          >
            <div
              style={{
                width: "20px",
                height: "20px",
                borderRadius: "50%",
                background: "white",
                transform: isMasaHaid ? "translateX(20px)" : "translateX(0)",
                transition: "transform 0.25s ease",
                boxShadow: "0 1px 3px rgba(0,0,0,0.15)"
              }}
            />
          </button>
        </div>
      </div>

      {/* ── Welcome Banner with Dynamic Haid Toggle ── */}
      <div
        className="glass-card"
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "20px",
          padding: "28px",
          borderRadius: "32px",
          flexWrap: "wrap",
          background: isMasaHaid 
            ? "linear-gradient(135deg, #FFF5F6 0%, #FFF9FA 100%)" 
            : "var(--bg-card)",
          borderColor: isMasaHaid ? "rgba(244, 63, 94, 0.4)" : "var(--border)",
          boxShadow: "var(--shadow-card), var(--shadow-pink)"
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "6px", flex: "1", minWidth: "260px" }}>
          <h1 className="text-2xl sm:text-3xl font-serif text-rose-950 font-bold">
            Assalamualaikum, Sahabat! 👋
          </h1>
          <p className="text-sm font-serif italic" style={{ color: "var(--text-muted)", lineHeight: "1.4" }}>
            {isMasaHaid 
              ? `"Meskipun sedang beristirahat dari ibadah wajib, pintu berkah dan amalan pengganti tetap terbuka lebar." 🌸`
              : `"Mari kelola finansial dengan amanah dan jaga konsistensi ibadah hari ini." 🌸`
            }
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          {/* Interactive Period Toggle */}
          <button
            onClick={() => setIsMasaHaid(!isMasaHaid)}
            style={{
              padding: "10px 20px",
              borderRadius: "9999px",
              fontSize: "12px",
              fontWeight: 800,
              fontFamily: "var(--font-playfair-display), serif",
              cursor: "pointer",
              transition: "all 0.25s",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: isMasaHaid 
                ? "linear-gradient(135deg, #E11D48 0%, #BE123C 100%)" 
                : "white",
              color: isMasaHaid ? "white" : "#BE123C",
              border: isMasaHaid ? "none" : "1px solid #FDA4AF",
              boxShadow: isMasaHaid ? "0 4px 15px rgba(225, 29, 72, 0.3)" : "none"
            }}
            className="hover:scale-105"
          >
            <Calendar size={14} />
          </button>
        </div>
      </div>

      {/* ── 4 Top Metric Cards Grid ── */}
      <div 
        style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", 
          gap: "20px" 
        }}
      >
        {/* Card 1: Saldo */}
        <div className="glass-card" style={{ padding: "24px", borderRadius: "24px", display: "flex", flexDirection: "column", gap: "8px" }}>
          <p className="text-xs font-bold font-serif" style={{ color: "var(--text-muted)" }}>Saldo Bulan Ini</p>
          <p className="text-2xl font-extrabold font-serif" style={{ color: "var(--text-main)", margin: "4px 0" }}>Rp 3.500.000</p>
          <div>
            <span
              className="text-[10px] font-extrabold px-3 py-1 rounded-full"
              style={{
                background: "rgba(16,185,129,0.08)",
                color: "#047857",
                border: "1px solid rgba(16,185,129,0.18)",
              }}
            >
              <TrendingUp size={10} style={{ display: "inline", marginRight: "4px", marginTop: "-2px" }} />
              +12,5%
            </span>
          </div>
        </div>

        {/* Card 2: Pengeluaran */}
        <div className="glass-card" style={{ padding: "24px", borderRadius: "24px", display: "flex", flexDirection: "column", gap: "8px" }}>
          <p className="text-xs font-bold font-serif" style={{ color: "var(--text-muted)" }}>Pengeluaran</p>
          <p className="text-2xl font-extrabold font-serif" style={{ color: "var(--text-main)", margin: "4px 0" }}>Rp 2.100.000</p>
          <div>
            <span
              className="text-[10px] font-extrabold px-3 py-1 rounded-full"
              style={{
                background: "rgba(244,63,94,0.06)",
                color: "var(--pink-600)",
                border: "1px solid rgba(244,63,94,0.15)",
              }}
            >
              <TrendingDown size={10} style={{ display: "inline", marginRight: "4px", marginTop: "-2px" }} />
              -4,2%
            </span>
          </div>
        </div>



        {/* Card 4: Halal Score / Siklus Status */}
        <Link href="/siklus" style={{ textDecoration: "none", color: "inherit" }} className="hover:scale-[1.02] transition-transform">
          <div className="glass-card" style={{ padding: "24px", borderRadius: "24px", display: "flex", flexDirection: "row", alignItems: "center", gap: "16px", height: "100%" }}>
            <div className="relative flex items-center justify-center w-16 h-16 flex-shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path className="text-slate-100" strokeWidth="3" stroke="rgba(244,63,94,0.06)" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className={isMasaHaid ? "text-rose-500" : "text-pink-500"} strokeDasharray={isMasaHaid ? "15, 100" : "72, 100"} strokeWidth="3" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              </svg>
              <div className="absolute text-center flex flex-col" style={{ position: "absolute", display: "flex", flexDirection: "column", alignItems: "center", justifyItems: "center", justifyContent: "center" }}>
                <span className="text-sm font-extrabold text-slate-900">{isMasaHaid ? "H-3" : "72"}</span>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">
                {isMasaHaid ? "Siklus Haid" : "Halal Score"}
              </span>
              <span className="text-xs font-bold" style={{ color: isMasaHaid ? "#F43F5E" : "var(--pink-600)" }}>
                {isMasaHaid ? "Fase Menstruasi" : "Good Condition"}
              </span>
              <p className="text-[9px] text-slate-400" style={{ lineHeight: "1.2" }}>
                {isMasaHaid ? "Kalkulasi puasa qadha aktif" : "Kepatuhan pekan ini"}
              </p>
            </div>
          </div>
        </Link>
      </div>

      {/* ── Menstrual Cycle Tracker & Log Card (Pencatatan Siklus Haid) ── */}
      <div className="glass-card" style={{ padding: "28px", borderRadius: "32px", borderLeft: isMasaHaid ? "5px solid #F43F5E" : "1px solid var(--border)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", marginBottom: "20px" }}>
          <div>
            <h2 className="font-bold text-lg text-slate-900 flex items-center gap-2 font-serif">
              <span>🩸</span> Jurnal & Pencatatan Siklus Menstruasi
            </h2>
            <p className="text-xs text-slate-400">Pantau siklus bulanan, kalkulasi qadha puasa, dan jaga kesehatan reproduksi</p>
          </div>
          
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            <Link
              href="/siklus"
              style={{
                padding: "8px 18px",
                borderRadius: "9999px",
                fontSize: "11px",
                fontWeight: 800,
                fontFamily: "var(--font-playfair-display), serif",
                cursor: "pointer",
                background: "rgba(244, 63, 94, 0.05)",
                border: "1px solid var(--border-lg)",
                color: "#be123c",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                transition: "all 0.2s",
                textDecoration: "none"
              }}
              className="hover:bg-rose-50 hover:scale-105"
            >
              Buka Jurnal Lengkap ↗
            </Link>

            <button
              onClick={() => setShowLogModal(true)}
              style={{
                padding: "8px 18px",
                borderRadius: "9999px",
                fontSize: "11px",
                fontWeight: 800,
                fontFamily: "var(--font-playfair-display), serif",
                cursor: "pointer",
                background: "linear-gradient(135deg, #F43F5E 0%, #E11D48 100%)",
                color: "white",
                border: "none",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                boxShadow: "0 3px 10px rgba(244, 63, 94, 0.2)"
              }}
              className="hover:scale-105 transition"
            >
              <Plus size={12} />
              Catat Siklus Baru ✏️
            </button>
          </div>
        </div>

        {/* Modal Catat Siklus Baru */}
        {showLogModal && (
          <div style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(0,0,0,0.3)", backdropFilter: "blur(4px)",
            display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999,
            padding: "16px"
          }}>
            <form onSubmit={handleAddCycleLog} className="glass-card animate-fade-in" style={{
              background: "white", padding: "28px", borderRadius: "28px",
              maxWidth: "400px", width: "100%", display: "flex", flexDirection: "column", gap: "20px"
            }}>
              <div>
                <h3 className="font-serif text-lg font-bold text-rose-950">Catat Siklus Haid Baru 🩸</h3>
                <p className="text-xs text-slate-400">Mencatat awal menstruasi hari ini untuk otomatisasi tracking amalan & puasa</p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label className="text-xs font-bold text-rose-900 font-serif">Pilih Tanggal Mulai</label>
                <div style={{ display: "flex", gap: "8px" }}>
                  <select
                    value={logDay}
                    onChange={(e) => setLogDay(e.target.value)}
                    className="input-pink text-xs"
                    style={{ flex: 1, borderRadius: "12px", padding: "8px" }}
                  >
                    {Array.from({ length: 31 }, (_, i) => String(i + 1)).map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                  <select
                    value={logMonth}
                    onChange={(e) => setLogMonth(e.target.value)}
                    className="input-pink text-xs"
                    style={{ flex: 2, borderRadius: "12px", padding: "8px" }}
                  >
                    {["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"].map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                  <select
                    value={logYear}
                    onChange={(e) => setLogYear(e.target.value)}
                    className="input-pink text-xs"
                    style={{ flex: 1.5, borderRadius: "12px", padding: "8px" }}
                  >
                    {["2024", "2025", "2026", "2027"].map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label className="text-xs font-bold text-rose-900 font-serif">Rata-rata Durasi (Hari)</label>
                <input
                  type="number"
                  min="3" max="15"
                  value={periodDuration}
                  onChange={(e) => setPeriodDuration(Number(e.target.value))}
                  className="input-pink"
                  style={{ borderRadius: "12px" }}
                  required
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label className="text-xs font-bold text-rose-900 font-serif">Catatan Gejala / Mood</label>
                <input
                  type="text"
                  placeholder="Contoh: Kram ringan, lelah"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="input-pink"
                  style={{ borderRadius: "12px" }}
                />
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="btn-pink"
                  style={{ flex: 1, background: "white", color: "var(--pink-700)", border: "1px solid var(--border)", boxShadow: "none" }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn-pink"
                  style={{ flex: 1 }}
                >
                  Simpan Catatan
                </button>
              </div>
            </form>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "24px" }}>
          {/* Status Tracker */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ background: "rgba(244, 63, 94, 0.03)", border: "1px solid rgba(244, 63, 94, 0.12)", padding: "16px", borderRadius: "20px", display: "flex", flexDirection: "column", gap: "8px" }}>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Siklus Terakhir Dimulai</span>
              <p className="text-sm font-bold text-rose-950 font-serif">{lastStart}</p>
              <div style={{ borderTop: "1px solid rgba(244, 63, 94, 0.08)", paddingTop: "8px", display: "flex", justifyContent: "space-between", fontSize: "11px" }}>
                <span className="text-slate-500">Estimasi Selesai:</span>
                <span className="font-bold text-rose-700">Dalam {periodDuration} Hari</span>
              </div>
            </div>
            <div style={{ display: "flex", gap: "12px" }}>
              <div style={{ flex: 1, padding: "12px", border: "1px solid var(--border)", borderRadius: "16px", textAlign: "center" }}>
                <p className="text-xs text-slate-400">Panjang Siklus</p>
                <p className="text-base font-bold font-serif text-slate-800" style={{ marginTop: "4px" }}>{cycleLength} Hari</p>
              </div>
              <div style={{ flex: 1, padding: "12px", border: "1px solid var(--border)", borderRadius: "16px", textAlign: "center" }}>
                <p className="text-xs text-slate-400">Rata-rata Haid</p>
                <p className="text-base font-bold font-serif text-slate-800" style={{ marginTop: "4px" }}>{periodDuration} Hari</p>
              </div>
            </div>
          </div>

          {/* Riwayat Log Siklus */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <span className="text-xs font-bold text-slate-500 font-serif">Riwayat 3 Bulan Terakhir 🗓️</span>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "150px", overflowY: "auto" }}>
              {loggedCycles.map((cycle) => (
                <div key={cycle.id} style={{ display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "space-between", padding: "10px 14px", background: "rgba(0,0,0,0.01)", border: "1px solid rgba(0,0,0,0.03)", borderRadius: "14px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                    <span className="text-xs font-bold text-slate-700 font-serif">{cycle.start} - {cycle.end.split(" ")[0]}</span>
                    <span className="text-[10px] text-slate-400 italic">{cycle.note}</span>
                  </div>
                  <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-100 shrink-0">
                    {cycle.duration} Hari
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Grid ── */}
      <div 
        className="grid grid-cols-1 lg:grid-cols-3" 
        style={{ gap: "24px" }}
      >
        {/* Left — Tracker (Ibadah / Amalan Pengganti) + Transactions */}
        <div className="lg:col-span-2" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

          {/* Ibadah / Amalan Checklist Card */}
          <div className="glass-card" style={{ padding: "28px", borderRadius: "32px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "20px" }}>
              <div>
                <h2 className="font-bold text-lg text-slate-900 flex items-center gap-2 font-serif">
                  <span>{isMasaHaid ? "🌸" : "✨"}</span>
                  {isMasaHaid ? "Amalan Pengganti Wanita Haid" : "Daily Ibadah Tracker"}
                </h2>
                <p className="text-xs text-slate-400">
                  {isMasaHaid ? "Maksimalkan pahala lewat amalan alternatif selama masa berhalangan" : "Pantau konsistensi ibadah wajib dan sunnah harian"}
                </p>
              </div>
              
              <span
                className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider"
                style={{
                  background: isMasaHaid ? "rgba(244,63,94,0.06)" : "rgba(236,72,153,0.06)",
                  color: isMasaHaid ? "var(--pink-600)" : "var(--purple-600)",
                  border: isMasaHaid ? "1px solid rgba(244,63,94,0.15)" : "1px solid rgba(236,72,153,0.15)"
                }}
              >
                {isMasaHaid ? "Period Mode" : "Normal Mode"}
              </span>
            </div>

            {/* Dynamic Alert Banner */}
            <div
              style={{
                padding: "14px 18px",
                borderRadius: "16px",
                fontSize: "12px",
                lineHeight: "1.5",
                display: "flex",
                alignItems: "start",
                gap: "10px",
                background: isMasaHaid ? "rgba(244, 63, 94, 0.04)" : "rgba(245, 158, 11, 0.05)",
                border: isMasaHaid ? "1px solid rgba(244, 63, 94, 0.15)" : "1px solid rgba(245, 158, 11, 0.15)",
                color: isMasaHaid ? "#9F1239" : "#B45309",
                marginBottom: "20px"
              }}
            >
              <span style={{ fontSize: "16px", marginTop: "-2px" }}>💡</span>
              {isMasaHaid ? (
                <p>Sedang dalam masa berhalangan? Jaga tubuh tetap fit terhidrasi, konsumsi makanan bergizi, dan optimalkan <span style={{ fontWeight: "700" }}>Dzikir Pagi Petang &amp; Berdoa</span> ya!</p>
              ) : (
                <p>Pengeluaran minggu ini naik <span style={{ fontWeight: "700" }}>12%</span> — yuk tingkatkan dzikir harian &amp; tahan nafsu belanja impulsif agar terus istiqomah!</p>
              )}
            </div>

            {/* Dynamic Checklist List */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {currentIbadahList.map((item, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "14px 18px",
                    borderRadius: "20px",
                    background: item.done ? "rgba(244,63,94,0.04)" : "rgba(255,255,255,0.4)",
                    border: `1px solid ${item.done ? "var(--border-lg)" : "var(--border)"}`,
                    transition: "all 0.2s"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", maxWidth: "75%", width: "100%" }}>
                    <CheckCircle2
                      className="h-5 w-5 flex-shrink-0"
                      style={{ color: item.done ? (isMasaHaid ? "#F43F5E" : "var(--pink-600)") : "var(--text-dim)" }}
                      fill={item.done ? (isMasaHaid ? "rgba(244,63,94,0.12)" : "rgba(236,72,153,0.12)") : "none"}
                    />
                    <span className="text-xs font-bold font-serif truncate" style={{ color: item.done ? "var(--text-main)" : "var(--text-muted)" }}>
                      {item.name}
                    </span>
                  </div>
                  
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", justifyContent: "end" }}>
                    <div className="hidden sm:block" style={{ width: "96px", height: "6px", background: "rgba(0,0,0,0.06)", borderRadius: "99px", overflow: "hidden" }}>
                      <div 
                        style={{ 
                          height: "100%", 
                          borderRadius: "99px", 
                          background: isMasaHaid ? "linear-gradient(90deg, #F43F5E, #FDA4AF)" : "linear-gradient(90deg, var(--pink-500), var(--purple-500))",
                          width: `${item.progress}%` 
                        }} 
                      />
                    </div>
                    <span className="text-[11px] font-bold text-slate-500 tracking-wider" style={{ width: "32px", textAlign: "right" }}>{item.progress}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="glass-card" style={{ padding: "28px", borderRadius: "32px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div>
                <h3 className="font-bold text-sm font-serif" style={{ color: "var(--text-main)" }}>Transaksi Terbaru</h3>
                <p className="text-[10px] font-serif mt-0.5" style={{ color: "var(--text-dim)" }}>M03 — Keuangan Syariah</p>
              </div>
              <Link href="/keuangan" className="flex items-center gap-1 text-xs font-bold hover:underline font-serif" style={{ color: "var(--pink-600)" }}>
                Catat <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
              {transactions.map((tx, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "space-between", padding: "14px 0", gap: "16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <div
                      className="h-10 w-10 rounded-full flex items-center justify-center shrink-0 border"
                      style={{
                        background: tx.type === "in"
                          ? "rgba(16,185,129,0.08)"
                          : "rgba(244,63,94,0.06)",
                        borderColor: tx.type === "in"
                          ? "rgba(16,185,129,0.18)"
                          : "rgba(244,63,94,0.12)"
                      }}
                    >
                      {tx.type === "in"
                        ? <TrendingUp className="h-4.5 w-4.5" style={{ color: "#047857" }} />
                        : <TrendingDown className="h-4.5 w-4.5" style={{ color: "var(--pink-600)" }} />
                      }
                    </div>
                    <div>
                      <p className="text-sm font-bold font-serif" style={{ color: "var(--text-main)" }}>{tx.desc}</p>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                        <span className="text-[10px]" style={{ color: "var(--text-dim)" }}>{tx.date}</span>
                        <span 
                          className="text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase"
                          style={
                            tx.tag === "halal" 
                              ? { background: "rgba(16,185,129,0.08)", color: "#047857", border: "1px solid rgba(16,185,129,0.18)" }
                              : tx.tag === "kebutuhan"
                              ? { background: "rgba(59,130,246,0.08)", color: "#1d4ed8", border: "1px solid rgba(59,130,246,0.18)" }
                              : { background: "rgba(244,63,94,0.06)", color: "var(--pink-600)", border: "1px solid rgba(244,63,94,0.15)" }
                          }
                        >
                          {tx.tag}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span
                    className="text-sm font-extrabold font-serif shrink-0"
                    style={{ color: tx.type === "in" ? "#047857" : "var(--text-main)" }}
                  >
                    {tx.type === "in" ? "+" : "-"}{fmt(tx.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right — Breakdown & AI Fiqih Advisor */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px", height: "100%" }}>
          
          {/* Breakdown Indeks Komponen Skor */}
          <div className="glass-card" style={{ padding: "28px", borderRadius: "32px" }}>
            <div>
              <h2 className="font-bold text-sm font-serif text-rose-950">Rincian Indeks Komponen</h2>
              <p className="text-[10px] text-slate-400">Pilar penilaian gaya hidup muslimah amanah &amp; berkah</p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "20px" }}>
              {/* Komponen 1 */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", fontWeight: 700 }}>
                  <span className="text-slate-600">Kedisiplinan Finansial</span>
                  <span className="text-rose-900">32.5 <span className="text-slate-400">/ 40</span></span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-pink-400 to-pink-500 h-full rounded-full" style={{ width: "81.25%" }}></div>
                </div>
              </div>

              {/* Komponen 2 */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", fontWeight: 700 }}>
                  <span className="text-slate-600">Kepatuhan Transaksi Syariah</span>
                  <span className="text-rose-900">20 <span className="text-slate-400">/ 30</span></span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-purple-400 to-purple-500 h-full rounded-full" style={{ width: "66.6%" }}></div>
                </div>
              </div>

              {/* Komponen 3 */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", fontWeight: 700 }}>
                  <span className="text-slate-600">Ketaatan &amp; Istiqomah</span>
                  <span className="text-rose-900">{isMasaHaid ? "28.5" : "19.5"} <span className="text-slate-400">/ 30</span></span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500" 
                    style={{ 
                      width: isMasaHaid ? "95%" : "65%",
                      background: isMasaHaid 
                        ? "linear-gradient(90deg, #F43F5E, #FDA4AF)" 
                        : "linear-gradient(90deg, #2DD4BF, #0D9488)"
                    }} 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Mini Chart Mockup */}
          <div className="glass-card" style={{ padding: "24px", borderRadius: "24px", display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <TrendingUp className="h-4.5 w-4.5 text-pink-500" />
              <span className="text-xs font-bold text-slate-700 font-serif">Analisis Siklus Finansial (7 Hari)</span>
            </div>
            <div style={{ height: "112px", background: "linear-gradient(to bottom, var(--pink-50)/10, white)", border: "1px dashed var(--border-lg)", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <p className="text-[10px] text-slate-400 font-bold tracking-wider font-serif">[ Chart.js - Tren Pengeluaran &amp; Zakat ]</p>
            </div>
          </div>

          {/* AI Advisor Widget with Light Premium Theme matching Siklus page */}
          <div
            className="glass-card"
            style={{ 
              padding: "32px", 
              borderRadius: "32px",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              background: "linear-gradient(135deg, #fff5f8 0%, #fdf0f4 50%, #f5ebf7 100%)",
              borderColor: "var(--border)",
              position: "relative",
              overflow: "hidden",
              boxShadow: "var(--shadow-card), var(--shadow-pink)",
              flexGrow: 1
            }}
          >
            <div
              className="absolute -top-10 -right-10 w-32 h-32 rounded-full"
              style={{ background: "radial-gradient(circle, rgba(232,116,138,0.15) 0%, transparent 70%)", filter: "blur(20px)", pointerEvents: "none" }}
            />

            <div className="flex items-center gap-2.5 relative" style={{ zIndex: 1 }}>
              <div
                className="h-9 w-9 rounded-full flex items-center justify-center shadow-sm animate-float"
                style={{ background: "linear-gradient(135deg, #f43f5e, #be123c)", boxShadow: "0 4px 15px rgba(244,63,94,0.25)" }}
              >
                <Sparkles className="h-4.5 w-4.5 text-white" />
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <p className="font-extrabold text-sm font-serif text-rose-950">AI Advisor Fiqih &amp; Finansial</p>
                <p className="text-[9px] font-extrabold font-serif uppercase tracking-wider text-rose-500">
                  Claude-Sonnet Engine
                </p>
              </div>
            </div>

            <blockquote
              className="text-[13px] leading-relaxed relative font-serif text-rose-900/90"
              style={{
                padding: "22px 24px",
                background: "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)",
                border: "1px solid rgba(232, 116, 138, 0.15)",
                borderRadius: "24px",
                zIndex: 1,
                boxShadow: "0 4px 20px -2px rgba(232,116,138,0.05), inset 0 2px 4px rgba(255,255,255,0.9)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                flexGrow: 1,
                minHeight: "120px"
              }}
            >
              <span className="italic leading-relaxed">
                {isMasaHaid 
                  ? "“Alhamdulillah, pencatatan siklusmu rapi. Flek kecoklatan yang muncul di luar rentang kebiasaan haid tidak menggugurkan kewajiban ibadah menurut Jumhur Ulama. Tetap istiqomah berdzikir ya! 🌸”"
                  : "“Hai Sahabat! Alhamdulillah pengeluaran halalmu terjaga di angka 81% minggu ini 💚 Waspadai pengeluaran emosional menjelang siklus bulanan berikutnya agar tabungan qadha puasa dan zakat tetap aman!”"
                }
              </span>
            </blockquote>

            {/* Fiqih Query Suggestions */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", zIndex: 1, marginTop: "auto" }}>
              <Link
                href="/ai-advisor"
                className="w-full bg-white/90 border border-rose-200/80 rounded-2xl px-4 py-3.5 text-xs text-rose-950 shadow-sm transition-all hover:border-rose-300 hover:bg-white flex items-center justify-between"
              >
                <span className="text-rose-400 font-serif">
                  {isMasaHaid ? "Tanya Fiqih Wanita di AI Advisor..." : "Konsultasi Syariah & Finansial di AI Advisor..."}
                </span>
                <span 
                  className="p-1.5 rounded-xl text-white shadow-sm flex items-center justify-center"
                  style={{ background: isMasaHaid ? "#E11D48" : "var(--pink-600)" }}
                >
                  <MessageSquare size={14} />
                </span>
              </Link>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "2px" }}>
                <Link href="/ai-advisor" className="text-[10px] bg-white/90 border border-rose-100 px-3 py-1.5 rounded-full text-rose-800 font-serif cursor-pointer hover:bg-rose-50 hover:border-rose-200 transition-all duration-200 shadow-sm">🩸 Bedakan Haid &amp; Istihadah</Link>
                <Link href="/ai-advisor" className="text-[10px] bg-white/90 border border-rose-100 px-3 py-1.5 rounded-full text-rose-800 font-serif cursor-pointer hover:bg-rose-50 hover:border-rose-200 transition-all duration-200 shadow-sm">✨ Tips Mengelola PMS Impulsive Buying</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
