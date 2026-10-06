import React, { useState } from 'react';
import { Voyage, VoyageStatus, Vessel } from '../../types';
import { 
  Calendar, 
  Plus, 
  Search, 
  Navigation, 
  Clock, 
  Ship, 
  Edit, 
  Trash2, 
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  MapPin
} from 'lucide-react';

interface VoyagesTabProps {
  voyages: Voyage[];
  vessels: Vessel[];
  onOpenAddModal: () => void;
  onEditVoyage: (voyage: Voyage) => void;
  onDeleteVoyage: (voyage: Voyage) => void;
  onQuickUpdateStatus: (id: string, newStatus: VoyageStatus) => Promise<void>;
}

export const VoyagesTab: React.FC<VoyagesTabProps> = ({
  voyages,
  vessels,
  onOpenAddModal,
  onEditVoyage,
  onDeleteVoyage,
  onQuickUpdateStatus,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const filteredVoyages = voyages.filter((v) => {
    const matchesSearch =
      v.voyageNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.vesselName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.originPort.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.destinationPort.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = selectedStatus === 'all' || v.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: VoyageStatus) => {
    switch (status) {
      case 'In Transit':
        return {
          label: 'Sedang Berlayar',
          classes: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          dot: 'bg-emerald-500 animate-pulse',
        };
      case 'Scheduled':
        return {
          label: 'Terjadwal',
          classes: 'bg-sky-50 text-sky-700 border-sky-200',
          dot: 'bg-sky-500',
        };
      case 'Berthed':
        return {
          label: 'Tiba di Pelabuhan',
          classes: 'bg-blue-50 text-blue-700 border-blue-200',
          dot: 'bg-blue-500',
        };
      case 'Completed':
        return {
          label: 'Selesai',
          classes: 'bg-slate-100 text-slate-700 border-slate-200',
          dot: 'bg-slate-400',
        };
      case 'Delayed':
        return {
          label: 'Ditunda (Cuaca)',
          classes: 'bg-amber-50 text-amber-700 border-amber-200',
          dot: 'bg-amber-500',
        };
      default:
        return {
          label: status,
          classes: 'bg-slate-50 text-slate-700 border-slate-200',
          dot: 'bg-slate-400',
        };
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
            <Calendar className="w-6 h-6 text-blue-600" />
            Jadwal & Rute Lintasan Pelayaran (Voyage Scheduling)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Atur rute antarpulau, tanggal keberangkatan (ETD), estimasi kedatangan (ETA), serta keterisian muatan kapal.
          </p>
        </div>
        <button
          onClick={onOpenAddModal}
          className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-4 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Jadwalkan Pelayaran Baru</span>
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
              placeholder="Cari nomor voyage, nama kapal, pelabuhan asal/tujuan..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>

          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            >
              <option value="all">Semua Status Pelayaran</option>
              <option value="Scheduled">Terjadwal</option>
              <option value="In Transit">Sedang Berlayar</option>
              <option value="Berthed">Tiba di Pelabuhan</option>
              <option value="Completed">Selesai</option>
              <option value="Delayed">Tertunda</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>Ditemukan: <strong className="text-slate-800">{filteredVoyages.length}</strong> jadwal</span>
          {(searchTerm || selectedStatus !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedStatus('all');
              }}
              className="text-blue-600 hover:underline cursor-pointer"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* Voyages Cards List */}
      {filteredVoyages.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">Tidak ada jadwal pelayaran</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Belum ada jadwal pelayaran yang sesuai filter. Jadwalkan rute baru untuk armada kapal Anda.
          </p>
          <button
            onClick={onOpenAddModal}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
          >
            Jadwalkan Pelayaran Baru
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredVoyages.map((voy) => {
            const badge = getStatusBadge(voy.status);
            return (
              <div
                key={voy.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-blue-300 hover:shadow-md transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Left: Vessel & Route Header */}
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-100">
                        {voy.voyageNumber}
                      </span>
                      <h3 className="text-base font-black text-slate-900 flex items-center gap-1.5">
                        <Ship className="w-4 h-4 text-sky-600" />
                        {voy.vesselName}
                      </h3>
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${badge.classes}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                        {badge.label}
                      </span>
                    </div>

                    {/* Route Visualizer */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                          PELABUHAN ASAL (DEPARTURE)
                        </span>
                        <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                          {voy.originPort}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          ETD: {formatDate(voy.departureDate)}
                        </div>
                      </div>

                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                          PELABUHAN TUJUAN (ARRIVAL)
                        </span>
                        <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-blue-600" />
                          {voy.destinationPort}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          ETA: {formatDate(voy.arrivalDate)}
                        </div>
                      </div>

                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                          KETERISIAN KARGO (LOAD FACTOR)
                        </span>
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className="font-semibold text-slate-700">Kapasitas Muatan</span>
                          <span className="font-bold text-slate-900">{voy.cargoLoadPercent}%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              voy.cargoLoadPercent > 80
                                ? 'bg-emerald-500'
                                : voy.cargoLoadPercent > 50
                                ? 'bg-sky-500'
                                : 'bg-amber-500'
                            }`}
                            style={{ width: `${voy.cargoLoadPercent}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {voy.notes && (
                      <p className="text-xs text-slate-500 italic mt-1 bg-amber-50/50 p-2 rounded border border-amber-100">
                        Catatan: {voy.notes}
                      </p>
                    )}
                  </div>

                  {/* Right Actions */}
                  <div className="flex md:flex-col items-end justify-between md:justify-center gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase">Status:</span>
                      <select
                        value={voy.status}
                        onChange={(e) => onQuickUpdateStatus(voy.id, e.target.value as VoyageStatus)}
                        className="text-xs font-semibold bg-white border border-slate-300 rounded px-2 py-1 text-slate-800 focus:outline-none cursor-pointer"
                      >
                        <option value="Scheduled">Terjadwal</option>
                        <option value="In Transit">Sedang Berlayar</option>
                        <option value="Berthed">Tiba / Sandar</option>
                        <option value="Completed">Selesai</option>
                        <option value="Delayed">Tertunda</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onEditVoyage(voy)}
                        className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => onDeleteVoyage(voy)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Hapus Jadwal"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
