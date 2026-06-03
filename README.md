# 🌸 Halal Habit Tracker

> *"Kelola rezeki dengan amanah & bijaksana — Catat, Pantau & Ibadah Bareng."*

Platform manajemen keuangan syariah berbasis AI yang dirancang khusus untuk Muslim muda (Gen Z & Milenial) Indonesia. Memadukan **ibadah tracker**, **skor halal**, **pencatatan keuangan syariah**, dan **AI advisor personal** dalam satu aplikasi PWA yang estetik dan ramah pengguna.

---

## ✨ Proposisi Nilai

Halal Habit Tracker adalah **satu-satunya** platform yang mengintegrasikan:

- Keuangan syariah + ibadah tracker dalam satu platform
- Gamifikasi islami (streak, badge, halal score)
- AI Advisor personal berbasis Claude API (Anthropic) dengan konteks data nyata pengguna
- Estetika modern yang menarik bagi generasi muda

---

## 📦 Modul Aplikasi

| Modul | Deskripsi | Prioritas |
|---|---|---|
| M01 — Dashboard Keuangan | Real-time ringkasan saldo, pengeluaran, ibadah, halal score | P0 — Must Have |
| M02 — Ibadah Tracker Harian | Checklist 5 ibadah utama + grafik 7 hari | P0 — Must Have |
| M03 — Keuangan Syariah | Catat & kategorikan transaksi dengan auto-tag halal/syubhat | P0 — Must Have |
| M04 — AI Advisor | Asisten AI personal berbasis data nyata pengguna (Claude API) | P1 — Should Have |
| M05 — Zakat & Sedekah | Progress nisab otomatis + rekap sedekah 4 minggu | P1 — Should Have |
| M06 — Streak & Gamifikasi | Streak harian + badge pencapaian + level system | P1 — Should Have |

---

## 🛠️ Tech Stack

| Layer | Teknologi | Versi |
|---|---|---|
| Framework | Next.js (App Router) | 14 |
| UI Library | React | 18 |
| Styling | Tailwind CSS | 3.x |
| Charts | Chart.js | 4.x |
| Database | Supabase PostgreSQL | Latest |
| Auth | Supabase Auth + JWT | — |
| Storage | Supabase Storage | — |
| AI Engine | Claude API (Anthropic) | claude-sonnet-4 |
| Deployment | Vercel | — |
| Version Control | GitHub | — |

---

## 🚀 Cara Menjalankan Proyek

### Prasyarat

- Node.js >= 18.x
- npm atau yarn
- Akun Supabase (project aktif)
- API Key Anthropic (Claude API)
- Akun Vercel (untuk deployment)

### Instalasi

```bash
# Clone repository
git clone https://github.com/your-org/halal-habit-tracker.git
cd halal-habit-tracker

# Install dependencies
npm install

# Salin file environment
cp .env.example .env.local
```

### Konfigurasi Environment Variables

Isi file `.env.local` dengan nilai yang sesuai:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Anthropic Claude API
ANTHROPIC_API_KEY=your-anthropic-api-key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Menjalankan di Mode Development

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

### Build untuk Production

```bash
npm run build
npm start
```

---

## 🗂️ Struktur Direktori

```
halal-habit-tracker/
├── app/                        # Next.js 14 App Router
│   ├── (auth)/                 # Route group autentikasi
│   │   ├── login/
│   │   └── register/
│   ├── dashboard/              # Dashboard utama
│   ├── ibadah/                 # Ibadah tracker
│   ├── keuangan/               # Modul keuangan syariah
│   ├── ai-advisor/             # AI Advisor (Claude API)
│   ├── zakat/                  # Zakat & sedekah
│   ├── streak/                 # Streak & gamifikasi
│   └── layout.tsx              # Root layout
├── components/                 # Komponen React reusable
│   ├── ui/                     # Komponen UI dasar
│   ├── charts/                 # Komponen Chart.js
│   ├── dashboard/              # Komponen khusus dashboard
│   └── shared/                 # Komponen bersama
├── lib/                        # Utility & helpers
│   ├── supabase/               # Supabase client & helpers
│   ├── claude/                 # Claude API integration
│   ├── halal-score/            # Engine kalkulasi Halal Score
│   └── utils/                  # Utility functions
├── public/                     # Aset statis
│   ├── icons/                  # PWA icons
│   └── images/
├── styles/                     # Global styles
├── types/                      # TypeScript type definitions
├── hooks/                      # Custom React hooks
├── middleware.ts               # Auth middleware (Supabase)
├── next.config.js              # Next.js configuration
├── tailwind.config.js          # Tailwind CSS configuration
└── public/manifest.json        # PWA manifest
```

---

## 🗃️ Database Schema (Ringkasan)

```sql
-- Pengguna
users: id, email, nama, avatar_url, level, created_at, updated_at

-- Transaksi keuangan
transactions: id, user_id, tipe, nominal, kategori, tag_syariah, deskripsi, tanggal, created_at

-- Log ibadah harian
ibadah_logs: id, user_id, tanggal, sholat_5waktu, baca_quran, dzikir, sedekah, sholat_sunnah, created_at

-- Halal score harian
halal_scores: id, user_id, tanggal, financial_discipline, syariah_compliance, habit_consistency, total_score, level, created_at

-- Log sedekah
sedekah_logs: id, user_id, nominal, deskripsi, tanggal, created_at

-- Streak ibadah
streaks: id, user_id, streak_count, last_check_date, longest_streak, created_at
```

---

## 📊 Sistem Level

| Level | Halal Score | Deskripsi |
|---|---|---|
| Beginner | 0–49 | Mulai perjalanan |
| Consistent | 50–69 | Membangun kebiasaan |
| Elite | 70–89 | Konsisten & terpercaya |
| Amanah | 90–100 | Puncak keistiqomahan |

---

## 🗺️ Roadmap

| Fase | Durasi | Fokus |
|---|---|---|
| Fase 1 — Fondasi | 1–2 bulan | Setup infrastruktur, auth, input dasar |
| Fase 2 — Fitur Inti | 2–3 bulan | Halal Score, streak, AI Advisor |
| Fase 3 — Keuangan Syariah | 1–2 bulan | Auto-categorization, zakat calculator |
| Fase 4 — Optimasi | 1 bulan | Dark mode, PWA installable, onboarding |
| Fase 5 — Skala | Ongoing | Multi-user, Open Banking, AI memory |

---

## 🎯 Target Metrik (Tahun Pertama)

| Metrik | Target |
|---|---|
| Total Pengguna Terdaftar | 10.000+ |
| Monthly Active Users (MAU) | 6.000 |
| Daily Active Users (DAU) | 2.000 |
| DAU/MAU Ratio | ≥ 40% |
| Uptime Aplikasi | ≥ 99,5% |

---

## 📄 Dokumentasi Terkait

- [Architecture.md](./Architecture.md) — Arsitektur sistem & alur data
- [Compliance.md](./Compliance.md) — Kepatuhan syariah & regulasi
- [AI_Spec.md](./AI_Spec.md) — Spesifikasi teknis AI Advisor (Claude API)
- [Dev_Guide.md](./Dev_Guide.md) — Panduan pengembangan & kontribusi
- [Security.md](./Security.md) — Kebijakan keamanan & privasi data
- [Business_Rules.md](./Business_Rules.md) — Aturan bisnis & logika aplikasi

---

## 📜 Lisensi

Proprietary — © 2025 Halal Habit Tracker. All rights reserved.

---

*🌸 Halal Habit Tracker · v1.0.0 MVP · Syariah 2025*  
*Catat, Pantau & Ibadah Bareng*
