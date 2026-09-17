import React, { useState } from 'react';
import { RombelData } from '../types';
import {
  BarChart3,
  Search,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Download,
  Filter,
  Printer,
} from 'lucide-react';

interface RekapNilaiViewProps {
  rombelData: RombelData;
  onExportExcel: () => void;
  onOpenPrintRapor?: (studentId?: string) => void;
}

export const RekapNilaiView: React.FC<RekapNilaiViewProps> = ({
  rombelData,
  onExportExcel,
  onOpenPrintRapor,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'complete' | 'partial' | 'empty'>('all');

  const students = rombelData.students;
  const subjects = rombelData.subjects;

  // Calculate completeness status for each student
  const studentRecapList = students.map((s) => {
    const studentGrades = rombelData.grades[s.student_id] || {};
    const validScores: number[] = [];
    let filledCount = 0;

    subjects.forEach((sub) => {
      const val = studentGrades[sub.id];
      if (val !== null && val !== undefined && !isNaN(val)) {
        validScores.push(val);
        filledCount++;
      }
    });

    const average =
      validScores.length > 0
        ? Number((validScores.reduce((a, b) => a + b, 0) / validScores.length).toFixed(1))
        : null;
    const highest = validScores.length > 0 ? Math.max(...validScores) : null;
    const lowest = validScores.length > 0 ? Math.min(...validScores) : null;

    let status: 'complete' | 'partial' | 'empty' = 'empty';
    if (filledCount === subjects.length && subjects.length > 0) {
      status = 'complete';
    } else if (filledCount > 0) {
      status = 'partial';
    }

    return {
      student: s,
      grades: studentGrades,
      filledCount,
      totalCount: subjects.length,
      average,
      highest,
      lowest,
      status,
    };
  });

  const completeCount = studentRecapList.filter((item) => item.status === 'complete').length;
  const partialCount = studentRecapList.filter((item) => item.status === 'partial').length;
  const emptyCount = studentRecapList.filter((item) => item.status === 'empty').length;

  const filteredList = studentRecapList.filter((item) => {
    const q = searchTerm.toLowerCase();
    const matchSearch =
      item.student.nama.toLowerCase().includes(q) ||
      (item.student.nisn && item.student.nisn.includes(q));

    const matchStatus = filterStatus === 'all' || item.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-700" />
            <span>Rekapitulasi Nilai Rapor - {rombelData.identity.rombel}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Rangkuman nilai akhir, rata-rata, nilai tertinggi & terendah, dan status kelengkapan.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onOpenPrintRapor && (
            <button
              id="btn-rekap-print-rapor"
              onClick={() => onOpenPrintRapor()}
              className="px-3.5 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Rapor Rombel</span>
            </button>
          )}

          <button
            onClick={onExportExcel}
            className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export Rekap ke Excel</span>
          </button>
        </div>
      </div>

      {/* Status Indicators Summary (Mandatory Section K) */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
        <div
          onClick={() => setFilterStatus('all')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            filterStatus === 'all'
              ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="text-xs font-semibold">Total Siswa</div>
          <div className="text-2xl font-black mt-1">{students.length}</div>
          <div className="text-[10px] opacity-80 mt-0.5">Semua data siswa</div>
        </div>

        <div
          onClick={() => setFilterStatus('complete')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            filterStatus === 'complete'
              ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
              : 'bg-emerald-50/70 border-emerald-200 hover:border-emerald-300 text-emerald-900'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold">HIJAU = Lengkap</span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black mt-1 text-emerald-700">{completeCount}</div>
          <div className="text-[10px] text-emerald-600/90 mt-0.5">Semua mapel telah dinilai</div>
        </div>

        <div
          onClick={() => setFilterStatus('partial')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            filterStatus === 'partial'
              ? 'bg-amber-700 text-white border-amber-700 shadow-xs'
              : 'bg-amber-50/70 border-amber-200 hover:border-amber-300 text-amber-900'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold">KUNING = Sebagian</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black mt-1 text-amber-700">{partialCount}</div>
          <div className="text-[10px] text-amber-600/90 mt-0.5">Sebagian nilai belum diisi</div>
        </div>

        <div
          onClick={() => setFilterStatus('empty')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            filterStatus === 'empty'
              ? 'bg-rose-700 text-white border-rose-700 shadow-xs'
              : 'bg-rose-50/70 border-rose-200 hover:border-rose-300 text-rose-900'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold">MERAH = Belum Ada Nilai</span>
            <XCircle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black mt-1 text-rose-700">{emptyCount}</div>
          <div className="text-[10px] text-rose-600/90 mt-0.5">Belum ada nilai sama sekali</div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex gap-3 items-center">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari siswa pada rekap..."
            className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 shadow-2xs"
          />
        </div>
        {filterStatus !== 'all' && (
          <button
            onClick={() => setFilterStatus('all')}
            className="px-3 py-1.5 text-xs bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg"
          >
            Hapus Filter Status
          </button>
        )}
      </div>

      {/* Rekap Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-800 text-white font-semibold text-[11px] uppercase tracking-wider">
                <th className="py-3 px-2 w-10 text-center border-r border-slate-700">No</th>
                <th className="py-3 px-4 min-w-[170px] border-r border-slate-700">Nama Siswa</th>
                <th className="py-3 px-3 w-28 border-r border-slate-700">NISN</th>
                {subjects.map((sub) => (
                  <th
                    key={sub.id}
                    className="py-3 px-2 text-center w-14 border-r border-slate-700"
                    title={sub.name}
                  >
                    {sub.shortName}
                  </th>
                ))}
                <th className="py-3 px-2 text-center w-16 bg-slate-900 border-r border-slate-700 text-emerald-300 font-bold">
                  Rata-rata
                </th>
                <th className="py-3 px-2 text-center w-14 border-r border-slate-700 text-teal-300">
                  Maks
                </th>
                <th className="py-3 px-2 text-center w-14 border-r border-slate-700 text-amber-300">
                  Min
                </th>
                <th className="py-3 px-3 text-center w-28 border-r border-slate-700">Status</th>
                <th className="py-3 px-2 text-center w-20">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredList.map((item, idx) => (
                <tr
                  key={item.student.student_id}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="py-2.5 px-2 text-center text-slate-500 font-medium border-r border-slate-100 bg-slate-50/50">
                    {idx + 1}
                  </td>
                  <td className="py-2.5 px-4 font-bold text-slate-900 border-r border-slate-100 whitespace-nowrap">
                    {item.student.nama}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-600 border-r border-slate-100">
                    {item.student.nisn || '-'}
                  </td>

                  {/* Individual subject scores */}
                  {subjects.map((sub) => {
                    const sc = item.grades[sub.id];
                    return (
                      <td
                        key={sub.id}
                        className="py-2 px-1 text-center font-semibold text-slate-700 border-r border-slate-100"
                      >
                        {sc !== null && sc !== undefined ? (
                          sc
                        ) : (
                          <span className="text-slate-300 font-normal">-</span>
                        )}
                      </td>
                    );
                  })}

                  <td className="py-2 px-2 text-center font-black text-emerald-800 bg-emerald-50/50 border-r border-slate-100">
                    {item.average !== null ? item.average : '-'}
                  </td>
                  <td className="py-2 px-2 text-center font-bold text-teal-800 border-r border-slate-100">
                    {item.highest !== null ? item.highest : '-'}
                  </td>
                  <td className="py-2 px-2 text-center font-bold text-amber-800 border-r border-slate-100">
                    {item.lowest !== null ? item.lowest : '-'}
                  </td>

                  <td className="py-2 px-3 text-center border-r border-slate-100">
                    {item.status === 'complete' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                        Lengkap
                      </span>
                    )}
                    {item.status === 'partial' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                        {item.filledCount}/{item.totalCount}
                      </span>
                    )}
                    {item.status === 'empty' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                        Kosong
                      </span>
                    )}
                  </td>

                  <td className="py-2 px-2 text-center">
                    {onOpenPrintRapor && (
                      <button
                        onClick={() => onOpenPrintRapor(item.student.student_id)}
                        className="px-2 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-md text-[11px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer w-full"
                        title={`Buka cetak rapor untuk ${item.student.nama}`}
                      >
                        <Printer className="w-3 h-3 text-purple-700" />
                        <span>Cetak</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}

              {filteredList.length === 0 && (
                <tr>
                  <td colSpan={subjects.length + 8} className="py-12 text-center text-slate-400">
                    {students.length === 0
                      ? 'Belum ada data siswa untuk direkap.'
                      : 'Tidak ada data siswa yang cocok dengan filter.'}
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
