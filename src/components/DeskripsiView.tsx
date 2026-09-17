import React, { useState, useRef, useMemo } from 'react';
import { RombelData, Subject, Student, TPStatus } from '../types';
import {
  BookOpenCheck,
  Save,
  Search,
  CheckCircle,
  AlertCircle,
  Download,
  Upload,
  FileDown,
  Layers,
  RefreshCw,
  Edit3,
  FileSpreadsheet,
  Info,
  RotateCcw,
  X,
} from 'lucide-react';
import {
  exportRumusanTPExcel,
  parseAndApplyRumusanTPExcel,
  exportNilaiTPExcel,
  parseAndApplyNilaiTPExcel,
} from '../utils/excel';
import { saveRombelData } from '../utils/storage';
import {
  getDefaultTPListForSubject,
  composeNarrativeFromTPs,
  TP_STATUS_CONFIG,
} from '../utils/tujuanPembelajaran';

interface DeskripsiViewProps {
  rombelData: RombelData;
  setRombelData: React.Dispatch<React.SetStateAction<RombelData>>;
  markDirty: () => void;
  onManualSave: () => void;
}

export const DeskripsiView: React.FC<DeskripsiViewProps> = ({
  rombelData,
  setRombelData,
  markDirty,
  onManualSave,
}) => {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    rombelData.subjects[0]?.id || ''
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [showEditRumusanModal, setShowEditRumusanModal] = useState(false);
  const [editingTPs, setEditingTPs] = useState<[string, string, string, string]>(['', '', '', '']);

  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);
  const [isProcessingExcel, setIsProcessingExcel] = useState(false);

  const fileInputRumusanRef = useRef<HTMLInputElement>(null);
  const fileInputNilaiTPRef = useRef<HTMLInputElement>(null);

  const students = rombelData.students;
  const subjects = rombelData.subjects;

  // Jenjang kelas aktif
  const gradeNumber = useMemo(() => {
    const match = (rombelData.identity.kelas || '').match(/\d+/);
    return match ? parseInt(match[0], 10) : 1;
  }, [rombelData.identity.kelas]);

  // Subject yang sedang aktif
  const currentSubject =
    subjects.find((s) => s.id === selectedSubjectId) || subjects[0] || {
      id: 'pabp',
      name: 'Pendidikan Agama dan Budi Pekerti',
      shortName: 'PABP',
    };

  // Mendapatkan 4 TP suatu mapel
  const getSubjectTPs = (subjectId: string): [string, string, string, string] => {
    if (rombelData.learningObjectives && rombelData.learningObjectives[subjectId]) {
      return rombelData.learningObjectives[subjectId];
    }
    return getDefaultTPListForSubject(subjectId, gradeNumber);
  };

  // Mendapatkan status 4 TP siswa pada mapel tertentu
  const getStudentTPStatus = (
    studentId: string,
    subjectId: string
  ): [TPStatus, TPStatus, TPStatus, TPStatus] => {
    const assessment = rombelData.tpAssessments?.[studentId]?.[subjectId];
    if (assessment && assessment.length === 4) {
      return assessment;
    }
    // Default: TP 1 dan 2 = B, TP 3 dan 4 = - (sesuai kebutuhan guru jika hanya mengisi 2 TP)
    return ['B', 'B', '-', '-'];
  };

  // Filter siswa
  const filteredStudents = students.filter(
    (s) =>
      s.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.nisn && s.nisn.includes(searchTerm))
  );

  // -------------------------------------------------------------
  // EXCEL HANDLERS: RUMUSAN TP (TP 1 - TP 4)
  // -------------------------------------------------------------
  const handleDownloadTemplateRumusanTP = async () => {
    setIsProcessingExcel(true);
    try {
      await exportRumusanTPExcel(rombelData, true);
    } catch (err: any) {
      console.error(err);
      setNotification({ type: 'error', message: 'Gagal mengunduh template rumusan TP.' });
    } finally {
      setIsProcessingExcel(false);
    }
  };

  const handleExportRumusanTP = async () => {
    setIsProcessingExcel(true);
    try {
      await exportRumusanTPExcel(rombelData, false);
      setNotification({
        type: 'success',
        message: 'File Excel Rumusan Tujuan Pembelajaran berhasil diunduh.',
      });
      setTimeout(() => setNotification(null), 4000);
    } catch (err: any) {
      console.error(err);
      setNotification({ type: 'error', message: 'Gagal mengekspor file rumusan TP.' });
    } finally {
      setIsProcessingExcel(false);
    }
  };

  const handleTriggerImportRumusanTP = () => {
    if (fileInputRumusanRef.current) {
      fileInputRumusanRef.current.value = '';
      fileInputRumusanRef.current.click();
    }
  };

  const handleFileChangeRumusanTP = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingExcel(true);
    setNotification(null);

    try {
      const { updatedData, count, subjectNames } = await parseAndApplyRumusanTPExcel(
        file,
        rombelData
      );

      setRombelData(updatedData);
      saveRombelData(updatedData);
      markDirty();

      setNotification({
        type: 'success',
        message: `Berhasil mengimpor rumusan 4 TP untuk ${count} mata pelajaran! (${subjectNames.slice(0, 3).join(', ')}${subjectNames.length > 3 ? ', dll' : ''})`,
      });
      setTimeout(() => setNotification(null), 5000);
    } catch (err: any) {
      console.error('Error import rumusan TP:', err);
      setNotification({
        type: 'error',
        message: err.message || 'Gagal membaca file Excel Rumusan TP. Pastikan format kolom sesuai.',
      });
    } finally {
      setIsProcessingExcel(false);
    }
  };

  // -------------------------------------------------------------
  // EXCEL HANDLERS: PENILAIAN SKALA TP 1 - TP 4 SISWA (SB, B, C, PB, -)
  // -------------------------------------------------------------
  const handleDownloadTemplateNilaiTP = async () => {
    setIsProcessingExcel(true);
    try {
      await exportNilaiTPExcel(rombelData, selectedSubjectId, true);
    } catch (err: any) {
      console.error(err);
      setNotification({ type: 'error', message: 'Gagal mengunduh template nilai TP.' });
    } finally {
      setIsProcessingExcel(false);
    }
  };

  const handleExportNilaiTP = async () => {
    setIsProcessingExcel(true);
    try {
      await exportNilaiTPExcel(rombelData, selectedSubjectId, false);
      setNotification({
        type: 'success',
        message: `File Excel Penilaian TP ${currentSubject.name} berhasil diunduh.`,
      });
      setTimeout(() => setNotification(null), 4000);
    } catch (err: any) {
      console.error(err);
      setNotification({ type: 'error', message: 'Gagal mengekspor nilai TP.' });
    } finally {
      setIsProcessingExcel(false);
    }
  };

  const handleTriggerImportNilaiTP = () => {
    if (fileInputNilaiTPRef.current) {
      fileInputNilaiTPRef.current.value = '';
      fileInputNilaiTPRef.current.click();
    }
  };

  const handleFileChangeNilaiTP = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingExcel(true);
    setNotification(null);

    try {
      const { updatedData, count, studentNames } = await parseAndApplyNilaiTPExcel(
        file,
        rombelData,
        selectedSubjectId
      );

      setRombelData(updatedData);
      saveRombelData(updatedData);
      markDirty();

      setNotification({
        type: 'success',
        message: `Berhasil mengimpor penilaian skala TP untuk ${count} siswa! Narasi rapor otomatis disesuaikan. (${studentNames.slice(0, 3).join(', ')}${studentNames.length > 3 ? ', dll' : ''})`,
      });
      setTimeout(() => setNotification(null), 5000);
    } catch (err: any) {
      console.error('Error importing nilai TP:', err);
      setNotification({
        type: 'error',
        message: err.message || 'Gagal membaca file Excel Nilai TP. Pastikan format kolom sesuai.',
      });
    } finally {
      setIsProcessingExcel(false);
    }
  };

  // -------------------------------------------------------------
  // INTERACTIVE TP STATUS & NARRATIVE HANDLERS
  // -------------------------------------------------------------
  const handleDescriptionChange = (
    studentId: string,
    subjectId: string,
    value: string
  ) => {
    setRombelData((prev) => {
      const nextDesc = { ...prev.descriptions };
      if (!nextDesc[studentId]) nextDesc[studentId] = {};
      nextDesc[studentId] = {
        ...nextDesc[studentId],
        [subjectId]: value,
      };
      return { ...prev, descriptions: nextDesc };
    });
    markDirty();
  };

  const handleTPStatusChange = (
    studentId: string,
    subjectId: string,
    tpIndex: 0 | 1 | 2 | 3,
    newStatus: TPStatus,
    autoRecompose: boolean = true
  ) => {
    setRombelData((prev) => {
      const nextAssessments = { ...(prev.tpAssessments || {}) };
      if (!nextAssessments[studentId]) nextAssessments[studentId] = {};
      const currentStat = nextAssessments[studentId][subjectId]
        ? [...nextAssessments[studentId][subjectId]]
        : ['B', 'B', '-', '-'];

      currentStat[tpIndex] = newStatus;
      const updatedStatuses = currentStat as [TPStatus, TPStatus, TPStatus, TPStatus];
      nextAssessments[studentId][subjectId] = updatedStatuses;

      const nextDesc = { ...prev.descriptions };
      if (autoRecompose) {
        if (!nextDesc[studentId]) nextDesc[studentId] = {};
        const subject = prev.subjects.find((s) => s.id === subjectId);
        if (subject) {
          const tps = getSubjectTPs(subjectId);
          nextDesc[studentId][subjectId] = composeNarrativeFromTPs(subject, tps, updatedStatuses);
        }
      }

      return {
        ...prev,
        tpAssessments: nextAssessments,
        descriptions: nextDesc,
      };
    });
    markDirty();
  };

  const handleRecomposeNarrative = (studentId: string, subject: Subject) => {
    const tps = getSubjectTPs(subject.id);
    const statuses = getStudentTPStatus(studentId, subject.id);
    const narrative = composeNarrativeFromTPs(subject, tps, statuses);
    handleDescriptionChange(studentId, subject.id, narrative);
  };

  const handleMassRecomposeNarrative = (subjectId: string) => {
    const subject = subjects.find((s) => s.id === subjectId);
    if (!subject) return;

    setRombelData((prev) => {
      const nextDesc = { ...prev.descriptions };
      const tps = getSubjectTPs(subjectId);

      prev.students.forEach((s) => {
        if (!nextDesc[s.student_id]) nextDesc[s.student_id] = {};
        const statuses = getStudentTPStatus(s.student_id, subjectId);
        nextDesc[s.student_id][subjectId] = composeNarrativeFromTPs(subject, tps, statuses);
      });

      return { ...prev, descriptions: nextDesc };
    });
    markDirty();
  };

  // Quick edit modal for Rumusan TP
  const handleOpenEditRumusanModal = () => {
    setEditingTPs([...getSubjectTPs(selectedSubjectId)]);
    setShowEditRumusanModal(true);
  };

  const handleSaveEditedRumusan = () => {
    setRombelData((prev) => {
      const nextObjectives = { ...(prev.learningObjectives || {}) };
      nextObjectives[selectedSubjectId] = [
        editingTPs[0].trim() || 'Tujuan Pembelajaran 1',
        editingTPs[1].trim() || 'Tujuan Pembelajaran 2',
        editingTPs[2].trim() || 'Tujuan Pembelajaran 3',
        editingTPs[3].trim() || 'Tujuan Pembelajaran 4',
      ];
      return {
        ...prev,
        learningObjectives: nextObjectives,
      };
    });
    markDirty();
    setShowEditRumusanModal(false);
  };

  const activeSubjectTPs = getSubjectTPs(selectedSubjectId);

  return (
    <div className="space-y-6 pb-12">
      {/* Hidden file inputs for Excel imports */}
      <input
        type="file"
        ref={fileInputRumusanRef}
        onChange={handleFileChangeRumusanTP}
        accept=".xlsx, .xls"
        className="hidden"
      />
      <input
        type="file"
        ref={fileInputNilaiTPRef}
        onChange={handleFileChangeNilaiTP}
        accept=".xlsx, .xls"
        className="hidden"
      />

      {/* Notifications */}
      {notification && (
        <div
          className={`p-3.5 border text-xs font-semibold rounded-xl flex items-center gap-2.5 shadow-xs ${
            notification.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
              : notification.type === 'error'
              ? 'bg-rose-50 border-rose-300 text-rose-900'
              : 'bg-blue-50 border-blue-300 text-blue-900'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Header Utama */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg">
              <BookOpenCheck className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Tujuan Pembelajaran (TP) - {rombelData.identity.rombel}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Pengelolaan rumusan 4 Kategori TP dan penilaian skala TP siswa (B, SB, C, PB, -) berbasis Format Excel sesuai standar Kurikulum Merdeka SD.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          <button
            id="btn-save-tp-top"
            onClick={onManualSave}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer ml-auto"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Perubahan</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: RUMUSAN TUJUAN PEMBELAJARAN (TP 1 - TP 4) FORMAT EXCEL          */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-xl border border-indigo-200 shadow-2xs p-5 space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-indigo-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-100 text-indigo-800 rounded-lg">
              <Layers className="w-4 h-4 text-indigo-700" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Rumusan Tujuan Pembelajaran (TP 1 s.d TP 4) Seluruh Mata Pelajaran
              </h3>
              <p className="text-[11px] text-slate-500">
                Rumusan kategori TP 1 sampai TP 4 setiap mata pelajaran dikelola dan diatur menggunakan format Excel.
              </p>
            </div>
          </div>

          {/* Action Buttons for Rumusan TP Excel */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              id="btn-download-template-rumusan-tp"
              onClick={handleDownloadTemplateRumusanTP}
              disabled={isProcessingExcel}
              title="Unduh format template kosong Excel untuk rumusan 4 TP seluruh mata pelajaran"
              className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <FileDown className="w-3.5 h-3.5 text-slate-500" />
              <span>Template Rumusan TP</span>
            </button>

            <button
              id="btn-export-rumusan-tp"
              onClick={handleExportRumusanTP}
              disabled={isProcessingExcel}
              title="Ekspor seluruh rumusan 4 TP mata pelajaran saat ini ke file Excel"
              className="px-3 py-1.5 bg-indigo-50 border border-indigo-300 hover:bg-indigo-100 text-indigo-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-indigo-700" />
              <span>Ekspor Rumusan TP</span>
            </button>

            <button
              id="btn-import-rumusan-tp"
              onClick={handleTriggerImportRumusanTP}
              disabled={isProcessingExcel}
              title="Impor file Excel rumusan TP untuk memperbarui teks TP 1 sampai TP 4 setiap mapel"
              className="px-3 py-1.5 bg-purple-50 border border-purple-300 hover:bg-purple-100 text-purple-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-2xs cursor-pointer disabled:opacity-50"
            >
              <Upload className="w-3.5 h-3.5 text-purple-700" />
              <span>Impor Rumusan TP (Excel)</span>
            </button>
          </div>
        </div>

        {/* Display Rumusan 4 TP untuk Mapel Aktif */}
        <div className="bg-indigo-50/50 rounded-xl p-4 border border-indigo-100 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-indigo-950">
                Rumusan 4 TP Aktif untuk: <span className="text-indigo-700 font-extrabold">{currentSubject.name}</span>
              </span>
            </div>
            <button
              type="button"
              onClick={handleOpenEditRumusanModal}
              className="text-[11px] font-semibold text-indigo-700 hover:text-indigo-900 flex items-center gap-1 cursor-pointer bg-white px-2.5 py-1 rounded-md border border-indigo-200"
            >
              <Edit3 className="w-3 h-3" />
              <span>Edit Rumusan TP Mapel Ini</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
            {([0, 1, 2, 3] as const).map((idx) => (
              <div key={idx} className="bg-white p-3 rounded-lg border border-indigo-100 shadow-2xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-black text-[10px] text-indigo-700 uppercase">
                    Kategori {idx + 1} (TP {idx + 1})
                  </span>
                </div>
                <p className="text-[11px] text-slate-700 leading-snug line-clamp-3">
                  {activeSubjectTPs[idx]}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 2: PENILAIAN SKALA TP 1 - TP 4 SISWA (SB, B, C, PB, -) FORMAT EXCEL */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
        {/* Controls: Pilih Mapel & Excel Actions Nilai TP */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div className="flex flex-wrap items-center gap-3">
            <label className="text-xs font-bold text-slate-700">Pilih Mata Pelajaran:</label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            >
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name} ({sub.shortName})
                </option>
              ))}
            </select>
          </div>

          {/* Excel Actions Penilaian TP */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              id="btn-download-template-nilai-tp"
              onClick={handleDownloadTemplateNilaiTP}
              disabled={isProcessingExcel}
              title="Unduh format template Excel penilaian TP untuk mata pelajaran ini"
              className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <FileDown className="w-3.5 h-3.5 text-slate-500" />
              <span>Template Nilai TP</span>
            </button>

            <button
              id="btn-export-nilai-tp"
              onClick={handleExportNilaiTP}
              disabled={isProcessingExcel}
              title="Ekspor seluruh data penilaian skala TP siswa untuk mata pelajaran ini ke Excel"
              className="px-3 py-1.5 bg-emerald-50 border border-emerald-300 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-emerald-700" />
              <span>Ekspor Nilai TP (Excel)</span>
            </button>

            <button
              id="btn-import-nilai-tp"
              onClick={handleTriggerImportNilaiTP}
              disabled={isProcessingExcel}
              title="Impor penilaian skala TP (B, SB, C, PB, -) siswa dari file Excel"
              className="px-3 py-1.5 bg-purple-50 border border-purple-300 hover:bg-purple-100 text-purple-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-2xs cursor-pointer disabled:opacity-50"
            >
              <Upload className="w-3.5 h-3.5 text-purple-700" />
              <span>Impor Nilai TP (Excel)</span>
            </button>
          </div>
        </div>

        {/* Petunjuk & Skala Penilaian */}
        <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-950 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-900">
                Petunjuk Penilaian Skala TP Kurikulum Merdeka (SB, B, C, PB, -):
              </p>
              <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                Jika di antara guru mengisi TP <strong>hanya 2 TP</strong> (misal TP 1 dan TP 2), maka kolom TP lainnya diisi tanda <strong>(-) atau (0)</strong>. Sistem secara otomatis <strong>hanya merangkai narasi dari TP yang diisi saja</strong> ke lembar rapor siswa.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 shrink-0 text-[11px]">
            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">SB: Sangat Baik</span>
            <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold border border-blue-300">B: Baik</span>
            <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold border border-amber-300">C: Cukup</span>
            <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold border border-rose-300">PB: Perlu Bimbingan</span>
            <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-bold border border-slate-300">(- / 0): Tidak Dinilai</span>
          </div>
        </div>

        {/* Search & Narasi Controls */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 pt-1">
          <button
            type="button"
            onClick={() => handleMassRecomposeNarrative(selectedSubjectId)}
            title="Rangkai ulang narasi capaian rapor seluruh siswa dari skala TP saat ini"
            className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Rangkai Ulang Narasi Semua Siswa</span>
          </button>

          <div className="relative w-full md:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari nama atau NISN siswa..."
              className="w-full pl-8 pr-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Tabel Penilaian TP 1 - TP 4 Siswa */}
        {students.length > 0 ? (
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-900 text-white font-bold text-center">
                  <th className="p-2.5 w-10 border-r border-slate-800">No</th>
                  <th className="p-2.5 w-28 border-r border-slate-800 text-left">NISN</th>
                  <th className="p-2.5 w-48 border-r border-slate-800 text-left">Nama Siswa</th>
                  <th className="p-2.5 w-16 border-r border-slate-800">Nilai</th>
                  <th className="p-2 w-20 border-r border-slate-800">TP 1</th>
                  <th className="p-2 w-20 border-r border-slate-800">TP 2</th>
                  <th className="p-2 w-20 border-r border-slate-800">TP 3</th>
                  <th className="p-2 w-20 border-r border-slate-800">TP 4</th>
                  <th className="p-2.5 text-left">Capaian Narasi Rapor (Otomatis / Input Manual Bebas)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredStudents.map((std, idx) => {
                  const score = rombelData.grades[std.student_id]?.[selectedSubjectId];
                  const statuses = getStudentTPStatus(std.student_id, selectedSubjectId);
                  const descText = rombelData.descriptions[std.student_id]?.[selectedSubjectId] || '';

                  return (
                    <tr key={std.student_id} className="hover:bg-slate-50/90 transition-colors">
                      <td className="p-2 text-center text-slate-500 font-medium">{idx + 1}</td>
                      <td className="p-2 font-mono text-[11px] text-slate-600">{std.nisn || '-'}</td>
                      <td className="p-2 font-bold text-slate-900">{std.nama}</td>
                      <td className="p-2 text-center font-bold">
                        {score !== null && score !== undefined ? (
                          <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-mono">
                            {score}
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      {/* Dropdowns Skala TP 1 s.d TP 4 */}
                      {([0, 1, 2, 3] as const).map((tpIdx) => {
                        const currentVal = statuses[tpIdx] || '-';
                        const isInactive = currentVal === '-' || currentVal === '0';

                        return (
                          <td key={tpIdx} className="p-1.5 text-center">
                            <select
                              value={currentVal}
                              onChange={(e) =>
                                handleTPStatusChange(
                                  std.student_id,
                                  selectedSubjectId,
                                  tpIdx,
                                  e.target.value as TPStatus,
                                  true
                                )
                              }
                              className={`w-full py-1 text-[11px] font-bold rounded text-center border cursor-pointer ${
                                isInactive
                                  ? 'bg-slate-100 text-slate-400 border-slate-200'
                                  : TP_STATUS_CONFIG[currentVal]?.badgeClass || 'bg-slate-100'
                              }`}
                            >
                              <option value="SB">SB</option>
                              <option value="B">B</option>
                              <option value="C">C</option>
                              <option value="PB">PB</option>
                              <option value="-">- (Kosong)</option>
                              <option value="0">0 (Kosong)</option>
                            </select>
                          </td>
                        );
                      })}

                      {/* Capaian Narasi Rapor dengan manual input textarea */}
                      <td className="p-2">
                        <div className="flex items-center gap-1.5">
                          <textarea
                            rows={2}
                            value={descText}
                            onChange={(e) =>
                              handleDescriptionChange(std.student_id, selectedSubjectId, e.target.value)
                            }
                            placeholder="Narasi capaian TP rapor (dapat diketik manual bebas)..."
                            className="w-full p-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 leading-snug focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                          />
                          <button
                            type="button"
                            onClick={() => handleRecomposeNarrative(std.student_id, currentSubject)}
                            title="Rangkai ulang narasi otomatis dari TP yang diisi"
                            className="p-1.5 text-purple-700 hover:bg-purple-100 rounded-lg shrink-0 border border-purple-200 cursor-pointer"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500">
            <p className="text-sm font-semibold">Belum ada data siswa.</p>
            <p className="text-xs mt-1">Tambahkan siswa terlebih dahulu di menu "Data Siswa".</p>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL: EDIT RUMUSAN TP MAPEL INI                                         */}
      {/* ========================================================================= */}
      {showEditRumusanModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-xl p-6 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Edit Rumusan 4 TP: {currentSubject.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Anda juga dapat mengubah rumusan seluruh mata pelajaran sekaligus via Excel.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowEditRumusanModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 4 Textarea Rumusan TP */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 mb-4">
              {([0, 1, 2, 3] as const).map((idx) => (
                <div key={idx} className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-indigo-700 text-white flex items-center justify-center text-[11px] font-black">
                      {idx + 1}
                    </span>
                    <span>Tujuan Pembelajaran {idx + 1} (TP {idx + 1})</span>
                  </label>
                  <textarea
                    rows={2}
                    value={editingTPs[idx]}
                    onChange={(e) => {
                      const updated = [...editingTPs] as [string, string, string, string];
                      updated[idx] = e.target.value;
                      setEditingTPs(updated);
                    }}
                    placeholder={`Tuliskan rumusan kompetensi TP ${idx + 1}...`}
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 leading-relaxed focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              ))}
            </div>

            {/* Footer Modal */}
            <div className="border-t border-slate-200 pt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  const defs = getDefaultTPListForSubject(selectedSubjectId, gradeNumber);
                  setEditingTPs([...defs]);
                }}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset ke Standar Kurikulum Merdeka</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditRumusanModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSaveEditedRumusan}
                  className="px-4 py-2 bg-indigo-700 hover:bg-indigo-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Rumusan</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
