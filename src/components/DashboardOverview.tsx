import React from 'react';
import { 
  Vessel, 
  Voyage, 
  Manifest, 
  OperationalLog 
} from '../types';
import { 
  Ship, 
  Calendar, 
  FileText, 
  TrendingUp, 
  Anchor, 
  Navigation, 
  Clock, 
  AlertCircle, 
  ArrowUpRight,
  Plus,
  Compass,
  CheckCircle,
  ShieldCheck
} from 'lucide-react';
import { ActiveTab } from './Navbar';
import { LiveFleetRadar } from './common/LiveFleetRadar';

interface DashboardOverviewProps {
  vessels: Vessel[];
  voyages: Voyage[];
  manifests: Manifest[];
  logs: OperationalLog[];
  setActiveTab: (tab: ActiveTab) => void;
  onOpenAddVessel: () => void;
  onOpenAddVoyage: () => void;
  onOpenAddManifest: () => void;
  onSeedData: () => void;
  isSeeding: boolean;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  vessels,
  voyages,
  manifests,
  logs,
  setActiveTab,
  onOpenAddVessel,
  onOpenAddVoyage,
  onOpenAddManifest,
  onSeedData,
  isSeeding,
}) => {
  // Calculated metrics
  const totalVessels = vessels.length;
  const underwayVessels = vessels.filter(v => v.status === 'Underway').length;
  const berthedVessels = vessels.filter(v => v.status === 'Berthed').length;
  const maintenanceVessels = vessels.filter(v => v.status === 'Maintenance').length;
  const anchoredVessels = vessels.filter(v => v.status === 'Anchored').length;

  const activeVoyages = voyages.filter(v => v.status === 'In Transit' || v.status === 'Scheduled').length;
  const totalCargoWeight = manifests.reduce((sum, m) => sum + (m.weightTon || 0), 0);
  const totalRevenue = manifests.reduce((sum, m) => sum + (m.freightRateIdr || 0), 0);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-sky-700 via-blue-800 to-slate-900 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-12 translate-y-6">
          <Anchor className="w-80 h-80" />
        </div>
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs text-xs font-semibold text-sky-200 mb-3 border border-white/20">
            <Compass className="w-3.5 h-3.5 text-sky-300 animate-spin" style={{ animationDuration: '16s' }} />
            Pusat Kendali Operasi Maritim Nusantara
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Selamat Datang di Command Center Armada
          </h1>
          <p className="mt-2 text-sm text-sky-100/90 leading-relaxed">
            Pantau pergerakan kapal kargo, jadwal lintasan pelayaran antarpulau, manifes muatan kontainer, dan kepatuhan operasional pelabuhan secara langsung dan tersimpan persisten di Google Firebase Firestore.
          </p>

          <div className="mt-5 flex flex-wrap gap-2.5">
            <button
              onClick={onOpenAddVessel}
              className="bg-white hover:bg-sky-50 text-slate-900 px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 text-sky-600" />
              <span>Registrasi Kapal Baru</span>
            </button>
            <button
              onClick={onOpenAddVoyage}
              className="bg-sky-500 hover:bg-sky-600 text-white px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              <span>Jadwalkan Pelayaran</span>
            </button>
            <button
              onClick={onOpenAddManifest}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>Terbitkan B/L Kargo</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-sky-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Armada Aktif
            </span>
            <div className="w-9 h-9 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center">
              <Ship className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{totalVessels}</span>
            <span className="text-xs text-slate-500 font-medium">Kapal Terdaftar</span>
          </div>
          <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-emerald-600 font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              {underwayVessels} Berlayar
            </span>
            <span className="text-slate-500 font-medium">
              {berthedVessels} Sandar
            </span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-blue-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Jadwal Pelayaran
            </span>
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <Navigation className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{activeVoyages}</span>
            <span className="text-xs text-slate-500 font-medium">Rute Aktif/Terjadwal</span>
          </div>
          <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-sky-600 font-medium">
              Total {voyages.length} Rute
            </span>
            <button
              onClick={() => setActiveTab('voyages')}
              className="text-sky-700 font-semibold hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              Lihat Rute <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-emerald-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Tonase Muatan
            </span>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">
              {totalCargoWeight.toLocaleString('id-ID')}
            </span>
            <span className="text-xs text-slate-500 font-medium">Ton Kargo</span>
          </div>
          <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-600">
              {manifests.length} Bill of Lading (B/L)
            </span>
            <button
              onClick={() => setActiveTab('manifests')}
              className="text-emerald-700 font-semibold hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              Manifes <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-indigo-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Freight Terbuku
            </span>
            <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-xl sm:text-2xl font-black text-slate-900 truncate block">
              {formatCurrency(totalRevenue)}
            </span>
          </div>
          <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-indigo-600 font-medium">
              Ongkos Angkut Pelayaran
            </span>
            <span className="text-slate-400">IDR</span>
          </div>
        </div>
      </div>

      {/* Live Archipelago Maritime Radar & Telemetry */}
      <LiveFleetRadar vessels={vessels} voyages={voyages} />

      {/* Main Grid: Fleet Status & Active Voyages */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Vessel Fleet Overview */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Ship className="w-5 h-5 text-sky-600" />
                  Status Armada Kapal Maritim
                </h3>
                <p className="text-xs text-slate-500">
                  Pemantauan posisi terkini, level bunker bahan bakar, dan kondisi operasional
                </p>
              </div>
              <button
                onClick={() => setActiveTab('vessels')}
                className="text-xs font-semibold text-sky-600 hover:text-sky-800 flex items-center gap-1 cursor-pointer"
              >
                Kelola Armada <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {vessels.length === 0 ? (
              <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                <Ship className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-700">Belum Ada Data Armada Kapal</p>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Database Firestore belum memiliki catatan kapal. Muat data percontohan resmi atau daftarkan kapal baru.
                </p>
                <div className="mt-4 flex justify-center gap-3">
                  <button
                    onClick={onSeedData}
                    disabled={isSeeding}
                    className="px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                  >
                    {isSeeding ? 'Memuat...' : 'Muat Data Demo Armada'}
                  </button>
                  <button
                    onClick={onOpenAddVessel}
                    className="px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Tambah Manual
                  </button>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Nama Kapal & IMO</th>
                      <th className="py-2.5 px-3">Tipe & DWT</th>
                      <th className="py-2.5 px-3">Posisi Terkini</th>
                      <th className="py-2.5 px-3">Bunker BBM</th>
                      <th className="py-2.5 px-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {vessels.slice(0, 5).map((v) => {
                      const isUnderway = v.status === 'Underway';
                      const isBerthed = v.status === 'Berthed';
                      const isMaintenance = v.status === 'Maintenance';

                      return (
                        <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-3">
                            <div className="font-bold text-slate-900">{v.name}</div>
                            <div className="text-[11px] text-slate-500 font-mono">{v.imoNumber}</div>
                          </td>
                          <td className="py-3 px-3">
                            <span className="font-medium text-slate-800">{v.vesselType}</span>
                            <div className="text-[11px] text-slate-500">
                              {v.capacityDwt.toLocaleString('id-ID')} DWT
                            </div>
                          </td>
                          <td className="py-3 px-3 text-slate-700 font-medium">
                            {v.currentLocation || '-'}
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    v.fuelLevelPercent > 50
                                      ? 'bg-emerald-500'
                                      : v.fuelLevelPercent > 25
                                      ? 'bg-amber-500'
                                      : 'bg-rose-500'
                                  }`}
                                  style={{ width: `${v.fuelLevelPercent}%` }}
                                />
                              </div>
                              <span className="text-[11px] font-semibold text-slate-600">
                                {v.fuelLevelPercent}%
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                                isUnderway
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : isBerthed
                                  ? 'bg-sky-50 text-sky-700 border border-sky-200'
                                  : isMaintenance
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}
                            >
                              {isUnderway
                                ? 'Sedang Berlayar'
                                : isBerthed
                                ? 'Sandar di Pelabuhan'
                                : isMaintenance
                                ? 'Perawatan / Dok'
                                : 'Lego Jangkar'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Active Voyages Timeline */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Navigation className="w-5 h-5 text-blue-600" />
                  Jadwal & Rute Pelayaran Terbaru
                </h3>
                <p className="text-xs text-slate-500">
                  Rute lintas pelabuhan antarpulau yang sedang berjalan
                </p>
              </div>
              <button
                onClick={() => setActiveTab('voyages')}
                className="text-xs font-semibold text-sky-600 hover:text-sky-800 flex items-center gap-1 cursor-pointer"
              >
                Semua Jadwal <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {voyages.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">
                Belum ada rute pelayaran aktif.
              </p>
            ) : (
              <div className="space-y-3">
                {voyages.slice(0, 3).map((voy) => (
                  <div
                    key={voy.id}
                    className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-sky-300 transition-all"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-sky-800 bg-sky-100 px-2 py-0.5 rounded">
                          {voy.voyageNumber}
                        </span>
                        <span className="text-xs font-bold text-slate-800">
                          {voy.vesselName}
                        </span>
                      </div>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-800">
                        {voy.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-600 mt-2">
                      <div>
                        <span className="text-[10px] text-slate-400 block">ASAL</span>
                        <span className="font-semibold text-slate-800">{voy.originPort}</span>
                      </div>
                      <div className="flex-1 mx-4 border-t-2 border-dashed border-sky-300 relative flex items-center justify-center">
                        <Ship className="w-4 h-4 text-sky-600 bg-white rounded-full p-0.5 -mt-3.5" />
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block">TUJUAN</span>
                        <span className="font-semibold text-slate-800">{voy.destinationPort}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Operational Logs & Quick Stats */}
        <div className="space-y-6">
          {/* Quick Distribution Summary */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Compass className="w-4 h-4 text-sky-600" />
              Distribusi Kondisi Armada
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-100">
                <span className="font-semibold">Sedang Berlayar (Underway)</span>
                <span className="font-bold text-sm">{underwayVessels}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-sky-50 text-sky-900 border border-sky-100">
                <span className="font-semibold">Sandar di Dermaga (Berthed)</span>
                <span className="font-bold text-sm">{berthedVessels}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-amber-50 text-amber-900 border border-amber-100">
                <span className="font-semibold">Lego Jangkar (Anchored)</span>
                <span className="font-bold text-sm">{anchoredVessels}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-rose-50 text-rose-900 border border-rose-100">
                <span className="font-semibold">Perawatan / Dok (Drydock)</span>
                <span className="font-bold text-sm">{maintenanceVessels}</span>
              </div>
            </div>
          </div>

          {/* Operational Log Feed */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-sky-600" />
                Log Aktivitas Maritim Terkini
              </h3>
              <button
                onClick={() => setActiveTab('logs')}
                className="text-xs font-semibold text-sky-600 hover:text-sky-800 cursor-pointer"
              >
                Semua
              </button>
            </div>

            {logs.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-4">
                Belum ada aktivitas operasional tercatat.
              </p>
            ) : (
              <div className="space-y-3">
                {logs.slice(0, 4).map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-lg border border-slate-100 bg-slate-50 text-xs"
                  >
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-bold text-sky-800">{log.activityType}</span>
                      <span className="text-slate-400">
                        {new Date(log.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="font-semibold text-slate-800">{log.vesselName}</p>
                    <p className="text-slate-600 mt-0.5 line-clamp-2">{log.details}</p>
                    <p className="text-[10px] text-slate-400 mt-1 font-medium">
                      Oleh: {log.recordedBy} • {log.portName}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
