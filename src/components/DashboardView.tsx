import React from 'react';
import { RombelData, RombelInfo, ActiveTab } from '../types';
import {
  Users,
  CheckCircle,
  AlertCircle,
  FileSpreadsheet,
  Download,
  Upload,
  Printer,
  Sparkles,
  School,
  ArrowRight,
  ShieldCheck,
  Award,
  CalendarCheck,
  Trophy,
} from 'lucide-react';

interface DashboardViewProps {
  rombelInfo: RombelInfo;
  rombelData: RombelData;
  setActiveTab: (tab: ActiveTab) => void;
  onExportExcel: () => void;
  onImportExcelModal: () => void;
  onDownloadTemplate: () => void;
  onOpenPrintRapor?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  rombelInfo,
  rombelData,
  setActiveTab,
  onExportExcel,
  onImportExcelModal,
  onDownloadTemplate,
  onOpenPrintRapor,
}) => {
  const students = rombelData.students;
  const subjects = rombelData.subjects;
  const totalStudents = students.length;

  // Calculate stats
  let totalPossibleGrades = totalStudents * subjects.length;
  let filledGradesCount = 0;
  let studentsCompleteGrades = 0;
  let studentsIncompleteGrades = 0;
  let studentsWithIdentityComplete = 0;

  students.forEach((s) => {
    const studentGrades = rombelData.grades[s.student_id] || {};
    let filledForStudent = 0;

    subjects.forEach((sub) => {
      const g = studentGrades[sub.id];
      if (g !== null && g !== undefined && !isNaN(g)) {
        filledGradesCount++;
        filledForStudent++;
      }
    });

    if (filledForStudent === subjects.length && subjects.length > 0) {
      studentsCompleteGrades++;
    } else {
      studentsIncompleteGrades++;
    }

    // Identity complete check
    if (s.nama && (s.nisn || s.nis) && s.jenisKelamin) {
      studentsWithIdentityComplete++;
    }
  });

  // Ekstrakurikuler stats
  let studentsWithExtracurricular = 0;
  const activeExtracurricularNames = new Set<string>();
  students.forEach((s) => {
    const ekskuls = rombelData.extracurriculars[s.student_id] || [];
    if (ekskuls.length > 0) {
      studentsWithExtracurricular++;
      ekskuls.forEach((e) => {
        if (e.name && e.name.trim()) activeExtracurricularNames.add(e.name.trim());
      });
    }
  });
  const ekskulPercentage = totalStudents > 0
    ? Math.round((studentsWithExtracurricular / totalStudents) * 100)
    : 0;

  const emptyGradesCount = Math.max(0, totalPossibleGrades - filledGradesCount);
  const gradePercentage = totalPossibleGrades > 0
    ? Math.round((filledGradesCount / totalPossibleGrades) * 100)
    : 0;

  return (
    <div className="space-y-6 pb-12">
      {/* Identity Card */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 rounded-2xl text-white p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 bg-white rounded-xl p-1.5 flex items-center justify-center shrink-0 shadow-md border border-emerald-200/40">
            <img
              src={rombelData.identity.logoUrl || 'https://i.ibb.co.com/gb2y0gwD/logo-bakot-01.png'}
              alt="Logo SDN Babelan Kota 01"
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-white/10 rounded-full text-xs font-semibold text-emerald-200 border border-white/10">
              <span>{rombelData.identity.namaSekolah}</span>
              <span>•</span>
              <span className="font-mono text-white">NPSN: {rombelData.identity.npsn || '20219135'}</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <span>Rapor Kurikulum Merdeka - {rombelInfo.name}</span>
            </h2>
            <p className="text-emerald-100 text-xs sm:text-sm">
              Fase: <strong className="text-white">{rombelInfo.phase}</strong> • Tahun Pelajaran: <strong className="text-white">{rombelData.identity.tahunPelajaran}</strong> ({rombelData.identity.semester})
            </p>
            <p className="text-emerald-200/80 text-[11px]">
              Guru Kelas: <span className="font-semibold text-white">{rombelData.identity.namaGuru || '(Belum diisi - atur di Pengaturan)'}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            id="dash-btn-import"
            onClick={onImportExcelModal}
            className="px-3.5 py-2 bg-white text-slate-800 hover:bg-slate-100 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-emerald-700" />
            <span>Import Excel</span>
          </button>
          <button
            id="dash-btn-export"
            onClick={onExportExcel}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {/* Mandatory Statistics Cards (Section S) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* 1. Jumlah Siswa */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Jumlah Siswa</span>
            <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">
            {totalStudents}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Terdaftar di {rombelInfo.name}
          </p>
        </div>

        {/* 2. Nilai Sudah Diisi */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Nilai Sudah Diisi</span>
            <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CheckCircle className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-700">
            {filledGradesCount}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {gradePercentage}% dari {totalPossibleGrades} entri
          </p>
        </div>

        {/* 3. Nilai Belum Diisi */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Nilai Belum Diisi</span>
            <span className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-black text-amber-700">
            {emptyGradesCount}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Slot nilai belum terisi
          </p>
        </div>

        {/* 4. Nilai Lengkap */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Nilai Lengkap</span>
            <span className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-black text-teal-700">
            {studentsCompleteGrades}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Siswa nilai 100% tuntas
          </p>
        </div>

        {/* 5. Data Belum Lengkap */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Belum Lengkap</span>
            <span className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-black text-rose-700">
            {studentsIncompleteGrades}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Perlu pengisian lanjutan
          </p>
        </div>

        {/* 6. Ekstrakurikuler */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Ekstrakurikuler</span>
            <span className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
              <Trophy className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-black text-purple-700">
            {studentsWithExtracurricular}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {ekskulPercentage}% ({activeExtracurricularNames.size} jenis aktif)
          </p>
        </div>
      </div>

      {/* Quick Action Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div
          id="card-action-students"
          onClick={() => setActiveTab('students')}
          className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-2xs hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-3">
              <Users className="w-4.5 h-4.5" />
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
              1. Data Siswa
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Identitas siswa, NIS, NISN, orang tua, & import Excel.
            </p>
          </div>
          <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-emerald-700">
            <span>Buka Data</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        <div
          id="card-action-grades"
          onClick={() => setActiveTab('grades')}
          className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-2xs hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
              <FileSpreadsheet className="w-4.5 h-4.5" />
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
              2. Input Nilai
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Tabel spreadsheet nilai 0–100 per mata pelajaran.
            </p>
          </div>
          <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-emerald-700">
            <span>Buka Nilai</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        <div
          id="card-action-attendance"
          onClick={() => setActiveTab('attendance')}
          className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-2xs hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-3">
              <CalendarCheck className="w-4.5 h-4.5" />
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
              3. Kehadiran & Catatan
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Sakit, Izin, Alpa, & Catatan Wali Kelas (Bagian C & D).
            </p>
          </div>
          <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-amber-700">
            <span>Kehadiran</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        <div
          id="card-action-ekskul"
          onClick={() => setActiveTab('extracurricular')}
          className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-2xs hover:border-purple-500 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center mb-3">
              <Trophy className="w-4.5 h-4.5" />
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-purple-700 transition-colors">
              4. Ekstrakurikuler
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Pramuka, Olahraga, Kesenian, Predikat, & Keterangan (Bagian B).
            </p>
          </div>
          <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-purple-700">
            <span>Kelola Ekskul</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        <div
          id="card-action-print"
          onClick={() => (onOpenPrintRapor ? onOpenPrintRapor() : setActiveTab('print-rapor'))}
          className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-2xs hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mb-3">
              <Printer className="w-4.5 h-4.5" />
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
              5. Cetak & Unduh PDF
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Format A4 Bagian A, B, C, D siap unduh PDF sempurna.
            </p>
          </div>
          <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-teal-700">
            <span>Cetak PDF</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      {/* Subject list overview */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
        <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-700" />
            <h3 className="text-sm font-bold text-slate-900">
              Mata Pelajaran Kurikulum Merdeka ({subjects.length} Mapel)
            </h3>
          </div>
          <button
            onClick={() => setActiveTab('settings')}
            className="text-xs text-emerald-700 hover:underline font-semibold"
          >
            Sesuaikan Mata Pelajaran →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {subjects.map((sub, idx) => {
            // Count filled for this subject
            let subFilled = 0;
            students.forEach((s) => {
              const sc = rombelData.grades[s.student_id]?.[sub.id];
              if (sc !== null && sc !== undefined && !isNaN(sc)) {
                subFilled++;
              }
            });
            const pct = totalStudents > 0 ? Math.round((subFilled / totalStudents) * 100) : 0;

            return (
              <div
                key={sub.id}
                className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-[10px] flex items-center justify-center font-bold">
                      {idx + 1}
                    </span>
                    <span className="truncate max-w-[180px]">{sub.name}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 ml-6.5">
                    Terisi: {subFilled}/{totalStudents} siswa ({pct}%)
                  </div>
                </div>
                <div className="w-10 h-10 shrink-0">
                  <div className="text-[10px] font-bold text-emerald-700 bg-emerald-100 rounded-md px-1.5 py-0.5 text-center">
                    {sub.shortName}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Ekstrakurikuler Overview Section */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-purple-700" />
            <h3 className="text-sm font-bold text-slate-900">
              Kegiatan Ekstrakurikuler Siswa (Kurikulum Merdeka - Bagian B Rapor)
            </h3>
            <span className="px-2 py-0.5 bg-purple-100 text-purple-800 font-bold rounded-full text-[10px]">
              {studentsWithExtracurricular} / {totalStudents} Siswa
            </span>
          </div>
          <button
            id="dash-btn-goto-ekskul"
            onClick={() => setActiveTab('extracurricular')}
            className="text-xs text-purple-700 hover:text-purple-900 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
          >
            <span>Kelola Ekstrakurikuler Lengkap →</span>
          </button>
        </div>

        {activeExtracurricularNames.size === 0 ? (
          <div className="p-5 bg-purple-50/50 border border-dashed border-purple-200 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div>
              <p className="text-xs font-semibold text-purple-950">
                Belum ada kegiatan ekstrakurikuler yang dicatat untuk rombel ini.
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Secara baku pada cetak rapor akan ditampilkan Praja Muda Karana (Pramuka). Anda dapat mengkustomisasi kegiatan per siswa.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('extracurricular')}
              className="px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-xs font-bold shrink-0 cursor-pointer shadow-xs transition-colors"
            >
              + Kelola Ekstrakurikuler
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {Array.from(activeExtracurricularNames).map((activityName, idx) => {
              // Count how many students enrolled in this activity
              let count = 0;
              students.forEach((s) => {
                const list = rombelData.extracurriculars[s.student_id] || [];
                if (list.some((item) => item.name.trim() === activityName)) {
                  count++;
                }
              });

              return (
                <div
                  key={idx}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between"
                >
                  <div>
                    <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-800 text-[10px] flex items-center justify-center font-bold">
                        {idx + 1}
                      </span>
                      <span className="truncate max-w-[200px]">{activityName}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 ml-6.5">
                      Diikuti: <strong className="text-slate-800">{count}</strong> siswa
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded-md">
                    Aktif
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Empty State Banner if no students */}
      {totalStudents === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
          <AlertCircle className="w-8 h-8 text-amber-600 mx-auto mb-2" />
          <h4 className="text-sm font-bold text-amber-900">
            Data Siswa {rombelInfo.name} Masih Kosong
          </h4>
          <p className="text-xs text-amber-700 max-w-lg mx-auto mt-1 mb-4">
            Sesuai ketentuan, data siswa dan nilai pada template awal dalam keadaan kosong. Anda dapat menambahkan siswa satu per satu, mengunggah file Excel, atau mengunduh template kosong.
          </p>
          <div className="flex flex-wrap justify-center gap-2.5">
            <button
              onClick={() => setActiveTab('students')}
              className="px-4 py-2 bg-emerald-700 text-white rounded-lg text-xs font-bold hover:bg-emerald-800 transition-colors"
            >
              + Tambah Siswa Baru
            </button>
            <button
              onClick={onImportExcelModal}
              className="px-4 py-2 bg-white border border-amber-300 text-amber-900 rounded-lg text-xs font-bold hover:bg-amber-100 transition-colors"
            >
              Import Data Siswa dari Excel
            </button>
            <button
              onClick={onDownloadTemplate}
              className="px-4 py-2 bg-slate-100 border border-slate-300 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-200 transition-colors"
            >
              Download Template Kosong (.xlsx)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
