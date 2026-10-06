import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { 
  Anchor, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  Zap, 
  ShieldCheck, 
  Ship, 
  Radio, 
  ArrowRight,
  Compass,
  Users,
  CheckCircle2,
  Sparkles,
  Building2,
  Check,
  Eye as ViewIcon
} from 'lucide-react';

export const LoginForm: React.FC = () => {
  const { loginWithEmail, loginDemo, loginAsRole, loginWithGoogle } = useAuth();
  
  const [username, setUsername] = useState('Capt. Wisnu');
  const [password, setPassword] = useState('bebas123');
  const [selectedRole, setSelectedRole] = useState<UserRole>('Super Admin');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const rolePresets: Array<{
    id: string;
    role: UserRole;
    name: string;
    email: string;
    location: string;
    title: string;
    icon: React.ComponentType<{ className?: string }>;
    accentColor: string;
    badge: string;
  }> = [
    {
      id: 'admin',
      role: 'Super Admin',
      name: 'Capt. Wisnu, M.Mar',
      email: 'wisnujepara28@gmail.com',
      location: 'Command Center Jepara / Jakarta',
      title: 'Direktur Operasi & Super Admin',
      icon: Anchor,
      accentColor: 'border-sky-500 bg-sky-50/80 text-sky-950',
      badge: 'Akses Penuh',
    },
    {
      id: 'fleet',
      role: 'Fleet Manager',
      name: 'Bpk. Surya Wijaya',
      email: 'fleet.manager@japarabahari.co.id',
      location: 'Divisi Armada Tanjung Emas',
      title: 'Manajer Armada & Rute',
      icon: Ship,
      accentColor: 'border-blue-500 bg-blue-50/80 text-blue-950',
      badge: 'Armada & Rute',
    },
    {
      id: 'port',
      role: 'Port Officer',
      name: 'Perwira Hendra, S.ST',
      email: 'port.officer@japarabahari.co.id',
      location: 'Dermaga Pelabuhan Jepara',
      title: 'Petugas Dokumen & Pelabuhan',
      icon: Building2,
      accentColor: 'border-emerald-500 bg-emerald-50/80 text-emerald-950',
      badge: 'B/L & Logistik',
    },
    {
      id: 'guest',
      role: 'Guest Officer',
      name: 'Tamu Maritim Publik',
      email: 'tamu.maritim@japarabahari.co.id',
      location: 'Pemantauan Terbuka',
      title: 'Pengamat Realtime (View)',
      icon: ViewIcon,
      accentColor: 'border-slate-400 bg-slate-50 text-slate-800',
      badge: 'Mode Pengamat',
    },
  ];

  // SUBMIT FORM: Bebas username dan bebas password!
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const finalName = username.trim() || 'Petugas Japara Bahari';
    await loginWithEmail(finalName, password, selectedRole);
    setIsLoading(false);
  };

  const handleSelectPreset = (preset: typeof rolePresets[0]) => {
    loginAsRole(preset.role, preset.name, preset.email, preset.location);
  };

  return (
    <div className="min-h-screen bg-slate-950 relative flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      {/* Background Maritime Oceanic Glow & Grid */}
      <div className="absolute inset-0 opacity-25 pointer-events-none">
        <div className="absolute top-0 -left-40 w-96 h-96 bg-sky-500 rounded-full blur-[140px]" />
        <div className="absolute bottom-0 -right-40 w-96 h-96 bg-blue-600 rounded-full blur-[140px]" />
        <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px] opacity-20" />
      </div>

      <div className="relative w-full max-w-4xl z-10">
        {/* Top Floating Live Badge */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs text-sky-200 mb-3 shadow-lg">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-semibold tracking-wide">Cloud Database Online</span>
            <span className="text-white/40">•</span>
            <span className="text-emerald-300 font-bold">Multi-User Realtime Sync Aktif</span>
          </div>

          <div className="flex items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-400 via-sky-600 to-blue-800 text-white flex items-center justify-center shadow-xl shadow-sky-500/25 ring-2 ring-white/20">
              <Anchor className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                JAPARA BAHARI LINE
              </h1>
              <p className="text-xs font-semibold text-sky-300 tracking-wider uppercase">
                PT Japara Bahari Line Internasional • Fleet Operations
              </p>
            </div>
          </div>
        </div>

        {/* Main Card with Glassmorphism */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/40 p-6 sm:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Col (7 cols): 1-Click Role Login Presets (Paling Mudah) */}
            <div className="lg:col-span-7 space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-bold uppercase tracking-wider text-sky-800">
                    Akses Masuk 1-Klik Instan
                  </span>
                </div>
                <h2 className="text-xl font-black text-slate-900">
                  Pilih Peran Petugas & Masuk Langsung
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Klik profil di bawah ini untuk langsung terhubung ke ruang kendali armada tanpa perlu mengisi form.
                </p>
              </div>

              {/* 4 Quick-Login Role Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {rolePresets.map((preset) => {
                  const Icon = preset.icon;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => handleSelectPreset(preset)}
                      className={`text-left p-3.5 rounded-2xl border transition-all duration-200 hover:shadow-md hover:scale-[1.02] cursor-pointer relative overflow-hidden group ${preset.accentColor}`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="w-8 h-8 rounded-xl bg-white shadow-xs flex items-center justify-center text-slate-900 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/90 shadow-2xs">
                          {preset.badge}
                        </span>
                      </div>
                      <div className="font-extrabold text-sm text-slate-900 truncate">
                        {preset.name}
                      </div>
                      <div className="text-[11px] font-semibold text-slate-600 truncate mt-0.5">
                        {preset.title}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1 flex items-center justify-between">
                        <span>{preset.location}</span>
                        <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1" />
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Instant Hero Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={loginDemo}
                  className="w-full py-3 px-4 bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-700 hover:to-blue-800 active:scale-[0.99] text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-sky-600/30 transition-all cursor-pointer"
                >
                  <Zap className="w-4 h-4 fill-white" />
                  <span>Masuk Cepat sebagai Super Admin (Capt. Wisnu)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right Col (5 cols): Form Login Bebas Username & Password */}
            <div className="lg:col-span-5 bg-slate-50/90 p-5 rounded-2xl border border-slate-200/90 space-y-4">
              <div className="pb-3 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-sky-600" />
                    Form Login Bebas
                  </h3>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    Bebas Akses
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Isi nama & password bebas apa saja untuk masuk
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                {/* Username Bebas */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-bold text-slate-700">
                      Nama / Username Petugas
                    </label>
                    <span className="text-[10px] text-slate-400">Bebas</span>
                  </div>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Ketik nama Anda (bebas)..."
                      className="w-full pl-8 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 font-semibold"
                    />
                  </div>
                </div>

                {/* Password Bebas */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-bold text-slate-700">
                      Kata Sandi (Password)
                    </label>
                    <span className="text-[10px] text-slate-400">Bebas / Bebas kosong</span>
                  </div>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password bebas isi apa saja..."
                      className="w-full pl-8 pr-8 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Pilihan Peran */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Peran Operasional
                  </label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
                  >
                    <option value="Super Admin">Super Admin Operasional (Akses Lengkap)</option>
                    <option value="Fleet Manager">Manajer Armada & Rute Pelayaran</option>
                    <option value="Port Officer">Perwira Pelabuhan & Dokumen B/L</option>
                    <option value="Guest Officer">Tamu Pengamat Operasional</option>
                  </select>
                </div>

                {/* Tombol Masuk Bebas */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{isLoading ? 'Menghubungkan...' : 'Masuk Sekarang (Bebas)'}</span>
                </button>
              </form>

              <div className="pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={loginWithGoogle}
                  className="w-full py-2 px-3 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-2xs"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.99 0 12s.45 3.84 1.25 5.42l4.03-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                  <span>Masuk via Google Workspace</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="text-center mt-5 text-slate-400 text-xs flex items-center justify-center gap-4">
          <span className="flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            Live Sync Terhubung ke Seluruh Petugas
          </span>
          <span>•</span>
          <span>PT Japara Bahari Line • Sistem Komando Maritim</span>
        </div>
      </div>
    </div>
  );
};
