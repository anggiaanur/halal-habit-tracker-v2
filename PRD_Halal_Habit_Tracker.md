# 🌸 Product Requirements Document (PRD)
## Halal Habit Tracker — Aplikasi Manajemen Keuangan Syariah & Ibadah Islami

---

| Atribut | Detail |
|---|---|
| **Nama Produk** | Halal Habit Tracker |
| **Versi Dokumen** | 1.0.0 |
| **Status** | Draft — MVP |
| **Platform** | Web App (PWA) |
| **Tanggal** | Mei 2025 |
| **Prinsip** | Syariah-Friendly |

---

## Daftar Isi

1. [Ringkasan Eksekutif](#1-ringkasan-eksekutif)
2. [Latar Belakang & Permasalahan](#2-latar-belakang--permasalahan)
3. [Tujuan Produk](#3-tujuan-produk)
4. [Target Pengguna](#4-target-pengguna)
5. [Fitur & Modul Aplikasi](#5-fitur--modul-aplikasi)
6. [Spesifikasi Fungsional](#6-spesifikasi-fungsional)
7. [Sistem Halal Score](#7-sistem-halal-score)
8. [AI Advisor — Claude API](#8-ai-advisor--claude-api)
9. [Arsitektur Sistem & Tech Stack](#9-arsitektur-sistem--tech-stack)
10. [Desain UI/UX](#10-desain-uiux)
11. [Roadmap Pengembangan](#11-roadmap-pengembangan)
12. [Kriteria Keberhasilan (Success Metrics)](#12-kriteria-keberhasilan-success-metrics)
13. [Asumsi & Batasan](#13-asumsi--batasan)
14. [Risiko & Mitigasi](#14-risiko--mitigasi)
15. [Glosarium](#15-glosarium)

---

## 1. Ringkasan Eksekutif

Halal Habit Tracker adalah platform manajemen keuangan berbasis AI yang dirancang khusus untuk Muslim muda (Gen Z & Milenial) Indonesia. Aplikasi ini memadukan **ibadah tracker**, **skor halal**, **pencatatan keuangan syariah**, dan **AI advisor personal** dalam satu platform estetik yang ramah pengguna.

### Statistik Kunci

| Indikator | Data |
|---|---|
| Literasi keuangan pemuda Indonesia (OJK 2024) | 49,68% |
| Pemuda aktif pengguna smartphone & digital | ~90% |
| Target pengguna tahun pertama | 10.000+ pengguna |

### Proposisi Nilai Utama

> *"Kelola rezeki dengan amanah & bijaksana — Catat, Pantau & Ibadah Bareng."*

Halal Habit Tracker adalah **satu-satunya** aplikasi yang mengintegrasikan:
- Keuangan syariah + ibadah tracker dalam satu platform
- Gamifikasi islami (streak, badge, halal score)
- AI Advisor berbasis Claude API (Anthropic) dengan konteks data nyata pengguna
- Estetika modern yang menarik bagi generasi muda

---

## 2. Latar Belakang & Permasalahan

### 2.1 Konteks Pasar

Generasi Z dan Milenial Muslim Indonesia menghadapi tantangan ganda: mengelola keuangan pribadi sekaligus menjaga konsistensi ibadah harian. Aplikasi keuangan yang ada di pasar tidak mempertimbangkan nilai-nilai syariah, sementara aplikasi ibadah tidak terintegrasi dengan kondisi finansial pengguna.

### 2.2 Rumusan Masalah

| No | Masalah | Dampak |
|---|---|---|
| 1 | Tidak ada aplikasi yang bisa melacak ibadah dan keuangan syariah sekaligus dalam satu platform | Pengguna harus menggunakan 2–3 aplikasi berbeda |
| 2 | Sulit memantau apakah pengeluaran sudah sesuai prinsip Islam (halal, tidak boros, prioritas sedekah) | Pengeluaran tidak terkontrol, potensi pelanggaran prinsip syariah |
| 3 | Tidak ada motivasi visual seperti streak atau skor yang membuat ibadah terasa lebih konsisten | Ibadah harian mudah terlewat tanpa akuntabilitas |
| 4 | Kalkulasi zakat dan pencatatan sedekah biasanya manual, mudah terlupa, tidak terstruktur | Kewajiban zakat tidak terpenuhi, sedekah tidak tercatat |

### 2.3 Peluang

> ✨ Belum ada aplikasi yang memadukan **AI + ibadah tracker + nilai syariah + estetika Gen Z** dalam satu produk yang terintegrasi.

---

## 3. Tujuan Produk

### 3.1 Tujuan Bisnis

- Mencapai **10.000 pengguna aktif** di tahun pertama peluncuran
- Membangun produk SaaS berbasis langganan (freemium model)
- Menjadi referensi aplikasi keuangan syariah terkemuka di Indonesia

### 3.2 Tujuan Produk

1. **Platform terintegrasi** — satu aplikasi untuk mengelola keuangan syariah dan ibadah harian
2. **Korelasi finansial-ibadah** — membantu pengguna memahami hubungan kondisi keuangan dengan kualitas ibadah
3. **Motivasi berkelanjutan** — gamifikasi (streak, badge, halal score) agar ibadah lebih konsisten
4. **AI Advisor personal** — asisten berbasis data nyata pengguna (powered by Claude API)
5. **Otomasi zakat & sedekah** — perhitungan dan pencatatan otomatis tanpa manual

### 3.3 Tujuan Pengguna

- Mengetahui ke mana uang mereka pergi setiap bulan
- Memastikan pengeluaran sesuai prinsip halal dan tidak boros
- Menjaga konsistensi ibadah harian dengan sistem pengingat dan streak
- Mengetahui kapan kewajiban zakat harus dibayarkan

---

## 4. Target Pengguna

### 4.1 Profil Pengguna Utama

**Segmen Primer: Muslim Muda Indonesia (Gen Z & Milenial)**

| Atribut | Detail |
|---|---|
| Usia | 18–35 tahun |
| Lokasi | Indonesia (perkotaan) |
| Perangkat | Smartphone (Android/iOS) & Browser |
| Pendapatan | Rp 1,5 jt – Rp 10 jt/bulan |
| Karakteristik | Melek digital, estetika-conscious, religius secara praktis |

### 4.2 Persona Pengguna

**Persona 1 — Zahra (Mahasiswi, 21 tahun)**
- Menggunakan uang saku dari orang tua + freelance kecil-kecilan
- Ingin lebih teratur dalam keuangan tapi sering lupa mencatat
- Aktif ibadah tapi ibadah sering tidak konsisten karena sibuk
- Terbiasa dengan aplikasi estetik (Notion, Canva, CapCut)

**Persona 2 — Rizky (Karyawan swasta, 27 tahun)**
- Gaji bulanan Rp 5–8 jt, pengeluaran tidak terkontrol
- Ingin mulai bayar zakat tapi bingung kapan dan berapa
- Merasa butuh "pengingat" ibadah yang tidak menggurui
- Terbiasa dengan aplikasi finansial seperti Spluut atau Mint

---

## 5. Fitur & Modul Aplikasi

### 5.1 Daftar Modul

| No | Modul | Deskripsi Singkat | Prioritas |
|---|---|---|---|
| M01 | Dashboard Keuangan | Real-time ringkasan saldo, pengeluaran, ibadah, halal score | P0 — Must Have |
| M02 | Ibadah Tracker Harian | Checklist 5 ibadah utama + grafik 7 hari | P0 — Must Have |
| M03 | Keuangan Syariah | Catat & kategorikan transaksi dengan auto-tag halal/syubhat | P0 — Must Have |
| M04 | AI Advisor (Claude API) | Asisten AI personal berbasis data nyata pengguna | P1 — Should Have |
| M05 | Zakat & Sedekah | Progress nisab otomatis + rekap sedekah 4 minggu | P1 — Should Have |
| M06 | Streak & Gamifikasi | Streak harian + badge pencapaian + level system | P1 — Should Have |

### 5.2 Detail Fitur Per Modul

---

#### Modul 01 — Dashboard Keuangan

**Tujuan:** Memberikan gambaran menyeluruh kondisi keuangan dan ibadah pengguna dalam satu layar.

**Fitur:**
- Kartu KPI: Saldo Bulan Ini, Total Pengeluaran, Sedekah Bulan Ini
- Ring chart Halal Score dengan label level (Beginner/Consistent/Elite/Amanah)
- Grafik tren pengeluaran harian (Chart.js — Line Chart)
- Donut chart kategori pengeluaran
- Panel AI Advisor terintegrasi (quick access)
- Ringkasan streak & badge pencapaian
- Daftar 5 transaksi terakhir
- Progress nisab zakat mini widget

**Kriteria Penerimaan:**
- [ ] Dashboard memuat dalam < 2 detik
- [ ] Semua data terupdate real-time dari database
- [ ] Responsif di layar mobile (min 375px) dan desktop
- [ ] Halal Score ditampilkan dengan animasi ring chart

---

#### Modul 02 — Ibadah Tracker Harian

**Tujuan:** Mencatat dan memantau konsistensi ibadah harian pengguna.

**5 Ibadah Utama yang Dilacak:**

| No | Ibadah | Satuan | Target Harian |
|---|---|---|---|
| 1 | Sholat 5 Waktu | Rakaat / centang | 5 waktu |
| 2 | Baca Al-Qur'an | Halaman / ayat | 1 halaman |
| 3 | Dzikir Pagi/Petang | Centang | 2x/hari |
| 4 | Sedekah Harian | Nominal / centang | 1x/hari |
| 5 | Sholat Sunnah | Rakaat / centang | Opsional |

**Fitur:**
- Checklist harian dengan progress bar per ibadah
- Tampilan grafik bar 7 hari terakhir
- Filter: Hari Ini / Minggu Ini / Bulan Ini
- AI insight mingguan berdasarkan data ibadah
- Notifikasi pengingat ibadah (opsional)

**Kriteria Penerimaan:**
- [ ] Checklist tersimpan otomatis tanpa tombol "Save"
- [ ] Grafik 7 hari memperbarui secara real-time
- [ ] Data ibadah terhubung ke kalkulasi Halal Score

---

#### Modul 03 — Keuangan Syariah

**Tujuan:** Mencatat dan mengkategorikan transaksi keuangan berdasarkan prinsip syariah.

**Fitur:**
- Input transaksi: pemasukan & pengeluaran
- Kategorisasi otomatis dengan label:
  - ✅ **Halal** — kebutuhan pokok, pendidikan, sedekah
  - ⚠️ **Syubhat** — hiburan, subscription tidak jelas
  - 🚫 **Boros Alert** — pengeluaran berlebihan di kategori tidak prioritas
- Dashboard saldo & budget per kategori
- Laporan bulanan (PDF/export)
- Filter transaksi berdasarkan kategori, tanggal, nominal

**Aturan Kategorisasi:**

| Kategori | Contoh Transaksi | Tag |
|---|---|---|
| Kebutuhan Pokok | Makan, transportasi, kos | Halal ✅ |
| Pendidikan | Kursus, buku, sekolah | Halal ✅ |
| Sedekah | Donasi, infaq, zakat | Halal ✅ |
| Hiburan | Streaming, nongkrong | Syubhat ⚠️ |
| Impulsif | Belanja tanpa rencana > Rp 200rb | Boros 🚫 |
| Riba | Cicilan berbunga, pinjol | Tidak Didukung ❌ |

**Kriteria Penerimaan:**
- [ ] Transaksi bisa diinput dalam < 30 detik
- [ ] Auto-tag berjalan akurat minimal 80% dari transaksi
- [ ] Tidak mendukung/mencatat transaksi riba, pinjol, atau judi
- [ ] Laporan bulanan bisa diexport

---

#### Modul 04 — AI Advisor (Claude API)

*(Detail lengkap di Bagian 8)*

**Ringkasan:**
- Model: `claude-sonnet-4` dari Anthropic
- Data input: saldo, pengeluaran, ibadah, streak, halal score
- Gaya respons: singkat, jelas, actionable (max 3–4 kalimat)
- Berbasis syariah: saran sesuai prinsip Islam, bahasa ramah Gen Z
- Akses: langsung dari dashboard, tanpa pindah halaman

---

#### Modul 05 — Zakat & Sedekah

**Tujuan:** Membantu pengguna memenuhi kewajiban zakat dan mencatat sedekah secara sistematis.

**Fitur Zakat:**
- Kalkulator nisab otomatis berdasarkan harga emas terkini
- Progress bar nisab dengan estimasi waktu tercapai
- Notifikasi saat saldo mencapai nisab (haul 1 tahun)
- Panduan jenis zakat: zakat maal, zakat penghasilan, zakat fitrah

**Fitur Sedekah:**
- Log sedekah harian dengan nominal
- Rekap sedekah 4 minggu terakhir
- Target sedekah bulanan (opsional, diset pengguna)
- Saran nominal sedekah dari AI berdasarkan kondisi keuangan

**Kriteria Penerimaan:**
- [ ] Kalkulasi nisab akurat berdasarkan standar BAZNAS
- [ ] Notifikasi zakat berfungsi di semua browser yang mendukung PWA
- [ ] Data sedekah terhubung ke komponen Halal Score

---

#### Modul 06 — Streak & Gamifikasi

**Tujuan:** Meningkatkan motivasi dan konsistensi ibadah melalui mekanisme gamifikasi islami.

**Sistem Streak:**
- Streak dihitung berdasarkan kelengkapan ibadah harian
- Hari tanpa checklist = streak terputus
- Visualisasi 7 hari terakhir (dot chart)

**Sistem Badge:**

| Badge | Kriteria |
|---|---|
| 🏆 Konsisten | Streak 7 hari berturut-turut |
| ⭐ Syariah+ | Halal Score ≥ 80 selama 1 bulan |
| 💝 Dermawan | Sedekah setiap hari selama 30 hari |
| 🌙 Amanah | Semua ibadah lengkap selama 30 hari |

**Sistem Level:**

| Level | Skor | Deskripsi |
|---|---|---|
| Beginner | 0–49 | Mulai perjalanan |
| Consistent | 50–69 | Membangun kebiasaan |
| Elite | 70–89 | Konsisten & terpercaya |
| Amanah | 90–100 | Puncak keistiqomahan |

**Kriteria Penerimaan:**
- [ ] Streak terupdate otomatis setiap hari pada pukul 00.00 WIB
- [ ] Badge diberikan real-time saat kriteria terpenuhi
- [ ] Level terupdate setelah setiap perubahan Halal Score

---

## 6. Spesifikasi Fungsional

### 6.1 Autentikasi & Keamanan

- Login dengan email + password (Supabase Auth)
- JWT Cookies untuk session management
- Data pengguna terenkripsi di Supabase PostgreSQL
- Tidak ada fitur login sosial di MVP (direncanakan di Fase 4)

### 6.2 Manajemen Data

- Semua data tersimpan di Supabase PostgreSQL
- Backup otomatis harian
- Data bersifat privat per pengguna (tidak ada sharing data antar pengguna di MVP)
- Retensi data: selama akun aktif

### 6.3 Notifikasi

- Notifikasi ibadah (browser push notification via PWA)
- Notifikasi zakat saat mendekati nisab
- Pengingat harian untuk checklist ibadah
- Pengaturan notifikasi bisa dikustomisasi per pengguna

### 6.4 Offline Support

- Data ibadah harian dapat diinput offline (service worker PWA)
- Sinkronisasi otomatis saat koneksi kembali
- Dashboard tersedia dalam mode read-only saat offline

---

## 7. Sistem Halal Score

### 7.1 Definisi

Halal Score adalah skor 0–100 yang merepresentasikan keseimbangan antara kondisi keuangan syariah dan konsistensi ibadah seorang pengguna. 

> **Prinsip:** Halal Score bukan alat menghakimi, melainkan cermin untuk membantu pengguna mengenali area yang perlu ditingkatkan. *Skor naik = motivasi ✨ | Skor turun = pengingat 💪*

### 7.2 Komponen Skor

| Komponen | Bobot | Sub-kriteria |
|---|---|---|
| 💰 Financial Discipline | 40 poin | Pengeluaran vs budget, rasio kategori halal/boros, konsistensi menabung |
| 🌙 Syariah Compliance | 30 poin | Transaksi sesuai prinsip Islam, bebas riba, tercatat sedekah |
| 🕌 Habit Consistency | 30 poin | Konsistensi ibadah harian selama sebulan, kelengkapan checklist |

**Total: 100 poin**

### 7.3 Contoh Kalkulasi

Contoh pengguna dengan skor 78:

| Komponen | Skor | Maks |
|---|---|---|
| Financial Discipline | 29 | 40 |
| Syariah Compliance | 27 | 30 |
| Habit Consistency | 22 | 30 |
| **Total** | **78** | **100** |

→ Level: **💎 Consistent**

### 7.4 Formula Kalkulasi

**Financial Discipline (40 poin):**
```
FD = (30 × (1 - rasio_pengeluaran_boros)) + (10 × rasio_kategori_halal)
```

**Syariah Compliance (30 poin):**
```
SC = (20 × bebas_riba_score) + (10 × sedekah_regularity_score)
```

**Habit Consistency (30 poin):**
```
HC = 30 × (total_ibadah_checklist / total_target_ibadah_bulan)
```

### 7.5 Update Frekuensi

- Skor diperbarui setiap hari pada pukul 23.59 WIB
- Skor harian dapat dilihat dalam grafik tren bulanan

---

## 8. AI Advisor — Claude API

### 8.1 Konfigurasi Teknis

| Parameter | Nilai |
|---|---|
| Model | `claude-sonnet-4` (Anthropic) |
| Max Tokens | 512 per respons |
| Temperature | 0.7 (balanced creativity & accuracy) |
| Bahasa | Indonesia (Gen Z-friendly) |

### 8.2 Konteks Data yang Diberikan ke AI

Setiap permintaan ke Claude API akan menyertakan context pengguna:

```json
{
  "user_context": {
    "nama": "string",
    "saldo_bulan_ini": "number",
    "total_pengeluaran": "number",
    "halal_score": "number",
    "level": "string",
    "streak_hari": "number",
    "ibadah_hari_ini": {
      "sholat": "boolean",
      "quran": "boolean",
      "dzikir": "boolean",
      "sedekah": "boolean",
      "sunnah": "boolean"
    },
    "top_kategori_pengeluaran": ["string"],
    "nisab_progress": "number"
  }
}
```

### 8.3 System Prompt

```
Kamu adalah AI Advisor keuangan dan ibadah berbasis prinsip Islam untuk aplikasi Halal Habit Tracker.
Berikan saran yang:
1. Sesuai prinsip syariah (tidak mendukung riba, boros, atau haram)
2. Singkat dan actionable (maksimal 3-4 kalimat)
3. Menggunakan bahasa Indonesia yang ramah dan natural untuk Gen Z
4. Berdasarkan data nyata pengguna yang diberikan dalam konteks
5. Tidak menghakimi, tapi memotivasi dengan penuh kasih sayang

Selalu mulai respons dengan sapaan yang hangat menggunakan nama pengguna.
```

### 8.4 Contoh Pertanyaan & Skenario

| Pertanyaan Pengguna | Konteks yang Relevan |
|---|---|
| "Gimana kondisi keuanganku bulan ini?" | Saldo, pengeluaran, budget, halal score |
| "Tips biar ibadahku lebih konsisten" | Streak, checklist ibadah, habit consistency score |
| "Kapan aku bisa mulai bayar zakat?" | Saldo, nisab progress, tren pemasukan |
| "Pengeluaran apa yang bisa aku hemat?" | Kategori pengeluaran, rasio boros, budget |

### 8.5 Batasan AI

- AI tidak memberikan fatwa agama resmi
- AI tidak menyarankan produk keuangan spesifik (investasi, asuransi)
- AI tidak mengakses data di luar konteks yang diberikan aplikasi
- Setiap respons AI dilabeli "AI Advisor · Powered by Claude API"

---

## 9. Arsitektur Sistem & Tech Stack

### 9.1 Diagram Arsitektur

```
PENGGUNA (Muslim muda, Gen Z)
        │
        ▼
┌───────────────────────────────┐
│  FRONTEND                     │
│  React / Next.js 14           │
│  Tailwind CSS · Chart.js      │
└───────────────┬───────────────┘
                │ API Calls
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

### 9.2 Tech Stack Detail

| Layer | Teknologi | Versi | Alasan Pemilihan |
|---|---|---|---|
| Framework | Next.js | 14 (App Router) | SSR, performa tinggi, SEO friendly |
| UI Library | React | 18 | Ekosistem besar, komponen reusable |
| Styling | Tailwind CSS | 3.x | Cepat, utility-first, konsisten |
| Charts | Chart.js | 4.x | Ringan, Line & Bar chart support |
| Database | Supabase PostgreSQL | Latest | Real-time, open source, mudah setup |
| Auth | Supabase Auth + JWT | — | Terintegrasi dengan DB |
| Storage | Supabase Storage | — | Untuk foto profil & export |
| AI | Claude API (Anthropic) | claude-sonnet-4 | Kualitas tertinggi, bahasa Indonesia baik |
| Deployment | Vercel | — | CI/CD otomatis, edge network |
| Version Control | GitHub | — | Standar industri |

### 9.3 Struktur Database (Skema Dasar)

**Tabel: `users`**
```sql
id, email, nama, avatar_url, level, created_at, updated_at
```

**Tabel: `transactions`**
```sql
id, user_id, tipe (pemasukan/pengeluaran), nominal, kategori, 
tag_syariah (halal/syubhat/boros), deskripsi, tanggal, created_at
```

**Tabel: `ibadah_logs`**
```sql
id, user_id, tanggal, sholat_5waktu, baca_quran, dzikir, 
sedekah, sholat_sunnah, created_at
```

**Tabel: `halal_scores`**
```sql
id, user_id, tanggal, financial_discipline, syariah_compliance, 
habit_consistency, total_score, level, created_at
```

**Tabel: `sedekah_logs`**
```sql
id, user_id, nominal, deskripsi, tanggal, created_at
```

**Tabel: `streaks`**
```sql
id, user_id, streak_count, last_check_date, longest_streak, created_at
```

---

## 10. Desain UI/UX

### 10.1 Prinsip Desain

1. **Islami & Estetik** — Menggunakan palet warna yang hangat dan bersih, dengan elemen desain yang mencerminkan nilai Islam
2. **Gen Z Friendly** — Typografi modern, animasi halus, layout yang "instagrammable"
3. **Mobile First** — Desain dioptimalkan untuk layar smartphone terlebih dahulu
4. **Minimal Friction** — Input transaksi dan ibadah harus bisa dilakukan dalam < 30 detik
5. **Informasi Hierarki Jelas** — Informasi terpenting (saldo, halal score, streak) selalu terlihat

### 10.2 Palet Warna

| Peran | Warna | Hex |
|---|---|---|
| Primary | Pink Magenta | `#E91E8C` |
| Secondary | Lavender | `#A78BFA` |
| Accent | Mint Green | `#6EE7B7` |
| Background (Dark) | Deep Navy | `#1A1033` |
| Background (Light) | Soft Pink | `#FDF2F8` |
| Text Primary | Dark Slate | `#1E293B` |
| Text Secondary | Gray | `#64748B` |

### 10.3 Komponen UI Utama

**KPI Cards**
- 4 kartu di baris atas: Saldo, Pengeluaran, Sedekah, Halal Score
- Background gradient dengan ikon ilustratif
- Perubahan nominal ditampilkan dengan warna hijau (naik) / merah (turun)

**Halal Score Ring Chart**
- Ring chart SVG animasi dengan nilai 0–100
- Warna ring berubah sesuai level (merah → kuning → hijau → emas)
- Label level ditampilkan di bawah ring

**Ibadah Progress Bar**
- Progress bar per ibadah dengan persentase
- Warna pink untuk sholat, biru untuk Quran, ungu untuk dzikir
- Checkbox interaktif dengan animasi centang

**AI Advisor Panel**
- Floating card dengan badge "Powered by Claude API"
- Input teks dengan placeholder contoh pertanyaan
- Tombol "Tanya ✨" dengan efek hover animasi
- Respons AI ditampilkan dalam bubble chat

### 10.4 Navigasi

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

## 11. Roadmap Pengembangan

### Fase 1 — Fondasi (1–2 bulan)

**Tujuan:** Setup infrastruktur dan fitur dasar yang bisa berjalan

| Task | Status |
|---|---|
| Setup project Next.js 14 + Supabase | Perencanaan |
| Implementasi autentikasi (email/password) | Perencanaan |
| Desain & implementasi database schema | Perencanaan |
| UI Dashboard dasar | Perencanaan |
| Form input transaksi manual | Perencanaan |
| Form input ibadah harian | Perencanaan |
| Deploy ke Vercel (staging) | Perencanaan |

**Deliverable:** Aplikasi bisa diakses, login berfungsi, input transaksi & ibadah berjalan

---

### Fase 2 — Fitur Inti (2–3 bulan)

**Tujuan:** Implementasi fitur-fitur unggulan aplikasi

| Task | Status |
|---|---|
| Halal Score engine (kalkulasi & update harian) | Perencanaan |
| Ibadah tracker lengkap dengan grafik 7 hari | Perencanaan |
| Integrasi Chart.js (line chart, bar chart, donut) | Perencanaan |
| Sistem streak & badge | Perencanaan |
| Level system (Beginner → Amanah) | Perencanaan |
| Integrasi Claude API — AI Advisor | Perencanaan |
| Push notification (PWA service worker) | Perencanaan |

**Deliverable:** MVP lengkap siap untuk beta testing internal

---

### Fase 3 — Keuangan Syariah (1–2 bulan)

**Tujuan:** Modul keuangan syariah yang komprehensif

| Task | Status |
|---|---|
| Auto-categorization transaksi (halal/syubhat/boros) | Perencanaan |
| Zakat calculator otomatis (nisab, haul) | Perencanaan |
| Log sedekah & rekap bulanan | Perencanaan |
| Laporan bulanan (tampilan & export) | Perencanaan |
| Notifikasi pengingat ibadah & zakat | Perencanaan |
| Budget management per kategori | Perencanaan |

**Deliverable:** Fitur keuangan syariah lengkap, siap user testing publik

---

### Fase 4 — Optimasi (1 bulan)

**Tujuan:** Performa, UX, dan pengalaman mobile yang lebih baik

| Task | Status |
|---|---|
| Performa & optimasi loading speed | Perencanaan |
| Dark mode | Perencanaan |
| Versi mobile PWA (installable) | Perencanaan |
| Integrasi kalender Hijriah otomatis | Perencanaan |
| Onboarding flow pengguna baru | Perencanaan |
| Accessibility improvements | Perencanaan |

**Deliverable:** Aplikasi siap launch publik dengan UX yang halus

---

### Fase 5 — Skala (Ongoing)

**Tujuan:** Ekspansi fitur dan pertumbuhan pengguna

| Task | Status |
|---|---|
| Fitur multi-user (keluarga/komunitas) | Roadmap |
| Reminder sholat otomatis terintegrasi jadwal | Roadmap |
| AI Advisor makin personal (memory per pengguna) | Roadmap |
| Laporan tahunan & infografis pribadi | Roadmap |
| Split bill syariah (fitur sosial) | Roadmap |
| Integrasi bank/e-wallet (Open Banking) | Roadmap |

---

## 12. Kriteria Keberhasilan (Success Metrics)

### 12.1 Metrik Produk

| Metrik | Target 3 Bulan | Target 6 Bulan | Target 1 Tahun |
|---|---|---|---|
| Total pengguna terdaftar | 500 | 3.000 | 10.000 |
| Monthly Active Users (MAU) | 300 | 1.800 | 6.000 |
| Daily Active Users (DAU) | 100 | 600 | 2.000 |
| DAU/MAU Ratio | ≥ 30% | ≥ 35% | ≥ 40% |
| Rata-rata sesi per hari/pengguna | 2x | 3x | 3x |
| Churn rate bulanan | ≤ 20% | ≤ 15% | ≤ 10% |

### 12.2 Metrik Engagement Fitur

| Fitur | Target Adoption |
|---|---|
| Ibadah Tracker (digunakan 5+ hari/minggu) | 60% pengguna aktif |
| AI Advisor (digunakan 1+ kali/minggu) | 40% pengguna aktif |
| Input transaksi (1+ transaksi/hari) | 50% pengguna aktif |
| Streak ≥ 7 hari | 30% pengguna aktif |

### 12.3 Metrik Teknis

| Metrik | Target |
|---|---|
| Waktu muat halaman (LCP) | < 2,5 detik |
| First Input Delay (FID) | < 100ms |
| Uptime aplikasi | ≥ 99,5% |
| Error rate API | < 0,5% |
| Waktu respons AI Advisor | < 5 detik |

---

## 13. Asumsi & Batasan

### 13.1 Asumsi

1. Pengguna memiliki koneksi internet stabil untuk fitur AI Advisor
2. Pengguna bersedia memberikan akses notifikasi browser
3. Harga emas untuk kalkulasi nisab diambil dari API publik yang tersedia
4. Claude API (Anthropic) tersedia dengan SLA yang memadai untuk aplikasi konsumen
5. Pengguna adalah individu, bukan entitas bisnis, di MVP

### 13.2 Batasan MVP (Out of Scope)

- ❌ Integrasi langsung dengan bank atau e-wallet (Open Banking)
- ❌ Fitur komunitas atau multi-user
- ❌ Aplikasi native iOS/Android (hanya PWA)
- ❌ Fitur split bill
- ❌ Login sosial (Google, Apple)
- ❌ Laporan pajak
- ❌ Konten edukasi keuangan islami (artikel, video)

---

## 14. Risiko & Mitigasi

| No | Risiko | Probabilitas | Dampak | Mitigasi |
|---|---|---|---|---|
| R1 | Claude API down atau rate limit terlampaui | Sedang | Tinggi | Fallback mode tanpa AI, caching respons umum |
| R2 | Akurasi auto-tag transaksi rendah (< 80%) | Sedang | Sedang | Manual override oleh pengguna, training data lebih banyak |
| R3 | Pengguna tidak konsisten input data | Tinggi | Tinggi | Onboarding edukatif, gamifikasi, notifikasi |
| R4 | Kontroversi interpretasi syariah | Rendah | Tinggi | Disclaimer yang jelas, saran konsultasi ustadz |
| R5 | Performa lambat di perangkat low-end | Sedang | Sedang | Optimasi bundle size, lazy loading, CDN |
| R6 | Data breach Supabase | Rendah | Sangat Tinggi | Enkripsi data sensitif, audit keamanan berkala |
| R7 | Kompetitor meluncurkan produk serupa | Sedang | Sedang | Percepat roadmap, fokus pada brand loyalty |

---

## 15. Glosarium

| Istilah | Definisi |
|---|---|
| **Halal** | Sesuatu yang diperbolehkan menurut hukum Islam |
| **Syubhat** | Perkara yang tidak jelas status halal/haramnya, perlu kehati-hatian |
| **Boros** | Pengeluaran berlebihan yang tidak sesuai kebutuhan (israf) |
| **Riba** | Bunga/tambahan dalam pinjaman, dilarang dalam Islam |
| **Zakat** | Kewajiban mengeluarkan sebagian harta yang sudah mencapai nisab |
| **Nisab** | Batas minimum harta yang wajib dizakati |
| **Haul** | Periode satu tahun kepemilikan harta sebelum wajib zakat |
| **Sedekah** | Pemberian sukarela kepada yang membutuhkan |
| **Infaq** | Pengeluaran di jalan Allah, lebih luas dari sedekah |
| **Ibadah** | Ritual ketaatan kepada Allah (sholat, puasa, dll.) |
| **Streak** | Rangkaian hari berturut-turut pengguna menyelesaikan target ibadah |
| **Halal Score** | Skor 0–100 yang merepresentasikan keseimbangan keuangan syariah & ibadah |
| **PWA** | Progressive Web App — aplikasi web yang bisa diinstall seperti aplikasi native |
| **MAU** | Monthly Active Users — pengguna aktif dalam satu bulan |
| **DAU** | Daily Active Users — pengguna aktif dalam satu hari |
| **MVP** | Minimum Viable Product — versi pertama produk dengan fitur inti |
| **KPI** | Key Performance Indicator — indikator kinerja utama |

---

## Penutup

> *بِسْمِ اللهِ الرَّحْمَنِ الرَّحِيمِ*
> 
> *"Dengan nama Allah yang Maha Pengasih lagi Maha Penyayang — semoga Halal Habit Tracker membawa keberkahan & manfaat bagi semua."*

Dokumen PRD ini adalah panduan hidup yang akan terus diperbarui seiring perkembangan produk. Setiap keputusan produk hendaknya selalu berpijak pada nilai utama: **amanah, manfaat, dan keberkahan**.

---

*Halal Habit Tracker · PRD v1.0.0 · Syariah 2025*
*🌸 Catat, Pantau & Ibadah Bareng*
