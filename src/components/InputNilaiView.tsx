import React, { useState, useRef } from 'react';
import { RombelData, Subject, TPStatus } from '../types';
import {
  exportNilaiTPExcel,
  exportAllSubjectsNilaiTPExcel,
  parseAndApplyNilaiTPExcel,
} from '../utils/excel';
import {
  getDefaultTPListForSubject,
  composeNarrativeFromTPs,
  scoreToTPStatus,
  calculateAverageTPScore,
} from '../utils/tujuanPembelajaran';
import {
  FileSpreadsheet,
  Save,
  Search,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Download,
  Upload,
  FileDown,
  BookOpen,
  Sparkles,
  Layers,
  ChevronRight,
  Info,
  Check,
} from 'lucide-react';

interface InputNilaiViewProps {
  rombelData: RombelData;
  setRombelData: React.Dispatch<React.SetStateAction<RombelData>>;
  markDirty: () => void;
  onManualSave: () => void;
}

export const InputNilaiView: React.FC<InputNilaiViewProps> = ({
  rombelData,
  setRombelData,
  markDirty,
  onManualSave,
}) => {
  const [activeTab, setActiveTab] = useState<'per_mapel' | 'rekap_semua'>('per_mapel');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    rombelData.subjects[0]?.id || ''
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const students = rombelData.students;
  const subjects = rombelData.subjects;

  // Selected subject object
  const currentSubject: Subject =
    subjects.find((s) => s.id === selectedSubjectId) || subjects[0] || {
      id: 'pancasila',
      name: 'Pendidikan Pancasila',
      shortName: 'Pancasila',
      order: 1,
    };

  // Grade level
  const gradeMatch = (rombelData.identity.kelas || '').match(/\d+/);
  const gradeNumber = gradeMatch ? parseInt(gradeMatch[0], 10) : 1;

  // 4 Tujuan Pembelajaran for current subject
  const currentTPs =
    rombelData.learningObjectives?.[currentSubject.id] ||
    getDefaultTPListForSubject(currentSubject.id, gradeNumber);

  // Filtered students by search
  const filteredStudents = students.filter((s) => {
    const q = searchTerm.toLowerCase();
    return s.nama.toLowerCase().includes(q) || (s.nisn && s.nisn.includes(q));
  });

  // Handle cell change for a specific TP (TP 1 - TP 4)
  const handleTPCellChange = (
    studentId: string,
    subjectId: string,
    tpIndex: 0 | 1 | 2 | 3,
    rawValue: string
  ) => {
    setValidationError(null);
    const trimmed = rawValue.trim().toUpperCase();

    let newScore: number | null = null;
    let newStatus: TPStatus = '-';

    if (trimmed === '' || trimmed === '-' || trimmed === '0' || trimmed === 'KOSONG') {
      newScore = null;
      newStatus = '-';
    } else if (trimmed === 'SB' || trimmed === '4') {
      newScore = 90;
      newStatus = 'SB';
    } else if (trimmed === 'B' || trimmed === '3') {
      newScore = 80;
      newStatus = 'B';
    } else if (trimmed === 'C' || trimmed === '2') {
      newScore = 70;
      newStatus = 'C';
    } else if (trimmed === 'PB' || trimmed === '1') {
      newScore = 60;
      newStatus = 'PB';
    } else {
      const num = parseInt(trimmed, 10);
      if (isNaN(num) || num < 0 || num > 100) {
        setValidationError('Nilai TP harus berupa angka (0–100) atau skala (SB, B, C, PB). Kosongkan atau (-) jika tidak dinilai.');
        return;
      }
      if (num === 0) {
        newScore = null;
        newStatus = '-';
      } else {
        newScore = num;
        newStatus = scoreToTPStatus(num);
      }
    }

    setRombelData((prev) => {
      // 1. Update tpScores
      const prevScores = prev.tpScores?.[studentId]?.[subjectId] || [null, null, null, null];
      const nextScores: [number | null, number | null, number | null, number | null] = [
        prevScores[0] ?? null,
        prevScores[1] ?? null,
        prevScores[2] ?? null,
        prevScores[3] ?? null,
      ];
      nextScores[tpIndex] = newScore;

      // 2. Update tpAssessments
      const prevAssessments = prev.tpAssessments?.[studentId]?.[subjectId] || ['-', '-', '-', '-'];
      const nextAssessments: [TPStatus, TPStatus, TPStatus, TPStatus] = [
        prevAssessments[0] ?? '-',
        prevAssessments[1] ?? '-',
        prevAssessments[2] ?? '-',
        prevAssessments[3] ?? '-',
      ];
      nextAssessments[tpIndex] = newStatus;

      // 3. Compute final average score from filled TP scores
      const calculatedFinal = calculateAverageTPScore(nextScores);

      // 4. Update narrative description
      const tps = prev.learningObjectives?.[subjectId] || getDefaultTPListForSubject(subjectId, gradeNumber);
      const updatedDesc = composeNarrativeFromTPs(currentSubject, tps, nextAssessments);

      const nextTpScores = {
        ...(prev.tpScores || {}),
        [studentId]: {
          ...(prev.tpScores?.[studentId] || {}),
          [subjectId]: nextScores,
        },
      };

      const nextTpAssessments = {
        ...(prev.tpAssessments || {}),
        [studentId]: {
          ...(prev.tpAssessments?.[studentId] || {}),
          [subjectId]: nextAssessments,
        },
      };

      const nextGrades = {
        ...(prev.grades || {}),
        [studentId]: {
          ...(prev.grades?.[studentId] || {}),
          [subjectId]: calculatedFinal,
        },
      };

      const nextDescriptions = {
        ...(prev.descriptions || {}),
        [studentId]: {
          ...(prev.descriptions?.[studentId] || {}),
          [subjectId]: updatedDesc,
        },
      };

      return {
        ...prev,
        tpScores: nextTpScores,
        tpAssessments: nextTpAssessments,
        grades: nextGrades,
        descriptions: nextDescriptions,
      };
    });
    markDirty();
  };

  // Handle direct Nilai Akhir manual change
  const handleFinalGradeChange = (studentId: string, subjectId: string, rawValue: string) => {
    setValidationError(null);
    if (rawValue.trim() === '' || rawValue.trim() === '-') {
      setRombelData((prev) => {
        const nextGrades = { ...prev.grades };
        if (!nextGrades[studentId]) nextGrades[studentId] = {};
        nextGrades[studentId][subjectId] = null;
        return { ...prev, grades: nextGrades };
      });
      markDirty();
      return;
    }

    const num = parseInt(rawValue.trim(), 10);
    if (isNaN(num) || num < 0 || num > 100) {
      setValidationError('Nilai Akhir harus di antara 0 sampai 100.');
      return;
    }

    setRombelData((prev) => {
      const nextGrades = { ...prev.grades };
      if (!nextGrades[studentId]) nextGrades[studentId] = {};
      nextGrades[studentId][subjectId] = num;
      return { ...prev, grades: nextGrades };
    });
    markDirty();
  };

  // Excel Handlers
  const handleDownloadTemplateCurrent = () => {
    exportNilaiTPExcel(rombelData, currentSubject.id, true);
  };

  const handleDownloadTemplateAll = () => {
    exportAllSubjectsNilaiTPExcel(rombelData, true);
  };

  const handleExportCurrent = () => {
    exportNilaiTPExcel(rombelData, currentSubject.id, false);
  };

  const handleExportAll = () => {
    exportAllSubjectsNilaiTPExcel(rombelData, false);
  };

  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setValidationError(null);
    try {
      const res = await parseAndApplyNilaiTPExcel(file, rombelData, currentSubject.id);
      setRombelData(res.updatedData);
      markDirty();
      setSuccessToast(
        `Berhasil mengimpor nilai TP untuk ${res.count} siswa pada mata pelajaran: ${res.subjectsUpdated.join(', ')}!`
      );
      setTimeout(() => setSuccessToast(null), 6000);
    } catch (err: any) {
      console.error('Error importing Nilai TP Excel:', err);
      setValidationError(err.message || 'Gagal membaca format file Excel Nilai TP.');
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Stats calculation for current subject
  const getTPStats = () => {
    let countGraded = 0;
    let sumFinal = 0;
    const tpSums = [0, 0, 0, 0];
    const tpCounts = [0, 0, 0, 0];

    students.forEach((s) => {
      const finalScore = rombelData.grades[s.student_id]?.[currentSubject.id];
      if (typeof finalScore === 'number' && !isNaN(finalScore)) {
        sumFinal += finalScore;
        countGraded++;
      }

      const scores = rombelData.tpScores?.[s.student_id]?.[currentSubject.id];
      if (scores) {
        for (let i = 0; i < 4; i++) {
          const sc = scores[i];
          if (typeof sc === 'number' && !isNaN(sc)) {
            tpSums[i] += sc;
            tpCounts[i]++;
          }
        }
      }
    });

    const avgFinal = countGraded > 0 ? (sumFinal / countGraded).toFixed(1) : '-';
    const tpAvgs = tpSums.map((sum, i) => (tpCounts[i] > 0 ? (sum / tpCounts[i]).toFixed(1) : '-'));

    return { countGraded, avgFinal, tpAvgs, tpCounts };
  };

  const tpStats = getTPStats();

  return (
    <div className="space-y-6 pb-12">
      {/* Hidden File Input for Excel Import */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleExcelUpload}
        accept=".xlsx,.xls"
        className="hidden"
      />

      {/* Top Header & Action Bar */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center shadow-xs">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Input Nilai Rapor & Penilaian TP (TP 1 – TP 4)
              </h2>
              <p className="text-xs text-slate-500">
                SDN Babelan Kota 01 | {rombelData.identity.kelas} - {rombelData.identity.rombel} | Semester {rombelData.identity.semester}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons: Excel Template, Import, Export, Save */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          {/* Download Template Dropdown / Action */}
          <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-xs font-semibold">
            <button
              id="btn-download-template-current"
              onClick={handleDownloadTemplateCurrent}
              title="Unduh Format Excel TP untuk mapel yang sedang aktif"
              className="px-2.5 py-1.5 text-slate-700 hover:text-emerald-800 hover:bg-white rounded-md transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <FileDown className="w-3.5 h-3.5 text-emerald-700" />
              <span>Template ({currentSubject.shortName})</span>
            </button>
            <div className="w-px h-4 bg-slate-300 mx-0.5" />
            <button
              id="btn-download-template-all"
              onClick={handleDownloadTemplateAll}
              title="Unduh Format Excel TP untuk seluruh mata pelajaran (Multi-Sheet)"
              className="px-2.5 py-1.5 text-slate-700 hover:text-emerald-800 hover:bg-white rounded-md transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span>Semua Mapel</span>
            </button>
          </div>

          {/* Import Excel */}
          <button
            id="btn-import-nilai-tp"
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
            className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs disabled:opacity-50"
          >
            <Upload className="w-3.5 h-3.5 text-emerald-700" />
            <span>{isImporting ? 'Mengimpor...' : 'Impor Nilai TP (Excel)'}</span>
          </button>

          {/* Export Excel */}
          <button
            id="btn-export-nilai-tp"
            onClick={handleExportCurrent}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Ekspor Excel</span>
          </button>

          {/* Save Grades */}
          <button
            id="btn-save-grades-view"
            onClick={onManualSave}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer ml-auto sm:ml-0"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Nilai</span>
          </button>
        </div>
      </div>

      {/* Success Toast Banner */}
      {successToast && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 text-xs flex items-start gap-2.5 shadow-2xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold">Impor Berhasil! </span>
            <span>{successToast}</span>
          </div>
        </div>
      )}

      {/* Validation Warning Banner */}
      {validationError && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2 shadow-2xs">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* View Mode Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2">
          <button
            id="tab-mode-per-mapel"
            onClick={() => setActiveTab('per_mapel')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'per_mapel'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Penilaian TP 1 – TP 4 (Per Mata Pelajaran)</span>
          </button>

          <button
            id="tab-mode-rekap-semua"
            onClick={() => setActiveTab('rekap_semua')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'rekap_semua'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Rekap Nilai Akhir Seluruh Mapel</span>
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-500">
          <Info className="w-3.5 h-3.5 text-slate-400" />
          <span>TP yang tidak dinilai cukup isi <b>(-)</b> atau biarkan kosong</span>
        </div>
      </div>

      {/* MODE 1: PER MATA PELAJARAN (NILAI TP 1 - TP 4) */}
      {activeTab === 'per_mapel' && (
        <div className="space-y-5">
          {/* Subject Navigation Pills */}
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
              Pilih Mata Pelajaran:
            </div>
            <div className="flex flex-wrap gap-1.5">
              {subjects.map((sub) => {
                const isActive = sub.id === currentSubject.id;
                let gradedCount = 0;
                students.forEach((s) => {
                  const val = rombelData.grades[s.student_id]?.[sub.id];
                  if (typeof val === 'number' && !isNaN(val)) gradedCount++;
                });

                return (
                  <button
                    key={sub.id}
                    id={`btn-select-mapel-${sub.id}`}
                    onClick={() => setSelectedSubjectId(sub.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                      isActive
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    <span>{sub.name}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                        isActive
                          ? 'bg-emerald-600 text-white'
                          : gradedCount > 0
                          ? 'bg-slate-200 text-slate-700'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {gradedCount}/{students.length}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Rumusan Tujuan Pembelajaran (TP 1 - TP 4) Card */}
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 shadow-2xs">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-700" />
                <h3 className="text-xs font-bold text-emerald-950">
                  Rumusan 4 Kategori Tujuan Pembelajaran (TP) — {currentSubject.name}
                </h3>
              </div>
              <span className="text-[11px] text-emerald-800 bg-white/80 px-2.5 py-0.5 rounded-full border border-emerald-300 font-medium">
                KKTP: 75 | Format Kurikulum Merdeka
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
              {currentTPs.map((tpText, idx) => (
                <div
                  key={idx}
                  className="bg-white p-3 rounded-lg border border-emerald-200 shadow-2xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">
                        TP {idx + 1}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {tpStats.tpCounts[idx]}/{students.length} Siswa
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-700 line-clamp-3 leading-relaxed">
                      {tpText}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-3 text-[11px] text-emerald-900 bg-emerald-100/60 p-2 rounded-lg flex items-center gap-2">
              <Info className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              <span>
                <b>Aturan Penilaian TP:</b> Masukkan nilai angka (0–100) atau skala (SB, B, C, PB). Jika guru hanya menilai 2 TP (misal TP 1 & TP 2), biarkan TP 3 & TP 4 bertanda <b>(-)</b>. Nilai Akhir otomatis dihitung dari rata-rata TP yang dinilai saja.
              </span>
            </div>
          </div>

          {/* Search bar & quick instructions */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="input-search-siswa-tp"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari nama atau NISN siswa..."
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 shadow-2xs"
              />
            </div>

            <div className="text-[11px] text-slate-500 flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg">
              <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
              <span>Gunakan tombol <b>Tab</b> pada keyboard untuk berpindah antarsel nilai TP secara cepat.</span>
            </div>
          </div>

          {/* Main TP Input Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-800 text-white font-semibold text-[11px] uppercase tracking-wider">
                    <th className="py-3 px-2 w-10 text-center border-r border-slate-700">No</th>
                    <th className="py-3 px-3 w-24 border-r border-slate-700">NISN</th>
                    <th className="py-3 px-3 min-w-[170px] border-r border-slate-700">Nama Siswa</th>

                    {/* TP 1 to TP 4 Columns */}
                    {[0, 1, 2, 3].map((tpIdx) => (
                      <th
                        key={tpIdx}
                        className="py-2.5 px-2 text-center w-28 border-r border-slate-700 bg-slate-800/90"
                        title={currentTPs[tpIdx]}
                      >
                        <div className="font-bold text-emerald-300">TP {tpIdx + 1}</div>
                        <div className="text-[9px] font-normal text-slate-300 truncate max-w-[100px] mx-auto">
                          {currentTPs[tpIdx].substring(0, 18)}...
                        </div>
                      </th>
                    ))}

                    {/* Nilai Akhir */}
                    <th className="py-3 px-2 text-center w-24 border-r border-slate-700 bg-slate-900 text-amber-300">
                      <div>Nilai Akhir</div>
                      <div className="text-[9px] font-normal text-slate-300">Rata-rata TP</div>
                    </th>

                    {/* Predikat */}
                    <th className="py-3 px-2 text-center w-20 border-r border-slate-700 bg-slate-900 text-slate-200">
                      Predikat
                    </th>

                    {/* Capaian Narasi Preview */}
                    <th className="py-3 px-3 min-w-[240px] bg-slate-900 text-slate-200">
                      Narasi Capaian Rapor
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200">
                  {filteredStudents.map((s, idx) => {
                    const studentTpScores = rombelData.tpScores?.[s.student_id]?.[currentSubject.id] || [
                      null,
                      null,
                      null,
                      null,
                    ];
                    const studentTpAssessments = rombelData.tpAssessments?.[s.student_id]?.[currentSubject.id] || [
                      '-',
                      '-',
                      '-',
                      '-',
                    ];
                    const currentGrade = rombelData.grades[s.student_id]?.[currentSubject.id];
                    const narasi = rombelData.descriptions[s.student_id]?.[currentSubject.id] || '';

                    // Predicate label
                    let predicate = '-';
                    let predicateClass = 'text-slate-400 bg-slate-100';
                    if (currentGrade !== null && currentGrade !== undefined && !isNaN(currentGrade)) {
                      if (currentGrade >= 85) {
                        predicate = 'Sangat Baik';
                        predicateClass = 'text-emerald-800 bg-emerald-100 border border-emerald-300';
                      } else if (currentGrade >= 75) {
                        predicate = 'Baik';
                        predicateClass = 'text-blue-800 bg-blue-100 border border-blue-300';
                      } else if (currentGrade >= 65) {
                        predicate = 'Cukup';
                        predicateClass = 'text-amber-800 bg-amber-100 border border-amber-300';
                      } else {
                        predicate = 'Perlu Bimbingan';
                        predicateClass = 'text-rose-800 bg-rose-100 border border-rose-300';
                      }
                    }

                    return (
                      <tr
                        key={s.student_id}
                        className="hover:bg-emerald-50/40 transition-colors group"
                      >
                        <td className="py-2.5 px-2 text-center text-slate-500 font-medium border-r border-slate-100 bg-slate-50/50">
                          {idx + 1}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-600 border-r border-slate-100 text-[11px]">
                          {s.nisn || <span className="text-slate-300">-</span>}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-slate-900 border-r border-slate-100 whitespace-nowrap">
                          {s.nama}
                        </td>

                        {/* TP 1 - TP 4 Inputs */}
                        {([0, 1, 2, 3] as const).map((tpIdx) => {
                          const val = studentTpScores[tpIdx];
                          const status = studentTpAssessments[tpIdx] || '-';
                          const displayVal = val !== null && val !== undefined ? String(val) : (status !== '-' ? status : '');

                          return (
                            <td
                              key={tpIdx}
                              className="p-1 border-r border-slate-100 text-center"
                            >
                              <div className="flex items-center justify-center gap-1">
                                <input
                                  type="text"
                                  maxLength={3}
                                  value={displayVal}
                                  placeholder="-"
                                  onChange={(e) =>
                                    handleTPCellChange(s.student_id, currentSubject.id, tpIdx, e.target.value)
                                  }
                                  className={`w-14 py-1 text-center font-bold text-xs rounded border transition-all ${
                                    displayVal !== '' && displayVal !== '-'
                                      ? 'bg-white border-emerald-400 text-slate-900 font-semibold focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600'
                                      : 'bg-slate-50 border-dashed border-slate-200 text-slate-400 focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500'
                                  }`}
                                />
                                {status !== '-' && (
                                  <span
                                    className={`text-[9px] px-1 py-0.5 rounded font-black ${
                                      status === 'SB'
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : status === 'B'
                                        ? 'bg-blue-100 text-blue-800'
                                        : status === 'C'
                                        ? 'bg-amber-100 text-amber-800'
                                        : 'bg-rose-100 text-rose-800'
                                    }`}
                                  >
                                    {status}
                                  </span>
                                )}
                              </div>
                            </td>
                          );
                        })}

                        {/* Nilai Akhir (Manual input override or calculated average) */}
                        <td className="p-1 border-r border-slate-100 text-center bg-slate-50/50">
                          <input
                            type="text"
                            maxLength={3}
                            value={currentGrade !== null && currentGrade !== undefined ? String(currentGrade) : ''}
                            placeholder="-"
                            onChange={(e) =>
                              handleFinalGradeChange(s.student_id, currentSubject.id, e.target.value)
                            }
                            className={`w-14 py-1 text-center font-black text-xs rounded border transition-all ${
                              currentGrade !== null && currentGrade !== undefined
                                ? 'bg-amber-50/60 border-amber-300 text-amber-950 font-bold focus:border-amber-600 focus:ring-1 focus:ring-amber-600'
                                : 'bg-slate-50 border-dashed border-slate-200 text-slate-400 focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500'
                            }`}
                          />
                        </td>

                        {/* Predikat */}
                        <td className="py-2 px-1 text-center border-r border-slate-100">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold inline-block ${predicateClass}`}>
                            {predicate}
                          </span>
                        </td>

                        {/* Capaian Narasi Preview */}
                        <td className="py-2 px-3 text-slate-700 text-[11px] leading-relaxed">
                          {narasi ? (
                            <span className="line-clamp-2" title={narasi}>
                              {narasi}
                            </span>
                          ) : (
                            <span className="text-slate-300 italic">Belum ada penilaian TP</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}

                  {filteredStudents.length === 0 && (
                    <tr>
                      <td colSpan={10} className="py-12 text-center text-slate-400">
                        {students.length === 0 ? (
                          <div>
                            <p className="text-xs font-semibold text-slate-600 mb-1">
                              Belum ada siswa di {rombelData.identity.rombel}.
                            </p>
                            <p className="text-[11px]">
                              Tambahkan siswa di menu "Data Siswa" terlebih dahulu untuk memasukkan nilai TP.
                            </p>
                          </div>
                        ) : (
                          <p className="text-xs">
                            Tidak ada siswa dengan nama/NISN "{searchTerm}".
                          </p>
                        )}
                      </td>
                    </tr>
                  )}
                </tbody>

                {/* Bottom summary footer row */}
                {filteredStudents.length > 0 && (
                  <tfoot>
                    <tr className="bg-slate-100 font-bold text-[11px] text-slate-800 border-t-2 border-slate-300">
                      <td colSpan={3} className="py-3 px-3 text-right pr-4 border-r border-slate-200 uppercase tracking-wider">
                        Rata-rata Kelas :
                      </td>
                      {([0, 1, 2, 3] as const).map((tpIdx) => (
                        <td key={tpIdx} className="py-2.5 px-2 text-center border-r border-slate-200">
                          <div className="font-extrabold text-emerald-800">
                            {tpStats.tpAvgs[tpIdx]}
                          </div>
                          <div className="text-[9px] text-slate-500 font-normal">
                            ({tpStats.tpCounts[tpIdx]}/{students.length})
                          </div>
                        </td>
                      ))}
                      <td className="py-2.5 px-2 text-center border-r border-slate-200 bg-amber-100/50">
                        <div className="font-extrabold text-amber-900">
                          {tpStats.avgFinal}
                        </div>
                        <div className="text-[9px] text-slate-500 font-normal">
                          ({tpStats.countGraded}/{students.length})
                        </div>
                      </td>
                      <td colSpan={2} className="py-2.5 px-3 text-slate-500 text-[10px]">
                        Kurikulum Merdeka SDN Babelan Kota 01
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODE 2: REKAP NILAI AKHIR SELURUH MAPEL */}
      {activeTab === 'rekap_semua' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-900">
                Matriks Rekapitulasi Nilai Akhir Seluruh Mata Pelajaran
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Nilai Akhir diperoleh otomatis dari rata-rata TP yang diisi guru. Klik nama mata pelajaran untuk masuk ke input TP detail.
              </p>
            </div>
            <button
              onClick={handleExportAll}
              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-emerald-700" />
              <span>Ekspor Semua Mapel (.xlsx)</span>
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-800 text-white font-semibold text-[11px] uppercase tracking-wider">
                    <th className="py-3 px-2 w-10 text-center border-r border-slate-700">No</th>
                    <th className="py-3 px-3 w-24 border-r border-slate-700">NISN</th>
                    <th className="py-3 px-3 min-w-[170px] border-r border-slate-700">Nama Siswa</th>
                    {subjects.map((sub) => (
                      <th
                        key={sub.id}
                        onClick={() => {
                          setSelectedSubjectId(sub.id);
                          setActiveTab('per_mapel');
                        }}
                        className="py-3 px-2 text-center min-w-[85px] border-r border-slate-700 cursor-pointer hover:bg-slate-700 transition-colors group"
                        title={`Klik untuk edit nilai TP ${sub.name}`}
                      >
                        <div className="truncate font-bold group-hover:text-emerald-300">
                          {sub.shortName}
                        </div>
                        <div className="text-[9px] font-normal text-slate-400">
                          KKTP: 75
                        </div>
                      </th>
                    ))}
                    <th className="py-3 px-2 text-center w-20 bg-slate-900 text-emerald-300">
                      Rata-rata
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredStudents.map((s, idx) => {
                    const studentGrades = rombelData.grades[s.student_id] || {};
                    const validScores: number[] = [];
                    subjects.forEach((sub) => {
                      const val = studentGrades[sub.id];
                      if (typeof val === 'number' && !isNaN(val)) {
                        validScores.push(val);
                      }
                    });
                    const avg =
                      validScores.length > 0
                        ? (validScores.reduce((a, b) => a + b, 0) / validScores.length).toFixed(1)
                        : '-';

                    return (
                      <tr
                        key={s.student_id}
                        className="hover:bg-emerald-50/40 transition-colors group"
                      >
                        <td className="py-2.5 px-2 text-center text-slate-500 font-medium border-r border-slate-100 bg-slate-50/50">
                          {idx + 1}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-600 border-r border-slate-100 text-[11px]">
                          {s.nisn || <span className="text-slate-300">-</span>}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-slate-900 border-r border-slate-100 whitespace-nowrap">
                          {s.nama}
                        </td>

                        {subjects.map((sub) => {
                          const currentVal = studentGrades[sub.id];
                          const displayVal =
                            typeof currentVal === 'number' && !isNaN(currentVal) ? currentVal : '';

                          return (
                            <td
                              key={sub.id}
                              className="p-1 border-r border-slate-100 text-center"
                            >
                              <span
                                className={`inline-block w-12 py-1 text-center font-bold text-xs rounded ${
                                  displayVal !== ''
                                    ? displayVal >= 75
                                      ? 'text-emerald-900 bg-emerald-50'
                                      : 'text-rose-900 bg-rose-50'
                                    : 'text-slate-300'
                                }`}
                              >
                                {displayVal !== '' ? displayVal : '-'}
                              </span>
                            </td>
                          );
                        })}

                        <td className="py-2 px-2 text-center font-black text-xs text-slate-900 bg-slate-50/80">
                          {avg !== '-' ? (
                            <span className="text-emerald-700 font-bold">{avg}</span>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
