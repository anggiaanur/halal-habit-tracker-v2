"use client";

import React, { useState, useRef, useEffect } from "react";
import { Sparkles, Send, Bot, User, Trash2, Heart, Smile, ChevronRight } from "lucide-react";

interface Message {
  id: number;
  sender: "ai" | "user";
  text: string;
  time: string;
}

const PERSONA_TOPICS = {
  ustadzah: [
    { label: "Amalan hari Jum'at wanita? 🕌", query: "Amalan apa saja yang dianjurkan untuk wanita di hari Jum'at? 🕌" },
    { label: "Bolehkah baca Qur'an di HP saat haid? 📱", query: "Bolehkah saya membaca Al-Qur'an lewat aplikasi HP saat sedang haid? 📱" },
    { label: "Cara menjaga keikhlasan ibadah? 💖", query: "Bagaimana cara menjaga keikhlasan hati agar tidak riya' saat beribadah? 💖" },
    { label: "Adab meminta maaf ke suami? 🌸", query: "Bagaimana adab meminta maaf kepada suami menurut Islam? 🌸" }
  ],
  bestie: [
    { label: "Cara stop impulsif buying pas sale? 💸", query: "Plis bestie, gimana cara stop impulsif buying pas ada diskon flash sale? 💸" },
    { label: "Nabung emas vs reksa dana syariah? 💍", query: "Mendingan nabung emas atau investasi reksa dana syariah ya bestie? 💍" },
    { label: "Gimana cara nagih utang ke temen? 🤫", query: "Tips dong bestie, gimana cara nagih utang ke temen deket tanpa bikin canggung? 🤫" },
    { label: "Dana darurat vs tabungan umroh? 🎒", query: "Untuk pemula, lebih baik dulukan dana darurat atau tabungan umroh dulu bestie? 🎒" }
  ],
  expert: [
    { label: "Kriteria saham syariah compliance? 📊", query: "Apa saja kriteria agar sebuah saham dinyatakan syariah compliance? 📊" },
    { label: "Hukum cashback & discount e-wallet? 💳", query: "Bagaimana hukum fiqih menggunakan cashback dan diskon dari saldo e-wallet? 💳" },
    { label: "Batas nisab zakat maal tahun ini? 💰", query: "Berapa batas nisab zakat maal saat ini dan cara hitung zakat tabungan? 💰" },
    { label: "Hukum arisan berantai/multi-level? 🤝", query: "Bagaimana hukum arisan berantai atau multi-level dalam perspektif fiqih muamalah? 🤝" }
  ]
};

