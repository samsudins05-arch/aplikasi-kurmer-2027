import React from 'react';
import { RombelData, ActiveTab } from '../types';
import {
  CheckSquare,
  AlertCircle,
  CheckCircle2,
  Users,
  FileSpreadsheet,
  BookOpenCheck,
  User,
  ArrowRight,
  ShieldAlert,
  Printer,
} from 'lucide-react';

interface CekDataViewProps {
  rombelData: RombelData;
  setActiveTab: (tab: ActiveTab) => void;
  onManualSave?: () => void;
  onOpenPrintRapor?: () => void;
}

export const CekDataView: React.FC<CekDataViewProps> = ({
  rombelData,
  setActiveTab,
  onManualSave,
  onOpenPrintRapor,
}) => {
  const identity = rombelData.identity;
  const students = rombelData.students;
  const subjects = rombelData.subjects;

  // 1. Audit Guru & Kepala Sekolah
  const identityIssues: { field: string; message: string }[] = [];
  if (!identity.namaGuru || identity.namaGuru.trim() === '') {
    identityIssues.push({ field: 'Nama Guru Kelas', message: 'Nama guru kelas masih kosong.' });
  }
  if (!identity.nipGuru || identity.nipGuru.trim() === '') {
    identityIssues.push({ field: 'NIP Guru Kelas', message: 'NIP guru kelas masih kosong.' });
  }
  if (!identity.namaKepalaSekolah || identity.namaKepalaSekolah.trim() === '') {
    identityIssues.push({ field: 'Nama Kepala Sekolah', message: 'Nama kepala sekolah masih kosong.' });
  }
  if (!identity.nipKepalaSekolah || identity.nipKepalaSekolah.trim() === '') {
    identityIssues.push({ field: 'NIP Kepala Sekolah', message: 'NIP kepala sekolah masih kosong.' });
  }

  // 2. Audit Siswa (NISN / Identitas)
  const studentIssues: { studentName: string; missing: string[] }[] = [];
  students.forEach((s) => {
    const missing: string[] = [];
    if (!s.nisn || s.nisn.trim() === '') missing.push('NISN');
    if (!s.nis || s.nis.trim() === '') missing.push('NIS');
    if (!s.tempatLahir || !s.tanggalLahir) missing.push('Tempat/Tgl Lahir');
    if (!s.namaOrtu || s.namaOrtu.trim() === '') missing.push('Nama Orang Tua');
    if (missing.length > 0) {
      studentIssues.push({ studentName: s.nama, missing });
    }
  });

  // 3. Audit Nilai Kosong
  const gradeIssues: { studentName: string; missingSubjects: string[] }[] = [];
  students.forEach((s) => {
    const studentGrades = rombelData.grades[s.student_id] || {};
    const missingSubjects: string[] = [];
    subjects.forEach((sub) => {
      const g = studentGrades[sub.id];
      if (g === null || g === undefined || isNaN(g)) {
        missingSubjects.push(sub.shortName || sub.name);
      }
    });
    if (missingSubjects.length > 0) {
      gradeIssues.push({ studentName: s.nama, missingSubjects });
    }
  });

  // 4. Audit Deskripsi Kosong
  const descriptionIssues: { studentName: string; missingSubjects: string[] }[] = [];
  students.forEach((s) => {
    const studentDescs = rombelData.descriptions[s.student_id] || {};
    const missingSubjects: string[] = [];
    subjects.forEach((sub) => {
      const d = studentDescs[sub.id];
      if (!d || d.trim() === '') {
        missingSubjects.push(sub.shortName || sub.name);
      }
    });
    if (missingSubjects.length > 0) {
      descriptionIssues.push({ studentName: s.nama, missingSubjects });
    }
  });

  const totalIssues =
    identityIssues.length +
    studentIssues.length +
    gradeIssues.length +
    descriptionIssues.length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-emerald-700" />
            <span>Audit Kelengkapan Data - {rombelData.identity.rombel}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Sistem memindai seluruh data siswa, nilai, deskripsi, dan identitas untuk memastikan tidak ada yang terlewat sebelum cetak rapor.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {totalIssues === 0 && students.length > 0 ? (
            <span className="px-3.5 py-1.5 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              100% DATA LENGKAP & SIAP CETAK
            </span>
          ) : (
            <span className="px-3.5 py-1.5 bg-amber-100 text-amber-900 text-xs font-bold rounded-lg flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-amber-700" />
              {totalIssues} Item Perlu Dilengkapi
            </span>
          )}

          <button
            id="btn-cekdata-print-rapor"
            onClick={() => {
              if (onManualSave) onManualSave();
              if (onOpenPrintRapor) {
                onOpenPrintRapor();
              } else {
                setActiveTab('print-rapor');
              }
            }}
            className="px-3.5 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
            title="Simpan data dan langsung buka halaman Cetak Rapor"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Buka Cetak Rapor</span>
          </button>
        </div>
      </div>

      {/* Overview stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Guru & Kepsek */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500">Identitas Guru & Kepsek</div>
            <div className={`text-xl font-bold mt-1 ${identityIssues.length > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
              {identityIssues.length > 0 ? `${identityIssues.length} Kosong` : 'Lengkap'}
            </div>
          </div>
          <button
            onClick={() => setActiveTab('settings')}
            className="p-2 text-slate-400 hover:text-emerald-700 hover:bg-slate-50 rounded-lg"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Siswa */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500">Identitas Siswa (NISN dll)</div>
            <div className={`text-xl font-bold mt-1 ${studentIssues.length > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
              {studentIssues.length > 0 ? `${studentIssues.length} Siswa Belum` : 'Lengkap'}
            </div>
          </div>
          <button
            onClick={() => setActiveTab('students')}
            className="p-2 text-slate-400 hover:text-emerald-700 hover:bg-slate-50 rounded-lg"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Nilai */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500">Nilai Mapel Rapor</div>
            <div className={`text-xl font-bold mt-1 ${gradeIssues.length > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
              {gradeIssues.length > 0 ? `${gradeIssues.length} Siswa Belum Lengkap` : 'Lengkap'}
            </div>
          </div>
          <button
            onClick={() => setActiveTab('grades')}
            className="p-2 text-slate-400 hover:text-emerald-700 hover:bg-slate-50 rounded-lg"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Tujuan Pembelajaran */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500">Tujuan Pembelajaran (TP)</div>
            <div className={`text-xl font-bold mt-1 ${descriptionIssues.length > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
              {descriptionIssues.length > 0 ? `${descriptionIssues.length} Siswa Belum` : 'Lengkap'}
            </div>
          </div>
          <button
            onClick={() => setActiveTab('descriptions')}
            className="p-2 text-slate-400 hover:text-emerald-700 hover:bg-slate-50 rounded-lg"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 1. Detail Identitas Guru & Kepala Sekolah */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5">
        <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2.5">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <User className="w-4 h-4 text-emerald-700" />
            <span>1. Identitas Guru Kelas & Kepala Sekolah</span>
          </h3>
          <button
            onClick={() => setActiveTab('settings')}
            className="text-xs font-semibold text-emerald-700 hover:underline"
          >
            Buka Pengaturan →
          </button>
        </div>

        {identityIssues.length > 0 ? (
          <div className="space-y-2">
            {identityIssues.map((item, idx) => (
              <div
                key={idx}
                className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs flex items-center justify-between"
              >
                <div className="flex items-center gap-2 text-amber-900">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span><strong>{item.field}:</strong> {item.message}</span>
                </div>
                <button
                  onClick={() => setActiveTab('settings')}
                  className="px-2.5 py-1 bg-white border border-amber-300 text-amber-900 rounded-md font-medium text-[11px] hover:bg-amber-100"
                >
                  Isi Sekarang
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-3 bg-emerald-50 text-emerald-800 rounded-lg text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Identitas guru kelas ({identity.namaGuru}) dan kepala sekolah ({identity.namaKepalaSekolah}) sudah terisi.</span>
          </div>
        )}
      </div>

      {/* 2. Detail Nilai yang Masih Kosong */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5">
        <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2.5">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
            <span>2. Nilai Siswa yang Belum Diisi</span>
          </h3>
          <button
            onClick={() => setActiveTab('grades')}
            className="text-xs font-semibold text-emerald-700 hover:underline"
          >
            Buka Input Nilai →
          </button>
        </div>

        {gradeIssues.length > 0 ? (
          <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
            {gradeIssues.map((item, idx) => (
              <div
                key={idx}
                className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-slate-900">{item.studentName}</div>
                  <div className="text-[11px] text-rose-700 mt-0.5">
                    Mapel belum dinilai ({item.missingSubjects.length}): {item.missingSubjects.join(', ')}
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('grades')}
                  className="px-2.5 py-1 bg-emerald-700 text-white rounded-md text-[11px] font-semibold hover:bg-emerald-800"
                >
                  Input Nilai
                </button>
              </div>
            ))}
          </div>
        ) : students.length > 0 ? (
          <div className="p-3 bg-emerald-50 text-emerald-800 rounded-lg text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Seluruh mata pelajaran untuk semua siswa telah lengkap diisi.</span>
          </div>
        ) : (
          <div className="text-xs text-slate-400">Belum ada siswa terdaftar.</div>
        )}
      </div>

      {/* 3. Detail Tujuan Pembelajaran yang Masih Kosong */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5">
        <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2.5">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <BookOpenCheck className="w-4 h-4 text-emerald-700" />
            <span>3. Capaian Tujuan Pembelajaran yang Belum Diisi</span>
          </h3>
          <button
            onClick={() => setActiveTab('descriptions')}
            className="text-xs font-semibold text-emerald-700 hover:underline"
          >
            Buka Tujuan Pembelajaran →
          </button>
        </div>

        {descriptionIssues.length > 0 ? (
          <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
            {descriptionIssues.map((item, idx) => (
              <div
                key={idx}
                className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-slate-900">{item.studentName}</div>
                  <div className="text-[11px] text-amber-700 mt-0.5">
                    Capaian TP kosong pada mapel ({item.missingSubjects.length}): {item.missingSubjects.join(', ')}
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('descriptions')}
                  className="px-2.5 py-1 bg-purple-700 text-white rounded-md text-[11px] font-semibold hover:bg-purple-800"
                >
                  Isi TP
                </button>
              </div>
            ))}
          </div>
        ) : students.length > 0 ? (
          <div className="p-3 bg-emerald-50 text-emerald-800 rounded-lg text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Seluruh capaian tujuan pembelajaran telah lengkap.</span>
          </div>
        ) : (
          <div className="text-xs text-slate-400">Belum ada data siswa.</div>
        )}
      </div>

      {/* Direct link to Cetak Rapor */}
      <div className="bg-gradient-to-r from-emerald-700 to-teal-800 rounded-xl p-5 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div>
          <h4 className="text-sm font-bold flex items-center gap-2">
            <Printer className="w-4 h-4 text-emerald-200" />
            <span>Siap Mencetak Rapor Kurikulum Merdeka?</span>
          </h4>
          <p className="text-xs text-emerald-100 mt-1">
            Buka halaman cetak untuk melihat format A4 resmi, input kehadiran semester, dan cetak satu atau semua siswa.
          </p>
        </div>
        <button
          id="btn-bottom-open-print"
          onClick={() => {
            if (onManualSave) onManualSave();
            if (onOpenPrintRapor) {
              onOpenPrintRapor();
            } else {
              setActiveTab('print-rapor');
            }
          }}
          className="px-4 py-2 bg-white text-emerald-800 hover:bg-emerald-50 rounded-lg text-xs font-bold transition-colors shadow-xs shrink-0 cursor-pointer flex items-center gap-1.5"
        >
          <Printer className="w-4 h-4 text-emerald-700" />
          <span>Buka Halaman Cetak Rapor</span>
        </button>
      </div>
    </div>
  );
};
