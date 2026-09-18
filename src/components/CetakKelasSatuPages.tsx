import React from 'react';
import { SchoolIdentity, Student } from '../types';

interface PageProps {
  student: Student;
  identity: SchoolIdentity;
  rombelLabel: string;
  id?: string;
  isBatchItem?: boolean;
}

/**
 * Gambar 1.1: Cover Rapor Peserta Didik
 * - Lambang Kabupaten Bekasi
 * - SEKOLAH DASAR (SD)
 * - Logo SDN Babelan Kota 01
 * - Nama Peserta Didik (Kotak Tebal)
 * - NISN / NIS (Kotak Tebal)
 * - KEMENTERIAN PENDIDIKAN DASAR DAN MENENGAH REPUBLIK INDONESIA
 * - Footer: [Rombel] | [Nama] | [NIS]   Halaman i
 */
export const CoverRaporPage: React.FC<PageProps> = ({
  student,
  identity,
  rombelLabel,
  id,
  isBatchItem,
}) => {
  const pageId = id || `rapor-page-cover-${student.student_id}`;
  const studentIdentifier = `${rombelLabel} | ${student.nama} | ${student.nis || student.nisn || '-'}`;

  return (
    <div
      id={pageId}
      data-page="cover"
      style={{ backgroundColor: '#ffffff', color: '#000000' }}
      className={`rapor-page bg-white text-black p-8 sm:p-14 max-w-[210mm] mx-auto min-h-[297mm] flex flex-col justify-between items-center text-center shadow-md border border-slate-200 print:p-0 print:border-none print:shadow-none print:break-after-page page-break-after relative ${
        isBatchItem ? 'mb-8' : ''
      }`}
    >
      {/* 1. BAGIAN ATAS: Lambang Kab. Bekasi & Tulisan SEKOLAH DASAR (SD) */}
      <div className="flex flex-col items-center pt-2 sm:pt-4">
        <div className="w-24 sm:w-28 h-auto flex items-center justify-center mb-3">
          <img
            src="/logo-kab-bekasi.jpg"
            alt="Lambang Kabupaten Bekasi"
            className="w-24 sm:w-28 h-auto object-contain"
            crossOrigin="anonymous"
          />
        </div>
        <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-black">
          SEKOLAH DASAR
        </h1>
        <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-black mt-0.5">
          SD
        </h2>
      </div>

      {/* 2. BAGIAN TENGAH: Logo SDN Babelan Kota 01 & Kotak Identitas Siswa */}
      <div className="flex flex-col items-center my-6 sm:my-8 w-full">
        <div className="w-28 sm:w-32 h-auto flex items-center justify-center mb-6 sm:mb-8">
          <img
            src={identity.logoUrl || '/logo-bakot-01.png'}
            alt="Logo SDN Babelan Kota 01"
            className="w-28 sm:w-32 h-auto object-contain"
            crossOrigin="anonymous"
          />
        </div>

        <div className="w-full max-w-[420px] space-y-4">
          <div>
            <p className="text-xs sm:text-sm font-semibold text-black mb-1.5">
              Nama Peserta Didik
            </p>
            <div className="border-2 border-black py-2 px-4 bg-white">
              <p className="font-extrabold text-sm sm:text-base uppercase tracking-wide text-black truncate">
                {student.nama || '...................................................'}
              </p>
            </div>
          </div>

          <div>
            <p className="text-xs sm:text-sm font-semibold text-black mb-1.5">
              NISN / NIS
            </p>
            <div className="border-2 border-black py-2 px-4 bg-white">
              <p className="font-extrabold text-sm sm:text-base tracking-widest text-black">
                {student.nisn || student.nis
                  ? `${student.nisn || '-'} / ${student.nis || '-'}`
                  : '...................................................'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. BAGIAN BAWAH: Kementerian */}
      <div className="w-full">
        <div className="mb-4 sm:mb-6 text-center">
          <h3 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-black leading-snug">
            KEMENTERIAN PENDIDIKAN DASAR DAN MENENGAH
          </h3>
          <h4 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-black mt-0.5">
            REPUBLIK INDONESIA
          </h4>
        </div>
      </div>
    </div>
  );
};

/**
 * Gambar 2.1: Biodata Sekolah (Rapor Peserta Didik SD)
 * - RAPOR PESERTA DIDIK SEKOLAH DASAR (SD)
 * - Margin Kiri 2cm (20mm)
 * - Informasi lengkap satuan pendidikan dengan Spasi Paragraf 2.0 & Font Arial 12
 * - Tanpa footer halaman
 */
