import React, { useState } from 'react';
import { RombelData, Subject } from '../types';
import {
  Settings,
  User,
  School,
  BookOpen,
  Lock,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Check,
  AlertCircle,
  Save,
} from 'lucide-react';

interface PengaturanViewProps {
  rombelData: RombelData;
  setRombelData: React.Dispatch<React.SetStateAction<RombelData>>;
  markDirty: () => void;
  onManualSave: () => void;
}

export const PengaturanView: React.FC<PengaturanViewProps> = ({
  rombelData,
  setRombelData,
  markDirty,
  onManualSave,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'identity' | 'subjects' | 'account'>('identity');

  // Identity Form State
  const [namaGuru, setNamaGuru] = useState(rombelData.identity.namaGuru || '');
  const [nipGuru, setNipGuru] = useState(rombelData.identity.nipGuru || '');
  const [namaKepalaSekolah, setNamaKepalaSekolah] = useState(rombelData.identity.namaKepalaSekolah || '');
  const [nipKepalaSekolah, setNipKepalaSekolah] = useState(rombelData.identity.nipKepalaSekolah || '');
  const [namaSekolah, setNamaSekolah] = useState(rombelData.identity.namaSekolah || 'SDN BABELAN KOTA 01');
  const [npsn, setNpsn] = useState(rombelData.identity.npsn || '20219135');
  const [logoUrl, setLogoUrl] = useState(
    rombelData.identity.logoUrl || 'https://i.ibb.co.com/gb2y0gwD/logo-bakot-01.png'
  );
  const [alamatSekolah, setAlamatSekolah] = useState(rombelData.identity.alamatSekolah || '');
  const [tahunPelajaran, setTahunPelajaran] = useState(rombelData.identity.tahunPelajaran || '2026/2027');
  const [semester, setSemester] = useState(rombelData.identity.semester || '1 (Ganjil)');
  const [tempatTanggalRapor, setTempatTanggalRapor] = useState(
    rombelData.identity.tempatTanggalRapor || 'Bekasi, 19 Desember 2026'
  );

  // Account State
  const [username, setUsername] = useState(rombelData.loginUser?.username || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [accountMsg, setAccountMsg] = useState<string | null>(null);

  // New Subject State
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectShort, setNewSubjectShort] = useState('');

  const handleSaveIdentity = (e: React.FormEvent) => {
    e.preventDefault();
    setRombelData((prev) => ({
      ...prev,
      identity: {
        ...prev.identity,
        namaGuru,
        nipGuru,
        namaKepalaSekolah,
        nipKepalaSekolah,
        namaSekolah,
        npsn,
        logoUrl,
        alamatSekolah,
        tahunPelajaran,
        semester,
        tempatTanggalRapor,
      },
    }));
    markDirty();
    onManualSave();
  };

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    setAccountMsg(null);

    if (newPassword && newPassword !== confirmPassword) {
      alert('Konfirmasi password tidak cocok.');
      return;
    }

    setRombelData((prev) => ({
      ...prev,
      loginUser: {
        username: username.trim() || prev.loginUser.username,
        passwordHash: newPassword ? newPassword : prev.loginUser.passwordHash,
      },
    }));
    markDirty();
    setAccountMsg('Akun login guru berhasil diperbarui!');
    setNewPassword('');
    setConfirmPassword('');
  };

  // Subject Management (Section G)
  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectName.trim()) return;

    const newId = `custom_${Date.now()}`;
    const newSubject: Subject = {
      id: newId,
      name: newSubjectName.trim(),
      shortName: newSubjectShort.trim() || newSubjectName.trim().substring(0, 10),
      isCustom: true,
      order: rombelData.subjects.length + 1,
    };

    setRombelData((prev) => ({
      ...prev,
      subjects: [...prev.subjects, newSubject],
    }));
    markDirty();
    setNewSubjectName('');
    setNewSubjectShort('');
  };

  const handleUpdateSubjectName = (id: string, newName: string, newShort: string) => {
    setRombelData((prev) => ({
      ...prev,
      subjects: prev.subjects.map((s) =>
        s.id === id ? { ...s, name: newName, shortName: newShort } : s
      ),
    }));
    markDirty();
  };

  const handleDeleteSubject = (id: string) => {
    const sub = rombelData.subjects.find((s) => s.id === id);
    if (!sub) return;

    if (
      confirm(
        `Apakah Anda yakin ingin menghapus mata pelajaran "${sub.name}"? Nilai terkait mapel ini pada seluruh siswa akan dihapus.`
      )
    ) {
      setRombelData((prev) => {
        const next = { ...prev };
        next.subjects = next.subjects.filter((s) => s.id !== id);
        // Clean grades & descriptions
        Object.keys(next.grades).forEach((stdId) => {
          if (next.grades[stdId]) delete next.grades[stdId][id];
        });
        Object.keys(next.descriptions).forEach((stdId) => {
          if (next.descriptions[stdId]) delete next.descriptions[stdId][id];
        });
        return next;
      });
      markDirty();
    }
  };

  const handleMoveSubject = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= rombelData.subjects.length) return;

    const newSubs = [...rombelData.subjects];
    const temp = newSubs[index];
    newSubs[index] = newSubs[targetIdx];
    newSubs[targetIdx] = temp;

    setRombelData((prev) => ({
      ...prev,
      subjects: newSubs,
    }));
    markDirty();
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-emerald-700" />
            <span>Pengaturan Aplikasi - {rombelData.identity.rombel}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola identitas guru, kepala sekolah, data satuan pendidikan, struktur mata pelajaran, dan keamanan login.
          </p>
        </div>

        <button
          id="btn-save-settings"
          onClick={onManualSave}
          className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>Simpan Pengaturan</span>
        </button>
      </div>

      {/* Sub-tab navigation */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          onClick={() => setActiveSubTab('identity')}
          className={`pb-3 px-4 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'identity'
              ? 'border-emerald-700 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Identitas Guru, Kepsek & Sekolah</span>
        </button>

        <button
          onClick={() => setActiveSubTab('subjects')}
          className={`pb-3 px-4 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'subjects'
              ? 'border-emerald-700 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Struktur Mata Pelajaran ({rombelData.subjects.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('account')}
          className={`pb-3 px-4 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'account'
              ? 'border-emerald-700 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>Akun Login Guru</span>
        </button>
      </div>

      {/* 1. SubTab: Identitas */}
      {activeSubTab === 'identity' && (
        <form onSubmit={handleSaveIdentity} className="space-y-6">
          {/* Guru & Kepsek Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-6">
            <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-700" />
              <span>Identitas Guru Kelas & Kepala Sekolah</span>
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              Data ini akan dicetak pada tanda tangan lembar Rapor Kurikulum Merdeka.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Guru Kelas (dengan gelar)
                </label>
                <input
                  type="text"
                  value={namaGuru}
                  onChange={(e) => setNamaGuru(e.target.value)}
                  placeholder="Contoh: Samsudin, S.Pd."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  NIP Guru Kelas
                </label>
                <input
                  type="text"
                  value={nipGuru}
                  onChange={(e) => setNipGuru(e.target.value)}
                  placeholder="Contoh: 19850101 201001 1 001"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Kepala Sekolah (dengan gelar)
                </label>
                <input
                  type="text"
                  value={namaKepalaSekolah}
                  onChange={(e) => setNamaKepalaSekolah(e.target.value)}
                  placeholder="Nama Kepala Sekolah SDN Babelan Kota 01"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  NIP Kepala Sekolah
                </label>
                <input
                  type="text"
                  value={nipKepalaSekolah}
                  onChange={(e) => setNipKepalaSekolah(e.target.value)}
                  placeholder="NIP Kepala Sekolah"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* School Identity */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-6">
            <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
              <School className="w-4 h-4 text-emerald-700" />
              <span>Identitas Satuan Pendidikan & Periode Rapor</span>
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              Informasi sekolah dan titimangsa penanggalan rapor.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="sm:col-span-2 flex flex-col sm:flex-row items-start sm:items-center gap-4 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="w-16 h-16 bg-white border border-emerald-200 rounded-xl p-1.5 flex items-center justify-center shrink-0 shadow-xs overflow-hidden">
                  <img
                    src={logoUrl || 'https://i.ibb.co.com/gb2y0gwD/logo-bakot-01.png'}
                    alt="Logo Sekolah"
                    className="w-full h-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="flex-1 w-full">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Link / URL Logo Sekolah (Format Gambar)
                  </label>
                  <input
                    type="text"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    placeholder="https://i.ibb.co.com/gb2y0gwD/logo-bakot-01.png"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-mono text-xs"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Logo resmi ini ditampilkan pada kop rapor cetak, login screen, portal rombel, dan dokumen rapor.
                  </p>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Satuan Pendidikan
                </label>
                <input
                  type="text"
                  value={namaSekolah}
                  onChange={(e) => setNamaSekolah(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  NPSN
                </label>
                <input
                  type="text"
                  value={npsn}
                  onChange={(e) => setNpsn(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Tahun Pelajaran
                </label>
                <input
                  type="text"
                  value={tahunPelajaran}
                  onChange={(e) => setTahunPelajaran(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Semester
                </label>
                <select
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="1 (Ganjil)">1 (Ganjil)</option>
                  <option value="2 (Genap)">2 (Genap)</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  Alamat Sekolah
                </label>
                <input
                  type="text"
                  value={alamatSekolah}
                  onChange={(e) => setAlamatSekolah(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Titimangsa Rapor (Tempat, Tanggal)
                </label>
                <input
                  type="text"
                  value={tempatTanggalRapor}
                  onChange={(e) => setTempatTanggalRapor(e.target.value)}
                  placeholder="Contoh: Bekasi, 19 Desember 2026"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Fase (Otomatis berdasarkan kelas)
                </label>
                <input
                  type="text"
                  disabled
                  value={rombelData.identity.fase}
                  className="w-full px-3 py-2 border border-slate-200 bg-slate-100 rounded-lg text-slate-500 font-semibold"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>Simpan Perubahan Identitas</span>
            </button>
          </div>
        </form>
      )}

      {/* 2. SubTab: Mata Pelajaran (Section G) */}
      {activeSubTab === 'subjects' && (
        <div className="space-y-6">
          {/* Add Subject Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5">
            <h3 className="text-xs font-bold text-slate-900 mb-2 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-emerald-700" />
              <span>Tambah Mata Pelajaran Tambahan / Muatan Lokal Baru</span>
            </h3>
            <form onSubmit={handleAddSubject} className="flex flex-col sm:flex-row gap-3 items-end">
              <div className="flex-1">
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Nama Lengkap Mata Pelajaran
                </label>
                <input
                  type="text"
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  placeholder="Contoh: Bahasa Sunda / Informatika Dasar"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="w-full sm:w-44">
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Nama Singkat (Header)
                </label>
                <input
                  type="text"
                  value={newSubjectShort}
                  onChange={(e) => setNewSubjectShort(e.target.value)}
                  placeholder="B. Sunda"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <button
                type="submit"
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold whitespace-nowrap h-[38px] flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Tambahkan</span>
              </button>
            </form>
          </div>

          {/* Subject List Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 text-xs text-slate-700 font-bold flex justify-between items-center">
              <span>Daftar Mata Pelajaran Aktif ({rombelData.subjects.length} Mapel)</span>
              <span className="text-[11px] font-normal text-slate-500">
                Gunakan tombol panah untuk mengatur urutan mata pelajaran.
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {rombelData.subjects.map((sub, idx) => (
                <div
                  key={sub.id}
                  className="p-3.5 px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-md bg-slate-200 text-slate-800 flex items-center justify-center font-bold text-[11px]">
                      {idx + 1}
                    </span>
                    <div>
                      <input
                        type="text"
                        value={sub.name}
                        onChange={(e) =>
                          handleUpdateSubjectName(sub.id, e.target.value, sub.shortName)
                        }
                        className="font-bold text-slate-900 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-emerald-600 focus:bg-white px-1 py-0.5 rounded-xs"
                      />
                      <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-2">
                        <span>ID: {sub.id}</span>
                        <span>•</span>
                        <span>
                          Singkatan:{' '}
                          <input
                            type="text"
                            value={sub.shortName}
                            onChange={(e) =>
                              handleUpdateSubjectName(sub.id, sub.name, e.target.value)
                            }
                            className="font-semibold text-slate-700 bg-transparent border-b border-transparent hover:border-slate-300 px-1 w-20"
                          />
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 self-end sm:self-center">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMoveSubject(idx, 'up')}
                      title="Geser ke Atas"
                      className="p-1.5 text-slate-500 hover:text-slate-900 disabled:opacity-30 rounded-md hover:bg-slate-100"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === rombelData.subjects.length - 1}
                      onClick={() => handleMoveSubject(idx, 'down')}
                      title="Geser ke Bawah"
                      className="p-1.5 text-slate-500 hover:text-slate-900 disabled:opacity-30 rounded-md hover:bg-slate-100"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteSubject(sub.id)}
                      title="Hapus Mata Pelajaran"
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 ml-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. SubTab: Akun Login Guru */}
      {activeSubTab === 'account' && (
        <form onSubmit={handleSaveAccount} className="max-w-xl bg-white rounded-xl border border-slate-200 shadow-2xs p-6 space-y-4 text-xs">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-700" />
              <span>Kredensial Login Guru ({rombelData.identity.rombel})</span>
            </h3>
            <p className="text-slate-500 mb-4">
              Ubah username atau password yang digunakan untuk masuk ke aplikasi rombel ini.
            </p>
          </div>

          {accountMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-lg flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>{accountMsg}</span>
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Username Guru
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Password Baru (kosongkan jika tidak ingin mengubah)
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Masukkan password baru"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {newPassword && (
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Ulangi Password Baru
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Konfirmasi password baru"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          )}

          <div className="pt-3">
            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold transition-colors cursor-pointer"
            >
              Simpan Kredensial Akun
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
