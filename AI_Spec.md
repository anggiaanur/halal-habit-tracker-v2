# 🤖 AI_Spec.md — Spesifikasi Teknis AI Advisor

> Dokumen ini menjelaskan spesifikasi lengkap integrasi Claude API (Anthropic) sebagai AI Advisor dalam Halal Habit Tracker, mencakup konfigurasi teknis, context schema, system prompt, contoh skenario, batasan, dan panduan implementasi.

---

## 1. Ikhtisar AI Advisor

AI Advisor adalah asisten kecerdasan buatan personal yang tertanam dalam aplikasi Halal Habit Tracker. AI ini memberikan saran keuangan dan ibadah yang bersifat **singkat, actionable, berbasis data nyata pengguna, dan sesuai prinsip syariah Islam**.

**Posisi dalam Produk:** Modul M04 — Prioritas P1 (Should Have)

**Model yang Digunakan:** `claude-sonnet-4` (Anthropic)

**Akses Pengguna:** Langsung dari panel Dashboard, tanpa berpindah halaman. Tersedia juga di halaman khusus `/ai-advisor`.

---

## 2. Konfigurasi Teknis

| Parameter | Nilai | Catatan |
|---|---|---|
| Model | `claude-sonnet-4` | Model Anthropic terbaru untuk kualitas bahasa tertinggi |
| Max Tokens | 512 | Membatasi respons agar singkat & actionable |
| Temperature | 0.7 | Keseimbangan kreativitas dan akurasi |
| Bahasa Output | Indonesia | Gaya bahasa ramah Gen Z, tidak kaku |
| Timeout | 10 detik | Jika melebihi, tampilkan pesan fallback |
| Target Waktu Respons | < 5 detik | Target performa (Success Metric) |

---

## 3. Arsitektur Integrasi

```
Browser (Client)
      │
      │  POST /api/ai-advisor
      │  Body: { pertanyaan: string }
      ▼
Next.js Route Handler (/app/api/ai-advisor/route.ts)
      │
      ├── 1. Verifikasi JWT (Supabase Auth)
      ├── 2. Ambil data konteks pengguna dari Supabase
      └── 3. Konstruksi payload Claude API
      │
      ▼
POST https://api.anthropic.com/v1/messages
Headers:
  x-api-key: ANTHROPIC_API_KEY (env server)
  anthropic-version: 2023-06-01
  content-type: application/json
      │
      ▼
Claude API Response (JSON)
      │
      ▼
Ekstrak teks dari response.content[0].text
      │
      ▼
Kirim ke client sebagai JSON { reply: string }
      │
      ▼
Ditampilkan sebagai bubble chat di AI Advisor Panel
```

**Penting:** API key Anthropic **tidak pernah** diekspos ke browser/client. Seluruh komunikasi ke Anthropic API dilakukan dari sisi server Next.js.

---

## 4. User Context Schema

Setiap permintaan ke Claude API menyertakan konteks data pengguna yang diambil langsung dari Supabase. Konteks ini dimasukkan ke dalam **user message** sebagai JSON string, bukan sebagai bagian system prompt.

```json
{
  "user_context": {
    "nama": "string",
    "saldo_bulan_ini": "number (dalam Rupiah)",
    "total_pengeluaran": "number (dalam Rupiah)",
    "halal_score": "number (0–100)",
    "level": "string (Beginner | Consistent | Elite | Amanah)",
    "streak_hari": "number (hari berturut-turut ibadah lengkap)",
    "ibadah_hari_ini": {
      "sholat": "boolean",
      "quran": "boolean",
      "dzikir": "boolean",
      "sedekah": "boolean",
      "sunnah": "boolean"
    },
    "top_kategori_pengeluaran": ["string (nama kategori)"],
    "nisab_progress": "number (0–100, persentase menuju nisab)"
  }
}
```

**Catatan Privasi:** Konteks yang dikirim tidak mengandung detail transaksi individual — hanya agregat/ringkasan. Tidak ada data identifikasi selain nama pengguna.

---

## 5. System Prompt Resmi

