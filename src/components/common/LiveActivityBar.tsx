import React, { useState } from 'react';
import { OnlineUser, LiveActivity } from '../../types';
import { 
  Users, 
  Radio, 
  Activity, 
  ChevronRight, 
  Bell, 
  X, 
  Clock, 
  ShieldCheck,
  Ship
} from 'lucide-react';

interface LiveActivityBarProps {
  onlineUsers: OnlineUser[];
  liveActivities: LiveActivity[];
  currentUserId?: string;
}

export const LiveActivityBar: React.FC<LiveActivityBarProps> = ({
  onlineUsers,
  liveActivities,
  currentUserId,
}) => {
  const [showDrawer, setShowDrawer] = useState(false);

  const latestActivity = liveActivities.length > 0 ? liveActivities[0] : null;

  const formatDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <>
      <div className="bg-slate-900 border-b border-slate-800 text-white text-xs px-4 py-2 flex flex-wrap items-center justify-between gap-3 shadow-inner">
        {/* Left: Online Multi-User Presence */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-700">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-bold text-slate-200">
              {Math.max(1, onlineUsers.length)} Petugas Online
            </span>
          </div>

          {/* Avatars */}
          <div className="flex -space-x-1.5 overflow-hidden items-center">
            {onlineUsers.slice(0, 4).map((u) => (
              <div
                key={u.id}
                title={`${u.displayName} (${u.role})`}
                className="w-6 h-6 rounded-full ring-2 ring-slate-900 flex items-center justify-center text-[10px] font-bold text-white uppercase shadow-xs"
                style={{ backgroundColor: u.color || '#0284c7' }}
              >
                {u.displayName.charAt(0)}
              </div>
            ))}
            {onlineUsers.length > 4 && (
              <div className="w-6 h-6 rounded-full bg-slate-700 ring-2 ring-slate-900 flex items-center justify-center text-[9px] font-bold text-slate-300">
                +{onlineUsers.length - 4}
              </div>
            )}
          </div>
        </div>

        {/* Center: Live Real-Time Ticker / Broadcast */}
        <div className="flex-1 max-w-xl mx-2 hidden md:flex items-center gap-2 overflow-hidden">
          <span className="text-[10px] font-black uppercase tracking-wider text-sky-400 bg-sky-950/80 px-2 py-0.5 rounded border border-sky-800/60 flex items-center gap-1 shrink-0">
            <Radio className="w-3 h-3 text-sky-400 animate-pulse" />
            LIVE SINKRONISASI
          </span>
          {latestActivity ? (
            <div className="text-slate-300 truncate text-[11px] flex items-center gap-1.5">
              <strong className="text-white font-semibold">{latestActivity.actorName}:</strong>
              <span className="truncate">{latestActivity.message}</span>
              <span className="text-slate-500 shrink-0 text-[10px]">
                ({formatDate(latestActivity.timestamp)})
              </span>
            </div>
          ) : (
            <span className="text-slate-400 text-[11px]">
              Semua sistem maritim terhubung secara serentak ke Cloud Firestore.
            </span>
          )}
        </div>

        {/* Right: Drawer Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowDrawer(true)}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-800 text-sky-300 px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer border border-slate-700"
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Lihat Log Siaran ({liveActivities.length})</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Slide-in Live Activity Drawer */}
      {showDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between border-l border-slate-200 animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
                  <Radio className="w-4 h-4 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Siaran Aktivitas Multi-User</h3>
                  <p className="text-[11px] text-slate-400">Pembaruan real-time seluruh operator</p>
                </div>
              </div>
              <button
                onClick={() => setShowDrawer(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Active Users in Drawer */}
            <div className="p-4 bg-slate-50 border-b border-slate-200">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-sky-600" />
                Petugas Yang Sedang Online ({onlineUsers.length})
              </h4>
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {onlineUsers.map((u) => (
                  <div
                    key={u.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded-full text-white font-bold text-[10px] flex items-center justify-center uppercase shadow-2xs"
                        style={{ backgroundColor: u.color || '#0284c7' }}
                      >
                        {u.displayName.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 leading-tight">{u.displayName}</div>
                        <div className="text-[10px] text-slate-500">{u.role}</div>
                      </div>
                    </div>
                    <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Aktif
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Activities Stream */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                Riwayat Perubahan Terkini
              </h4>

              {liveActivities.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-8">
                  Belum ada aktivitas baru. Setiap ada perubahan data kapal, rute, atau kargo akan disiarkan di sini secara instan.
                </p>
              ) : (
                <div className="space-y-2.5">
                  {liveActivities.map((act) => (
                    <div
                      key={act.id}
                      className="p-3 rounded-xl border border-slate-100 bg-slate-50/80 hover:bg-white hover:border-sky-200 transition-all text-xs"
                    >
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="font-bold text-sky-800">{act.actorName}</span>
                        <span className="text-slate-400 font-mono">{formatDate(act.timestamp)}</span>
                      </div>
                      <p className="text-slate-700 leading-relaxed font-medium">
                        {act.message}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 text-center">
              <p className="text-[11px] text-slate-500">
                Terhubung ke Cloud Firestore • Semua pengguna melihat update secara bersamaan
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