export const BiodataSekolahPage: React.FC<PageProps> = ({
  student,
  identity,
  id,
  isBatchItem,
}) => {
  const pageId = id || `rapor-page-school-${student.student_id}`;

  return (
    <div
      id={pageId}
      data-page="school-bio"
      style={{
        backgroundColor: '#ffffff',
        color: '#000000',
        fontFamily: 'Arial, Helvetica, sans-serif',
        paddingLeft: '20mm',
        paddingRight: '15mm',
        paddingTop: '15mm',
        paddingBottom: '15mm',
      }}
      className={`rapor-page bg-white text-black max-w-[210mm] mx-auto min-h-[297mm] flex flex-col justify-start shadow-md border border-slate-200 print:border-none print:shadow-none print:break-after-page page-break-after relative ${
        isBatchItem ? 'mb-8' : ''
      }`}
    >
      {/* 1. Header Judul Lengkap */}
      <div className="text-center pt-1 mb-6">
        <h1 className="text-base sm:text-lg font-black uppercase tracking-wider text-black leading-tight">
          RAPOR PESERTA DIDIK
        </h1>
        <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-black mt-0.5 leading-tight">
          SEKOLAH DASAR (SD)
        </h2>
      </div>

      {/* 2. Isi Biodata Satuan Pendidikan - Jarak Spasi Paragraf 2.0 & Font Arial 12 */}
      <div
        className="w-full flex-1"
        style={{
          fontFamily: 'Arial, Helvetica, sans-serif',
          fontSize: '12pt',
          lineHeight: '2.0',
        }}
      >
        <div className="flex items-start">
          <span className="w-48 sm:w-56 font-semibold shrink-0">Nama Sekolah</span>
          <span className="w-4 shrink-0">:</span>
          <span className="font-bold flex-1 uppercase">{identity.namaSekolah || 'SDN BABELAN KOTA 01'}</span>
        </div>
        <div className="flex items-start">
          <span className="w-48 sm:w-56 font-semibold shrink-0">NPSN</span>
          <span className="w-4 shrink-0">:</span>
          <span className="font-mono flex-1">{identity.npsn || '20218359'}</span>
        </div>
        <div className="flex items-start">
          <span className="w-48 sm:w-56 font-semibold shrink-0">NIS/NSS/NDS</span>
          <span className="w-4 shrink-0">:</span>
          <span className="font-mono flex-1">{identity.nisNssNds || '101020501001'}</span>
        </div>
        <div className="flex items-start">
          <span className="w-48 sm:w-56 font-semibold shrink-0">Alamat Sekolah</span>
          <span className="w-4 shrink-0">:</span>
          <span className="flex-1">{identity.alamatSekolah || 'Kp. Babelan RT. 009 RW. 002'}</span>
        </div>
        <div className="flex items-start">
          <span className="w-48 sm:w-56 font-semibold shrink-0">Kode Pos</span>
          <span className="w-4 shrink-0">:</span>
          <span className="font-mono flex-1">{identity.kodePos || '17610'}</span>
        </div>
        <div className="flex items-start">
          <span className="w-48 sm:w-56 font-semibold shrink-0">Kelurahan / Desa</span>
          <span className="w-4 shrink-0">:</span>
          <span className="flex-1">{identity.desaKelurahan || 'Babelan Kota'}</span>
        </div>
        <div className="flex items-start">
          <span className="w-48 sm:w-56 font-semibold shrink-0">Kecamatan</span>
          <span className="w-4 shrink-0">:</span>
          <span className="flex-1">{identity.kecamatan || 'Babelan'}</span>
        </div>
        <div className="flex items-start">
          <span className="w-48 sm:w-56 font-semibold shrink-0">Kota/Kabupaten</span>
          <span className="w-4 shrink-0">:</span>
          <span className="flex-1">{identity.kabupaten || 'Kabupaten Bekasi'}</span>
        </div>
        <div className="flex items-start">
          <span className="w-48 sm:w-56 font-semibold shrink-0">Provinsi</span>
          <span className="w-4 shrink-0">:</span>
          <span className="flex-1">{identity.provinsi || 'Jawa Barat'}</span>
        </div>
        <div className="flex items-start">
          <span className="w-48 sm:w-56 font-semibold shrink-0">Website</span>
          <span className="w-4 shrink-0">:</span>
          <span className="flex-1 text-slate-900">{identity.websiteSekolah || 'https://sdnbabelankota01.sch.id'}</span>
        </div>
        <div className="flex items-start">
          <span className="w-48 sm:w-56 font-semibold shrink-0">E-mail</span>
          <span className="w-4 shrink-0">:</span>
          <span className="flex-1 text-slate-900">{identity.emailSekolah || 'sdn.babelankota01@gmail.com'}</span>
        </div>
      </div>
    </div>
  );
};

