export interface RombelInfo {
  id: string; // e.g. "1A"
  grade: number; // 1 to 6
  name: string; // "Kelas 1A"
  phase: 'Fase A' | 'Fase B' | 'Fase C';
}

export const ALL_ROMBELS: RombelInfo[] = [
  // Kelas 1 (Fase A)
  { id: '1A', grade: 1, name: 'Kelas 1A', phase: 'Fase A' },
  { id: '1B', grade: 1, name: 'Kelas 1B', phase: 'Fase A' },
  { id: '1C', grade: 1, name: 'Kelas 1C', phase: 'Fase A' },
  { id: '1D', grade: 1, name: 'Kelas 1D', phase: 'Fase A' },

  // Kelas 2 (Fase A)
  { id: '2A', grade: 2, name: 'Kelas 2A', phase: 'Fase A' },
  { id: '2B', grade: 2, name: 'Kelas 2B', phase: 'Fase A' },
  { id: '2C', grade: 2, name: 'Kelas 2C', phase: 'Fase A' },
  { id: '2D', grade: 2, name: 'Kelas 2D', phase: 'Fase A' },
  { id: '2E', grade: 2, name: 'Kelas 2E', phase: 'Fase A' },

  // Kelas 3 (Fase B)
  { id: '3A', grade: 3, name: 'Kelas 3A', phase: 'Fase B' },
  { id: '3B', grade: 3, name: 'Kelas 3B', phase: 'Fase B' },
  { id: '3C', grade: 3, name: 'Kelas 3C', phase: 'Fase B' },
  { id: '3D', grade: 3, name: 'Kelas 3D', phase: 'Fase B' },
  { id: '3E', grade: 3, name: 'Kelas 3E', phase: 'Fase B' },

  // Kelas 4 (Fase B)
  { id: '4A', grade: 4, name: 'Kelas 4A', phase: 'Fase B' },
  { id: '4B', grade: 4, name: 'Kelas 4B', phase: 'Fase B' },
  { id: '4C', grade: 4, name: 'Kelas 4C', phase: 'Fase B' },
  { id: '4D', grade: 4, name: 'Kelas 4D', phase: 'Fase B' },
  { id: '4E', grade: 4, name: 'Kelas 4E', phase: 'Fase B' },

  // Kelas 5 (Fase C)
  { id: '5A', grade: 5, name: 'Kelas 5A', phase: 'Fase C' },
  { id: '5B', grade: 5, name: 'Kelas 5B', phase: 'Fase C' },
  { id: '5C', grade: 5, name: 'Kelas 5C', phase: 'Fase C' },
  { id: '5D', grade: 5, name: 'Kelas 5D', phase: 'Fase C' },
  { id: '5E', grade: 5, name: 'Kelas 5E', phase: 'Fase C' },

  // Kelas 6 (Fase C)
  { id: '6A', grade: 6, name: 'Kelas 6A', phase: 'Fase C' },
  { id: '6B', grade: 6, name: 'Kelas 6B', phase: 'Fase C' },
  { id: '6C', grade: 6, name: 'Kelas 6C', phase: 'Fase C' },
  { id: '6D', grade: 6, name: 'Kelas 6D', phase: 'Fase C' },
];

export const DEFAULT_SCHOOL_LOGO_URL = 'https://i.ibb.co.com/gb2y0gwD/logo-bakot-01.png';

export interface SchoolIdentity {
  namaSekolah: string;
  npsn: string;
  logoUrl?: string;
  alamatSekolah: string;
  desaKelurahan: string;
  kecamatan: string;
  kabupaten: string;
  provinsi: string;
  kodePos: string;
  emailSekolah: string;
  tahunPelajaran: string;
  semester: string; // '1 (Ganjil)' | '2 (Genap)'
  kelas: string;
  rombel: string;
  fase: string;
  namaGuru: string; // MUST BE EMPTY INITIALLY
  nipGuru: string; // MUST BE EMPTY INITIALLY
  namaKepalaSekolah: string;
  nipKepalaSekolah: string;
  tempatTanggalRapor: string;
  // Extended fields for Biodata Sekolah & Rapor (Gambar 1.1, 2.1, 3.1)
  nisNssNds?: string;
  websiteSekolah?: string;
  titimangsaBiodata?: string;
}

export interface Student {
  student_id: string; // Permanent stable unique ID
  nis: string;
  nisn: string;
  nama: string;
  jenisKelamin: 'L' | 'P' | '';
  tempatLahir: string;
  tanggalLahir: string;
  nik: string;
  namaOrtu: string;
  nomorKK: string;
  alamat: string;
  desaKelurahan: string;
  kecamatan: string;
  kabupaten: string;
  provinsi: string;
  // Extended Biodata fields (Gambar 3.1 Identitas Peserta Didik)
  agama?: string;
  statusKeluarga?: string;
  anakKe?: string;
  telepon?: string;
  sekolahAsal?: string;
  kelasDiterima?: string;
  tanggalDiterima?: string;
  namaAyah?: string;
  namaIbu?: string;
  alamatOrtu?: string;
  teleponOrtu?: string;
  pekerjaanAyah?: string;
  pekerjaanIbu?: string;
  namaWali?: string;
  alamatWali?: string;
  teleponWali?: string;
  pekerjaanWali?: string;
  fotoUrl?: string;
}

export interface Subject {
  id: string;
  name: string;
  shortName: string;
  isCustom?: boolean;
  order: number;
}

export interface StudentAttendance {
  sakit: number | null;
  izin: number | null;
  alpa: number | null;
}

