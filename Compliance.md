# ⚖️ Compliance.md — Halal Habit Tracker

> Dokumen ini menjelaskan kerangka kepatuhan syariah, aturan kategorisasi transaksi, regulasi zakat, serta ketentuan disclaimer yang berlaku dalam aplikasi Halal Habit Tracker.

---

## 1. Prinsip Kepatuhan Syariah

Seluruh fitur, konten, dan saran yang dihasilkan Halal Habit Tracker dibangun di atas lima prinsip utama Islam dalam pengelolaan harta:

| No | Prinsip | Makna Operasional |
|---|---|---|
| 1 | **Halal** | Hanya mendukung transaksi dan sumber penghasilan yang diperbolehkan syariah |
| 2 | **Anti-Riba** | Tidak mencatat, mendukung, atau menyarankan transaksi berbunga |
| 3 | **Amanah** | Pengguna bertanggung jawab atas keakuratan data yang dimasukkan |
| 4 | **Zakat & Sedekah** | Mendorong pemenuhan kewajiban zakat dan kebiasaan bersedekah |
| 5 | **Tidak Boros (Anti-Israf)** | Mengingatkan pengguna saat pengeluaran melebihi batas kewajaran |

---

## 2. Kategorisasi Transaksi Syariah

### 2.1 Sistem Auto-Tag

Setiap transaksi yang dicatat oleh pengguna akan secara otomatis mendapatkan **tag syariah** berdasarkan kategori dan nominal. Akurasi target auto-tag adalah **≥ 80%**, dengan fallback manual override oleh pengguna.

### 2.2 Tabel Kategorisasi

| Kategori | Contoh Transaksi | Tag Syariah | Keterangan |
|---|---|---|---|
| Kebutuhan Pokok | Makan, transportasi, kos | ✅ Halal | Prioritas utama |
| Pendidikan | Kursus, buku, sekolah | ✅ Halal | Investasi ilmu |
| Sedekah / Infaq / Zakat | Donasi, amal, zakat | ✅ Halal | Dianjurkan Islam |
| Tabungan / Investasi Halal | Deposito syariah, reksa dana syariah | ✅ Halal | Produk bebas riba |
| Hiburan | Streaming, nongkrong, wisata | ⚠️ Syubhat | Perlu kehati-hatian |
| Subscription tidak jelas | Langganan produk tidak teridentifikasi | ⚠️ Syubhat | Cek kehalalannya |
| Pengeluaran impulsif | Belanja tanpa rencana > Rp 200.000 | 🚫 Boros | Alert dikirimkan |
| Riba / Pinjol / Judi | Cicilan berbunga, pinjaman online, judi | ❌ Tidak Didukung | Ditolak sistem |

### 2.3 Aturan Auto-Tag Boros Alert

Sistem akan menandai transaksi sebagai **Boros Alert** jika:
- Nominal pengeluaran tunggal > Rp 200.000 di kategori non-prioritas (hiburan, fashion impulsif)
- Total pengeluaran kategori tertentu melebihi budget yang ditetapkan pengguna dalam sebulan

### 2.4 Transaksi yang Tidak Didukung

Aplikasi **secara aktif menolak** pencatatan transaksi berikut:
- Cicilan berbunga (riba)
- Pinjaman online (pinjol) berbunga
- Transaksi judi dalam bentuk apapun
- Transaksi yang terkait produk haram secara jelas (alkohol, dll.)

---

## 3. Sistem Zakat

### 3.1 Jenis Zakat yang Didukung

| Jenis Zakat | Basis Kalkulasi | Referensi |
|---|---|---|
| Zakat Maal (Harta) | Saldo ≥ nisab selama ≥ 1 haul | BAZNAS |
| Zakat Penghasilan | 2,5% dari penghasilan bersih per bulan / tahun | BAZNAS |
| Zakat Fitrah | Nilai setara 2,5 kg beras per jiwa (dibayar Ramadan) | BAZNAS |

### 3.2 Kalkulasi Nisab

- **Nisab** ditetapkan setara dengan **85 gram emas** (standar BAZNAS)
- Harga emas diambil dari **API publik harga emas terkini** secara otomatis
- Jika API tidak tersedia, sistem menggunakan **nilai default nisab statis** yang terakhir diperbarui
- **Haul** (periode kepemilikan) adalah 1 tahun Hijriah

### 3.3 Formula Zakat Penghasilan

```
Zakat Penghasilan = 2,5% × Penghasilan Bersih Bulanan

Keterangan:
- Penghasilan Bersih = Pemasukan - Kebutuhan Pokok
- Dibayarkan bulanan atau diakumulasi tahunan
```

### 3.4 Formula Progress Nisab

```
Progress Nisab (%) = (Saldo Saat Ini / Nilai Nisab Saat Ini) × 100
```

Sistem mengirimkan **notifikasi** ketika:
- Progress nisab mencapai 80% (peringatan mendekati nisab)
- Progress nisab mencapai 100% (wajib zakat, mulai hitung haul)
- Saldo turun di bawah nisab (haul direset)