export default function AIAdvisor() {
  const [mounted, setMounted] = useState(false);
  const [persona, setPersona] = useState<"ustadzah" | "bestie" | "expert">("ustadzah");
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: "ai",
      text: "Assalamualaikum Sahabat! 🌸 Saya Ustadzah ramah AI Advisor keuangan syariahmu. Ada yang ingin kamu diskusikan hari ini tentang budget, kategori syubhat, ibadah harian, atau nisab zakatmu?",
      time: "10:30",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    setTimeout(() => {
      setMounted(true);
      const savedMessages = localStorage.getItem("syariah-ai-messages");
      if (savedMessages) {
        setMessages(JSON.parse(savedMessages));
      }
    }, 0);
  }, []);

  const saveMessagesToLocal = (newMsgList: Message[]) => {
    setMessages(newMsgList);
    localStorage.setItem("syariah-ai-messages", JSON.stringify(newMsgList));
  };

  const handleSendQuery = (queryText: string) => {
    if (!queryText.trim()) return;

    const userMsg: Message = {
      id: Date.now(),
      sender: "user",
      text: queryText,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const nextList = [...messages, userMsg];
    saveMessagesToLocal(nextList);
    setIsTyping(true);

    // Simulate AI response based on query keywords & active persona
    setTimeout(() => {
      let reply = "";
      const lower = queryText.toLowerCase();
      // Custom Q&A for Popular Topics
      if (lower.includes("emas perhiasan") || lower.includes("perhiasan wajib")) {
        reply = "Emas perhiasan yang dipakai sehari-hari tidak wajib dizakati menurut pendapat mayoritas ulama (selama jumlahnya wajar dan bukan untuk simpanan/investasi). Namun, jika disimpan dan beratnya mencapai nisab (85 gram), wajib dizakati 2.5% setelah haul 1 tahun ya, Sahabat! 💍";
      } else if (lower.includes("arisan dalam islam")) {
        reply = "Hukum arisan secara umum diperbolehkan (mubah) dalam Islam karena tergolong akad Qardh (utang-piutang tanpa bunga) untuk saling menolong. Pastikan arisan diikuti dengan kerelaan hati, tertib mencatat, dan tanpa ada unsur judi atau denda keterlambatan ya! 🤝";
      } else if (lower.includes("rezeki syubhat") || lower.includes("membedakan rezeki syubhat") || lower.includes("cara membedakan rezeki")) {
        reply = "Rezeki syubhat adalah yang samar-samar status kehalalannya. Rasulullah SAW menganjurkan kita untuk menjauhi syubhat agar agama dan kehormatan kita terjaga. Usahakan selalu memprioritaskan yang jelas halalnya dan bersihkan dana syubhat konvensional lewat sedekah umum ya! 🪙";
      } else if (lower.includes("uang jajan dari suami")) {
        reply = "Nafkah wajib yang diberikan suami untuk kebutuhan pokok (makan, pakaian, tempat tinggal) sepenuhnya adalah hak istri. Jika suami memberikan 'uang jajan' tambahan khusus untuk istri, itu sepenuhnya milik istri dan suami tidak berhak mengambilnya kembali tanpa izin ya! 💌";
      }
      // Ustadzah topics
      else if (lower.includes("wanita di hari jum'at") || lower.includes("hari jum'at") || lower.includes("amalan hari jum'at")) {
        reply = "Sahabat, bagi wanita, hari Jum'at juga merupakan hari raya pekanan yang penuh berkah. Beberapa amalan utama yang sangat dianjurkan antara lain: membaca surah Al-Kahfi, memperbanyak shalawat atas Rasulullah SAW, membersihkan diri (self grooming), berpakaian bersih, serta memperbanyak doa di sore hari (terutama setelah Ashar menjelang Maghrib) karena itu adalah waktu yang sangat mustajab. Semoga Allah menerima amalan kita ya! 🕌🌸";
      } else if (lower.includes("aplikasi hp saat sedang haid") || lower.includes("lewat aplikasi hp") || lower.includes("baca al-qur'an lewat aplikasi")) {
        reply = "Sahabat yang baik, para ulama kontemporer memperbolehkan wanita haid menyentuh dan membaca Al-Qur'an dari layar HP atau tablet karena HP tidak dihukumi sebagai mushaf fisik. Namun, untuk membaca dengan lisan, mayoritas ulama menganjurkan agar diniatkan sebagai dzikir, belajar, atau murojaah (bukan tilawah murni). Ini adalah kemudahan luar biasa agar kita tetap bisa terhubung dengan kalamullah ya. 📱✨";
      } else if (lower.includes("menjaga keikhlasan hati") || lower.includes("tidak riya' saat beribadah") || lower.includes("keikhlasan ibadah")) {
        reply = "Masya Allah, ini adalah ikhtiar hati yang sangat mulia, Sahabat. Menjaga keikhlasan dari riya' dan sum'ah memang butuh perjuangan konstan. Tips praktisnya: usahakan memiliki amalan rahasia yang hanya diketahui olehmu dan Allah (misalnya sholat tahajud atau sedekah sembunyi-sembunyi), selalu perbarui niat lillahi ta'ala di awal amalan, dan berdoalah dengan doa yang diajarkan Rasulullah: Allahumma inni a'udzu bika an usyrika bika wa ana a'lamu, wa astaghfiruka lima laa a'lamu. 💖";
      } else if (lower.includes("meminta maaf kepada suami") || lower.includes("adab meminta maaf")) {
        reply = "Sahabat, dalam rumah tangga, kerelaan dan ridha suami adalah jalan syurga bagi istri. Adab meminta maaf yang indah adalah dengan menurunkan ego, berbicara dengan suara lembut, menyentuh atau menggenggam tangannya dengan penuh kasih sayang, mengakui kesalahan tanpa mencari pembenaran, dan berjanji untuk memperbaiki diri. Semoga Allah melembutkan hati kalian dan memberkahi rumah tangga kalian ya. 🌸";
      }
      // Bestie topics
      else if (lower.includes("stop impulsif buying") || lower.includes("impulsif buying") || lower.includes("diskon flash sale")) {
        reply = "Ih bestie, relates banget! Biar kantong gak jebol pas flash sale, terapin Rule 24 Jam ya. Jadi kalau ada barang lucu, masukin keranjang aja dulu terus tutup aplikasinya. Kalau besoknya kamu masih kepikiran & butuh banget, baru checkout. Plus, bedain mana yang 'butuh' mana yang cuma 'laper mata' biar gak tabzir (pemborosan). Inget, uangnya mending ditabung buat impian masa depanmu! 💸🎀";
      } else if (lower.includes("nabung emas atau investasi") || (lower.includes("nabung emas") && lower.includes("reksa dana"))) {
        reply = "Dua-duanya oke banget bestie! Nabung emas itu cocok buat jangka menengah-panjang (di atas 3-5 tahun) karena dia tahan inflasi & fisiknya liquid (mudah dicairkan). Kalau reksa dana syariah (terutama pasar uang) pas banget buat dana darurat jangka pendek karena praktis, bebas riba, dan bisa dicairkan kapan aja lewat HP. Jadi sesuaikan sama target keuangan kamu ya! 💍✨";
      } else if (lower.includes("nagih utang ke temen") || lower.includes("nagih utang")) {
        reply = "Duh, ini emang momen paling canggung ya bestie! Tipsnya: coba bahas secara kasual sambil bawa topik rencana keuangan kamu, misalnya: 'Eh bestie, sori banget nih aku lagi butuh dana buat bayar tagihan/tabungan jangka pendek, boleh cicil atau transfer sisa kemarin gak?' Kalau masih seret, tawarkan opsi dicicil sedikit-sedikit biar gak memberatkan dia tapi hak kamu tetap kembali. Semangat ya! 🤫";
      } else if (lower.includes("dana darurat atau tabungan umroh") || (lower.includes("dana darurat") && lower.includes("tabungan umroh"))) {
        reply = "Wah bestie, prioritaskan dana darurat dulu ya! Dalam syariah, menjaga keselamatan diri dari kesulitan keuangan mendesak (dharuriyyat) hukumnya wajib. Setelah dana darurat aman (minimal 3x pengeluaran bulanan), kamu bisa mulai alokasikan porsi tabungan secara konsisten untuk umroh (hajat/ibadah). Semoga niat baikmu dimudahkan ya! 🎒💖";
      }
      // Expert topics
      else if (lower.includes("saham syariah compliance") || lower.includes("saham dinyatakan syariah")) {
        reply = "Berdasarkan ketetapan DSN-MUI, sebuah saham dikategorikan Syariah Compliance jika: 1. Kegiatan usahanya tidak melanggar syariat (bebas riba, maysir, gharar, barang haram). 2. Rasio keuangan memenuhi batas maksimum: total utang berbasis bunga dibanding total aset tidak lebih dari 45%, dan total pendapatan non-halal dibanding total pendapatan usaha tidak lebih dari 10%. Anda dapat memeriksa Daftar Efek Syariah (DES) resmi yang diperbarui berkala. 📊";
      } else if (lower.includes("hukum cashback") || lower.includes("cashback") || lower.includes("e-wallet")) {
        reply = "Hukum cashback/diskon e-wallet diperbolehkan (halal) apabila dana e-wallet diposisikan sebagai akad Wadiah (titipan) atau Qardh (utang) di mana cashback tersebut bersumber dari pihak merchant (sebagai strategi pemasaran/hadiah/hibah) dan bukan bunga dari uang yang Anda endapkan. Namun, jika cashback dipersyaratkan langsung dari pengendapan saldo yang berbunga, maka hal tersebut harus dihindari karena terindikasi riba qardh. 💳";
      } else if (lower.includes("nisab zakat maal") || lower.includes("zakat tabungan") || lower.includes("nisab zakat")) {
        reply = "Nisab zakat maal adalah setara 85 gram emas murni. Jika dikonversi (asumsi harga emas Rp 1.400.000/gram), maka batas nisab berkisar Rp 119.000.000. Jika tabungan bersih Anda yang telah tersimpan selama 1 tahun penuh (haul) mencapai atau melebihi batas tersebut, Anda wajib mengeluarkan zakat maal sebesar 2.5% dari total saldo bersih tersebut. Rumus: Zakat = Saldo Bersih x 2.5%. 💰";
      } else if (lower.includes("arisan berantai") || lower.includes("arisan berantai/multi-level")) {
        reply = "Hukum arisan berantai atau multi-level yang disertai biaya pendaftaran fiktif atau bonus rekrutmen anggota baru (skema ponzi/pyramid scheme) hukumnya adalah haram. Akad ini mengandung unsur gharar (ketidakpastian tinggi), maysir (judi/spekulasi), dan memakan harta orang lain secara bathil. Berbeda dengan arisan konvensional biasa yang murni tolong-menolong tanpa ada unsur komisi rekrutmen. 🤝";
      }
      // General Keyword Responses
      else if (lower.includes("boros") || lower.includes("netflix") || lower.includes("pengeluaran")) {
        if (persona === "bestie") {
          reply = "Ih bestie, jajan kamu bulan ini banyak yang boros deh! Menurut prinsip syariah, tabzir (pemborosan) itu harus dihindari biar hidup kita tenang & berkah. Yuk mulai dikurangin nongkrong impulsifnya, terus sisanya ditabung buat celengan rencana baik! 🎀";
        } else if (persona === "expert") {
          reply = "Berdasarkan analisis klasifikasi biaya, rasio pengeluaran non-primer (boros) Anda tergolong tinggi. Dalam manajemen keuangan syariah, disarankan untuk memprioritaskan dharuriyyat (kebutuhan pokok) dan menekan pengeluaran tersier agar surplus kas bersih bernilai optimal. 💼";
        } else {
          reply = "Sahabat yang baik, menghindari tabzir (pemborosan) sangat dianjurkan dalam Islam. Mengurangi pengeluaran yang tidak terlalu mendesak dan mengalokasikan dana tersebut untuk ditabung atau disedekahkan akan membawa ketenangan dan keberkahan dalam rezeki kita. 🌸";
        }
      } else if (lower.includes("ibadah") || lower.includes("dzikir") || lower.includes("sholat")) {
        if (persona === "bestie") {
          reply = "Masya Allah, bangga banget sama progres ibadahmu! Tetep konsisten ya bestie, adem banget ngeliat checklist harianmu ijo terus. Kalau lagi lelah, inget deep talk lewat sujud itu penenang hati paling ampuh! 💫";
        } else if (persona === "expert") {
          reply = "Indeks konsistensi amalan ibadah harian Anda menunjukkan tren positif sebesar 82%. Untuk menjaga stabilitas spiritual ini, disarankan untuk menyusun jadwal ibadah sunnah secara terjadwal guna mendukung peningkatan skor halal habit Anda secara berkelanjutan. 💼";
        } else {
          reply = "Alhamdulillah Sahabat, senang melihat keistiqomahanmu dalam beribadah. Amalan yang sedikit namun dilakukan secara kontinu sangat dicintai oleh Allah SWT. Teruskan berdzikir pagi petang dan menjaga sholat tepat waktu ya. 🌸";
        }
      } else if (lower.includes("zakat") || lower.includes("sedekah") || lower.includes("emas") || lower.includes("nisab")) {
        reply = "Zakat maal dihitung berdasarkan nisab setara 85 gram emas murni. Jika tabungan bersih Anda mencapai batas tersebut dan tertahan selama 1 tahun (haul), wajib dikeluarkan zakatnya sebesar 2.5%. Anda bisa memantau kemajuannya di tracker nisab zakat maal! 🕌";
      } else {
        if (persona === "bestie") {
          reply = "Wah, pertanyaan seru nih bestie! Intinya kelola duit secara syariah itu bukan bikin repot, tapi malah bikin hati adem karena bebas riba. Ada lagi nggak yang mau kamu ceritain ke aku? 🎀";
        } else if (persona === "expert") {
          reply = "Pertanyaan Anda sangat relevan dengan kepatuhan syariah (Shariah Compliance). Pengelolaan aset finansial yang bebas dari unsur maysir (judi), gharar (ketidakpastian), dan riba adalah landasan utama dalam mengoptimalkan kekayaan umat secara adil. 💼";
        } else {
          reply = "Masya Allah, pertanyaan yang baik sekali, Sahabat. Mengelola harta dengan amanah merupakan bagian dari ibadah. Semoga Allah SWT senantiasa memberikan keberkahan pada rezeki yang kita cari dan belanjakan. Apakah ada hal lain yang ingin kita diskusikan? 😊";
        }
      }

      // Add Persona Style adjustments to replies if not standard Q&A
      const aiMsg: Message = {
        id: Date.now() + 1,
        sender: "ai",
        text: reply,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      const finalMsgList = [...nextList, aiMsg];
      saveMessagesToLocal(finalMsgList);
      setIsTyping(false);
    }, 1200);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    handleSendQuery(input);
    setInput("");
  };

  const clearChat = () => {
    const clearedList: Message[] = [
      {
        id: Date.now(),
        sender: "ai",
        text: persona === "bestie" 
          ? "Chat udah bersih ya bestie! Ada gosip finansial apa lagi nih hari ini? 🎀"
          : persona === "expert"
          ? "Jurnal percakapan dibersihkan. Silakan ajukan kueri analisis keuangan syariah Anda. 💼"
          : "Chat dibersihkan. Ada yang bisa saya bantu lagi untuk hari ini, Sahabat? 🌸",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ];
    saveMessagesToLocal(clearedList);
  };

  const handlePersonaChange = (newPersona: "ustadzah" | "bestie" | "expert") => {
    setPersona(newPersona);
    let introText = "";
    if (newPersona === "bestie") {
      introText = "Hi bestie! Aku Financial Bestie AI Advisor-mu. Di sini kita bebas curhat apa aja soal jajan, tabungan, atau utang biar hidup kita makin adem & barakah. Nanya apa hari ini? 🎀";
    } else if (newPersona === "expert") {
      introText = "Selamat datang di Shariah Financial Advisor. Saya siap membantu Anda melakukan analisis kepatuhan syariah (Shariah Compliance) dan optimalisasi alokasi aset halal Anda. Silakan mulai kueri. 💼";
    } else {
      introText = "Assalamualaikum Sahabat! 🌸 Saya Ustadzah ramah AI Advisor keuangan syariahmu. Ada yang ingin kamu diskusikan hari ini tentang budget, kategori syubhat, ibadah harian, atau nisab zakatmu?";
    }

    const firstMsg: Message = {
      id: Date.now(),
      sender: "ai",
      text: introText,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    saveMessagesToLocal([firstMsg]);
  };

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
          background-color: transparent;
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
          border-radius: 24px;
          overflow: hidden;
          border: 1px solid var(--border);
        }

        @media (max-width: 1024px) {
          .app-wrap {
            grid-template-columns: 1fr;
          }
        }

        .main { padding: 32px 32px 48px 36px; border-right: 1px solid var(--border); display: flex; flex-direction: column; }
        .sidebar {
          padding: 24px 20px;
          background: var(--sidebar-bg);
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .ai-brand {
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
        .ai-brand::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background-image: radial-gradient(rgba(200, 100, 122, 0.08) 1.5px, transparent 1.5px);
          background-size: 16px 16px;
          pointer-events: none;
          opacity: 0.75;
        }
        .ai-brand-decor-left, .ai-brand-decor-right {
          font-size: 26px;
          user-select: none;
          display: inline-block;
          animation: floatSlow 3.5s ease-in-out infinite;
        }
        .ai-brand-decor-left { margin-bottom: -10px; }
        .ai-brand-decor-right { margin-top: -10px; }
        
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-4px) rotate(3deg); }
        }

        .ai-brand-title {
          font-family: 'Sacramento', 'Caveat', 'Great Vibes', cursive;
          font-size: 58px;
          font-weight: 400;
          color: var(--rose);
          letter-spacing: 0px;
          line-height: 1;
          text-shadow: 2px 2px 0px rgba(252, 226, 240, 0.9);
          margin: 6px 0;
          z-index: 1;
        }
        .ai-brand-sub {
          font-size: 10.5px;
          letter-spacing: 2px;
          color: var(--brown-mid);
          margin-top: 4px;
          text-transform: uppercase;
          font-weight: 600;
          z-index: 1;
        }

        .chat-container {
          flex: 1;
          background: linear-gradient(180deg, rgba(255, 240, 244, 0.5) 0%, rgba(255, 250, 252, 0.75) 100%);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1.5px solid rgba(244, 99, 128, 0.16);
          border-radius: 28px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          box-shadow: 0 12px 36px rgba(200, 100, 122, 0.04), inset 0 0 20px rgba(255, 255, 255, 0.8);
          min-height: 420px;
        }

        .chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
          background: transparent;
        }
        .chat-messages::-webkit-scrollbar {
          width: 4px;
        }
        .chat-messages::-webkit-scrollbar-thumb {
          background: var(--rose-light);
          border-radius: 2px;
        }

        .bubble-ai {
          background: var(--white);
          border: 1px solid rgba(200, 100, 122, 0.08);
          color: var(--brown-text);
          border-radius: 20px 20px 20px 6px;
          padding: 14px 18px;
          font-size: 13.5px;
          line-height: 1.6;
          box-shadow: 0 4px 12px rgba(200, 100, 122, 0.02);
        }
        .bubble-user {
          background: linear-gradient(135deg, rgba(255, 225, 232, 0.8) 0%, rgba(255, 238, 242, 0.95) 100%);
          border: 1px solid rgba(200, 100, 122, 0.18);
          color: var(--brown-dark);
          border-radius: 20px 20px 6px 20px;
          padding: 14px 18px;
          font-size: 13.5px;
          line-height: 1.6;
          box-shadow: 0 4px 12px rgba(200, 100, 122, 0.02);
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

        .persona-btn {
          width: 100%;
          padding: 10px 12px;
          border-radius: 8px;
          border: 1px solid var(--border);
          background: var(--white);
          font-size: 12px;
          font-weight: 600;
          color: var(--brown-mid);
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
        }
        .persona-btn:hover {
          border-color: var(--rose-light);
          background: var(--rose-bg);
        }
        .persona-btn.active {
          background: var(--rose);
          border-color: var(--rose);
          color: white;
        }

        .topic-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 10px;
          border-radius: 8px;
          border: 1px solid transparent;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 11.5px;
          color: var(--brown-mid);
        }
        .topic-row:hover {
          background: var(--rose-bg);
          border-color: var(--border2);
          color: var(--rose);
        }

        .tips-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .tip-card {
          padding: 10px 12px;
          background: var(--cream2);
          border: 1px solid var(--border);
          border-radius: 8px;
          font-size: 11px;
          line-height: 1.5;
        }
      `}</style>

      <div className="app-wrap">
        
        {/* ═══════════ MAIN COLUMN ═══════════ */}
        <div className="main">
          
          {/* Header & Clear */}
          <div className="flex justify-between items-center pt-2 pb-4 mb-5 border-b border-pink-100/50">
            <div>
              <h2 className="text-2xl font-extrabold text-[#C8647A] font-serif tracking-wide">
                🎀 AI Advisor Syariah
              </h2>
              <p className="text-[11px] mt-1.5 font-sans font-semibold text-slate-400 uppercase tracking-wider">
                Tanya Jawab Finansial &amp; Konsistensi Ibadah
              </p>
            </div>
            <button
              onClick={clearChat}
              className="p-2.5 bg-rose-bg border border-pink-100 hover:border-rose-300 text-[#C8647A] hover:bg-rose-100/50 rounded-full shadow-xs transition duration-200 cursor-pointer"
              title="Bersihkan Obrolan"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          {/* Chat Box */}
          <div className="chat-container">
            <div className="chat-messages space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 max-w-[85%] ${
                    msg.sender === "user" ? "ml-auto flex-row-reverse" : ""
                  }`}
                >
                  {/* Avatar */}
                  <div
                    className={`h-8 w-8 rounded-full shrink-0 flex items-center justify-center border shadow-xs ${
                      msg.sender === "ai"
                        ? "bg-gradient-to-tr from-rose-300 to-[#C8647A] border-[#E8748A]/20 text-white"
                        : "bg-rose-500/10 border-rose-500/20 text-rose-600"
                    }`}
                  >
                    {msg.sender === "ai" ? <Bot className="h-4.5 w-4.5" /> : <User className="h-4.5 w-4.5" />}
                  </div>

                  {/* Speech Bubble */}
                  <div className="space-y-1">
                    <div className={msg.sender === "ai" ? "bubble-ai" : "bubble-user"}>
                      {msg.text}
                    </div>
                    <p className={`text-[9px] text-slate-400 font-serif px-1 ${msg.sender === "user" ? "text-right" : ""}`}>
                      {msg.time}
                    </p>
                  </div>
                </div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex items-start gap-3 max-w-[85%]">
                  <div className="h-8 w-8 rounded-full shrink-0 flex items-center justify-center bg-gradient-to-tr from-rose-300 to-[#C8647A] border-[#E8748A]/20 text-white">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="bg-white border border-pink-100/60 p-3 rounded-2xl rounded-tl-none flex items-center gap-1 shadow-xs">
                    <span className="w-1.5 h-1.5 bg-rose-300 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 bg-rose-300 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 bg-rose-300 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}
              
              <div ref={chatEndRef} />
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSend} className="p-5 pb-7 bg-transparent flex gap-3 shrink-0 items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Tanyakan keuanganmu (misal: 'Bagaimana kondisi keuanganku?', 'Saran zakat'..."
                className="flex-1 bg-white border border-pink-200/80 rounded-full py-3.5 px-6 text-[13px] text-[#3D222E] placeholder-[#7C5A6B] focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-200/50 transition font-sans font-semibold shadow-xs"
              />
              <button
                type="submit"
                className="h-11 w-11 rounded-full bg-gradient-to-r from-rose-300 to-[#C8647A] hover:from-rose-400 hover:to-[#B05467] text-white shadow-md hover:shadow-lg transition duration-200 flex items-center justify-center cursor-pointer shrink-0"
              >
                <Send className="h-4.5 w-4.5" />
              </button>
            </form>
          </div>

        </div>

        {/* ═══════════ SIDEBAR COLUMN ═══════════ */}
        <div className="sidebar">

          {/* Brand Header */}
          <div className="ai-brand">
            <div className="flex items-center gap-3 justify-center z-10">
              <span className="ai-brand-decor-left">🎀</span>
              <div className="ai-brand-title">Advisor AI</div>
              <span className="ai-brand-decor-right">🎀</span>
            </div>
            <div className="ai-brand-sub">Asisten Fiqih &amp; Finansialmu</div>
          </div>

          {/* Persona Selector */}
          <div className="sidebar-card">
            <div className="side-title">🌸 Karakter Advisor</div>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                className={`persona-btn ${persona === "ustadzah" ? "active" : ""}`}
                onClick={() => handlePersonaChange("ustadzah")}
              >
                <Smile className="h-4 w-4" />
                <div>
                  <div className="font-bold">Ustadzah Ramah 🌸</div>
                  <div className="text-[9.5px] opacity-80 font-normal">Nasehat hangat &amp; keibuan</div>
                </div>
              </button>

              <button
                type="button"
                className={`persona-btn ${persona === "bestie" ? "active" : ""}`}
                onClick={() => handlePersonaChange("bestie")}
              >
                <Heart className="h-4 w-4" />
                <div>
                  <div className="font-bold">Financial Bestie 🎀</div>
                  <div className="text-[9.5px] opacity-80 font-normal">Gaya santai ala Gen-Z</div>
                </div>
              </button>

              <button
                type="button"
                className={`persona-btn ${persona === "expert" ? "active" : ""}`}
                onClick={() => handlePersonaChange("expert")}
              >
                <Sparkles className="h-4 w-4" />
                <div>
                  <div className="font-bold">Syar&apos;i Expert 💼</div>
                  <div className="text-[9.5px] opacity-80 font-normal">Formal, detail &amp; akademis</div>
                </div>
              </button>
            </div>
          </div>

          {/* Popular Topics */}
          <div className="sidebar-card">
            <div className="side-title">📚 Pertanyaan Populer</div>
            <div className="flex flex-col gap-1.5">
              {PERSONA_TOPICS[persona].map((topic, i) => (
                <div
                  key={i}
                  className="topic-row"
                  role="button"
                  tabIndex={0}
                  onClick={() => handleSendQuery(topic.query)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleSendQuery(topic.query);
                    }
                  }}
                >
                  <span>{topic.label}</span>
                  <ChevronRight className="h-3.5 w-3.5 opacity-60" />
                </div>
              ))}
            </div>
          </div>

          {/* Rezeki Boosters */}
          <div className="sidebar-card flex-grow flex flex-col justify-between">
            <div>
              <div className="side-title">✨ Amal Pembuka Rezeki</div>
              <div className="tips-list">
                <div className="tip-card">
                  <strong>🌅 Sedekah Subuh</strong>
                  <div className="text-muted mt-0.5">Sedekah di awal hari didoakan khusus oleh Malaikat agar dilipatgandakan hartanya.</div>
                </div>
                <div className="tip-card">
                  <strong>🌱 Istighfar 100x</strong>
                  <div className="text-muted mt-0.5">Memperbanyak istighfar dipercaya membuka keran rezeki yang tersumbat dari jalan tak terduga.</div>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
