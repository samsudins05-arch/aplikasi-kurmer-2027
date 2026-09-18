import React, { useState } from 'react';
import { Student } from '../types';
import { X, Save, UserCheck } from 'lucide-react';

interface EditBiodataModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student;
  onSave: (updatedStudent: Student) => void;
}

export const EditBiodataModal: React.FC<EditBiodataModalProps> = ({
  isOpen,
  onClose,
  student,
  onSave,
}) => {
  if (!isOpen) return null;

  const [formData, setFormData] = useState<Student>({
    ...student,
    agama: student.agama || 'Islam',
    statusKeluarga: student.statusKeluarga || 'Anak Kandung',
    anakKe: student.anakKe || '1',
    telepon: student.telepon || '',
    sekolahAsal: student.sekolahAsal || 'TK / PAUD',
    kelasDiterima: student.kelasDiterima || 'I (Satu)',
    tanggalDiterima: student.tanggalDiterima || '14 Juli 2025',
    namaAyah: student.namaAyah || student.namaOrtu || '',
    namaIbu: student.namaIbu || '',
    alamatOrtu: student.alamatOrtu || student.alamat || '',
    teleponOrtu: student.teleponOrtu || '',
    pekerjaanAyah: student.pekerjaanAyah || 'Karyawan Swasta',
    pekerjaanIbu: student.pekerjaanIbu || 'Ibu Rumah Tangga',
    namaWali: student.namaWali || '',
    alamatWali: student.alamatWali || '',
    teleponWali: student.teleponWali || '',
    pekerjaanWali: student.pekerjaanWali || '',
  });

  const handleChange = (field: keyof Student, val: string) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs no-print overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">
                Edit Identitas Peserta Didik (Biodata 17 Poin)
              </h3>
              <p className="text-xs text-slate-500">
                Data resmi untuk lembar Biodata Siswa (Gambar 3.1) • {student.nama}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-4 space-y-4 pr-1 text-xs">
          {/* Bagian 1: Data Diri */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
            <h4 className="font-bold text-slate-800 text-xs border-b border-slate-200 pb-1.5">
              1. Data Pribadi Siswa
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  value={formData.nama}
                  onChange={(e) => handleChange('nama', e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg font-bold"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Jenis Kelamin</label>
                <select
                  value={formData.jenisKelamin}
                  onChange={(e) => handleChange('jenisKelamin', e.target.value as any)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                >
                  <option value="L">Laki-laki</option>
                  <option value="P">Perempuan</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">NIS / Nomor Induk</label>
                <input
                  type="text"
                  value={formData.nis}
                  onChange={(e) => handleChange('nis', e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">NISN</label>
                <input
                  type="text"
                  value={formData.nisn}
                  onChange={(e) => handleChange('nisn', e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Tempat Lahir</label>
                <input
                  type="text"
                  value={formData.tempatLahir}
                  onChange={(e) => handleChange('tempatLahir', e.target.value)}
                  placeholder="Contoh: Bekasi"
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Tanggal Lahir</label>
                <input
                  type="text"
                  value={formData.tanggalLahir}
                  onChange={(e) => handleChange('tanggalLahir', e.target.value)}
                  placeholder="Contoh: 12 Mei 2018"
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Agama</label>
                <input
                  type="text"
                  value={formData.agama || ''}
                  onChange={(e) => handleChange('agama', e.target.value)}
                  placeholder="Islam / Kristen / etc."
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Status dalam Keluarga</label>
                <input
                  type="text"
                  value={formData.statusKeluarga || ''}
                  onChange={(e) => handleChange('statusKeluarga', e.target.value)}
                  placeholder="Anak Kandung"
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Anak ke</label>
                <input
                  type="text"
                  value={formData.anakKe || ''}
                  onChange={(e) => handleChange('anakKe', e.target.value)}
                  placeholder="1"
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">No. Telepon Rumah</label>
                <input
                  type="text"
                  value={formData.telepon || ''}
                  onChange={(e) => handleChange('telepon', e.target.value)}
                  placeholder="-"
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-slate-700 font-semibold mb-1">Alamat Peserta Didik</label>
                <input
                  type="text"
                  value={formData.alamat}
                  onChange={(e) => handleChange('alamat', e.target.value)}
                  placeholder="Kp. Babelan RT 008/002"
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Sekolah Asal</label>
                <input
                  type="text"
                  value={formData.sekolahAsal || ''}
                  onChange={(e) => handleChange('sekolahAsal', e.target.value)}
                  placeholder="TK / PAUD"
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Diterima di Kelas & Tanggal</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={formData.kelasDiterima || ''}
                    onChange={(e) => handleChange('kelasDiterima', e.target.value)}
                    placeholder="I (Satu)"
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                  />
                  <input
                    type="text"
                    value={formData.tanggalDiterima || ''}
                    onChange={(e) => handleChange('tanggalDiterima', e.target.value)}
                    placeholder="14 Juli 2025"
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Bagian 2: Orang Tua & Wali */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
            <h4 className="font-bold text-slate-800 text-xs border-b border-slate-200 pb-1.5">
              2. Data Orang Tua & Wali
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Nama Ayah</label>
                <input
                  type="text"
                  value={formData.namaAyah || ''}
                  onChange={(e) => handleChange('namaAyah', e.target.value)}
                  placeholder="Nama Ayah Siswa"
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg font-medium"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Nama Ibu</label>
                <input
                  type="text"
                  value={formData.namaIbu || ''}
                  onChange={(e) => handleChange('namaIbu', e.target.value)}
                  placeholder="Nama Ibu Siswa"
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg font-medium"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Pekerjaan Ayah</label>
                <input
                  type="text"
                  value={formData.pekerjaanAyah || ''}
                  onChange={(e) => handleChange('pekerjaanAyah', e.target.value)}
                  placeholder="Karyawan Swasta / Wiraswasta"
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Pekerjaan Ibu</label>
                <input
                  type="text"
                  value={formData.pekerjaanIbu || ''}
                  onChange={(e) => handleChange('pekerjaanIbu', e.target.value)}
                  placeholder="Ibu Rumah Tangga"
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-slate-700 font-semibold mb-1">Alamat Orang Tua</label>
                <input
                  type="text"
                  value={formData.alamatOrtu || ''}
                  onChange={(e) => handleChange('alamatOrtu', e.target.value)}
                  placeholder="Alamat domisili orang tua"
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Nama Wali (Jika ada)</label>
                <input
                  type="text"
                  value={formData.namaWali || ''}
                  onChange={(e) => handleChange('namaWali', e.target.value)}
                  placeholder="-"
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Pekerjaan Wali</label>
                <input
                  type="text"
                  value={formData.pekerjaanWali || ''}
                  onChange={(e) => handleChange('pekerjaanWali', e.target.value)}
                  placeholder="-"
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg font-semibold cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Identitas Siswa</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