/**
 * Gambar 3.1: Biodata Peserta Didik (Identitas Peserta Didik)
 * - Watermark logo di latar belakang
 * - 17 butir identitas lengkap peserta didik
 * - Kotak Pas Foto 3x4 cm
 * - Titimangsa & Tanda Tangan Kepala Sekolah (Ilah Muhafilah, M.Pd., NIP. 197111092000032002)
 * - Footer: [Rombel] | [Nama] | [NIS]   Halaman iii
 */
export const BiodataSiswaPage: React.FC<PageProps> = ({
  student,
  identity,
  rombelLabel,
  id,
  isBatchItem,
}) => {
  const pageId = id || `rapor-page-student-bio-${student.student_id}`;

  const ttl = student.tempatLahir && student.tanggalLahir
    ? `${student.tempatLahir}, ${student.tanggalLahir}`
    : student.tempatLahir || student.tanggalLahir || '-';

  const jk = student.jenisKelamin === 'L'
    ? 'Laki-laki'
    : student.jenisKelamin === 'P'
    ? 'Perempuan'
    : '-';

  const alamatSiswa = student.alamat
    ? `${student.alamat}${student.desaKelurahan ? `, ${student.desaKelurahan}` : ''}${student.kecamatan ? `, ${student.kecamatan}` : ''}`
    : 'Babelan Kota, Kec. Babelan, Kab. Bekasi';

  const alamatOrtu = student.alamatOrtu || alamatSiswa;

  return (
    <div
      id={pageId}
      data-page="student-bio"
      style={{
        backgroundColor: '#ffffff',
        color: '#000000',
        fontFamily: 'Arial, Helvetica, sans-serif',
        fontSize: '12pt',
        paddingLeft: '20mm',
        paddingRight: '25mm',
        paddingTop: '10mm',
        paddingBottom: '10mm',
      }}
      className={`rapor-page bg-white text-black max-w-[210mm] mx-auto min-h-[297mm] flex flex-col justify-between shadow-md border border-slate-200 print:border-none print:shadow-none print:break-after-page page-break-after relative overflow-hidden ${
        isBatchItem ? 'mb-8' : ''
      }`}
    >
      {/* Watermark Logo Transparan di Tengah (Sesuai Gambar 3.1) */}
      <div className="absolute top-[46%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 opacity-[0.06] pointer-events-none select-none z-0">
        <img
          src="/logo-bakot-01.png"
          alt=""
          className="w-80 h-auto object-contain"
          crossOrigin="anonymous"
        />
      </div>

      <div className="relative z-10 flex flex-col flex-1 justify-between">
        {/* 1. Header Judul */}
        <div className="text-center pb-2 mb-3 border-b-2 border-black">
          <h1 className="font-black uppercase tracking-wider text-black leading-tight" style={{ fontSize: '13pt' }}>
            IDENTITAS PESERTA DIDIK
          </h1>
        </div>

        {/* 2. Daftar 17 Poin Identitas Peserta Didik - Font Arial 12 */}
        <div
          className="space-y-0.5 text-black"
          style={{
            fontFamily: 'Arial, Helvetica, sans-serif',
            fontSize: '12pt',
            lineHeight: '1.38',
          }}
        >
          {/* 1. Nama Lengkap */}
          <div className="flex items-start">
            <span className="w-6 shrink-0">1.</span>
            <span className="w-56 sm:w-60 shrink-0 font-medium">Nama Lengkap Peserta Didik</span>
            <span className="w-3 shrink-0">:</span>
            <span className="font-bold flex-1 uppercase">{student.nama}</span>
          </div>

          {/* 2. Nomor Induk / NISN */}
          <div className="flex items-start">
            <span className="w-6 shrink-0">2.</span>
            <span className="w-56 sm:w-60 shrink-0 font-medium">Nomor Induk/NISN</span>
            <span className="w-3 shrink-0">:</span>
            <span className="flex-1 font-mono">{student.nis || '-'} / {student.nisn || '-'}</span>
          </div>

          {/* 3. Tempat, Tanggal Lahir */}
          <div className="flex items-start">
            <span className="w-6 shrink-0">3.</span>
            <span className="w-56 sm:w-60 shrink-0 font-medium">Tempat, Tanggal Lahir</span>
            <span className="w-3 shrink-0">:</span>
            <span className="flex-1">{ttl}</span>
          </div>

          {/* 4. Jenis Kelamin */}
          <div className="flex items-start">
            <span className="w-6 shrink-0">4.</span>
            <span className="w-56 sm:w-60 shrink-0 font-medium">Jenis Kelamin</span>
            <span className="w-3 shrink-0">:</span>
            <span className="flex-1">{jk}</span>
          </div>

          {/* 5. Agama */}
          <div className="flex items-start">
            <span className="w-6 shrink-0">5.</span>
            <span className="w-56 sm:w-60 shrink-0 font-medium">Agama</span>
            <span className="w-3 shrink-0">:</span>
            <span className="flex-1">{student.agama || 'Islam'}</span>
          </div>

          {/* 6. Status dalam Keluarga */}
          <div className="flex items-start">
            <span className="w-6 shrink-0">6.</span>
            <span className="w-56 sm:w-60 shrink-0 font-medium">Status dalam Keluarga</span>
            <span className="w-3 shrink-0">:</span>
            <span className="flex-1">{student.statusKeluarga || 'Anak Kandung'}</span>
          </div>

          {/* 7. Anak ke */}
          <div className="flex items-start">
            <span className="w-6 shrink-0">7.</span>
            <span className="w-56 sm:w-60 shrink-0 font-medium">Anak ke</span>
            <span className="w-3 shrink-0">:</span>
            <span className="flex-1">{student.anakKe || '1'}</span>
          </div>

          {/* 8. Alamat Peserta Didik */}
          <div className="flex items-start">
            <span className="w-6 shrink-0">8.</span>
            <span className="w-56 sm:w-60 shrink-0 font-medium">Alamat Peserta Didik</span>
            <span className="w-3 shrink-0">:</span>
            <span className="flex-1">{alamatSiswa}</span>
          </div>

          {/* 9. Nomor Telepon Rumah */}
          <div className="flex items-start">
            <span className="w-6 shrink-0">9.</span>
            <span className="w-56 sm:w-60 shrink-0 font-medium">Nomor Telepon Rumah</span>
            <span className="w-3 shrink-0">:</span>
            <span className="flex-1">{student.telepon || '-'}</span>
          </div>

          {/* 10. Sekolah Asal */}
          <div className="flex items-start">
            <span className="w-6 shrink-0">10.</span>
            <span className="w-56 sm:w-60 shrink-0 font-medium">Sekolah Asal</span>
            <span className="w-3 shrink-0">:</span>
            <span className="flex-1">{student.sekolahAsal || 'TK / PAUD'}</span>
          </div>

          {/* 11. Diterima di sekolah ini */}
          <div className="space-y-0.5">
            <div className="flex items-start">
              <span className="w-6 shrink-0">11.</span>
              <span className="w-56 sm:w-60 shrink-0 font-medium">Diterima di sekolah ini</span>
              <span className="w-3 shrink-0"></span>
              <span className="flex-1"></span>
            </div>
            <div className="flex items-start pl-6">
              <span className="w-50 sm:w-54 shrink-0">Di kelas</span>
              <span className="w-3 shrink-0">:</span>
              <span className="flex-1 font-semibold">{student.kelasDiterima || 'I (Satu)'}</span>
            </div>
            <div className="flex items-start pl-6">
              <span className="w-50 sm:w-54 shrink-0">Pada tanggal</span>
              <span className="w-3 shrink-0">:</span>
              <span className="flex-1">{student.tanggalDiterima || '14 Juli 2025'}</span>
            </div>
          </div>

          {/* 12. Nama Orang Tua */}
          <div className="space-y-0.5">
            <div className="flex items-start">
              <span className="w-6 shrink-0">12.</span>
              <span className="w-56 sm:w-60 shrink-0 font-medium">Nama Orang Tua</span>
              <span className="w-3 shrink-0"></span>
              <span className="flex-1"></span>
            </div>
            <div className="flex items-start pl-6">
              <span className="w-50 sm:w-54 shrink-0">a. Ayah</span>
              <span className="w-3 shrink-0">:</span>
              <span className="flex-1 font-semibold uppercase">{student.namaAyah || student.namaOrtu || '-'}</span>
            </div>
            <div className="flex items-start pl-6">
              <span className="w-50 sm:w-54 shrink-0">b. Ibu</span>
              <span className="w-3 shrink-0">:</span>
              <span className="flex-1 font-semibold uppercase">{student.namaIbu || '-'}</span>
            </div>
          </div>

          {/* 13. Alamat Orang Tua */}
          <div className="space-y-0.5">
            <div className="flex items-start">
              <span className="w-6 shrink-0">13.</span>
              <span className="w-56 sm:w-60 shrink-0 font-medium">Alamat Orang Tua</span>
              <span className="w-3 shrink-0">:</span>
              <span className="flex-1">{alamatOrtu}</span>
            </div>
            <div className="flex items-start pl-6">
              <span className="w-50 sm:w-54 shrink-0">Nomor Telepon Rumah</span>
              <span className="w-3 shrink-0">:</span>
              <span className="flex-1">{student.teleponOrtu || student.telepon || '-'}</span>
            </div>
          </div>

          {/* 14. Pekerjaan Orang Tua */}
          <div className="space-y-0.5">
            <div className="flex items-start">
              <span className="w-6 shrink-0">14.</span>
              <span className="w-56 sm:w-60 shrink-0 font-medium">Pekerjaan Orang Tua</span>
              <span className="w-3 shrink-0"></span>
              <span className="flex-1"></span>
            </div>
            <div className="flex items-start pl-6">
              <span className="w-50 sm:w-54 shrink-0">a. Ayah</span>
              <span className="w-3 shrink-0">:</span>
              <span className="flex-1">{student.pekerjaanAyah || 'Karyawan Swasta'}</span>
            </div>
            <div className="flex items-start pl-6">
              <span className="w-50 sm:w-54 shrink-0">b. Ibu</span>
              <span className="w-3 shrink-0">:</span>
              <span className="flex-1">{student.pekerjaanIbu || 'Ibu Rumah Tangga'}</span>
            </div>
          </div>

          {/* 15. Nama Wali Siswa */}
          <div className="flex items-start">
            <span className="w-6 shrink-0">15.</span>
            <span className="w-56 sm:w-60 shrink-0 font-medium">Nama Wali Siswa</span>
            <span className="w-3 shrink-0">:</span>
            <span className="flex-1">{student.namaWali || '-'}</span>
          </div>

          {/* 16. Alamat Wali Peserta Didik */}
          <div className="space-y-0.5">
            <div className="flex items-start">
              <span className="w-6 shrink-0">16.</span>
              <span className="w-56 sm:w-60 shrink-0 font-medium">Alamat Wali Peserta Didik</span>
              <span className="w-3 shrink-0">:</span>
              <span className="flex-1">{student.alamatWali || '-'}</span>
            </div>
            <div className="flex items-start pl-6">
              <span className="w-50 sm:w-54 shrink-0">Nomor Telepon Rumah</span>
              <span className="w-3 shrink-0">:</span>
              <span className="flex-1">{student.teleponWali || '-'}</span>
            </div>
          </div>

          {/* 17. Pekerjaan Wali Peserta Didik */}
          <div className="flex items-start">
            <span className="w-6 shrink-0">17.</span>
            <span className="w-56 sm:w-60 shrink-0 font-medium">Pekerjaan Wali Peserta Didik</span>
            <span className="w-3 shrink-0">:</span>
            <span className="flex-1">{student.pekerjaanWali || '-'}</span>
          </div>
        </div>

        {/* 3. Pas Foto 3x4 & Tanda Tangan Kepala Sekolah (Sesuai Gambar 3.1) */}
        <div
          className="pt-2 flex justify-between items-start gap-6 avoid-break-inside"
          style={{
            fontFamily: 'Arial, Helvetica, sans-serif',
            fontSize: '12pt',
          }}
        >
          {/* Kotak Pas Foto 3 x 4 cm */}
          <div className="ml-6">
            {student.fotoUrl ? (
              <div className="w-24 h-32 border-2 border-black overflow-hidden bg-white shadow-2xs">
                <img
                  src={student.fotoUrl}
                  alt={student.nama}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-24 h-32 border-2 border-black flex flex-col items-center justify-center text-center p-2 bg-white shadow-2xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-black">
                  PAS FOTO
                </span>
                <span className="text-[9px] font-semibold text-slate-700 mt-0.5">
                  3 x 4 cm
                </span>
              </div>
            )}
          </div>

          {/* Titimangsa & Tanda Tangan Kepala Sekolah (Naik ke atas, sama rata dengan kotak pas foto) */}
          <div className="text-left w-64 pr-2 h-32 flex flex-col justify-between">
            <div>
              <p className="font-medium leading-snug">
                {identity.tempatTanggalRapor || 'Bekasi, 19 Desember 2026'}
              </p>
              <p className="font-medium mt-0.5 leading-snug">
                Kepala Sekolah
              </p>
            </div>
            <div>
              <p className="font-bold underline uppercase leading-snug">
                {identity.namaKepalaSekolah || 'Ilah Muhafilah, M.Pd.'}
              </p>
              <p className="mt-0.5 leading-snug">
                NIP. {identity.nipKepalaSekolah ? identity.nipKepalaSekolah.replace(/^NIP\.?\s*/i, '') : '197111092000032002'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
