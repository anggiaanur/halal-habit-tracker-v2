# 🏗️ Architecture.md — Halal Habit Tracker

> Dokumen ini menjelaskan arsitektur sistem, tech stack, alur data, dan desain infrastruktur Halal Habit Tracker secara menyeluruh.

---

## 1. Gambaran Arsitektur Sistem

```
PENGGUNA (Muslim muda, Gen Z)
        │
        ▼
┌───────────────────────────────┐
│  FRONTEND                     │
│  React / Next.js 14           │
│  Tailwind CSS · Chart.js      │
└───────────────┬───────────────┘
                │ API Calls / Server Actions
                ▼
┌───────────────────────────────┐
│  BACKEND                      │
│  Supabase PostgreSQL          │
│  Supabase Auth (JWT)          │
│  Supabase Storage             │
└───────────────┬───────────────┘
                │
                ▼
┌───────────────────────────────┐
│  AI ENGINE                    │
│  Claude API (Anthropic)       │
│  Model: claude-sonnet-4       │
└───────────────────────────────┘
        │
        ▼
┌───────────────────────────────┐
│  DEPLOYMENT                   │
│  Vercel · CI/CD GitHub        │
│  Edge Network Global          │
└───────────────────────────────┘
```

---

## 2. Layer-by-Layer Detail

### 2.1 Frontend Layer

**Framework:** Next.js 14 dengan App Router

Alasan pemilihan:
- Server-Side Rendering (SSR) untuk performa dan SEO yang lebih baik
- App Router memungkinkan layout bersarang dan route groups
- Next.js API Routes digunakan sebagai proxy untuk panggilan Claude API (menjaga API key tidak terekspos ke client)
- Built-in image optimization dan code splitting

**Komponen UI:**

```
components/
├── ui/
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Modal.tsx
│   ├── ProgressBar.tsx
│   └── Badge.tsx
├── charts/
│   ├── LineChart.tsx        # Tren pengeluaran harian
│   ├── BarChart.tsx         # Grafik ibadah 7 hari
│   ├── DonutChart.tsx       # Kategori pengeluaran
│   └── RingChart.tsx        # Halal Score SVG ring
├── dashboard/
│   ├── KPICard.tsx
│   ├── HalalScoreWidget.tsx
│   ├── StreakWidget.tsx
│   └── RecentTransactions.tsx
└── shared/
    ├── Navbar.tsx
    ├── Sidebar.tsx
    └── BottomNav.tsx         # Navigasi mobile
```

**Palet Warna & Desain Token:**

| Peran | Nama | Hex |
|---|---|---|
| Primary | Pink Magenta | `#E91E8C` |
| Secondary | Lavender | `#A78BFA` |
| Accent | Mint Green | `#6EE7B7` |
| Background Dark | Deep Navy | `#1A1033` |
| Background Light | Soft Pink | `#FDF2F8` |
| Text Primary | Dark Slate | `#1E293B` |
| Text Secondary | Gray | `#64748B` |

**Navigasi:**

```
Sidebar (Desktop) / Bottom Tab (Mobile):
├── 🏠 Dashboard
├── 🕌 Ibadah
├── 💰 Keuangan
├── ✨ AI Advisor
├── 🌙 Zakat & Sedekah
└── 🏆 Streak & Badge
```

---

### 2.2 Backend Layer

**Platform:** Supabase (Backend-as-a-Service)

Supabase menyediakan:
- **PostgreSQL** — database relasional utama
- **Auth** — autentikasi berbasis JWT (email/password)
- **Storage** — penyimpanan file (avatar, export laporan)
- **Real-time** — sinkronisasi data live ke frontend
- **Row Level Security (RLS)** — isolasi data per pengguna

**Autentikasi Flow:**

```
User (Login Form)
      │
      ▼
Supabase Auth (email + password)
      │
      ▼
JWT Token diterbitkan
      │
      ▼
Token disimpan sebagai HttpOnly Cookie
      │
      ▼
Middleware Next.js memverifikasi token
pada setiap request ke route protected
```

---

### 2.3 Database Layer

#### Skema Lengkap Tabel

