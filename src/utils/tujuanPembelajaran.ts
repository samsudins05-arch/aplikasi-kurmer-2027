import { Subject, TPStatus } from '../types';

export interface TPDefinition {
  code: string;
  name: string;
  text: string;
}

export const TP_STATUS_CONFIG: Record<
  TPStatus,
  { label: string; shortLabel: string; badgeClass: string; bgClass: string; borderClass: string }
> = {
  SB: {
    label: 'Sangat Baik (Tercapai Optimal)',
    shortLabel: 'Sangat Baik (SB)',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    bgClass: 'bg-emerald-50 text-emerald-900',
    borderClass: 'border-emerald-400',
  },
  B: {
    label: 'Baik (Tercapai Sesuai Tujuan)',
    shortLabel: 'Baik (B)',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-300',
    bgClass: 'bg-blue-50 text-blue-900',
    borderClass: 'border-blue-400',
  },
  C: {
    label: 'Cukup (Perlu Pemantapan)',
    shortLabel: 'Cukup (C)',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
    bgClass: 'bg-amber-50 text-amber-900',
    borderClass: 'border-amber-400',
  },
  PB: {
    label: 'Perlu Bimbingan (Belum Optimal)',
    shortLabel: 'Perlu Bimbingan (PB)',
    badgeClass: 'bg-rose-100 text-rose-800 border-rose-300',
    bgClass: 'bg-rose-50 text-rose-900',
    borderClass: 'border-rose-400',
  },
  '-': {
    label: 'Tidak Dinilai / Kosong (-)',
    shortLabel: 'Tidak Dinilai (-)',
    badgeClass: 'bg-slate-100 text-slate-500 border-slate-300',
    bgClass: 'bg-slate-50 text-slate-500',
    borderClass: 'border-slate-300',
  },
  '0': {
    label: 'Tidak Dinilai / Kosong (0)',
    shortLabel: 'Tidak Dinilai (0)',
    badgeClass: 'bg-slate-100 text-slate-500 border-slate-300',
    bgClass: 'bg-slate-50 text-slate-500',
    borderClass: 'border-slate-300',
  },
};

/**
 * Memberikan 4 Kategori Tujuan Pembelajaran (TP 1 s.d TP 4) standar Kurikulum Merdeka SD
 * disesuaikan dengan jenjang kelas dan fase.
 */
