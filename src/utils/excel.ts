import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs';
import { RombelData, Student, SchoolIdentity, Subject, TPStatus } from '../types';
import {
  getDefaultTPListForSubject,
  composeNarrativeFromTPs,
  scoreToTPStatus,
  calculateAverageTPScore,
  tpStatusToDefaultScore,
} from './tujuanPembelajaran';

export interface ExcelImportPreview {
  sheetNames: string[];
  studentsFound: number;
  newStudentsCount: number;
  existingStudentsCount: number;
  gradesCount: number;
  descriptionsCount: number;
  teacherNameFound: string;
  headmasterFound: string;
  sampleStudentNames: string[];
  parseErrors: string[];
}

export interface ExcelImportResult {
  updatedData: RombelData;
  preview: ExcelImportPreview;
}

// -------------------------------------------------------------
// STYLING DESIGN SYSTEM FOR EXCEL TEMPLATES (KURIKULUM MERDEKA)
// -------------------------------------------------------------

export const BORDER_THIN: Partial<ExcelJS.Borders> = {
  top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
  left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
  bottom: { style: 'thin', color: { argb: 'FFCBD5E1' } },
  right: { style: 'thin', color: { argb: 'FFCBD5E1' } },
};

export const BORDER_HEADER: Partial<ExcelJS.Borders> = {
  top: { style: 'thin', color: { argb: 'FF94A3B8' } },
  left: { style: 'thin', color: { argb: 'FF94A3B8' } },
  bottom: { style: 'medium', color: { argb: 'FF065F46' } },
  right: { style: 'thin', color: { argb: 'FF94A3B8' } },
};

export const BORDER_SUMMARY: Partial<ExcelJS.Borders> = {
  top: { style: 'thin', color: { argb: 'FF475569' } },
  left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
  bottom: { style: 'double', color: { argb: 'FF0F172A' } },
  right: { style: 'thin', color: { argb: 'FFCBD5E1' } },
};

export const EXCEL_FILLS = {
  emeraldDark: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF065F46' } } as ExcelJS.Fill,
  emeraldMedium: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF047857' } } as ExcelJS.Fill,
  emeraldLight: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFECFDF5' } } as ExcelJS.Fill,
  navy: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } } as ExcelJS.Fill,
  slateDark: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } } as ExcelJS.Fill,
  slateSubtle: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } } as ExcelJS.Fill,
  amberHeader: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFB45309' } } as ExcelJS.Fill,
  amberLight: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF3C7' } } as ExcelJS.Fill,
  indigoHeader: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF3730A3' } } as ExcelJS.Fill,
  indigoLight: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEEF2FF' } } as ExcelJS.Fill,
  purpleDark: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF581C87' } } as ExcelJS.Fill,
  purpleMedium: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF7E22CE' } } as ExcelJS.Fill,
  purpleLight: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5F3FF' } } as ExcelJS.Fill,
  tealHeader: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F766E' } } as ExcelJS.Fill,
  blueHeader: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E40AF' } } as ExcelJS.Fill,
  blueLight: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0F2FE' } } as ExcelJS.Fill,
  roseLight: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFE4E6' } } as ExcelJS.Fill,
  rowWhite: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } } as ExcelJS.Fill,
  rowZebra: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } } as ExcelJS.Fill,
};

export const EXCEL_FONTS = {
  headerWhite: { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFFFF' } } as Partial<ExcelJS.Font>,
  bodyRegular: { name: 'Arial', size: 9.5, color: { argb: 'FF1E293B' } } as Partial<ExcelJS.Font>,
  bodyBold: { name: 'Arial', size: 9.5, bold: true, color: { argb: 'FF0F172A' } } as Partial<ExcelJS.Font>,
  titleBanner: { name: 'Arial', size: 13, bold: true, color: { argb: 'FFFFFFFF' } } as Partial<ExcelJS.Font>,
  subtitle: { name: 'Arial', size: 9.5, italic: true, color: { argb: 'FF065F46' } } as Partial<ExcelJS.Font>,
};

/**
 * Downloads an ExcelJS workbook file directly to the browser
 */
export async function downloadExcelJSWorkbook(workbook: ExcelJS.Workbook, filename: string): Promise<void> {
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, 200);
}

/**
 * Builds the official 6-sheet Rapor Kurikulum Merdeka workbook with professional colors, borders, and typography.
 */
export function buildStyledRaporWorkbook(data: RombelData, isTemplate: boolean = false): ExcelJS.Workbook {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Rapor Kurikulum Merdeka - SDN Babelan Kota 01';
  wb.lastModifiedBy = data.identity.namaGuru || 'Guru Kelas';
  wb.created = new Date();
  wb.modified = new Date();

  const subjects = data.subjects;

  // -------------------------------------------------------------
  // SHEET 1: IDENTITAS
  // -------------------------------------------------------------
  const ws1 = wb.addWorksheet('IDENTITAS', {
    views: [{ showGridLines: true }],
  });
  ws1.columns = [
    { width: 28 },
    { width: 55 },
  ];

  // Header Row
  const row1Header = ws1.addRow(['PARAMETER IDENTITAS', 'NILAI DATA (KETERANGAN)']);
  row1Header.height = 30;
  row1Header.getCell(1).fill = EXCEL_FILLS.emeraldDark;
  row1Header.getCell(1).font = EXCEL_FONTS.headerWhite;
  row1Header.getCell(1).alignment = { vertical: 'middle', horizontal: 'center' };
  row1Header.getCell(1).border = BORDER_HEADER;

  row1Header.getCell(2).fill = EXCEL_FILLS.emeraldMedium;
  row1Header.getCell(2).font = EXCEL_FONTS.headerWhite;
  row1Header.getCell(2).alignment = { vertical: 'middle', horizontal: 'center' };
  row1Header.getCell(2).border = BORDER_HEADER;

  const identitasRows: [string, string][] = [
    ['Nama Sekolah', data.identity.namaSekolah || 'SDN BABELAN KOTA 01'],
    ['NPSN', data.identity.npsn || '20219135'],
    ['Logo URL', data.identity.logoUrl || 'https://i.ibb.co.com/gb2y0gwD/logo-bakot-01.png'],
    ['Alamat Sekolah', data.identity.alamatSekolah || ''],
    ['Tahun Pelajaran', data.identity.tahunPelajaran || '2026/2027'],
    ['Semester', data.identity.semester || '1 (Ganjil)'],
    ['Kelas', data.identity.kelas || ''],
    ['Rombel', data.identity.rombel || ''],
    ['Fase', data.identity.fase || ''],
    ['Nama Guru', isTemplate ? '' : (data.identity.namaGuru || '')],
    ['NIP Guru', isTemplate ? '' : (data.identity.nipGuru || '')],
    ['Nama Kepala Sekolah', isTemplate ? '' : (data.identity.namaKepalaSekolah || '')],
    ['NIP Kepala Sekolah', isTemplate ? '' : (data.identity.nipKepalaSekolah || '')],
    ['Tempat Tanggal Rapor', data.identity.tempatTanggalRapor || 'Bekasi, 19 Desember 2026'],
  ];

  identitasRows.forEach(([param, val], idx) => {
    const r = ws1.addRow([param, val]);
    r.height = 23;
    r.getCell(1).fill = EXCEL_FILLS.slateSubtle;
    r.getCell(1).font = EXCEL_FONTS.bodyBold;
    r.getCell(1).alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
    r.getCell(1).border = BORDER_THIN;

    r.getCell(2).fill = idx % 2 === 0 ? EXCEL_FILLS.rowWhite : EXCEL_FILLS.rowZebra;
    r.getCell(2).font = EXCEL_FONTS.bodyRegular;
    r.getCell(2).alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
    r.getCell(2).border = BORDER_THIN;
  });

  // -------------------------------------------------------------
  // SHEET 2: DATA SISWA
  // -------------------------------------------------------------
  const ws2 = wb.addWorksheet('DATA SISWA', {
    views: [{ state: 'frozen', ySplit: 1, showGridLines: true }],
  });

  const colWidthsSiswa = [6, 22, 14, 16, 30, 14, 18, 14, 20, 24, 20, 32, 18, 18, 18, 18];
  ws2.columns = colWidthsSiswa.map((w) => ({ width: w }));

  const siswaHeaders = [
    'No',
    'Student ID (Sistem)',
    'NIS',
    'NISN',
    'Nama Siswa',
    'Jenis Kelamin',
    'Tempat Lahir',
    'Tanggal Lahir',
    'NIK',
    'Nama Orang Tua/Wali',
    'Nomor KK',
    'Alamat',
    'Desa/Kelurahan',
    'Kecamatan',
    'Kabupaten',
    'Provinsi',
  ];

  const headerRow2 = ws2.addRow(siswaHeaders);
  headerRow2.height = 32;
  siswaHeaders.forEach((_, colIdx) => {
    const cell = headerRow2.getCell(colIdx + 1);
    cell.font = EXCEL_FONTS.headerWhite;
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = BORDER_HEADER;
    if (colIdx < 5) {
      cell.fill = EXCEL_FILLS.navy;
    } else if (colIdx < 9) {
      cell.fill = EXCEL_FILLS.emeraldDark;
    } else {
      cell.fill = EXCEL_FILLS.blueHeader;
    }
  });

  if (!isTemplate) {
    data.students.forEach((s, idx) => {
      const row = ws2.addRow([
        idx + 1,
        s.student_id,
        s.nis || '',
        s.nisn || '',
        s.nama || '',
        s.jenisKelamin || '',
        s.tempatLahir || '',
        s.tanggalLahir || '',
        s.nik || '',
        s.namaOrtu || '',
        s.nomorKK || '',
        s.alamat || '',
        s.desaKelurahan || '',
        s.kecamatan || '',
        s.kabupaten || '',
        s.provinsi || '',
      ]);
      row.height = 22;
      const rowFill = idx % 2 === 0 ? EXCEL_FILLS.rowWhite : EXCEL_FILLS.rowZebra;

      for (let c = 1; c <= 16; c++) {
        const cell = row.getCell(c);
        cell.fill = rowFill;
        cell.border = BORDER_THIN;
        cell.font = c === 5 ? EXCEL_FONTS.bodyBold : EXCEL_FONTS.bodyRegular;
        // Alignments
        if ([1, 2, 3, 4, 6, 8, 9, 11].includes(c)) {
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        } else {
          cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
        }
      }
    });
  }

  // -------------------------------------------------------------
  // SHEET 3: NILAI RAPOR
  // -------------------------------------------------------------
  const ws3 = wb.addWorksheet('NILAI RAPOR', {
    views: [{ state: 'frozen', ySplit: 1, showGridLines: true }],
  });

  const nilaiColWidths = [6, 22, 16, 30, ...subjects.map(() => 22)];
  ws3.columns = nilaiColWidths.map((w) => ({ width: w }));

  const nilaiHeaders = [
    'No',
    'Student ID',
    'NISN',
    'Nama Siswa',
    ...subjects.map((sub) => `${sub.name} [ID:${sub.id}]`),
  ];

  const headerRow3 = ws3.addRow(nilaiHeaders);
  headerRow3.height = 32;
  nilaiHeaders.forEach((_, colIdx) => {
    const cell = headerRow3.getCell(colIdx + 1);
    cell.font = EXCEL_FONTS.headerWhite;
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = BORDER_HEADER;
    cell.fill = colIdx < 4 ? EXCEL_FILLS.navy : EXCEL_FILLS.emeraldMedium;
  });

  if (!isTemplate) {
    data.students.forEach((s, idx) => {
      const studentGrades = data.grades[s.student_id] || {};
      const subjectScores = subjects.map((sub) => {
        const score = studentGrades[sub.id];
        return score !== null && score !== undefined && !isNaN(score) ? score : '';
      });

      const row = ws3.addRow([idx + 1, s.student_id, s.nisn || '', s.nama || '', ...subjectScores]);
      row.height = 22;
      const rowFill = idx % 2 === 0 ? EXCEL_FILLS.rowWhite : EXCEL_FILLS.rowZebra;

      for (let c = 1; c <= nilaiHeaders.length; c++) {
        const cell = row.getCell(c);
        cell.fill = rowFill;
        cell.border = BORDER_THIN;
        if (c <= 3) {
          cell.font = EXCEL_FONTS.bodyRegular;
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        } else if (c === 4) {
          cell.font = EXCEL_FONTS.bodyBold;
          cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
        } else {
          cell.font = EXCEL_FONTS.bodyBold;
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        }
      }
    });
  }

  // -------------------------------------------------------------
  // SHEET 4: DESKRIPSI
  // -------------------------------------------------------------
  const ws4 = wb.addWorksheet('DESKRIPSI', {
    views: [{ state: 'frozen', ySplit: 1, showGridLines: true }],
  });

  const descColWidths = [6, 22, 16, 30, ...subjects.map(() => 50)];
  ws4.columns = descColWidths.map((w) => ({ width: w }));

  const deskripsiHeaders = [
    'No',
    'Student ID',
    'NISN',
    'Nama Siswa',
    ...subjects.map((sub) => `Deskripsi ${sub.name} [ID:${sub.id}]`),
  ];

  const headerRow4 = ws4.addRow(deskripsiHeaders);
  headerRow4.height = 32;
  deskripsiHeaders.forEach((_, colIdx) => {
    const cell = headerRow4.getCell(colIdx + 1);
    cell.font = EXCEL_FONTS.headerWhite;
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = BORDER_HEADER;
    cell.fill = colIdx < 4 ? EXCEL_FILLS.navy : EXCEL_FILLS.indigoHeader;
  });

  if (!isTemplate) {
    data.students.forEach((s, idx) => {
      const studentDesc = data.descriptions[s.student_id] || {};
      const subjectDescs = subjects.map((sub) => studentDesc[sub.id] || '');

      const row = ws4.addRow([idx + 1, s.student_id, s.nisn || '', s.nama || '', ...subjectDescs]);
      row.height = 50;
      const rowFill = idx % 2 === 0 ? EXCEL_FILLS.rowWhite : EXCEL_FILLS.rowZebra;

      for (let c = 1; c <= deskripsiHeaders.length; c++) {
        const cell = row.getCell(c);
        cell.fill = rowFill;
        cell.border = BORDER_THIN;
        if (c <= 3) {
          cell.font = EXCEL_FONTS.bodyRegular;
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        } else if (c === 4) {
          cell.font = EXCEL_FONTS.bodyBold;
          cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
        } else {
          cell.font = EXCEL_FONTS.bodyRegular;
          cell.alignment = { vertical: 'top', horizontal: 'left', wrapText: true };
        }
      }
    });
  }

  // -------------------------------------------------------------
  // SHEET 5: REKAP NILAI
  // -------------------------------------------------------------
  const ws5 = wb.addWorksheet('REKAP NILAI', {
    views: [{ state: 'frozen', ySplit: 1, showGridLines: true }],
  });

  const rekapHeaders = [
    'No',
    'Student ID',
    'NISN',
    'Nama Siswa',
    ...subjects.map((sub) => sub.shortName || sub.name),
    'Rata-Rata',
    'Tertinggi',
    'Terendah',
    'Sakit',
    'Izin',
    'Alpa',
    'Catatan Wali Kelas',
  ];

  const rekapColWidths = [
    6, 22, 16, 30,
    ...subjects.map(() => 14),
    14, 14, 14,
    10, 10, 10,
    45,
  ];
  ws5.columns = rekapColWidths.map((w) => ({ width: w }));

  const headerRow5 = ws5.addRow(rekapHeaders);
  headerRow5.height = 32;

  const subjectStartCol = 5;
  const subjectEndCol = 4 + subjects.length;
  const avgCol = subjectEndCol + 1;
  const maxCol = subjectEndCol + 2;
  const minCol = subjectEndCol + 3;
  const sakitCol = subjectEndCol + 4;
  const izinCol = subjectEndCol + 5;
  const alpaCol = subjectEndCol + 6;
  const noteCol = subjectEndCol + 7;

  rekapHeaders.forEach((_, colIdx) => {
    const c = colIdx + 1;
    const cell = headerRow5.getCell(c);
    cell.font = EXCEL_FONTS.headerWhite;
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = BORDER_HEADER;

    if (c <= 4) {
      cell.fill = EXCEL_FILLS.navy;
    } else if (c >= subjectStartCol && c <= subjectEndCol) {
      cell.fill = EXCEL_FILLS.emeraldMedium;
    } else if (c >= avgCol && c <= minCol) {
      cell.fill = EXCEL_FILLS.blueHeader;
    } else if (c >= sakitCol && c <= alpaCol) {
      cell.fill = EXCEL_FILLS.amberHeader;
    } else {
      cell.fill = EXCEL_FILLS.emeraldDark;
    }
  });

  if (!isTemplate) {
    const allAverages: number[] = [];

    data.students.forEach((s, idx) => {
      const studentGrades = data.grades[s.student_id] || {};
      const validScores: number[] = [];
      const subjectScores = subjects.map((sub) => {
        const sc = studentGrades[sub.id];
        if (sc !== null && sc !== undefined && !isNaN(sc)) {
          validScores.push(sc);
          return sc;
        }
        return '';
      });

      const avg =
        validScores.length > 0
          ? Number((validScores.reduce((a, b) => a + b, 0) / validScores.length).toFixed(1))
          : '';
      if (typeof avg === 'number') allAverages.push(avg);

      const max = validScores.length > 0 ? Math.max(...validScores) : '';
      const min = validScores.length > 0 ? Math.min(...validScores) : '';

      const att = data.attendance[s.student_id] || { sakit: null, izin: null, alpa: null };
      const note = data.notes[s.student_id] || '';

      const row = ws5.addRow([
        idx + 1,
        s.student_id,
        s.nisn || '',
        s.nama || '',
        ...subjectScores,
        avg,
        max,
        min,
        att.sakit ?? '',
        att.izin ?? '',
        att.alpa ?? '',
        note,
      ]);
      row.height = 24;
      const rowFill = idx % 2 === 0 ? EXCEL_FILLS.rowWhite : EXCEL_FILLS.rowZebra;

      for (let c = 1; c <= rekapHeaders.length; c++) {
        const cell = row.getCell(c);
        cell.fill = rowFill;
        cell.border = BORDER_THIN;
        if (c <= 3) {
          cell.font = EXCEL_FONTS.bodyRegular;
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        } else if (c === 4) {
          cell.font = EXCEL_FONTS.bodyBold;
          cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
        } else if (c === noteCol) {
          cell.font = EXCEL_FONTS.bodyRegular;
          cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
        } else {
          cell.font = EXCEL_FONTS.bodyBold;
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        }
      }
    });

    // Summary Statistics Row
    if (allAverages.length > 0) {
      const grandAvg = (allAverages.reduce((a, b) => a + b, 0) / allAverages.length).toFixed(1);
      const grandMax = Math.max(...allAverages);
      const grandMin = Math.min(...allAverages);

      const sumRow = ws5.addRow([
        '',
        '',
        '',
        'RATA-RATA KELAS',
        ...subjects.map(() => ''),
        grandAvg,
        grandMax,
        grandMin,
        '',
        '',
        '',
        '',
      ]);
      sumRow.height = 26;
      for (let c = 1; c <= rekapHeaders.length; c++) {
        const cell = sumRow.getCell(c);
        cell.fill = EXCEL_FILLS.amberLight;
        cell.font = EXCEL_FONTS.bodyBold;
        cell.border = BORDER_SUMMARY;
        if (c === 4) {
          cell.alignment = { vertical: 'middle', horizontal: 'right', indent: 1 };
        } else {
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        }
      }
    }
  }

  // -------------------------------------------------------------
  // SHEET 6: CETAK RAPOR
  // -------------------------------------------------------------
  const ws6 = wb.addWorksheet('CETAK RAPOR', {
    views: [{ showGridLines: true }],
  });
  ws6.columns = [{ width: 6 }, { width: 18 }, { width: 34 }, { width: 28 }, { width: 32 }];

  // Banner
  const titleRow = ws6.addRow(['LEMBAR REKAPITULASI CETAK RAPOR KURIKULUM MERDEKA', '', '', '', '']);
  titleRow.height = 34;
  ws6.mergeCells('A1:E1');
  const titleCell = ws6.getCell('A1');
  titleCell.fill = EXCEL_FILLS.emeraldDark;
  titleCell.font = EXCEL_FONTS.titleBanner;
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
  titleCell.border = BORDER_HEADER;

  // Metadata block
  const metaItems = [
    ['Satuan Pendidikan:', data.identity.namaSekolah || 'SDN BABELAN KOTA 01'],
    ['Kelas / Rombel:', `${data.identity.kelas || ''} / ${data.identity.rombel || ''}`],
    ['Fase:', data.identity.fase || ''],
    ['Tahun Pelajaran / Semester:', `${data.identity.tahunPelajaran || '2026/2027'} / ${data.identity.semester || '1'}`],
  ];

  metaItems.forEach(([label, val]) => {
    const r = ws6.addRow([label, val, '', '', '']);
    r.height = 21;
    r.getCell(1).font = EXCEL_FONTS.bodyBold;
    r.getCell(1).alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
    r.getCell(2).font = EXCEL_FONTS.bodyRegular;
    r.getCell(2).alignment = { vertical: 'middle', horizontal: 'left' };
  });

  ws6.addRow(['', '', '', '', '']).height = 10;

  // Table header
  const tableHeaderRow = ws6.addRow([
    'No',
    'NISN',
    'Nama Siswa',
    'Status Kelengkapan Nilai',
    'Keterangan Rapor',
  ]);
  tableHeaderRow.height = 28;
  for (let c = 1; c <= 5; c++) {
    const cell = tableHeaderRow.getCell(c);
    cell.fill = EXCEL_FILLS.navy;
    cell.font = EXCEL_FONTS.headerWhite;
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border = BORDER_HEADER;
  }

  if (!isTemplate) {
    data.students.forEach((s, idx) => {
      const studentGrades = data.grades[s.student_id] || {};
      const filledCount = subjects.filter(
        (sub) => studentGrades[sub.id] !== null && studentGrades[sub.id] !== undefined
      ).length;
      const status =
        filledCount === subjects.length
          ? 'LENGKAP (Siap Cetak)'
          : filledCount > 0
          ? `Sebagian (${filledCount}/${subjects.length} Mapel)`
          : 'BELUM ADA NILAI';

      const r = ws6.addRow([
        idx + 1,
        s.nisn || '-',
        s.nama || '-',
        status,
        'Rapor Standar Kurikulum Merdeka A4',
      ]);
      r.height = 22;
      const rowFill = idx % 2 === 0 ? EXCEL_FILLS.rowWhite : EXCEL_FILLS.rowZebra;

      for (let c = 1; c <= 5; c++) {
        const cell = r.getCell(c);
        cell.fill = rowFill;
        cell.border = BORDER_THIN;
        if (c === 1 || c === 2) {
          cell.font = EXCEL_FONTS.bodyRegular;
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        } else if (c === 3) {
          cell.font = EXCEL_FONTS.bodyBold;
          cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
        } else if (c === 4) {
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
          if (status.includes('LENGKAP')) {
            cell.fill = EXCEL_FILLS.emeraldLight;
            cell.font = { name: 'Arial', size: 9.5, bold: true, color: { argb: 'FF065F46' } };
          } else if (status.includes('Sebagian')) {
            cell.fill = EXCEL_FILLS.amberLight;
            cell.font = { name: 'Arial', size: 9.5, bold: true, color: { argb: 'FF92400E' } };
          } else {
            cell.fill = EXCEL_FILLS.roseLight;
            cell.font = { name: 'Arial', size: 9.5, bold: true, color: { argb: 'FF9F1239' } };
          }
        } else {
          cell.font = EXCEL_FONTS.bodyRegular;
          cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
        }
      }
    });
  }

  return wb;
}