### 3.5 Disclaimer Zakat

> ⚠️ **Penting:** Kalkulasi zakat dalam aplikasi ini bersifat **edukatif dan estimatif** berdasarkan standar BAZNAS. Untuk kepastian hukum, konsultasikan kepada **ustadz, ulama, atau lembaga zakat resmi** yang kompeten. Halal Habit Tracker tidak bertanggung jawab atas keputusan zakat yang diambil semata-mata berdasarkan kalkulasi aplikasi ini.

---

## 4. Kepatuhan AI Advisor

### 4.1 Batasan Konten AI

AI Advisor (powered by Claude API) beroperasi dalam batasan kepatuhan berikut:

| Batasan | Deskripsi |
|---|---|
| Tidak memberikan fatwa | AI tidak berwenang mengeluarkan fatwa agama resmi |
| Tidak merekomendasikan produk keuangan spesifik | Tidak menyarankan produk investasi, asuransi, atau reksa dana tertentu |
| Tidak mendukung transaksi haram | Tidak pernah menyarankan riba, pinjol berbunga, atau judi |
| Tidak mengakses data eksternal | Hanya beroperasi dengan konteks data yang disuplai aplikasi |
| Tidak menghakimi | Bahasa selalu memotivasi, bukan menghakimi kondisi pengguna |

### 4.2 Label Transparansi AI

Setiap respons dari AI Advisor **wajib** dilabeli:

```
AI Advisor · Powered by Claude API
```

Label ini memastikan pengguna mengetahui bahwa saran bersumber dari model AI, bukan dari ulama atau konsultan keuangan syariah bersertifikat.

### 4.3 Topik yang Tidak Boleh Dijawab AI

AI Advisor dikonfigurasi (via system prompt) untuk **tidak merespons** atau mengalihkan pertanyaan mengenai:
- Fatwa agama spesifik (halal/haram suatu produk atau tindakan)
- Rekomendasi produk investasi atau perbankan tertentu
- Saran hukum terkait keuangan atau pajak
- Konten yang bertentangan dengan nilai Islam

---

## 5. Disclaimer Syariah Umum

Disclaimer berikut ditampilkan secara visible di aplikasi pada halaman AI Advisor dan Zakat:

> *"Halal Habit Tracker adalah alat bantu manajemen keuangan dan ibadah. Saran yang diberikan oleh AI Advisor bersifat informatif dan tidak menggantikan konsultasi dengan ulama atau konsultan keuangan syariah yang berkompeten. Interpretasi syariah dapat berbeda antar mazhab dan ulama — pengguna dianjurkan untuk selalu memverifikasi dengan sumber terpercaya."*

---

## 6. Kepatuhan Regulasi Indonesia

### 6.1 Perlindungan Data Pribadi

Halal Habit Tracker beroperasi sesuai dengan ketentuan **Undang-Undang Perlindungan Data Pribadi (UU PDP) No. 27 Tahun 2022**:

- Data pribadi pengguna hanya dikumpulkan sesuai keperluan layanan
- Pengguna memiliki hak untuk mengakses, mengoreksi, dan menghapus data mereka
- Data tidak dijual atau dibagikan kepada pihak ketiga tanpa izin eksplisit pengguna
- Detail lengkap tercantum dalam Privacy Policy aplikasi

### 6.2 Pengelolaan Zakat

Aplikasi **tidak bertindak sebagai amil zakat**. Halal Habit Tracker hanya berfungsi sebagai:
- Kalkulator estimasi zakat (edukatif)
- Pencatat log sedekah dan infaq pribadi

Penyaluran zakat tetap dilakukan pengguna secara mandiri melalui lembaga amil zakat resmi (BAZNAS, LAZ terdaftar, dll.).

### 6.3 Layanan Keuangan

Halal Habit Tracker **bukan** merupakan:
- Lembaga keuangan atau perbankan
- Penasihat keuangan berlisensi
- Amil zakat resmi

Aplikasi tidak memiliki izin OJK sebagai platform keuangan dan tidak mengelola dana pengguna.

---

## 7. Pembaruan Standar Syariah

- Standar kategorisasi syariah dalam aplikasi akan ditinjau dan diperbarui **secara berkala** mengacu pada fatwa Dewan Syariah Nasional (DSN-MUI)
- Perubahan standar nisab mengikuti **ketetapan BAZNAS terbaru**
- Pengguna akan dinotifikasi jika ada perubahan signifikan pada aturan kategorisasi atau kalkulasi zakat

---

## 8. Kontak & Pelaporan

Jika pengguna menemukan:
- Konten yang bertentangan dengan prinsip syariah
- Kalkulasi zakat yang dianggap tidak akurat
- Saran AI yang tidak sesuai nilai Islam

Dapat melaporkan melalui:
- Email: compliance@halalhabittracker.id
- Form feedback dalam aplikasi

---

*Halal Habit Tracker · Compliance v1.0.0 · Syariah 2025*
