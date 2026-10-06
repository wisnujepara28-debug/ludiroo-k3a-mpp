import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Ship, 
  Anchor, 
  Calendar, 
  FileText, 
  Activity, 
  LayoutDashboard, 
  LogOut, 
  User, 
  Database,
  Sparkles,
  ExternalLink
} from 'lucide-react';

export type ActiveTab = 'dashboard' | 'vessels' | 'voyages' | 'manifests' | 'logs';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  vesselCount: number;
  voyageCount: number;
  manifestCount: number;
  onlineCount?: number;
  onSeedData: () => void;
  isSeeding: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  vesselCount,
  voyageCount,
  manifestCount,
  onlineCount = 1,
  onSeedData,
  isSeeding,
}) => {
  const { user, logout } = useAuth();

  const navItems = [
    {
      id: 'dashboard' as ActiveTab,
      label: 'Ringkasan',
      icon: LayoutDashboard,
    },
    {
      id: 'vessels' as ActiveTab,
      label: 'Armada Kapal',
      icon: Ship,
      count: vesselCount,
    },
    {
      id: 'voyages' as ActiveTab,
      label: 'Jadwal Pelayaran',
      icon: Calendar,
      count: voyageCount,
    },
    {
      id: 'manifests' as ActiveTab,
      label: 'Manifest Kargo (B/L)',
      icon: FileText,
      count: manifestCount,
    },
    {
      id: 'logs' as ActiveTab,
      label: 'Log Operasional',
      icon: Activity,
    },
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white px-4 py-1.5 text-xs flex flex-wrap items-center justify-between gap-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-medium text-slate-200">
            Sistem Terhubung: <span className="text-emerald-400 font-semibold">Firebase Cloud Firestore DB</span>
          </span>
          <span className="text-slate-500 hidden sm:inline">|</span>
          <span className="text-slate-400 hidden sm:inline text-[11px]">
            Single Source of Truth Aktif (Persisten)
          </span>
        </div>

        <div className="flex items-center gap-3">
          {vesselCount === 0 && (
            <button
              onClick={onSeedData}
              disabled={isSeeding}
              className="bg-sky-500 hover:bg-sky-600 text-white px-2.5 py-0.5 rounded text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3 h-3" />
              {isSeeding ? 'Memuat Data...' : 'Inisialisasi Data Demo'}
            </button>
          )}
          <span className="text-slate-400 text-[11px]">
            Waktu Operasional: {new Date().toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })}
          </span>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Company Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-blue-800 text-white flex items-center justify-center shadow-md shadow-sky-600/20">
              <Anchor className="w-5 h-5 text-sky-100" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-slate-900">
                  JAPARA BAHARI LINE
                </span>
                <span className="hidden md:inline-block bg-sky-100 text-sky-800 text-[10px] font-bold px-2 py-0.5 rounded">
                  PORTAL OPERASIONAL
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                PT Japara Bahari Line - Fleet & Cargo Control Center
              </p>
            </div>
          </div>

          {/* User Profile & Actions */}
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-[11px] font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{onlineCount} Pengguna Terhubung Live</span>
            </div>

            <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200 py-1.5 px-3 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-sky-700 text-white flex items-center justify-center text-xs font-black shadow-xs">
                {user?.displayName ? user.displayName.charAt(0) : 'A'}
              </div>
              <div className="text-left hidden sm:block">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-bold text-slate-900 truncate max-w-[150px]">
                    {user?.displayName || 'Admin Pelayaran'}
                  </p>
                  <span className="text-[9px] font-bold bg-sky-100 text-sky-800 px-1.5 py-0.2 rounded">
                    {user?.role || 'Admin'}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 font-medium">
                  {user?.location || user?.email || 'admin@samudera.id'}
                </p>
              </div>
            </div>

            <button
              onClick={logout}
              title="Keluar dari sistem"
              className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-rose-200"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 sm:space-x-2 border-t border-slate-100 overflow-x-auto py-1 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{item.label}</span>
                {item.count !== undefined && (
                  <span
                    className={`ml-1 text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
