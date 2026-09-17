import React from 'react';
import { ActiveTab, RombelInfo } from '../types';
import {
  LayoutDashboard,
  Users,
  FileSpreadsheet,
  BarChart3,
  BookOpenCheck,
  CalendarCheck,
  CheckSquare,
  FileText,
  Printer,
  Upload,
  Download,
  Save,
  Settings,
  LogOut,
  Sparkles,
  Trophy,
  X,
} from 'lucide-react';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  rombelInfo: RombelInfo;
  studentCount?: number;
  isOpen?: boolean;
  onClose?: () => void;
  onLogout: () => void;
  onExportExcelModal: () => void;
  onImportExcelModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  rombelInfo,
  studentCount,
  isOpen = false,
  onClose,
  onLogout,
  onExportExcelModal,
  onImportExcelModal,
}) => {
  const menuItems: {
    id: ActiveTab | 'export-action' | 'import-action';
    label: string;
    icon: React.ReactNode;
    action?: () => void;
  }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'students', label: 'Data Siswa', icon: <Users className="w-4 h-4" /> },
    { id: 'grades', label: 'Input Nilai', icon: <FileSpreadsheet className="w-4 h-4" /> },
    { id: 'recap', label: 'Rekap Nilai', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'descriptions', label: 'Tujuan Pembelajaran', icon: <BookOpenCheck className="w-4 h-4" /> },
    { id: 'attendance', label: 'Kehadiran & Catatan', icon: <CalendarCheck className="w-4 h-4" /> },
    { id: 'extracurricular', label: 'Ekstrakurikuler', icon: <Trophy className="w-4 h-4" /> },
    { id: 'check-data', label: 'Cek Data', icon: <CheckSquare className="w-4 h-4" /> },
    { id: 'preview-rapor', label: 'Preview Rapor', icon: <FileText className="w-4 h-4" /> },
    { id: 'print-rapor', label: 'Cetak Rapor', icon: <Printer className="w-4 h-4" /> },
    {
      id: 'import-action',
      label: 'Import Excel',
      icon: <Upload className="w-4 h-4" />,
      action: onImportExcelModal,
    },
    {
      id: 'export-action',
      label: 'Export Excel',
      icon: <Download className="w-4 h-4" />,
      action: onExportExcelModal,
    },
    { id: 'backup', label: 'Backup', icon: <Save className="w-4 h-4" /> },
    { id: 'settings', label: 'Pengaturan', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-slate-900 text-slate-200 flex flex-col h-full shrink-0 border-r border-slate-800 no-print select-none transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-white border border-emerald-500/40 p-1 flex items-center justify-center shadow-xs shrink-0">
                <img
                  src="https://i.ibb.co.com/gb2y0gwD/logo-bakot-01.png"
                  alt="Logo SDN Babelan Kota 01"
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="overflow-hidden">
                <h2 className="text-sm font-bold text-white truncate">
                  {rombelInfo.name}
                </h2>
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-400">
                  <Sparkles className="w-3 h-3" />
                  <span>{rombelInfo.phase}</span>
                </div>
              </div>
            </div>

            {onClose && (
              <button
                onClick={onClose}
                className="lg:hidden p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="mt-3 px-2.5 py-1 bg-slate-800/80 rounded-md text-[10px] text-slate-400 border border-slate-700/50 flex justify-between items-center">
            <span className="font-mono text-slate-300">NPSN: 20219135</span>
            <span className="font-semibold text-emerald-400">
              {studentCount !== undefined ? `${studentCount} Siswa` : '2026/2027'}
            </span>
          </div>
        </div>

        {/* Nav List */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
          {menuItems.map((item) => {
            const isSelected = activeTab === item.id;
            const isAction = !!item.action;

            return (
              <button
                key={item.id}
                id={`nav-item-${item.id}`}
                onClick={() => {
                  if (item.action) {
                    item.action();
                  } else {
                    setActiveTab(item.id as ActiveTab);
                  }
                  if (onClose) onClose();
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer text-left ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                } ${isAction ? 'text-emerald-300 hover:text-emerald-200' : ''}`}
              >
                <span className={isSelected ? 'text-white' : 'text-slate-400'}>
                  {item.icon}
                </span>
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer logout */}
        <div className="p-3 border-t border-slate-800">
          <button
            id="btn-logout"
            onClick={onLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-rose-300 hover:bg-rose-950/40 hover:text-rose-200 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar (Logout)</span>
          </button>
        </div>
      </aside>
    </>
  );
};