**Tabel: `users`**
```sql
CREATE TABLE users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT UNIQUE NOT NULL,
  nama        TEXT NOT NULL,
  avatar_url  TEXT,
  level       TEXT DEFAULT 'Beginner',
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);
```

**Tabel: `transactions`**
```sql
CREATE TABLE transactions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES users(id) ON DELETE CASCADE,
  tipe         TEXT CHECK (tipe IN ('pemasukan', 'pengeluaran')) NOT NULL,
  nominal      NUMERIC(15, 2) NOT NULL,
  kategori     TEXT NOT NULL,
  tag_syariah  TEXT CHECK (tag_syariah IN ('halal', 'syubhat', 'boros')) NOT NULL,
  deskripsi    TEXT,
  tanggal      DATE NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT now()
);
```

**Tabel: `ibadah_logs`**
```sql
CREATE TABLE ibadah_logs (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID REFERENCES users(id) ON DELETE CASCADE,
  tanggal        DATE NOT NULL,
  sholat_5waktu  BOOLEAN DEFAULT false,
  baca_quran     BOOLEAN DEFAULT false,
  dzikir         BOOLEAN DEFAULT false,
  sedekah        BOOLEAN DEFAULT false,
  sholat_sunnah  BOOLEAN DEFAULT false,
  created_at     TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, tanggal)
);
```

**Tabel: `halal_scores`**
```sql
CREATE TABLE halal_scores (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID REFERENCES users(id) ON DELETE CASCADE,
  tanggal               DATE NOT NULL,
  financial_discipline  NUMERIC(5, 2),
  syariah_compliance    NUMERIC(5, 2),
  habit_consistency     NUMERIC(5, 2),
  total_score           NUMERIC(5, 2),
  level                 TEXT,
  created_at            TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, tanggal)
);
```

**Tabel: `sedekah_logs`**
```sql
CREATE TABLE sedekah_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  nominal     NUMERIC(15, 2) NOT NULL,
  deskripsi   TEXT,
  tanggal     DATE NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now()
);
```

**Tabel: `streaks`**
```sql
CREATE TABLE streaks (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  streak_count    INTEGER DEFAULT 0,
  last_check_date DATE,
  longest_streak  INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT now()
);
```

#### Row Level Security (RLS)

Setiap tabel mengaktifkan RLS sehingga pengguna **hanya dapat membaca dan menulis data miliknya sendiri**:

```sql
-- Contoh policy pada tabel transactions
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "User hanya bisa akses data sendiri"
ON transactions
FOR ALL
USING (auth.uid() = user_id);
```

---

### 2.4 AI Engine Layer

**Model:** `claude-sonnet-4` via Anthropic API

Panggilan Claude API dilakukan dari **Next.js API Route** (`/api/ai-advisor`) — tidak pernah langsung dari browser — untuk menjaga keamanan API key.

**Alur Panggilan AI:**

```
User mengetik pertanyaan di AI Advisor Panel
            │
            ▼
POST /api/ai-advisor (Next.js Route Handler)
            │
            ▼
Server mengambil data konteks pengguna dari Supabase
(saldo, pengeluaran, ibadah, halal score, streak, nisab)
            │
            ▼
Konstruksi payload (system prompt + user context + pertanyaan)
            │
            ▼
POST ke https://api.anthropic.com/v1/messages
            │
            ▼
Respons AI dikirim kembali ke frontend
            │
            ▼
Ditampilkan di bubble chat AI Advisor Panel
```

**Parameter Teknis:**

| Parameter | Nilai |
|---|---|
| Model | `claude-sonnet-4` |
| Max Tokens | 512 per respons |
| Temperature | 0.7 |
| Bahasa | Indonesia (Gen Z-friendly) |

---

### 2.5 Deployment Layer

**Platform:** Vercel

```
GitHub Repository
      │
      │  Push ke branch main / merge PR
      ▼
GitHub Actions CI (lint + test)
      │
      ▼
Vercel Build (Next.js build)
      │
      ▼
Deploy ke Vercel Edge Network (Global CDN)
      │
      ├── Staging: halal-habit-tracker.vercel.app
      └── Production: app.halalhabittracker.id (custom domain)
```

---

## 3. Alur Data Utama

