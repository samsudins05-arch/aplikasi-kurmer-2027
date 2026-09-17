import React, { useState } from 'react';
import { Student, RombelData } from '../types';
import {
  Users,
  Plus,
  Trash2,
  Edit2,
  Search,
  Check,
  X,
  Upload,
  Download,
  AlertTriangle,
  UserCheck,
} from 'lucide-react';

interface DataSiswaViewProps {
  rombelData: RombelData;
  setRombelData: React.Dispatch<React.SetStateAction<RombelData>>;
  markDirty: () => void;
  onImportExcelModal: () => void;
  onExportExcel: () => void;
}

export const DataSiswaView: React.FC<DataSiswaViewProps> = ({
  rombelData,
  setRombelData,
  markDirty,
  onImportExcelModal,
  onExportExcel,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Form State for Add / Edit
  const [formData, setFormData] = useState<Omit<Student, 'student_id'>>({
    nis: '',
    nisn: '',
    nama: '',
    jenisKelamin: 'L',
    tempatLahir: '',
    tanggalLahir: '',
    nik: '',
    namaOrtu: '',
    nomorKK: '',
    alamat: '',
    desaKelurahan: 'Babelan Kota',
    kecamatan: 'Kec. Babelan',
    kabupaten: 'Kab. Bekasi',
    provinsi: 'Jawa Barat',
  });

  const students = rombelData.students;

  const filteredStudents = students.filter((s) => {
    const q = searchTerm.toLowerCase();
    return (
      s.nama.toLowerCase().includes(q) ||
      s.nisn.toLowerCase().includes(q) ||
      s.nis.toLowerCase().includes(q)
    );
  });

  const handleOpenAdd = () => {
    setEditingStudent(null);
    setFormData({
      nis: '',
      nisn: '',
      nama: '',
      jenisKelamin: 'L',
      tempatLahir: '',
      tanggalLahir: '',
      nik: '',
      namaOrtu: '',
      nomorKK: '',
      alamat: '',
      desaKelurahan: 'Babelan Kota',
      kecamatan: 'Kec. Babelan',
      kabupaten: 'Kab. Bekasi',
      provinsi: 'Jawa Barat',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      nis: student.nis || '',
      nisn: student.nisn || '',
      nama: student.nama || '',
      jenisKelamin: student.jenisKelamin || 'L',
      tempatLahir: student.tempatLahir || '',
      tanggalLahir: student.tanggalLahir || '',
      nik: student.nik || '',
      namaOrtu: student.namaOrtu || '',
      nomorKK: student.nomorKK || '',
      alamat: student.alamat || '',
      desaKelurahan: student.desaKelurahan || '',
      kecamatan: student.kecamatan || '',
      kabupaten: student.kabupaten || '',
      provinsi: student.provinsi || '',
    });
    setIsModalOpen(true);
  };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama.trim()) {
      alert('Nama siswa wajib diisi.');
      return;
    }

    if (editingStudent) {
      // Update existing student with stable student_id
      setRombelData((prev) => {
        const next = { ...prev };
        next.students = next.students.map((s) =>
          s.student_id === editingStudent.student_id
            ? { ...formData, student_id: editingStudent.student_id }
            : s
        );
        return next;
      });
    } else {
      // Create new student with unique stable ID
      const newStudentId = `std_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const newStudent: Student = {
        ...formData,
        student_id: newStudentId,
      };

      setRombelData((prev) => ({
        ...prev,
        students: [...prev.students, newStudent],
      }));
    }

    markDirty();
    setIsModalOpen(false);
  };

  const handleDeleteStudent = (student: Student) => {
    if (
      confirm(
        `Apakah Anda yakin ingin menghapus siswa "${student.nama}"? Seluruh nilai terkait siswa ini akan dihapus.`
      )
    ) {
      setRombelData((prev) => {
        const next = { ...prev };
        next.students = next.students.filter((s) => s.student_id !== student.student_id);
        delete next.grades[student.student_id];
        delete next.descriptions[student.student_id];
        delete next.attendance[student.student_id];
        delete next.notes[student.student_id];
        return next;
      });
      markDirty();
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header controls */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-700" />
            <span>Data Siswa {rombelData.identity.rombel}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Total {students.length} siswa terdaftar. Identitas siswa dikelola menggunakan ID unik yang stabil.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            id="btn-add-student"
            onClick={handleOpenAdd}
            className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Siswa</span>
          </button>
          <button
            id="btn-import-excel-students"
            onClick={onImportExcelModal}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import Excel</span>
          </button>
          <button
            id="btn-export-excel-students"
            onClick={onExportExcel}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="input-search-student"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari berdasarkan nama siswa, NISN, atau NIS..."
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 shadow-2xs"
          />
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/80 text-slate-700 font-semibold border-b border-slate-200 text-[11px] uppercase tracking-wider">
                <th className="py-3 px-3 w-12 text-center">No</th>
                <th className="py-3 px-3 w-28">NISN</th>
                <th className="py-3 px-3 w-24">NIS</th>
                <th className="py-3 px-4 min-w-[200px]">Nama Lengkap Siswa</th>
                <th className="py-3 px-3 w-16 text-center">L/P</th>
                <th className="py-3 px-3 min-w-[150px]">Tempat, Tgl Lahir</th>
                <th className="py-3 px-3 min-w-[150px]">Nama Orang Tua</th>
                <th className="py-3 px-3 min-w-[180px]">Alamat & Desa</th>
                <th className="py-3 px-3 w-24 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((s, idx) => (
                <tr
                  key={s.student_id}
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  <td className="py-3 px-3 text-center text-slate-500 font-medium">
                    {idx + 1}
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-700">
                    {s.nisn || <span className="text-slate-300">-</span>}
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-600">
                    {s.nis || <span className="text-slate-300">-</span>}
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900">
                    {s.nama}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-md font-bold text-[10px] ${
                        s.jenisKelamin === 'P'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}
                    >
                      {s.jenisKelamin || 'L'}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-600">
                    {s.tempatLahir || s.tanggalLahir ? (
                      `${s.tempatLahir || ''}${s.tempatLahir && s.tanggalLahir ? ', ' : ''}${s.tanggalLahir || ''}`
                    ) : (
                      <span className="text-slate-300">-</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-slate-700">
                    {s.namaOrtu || <span className="text-slate-300">-</span>}
                  </td>
                  <td className="py-3 px-3 text-slate-600 truncate max-w-[200px]">
                    {s.alamat ? `${s.alamat}, ${s.desaKelurahan}` : <span className="text-slate-300">-</span>}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(s)}
                        title="Edit Data Siswa"
                        className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteStudent(s)}
                        title="Hapus Siswa"
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    {students.length === 0 ? (
                      <div className="space-y-2">
                        <UserCheck className="w-8 h-8 mx-auto text-slate-300" />
                        <p className="text-xs font-medium text-slate-500">
                          Belum ada data siswa di {rombelData.identity.rombel}.
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Klik tombol "Tambah Siswa" atau "Import Excel" di atas untuk menambahkan siswa.
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs">
                        Tidak ada siswa dengan kata kunci "{searchTerm}".
                      </p>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add / Edit Student */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-2xl my-8 overflow-hidden">
            <div className="bg-slate-900 text-white p-4 px-6 flex justify-between items-center">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" />
                <span>{editingStudent ? 'Edit Data Siswa' : 'Tambah Siswa Baru'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nama Lengkap Siswa *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nama}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                    placeholder="Nama lengkap siswa"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Jenis Kelamin *
                  </label>
                  <select
                    value={formData.jenisKelamin}
                    onChange={(e) => setFormData({ ...formData, jenisKelamin: e.target.value as 'L' | 'P' })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="L">Laki-laki (L)</option>
                    <option value="P">Perempuan (P)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    NISN (Nomor Induk Siswa Nasional)
                  </label>
                  <input
                    type="text"
                    value={formData.nisn}
                    onChange={(e) => setFormData({ ...formData, nisn: e.target.value })}
                    placeholder="10 digit NISN"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    NIS (Nomor Induk Sekolah)
                  </label>
                  <input
                    type="text"
                    value={formData.nis}
                    onChange={(e) => setFormData({ ...formData, nis: e.target.value })}
                    placeholder="NIS Sekolah"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Tempat Lahir
                  </label>
                  <input
                    type="text"
                    value={formData.tempatLahir}
                    onChange={(e) => setFormData({ ...formData, tempatLahir: e.target.value })}
                    placeholder="Contoh: Bekasi"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Tanggal Lahir
                  </label>
                  <input
                    type="date"
                    value={formData.tanggalLahir}
                    onChange={(e) => setFormData({ ...formData, tanggalLahir: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    NIK Siswa
                  </label>
                  <input
                    type="text"
                    value={formData.nik}
                    onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                    placeholder="16 digit NIK"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nama Orang Tua / Wali
                  </label>
                  <input
                    type="text"
                    value={formData.namaOrtu}
                    onChange={(e) => setFormData({ ...formData, namaOrtu: e.target.value })}
                    placeholder="Nama Ayah/Ibu/Wali"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nomor KK
                  </label>
                  <input
                    type="text"
                    value={formData.nomorKK}
                    onChange={(e) => setFormData({ ...formData, nomorKK: e.target.value })}
                    placeholder="Nomor Kartu Keluarga"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Desa / Kelurahan
                  </label>
                  <input
                    type="text"
                    value={formData.desaKelurahan}
                    onChange={(e) => setFormData({ ...formData, desaKelurahan: e.target.value })}
                    placeholder="Babelan Kota"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Alamat Lengkap
                  </label>
                  <textarea
                    rows={2}
                    value={formData.alamat}
                    onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                    placeholder="Jalan, RT/RW, Dusun"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold shadow-xs flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingStudent ? 'Simpan Perubahan' : 'Tambahkan Siswa'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
