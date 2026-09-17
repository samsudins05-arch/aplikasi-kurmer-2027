import React, { useState } from 'react';
import { ALL_ROMBELS, RombelInfo } from '../types';
import { School, BookOpen, ShieldCheck, ArrowRight, Search, Sparkles } from 'lucide-react';

interface PortalProps {
  onSelectRombel: (rombel: RombelInfo) => void;
}

export const Portal: React.FC<PortalProps> = ({ onSelectRombel }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRombels = ALL_ROMBELS.filter((r) => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    return (
      r.name.toLowerCase().includes(term) ||
      r.phase.toLowerCase().includes(term) ||
      r.id.toLowerCase().includes(term)
    );
  });

  const grades = [1, 2, 3, 4, 5, 6];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-16">
      {/* Header Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-white border border-emerald-200 overflow-hidden flex items-center justify-center shadow-xs shrink-0 p-1">
              <img
                src="https://i.ibb.co.com/gb2y0gwD/logo-bakot-01.png"
                alt="Logo SDN Babelan Kota 01"
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="text-[11px] font-bold text-emerald-700 tracking-wider uppercase flex items-center gap-1.5">
                <span>Aplikasi Resmi Satuan Pendidikan</span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-600 font-semibold font-mono">NPSN: 20219135</span>
              </div>
              <h1 className="text-xl font-bold text-slate-900 leading-tight">
                SDN BABELAN KOTA 01
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-medium rounded-full">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Tahun Pelajaran 2026/2027
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-800 border border-blue-200 text-xs font-medium rounded-full">
              <BookOpen className="w-3.5 h-3.5 text-blue-600" />
              {ALL_ROMBELS.length} Rombel Terpisah
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Banner Section */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 rounded-2xl text-white p-6 sm:p-8 shadow-sm mb-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-xs text-emerald-200 text-xs font-semibold rounded-full mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Sistem Penilaian Kurikulum Merdeka SD</span>
              <span className="text-emerald-300">•</span>
              <span className="text-white font-mono">NPSN: 20219135</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
              Aplikasi Rapor Kurikulum Merdeka
            </h2>
            <div className="text-emerald-100 mb-4 space-y-0.5">
              <p className="text-base sm:text-lg font-bold text-white tracking-wide">
                SD NEGERI BABELAN KOTA 01
              </p>
              <p className="text-xs sm:text-sm text-emerald-200 font-medium">
                Tahun Ajaran 2026/2027 Semester 1 dan 2
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-emerald-200">
              <span className="px-2.5 py-1 bg-white/10 rounded-md">Kelas 1–2: Fase A</span>
              <span className="px-2.5 py-1 bg-white/10 rounded-md">Kelas 3–4: Fase B</span>
              <span className="px-2.5 py-1 bg-white/10 rounded-md">Kelas 5–6: Fase C</span>
            </div>
          </div>
        </div>

        {/* Quick Navigation and Search Bar */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs mb-8 flex flex-col md:flex-row gap-4 justify-between items-center">
          {/* Quick jump to grade rows */}
          <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
            <span className="text-xs font-medium text-slate-500 mr-1 hidden sm:inline">
              Lompat ke Kelas:
            </span>
            {grades.map((g) => (
              <button
                key={g}
                id={`btn-jump-grade-${g}`}
                onClick={() => {
                  const el = document.getElementById(`grade-section-${g}`);
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
                className="px-3.5 py-1.5 text-xs font-medium rounded-lg bg-slate-100 text-slate-700 hover:bg-emerald-600 hover:text-white transition-colors cursor-pointer"
              >
                Kelas {g}
              </button>
            ))}
          </div>

          {/* Search box */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="portal-search-input"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari rombel (misal: 5E, 1A, Fase C)..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            />
          </div>
        </div>

        {/* Rombel Grid grouped by grade - all rows remain visible */}
        {grades.map((gradeNum) => {
          const rombelsInGrade = filteredRombels.filter((r) => r.grade === gradeNum);
          if (rombelsInGrade.length === 0) return null;

          const phase = gradeNum <= 2 ? 'Fase A' : gradeNum <= 4 ? 'Fase B' : 'Fase C';

          return (
            <div key={gradeNum} id={`grade-section-${gradeNum}`} className="mb-8 scroll-mt-24">
              <div className="flex items-center justify-between mb-4 border-b border-slate-200 pb-2">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 text-sm font-bold flex items-center justify-center">
                    {gradeNum}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900">
                    Kelas {gradeNum}
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                    {phase}
                  </span>
                </div>
                <span className="text-xs text-slate-500 font-medium">
                  {rombelsInGrade.length} Rombel
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {rombelsInGrade.map((rombel) => (
                  <div
                    key={rombel.id}
                    id={`rombel-card-${rombel.id}`}
                    onClick={() => onSelectRombel(rombel)}
                    className="group bg-white rounded-xl border border-slate-200 p-5 hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {rombel.phase}
                        </span>
                        <span className="text-[11px] text-slate-600 font-mono">
                          ID: {rombel.id}
                        </span>
                      </div>
                      <h4 className="text-xl font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                        {rombel.name}
                      </h4>
                      <p className="text-xs text-slate-600 mt-1">
                        Aplikasi Khusus {rombel.name}
                      </p>
                    </div>

                    <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-emerald-700">
                      <span>Buka Aplikasi</span>
                      <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {filteredRombels.length === 0 && (
          <div className="bg-white rounded-xl p-12 text-center border border-slate-200">
            <p className="text-slate-500 text-sm">
              Tidak ada rombel yang cocok dengan pencarian "{searchTerm}".
            </p>
            <button
              id="btn-reset-search"
              onClick={() => setSearchTerm('')}
              className="mt-3 px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-700 cursor-pointer"
            >
              Reset Pencarian
            </button>
          </div>
        )}
      </main>
    </div>
  );
};
