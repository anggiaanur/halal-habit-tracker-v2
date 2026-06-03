import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "placeholder-key",
});

const SYSTEM_PROMPT = `Kamu adalah AI Advisor keuangan dan ibadah berbasis prinsip Islam untuk aplikasi Halal Habit Tracker.
Berikan saran yang:
1. Sesuai prinsip syariah (tidak mendukung riba, boros, atau haram)
2. Singkat dan actionable (maksimal 3-4 kalimat)
3. Menggunakan bahasa Indonesia yang ramah dan natural untuk Gen Z
4. Berdasarkan data nyata pengguna yang diberikan dalam konteks
5. Tidak menghakimi, tapi memotivasi dengan penuh kasih sayang

Selalu mulai respons dengan sapaan yang hangat menggunakan nama pengguna.`;

export interface UserContext {
  nama: string;
  saldo_bulan_ini: number;
  total_pengeluaran: number;
  halal_score: number;
  level: string;
  streak_hari: number;
  ibadah_hari_ini: {
    sholat: boolean;
    quran: boolean;
    dzikir: boolean;
    sedekah: boolean;
    sunnah: boolean;
  };
  top_kategori_pengeluaran: string[];
  nisab_progress: number;
}

export async function askAdvisor(
  question: string,
  userContext: UserContext
): Promise<string> {
  const message = await client.messages.create({
    model: "claude-3-5-sonnet-20241022", // Use standard model name in current sdk versions
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
