# 🛠️ Dev Guide — Halal Habit Tracker
## Panduan Pengembangan Teknis Lengkap

---

| Atribut | Detail |
|---|---|
| **Produk** | Halal Habit Tracker |
| **Versi** | 1.0.0 |
| **Platform** | Web App (PWA) |
| **Dokumen** | Dev Guide |
| **Tanggal** | Mei 2025 |

---

## Daftar Isi

1. [Tech Stack & Versi](#1-tech-stack--versi)
2. [Setup Environment](#2-setup-environment)
3. [Struktur Proyek](#3-struktur-proyek)
4. [Arsitektur Sistem](#4-arsitektur-sistem)
5. [Database Schema](#5-database-schema)
6. [API & Endpoint](#6-api--endpoint)
7. [Integrasi Claude API (AI Advisor)](#7-integrasi-claude-api-ai-advisor)
8. [Halal Score Engine](#8-halal-score-engine)
9. [PWA & Offline Support](#9-pwa--offline-support)
10. [Deployment](#10-deployment)
11. [Standar Koding](#11-standar-koding)
12. [Testing](#12-testing)

---

## 1. Tech Stack & Versi

| Layer | Teknologi | Versi | Catatan |
|---|---|---|---|
| Framework | Next.js | 14 (App Router) | SSR, SEO friendly |
| UI Library | React | 18 | Komponen reusable |
| Styling | Tailwind CSS | 3.x | Utility-first |
| Charts | Chart.js | 4.x | Line, Bar, Donut chart |
| Database | Supabase PostgreSQL | Latest | Real-time DB |
| Auth | Supabase Auth + JWT | — | Terintegrasi dengan DB |
| Storage | Supabase Storage | — | Foto profil & export PDF |
| AI Engine | Claude API (Anthropic) | `claude-sonnet-4` | AI Advisor personal |
| Deployment | Vercel | — | CI/CD otomatis |
| Version Control | GitHub | — | Standar industri |

---

## 2. Setup Environment

### 2.1 Prasyarat

- Node.js >= 18.x
- npm >= 9.x atau pnpm >= 8.x
- Git
- Akun Supabase (https://supabase.com)
- Akun Vercel (https://vercel.com)
- Anthropic API Key (https://console.anthropic.com)

### 2.2 Clone & Install

```bash
git clone https://github.com/your-org/halal-habit-tracker.git
cd halal-habit-tracker
npm install
```

### 2.3 Environment Variables

Buat file `.env.local` di root proyek:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Anthropic Claude API
ANTHROPIC_API_KEY=your-anthropic-api-key

# App Config
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Halal Habit Tracker

# Emas API (untuk kalkulasi nisab)
GOLD_PRICE_API_URL=https://api.example.com/gold-price
GOLD_PRICE_API_KEY=your-gold-api-key
```

> ⚠️ **JANGAN** commit file `.env.local` ke repository. Pastikan sudah masuk `.gitignore`.

### 2.4 Menjalankan Development Server

```bash
npm run dev
# Aplikasi berjalan di http://localhost:3000
```

---

## 3. Struktur Proyek

```
halal-habit-tracker/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Route group: halaman autentikasi
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (dashboard)/              # Route group: halaman utama
│   │   ├── layout.tsx            # Layout dengan sidebar/bottom nav
│   │   ├── page.tsx              # Dashboard utama
│   │   ├── ibadah/page.tsx       # Modul Ibadah Tracker
│   │   ├── keuangan/page.tsx     # Modul Keuangan Syariah
│   │   ├── ai-advisor/page.tsx   # Modul AI Advisor
│   │   ├── zakat/page.tsx        # Modul Zakat & Sedekah
│   │   └── streak/page.tsx       # Modul Streak & Badge
│   ├── api/                      # API Route Handlers (Next.js)
│   │   ├── ai-advisor/route.ts   # Proxy ke Claude API
│   │   ├── halal-score/route.ts  # Kalkulasi & update Halal Score
│   │   ├── zakat/route.ts        # Kalkulasi zakat & nisab
│   │   └── gold-price/route.ts   # Ambil harga emas terkini
│   ├── globals.css
│   └── layout.tsx                # Root layout
│
├── components/                   # Komponen React reusable
│   ├── ui/                       # Komponen UI dasar (Button, Input, Modal, dll.)
│   ├── dashboard/                # Komponen spesifik Dashboard
│   │   ├── KPICard.tsx
│   │   ├── HalalScoreRing.tsx
│   │   ├── ExpenseChart.tsx
│   │   └── RecentTransactions.tsx
│   ├── ibadah/                   # Komponen modul ibadah
│   │   ├── IbadahChecklist.tsx
│   │   └── IbadahChart.tsx
│   ├── keuangan/                 # Komponen modul keuangan
│   │   ├── TransactionForm.tsx
│   │   └── CategoryDonut.tsx
│   ├── ai-advisor/               # Komponen AI Advisor
│   │   └── AdvisorChat.tsx
│   └── zakat/                    # Komponen zakat & sedekah
│       ├── NisabProgress.tsx
│       └── SedekahLog.tsx
│
├── lib/                          # Utilities & helpers
│   ├── supabase/
│   │   ├── client.ts             # Supabase browser client
│   │   └── server.ts             # Supabase server client
│   ├── halal-score.ts            # Halal Score engine
│   ├── zakat.ts                  # Kalkulasi zakat
│   ├── claude.ts                 # Claude API wrapper
│   └── utils.ts                  # Helpers umum
│
├── hooks/                        # Custom React hooks
│   ├── useHalalScore.ts
│   ├── useIbadah.ts
│   ├── useTransactions.ts
│   └── useStreak.ts
│
├── types/                        # TypeScript type definitions
│   ├── database.ts               # Tipe dari Supabase schema
│   └── app.ts                    # Tipe aplikasi umum
│
├── public/                       # Static assets
│   ├── icons/                    # PWA icons
│   └── manifest.json             # PWA manifest
│
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

---

## 4. Arsitektur Sistem

```
PENGGUNA (Muslim muda, Gen Z)
        │
        ▼
┌───────────────────────────────┐
│  FRONTEND (Next.js 14)        │
│  React 18 · Tailwind CSS      │
│  Chart.js · PWA Service Worker│
└───────────────┬───────────────┘
                │ API Calls (HTTPS)
                ▼
┌───────────────────────────────┐
│  NEXT.JS API ROUTES           │
│  (Server-side proxy layer)    │
│  /api/ai-advisor              │
│  /api/halal-score             │
│  /api/zakat                   │
└──────┬─────────────┬──────────┘
       │             │
       ▼             ▼
┌──────────────┐  ┌──────────────────┐
│  SUPABASE    │  │  CLAUDE API      │
│  PostgreSQL  │  │  (Anthropic)     │
│  Supabase    │  │  claude-sonnet-4 │
│  Auth (JWT)  │  └──────────────────┘
│  Storage     │
└──────────────┘
       │
       ▼
┌───────────────────────────────┐
│  DEPLOYMENT                   │
│  Vercel Edge Network          │
│  CI/CD via GitHub Actions     │
└───────────────────────────────┘
```

### 4.1 Prinsip Arsitektur

- **Server-side proxy wajib untuk API sensitif** — Claude API Key dan Service Role Key Supabase tidak boleh diekspos ke client. Semua panggilan ke service eksternal harus melalui API Route Next.js di server.
- **Row Level Security (RLS) di Supabase** — setiap tabel menggunakan policy RLS sehingga pengguna hanya dapat mengakses datanya sendiri.
- **Optimistic UI** — update UI dilakukan secara optimistis sebelum konfirmasi dari server untuk pengalaman pengguna yang cepat (terutama untuk checklist ibadah).

---

## 5. Database Schema

### 5.1 Tabel `users`

```sql
CREATE TABLE users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT UNIQUE NOT NULL,
  nama        TEXT NOT NULL,
  avatar_url  TEXT,
  level       TEXT DEFAULT 'Beginner'
                CHECK (level IN ('Beginner', 'Consistent', 'Elite', 'Amanah')),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);
```

### 5.2 Tabel `transactions`

```sql
CREATE TABLE transactions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tipe         TEXT NOT NULL CHECK (tipe IN ('pemasukan', 'pengeluaran')),
  nominal      NUMERIC(15,2) NOT NULL CHECK (nominal > 0),
  kategori     TEXT NOT NULL,
  tag_syariah  TEXT NOT NULL CHECK (tag_syariah IN ('halal', 'syubhat', 'boros')),
  deskripsi    TEXT,
  tanggal      DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);
```

### 5.3 Tabel `ibadah_logs`

```sql
CREATE TABLE ibadah_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tanggal         DATE NOT NULL DEFAULT CURRENT_DATE,
  sholat_5waktu   BOOLEAN DEFAULT FALSE,
  baca_quran      BOOLEAN DEFAULT FALSE,
  dzikir          BOOLEAN DEFAULT FALSE,
  sedekah         BOOLEAN DEFAULT FALSE,
  sholat_sunnah   BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, tanggal)
);
```

### 5.4 Tabel `halal_scores`

```sql
CREATE TABLE halal_scores (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tanggal               DATE NOT NULL DEFAULT CURRENT_DATE,
  financial_discipline  NUMERIC(5,2) DEFAULT 0 CHECK (financial_discipline BETWEEN 0 AND 40),
  syariah_compliance    NUMERIC(5,2) DEFAULT 0 CHECK (syariah_compliance BETWEEN 0 AND 30),
  habit_consistency     NUMERIC(5,2) DEFAULT 0 CHECK (habit_consistency BETWEEN 0 AND 30),
  total_score           NUMERIC(5,2) GENERATED ALWAYS AS
                        (financial_discipline + syariah_compliance + habit_consistency) STORED,
  level                 TEXT,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, tanggal)
);
```

### 5.5 Tabel `sedekah_logs`

```sql
CREATE TABLE sedekah_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  nominal     NUMERIC(15,2) NOT NULL CHECK (nominal > 0),
  deskripsi   TEXT,
  tanggal     DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

### 5.6 Tabel `streaks`

```sql
CREATE TABLE streaks (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  streak_count     INTEGER DEFAULT 0,
  last_check_date  DATE,
  longest_streak   INTEGER DEFAULT 0,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);
```

### 5.7 Tabel `badges`

```sql
CREATE TABLE badges (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_type  TEXT NOT NULL
                CHECK (badge_type IN ('konsisten', 'syariah_plus', 'dermawan', 'amanah')),
  awarded_at  TIMESTAMPTZ DEFAULT NOW()
);
```

### 5.8 Row Level Security (RLS)

```sql
-- Aktifkan RLS di semua tabel
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ibadah_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE halal_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE sedekah_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;

-- Policy: pengguna hanya bisa akses data miliknya sendiri
CREATE POLICY "user_own_data" ON transactions
  FOR ALL USING (auth.uid() = user_id);

-- Terapkan policy serupa untuk semua tabel lainnya
```

---

## 6. API & Endpoint

### 6.1 API Routes (Next.js)

| Method | Endpoint | Deskripsi | Auth |
|---|---|---|---|
| POST | `/api/ai-advisor` | Kirim pertanyaan ke Claude API | Required |
| POST | `/api/halal-score/calculate` | Hitung ulang Halal Score pengguna | Required |
| GET | `/api/halal-score/history` | Riwayat Halal Score (30 hari) | Required |
| GET | `/api/zakat/nisab` | Hitung nisab berdasarkan harga emas terkini | Required |
| POST | `/api/transactions` | Tambah transaksi baru | Required |
| GET | `/api/transactions` | Ambil daftar transaksi (dengan filter) | Required |
| POST | `/api/ibadah` | Simpan/update checklist ibadah hari ini | Required |
| GET | `/api/ibadah/history` | Riwayat ibadah 7 / 30 hari | Required |

### 6.2 Contoh Request & Response

**POST `/api/ai-advisor`**

Request:
```json
{
  "question": "Gimana kondisi keuanganku bulan ini?",
  "user_context": {
    "nama": "Zahra",
    "saldo_bulan_ini": 3500000,
    "total_pengeluaran": 2100000,
    "halal_score": 72,
    "level": "Consistent",
    "streak_hari": 5,
    "ibadah_hari_ini": {
      "sholat": true,
      "quran": true,
      "dzikir": false,
      "sedekah": true,
      "sunnah": false
    },
    "top_kategori_pengeluaran": ["Makan", "Transportasi", "Hiburan"],
    "nisab_progress": 45
  }
}
```

Response:
```json
{
  "response": "Hai Zahra! Alhamdulillah keuanganmu bulan ini cukup terjaga 💚...",
  "model": "claude-sonnet-4",
  "usage": { "input_tokens": 312, "output_tokens": 98 }
}
```

---

## 7. Integrasi Claude API (AI Advisor)

### 7.1 Konfigurasi

```typescript
// lib/claude.ts
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `Kamu adalah AI Advisor keuangan dan ibadah berbasis prinsip Islam untuk aplikasi Halal Habit Tracker.
Berikan saran yang:
1. Sesuai prinsip syariah (tidak mendukung riba, boros, atau haram)
2. Singkat dan actionable (maksimal 3-4 kalimat)
3. Menggunakan bahasa Indonesia yang ramah dan natural untuk Gen Z
4. Berdasarkan data nyata pengguna yang diberikan dalam konteks
5. Tidak menghakimi, tapi memotivasi dengan penuh kasih sayang

Selalu mulai respons dengan sapaan yang hangat menggunakan nama pengguna.`;

export async function askAdvisor(
  question: string,
  userContext: UserContext
): Promise<string> {
  const message = await client.messages.create({
    model: "claude-sonnet-4",
    max_tokens: 512,
    temperature: 0.7,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Context pengguna:\n${JSON.stringify(userContext, null, 2)}\n\nPertanyaan: ${question}`,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== "text") throw new Error("Unexpected response type");
  return content.text;
}
```

### 7.2 API Route Handler

```typescript
// app/api/ai-advisor/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { askAdvisor } from "@/lib/claude";

export async function POST(request: NextRequest) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { question, user_context } = await request.json();

  if (!question || question.trim().length === 0) {
    return NextResponse.json({ error: "Question required" }, { status: 400 });
  }

  try {
    const response = await askAdvisor(question, user_context);
    return NextResponse.json({ response });
  } catch (error) {
    // Fallback mode jika Claude API down
    return NextResponse.json({
      response: "Maaf, AI Advisor sedang tidak tersedia. Silakan coba lagi nanti. 🙏",
      fallback: true,
    });
  }
}
```

### 7.3 Batasan & Fallback

- **Rate limiting**: implementasikan rate limit per user (misal: 20 pertanyaan/hari untuk tier free)
- **Fallback**: jika Claude API down, tampilkan pesan fallback yang ramah dan simpan pertanyaan untuk dijawab nanti (opsional)
- **Caching**: respons untuk pertanyaan umum (tanpa konteks personal) dapat di-cache

---

## 8. Halal Score Engine

### 8.1 Formula Kalkulasi

```typescript
// lib/halal-score.ts

interface HalalScoreInput {
  // Data keuangan bulan berjalan
  totalPengeluaran: number;
  totalBudget: number;
  pengeluaranBorosRupiah: number;
  pengeluaranHalalRupiah: number;
  adaTransaksiRiba: boolean;
  totalSedekah: number;
  targetSedekah: number;

  // Data ibadah bulan berjalan
  totalChecklist: number;   // total ibadah yang dicentang
  totalTarget: number;      // total target ibadah bulan ini
}

export function calculateHalalScore(input: HalalScoreInput) {
  // 1. Financial Discipline (0–40 poin)
  const rasioBorosTerhadapTotal =
    input.totalPengeluaran > 0
      ? input.pengeluaranBorosRupiah / input.totalPengeluaran
      : 0;
  const rasioHalalTerhadapTotal =
    input.totalPengeluaran > 0
      ? input.pengeluaranHalalRupiah / input.totalPengeluaran
      : 1;

  const financialDiscipline = Math.min(
    40,
    30 * (1 - rasioBorosTerhadapTotal) + 10 * rasioHalalTerhadapTotal
  );

  // 2. Syariah Compliance (0–30 poin)
  const bebasRibaScore = input.adaTransaksiRiba ? 0 : 1;
  const sedekahRegularity =
    input.targetSedekah > 0
      ? Math.min(1, input.totalSedekah / input.targetSedekah)
      : input.totalSedekah > 0 ? 0.5 : 0;

  const syariahCompliance = 20 * bebasRibaScore + 10 * sedekahRegularity;

  // 3. Habit Consistency (0–30 poin)
  const habitConsistency =
    input.totalTarget > 0
      ? 30 * (input.totalChecklist / input.totalTarget)
      : 0;

  const totalScore = financialDiscipline + syariahCompliance + habitConsistency;

  const level =
    totalScore >= 90 ? "Amanah" :
    totalScore >= 70 ? "Elite" :
    totalScore >= 50 ? "Consistent" : "Beginner";

  return {
    financialDiscipline: Math.round(financialDiscipline * 100) / 100,
    syariahCompliance: Math.round(syariahCompliance * 100) / 100,
    habitConsistency: Math.round(habitConsistency * 100) / 100,
    totalScore: Math.round(totalScore * 100) / 100,
    level,
  };
}
```

### 8.2 Jadwal Update

- Halal Score diperbarui otomatis setiap hari pukul **23.59 WIB** via Supabase Edge Function / Vercel Cron Job.
- Update juga dapat dipicu manual saat pengguna menambah transaksi atau mencentang ibadah (recalculate on-demand, throttled per 1 menit).

---

## 9. PWA & Offline Support

### 9.1 Manifest

```json
// public/manifest.json
{
  "name": "Halal Habit Tracker",
  "short_name": "HaHaT",
  "description": "Kelola rezeki dengan amanah & bijaksana",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#1A1033",
  "theme_color": "#E91E8C",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

### 9.2 Service Worker (Strategi Cache)

| Aset | Strategi |
|---|---|
| Halaman HTML & CSS | Cache First (stale-while-revalidate) |
| API data (transaksi, ibadah) | Network First, fallback ke cache |
| Input ibadah offline | Background Sync — antri di IndexedDB, sinkron saat online |
| AI Advisor | Network Only (membutuhkan koneksi aktif) |

---

## 10. Deployment

### 10.1 Vercel

```bash
# Deploy ke staging
vercel --env preview

# Deploy ke production
vercel --prod
```

### 10.2 Environment Variables di Vercel

Tambahkan semua variabel dari `.env.local` di dashboard Vercel → Settings → Environment Variables. Pastikan memisahkan antara nilai untuk environment `preview` dan `production`.

### 10.3 Cron Jobs (Halal Score Update Harian)

```javascript
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/update-halal-scores",
      "schedule": "59 16 * * *"  // 23.59 WIB = 16.59 UTC
    },
    {
      "path": "/api/cron/update-streaks",
      "schedule": "0 17 * * *"   // 00.00 WIB = 17.00 UTC
    }
  ]
}
```

---

## 11. Standar Koding

### 11.1 TypeScript

- Wajib menggunakan TypeScript untuk semua file `.ts` dan `.tsx`
- Hindari penggunaan `any` — gunakan tipe yang spesifik
- Definisikan interface untuk semua data dari Supabase di `types/database.ts`

### 11.2 Naming Convention

| Entitas | Konvensi | Contoh |
|---|---|---|
| Komponen React | PascalCase | `HalalScoreRing.tsx` |
| Hooks | camelCase dengan prefix `use` | `useHalalScore.ts` |
| Fungsi utilitas | camelCase | `calculateHalalScore()` |
| Konstanta | SCREAMING_SNAKE_CASE | `MAX_HALAL_SCORE` |
| Tabel DB | snake_case | `ibadah_logs` |

### 11.3 Git Workflow

```
main          → production (protected, merge via PR)
develop       → staging (integrasi fitur)
feature/*     → branch per fitur (checkout dari develop)
fix/*         → branch untuk bugfix
```

Commit message menggunakan format Conventional Commits:
```
feat(ibadah): tambah grafik 7 hari tracker
fix(score): perbaiki kalkulasi financial discipline
docs(readme): update instruksi setup
```

---

## 12. Testing

### 12.1 Unit Test

- Wajib untuk fungsi kritis: `calculateHalalScore()`, `calculateNisab()`, `calculateZakat()`
- Gunakan **Jest** + **React Testing Library**

```typescript
// __tests__/halal-score.test.ts
import { calculateHalalScore } from "@/lib/halal-score";

describe("calculateHalalScore", () => {
  it("returns Amanah level for perfect score", () => {
    const result = calculateHalalScore({
      totalPengeluaran: 1000000,
      totalBudget: 2000000,
      pengeluaranBorosRupiah: 0,
      pengeluaranHalalRupiah: 1000000,
      adaTransaksiRiba: false,
      totalSedekah: 100000,
      targetSedekah: 100000,
      totalChecklist: 150,
      totalTarget: 150,
    });
    expect(result.level).toBe("Amanah");
    expect(result.totalScore).toBeGreaterThanOrEqual(90);
  });
});
```

### 12.2 Performance Target

| Metrik | Target |
|---|---|
| LCP (Largest Contentful Paint) | < 2,5 detik |
| FID (First Input Delay) | < 100ms |
| Dashboard load time | < 2 detik |
| AI Advisor response time | < 5 detik |

---

*Halal Habit Tracker · Dev Guide v1.0.0 · Syariah 2025*
*🌸 Catat, Pantau & Ibadah Bareng*
