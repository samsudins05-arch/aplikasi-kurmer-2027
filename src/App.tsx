import React, { useState, useEffect, useCallback } from 'react';
import { RombelData, ActiveTab, RombelInfo } from './types';
import {
  loadRombelData,
  saveRombelData,
  getStoredAuthSession,
  setStoredAuthSession,
  findRombelById,
} from './utils/storage';
import { exportRaporExcel, exportRaporTemplate } from './utils/excel';

// Component imports
import { Portal } from './components/Portal';
import { LoginScreen } from './components/LoginScreen';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { DataSiswaView } from './components/DataSiswaView';
import { InputNilaiView } from './components/InputNilaiView';
import { RekapNilaiView } from './components/RekapNilaiView';
import { DeskripsiView } from './components/DeskripsiView';
import { KehadiranCatatanView } from './components/KehadiranCatatanView';
import { EkstrakurikulerView } from './components/EkstrakurikulerView';
import { CekDataView } from './components/CekDataView';
import { CetakRaporView } from './components/CetakRaporView';
import { BackupView } from './components/BackupView';
import { PengaturanView } from './components/PengaturanView';
import { ImportExportExcelModal } from './components/ImportExportExcelModal';

export default function App() {
  // Check URL param on initial load or state
  const [activeRombelKey, setActiveRombelKey] = useState<string | null>(() => {
    const params = new URLSearchParams(window.location.search);
    const r = params.get('rombel');
    return r ? r.toUpperCase() : null;
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const params = new URLSearchParams(window.location.search);
    const r = params.get('rombel');
    if (r) {
      return getStoredAuthSession(r.toUpperCase());
    }
    return false;
  });

  const [rombelData, setRombelData] = useState<RombelData | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isExcelModalOpen, setIsExcelModalOpen] = useState<boolean>(false);
  const [selectedPrintStudentId, setSelectedPrintStudentId] = useState<string | undefined>(undefined);

  // Save status states
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'dirty'>('saved');

  // Load rombel data when activeRombelKey changes
  useEffect(() => {
    if (activeRombelKey) {
      const data = loadRombelData(activeRombelKey);
      setRombelData(data);
      setIsAuthenticated(getStoredAuthSession(activeRombelKey));
      setIsDirty(false);
      setSaveStatus('saved');

      // Sync URL query without reload
      const url = new URL(window.location.href);
      url.searchParams.set('rombel', activeRombelKey);
      window.history.replaceState({}, '', url.toString());
    } else {
      setRombelData(null);
      setIsAuthenticated(false);
      const url = new URL(window.location.href);
      url.searchParams.delete('rombel');
      window.history.replaceState({}, '', url.toString());
    }
  }, [activeRombelKey]);

  // Mark data as dirty
  const markDirty = useCallback(() => {
    setIsDirty(true);
    setSaveStatus('dirty');
  }, []);

  // Manual save handler
  const handleSave = useCallback(() => {
    if (!rombelData) return;
    setSaveStatus('saving');
    saveRombelData(rombelData);
    setTimeout(() => {
      setIsDirty(false);
      setSaveStatus('saved');
    }, 250);
  }, [rombelData]);

  // Open Cetak Rapor handler (saves current data first and switches tab)
  const handleOpenPrintRapor = useCallback((studentId?: string) => {
    if (rombelData) {
      saveRombelData(rombelData);
      setIsDirty(false);
      setSaveStatus('saved');
    }
    if (studentId) {
      setSelectedPrintStudentId(studentId);
    }
    setActiveTab('print-rapor');
    setIsSidebarOpen(false);
  }, [rombelData]);

  // Auto-save interval every 30 seconds if dirty (Mandatory Requirement S)
  useEffect(() => {
    const timer = setInterval(() => {
      if (isDirty && rombelData) {
        saveRombelData(rombelData);
        setIsDirty(false);
        setSaveStatus('saved');
      }
    }, 30000);

    return () => clearInterval(timer);
  }, [isDirty, rombelData]);

  // Global Ctrl+S keyboard shortcut for saving
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSave]);

  // Current active rombel information
  const currentRombelInfo: RombelInfo = (activeRombelKey ? findRombelById(activeRombelKey) : undefined) || {
    id: activeRombelKey || '1A',
    grade: parseInt((activeRombelKey || '1').charAt(0), 10) || 1,
    name: activeRombelKey ? `Kelas ${activeRombelKey}` : 'Kelas 1A',
    phase:
      (parseInt((activeRombelKey || '1').charAt(0), 10) || 1) <= 2
        ? 'Fase A'
        : (parseInt((activeRombelKey || '1').charAt(0), 10) || 1) <= 4
        ? 'Fase B'
        : 'Fase C',
  };

  // Select a rombel from Portal
  const handleSelectRombel = (selected: RombelInfo | string) => {
    const key = (typeof selected === 'string' ? selected : selected.id).toUpperCase();
    setActiveRombelKey(key);
    setActiveTab('dashboard');
  };

  // Login handler
  const handleLoginSuccess = () => {
    if (activeRombelKey) {
      setStoredAuthSession(activeRombelKey, true);
      setIsAuthenticated(true);
    }
  };

  // Logout handler
  const handleLogout = () => {
    if (activeRombelKey) {
      setStoredAuthSession(activeRombelKey, false);
      setIsAuthenticated(false);
    }
  };

  // Back to 27-Rombel portal launcher
  const handleBackToPortal = () => {
    if (isDirty && rombelData) {
      saveRombelData(rombelData);
    }
    setActiveRombelKey(null);
    setIsAuthenticated(false);
  };

  // Export handlers
  const handleExportExcel = () => {
    if (!rombelData) return;
    exportRaporExcel(rombelData, false);
  };

  const handleDownloadTemplate = () => {
    if (!rombelData) return;
    exportRaporTemplate(rombelData);
  };

  // 1. If no active rombel selected, show Portal launcher
  if (!activeRombelKey) {
    return <Portal onSelectRombel={handleSelectRombel} />;
  }

  // Ensure rombel data is loaded
  if (!rombelData) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-semibold">Memuat Aplikasi Rapor {currentRombelInfo.name}...</p>
        </div>
      </div>
    );
  }

  // 2. If active rombel selected but not authenticated, show Login
  if (!isAuthenticated) {
    return (
      <LoginScreen
        rombelInfo={currentRombelInfo}
        rombelData={rombelData}
        onLoginSuccess={handleLoginSuccess}
        onBackToPortal={handleBackToPortal}
      />
    );
  }

  // 3. Authenticated: Render Main Application Layout
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900">
      {/* Top Navigation Bar */}
      <Navbar
        rombelInfo={currentRombelInfo}
        rombelData={rombelData}
        hasUnsavedChanges={isDirty}
        saveStatus={saveStatus}
        onManualSave={handleSave}
        onExportExcel={handleExportExcel}
        onOpenExcelModal={() => setIsExcelModalOpen(true)}
        onOpenDownloadTemplate={handleDownloadTemplate}
        onOpenPrintRapor={() => handleOpenPrintRapor()}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        onLogout={handleLogout}
        onBackToPortal={handleBackToPortal}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setActiveTab(tab);
            setIsSidebarOpen(false);
          }}
          rombelInfo={currentRombelInfo}
          studentCount={rombelData.students.length}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onLogout={handleLogout}
          onExportExcelModal={() => setIsExcelModalOpen(true)}
          onImportExcelModal={() => setIsExcelModalOpen(true)}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'dashboard' && (
              <DashboardView
                rombelInfo={currentRombelInfo}
                rombelData={rombelData}
                setActiveTab={setActiveTab}
                onExportExcel={handleExportExcel}
                onImportExcelModal={() => setIsExcelModalOpen(true)}
                onDownloadTemplate={handleDownloadTemplate}
                onOpenPrintRapor={() => handleOpenPrintRapor()}
              />
            )}

            {activeTab === 'students' && (
              <DataSiswaView
                rombelData={rombelData}
                setRombelData={setRombelData}
                markDirty={markDirty}
                onImportExcelModal={() => setIsExcelModalOpen(true)}
                onExportExcel={handleExportExcel}
              />
            )}

            {activeTab === 'grades' && (
              <InputNilaiView
                rombelData={rombelData}
                setRombelData={setRombelData}
                markDirty={markDirty}
                onManualSave={handleSave}
              />
            )}

            {activeTab === 'recap' && (
              <RekapNilaiView
                rombelData={rombelData}
                onExportExcel={handleExportExcel}
                onOpenPrintRapor={handleOpenPrintRapor}
              />
            )}

            {activeTab === 'descriptions' && (
              <DeskripsiView
                rombelData={rombelData}
                setRombelData={setRombelData}
                markDirty={markDirty}
                onManualSave={handleSave}
              />
            )}

            {activeTab === 'attendance' && (
              <KehadiranCatatanView
                rombelData={rombelData}
                setRombelData={setRombelData}
                markDirty={markDirty}
                onManualSave={handleSave}
                onOpenPrintRapor={handleOpenPrintRapor}
              />
            )}

            {activeTab === 'extracurricular' && (
              <EkstrakurikulerView
                rombelData={rombelData}
                setRombelData={setRombelData}
                markDirty={markDirty}
                onManualSave={handleSave}
                onOpenPrintRapor={handleOpenPrintRapor}
              />
            )}

            {activeTab === 'check-data' && (
              <CekDataView
                rombelData={rombelData}
                setActiveTab={setActiveTab}
                onManualSave={handleSave}
                onOpenPrintRapor={() => handleOpenPrintRapor()}
              />
            )}

            {(activeTab === 'print-rapor' || activeTab === 'preview-rapor') && (
              <CetakRaporView
                rombelData={rombelData}
                setRombelData={setRombelData}
                markDirty={markDirty}
                onManualSave={handleSave}
                initialStudentId={selectedPrintStudentId}
              />
            )}

            {activeTab === 'backup' && (
              <BackupView
                rombelData={rombelData}
                setRombelData={setRombelData}
                markDirty={markDirty}
              />
            )}

            {activeTab === 'settings' && (
              <PengaturanView
                rombelData={rombelData}
                setRombelData={setRombelData}
                markDirty={markDirty}
                onManualSave={handleSave}
              />
            )}
          </div>
        </main>
      </div>

      {/* Excel Import & Export Modal Dialog */}
      <ImportExportExcelModal
        isOpen={isExcelModalOpen}
        onClose={() => setIsExcelModalOpen(false)}
        rombelData={rombelData}
        setRombelData={setRombelData}
        markDirty={markDirty}
        onDownloadTemplate={handleDownloadTemplate}
      />
    </div>
  );
}
