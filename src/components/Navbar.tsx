import React from 'react';
import { RombelData, RombelInfo } from '../types';
import { Save, CheckCircle, ArrowLeft, Download, School, Menu, Loader2, LogOut, Printer } from 'lucide-react';

interface NavbarProps {
  rombelInfo: RombelInfo;
  rombelData: RombelData;
  hasUnsavedChanges?: boolean;
  saveStatus?: 'saved' | 'saving' | 'dirty';
  onManualSave: () => void;
  onExportExcel: () => void;
  onOpenExcelModal?: () => void;
  onOpenDownloadTemplate?: () => void;
  onOpenPrintRapor?: () => void;
  onToggleSidebar?: () => void;
  onLogout?: () => void;
  onBackToPortal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  rombelInfo,
  rombelData,
  hasUnsavedChanges,
  saveStatus,
  onManualSave,
  onExportExcel,
  onOpenExcelModal,
  onOpenPrintRapor,
  onToggleSidebar,
  onLogout,
  onBackToPortal,
}) => {
  const isSaving = saveStatus === 'saving';
  const isDirty = saveStatus === 'dirty' || !!hasUnsavedChanges;

  return (
    <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-3 sm:px-6 sticky top-0 z-20 shadow-2xs no-print">
      {/* Left info */}
      <div className="flex items-center gap-2 sm:gap-3">
        {onToggleSidebar && (
          <button
            id="btn-toggle-sidebar"
            onClick={onToggleSidebar}
            title="Menu Navigasi"
            className="lg:hidden p-2 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <button
          id="btn-nav-portal"
          onClick={onBackToPortal}
          title="Kembali ke Daftar Rombel"
          className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors flex items-center gap-1.5 text-xs font-medium cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden md:inline">Pilih Rombel Lain</span>
        </button>

        <div className="h-5 w-px bg-slate-200 hidden sm:block" />

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-white border border-emerald-200 overflow-hidden flex items-center justify-center p-0.5 shrink-0 shadow-2xs">
            <img
              src={rombelData.identity.logoUrl || 'https://i.ibb.co.com/gb2y0gwD/logo-bakot-01.png'}
              alt="Logo SDN Babelan Kota 01"
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5 sm:gap-2">
              <span className="hidden sm:inline">RAPOR KURIKULUM MERDEKA</span>
              <span className="text-emerald-700 font-extrabold px-2 py-0.5 bg-emerald-50 rounded-md border border-emerald-200 text-[11px]">
                {rombelInfo.name}
              </span>
            </div>
            <div className="text-[10px] sm:text-[11px] text-slate-500">
              {rombelData.identity.namaSekolah} • <span className="font-mono">NPSN: {rombelData.identity.npsn || '20219135'}</span> • {rombelInfo.phase}
            </div>
          </div>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Save Status Indicator */}
        <div className="hidden md:flex items-center gap-1.5 text-xs">
          {isSaving ? (
            <span className="text-blue-700 font-medium px-2.5 py-1 bg-blue-50 rounded-full border border-blue-200 flex items-center gap-1.5">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
              Menyimpan data...
            </span>
          ) : isDirty ? (
            <span className="text-amber-700 font-medium px-2.5 py-1 bg-amber-50 rounded-full border border-amber-200 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              Ada perubahan belum disimpan
            </span>
          ) : (
            <span className="text-emerald-700 font-medium px-2.5 py-1 bg-emerald-50 rounded-full border border-emerald-200 flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              Tersimpan ({rombelData.lastSavedTime || 'Utuh'})
            </span>
          )}
        </div>

        {/* Cetak Rapor Button */}
        {onOpenPrintRapor && (
          <button
            id="btn-nav-print-rapor"
            onClick={onOpenPrintRapor}
            title="Simpan perubahan & buka halaman Cetak Rapor"
            className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg border border-purple-300 bg-purple-50 text-purple-800 hover:bg-purple-100 text-xs font-bold transition-colors cursor-pointer shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5 text-purple-700" />
            <span className="hidden sm:inline">Cetak Rapor</span>
          </button>
        )}

        {/* Excel Modal or Export Shortcut */}
        <button
          id="btn-quick-export-excel"
          onClick={onOpenExcelModal || onExportExcel}
          title="Import / Export Excel Rapor"
          className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-xs font-semibold transition-colors cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Excel</span>
        </button>

        {/* Primary SIMPAN Button */}
        <button
          id="btn-save-primary"
          onClick={onManualSave}
          disabled={isSaving}
          className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 disabled:opacity-50 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>SIMPAN</span>
        </button>

        {onLogout && (
          <button
            id="btn-nav-logout"
            onClick={onLogout}
            title="Keluar"
            className="sm:hidden p-1.5 rounded-lg border border-slate-200 text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </header>
  );
};