/**
 * Creates a SheetJS workbook for backward-compatibility if needed
 */
export function createRaporWorkbook(data: RombelData, isTemplate: boolean = false): XLSX.WorkBook {
  const wb = XLSX.utils.book_new();

  // SHEET 1: IDENTITAS
  const identitasData = [
    ['PARAMETER IDENTITAS', 'NILAI DATA'],
    ['Nama Sekolah', data.identity.namaSekolah || 'SDN BABELAN KOTA 01'],
    ['NPSN', data.identity.npsn || '20219135'],
    ['Logo URL', data.identity.logoUrl || 'https://i.ibb.co.com/gb2y0gwD/logo-bakot-01.png'],
    ['Alamat Sekolah', data.identity.alamatSekolah || ''],
    ['Tahun Pelajaran', data.identity.tahunPelajaran || '2026/2027'],
    ['Semester', data.identity.semester || '1 (Ganjil)'],
    ['Kelas', data.identity.kelas || ''],
    ['Rombel', data.identity.rombel || ''],
    ['Fase', data.identity.fase || ''],
    ['Nama Guru', isTemplate ? '' : (data.identity.namaGuru || '')],
    ['NIP Guru', isTemplate ? '' : (data.identity.nipGuru || '')],
    ['Nama Kepala Sekolah', isTemplate ? '' : (data.identity.namaKepalaSekolah || '')],
    ['NIP Kepala Sekolah', isTemplate ? '' : (data.identity.nipKepalaSekolah || '')],
    ['Tempat Tanggal Rapor', data.identity.tempatTanggalRapor || 'Bekasi, 19 Desember 2026'],
  ];
  const wsIdentitas = XLSX.utils.aoa_to_sheet(identitasData);
  wsIdentitas['!cols'] = [{ wch: 24 }, { wch: 45 }];
  XLSX.utils.book_append_sheet(wb, wsIdentitas, 'IDENTITAS');

  // SHEET 2: DATA SISWA
  const siswaHeaders = [
    'No',
    'Student ID (Sistem)',
    'NIS',
    'NISN',
    'Nama Siswa',
    'Jenis Kelamin',
    'Tempat Lahir',
    'Tanggal Lahir',
    'NIK',
    'Nama Orang Tua/Wali',
    'Nomor KK',
    'Alamat',
    'Desa/Kelurahan',
    'Kecamatan',
    'Kabupaten',
    'Provinsi',
  ];

  const siswaRows = isTemplate
    ? []
    : data.students.map((s, idx) => [
        idx + 1,
        s.student_id,
        s.nis || '',
        s.nisn || '',
        s.nama || '',
        s.jenisKelamin || '',
        s.tempatLahir || '',
        s.tanggalLahir || '',
        s.nik || '',
        s.namaOrtu || '',
        s.nomorKK || '',
        s.alamat || '',
        s.desaKelurahan || '',
        s.kecamatan || '',
        s.kabupaten || '',
        s.provinsi || '',
      ]);

  const wsSiswa = XLSX.utils.aoa_to_sheet([siswaHeaders, ...siswaRows]);
  wsSiswa['!cols'] = [
    { wch: 6 },
    { wch: 22 },
    { wch: 12 },
    { wch: 16 },
    { wch: 28 },
    { wch: 14 },
    { wch: 18 },
    { wch: 14 },
    { wch: 20 },
    { wch: 24 },
    { wch: 20 },
    { wch: 30 },
    { wch: 18 },
    { wch: 18 },
    { wch: 18 },
    { wch: 16 },
  ];
  XLSX.utils.book_append_sheet(wb, wsSiswa, 'DATA SISWA');

  // SHEET 3: NILAI RAPOR
  const subjects = data.subjects;
  const nilaiHeaders = [
    'No',
    'Student ID',
    'NISN',
    'Nama Siswa',
    ...subjects.map((sub) => `${sub.name} [ID:${sub.id}]`),
  ];

  const nilaiRows = isTemplate
    ? []
    : data.students.map((s, idx) => {
        const studentGrades = data.grades[s.student_id] || {};
        const subjectScores = subjects.map((sub) => {
          const score = studentGrades[sub.id];
          return score !== null && score !== undefined ? score : '';
        });
        return [idx + 1, s.student_id, s.nisn || '', s.nama || '', ...subjectScores];
      });

  const wsNilai = XLSX.utils.aoa_to_sheet([nilaiHeaders, ...nilaiRows]);
  wsNilai['!cols'] = [
    { wch: 6 },
    { wch: 20 },
    { wch: 16 },
    { wch: 28 },
    ...subjects.map(() => ({ wch: 18 })),
  ];
  XLSX.utils.book_append_sheet(wb, wsNilai, 'NILAI RAPOR');

  // SHEET 4: DESKRIPSI
  const deskripsiHeaders = [
    'No',
    'Student ID',
    'NISN',
    'Nama Siswa',
    ...subjects.map((sub) => `Deskripsi ${sub.name} [ID:${sub.id}]`),
  ];

  const deskripsiRows = isTemplate
    ? []
    : data.students.map((s, idx) => {
        const studentDesc = data.descriptions[s.student_id] || {};
        const subjectDescs = subjects.map((sub) => studentDesc[sub.id] || '');
        return [idx + 1, s.student_id, s.nisn || '', s.nama || '', ...subjectDescs];
      });

  const wsDeskripsi = XLSX.utils.aoa_to_sheet([deskripsiHeaders, ...deskripsiRows]);
  wsDeskripsi['!cols'] = [
    { wch: 6 },
    { wch: 20 },
    { wch: 16 },
    { wch: 28 },
    ...subjects.map(() => ({ wch: 45 })),
  ];
  XLSX.utils.book_append_sheet(wb, wsDeskripsi, 'DESKRIPSI');

  // SHEET 5: REKAP NILAI
  const rekapHeaders = [
    'No',
    'Student ID',
    'NISN',
    'Nama Siswa',
    ...subjects.map((sub) => sub.shortName || sub.name),
    'Rata-Rata',
    'Tertinggi',
    'Terendah',
    'Sakit',
    'Izin',
    'Alpa',
    'Catatan Wali Kelas',
  ];

  const rekapRows = isTemplate
    ? []
    : data.students.map((s, idx) => {
        const studentGrades = data.grades[s.student_id] || {};
        const validScores: number[] = [];
        const subjectScores = subjects.map((sub) => {
          const sc = studentGrades[sub.id];
          if (sc !== null && sc !== undefined && !isNaN(sc)) {
            validScores.push(sc);
            return sc;
          }
          return '';
        });

        const avg =
          validScores.length > 0
            ? Number((validScores.reduce((a, b) => a + b, 0) / validScores.length).toFixed(1))
            : '';
        const max = validScores.length > 0 ? Math.max(...validScores) : '';
        const min = validScores.length > 0 ? Math.min(...validScores) : '';

        const att = data.attendance[s.student_id] || { sakit: null, izin: null, alpa: null };
        const note = data.notes[s.student_id] || '';

        return [
          idx + 1,
          s.student_id,
          s.nisn || '',
          s.nama || '',
          ...subjectScores,
          avg,
          max,
          min,
          att.sakit ?? '',
          att.izin ?? '',
          att.alpa ?? '',
          note,
        ];
      });

  const wsRekap = XLSX.utils.aoa_to_sheet([rekapHeaders, ...rekapRows]);
  wsRekap['!cols'] = [
    { wch: 6 },
    { wch: 20 },
    { wch: 16 },
    { wch: 28 },
    ...subjects.map(() => ({ wch: 12 })),
    { wch: 12 },
    { wch: 12 },
    { wch: 12 },
    { wch: 8 },
    { wch: 8 },
    { wch: 8 },
    { wch: 40 },
  ];
  XLSX.utils.book_append_sheet(wb, wsRekap, 'REKAP NILAI');

  // SHEET 6: CETAK RAPOR
  const cetakData: (string | number)[][] = [
    ['LEMBAR REKAPITULASI CETAK RAPOR KURIKULUM MERDEKA'],
    ['Satuan Pendidikan:', data.identity.namaSekolah],
    ['Kelas/Rombel:', `${data.identity.kelas} / ${data.identity.rombel}`],
    ['Fase:', data.identity.fase],
    ['Tahun Pelajaran / Semester:', `${data.identity.tahunPelajaran} / ${data.identity.semester}`],
    [''],
    ['No', 'NISN', 'Nama Siswa', 'Status Kelengkapan Nilai', 'Catatan Status Rapor'],
  ];

  if (!isTemplate) {
    data.students.forEach((s, idx) => {
      const studentGrades = data.grades[s.student_id] || {};
      const filledCount = subjects.filter((sub) => studentGrades[sub.id] !== null && studentGrades[sub.id] !== undefined).length;
      const status =
        filledCount === subjects.length
          ? 'LENGKAP (Siap Cetak)'
          : filledCount > 0
          ? `Sebagian (${filledCount}/${subjects.length} Mapel)`
          : 'BELUM ADA NILAI';
      cetakData.push([idx + 1, s.nisn || '-', s.nama || '-', status, 'Rapor Kurikulum Merdeka']);
    });
  }

  const wsCetak = XLSX.utils.aoa_to_sheet(cetakData);
  wsCetak['!cols'] = [{ wch: 6 }, { wch: 16 }, { wch: 30 }, { wch: 25 }, { wch: 30 }];
  XLSX.utils.book_append_sheet(wb, wsCetak, 'CETAK RAPOR');

  return wb;
}

