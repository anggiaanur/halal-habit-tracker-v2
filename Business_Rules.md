# 📋 Business Rules Document
## Halal Habit Tracker — Aturan Bisnis Aplikasi

---

| Atribut | Detail |
|---|---|
| **Nama Produk** | Halal Habit Tracker |
| **Versi Dokumen** | 1.0.0 |
| **Referensi PRD** | PRD_Halal_Habit_Tracker v1.0.0 |
| **Status** | Draft — MVP |
| **Platform** | Web App (PWA) |
| **Tanggal** | Mei 2025 |
| **Prinsip** | Syariah-Friendly |

---

## Daftar Isi

1. [Aturan Autentikasi & Pengguna](#1-aturan-autentikasi--pengguna)
2. [Aturan Keuangan Syariah](#2-aturan-keuangan-syariah)
3. [Aturan Ibadah Tracker](#3-aturan-ibadah-tracker)
4. [Aturan Halal Score](#4-aturan-halal-score)
5. [Aturan Zakat & Sedekah](#5-aturan-zakat--sedekah)
6. [Aturan Streak & Gamifikasi](#6-aturan-streak--gamifikasi)
7. [Aturan AI Advisor](#7-aturan-ai-advisor)
8. [Aturan Notifikasi](#8-aturan-notifikasi)
9. [Aturan Data & Privasi](#9-aturan-data--privasi)
10. [Aturan Performa & Sistem](#10-aturan-performa--sistem)

---

## 1. Aturan Autentikasi & Pengguna

### BR-AUTH-001 — Metode Login
- Pengguna **hanya dapat** login menggunakan **email + password** (Supabase Auth).
- Login sosial (Google, Apple) **tidak tersedia** pada MVP.
- Setiap sesi dikelola menggunakan **JWT Cookies**.

### BR-AUTH-002 — Profil Pengguna
- Setiap pengguna memiliki satu akun individual.
- Akun **bersifat privat**; tidak ada fitur berbagi data antar pengguna di MVP.
- Data yang tersimpan per pengguna: `id`, `email`, `nama`, `avatar_url`, `level`, `created_at`, `updated_at`.

### BR-AUTH-003 — Scope Pengguna
- Aplikasi **hanya untuk individu**, bukan entitas bisnis, di MVP.
- Fitur multi-user (keluarga/komunitas) masuk dalam roadmap Fase 5, **bukan MVP**.

### BR-AUTH-004 — Keamanan Data
- Seluruh data pengguna **terenkripsi** di Supabase PostgreSQL.
- Backup otomatis dilakukan **setiap hari**.
- Retensi data berlaku **selama akun aktif**.

---

## 2. Aturan Keuangan Syariah

### BR-FIN-001 — Tipe Transaksi
- Sistem mendukung dua tipe transaksi: **pemasukan** dan **pengeluaran**.
- Setiap transaksi wajib memiliki: `nominal`, `kategori`, `tanggal`, dan `tag_syariah`.

### BR-FIN-002 — Kategorisasi Transaksi (Auto-Tag Syariah)
Setiap transaksi dikategorikan secara otomatis dengan tiga label berikut:

| Tag | Keterangan | Contoh Transaksi |
|---|---|---|
| ✅ **Halal** | Pengeluaran sesuai prinsip Islam | Makan, transportasi, kos, pendidikan, sedekah, zakat |
| ⚠️ **Syubhat** | Pengeluaran tidak jelas status halal/haramnya | Hiburan, streaming, nongkrong, subscription tidak jelas |
| 🚫 **Boros Alert** | Pengeluaran berlebihan di kategori tidak prioritas | Belanja impulsif tanpa rencana > Rp 200.000 |

- Akurasi auto-tag **minimal 80%** dari seluruh transaksi.
- Pengguna **dapat melakukan manual override** pada tag yang tidak sesuai.

### BR-FIN-003 — Transaksi yang Tidak Didukung
- Sistem **tidak mendukung, tidak mencatat, dan tidak memproses** transaksi yang mengandung unsur:
  - **Riba** (cicilan berbunga, produk keuangan konvensional berbasis bunga)
  - **Pinjaman online ilegal (pinjol)**
  - **Judi** dalam bentuk apapun
- Jika input transaksi terdeteksi mengandung unsur di atas, sistem **menolak** pencatatan dan menampilkan pesan informatif kepada pengguna.

### BR-FIN-004 — Kecepatan Input
- Proses input satu transaksi harus dapat diselesaikan pengguna dalam **kurang dari 30 detik**.

### BR-FIN-005 — Laporan Keuangan
- Sistem menyediakan **laporan bulanan** yang dapat diekspor oleh pengguna.
- Filter transaksi tersedia berdasarkan: **kategori**, **tanggal**, dan **nominal**.

### BR-FIN-006 — Batas Threshold Boros
- Pengeluaran impulsif atau tidak terencana yang melebihi **Rp 200.000** dalam satu transaksi secara otomatis mendapatkan tag **Boros 🚫**.

---

## 3. Aturan Ibadah Tracker

### BR-IBADAH-001 — Ibadah yang Dilacak
Sistem melacak **5 ibadah utama** setiap hari:

| No | Ibadah | Satuan Pencatatan | Target Harian |
|---|---|---|---|
| 1 | Sholat 5 Waktu | Rakaat / centang per waktu | 5 waktu |
| 2 | Baca Al-Qur'an | Halaman / ayat | 1 halaman |
| 3 | Dzikir Pagi/Petang | Centang | 2x/hari |
| 4 | Sedekah Harian | Nominal / centang | 1x/hari |
| 5 | Sholat Sunnah | Rakaat / centang | Opsional |

### BR-IBADAH-002 — Penyimpanan Data
- Checklist ibadah **tersimpan otomatis** tanpa tombol "Save" yang harus ditekan pengguna.
- Data ibadah tersimpan di tabel `ibadah_logs` per pengguna per tanggal.

### BR-IBADAH-003 — Periode & Filter
- Pengguna dapat melihat data ibadah dengan filter: **Hari Ini**, **Minggu Ini**, dan **Bulan Ini**.
- Grafik bar 7 hari terakhir diperbarui secara **real-time**.

### BR-IBADAH-004 — Koneksi ke Halal Score
- Data ibadah harian **terhubung langsung** ke kalkulasi komponen **Habit Consistency** pada Halal Score.
- Ibadah yang dicatat pada hari yang sama **hanya dihitung satu kali** per tanggal kalender.

### BR-IBADAH-005 — Offline Support
- Data ibadah harian **dapat diinput saat offline** melalui service worker PWA.
- Sinkronisasi data offline dilakukan **otomatis** saat koneksi internet kembali tersedia.

---

## 4. Aturan Halal Score

### BR-SCORE-001 — Definisi & Prinsip
- Halal Score adalah **skor 0–100** yang merepresentasikan keseimbangan antara kondisi keuangan syariah dan konsistensi ibadah pengguna.
- Halal Score **bukan alat menghakimi**; ia berfungsi sebagai cermin motivasi dan pengingat perbaikan diri.

### BR-SCORE-002 — Komponen & Bobot

| Komponen | Bobot Maksimal | Keterangan |
|---|---|---|
| 💰 Financial Discipline | 40 poin | Pengeluaran vs budget, rasio halal/boros, konsistensi menabung |
| 🌙 Syariah Compliance | 30 poin | Bebas riba, transaksi sesuai prinsip Islam, sedekah tercatat |
| 🕌 Habit Consistency | 30 poin | Konsistensi ibadah harian selama sebulan, kelengkapan checklist |
| **Total** | **100 poin** | |

### BR-SCORE-003 — Formula Kalkulasi

**Financial Discipline (maks 40 poin):**
```
FD = (30 × (1 - rasio_pengeluaran_boros)) + (10 × rasio_kategori_halal)
```

**Syariah Compliance (maks 30 poin):**
```
SC = (20 × bebas_riba_score) + (10 × sedekah_regularity_score)
```

**Habit Consistency (maks 30 poin):**
```
HC = 30 × (total_ibadah_checklist / total_target_ibadah_bulan)
```

**Total Halal Score:**
```
Total = FD + SC + HC
```

### BR-SCORE-004 — Level Pengguna Berdasarkan Skor

| Level | Rentang Skor | Deskripsi |
|---|---|---|
| 🌱 Beginner | 0 – 49 | Mulai perjalanan |
| 💫 Consistent | 50 – 69 | Membangun kebiasaan |
| 💎 Elite | 70 – 89 | Konsisten & terpercaya |
| 🌟 Amanah | 90 – 100 | Puncak keistiqomahan |

### BR-SCORE-005 — Jadwal Pembaruan
- Halal Score **diperbarui setiap hari** pada pukul **23.59 WIB**.
- Level pengguna **diperbarui otomatis** setelah setiap perubahan Halal Score.
- Riwayat skor harian dapat dilihat dalam **grafik tren bulanan**.

---

## 5. Aturan Zakat & Sedekah

### BR-ZAKAT-001 — Kalkulasi Nisab
- Kalkulasi nisab dilakukan secara **otomatis** berdasarkan **harga emas terkini** yang diambil dari API publik.
- Standar kalkulasi nisab mengikuti **ketentuan BAZNAS** yang berlaku.
- Sistem melacak **haul** (periode 1 tahun kepemilikan harta) secara otomatis.

### BR-ZAKAT-002 — Notifikasi Zakat
- Sistem **mengirimkan notifikasi** kepada pengguna saat saldo tabungan mendekati atau mencapai nisab.
- Notifikasi zakat harus **berfungsi di semua browser** yang mendukung PWA.
- Jenis zakat yang dipandu: **zakat maal**, **zakat penghasilan**, dan **zakat fitrah**.

### BR-ZAKAT-003 — Sedekah Harian
- Pengguna dapat mencatat **log sedekah harian** beserta nominalnya.
- Sistem menampilkan **rekap sedekah 4 minggu terakhir**.
- Target sedekah bulanan **bersifat opsional** dan dapat diset sendiri oleh pengguna.

### BR-ZAKAT-004 — Koneksi ke Halal Score
- Data sedekah yang tercatat **terhubung langsung** ke kalkulasi komponen **Syariah Compliance** pada Halal Score.
- Sedekah harian yang dicatat juga **berkontribusi** pada komponen Habit Consistency melalui ibadah tracker.

### BR-ZAKAT-005 — Saran AI untuk Sedekah
- AI Advisor dapat **menyarankan nominal sedekah** yang sesuai berdasarkan kondisi keuangan pengguna terkini.
- Saran ini bersifat **rekomendasi personal**, bukan kewajiban atau fatwa.

---

## 6. Aturan Streak & Gamifikasi

### BR-STREAK-001 — Perhitungan Streak
- Streak dihitung berdasarkan **kelengkapan checklist ibadah harian** pengguna.
- Streak **diperbarui otomatis** setiap hari pada pukul **00.00 WIB**.
- Satu hari tanpa input checklist ibadah = **streak terputus** dan kembali ke 0.

### BR-STREAK-002 — Sistem Badge
Badge diberikan **real-time** saat kriteria terpenuhi:

| Badge | Kriteria Pencapaian |
|---|---|
| 🏆 Konsisten | Streak 7 hari berturut-turut |
| ⭐ Syariah+ | Halal Score ≥ 80 selama 1 bulan penuh |
| 💝 Dermawan | Sedekah setiap hari selama 30 hari berturut-turut |
| 🌙 Amanah | Semua ibadah lengkap selama 30 hari berturut-turut |

### BR-STREAK-003 — Sistem Level
- Level pengguna **sama** dengan level yang diderivasikan dari Halal Score (lihat BR-SCORE-004).
- Level **diperbarui otomatis** setiap kali Halal Score berubah.

### BR-STREAK-004 — Visualisasi
- Sistem menampilkan **dot chart 7 hari terakhir** sebagai visualisasi streak.
- Data streak tersimpan di tabel `streaks`: `streak_count`, `last_check_date`, `longest_streak`.

---

## 7. Aturan AI Advisor

### BR-AI-001 — Konfigurasi Model
| Parameter | Nilai |
|---|---|
| Model | `claude-sonnet-4` (Anthropic) |
| Max Tokens per Respons | 512 token |
| Temperature | 0.7 |
| Bahasa Output | Indonesia (Gen Z-friendly) |

### BR-AI-002 — Konteks Data yang Dikirim ke AI
Setiap permintaan ke Claude API **wajib menyertakan** data konteks pengguna berikut:

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

### BR-AI-003 — Batasan dan Larangan AI
AI Advisor **tidak boleh**:
- Memberikan **fatwa agama resmi** dalam bentuk apapun.
- Merekomendasikan **produk keuangan spesifik** (investasi tertentu, asuransi tertentu, dll.).
- Mengakses **data di luar konteks** yang diberikan oleh aplikasi.
- Mendukung transaksi yang mengandung **riba, boros, atau haram**.

### BR-AI-004 — Format Respons AI
- Respons AI bersifat **singkat dan actionable** (maksimal 3–4 kalimat).
- Setiap respons **selalu diawali** dengan sapaan hangat menggunakan nama pengguna.
- Setiap tampilan respons AI **wajib dilabeli**: *"AI Advisor · Powered by Claude API"*.
- Gaya bahasa: ramah, tidak menghakimi, memotivasi dengan penuh kasih sayang.

### BR-AI-005 — Fallback Mode
- Jika Claude API tidak tersedia (down) atau **rate limit terlampaui**, aplikasi beralih ke **fallback mode tanpa AI**.
- Respons umum yang sering ditanyakan dapat di-**cache** untuk meminimalkan ketergantungan penuh pada API.

### BR-AI-006 — Waktu Respons
- Waktu respons AI Advisor dari permintaan hingga hasil tampil di layar **tidak boleh melebihi 5 detik**.

---

## 8. Aturan Notifikasi

### BR-NOTIF-001 — Jenis Notifikasi
Sistem mendukung tiga jenis notifikasi:
1. **Pengingat ibadah harian** — notifikasi untuk checklist ibadah yang belum dilengkapi.
2. **Notifikasi zakat** — saat saldo mendekati atau mencapai nisab.
3. **Pengingat harian umum** — untuk memastikan pengguna tidak lupa membuka aplikasi.

### BR-NOTIF-002 — Mekanisme Pengiriman
- Notifikasi dikirim melalui **browser push notification** via PWA service worker.
- Notifikasi **hanya dikirim** jika pengguna telah memberikan **izin notifikasi** pada browser.

### BR-NOTIF-003 — Kustomisasi Pengguna
- Pengaturan notifikasi **dapat dikustomisasi** oleh pengguna (aktif/nonaktif per jenis notifikasi).

---

## 9. Aturan Data & Privasi

### BR-DATA-001 — Kepemilikan Data
- Seluruh data yang diinput pengguna adalah **milik pengguna** itu sendiri.
- Data bersifat **privat per pengguna**; tidak ada akses silang antar pengguna di MVP.

### BR-DATA-002 — Penyimpanan
- Semua data tersimpan di **Supabase PostgreSQL**.
- Data sensitif (keuangan, ibadah) wajib **terenkripsi**.

### BR-DATA-003 — Backup & Retensi
- Backup otomatis dilakukan **setiap hari**.
- Data dipertahankan **selama akun pengguna masih aktif**.

### BR-DATA-004 — Offline & Sinkronisasi
- Data ibadah harian dapat **diinput saat offline**.
- Sinkronisasi terjadi **otomatis** saat koneksi internet kembali tersedia.
- Dashboard tersedia dalam mode **read-only** saat offline.

### BR-DATA-005 — Disclaimer Syariah
- Aplikasi **menampilkan disclaimer yang jelas** bahwa saran dan kategorisasi syariah yang diberikan oleh sistem bersifat informatif dan **bukan fatwa resmi**.
- Pengguna disarankan untuk **berkonsultasi dengan ustadz atau ulama** untuk keputusan syariah yang lebih kompleks.

---

## 10. Aturan Performa & Sistem

### BR-PERF-001 — Kecepatan Halaman
- Waktu muat halaman (LCP — Largest Contentful Paint): **< 2,5 detik**.
- First Input Delay (FID): **< 100ms**.
- Dashboard khusus harus memuat dalam **< 2 detik**.

### BR-PERF-002 — Ketersediaan Sistem
- Uptime aplikasi target: **≥ 99,5%** per bulan.
- Error rate API: **< 0,5%** dari total permintaan.

### BR-PERF-003 — Responsivitas UI
- Seluruh tampilan harus **responsif** pada layar mobile (minimum lebar **375px**) dan desktop.
- Desain menggunakan pendekatan **Mobile First**.

### BR-PERF-004 — Real-Time Update
- Semua data pada Dashboard **diperbarui secara real-time** dari database.
- Grafik 7 hari pada Ibadah Tracker diperbarui secara **real-time**.

### BR-PERF-005 — Platform
- Aplikasi berjalan sebagai **PWA (Progressive Web App)**.
- Aplikasi native iOS/Android **tidak termasuk** dalam MVP; hanya PWA yang dapat diinstall melalui browser.

---

## Ringkasan Aturan Kritis (Quick Reference)

| Kode | Ringkasan Aturan Kritis |
|---|---|
| BR-FIN-003 | Transaksi riba, pinjol, dan judi **TIDAK DIDUKUNG** |
| BR-FIN-002 | Auto-tag minimal akurat **80%** |
| BR-FIN-006 | Pengeluaran impulsif **> Rp 200.000** → otomatis tag Boros |
| BR-SCORE-005 | Halal Score update setiap hari pukul **23.59 WIB** |
| BR-STREAK-001 | Streak reset jika satu hari tidak checklist |
| BR-AI-003 | AI tidak boleh beri fatwa atau rekomendasikan produk keuangan spesifik |
| BR-AI-006 | Respons AI maksimal **5 detik** |
| BR-ZAKAT-001 | Nisab dihitung berdasarkan **standar BAZNAS** |
| BR-PERF-002 | Uptime sistem ≥ **99,5%** |

---

*Business Rules Document · Halal Habit Tracker v1.0.0 · Syariah 2025*
*🌸 Catat, Pantau & Ibadah Bareng*
