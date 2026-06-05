"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { getLocalItem, setLocalItem, removeLocalItem } from "@/lib/storage";

/* ─── Main Page ──────────────────────────────────────────────────────────── */
export default function JurnalSiklusPage() {
  const [supabase] = useState(() => createClient());
  const [userId, setUserId] = useState<string | null>(null);

  const [amalans, setAmalans] = useState([
    { name: "Sholat Subuh Berjamaah / Tepat Waktu", cat: "Sholat Fardhu", pts: 5, done: false },
    { name: "Sholat Dzuhur", cat: "Sholat Fardhu", pts: 5, done: false },
    { name: "Sholat Ashar", cat: "Sholat Fardhu", pts: 5, done: false },
    { name: "Sholat Maghrib", cat: "Sholat Fardhu", pts: 5, done: false },
    { name: "Sholat Isya", cat: "Sholat Fardhu", pts: 5, done: false },
    { name: "Membaca Al-Qur'an 1 Halaman", cat: "Amalan Tilawah", pts: 5, done: false },
    { name: "Membaca Dzikir Pagi & Petang", cat: "Alternatif Haid", pts: 5, done: false },
    { name: "Mendengarkan Murottal 15 Menit", cat: "Alternatif Haid", pts: 5, done: false },
    { name: "Kajian Islam / Fiqh Perempuan", cat: "Alternatif Haid", pts: 5, done: false },
    { name: "Sedekah / Infaq Hari Ini", cat: "Amalan Sosial", pts: 5, done: false },
  ]);

  // React State for interactive Flo-style inputs:
  const [lastPeriodStart, setLastPeriodStart] = useState<number | null>(null); // e.g. June 1
  const [cycleLength, setCycleLength] = useState<number>(28);       // e.g. 28 days
  const [periodLength, setPeriodLength] = useState<number>(6);       // e.g. 6 days

  useEffect(() => {
    const loadState = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);

        // Load cycle parameters from Supabase
        const { data: stateData } = await supabase
          .from("syariah_user_states")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();
        if (stateData) {
          if (stateData.cycle_last_period_start !== null) setLastPeriodStart(stateData.cycle_last_period_start);
          if (stateData.cycle_length !== null) setCycleLength(stateData.cycle_length);
          if (stateData.cycle_period_length !== null) setPeriodLength(stateData.cycle_period_length);
        }

        // Load today's cycle amalan logs from Supabase (filtered by user_id)
        const { data: logData } = await supabase
          .from("syariah_ibadah_logs")
          .select("checked_amalans")
          .eq("user_id", user.id)
          .eq("date", "siklus-2026-06-01")
          .maybeSingle();
        if (logData && logData.checked_amalans) {
          const checkedSet = new Set(logData.checked_amalans);
          setAmalans(prev => prev.map((a, idx) => ({
            ...a,
            done: checkedSet.has(`amalan-${idx}`)
          })));
        }
      } else {
        // Fallback to local storage for sliders
        const savedStart = getLocalItem("siklus-lastPeriodStart");
        const savedLength = getLocalItem("siklus-cycleLength");
        const savedPeriod = getLocalItem("siklus-periodLength");
        if (savedStart) setLastPeriodStart(Number(savedStart));
        if (savedLength) setCycleLength(Number(savedLength));
        if (savedPeriod) setPeriodLength(Number(savedPeriod));

        // Fallback to local storage for amalans
        const savedAmalans = getLocalItem("siklus-amalans");
        if (savedAmalans) setAmalans(JSON.parse(savedAmalans));
      }
    };
    loadState();
  }, [supabase]);

  const updateCycleSettings = async (start: number | null, cycle: number, period: number) => {
    if (userId) {
      await supabase.from("syariah_user_states").upsert({
        user_id: userId,
        cycle_last_period_start: start,
        cycle_length: cycle,
        cycle_period_length: period
      }, { onConflict: "user_id" });
    } else {
      if (start === null) {
        removeLocalItem("siklus-lastPeriodStart");
      } else {
        setLocalItem("siklus-lastPeriodStart", start.toString());
      }
      setLocalItem("siklus-cycleLength", cycle.toString());
      setLocalItem("siklus-periodLength", period.toString());
    }
  };

  const toggleAmalan = async (i: number) => {
    const updatedAmalans = amalans.map((a, idx) => idx === i ? { ...a, done: !a.done } : a);
    setAmalans(updatedAmalans);

    if (userId) {
      const checkedIds = updatedAmalans
        .map((a, idx) => a.done ? `amalan-${idx}` : null)
        .filter((id): id is string => id !== null);
      await supabase.from("syariah_ibadah_logs").upsert({
        user_id: userId,
        date: "siklus-2026-06-01",
        checked_amalans: checkedIds
      }, { onConflict: "user_id,date" });
    } else {
      setLocalItem("siklus-amalans", JSON.stringify(updatedAmalans));
    }
  };

  // Calendar setup (Juni 2026 starts Monday)
  const firstDay = 1; // 0=Sun, 1=Mon
  const daysInMonth = 30;
  const today = 1;

  // Compute dynamic sets of days:
  const haidDays = new Set<number>();
  const suburDays = new Set<number>();
  const suciDays = new Set<number>();

  let nextPeriodStart = 0;

  if (lastPeriodStart !== null) {
    // 1. Current period days
    for (let i = 0; i < periodLength; i++) {
      const day = lastPeriodStart + i;
      if (day <= daysInMonth && day > 0) haidDays.add(day);
    }

    // 2. Next period days (predicted)
    nextPeriodStart = lastPeriodStart + cycleLength;
    for (let i = 0; i < periodLength; i++) {
      const day = nextPeriodStart + i;
      if (day <= daysInMonth && day > 0) haidDays.add(day);
    }

    // 3. Fertile window (12 to 16 days before next period start)
    const ovulationDay = nextPeriodStart - 14;
    for (let i = -2; i <= 2; i++) {
      const day = ovulationDay + i;
      if (day > 0 && day <= daysInMonth && !haidDays.has(day)) {
        suburDays.add(day);
      }
    }
  }

  // 4. Suci days (all others)
  for (let d = 1; d <= daysInMonth; d++) {
    if (!haidDays.has(d) && !suburDays.has(d)) {
      suciDays.add(d);
    }
  }

  function getDayType(d: number): "today" | "haid" | "subur" | "suci" | "normal" {
    if (d === today) return "today";
    if (haidDays.has(d)) return "haid";
    if (suburDays.has(d)) return "subur";
    if (suciDays.has(d)) return "suci";
    return "normal";
  }

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const doneCount = amalans.filter(a => a.done).length;
  const progressPersen = Math.round((doneCount / amalans.length) * 100);
  const totalPoints = amalans.length * 5;
  const earnedPoints = doneCount * 5;

  // Dynamic values based on checklist checkboxes:
  const sholatChecked = amalans.slice(0, 5).filter(a => a.done).length;
  const sholatProgress = Math.round((sholatChecked / 5) * 100);

  const quranChecked = amalans[5].done;
  const quranProgress = quranChecked ? 100 : 0;

  const dzikirChecked = amalans[6].done;
  const dzikirProgress = dzikirChecked ? 100 : 0;

  const murottalChecked = amalans[7].done;
  const murottalProgress = murottalChecked ? 100 : 0;

  // Chart data
  const chartDays = [
    { label: 'Sen', pct: progressPersen, haid: getDayType(today) === "haid" },
    { label: 'Sel', pct: 0, haid: false },
    { label: 'Rab', pct: 0, haid: false },
    { label: 'Kam', pct: 0, haid: false },
    { label: 'Jun', pct: 0, haid: false },
    { label: 'Sab', pct: 0, haid: false },
    { label: 'Ahd', pct: 0, haid: false },
  ];

  return (
    <div className="page-container w-full min-h-screen pb-12">
      <style>{`
        .page-container {
          --pink:       #f472b6;
          --rose:       #fbcfe8;
          --soft-purple: #c084fc;
          --lavender:   #f3e8ff;
          --mauve:      #f5f3ff;
          --bg:         transparent;
          --sidebar-bg: rgba(255, 245, 248, 0.85);
          --card-bg:    rgba(255, 255, 255, 0.85);
          --text:       #4c1d30;
          --muted:      #9f7385;
          --border:     #fbcfe8;

          /* AI Advisor palette — soft teal/sage */
          --ai-bg:    #1e2d35;
          --ai-accent:#7ecdc8;
          --ai-glow:  #4fb8b2;
          
          font-family: var(--font-quicksand), var(--font-jakarta), system-ui, sans-serif;
          color: var(--text);
        }

        .content {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 24px;
          min-height: 0;
          max-width: 1440px;
          margin: 0 auto;
        }

        .left-col {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .right-col {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .page-title {
          text-align: center;
          margin-bottom: 28px;
        }
        
        .page-title h1 {
          font-family: var(--font-playfair-display), serif;
          font-size: 32px;
          font-weight: 700;
          color: #881337;
          letter-spacing: -0.5px;
        }
        
        .page-title p {
          font-size: 13px;
          color: var(--muted);
          margin-top: 6px;
          font-weight: 500;
        }

        /* ── CALENDAR ── */
        .card {
          background: var(--card-bg);
          backdrop-filter: blur(8px);
          border: 1px solid var(--border);
          border-radius: 24px;
          padding: 24px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.01), 0 10px 30px rgba(244,114,182,0.04);
        }

        .cal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .cal-month {
          font-family: var(--font-playfair-display), serif;
          font-size: 17px;
          font-weight: 700;
          color: #881337;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .cal-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 6px;
          text-align: center;
        }

        .cal-day-name {
          font-size: 11px;
          font-weight: 700;
          color: var(--muted);
          padding: 4px 0;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .cal-day {
          width: 34px;
          height: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 700;
          border-radius: 50%;
          cursor: pointer;
          transition: all .15s;
          color: var(--text);
          background: transparent;
          border: none;
          flex-shrink: 0;
        }

        .cal-day:hover { background: var(--lavender); }
        .cal-day.today { background: var(--pink); color: #fff; font-weight: 600; }
        .cal-day.haid { background: #fde8ee; color: var(--pink); border: 1px solid var(--rose); }
        .cal-day.suci { background: #e8f5ee; color: #5a9a78; border: 1px solid #a8d8bc; }
        .cal-day.subur { background: #f3e8ff; color: #a855f7; border: 1px solid #d8b4fe; }
        .cal-day.empty { pointer-events: none; }

        .cal-legend {
          display: flex;
          gap: 20px;
          margin-top: 16px;
          flex-wrap: wrap;
          padding-top: 12px;
          border-top: 1px solid var(--border);
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11.5px;
          color: var(--muted);
        }

        .legend-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }

        /* ── AMALAN ── */
        .amalan-card {
          background: var(--card-bg);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.02), 0 4px 16px rgba(232,116,138,0.04);
          display: flex;
          flex-direction: column;
        }

        .amalan-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 6px;
        }

        .amalan-title {
          font-family: var(--font-playfair-display), serif;
          font-size: 17px;
          font-weight: 700;
          color: #881337;
        }

        .amalan-pts {
          font-size: 14px;
          font-weight: 600;
          color: var(--soft-purple);
        }

        .amalan-sub {
          font-size: 11.5px;
          color: var(--muted);
          margin-bottom: 16px;
        }

        .progress-bar-wrap {
          height: 6px;
          background: var(--border);
          border-radius: 4px;
          margin-bottom: 18px;
          overflow: hidden;
        }

        .progress-bar {
          height: 100%;
          border-radius: 4px;
          background: linear-gradient(90deg, var(--pink), var(--soft-purple));
          transition: width 0.3s ease;
        }

        .amalan-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
          max-height: 400px;
          overflow-y: auto;
          padding-right: 6px;
        }

        .amalan-list::-webkit-scrollbar {
          width: 3px;
        }

        .amalan-list::-webkit-scrollbar-thumb {
          background: var(--border);
          border-radius: 4px;
        }

        .amalan-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 14px;
          border-radius: 12px;
          background: #fdf8fb;
          border: 1px solid transparent;
          transition: all .15s;
          text-align: left;
          width: 100%;
          cursor: pointer;
        }

        .amalan-item:hover {
          border-color: var(--border);
          background: #fff;
        }

        .amalan-item.checked {
          opacity: .7;
        }

        .checkbox {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: 2px solid var(--border);
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all .15s;
          background: #fff;
        }

        .checkbox.done {
          background: var(--pink);
          border-color: var(--pink);
          color: #fff;
          font-size: 11px;
          font-weight: bold;
        }

        .amalan-info {
          flex: 1;
          min-width: 0;
        }

        .amalan-name {
          font-size: 13.5px;
          font-weight: 500;
          color: var(--text);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .amalan-item.checked .amalan-name {
          text-decoration: line-through;
          color: var(--muted);
        }

        .amalan-cat {
          font-size: 10.5px;
          font-weight: 600;
          letter-spacing: 0.8px;
          text-transform: uppercase;
          color: var(--soft-purple);
          margin-top: 2px;
        }

        .amalan-pt {
          font-size: 12px;
          font-weight: 600;
          color: var(--pink);
          flex-shrink: 0;
        }

        /* ── PANELS ── */
        .panel {
          background: var(--card-bg);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 20px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.02), 0 4px 16px rgba(232,116,138,0.04);
        }

        .panel-title {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: var(--muted);
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 16px;
        }

        .panel-title::before {
          content: '';
          display: inline-block;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--pink);
          flex-shrink: 0;
        }

        /* ── CHART ── */
        .chart-wrap {
          display: flex;
          align-items: flex-end;
          gap: 8px;
          height: 90px;
          overflow: hidden;
          padding-bottom: 4px;
          border-bottom: 1px solid var(--border);
        }

        .chart-col {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          height: 100%;
          justify-content: flex-end;
        }

        .chart-bar {
          width: 100%;
          border-radius: 6px 6px 0 0;
          min-height: 4px;
          transition: height .4s ease;
        }

        .chart-bar.normal {
          background: linear-gradient(180deg, #c8b8f0 0%, #d8cff8 100%);
        }

        .chart-bar.haid {
          background: linear-gradient(180deg, #f0a8c0 0%, #fad0de 100%);
        }

        .chart-label {
          font-size: 10px;
          color: var(--muted);
          text-align: center;
          white-space: nowrap;
          font-weight: 500;
        }

        .chart-legend {
          display: flex;
          gap: 12px;
          margin-top: 10px;
          justify-content: flex-end;
        }

        .chart-legend-item {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 10px;
          color: var(--muted);
        }

        .chart-legend-dot {
          width: 8px;
          height: 8px;
          border-radius: 3px;
        }

        /* ── ANALITIK ── */
        .analitik-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .analitik-item {
          display: flex;
          flex-direction: column;
          gap: 6px;
          min-width: 0;
        }

        .analitik-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }

        .analitik-icon-name {
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: 0;
          flex: 1;
        }

        .analitik-icon {
          font-size: 14px;
          flex-shrink: 0;
        }

        .analitik-name {
          font-size: 13px;
          font-weight: 500;
          color: var(--text);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .analitik-sub {
          font-size: 10.5px;
          color: var(--muted);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          padding-left: 22px;
          margin-top: -2px;
        }

        .analitik-pct {
          font-size: 12.5px;
          font-weight: 600;
          color: var(--soft-purple);
          flex-shrink: 0;
        }

        .analitik-bar-bg {
          height: 5px;
          background: var(--border);
          border-radius: 4px;
          overflow: hidden;
        }

        .analitik-bar-fill {
          height: 100%;
          border-radius: 4px;
          background: linear-gradient(90deg, var(--soft-purple), var(--rose));
          transition: width .5s ease;
        }

        /* ── AI ADVISOR ── */
        .ai-advisor-panel {
          background: linear-gradient(135deg, rgba(255, 240, 243, 0.85) 0%, rgba(245, 238, 251, 0.85) 100%);
          backdrop-filter: blur(12px);
          WebkitBackdropFilter: blur(12px);
          border: 1.5px dashed var(--border);
          border-radius: 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 32px 24px;
          text-align: center;
          position: relative;
          overflow: hidden;
          min-height: 250px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.01), 0 10px 30px rgba(244,114,182,0.04);
        }

        .ai-glow-circle {
          position: absolute;
          width: 220px;
          height: 220px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(244, 114, 182, 0.12) 0%, transparent 70%);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          pointer-events: none;
        }

        .ai-icon {
          font-size: 28px;
          margin-bottom: 12px;
          position: relative;
          animation: pulse-icon 3s ease-in-out infinite;
        }

        @keyframes pulse-icon {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }

        .ai-title {
          font-family: var(--font-playfair-display), serif;
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #db2777;
          margin-bottom: 12px;
          position: relative;
        }

        .ai-quote {
          font-size: 13px;
          line-height: 1.7;
          color: var(--text);
          font-style: italic;
          font-family: var(--font-quicksand), sans-serif;
          font-weight: 500;
          position: relative;
          max-width: 260px;
        }

        .ai-btn {
          margin-top: 18px;
          background: linear-gradient(135deg, #fbcfe8, #f472b6);
          color: #881337;
          font-size: 12px;
          font-weight: 700;
          padding: 8px 24px;
          border-radius: 9999px;
          border: 1px solid rgba(244, 114, 182, 0.2);
          cursor: pointer;
          letter-spacing: 0.5px;
          position: relative;
          transition: all .2s;
          box-shadow: 0 4px 12px rgba(244, 114, 182, 0.15);
          text-decoration: none;
        }

        .ai-btn:hover {
          opacity: .95;
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(244, 114, 182, 0.2);
        }

        /* ── RESPONSIVENESS ── */
        @media (max-width: 1023px) {
          .content {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {/* ── Page Title ── */}
      <div className="page-title max-w-[1440px] mx-auto px-6 pt-6 text-center" style={{ marginBottom: "15px" }}>
        <span 
          style={{
            fontFamily: "var(--font-great-vibes), cursive",
            fontSize: "44px",
            color: "#db2777",
            display: "block",
            marginBottom: "4px"
          }}
        >
          🎀 Jurnal Siklusku 🎀
        </span>
        <p style={{ fontSize: "13px", color: "var(--muted)", margin: 0, fontWeight: 500 }}>
          Pantau siklus bulanan dan tetap jaga kebiasaan baik dengan amalan alternatif ✦
        </p>
      </div>

      {/* ── Content Grid ── */}
      <div className="content px-6">
        
        {/* LEFT COLUMN */}
        <div className="left-col">
          
          {/* FLO-STYLE DYNAMIC PREDICTION PANEL */}
          <div className="card animate-float" style={{
            background: "linear-gradient(135deg, rgba(255, 240, 243, 0.85) 0%, rgba(255, 228, 236, 0.85) 100%)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: "1.5px dashed var(--border)",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            position: "relative",
            overflow: "hidden"
          }}>
            {/* Ambient soft glow */}
            <div style={{
              position: "absolute",
              width: "180px",
              height: "180px",
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(244, 63, 94, 0.15) 0%, transparent 70%)",
              top: "-40px",
              left: "-40px",
              pointerEvents: "none"
            }} />

            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", zIndex: 1 }}>
              <div>
                <h3 style={{
                  fontFamily: "var(--font-playfair-display), serif",
                  fontStyle: "italic",
                  fontSize: "20px",
                  fontWeight: 600,
                  color: "#be123c",
                  margin: 0
                }}>
                  Asisten Siklus Flo 🌸
                </h3>
                <p style={{ fontSize: "12px", color: "var(--muted)", margin: "4px 0 0 0" }}>
                  Prediksi cerdas fase haid & masa subur Anda berikutnya
                </p>
              </div>

              {/* Status Badge */}
              <div style={{
                background: "white",
                border: "1px solid rgba(244, 114, 182, 0.3)",
                borderRadius: "9999px",
                padding: "4px 12px",
                fontSize: "12px",
                fontWeight: 700,
                color: "#be123c",
                boxShadow: "0 2px 8px rgba(244, 63, 94, 0.04)"
              }}>
                {getDayType(today) === "haid" ? "🔴 Sedang Haid" : getDayType(today) === "subur" ? "💜 Masa Subur" : "🌿 Masa Suci"}
              </div>
            </div>

            {/* Main Tracker Grid (Circle Ring + Info) */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "130px 1fr",
              gap: "20px",
              alignItems: "center",
              zIndex: 1
            }} className="flex flex-col sm:grid">
              
              {/* Flo Circular Status Ring */}
              <div style={{
                width: "130px",
                height: "130px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #ffe4e6 0%, #fbcfe8 100%)",
                border: "1.5px solid #f9a8d4",
                boxShadow: "0 8px 20px rgba(244, 114, 182, 0.15)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                color: "#be123c",
                textAlign: "center",
                padding: "10px",
                margin: "0 auto",
                animation: "pulse-icon 4s ease-in-out infinite"
              }}>
                <span style={{ fontSize: "10px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px", opacity: 0.9 }}>
                  {lastPeriodStart === null 
                    ? "Log Siklus"
                    : (getDayType(today) === "haid" ? "Hari Ke-" : "Haid Berikutnya")}
                </span>
                <span style={{ fontSize: "28px", fontWeight: 800, margin: "2px 0", fontFamily: "var(--font-playfair-display), serif" }}>
                  {lastPeriodStart === null 
                    ? "—"
                    : (getDayType(today) === "haid" 
                      ? today - lastPeriodStart + 1 
                      : nextPeriodStart - today)}
                </span>
                <span style={{ fontSize: "10px", fontWeight: 700, opacity: 0.9 }}>
                  {lastPeriodStart === null 
                    ? "Belum Ada Data 🌸" 
                    : (getDayType(today) === "haid" ? "Fase Haid 🩸" : "Hari Lagi 🗓")}
                </span>
              </div>

              {/* Predictions & Sliders */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {/* Text summary */}
                <div style={{
                  background: "rgba(255, 255, 255, 0.8)",
                  borderRadius: "12px",
                  padding: "12px 14px",
                  fontSize: "12.5px",
                  lineHeight: "1.5",
                  border: "1px solid rgba(244, 114, 182, 0.15)",
                  color: "#5c434f"
                }}>
                  {lastPeriodStart === null ? (
                    <span>💡 Silakan pilih tanggal mulai haid terakhir Anda di bawah untuk mengaktifkan prediksi cerdas.</span>
                  ) : (
                    <>
                      💡 Haid Anda berikutnya diperkirakan jatuh pada hari ke-<strong>{nextPeriodStart} Juni 2026</strong>.
                      <br />
                      Masa subur berikutnya pada rentang tanggal <strong>{nextPeriodStart - 16} - {nextPeriodStart - 12} Juni 2026</strong>.
                    </>
                  )}
                </div>

                {/* Control inputs in a row */}
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                  gap: "16px"
                }}>
                  {/* Last Period Input */}
                  <div>
                    <label style={{ fontSize: "11px", fontWeight: 700, color: "#8a6070", display: "block", marginBottom: "6px" }}>
                      Mulai Haid Terakhir:
                    </label>
                    <select
                      value={lastPeriodStart === null ? "" : lastPeriodStart}
                      onChange={(e) => {
                        const val = e.target.value === "" ? null : Number(e.target.value);
                        setLastPeriodStart(val);
                        updateCycleSettings(val, cycleLength, periodLength);
                      }}
                      style={{
                        width: "100%",
                        padding: "8px 10px",
                        borderRadius: "8px",
                        border: "1px solid rgba(244, 114, 182, 0.3)",
                        background: "white",
                        fontSize: "12px",
                        color: "#be123c",
                        fontWeight: 600,
                        outline: "none"
                      }}
                    >
                      <option value="">-- Pilih Tanggal --</option>
                      {Array.from({ length: 25 }, (_, i) => i + 1).map((d) => (
                        <option key={d} value={d}>Tanggal {d} Juni</option>
                      ))}
                    </select>
                  </div>

                  {/* Cycle Length Input */}
                  <div>
                    <label style={{ fontSize: "11px", fontWeight: 700, color: "#8a6070", display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                      <span>Panjang Siklus:</span>
                      <span style={{ fontWeight: 800, color: "#be123c" }}>{cycleLength} hari</span>
                    </label>
                    <input
                      type="range"
                      min="21"
                      max="35"
                      value={cycleLength}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setCycleLength(val);
                        updateCycleSettings(lastPeriodStart, val, periodLength);
                      }}
                      style={{
                        width: "100%",
                        accentColor: "#f472b6",
                        cursor: "pointer",
                        display: "block",
                        margin: 0
                      }}
                    />
                  </div>

                  {/* Period Length Input */}
                  <div>
                    <label style={{ fontSize: "11px", fontWeight: 700, color: "#8a6070", display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                      <span>Lama Haid:</span>
                      <span style={{ fontWeight: 800, color: "#be123c" }}>{periodLength} hari</span>
                    </label>
                    <input
                      type="range"
                      min="3"
                      max="10"
                      value={periodLength}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setPeriodLength(val);
                        updateCycleSettings(lastPeriodStart, cycleLength, val);
                      }}
                      style={{
                        width: "100%",
                        accentColor: "#f472b6",
                        cursor: "pointer",
                        display: "block",
                        margin: 0
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CALENDAR */}
          <div className="card">
            <div className="cal-header">
              <div className="cal-month">🗓 Juni 2026</div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button style={{ background: "none", border: "1px solid var(--border)", borderRadius: "8px", width: "26px", height: "26px", cursor: "pointer", color: "var(--muted)" }}>‹</button>
                <button style={{ background: "none", border: "1px solid var(--border)", borderRadius: "8px", width: "26px", height: "26px", cursor: "pointer", color: "var(--muted)" }}>›</button>
              </div>
            </div>
            <div className="cal-grid">
              <div className="cal-day-name">Min</div>
              <div className="cal-day-name">Sen</div>
              <div className="cal-day-name">Sel</div>
              <div className="cal-day-name">Rab</div>
              <div className="cal-day-name">Kam</div>
              <div className="cal-day-name">Jum</div>
              <div className="cal-day-name">Sab</div>
              
              {/* row 1: Jun starts Monday */}
              {cells.map((d, i) => (
                <div key={i} className="flex items-center justify-center">
                  {d ? (
                    <button
                      className={`cal-day ${getDayType(d)}`}
                    >
                      {d}
                    </button>
                  ) : (
                    <div className="cal-day empty" />
                  )}
                </div>
              ))}
            </div>
            
            <div className="cal-legend">
              <div className="legend-item">
                <div className="legend-dot" style={{ background: "#fde8ee", border: "1px solid var(--rose)" }} />
                Masa Haid
              </div>
              <div className="legend-item">
                <div className="legend-dot" style={{ background: "#f3e8ff", border: "1px solid #d8b4fe" }} />
                Masa Subur
              </div>
              <div className="legend-item">
                <div className="legend-dot" style={{ background: "#e8f5ee", border: "1px solid #a8d8bc" }} />
                Masa Suci
              </div>
              <div className="legend-item">
                <div className="legend-dot" style={{ background: "var(--pink)" }} />
                Hari Ini
              </div>
            </div>
          </div>

          {/* AMALAN HARI INI */}
          <div className="amalan-card">
            <div className="amalan-header">
              <div>
                <div className="amalan-title">🌸 Amalan Hari Ini — Mo₂ Checklist</div>
                <div className="amalan-sub">
                  Senin, 1 Juni · {getDayType(today) === "haid" && lastPeriodStart !== null ? "Mode Haid 🔴 (Hari ke-" + (today - lastPeriodStart + 1) + ")" : "Mode Suci 🟢"}
                </div>
              </div>
              <div className="amalan-pts">{earnedPoints} / {totalPoints} Poin</div>
            </div>
            <div className="progress-bar-wrap">
              <div className="progress-bar" style={{ width: `${progressPersen}%` }} />
            </div>

            <div className="amalan-list">
              {amalans.map((a, i) => (
                <div 
                  key={i} 
                  className={`amalan-item ${a.done ? "checked" : ""}`}
                  role="button"
                  tabIndex={0}
                  onClick={() => toggleAmalan(i)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      toggleAmalan(i);
                    }
                  }}
                >
                  <div className={`checkbox ${a.done ? "done" : ""}`}>
                    {a.done ? "✓" : ""}
                  </div>
                  <div className="amalan-info">
                    <div className="amalan-name">{a.name}</div>
                    <div className="amalan-cat">{a.cat}</div>
                  </div>
                  <div className="amalan-pt">+{a.pts} Pts</div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN */}
        <div className="right-col">

          {/* CHART */}
          <div className="panel">
            <div className="panel-title">Konsistensi Ibadah 7 Hari</div>
            <div className="chart-wrap">
              {chartDays.map((d, i) => (
                <div key={i} className="chart-col">
                  <div 
                    className={`chart-bar ${d.haid ? "haid" : "normal"}`} 
                    style={{ height: `${d.pct}%` }} 
                  />
                  <div className="chart-label">{d.label}</div>
                </div>
              ))}
            </div>
            <div className="chart-legend">
              <div className="chart-legend-item">
                <div className="chart-legend-dot" style={{ background: "#c8b8f0" }} />
                Normal
              </div>
              <div className="chart-legend-item">
                <div className="chart-legend-dot" style={{ background: "#f0a8c0" }} />
                Haid
              </div>
            </div>
          </div>

          {/* ANALITIK */}
          <div className="panel">
            <div className="panel-title">Analitik Riwayat Ibadah</div>
            <div className="analitik-list">
              {[
                { icon: "⭐", name: "Sholat 5 Waktu", sub: "Fardhu harian", pct: sholatProgress },
                { icon: "📖", name: "Baca Al-Qur'an", sub: "1 halaman / hari", pct: quranProgress },
                { icon: "🤲", name: "Dzikir & Shalawat", sub: "Alternatif haid", pct: dzikirProgress },
                { icon: "🎵", name: "Murottal Harian", sub: "Mendengarkan", pct: murottalProgress },
              ].map((a, i) => (
                <div key={i} className="analitik-item">
                  <div className="analitik-row">
                    <div className="analitik-icon-name">
                      <span className="analitik-icon">{a.icon}</span>
                      <span className="analitik-name">{a.name}</span>
                    </div>
                    <span className="analitik-pct">{a.pct}%</span>
                  </div>
                  <div className="analitik-sub">{a.sub}</div>
                  <div className="analitik-bar-bg">
                    <div className="analitik-bar-fill" style={{ width: `${a.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI ADVISOR */}
          <div className="ai-advisor-panel">
            <div className="ai-glow-circle" />
            <div className="ai-icon">✨</div>
            <div className="ai-title font-serif">Analisis AI Advisor</div>
            <div className="h-px w-full mb-4" style={{ background: "var(--border)" }} />
            <div className="ai-quote">
              &ldquo;Kekuatan ibadahmu ada pada sholat fardhu yang konsisten. Membaca Al-Qur&apos;an saat haid juga sangat baik. Pertahankan terus kebiasaan baikmu demi mencapai target ibadah mingguan.&rdquo;
            </div>
            <Link href="/ai-advisor" className="ai-btn">
              Tanya AI Advisor ✦
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}