export function getDefaultTPListForSubject(
  subjectId: string,
  grade: number = 1
): [string, string, string, string] {
  const sid = subjectId.toLowerCase();

  if (sid.includes('agama')) {
    return [
      'Memahami pesan pokok ajaran dan nilai-nilai keagamaan dalam kehidupan sehari-hari',
      'Membiasakan sikap terpuji, kejujuran, dan toleransi antar sesama',
      'Melaksanakan tata cara ibadah dasar dan doa sehari-hari dengan tertib',
      'Meneladani kisah teladan tokoh keagamaan dalam menjaga kerukunan dan budi pekerti luhur',
    ];
  }

  if (sid.includes('pancasila')) {
    return [
      'Mengenal dan memahami simbol, sila-sila, serta makna Pancasila dalam kehidupan sehari-hari',
      'Mengidentifikasi aturan, hak, dan kewajiban sebagai anggota keluarga dan warga sekolah',
      'Menghargai keberagaman identitas, suku, budaya, dan agama di lingkungan sekitar',
      'Mempraktikkan musyawarah dan gotong royong dalam menyelesaikan masalah bersama di kelas',
    ];
  }

  if (sid.includes('indo') || sid.includes('bindo')) {
    return [
      'Menyimak dan memahami isi teks narasi atau informasi yang didengar dengan saksama',
      'Membaca kata-kata dengan lafal yang benar dan menemukan pesan pokok dalam teks bacaan',
      'Menyampaikan ide, tanggapan, dan gagasan secara santun dalam interaksi dan diskusi kelas',
      'Menulis teks sederhana atau cerita pengalaman pribadi dengan ejaan dan tanda baca yang tepat',
    ];
  }

  if (sid.includes('mtk') || sid.includes('matematika')) {
    return [
      'Memahami konsep lambang bilangan, nilai tempat, dan membandingkan urutan bilangan',
      'Melakukan operasi hitung dasar (penjumlahan, pengurangan, perkalian, atau pembagian) secara tepat',
      'Menyelesaikan masalah hitung kontekstual yang berkaitan dengan aktivitas sehari-hari',
      'Mengenal, mengidentifikasi sifat bangun datar, serta melakukan pengukuran sederhana',
    ];
  }

  if (sid.includes('ipas')) {
    return [
      'Mengidentifikasi bagian tubuh makhluk hidup beserta fungsinya dalam ekosistem sekitar',
      'Menganalisis wujud zat, sifat materi, dan perubahannya dalam peristiwa kehidupan sehari-hari',
      'Menjelaskan peran dan interaksi manusia dalam melestarikan lingkungan serta sumber daya alam',
      'Mengenal kenampakan alam, bentang wilayah, dan kearifan lokal daerah setempat',
    ];
  }

  if (sid.includes('pjok')) {
    return [
      'Mempraktikkan variasi dan kombinasi gerak dasar lokomotor, nonlokomotor, dan manipulatif',
      'Memahami konsep kebugaran jasmani dasar dan pemeliharaan kesehatan tubuh',
      'Menerapkan pola hidup bersih, sehat, dan pemilihan makanan bergizi seimbang',
      'Menunjukkan sikap sportivitas, disiplin, dan kerjasama yang baik saat berolahraga bersama',
    ];
  }

  if (sid.includes('seni')) {
    return [
      'Mengenal dan mengidentifikasi unsur-unsur dasar seni (garis, bentuk, warna, nada, atau gerak)',
      'Mengekspresikan imajinasi dan ide kreatif melalui karya seni rupa, musik, tari, atau teater',
      'Mengapresiasi keindahan karya seni budaya lokal dan karya teman secara positif',
      'Menggunakan alat, bahan, dan teknik berkesenian sederhana dengan aman dan bertanggung jawab',
    ];
  }

  if (sid.includes('ing') || sid.includes('english')) {
    return [
      'Merespons instruksi lisan sederhana dalam bahasa Inggris di lingkungan kelas',
      'Mengidentifikasi dan melafalkan kosakata dasar terkait benda, angka, warna, dan aktivitas',
      'Melakukan percakapan sapaan dan perkenalan diri sederhana dengan percaya diri',
      'Membaca dan memahami makna kata serta frasa pendek bergambar dengan tepat',
    ];
  }

  if (sid.includes('mulok') || sid.includes('daerah') || sid.includes('sunda') || sid.includes('jawa')) {
    return [
      'Mengenal dan melafalkan kosakata ragam bahasa daerah setempat dalam percakapan santun',
      'Memahami isi carita pondok, pupuh, dongeng, atau tembang daerah bertema budi pekerti',
      'Mempraktikkan unggah-ungguh basa atau tatakrama bahasa daerah kepada sesama dan orang yang lebih tua',
      'Mengapresiasi dan melestarikan seni budaya tradisional serta adat istiadat kearifan lokal',
    ];
  }

  // Default umum untuk mata pelajaran lainnya / muatan khusus
  return [
    `Memahami konsep dasar materi dan ruang lingkup pembelajaran ${grade > 0 ? `kelas ${grade}` : ''}`,
    'Mengidentifikasi keterkaitan materi dengan contoh kasus dalam kehidupan sehari-hari',
    'Mengembangkan keterampilan praktis dan mempraktikkan materi pembelajaran dengan terarah',
    'Menyelesaikan tugas, proyek, dan evaluasi capaian materi dengan mandiri serta bertanggung jawab',
  ];
}

/**
 * Menyusun kalimat narasi Capaian Tujuan Pembelajaran (Capaian Kompetensi)
 * sesuai kaidah bahasa resmi Rapor Kurikulum Merdeka SD.
 */
