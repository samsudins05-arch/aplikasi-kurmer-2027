import React, { useState, useRef } from 'react';
import { RombelData } from '../types';
import {
  CalendarCheck,
  Save,
  Download,
  Upload,
  FileSpreadsheet,
  CheckCircle,
  Search,
  Sparkles,
  Info,
  AlertCircle,
  Check,
  FileDown,
  Printer,
} from 'lucide-react';
import {
  exportAttendanceAndNotesExcel,
  parseAndApplyAttendanceAndNotesExcel,
} from '../utils/excel';
import { saveRombelData } from '../utils/storage';

interface KehadiranCatatanViewProps {
  rombelData: RombelData;
  setRombelData: React.Dispatch<React.SetStateAction<RombelData>>;
  markDirty: () => void;
  onManualSave?: () => void;
  onOpenPrintRapor?: (studentId?: string) => void;
}

export const KehadiranCatatanView: React.FC<KehadiranCatatanViewProps> = ({
  rombelData,
  setRombelData,
  markDirty,
  onManualSave,
  onOpenPrintRapor,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [saveNotice, setSaveNotice] = useState<string | null>(null);
  const [importNotice, setImportNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const students = rombelData.students;

  // Filter students based on search term
  const filteredStudents = students.filter(
    (s) =>
      s.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.nisn && s.nisn.includes(searchTerm))
  );

  const handleAttendanceChange = (
    studentId: string,
    field: 'sakit' | 'izin' | 'alpa',
    value: string
  ) => {
    const num = value.trim() === '' ? null : Math.max(0, parseInt(value, 10) || 0);
    setRombelData((prev) => {
      const nextAtt = { ...prev.attendance };
      const current = nextAtt[studentId] || { sakit: null, izin: null, alpa: null };
      nextAtt[studentId] = {
        ...current,
        [field]: num,
      };
      return { ...prev, attendance: nextAtt };
    });
    markDirty();
  };

  const handleNoteChange = (studentId: string, value: string) => {
    setRombelData((prev) => ({
      ...prev,
      notes: {
        ...prev.notes,
        [studentId]: value,
      },
    }));
    markDirty();
  };

  const handleSave = () => {
    saveRombelData(rombelData);
    if (onManualSave) onManualSave();
    setSaveNotice('Data kehadiran dan catatan wali kelas berhasil disimpan!');
    setTimeout(() => setSaveNotice(null), 3500);
  };

  const handleExportExcel = () => {
    exportAttendanceAndNotesExcel(rombelData, false);
  };

  const handleDownloadTemplate = () => {
    exportAttendanceAndNotesExcel(rombelData, true);
  };

  const handleTriggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportNotice(null);

    try {
      const { updatedData, count, studentNames } = await parseAndApplyAttendanceAndNotesExcel(
        file,
        rombelData
      );

      setRombelData(updatedData);
      saveRombelData(updatedData);
      markDirty();

      setImportNotice({
        type: 'success',
        message: `Berhasil mengimpor data kehadiran & catatan untuk ${count} siswa! (${studentNames.slice(0, 3).join(', ')}${studentNames.length > 3 ? ', dll' : ''})`,
      });
      setTimeout(() => setImportNotice(null), 5000);
    } catch (err: any) {
      console.error('Error importing attendance/notes:', err);
      setImportNotice({
        type: 'error',
        message: err.message || 'Gagal membaca atau memproses file Excel. Pastikan format kolom sesuai.',
      });
    } finally {
      setIsImporting(false);
    }
  };

  // Quick fill all empty attendances with 0
  const handleFillZeroEmpty = () => {
    setRombelData((prev) => {
      const nextAtt = { ...prev.attendance };
      prev.students.forEach((s) => {
        const cur = nextAtt[s.student_id] || { sakit: null, izin: null, alpa: null };
        nextAtt[s.student_id] = {
          sakit: cur.sakit === null ? 0 : cur.sakit,
          izin: cur.izin === null ? 0 : cur.izin,
          alpa: cur.alpa === null ? 0 : cur.alpa,
        };
      });
      return { ...prev, attendance: nextAtt };
    });
    markDirty();
    setSaveNotice('Kehadiran yang kosong berhasil diisi 0 (nihil)!');
    setTimeout(() => setSaveNotice(null), 3000);
  };

  // Quick note template suggestions
  const noteSuggestions = [
    'Pertahankan prestasimu, teruslah rajin belajar dan beribadah.',
    'Ananda memiliki sikap yang santun dan disiplin yang baik. Tingkatkan terus belajarmu!',
    'Tingkatkan keaktifan dan fokus dalam pembelajaran agar hasil semakin maksimal.',
    'Selalu tekun dan rajin belajar, kembangkan potensi bakatmu secara percaya diri.',
  ];

  // Stats calculation
  const totalStudents = students.length;
  const withNotes = students.filter((s) => (rombelData.notes[s.student_id] || '').trim() !== '').length;
  const withAttendance = students.filter((s) => {
    const a = rombelData.attendance[s.student_id];
    return a && (a.sakit !== null || a.izin !== null || a.alpa !== null);
  }).length;

  return (
    <div className="space-y-6 pb-16">
      {/* Hidden file input for Excel import */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".xlsx, .xls"
        className="hidden"
      />

      {/* Notifications */}
      {saveNotice && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold rounded-xl flex items-center gap-2.5 shadow-xs">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{saveNotice}</span>
        </div>
      )}

      {importNotice && (
        <div
          className={`p-3.5 border text-xs font-semibold rounded-xl flex items-center gap-2.5 shadow-xs ${
            importNotice.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
              : 'bg-rose-50 border-rose-300 text-rose-900'
          }`}
        >
          {importNotice.type === 'success' ? (
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{importNotice.message}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-50 text-emerald-700 rounded-lg">
              <CalendarCheck className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Input Kehadiran & Catatan Wali Kelas
              </h2>
              <p className="text-xs text-slate-500">
                {rombelData.identity.namaSekolah} • {rombelData.identity.rombel} (Semester {rombelData.identity.semester})
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons: Export, Import, Save */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          <button
            id="btn-download-template-att"
            onClick={handleDownloadTemplate}
            title="Unduh template Excel kosong untuk kehadiran & catatan"
            className="px-3 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <FileDown className="w-4 h-4 text-slate-500" />
            <span className="hidden sm:inline">Template Excel</span>
          </button>

          <button
            id="btn-export-excel-att"
            onClick={handleExportExcel}
            title="Ekspor data kehadiran dan catatan ke file Excel"
            className="px-3.5 py-2 bg-emerald-50 border border-emerald-300 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-700" />
            <span>Ekspor Excel</span>
          </button>

          <button
            id="btn-import-excel-att"
            onClick={handleTriggerFileInput}
            disabled={isImporting}
            title="Impor data kehadiran dan catatan dari file Excel"
            className="px-3.5 py-2 bg-purple-50 border border-purple-300 hover:bg-purple-100 text-purple-800 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer disabled:opacity-50"
          >
            <Upload className="w-4 h-4 text-purple-700" />
            <span>{isImporting ? 'Mengimpor...' : 'Impor Excel'}</span>
          </button>

          <button
            id="btn-save-att-notes"
            onClick={handleSave}
            title="Simpan perubahan ke memori aplikasi"
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer ml-auto sm:ml-0"
          >
            <Save className="w-4 h-4" />
            <span>Simpan</span>
          </button>
        </div>
      </div>

      {/* Overview Stat Cards & Quick Fill Tools */}
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500">Total Siswa</span>
          <div className="text-2xl font-black text-slate-800 mt-1">{totalStudents}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Rombel {rombelData.identity.rombel}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500">Kehadiran Terisi</span>
          <div className="text-2xl font-black text-emerald-700 mt-1">
            {withAttendance} <span className="text-xs font-semibold text-slate-500">/ {totalStudents}</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Sakit, Izin, atau Alpa</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500">Catatan Terisi</span>
          <div className="text-2xl font-black text-purple-700 mt-1">
            {withNotes} <span className="text-xs font-semibold text-slate-500">/ {totalStudents}</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Narasi wali kelas</p>
        </div>

        <div className="bg-gradient-to-br from-slate-50 to-emerald-50/40 p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-700">Aksi Cepat</span>
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <button
            onClick={handleFillZeroEmpty}
            className="mt-2 w-full py-1.5 px-2.5 bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-[11px] font-bold text-center transition-colors cursor-pointer shadow-2xs"
          >
            Isi 0 untuk Absensi Kosong
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {/* Search & Instruction Bar */}
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-50/50">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari nama atau NISN siswa..."
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>Angka absensi dalam satuan hari. Anda dapat mengetik langsung atau impor via Excel.</span>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-800 text-white font-semibold">
                <th className="py-3 px-3 w-10 text-center">No</th>
                <th className="py-3 px-4 w-48">Nama Siswa</th>
                <th className="py-3 px-3 w-24">NISN</th>
                <th className="py-3 px-2.5 w-20 text-center bg-slate-700/80">Sakit (Hari)</th>
                <th className="py-3 px-2.5 w-20 text-center bg-slate-700/80">Izin (Hari)</th>
                <th className="py-3 px-2.5 w-20 text-center bg-slate-700/80">Alpa (Hari)</th>
                <th className="py-3 px-4 min-w-[320px]">Catatan Wali Kelas</th>
                <th className="py-3 px-3 w-20 text-center">Rapor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((student, idx) => {
                const att = rombelData.attendance[student.student_id] || {
                  sakit: null,
                  izin: null,
                  alpa: null,
                };
                const note = rombelData.notes[student.student_id] || '';

                return (
                  <tr
                    key={student.student_id}
                    className="hover:bg-emerald-50/30 transition-colors group"
                  >
                    <td className="py-3 px-3 text-center text-slate-400 font-medium">
                      {idx + 1}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{student.nama}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        NIS: {student.nis || '-'}
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-600">
                      {student.nisn || '-'}
                    </td>

                    {/* Sakit */}
                    <td className="py-2 px-1 text-center bg-slate-50/50">
                      <input
                        type="number"
                        min="0"
                        max="365"
                        value={att.sakit !== null ? att.sakit : ''}
                        onChange={(e) =>
                          handleAttendanceChange(student.student_id, 'sakit', e.target.value)
                        }
                        placeholder="0"
                        className="w-16 py-1 px-1.5 text-center bg-white border border-slate-200 rounded-md text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                      />
                    </td>

                    {/* Izin */}
                    <td className="py-2 px-1 text-center bg-slate-50/50">
                      <input
                        type="number"
                        min="0"
                        max="365"
                        value={att.izin !== null ? att.izin : ''}
                        onChange={(e) =>
                          handleAttendanceChange(student.student_id, 'izin', e.target.value)
                        }
                        placeholder="0"
                        className="w-16 py-1 px-1.5 text-center bg-white border border-slate-200 rounded-md text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                      />
                    </td>

                    {/* Alpa */}
                    <td className="py-2 px-1 text-center bg-slate-50/50">
                      <input
                        type="number"
                        min="0"
                        max="365"
                        value={att.alpa !== null ? att.alpa : ''}
                        onChange={(e) =>
                          handleAttendanceChange(student.student_id, 'alpa', e.target.value)
                        }
                        placeholder="0"
                        className="w-16 py-1 px-1.5 text-center bg-white border border-slate-200 rounded-md text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                      />
                    </td>

                    {/* Catatan Wali Kelas */}
                    <td className="py-2 px-4">
                      <div className="space-y-1.5">
                        <textarea
                          rows={2}
                          value={note}
                          onChange={(e) => handleNoteChange(student.student_id, e.target.value)}
                          placeholder="Tuliskan catatan perkembangan karakter, prestasi, atau motivasi belajar siswa..."
                          className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 leading-relaxed focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                        />
                        {/* Quick suggestions shortcut */}
                        {!note && (
                          <div className="flex flex-wrap gap-1">
                            <span className="text-[10px] text-slate-400 flex items-center gap-0.5 mr-1">
                              Ide cepat:
                            </span>
                            {noteSuggestions.slice(0, 2).map((sug, sIdx) => (
                              <button
                                key={sIdx}
                                type="button"
                                onClick={() => handleNoteChange(student.student_id, sug)}
                                className="text-[10px] px-2 py-0.5 bg-slate-100 hover:bg-emerald-100 hover:text-emerald-800 text-slate-600 rounded-md transition-colors truncate max-w-[200px]"
                                title={sug}
                              >
                                {sug}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Action */}
                    <td className="py-3 px-3 text-center">
                      {onOpenPrintRapor && (
                        <button
                          onClick={() => onOpenPrintRapor(student.student_id)}
                          title={`Lihat cetak rapor untuk ${student.nama}`}
                          className="p-1.5 text-purple-700 hover:bg-purple-100 rounded-md transition-colors cursor-pointer inline-flex items-center justify-center"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}

              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    {students.length === 0
                      ? 'Belum ada data siswa. Silakan tambahkan siswa di menu Data Siswa atau Impor Excel.'
                      : 'Tidak ada siswa yang sesuai dengan pencarian.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
