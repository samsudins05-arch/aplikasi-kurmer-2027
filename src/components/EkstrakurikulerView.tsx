import React, { useState, useRef } from 'react';
import { RombelData, StudentExtracurricular } from '../types';
import { saveRombelData } from '../utils/storage';
import {
  exportExtracurricularExcel,
  parseAndApplyExtracurricularExcel,
} from '../utils/excel';
import {
  Trophy,
  CheckCircle,
  Search,
  Users,
  Award,
  Sparkles,
  Save,
  FileSpreadsheet,
  Download,
  Upload,
  AlertCircle,
  FileCheck,
  MinusCircle,
} from 'lucide-react';

interface EkstrakurikulerViewProps {
  rombelData: RombelData;
  setRombelData: React.Dispatch<React.SetStateAction<RombelData>>;
  markDirty: () => void;
  onManualSave?: () => void;
  onOpenPrintRapor?: (studentId?: string) => void;
}

const COMMON_EKSKUL_OPTIONS = [
  'Praja Muda Karana (Pramuka)',
  'Usaha Kesehatan Sekolah (UKS) / Dokter Kecil',
  'Seni Tari Tradisional',
  'Futsal / Sepak Bola',
  'Bulu Tangkis',
  'Seni Musik & Angklung',
  'Tahfidz Al-Qur\'an & BTQ',
  'Seni Lukis & Mewarnai',
  'Pencak Silat',
  'Robotik & TIK Cilik',
];

const DEFAULT_DESCRIPTIONS: Record<string, string> = {
  'Sangat Baik': 'Sangat aktif, bersemangat tinggi, dan menunjukkan kedisiplinan serta keterampilan yang sangat memuaskan.',
  'Baik': 'Aktif mengikuti kegiatan, menunjukkan antusiasme belajar, dan berpartisipasi dengan baik.',
  'Cukup': 'Cukup aktif dalam mengikuti rangkaian kegiatan ekstrakurikuler dengan bimbingan berkala.',
  '-': '-',
};

