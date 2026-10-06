import React, { useState } from 'react';
import { OperationalLog, OperationalActivityType } from '../../types';
import { 
  Activity, 
  Plus, 
  Search, 
  Trash2, 
  Clock, 
  Ship, 
  ShieldCheck, 
  Fuel, 
  CheckCircle,
  User,
  MapPin
} from 'lucide-react';

interface OperationalLogsTabProps {
  logs: OperationalLog[];
  onOpenAddModal: () => void;
  onDeleteLog: (log: OperationalLog) => void;
}

export const OperationalLogsTab: React.FC<OperationalLogsTabProps> = ({
  logs,
  onOpenAddModal,
  onDeleteLog,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');

  const filteredLogs = logs.filter((l) => {
    const matchesSearch =
      l.vesselName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.portName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.recordedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.details.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = selectedType === 'all' || l.activityType === selectedType;
    return matchesSearch && matchesType;
  });

  const getActivityIcon = (type: OperationalActivityType) => {
    switch (type) {
      case 'Safety Inspection':
        return <ShieldCheck className="w-4 h-4 text-emerald-600" />;
      case 'Bunkering':
        return <Fuel className="w-4 h-4 text-amber-600" />;
      case 'Loading':
      case 'Discharging':
        return <Ship className="w-4 h-4 text-sky-600" />;
      default:
        return <Activity className="w-4 h-4 text-purple-600" />;
    }
  };

  const formatDate = (isoStr: string) => {
    if (!isoStr) return '-';
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Activity className="w-6 h-6 text-sky-600" />
            Buku Log Operasional Pelabuhan & Armada
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Riwayat kronologis pengisian bahan bakar, inspeksi PSC kelaiklautan, dan kegiatan bongkar muat kapal.
          </p>
        </div>
        <button
          onClick={onOpenAddModal}
          className="bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white px-4 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Catat Log Operasional</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari nama kapal, pelabuhan, petugas, rincian aktivitas..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
            />
          </div>

          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
            >
              <option value="all">Semua Jenis Aktivitas</option>
              <option value="Safety Inspection">Inspeksi Kelaiklautan</option>
              <option value="Bunkering">Pengisian BBM (Bunkering)</option>
              <option value="Loading">Pemuatan Kargo</option>
              <option value="Discharging">Pembongkaran Kargo</option>
              <option value="Crew Change">Pergantian Kru</option>
              <option value="Maintenance">Perbaikan Fasilitas</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>Ditemukan: <strong className="text-slate-800">{filteredLogs.length}</strong> catatan log</span>
          {(searchTerm || selectedType !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedType('all');
              }}
              className="text-sky-600 hover:underline cursor-pointer"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* Log Feed */}
      {filteredLogs.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center">
          <Activity className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">Belum ada catatan log aktivitas</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Catat inspeksi kelaiklautan kapal, pengisian bunker BBM, atau pergerakan pelabuhan.
          </p>
          <button
            onClick={onOpenAddModal}
            className="mt-4 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
          >
            Catat Log Baru
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredLogs.map((log) => (
            <div
              key={log.id}
              className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:border-sky-300 transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-4"
            >
              <div className="flex items-start gap-3.5 flex-1">
                <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  {getActivityIcon(log.activityType)}
                </div>

                <div className="space-y-1 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-sky-50 text-sky-800 border border-sky-100">
                      {log.activityType}
                    </span>
                    <h4 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                      <Ship className="w-3.5 h-3.5 text-sky-600" />
                      {log.vesselName}
                    </h4>
                    <span className="text-[11px] text-slate-400">•</span>
                    <span className="text-[11px] font-medium text-slate-600 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {log.portName}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed pt-1">
                    {log.details}
                  </p>

                  <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      Dicatat oleh: <strong className="text-slate-700 font-semibold">{log.recordedBy}</strong>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(log.timestamp)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end">
                <button
                  onClick={() => onDeleteLog(log)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Hapus Catatan Log"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
