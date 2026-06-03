# 🔐 Security Guide — Halal Habit Tracker
## Panduan Keamanan Aplikasi

---

| Atribut | Detail |
|---|---|
| **Produk** | Halal Habit Tracker |
| **Versi** | 1.0.0 |
| **Platform** | Web App (PWA) |
| **Dokumen** | Security Guide |
| **Tanggal** | Mei 2025 |
| **Klasifikasi** | Internal — Developer & Stakeholder |

---

## Daftar Isi

1. [Prinsip Keamanan](#1-prinsip-keamanan)
2. [Autentikasi & Otorisasi](#2-autentikasi--otorisasi)
3. [Keamanan Data](#3-keamanan-data)
4. [Keamanan API](#4-keamanan-api)
5. [Keamanan Integrasi Claude AI](#5-keamanan-integrasi-claude-ai)
6. [Keamanan Frontend (Next.js)](#6-keamanan-frontend-nextjs)
7. [Keamanan Database (Supabase)](#7-keamanan-database-supabase)
8. [Penanganan Risiko & Insiden](#8-penanganan-risiko--insiden)
9. [Audit & Monitoring](#9-audit--monitoring)
10. [Checklist Keamanan Pre-Launch](#10-checklist-keamanan-pre-launch)

---

## 1. Prinsip Keamanan

Halal Habit Tracker mengelola **data finansial dan ibadah pribadi** pengguna. Kedua kategori ini bersifat sangat sensitif — pelanggaran data tidak hanya merugikan secara finansial, tetapi juga dapat melanggar privasi spiritual pengguna.

### 1.1 Prinsip Utama (CIA Triad)

| Prinsip | Penerapan |
|---|---|
| **Confidentiality (Kerahasiaan)** | Data keuangan dan ibadah hanya dapat diakses oleh pemiliknya. Tidak ada data sharing antar pengguna di MVP. |
| **Integrity (Integritas)** | Data transaksi dan ibadah tidak boleh dimodifikasi oleh pihak tidak berwenang. Setiap perubahan data dicatat. |
| **Availability (Ketersediaan)** | Target uptime ≥ 99,5%. Sistem fallback tersedia untuk layanan kritis (terutama jika Claude API down). |

### 1.2 Prinsip Tambahan

- **Least Privilege** — setiap komponen sistem hanya mendapatkan hak akses minimum yang dibutuhkan.
- **Defense in Depth** — keamanan berlapis: autentikasi → otorisasi RLS → enkripsi → monitoring.
- **Privacy by Design** — data pengguna tidak dibagikan ke pihak ketiga tanpa persetujuan eksplisit.

---

## 2. Autentikasi & Otorisasi

### 2.1 Mekanisme Autentikasi

Aplikasi menggunakan **Supabase Auth** dengan JWT (JSON Web Token) sebagai metode autentikasi tunggal di MVP.

| Aspek | Detail |
|---|---|
| Metode login | Email + Password |
| Session management | JWT disimpan sebagai HttpOnly Cookie (bukan localStorage) |
| Token expiry | Access token: 1 jam; Refresh token: 7 hari |
| Login sosial | ❌ Tidak tersedia di MVP |

### 2.2 Implementasi JWT yang Aman

```typescript
// lib/supabase/server.ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export function createServerSupabaseClient() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) { return cookieStore.get(name)?.value; },
        set(name, value, options) {
          cookieStore.set({
            name,
            value,
            ...options,
            httpOnly: true,    // ✅ Tidak bisa diakses JS
            secure: true,      // ✅ Hanya HTTPS
            sameSite: "lax",   // ✅ Proteksi CSRF
          });
        },
        remove(name, options) {
          cookieStore.set({ name, value: "", ...options });
        },
      },
    }
  );
}
```

### 2.3 Otorisasi di API Routes

Setiap API Route **wajib** memvalidasi sesi pengguna sebelum memproses request:

```typescript
// Pola wajib di semua API routes yang membutuhkan autentikasi
export async function POST(request: NextRequest) {
  const supabase = createServerSupabaseClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  // Lanjut proses request hanya jika autentikasi valid
  // ...
}
```

### 2.4 Password Policy

- Panjang minimum: **8 karakter**
- Wajib mengandung: huruf besar, huruf kecil, angka
- Hashing: ditangani otomatis oleh Supabase Auth (bcrypt)
- Reset password: via email dengan token berbatas waktu (1 jam)

---

## 3. Keamanan Data

### 3.1 Klasifikasi Data Sensitif

| Level | Tipe Data | Penanganan |
|---|---|---|
| **Sangat Sensitif** | Saldo, nominal transaksi, password | Enkripsi at-rest, tidak pernah dikirim ke log |
| **Sensitif** | Data ibadah, halal score, email | Dilindungi RLS, tidak dibagikan ke pihak ketiga |
| **Internal** | Streak, badge, level | Dilindungi RLS |
| **Non-Sensitif** | Nama pengguna, timestamp | Diakses read-only |

### 3.2 Enkripsi

| Layer | Metode |
|---|---|
| Data at-rest | Enkripsi AES-256 otomatis oleh Supabase PostgreSQL |
| Data in-transit | TLS 1.2+ wajib untuk semua koneksi (HTTPS only) |
| JWT Token | HS256 / RS256 via Supabase Auth |
| Password | bcrypt dengan salt (dikelola Supabase Auth) |

### 3.3 Kebijakan Retensi Data

- Data aktif disimpan selama akun aktif.
- Pengguna dapat menghapus akun dan seluruh datanya (fitur wajib tersedia).
- Setelah penghapusan akun, data dihapus permanen dalam **30 hari**.
- Backup harian Supabase disimpan selama **7 hari**.

### 3.4 Data yang TIDAK Boleh Disimpan

- ❌ PIN, password, atau kredensial perbankan pengguna
- ❌ Nomor rekening bank atau kartu kredit
- ❌ Data biometrik
- ❌ Informasi identitas lengkap (KTP/NIK) — tidak diperlukan di MVP

---

## 4. Keamanan API

### 4.1 API Key Management

| Key | Lokasi | Aksesibilitas |
|---|---|---|
| `ANTHROPIC_API_KEY` | Server-side only (`.env.local`, Vercel env) | ❌ Tidak boleh ada di client-side |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side only | ❌ Tidak boleh ada di client-side |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client-side aman | ✅ Dirancang untuk public, dilindungi RLS |

> ⚠️ **KRITIKAL**: `ANTHROPIC_API_KEY` dan `SUPABASE_SERVICE_ROLE_KEY` **tidak pernah** boleh dikirimkan ke browser. Selalu panggil Claude API dan operasi admin Supabase dari API Routes (server-side).

### 4.2 Rate Limiting

Implementasikan rate limiting di API Routes untuk mencegah penyalahgunaan:

```typescript
// Contoh rate limiting untuk AI Advisor
// Gunakan library: @upstash/ratelimit atau implementasi custom di Supabase

const RATE_LIMITS = {
  "ai-advisor": {
    free: { requests: 20, window: "24h" },
    premium: { requests: 100, window: "24h" },
  },
  "transactions": {
    free: { requests: 200, window: "24h" },
  },
};
```

### 4.3 Input Validation & Sanitization

Semua input dari pengguna **wajib** divalidasi sebelum diproses:

```typescript
// Gunakan Zod untuk validasi schema
import { z } from "zod";

const TransactionSchema = z.object({
  tipe: z.enum(["pemasukan", "pengeluaran"]),
  nominal: z.number().positive().max(999_999_999_999),
  kategori: z.string().min(1).max(50),
  tag_syariah: z.enum(["halal", "syubhat", "boros"]),
  deskripsi: z.string().max(255).optional(),
  tanggal: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

// Validasi di API Route sebelum insert ke DB
const validated = TransactionSchema.safeParse(body);
if (!validated.success) {
  return NextResponse.json({ error: validated.error }, { status: 400 });
}
```

### 4.4 Proteksi CSRF

- Cookies dikonfigurasi dengan `SameSite: lax` (lihat bagian 2.2)
- Untuk mutation request, Next.js App Router dengan Server Actions menggunakan CSRF protection bawaan

### 4.5 CORS Policy

```typescript
// next.config.js
const nextConfig = {
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: process.env.NEXT_PUBLIC_APP_URL },
          { key: "Access-Control-Allow-Methods", value: "GET,POST,PUT,DELETE,OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization" },
        ],
      },
    ];
  },
};
```

---

## 5. Keamanan Integrasi Claude AI

### 5.1 Batasan Data yang Dikirim ke Claude

Data yang **boleh** dikirim ke Claude API (dalam `user_context`):

| Data | Boleh Dikirim? | Alasan |
|---|---|---|
| Nama pengguna | ✅ Ya | Untuk sapaan personal |
| Saldo & total pengeluaran (angka) | ✅ Ya | Diperlukan untuk saran keuangan |
| Halal score & level | ✅ Ya | Diperlukan untuk saran ibadah |
| Streak & status ibadah harian | ✅ Ya | Diperlukan untuk saran ibadah |
| Top kategori pengeluaran | ✅ Ya | Diperlukan untuk saran penghematan |
| Email pengguna | ❌ Tidak | Tidak diperlukan |
| Detail transaksi individual | ❌ Tidak | Privasi, hanya agregat yang dikirim |
| Password atau credential | ❌ Tidak | Tidak pernah |

### 5.2 Prompt Injection Prevention

Pertanyaan pengguna yang dikirim ke Claude harus disanitasi untuk mencegah prompt injection:

```typescript
function sanitizeQuestion(question: string): string {
  // Batasi panjang input
  const truncated = question.slice(0, 500);

  // Hapus karakter yang berpotensi menyisipkan instruksi
  const sanitized = truncated
    .replace(/\[INST\]|\[\/INST\]/gi, "")
    .replace(/<\|im_start\|>|<\|im_end\|>/gi, "")
    .trim();

  return sanitized;
}
```

### 5.3 Respons AI — Disclaimer Wajib

Setiap respons dari AI Advisor wajib ditampilkan dengan label:

```
"AI Advisor · Powered by Claude API · Bukan fatwa resmi"
```

Ini sesuai ketentuan PRD bahwa AI tidak memberikan fatwa agama resmi dan tidak menyarankan produk keuangan spesifik.

---

## 6. Keamanan Frontend (Next.js)

### 6.1 Security Headers

```typescript
// next.config.js
const securityHeaders = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",   // Next.js membutuhkan ini
      "style-src 'self' 'unsafe-inline'",
      `connect-src 'self' ${process.env.NEXT_PUBLIC_SUPABASE_URL}`,
      "img-src 'self' data: blob:",
      "font-src 'self'",
    ].join("; "),
  },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];
```

### 6.2 Proteksi Route

Semua halaman di dalam grup `(dashboard)` wajib dilindungi dengan middleware autentikasi:

```typescript
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Halaman yang membutuhkan autentikasi
  if (pathname.startsWith("/dashboard") || pathname === "/") {
    const supabase = createServerClient(/* ... */);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|login|register).*)"],
};
```

### 6.3 Dependency Security

- Jalankan `npm audit` secara berkala (minimal sebelum setiap release)
- Gunakan `npm audit fix` untuk memperbaiki vulnerabilities
- Aktifkan Dependabot di GitHub untuk auto-update dependency

---

## 7. Keamanan Database (Supabase)

### 7.1 Row Level Security (RLS) — Wajib

**Semua tabel** wajib mengaktifkan RLS. Tidak ada tabel yang boleh diakses tanpa policy yang tepat.

```sql
-- Template policy standar untuk semua tabel user data
-- Ganti `nama_tabel` dengan nama tabel yang relevan

ALTER TABLE nama_tabel ENABLE ROW LEVEL SECURITY;

-- Pengguna hanya bisa SELECT data miliknya
CREATE POLICY "select_own_data" ON nama_tabel
  FOR SELECT USING (auth.uid() = user_id);

-- Pengguna hanya bisa INSERT data miliknya
CREATE POLICY "insert_own_data" ON nama_tabel
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Pengguna hanya bisa UPDATE data miliknya
CREATE POLICY "update_own_data" ON nama_tabel
  FOR UPDATE USING (auth.uid() = user_id);

-- Pengguna hanya bisa DELETE data miliknya
CREATE POLICY "delete_own_data" ON nama_tabel
  FOR DELETE USING (auth.uid() = user_id);
```

### 7.2 Supabase Service Role Key

- `SUPABASE_SERVICE_ROLE_KEY` **hanya digunakan** di server-side untuk operasi admin (cron jobs, server-side triggers)
- Tidak pernah dikirim ke client atau disimpan di localStorage/cookie browser
- Rotasi key dilakukan jika terjadi potensi kebocoran

### 7.3 Database Backup & Recovery

| Aspek | Detail |
|---|---|
| Frekuensi backup | Harian (otomatis oleh Supabase) |
| Retensi backup | 7 hari |
| Point-in-time recovery | Tersedia di Supabase Pro plan |
| RTO (Recovery Time Objective) | < 4 jam |
| RPO (Recovery Point Objective) | < 24 jam |

---

## 8. Penanganan Risiko & Insiden

### 8.1 Matriks Risiko Keamanan

| ID | Risiko | Prob. | Dampak | Mitigasi |
|---|---|---|---|---|
| **R-S1** | Data breach Supabase | Rendah | Sangat Tinggi | RLS aktif di semua tabel, enkripsi at-rest, audit berkala |
| **R-S2** | API key bocor (Claude/Supabase) | Rendah | Tinggi | Key di server-side only, rotasi segera jika bocor, monitoring penggunaan |
| **R-S3** | Account takeover (brute force) | Sedang | Tinggi | Rate limit login, notifikasi login dari perangkat baru |
| **R-S4** | Prompt injection ke Claude API | Rendah | Sedang | Sanitasi input, system prompt terkontrol |
| **R-S5** | XSS attack | Sedang | Tinggi | CSP header, React DOM sanitization bawaan |
| **R-S6** | CSRF attack | Rendah | Sedang | SameSite cookie, CSRF token di Next.js |
| **R-S7** | Claude API down | Sedang | Tinggi | Fallback mode tanpa AI, caching respons umum |

### 8.2 Prosedur Respons Insiden

**Tingkat Kritis (Data Breach / API Key Bocor):**
1. Segera rotasi semua credentials yang berpotensi terkompromis
2. Audit log akses Supabase untuk aktivitas mencurigakan
3. Notifikasi pengguna yang terdampak dalam 72 jam (sesuai prinsip transparansi)
4. Lakukan post-mortem dan perbaikan dalam 7 hari

**Tingkat Sedang (Layanan Terganggu):**
1. Aktifkan mode fallback (misalnya: AI Advisor off, tampilkan pesan maintenance)
2. Monitor dan restore layanan dalam SLA uptime
3. Catat insiden untuk audit trail

---

## 9. Audit & Monitoring

### 9.1 Log yang Harus Dicatat

```typescript
// Contoh struktur log untuk audit trail
interface SecurityLog {
  timestamp: string;
  user_id: string | null;
  event_type:
    | "login_success"
    | "login_failure"
    | "password_reset"
    | "account_deleted"
    | "api_rate_limit_exceeded"
    | "invalid_input_rejected";
  ip_address: string;
  user_agent: string;
  details?: Record<string, unknown>;
}
```

### 9.2 Yang TIDAK Boleh Dicatat ke Log

- ❌ Password (plain text maupun hash)
- ❌ Isi percakapan lengkap dengan AI Advisor
- ❌ Nominal transaksi individual (hanya agregat untuk analitik)
- ❌ Data ibadah individual

### 9.3 Monitoring

| Tool | Fungsi |
|---|---|
| Vercel Analytics | Monitoring performa & error rate frontend |
| Supabase Dashboard | Monitoring query, koneksi, storage |
| Anthropic Console | Monitoring penggunaan & biaya Claude API |
| GitHub Security Alerts | Notifikasi vulnerability di dependencies |

### 9.4 Jadwal Audit Keamanan

| Aktivitas | Frekuensi |
|---|---|
| `npm audit` + dependency review | Setiap release |
| Review RLS policies Supabase | Setiap kuartal |
| Rotasi API keys (jika tidak ada insiden) | Setiap 6 bulan |
| Penetration test (sederhana) | Sebelum public launch & setiap 1 tahun |

---

## 10. Checklist Keamanan Pre-Launch

Semua item berikut **wajib** dipenuhi sebelum aplikasi diluncurkan ke publik:

### Autentikasi & Akses
- [ ] JWT disimpan sebagai HttpOnly Cookie, bukan localStorage
- [ ] Semua API Route memvalidasi autentikasi pengguna
- [ ] Middleware proteksi route aktif untuk semua halaman dashboard
- [ ] Rate limiting login diimplementasikan

### Data & Database
- [ ] RLS aktif di **semua** tabel Supabase
- [ ] `SUPABASE_SERVICE_ROLE_KEY` tidak ada di client-side
- [ ] `ANTHROPIC_API_KEY` tidak ada di client-side
- [ ] Tidak ada kredensial di repository GitHub (gunakan `git secrets` atau GitHub Secret Scanning)

### API & Input
- [ ] Semua input pengguna divalidasi dengan Zod atau equivalent
- [ ] Sanitasi pertanyaan sebelum dikirim ke Claude API
- [ ] CORS dikonfigurasi hanya untuk domain aplikasi
- [ ] Security headers (CSP, HSTS, X-Frame-Options) aktif

### Infrastruktur
- [ ] HTTPS aktif dan redirect dari HTTP
- [ ] Backup database dikonfirmasi berjalan
- [ ] Environment variables di Vercel diset dengan benar untuk production
- [ ] Cron jobs (update Halal Score & Streak) berjalan di server, bukan client

### Privasi
- [ ] Kebijakan Privasi tersedia dan dapat diakses
- [ ] Pengguna dapat menghapus akun dan semua datanya
- [ ] Label "AI Advisor · Powered by Claude API · Bukan fatwa resmi" tampil di semua respons AI

---

*Halal Habit Tracker · Security Guide v1.0.0 · Syariah 2025*
*🔐 Jaga amanah data pengguna seperti menjaga amanah dalam Islam*
