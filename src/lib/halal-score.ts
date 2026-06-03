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