export const EkstrakurikulerView: React.FC<EkstrakurikulerViewProps> = ({
  rombelData,
  setRombelData,
  markDirty,
  onManualSave,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [saveNotice, setSaveNotice] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importNotice, setImportNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const students = rombelData.students;

  // Filter students based on search
  const filteredStudents = students.filter(
    (s) =>
      s.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.nisn && s.nisn.includes(searchTerm)) ||
      (s.nis && s.nis.includes(searchTerm))
  );

  // Count metrics: only count students who have at least one active extracurricular
  let totalParticipation = 0;
  const uniqueActivities = new Set<string>();
  students.forEach((s) => {
    const list = rombelData.extracurriculars[s.student_id] || [];
    const activeList = list.filter(
      (item) => item.name && item.name.trim() !== '' && item.name.trim() !== '-' && item.predicate !== '-'
    );
    if (activeList.length > 0) totalParticipation++;
    activeList.forEach((item) => {
      if (item.name && item.name.trim() && item.name.trim() !== '-') {
        uniqueActivities.add(item.name.trim());
      }
    });
  });

  const participationPct = students.length > 0 ? Math.round((totalParticipation / students.length) * 100) : 0;

  // Handle inline updates for an extracurricular item
  const handleUpdateEkskul = (
    studentId: string,
    slotIndex: number,
    field: 'name' | 'predicate' | 'description',
    value: string
  ) => {
    setRombelData((prev) => {
      const currentList = prev.extracurriculars[studentId] ? [...prev.extracurriculars[studentId]] : [];
      
      // Ensure slots exist up to slotIndex
      while (currentList.length <= slotIndex) {
        currentList.push({
          name: '',
          predicate: '-',
          description: '',
        });
      }

      const item = { ...currentList[slotIndex] };

      if (field === 'name') {
        item.name = value;
        // If name is cleared or set to '-', default predicate and description to '-'
        if (!value.trim() || value.trim() === '-') {
          item.predicate = '-';
          item.description = '-';
        } else {
          // If user typed a real activity name and predicate was '-', set to 'Baik'
          if (item.predicate === '-' || !item.predicate) {
            item.predicate = 'Baik';
          }
          if (!item.description.trim() || item.description === '-') {
            item.description = DEFAULT_DESCRIPTIONS[item.predicate] || DEFAULT_DESCRIPTIONS['Baik'];
          }
        }
      } else if (field === 'predicate') {
        const oldPred = item.predicate;
        item.predicate = value;
        if (value === '-') {
          // If predicate is set to '-', set name and description to '-' if empty
          if (!item.name || item.name.trim() === '') {
            item.name = '-';
          }
          item.description = '-';
        } else {
          if (item.name === '-') {
            item.name = '';
          }
          if (!item.description.trim() || item.description === '-' || item.description === DEFAULT_DESCRIPTIONS[oldPred]) {
            item.description = DEFAULT_DESCRIPTIONS[value] || DEFAULT_DESCRIPTIONS['Baik'];
          }
        }
      } else if (field === 'description') {
        item.description = value;
      }

      currentList[slotIndex] = item;

      return {
        ...prev,
        extracurriculars: {
          ...prev.extracurriculars,
          [studentId]: currentList,
        },
      };
    });

    markDirty();
  };

  // Batch action: Set Pramuka Wajib for all students who don't have it
  const handleSetPramukaForAll = () => {
    if (students.length === 0) return;

    const confirmed = window.confirm(
      `Terapkan kegiatan Praja Muda Karana (Pramuka) dengan predikat 'Baik' untuk seluruh ${students.length} siswa di rombel ini?`
    );
    if (!confirmed) return;

    setRombelData((prev) => {
      const nextEkskul = { ...prev.extracurriculars };

      students.forEach((s) => {
        const list = nextEkskul[s.student_id] ? [...nextEkskul[s.student_id]] : [];
        const hasPramuka = list.some((item) => item.name && item.name.toLowerCase().includes('pramuka'));

        if (!hasPramuka) {
          list.unshift({
            name: 'Praja Muda Karana (Pramuka)',
            predicate: 'Baik',
            description: 'Aktif mengikuti kegiatan kepramukaan dan berpartisipasi dengan penuh tanggung jawab.',
          });
          nextEkskul[s.student_id] = list;
        }
      });

      return { ...prev, extracurriculars: nextEkskul };
    });

    markDirty();
    setSaveNotice('Kegiatan Pramuka berhasil diterapkan untuk seluruh siswa!');
    setTimeout(() => setSaveNotice(null), 3500);
  };

  // Batch action: Set all students to not participating (-)
  const handleSetNoneForAll = () => {
    if (students.length === 0) return;

    const confirmed = window.confirm(
      `Tandai seluruh ${students.length} siswa dengan status tidak mengikuti kegiatan ekstrakurikuler (tanda -)?`
    );
    if (!confirmed) return;

    setRombelData((prev) => {
      const nextEkskul = { ...prev.extracurriculars };
      students.forEach((s) => {
        nextEkskul[s.student_id] = [
          { name: '-', predicate: '-', description: '-' },
          { name: '-', predicate: '-', description: '-' },
        ];
      });
      return { ...prev, extracurriculars: nextEkskul };
    });

    markDirty();
    setSaveNotice('Seluruh siswa disetel tanda (-) / tidak mengikuti ekstrakurikuler.');
    setTimeout(() => setSaveNotice(null), 3500);
  };

  const handleManualSave = () => {
    saveRombelData(rombelData);
    if (onManualSave) onManualSave();
    setSaveNotice('Semua data ekstrakurikuler berhasil disimpan!');
    setTimeout(() => setSaveNotice(null), 3500);
  };

  // EXCEL HANDLERS
  const handleExportExcel = async () => {
    try {
      await exportExtracurricularExcel(rombelData, false);
      setSaveNotice('Data ekstrakurikuler berhasil diekspor ke Excel!');
      setTimeout(() => setSaveNotice(null), 3500);
    } catch (err: any) {
      console.error('Error exporting extracurriculars:', err);
      setImportNotice({
        type: 'error',
        message: 'Gagal mengekspor file Excel: ' + (err.message || 'Terjadi kesalahan sistem'),
      });
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      await exportExtracurricularExcel(rombelData, true);
      setSaveNotice('Template Excel Ekstrakurikuler berhasil diunduh!');
      setTimeout(() => setSaveNotice(null), 3500);
    } catch (err: any) {
      console.error('Error downloading template:', err);
      setImportNotice({
        type: 'error',
        message: 'Gagal mengunduh template Excel: ' + (err.message || 'Terjadi kesalahan sistem'),
      });
    }
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
      const { updatedData, count, studentNames } = await parseAndApplyExtracurricularExcel(
        file,
        rombelData
      );

      setRombelData(updatedData);
      saveRombelData(updatedData);
      markDirty();

      setImportNotice({
        type: 'success',
        message: `Berhasil mengimpor data ekstrakurikuler untuk ${count} siswa! (${studentNames.slice(0, 3).join(', ')}${studentNames.length > 3 ? ', dll' : ''})`,
      });
      setTimeout(() => setImportNotice(null), 5000);
    } catch (err: any) {
      console.error('Error importing extracurricular Excel:', err);
      setImportNotice({
        type: 'error',
        message: err.message || 'Gagal memproses file Excel ekstrakurikuler.',
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Hidden File Input for Excel Import */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".xlsx, .xls"
        className="hidden"
      />

      {/* Datalist for fast autocomplete suggestions */}
      <datalist id="common-ekskul-options">
        {COMMON_EKSKUL_OPTIONS.map((opt) => (
          <option key={opt} value={opt} />
        ))}
      </datalist>

      {/* Toast Notification */}
      {saveNotice && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold rounded-xl flex items-center gap-2.5 shadow-xs animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{saveNotice}</span>
        </div>
      )}

      {/* Import Notification Banner */}
      {importNotice && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-start justify-between gap-3 shadow-xs animate-in fade-in ${
            importNotice.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
              : 'bg-rose-50 border-rose-300 text-rose-900'
          }`}
        >
          <div className="flex items-start gap-2.5">
            {importNotice.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div>
              <div className="font-bold">
                {importNotice.type === 'success' ? 'Impor Berhasil' : 'Kendala Saat Impor Excel'}
              </div>
              <p className="mt-0.5">{importNotice.message}</p>
            </div>
          </div>
          <button
            onClick={() => setImportNotice(null)}
            className="text-slate-400 hover:text-slate-700 font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Header Card with Excel & Batch Actions */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
              <Trophy className="w-4 h-4" />
            </span>
            <h2 className="text-lg font-bold text-slate-900">
              Kegiatan Ekstrakurikuler Siswa
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Isi kegiatan ekstrakurikuler langsung di tabel atau gunakan format Excel. Dicetak resmi pada <strong>Bagian B Lembar Rapor Kurikulum Merdeka</strong>.
          </p>
        </div>

        {/* Toolbar Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Download Template Excel */}
          <button
            id="btn-download-ekskul-template"
            onClick={handleDownloadTemplate}
            title="Unduh format blangko Excel kosong untuk diisi"
            className="px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Unduh Template</span>
          </button>

          {/* Export Excel */}
          <button
            id="btn-export-ekskul-excel"
            onClick={handleExportExcel}
            title="Ekspor seluruh data ekstrakurikuler siswa dengan warna & garis menarik"
            className="px-3.5 py-2 bg-white border border-purple-200 hover:bg-purple-50 text-purple-800 rounded-xl text-xs font-semibold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-purple-600" />
            <span>Ekspor Excel</span>
          </button>

          {/* Import Excel */}
          <button
            id="btn-import-ekskul-excel"
            onClick={handleTriggerFileInput}
            disabled={isImporting}
            title="Unggah file Excel data ekstrakurikuler"
            className="px-3.5 py-2 bg-white border border-blue-200 hover:bg-blue-50 text-blue-800 rounded-xl text-xs font-semibold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Upload className="w-3.5 h-3.5 text-blue-600" />
            <span>{isImporting ? 'Mengimpor...' : 'Impor Excel'}</span>
          </button>

          {/* Batch Pramuka */}
          <button
            id="btn-batch-pramuka"
            onClick={handleSetPramukaForAll}
            title="Terapkan Pramuka Wajib (Predikat Baik) ke semua siswa"
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition-all border border-slate-300 flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Set Pramuka Semua</span>
          </button>

          {/* Batch Set (-) */}
          <button
            id="btn-batch-clear-ekskul"
            onClick={handleSetNoneForAll}
            title="Tandai seluruh siswa tidak mengikuti ekstrakurikuler (tanda -)"
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all border border-slate-300 flex items-center gap-1.5 cursor-pointer"
          >
            <MinusCircle className="w-3.5 h-3.5 text-slate-500" />
            <span>Set Semua (-)</span>
          </button>

          {/* Save Data */}
          <button
            id="btn-save-ekskul"
            onClick={handleManualSave}
            title="Simpan seluruh perubahan data ekstrakurikuler"
            className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Simpan Data</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">Siswa Berpartisipasi</span>
            <div className="mt-1 text-2xl font-black text-slate-900">
              {totalParticipation} / {students.length}
            </div>
            <p className="text-[11px] text-slate-500">{participationPct}% dari rombel terdaftar</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">Jenis Ekskul Aktif</span>
            <div className="mt-1 text-2xl font-black text-purple-700">
              {uniqueActivities.size}
            </div>
            <p className="text-[11px] text-slate-500">Pramuka, Seni, Olahraga, dll.</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">Standar Cetak Rapor</span>
            <div className="mt-1 text-sm font-bold text-slate-800">
              B. Ekstrakurikuler
            </div>
            <p className="text-[11px] text-emerald-700 font-medium">Predikat: Sangat Baik / Baik / Cukup / (-)</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <FileCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Table: Direct Inline Spreadsheet (NO ACTION BUTTON / COLUMN) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {/* Search Bar & Stats */}
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-50/50">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari siswa berdasarkan nama atau NISN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
            />
          </div>

          <span className="text-xs text-slate-500">
            Menampilkan <strong>{filteredStudents.length}</strong> dari {students.length} siswa • Input langsung disimpan otomatis
          </span>
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              {/* Group Super Header */}
              <tr className="bg-slate-800 text-white font-bold text-center text-[11px]">
                <th colSpan={3} className="p-2 border-r border-slate-700">
                  IDENTITAS SISWA
                </th>
                <th colSpan={2} className="p-2 border-r border-slate-700 bg-purple-900">
                  EKSTRAKURIKULER 1 (WAJIB / UTAMA)
                </th>
                <th colSpan={2} className="p-2 bg-teal-900">
                  EKSTRAKURIKULER 2 (PILIHAN / OPSIONAL)
                </th>
              </tr>

              {/* Sub Columns Header (NO AKSI COLUMN) */}
              <tr className="bg-slate-100 text-slate-700 border-b border-slate-300 font-bold">
                <th className="p-3 w-12 text-center border-r border-slate-200">No</th>
                <th className="p-3 w-32 border-r border-slate-200">NISN</th>
                <th className="p-3 w-48 border-r border-slate-200">Nama Siswa</th>

                {/* Ekskul 1 */}
                <th className="p-3 w-72 border-r border-slate-200 bg-purple-50/50">
                  Nama Kegiatan 1 & Predikat
                </th>
                <th className="p-3 min-w-[240px] border-r border-slate-200 bg-purple-50/50">
                  Keterangan Capaian 1
                </th>

                {/* Ekskul 2 */}
                <th className="p-3 w-72 border-r border-slate-200 bg-teal-50/50">
                  Nama Kegiatan 2 & Predikat
                </th>
                <th className="p-3 min-w-[240px] bg-teal-50/50">
                  Keterangan Capaian 2
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    {students.length === 0
                      ? 'Belum ada data siswa di rombel ini. Tambahkan siswa di menu Data Siswa atau Impor Excel.'
                      : 'Tidak ada siswa yang sesuai dengan kata kunci pencarian.'}
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student, idx) => {
                  const studentEkskul = rombelData.extracurriculars[student.student_id] || [];
                  const ekskul1 = studentEkskul[0] || { name: '', predicate: '-', description: '' };
                  const ekskul2 = studentEkskul[1] || { name: '', predicate: '-', description: '' };

                  return (
                    <tr
                      key={student.student_id}
                      className={`transition-colors hover:bg-slate-50 ${
                        idx % 2 === 1 ? 'bg-slate-50/30' : 'bg-white'
                      }`}
                    >
                      {/* No */}
                      <td className="p-3 text-center text-slate-500 font-mono border-r border-slate-200">
                        {idx + 1}
                      </td>

                      {/* NISN */}
                      <td className="p-3 font-mono text-slate-600 border-r border-slate-200">
                        {student.nisn || student.nis || '-'}
                      </td>

                      {/* Nama Siswa */}
                      <td className="p-3 font-semibold text-slate-900 uppercase border-r border-slate-200">
                        {student.nama}
                      </td>

                      {/* Ekskul 1 (Nama & Predikat) */}
                      <td className="p-2 border-r border-slate-200 bg-purple-50/10">
                        <div className="space-y-1.5">
                          <input
                            type="text"
                            list="common-ekskul-options"
                            value={ekskul1.name}
                            placeholder="Nama kegiatan atau (-) jika tidak ikut"
                            onChange={(e) =>
                              handleUpdateEkskul(student.student_id, 0, 'name', e.target.value)
                            }
                            className={`w-full px-2.5 py-1 text-xs border rounded-md focus:outline-hidden focus:border-purple-600 bg-white font-medium ${
                              ekskul1.predicate === '-' ? 'text-slate-500 border-slate-200' : 'text-slate-900 border-slate-300'
                            }`}
                          />
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-semibold text-slate-500 shrink-0">Predikat:</span>
                            <select
                              value={ekskul1.predicate || '-'}
                              onChange={(e) =>
                                handleUpdateEkskul(student.student_id, 0, 'predicate', e.target.value)
                              }
                              className={`px-2 py-0.5 text-xs font-bold rounded-md border focus:outline-hidden ${
                                ekskul1.predicate === 'Sangat Baik'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                  : ekskul1.predicate === 'Baik'
                                  ? 'bg-blue-50 text-blue-800 border-blue-300'
                                  : ekskul1.predicate === 'Cukup'
                                  ? 'bg-amber-50 text-amber-800 border-amber-300'
                                  : 'bg-slate-100 text-slate-700 border-slate-300'
                              }`}
                            >
                              <option value="-">- (Tidak Mengikuti / Kosong)</option>
                              <option value="Sangat Baik">Sangat Baik (SB)</option>
                              <option value="Baik">Baik (B)</option>
                              <option value="Cukup">Cukup (C)</option>
                            </select>
                            <button
                              type="button"
                              onClick={() => {
                                handleUpdateEkskul(student.student_id, 0, 'name', '-');
                                handleUpdateEkskul(student.student_id, 0, 'predicate', '-');
                                handleUpdateEkskul(student.student_id, 0, 'description', '-');
                              }}
                              title="Set tanda (-) jika siswa tidak mengikuti kegiatan ini"
                              className="px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-sm cursor-pointer transition-colors shrink-0"
                            >
                              Set (-)
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* Keterangan 1 */}
                      <td className="p-2 border-r border-slate-200 bg-purple-50/10">
                        <textarea
                          rows={2}
                          value={ekskul1.description}
                          placeholder="Keterangan capaian atau (-) jika tidak ikut..."
                          onChange={(e) =>
                            handleUpdateEkskul(student.student_id, 0, 'description', e.target.value)
                          }
                          className="w-full px-2.5 py-1 text-xs border border-slate-300 rounded-md focus:outline-hidden focus:border-purple-600 bg-white text-slate-700 resize-none leading-relaxed"
                        />
                      </td>

                      {/* Ekskul 2 (Nama & Predikat) */}
                      <td className="p-2 border-r border-slate-200 bg-teal-50/10">
                        <div className="space-y-1.5">
                          <input
                            type="text"
                            list="common-ekskul-options"
                            value={ekskul2.name}
                            placeholder="Nama kegiatan atau (-) jika tidak ikut"
                            onChange={(e) =>
                              handleUpdateEkskul(student.student_id, 1, 'name', e.target.value)
                            }
                            className={`w-full px-2.5 py-1 text-xs border rounded-md focus:outline-hidden focus:border-teal-600 bg-white font-medium ${
                              ekskul2.predicate === '-' ? 'text-slate-500 border-slate-200' : 'text-slate-900 border-slate-300'
                            }`}
                          />
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-semibold text-slate-500 shrink-0">Predikat:</span>
                            <select
                              value={ekskul2.predicate || '-'}
                              onChange={(e) =>
                                handleUpdateEkskul(student.student_id, 1, 'predicate', e.target.value)
                              }
                              className={`px-2 py-0.5 text-xs font-bold rounded-md border focus:outline-hidden ${
                                ekskul2.predicate === 'Sangat Baik'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                  : ekskul2.predicate === 'Baik'
                                  ? 'bg-blue-50 text-blue-800 border-blue-300'
                                  : ekskul2.predicate === 'Cukup'
                                  ? 'bg-amber-50 text-amber-800 border-amber-300'
                                  : 'bg-slate-100 text-slate-700 border-slate-300'
                              }`}
                            >
                              <option value="-">- (Tidak Mengikuti / Kosong)</option>
                              <option value="Sangat Baik">Sangat Baik (SB)</option>
                              <option value="Baik">Baik (B)</option>
                              <option value="Cukup">Cukup (C)</option>
                            </select>
                            <button
                              type="button"
                              onClick={() => {
                                handleUpdateEkskul(student.student_id, 1, 'name', '-');
                                handleUpdateEkskul(student.student_id, 1, 'predicate', '-');
                                handleUpdateEkskul(student.student_id, 1, 'description', '-');
                              }}
                              title="Set tanda (-) jika siswa tidak mengikuti kegiatan ini"
                              className="px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-sm cursor-pointer transition-colors shrink-0"
                            >
                              Set (-)
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* Keterangan 2 */}
                      <td className="p-2 bg-teal-50/10">
                        <textarea
                          rows={2}
                          value={ekskul2.description}
                          placeholder="Keterangan capaian atau (-) jika tidak ikut..."
                          onChange={(e) =>
                            handleUpdateEkskul(student.student_id, 1, 'description', e.target.value)
                          }
                          className="w-full px-2.5 py-1 text-xs border border-slate-300 rounded-md focus:outline-hidden focus:border-teal-600 bg-white text-slate-700 resize-none leading-relaxed"
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
