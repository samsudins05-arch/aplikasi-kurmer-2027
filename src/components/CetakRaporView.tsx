import React, { useState, useEffect } from 'react';
import { RombelData, Student } from '../types';
import { saveRombelData } from '../utils/storage';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas-pro';
import {
  Printer,
  FileDown,
  Users,
  Calendar,
  Sparkles,
  Edit3,
  CheckCircle,
  AlertCircle,
  Save,
  Check,
  ExternalLink,
  Download,
  Loader2,
} from 'lucide-react';

interface CetakRaporViewProps {
  rombelData: RombelData;
  setRombelData: React.Dispatch<React.SetStateAction<RombelData>>;
  markDirty: () => void;
  onManualSave?: () => void;
  initialStudentId?: string;
}

export const CetakRaporView: React.FC<CetakRaporViewProps> = ({
  rombelData,
  setRombelData,
  markDirty,
  onManualSave,
  initialStudentId,
}) => {
  const students = rombelData.students;
  const subjects = rombelData.subjects;
  const identity = rombelData.identity;

  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    initialStudentId || students[0]?.student_id || ''
  );
  const [printMode, setPrintMode] = useState<'single' | 'all'>('single');
  const [saveNotice, setSaveNotice] = useState<string | null>(null);
  const [includeKopSekolah, setIncludeKopSekolah] = useState<boolean>(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [pdfProgressText, setPdfProgressText] = useState<string>('');
  const [pdfErrorMessage, setPdfErrorMessage] = useState<string | null>(null);
  const [logoLoadFailed, setLogoLoadFailed] = useState<boolean>(false);

  // Sync selected student if initialStudentId changes
  useEffect(() => {
    if (initialStudentId && students.some((s) => s.student_id === initialStudentId)) {
      setSelectedStudentId(initialStudentId);
    }
  }, [initialStudentId, students]);

  const currentStudent = students.find((s) => s.student_id === selectedStudentId) || students[0];

  const handleAttendanceChange = (
    studentId: string,
    field: 'sakit' | 'izin' | 'alpa',
    val: string
  ) => {
    const num = val.trim() === '' ? null : parseInt(val, 10);
    setRombelData((prev) => {
      const nextAtt = { ...prev.attendance };
      if (!nextAtt[studentId]) {
        nextAtt[studentId] = { sakit: null, izin: null, alpa: null };
      }
      nextAtt[studentId] = {
        ...nextAtt[studentId],
        [field]: isNaN(num as number) ? null : num,
      };
      return { ...prev, attendance: nextAtt };
    });
    markDirty();
  };

  const handleNoteChange = (studentId: string, noteText: string) => {
    setRombelData((prev) => {
      const nextNotes = { ...prev.notes };
      nextNotes[studentId] = noteText;
      return { ...prev, notes: nextNotes };
    });
    markDirty();
  };

  const handleGenerateDefaultNote = (studentId: string) => {
    const stdGrades = rombelData.grades[studentId] || {};
    const validScores: number[] = [];
    subjects.forEach((sub) => {
      const sc = stdGrades[sub.id];
      if (sc !== null && sc !== undefined && !isNaN(sc)) validScores.push(sc);
    });

    const avg = validScores.length > 0 ? validScores.reduce((a, b) => a + b, 0) / validScores.length : 75;
    let note = '';
    if (avg >= 85) {
      note = 'Ananda menunjukkan prestasi belajar dan kedisiplinan yang sangat baik. Pertahankan semangat belajar, rasa ingin tahu, dan sikap santun di semester berikutnya.';
    } else if (avg >= 75) {
      note = 'Ananda mampu mengikuti seluruh proses pembelajaran dengan baik. Terus tingkatkan keaktifan dalam diskusi dan ketelitian dalam menyelesaikan tugas.';
    } else {
      note = 'Tingkatkan lagi fokus, ketekunan, dan kehadiran dalam belajar. Perbanyak membaca dan berlatih materi yang belum tuntas di rumah bersama orang tua.';
    }

    handleNoteChange(studentId, note);
  };

  const handleSaveData = () => {
    saveRombelData(rombelData);
    if (onManualSave) {
      onManualSave();
    }
    setSaveNotice('Data kehadiran dan catatan rapor berhasil disimpan!');
    setTimeout(() => setSaveNotice(null), 3500);
  };

  const handlePrint = () => {
    // 1. Simpan seluruh data sebelum cetak agar tidak ada data hilang
    saveRombelData(rombelData);
    if (onManualSave) {
      onManualSave();
    }
    setSaveNotice('Data tersimpan! Membuka dialog cetak rapor...');
    setTimeout(() => setSaveNotice(null), 3000);

    // 2. Buka dialog cetak browser
    setTimeout(() => {
      window.print();
    }, 200);
  };

  // Helper untuk merender elemen HTML ke Canvas dengan resolusi tinggi (scale 2)
  const renderElementToCanvas = async (element: HTMLElement): Promise<HTMLCanvasElement> => {
    return await html2canvas(element, {
      scale: 2, // Kualitas cetak jernih 300 DPI equivalent
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#ffffff',
      logging: false,
      scrollX: 0,
      scrollY: 0,
      windowWidth: 800,
      onclone: (clonedDoc) => {
        // Inject standard hex/rgb stylesheet into cloned iframe to guarantee no modern CSS parse errors
        const styleTag = clonedDoc.createElement('style');
        styleTag.innerHTML = `
          * {
            color-scheme: light !important;
          }
          [id^="rapor-sheet-"] {
            background-color: #ffffff !important;
            color: #000000 !important;
            box-shadow: none !important;
          }
          [id^="rapor-sheet-"] table {
            border-collapse: collapse !important;
          }
          [id^="rapor-sheet-"] th,
          [id^="rapor-sheet-"] td {
            border-color: #000000 !important;
          }
          [id^="rapor-sheet-"] thead tr,
          .bg-slate-100 {
            background-color: #f1f5f9 !important;
          }
          .border-slate-200 {
            border-color: #e2e8f0 !important;
          }
          .border-slate-300 {
            border-color: #cbd5e1 !important;
          }
          .text-slate-800 {
            color: #1e293b !important;
          }
          .text-slate-700 {
            color: #334155 !important;
          }
          .text-slate-400 {
            color: #94a3b8 !important;
          }
        `;
        clonedDoc.head.appendChild(styleTag);

        const clonedEl = clonedDoc.getElementById(element.id);
        if (clonedEl) {
          clonedEl.style.boxShadow = 'none';
          clonedEl.style.border = 'none';
          clonedEl.style.margin = '0';
          clonedEl.style.padding = '16px 20px';
          clonedEl.style.width = '794px';
          clonedEl.style.maxWidth = '794px';
          clonedEl.style.backgroundColor = '#ffffff';
          clonedEl.style.color = '#000000';

          // Hilangkan elemen non-cetak pada clone jika ada
          const noPrints = clonedEl.querySelectorAll('.no-print');
          noPrints.forEach((np) => np.remove());

          // Sembunyikan elemen footer HTML dari capture canvas karena footer PDF digambar presisi langsung pada jsPDF di posisi tetap setiap halaman
          const htmlFooters = clonedEl.querySelectorAll('.rapor-sheet-footer');
          htmlFooters.forEach((hf) => {
            (hf as HTMLElement).style.display = 'none';
          });
        }
      },
    });
  };

  // Fungsi presisi untuk menggambar garis dan teks footer di posisi tetap pada setiap halaman PDF
  const drawFixedFooter = (pdf: jsPDF, student: Student, pageNum: number) => {
    const marginMm = 8;
    const pdfWidthMm = 210;
    const footerLineY = 286;
    const footerTextY = 290.5;

    // Garis horizontal pembatas bawah (tetap di Y = 286 mm)
    pdf.setDrawColor(0, 0, 0);
    pdf.setLineWidth(0.25);
    pdf.line(marginMm, footerLineY, pdfWidthMm - marginMm, footerLineY);

    // Teks sebelah kiri: nama siswa_nisn
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8.5);
    pdf.setTextColor(0, 0, 0);
    const studentIdentifier = `${student.nama}_${student.nisn || student.nis || '-'}`;
    pdf.text(studentIdentifier, marginMm, footerTextY);

    // Teks sebelah kanan: Halaman 1 dan seterusnya (sesuai nomor halaman)
    pdf.text(`Halaman ${pageNum}`, pdfWidthMm - marginMm, footerTextY, { align: 'right' });
  };

  // Helper untuk menambahkan canvas per lembar (Halaman 1 atau Halaman 2) ke dokumen jsPDF dengan manajemen skala A4 presisi
  const addPageCanvasToPdf = (
    pdf: jsPDF,
    canvas: HTMLCanvasElement,
    student: Student,
    pageNum: number,
    isFirstPageOfDoc: boolean
  ) => {
    const marginMm = 8;
    const pdfWidthMm = 210;
    const footerLineY = 286;
    const contentWidthMm = pdfWidthMm - 2 * marginMm; // 194 mm
    const maxContentHeightMm = footerLineY - marginMm - 2; // 276 mm

    const pxPerMm = canvas.width / contentWidthMm;
    const imgHeightMm = canvas.height / pxPerMm;

    if (!isFirstPageOfDoc) {
      pdf.addPage('a4', 'portrait');
    }

    const imgData = canvas.toDataURL('image/jpeg', 0.96);

    if (imgHeightMm <= maxContentHeightMm) {
      pdf.addImage(imgData, 'JPEG', marginMm, marginMm, contentWidthMm, imgHeightMm);
    } else {
      // Skalakan proporsional agar pas sempurna di 1 lembar A4 tanpa terpotong
      const scaleRatio = maxContentHeightMm / imgHeightMm;
      const scaledWidthMm = contentWidthMm * scaleRatio;
      const offsetX = marginMm + (contentWidthMm - scaledWidthMm) / 2;
      pdf.addImage(imgData, 'JPEG', offsetX, marginMm, scaledWidthMm, maxContentHeightMm);
    }

    // Gambar footer resmi di posisi tetap (Y = 286 mm)
    drawFixedFooter(pdf, student, pageNum);
  };

  // Unduh PDF A4 Portrait resmi menggunakan jsPDF + html2canvas
  const handleDownloadPDF = async () => {
    saveRombelData(rombelData);
    if (onManualSave) onManualSave();

    setPdfErrorMessage(null);
    setIsGeneratingPdf(true);

    try {
      const safeKelas = (identity.kelas || 'Kelas').replace(/\s+/g, '_');
      const safeRombel = (identity.rombel || 'Rombel').replace(/\s+/g, '_');

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
      });

      if (printMode === 'single') {
        if (!currentStudent) {
          throw new Error('Siswa belum dipilih untuk dicetak.');
        }

        const page1El = document.getElementById(`rapor-page-1-${currentStudent.student_id}`);
        const page2El = document.getElementById(`rapor-page-2-${currentStudent.student_id}`);

        if (!page1El || !page2El) {
          throw new Error(`Lembar rapor siswa "${currentStudent.nama}" tidak ditemukan di halaman.`);
        }

        // Halaman 1 (Kop Sekolah, Identitas Siswa & Sekolah, A. Nilai & Capaian TP)
        setPdfProgressText(`Memproses Halaman 1 (${currentStudent.nama})...`);
        const canvas1 = await renderElementToCanvas(page1El);
        addPageCanvasToPdf(pdf, canvas1, currentStudent, 1, true);

        // Halaman 2 (B. Ekstrakurikuler, C. Ketidakhadiran, D. Catatan Wali Kelas, Tanda Tangan)
        setPdfProgressText(`Memproses Halaman 2: B. Ekstrakurikuler s/d Tanda Tangan (${currentStudent.nama})...`);
        const canvas2 = await renderElementToCanvas(page2El);
        addPageCanvasToPdf(pdf, canvas2, currentStudent, 2, false);

        const filename = `Rapor_A4_${currentStudent.nama.replace(/\s+/g, '_')}_${safeRombel}.pdf`;
        pdf.save(filename);

        setSaveNotice(`File PDF "${filename}" berhasil diunduh dengan sempurna!`);
        setTimeout(() => setSaveNotice(null), 4000);
      } else {
        // Mode Cetak Semua Siswa: Loop setiap siswa dan buat Halaman 1 & Halaman 2 secara berurutan
        if (students.length === 0) {
          throw new Error('Tidak ada data siswa dalam rombel untuk diunduh.');
        }

        for (let i = 0; i < students.length; i++) {
          const std = students[i];
          const page1El = document.getElementById(`rapor-page-1-${std.student_id}`);
          const page2El = document.getElementById(`rapor-page-2-${std.student_id}`);
          if (!page1El || !page2El) continue;

          // Halaman 1 Siswa
          setPdfProgressText(`Mengonversi rapor ${i + 1} dari ${students.length} siswa (${std.nama}) - Halaman 1...`);
          const canvas1 = await renderElementToCanvas(page1El);
          addPageCanvasToPdf(pdf, canvas1, std, 1, i === 0);

          // Halaman 2 Siswa (B. Ekstrakurikuler berada di Halaman 2)
          setPdfProgressText(`Mengonversi rapor ${i + 1} dari ${students.length} siswa (${std.nama}) - Halaman 2...`);
          const canvas2 = await renderElementToCanvas(page2El);
          addPageCanvasToPdf(pdf, canvas2, std, 2, false);
        }

        const filename = `Rapor_A4_Semua_Siswa_${safeKelas}_${safeRombel}.pdf`;
        pdf.save(filename);

        setSaveNotice(`File PDF seluruh siswa (${students.length} siswa) berhasil diunduh dengan sempurna!`);
        setTimeout(() => setSaveNotice(null), 4500);
      }
    } catch (err: any) {
      console.error('Error creating PDF:', err);
      setPdfErrorMessage(err.message || 'Gagal merender lembar rapor ke format PDF.');
    } finally {
      setIsGeneratingPdf(false);
      setPdfProgressText('');
    }
  };

  // Render a single official report card sheet
  const renderRaporCard = (student: Student, isBatchItem: boolean = false) => {
    const studentGrades = rombelData.grades[student.student_id] || {};
    const studentDescs = rombelData.descriptions[student.student_id] || {};
    const att = rombelData.attendance[student.student_id] || { sakit: null, izin: null, alpa: null };
    const note = rombelData.notes[student.student_id] || '';
    const studentEkskuls = rombelData.extracurriculars[student.student_id] || [];

    return (
      <div
        key={student.student_id}
        id={`rapor-sheet-${student.student_id}`}
        className={`space-y-6 ${isBatchItem ? 'mb-12' : ''}`}
      >
        {/* LEMBAR 1 (Halaman 1): Kop Sekolah, Identitas Siswa & Sekolah, dan A. Nilai dan Capaian TP */}
        <div
          id={`rapor-page-1-${student.student_id}`}
          data-page="1"
          style={{ backgroundColor: '#ffffff', color: '#000000' }}
          className="rapor-page bg-white text-black p-6 sm:p-10 max-w-[210mm] mx-auto shadow-md border border-slate-200 print:p-0 print:border-none print:shadow-none print:break-after-page page-break-after"
        >
          {/* Header Rapor: Tanpa Kop Sekolah (Standar A4 Portrait) atau Dengan Kop */}
          {includeKopSekolah ? (
            <div className="flex items-center gap-4 pb-3 border-b-2 border-black mb-4">
              <div className="w-14 h-14 shrink-0 flex items-center justify-center">
                {!logoLoadFailed ? (
                  <img
                    src={identity.logoUrl || 'https://i.ibb.co.com/gb2y0gwD/logo-bakot-01.png'}
                    alt="Logo SDN Babelan Kota 01"
                    className="w-14 h-14 object-contain"
                    crossOrigin="anonymous"
                    referrerPolicy="no-referrer"
                    onError={() => setLogoLoadFailed(true)}
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full border-2 border-emerald-700 bg-emerald-50 flex flex-col items-center justify-center text-center p-1">
                    <span className="text-[8px] font-black text-emerald-900 leading-tight">SDN</span>
                    <span className="text-[7px] font-bold text-emerald-700 leading-tight">BAKOT 01</span>
                  </div>
                )}
              </div>
              <div className="flex-1 text-center pr-2">
                <h1 className="text-base sm:text-lg font-bold uppercase tracking-wide">
                  LAPORAN HASIL BELAJAR (RAPOR)
                </h1>
                <h2 className="text-sm font-semibold uppercase">
                  SEKOLAH DASAR (SD) KURIKULUM MERDEKA
                </h2>
                <div className="text-xs font-semibold text-slate-800">
                  {identity.namaSekolah} • NPSN: {identity.npsn || '20219135'}
                </div>
              </div>
              <div className="w-14 shrink-0 hidden sm:block" />
            </div>
          ) : (
            <div className="text-center pb-2.5 mb-4 border-b-2 border-black">
              <h1 className="text-base sm:text-lg font-black uppercase tracking-wider">
                LAPORAN HASIL BELAJAR (RAPOR)
              </h1>
              <h2 className="text-xs font-bold uppercase text-slate-700 tracking-wide mt-0.5">
                SEKOLAH DASAR (SD) - KURIKULUM MERDEKA
              </h2>
            </div>
          )}

          {/* Student & School Identity Table */}
          <div className="flex justify-between items-start text-xs mb-6 gap-6">
            {/* Sisi Kiri: Identitas Siswa & Sekolah */}
            <div className="space-y-1 flex-1 min-w-0">
              <div className="flex">
                <span className="w-36 font-semibold shrink-0">Nama Peserta Didik</span>
                <span className="w-4 shrink-0">:</span>
                <span className="font-bold uppercase truncate">{student.nama}</span>
              </div>
              <div className="flex">
                <span className="w-36 font-semibold shrink-0">NISN / NIS</span>
                <span className="w-4 shrink-0">:</span>
                <span className="truncate">{student.nisn || '-'} / {student.nis || '-'}</span>
              </div>
              <div className="flex">
                <span className="w-36 font-semibold shrink-0">Nama Sekolah</span>
                <span className="w-4 shrink-0">:</span>
                <span className="truncate">{identity.namaSekolah}</span>
              </div>
              <div className="flex">
                <span className="w-36 font-semibold shrink-0">Alamat Sekolah</span>
                <span className="w-4 shrink-0">:</span>
                <span className="truncate">{identity.alamatSekolah}</span>
              </div>
              <div className="flex">
                <span className="w-36 font-semibold shrink-0">NPSN</span>
                <span className="w-4 shrink-0">:</span>
                <span className="font-mono">{identity.npsn || '20219135'}</span>
              </div>
            </div>

            {/* Sisi Kanan: Berada agak ke kanan sejajar dengan garis tepi kotak */}
            <div className="space-y-1 w-64 shrink-0">
              <div className="flex">
                <span className="w-28 font-semibold shrink-0">Kelas</span>
                <span className="w-4 shrink-0">:</span>
                <span className="flex-1 font-medium">{identity.kelas} ({identity.rombel})</span>
              </div>
              <div className="flex">
                <span className="w-28 font-semibold shrink-0">Fase</span>
                <span className="w-4 shrink-0">:</span>
                <span className="flex-1 font-medium">{identity.fase}</span>
              </div>
              <div className="flex">
                <span className="w-28 font-semibold shrink-0">Semester</span>
                <span className="w-4 shrink-0">:</span>
                <span className="flex-1 font-medium">{identity.semester}</span>
              </div>
              <div className="flex">
                <span className="w-28 font-semibold shrink-0">Tahun Pelajaran</span>
                <span className="w-4 shrink-0">:</span>
                <span className="flex-1 font-medium">{identity.tahunPelajaran}</span>
              </div>
            </div>
          </div>

          {/* A. Nilai dan Capaian Tujuan Pembelajaran: */}
          <div className="mb-4" data-rapor-section="table-a">
            <div className="text-xs font-bold text-black uppercase mb-1.5">
              A. Nilai dan Capaian Tujuan Pembelajaran:
            </div>
            <table className="w-full border-collapse border border-black text-xs">
              <thead>
                <tr style={{ backgroundColor: '#f1f5f9' }} className="bg-slate-100 print:bg-slate-100 font-bold text-center">
                  <th className="border border-black px-2 py-1.5 w-10">No</th>
                  <th className="border border-black px-2 py-1.5 w-48 text-left">Muatan Pelajaran</th>
                  <th className="border border-black px-2 py-1.5 w-16">Nilai Akhir</th>
                  <th className="border border-black px-2 py-1.5">Capaian Tujuan Pembelajaran</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((sub, idx) => {
                  const score = studentGrades[sub.id];
                  const desc = studentDescs[sub.id];

                  return (
                    <tr key={sub.id} className="avoid-break-inside">
                      <td className="border border-black px-2 py-1.5 text-center align-top">
                        {idx + 1}
                      </td>
                      <td className="border border-black px-2 py-1.5 font-semibold align-top text-xs">
                        {sub.name}
                      </td>
                      <td className="border border-black px-2 py-1.5 text-center font-bold align-top">
                        {score !== null && score !== undefined ? score : '-'}
                      </td>
                      <td className="border border-black px-2 py-1.5 text-justify align-top leading-snug text-[11px]">
                        {desc || (
                          <span className="text-slate-400 italic">
                            Belum ada capaian tujuan pembelajaran.
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Footer Lembar 1 */}
          <div className="rapor-sheet-footer pt-3 mt-6 border-t border-black flex justify-between items-center text-[10px] text-black">
            <span className="font-medium">{student.nama}_{student.nisn || student.nis || '-'}</span>
            <span className="font-semibold">Halaman 1</span>
          </div>
        </div>

        {/* Pembatas Halaman Cetak (Penanda Visual Halaman 1 & 2 di Layar Preview) */}
        <div className="no-print my-6 border-t-2 border-dashed border-slate-300 relative text-center">
          <span className="bg-slate-50 px-3 text-[11px] font-semibold text-slate-500 -top-2.5 relative">
            Batas Lembar Rapor • Halaman 2 (Ekstrakurikuler s/d Tanda Tangan)
          </span>
        </div>

        {/* LEMBAR 2 (Halaman 2): B. Ekstrakurikuler, C. Ketidakhadiran, D. Catatan Wali Kelas, dan Tanda Tangan */}
        <div
          id={`rapor-page-2-${student.student_id}`}
          data-page="2"
          style={{ backgroundColor: '#ffffff', color: '#000000' }}
          className={`rapor-page bg-white text-black p-6 sm:p-10 max-w-[210mm] mx-auto shadow-md border border-slate-200 print:p-0 print:border-none print:shadow-none print:break-before-page page-break-before ${
            isBatchItem ? 'print:break-after-page page-break-after' : ''
          }`}
        >
          {/* Header Identitas Ringkas Siswa di Lembar 2 */}
          <div className="flex justify-between items-center text-xs pb-2 mb-4 border-b border-black">
            <div>
              <span className="font-semibold">Nama Peserta Didik: </span>
              <span className="font-bold uppercase">{student.nama}</span>
            </div>
            <div>
              <span className="font-semibold">Kelas: </span>
              <span className="font-medium">{identity.kelas} ({identity.rombel})</span>
            </div>
            <div>
              <span className="font-semibold">Semester: </span>
              <span className="font-medium">{identity.semester}</span>
            </div>
          </div>

          {/* B. Ekstrakurikuler (Dipastikan Awal Halaman ke-2) */}
          <div className="mb-4 avoid-break-inside" data-rapor-section="table-b">
            <div className="text-xs font-bold text-black uppercase mb-1.5">
              B. Ekstrakurikuler
            </div>
            <table className="w-full border-collapse border border-black text-xs">
              <thead>
                <tr style={{ backgroundColor: '#f1f5f9' }} className="bg-slate-100 print:bg-slate-100 font-bold text-center">
                  <th className="border border-black px-2 py-1.5 w-10">No</th>
                  <th className="border border-black px-2 py-1.5 w-52 text-left">Kegiatan Ekstrakurikuler</th>
                  <th className="border border-black px-2 py-1.5 w-28 text-center">Predikat</th>
                  <th className="border border-black px-2 py-1.5 text-left">Keterangan</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const displayedEkskuls = studentEkskuls.filter(
                    (item) => item && item.name && item.name.trim() !== '' && item.name.trim() !== '-'
                  );

                  if (displayedEkskuls.length === 0) {
                    return (
                      <tr className="avoid-break-inside">
                        <td className="border border-black px-2 py-1.5 text-center align-top">-</td>
                        <td className="border border-black px-2 py-1.5 text-center align-top">-</td>
                        <td className="border border-black px-2 py-1.5 text-center font-bold align-top">-</td>
                        <td className="border border-black px-2 py-1.5 text-center align-top">-</td>
                      </tr>
                    );
                  }

                  return displayedEkskuls.map((item, idx) => (
                    <tr key={idx} className="avoid-break-inside">
                      <td className="border border-black px-2 py-1.5 text-center align-top">{idx + 1}</td>
                      <td className="border border-black px-2 py-1.5 font-semibold align-top">{item.name}</td>
                      <td className="border border-black px-2 py-1.5 text-center font-bold align-top">
                        {item.predicate && item.predicate.trim() !== '' ? item.predicate : '-'}
                      </td>
                      <td className="border border-black px-2 py-1.5 text-justify align-top leading-snug text-[11px]">
                        {item.description && item.description.trim() !== '' ? item.description : '-'}
                      </td>
                    </tr>
                  ));
                })()}
              </tbody>
            </table>
          </div>

          {/* C. Ketidakhadiran */}
          <div className="mb-4 avoid-break-inside" data-rapor-section="table-c">
            <div className="text-xs font-bold text-black uppercase mb-1.5">
              C. Ketidakhadiran
            </div>
            <table className="border-collapse border border-black text-xs w-72">
              <tbody>
                <tr>
                  <td className="border border-black px-3 py-1 font-medium">1. Sakit</td>
                  <td className="border border-black px-3 py-1 text-center font-bold w-24">
                    {att.sakit !== null && att.sakit !== undefined ? `${att.sakit} hari` : '-'}
                  </td>
                </tr>
                <tr>
                  <td className="border border-black px-3 py-1 font-medium">2. Izin</td>
                  <td className="border border-black px-3 py-1 text-center font-bold w-24">
                    {att.izin !== null && att.izin !== undefined ? `${att.izin} hari` : '-'}
                  </td>
                </tr>
                <tr>
                  <td className="border border-black px-3 py-1 font-medium">3. Tanpa Keterangan (Alpa)</td>
                  <td className="border border-black px-3 py-1 text-center font-bold w-24">
                    {att.alpa !== null && att.alpa !== undefined ? `${att.alpa} hari` : '-'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* D. Catatan Wali Kelas (Berada di bawah C. Ketidakhadiran) */}
          <div className="mb-5 avoid-break-inside" data-rapor-section="section-d">
            <div className="text-xs font-bold text-black uppercase mb-1.5">
              D. Catatan Wali Kelas
            </div>
            <div className="border border-black p-2.5 rounded-xs min-h-[50px]">
              <p className="text-justify text-[11px] leading-relaxed italic">
                {note ? `"${note}"` : <span className="text-slate-400">Ananda menunjukkan sikap dan perilaku yang baik selama mengikuti pembelajaran di semester ini. Tingkatkan terus semangat belajar dan pertahankan prestasimu.</span>}
              </p>
            </div>
          </div>

          {/* Signatures / Tanda Tangan */}
          <div className="avoid-break-inside pt-4 mt-8 text-xs" data-rapor-section="signatures">
            <div className="grid grid-cols-2 gap-8 text-center">
              {/* Orang Tua / Wali (Kiri) */}
              <div className="flex flex-col justify-between">
                <div>
                  <p className="font-medium">
                    Mengetahui,
                  </p>
                  <p className="font-medium mb-20">
                    Orang Tua/Wali Peserta Didik
                  </p>
                </div>
                <div>
                  <p className="font-bold uppercase tracking-wider">
                    ( ............................................ )
                  </p>
                  <p className="text-[11px] invisible select-none" aria-hidden="true">
                    &nbsp;
                  </p>
                </div>
              </div>

              {/* Guru Kelas (Kanan) dengan Titimangsa Tanggal Sejajar di Baris Orang Tua */}
              <div className="flex flex-col justify-between">
                <div>
                  <p className="font-medium">
                    {identity.tempatTanggalRapor || 'Bekasi, 19 Desember 2026'}
                  </p>
                  <p className="font-medium mb-20">
                    Guru Kelas {identity.kelas} ({identity.rombel})
                  </p>
                </div>
                <div>
                  <p className="font-bold underline uppercase">
                    {identity.namaGuru || '( ............................................ )'}
                  </p>
                  <p className="text-[11px] text-slate-700">
                    NIP. {identity.nipGuru || '............................................'}
                  </p>
                </div>
              </div>
            </div>

            {/* Kepala Sekolah (Tengah) */}
            <div className="text-center mt-10">
              <p className="font-medium mb-20">
                Mengetahui,<br />
                Kepala {identity.namaSekolah}
              </p>
              <p className="font-bold underline uppercase">
                {identity.namaKepalaSekolah || '( ............................................ )'}
              </p>
              <p className="text-[11px] text-slate-700">
                NIP. {identity.nipKepalaSekolah || '............................................'}
              </p>
            </div>
          </div>

          {/* Footer Lembar 2 */}
          <div className="rapor-sheet-footer pt-3 mt-8 border-t border-black flex justify-between items-center text-[10px] text-black">
            <span className="font-medium">{student.nama}_{student.nisn || student.nis || '-'}</span>
            <span className="font-semibold">Halaman 2</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Save Notification Banner */}
      {saveNotice && (
        <div className="no-print p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold rounded-xl flex items-center gap-2.5 shadow-xs">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{saveNotice}</span>
        </div>
      )}

      {/* Generating PDF Progress Banner */}
      {isGeneratingPdf && (
        <div className="no-print p-4 bg-blue-50 border border-blue-300 text-blue-900 text-xs font-semibold rounded-xl flex items-center gap-3 shadow-xs animate-pulse">
          <Loader2 className="w-5 h-5 text-blue-600 animate-spin shrink-0" />
          <div className="flex-1">
            <div className="font-bold">Sedang Menyiapkan Dokumen PDF A4...</div>
            <div className="text-[11px] text-blue-700 font-normal mt-0.5">
              {pdfProgressText || 'Memproses konversi elemen rapor ke standar halaman A4...'}
            </div>
          </div>
        </div>
      )}

      {/* PDF Error Alert Banner */}
      {pdfErrorMessage && (
        <div className="no-print p-4 bg-rose-50 border border-rose-300 text-rose-900 text-xs rounded-xl flex items-start gap-2.5 shadow-xs">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="font-bold">Terjadi Kendala Saat Membuat PDF</div>
            <div className="text-[11px] text-rose-700 mt-0.5">{pdfErrorMessage}</div>
            <div className="text-[11px] text-rose-600 mt-1">
              Tips: Anda juga dapat menggunakan tombol <strong>CETAK (PRINT)</strong> dan memilih opsi <em>"Save as PDF" / "Simpan sebagai PDF"</em> di browser.
            </div>
          </div>
          <button
            onClick={() => setPdfErrorMessage(null)}
            className="text-rose-500 hover:text-rose-800 text-xs font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Control Bar (Hidden on print) */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs no-print flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Printer className="w-5 h-5 text-emerald-700" />
            <span>Cetak & Unduh Rapor - {identity.rombel}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Format A4 Portrait Kurikulum Merdeka. Unduh file PDF langsung atau cetak blangko tanpa Kop Sekolah.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          {/* Toggle Single / All */}
          <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-100">
            <button
              onClick={() => setPrintMode('single')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                printMode === 'single'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Cetak Siswa Ini
            </button>
            <button
              onClick={() => setPrintMode('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                printMode === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua Siswa ({students.length})
            </button>
          </div>

          {/* Toggle Kop Sekolah (Default TANPA KOP sesuai instruksi user) */}
          <button
            type="button"
            id="toggle-kop-sekolah"
            onClick={() => setIncludeKopSekolah(!includeKopSekolah)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors flex items-center gap-1.5 cursor-pointer ${
              !includeKopSekolah
                ? 'bg-amber-50 border-amber-300 text-amber-900 font-bold'
                : 'bg-slate-100 border-slate-300 text-slate-700'
            }`}
            title="Klik untuk menyembunyikan atau menampilkan Kop Sekolah dan Logo"
          >
            {!includeKopSekolah ? (
              <>
                <Check className="w-3.5 h-3.5 text-amber-700" />
                <span>Tanpa Kop Sekolah</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-slate-400" />
                <span>Dengan Kop Sekolah</span>
              </>
            )}
          </button>

          {/* Button Unduh PDF (A4 Portrait) */}
          <button
            id="btn-download-pdf"
            onClick={handleDownloadPDF}
            disabled={isGeneratingPdf}
            title="Unduh dokumen langsung dalam format PDF ukuran A4 Portrait"
            className="px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{isGeneratingPdf ? 'Memproses PDF...' : 'UNDUH PDF (A4)'}</span>
          </button>

          {/* Button Cetak Browser (A4 / PDF) */}
          <button
            id="btn-print-rapor"
            onClick={handlePrint}
            title="Buka dialog cetak browser (Ctrl+P / Simpan sebagai PDF)"
            className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>CETAK (PRINT)</span>
          </button>

          {/* Button Simpan Data */}
          <button
            id="btn-save-rapor-data"
            onClick={handleSaveData}
            title="Simpan seluruh data kehadiran & catatan rapor"
            className="px-3 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 shadow-2xs cursor-pointer"
          >
            <Save className="w-3.5 h-3.5 text-emerald-700" />
            <span>Simpan</span>
          </button>
        </div>
      </div>

      {/* Notice info on Kop Sekolah */}
      {!includeKopSekolah && (
        <div className="no-print px-4 py-2 bg-amber-50/80 border border-amber-200 text-amber-900 rounded-xl text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
            <span>
              <strong>Mode Tanpa Kop Sekolah Aktif:</strong> Format disesuaikan pas pada kertas A4 Portrait tanpa logo/kop sekolah.
            </span>
          </div>
          <button
            onClick={() => setIncludeKopSekolah(true)}
            className="text-[11px] text-amber-800 underline hover:text-amber-950 font-semibold shrink-0 cursor-pointer ml-2"
          >
            Gunakan Kop
          </button>
        </div>
      )}

      {/* Student Selector & Direct Attendance / Notes Editor for the student (Hidden on print) */}
      {printMode === 'single' && currentStudent && (
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs no-print space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center border-b border-slate-100 pb-3">
            <div className="flex items-center gap-3">
              <label className="text-xs font-bold text-slate-700">Pilih Siswa:</label>
              <select
                id="select-student-rapor"
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              >
                {students.map((s, idx) => (
                  <option key={s.student_id} value={s.student_id}>
                    {idx + 1}. {s.nama} ({s.nisn || 'No NISN'})
                  </option>
                ))}
              </select>
            </div>

            <div className="text-xs text-slate-500">
              Menampilkan lembar rapor untuk <strong>{currentStudent.nama}</strong>
            </div>
          </div>

          {/* Inline Editor for Attendance & Teacher Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {/* Kehadiran */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div className="text-xs font-bold text-slate-800 mb-2">
                Input Kehadiran Semester ({currentStudent.nama})
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] text-slate-600 mb-1">Sakit (Hari)</label>
                  <input
                    type="number"
                    min="0"
                    value={rombelData.attendance[currentStudent.student_id]?.sakit ?? ''}
                    onChange={(e) =>
                      handleAttendanceChange(currentStudent.student_id, 'sakit', e.target.value)
                    }
                    placeholder="0"
                    className="w-full p-1.5 text-center text-xs bg-white border border-slate-300 rounded-md font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-600 mb-1">Izin (Hari)</label>
                  <input
                    type="number"
                    min="0"
                    value={rombelData.attendance[currentStudent.student_id]?.izin ?? ''}
                    onChange={(e) =>
                      handleAttendanceChange(currentStudent.student_id, 'izin', e.target.value)
                    }
                    placeholder="0"
                    className="w-full p-1.5 text-center text-xs bg-white border border-slate-300 rounded-md font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-600 mb-1">Alpa (Hari)</label>
                  <input
                    type="number"
                    min="0"
                    value={rombelData.attendance[currentStudent.student_id]?.alpa ?? ''}
                    onChange={(e) =>
                      handleAttendanceChange(currentStudent.student_id, 'alpa', e.target.value)
                    }
                    placeholder="0"
                    className="w-full p-1.5 text-center text-xs bg-white border border-slate-300 rounded-md font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Catatan Wali Kelas */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex flex-col justify-between">
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-slate-800">
                  Catatan Wali Kelas
                </label>
                <button
                  type="button"
                  onClick={() => handleGenerateDefaultNote(currentStudent.student_id)}
                  className="text-[11px] text-purple-700 hover:text-purple-900 font-semibold flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Generate Catatan Otomatis</span>
                </button>
              </div>
              <textarea
                rows={2}
                value={rombelData.notes[currentStudent.student_id] || ''}
                onChange={(e) => handleNoteChange(currentStudent.student_id, e.target.value)}
                placeholder="Tuliskan catatan dan motivasi untuk peserta didik..."
                className="w-full p-2 bg-white border border-slate-300 rounded-md text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-2 pt-2 border-t border-slate-100">
            <p className="text-[11px] text-slate-500">
              Perubahan pada kehadiran & catatan wali kelas di atas otomatis disimpan saat mencetak atau klik tombol di samping.
            </p>
            <button
              type="button"
              onClick={handleSaveData}
              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Simpan Kehadiran & Catatan</span>
            </button>
          </div>
        </div>
      )}

      {/* Rapor Sheet Container */}
      {students.length > 0 ? (
        <div className="pt-2">
          {printMode === 'single' ? (
            currentStudent ? (
              renderRaporCard(currentStudent)
            ) : null
          ) : (
            <div id="rapor-sheets-container">
              <div className="no-print p-3 bg-blue-50 border border-blue-200 text-blue-800 text-xs rounded-lg mb-4 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600 shrink-0" />
                <span>
                  Mode Cetak Semua Siswa aktif. Setiap siswa akan otomatis dipisah satu halaman A4 penuh saat dicetak atau diunduh PDF.
                </span>
              </div>
              {students.map((std) => renderRaporCard(std, true))}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400 no-print">
          <p className="text-xs">Belum ada siswa di {identity.rombel}. Tambahkan siswa untuk melihat dan mencetak rapor.</p>
        </div>
      )}
    </div>
  );
};