export async function exportRaporExcel(data: RombelData, isTemplate: boolean = false): Promise<void> {
  const safeKelas = (data.identity.kelas || 'Kelas').replace(/\s+/g, '_');
  const safeRombel = (data.identity.rombel || data.rombelId).replace(/\s+/g, '_');
  const filename = isTemplate
    ? `Template_Rapor_Kurikulum_Merdeka_${safeKelas}_${safeRombel}_2026-2027.xlsx`
    : `Rapor_Kurikulum_Merdeka_${safeKelas}_${safeRombel}_2026-2027.xlsx`;

  try {
    const wb = buildStyledRaporWorkbook(data, isTemplate);
    await downloadExcelJSWorkbook(wb, filename);
  } catch (err) {
    console.error('Failed to export styled excel with ExcelJS, falling back to basic xlsx:', err);
    const fallbackWb = createRaporWorkbook(data, isTemplate);
    XLSX.writeFile(fallbackWb, filename);
  }
}

export function exportRaporTemplate(data: RombelData): void {
  exportRaporExcel(data, true);
}

/**
 * Parses Excel workbook from file input and prepares a preview + updated RombelData
 */
export async function parseRaporExcel(
  file: File,
  currentData: RombelData
): Promise<{ workbook: XLSX.WorkBook; preview: ExcelImportPreview }> {
  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: 'array' });

  const sheetNames = wb.SheetNames;
  const parseErrors: string[] = [];

  let studentsFound = 0;
  let newStudentsCount = 0;
  let existingStudentsCount = 0;
  let gradesCount = 0;
  let descriptionsCount = 0;
  let teacherNameFound = '';
  let headmasterFound = '';
  const sampleStudentNames: string[] = [];

  // 1. Check IDENTITAS sheet
  const wsIdentitas = wb.Sheets['IDENTITAS'];
  if (wsIdentitas) {
    const identitasRows: any[][] = XLSX.utils.sheet_to_json(wsIdentitas, { header: 1 });
    identitasRows.forEach((row) => {
      if (Array.isArray(row) && row.length >= 2) {
        const key = String(row[0] || '').trim().toLowerCase();
        const val = String(row[1] || '').trim();
        if (key.includes('nama guru') && val) {
          teacherNameFound = val;
        }
        if (key.includes('nama kepala sekolah') && val) {
          headmasterFound = val;
        }
      }
    });
  }

  // 2. Check DATA SISWA sheet
  const wsSiswa = wb.Sheets['DATA SISWA'];
  if (wsSiswa) {
    const rows: any[][] = XLSX.utils.sheet_to_json(wsSiswa, { header: 1 });
    if (rows.length > 1) {
      // row 0 is header
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length === 0) continue;
        const studentId = String(row[1] || '').trim();
        const nisn = String(row[3] || '').trim();
        const nama = String(row[4] || '').trim();

        if (nama) {
          studentsFound++;
          if (sampleStudentNames.length < 5) {
            sampleStudentNames.push(nama);
          }

          const existing = currentData.students.find(
            (s) =>
              (studentId && s.student_id === studentId) ||
              (nisn && s.nisn && s.nisn === nisn) ||
              s.nama.toLowerCase() === nama.toLowerCase()
          );

          if (existing) {
            existingStudentsCount++;
          } else {
            newStudentsCount++;
          }
        }
      }
    }
  } else {
    parseErrors.push('Sheet "DATA SISWA" tidak ditemukan pada file Excel.');
  }

  // 3. Count grades in NILAI RAPOR
  const wsNilai = wb.Sheets['NILAI RAPOR'];
  if (wsNilai) {
    const rows: any[][] = XLSX.utils.sheet_to_json(wsNilai, { header: 1 });
    if (rows.length > 1) {
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length < 5) continue;
        for (let col = 4; col < row.length; col++) {
          const val = row[col];
          if (val !== undefined && val !== null && String(val).trim() !== '' && !isNaN(Number(val))) {
            gradesCount++;
          }
        }
      }
    }
  }

  // 4. Count descriptions in DESKRIPSI
  const wsDeskripsi = wb.Sheets['DESKRIPSI'];
  if (wsDeskripsi) {
    const rows: any[][] = XLSX.utils.sheet_to_json(wsDeskripsi, { header: 1 });
    if (rows.length > 1) {
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length < 5) continue;
        for (let col = 4; col < row.length; col++) {
          const val = row[col];
          if (val !== undefined && val !== null && String(val).trim() !== '') {
            descriptionsCount++;
          }
        }
      }
    }
  }

  return {
    workbook: wb,
    preview: {
      sheetNames,
      studentsFound,
      newStudentsCount,
      existingStudentsCount,
      gradesCount,
      descriptionsCount,
      teacherNameFound,
      headmasterFound,
      sampleStudentNames,
      parseErrors,
    },
  };
}

/**
 * Applies imported Excel data either by merge or full replace
 */
