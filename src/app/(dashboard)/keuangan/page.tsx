"use client";

import React, { useState, useEffect } from "react";
import { Plus, TrendingUp, TrendingDown, HelpCircle, Heart, Star, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

// ==========================================
// CONSTANTS & DICTIONARIES
// ==========================================
const PRAYER_HADITH = {
  text: '"Mencari rezeki yang halal adalah kewajiban setelah kewajiban beribadah."',
  narrator: "— Hadits Riwayat Thabrani"
};

interface Transaction {
  id: string | number;
  desc: string;
  amount: number;
  type: "pemasukan" | "pengeluaran";
  category: string;
  tag: "halal" | "syubhat" | "pokok" | "sekunder" | "boros";
  date: string;
  dateKey: string;
}

interface Debt {
  id: string | number;
  person: string;
  amount: number;
  type: "utang" | "piutang"; // utang: saya utang ke orang, piutang: orang utang ke saya
  settled: boolean;
  date: string;
}

export default function KeuanganSyariahPage() {
  const [mounted, setMounted] = useState(false);
  const [supabase] = useState(() => createClient());
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // States
  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: 1, desc: "Gaji Bulanan Kerja", amount: 4500000, type: "pemasukan", category: "Gaji", tag: "halal", date: "1 Juni 2026", dateKey: "2026-05-01" },
    { id: 2, desc: "Beli Makan Siang", amount: 45000, type: "pengeluaran", category: "Makanan", tag: "pokok", date: "1 Juni 2026", dateKey: "2026-06-01" },
    { id: 3, desc: "Sewa Kosan", amount: 1200000, type: "pengeluaran", category: "Kebutuhan Pokok", tag: "pokok", date: "30 Mei 2026", dateKey: "2026-05-30" },
    { id: 4, desc: "Langganan Netflix", amount: 186000, type: "pengeluaran", category: "Gaya Hidup", tag: "boros", date: "28 Mei 2026", dateKey: "2026-05-28" },
    { id: 5, desc: "Belanja Bulanan Makanan", amount: 150000, type: "pengeluaran", category: "Kebutuhan Pokok", tag: "pokok", date: "27 Mei 2026", dateKey: "2026-05-27" },
    { id: 6, desc: "Hasil Jual Kue", amount: 250000, type: "pemasukan", category: "Hasil Dagang", tag: "halal", date: "27 Mei 2026", dateKey: "2026-05-27" },
  ]);

  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"pemasukan" | "pengeluaran">("pengeluaran");
  const [category, setCategory] = useState("Makanan");
  const [tag, setTag] = useState<"halal" | "syubhat" | "pokok" | "sekunder" | "boros">("pokok");
  const [filter, setFilter] = useState("semua");

  // Catatan Utang States
  const [debts, setDebts] = useState<Debt[]>([
    { id: 1, person: "Salsa (Pinjam Gofood)", amount: 35000, type: "piutang", settled: false, date: "1 Juni 2026" },
    { id: 2, person: "Uang Kas Kelompok", amount: 50000, type: "utang", settled: false, date: "30 Mei 2026" },
  ]);
  const [debtPerson, setDebtPerson] = useState("");
  const [debtAmount, setDebtAmount] = useState("");
  const [debtType, setDebtType] = useState<"utang" | "piutang">("piutang");

  // Date selection states for new transactions
  const [txDay, setTxDay] = useState(new Date().getDate().toString());
  const [txMonth, setTxMonth] = useState("Juni");
  const [txYear, setTxYear] = useState("2026");

  useEffect(() => {
    setMounted(true);
    const loadData = async () => {
      // Check user session
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        
        // Load transactions from Supabase
        const { data: txData, error: txError } = await supabase
          .from("syariah_transactions")
          .select("*")
          .order("created_at", { ascending: false });
        if (txData && txData.length > 0) {
          setTransactions(txData.map(t => ({
            id: t.id,
            desc: t.description,
            amount: Number(t.amount),
            type: t.type,
            category: t.category,
            tag: t.tag,
            date: t.date,
            dateKey: t.date_key
          })));
        } else if (txError) {
          console.error("Error loading transactions:", txError);
        }

        // Load debts from Supabase
        const { data: debtData, error: debtError } = await supabase
          .from("syariah_debts")
          .select("*")
          .order("created_at", { ascending: false });
        if (debtData && debtData.length > 0) {
          setDebts(debtData.map(d => ({
            id: d.id,
            person: d.person,
            amount: Number(d.amount),
            type: d.type,
            settled: d.settled,
            date: d.date
          })));
        } else if (debtError) {
          console.error("Error loading debts:", debtError);
        }
      } else {
        // Fallback to localStorage
        const savedTx = localStorage.getItem("syariah-transactions");
        if (savedTx) {
          setTransactions(JSON.parse(savedTx));
        }
        const savedDebts = localStorage.getItem("syariah-debts");
        if (savedDebts) {
          setDebts(JSON.parse(savedDebts));
        }
      }
      setLoading(false);
    };
    loadData();
  }, [supabase]);

  const handleTypeChange = (newType: "pemasukan" | "pengeluaran") => {
    setType(newType);
    if (newType === "pemasukan") {
      setTag("halal");
      setCategory("Gaji");
    } else {
      setTag("pokok");
      setCategory("Makanan");
    }
  };

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc || !amount) return;

    const parsedAmount = parseFloat(amount);
    const newTxLocal = {
      desc,
      amount: parsedAmount,
      type,
      category,
      tag,
      date: `${txDay} ${txMonth} ${txYear}`,
      dateKey: `${txYear}-${txMonth}-${txDay}`
    };

    if (userId) {
      const { data, error } = await supabase
        .from("syariah_transactions")
        .insert([{
          user_id: userId,
          description: newTxLocal.desc,
          amount: newTxLocal.amount,
          type: newTxLocal.type,
          category: newTxLocal.category,
          tag: newTxLocal.tag,
          date: newTxLocal.date,
          date_key: newTxLocal.dateKey
        }])
        .select()
        .single();
      
      if (error) {
        console.error("Error inserting transaction:", error);
      } else if (data) {
        const newTx: Transaction = {
          id: data.id,
          desc: data.description,
          amount: Number(data.amount),
          type: data.type,
          category: data.category,
          tag: data.tag,
          date: data.date,
          dateKey: data.date_key
        };
        setTransactions(prev => [newTx, ...prev]);
      }
    } else {
      const newTx: Transaction = {
        id: Date.now(),
        ...newTxLocal
      };
      const nextList = [newTx, ...transactions];
      setTransactions(nextList);
      localStorage.setItem("syariah-transactions", JSON.stringify(nextList));
    }

    setDesc("");
    setAmount("");
  };

  const handleDeleteTransaction = async (id: string | number) => {
    if (userId) {
      const { error } = await supabase
        .from("syariah_transactions")
        .delete()
        .eq("id", id);
      if (error) {
        console.error("Error deleting transaction:", error);
      } else {
        setTransactions(prev => prev.filter((t) => t.id !== id));
      }
    } else {
      const nextList = transactions.filter((t) => t.id !== id);
      setTransactions(nextList);
      localStorage.setItem("syariah-transactions", JSON.stringify(nextList));
    }
  };

  const handleAddDebt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!debtPerson || !debtAmount) return;

    const parsedAmount = parseFloat(debtAmount);
    const newDebtLocal = {
      person: debtPerson,
      amount: parsedAmount,
      type: debtType,
      settled: false,
      date: `${new Date().getDate()} ${txMonth} ${txYear}`
    };

    if (userId) {
      const { data, error } = await supabase
        .from("syariah_debts")
        .insert([{
          user_id: userId,
          person: newDebtLocal.person,
          amount: newDebtLocal.amount,
          type: newDebtLocal.type,
          settled: newDebtLocal.settled,
          date: newDebtLocal.date
        }])
        .select()
        .single();

      if (error) {
        console.error("Error inserting debt:", error);
      } else if (data) {
        const newDebt: Debt = {
          id: data.id,
          person: data.person,
          amount: Number(data.amount),
          type: data.type,
          settled: data.settled,
          date: data.date
        };
        setDebts(prev => [newDebt, ...prev]);
      }
    } else {
      const newDebt: Debt = {
        id: Date.now(),
        ...newDebtLocal
      };
      const nextList = [...debts, newDebt];
      setDebts(nextList);
      localStorage.setItem("syariah-debts", JSON.stringify(nextList));
    }

    setDebtPerson("");
    setDebtAmount("");
  };

  const handleToggleSettleDebt = async (id: string | number) => {
    const debtToUpdate = debts.find(d => d.id === id);
    if (!debtToUpdate) return;
    const nextSettled = !debtToUpdate.settled;

    if (userId) {
      const { error } = await supabase
        .from("syariah_debts")
        .update({ settled: nextSettled })
        .eq("id", id);
      if (error) {
        console.error("Error updating debt:", error);
      } else {
        setDebts(prev => prev.map(d => d.id === id ? { ...d, settled: nextSettled } : d));
      }
    } else {
      const nextList = debts.map(d => d.id === id ? { ...d, settled: nextSettled } : d);
      setDebts(nextList);
      localStorage.setItem("syariah-debts", JSON.stringify(nextList));
    }
  };

  const handleDeleteDebt = async (id: string | number) => {
    if (userId) {
      const { error } = await supabase
        .from("syariah_debts")
        .delete()
        .eq("id", id);
      if (error) {
        console.error("Error deleting debt:", error);
      } else {
        setDebts(prev => prev.filter(d => d.id !== id));
      }
    } else {
      const nextList = debts.filter(d => d.id !== id);
      setDebts(nextList);
      localStorage.setItem("syariah-debts", JSON.stringify(nextList));
    }
  };
  // Finance calculations
  const totalPemasukanHalal = transactions
    .filter((tx) => tx.type === "pemasukan" && tx.tag === "halal")
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalPengeluaran = transactions
    .filter((tx) => tx.type === "pengeluaran")
    .reduce((sum, tx) => sum + tx.amount, 0);

  const tabunganBersih = totalPemasukanHalal - totalPengeluaran;

  const handleDownloadCSV = () => {
    if (transactions.length === 0) {
      alert("Belum ada transaksi untuk diunduh.");
      return;
    }
    const headers = ["Tanggal", "Keterangan", "Kategori", "Tag Syariah", "Debit (Pemasukan)", "Kredit (Pengeluaran)"];
    const rows = transactions.map(tx => [
      tx.date,
      tx.desc,
      tx.category,
      getTagLabel(tx.tag),
      tx.type === "pemasukan" ? tx.amount : 0,
      tx.type === "pengeluaran" ? tx.amount : 0
    ]);
    
    const csvString = [headers.join(","), ...rows.map(row => row.map(val => `"${val}"`).join(","))].join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Jurnal_Baitul_Maal_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintReport = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Gagal membuka jendela cetak. Pastikan pop-up blocker dinonaktifkan.");
      return;
    }
    
    const piutangVal = debts.filter(d => d.type === "piutang" && !d.settled).reduce((sum, d) => sum + d.amount, 0);
    const utangVal = debts.filter(d => d.type === "utang" && !d.settled).reduce((sum, d) => sum + d.amount, 0);
    const netWorth = tabunganBersih + piutangVal - utangVal;

    const transactionRows = transactions.map(t => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${t.date}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${t.desc}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${t.category}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right; color: #047857;">${t.type === 'pemasukan' ? formatRupiah(t.amount) : '-'}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right; color: #be123c;">${t.type === 'pengeluaran' ? formatRupiah(t.amount) : '-'}</td>
      </tr>
    `).join("");

    printWindow.document.write(`
      <html>
        <head>
          <title>Laporan Keuangan Baitul Maal</title>
          <style>
            body { font-family: 'DM Sans', sans-serif; color: #333; padding: 40px; line-height: 1.6; }
            .header { text-align: center; border-bottom: 3px double #C8647A; padding-bottom: 20px; margin-bottom: 30px; }
            .title { font-size: 26px; color: #C8647A; font-weight: bold; }
            .subtitle { font-size: 14px; color: #666; text-transform: uppercase; letter-spacing: 1px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px; }
            .section-title { font-size: 16px; border-bottom: 2px solid #C8647A; color: #C8647A; padding-bottom: 5px; margin-bottom: 15px; font-weight: bold; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 13px; }
            th { background: #FFF0F4; color: #C8647A; padding: 10px; font-weight: bold; border-bottom: 2px solid #C8647A; }
            .total-row { font-weight: bold; background: #FFF0F4; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">LAPORAN KEUANGAN SYARIAH</div>
            <div class="subtitle">Baitul Maalku — Personal Bookkeeping</div>
            <div style="font-size: 11px; color: #888; margin-top: 5px;">Dicetak pada: ${new Date().toLocaleDateString('id-ID')}</div>
          </div>

          <div class="grid">
            <div>
              <div class="section-title">LAPORAN LABA RUGI (SURPLUS/DEFISIT)</div>
              <table>
                <tr><td style="padding: 6px 0;">Total Pemasukan Halal:</td><td style="text-align: right; font-weight: bold; color: #047857;">${formatRupiah(totalPemasukanHalal)}</td></tr>
                <tr><td style="padding: 6px 0; border-bottom: 1px solid #ddd;">Total Pengeluaran:</td><td style="text-align: right; font-weight: bold; color: #be123c; border-bottom: 1px solid #ddd;">(${formatRupiah(totalPengeluaran)})</td></tr>
                <tr class="total-row"><td style="padding: 8px 0;">Surplus / Defisit Bersih:</td><td style="text-align: right; font-weight: bold; color: ${tabunganBersih >= 0 ? '#047857' : '#be123c'}">${formatRupiah(tabunganBersih)}</td></tr>
              </table>
            </div>
            
            <div>
              <div class="section-title">LAPORAN POSISI KEUANGAN (NERACA)</div>
              <table>
                <tr><td style="padding: 6px 0;">Kas &amp; Setara Kas:</td><td style="text-align: right;">${formatRupiah(tabunganBersih)}</td></tr>
                <tr><td style="padding: 6px 0;">Piutang Lancar (Tagihan Bestie):</td><td style="text-align: right; color: #047857;">+${formatRupiah(piutangVal)}</td></tr>
                <tr><td style="padding: 6px 0; border-bottom: 1px solid #ddd;">Utang Lancar (Kewajiban):</td><td style="text-align: right; color: #be123c; border-bottom: 1px solid #ddd;">-${formatRupiah(utangVal)}</td></tr>
                <tr class="total-row"><td style="padding: 8px 0;">Ekuitas Bersih (Net Worth):</td><td style="text-align: right; font-weight: bold;">${formatRupiah(netWorth)}</td></tr>
              </table>
            </div>
          </div>

          <div class="section-title">JURNAL UMUM TRANSAKSI</div>
          <table>
            <thead>
              <tr>
                <th style="text-align: left;">Tanggal</th>
                <th style="text-align: left;">Keterangan</th>
                <th style="text-align: left;">Kategori</th>
                <th style="text-align: right;">Debit (Masuk)</th>
                <th style="text-align: right;">Kredit (Keluar)</th>
              </tr>
            </thead>
            <tbody>
              ${transactionRows}
            </tbody>
          </table>

          <div style="margin-top: 40px; text-align: center; font-size: 11px; color: #888; border-top: 1px solid #ddd; padding-top: 15px;">
            Laporan ini dibuat secara otomatis melalui sistem pencatatan keuangan syariah digital Halal Habit Tracker.
          </div>
          
          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Budgets
  const spentPokok = transactions
    .filter((tx) => tx.type === "pengeluaran" && tx.tag === "pokok")
    .reduce((sum, tx) => sum + tx.amount, 0);

  const spentSekunder = transactions
    .filter((tx) => tx.type === "pengeluaran" && tx.tag === "sekunder")
    .reduce((sum, tx) => sum + tx.amount, 0);

  const spentBoros = transactions
    .filter((tx) => tx.type === "pengeluaran" && tx.tag === "boros")
    .reduce((sum, tx) => sum + tx.amount, 0);

  // Zakat Nisab calculations (85 grams of gold ~ Rp 85.000.000)
  const ZAKAT_NISAB = 85000000;
  const zakatProgressPct = Math.min(100, Math.round((Math.max(0, tabunganBersih) / ZAKAT_NISAB) * 100));

  const formatRupiah = (num: number) => {
    return "Rp " + new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(num);
  };

  const getTagLabel = (tag: string) => {
    switch (tag) {
      case "halal": return "Halal & Tayyib";
      case "syubhat": return "Syubhat / Riba";
      case "pokok": return "Kebutuhan Pokok";
      case "sekunder": return "Kenyamanan";
      case "boros": return "Boros / Mubazir";
      default: return tag;
    }
  };

  const filteredTransactions = transactions.filter((tx) => {
    if (filter === "semua") return true;
    if (filter === "pemasukan") return tx.type === "pemasukan";
    if (filter === "pengeluaran") return tx.type === "pengeluaran";
    return tx.tag === filter;
  });

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

        .keuangan-brand {
          text-align: center;
          margin-bottom: 24px;
          padding: 28px 24px;
          background: linear-gradient(135deg, #FFF5F7 0%, #FFFDFD 50%, #FFF2F6 100%);
          border: 2px dashed rgba(200, 100, 122, 0.25);
          border-radius: 24px;
          box-shadow: inset 0 0 15px rgba(200, 100, 122, 0.04), 0 6px 30px rgba(200, 100, 122, 0.03);
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        .keuangan-brand::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background-image: radial-gradient(rgba(200, 100, 122, 0.08) 1.5px, transparent 1.5px);
          background-size: 16px 16px;
          pointer-events: none;
          opacity: 0.75;
        }
        .keuangan-brand-decor-left, .keuangan-brand-decor-right {
          font-size: 26px;
          user-select: none;
          display: inline-block;
          animation: floatSlow 3s ease-in-out infinite;
        }
        .keuangan-brand-decor-left { margin-bottom: -10px; }
        .keuangan-brand-decor-right { margin-top: -10px; }
        
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-4px) rotate(3deg); }
        }
        
        .keuangan-brand-title {
          font-family: var(--font-great-vibes), var(--font-clicker-script), 'Sacramento', 'Caveat', cursive;
          font-size: 64px;
          font-weight: 400;
          color: var(--rose);
          letter-spacing: 0px;
          line-height: 1;
          text-shadow: 2px 2px 0px rgba(252, 226, 240, 0.9);
          margin: 6px 0;
          z-index: 1;
        }
        .keuangan-brand-sub {
          font-size: 10.5px;
          letter-spacing: 2px;
          color: var(--brown-mid);
          margin-top: 4px;
          text-transform: uppercase;
          font-weight: 600;
          z-index: 1;
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
          font-size: 11px;
          font-weight: 500;
          color: var(--brown-dark);
          transition: all 0.3s ease;
        }
        .ov-ring.filled { border-color: var(--rose); background: var(--rose-bg); color: var(--rose); }
        .ov-ring.partial { border-color: var(--rose-light); background: var(--cream2); color: var(--brown-dark); }
        .ov-ring.empty { border-style: dashed; border-color: var(--muted); color: var(--muted); }
        
        .ov-label {
          font-size: 9px;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: var(--muted);
          line-height: 1.3;
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
        
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 14px; }
        .form-single { margin-bottom: 14px; }
        
        .btn-primary {
          background: var(--rose);
          border: none;
          border-radius: 9px;
          padding: 12px 20px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 550;
          color: #fff;
          cursor: pointer;
          width: 100%;
          transition: background-color 0.2s, transform 0.1s;
          box-shadow: 0 2px 6px rgba(200, 100, 122, 0.2);
        }
        .btn-primary:hover { background: #B35267; }
        .btn-primary:active { transform: scale(0.99); }

        .riwayat-container {
          max-height: 380px;
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
          padding: 11px 14px;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }
        .riwayat-text { font-size: 13.5px; color: var(--brown-text); font-weight: 600; }
        .riwayat-time { font-size: 10.5px; color: var(--muted); margin-top: 2px; display: flex; gap: 6px; }
        .riwayat-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .riwayat-pts {
          font-size: 12.5px;
          font-weight: 700;
          padding: 3px 9px;
          border-radius: 6px;
          flex-shrink: 0;
        }
        .riwayat-pts.in {
          color: #047857;
          background: rgba(16,185,129,0.08);
          border: 1px solid rgba(16,185,129,0.15);
        }
        .riwayat-pts.out {
          color: var(--rose);
          background: var(--rose-bg);
          border: 1px solid var(--border2);
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

        .filter-chips { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 16px; }
        .filter-chip {
          padding: 6px 12px;
          border-radius: 20px;
          border: 1px solid var(--border);
          font-size: 11.5px;
          font-weight: 550;
          cursor: pointer;
          background: var(--white);
          color: var(--brown-mid);
          transition: all 0.15s;
          user-select: none;
        }
        .filter-chip:hover { border-color: var(--rose-light); }
        .filter-chip.active { background: var(--rose); border-color: var(--rose); color: white; }

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
          font-weight: bold;
        }

        .weekly-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 9px 0;
          border-bottom: 1px solid #F5F0EB;
        }
        .weekly-row:last-child { border-bottom: none; padding-bottom: 0; }
        .weekly-key { font-size: 12.5px; color: var(--brown-mid); }
        .weekly-val { font-size: 13px; font-weight: 600; color: var(--brown-dark); }
        .weekly-val.accent { color: var(--rose); font-weight: 700; }
        .weekly-val.green { color: #047857; font-weight: 700; }

        .progress-thin {
          height: 5px;
          background: var(--cream2);
          border-radius: 2.5px;
          overflow: hidden;
          margin-bottom: 10px;
          width: 100%;
        }
        .progress-thin-fill {
          height: 100%;
          background: var(--rose);
          transition: width 0.4s ease;
          width: 0%;
        }

        .budget-row {
          margin-bottom: 12px;
        }
        .budget-row:last-child { margin-bottom: 0; }
        .budget-info {
          display: flex;
          justify-content: space-between;
          font-size: 11.5px;
          color: var(--brown-mid);
          margin-bottom: 4px;
        }

        .cleansing-btn {
          background: var(--rose-bg);
          border: 1px solid var(--border2);
          border-radius: 20px;
          padding: 6px 18px;
          font-size: 11px;
          font-weight: bold;
          color: var(--rose);
          cursor: pointer;
          transition: all 0.2s;
          margin-top: 8px;
          width: 100%;
        }
        .cleansing-btn:hover:not(:disabled) {
          background: var(--rose);
          color: white;
          border-color: var(--rose);
        }
        .cleansing-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Debt Tracker Styles */
        .debt-row-card {
          background: var(--white);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 12px 16px;
          margin-bottom: 10px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          transition: all 0.25s ease;
          box-shadow: 0 2px 8px rgba(200, 100, 122, 0.01);
        }
        .debt-row-card:hover {
          border-color: var(--rose-light);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(200, 100, 122, 0.04);
        }
        .debt-row-card.settled {
          opacity: 0.6;
          background: var(--cream2);
          text-decoration: line-through;
          border-color: var(--border);
          box-shadow: none;
        }
        .debt-badge {
          font-size: 9.5px;
          font-weight: bold;
          padding: 3px 9px;
          border-radius: 6px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .debt-badge.utang {
          color: var(--rose);
          background: var(--rose-bg);
          border: 1px solid var(--border2);
        }
        .debt-badge.piutang {
          color: #047857;
          background: rgba(16, 185, 129, 0.08);
          border: 1px solid rgba(16, 185, 129, 0.15);
        }
        .debt-checkbox {
          width: 18px;
          height: 18px;
          border-radius: 6px;
          border: 1.5px solid var(--rose-light);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          background: white;
          transition: all 0.2s;
        }
        .debt-checkbox.checked {
          background: var(--rose);
          border-color: var(--rose);
        }
        .debt-container {
          max-height: 300px;
          overflow-y: auto;
          margin-top: 14px;
          padding-right: 2px;
        }
        .debt-container::-webkit-scrollbar-thumb {
          background: var(--rose-light);
          border-radius: 2px;
        }

        @media (max-width: 768px) {
          .page-container {
            padding: 4px;
          }
          .app-wrap {
            border-radius: 12px;
            border: none;
            box-shadow: none;
          }
          .main {
            padding: 16px 12px;
            border-right: none;
            border-bottom: 1px solid var(--border);
          }
          .sidebar {
            padding: 16px 12px;
          }
          .overview-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 8px;
          }
          .keuangan-brand-title {
            font-size: 36px !important;
          }
          .form-row {
            grid-template-columns: 1fr;
            gap: 8px;
          }
          .riwayat-box {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
            padding: 12px;
          }
          .riwayat-actions {
            width: 100%;
            justify-content: space-between;
            border-top: 1px dashed rgba(200, 100, 122, 0.15);
            padding-top: 8px;
            margin-top: 4px;
          }
          .riwayat-time {
            flex-wrap: wrap;
          }
        }
      `}</style>

      <div className="app-wrap">
        
        {/* ═══════════ MAIN ═══════════ */}
        <div className="main">
          
          <div className="header-bar">
            <div className="skor-pill">
              ✦ Kas Bersih: {formatRupiah(tabunganBersih)}
            </div>
          </div>

          {/* Brand */}
          <div className="keuangan-brand">
            <div className="flex items-center gap-3 justify-center z-10">
              <span className="keuangan-brand-decor-left">🎀</span>
              <div className="keuangan-brand-title">Baitul Maalku</div>
              <span className="keuangan-brand-decor-right">🎀</span>
            </div>
            <div className="keuangan-brand-sub">Pencatatan &amp; Rencana Finansial Berkah</div>
          </div>

          {/* Hadith */}
          <div className="hadith">
            {PRAYER_HADITH.text}
            <span>{PRAYER_HADITH.narrator}</span>
          </div>

          {/* Overview Rings */}
          <div className="overview-title">Ringkasan Keuangan Anda</div>
          <div className="overview-grid">
            <div className="ov-card">
              <div className="ov-ring filled" style={{ color: "#047857", borderColor: "#047857", background: "rgba(16,185,129,0.05)" }}>
                {transactions.filter(t => t.type === "pemasukan").length}x
              </div>
              <div className="ov-label">Pemasukan</div>
            </div>
            
            <div className="ov-card">
              <div className="ov-ring filled" style={{ color: "var(--rose)", borderColor: "var(--rose)", background: "var(--rose-bg)" }}>
                {transactions.filter(t => t.type === "pengeluaran").length}x
              </div>
              <div className="ov-label">Pengeluaran</div>
            </div>

            <div className="ov-card">
              <div className="ov-ring partial" style={{ color: "var(--purple-700)", borderColor: "var(--rose-light)" }}>
                {zakatProgressPct}%
              </div>
              <div className="ov-label">Nisab Zakat</div>
            </div>

            <div className="ov-card">
              <div className="ov-ring filled" style={{ color: "#b45309", borderColor: "#b45309", background: "rgba(180, 83, 9, 0.05)" }}>
                {debts.filter(d => !d.settled).length}x
              </div>
              <div className="ov-label">Utang Aktif</div>
            </div>
          </div>

          {/* Catat Transaksi */}
          <div className="section-title">🌸 Catat Transaksi Baru</div>
          <div className="form-card">
            <form onSubmit={handleAddTransaction}>
              <div className="form-single">
                <label className="field-label">Deskripsi Transaksi</label>
                <input 
                  type="text" 
                  className="inp" 
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Contoh: Gaji freelance, Beli makan siang, Sedekah..."
                  required
                />
              </div>

              <div className="form-row">
                <div>
                  <label className="field-label">Nominal (Rp)</label>
                  <input 
                    type="number" 
                    className="inp" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Contoh: 50000"
                    min="100"
                    required
                  />
                </div>
                <div>
                  <label className="field-label">Tipe Transaksi</label>
                  <select 
                    className="inp" 
                    value={type}
                    onChange={(e) => handleTypeChange(e.target.value as any)}
                  >
                    <option value="pengeluaran">Keluar (Pengeluaran)</option>
                    <option value="pemasukan">Masuk (Pemasukan)</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div>
                  <label className="field-label">Kategori</label>
                  <select 
                    className="inp" 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    {type === "pemasukan" ? (
                      <>
                        <option value="Gaji">Gaji</option>
                        <option value="Hasil Dagang">Hasil Dagang</option>
                        <option value="Bonus">Bonus</option>
                        <option value="Lainnya">Lainnya</option>
                      </>
                    ) : (
                      <>
                        <option value="Makanan">Makanan</option>
                        <option value="Transportasi">Transportasi</option>
                        <option value="Kebutuhan Pokok">Kebutuhan Pokok</option>
                        <option value="Gaya Hidup">Gaya Hidup (Wants)</option>
                        <option value="Sedekah/Zakat">Sedekah / Zakat</option>
                        <option value="Lainnya">Lainnya</option>
                      </>
                    )}
                  </select>
                </div>
                <div>
                  <label className="field-label flex items-center gap-1">
                    Tag Syariah 
                    <span title="Membantu Anda mengelompokkan kemurnian rezeki & kesederhanaan konsumsi.">
                      <HelpCircle className="h-3.5 w-3.5 text-rose-400 cursor-pointer" />
                    </span>
                  </label>
                  <select 
                    className="inp" 
                    value={tag}
                    onChange={(e) => setTag(e.target.value as any)}
                  >
                    {type === "pemasukan" ? (
                      <>
                        <option value="halal">Halal &amp; Tayyib</option>
                      </>
                    ) : (
                      <>
                        <option value="pokok">Kebutuhan Pokok</option>
                        <option value="sekunder">Kenyamanan (Sekunder)</option>
                        <option value="boros">Boros / Mubazir (Tersier)</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div className="form-single">
                <label className="field-label">Pilih Tanggal</label>
                <div className="flex gap-2">
                  <select 
                    className="inp py-2 text-xs" 
                    value={txDay}
                    onChange={(e) => setTxDay(e.target.value)}
                    style={{ flex: 1 }}
                  >
                    {Array.from({ length: 31 }, (_, i) => (i + 1).toString()).map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                  <select 
                    className="inp py-2 text-xs" 
                    value={txMonth}
                    onChange={(e) => setTxMonth(e.target.value)}
                    style={{ flex: 2 }}
                  >
                    {["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"].map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                  <select 
                    className="inp py-2 text-xs" 
                    value={txYear}
                    onChange={(e) => setTxYear(e.target.value)}
                    style={{ flex: 1.5 }}
                  >
                    <option value="2026">2026</option>
                    <option value="2025">2025</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="btn-primary mt-2">✦ Simpan Transaksi Keuangan</button>
            </form>
          </div>

          {/* Riwayat Transaksi */}
          <div className="section-title mt-8">📜 Riwayat Transaksi</div>
          
          <div className="filter-chips">
            {[
              { val: "semua", label: "Semua" },
              { val: "pemasukan", label: "Masuk" },
              { val: "pengeluaran", label: "Keluar" },
              { val: "halal", label: "Halal" },
              { val: "pokok", label: "Pokok" },
              { val: "sekunder", label: "Kenyamanan" },
              { val: "boros", label: "Boros/Mubazir" }
            ].map(chip => (
              <div 
                key={chip.val}
                className={`filter-chip ${filter === chip.val ? "active" : ""}`}
                onClick={() => setFilter(chip.val)}
              >
                {chip.label}
              </div>
            ))}
          </div>

          <div className="riwayat-container">
            {filteredTransactions.length === 0 ? (
              <p style={{ fontSize: '12px', color: 'var(--muted)', textAlign: 'center', padding: '24px', fontStyle: 'italic' }}>
                Belum ada transaksi tercatat untuk filter ini.
              </p>
            ) : (
              filteredTransactions.map((tx) => (
                <div key={tx.id} className="riwayat-box">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full border ${tx.type === "pemasukan" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose border-border2"}`}>
                      {tx.type === "pemasukan" ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                    </div>
                    <div>
                      <div className="riwayat-text">{tx.desc}</div>
                      <div className="riwayat-time">
                        <span>{tx.date}</span>
                        <span>•</span>
                        <span className="text-purple-600 font-semibold">{tx.category}</span>
                        <span>•</span>
                        <span className="underline">{getTagLabel(tx.tag)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="riwayat-actions">
                    <div className={`riwayat-pts ${tx.type === "pemasukan" ? "in" : "out"}`}>
                      {tx.type === "pemasukan" ? "+" : "-"}{formatRupiah(tx.amount)}
                    </div>
                    <button className="riwayat-delete" onClick={() => handleDeleteTransaction(tx.id)}>✕</button>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>

        {/* ═══════════ SIDEBAR ═══════════ */}
        <div className="sidebar">

          {/* Ringkasan Baitul Maal */}
          <div className="sidebar-card">
            <div className="side-title">📊 Ringkasan Kas Kasih</div>
            <div className="weekly-row">
              <span className="weekly-key">Pemasukan Halal</span>
              <span className="weekly-val green">{formatRupiah(totalPemasukanHalal)}</span>
            </div>
            <div className="weekly-row">
              <span className="weekly-key">Total Pengeluaran</span>
              <span className="weekly-val accent">{formatRupiah(totalPengeluaran)}</span>
            </div>
            <div className="weekly-row">
              <span className="weekly-key">Saldo Bersih</span>
              <span className="weekly-val">{formatRupiah(tabunganBersih)}</span>
            </div>
            <div className="weekly-row">
              <span className="weekly-key">Utang Aktif</span>
              <span className="weekly-val text-rose-500 font-bold">{debts.filter(d => !d.settled).length} catatan</span>
            </div>
          </div>

          {/* Nisab Zakat Tracker */}
          <div className="sidebar-card">
            <div className="side-title">🕌 Batas Zakat Maal (Nisab)</div>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-xs text-brown-mid">
                <span>Progress Nisab Zakat:</span>
                <span className="font-bold">{zakatProgressPct}%</span>
              </div>
              <div className="progress-thin">
                <div 
                  className="progress-thin-fill" 
                  style={{ width: `${zakatProgressPct}%`, background: tabunganBersih >= ZAKAT_NISAB ? "#047857" : "var(--rose)" }}
                ></div>
              </div>
              <div className="flex justify-between items-center text-[10.5px] text-brown-dark font-medium mt-1">
                <span>Kas Bersih: {formatRupiah(Math.max(0, tabunganBersih))}</span>
                <span>Nisab: {formatRupiah(ZAKAT_NISAB)}</span>
              </div>
              
              <div className="mt-3 p-3 rounded-lg border text-xs leading-relaxed text-center" style={
                tabunganBersih >= ZAKAT_NISAB 
                  ? { background: "rgba(16,185,129,0.08)", borderColor: "rgba(16,185,129,0.18)", color: "#047857" }
                  : { background: "var(--rose-bg)", borderColor: "var(--border2)", color: "var(--rose)" }
              }>
                {tabunganBersih >= ZAKAT_NISAB ? (
                  <div>
                    <strong>🕌 Wajib Zakat Maal!</strong><br />
                    Tabungan Anda telah mencapai Nisab emas 85g. Sisihkan 2.5% untuk Zakat Maal.
                  </div>
                ) : (
                  <div>
                    <strong>🌸 Belum Wajib Zakat</strong><br />
                    Tabungan Anda berada di bawah batas minimum Nisab emas 85g.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Alokasi Pengeluaran Syariah */}
          <div className="sidebar-card">
            <div className="side-title">📐 Alokasi Pengeluaran</div>
            <div className="flex flex-col gap-3">
              
              {/* Pokok */}
              <div className="budget-row">
                <div className="budget-info">
                  <span>Kebutuhan Pokok (Primer)</span>
                  <span className="font-bold">{formatRupiah(spentPokok)}</span>
                </div>
                <div className="progress-thin">
                  <div className="progress-thin-fill" style={{ 
                    width: `${totalPengeluaran > 0 ? Math.round((spentPokok / totalPengeluaran) * 100) : 0}%`,
                    background: "#1d4ed8"
                  }}></div>
                </div>
              </div>

              {/* Sekunder */}
              <div className="budget-row">
                <div className="budget-info">
                  <span>Kenyamanan (Sekunder)</span>
                  <span className="font-bold">{formatRupiah(spentSekunder)}</span>
                </div>
                <div className="progress-thin">
                  <div className="progress-thin-fill" style={{ 
                    width: `${totalPengeluaran > 0 ? Math.round((spentSekunder / totalPengeluaran) * 100) : 0}%`,
                    background: "var(--purple-600)"
                  }}></div>
                </div>
              </div>

              {/* Boros */}
              <div className="budget-row">
                <div className="budget-info">
                  <span>Boros / Mubazir (Luxury)</span>
                  <span className="font-bold text-rose-600">{formatRupiah(spentBoros)}</span>
                </div>
                <div className="progress-thin">
                  <div className="progress-thin-fill" style={{ 
                    width: `${totalPengeluaran > 0 ? Math.round((spentBoros / totalPengeluaran) * 100) : 0}%`,
                    background: "var(--rose)"
                  }}></div>
                </div>
              </div>

            </div>
          </div>

          {/* Catatan Utang Bestie */}
          <div className="sidebar-card flex-grow flex flex-col justify-between">
            <div>
              <div className="side-title">🎀 Utang Bestie</div>
              <p className="text-xs text-brown-mid leading-relaxed mb-3">
                Catat utang-piutang dengan sahabat secara rapi agar tidak lupa lunasin!
              </p>
              
              <div className="debt-container" style={{ maxHeight: "200px" }}>
                {debts.length === 0 ? (
                  <p style={{ fontSize: '11px', color: 'var(--muted)', textAlign: 'center', padding: '12px', fontStyle: 'italic' }}>
                    Belum ada catatan utang piutang. Inner peace is real 🧘‍♀️
                  </p>
                ) : (
                  debts.map((d) => (
                    <div key={d.id} className={`debt-row-card ${d.settled ? 'settled' : ''}`} style={{ padding: "8px 10px", margin: "6px 0" }}>
                      <div className="flex items-center gap-2">
                        <div 
                          className={`debt-checkbox ${d.settled ? 'checked' : ''}`}
                          onClick={() => handleToggleSettleDebt(d.id)}
                          style={{ width: "16px", height: "16px" }}
                        >
                          {d.settled && <span style={{ fontSize: "9px", fontWeight: "bold" }}>✓</span>}
                        </div>
                        <div className="min-w-0">
                          <div style={{ fontSize: "12px", fontWeight: 600 }} className="truncate">{d.person}</div>
                          <div style={{ fontSize: "9px", color: "var(--muted)", marginTop: "1px" }}>
                            <span className={`debt-badge ${d.type}`} style={{ fontSize: "8px", padding: "1px 4px" }}>
                              {d.type === "utang" ? "Utang Saya" : "Piutang"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span style={{ fontSize: "12px", fontWeight: 700, color: d.type === "utang" ? "var(--rose)" : "#047857" }}>
                          {formatRupiah(d.amount)}
                        </span>
                        <button type="button" className="riwayat-delete" onClick={() => handleDeleteDebt(d.id)} style={{ fontSize: "10px" }}>✕</button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Form Input Utang */}
              <form onSubmit={handleAddDebt} className="mt-4 pt-3 border-t border-pink-100/50">
                <div className="flex flex-col gap-2">
                  <div>
                    <label className="field-label" style={{ marginBottom: "2px", fontSize: "9px" }}>Keterangan / Nama</label>
                    <input
                      type="text"
                      className="inp py-1 px-2 text-xs"
                      value={debtPerson}
                      onChange={(e) => setDebtPerson(e.target.value)}
                      placeholder="Gofood Salsa, Uang Kas..."
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="field-label" style={{ marginBottom: "2px", fontSize: "9px" }}>Nominal (Rp)</label>
                      <input
                        type="number"
                        className="inp py-1 px-2 text-xs"
                        value={debtAmount}
                        onChange={(e) => setDebtAmount(e.target.value)}
                        placeholder="35000"
                        required
                      />
                    </div>
                    <div>
                      <label className="field-label" style={{ marginBottom: "2px", fontSize: "9px" }}>Tipe</label>
                      <select
                        className="inp py-1 px-2 text-xs"
                        value={debtType}
                        onChange={(e) => setDebtType(e.target.value as any)}
                      >
                        <option value="piutang">Piutang 💖</option>
                        <option value="utang">Utang 😔</option>
                      </select>
                    </div>
                  </div>
                  <button type="submit" className="btn-primary py-1.5 mt-2 text-xs font-bold">
                    Catat Utang Baru 🎀
                  </button>
                </div>
              </form>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