### 3.1 Input Transaksi Keuangan

```
User input form transaksi
        │
        ▼
Validasi di client (format, nominal)
        │
        ▼
POST ke Supabase: tabel transactions
        │
        ▼
Trigger auto-tag syariah (halal/syubhat/boros)
berdasarkan kategori & nominal
        │
        ▼
Update real-time di Dashboard (saldo, pengeluaran)
        │
        ▼
Recalculate Halal Score harian pada 23.59 WIB
```

### 3.2 Checklist Ibadah Harian

```
User centang ibadah di Ibadah Tracker
        │
        ▼
Auto-save (tanpa tombol submit) ke ibadah_logs
        │
        ▼
Update grafik bar 7 hari
        │
        ▼
Periksa kelengkapan ibadah hari ini
        │
        ├── Lengkap → Tambah streak count
        └── Tidak lengkap → Reset streak
        │
        ▼
Recalculate Habit Consistency di Halal Score
```

### 3.3 Kalkulasi Halal Score (Harian — 23.59 WIB)

```
Cron job / Supabase scheduled function
        │
        ▼
Ambil data bulan ini per user:
  - transaksi (rasio boros, rasio halal, riba check)
  - ibadah_logs (total checklist vs target)
  - sedekah_logs (regularity score)
        │
        ▼
Hitung 3 komponen:
  FD = (30 × (1 - rasio_boros)) + (10 × rasio_halal)          → maks 40
  SC = (20 × bebas_riba_score) + (10 × sedekah_regularity)    → maks 30
  HC = 30 × (total_checklist / total_target_bulan)             → maks 30
        │
        ▼
total_score = FD + SC + HC
        │
        ▼
Tentukan level:
  0–49  → Beginner
  50–69 → Consistent
  70–89 → Elite
  90–100 → Amanah
        │
        ▼
Simpan ke tabel halal_scores
Update tabel users.level
```

---

## 4. PWA & Offline Support

Halal Habit Tracker dibangun sebagai **Progressive Web App (PWA)**:

- **Service Worker** — caching aset statis dan API responses
- **Offline Mode** — input ibadah harian dapat dilakukan saat offline; disinkronkan saat koneksi kembali
- **Push Notification** — pengingat ibadah dan notifikasi zakat via browser push
- **Installable** — dapat diinstal di homescreen Android/iOS seperti aplikasi native
- **Web App Manifest** (`/public/manifest.json`) — nama, ikon, splash screen, theme color

**Strategi Caching Service Worker:**

| Aset | Strategi |
|---|---|
| Halaman statis | Cache First |
| API data pengguna | Network First (fallback ke cache) |
| Aset gambar/ikon | Cache First |
| Claude API response | Network Only (tidak di-cache) |

---

## 5. Skalabilitas & Performa

### Target Performa (Core Web Vitals)

| Metrik | Target |
|---|---|
| Largest Contentful Paint (LCP) | < 2,5 detik |
| First Input Delay (FID) | < 100ms |
| Uptime | ≥ 99,5% |
| Error rate API | < 0,5% |
| Waktu respons AI Advisor | < 5 detik |

### Strategi Optimasi

- **Code splitting** — Next.js dynamic import untuk modul berat
- **Image optimization** — Next.js `<Image>` component dengan WebP
- **Lazy loading** — Chart.js di-load hanya saat komponen chart terlihat
- **Edge Caching** — Vercel Edge Network untuk aset statis
- **Database indexing** — Index pada `user_id` dan `tanggal` di semua tabel utama
- **Supabase connection pooling** — via Supabase PgBouncer

---

## 6. Dependency Eksternal

| Layanan | Fungsi | Fallback |
|---|---|---|
| Supabase | Database, Auth, Storage | — (kritikal) |
| Anthropic Claude API | AI Advisor | Mode tanpa AI, caching respons umum |
| API Harga Emas Publik | Kalkulasi nisab zakat | Nilai nisab default statis (BAZNAS) |
| Vercel | Hosting & CI/CD | — (kritikal) |
| GitHub | Version control & CI | — (kritikal) |

---

*Halal Habit Tracker · Architecture v1.0.0 · Syariah 2025*
