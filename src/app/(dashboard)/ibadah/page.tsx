"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

// ==========================================
// STATIC CONSTANTS & DICTIONARIES
// ==========================================
const MONTH_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

// 114 Surahs
const QURAN_SURAHS = [
  "Al-Fatihah", "Al-Baqarah", "Ali 'Imran", "An-Nisa'", "Al-Ma'idah", "Al-An'am", "Al-A'raf", "Al-Anfal", "At-Tawbah", "Yunus",
  "Hud", "Yusuf", "Ar-Ra'd", "Ibrahim", "Al-Hijr", "An-Nahl", "Al-Isra'", "Al-Kahfi", "Maryam", "Thaha",
  "Al-Anbiya'", "Al-Hajj", "Al-Mu'minun", "An-Nur", "Al-Furqan", "Asy-Syu'ara'", "An-Naml", "Al-Qashash", "Al-'Ankabut", "Ar-Rum",
  "Luqman", "As-Sajdah", "Al-Ahzab", "Saba'", "Fathir", "Yasin", "Ash-Shaffat", "Shad", "Az-Zumar", "Ghafir",
  "Fushshilat", "Asy-Syura", "Az-Zukhruf", "Ad-Dukhan", "Al-Jatsiyah", "Al-Ahqaf", "Muhammad", "Al-Fath", "Al-Hujurat", "Qaf",
  "Adz-Dzariyat", "Ath-Thur", "An-Najm", "Al-Qamar", "Ar-Rahman", "Al-Waqi'ah", "Al-Hadid", "Al-Mujadilah", "Al-Hasyr", "Al-Mumtahanah",
  "Ash-Shaff", "Al-Jumu'ah", "Al-Munafiqun", "At-Taghabun", "At-Thalaq", "At-Tahrim", "Al-Mulk", "Al-Qalam", "Al-Haqqah", "Al-Ma'arij",
  "Nuh", "Al-Jinn", "Al-Muzzammil", "Al-Muddastsir", "Al-Qiyamah", "Al-Insan", "Al-Mursalat", "An-Naba'", "An-Nazi'at", "Abasa",
  "At-Takwir", "Al-Infitar", "Al-Muthaffifin", "Al-Insyiqaq", "Al-Buruj", "Ath-Thariq", "Al-A'la", "Al-Ghasyiyah", "Al-Fajr", "Al-Balad",
  "Asy-Syams", "Al-Lail", "Ad-Dhuha", "Asy-Syarh", "At-Tin", "Al-'Alaq", "Al-Qadr", "Al-Bayyinah", "Az-Zalzalah", "Al-'Adiyat",
  "Al-Qari'ah", "At-Takatsur", "Al-'Asr", "Al-Humazah", "Al-Fil", "Quraisy", "Al-Ma'un", "Al-Kautsar", "Al-Kafirun", "An-Nashr",
  "Al-Masad", "Al-Ikhlas", "Al-Falaq", "An-Nas"
];

// Reusable Initial Checklists per Phase
const AMALAN_TEMPLATES = {
  suci_penuh: [
    { id: "s1", nama: "Sholat Subuh Berjamaah / Tepat Waktu", kategori: "SHOLAT", poin: 5, checked: false },
    { id: "s2", nama: "Sholat Dzuhur Tepat Waktu", kategori: "SHOLAT", poin: 5, checked: false },
    { id: "s3", nama: "Sholat Ashar Tepat Waktu", kategori: "SHOLAT", poin: 5, checked: false },
    { id: "s4", nama: "Sholat Maghrib Berjamaah / Tepat Waktu", kategori: "SHOLAT", poin: 5, checked: false },
    { id: "s5", nama: "Sholat Isya Tepat Waktu", kategori: "SHOLAT", poin: 5, checked: false },
    { id: "s6", nama: "Sholat Dhuha", kategori: "SHOLAT", poin: 5, checked: false },
    { id: "s7", nama: "Dzikir Pagi & Petang", kategori: "DZIKIR", poin: 5, checked: false },
    { id: "s8", nama: "Sedekah Subuh / Infaq Harian", kategori: "SOSIAL", poin: 10, checked: false }
  ],
  haid: [
    { id: "h1", nama: "Dzikir Pagi Hari (Alternatif Sholat)", kategori: "DZIKIR", poin: 5, checked: false },
    { id: "h2", nama: "Dzikir Petang Hari (Alternatif Sholat)", kategori: "DZIKIR", poin: 5, checked: false },
    { id: "h3", nama: "Membaca Buku Fiqih Kewanitaan / Hadits", kategori: "TILAWAH", poin: 10, checked: false },
    { id: "h4", nama: "Membaca Shalawat Nabi 100x", kategori: "DZIKIR", poin: 5, checked: false },
    { id: "h5", nama: "Mendengarkan Murottal Al-Quran 15 Menit", kategori: "DZIKIR", poin: 5, checked: false },
    { id: "h6", nama: "Sedekah Subuh / Infaq Harian", kategori: "SOSIAL", poin: 10, checked: false }
  ],
  nifas: [
    { id: "n1", nama: "Dzikir Pagi & Petang", kategori: "DZIKIR", poin: 5, checked: false },
    { id: "n2", nama: "Membaca Shalawat Nabi 100x", kategori: "DZIKIR", poin: 5, checked: false },
    { id: "n3", nama: "Mendengar Murottal / Kajian Syariah", kategori: "TILAWAH", poin: 5, checked: false },
    { id: "n4", nama: "Sedekah Subuh / Infaq Harian", kategori: "SOSIAL", poin: 10, checked: false }
  ]
};

const quotesPerPhase = {
  suci_penuh: {
    text: '"Sholat yang paling utama di sisi Allah adalah sholat yang dikerjakan pada awal waktunya secara istiqomah."',
    narrator: '— Hadits Riwayat Bukhari'
  },
  haid: {
    text: '"Di masa haid, tetaplah dekat dengan Allah melalui dzikir, shalawat, dan sedekah. Ibadah hatimu tidak pernah berhenti."',
    narrator: '— Hadits Riwayat Bukhari'
  },
  nifas: {
    text: '"Kesucian adalah sebagian dari iman. Bersyukurlah atas pemulihan jasmani dan rohani Anda."',
    narrator: '— Hadits Riwayat Muslim'
  }
};

// Gratitude Templates
const GRATITUDE_TEMPLATES = [
  { id: "g1", label: "Mental health aman & hati adem (inner peace is real) 🧘‍♀️" },
  { id: "g2", label: "Dapet little joy & unexpected blessings hari ini 💌" },
  { id: "g3", label: "Dikasih energy & hidayah buat tetep istiqomah ⚡" },
  { id: "g4", label: "Bisa deep talk lewat sujud & doa yang khusyuk 💫" }
];

interface TilawahLog {
  id: string;
  surah: string;
  startAyah: string;
  endAyah: string;
  points: number;
  timestamp: string;
  dateKey: string;
}

interface JournalLog {
  id: string;
  mood: string;
  text: string;
  date: string;
  dateKey: string;
}