```
Kamu adalah AI Advisor keuangan dan ibadah berbasis prinsip Islam untuk aplikasi Halal Habit Tracker.

Berikan saran yang:
1. Sesuai prinsip syariah (tidak mendukung riba, boros, atau haram)
2. Singkat dan actionable (maksimal 3-4 kalimat)
3. Menggunakan bahasa Indonesia yang ramah dan natural untuk Gen Z
4. Berdasarkan data nyata pengguna yang diberikan dalam konteks
5. Tidak menghakimi, tapi memotivasi dengan penuh kasih sayang

Selalu mulai respons dengan sapaan yang hangat menggunakan nama pengguna.

BATASAN YANG WAJIB DIPATUHI:
- Jangan memberikan fatwa agama resmi
- Jangan merekomendasikan produk keuangan atau investasi spesifik
- Jangan menyarankan transaksi yang mengandung riba, pinjol berbunga, atau judi
- Jangan menjawab pertanyaan di luar topik keuangan syariah dan ibadah
- Jika pertanyaan menyangkut fatwa atau hukum syariah spesifik, arahkan pengguna untuk berkonsultasi dengan ustadz atau ulama terpercaya
```

---

## 6. Konstruksi Pesan ke Claude API

```typescript
// Contoh konstruksi payload (TypeScript)

const userMessage = `
Konteks Pengguna:
${JSON.stringify(userContext, null, 2)}

Pertanyaan Pengguna:
${pertanyaan}
`;

const payload = {
  model: "claude-sonnet-4",
  max_tokens: 512,
  system: SYSTEM_PROMPT,
  messages: [
    {
      role: "user",
      content: userMessage
    }
  ]
};
```

---

## 7. Contoh Pertanyaan & Respons

### Skenario 1 — Kondisi Keuangan Bulan Ini

**Konteks:**
- Saldo bulan ini: Rp 2.800.000
- Total pengeluaran: Rp 1.900.000
- Halal Score: 72
- Top kategori: Makan, Transportasi, Hiburan

**Pertanyaan Pengguna:** *"Gimana kondisi keuanganku bulan ini?"*

**Contoh Respons AI:**
> Hei Rizky, alhamdulillah keuanganmu bulan ini cukup sehat! Pengeluaranmu Rp 1,9 juta dari saldo Rp 2,8 juta — masih ada sisa yang bagus nih. Tapi coba perhatiin kategori Hiburan ya, bisa jadi peluang untuk dialihkan ke sedekah biar Halal Score-mu naik ke Elite. Keep it up! 💪

---

### Skenario 2 — Konsistensi Ibadah

**Konteks:**
- Streak hari: 3
- Ibadah hari ini: sholat ✅, quran ❌, dzikir ✅, sedekah ❌, sunnah ❌
- Habit Consistency Score: 22/30

**Pertanyaan Pengguna:** *"Tips biar ibadahku lebih konsisten"*

**Contoh Respons AI:**
> Zahra, streak 3 hari-mu itu udah bagus banget — jangan putus ya! Coba mulai dengan target kecil dulu: baca 1 halaman Al-Qur'an setelah sholat Subuh supaya nggak kelewatan. Sedekah juga bisa dimulai dari nominal kecil setiap hari — konsistensinya yang penting, bukan besarnya. Yuk kejar streak 7 hari buat dapet badge Konsisten! 🌙

---

### Skenario 3 — Kapan Bayar Zakat

**Konteks:**
- Saldo bulan ini: Rp 4.500.000
- Nisab progress: 68%
- Nisab saat ini: Rp 6.600.000 (estimasi)

**Pertanyaan Pengguna:** *"Kapan aku bisa mulai bayar zakat?"*

**Contoh Respons AI:**
> Hei Rizky, progres nisabmu udah di 68% — tinggal selangkah lagi! Kalau saldomu bisa konsisten di atas Rp 6,6 juta selama setahun penuh (haul), insyaAllah sudah wajib zakat. Coba sisihkan lebih dari pengeluaran yang bisa dihemat agar progresnya cepat tercapai. Untuk kepastian hitungannya, cek juga ke BAZNAS atau ustadz tepercayamu ya. ✨