export interface StudentExtracurricular {
  name: string;
  predicate: string; // Sangat Baik, Baik, Cukup
  description: string;
}

export type TPStatus = 'SB' | 'B' | 'C' | 'PB' | '-' | '0'; // SB: Sangat Baik, B: Baik, C: Cukup, PB: Perlu Bimbingan, - atau 0: Tidak dinilai/Kosong

export interface RombelData {
  rombelId: string;
  identity: SchoolIdentity;
  subjects: Subject[];
  students: Student[];
  grades: Record<string, Record<string, number | null>>; // student_id -> subjectId -> score (0-100 or null)
  descriptions: Record<string, Record<string, string>>; // student_id -> subjectId -> description
  attendance: Record<string, StudentAttendance>; // student_id -> attendance
  notes: Record<string, string>; // student_id -> catatan wali kelas
  extracurriculars: Record<string, StudentExtracurricular[]>; // student_id -> ekskul
  learningObjectives?: Record<string, [string, string, string, string]>; // subjectId -> 4 Kategori Tujuan Pembelajaran
  tpAssessments?: Record<string, Record<string, [TPStatus, TPStatus, TPStatus, TPStatus]>>; // student_id -> subjectId -> [tp1, tp2, tp3, tp4]
  tpScores?: Record<string, Record<string, [number | null, number | null, number | null, number | null]>>; // student_id -> subjectId -> [tp1Score, tp2Score, tp3Score, tp4Score]
  lastBackupTime: string | null;
  lastSavedTime: string | null;
  loginUser: {
    username: string;
    passwordHash: string;
  };
}

export type ActiveTab =
  | 'dashboard'
  | 'students'
  | 'grades'
  | 'recap'
  | 'descriptions'
  | 'attendance'
  | 'extracurricular'
  | 'check-data'
  | 'preview-rapor'
  | 'print-rapor'
  | 'import-export'
  | 'backup'
  | 'settings';

export function getPhaseByGrade(grade: number): 'Fase A' | 'Fase B' | 'Fase C' {
  if (grade <= 2) return 'Fase A';
  if (grade <= 4) return 'Fase B';
  return 'Fase C';
}

export function getDefaultSubjects(grade: number): Subject[] {
  // Kurikulum Merdeka:
  // Kelas 1 & 2 (Fase A) tidak memiliki IPAS secara mandiri
  // Kelas 3, 4, 5, 6 (Fase B & C) memiliki IPAS
  const subjects: Subject[] = [
    { id: 'agama', name: 'Pendidikan Agama dan Budi Pekerti', shortName: 'Agama', order: 1 },
    { id: 'pancasila', name: 'Pendidikan Pancasila', shortName: 'Pancasila', order: 2 },
    { id: 'bindo', name: 'Bahasa Indonesia', shortName: 'B. Indo', order: 3 },
    { id: 'mtk', name: 'Matematika', shortName: 'MTK', order: 4 },
  ];

  if (grade >= 3) {
    subjects.push({ id: 'ipas', name: 'Ilmu Pengetahuan Alam dan Sosial (IPAS)', shortName: 'IPAS', order: 5 });
  }

  subjects.push(
    { id: 'pjok', name: 'Pendidikan Jasmani, Olahraga, dan Kesehatan', shortName: 'PJOK', order: 6 },
    { id: 'seni', name: 'Seni dan Budaya (Seni Rupa/Musik/Tari)', shortName: 'Seni', order: 7 },
    { id: 'bing', name: 'Bahasa Inggris', shortName: 'B. Inggris', order: 8 },
    { id: 'mulok', name: 'Muatan Lokal (Bahasa Daerah)', shortName: 'Mulok', order: 9 }
  );

  return subjects;
}

export function createInitialRombelData(rombelInfo: RombelInfo): RombelData {
  return {
    rombelId: rombelInfo.id,
    identity: {
      namaSekolah: 'SDN BABELAN KOTA 01',
      npsn: '20219135',
      logoUrl: DEFAULT_SCHOOL_LOGO_URL,
      alamatSekolah: 'Jl. Raya Babelan No. 01, Babelan Kota',
      desaKelurahan: 'Babelan Kota',
      kecamatan: 'Kec. Babelan',
      kabupaten: 'Kab. Bekasi',
      provinsi: 'Jawa Barat',
      kodePos: '17610',
      emailSekolah: 'sdnbabelankota01@gmail.com',
      tahunPelajaran: '2026/2027',
      semester: '1 (Ganjil)',
      kelas: rombelInfo.grade.toString(),
      rombel: rombelInfo.name,
      fase: rombelInfo.phase,
      namaGuru: '', // STRICTLY EMPTY
      nipGuru: '', // STRICTLY EMPTY
      namaKepalaSekolah: '', // STRICTLY EMPTY
      nipKepalaSekolah: '', // STRICTLY EMPTY
      tempatTanggalRapor: 'Bekasi, 19 Desember 2026',
    },
    subjects: getDefaultSubjects(rombelInfo.grade),
    students: [], // STRICTLY EMPTY
    grades: {}, // STRICTLY EMPTY
    descriptions: {}, // STRICTLY EMPTY
    attendance: {}, // STRICTLY EMPTY
    notes: {}, // STRICTLY EMPTY
    extracurriculars: {},
    learningObjectives: {},
    tpAssessments: {},
    tpScores: {},
    lastBackupTime: null,
    lastSavedTime: null,
    loginUser: {
      username: `guru${rombelInfo.id.toLowerCase()}`,
      passwordHash: '123456',
    },
  };
}