export default function AdaptiveIbadahPage() {
  const [mounted, setMounted] = useState(false);
  const [supabase] = useState(() => createClient());
  const [userId, setUserId] = useState<string | null>(null);

  // 1. DATE SELECTOR STATE
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // 2. ACTIVE PHASE STATE
  const [activePhase, setActivePhase] = useState<"suci_penuh" | "haid" | "nifas">("suci_penuh");

  // 3. CHECKED AMALANS PER DATE KEY
  const [checkedItems, setCheckedItems] = useState<{ [key: string]: { [itemId: string]: boolean } }>({});

  // 4. QURAN LOGGER STATE
  const [selectedSurah, setSelectedSurah] = useState("Al-Kahfi");
  const [startAyah, setStartAyah] = useState("");
  const [endAyah, setEndAyah] = useState("");
  const [tilawahLogs, setTilawahLogs] = useState<TilawahLog[]>([
    { id: "1", surah: "Al-Kahfi", startAyah: "1", endAyah: "10", points: 10, timestamp: "06:30 WIB", dateKey: "" }
  ]);

  // 5. MOOD & JOURNAL STATE
  const [selectedMood, setSelectedMood] = useState("🌸 Tenang");
  const [journalText, setJournalText] = useState("");
  const [journalLogs, setJournalLogs] = useState<JournalLog[]>([
    { id: "j1", mood: "🌸 Tenang", text: "Ibadah hari ini terasa sangat damai, bersyukur bisa menyisihkan waktu luang.", date: "2 Jun 2026", dateKey: "" }
  ]);

  // 6. TASBIH & WATER STATE
  const [tasbihCount, setTasbihCount] = useState(0);
  const [selectedDhikr, setSelectedDhikr] = useState("Subhanallah");
  const [tasbihCounts, setTasbihCounts] = useState<{ [dhikr: string]: number }>({
    "Subhanallah": 0,
    "Alhamdulillah": 0,
    "Allahu Akbar": 0,
    "Astagfirullah": 0,
    "Shalawat": 0
  });
  const [waterCount, setWaterCount] = useState(0);

  // 7. NEW SIDEBAR WIDGET STATES
  const [khatamCurrentJuz, setKhatamCurrentJuz] = useState(1);
  const [khatamCurrentPage, setKhatamCurrentPage] = useState(1);
  const [gratitudeChecks, setGratitudeChecks] = useState<{ [itemId: string]: boolean }>({});
  const [sedekahCount, setSedekahCount] = useState(0);

  const dateKey = `ibadah-${selectedYear}-${selectedMonth}-${selectedDay}`;

  // Initialize Auth & Global Profile States
  useEffect(() => {
    setMounted(true);
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        
        // Load global user states
        const { data: stateData } = await supabase
          .from("syariah_user_states")
          .select("*")
          .eq("user_id", user.id)
          .single();
        if (stateData) {
          if (stateData.khatam_current_page !== null) setKhatamCurrentPage(stateData.khatam_current_page);
          if (stateData.water_today !== null) setWaterCount(stateData.water_today);
          if (stateData.sedekah_total !== null) setSedekahCount(Number(stateData.sedekah_total));
          if (stateData.tasbih_counts !== null) {
            setTasbihCounts(stateData.tasbih_counts);
            setTasbihCount(stateData.tasbih_counts[selectedDhikr] || 0);
          }
        }
      }
    };
    checkUser();
  }, [supabase]);

  // Load Date-Specific states
  useEffect(() => {
    const loadDateData = async () => {
      if (!mounted) return;

      if (!userId) {
        // Fallback to local storage
        const savedPhase = localStorage.getItem("ibadah-phase");
        if (savedPhase) setActivePhase(savedPhase as any);

        const savedChecks = localStorage.getItem("ibadah-checked-items");
        if (savedChecks) setCheckedItems(JSON.parse(savedChecks));

        const savedTilawah = localStorage.getItem("ibadah-tilawah-logs");
        if (savedTilawah) setTilawahLogs(JSON.parse(savedTilawah));

        const savedJournal = localStorage.getItem("ibadah-journal-logs");
        if (savedJournal) setJournalLogs(JSON.parse(savedJournal));

        const keyT = `tasbih-${dateKey}`;
        const keyW = `water-${dateKey}`;
        const keySedekah = `sedekah-${dateKey}`;
        const keyG = `gratitude-${dateKey}`;

        const savedT = localStorage.getItem(keyT);
        const savedW = localStorage.getItem(keyW);
        const savedSedekah = localStorage.getItem(keySedekah);
        const savedG = localStorage.getItem(keyG);

        setTasbihCount(savedT ? parseInt(savedT) : 0);
        setWaterCount(savedW ? parseInt(savedW) : 0);
        setSedekahCount(savedSedekah ? parseInt(savedSedekah) : 0);
        setGratitudeChecks(savedG ? JSON.parse(savedG) : {});
        return;
      }

      // Load day-specific logs from Supabase
      const { data: logData } = await supabase
        .from("syariah_ibadah_logs")
        .select("*")
        .eq("date", dateKey)
        .single();

      if (logData) {
        // Checked Amalans
        const mappedChecks: { [itemId: string]: boolean } = {};
        if (logData.checked_amalans) {
          logData.checked_amalans.forEach((id: string) => {
            mappedChecks[id] = true;
          });
        }
        setCheckedItems(prev => ({ ...prev, [dateKey]: mappedChecks }));

        // Checked Gratitudes
        const mappedGratitudes: { [itemId: string]: boolean } = {};
        if (logData.checked_gratitudes) {
          logData.checked_gratitudes.forEach((id: string) => {
            mappedGratitudes[id] = true;
          });
        }
        setGratitudeChecks(mappedGratitudes);

        // Journal Text & Mood
        setJournalText(logData.journal_text || "");
        setSelectedMood(logData.journal_mood || "🌸 Tenang");

        // Tilawah Logs
        if (logData.tilawah_logs) {
          setTilawahLogs(logData.tilawah_logs);
        }
      } else {
        setCheckedItems(prev => ({ ...prev, [dateKey]: {} }));
        setGratitudeChecks({});
        setJournalText("");
        setSelectedMood("🌸 Tenang");
      }
    };
    loadDateData();
  }, [dateKey, userId, supabase, mounted]);

  // Reconstruct all logs for journal history list
  useEffect(() => {
    const fetchAllLogs = async () => {
      if (!userId) return;

      const { data: allLogs } = await supabase
        .from("syariah_ibadah_logs")
        .select("date, journal_mood, journal_text, tilawah_logs")
        .order("date", { ascending: false });

      if (allLogs) {
        const flatTilawah: TilawahLog[] = [];
        allLogs.forEach(log => {
          if (log.tilawah_logs && Array.isArray(log.tilawah_logs)) {
            log.tilawah_logs.forEach((t: any) => {
              flatTilawah.push({
                ...t,
                dateKey: log.date
              });
            });
          }
        });
        setTilawahLogs(flatTilawah);

        const mappedJournals: JournalLog[] = allLogs
          .filter(log => log.journal_text && log.journal_text.trim())
          .map((log) => ({
            id: `j-${log.date}`,
            mood: log.journal_mood || "🌸 Tenang",
            text: log.journal_text || "",
            date: log.date.replace("ibadah-", ""),
            dateKey: log.date
          }));
        setJournalLogs(mappedJournals);
      }
    };
    if (userId) {
      fetchAllLogs();
    }
  }, [userId, supabase, dateKey]);

  const handlePhaseChange = (phase: "suci_penuh" | "haid" | "nifas") => {
    setActivePhase(phase);
    localStorage.setItem("ibadah-phase", phase);
  };

  const toggleAmalan = async (itemId: string) => {
    const nextChecks = { ...checkedItems };
    if (!nextChecks[dateKey]) nextChecks[dateKey] = {};
    
    const wasChecked = nextChecks[dateKey][itemId] || false;
    nextChecks[dateKey][itemId] = !wasChecked;
    setCheckedItems(nextChecks);

    const checkedIds = Object.keys(nextChecks[dateKey]).filter(id => nextChecks[dateKey][id]);

    if (userId) {
      await supabase
        .from("syariah_ibadah_logs")
        .upsert({
          user_id: userId,
          date: dateKey,
          checked_amalans: checkedIds,
          checked_gratitudes: Object.keys(gratitudeChecks).filter(id => gratitudeChecks[id]),
          journal_mood: selectedMood,
          journal_text: journalText
        }, { onConflict: "user_id,date" });
    } else {
      localStorage.setItem("ibadah-checked-items", JSON.stringify(nextChecks));
    }
  };

  const handleAddTilawah = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startAyah || !endAyah) return;

    const startNum = parseInt(startAyah);
    const endNum = parseInt(endAyah);
    if (isNaN(startNum) || isNaN(endNum) || startNum <= 0 || endNum < startNum) return;

    const count = endNum - startNum + 1;
    const points = Math.min(15, 5 + Math.floor(count / 2));
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) + " WIB";

    const newLog: TilawahLog = {
      id: Date.now().toString(),
      surah: selectedSurah,
      startAyah: startAyah,
      endAyah: endAyah,
      points: points,
      timestamp: timeStr,
      dateKey: dateKey
    };

    const nextLogs = [newLog, ...tilawahLogs.filter(t => t.dateKey === dateKey)];
    
    if (userId) {
      const checkedAmalansForDate = checkedItems[dateKey] 
        ? Object.keys(checkedItems[dateKey]).filter(k => checkedItems[dateKey][k])
        : [];
      const checkedGratitudesForDate = gratitudeChecks
        ? Object.keys(gratitudeChecks).filter(k => gratitudeChecks[k])
        : [];

      await supabase
        .from("syariah_ibadah_logs")
        .upsert({
          user_id: userId,
          date: dateKey,
          checked_amalans: checkedAmalansForDate,
          checked_gratitudes: checkedGratitudesForDate,
          tilawah_logs: nextLogs,
          journal_mood: selectedMood,
          journal_text: journalText
        }, { onConflict: "user_id,date" });
      
      setTilawahLogs(prev => [newLog, ...prev]);
    } else {
      const fullLogs = [newLog, ...tilawahLogs];
      setTilawahLogs(fullLogs);
      localStorage.setItem("ibadah-tilawah-logs", JSON.stringify(fullLogs));
    }

    setStartAyah("");
    setEndAyah("");
  };

  const handleDeleteTilawah = async (id: string) => {
    if (userId) {
      const logToDelete = tilawahLogs.find(t => t.id === id);
      if (!logToDelete) return;
      const targetDateKey = logToDelete.dateKey;

      const nextLogsForDate = tilawahLogs
        .filter(t => t.dateKey === targetDateKey && t.id !== id);

      const checkedAmalansForDate = checkedItems[targetDateKey] 
        ? Object.keys(checkedItems[targetDateKey]).filter(k => checkedItems[targetDateKey][k])
        : [];
      const checkedGratitudesForDate = targetDateKey === dateKey 
        ? Object.keys(gratitudeChecks).filter(k => gratitudeChecks[k])
        : [];

      await supabase
        .from("syariah_ibadah_logs")
        .upsert({
          user_id: userId,
          date: targetDateKey,
          checked_amalans: checkedAmalansForDate,
          checked_gratitudes: checkedGratitudesForDate,
          tilawah_logs: nextLogsForDate
        }, { onConflict: "user_id,date" });

      setTilawahLogs(prev => prev.filter(t => t.id !== id));
    } else {
      const nextLogs = tilawahLogs.filter((log) => log.id !== id);
      setTilawahLogs(nextLogs);
      localStorage.setItem("ibadah-tilawah-logs", JSON.stringify(nextLogs));
    }
  };

  const handleSaveJournal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!journalText.trim()) return;

    const formattedDate = `${selectedDay} ${MONTH_NAMES[selectedMonth].substring(0, 3)} ${selectedYear}`;
    const nextJournals = journalLogs.filter(j => j.dateKey !== dateKey);

    const newLog: JournalLog = {
      id: Date.now().toString(),
      mood: selectedMood,
      text: journalText,
      date: formattedDate,
      dateKey: dateKey
    };

    if (userId) {
      const checkedAmalansForDate = checkedItems[dateKey] 
        ? Object.keys(checkedItems[dateKey]).filter(k => checkedItems[dateKey][k])
        : [];
      const checkedGratitudesForDate = gratitudeChecks
        ? Object.keys(gratitudeChecks).filter(k => gratitudeChecks[k])
        : [];
      const dayLogsForDate = tilawahLogs.filter(t => t.dateKey === dateKey);

      await supabase
        .from("syariah_ibadah_logs")
        .upsert({
          user_id: userId,
          date: dateKey,
          checked_amalans: checkedAmalansForDate,
          checked_gratitudes: checkedGratitudesForDate,
          journal_mood: selectedMood,
          journal_text: journalText,
          tilawah_logs: dayLogsForDate
        }, { onConflict: "user_id,date" });

      setJournalLogs(prev => [newLog, ...prev.filter(j => j.dateKey !== dateKey)]);
      setJournalText("");
    } else {
      const nextLogs = [newLog, ...nextJournals];
      setJournalLogs(nextLogs);
      localStorage.setItem("ibadah-journal-logs", JSON.stringify(nextLogs));
      setJournalText("");
    }
  };

  const incrementTasbih = async () => {
    const nextVal = tasbihCount + 1;
    setTasbihCount(nextVal);
    const updatedCounts = { ...tasbihCounts, [selectedDhikr]: nextVal };
    setTasbihCounts(updatedCounts);

    if (userId) {
      await supabase
        .from("syariah_user_states")
        .upsert({
          user_id: userId,
          tasbih_counts: updatedCounts
        }, { onConflict: "user_id" });
    } else {
      localStorage.setItem(`tasbih-${dateKey}`, nextVal.toString());
      localStorage.setItem(`tasbih_counts_local`, JSON.stringify(updatedCounts));
    }
  };

  const resetTasbih = async () => {
    setTasbihCount(0);
    const updatedCounts = { ...tasbihCounts, [selectedDhikr]: 0 };
    setTasbihCounts(updatedCounts);

    if (userId) {
      await supabase
        .from("syariah_user_states")
        .upsert({
          user_id: userId,
          tasbih_counts: updatedCounts
        }, { onConflict: "user_id" });
    } else {
      localStorage.setItem(`tasbih-${dateKey}`, "0");
      localStorage.setItem(`tasbih_counts_local`, JSON.stringify(updatedCounts));
    }
  };

  const changeDhikr = (val: string) => {
    setSelectedDhikr(val);
    localStorage.setItem(`dhikr-${dateKey}`, val);
    const savedCount = tasbihCounts[val] || 0;
    setTasbihCount(savedCount);
  };

  const toggleGlass = async (idx: number) => {
    let nextVal = idx + 1;
    if (waterCount === nextVal) {
      nextVal = idx;
    }
    setWaterCount(nextVal);

    if (userId) {
      await supabase
        .from("syariah_user_states")
        .upsert({
          user_id: userId,
          water_today: nextVal
        }, { onConflict: "user_id" });
    } else {
      localStorage.setItem(`water-${dateKey}`, nextVal.toString());
    }
  };

  const updateKhatamJuz = (val: number) => {
    const cleanVal = Math.max(1, Math.min(30, val));
    setKhatamCurrentJuz(cleanVal);
    localStorage.setItem("khatam-current-juz", cleanVal.toString());
  };

  const updateKhatamPage = async (val: number) => {
    const cleanVal = Math.max(1, Math.min(604, val));
    setKhatamCurrentPage(cleanVal);
    
    if (userId) {
      await supabase
        .from("syariah_user_states")
        .upsert({
          user_id: userId,
          khatam_current_page: cleanVal
        }, { onConflict: "user_id" });
    } else {
      localStorage.setItem("khatam-current-page", cleanVal.toString());
    }
  };

  const toggleGratitude = async (id: string) => {
    const updated = { ...gratitudeChecks, [id]: !gratitudeChecks[id] };
    setGratitudeChecks(updated);

    if (userId) {
      const checkedAmalansForDate = checkedItems[dateKey] 
        ? Object.keys(checkedItems[dateKey]).filter(k => checkedItems[dateKey][k])
        : [];
      
      await supabase
        .from("syariah_ibadah_logs")
        .upsert({
          user_id: userId,
          date: dateKey,
          checked_amalans: checkedAmalansForDate,
          checked_gratitudes: Object.keys(updated).filter(k => updated[k])
        }, { onConflict: "user_id,date" });
    } else {
      localStorage.setItem(`gratitude-${dateKey}`, JSON.stringify(updated));
    }
  };

  const addSedekah = async () => {
    const nextVal = sedekahCount + 1;
    setSedekahCount(nextVal);

    if (userId) {
      await supabase
        .from("syariah_user_states")
        .upsert({
          user_id: userId,
          sedekah_total: nextVal
        }, { onConflict: "user_id" });
    } else {
      localStorage.setItem(`sedekah-${dateKey}`, nextVal.toString());
    }
  };

  const resetSedekah = async () => {
    setSedekahCount(0);

    if (userId) {
      await supabase
        .from("syariah_user_states")
        .upsert({
          user_id: userId,
          sedekah_total: 0
        }, { onConflict: "user_id" });
    } else {
      localStorage.setItem(`sedekah-${dateKey}`, "0");
    }
  };

  // Calculations
  const currentList = AMALAN_TEMPLATES[activePhase] || AMALAN_TEMPLATES.suci_penuh;
  const dayChecks = checkedItems[dateKey] || {};
  const activeAmalans = currentList.map(item => ({
    ...item,
    checked: dayChecks[item.id] || false
  }));

  const amalanPointsEarned = activeAmalans.filter(item => item.checked).reduce((sum, item) => sum + item.poin, 0);
  const amalanMaxPoints = activeAmalans.reduce((sum, item) => sum + item.poin, 0);

  const dayTilawah = tilawahLogs.filter(log => log.dateKey === dateKey);
  const quranPointsEarned = Math.min(20, dayTilawah.reduce((sum, log) => sum + log.points, 0));
  const quranMaxPoints = 20;

  const totalPointsEarned = amalanPointsEarned + quranPointsEarned;
  const maxPoints = amalanMaxPoints + quranMaxPoints;
  const completionPercentage = maxPoints > 0 ? Math.round((totalPointsEarned / maxPoints) * 100) : 0;

  // Category statistics for Overview rings
  const getCatProgress = (cat: string) => {
    const items = activeAmalans.filter(item => item.kategori === cat);
    if (items.length === 0) return null;
    const done = items.filter(item => item.checked).length;
    return { done, total: items.length };
  };

  const getDzikirPct = () => {
    const items = activeAmalans.filter(item => item.kategori === "DZIKIR");
    if (items.length === 0) return 0;
    const done = items.filter(item => item.checked).length;
    return Math.round((done / items.length) * 100);
  };

  const getSosialPct = () => {
    const items = activeAmalans.filter(item => item.kategori === "SOSIAL");
    if (items.length === 0) return 0;
    const done = items.filter(item => item.checked).length;
    return Math.round((done / items.length) * 100);
  };

  const currentQuote = quotesPerPhase[activePhase] || quotesPerPhase.suci_penuh;
  const currentJournal = journalLogs.find(j => j.dateKey === dateKey);

  if (!mounted) return null;

  return (
    <div className="page-container w-full min-h-screen pb-12">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@500;700&family=Sacramento&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=DM+Sans:wght@300;400;500&display=swap');
        
        .page-container {
          --cream: #FFFBFD;
          --cream2: #FFF2F7;
          --rose: #C8647A;
          --rose-light: #F0A0B0;
          --rose-bg: #FFF0F4;
          --border: #F9EBF2;
          --border2: #FCE2F0;
          --brown-dark: #5A3645;
          --brown-mid: #7C4F62;
          --brown-text: #3D222E;
          --muted: #A68B98;
          --sidebar-bg: #FCF4F7;
          --white: #ffffff;
          
          font-family: 'DM Sans', sans-serif;
          color: var(--brown-text);
          background-color: var(--cream);
          background-image: radial-gradient(rgba(251, 113, 133, 0.15) 1.5px, transparent 1.5px);
          background-size: 18px 18px;
          padding: 24px;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .app-wrap {
          display: grid;
          grid-template-columns: 1fr 320px;
          min-height: calc(100vh - 48px);
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          box-shadow: 0 10px 45px rgba(200, 100, 122, 0.08);
          background: var(--white);
          border-radius: 20px;
          overflow: hidden;
          border: 1px solid var(--border);
        }

        @media (max-width: 1024px) {
          .app-wrap {
            grid-template-columns: 1fr;
          }
        }

        .main { padding: 32px 32px 48px 36px; border-right: 1px solid var(--border); }
        .sidebar {
          padding: 24px 20px;
          background: var(--sidebar-bg);
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .header-bar {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 20px;
        }
        .skor-pill {
          background: var(--rose-bg);
          border: 1px solid var(--border2);
          border-radius: 20px;
          padding: 5px 14px;
          font-size: 12px;
          color: var(--rose);
          font-weight: 500;
        }

        .ibadah-brand {
          text-align: center;
          margin-bottom: 24px;
          padding: 24px;
          background: rgba(255, 255, 255, 0.85);
          border: 1px solid rgba(244, 63, 94, 0.12);
          border-radius: 16px;
          box-shadow: 0 4px 25px rgba(244, 63, 94, 0.03);
        }
        .ibadah-brand-title {
          font-family: var(--font-great-vibes), var(--font-clicker-script), 'Sacramento', 'Caveat', cursive;
          font-size: 58px;
          font-weight: 400;
          color: var(--rose);
          letter-spacing: 0;
          line-height: 1.1;
        }
        .ibadah-brand-sub {
          font-size: 10.5px;
          letter-spacing: 2.5px;
          color: var(--muted);
          margin-top: 7px;
          text-transform: uppercase;
        }

        .fase-bar {
          background: var(--white);
          border: 1px solid var(--border2);
          border-radius: 10px;
          padding: 11px 16px;
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 20px;
        }
        .fase-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--rose);
          flex-shrink: 0;
          box-shadow: 0 0 8px var(--rose-light);
        }
        .fase-label {
          font-size: 10.5px;
          color: var(--muted);
          letter-spacing: 1px;
          text-transform: uppercase;
        }
        .fase-val {
          font-size: 13px;
          font-weight: 500;
          color: var(--brown-dark);
          margin-left: auto;
        }
        .fase-select {
          background: var(--rose-bg);
          border: 1px solid var(--border2);
          border-radius: 7px;
          padding: 4px 10px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          color: var(--brown-dark);
          cursor: pointer;
          margin-left: 8px;
          outline: none;
        }

        .hadith {
          background: var(--rose-bg);
          border-left: 3px solid var(--rose-light);
          border-radius: 0 8px 8px 0;
          padding: 13px 18px;
          margin-bottom: 28px;
          font-family: 'Cormorant Garamond', serif;
          font-size: 15px;
          font-style: italic;
          color: var(--brown-dark);
          line-height: 1.8;
        }
        .hadith span {
          display: block;
          margin-top: 4px;
          font-size: 12px;
          font-style: normal;
          color: var(--muted);
          font-family: 'DM Sans', sans-serif;
          letter-spacing: 0.5px;
        }

        .overview-title {
          font-size: 10px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: var(--muted);
          margin-bottom: 12px;
        }
        .overview-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
          margin-bottom: 28px;
        }
        .ov-card {
          background: var(--white);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 16px 10px;
          text-align: center;
          transition: all 0.3s ease;
        }
        .ov-card:hover {
          border-color: var(--rose-light);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(200, 100, 122, 0.05);
        }
        .ov-ring {
          width: 46px;
          height: 46px;
          border-radius: 50%;
          border: 3px solid var(--border);
          margin: 0 auto 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 500;
          color: var(--brown-dark);
          transition: all 0.3s ease;
        }
        .ov-ring.filled { border-color: var(--rose); background: var(--rose-bg); color: var(--rose); }
        .ov-ring.partial { border-color: var(--rose-light); background: var(--cream2); color: var(--brown-dark); }
        .ov-ring.empty { border-style: dashed; border-color: var(--muted); color: var(--muted); }
        
        .ov-label {
          font-size: 10px;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: var(--muted);
        }

        .section-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 22px;
          font-weight: 600;
          color: var(--brown-dark);
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .sub-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 20px;
          font-weight: 600;
          color: var(--brown-dark);
          margin-bottom: 4px;
          display: flex;
          align-items: baseline;
          gap: 8px;
        }
        .pts-badge {
          font-size: 11px;
          color: var(--muted);
          font-family: 'DM Sans', sans-serif;
          font-weight: 400;
        }

        .date-sel {
          display: flex;
          gap: 8px;
          margin-bottom: 16px;
        }
        .date-sel select {
          background: var(--white);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 7px 12px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          color: var(--brown-mid);
          cursor: pointer;
          outline: none;
          transition: border-color 0.2s;
        }
        .date-sel select:focus {
          border-color: var(--rose-light);
        }

        .checklist { display: flex; flex-direction: column; gap: 10px; margin-bottom: 32px; }
        .check-item {
          background: var(--white);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 14px 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          transition: border-color 0.2s, background 0.15s, transform 0.15s;
        }
        .check-item:hover {
          border-color: var(--rose-light);
          background: #FFFBFD;
          transform: translateX(3px);
        }
        .check-circle {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          border: 1.5px solid var(--rose-light);
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          transition: all 0.15s;
          color: transparent;
        }
        .check-circle.done {
          background: var(--rose);
          border-color: var(--rose);
          color: #white;
        }
        .check-text { flex: 1; }
        .check-name { font-size: 14px; font-weight: 550; color: var(--brown-text); line-height: 1.4; }
        .check-cat { font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase; color: var(--muted); margin-top: 2.5px; }
        .check-pts {
          font-size: 12px;
          font-weight: 500;
          color: var(--rose);
          background: var(--rose-bg);
          padding: 3px 9px;
          border-radius: 6px;
          flex-shrink: 0;
        }

        .sub-section { margin-bottom: 28px; }

        .form-card {
          background: var(--white);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 20px;
          margin-top: 12px;
          box-shadow: 0 4px 20px rgba(200, 100, 122, 0.02);
        }
        .field-label {
          font-size: 10px;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: var(--muted);
          margin-bottom: 6px;
          display: block;
        }
        .inp {
          width: 100%;
          background: var(--cream2);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 10px 13px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          color: var(--brown-text);
          outline: none;
          transition: border-color 0.2s, background-color 0.2s;
        }
        .inp:focus { border-color: var(--rose-light); background: var(--white); }
        textarea.inp { resize: vertical; min-height: 90px; line-height: 1.7; }
        
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 14px; }
        .form-single { margin-bottom: 14px; }
        
        .btn-primary {
          background: var(--rose);
          border: none;
          border-radius: 9px;
          padding: 12px 20px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 500;
          color: #fff;
          cursor: pointer;
          width: 100%;
          transition: background-color 0.2s, transform 0.1s;
          box-shadow: 0 2px 6px rgba(200, 100, 122, 0.2);
        }
        .btn-primary:hover { background: #B35267; }
        .btn-primary:active { transform: scale(0.99); }

        .riwayat-container {
          max-height: 250px;
          overflow-y: auto;
          margin-top: 14px;
          padding-right: 2px;
        }
        .riwayat-container::-webkit-scrollbar {
          width: 4px;
        }
        .riwayat-container::-webkit-scrollbar-thumb {
          background: var(--rose-light);
          border-radius: 2px;
        }
        .riwayat-box {
          background: var(--rose-bg);
          border: 1px solid var(--border2);
          border-radius: 9px;
          padding: 10px 14px;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }
        .riwayat-text { font-size: 13px; color: var(--brown-mid); font-weight: 500; }
        .riwayat-time { font-size: 11px; color: var(--muted); margin-top: 2px; }
        .riwayat-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .riwayat-pts {
          font-size: 12px;
          font-weight: 500;
          color: var(--rose);
          background: var(--white);
          border: 1px solid var(--border2);
          padding: 3px 9px;
          border-radius: 6px;
          flex-shrink: 0;
        }
        .riwayat-delete {
          background: none;
          border: none;
          color: var(--muted);
          cursor: pointer;
          font-size: 12px;
          transition: color 0.2s;
        }
        .riwayat-delete:hover { color: var(--rose); }

        .mood-chips { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 16px; }
        .mood-chip {
          padding: 8px 15px;
          border-radius: 20px;
          border: 1px solid var(--border);
          font-size: 13px;
          cursor: pointer;
          background: var(--cream2);
          color: var(--brown-mid);
          display: flex;
          align-items: center;
          gap: 5px;
          transition: all 0.15s;
          user-select: none;
        }
        .mood-chip:hover { border-color: var(--rose-light); }
        .mood-chip.active { background: var(--rose-bg); border-color: var(--rose-light); color: var(--rose); font-weight: bold; }

        .jurnal-prev {
          background: var(--rose-bg);
          border: 1px solid var(--border2);
          border-radius: 9px;
          padding: 13px 15px;
          margin-top: 14px;
          box-shadow: inset 0 1px 3px rgba(200, 100, 122, 0.02);
        }
        .jurnal-prev-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 7px; }
        .jurnal-mood { font-size: 12px; color: var(--rose); font-weight: 600; }
        .jurnal-date { font-size: 11px; color: var(--muted); }
        .jurnal-text { font-size: 13px; color: var(--brown-mid); line-height: 1.7; font-style: italic; font-family: 'Cormorant Garamond', serif; font-size: 15px; }

        .sidebar-card {
          background: var(--white);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 16px 18px;
        }
        .side-title {
          font-size: 10px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: var(--muted);
          margin-bottom: 14px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .weekly-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 9px 0;
          border-bottom: 1px solid #F5F0EB;
        }
        .weekly-row:last-child { border-bottom: none; padding-bottom: 0; }
        .weekly-key { font-size: 13px; color: var(--brown-mid); }
        .weekly-val { font-size: 13px; font-weight: 500; color: var(--brown-dark); }
        .weekly-val.accent { color: var(--rose); font-weight: 700; }

        .badge-row { display: flex; gap: 8px; flex-wrap: wrap; }
        .badge {
          background: var(--rose-bg);
          border: 1px solid var(--border2);
          border-radius: 9px;
          padding: 10px 8px;
          text-align: center;
          flex: 1;
          min-width: 56px;
          transition: all 0.2s;
        }
        .badge:hover {
          border-color: var(--rose-light);
          transform: scale(1.05);
        }
        .badge-icon { font-size: 18px; margin-bottom: 4px; }
        .badge-name { font-size: 10px; color: var(--muted); letter-spacing: 0.5px; }

        .ai-card {
          background: linear-gradient(135deg, #FFFDFE 0%, #FFF2F6 100%);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 18px;
          box-shadow: 0 4px 15px rgba(200, 100, 122, 0.02);
        }
        .ai-title {
          font-size: 10px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: var(--rose);
          margin-bottom: 10px;
          font-weight: bold;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .ai-text {
          font-size: 13px;
          line-height: 1.75;
          color: var(--brown-dark);
          font-style: italic;
          font-family: 'Cormorant Garamond', serif;
          font-size: 15px;
        }
        .ai-btn {
          background: var(--rose);
          border: none;
          border-radius: 8px;
          padding: 10px 14px;
          font-family: 'DM Sans', sans-serif;
          font-size: 12.5px;
          color: #fff;
          cursor: pointer;
          margin-top: 14px;
          width: 100%;
          transition: background-color 0.2s;
        }
        .ai-btn:hover { background: #B35267; }

        .notes-card {
          background: var(--rose-bg);
          border: 1px solid var(--border2);
          border-radius: 12px;
          padding: 16px 18px;
        }
        .notes-title {
          font-size: 10px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: var(--muted);
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 6px;
          font-weight: bold;
        }
        .notes-item {
          font-size: 12.5px;
          color: var(--brown-mid);
          line-height: 1.75;
          padding: 9px 0;
          border-bottom: 1px solid var(--border);
        }
        .notes-item:last-child { border-bottom: none; padding-bottom: 0; }
        .notes-item strong { color: var(--brown-dark); font-weight: 600; display: block; margin-bottom: 2px; }

        .progress-thin {
          height: 4px;
          background: var(--cream2);
          border-radius: 2px;
          overflow: hidden;
          margin-bottom: 14px;
          width: 100%;
        }
        .progress-thin-fill {
          height: 100%;
          background: var(--rose);
          transition: width 0.4s ease;
          width: 0%;
        }

        /* ── INTERACTIVE DIGITAL TASBIH & WATER WIDGETS ── */
        .tasbih-card {
          background: var(--white);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 20px;
        }
        .tasbih-title {
          font-size: 10px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: var(--muted);
          margin-bottom: 12px;
          font-weight: bold;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .tasbih-btn-round {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          border: none;
          background: linear-gradient(135deg, var(--rose-light), var(--rose));
          color: white;
          font-size: 20px;
          font-weight: bold;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 15px rgba(200, 100, 122, 0.25);
          transition: all 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          user-select: none;
        }
        .tasbih-btn-round:hover {
          transform: scale(1.05);
          box-shadow: 0 6px 18px rgba(200, 100, 122, 0.3);
        }
        .tasbih-btn-round:active {
          transform: scale(0.95);
        }

        .tasbih-reset-btn {
          background: var(--rose-bg);
          border: 1px solid var(--border2);
          border-radius: 20px;
          padding: 6px 20px;
          font-size: 11px;
          font-weight: bold;
          color: var(--rose);
          cursor: pointer;
          transition: all 0.2s;
          margin-top: 12px;
          outline: none;
        }
        .tasbih-reset-btn:hover {
          background: var(--rose);
          color: white;
          border-color: var(--rose);
        }
        
        .water-card {
          background: var(--white);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 16px 18px;
        }
        .water-title {
          font-size: 10px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: var(--muted);
          margin-bottom: 12px;
          font-weight: bold;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .glass-icon {
          font-size: 24px;
          cursor: pointer;
          transition: all 0.2s;
          user-select: none;
        }
        .glass-icon.empty {
          opacity: 0.25;
          filter: grayscale(100%);
        }
        .glass-icon:hover {
          transform: scale(1.15);
        }

        /* ── NEW SIDEBAR DECORATIVE WIDGETS ── */
        .khatam-card {
          background: var(--white);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 16px 18px;
        }
        .khatam-inputs {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-top: 10px;
        }
        .khatam-btn-small {
          background: var(--rose-bg);
          border: 1px solid var(--border2);
          border-radius: 6px;
          padding: 4px 8px;
          font-size: 10.5px;
          font-weight: 500;
          color: var(--rose);
          cursor: pointer;
          transition: all 0.2s;
        }
        .khatam-btn-small:hover {
          background: var(--rose-light);
          color: white;
        }

        .gratitude-card {
          background: var(--white);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 16px 18px;
        }
        .gratitude-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: var(--brown-mid);
          margin-bottom: 8.5px;
          cursor: pointer;
          user-select: none;
          line-height: 1.45;
        }
        .gratitude-item:last-child { margin-bottom: 0; }
        .gratitude-chk {
          width: 16px;
          height: 16px;
          border-radius: 4px;
          border: 1px solid var(--rose-light);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          color: transparent;
          flex-shrink: 0;
        }
        .gratitude-chk.done {
          background: var(--rose);
          border-color: var(--rose);
          color: white;
        }

        .sedekah-card {
          background: var(--white);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 16px 18px;
          text-align: center;
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .sedekah-reset-btn {
          background: var(--rose-bg);
          border: 1px solid var(--border2);
          border-radius: 20px;
          padding: 6px 14px;
          font-size: 11px;
          font-weight: bold;
          color: var(--rose);
          cursor: pointer;
          transition: all 0.2s;
          outline: none;
        }
        .sedekah-reset-btn:hover {
          background: var(--rose);
          color: white;
          border-color: var(--rose);
        }
        .sedekah-jar {
          width: 80px;
          height: 90px;
          border: 3px solid var(--rose);
          border-radius: 15px 15px 30px 30px;
          margin: 10px auto;
          position: relative;
          background: linear-gradient(to top, rgba(200, 100, 122, 0.15) 30%, transparent 30%);
          transition: background 0.3s ease;
          overflow: hidden;
        }
        .sedekah-lid {
          width: 50px;
          height: 12px;
          background: var(--brown-mid);
          border-radius: 4px;
          position: absolute;
          top: -2px;
          left: 50%;
          transform: translateX(-50%);
        }
        .sedekah-coin {
          position: absolute;
          font-size: 16px;
          top: 10px;
          left: 50%;
          transform: translateX(-50%);
          animation: dropCoin 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }
        @keyframes dropCoin {
          0% { top: -20px; opacity: 0; }
          50% { opacity: 1; }
          100% { top: 50px; opacity: 0; }
        }
      `}</style>

      <div className="app-wrap">
        
        {/* ═══════════ MAIN ═══════════ */}
        <div className="main">
          
          <div className="header-bar">
            <div className="skor-pill">
              ✦ Skor Halal {totalPointsEarned} · {completionPercentage >= 70 ? 'Consistent' : 'Perlu Ditingkatkan'}
            </div>
          </div>

          {/* Brand */}
          <div className="ibadah-brand">
            <div className="ibadah-brand-title flex items-center justify-center gap-3">
              <span className="text-3xl animate-float select-none">🌙</span>
              <span>Ibadahku</span>
              <span className="text-3xl animate-float select-none" style={{ animationDelay: "0.5s" }}>🎀</span>
            </div>
            <div className="ibadah-brand-sub">Ruang Istiqomah Wanita Muslim</div>
          </div>

          {/* Fase */}
          <div className="fase-bar">
            <div className="fase-dot"></div>
            <span className="fase-label">Fase Aktif</span>
            <span className="fase-val">
              <select 
                className="fase-select" 
                value={activePhase}
                onChange={(e) => handlePhaseChange(e.target.value as any)}
              >
                <option value="suci_penuh">✦ Fase Suci Penuh</option>
                <option value="haid">Fase Haid</option>
                <option value="nifas">Fase Nifas</option>
              </select>
            </span>
          </div>

          {/* Hadith */}
          <div className="hadith">
            {currentQuote.text}
            <span>{currentQuote.narrator}</span>
          </div>

          {/* Overview */}
          <div className="overview-title">Overview Kategori Hari Ini</div>
          <div className="overview-grid">
            <div className="ov-card">
              <div className={`ov-ring ${
                activePhase === 'haid' 
                  ? 'empty' 
                  : (() => {
                      const stats = getCatProgress("SHOLAT");
                      if (!stats) return 'empty';
                      return stats.done === stats.total ? 'filled' : (stats.done > 0 ? 'partial' : 'empty');
                    })()
              }`}>
                {activePhase === 'haid' 
                  ? '—' 
                  : (() => {
                      const stats = getCatProgress("SHOLAT");
                      return stats ? `${stats.done}/${stats.total}` : '—';
                    })()
                }
              </div>
              <div className="ov-label">Sholat</div>
            </div>
            
            <div className="ov-card">
              <div className={`ov-ring ${quranPointsEarned === quranMaxPoints ? 'filled' : (quranPointsEarned > 0 ? 'partial' : 'empty')}`}>
                {Math.round((quranPointsEarned / quranMaxPoints) * 100)}%
              </div>
              <div className="ov-label">Tilawah</div>
            </div>

            <div className="ov-card">
              <div className={`ov-ring ${
                (() => {
                  const items = activeAmalans.filter(item => item.kategori === "DZIKIR");
                  if (items.length === 0) return 'empty';
                  const done = items.filter(item => item.checked).length;
                  return done === items.length ? 'filled' : (done > 0 ? 'partial' : 'empty');
                })()
              }`}>
                {activeAmalans.filter(item => item.kategori === "DZIKIR").length > 0 ? `${getDzikirPct()}%` : '—'}
              </div>
              <div className="ov-label">Dzikir</div>
            </div>

            <div className="ov-card">
              <div className={`ov-ring ${
                (() => {
                  const items = activeAmalans.filter(item => item.kategori === "SOSIAL");
                  if (items.length === 0) return 'empty';
                  const done = items.filter(item => item.checked).length;
                  return done === items.length ? 'filled' : (done > 0 ? 'partial' : 'empty');
                })()
              }`}>
                {activeAmalans.filter(item => item.kategori === "SOSIAL").length > 0 ? `${getSosialPct()}%` : '—'}
              </div>
              <div className="ov-label">Sosial</div>
            </div>
          </div>

          {/* Amalan Harian */}
          <div className="section-title">🌸 Amalan Harian Utama</div>
          <div className="date-sel">
            <select value={selectedDay} onChange={(e) => setSelectedDay(parseInt(e.target.value))}>
              {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            <select value={selectedMonth} onChange={(e) => setSelectedMonth(parseInt(e.target.value))}>
              {MONTH_NAMES.map((m, idx) => (
                <option key={idx} value={idx}>{m}</option>
              ))}
            </select>
            <select value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))}>
              <option value={2026}>2026</option>
              <option value={2025}>2025</option>
            </select>
          </div>

          <div className="progress-thin">
            <div className="progress-thin-fill" style={{ width: `${completionPercentage}%` }}></div>
          </div>

          <div className="checklist">
            {activeAmalans.map((item) => (
              <div 
                key={item.id} 
                className="check-item" 
                onClick={() => toggleAmalan(item.id)}
              >
                <div className={`check-circle ${item.checked ? 'done' : ''}`} style={{ color: item.checked ? '#fff' : 'transparent' }}>
                  ✓
                </div>
                <div className="check-text">
                  <div className="check-name">{item.nama}</div>
                  <div className="check-cat">{item.kategori}</div>
                </div>
                <div className="check-pts">+{item.poin} Pts</div>
              </div>
            ))}
          </div>

          {/* Tilawah */}
          <div className="sub-section">
            <div className="sub-title">
              📖 Tilawah Al-Qur'an 
              <span className="pts-badge"> {quranPointsEarned} / {quranMaxPoints} Pts maks</span>
            </div>
            <div className="form-card">
              <form onSubmit={handleAddTilawah}>
                <div className="form-single">
                  <label className="field-label">Pilih Surah</label>
                  <select 
                    className="inp" 
                    value={selectedSurah}
                    onChange={(e) => setSelectedSurah(e.target.value)}
                  >
                    {QURAN_SURAHS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="form-row">
                  <div>
                    <label className="field-label">Mulai Ayat</label>
                    <input 
                      className="inp" 
                      type="number" 
                      value={startAyah}
                      onChange={(e) => setStartAyah(e.target.value)}
                      placeholder="Contoh: 1" 
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="field-label">Sampai Ayat</label>
                    <input 
                      className="inp" 
                      type="number" 
                      value={endAyah}
                      onChange={(e) => setEndAyah(e.target.value)}
                      placeholder="Contoh: 10" 
                      min="1"
                    />
                  </div>
                </div>
                <button type="submit" className="btn-primary">✦ Catat Tilawah</button>
              </form>
              
              <div className="riwayat-container">
                {dayTilawah.length === 0 ? (
                  <p style={{ fontSize: '12px', color: 'var(--muted)', textAlign: 'center', padding: '15px', fontStyle: 'italic' }}>
                    Belum ada tilawah tercatat hari ini.
                  </p>
                ) : (
                  dayTilawah.map((log) => (
                    <div key={log.id} className="riwayat-box">
                      <div>
                        <div className="riwayat-text">QS. {log.surah}: {log.startAyah} – {log.endAyah}</div>
                        <div className="riwayat-time">{log.timestamp}</div>
                      </div>
                      <div className="riwayat-actions">
                        <div className="riwayat-pts">+{log.points} Pts</div>
                        <button className="riwayat-delete" onClick={() => handleDeleteTilawah(log.id)}>✕</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Mood & Jurnal */}
          <div className="sub-section">
            <div className="sub-title">💭 Mood & Jurnal Spiritual</div>
            <div className="form-card">
              <label className="field-label">Bagaimana mood-mu hari ini?</label>
              <div className="mood-chips">
                {["🌸 Tenang", "✨ Semangat", "🍃 Lelah", "🌧️ Sedih"].map((m) => (
                  <div 
                    key={m}
                    className={`mood-chip ${selectedMood === m ? 'active' : ''}`}
                    onClick={() => setSelectedMood(m)}
                  >
                    {m}
                  </div>
                ))}
              </div>
              <form onSubmit={handleSaveJournal}>
                <div className="form-single">
                  <label className="field-label">Catatan Jurnal</label>
                  <textarea 
                    className="inp" 
                    value={journalText}
                    onChange={(e) => setJournalText(e.target.value)}
                    placeholder="Bagaimana kondisi spiritual dan perasaanmu hari ini? Tulis di sini..."
                  />
                </div>
                <button type="submit" className="btn-primary">💾 Simpan Jurnal Harian</button>
              </form>
              
              {currentJournal && (
                <div className="jurnal-prev">
                  <div className="jurnal-prev-top">
                    <span className="jurnal-mood">{currentJournal.mood}</span>
                    <span className="jurnal-date">{currentJournal.date}</span>
                  </div>
                  <div className="jurnal-text">"{currentJournal.text}"</div>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* ═══════════ SIDEBAR ═══════════ */}
        <div className="sidebar">

          {/* Laporan Mingguan */}
          <div className="sidebar-card">
            <div className="side-title">📊 Laporan Mingguan</div>
            <div className="weekly-row">
              <span className="weekly-key">Total Poin Harian</span>
              <span className="weekly-val accent">{totalPointsEarned} Pts</span>
            </div>
            <div className="weekly-row">
              <span className="weekly-key">Kepatuhan Ibadah</span>
              <span className="weekly-val">{completionPercentage}%</span>
            </div>
            <div className="weekly-row">
              <span className="weekly-key">Mood Dominan</span>
              <span className="weekly-val">{currentJournal ? currentJournal.mood : '🌸 Tenang'}</span>
            </div>
            <div className="weekly-row">
              <span className="weekly-key">Prediksi Siklus</span>
              <span className="weekly-val">25 Jun 2026</span>
            </div>
          </div>

          {/* Pencapaian */}
          <div className="sidebar-card">
            <div className="side-title">🏆 Pencapaian & Badge</div>
            <div className="badge-row">
              <div className="badge" title="Mencatat sholat lengkap 5x">
                <div className="badge-icon">🕌</div>
                <div className="badge-name">Sholat 5x</div>
              </div>
              <div className="badge" title="Mencatat Quran log harian">
                <div className="badge-icon">📖</div>
                <div className="badge-name">Tilawah</div>
              </div>
              <div className="badge" title="Semua amalan utama selesai">
                <div className="badge-icon">⭐</div>
                <div className="badge-name">Sempurna</div>
              </div>
              <div className="badge" title="Ibadah 3 hari konsisten">
                <div className="badge-icon">💎</div>
                <div className="badge-name">Combo</div>
              </div>
            </div>
          </div>

          {/* AI Advisor */}
          <div className="ai-card">
            <div className="ai-title">🎀 Analisis AI Advisor ✨</div>
            <div className="ai-text">
              {activePhase === 'haid' 
                ? '"Alhamdulillah, keistiqomahan amalan alternatifmu selama masa haid sangat baik. Tetap jaga kesehatan spiritualmu dengan dzikir pagi petang."'
                : '"Ibadah Anda konsisten! Pertahankan kebiasaan sholat tepat waktu, dan luangkan waktu untuk murottal sehabis Maghrib nanti."'
              }
            </div>
            <Link href="/ai-advisor" className="ai-btn text-center block">
              Konsultasi AI Advisor →
            </Link>
          </div>

          {/* Notes & Reminders */}
          <div className="notes-card">
            <div className="notes-title">💖 Notes &amp; Reminders 📝</div>
            <div className="notes-item">
              <strong>Jumat Reminder</strong>
              Jangan lupa potong kuku, mandi sunnah, self grooming, dan perbanyak membaca shalawat sejak Kamis malam.
            </div>
            <div className="notes-item">
              <strong>Self Care Note</strong>
              Istirahat yang cukup selama hari-hari awal siklus haid, jaga hidrasi tubuh, dan tetap dzikir pagi petang.
            </div>
          </div>

          {/* Tasbih Digital (Interactive Widget) */}
          <div className="tasbih-card">
            <div className="tasbih-title">📿 Tasbih Digital 🌸</div>
            <div className="flex flex-col items-center gap-2.5">
              <select 
                className="inp text-xs w-full py-1.5" 
                value={selectedDhikr} 
                onChange={(e) => changeDhikr(e.target.value)}
              >
                <option value="Subhanallah">Subhanallah</option>
                <option value="Alhamdulillah">Alhamdulillah</option>
                <option value="Allahu Akbar">Allahu Akbar</option>
                <option value="Astagfirullah">Astagfirullah</option>
                <option value="Shalawat Nabi">Shalawat Nabi</option>
              </select>
              
              <div className="flex flex-col items-center mt-3 mb-1 w-full">
                <button 
                  className="tasbih-btn-round" 
                  onClick={incrementTasbih}
                  title="Klik untuk menghitung"
                >
                  {tasbihCount}
                </button>
                <button 
                  className="tasbih-reset-btn"
                  onClick={resetTasbih}
                >
                  Reset Counter
                </button>
              </div>
              <span className="text-[10px] text-muted italic mt-2">Simpan otomatis di penyimpanan lokal</span>
            </div>
          </div>

          {/* Water Hydration Tracker (Interactive Widget) */}
          <div className="water-card">
            <div className="water-title">💧 Hidrasi Harian 🥛</div>
            <div className="flex flex-col items-center gap-2">
              <div className="flex gap-1.5 flex-wrap justify-center">
                {Array.from({ length: 8 }).map((_, idx) => (
                  <span 
                    key={idx} 
                    className={`glass-icon ${idx >= waterCount ? 'empty' : ''}`}
                    onClick={() => toggleGlass(idx)}
                    title={`Klik untuk mengisi ${idx + 1} gelas`}
                  >
                    🥛
                  </span>
                ))}
              </div>
              <span className="text-xs font-bold text-brown-mid mt-1">
                Kebutuhan: {waterCount} / 8 Gelas
              </span>
              <span className="text-[10px] text-muted italic">Target: 2 Liter sehari agar tubuh bugar</span>
            </div>
          </div>

          {/* Target Khatam Qur'an (New Widget) */}
          <div className="khatam-card">
            <div className="side-title">📖 Target Khatam Qur'an</div>
            <div className="flex flex-col gap-2.5 mt-2">
              <div className="flex justify-between text-xs text-brown-mid">
                <span>Progress Khatam:</span>
                <span className="font-bold">{Math.min(100, Math.round((khatamCurrentPage / 604) * 100))}%</span>
              </div>
              <div className="progress-thin mb-1">
                <div 
                  className="progress-thin-fill" 
                  style={{ width: `${Math.min(100, Math.round((khatamCurrentPage / 604) * 100))}%` }}
                ></div>
              </div>
              <div className="flex justify-between items-center text-xs text-brown-dark font-medium">
                <span>Juz {khatamCurrentJuz} / 30</span>
                <span>Hal. {khatamCurrentPage} / 604</span>
              </div>
              <div className="khatam-inputs">
                <div>
                  <label className="text-[9px] text-muted uppercase tracking-wider block mb-1">Set Juz</label>
                  <input 
                    type="number" 
                    className="inp py-1 text-xs" 
                    value={khatamCurrentJuz}
                    min="1"
                    max="30"
                    onChange={(e) => updateKhatamJuz(parseInt(e.target.value) || 1)}
                  />
                </div>
                <div>
                  <label className="text-[9px] text-muted uppercase tracking-wider block mb-1">Set Halaman</label>
                  <input 
                    type="number" 
                    className="inp py-1 text-xs" 
                    value={khatamCurrentPage}
                    min="1"
                    max="604"
                    onChange={(e) => updateKhatamPage(parseInt(e.target.value) || 1)}
                  />
                </div>
              </div>
              <div className="flex gap-2.5 mt-1">
                <button 
                  className="khatam-btn-small flex-1" 
                  onClick={() => updateKhatamPage(khatamCurrentPage + 1)}
                >
                  +1 Halaman
                </button>
                <button 
                  className="khatam-btn-small flex-1" 
                  onClick={() => updateKhatamJuz(khatamCurrentJuz + 1)}
                >
                  +1 Juz
                </button>
              </div>
            </div>
          </div>

          {/* Daily Gratitude (New Widget) */}
          <div className="gratitude-card">
            <div className="side-title">🌸 Daily Gratitude &amp; Little Joys</div>
            <div className="flex flex-col gap-2 mt-2">
              {GRATITUDE_TEMPLATES.map((item) => {
                const checked = gratitudeChecks[item.id] || false;
                return (
                  <div 
                    key={item.id} 
                    className="gratitude-item" 
                    onClick={() => toggleGratitude(item.id)}
                  >
                    <div className={`gratitude-chk ${checked ? 'done' : ''}`}>✓</div>
                    <span>{item.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Celengan Sedekah Subuh (New Widget) */}
          <div className="sedekah-card">
            <div className="side-title">🪙 Celengan Sedekah Subuh</div>
            <div className="flex flex-col items-center justify-center flex-grow py-3">
              <div className="sedekah-jar">
                <div className="sedekah-lid"></div>
                <div 
                  className="w-full bg-[#C8647A]/35 absolute bottom-0 transition-all duration-300" 
                  style={{ height: `${Math.min(100, sedekahCount * 10)}%` }}
                />
                {sedekahCount > 0 && <div className="sedekah-coin">🪙</div>}
              </div>
              <span className="text-xs font-bold text-brown-dark mt-2">
                Terkumpul: Rp {(sedekahCount * 2000).toLocaleString("id-ID")}
              </span>
            </div>
            <div className="flex gap-2.5 w-full mt-2">
              <button 
                className="btn-primary py-2 text-[11px] flex-1 animate-pulse-ring" 
                onClick={addSedekah}
              >
                Sedekah Hari Ini 🪙
              </button>
              <button 
                className="sedekah-reset-btn" 
                onClick={resetSedekah}
              >
                Reset
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
