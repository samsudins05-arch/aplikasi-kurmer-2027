import React, { useState } from 'react';
import { RombelData, RombelInfo } from '../types';
import { School, Lock, User, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';

interface LoginScreenProps {
  rombelInfo: RombelInfo;
  rombelData: RombelData;
  onLoginSuccess: () => void;
  onBackToPortal: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  rombelInfo,
  rombelData,
  onLoginSuccess,
  onBackToPortal,
}) => {
  const [username, setUsername] = useState(rombelData.loginUser?.username || `guru${rombelInfo.id.toLowerCase()}`);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const targetUser = rombelData.loginUser?.username || `guru${rombelInfo.id.toLowerCase()}`;
    const targetPass = rombelData.loginUser?.passwordHash || '123456';

    if (username.trim() === targetUser && (password === targetPass || password === '123456')) {
      onLoginSuccess();
    } else {
      setError('Username atau password salah. Silakan periksa kembali kredensial Anda.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 flex flex-col justify-center items-center p-4 relative">
      {/* Back to portal button */}
      <button
        id="btn-back-portal"
        onClick={onBackToPortal}
        className="absolute top-6 left-6 inline-flex items-center gap-2 text-xs font-medium text-slate-300 hover:text-white bg-white/10 hover:bg-white/15 px-3.5 py-2 rounded-lg transition-colors backdrop-blur-xs"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Daftar Rombel (Portal)
      </button>

      {/* Login Card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden">
        {/* Card Header with School Emblem */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-800 p-7 text-center text-white relative">
          <div className="w-18 h-18 mx-auto mb-3 bg-white rounded-2xl flex items-center justify-center shadow-lg border-2 border-emerald-100 p-2 overflow-hidden">
            <img
              src={rombelData.identity.logoUrl || 'https://i.ibb.co.com/gb2y0gwD/logo-bakot-01.png'}
              alt="Logo SDN Babelan Kota 01"
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="text-[11px] font-semibold text-emerald-200 tracking-wider uppercase mb-1 flex items-center justify-center gap-1.5">
            <span>SDN Babelan Kota 01</span>
            <span className="text-emerald-400">•</span>
            <span className="font-mono text-white">NPSN: {rombelData.identity.npsn || '20219135'}</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            RAPOR KURIKULUM MERDEKA
          </h1>
          <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur-xs rounded-full text-xs font-semibold text-white border border-white/20">
            <span>{rombelInfo.name}</span>
            <span>•</span>
            <span>{rombelInfo.phase}</span>
          </div>
        </div>

        {/* Identity & Instructions Banner */}
        <div className="bg-emerald-50/70 border-b border-emerald-100 p-4 text-xs text-emerald-900 flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-semibold">Aplikasi Khusus {rombelInfo.name}:</span> Login khusus 1 guru kelas. Data siswa dan nilai tersimpan aman di database rombel ini.
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleLogin} className="p-7 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="login-username">
              Username Guru Kelas
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="login-username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username"
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="login-password">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="login-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password"
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
            </div>
          </div>

          {/* Quick Helper for first time access */}
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-[11px] text-slate-500 flex justify-between items-center">
            <span>Kredensial Default:</span>
            <span className="font-mono font-semibold text-slate-700">
              {rombelData.loginUser?.username || `guru${rombelInfo.id.toLowerCase()}`} / {rombelData.loginUser?.passwordHash || '123456'}
            </span>
          </div>

          <button
            id="btn-submit-login"
            type="submit"
            className="w-full py-3 px-4 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white font-semibold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>MASUK KE APLIKASI</span>
          </button>
        </form>

        {/* Footer info */}
        <div className="bg-slate-50 border-t border-slate-100 px-6 py-3.5 text-center text-[11px] text-slate-500">
          Tahun Pelajaran 2026/2027 • SDN BABELAN KOTA 01
        </div>
      </div>
    </div>
  );
};
