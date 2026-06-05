"use client";

import React, { useState, useEffect } from "react";
import { FileText, Printer, Download, Calendar, Activity, Check, AlertCircle, FileSpreadsheet } from "lucide-react";

interface Transaction {
  id: number;
  desc: string;
  amount: number;
  type: "pemasukan" | "pengeluaran";
  category: string;
  tag: "halal" | "syubhat" | "pokok" | "sekunder" | "boros";
  date: string;
  dateKey: string;
}

interface Debt {
  id: number;
  person: string;
  amount: number;
  type: "utang" | "piutang";
  settled: boolean;
  date: string;
}

export default function LaporanKeuanganPage() {
  const [mounted, setMounted] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);

  const [selectedMonth, setSelectedMonth] = useState<string>("Juni");
  const [selectedYear, setSelectedYear] = useState<string>("2026");

  const hargaEmasPerGram = 1450000;
  const nisabZakat = 85 * hargaEmasPerGram; // Rp 123.250.000

  useEffect(() => {
    setMounted(true);
    const savedTx = localStorage.getItem("syariah-transactions");
    if (savedTx) {
      setTransactions(JSON.parse(savedTx));
    }
    const savedDebts = localStorage.getItem("syariah-debts");
    if (savedDebts) {
      setDebts(JSON.parse(savedDebts));
    }
  }, []);

  if (!mounted) return null;

  // Filter transactions and debts based on selected month/year
  const filteredTx = transactions.filter((tx) => {
    if (selectedMonth === "Semua") {
      return tx.date.includes(selectedYear);
    }
    return tx.date.includes(selectedMonth) && tx.date.includes(selectedYear);
  });

  const filteredDebts = debts.filter((d) => {
    return d.date.includes(selectedYear); // Debts typically show year-to-date
  });

  // Calculate totals based on filtered lists
  const totalPemasukan = filteredTx
    .filter((tx) => tx.type === "pemasukan")
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalPengeluaran = filteredTx
    .filter((tx) => tx.type === "pengeluaran")
    .reduce((sum, tx) => sum + tx.amount, 0);

  const surplusKas = totalPemasukan - totalPengeluaran;

  const totalPiutang = filteredDebts
    .filter((d) => d.type === "piutang" && !d.settled)
    .reduce((sum, d) => sum + d.amount, 0);

  const totalUtang = filteredDebts
    .filter((d) => d.type === "utang" && !d.settled)
    .reduce((sum, d) => sum + d.amount, 0);

  // Total Net assets for Zakat calculation
  const totalHartaBersih = surplusKas + totalPiutang - totalUtang;
  const wajibZakat = totalHartaBersih >= nisabZakat;
  const jumlahZakat = wajibZakat ? totalHartaBersih * 0.025 : 0;
  const progressNisab = Math.min(100, Math.round((Math.max(0, totalHartaBersih) / nisabZakat) * 100));

  // Category breakdown for expenses
  const expenseByTag = {
    pokok: filteredTx.filter((t) => t.type === "pengeluaran" && t.tag === "pokok").reduce((sum, t) => sum + t.amount, 0),
    sekunder: filteredTx.filter((t) => t.type === "pengeluaran" && t.tag === "sekunder").reduce((sum, t) => sum + t.amount, 0),
    boros: filteredTx.filter((t) => t.type === "pengeluaran" && t.tag === "boros").reduce((sum, t) => sum + t.amount, 0),
  };

  const rasioPemborosan = totalPengeluaran > 0 ? Math.round((expenseByTag.boros / totalPengeluaran) * 100) : 0;

  const formatRupiah = (num: number) => {
    return "Rp " + new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(num);
  };

  const handlePrint = () => {
    if (typeof window === "undefined") return;

    const element = document.getElementById("print-area-wrapper");
    if (!element) {
      alert("Error: Elemen laporan keuangan (#print-area-wrapper) tidak ditemukan.");
      return;
    }

    try {
      const exporter = (window as any).html2pdf;
      if (!exporter) {
        alert("Gagal mengunduh: Library PDF (html2pdf) sedang dimuat oleh browser. Mohon tunggu 2-3 detik, lalu klik tombol ini lagi! 🌸");
        return;
      }

      const opt = {
        margin:       [10, 12, 10, 12], // top, left, bottom, right in mm
        filename:     `Laporan_Keuangan_${selectedMonth}_${selectedYear}.pdf`,
        image:        { type: "jpeg", quality: 0.98 },
        html2canvas:  { 
          scale: 2, 
          useCORS: true, 
          backgroundColor: "#ffffff",
          onclone: (clonedDoc: any) => {
            const mainCol = clonedDoc.getElementById("print-area-wrapper");
            if (mainCol) {
              mainCol.style.borderRight = "none";
              mainCol.style.padding = "10px 0 20px 0";
              mainCol.style.width = "100%";
              mainCol.style.maxWidth = "100%";
            }
          }
        },
        jsPDF:        { unit: "mm", format: "a4", orientation: "portrait" }
      };
      
      exporter().from(element).set(opt).save();
    } catch (err: any) {
      alert("Gagal memproses PDF: " + err.message);
    }
  };

  const handleDownloadCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += `=== LAPORAN KEUANGAN SYARIAH - PERIODE ${selectedMonth.toUpperCase()} ${selectedYear} ===\n\n`;
    
    csvContent += "=== LAPORAN POSISI KEUANGAN (NERACA) ===\n";
    csvContent += "Keterangan Akun,Debit (Rp),Kredit (Rp)\n";
    csvContent += `Kas / Pemasukan Bersih,${Math.max(0, surplusKas)},-\n`;
    csvContent += `Piutang Lancar Aktif,${totalPiutang},-\n`;
    csvContent += `Utang Aktif Belum Lunas,-,${totalUtang}\n`;
    csvContent += `Harta Bersih (Ekuitas),-,${totalHartaBersih}\n`;
    csvContent += `Total Balanced,${Math.max(0, surplusKas) + totalPiutang},${totalHartaBersih + totalUtang}\n\n`;
    
    csvContent += "=== LAPORAN ARUS KAS (INCOME STATEMENT) ===\n";
    csvContent += "Uraian,Jumlah (Rp)\n";
    csvContent += `Total Pemasukan Halal,${totalPemasukan}\n`;
    csvContent += `Total Pengeluaran Utama,${totalPengeluaran}\n`;
    csvContent += `- Kebutuhan Pokok (Dharuriyyat),${expenseByTag.pokok}\n`;
    csvContent += `- Kenyamanan (Hajiyyat),${expenseByTag.sekunder}\n`;
    csvContent += `- Pemborosan (Tabzir),${expenseByTag.boros}\n`;
    csvContent += `SURPLUS KAS BERSIH,${surplusKas}\n\n`;

    csvContent += "=== BUKU BESAR JURNAL TRANSAKSI ===\n";
    csvContent += "Tanggal,Keterangan,Kategori,Tipe,Tag Syariah,Jumlah (Rp)\n";
    filteredTx.forEach((tx) => {
      csvContent += `${tx.date},"${tx.desc}",${tx.category},${tx.type},${tx.tag},${tx.amount}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Laporan_Keuangan_${selectedMonth}_${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="page-container w-full pb-12">
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
          
          font-family: var(--font-quicksand), 'DM Sans', sans-serif;
          color: var(--brown-text);
          background-color: transparent;
          background-image: radial-gradient(rgba(251, 113, 133, 0.15) 1.5px, transparent 1.5px);
          background-size: 18px 18px;
          width: 100%;
        }

        .app-wrap {
          display: grid;
          grid-template-columns: 1fr 320px;
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          box-shadow: 0 10px 45px rgba(200, 100, 122, 0.06);
          background: var(--white);
          border-radius: 24px;
          overflow: hidden;
          border: 1px solid var(--border);
        }

        @media (max-width: 1024px) {
          .app-wrap {
            grid-template-columns: 1fr;
          }
        }

        .main { 
          padding: 32px 32px 48px 36px; 
          border-right: 1px solid var(--border); 
          display: flex; 
          flex-direction: column; 
          gap: 28px; 
        }
        
        .sidebar {
          padding: 24px 20px;
          background: var(--sidebar-bg);
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        @media (max-width: 768px) {
          .main {
            padding: 20px 16px 36px 16px;
            gap: 20px;
          }
          .sidebar {
            padding: 20px 16px;
          }
        }

        .laporan-brand {
          text-align: center;
          margin-bottom: 24px;
          padding: 24px 20px;
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
        .laporan-brand::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background-image: radial-gradient(rgba(200, 100, 122, 0.08) 1.5px, transparent 1.5px);
          background-size: 16px 16px;
          pointer-events: none;
          opacity: 0.75;
        }
        .laporan-brand-decor-left, .laporan-brand-decor-right {
          font-size: 26px;
          user-select: none;
          display: inline-block;
          animation: floatSlow 3.5s ease-in-out infinite;
        }
        .laporan-brand-decor-left { margin-bottom: -10px; }
        .laporan-brand-decor-right { margin-top: -10px; }
        
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-4px) rotate(3deg); }
        }

        .laporan-brand-title {
          font-family: 'Sacramento', 'Caveat', 'Great Vibes', cursive;
          font-size: 46px;
          font-weight: 400;
          color: var(--rose);
          letter-spacing: 0px;
          line-height: 1.1;
          text-shadow: 2px 2px 0px rgba(252, 226, 240, 0.9);
          margin: 6px 0;
          z-index: 1;
        }
        .laporan-brand-sub {
          font-size: 9.5px;
          letter-spacing: 2px;
          color: var(--brown-mid);
          margin-top: 4px;
          text-transform: uppercase;
          font-weight: 600;
          z-index: 1;
        }

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

        .acc-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
        }
        .acc-table th {
          background: var(--cream2);
          color: var(--brown-dark);
          font-weight: 700;
          text-align: left;
          padding: 12px 16px;
          border-bottom: 2px solid var(--border);
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .acc-table td {
          padding: 12px 16px;
          border-bottom: 1px solid var(--border);
          color: var(--brown-text);
        }
        .acc-table tr:hover {
          background-color: var(--rose-bg);
        }

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          width: 100%;
        }
        @media (max-width: 1024px) {
          .summary-grid {
            grid-template-columns: 1fr;
          }
        }
        .summary-card {
          background: var(--white);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 22px 24px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          box-shadow: 0 4px 20px rgba(200, 100, 122, 0.03);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .summary-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(200, 100, 122, 0.06);
          border-color: rgba(200, 100, 122, 0.25);
        }
        .summary-card-title {
          font-size: 10px;
          text-transform: uppercase;
          font-weight: 700;
          letter-spacing: 1px;
          color: var(--muted);
        }
        .summary-card-amount {
          font-size: 22px;
          font-weight: 800;
          color: var(--brown-dark);
          line-height: 1.15;
          margin: 2px 0;
        }

        @media print {
          /* Hide non-essential layouts */
          header, footer, aside, nav, .hide-on-print {
            display: none !important;
          }
          
          /* Reset parent flexbox layouts and margins for printing */
          body, html {
            background: white !important;
            color: black !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            height: auto !important;
          }
          
          /* Reset root layout containers */
          div[class*="min-h-dvh"],
          div[class*="max-w-[1440px]"],
          main {
            display: block !important;
            max-width: 100% !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            position: static !important;
            border: none !important;
            box-shadow: none !important;
            transform: none !important;
          }
          
          /* Reset page container */
          .page-container {
            padding: 0 !important;
            margin: 0 !important;
            display: block !important;
            width: 100% !important;
          }

          /* Force print area to take full width and flow naturally */
          #print-area-wrapper {
            display: block !important;
            width: 100% !important;
            max-width: 100% !important;
            border: none !important;
            box-shadow: none !important;
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
            position: static !important;
          }

          .main {
            width: 100% !important;
            border-right: none !important;
            padding: 0 !important;
            margin: 0 !important;
            display: flex !important;
            flex-direction: column !important;
          }
          
          .glass-card {
            border: none !important;
            box-shadow: none !important;
          }
        }
      `}</style>

      <div className="app-wrap">
        
        {/* ═══════════ MAIN COLUMN (LEFT) ═══════════ */}
        <div className="main" id="print-area-wrapper">
          
          {/* Header Bar */}
          <div className="flex flex-col items-center text-center pt-4 pb-6 border-b-2 border-dashed border-pink-200/60 mb-6 w-full relative">
            <div className="flex items-center gap-3">
              <span className="text-2xl animate-float select-none">🌸</span>
              <h2 className="text-3xl font-extrabold text-[#C8647A] font-serif tracking-wide leading-tight">
                Laporan Posisi Keuangan Syariah
              </h2>
              <span className="text-2xl animate-float select-none" style={{ animationDelay: "0.5s" }}>🎀</span>
            </div>
            <div className="mt-2">
              <p className="text-[10px] font-sans font-bold text-slate-400 uppercase tracking-widest">
                Baitul Maal • Periode Rekapitulasi: {selectedMonth} {selectedYear}
              </p>
            </div>
          </div>

          {/* Quick Summary Grid */}
          <div className="summary-grid hide-on-print font-sans">
            <div className="summary-card">
              <span className="summary-card-title">Total Pemasukan</span>
              <p className="summary-card-amount text-emerald-700 tabular-nums">{formatRupiah(totalPemasukan)}</p>
              <div className="h-1.5 bg-emerald-100 rounded-full w-full overflow-hidden mt-1">
                <div className="h-full bg-emerald-500 w-[70%]" />
              </div>
            </div>

            <div className="summary-card">
              <span className="summary-card-title">Total Pengeluaran</span>
              <p className="summary-card-amount text-[#C8647A] tabular-nums">{formatRupiah(totalPengeluaran)}</p>
              <div className="h-1.5 bg-rose-100 rounded-full w-full overflow-hidden mt-1">
                <div className="h-full bg-[#C8647A] w-[50%]" />
              </div>
            </div>

            <div className="summary-card">
              <span className="summary-card-title">Arus Kas Bersih (Surplus)</span>
              <p className={`summary-card-amount tabular-nums ${surplusKas >= 0 ? "text-emerald-700" : "text-rose-600"}`}>
                {formatRupiah(surplusKas)}
              </p>
              <div className="h-1.5 bg-pink-100 rounded-full w-full overflow-hidden mt-1">
                <div className="h-full bg-rose-400 w-[60%]" />
              </div>
            </div>
          </div>

          {/* 🏛️ Balance Sheet Section */}
          <div className="bg-white border border-[#F9EBF2] p-6 sm:p-7 rounded-[2rem] space-y-4 shadow-xs">
            <h3 className="font-bold text-base text-rose-950 font-serif flex items-center gap-2">
              🏛️ Laporan Posisi Keuangan (Neraca Saldo)
            </h3>
            <div className="w-full overflow-x-auto border border-[#F9EBF2] rounded-2xl">
              <table className="acc-table font-sans">
                <thead>
                  <tr>
                    <th>Deskripsi Akun Keuangan</th>
                    <th className="text-right">Debit (Rp)</th>
                    <th className="text-right">Kredit (Rp)</th>
                  </tr>
                </thead>
                <tbody>
                  {/* ASSETS */}
                  <tr className="bg-pink-50/20 font-bold text-[11px] tracking-wider text-[#7C4F62] uppercase">
                    <td colSpan={3} style={{ padding: "8px 16px" }}>ASET LANCAR</td>
                  </tr>
                  <tr>
                    <td className="pl-8 font-normal">Kas &amp; Surplus Tabungan</td>
                    <td className="text-right font-medium tabular-nums">{formatRupiah(Math.max(0, surplusKas))}</td>
                    <td className="text-right font-medium">-</td>
                  </tr>
                  <tr>
                    <td className="pl-8 font-normal">Piutang Aktif (Dana Dipinjamkan)</td>
                    <td className="text-right font-medium tabular-nums">{formatRupiah(totalPiutang)}</td>
                    <td className="text-right font-medium">-</td>
                  </tr>
                  
                  {/* LIABILITIES */}
                  <tr className="bg-pink-50/20 font-bold text-[11px] tracking-wider text-[#7C4F62] uppercase">
                    <td colSpan={3} style={{ padding: "8px 16px" }}>LIABILITAS (KEWAJIBAN)</td>
                  </tr>
                  <tr>
                    <td className="pl-8 font-normal">Utang Belum Lunas</td>
                    <td className="text-right font-medium">-</td>
                    <td className="text-right font-medium tabular-nums">{formatRupiah(totalUtang)}</td>
                  </tr>

                  {/* EQUITY */}
                  <tr className="bg-pink-50/20 font-bold text-[11px] tracking-wider text-[#7C4F62] uppercase">
                    <td colSpan={3} style={{ padding: "8px 16px" }}>EKUITAS BERSIH</td>
                  </tr>
                  <tr>
                    <td className="pl-8 font-normal">Harta Bersih (Ekuitas)</td>
                    <td className="text-right font-medium">-</td>
                    <td className="text-right font-medium tabular-nums">{formatRupiah(totalHartaBersih)}</td>
                  </tr>

                  {/* TOTAL BALANCED */}
                  <tr className="bg-rose-50/60 font-extrabold text-rose-950 border-t border-pink-200">
                    <td>TOTAL SEIMBANG (BALANCED REPORT)</td>
                    <td className="text-right tabular-nums">{formatRupiah(Math.max(0, surplusKas) + totalPiutang)}</td>
                    <td className="text-right tabular-nums">{formatRupiah(totalHartaBersih + totalUtang)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 📖 Ledger Table (Jurnal Transaksi) */}
          <div className="bg-white border border-[#F9EBF2] p-6 sm:p-7 rounded-[2rem] space-y-4 shadow-xs">
            <h3 className="font-bold text-base text-rose-950 font-serif flex items-center gap-2">
              📖 Jurnal &amp; Buku Besar Kas Transaksi
            </h3>
            
            <div className="w-full overflow-x-auto border border-[#F9EBF2] rounded-2xl">
              <table className="acc-table font-sans">
                <thead>
                  <tr>
                    <th>Tanggal</th>
                    <th>Uraian &amp; Klasifikasi</th>
                    <th className="text-center">Tipe</th>
                    <th className="text-right">Jumlah (Rp)</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTx.length > 0 ? (
                    filteredTx.map((tx) => (
                      <tr key={tx.id}>
                        <td className="font-sans text-[11px] text-slate-400 whitespace-nowrap">{tx.date}</td>
                        <td>
                          <div className="font-bold text-[#3D222E] text-[13.5px] leading-tight">{tx.desc}</div>
                          <div className="flex flex-wrap gap-1.5 mt-1.5">
                            <span className="text-[9px] bg-pink-50 text-rose-700 font-bold px-1.5 py-0.5 rounded border border-pink-100/30">
                              {tx.category}
                            </span>
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                              tx.tag === "halal" || tx.tag === "pokok" 
                                ? "bg-emerald-50 text-emerald-700 border-emerald-100/40" 
                                : tx.tag === "boros" 
                                  ? "bg-red-50 text-red-700 border-red-100/40" 
                                  : "bg-amber-50 text-amber-700 border-amber-100/40"
                            }`}>
                              {tx.tag === "pokok" ? "Dharuriyyat" : tx.tag === "sekunder" ? "Hajiyyat" : tx.tag === "boros" ? "Tabzir / Boros" : tx.tag.toUpperCase()}
                            </span>
                          </div>
                        </td>
                        <td className="text-center">
                          <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${tx.type === "pemasukan" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-[#C8647A]"}`}>
                            {tx.type === "pemasukan" ? "MASUK" : "KELUAR"}
                          </span>
                        </td>
                        <td className={`text-right font-extrabold tabular-nums whitespace-nowrap ${tx.type === "pemasukan" ? "text-emerald-700" : "text-[#C8647A]"}`}>
                          {tx.type === "pemasukan" ? "+" : "-"}{formatRupiah(tx.amount)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="text-center py-8 text-slate-400 font-sans italic">
                        Tidak ada transaksi pada periode terpilih.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* ═══════════ SIDEBAR COLUMN (RIGHT) ═══════════ */}
        <div className="sidebar hide-on-print">

          {/* Brand Header */}
          <div className="laporan-brand">
            <div className="flex items-center gap-3 justify-center z-10">
              <span className="laporan-brand-decor-left">🎀</span>
              <div className="laporan-brand-title">Laporan</div>
              <span className="laporan-brand-decor-right">🎀</span>
            </div>
            <div className="laporan-brand-sub">Pembukuan Baitul Maal</div>
          </div>

          {/* Period Filter Card */}
          <div className="sidebar-card">
            <div className="side-title">
              <Calendar className="h-3.5 w-3.5" /> Filter Periode
            </div>
            <div className="flex flex-col gap-2.5">
              <div>
                <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">Bulan</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full bg-white border border-pink-100 rounded-xl py-2 px-3 text-xs text-rose-950 focus:outline-none focus:border-rose-400 font-sans font-semibold"
                >
                  {["Semua", "Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"].map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">Tahun</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full bg-white border border-pink-100 rounded-xl py-2 px-3 text-xs text-rose-950 focus:outline-none focus:border-rose-400 font-sans font-semibold"
                >
                  {["2024", "2025", "2026", "2027"].map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Export Tools Card */}
          <div className="sidebar-card">
            <div className="side-title">
              <Printer className="h-3.5 w-3.5" /> Aksi Dokumen
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={handlePrint}
                className="w-full py-2.5 text-xs font-extrabold text-[#C8647A] bg-[#FFF2F7] hover:bg-[#FFF0F4] border border-[#F9EBF2] hover:border-rose-300 rounded-xl shadow-xs transition duration-250 cursor-pointer flex items-center justify-center gap-2 font-sans"
              >
                <Download className="h-3.5 w-3.5" /> Unduh Laporan PDF
              </button>
              <button
                onClick={handleDownloadCSV}
                className="w-full py-2.5 text-xs font-extrabold text-[#C8647A] bg-[#FFF2F7] hover:bg-[#FFF0F4] border border-[#F9EBF2] hover:border-rose-300 rounded-xl shadow-xs transition duration-250 cursor-pointer flex items-center justify-center gap-2 font-sans"
              >
                <Download className="h-3.5 w-3.5" /> Unduh Laporan CSV
              </button>
            </div>
          </div>

          {/* Shariah Accounting Metrics Card */}
          <div className="sidebar-card font-sans flex-grow flex flex-col">
            <div className="side-title">
              <Activity className="h-3.5 w-3.5" /> Analisis Syariah
            </div>
            <div className="space-y-3.5 pt-1 text-xs flex-grow flex flex-col justify-between">
              
              {/* Progress Nisab */}
              <div className="space-y-1.5 w-full">
                <div className="flex justify-between font-bold text-rose-950">
                  <span>Nisab Zakat Maal:</span>
                  <span className="tabular-nums">{progressNisab}%</span>
                </div>
                <div className="progress-bar h-2 bg-pink-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${wajibZakat ? "bg-emerald-500" : "bg-[#C8647A]"}`}
                    style={{ width: `${progressNisab}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-400">
                  <span className="tabular-nums">Nisab: {formatRupiah(nisabZakat)}</span>
                  <span className="font-bold text-[#C8647A]">{wajibZakat ? "Wajib Zakat" : "Bebas Zakat"}</span>
                </div>
              </div>

              <div className="border-t border-pink-100/50 pt-2.5 space-y-2 w-full">
                <div className="flex justify-between text-rose-950 font-bold">
                  <span>Rasio Tabzir (Boros):</span>
                  <span className={`font-bold tabular-nums ${rasioPemborosan > 20 ? "text-red-600" : "text-emerald-700"}`}>
                    {rasioPemborosan}%
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  {rasioPemborosan > 20 
                    ? "⚠️ Pengeluaran sekunder & boros Anda di atas batas ideal. Dianjurkan menekan alokasi tersier agar tabungan berkah."
                    : "✅ Pengeluaran Anda terkendali dengan baik dan terhindar dari tabzir (pemborosan). Masya Allah!"}
                </p>
              </div>

              {wajibZakat ? (
                <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl flex gap-2 text-emerald-800 leading-relaxed text-[10px] w-full mt-auto">
                  <AlertCircle className="h-4 w-4 shrink-0 text-emerald-600" />
                  <div>
                    <span className="font-bold block">Kewajiban Zakat Aktif:</span>
                    Harta Anda melewati nisab. Wajib mengeluarkan zakat sebesar 2.5% yaitu <strong className="tabular-nums">{formatRupiah(jumlahZakat)}</strong>.
                  </div>
                </div>
              ) : (
                <div className="bg-rose-50/50 border border-pink-100 p-3 rounded-xl flex gap-2 text-rose-800 leading-relaxed text-[10px] w-full mt-auto">
                  <Check className="h-4 w-4 shrink-0 text-rose-600" />
                  <div>
                    <span className="font-bold block">Bebas Wajib Zakat:</span>
                    Aset bersih Anda saat ini masih di bawah batas nisab tahunan. Tetap jaga pencatatan keuangan Anda.
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