---

### Skenario 4 — Penghematan Pengeluaran

**Konteks:**
- Top kategori: Hiburan (Rp 450.000), Makan (Rp 800.000), Transportasi (Rp 350.000)
- Rasio boros: 0.23

**Pertanyaan Pengguna:** *"Pengeluaran apa yang bisa aku hemat?"*

**Contoh Respons AI:**
> Hei! Melihat data pengeluaranmu, kategori Hiburan di Rp 450 ribu itu yang paling bisa dioptimalkan nih. Coba kurangi separuhnya dan alihkan ke tabungan atau sedekah — itu bisa langsung naikin Halal Score-mu lho. Makan dan transportasi masih di batas wajar, jadi fokus dulu ke sana ya. Semangat! 💚

---

## 8. Fallback & Error Handling

| Kondisi Error | Penanganan |
|---|---|
| Claude API timeout (> 10 detik) | Tampilkan pesan: *"Maaf, AI Advisor sedang sibuk. Coba lagi dalam beberapa saat."* |
| Claude API rate limit tercapai | Tampilkan pesan fallback + log error ke monitoring |
| API key tidak valid | Log ke server error, tampilkan pesan maintenance ke user |
| Koneksi internet pengguna putus | Tampilkan pesan: *"Fitur ini membutuhkan koneksi internet."* |
| Respons kosong dari Claude | Retry 1 kali, jika masih kosong tampilkan pesan fallback |

**Caching Respons Umum:** Untuk pertanyaan yang sering diajukan (FAQ), sistem dapat menyimpan respons template yang tidak bergantung pada konteks pengguna spesifik, sebagai fallback saat API tidak tersedia.

---

## 9. Batasan & Kebijakan AI

| No | Batasan | Implementasi |
|---|---|---|
| 1 | Tidak memberikan fatwa agama | Dikonfigurasi di system prompt; diuji dengan test cases |
| 2 | Tidak merekomendasikan produk keuangan spesifik | Dikonfigurasi di system prompt |
| 3 | Tidak mendukung transaksi haram | Dikonfigurasi di system prompt |
| 4 | Hanya mengakses data yang disuplai aplikasi | Claude API tidak memiliki akses internet atau database langsung |
| 5 | Setiap respons dilabeli AI | Label "AI Advisor · Powered by Claude API" pada UI |
| 6 | Max 512 token per respons | Membatasi panjang jawaban agar tetap ringkas |

---

## 10. Testing AI Advisor

### Test Cases Wajib

| Test Case | Input | Expected Behavior |
|---|---|---|
| Pertanyaan keuangan umum | "Gimana keuanganku?" + konteks valid | Respons ≤ 4 kalimat, dalam bahasa Indonesia, menyebut nama pengguna |
| Pertanyaan fatwa | "Apakah investasi saham halal?" | Redirect ke ulama/ustadz, tidak memberikan fatwa |
| Pertanyaan riba | "Rekomendasikan pinjaman berbunga terbaik" | Menolak dan memberikan alternatif syariah |
| Konteks tidak lengkap | Pertanyaan tanpa user_context | Tetap merespons dengan saran umum yang aman |
| Bahasa tidak sopan | Input kasar | Tetap merespons dengan bahasa sopan, tidak membalas kasar |
| Timeout simulation | API response delay > 10 detik | Tampilkan pesan fallback yang tepat |

---

## 11. Monitoring & Observabilitas

- **Log setiap request** ke AI Advisor (timestamp, user_id hash, response time) — tanpa menyimpan isi pertanyaan/jawaban untuk privasi
- **Alert** jika error rate > 5% dalam 1 jam
- **Dashboard monitoring** untuk: rata-rata response time, total request harian, error rate
- **Rate limiting** per user: maksimal 20 request AI per jam untuk mencegah abuse

---

*Halal Habit Tracker · AI_Spec v1.0.0 · Syariah 2025*
