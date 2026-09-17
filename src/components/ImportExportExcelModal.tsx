import React, { useState, useRef } from 'react';
import { RombelData } from '../types';
import {
  exportRaporExcel,
  parseRaporExcel,
  applyExcelImport,
  ExcelImportPreview,
  exportAttendanceAndNotesExcel,
  exportDescriptionsExcel,
  exportAllSubjectsNilaiTPExcel,
} from '../utils/excel';
import {
  Upload,
  Download,
  FileSpreadsheet,
  X,
  CheckCircle2,
  AlertTriangle,
  FileDown,
  Info,
  CalendarCheck,
  BookOpenCheck,
} from 'lucide-react';

interface ImportExportExcelModalProps {
  isOpen: boolean;
  onClose: () => void;
  rombelData: RombelData;
  setRombelData: React.Dispatch<React.SetStateAction<RombelData>>;
  markDirty: () => void;
  onDownloadTemplate: () => void;
}

export const ImportExportExcelModal: React.FC<ImportExportExcelModalProps> = ({
  isOpen,
  onClose,
  rombelData,
  setRombelData,
  markDirty,
  onDownloadTemplate,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [preview, setPreview] = useState<ExcelImportPreview | null>(null);
  const [parsedWorkbook, setParsedWorkbook] = useState<any | null>(null);
  const [importSuccessMsg, setImportSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setIsParsing(true);
    setPreview(null);
    setImportSuccessMsg(null);

    try {
      const { workbook, preview: parsedPreview } = await parseRaporExcel(file, rombelData);
      setParsedWorkbook(workbook);
      setPreview(parsedPreview);
    } catch (err: any) {
      console.error('Error reading excel:', err);
      alert('Gagal membaca file Excel. Pastikan file berformat .xlsx atau .xls yang valid.');
    } finally {
      setIsParsing(false);
    }
  };

  const handleApplyImport = (mode: 'merge' | 'replace') => {
    if (!parsedWorkbook) return;

    if (mode === 'replace') {
      const ok = confirm(
        'PERHATIAN: Mode "IMPORT DAN GANTI DATA" akan menimpa seluruh data siswa dan nilai yang ada di aplikasi dengan data dari Excel. Apakah Anda yakin ingin melanjutkan?'
      );
      if (!ok) return;
    }

    try {
      const updated = applyExcelImport(parsedWorkbook, rombelData, mode);
      setRombelData(updated);
      markDirty();
      setImportSuccessMsg(
        mode === 'merge'
          ? 'Berhasil! Data siswa, nilai, dan deskripsi telah berhasil digabungkan tanpa duplikasi.'
          : 'Berhasil! Seluruh data telah diperbarui dari file Excel.'
      );
      setPreview(null);
      setSelectedFile(null);
    } catch (err) {
      console.error('Error applying import:', err);
      alert('Terjadi kesalahan saat memproses data Excel.');
    }
  };

  const handleExport = () => {
    exportRaporExcel(rombelData, false);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden my-8">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-5 px-6 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold">
                Import & Export Excel Rapor ({rombelData.identity.rombel})
              </h3>
              <p className="text-[11px] text-slate-400">
                Penyimpanan spreadsheet resmi Kurikulum Merdeka 6 Sheet
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[78vh] overflow-y-auto text-xs">
          {/* Success Banner */}
          {importSuccessMsg && (
            <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold">Proses Berhasil!</div>
                <div className="text-[11px] mt-0.5">{importSuccessMsg}</div>
              </div>
            </div>
          )}

          {/* Quick Action Export & Download Template */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <button
              onClick={handleExport}
              className="p-4 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-300 rounded-xl text-left transition-all cursor-pointer flex items-center gap-3.5 group"
            >
              <div className="w-10 h-10 rounded-lg bg-emerald-700 text-white flex items-center justify-center shrink-0">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-emerald-950 text-xs group-hover:text-emerald-800">
                  Export Excel Lengkap (.xlsx)
                </div>
                <div className="text-[11px] text-emerald-800 mt-0.5">
                  Unduh seluruh data siswa, nilai, kehadiran, & deskripsi.
                </div>
              </div>
            </button>

            <button
              onClick={onDownloadTemplate}
              className="p-4 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-xl text-left transition-all cursor-pointer flex items-center gap-3.5 group"
            >
              <div className="w-10 h-10 rounded-lg bg-slate-700 text-white flex items-center justify-center shrink-0">
                <FileDown className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-slate-900 text-xs group-hover:text-slate-800">
                  Download Template Rapor
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Unduh template Excel 6 sheet siap isi.
                </div>
              </div>
            </button>
          </div>

          {/* Dedicated Sub-Templates: Kehadiran, Rumusan TP, & Nilai TP 1-4 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
            <div className="p-2.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-emerald-50 text-emerald-700 rounded-lg">
                  <CalendarCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-800 text-[11px]">Absensi & Catatan</div>
                  <div className="text-[9px] text-slate-400">Kehadiran & ekskul</div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => exportAttendanceAndNotesExcel(rombelData, true)}
                  title="Unduh template kosong Kehadiran & Catatan"
                  className="px-2 py-1 text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded cursor-pointer"
                >
                  Tmpl
                </button>
                <button
                  type="button"
                  onClick={() => exportAttendanceAndNotesExcel(rombelData, false)}
                  title="Ekspor data Kehadiran & Catatan saat ini"
                  className="px-2 py-1 text-[10px] font-bold bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded cursor-pointer"
                >
                  Ekspor
                </button>
              </div>
            </div>

            <div className="p-2.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-purple-50 text-purple-700 rounded-lg">
                  <BookOpenCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-800 text-[11px]">Rumusan TP Mapel</div>
                  <div className="text-[9px] text-slate-400">4 Kategori TP tiap mapel</div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => exportDescriptionsExcel(rombelData, true)}
                  title="Unduh template kosong Tujuan Pembelajaran"
                  className="px-2 py-1 text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded cursor-pointer"
                >
                  Tmpl
                </button>
                <button
                  type="button"
                  onClick={() => exportDescriptionsExcel(rombelData, false)}
                  title="Ekspor seluruh capaian tujuan pembelajaran siswa"
                  className="px-2 py-1 text-[10px] font-bold bg-purple-100 hover:bg-purple-200 text-purple-800 rounded cursor-pointer"
                >
                  Ekspor
                </button>
              </div>
            </div>

            <div className="p-2.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-50 text-blue-700 rounded-lg">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-800 text-[11px]">Nilai TP 1 – TP 4</div>
                  <div className="text-[9px] text-slate-400">Nilai TP semua mapel</div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => exportAllSubjectsNilaiTPExcel(rombelData, true)}
                  title="Unduh template kosong Nilai TP 1 - TP 4 untuk seluruh mapel"
                  className="px-2 py-1 text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded cursor-pointer"
                >
                  Tmpl
                </button>
                <button
                  type="button"
                  onClick={() => exportAllSubjectsNilaiTPExcel(rombelData, false)}
                  title="Ekspor nilai TP 1 - TP 4 seluruh siswa & mapel"
                  className="px-2 py-1 text-[10px] font-bold bg-blue-100 hover:bg-blue-200 text-blue-800 rounded cursor-pointer"
                >
                  Ekspor
                </button>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-5">
            <h4 className="text-xs font-bold text-slate-900 mb-2 flex items-center gap-1.5">
              <Upload className="w-4 h-4 text-emerald-700" />
              <span>Import File Excel (.xlsx)</span>
            </h4>
            <p className="text-[11px] text-slate-500 leading-relaxed mb-4">
              Unggah file Excel rapor yang sudah diisi. Sistem akan membaca data siswa, NISN, nilai semua mata pelajaran, dan deskripsi capaian dengan aman.
            </p>

            {/* Drag and Drop / File Input Box */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50 hover:bg-emerald-50/20 rounded-xl p-6 text-center cursor-pointer transition-all"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileChange}
                className="hidden"
              />
              <FileSpreadsheet className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <div className="font-bold text-slate-800 text-xs">
                {selectedFile ? selectedFile.name : 'Pilih atau Tarik File Excel ke Sini'}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Mendukung format spreadsheet .xlsx dan .xls
              </div>
            </div>

            {isParsing && (
              <div className="mt-4 text-center text-xs text-emerald-700 font-medium animate-pulse">
                Sedang memproses dan memindai sheet Excel...
              </div>
            )}
          </div>

          {/* Import Preview Modal / Box (Mandatory Requirement N: Berikan preview sebelum import) */}
          {preview && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-blue-600" />
                  <span>Hasil Pemindaian File Excel (Preview)</span>
                </span>
                <span className="text-[10px] text-slate-500">
                  {preview.sheetNames.join(', ')}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                <div className="bg-white p-2 rounded-lg border border-slate-200">
                  <div className="text-[10px] text-slate-500">Total Siswa</div>
                  <div className="text-base font-bold text-slate-900">{preview.studentsFound}</div>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200">
                  <div className="text-[10px] text-emerald-600">Siswa Baru</div>
                  <div className="text-base font-bold text-emerald-700">{preview.newStudentsCount}</div>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200">
                  <div className="text-[10px] text-blue-600">Nilai Ditemukan</div>
                  <div className="text-base font-bold text-blue-700">{preview.gradesCount}</div>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200">
                  <div className="text-[10px] text-purple-600">Tujuan Pembelajaran</div>
                  <div className="text-base font-bold text-purple-700">{preview.descriptionsCount}</div>
                </div>
              </div>

              {preview.sampleStudentNames.length > 0 && (
                <div className="text-[11px] text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200">
                  <span className="font-semibold text-slate-800">Contoh Siswa Terdeteksi: </span>
                  {preview.sampleStudentNames.join(', ')}
                  {preview.studentsFound > 5 && ` (+${preview.studentsFound - 5} siswa lainnya)`}
                </div>
              )}

              {/* Import Action Buttons (Mandatory Requirement N: IMPORT DAN GABUNGKAN, IMPORT DAN GANTI DATA, BATAL) */}
              <div className="pt-2 flex flex-col sm:flex-row gap-2">
                <button
                  id="btn-import-merge"
                  onClick={() => handleApplyImport('merge')}
                  className="flex-1 py-2.5 px-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>IMPORT DAN GABUNGKAN (Aman)</span>
                </button>

                <button
                  id="btn-import-replace"
                  onClick={() => handleApplyImport('replace')}
                  className="py-2.5 px-3 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 border border-slate-300 text-slate-700 rounded-lg font-medium text-xs transition-colors cursor-pointer"
                >
                  IMPORT DAN GANTI DATA
                </button>

                <button
                  id="btn-import-cancel"
                  onClick={() => {
                    setPreview(null);
                    setSelectedFile(null);
                  }}
                  className="py-2.5 px-3 border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-lg font-medium text-xs transition-colors cursor-pointer"
                >
                  BATAL
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 text-right">
          <button
            onClick={onClose}
            className="px-4 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