export function composeNarrativeFromTPs(
  subject: Subject,
  tpList: [string, string, string, string],
  statuses: [TPStatus, TPStatus, TPStatus, TPStatus]
): string {
  const mapel = subject.name;

  // Kelompokkan TP berdasarkan status (hanya yang diisi; abaikan '-' dan '0')
  const optimalTPs: string[] = [];
  const achievedTPs: string[] = [];
  const fairTPs: string[] = [];
  const guidanceTPs: string[] = [];

  let activeCount = 0;

  statuses.forEach((status, idx) => {
    // Abaikan jika status kosong, '-' atau '0'
    if (!status || status === '-' || status === '0') {
      return;
    }

    activeCount++;
    const tpText = tpList[idx] ? tpList[idx].trim().replace(/\.$/, '') : `tujuan pembelajaran ${idx + 1}`;
    if (status === 'SB') {
      optimalTPs.push(tpText);
    } else if (status === 'B') {
      achievedTPs.push(tpText);
    } else if (status === 'C') {
      fairTPs.push(tpText);
    } else if (status === 'PB') {
      guidanceTPs.push(tpText);
    }
  });

  if (activeCount === 0) {
    return '';
  }

  // Kalimat capaian
  const parts: string[] = [];

  if (activeCount >= 2 && optimalTPs.length === activeCount) {
    const listStr = formatTPListString(optimalTPs);
    return `Menunjukkan penguasaan yang sangat baik dan optimal pada tujuan pembelajaran ${mapel}, khususnya dalam ${listStr}.`;
  }

  if (optimalTPs.length > 0) {
    const listStr = formatTPListString(optimalTPs);
    parts.push(`Menunjukkan penguasaan yang sangat baik dalam ${listStr}`);
  }

  if (achievedTPs.length > 0) {
    const listStr = formatTPListString(achievedTPs);
    if (parts.length === 0) {
      parts.push(`Menunjukkan penguasaan yang baik dalam ${listStr}`);
    } else {
      parts.push(`serta telah mencapai tujuan pembelajaran dalam ${listStr}`);
    }
  }

  if (fairTPs.length > 0) {
    const listStr = formatTPListString(fairTPs);
    if (parts.length === 0) {
      parts.push(`Cukup menguasai capaian pembelajaran dalam ${listStr}`);
    } else {
      parts.push(`dengan capaian yang cukup dalam ${listStr}`);
    }
  }

  let mainSentence = parts.join(', ');
  if (mainSentence) {
    mainSentence = mainSentence.charAt(0).toUpperCase() + mainSentence.slice(1) + '.';
  } else {
    mainSentence = `Telah mengikuti pembelajaran ${mapel} dengan keaktifan belajar yang baik.`;
  }

  if (guidanceTPs.length > 0) {
    const listStr = formatTPListString(guidanceTPs);
    const guidanceSentence = `Perlu bimbingan dan penguatan lebih lanjut dalam ${listStr}.`;
    return `${mainSentence} ${guidanceSentence}`;
  }

  return mainSentence;
}

function formatTPListString(items: string[]): string {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} dan ${items[1]}`;
  return `${items.slice(0, -1).join(', ')}, serta ${items[items.length - 1]}`;
}

/**
 * Konversi nilai angka (0-100) ke skala status TP (SB, B, C, PB, -)
 * Standar interval Kurikulum Merdeka SD:
 * 85 - 100 : SB (Sangat Baik / Tercapai Optimal)
 * 75 - 84  : B  (Baik / Tercapai Sesuai Tujuan)
 * 65 - 74  : C  (Cukup / Perlu Pemantapan)
 * 1 - 64   : PB (Perlu Bimbingan / Belum Optimal)
 * Kosong/0 : -  (Tidak Dinilai)
 */
export function scoreToTPStatus(score: number | null | undefined): TPStatus {
  if (score === null || score === undefined || isNaN(score)) return '-';
  if (score <= 0) return '-';
  if (score >= 85) return 'SB';
  if (score >= 75) return 'B';
  if (score >= 65) return 'C';
  return 'PB';
}

/**
 * Nilai angka default representasi skala status TP jika diperlukan
 */
export function tpStatusToDefaultScore(status: TPStatus): number | null {
  switch (status) {
    case 'SB':
      return 90;
    case 'B':
      return 80;
    case 'C':
      return 70;
    case 'PB':
      return 60;
    case '-':
    case '0':
    default:
      return null;
  }
}

/**
 * Menghitung Nilai Akhir (rata-rata) dari nilai-nilai TP yang diisi (mengabaikan yang null/kosong/-)
 */
export function calculateAverageTPScore(
  scores: (number | null | undefined)[]
): number | null {
  const valid = scores.filter(
    (s): s is number => typeof s === 'number' && !isNaN(s) && s >= 0 && s <= 100
  );
  if (valid.length === 0) return null;
  const sum = valid.reduce((acc, curr) => acc + curr, 0);
  return Math.round(sum / valid.length);
}