export function applyExcelImport(
  wb: XLSX.WorkBook,
  currentData: RombelData,
  mode: 'merge' | 'replace'
): RombelData {
  const result: RombelData = JSON.parse(JSON.stringify(currentData));

  // 1. Process IDENTITAS sheet
  const wsIdentitas = wb.Sheets['IDENTITAS'];
  if (wsIdentitas) {
    const rows: any[][] = XLSX.utils.sheet_to_json(wsIdentitas, { header: 1 });
    rows.forEach((row) => {
      if (Array.isArray(row) && row.length >= 2) {
        const key = String(row[0] || '').trim().toLowerCase();
        const val = String(row[1] || '').trim();
        if (!val && mode === 'merge') return; // Don't wipe existing with empty

        if (key.includes('nama sekolah') && val) result.identity.namaSekolah = val;
        if (key.includes('npsn') && val) result.identity.npsn = val;
        if (key.includes('alamat sekolah') && val) result.identity.alamatSekolah = val;
        if (key.includes('tahun pelajaran') && val) result.identity.tahunPelajaran = val;
        if (key.includes('semester') && val) result.identity.semester = val;
        if (key.includes('nama guru') && val) result.identity.namaGuru = val;
        if (key.includes('nip guru') && val) result.identity.nipGuru = val;
        if (key.includes('nama kepala sekolah') && val) result.identity.namaKepalaSekolah = val;
        if (key.includes('nip kepala sekolah') && val) result.identity.nipKepalaSekolah = val;
        if (key.includes('tempat tanggal rapor') && val) result.identity.tempatTanggalRapor = val;
      }
    });
  }

  // 2. Process DATA SISWA
  const wsSiswa = wb.Sheets['DATA SISWA'];
  const importedStudents: Student[] = [];
  const idMap = new Map<string, string>(); // oldIdOrNISN -> canonicalStudentId

  if (wsSiswa) {
    const rows: any[][] = XLSX.utils.sheet_to_json(wsSiswa, { header: 1 });
    if (rows.length > 1) {
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length === 0) continue;

        const rawStudentId = String(row[1] || '').trim();
        const nis = String(row[2] || '').trim();
        const nisn = String(row[3] || '').trim();
        const nama = String(row[4] || '').trim();
        if (!nama) continue; // Skip empty rows

        const jenisKelamin = (String(row[5] || '').trim().toUpperCase() === 'P' ? 'P' : 'L') as 'L' | 'P';
        const tempatLahir = String(row[6] || '').trim();
        const tanggalLahir = String(row[7] || '').trim();
        const nik = String(row[8] || '').trim();
        const namaOrtu = String(row[9] || '').trim();
        const nomorKK = String(row[10] || '').trim();
        const alamat = String(row[11] || '').trim();
        const desaKelurahan = String(row[12] || '').trim();
        const kecamatan = String(row[13] || '').trim();
        const kabupaten = String(row[14] || '').trim();
        const provinsi = String(row[15] || '').trim();

        // Check if student exists in current data
        let existing = currentData.students.find(
          (s) =>
            (rawStudentId && s.student_id === rawStudentId) ||
            (nisn && s.nisn && s.nisn === nisn) ||
            s.nama.toLowerCase() === nama.toLowerCase()
        );

        const studentId = existing?.student_id || rawStudentId || `std_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

        if (rawStudentId) idMap.set(rawStudentId, studentId);
        if (nisn) idMap.set(nisn, studentId);
        idMap.set(nama.toLowerCase(), studentId);

        const studentObj: Student = {
          student_id: studentId,
          nis: nis || (mode === 'merge' ? existing?.nis || '' : ''),
          nisn: nisn || (mode === 'merge' ? existing?.nisn || '' : ''),
          nama: nama,
          jenisKelamin: jenisKelamin || (mode === 'merge' ? existing?.jenisKelamin || 'L' : 'L'),
          tempatLahir: tempatLahir || (mode === 'merge' ? existing?.tempatLahir || '' : ''),
          tanggalLahir: tanggalLahir || (mode === 'merge' ? existing?.tanggalLahir || '' : ''),
          nik: nik || (mode === 'merge' ? existing?.nik || '' : ''),
          namaOrtu: namaOrtu || (mode === 'merge' ? existing?.namaOrtu || '' : ''),
          nomorKK: nomorKK || (mode === 'merge' ? existing?.nomorKK || '' : ''),
          alamat: alamat || (mode === 'merge' ? existing?.alamat || '' : ''),
          desaKelurahan: desaKelurahan || (mode === 'merge' ? existing?.desaKelurahan || '' : ''),
          kecamatan: kecamatan || (mode === 'merge' ? existing?.kecamatan || '' : ''),
          kabupaten: kabupaten || (mode === 'merge' ? existing?.kabupaten || '' : ''),
          provinsi: provinsi || (mode === 'merge' ? existing?.provinsi || '' : ''),
        };

        importedStudents.push(studentObj);
      }
    }
  }

  if (mode === 'replace') {
    result.students = importedStudents;
    result.grades = {};
    result.descriptions = {};
    result.attendance = {};
    result.notes = {};
  } else {
    // Mode MERGE: combine without duplicates
    importedStudents.forEach((newStd) => {
      const idx = result.students.findIndex((s) => s.student_id === newStd.student_id);
      if (idx >= 0) {
        result.students[idx] = { ...result.students[idx], ...newStd };
      } else {
        result.students.push(newStd);
      }
    });
  }

  // Helper to extract Subject ID from header column
  // e.g. "Pendidikan Pancasila [ID:pancasila]" or "Pendidikan Pancasila"
  const getSubjectIdFromHeader = (header: string, subjects: Subject[]): string | null => {
    const idMatch = header.match(/\[ID:([^\]]+)\]/i);
    if (idMatch && idMatch[1]) {
      return idMatch[1].trim();
    }
    const cleanHeader = header.replace(/deskripsi/i, '').trim().toLowerCase();
    const found = subjects.find(
      (s) =>
        s.name.toLowerCase() === cleanHeader ||
        s.shortName.toLowerCase() === cleanHeader ||
        cleanHeader.includes(s.shortName.toLowerCase()) ||
        cleanHeader.includes(s.id.toLowerCase())
    );
    return found ? found.id : null;
  };

  // 3. Process NILAI RAPOR
  const wsNilai = wb.Sheets['NILAI RAPOR'];
  if (wsNilai) {
    const rows: any[][] = XLSX.utils.sheet_to_json(wsNilai, { header: 1 });
    if (rows.length > 1) {
      const headers = rows[0] as string[];
      const colToSubjectMap: { col: number; subjectId: string }[] = [];

      for (let col = 4; col < headers.length; col++) {
        const headerText = String(headers[col] || '');
        const subjectId = getSubjectIdFromHeader(headerText, result.subjects);
        if (subjectId) {
          colToSubjectMap.push({ col, subjectId });
        }
      }

      for (let r = 1; r < rows.length; r++) {
        const row = rows[r];
        if (!row) continue;
        const rawStudentId = String(row[1] || '').trim();
        const nisn = String(row[2] || '').trim();
        const nama = String(row[3] || '').trim().toLowerCase();

        const studentId =
          idMap.get(rawStudentId) ||
          idMap.get(nisn) ||
          idMap.get(nama) ||
          result.students.find((s) => s.nama.toLowerCase() === nama)?.student_id;

        if (!studentId) continue;

        if (!result.grades[studentId]) {
          result.grades[studentId] = {};
        }

        colToSubjectMap.forEach(({ col, subjectId }) => {
          const rawVal = row[col];
          if (rawVal !== undefined && rawVal !== null && String(rawVal).trim() !== '') {
            const num = Number(rawVal);
            if (!isNaN(num) && num >= 0 && num <= 100) {
              result.grades[studentId][subjectId] = Math.round(num);
            }
          }
        });
      }
    }
  }

  // 4. Process DESKRIPSI
  const wsDeskripsi = wb.Sheets['DESKRIPSI'];
  if (wsDeskripsi) {
    const rows: any[][] = XLSX.utils.sheet_to_json(wsDeskripsi, { header: 1 });
    if (rows.length > 1) {
      const headers = rows[0] as string[];
      const colToSubjectMap: { col: number; subjectId: string }[] = [];

      for (let col = 4; col < headers.length; col++) {
        const headerText = String(headers[col] || '');
        const subjectId = getSubjectIdFromHeader(headerText, result.subjects);
        if (subjectId) {
          colToSubjectMap.push({ col, subjectId });
        }
      }

      for (let r = 1; r < rows.length; r++) {
        const row = rows[r];
        if (!row) continue;
        const rawStudentId = String(row[1] || '').trim();
        const nisn = String(row[2] || '').trim();
        const nama = String(row[3] || '').trim().toLowerCase();

        const studentId =
          idMap.get(rawStudentId) ||
          idMap.get(nisn) ||
          idMap.get(nama) ||
          result.students.find((s) => s.nama.toLowerCase() === nama)?.student_id;

        if (!studentId) continue;

        if (!result.descriptions[studentId]) {
          result.descriptions[studentId] = {};
        }

        colToSubjectMap.forEach(({ col, subjectId }) => {
          const rawVal = String(row[col] || '').trim();
          if (rawVal) {
            result.descriptions[studentId][subjectId] = rawVal;
          }
        });
      }
    }
  }

  // 5. Process Attendance & Notes from REKAP NILAI if present
  const wsRekap = wb.Sheets['REKAP NILAI'];
  if (wsRekap) {
    const rows: any[][] = XLSX.utils.sheet_to_json(wsRekap, { header: 1 });
    if (rows.length > 1) {
      const headers = (rows[0] as string[]).map((h) => String(h).toLowerCase());
      const sakitCol = headers.findIndex((h) => h === 'sakit');
      const izinCol = headers.findIndex((h) => h === 'izin');
      const alpaCol = headers.findIndex((h) => h === 'alpa');
      const catatanCol = headers.findIndex((h) => h.includes('catatan'));

      for (let r = 1; r < rows.length; r++) {
        const row = rows[r];
        if (!row) continue;
        const rawStudentId = String(row[1] || '').trim();
        const nisn = String(row[2] || '').trim();
        const nama = String(row[3] || '').trim().toLowerCase();

        const studentId =
          idMap.get(rawStudentId) ||
          idMap.get(nisn) ||
          idMap.get(nama) ||
          result.students.find((s) => s.nama.toLowerCase() === nama)?.student_id;

        if (!studentId) continue;

        if (!result.attendance[studentId]) {
          result.attendance[studentId] = { sakit: null, izin: null, alpa: null };
        }

        if (sakitCol >= 0 && row[sakitCol] !== undefined && row[sakitCol] !== '') {
          const n = Number(row[sakitCol]);
          if (!isNaN(n)) result.attendance[studentId].sakit = n;
        }
        if (izinCol >= 0 && row[izinCol] !== undefined && row[izinCol] !== '') {
          const n = Number(row[izinCol]);
          if (!isNaN(n)) result.attendance[studentId].izin = n;
        }
        if (alpaCol >= 0 && row[alpaCol] !== undefined && row[alpaCol] !== '') {
          const n = Number(row[alpaCol]);
          if (!isNaN(n)) result.attendance[studentId].alpa = n;
        }

        if (catatanCol >= 0 && row[catatanCol]) {
          result.notes[studentId] = String(row[catatanCol]).trim();
        }
      }
    }
  }

  // 6. Check dedicated KEHADIRAN sheet if present
  const wsKehadiranDedicated = wb.Sheets['KEHADIRAN & CATATAN'] || wb.Sheets['KEHADIRAN'];
  if (wsKehadiranDedicated) {
    const rows: any[][] = XLSX.utils.sheet_to_json(wsKehadiranDedicated, { header: 1 });
    if (rows.length > 1) {
      const headers = (rows[0] as string[]).map((h) => String(h).toLowerCase());
      const sakitCol = headers.findIndex((h) => h.includes('sakit'));
      const izinCol = headers.findIndex((h) => h.includes('izin'));
      const alpaCol = headers.findIndex((h) => h.includes('alpa') || h.includes('tanpa keterangan'));
      const catatanCol = headers.findIndex((h) => h.includes('catatan'));

      for (let r = 1; r < rows.length; r++) {
        const row = rows[r];
        if (!row) continue;
        const rawStudentId = String(row[1] || '').trim();
        const nisn = String(row[2] || '').trim();
        const nama = String(row[3] || '').trim().toLowerCase();

        const studentId =
          idMap.get(rawStudentId) ||
          idMap.get(nisn) ||
          idMap.get(nama) ||
          result.students.find((s) => s.nama.toLowerCase() === nama)?.student_id;

        if (!studentId) continue;

        if (!result.attendance[studentId]) {
          result.attendance[studentId] = { sakit: null, izin: null, alpa: null };
        }

        if (sakitCol >= 0 && row[sakitCol] !== undefined && row[sakitCol] !== '') {
          const n = Number(row[sakitCol]);
          if (!isNaN(n)) result.attendance[studentId].sakit = n;
        }
        if (izinCol >= 0 && row[izinCol] !== undefined && row[izinCol] !== '') {
          const n = Number(row[izinCol]);
          if (!isNaN(n)) result.attendance[studentId].izin = n;
        }
        if (alpaCol >= 0 && row[alpaCol] !== undefined && row[alpaCol] !== '') {
          const n = Number(row[alpaCol]);
          if (!isNaN(n)) result.attendance[studentId].alpa = n;
        }

        if (catatanCol >= 0 && row[catatanCol]) {
          result.notes[studentId] = String(row[catatanCol]).trim();
        }
      }
    }
  }

  return result;
}

/**
 * EXPORT: Kehadiran dan Catatan Wali Kelas ke Excel (Styled with ExcelJS)
 */
export async function exportAttendanceAndNotesExcel(data: RombelData, isTemplate: boolean = false): Promise<void> {
  const safeKelas = (data.identity.kelas || 'Kelas').replace(/\s+/g, '_');
  const safeRombel = (data.identity.rombel || data.rombelId).replace(/\s+/g, '_');
  const filename = isTemplate
    ? `Template_Kehadiran_Catatan_${safeKelas}_${safeRombel}.xlsx`
    : `Kehadiran_dan_Catatan_Wali_Kelas_${safeKelas}_${safeRombel}.xlsx`;

  try {
    const wb = new ExcelJS.Workbook();
    wb.creator = 'Rapor Kurikulum Merdeka - SDN Babelan Kota 01';
    wb.created = new Date();

    const ws = wb.addWorksheet('KEHADIRAN & CATATAN', {
      views: [{ state: 'frozen', ySplit: 1, showGridLines: true }],
    });

    ws.columns = [
      { width: 6 },   // No
      { width: 22 },  // Student ID
      { width: 16 },  // NISN
      { width: 32 },  // Nama Siswa
      { width: 16 },  // Sakit
      { width: 16 },  // Izin
      { width: 22 },  // Tanpa Keterangan
      { width: 55 },  // Catatan Wali Kelas
    ];

    const headers = [
      'No',
      'Student ID (Sistem)',
      'NISN',
      'Nama Siswa',
      'Sakit (Hari)',
      'Izin (Hari)',
      'Tanpa Keterangan / Alpa (Hari)',
      'Catatan Wali Kelas',
    ];

    const headerRow = ws.addRow(headers);
    headerRow.height = 34;

    headers.forEach((_, colIdx) => {
      const c = colIdx + 1;
      const cell = headerRow.getCell(c);
      cell.font = EXCEL_FONTS.headerWhite;
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      cell.border = BORDER_HEADER;

      if (c <= 4) {
        cell.fill = EXCEL_FILLS.navy;
      } else if (c >= 5 && c <= 7) {
        cell.fill = EXCEL_FILLS.amberHeader;
      } else {
        cell.fill = EXCEL_FILLS.emeraldDark;
        cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
      }
    });

    let totalSakit = 0;
    let totalIzin = 0;
    let totalAlpa = 0;

    data.students.forEach((s, idx) => {
      const att = data.attendance[s.student_id] || { sakit: null, izin: null, alpa: null };
      const note = data.notes[s.student_id] || '';

      const sVal = isTemplate ? '' : (att.sakit ?? '');
      const iVal = isTemplate ? '' : (att.izin ?? '');
      const aVal = isTemplate ? '' : (att.alpa ?? '');
      const noteVal = isTemplate ? '' : note;

      if (typeof sVal === 'number') totalSakit += sVal;
      if (typeof iVal === 'number') totalIzin += iVal;
      if (typeof aVal === 'number') totalAlpa += aVal;

      const row = ws.addRow([
        idx + 1,
        s.student_id,
        s.nisn || '',
        s.nama,
        sVal,
        iVal,
        aVal,
        noteVal,
      ]);
      row.height = 28;
      const rowFill = idx % 2 === 0 ? EXCEL_FILLS.rowWhite : EXCEL_FILLS.rowZebra;

      for (let c = 1; c <= 8; c++) {
        const cell = row.getCell(c);
        cell.fill = rowFill;
        cell.border = BORDER_THIN;
        if (c === 1 || c === 2 || c === 3) {
          cell.font = EXCEL_FONTS.bodyRegular;
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        } else if (c === 4) {
          cell.font = EXCEL_FONTS.bodyBold;
          cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
        } else if (c >= 5 && c <= 7) {
          cell.font = EXCEL_FONTS.bodyBold;
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        } else {
          cell.font = EXCEL_FONTS.bodyRegular;
          cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true, indent: 1 };
        }
      }
    });

    // Summary row for non-template export
    if (!isTemplate && data.students.length > 0) {
      const sumRow = ws.addRow([
        '',
        '',
        '',
        'TOTAL KEHADIRAN KELAS',
        totalSakit,
        totalIzin,
        totalAlpa,
        '',
      ]);
      sumRow.height = 26;
      for (let c = 1; c <= 8; c++) {
        const cell = sumRow.getCell(c);
        cell.fill = EXCEL_FILLS.amberLight;
        cell.font = EXCEL_FONTS.bodyBold;
        cell.border = BORDER_SUMMARY;
        if (c === 4) {
          cell.alignment = { vertical: 'middle', horizontal: 'right', indent: 1 };
        } else if (c >= 5 && c <= 7) {
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        } else {
          cell.alignment = { vertical: 'middle', horizontal: 'left' };
        }
      }
    }

    await downloadExcelJSWorkbook(wb, filename);
  } catch (err) {
    console.error('Failed exportAttendanceAndNotesExcel with ExcelJS, using fallback:', err);
    const wb = XLSX.utils.book_new();
    const headers = [
      'No',
      'Student ID (Sistem)',
      'NISN',
      'Nama Siswa',
      'Sakit (Hari)',
      'Izin (Hari)',
      'Tanpa Keterangan / Alpa (Hari)',
      'Catatan Wali Kelas',
    ];
    const rows = data.students.map((s, idx) => {
      const att = data.attendance[s.student_id] || { sakit: null, izin: null, alpa: null };
      const note = data.notes[s.student_id] || '';
      return [
        idx + 1,
        s.student_id,
        s.nisn || '',
        s.nama,
        isTemplate ? '' : (att.sakit ?? ''),
        isTemplate ? '' : (att.izin ?? ''),
        isTemplate ? '' : (att.alpa ?? ''),
        isTemplate ? '' : note,
      ];
    });
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    ws['!cols'] = [
      { wch: 6 },
      { wch: 22 },
      { wch: 16 },
      { wch: 30 },
      { wch: 14 },
      { wch: 14 },
      { wch: 22 },
      { wch: 55 },
    ];
    XLSX.utils.book_append_sheet(wb, ws, 'KEHADIRAN & CATATAN');
    XLSX.writeFile(wb, filename);
  }
}

/**
 * IMPORT: Kehadiran dan Catatan Wali Kelas dari Excel
 */
export async function parseAndApplyAttendanceAndNotesExcel(
  file: File,
  currentData: RombelData
): Promise<{ updatedData: RombelData; count: number; studentNames: string[] }> {
  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: 'array' });

  // Look for target sheet
  let ws = wb.Sheets['KEHADIRAN & CATATAN'] || wb.Sheets['KEHADIRAN'] || wb.Sheets['REKAP NILAI'];
  if (!ws && wb.SheetNames.length > 0) {
    ws = wb.Sheets[wb.SheetNames[0]];
  }

  if (!ws) {
    throw new Error('Lembar kerja tidak ditemukan di file Excel.');
  }

  const rows: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });
  if (rows.length < 2) {
    throw new Error('File Excel tidak memiliki baris data siswa yang cukup.');
  }

  // Find header indices
  let headerRowIndex = 0;
  for (let i = 0; i < Math.min(5, rows.length); i++) {
    const r = rows[i];
    if (r && r.some((c) => String(c).toLowerCase().includes('nama') || String(c).toLowerCase().includes('sakit'))) {
      headerRowIndex = i;
      break;
    }
  }

  const headers = (rows[headerRowIndex] as string[]).map((h) => String(h || '').trim().toLowerCase());
  const idCol = headers.findIndex((h) => h.includes('student id') || h.includes('id sistem'));
  const nisnCol = headers.findIndex((h) => h.includes('nisn'));
  const namaCol = headers.findIndex((h) => h.includes('nama'));
  const sakitCol = headers.findIndex((h) => h.includes('sakit'));
  const izinCol = headers.findIndex((h) => h.includes('izin'));
  const alpaCol = headers.findIndex((h) => h.includes('alpa') || h.includes('tanpa keterangan'));
  const catatanCol = headers.findIndex((h) => h.includes('catatan'));

  if (sakitCol === -1 && izinCol === -1 && alpaCol === -1 && catatanCol === -1) {
    throw new Error('Kolom kehadiran (Sakit/Izin/Alpa) atau Catatan Wali Kelas tidak ditemukan pada header Excel.');
  }

  const result: RombelData = JSON.parse(JSON.stringify(currentData));
  let count = 0;
  const studentNames: string[] = [];

  for (let r = headerRowIndex + 1; r < rows.length; r++) {
    const row = rows[r];
    if (!row || row.length === 0) continue;

    const rawId = idCol >= 0 ? String(row[idCol] || '').trim() : '';
    const rawNisn = nisnCol >= 0 ? String(row[nisnCol] || '').trim() : '';
    const rawNama = namaCol >= 0 ? String(row[namaCol] || '').trim().toLowerCase() : '';

    const targetStudent = result.students.find(
      (s) =>
        (rawId && s.student_id === rawId) ||
        (rawNisn && s.nisn && s.nisn === rawNisn) ||
        (rawNama && s.nama.toLowerCase() === rawNama)
    );

    if (!targetStudent) continue;

    if (!result.attendance[targetStudent.student_id]) {
      result.attendance[targetStudent.student_id] = { sakit: null, izin: null, alpa: null };
    }

    let modified = false;

    if (sakitCol >= 0) {
      const val = row[sakitCol];
      if (val !== undefined && val !== null && String(val).trim() !== '') {
        const num = Number(val);
        if (!isNaN(num) && num >= 0) {
          result.attendance[targetStudent.student_id].sakit = Math.round(num);
          modified = true;
        }
      }
    }

    if (izinCol >= 0) {
      const val = row[izinCol];
      if (val !== undefined && val !== null && String(val).trim() !== '') {
        const num = Number(val);
        if (!isNaN(num) && num >= 0) {
          result.attendance[targetStudent.student_id].izin = Math.round(num);
          modified = true;
        }
      }
    }

    if (alpaCol >= 0) {
      const val = row[alpaCol];
      if (val !== undefined && val !== null && String(val).trim() !== '') {
        const num = Number(val);
        if (!isNaN(num) && num >= 0) {
          result.attendance[targetStudent.student_id].alpa = Math.round(num);
          modified = true;
        }
      }
    }

    if (catatanCol >= 0) {
      const val = row[catatanCol];
      if (val !== undefined && val !== null && String(val).trim() !== '') {
        result.notes[targetStudent.student_id] = String(val).trim();
        modified = true;
      }
    }

    if (modified) {
      count++;
      if (studentNames.length < 5) {
        studentNames.push(targetStudent.nama);
      }
    }
  }

  return { updatedData: result, count, studentNames };
}

/**
 * EXPORT: Capaian Tujuan Pembelajaran ke Excel (Styled with ExcelJS)
 */
export async function exportDescriptionsExcel(data: RombelData, isTemplate: boolean = false): Promise<void> {
  const safeKelas = (data.identity.kelas || 'Kelas').replace(/\s+/g, '_');
  const safeRombel = (data.identity.rombel || data.rombelId).replace(/\s+/g, '_');
  const filename = isTemplate
    ? `Template_Tujuan_Pembelajaran_${safeKelas}_${safeRombel}.xlsx`
    : `Tujuan_Pembelajaran_${safeKelas}_${safeRombel}.xlsx`;

  try {
    const wb = new ExcelJS.Workbook();
    wb.creator = 'Rapor Kurikulum Merdeka - SDN Babelan Kota 01';
    wb.created = new Date();

    const ws = wb.addWorksheet('TUJUAN PEMBELAJARAN', {
      views: [{ state: 'frozen', ySplit: 1, showGridLines: true }],
    });

    const subjects = data.subjects;
    ws.columns = [
      { width: 6 },   // No
      { width: 22 },  // Student ID
      { width: 16 },  // NISN
      { width: 32 },  // Nama Siswa
      ...subjects.map(() => ({ width: 55 })),
    ];

    const headers = [
      'No',
      'Student ID (Sistem)',
      'NISN',
      'Nama Siswa',
      ...subjects.map((sub) => `Capaian Tujuan Pembelajaran ${sub.name} [ID:${sub.id}]`),
    ];

    const headerRow = ws.addRow(headers);
    headerRow.height = 34;

    headers.forEach((_, colIdx) => {
      const c = colIdx + 1;
      const cell = headerRow.getCell(c);
      cell.font = EXCEL_FONTS.headerWhite;
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      cell.border = BORDER_HEADER;
      if (c <= 4) {
        cell.fill = EXCEL_FILLS.navy;
      } else {
        cell.fill = EXCEL_FILLS.indigoHeader;
      }
    });

    data.students.forEach((s, idx) => {
      const studentDesc = data.descriptions[s.student_id] || {};
      const descs = subjects.map((sub) => (isTemplate ? '' : studentDesc[sub.id] || ''));

      const row = ws.addRow([idx + 1, s.student_id, s.nisn || '', s.nama, ...descs]);
      row.height = 50;
      const rowFill = idx % 2 === 0 ? EXCEL_FILLS.rowWhite : EXCEL_FILLS.rowZebra;

      for (let c = 1; c <= headers.length; c++) {
        const cell = row.getCell(c);
        cell.fill = rowFill;
        cell.border = BORDER_THIN;
        if (c <= 3) {
          cell.font = EXCEL_FONTS.bodyRegular;
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        } else if (c === 4) {
          cell.font = EXCEL_FONTS.bodyBold;
          cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
        } else {
          cell.font = EXCEL_FONTS.bodyRegular;
          cell.alignment = { vertical: 'top', horizontal: 'left', wrapText: true };
        }
      }
    });

    await downloadExcelJSWorkbook(wb, filename);
  } catch (err) {
    console.error('Failed exportDescriptionsExcel with ExcelJS, using fallback:', err);
    const wb = XLSX.utils.book_new();
    const subjects = data.subjects;
    const headers = [
      'No',
      'Student ID (Sistem)',
      'NISN',
      'Nama Siswa',
      ...subjects.map((sub) => `Capaian Tujuan Pembelajaran ${sub.name} [ID:${sub.id}]`),
    ];
    const rows = data.students.map((s, idx) => {
      const studentDesc = data.descriptions[s.student_id] || {};
      const descs = subjects.map((sub) => (isTemplate ? '' : studentDesc[sub.id] || ''));
      return [idx + 1, s.student_id, s.nisn || '', s.nama, ...descs];
    });
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    ws['!cols'] = [
      { wch: 6 },
      { wch: 22 },
      { wch: 16 },
      { wch: 30 },
      ...subjects.map(() => ({ wch: 50 })),
    ];
    XLSX.utils.book_append_sheet(wb, ws, 'TUJUAN PEMBELAJARAN');
    XLSX.writeFile(wb, filename);
  }
}

/**
 * IMPORT: Deskripsi Capaian Pembelajaran dari Excel
 */
export async function parseAndApplyDescriptionsExcel(
  file: File,
  currentData: RombelData
): Promise<{ updatedData: RombelData; count: number; studentNames: string[] }> {
  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: 'array' });

  // Look for target sheet
  let ws =
    wb.Sheets['TUJUAN PEMBELAJARAN'] ||
    wb.Sheets['DESKRIPSI CAPAIAN'] ||
    wb.Sheets['DESKRIPSI'] ||
    wb.Sheets['TP'];
  if (!ws && wb.SheetNames.length > 0) {
    ws = wb.Sheets[wb.SheetNames[0]];
  }

  if (!ws) {
    throw new Error('Lembar kerja Tujuan Pembelajaran tidak ditemukan di file Excel.');
  }

  const rows: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });
  if (rows.length < 2) {
    throw new Error('File Excel tidak memiliki baris data tujuan pembelajaran yang cukup.');
  }

  let headerRowIndex = 0;
  for (let i = 0; i < Math.min(5, rows.length); i++) {
    const r = rows[i];
    if (
      r &&
      r.some(
        (c) =>
          String(c).toLowerCase().includes('tujuan pembelajaran') ||
          String(c).toLowerCase().includes('capaian') ||
          String(c).toLowerCase().includes('deskripsi') ||
          String(c).toLowerCase().includes('nama')
      )
    ) {
      headerRowIndex = i;
      break;
    }
  }

  const headers = rows[headerRowIndex] as string[];
  const idCol = headers.findIndex((h) => String(h).toLowerCase().includes('student id') || String(h).toLowerCase().includes('id sistem'));
  const nisnCol = headers.findIndex((h) => String(h).toLowerCase().includes('nisn'));
  const namaCol = headers.findIndex((h) => String(h).toLowerCase().includes('nama'));

  // Map columns to subjects
  const colToSubjectMap: { col: number; subjectId: string }[] = [];
  for (let col = 0; col < headers.length; col++) {
    const headerText = String(headers[col] || '');
    const idMatch = headerText.match(/\[ID:([^\]]+)\]/i);
    if (idMatch && idMatch[1]) {
      const matchedSub = currentData.subjects.find((s) => s.id === idMatch[1].trim());
      if (matchedSub) {
        colToSubjectMap.push({ col, subjectId: matchedSub.id });
        continue;
      }
    }
    const cleanHeader = headerText
      .replace(/capaian|tujuan pembelajaran|deskripsi|tp/gi, '')
      .trim()
      .toLowerCase();
    const found = currentData.subjects.find(
      (s) =>
        s.name.toLowerCase() === cleanHeader ||
        s.shortName.toLowerCase() === cleanHeader ||
        cleanHeader.includes(s.shortName.toLowerCase()) ||
        cleanHeader.includes(s.id.toLowerCase())
    );
    if (found) {
      colToSubjectMap.push({ col, subjectId: found.id });
    }
  }

  if (colToSubjectMap.length === 0) {
    throw new Error('Tidak ditemukan kolom mata pelajaran yang cocok pada file Excel tujuan pembelajaran.');
  }

  const result: RombelData = JSON.parse(JSON.stringify(currentData));
  let count = 0;
  const studentNames: string[] = [];

  for (let r = headerRowIndex + 1; r < rows.length; r++) {
    const row = rows[r];
    if (!row || row.length === 0) continue;

    const rawId = idCol >= 0 ? String(row[idCol] || '').trim() : '';
    const rawNisn = nisnCol >= 0 ? String(row[nisnCol] || '').trim() : '';
    const rawNama = namaCol >= 0 ? String(row[namaCol] || '').trim().toLowerCase() : '';

    const targetStudent = result.students.find(
      (s) =>
        (rawId && s.student_id === rawId) ||
        (rawNisn && s.nisn && s.nisn === rawNisn) ||
        (rawNama && s.nama.toLowerCase() === rawNama)
    );

    if (!targetStudent) continue;

    if (!result.descriptions[targetStudent.student_id]) {
      result.descriptions[targetStudent.student_id] = {};
    }

    let modified = false;
    colToSubjectMap.forEach(({ col, subjectId }) => {
      const descVal = row[col];
      if (descVal !== undefined && descVal !== null && String(descVal).trim() !== '') {
        result.descriptions[targetStudent.student_id][subjectId] = String(descVal).trim();
        modified = true;
      }
    });

    if (modified) {
      count++;
      if (studentNames.length < 5) {
        studentNames.push(targetStudent.nama);
      }
    }
  }

  return { updatedData: result, count, studentNames };
}

/**
 * EXPORT: Ekstrakurikuler Peserta Didik ke format Excel (ExcelJS) dengan Desain & Warna Menarik
 */
export async function exportExtracurricularExcel(data: RombelData, isTemplate: boolean = false): Promise<void> {
  const safeKelas = (data.identity.kelas || 'Kelas').replace(/\s+/g, '_');
  const safeRombel = (data.identity.rombel || data.rombelId).replace(/\s+/g, '_');
  const filename = isTemplate
    ? `Template_Ekstrakurikuler_${safeKelas}_${safeRombel}.xlsx`
    : `Data_Ekstrakurikuler_${safeKelas}_${safeRombel}.xlsx`;

  try {
    const wb = new ExcelJS.Workbook();
    wb.creator = 'Rapor Kurikulum Merdeka - SDN Babelan Kota 01';
    wb.created = new Date();

    const ws = wb.addWorksheet('EKSTRAKURIKULER', {
      views: [{ state: 'frozen', ySplit: 4, showGridLines: true }],
    });

    // 13 Columns layout
    ws.columns = [
      { width: 6 },   // 1. No
      { width: 22 },  // 2. Student ID
      { width: 16 },  // 3. NISN
      { width: 32 },  // 4. Nama Siswa
      { width: 32 },  // 5. Ekskul 1 (Nama)
      { width: 16 },  // 6. Predikat 1
      { width: 48 },  // 7. Keterangan 1
      { width: 30 },  // 8. Ekskul 2 (Nama)
      { width: 16 },  // 9. Predikat 2
      { width: 48 },  // 10. Keterangan 2
      { width: 28 },  // 11. Ekskul 3 (Nama)
      { width: 16 },  // 12. Predikat 3
      { width: 48 },  // 13. Keterangan 3
    ];

    // Row 1: Main Title Banner
    const rowTitle = ws.addRow([
      `DATA EKSTRAKURIKULER PESERTA DIDIK - KURIKULUM MERDEKA (BAGIAN B RAPOR)`
    ]);
    ws.mergeCells('A1:M1');
    rowTitle.height = 36;
    const cellTitle = rowTitle.getCell(1);
    cellTitle.fill = EXCEL_FILLS.purpleDark;
    cellTitle.font = { name: 'Arial', size: 12, bold: true, color: { argb: 'FFFFFFFF' } };
    cellTitle.alignment = { vertical: 'middle', horizontal: 'center' };

    // Row 2: Subtitle Information
    const rowSub = ws.addRow([
      `${data.identity.namaSekolah || 'SDN BABELAN KOTA 01'} • KELAS: ${data.identity.kelas || '-'} (${data.identity.rombel || '-'}) • SEMESTER: ${data.identity.semester || '-'} • TAHUN AJARAN: ${data.identity.tahunPelajaran || '-'}`
    ]);
    ws.mergeCells('A2:M2');
    rowSub.height = 24;
    const cellSub = rowSub.getCell(1);
    cellSub.fill = EXCEL_FILLS.purpleLight;
    cellSub.font = { name: 'Arial', size: 9.5, bold: true, color: { argb: 'FF581C87' } };
    cellSub.alignment = { vertical: 'middle', horizontal: 'center' };

    // Row 3: Super Headers / Group Categories
    const rowSuper = ws.addRow([
      'IDENTITAS PESERTA DIDIK',
      '',
      '',
      '',
      'KEGIATAN EKSTRAKURIKULER 1 (WAJIB / UTAMA)',
      '',
      '',
      'KEGIATAN EKSTRAKURIKULER 2 (PILIHAN)',
      '',
      '',
      'KEGIATAN EKSTRAKURIKULER 3 (OPSIONAL)',
      '',
      '',
    ]);
    rowSuper.height = 26;
    ws.mergeCells('A3:D3');
    ws.mergeCells('E3:G3');
    ws.mergeCells('H3:J3');
    ws.mergeCells('K3:M3');

    // Style Super Headers
    const superSpecs = [
      { range: ['A3', 'B3', 'C3', 'D3'], fill: EXCEL_FILLS.navy },
      { range: ['E3', 'F3', 'G3'], fill: EXCEL_FILLS.purpleMedium },
      { range: ['H3', 'I3', 'J3'], fill: EXCEL_FILLS.tealHeader },
      { range: ['K3', 'L3', 'M3'], fill: EXCEL_FILLS.amberHeader },
    ];

    superSpecs.forEach((spec) => {
      spec.range.forEach((addr) => {
        const cell = ws.getCell(addr);
        cell.fill = spec.fill;
        cell.font = EXCEL_FONTS.headerWhite;
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.border = BORDER_HEADER;
      });
    });

    // Row 4: Column Specific Headers
    const subHeaders = [
      'No',
      'Student ID (Sistem)',
      'NISN',
      'Nama Lengkap Siswa',
      'Nama Kegiatan 1',
      'Predikat 1',
      'Keterangan Capaian 1',
      'Nama Kegiatan 2',
      'Predikat 2',
      'Keterangan Capaian 2',
      'Nama Kegiatan 3',
      'Predikat 3',
      'Keterangan Capaian 3',
    ];

    const rowHeader = ws.addRow(subHeaders);
    rowHeader.height = 30;

    subHeaders.forEach((_, colIdx) => {
      const c = colIdx + 1;
      const cell = rowHeader.getCell(c);
      cell.font = EXCEL_FONTS.headerWhite;
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      cell.border = BORDER_HEADER;

      if (c <= 4) {
        cell.fill = EXCEL_FILLS.slateDark;
      } else if (c <= 7) {
        cell.fill = EXCEL_FILLS.purpleDark;
      } else if (c <= 10) {
        cell.fill = EXCEL_FILLS.emeraldDark;
      } else {
        cell.fill = EXCEL_FILLS.amberHeader;
      }
    });

    // Student Data Rows
    data.students.forEach((s, idx) => {
      const ekskuls = data.extracurriculars[s.student_id] || [];

      // Default values if not in template mode
      const e1 = (!isTemplate && ekskuls[0]) ? ekskuls[0] : null;
      const e2 = (!isTemplate && ekskuls[1]) ? ekskuls[1] : null;
      const e3 = (!isTemplate && ekskuls[2]) ? ekskuls[2] : null;

      const rowValues = [
        idx + 1,
        s.student_id,
        s.nisn || '',
        s.nama,
        // Ekskul 1
        e1 ? (e1.name || '-') : (isTemplate ? '' : '-'),
        e1 ? (e1.predicate || '-') : (isTemplate ? '' : '-'),
        e1 ? (e1.description || '-') : (isTemplate ? '' : '-'),
        // Ekskul 2
        e2 ? (e2.name || '-') : (isTemplate ? '' : '-'),
        e2 ? (e2.predicate || '-') : (isTemplate ? '' : '-'),
        e2 ? (e2.description || '-') : (isTemplate ? '' : '-'),
        // Ekskul 3
        e3 ? (e3.name || '-') : (isTemplate ? '' : '-'),
        e3 ? (e3.predicate || '-') : (isTemplate ? '' : '-'),
        e3 ? (e3.description || '-') : (isTemplate ? '' : '-'),
      ];

      const row = ws.addRow(rowValues);
      row.height = 28;
      const rowFill = idx % 2 === 0 ? EXCEL_FILLS.rowWhite : EXCEL_FILLS.rowZebra;

      for (let c = 1; c <= 13; c++) {
        const cell = row.getCell(c);
        cell.fill = rowFill;
        cell.border = BORDER_THIN;

        if (c === 1 || c === 2 || c === 3) {
          cell.font = EXCEL_FONTS.bodyRegular;
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        } else if (c === 4) {
          cell.font = EXCEL_FONTS.bodyBold;
          cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
        } else if (c === 6 || c === 9 || c === 12) {
          // Predicate columns: centered & bold, plus dropdown list including '-'
          cell.font = EXCEL_FONTS.bodyBold;
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
          // Excel data validation for -, Sangat Baik, Baik, Cukup
          cell.dataValidation = {
            type: 'list',
            allowBlank: true,
            formulae: ['"-,Sangat Baik,Baik,Cukup"'],
          };
        } else if (c === 5 || c === 8 || c === 11) {
          // Ekskul names
          cell.font = EXCEL_FONTS.bodyRegular;
          cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
        } else {
          // Descriptions
          cell.font = EXCEL_FONTS.bodyRegular;
          cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true, indent: 1 };
        }
      }
    });

    // Guidance footer row
    const footRow = ws.addRow([
      '*Petunjuk: Isi Nama Kegiatan, Predikat (Sangat Baik / Baik / Cukup / -), dan Keterangan Capaian. Jika siswa TIDAK mengikuti ekstrakurikuler, pilih predikat (-) dan isi/kosongkan keterangan dengan (-). Di Rapor Kurikulum Merdeka, Ekstrakurikuler dicetak pada Bagian B.'
    ]);
    const footIndex = ws.rowCount;
    ws.mergeCells(`A${footIndex}:M${footIndex}`);
    footRow.height = 24;
    const footCell = footRow.getCell(1);
    footCell.fill = EXCEL_FILLS.slateSubtle;
    footCell.font = { name: 'Arial', size: 9, italic: true, color: { argb: 'FF475569' } };
    footCell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };

    await downloadExcelJSWorkbook(wb, filename);
  } catch (err) {
    console.error('Failed exportExtracurricularExcel with ExcelJS, fallback to XLSX:', err);
    const wb = XLSX.utils.book_new();
    const headers = [
      'No',
      'Student ID (Sistem)',
      'NISN',
      'Nama Siswa',
      'Ekstrakurikuler 1',
      'Predikat 1',
      'Keterangan 1',
      'Ekstrakurikuler 2',
      'Predikat 2',
      'Keterangan 2',
      'Ekstrakurikuler 3',
      'Predikat 3',
      'Keterangan 3',
    ];

    const rows = data.students.map((s, idx) => {
      const ekskuls = data.extracurriculars[s.student_id] || [];
      const e1 = (!isTemplate && ekskuls[0]) ? ekskuls[0] : null;
      const e2 = (!isTemplate && ekskuls[1]) ? ekskuls[1] : null;
      const e3 = (!isTemplate && ekskuls[2]) ? ekskuls[2] : null;

      return [
        idx + 1,
        s.student_id,
        s.nisn || '',
        s.nama,
        e1 ? (e1.name || '-') : (isTemplate ? '' : '-'),
        e1 ? (e1.predicate || '-') : (isTemplate ? '' : '-'),
        e1 ? (e1.description || '-') : (isTemplate ? '' : '-'),
        e2 ? (e2.name || '-') : (isTemplate ? '' : '-'),
        e2 ? (e2.predicate || '-') : (isTemplate ? '' : '-'),
        e2 ? (e2.description || '-') : (isTemplate ? '' : '-'),
        e3 ? (e3.name || '-') : (isTemplate ? '' : '-'),
        e3 ? (e3.predicate || '-') : (isTemplate ? '' : '-'),
        e3 ? (e3.description || '-') : (isTemplate ? '' : '-'),
      ];
    });

    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    ws['!cols'] = [
      { wch: 6 },
      { wch: 22 },
      { wch: 16 },
      { wch: 30 },
      { wch: 30 },
      { wch: 14 },
      { wch: 45 },
      { wch: 26 },
      { wch: 14 },
      { wch: 45 },
      { wch: 26 },
      { wch: 14 },
      { wch: 45 },
    ];
    XLSX.utils.book_append_sheet(wb, ws, 'EKSTRAKURIKULER');
    XLSX.writeFile(wb, filename);
  }
}

/**
 * IMPORT: Ekstrakurikuler Siswa dari Excel
 */
export async function parseAndApplyExtracurricularExcel(
  file: File,
  currentData: RombelData
): Promise<{ updatedData: RombelData; count: number; studentNames: string[] }> {
  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: 'array' });

  // Look for target sheet
  let ws = wb.Sheets['EKSTRAKURIKULER'] || wb.Sheets['EKSKUL'];
  if (!ws && wb.SheetNames.length > 0) {
    ws = wb.Sheets[wb.SheetNames[0]];
  }

  if (!ws) {
    throw new Error('Lembar kerja Ekstrakurikuler tidak ditemukan di file Excel.');
  }

  const rows: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });
  if (rows.length < 2) {
    throw new Error('File Excel tidak memiliki baris data siswa yang cukup.');
  }

  // Find header row index
  let headerRowIndex = 0;
  for (let i = 0; i < Math.min(8, rows.length); i++) {
    const r = rows[i];
    if (r && r.some((c) => {
      const s = String(c || '').toLowerCase();
      return s.includes('nama') || s.includes('ekskul') || s.includes('ekstrakurikuler') || s.includes('kegiatan 1');
    })) {
      headerRowIndex = i;
      // If row has "IDENTITAS PESERTA DIDIK" superheader, check next row
      if (r.some((c) => String(c || '').toLowerCase().includes('identitas peserta didik')) && rows[i + 1]) {
        headerRowIndex = i + 1;
      }
      break;
    }
  }

  const headers = (rows[headerRowIndex] as string[]).map((h) => String(h || '').trim().toLowerCase());

  const idCol = headers.findIndex((h) => h.includes('student id') || h.includes('id sistem'));
  const nisnCol = headers.findIndex((h) => h.includes('nisn'));
  const namaCol = headers.findIndex((h) => h.includes('nama'));

  // Column lookups for Ekskul 1, 2, 3
  const findCol = (terms: string[]) =>
    headers.findIndex((h) => terms.some((t) => h.includes(t)));

  // Ekskul 1
  let e1NameCol = findCol(['kegiatan 1', 'ekskul 1', 'ekstrakurikuler 1']);
  if (e1NameCol === -1) e1NameCol = findCol(['ekskul', 'ekstrakurikuler', 'kegiatan']);
  let e1PredCol = findCol(['predikat 1', 'nilai 1']);
  if (e1PredCol === -1) e1PredCol = findCol(['predikat', 'nilai']);
  let e1KetCol = findCol(['keterangan 1', 'deskripsi 1', 'capaian 1']);
  if (e1KetCol === -1) e1KetCol = findCol(['keterangan', 'deskripsi']);

  // Ekskul 2
  const e2NameCol = findCol(['kegiatan 2', 'ekskul 2', 'ekstrakurikuler 2']);
  const e2PredCol = findCol(['predikat 2', 'nilai 2']);
  const e2KetCol = findCol(['keterangan 2', 'deskripsi 2', 'capaian 2']);

  // Ekskul 3
  const e3NameCol = findCol(['kegiatan 3', 'ekskul 3', 'ekstrakurikuler 3']);
  const e3PredCol = findCol(['predikat 3', 'nilai 3']);
  const e3KetCol = findCol(['keterangan 3', 'deskripsi 3', 'capaian 3']);

  if (e1NameCol === -1 && e2NameCol === -1 && e3NameCol === -1) {
    throw new Error('Kolom Nama Ekstrakurikuler / Kegiatan tidak ditemukan pada baris judul tabel Excel.');
  }

  const normalizePredicate = (val: any): string => {
    const s = String(val || '').trim().toLowerCase();
    if (s === 'sangat baik' || s === 'sb' || s === 'a') return 'Sangat Baik';
    if (s === 'cukup' || s === 'c' || s === 'k' || s === 'kurang') return 'Cukup';
    if (s === 'baik' || s === 'b') return 'Baik';
    if (s === '-' || s === 'tidak' || s === 'tidak mengikuti' || s === '' || s === 'kosong') return '-';
    return '-';
  };

  const defaultDesc = (pred: string, name: string): string => {
    if (pred === '-') return '-';
    if (pred === 'Sangat Baik') {
      return `Sangat aktif, bersemangat tinggi, dan menunjukkan kedisiplinan serta keterampilan yang sangat memuaskan dalam ${name}.`;
    }
    if (pred === 'Cukup') {
      return `Cukup aktif dalam mengikuti rangkaian kegiatan ${name} dengan bimbingan berkala.`;
    }
    return `Aktif mengikuti kegiatan ${name}, menunjukkan antusiasme belajar, dan berpartisipasi dengan baik.`;
  };

  const result: RombelData = JSON.parse(JSON.stringify(currentData));
  let count = 0;
  const studentNames: string[] = [];

  for (let r = headerRowIndex + 1; r < rows.length; r++) {
    const row = rows[r];
    if (!row || row.length === 0) continue;

    const rawId = idCol >= 0 ? String(row[idCol] || '').trim() : '';
    const rawNisn = nisnCol >= 0 ? String(row[nisnCol] || '').trim() : '';
    const rawNama = namaCol >= 0 ? String(row[namaCol] || '').trim().toLowerCase() : '';

    const targetStudent = result.students.find(
      (s) =>
        (rawId && s.student_id === rawId) ||
        (rawNisn && s.nisn && s.nisn === rawNisn) ||
        (rawNama && s.nama.toLowerCase() === rawNama)
    );

    if (!targetStudent) continue;

    const ekskulList: { name: string; predicate: string; description: string }[] = [];

    // Helper to extract entry
    const extractEntry = (nameCol: number, predCol: number, ketCol: number) => {
      if (nameCol < 0) return;
      const rawName = row[nameCol];
      if (rawName === undefined || rawName === null) return;
      const nameStr = String(rawName).trim();
      if (!nameStr) return;

      const rawPred = predCol >= 0 ? row[predCol] : '';
      const pred = normalizePredicate(rawPred);
      const rawKet = ketCol >= 0 ? row[ketCol] : '';
      const ket = rawKet && String(rawKet).trim() !== '' 
        ? String(rawKet).trim() 
        : (pred === '-' || nameStr === '-' ? '-' : defaultDesc(pred, nameStr));

      ekskulList.push({
        name: nameStr,
        predicate: pred,
        description: ket,
      });
    };

    extractEntry(e1NameCol, e1PredCol, e1KetCol);
    extractEntry(e2NameCol, e2PredCol, e2KetCol);
    extractEntry(e3NameCol, e3PredCol, e3KetCol);

    if (ekskulList.length > 0) {
      result.extracurriculars[targetStudent.student_id] = ekskulList;
      count++;
      if (studentNames.length < 5) {
        studentNames.push(targetStudent.nama);
      }
    }
  }

  return { updatedData: result, count, studentNames };
}

// -------------------------------------------------------------
// RUMUSAN TUJUAN PEMBELAJARAN (TP 1 - TP 4 PER MAPEL) EXCEL
// -------------------------------------------------------------

/**
 * EXPORT: Rumusan Tujuan Pembelajaran (TP 1 - TP 4) Seluruh Mata Pelajaran ke Excel
 */
export async function exportRumusanTPExcel(data: RombelData, isTemplate: boolean = false): Promise<void> {
  const safeKelas = (data.identity.kelas || 'Kelas').replace(/\s+/g, '_');
  const safeRombel = (data.identity.rombel || data.rombelId).replace(/\s+/g, '_');
  const filename = isTemplate
    ? `Template_Rumusan_TP_${safeKelas}_${safeRombel}.xlsx`
    : `Rumusan_Tujuan_Pembelajaran_${safeKelas}_${safeRombel}.xlsx`;

  const gradeMatch = (data.identity.kelas || '').match(/\d+/);
  const gradeNumber = gradeMatch ? parseInt(gradeMatch[0], 10) : 1;

  try {
    const wb = new ExcelJS.Workbook();
    wb.creator = 'Rapor Kurikulum Merdeka - SDN Babelan Kota 01';
    wb.created = new Date();

    const ws = wb.addWorksheet('RUMUSAN TP', {
      views: [{ state: 'frozen', ySplit: 2, showGridLines: true }],
    });

    ws.columns = [
      { width: 6 },   // No
      { width: 14 },  // ID Mapel
      { width: 34 },  // Nama Mapel
      { width: 48 },  // TP 1
      { width: 48 },  // TP 2
      { width: 48 },  // TP 3
      { width: 48 },  // TP 4
    ];

    // Info header row
    const titleRow = ws.addRow([
      `FORMULASI 4 KATEGORI TUJUAN PEMBELAJARAN (TP 1 - TP 4) - ${data.identity.rombel}`,
    ]);
    titleRow.height = 28;
    ws.mergeCells(1, 1, 1, 7);
    const titleCell = titleRow.getCell(1);
    titleCell.font = { name: 'Calibri', size: 12, bold: true, color: { argb: 'FFFFFFFF' } };
    titleCell.fill = EXCEL_FILLS.navy;
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' };

    const headers = [
      'No',
      'ID Mapel',
      'Nama Mata Pelajaran',
      'Kategori 1: Tujuan Pembelajaran 1 (TP 1)',
      'Kategori 2: Tujuan Pembelajaran 2 (TP 2)',
      'Kategori 3: Tujuan Pembelajaran 3 (TP 3)',
      'Kategori 4: Tujuan Pembelajaran 4 (TP 4)',
    ];

    const headerRow = ws.addRow(headers);
    headerRow.height = 32;

    headers.forEach((_, colIdx) => {
      const c = colIdx + 1;
      const cell = headerRow.getCell(c);
      cell.font = EXCEL_FONTS.headerWhite;
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      cell.border = BORDER_HEADER;
      if (c <= 3) {
        cell.fill = EXCEL_FILLS.navy;
      } else {
        cell.fill = EXCEL_FILLS.indigoHeader;
      }
    });

    data.subjects.forEach((sub, idx) => {
      const existingTPs = data.learningObjectives?.[sub.id];
      const defaultTPs = getDefaultTPListForSubject(sub.id, gradeNumber);
      const tp1 = isTemplate ? '' : existingTPs?.[0] || defaultTPs[0];
      const tp2 = isTemplate ? '' : existingTPs?.[1] || defaultTPs[1];
      const tp3 = isTemplate ? '' : existingTPs?.[2] || defaultTPs[2];
      const tp4 = isTemplate ? '' : existingTPs?.[3] || defaultTPs[3];

      const row = ws.addRow([idx + 1, sub.id, sub.name, tp1, tp2, tp3, tp4]);
      row.height = 45;
      const rowFill = idx % 2 === 0 ? EXCEL_FILLS.rowWhite : EXCEL_FILLS.rowZebra;

      for (let c = 1; c <= 7; c++) {
        const cell = row.getCell(c);
        cell.fill = rowFill;
        cell.border = BORDER_THIN;
        if (c === 1) {
          cell.font = EXCEL_FONTS.bodyRegular;
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        } else if (c === 2) {
          cell.font = EXCEL_FONTS.bodyRegular;
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        } else if (c === 3) {
          cell.font = EXCEL_FONTS.bodyBold;
          cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
        } else {
          cell.font = EXCEL_FONTS.bodyRegular;
          cell.alignment = { vertical: 'top', horizontal: 'left', wrapText: true };
        }
      }
    });

    await downloadExcelJSWorkbook(wb, filename);
  } catch (err) {
    console.error('Failed exportRumusanTPExcel with ExcelJS, using fallback:', err);
    const wb = XLSX.utils.book_new();
    const headers = [
      'No',
      'ID Mapel',
      'Nama Mata Pelajaran',
      'TP 1',
      'TP 2',
      'TP 3',
      'TP 4',
    ];
    const rows = data.subjects.map((sub, idx) => {
      const existingTPs = data.learningObjectives?.[sub.id];
      const defaultTPs = getDefaultTPListForSubject(sub.id, gradeNumber);
      return [
        idx + 1,
        sub.id,
        sub.name,
        isTemplate ? '' : existingTPs?.[0] || defaultTPs[0],
        isTemplate ? '' : existingTPs?.[1] || defaultTPs[1],
        isTemplate ? '' : existingTPs?.[2] || defaultTPs[2],
        isTemplate ? '' : existingTPs?.[3] || defaultTPs[3],
      ];
    });
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    XLSX.utils.book_append_sheet(wb, ws, 'RUMUSAN TP');
    XLSX.writeFile(wb, filename);
  }
}

/**
 * IMPORT: Rumusan Tujuan Pembelajaran dari File Excel
 */
export async function parseAndApplyRumusanTPExcel(
  file: File,
  currentData: RombelData
): Promise<{ updatedData: RombelData; count: number; subjectNames: string[] }> {
  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: 'array' });

  let ws = wb.Sheets['RUMUSAN TP'] || wb.Sheets['TUJUAN PEMBELAJARAN'] || wb.Sheets['TP'];
  if (!ws && wb.SheetNames.length > 0) {
    ws = wb.Sheets[wb.SheetNames[0]];
  }

  if (!ws) {
    throw new Error('Lembar kerja Rumusan TP tidak ditemukan di file Excel.');
  }

  const rows: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });
  if (rows.length < 2) {
    throw new Error('File Excel tidak memiliki baris data rumusan TP yang cukup.');
  }

  let headerRowIndex = 0;
  for (let i = 0; i < Math.min(6, rows.length); i++) {
    const r = rows[i];
    if (
      r &&
      r.some(
        (c) =>
          String(c).toLowerCase().includes('id mapel') ||
          String(c).toLowerCase().includes('mata pelajaran') ||
          String(c).toLowerCase().includes('tp 1')
      )
    ) {
      headerRowIndex = i;
      break;
    }
  }

  const headers = rows[headerRowIndex] as string[];
  const idCol = headers.findIndex((h) => String(h).toLowerCase().includes('id mapel') || String(h).toLowerCase() === 'id');
  const nameCol = headers.findIndex((h) => String(h).toLowerCase().includes('mata pelajaran') || String(h).toLowerCase().includes('mapel'));
  const tp1Col = headers.findIndex((h) => String(h).toLowerCase().includes('tp 1') || String(h).toLowerCase().includes('kategori 1'));
  const tp2Col = headers.findIndex((h) => String(h).toLowerCase().includes('tp 2') || String(h).toLowerCase().includes('kategori 2'));
  const tp3Col = headers.findIndex((h) => String(h).toLowerCase().includes('tp 3') || String(h).toLowerCase().includes('kategori 3'));
  const tp4Col = headers.findIndex((h) => String(h).toLowerCase().includes('tp 4') || String(h).toLowerCase().includes('kategori 4'));

  if (tp1Col < 0) {
    throw new Error('Kolom TP 1 tidak ditemukan pada file Excel Rumusan TP.');
  }

  const result: RombelData = JSON.parse(JSON.stringify(currentData));
  if (!result.learningObjectives) {
    result.learningObjectives = {};
  }

  let count = 0;
  const subjectNames: string[] = [];

  for (let r = headerRowIndex + 1; r < rows.length; r++) {
    const row = rows[r];
    if (!row || row.length === 0) continue;

    const rawId = idCol >= 0 ? String(row[idCol] || '').trim() : '';
    const rawName = nameCol >= 0 ? String(row[nameCol] || '').trim().toLowerCase() : '';

    const matchedSubject = result.subjects.find(
      (s) =>
        (rawId && s.id.toLowerCase() === rawId.toLowerCase()) ||
        (rawName && s.name.toLowerCase() === rawName) ||
        (rawName && s.shortName.toLowerCase() === rawName)
    );

    if (!matchedSubject) continue;

    const tp1 = tp1Col >= 0 && row[tp1Col] ? String(row[tp1Col]).trim() : '';
    const tp2 = tp2Col >= 0 && row[tp2Col] ? String(row[tp2Col]).trim() : '';
    const tp3 = tp3Col >= 0 && row[tp3Col] ? String(row[tp3Col]).trim() : '';
    const tp4 = tp4Col >= 0 && row[tp4Col] ? String(row[tp4Col]).trim() : '';

    if (tp1 || tp2 || tp3 || tp4) {
      result.learningObjectives[matchedSubject.id] = [
        tp1 || 'Tujuan Pembelajaran 1',
        tp2 || 'Tujuan Pembelajaran 2',
        tp3 || 'Tujuan Pembelajaran 3',
        tp4 || 'Tujuan Pembelajaran 4',
      ];
      count++;
      subjectNames.push(matchedSubject.name);
    }
  }

  return { updatedData: result, count, subjectNames };
}

// -------------------------------------------------------------
// PENILAIAN SKALA & NILAI TP 1 - TP 4 SISWA EXCEL (SD KURIKULUM MERDEKA)
// -------------------------------------------------------------

export function parseTPInput(val: any): { score: number | null; status: TPStatus } {
  if (val === undefined || val === null) return { score: null, status: '-' };
  const str = String(val).trim().toUpperCase();
  if (str === '' || str === '-' || str === '0' || str === 'KOSONG') {
    return { score: null, status: '-' };
  }
  // Check scale strings
  if (str === 'SB' || str.includes('SANGAT BAIK')) {
    return { score: 90, status: 'SB' };
  }
  if (str === 'B' || str.includes('BAIK')) {
    return { score: 80, status: 'B' };
  }
  if (str === 'C' || str.includes('CUKUP')) {
    return { score: 70, status: 'C' };
  }
  if (str === 'PB' || str.includes('PERLU')) {
    return { score: 60, status: 'PB' };
  }
  // Check numeric
  const num = Number(val);
  if (!isNaN(num) && num >= 0 && num <= 100) {
    const rounded = Math.round(num);
    if (rounded === 0) return { score: null, status: '-' };
    return { score: rounded, status: scoreToTPStatus(rounded) };
  }
  return { score: null, status: '-' };
}

function normalizeTPScale(val: any): TPStatus {
  return parseTPInput(val).status;
}

/**
 * EXPORT: Penilaian Nilai & Skala TP 1 - TP 4 Siswa per Mapel ke Excel
 * Kolom: No, Student ID, NISN, Nama Siswa, Nilai TP 1, Nilai TP 2, Nilai TP 3, Nilai TP 4, Nilai Akhir, Capaian Narasi
 */
export async function exportNilaiTPExcel(
  data: RombelData,
  targetSubjectId?: string,
  isTemplate: boolean = false
): Promise<void> {
  const subject = data.subjects.find((s) => s.id === targetSubjectId) || data.subjects[0];
  if (!subject) return;

  const safeKelas = (data.identity.kelas || 'Kelas').replace(/\s+/g, '_');
  const safeRombel = (data.identity.rombel || data.rombelId).replace(/\s+/g, '_');
  const safeMapel = subject.shortName.replace(/\s+/g, '_');
  const filename = isTemplate
    ? `Template_Nilai_TP_${safeMapel}_${safeKelas}_${safeRombel}.xlsx`
    : `Format_Nilai_TP_${safeMapel}_${safeKelas}_${safeRombel}.xlsx`;

  const gradeMatch = (data.identity.kelas || '').match(/\d+/);
  const gradeNumber = gradeMatch ? parseInt(gradeMatch[0], 10) : 1;
  const tps = data.learningObjectives?.[subject.id] || getDefaultTPListForSubject(subject.id, gradeNumber);

  try {
    const wb = new ExcelJS.Workbook();
    wb.creator = 'Rapor Kurikulum Merdeka - SDN Babelan Kota 01';
    wb.created = new Date();

    const ws = wb.addWorksheet(subject.shortName.substring(0, 30), {
      views: [{ state: 'frozen', ySplit: 4, showGridLines: true }],
    });

    ws.columns = [
      { width: 6 },   // 1. No
      { width: 20 },  // 2. Student ID
      { width: 16 },  // 3. NISN
      { width: 30 },  // 4. Nama Siswa
      { width: 14 },  // 5. TP 1
      { width: 14 },  // 6. TP 2
      { width: 14 },  // 7. TP 3
      { width: 14 },  // 8. TP 4
      { width: 14 },  // 9. Nilai Akhir
      { width: 55 },  // 10. Capaian Narasi
    ];

    // Row 1: Judul Utama
    const titleRow = ws.addRow([
      `PENILAIAN TUJUAN PEMBELAJARAN (TP 1 - TP 4) - ${subject.name.toUpperCase()} [ID:${subject.id}]`,
    ]);
    titleRow.height = 26;
    ws.mergeCells(1, 1, 1, 10);
    const titleCell = titleRow.getCell(1);
    titleCell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
    titleCell.fill = EXCEL_FILLS.navy;
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' };

    // Row 2: Info Identitas & Rumusan TP
    const tpSummary = `TP 1: ${tps[0].substring(0, 45)}... | TP 2: ${tps[1].substring(0, 45)}...`;
    const infoRow = ws.addRow([
      `Kelas: ${data.identity.kelas || ''} | Rombel: ${data.identity.rombel || ''} | Semester: ${data.identity.semester || ''} | Tahun: ${data.identity.tahunPelajaran || ''} — (${tpSummary})`,
    ]);
    infoRow.height = 20;
    ws.mergeCells(2, 1, 2, 10);
    const infoCell = infoRow.getCell(1);
    infoCell.font = { name: 'Calibri', size: 9, bold: true, color: { argb: 'FF065F46' } };
    infoCell.fill = EXCEL_FILLS.emeraldLight;
    infoCell.alignment = { vertical: 'middle', horizontal: 'center' };

    // Row 3: Petunjuk Pengisian
    const guideRow = ws.addRow([
      `PETUNJUK: Masukkan nilai TP 1 s.d TP 4 berupa angka (0–100) atau skala (SB, B, C, PB). Jika hanya menilai 2 TP, kosongkan atau isi (-) pada TP lainnya. Nilai Akhir otomatis dihitung dari rata-rata TP yang diisi.`,
    ]);
    guideRow.height = 22;
    ws.mergeCells(3, 1, 3, 10);
    const guideCell = guideRow.getCell(1);
    guideCell.font = { name: 'Calibri', size: 9, italic: true, color: { argb: 'FF1E293B' } };
    guideCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
    guideCell.alignment = { vertical: 'middle', horizontal: 'center' };

    // Row 4: Header Kolom
    const headers = [
      'No',
      'Student ID (Sistem)',
      'NISN',
      'Nama Siswa',
      'Nilai TP 1',
      'Nilai TP 2',
      'Nilai TP 3',
      'Nilai TP 4',
      'Nilai Akhir',
      'Capaian Tujuan Pembelajaran (Narasi)',
    ];

    const headerRow = ws.addRow(headers);
    headerRow.height = 30;

    headers.forEach((_, colIdx) => {
      const c = colIdx + 1;
      const cell = headerRow.getCell(c);
      cell.font = EXCEL_FONTS.headerWhite;
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      cell.border = BORDER_HEADER;
      if (c <= 4) {
        cell.fill = EXCEL_FILLS.navy;
      } else if (c >= 5 && c <= 8) {
        cell.fill = EXCEL_FILLS.emeraldMedium;
      } else if (c === 9) {
        cell.fill = EXCEL_FILLS.amberHeader;
      } else {
        cell.fill = EXCEL_FILLS.indigoHeader;
      }
    });

    data.students.forEach((s, idx) => {
      const rowNum = idx + 5;
      const scores = data.tpScores?.[s.student_id]?.[subject.id];
      const assessment = data.tpAssessments?.[s.student_id]?.[subject.id] || ['B', 'B', '-', '-'];
      const currentGrade = data.grades[s.student_id]?.[subject.id] ?? '';
      const descText = data.descriptions[s.student_id]?.[subject.id] || '';

      const tp1Val = isTemplate
        ? 85
        : (scores?.[0] !== null && scores?.[0] !== undefined
          ? scores[0]
          : (assessment[0] && assessment[0] !== '-' ? assessment[0] : (currentGrade || '')));
      const tp2Val = isTemplate
        ? 80
        : (scores?.[1] !== null && scores?.[1] !== undefined
          ? scores[1]
          : (assessment[1] && assessment[1] !== '-' ? assessment[1] : (currentGrade || '')));
      const tp3Val = isTemplate
        ? '-'
        : (scores?.[2] !== null && scores?.[2] !== undefined
          ? scores[2]
          : (assessment[2] && assessment[2] !== '-' ? assessment[2] : '-'));
      const tp4Val = isTemplate
        ? '-'
        : (scores?.[3] !== null && scores?.[3] !== undefined
          ? scores[3]
          : (assessment[3] && assessment[3] !== '-' ? assessment[3] : '-'));

      const calculatedNA = isTemplate ? 83 : (currentGrade !== '' ? Number(currentGrade) : undefined);

      const row = ws.addRow([
        idx + 1,
        s.student_id,
        s.nisn || '',
        s.nama,
        tp1Val,
        tp2Val,
        tp3Val,
        tp4Val,
        calculatedNA ?? '',
        isTemplate ? '' : descText,
      ]);
      row.height = 36;
      const rowFill = idx % 2 === 0 ? EXCEL_FILLS.rowWhite : EXCEL_FILLS.rowZebra;

      for (let c = 1; c <= 10; c++) {
        const cell = row.getCell(c);
        cell.fill = rowFill;
        cell.border = BORDER_THIN;
        if (c === 1 || c === 2 || c === 3) {
          cell.font = EXCEL_FONTS.bodyRegular;
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        } else if (c === 4) {
          cell.font = EXCEL_FONTS.bodyBold;
          cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
        } else if (c >= 5 && c <= 8) {
          cell.font = EXCEL_FONTS.bodyBold;
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        } else if (c === 9) {
          cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FF065F46' } };
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
          // Excel formula for average of TP1 to TP4
          cell.value = {
            formula: `IFERROR(ROUND(AVERAGE(E${rowNum}:H${rowNum}), 0), "")`,
            result: calculatedNA,
          };
        } else {
          cell.font = EXCEL_FONTS.bodyRegular;
          cell.alignment = { vertical: 'top', horizontal: 'left', wrapText: true };
        }
      }
    });

    await downloadExcelJSWorkbook(wb, filename);
  } catch (err) {
    console.error('Failed exportNilaiTPExcel with ExcelJS, using fallback:', err);
    const wb = XLSX.utils.book_new();
    const headers = [
      'No',
      'Student ID (Sistem)',
      'NISN',
      'Nama Siswa',
      'Nilai TP 1',
      'Nilai TP 2',
      'Nilai TP 3',
      'Nilai TP 4',
      'Nilai Akhir',
      'Capaian Tujuan Pembelajaran',
    ];
    const rows = data.students.map((s, idx) => {
      const score = data.grades[s.student_id]?.[subject.id] ?? '';
      const scores = data.tpScores?.[s.student_id]?.[subject.id];
      const descText = data.descriptions[s.student_id]?.[subject.id] || '';
      return [
        idx + 1,
        s.student_id,
        s.nisn || '',
        s.nama,
        isTemplate ? 85 : (scores?.[0] ?? score ?? ''),
        isTemplate ? 80 : (scores?.[1] ?? score ?? ''),
        isTemplate ? '-' : (scores?.[2] ?? '-'),
        isTemplate ? '-' : (scores?.[3] ?? '-'),
        isTemplate ? 83 : score,
        isTemplate ? '' : descText,
      ];
    });
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    XLSX.utils.book_append_sheet(wb, ws, subject.shortName);
    XLSX.writeFile(wb, filename);
  }
}

/**
 * EXPORT: Penilaian TP 1 - TP 4 untuk SELURUH Mata Pelajaran dalam 1 File Excel (Multi-Sheet)
 */
export async function exportAllSubjectsNilaiTPExcel(
  data: RombelData,
  isTemplate: boolean = false
): Promise<void> {
  const safeKelas = (data.identity.kelas || 'Kelas').replace(/\s+/g, '_');
  const safeRombel = (data.identity.rombel || data.rombelId).replace(/\s+/g, '_');
  const filename = isTemplate
    ? `Template_Nilai_TP_Semua_Mapel_${safeKelas}_${safeRombel}.xlsx`
    : `Format_Nilai_TP_Semua_Mapel_${safeKelas}_${safeRombel}.xlsx`;

  const gradeMatch = (data.identity.kelas || '').match(/\d+/);
  const gradeNumber = gradeMatch ? parseInt(gradeMatch[0], 10) : 1;

  try {
    const wb = new ExcelJS.Workbook();
    wb.creator = 'Rapor Kurikulum Merdeka - SDN Babelan Kota 01';
    wb.created = new Date();

    for (const subject of data.subjects) {
      const sheetName = subject.shortName.substring(0, 30);
      const ws = wb.addWorksheet(sheetName, {
        views: [{ state: 'frozen', ySplit: 4, showGridLines: true }],
      });

      ws.columns = [
        { width: 6 },   // 1. No
        { width: 20 },  // 2. Student ID
        { width: 16 },  // 3. NISN
        { width: 30 },  // 4. Nama Siswa
        { width: 14 },  // 5. TP 1
        { width: 14 },  // 6. TP 2
        { width: 14 },  // 7. TP 3
        { width: 14 },  // 8. TP 4
        { width: 14 },  // 9. Nilai Akhir
        { width: 55 },  // 10. Capaian Narasi
      ];

      const tps = data.learningObjectives?.[subject.id] || getDefaultTPListForSubject(subject.id, gradeNumber);

      // Row 1: Judul
      const titleRow = ws.addRow([
        `PENILAIAN TUJUAN PEMBELAJARAN (TP 1 - TP 4) - ${subject.name.toUpperCase()} [ID:${subject.id}]`,
      ]);
      titleRow.height = 26;
      ws.mergeCells(1, 1, 1, 10);
      const titleCell = titleRow.getCell(1);
      titleCell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
      titleCell.fill = EXCEL_FILLS.navy;
      titleCell.alignment = { vertical: 'middle', horizontal: 'center' };

      // Row 2: Info
      const infoRow = ws.addRow([
        `Kelas: ${data.identity.kelas || ''} | Rombel: ${data.identity.rombel || ''} | Semester: ${data.identity.semester || ''} | Mapel: ${subject.name}`,
      ]);
      infoRow.height = 20;
      ws.mergeCells(2, 1, 2, 10);
      const infoCell = infoRow.getCell(1);
      infoCell.font = { name: 'Calibri', size: 9, bold: true, color: { argb: 'FF065F46' } };
      infoCell.fill = EXCEL_FILLS.emeraldLight;
      infoCell.alignment = { vertical: 'middle', horizontal: 'center' };

      // Row 3: Petunjuk
      const guideRow = ws.addRow([
        `PETUNJUK: Masukkan nilai TP 1 s.d TP 4 (0–100) atau skala (SB, B, C, PB). Kosongkan atau (-) jika tidak dinilai.`,
      ]);
      guideRow.height = 22;
      ws.mergeCells(3, 1, 3, 10);
      const guideCell = guideRow.getCell(1);
      guideCell.font = { name: 'Calibri', size: 9, italic: true, color: { argb: 'FF1E293B' } };
      guideCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
      guideCell.alignment = { vertical: 'middle', horizontal: 'center' };

      // Row 4: Header
      const headers = [
        'No',
        'Student ID (Sistem)',
        'NISN',
        'Nama Siswa',
        'Nilai TP 1',
        'Nilai TP 2',
        'Nilai TP 3',
        'Nilai TP 4',
        'Nilai Akhir',
        'Capaian Tujuan Pembelajaran (Narasi)',
      ];
      const headerRow = ws.addRow(headers);
      headerRow.height = 30;

      headers.forEach((_, colIdx) => {
        const c = colIdx + 1;
        const cell = headerRow.getCell(c);
        cell.font = EXCEL_FONTS.headerWhite;
        cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
        cell.border = BORDER_HEADER;
        if (c <= 4) cell.fill = EXCEL_FILLS.navy;
        else if (c >= 5 && c <= 8) cell.fill = EXCEL_FILLS.emeraldMedium;
        else if (c === 9) cell.fill = EXCEL_FILLS.amberHeader;
        else cell.fill = EXCEL_FILLS.indigoHeader;
      });

      data.students.forEach((s, idx) => {
        const rowNum = idx + 5;
        const scores = data.tpScores?.[s.student_id]?.[subject.id];
        const assessment = data.tpAssessments?.[s.student_id]?.[subject.id] || ['B', 'B', '-', '-'];
        const currentGrade = data.grades[s.student_id]?.[subject.id] ?? '';
        const descText = data.descriptions[s.student_id]?.[subject.id] || '';

        const tp1Val = isTemplate ? 85 : (scores?.[0] ?? (assessment[0] !== '-' ? assessment[0] : (currentGrade || '')));
        const tp2Val = isTemplate ? 80 : (scores?.[1] ?? (assessment[1] !== '-' ? assessment[1] : (currentGrade || '')));
        const tp3Val = isTemplate ? '-' : (scores?.[2] ?? (assessment[2] !== '-' ? assessment[2] : '-'));
        const tp4Val = isTemplate ? '-' : (scores?.[3] ?? (assessment[3] !== '-' ? assessment[3] : '-'));

        const calculatedNA = isTemplate ? 83 : (currentGrade !== '' ? Number(currentGrade) : undefined);

        const row = ws.addRow([
          idx + 1,
          s.student_id,
          s.nisn || '',
          s.nama,
          tp1Val,
          tp2Val,
          tp3Val,
          tp4Val,
          calculatedNA ?? '',
          isTemplate ? '' : descText,
        ]);
        row.height = 36;
        const rowFill = idx % 2 === 0 ? EXCEL_FILLS.rowWhite : EXCEL_FILLS.rowZebra;

        for (let c = 1; c <= 10; c++) {
          const cell = row.getCell(c);
          cell.fill = rowFill;
          cell.border = BORDER_THIN;
          if (c <= 3) {
            cell.font = EXCEL_FONTS.bodyRegular;
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
          } else if (c === 4) {
            cell.font = EXCEL_FONTS.bodyBold;
            cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
          } else if (c >= 5 && c <= 8) {
            cell.font = EXCEL_FONTS.bodyBold;
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
          } else if (c === 9) {
            cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FF065F46' } };
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
            cell.value = {
              formula: `IFERROR(ROUND(AVERAGE(E${rowNum}:H${rowNum}), 0), "")`,
              result: calculatedNA,
            };
          } else {
            cell.font = EXCEL_FONTS.bodyRegular;
            cell.alignment = { vertical: 'top', horizontal: 'left', wrapText: true };
          }
        }
      });
    }

    await downloadExcelJSWorkbook(wb, filename);
  } catch (err) {
    console.error('Failed exportAllSubjectsNilaiTPExcel:', err);
  }
}

/**
 * IMPORT: Penilaian Skala & Nilai TP 1 - TP 4 Siswa dari File Excel
 * Mendukung single-sheet (mapel aktif) maupun multi-sheet (seluruh mapel)
 */
export async function parseAndApplyNilaiTPExcel(
  file: File,
  currentData: RombelData,
  defaultSubjectId?: string
): Promise<{ updatedData: RombelData; count: number; studentNames: string[]; subjectsUpdated: string[] }> {
  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: 'array' });

  if (wb.SheetNames.length === 0) {
    throw new Error('File Excel tidak memiliki lembar kerja.');
  }

  const result: RombelData = JSON.parse(JSON.stringify(currentData));
  if (!result.tpAssessments) result.tpAssessments = {};
  if (!result.tpScores) result.tpScores = {};
  if (!result.grades) result.grades = {};
  if (!result.descriptions) result.descriptions = {};

  const gradeMatch = (currentData.identity.kelas || '').match(/\d+/);
  const gradeNumber = gradeMatch ? parseInt(gradeMatch[0], 10) : 1;

  let totalUpdatedStudents = 0;
  const affectedStudentNames: string[] = [];
  const affectedSubjectNames: string[] = [];

  // Iterate over sheets
  for (const sheetName of wb.SheetNames) {
    const ws = wb.Sheets[sheetName];
    if (!ws) continue;
    const rows: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });
    if (rows.length < 2) continue;

    // Determine target subject for this sheet
    let matchedSubject: Subject | undefined;

    // 1. Try finding [ID:xxx] in first 6 rows
    let headerRowIndex = 0;
    for (let i = 0; i < Math.min(7, rows.length); i++) {
      const r = rows[i];
      if (r && Array.isArray(r)) {
        const rowStr = r.map((c) => String(c || '')).join(' ');
        const idMatch = rowStr.match(/\[ID:([^\]]+)\]/i);
        if (idMatch && idMatch[1]) {
          const found = currentData.subjects.find((s) => s.id === idMatch[1].trim());
          if (found) {
            matchedSubject = found;
          }
        }
        if (
          r.some(
            (c) =>
              String(c).toLowerCase().includes('tp 1') ||
              String(c).toLowerCase().includes('nilai tp 1') ||
              String(c).toLowerCase().includes('nama siswa')
          )
        ) {
          headerRowIndex = i;
        }
      }
    }

    // 2. Try matching sheet name
    if (!matchedSubject) {
      const cleanSheet = sheetName.trim().toLowerCase();
      matchedSubject = currentData.subjects.find(
        (s) =>
          s.name.toLowerCase() === cleanSheet ||
          s.shortName.toLowerCase() === cleanSheet ||
          cleanSheet.includes(s.shortName.toLowerCase())
      );
    }

    // 3. Fallback to defaultSubjectId if only 1 sheet in workbook
    if (!matchedSubject && wb.SheetNames.length === 1) {
      matchedSubject = currentData.subjects.find((s) => s.id === defaultSubjectId) || currentData.subjects[0];
    }

    if (!matchedSubject) {
      continue; // Skip this sheet if not recognized as a subject
    }

    const headers = (rows[headerRowIndex] || []).map((h) => String(h || '').trim().toLowerCase());
    const idCol = headers.findIndex((h) => h.includes('student id') || h.includes('id sistem'));
    const nisnCol = headers.findIndex((h) => h.includes('nisn'));
    const namaCol = headers.findIndex((h) => h.includes('nama'));
    const tp1Col = headers.findIndex((h) => h.includes('tp 1') || h.includes('tp1') || h.includes('tujuan 1'));
    const tp2Col = headers.findIndex((h) => h.includes('tp 2') || h.includes('tp2') || h.includes('tujuan 2'));
    const tp3Col = headers.findIndex((h) => h.includes('tp 3') || h.includes('tp3') || h.includes('tujuan 3'));
    const tp4Col = headers.findIndex((h) => h.includes('tp 4') || h.includes('tp4') || h.includes('tujuan 4'));
    const nilaiAkhirCol = headers.findIndex(
      (h) => h.includes('nilai akhir') || h.includes('rata-rata') || h === 'nilai' || h.includes('nilai rapor')
    );
    const narasiCol = headers.findIndex((h) => h.includes('narasi') || h.includes('capaian') || h.includes('deskripsi'));

    if (tp1Col < 0 && nilaiAkhirCol < 0) {
      continue; // Not a valid TP sheet
    }

    const tps = result.learningObjectives?.[matchedSubject.id] || getDefaultTPListForSubject(matchedSubject.id, gradeNumber);

    if (!affectedSubjectNames.includes(matchedSubject.name)) {
      affectedSubjectNames.push(matchedSubject.name);
    }

    for (let r = headerRowIndex + 1; r < rows.length; r++) {
      const row = rows[r];
      if (!row || row.length === 0) continue;

      const rawId = idCol >= 0 ? String(row[idCol] || '').trim() : '';
      const rawNisn = nisnCol >= 0 ? String(row[nisnCol] || '').trim() : '';
      const rawNama = namaCol >= 0 ? String(row[namaCol] || '').trim().toLowerCase() : '';

      const targetStudent = result.students.find(
        (s) =>
          (rawId && s.student_id === rawId) ||
          (rawNisn && s.nisn && s.nisn === rawNisn) ||
          (rawNama && s.nama.toLowerCase() === rawNama)
      );

      if (!targetStudent) continue;

      const p1 = parseTPInput(tp1Col >= 0 ? row[tp1Col] : undefined);
      const p2 = parseTPInput(tp2Col >= 0 ? row[tp2Col] : undefined);
      const p3 = parseTPInput(tp3Col >= 0 ? row[tp3Col] : undefined);
      const p4 = parseTPInput(tp4Col >= 0 ? row[tp4Col] : undefined);

      const tpScores: [number | null, number | null, number | null, number | null] = [
        p1.score,
        p2.score,
        p3.score,
        p4.score,
      ];
      const tpStatuses: [TPStatus, TPStatus, TPStatus, TPStatus] = [
        p1.status,
        p2.status,
        p3.status,
        p4.status,
      ];

      // Calculate or extract Nilai Akhir
      let finalScore = calculateAverageTPScore(tpScores);
      if (nilaiAkhirCol >= 0) {
        const rawNA = row[nilaiAkhirCol];
        if (rawNA !== undefined && rawNA !== null && String(rawNA).trim() !== '') {
          const parsedNA = Number(rawNA);
          if (!isNaN(parsedNA) && parsedNA >= 0 && parsedNA <= 100) {
            finalScore = Math.round(parsedNA);
          }
        }
      }

      // Save grades
      if (!result.grades[targetStudent.student_id]) {
        result.grades[targetStudent.student_id] = {};
      }
      result.grades[targetStudent.student_id][matchedSubject.id] = finalScore;

      // Save tpScores
      if (!result.tpScores[targetStudent.student_id]) {
        result.tpScores[targetStudent.student_id] = {};
      }
      result.tpScores[targetStudent.student_id][matchedSubject.id] = tpScores;

      // Save tpAssessments
      if (!result.tpAssessments[targetStudent.student_id]) {
        result.tpAssessments[targetStudent.student_id] = {};
      }
      result.tpAssessments[targetStudent.student_id][matchedSubject.id] = tpStatuses;

      // Save descriptions
      if (!result.descriptions[targetStudent.student_id]) {
        result.descriptions[targetStudent.student_id] = {};
      }

      const customNarasi = narasiCol >= 0 && row[narasiCol] ? String(row[narasiCol]).trim() : '';
      if (customNarasi) {
        result.descriptions[targetStudent.student_id][matchedSubject.id] = customNarasi;
      } else {
        result.descriptions[targetStudent.student_id][matchedSubject.id] = composeNarrativeFromTPs(
          matchedSubject,
          tps,
          tpStatuses
        );
      }

      totalUpdatedStudents++;
      if (affectedStudentNames.length < 5 && !affectedStudentNames.includes(targetStudent.nama)) {
        affectedStudentNames.push(targetStudent.nama);
      }
    }
  }

  if (affectedSubjectNames.length === 0) {
    throw new Error('Tidak ada data nilai TP mata pelajaran yang dapat diidentifikasi dari file Excel ini.');
  }

  return {
    updatedData: result,
    count: totalUpdatedStudents,
    studentNames: affectedStudentNames,
    subjectsUpdated: affectedSubjectNames,
  };
}




