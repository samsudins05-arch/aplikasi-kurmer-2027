import React, { useRef, useState } from 'react';
import { RombelData } from '../types';
import { exportBackupJSON, saveRombelData } from '../utils/storage';
import {
  Save,
  Download,
  Upload,
  Clock,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  FileJson,
  FileSpreadsheet,
} from 'lucide-react';
import { exportRaporExcel } from '../utils/excel';

interface BackupViewProps {
  rombelData: RombelData;
  setRombelData: React.Dispatch<React.SetStateAction<RombelData>>;
  markDirty: () => void;
}

export const BackupView: React.FC<BackupViewProps> = ({
  rombelData,
  setRombelData,
  markDirty,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [backupSuccessMsg, setBackupSuccessMsg] = useState<string | null>(null);

  const handleBackupNow = () => {
    const now = new Date().toLocaleString('id-ID', {
      dateStyle: 'full',
      timeStyle: 'medium',
    });

    const updated = {
      ...rombelData,
      lastBackupTime: now,
    };

    saveRombelData(updated);
    setRombelData(updated);
    exportBackupJSON(updated);

    setBackupSuccessMsg(`Backup data berhasil diunduh dan dicatat pada ${now}.`);
  };

  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ok = confirm(
      `PERINGATAN RESTORE BACKUP:
Apakah Anda yakin ingin memulihkan data dari file "${file.name}"?
Data rombel saat ini akan digantikan sepenuhnya dengan data dari file backup.`
    );
    if (!ok) {
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const restoredData = JSON.parse(content) as RombelData;

        // Validation
        if (!restoredData.identity || !restoredData.students) {
          throw new Error('Format file backup tidak valid.');
        }

        saveRombelData(restoredData);
        setRombelData(restoredData);
        markDirty();
        setBackupSuccessMsg('Data rombel berhasil dipulihkan dari file backup!');
      } catch (err) {
        console.error('Error restoring backup:', err);
        alert('Gagal memulihkan file backup. Pastikan file berformat JSON backup yang valid.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Save className="w-5 h-5 text-emerald-700" />
            <span>Sistem Backup & Pemulihan Data - {rombelData.identity.rombel}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Cadangkan seluruh data siswa, nilai, deskripsi capaian, dan pengaturan kelas ke file aman.
          </p>
        </div>

        {/* Last Backup Time indicator (Mandatory Requirement W) */}
        <div className="px-3.5 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-xs text-slate-700 flex items-center gap-2">
          <Clock className="w-4 h-4 text-emerald-600" />
          <span>
            <strong>Backup terakhir:</strong>{' '}
            {rombelData.lastBackupTime ? rombelData.lastBackupTime : 'Belum pernah dilakukan backup'}
          </span>
        </div>
      </div>

      {/* Success Notification */}
      {backupSuccessMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-900 flex items-center gap-2.5">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{backupSuccessMsg}</span>
        </div>
      )}

      {/* Backup Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Card 1: Backup Full Data */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-6 flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4">
              <Download className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">
              Unduh Backup Lengkap (.json)
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Menyimpan seluruh database kelas termasuk data siswa, nilai semua mata pelajaran, deskripsi, kehadiran, catatan wali kelas, dan identitas sekolah ke file cadangan.
            </p>
            <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              ✓ Data siswa: {rombelData.students.length} siswa<br />
              ✓ Mata pelajaran: {rombelData.subjects.length} mapel<br />
              ✓ Terenkapsulasi aman khusus {rombelData.identity.rombel}
            </div>
          </div>

          <div className="mt-6">
            <button
              id="btn-backup-data-now"
              onClick={handleBackupNow}
              className="w-full py-3 px-4 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>BACKUP DATA SEKARANG</span>
            </button>
          </div>
        </div>

        {/* Card 2: Restore Data from Backup */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-6 flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-4">
              <Upload className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">
              Pulihkan Data dari Backup (Restore)
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Unggah file backup (.json) yang pernah diunduh sebelumnya untuk mengembalikan seluruh kondisi data kelas secara utuh.
            </p>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-900 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                Konfirmasi akan diminta sebelum data lama ditimpa untuk menjamin keamanan data Anda.
              </span>
            </div>
          </div>

          <div className="mt-6">
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleRestoreFile}
              className="hidden"
            />
            <button
              id="btn-restore-data"
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all border border-slate-300 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>PILIH FILE BACKUP UNTUK DIPULIHKAN</span>
            </button>
          </div>
        </div>
      </div>

      {/* Alternative Excel Backup */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">
              Cadangan Berbasis Spreadsheet Excel (XLSX)
            </div>
            <div className="text-[11px] text-slate-500">
              File Excel (.xlsx) juga dapat dijadikan backup utama dan dapat di-import kembali kapan saja.
            </div>
          </div>
        </div>

        <button
          onClick={() => exportRaporExcel(rombelData, false)}
          className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>Export Cadangan Excel</span>
        </button>
      </div>
    </div>
  );
};
