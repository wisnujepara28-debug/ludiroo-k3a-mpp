import React, { useState } from 'react';
import { Vessel, VesselType, VesselStatus } from '../../types';
import { 
  Ship, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Anchor, 
  Fuel, 
  User, 
  Compass, 
  Calendar,
  Layers,
  ArrowRight,
  MoreVertical
} from 'lucide-react';

interface VesselsTabProps {
  vessels: Vessel[];
  onOpenAddModal: () => void;
  onEditVessel: (vessel: Vessel) => void;
  onDeleteVessel: (vessel: Vessel) => void;
  onQuickUpdateStatus: (id: string, newStatus: VesselStatus) => Promise<void>;
}

export const VesselsTab: React.FC<VesselsTabProps> = ({
  vessels,
  onOpenAddModal,
  onEditVessel,
  onDeleteVessel,
  onQuickUpdateStatus,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Filter logic
  const filteredVessels = vessels.filter((v) => {
    const matchesSearch = 
      v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.imoNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.captainName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.currentLocation.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = selectedType === 'all' || v.vesselType === selectedType;
    const matchesStatus = selectedStatus === 'all' || v.status === selectedStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusBadge = (status: VesselStatus) => {
    switch (status) {
      case 'Underway':
        return {
          label: 'Sedang Berlayar',
          classes: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          dot: 'bg-emerald-500 animate-pulse',
        };
      case 'Berthed':
        return {
          label: 'Sandar di Pelabuhan',
          classes: 'bg-sky-50 text-sky-700 border-sky-200',
          dot: 'bg-sky-500',
        };
      case 'Anchored':
        return {
          label: 'Lego Jangkar',
          classes: 'bg-amber-50 text-amber-700 border-amber-200',
          dot: 'bg-amber-500',
        };
      case 'Maintenance':
        return {
          label: 'Perawatan Dok',
          classes: 'bg-rose-50 text-rose-700 border-rose-200',
          dot: 'bg-rose-500',
        };
      default:
        return {
          label: status,
          classes: 'bg-slate-50 text-slate-700 border-slate-200',
          dot: 'bg-slate-400',
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Main Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Ship className="w-6 h-6 text-sky-600" />
            Manajemen Armada Kapal (Fleet Management)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola spesifikasi teknis, registrasi IMO, kondisi kapal, dan posisi armada secara persisten di Firestore.
          </p>
        </div>
        <button
          onClick={onOpenAddModal}
          className="bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white px-4 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Kapal Baru</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari nama kapal, nomor IMO, nahkoda, posisi..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
            />
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
            >
              <option value="all">Semua Tipe Kapal</option>
              <option value="Container">Petikemas (Container)</option>
              <option value="Bulk Carrier">Curah Kering (Bulk Carrier)</option>
              <option value="General Cargo">Kargo Umum (General Cargo)</option>
              <option value="Tanker">Kapal Tanker</option>
              <option value="Ro-Ro">Ro-Ro / Penumpang</option>
              <option value="Tug & Barge">Tongkang & Tug Boat</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
            >
              <option value="all">Semua Status Operasional</option>
              <option value="Underway">Sedang Berlayar</option>
              <option value="Berthed">Sandar di Pelabuhan</option>
              <option value="Anchored">Lego Jangkar</option>
              <option value="Maintenance">Perawatan / Dok</option>
            </select>
          </div>
        </div>

        {/* Status Count Pills & View Mode */}
        <div className="flex flex-wrap items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span>Ditemukan: <strong className="text-slate-800">{filteredVessels.length}</strong> dari {vessels.length} kapal</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer ${
                viewMode === 'grid' ? 'bg-sky-100 text-sky-800' : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              Mode Kartu
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer ${
                viewMode === 'table' ? 'bg-sky-100 text-sky-800' : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              Mode Tabel
            </button>
          </div>
        </div>
      </div>

      {/* Vessel Grid / Table View */}
      {filteredVessels.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center">
          <Ship className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">Tidak ada armada kapal yang cocok</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Ubah kata kunci pencarian atau reset filter untuk menampilkan kembali data kapal.
          </p>
          {(searchTerm || selectedType !== 'all' || selectedStatus !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedType('all');
                setSelectedStatus('all');
              }}
              className="mt-4 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer"
            >
              Reset Filter
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredVessels.map((v) => {
            const badge = getStatusBadge(v.status);
            return (
              <div
                key={v.id}
                className="bg-white rounded-xl border border-slate-200 shadow-xs hover:shadow-md hover:border-sky-300 transition-all flex flex-col justify-between"
              >
                <div className="p-5">
                  {/* Top: Name, IMO, Status */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <h3 className="text-base font-black text-slate-900">{v.name}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] font-mono font-semibold text-sky-800 bg-sky-50 px-1.5 py-0.2 rounded border border-sky-100">
                          {v.imoNumber}
                        </span>
                        <span className="text-[11px] text-slate-500">{v.vesselType}</span>
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${badge.classes}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                      {badge.label}
                    </span>
                  </div>

                  {/* Details Grid */}
                  <div className="space-y-2 text-xs py-3 border-y border-slate-100 my-3">
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5" /> Kapasitas Tonase:
                      </span>
                      <span className="font-semibold text-slate-800">
                        {v.capacityDwt.toLocaleString('id-ID')} DWT
                        {v.capacityTeu ? ` (${v.capacityTeu.toLocaleString('id-ID')} TEUs)` : ''}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-600">
                      <span className="text-slate-400 flex items-center gap-1">
                        <User className="w-3.5 h-3.5" /> Nahkoda:
                      </span>
                      <span className="font-medium text-slate-800 truncate max-w-[150px]">
                        {v.captainName}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-600">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Compass className="w-3.5 h-3.5" /> Posisi Saat Ini:
                      </span>
                      <span className="font-semibold text-slate-900 truncate max-w-[160px]" title={v.currentLocation}>
                        {v.currentLocation}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-600">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Fuel className="w-3.5 h-3.5" /> Bahan Bakar (Bunker):
                      </span>
                      <div className="flex items-center gap-1.5">
                        <div className="w-14 bg-slate-200 rounded-full h-1.5 overflow-hidden">
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
                        <span className="font-bold text-slate-800">{v.fuelLevelPercent}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-400 flex items-center justify-between">
                    <span>Bendera: {v.flagPort}</span>
                    <span>Tahun: {v.buildYear}</span>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 rounded-b-xl flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">Ubah Status:</span>
                    <select
                      value={v.status}
                      onChange={(e) => onQuickUpdateStatus(v.id, e.target.value as VesselStatus)}
                      className="text-[11px] font-semibold bg-white border border-slate-300 rounded px-1.5 py-0.5 text-slate-700 focus:outline-none"
                    >
                      <option value="Underway">Berlayar</option>
                      <option value="Berthed">Sandar</option>
                      <option value="Anchored">Lego Jangkar</option>
                      <option value="Maintenance">Perawatan Dok</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEditVessel(v)}
                      className="p-1.5 text-slate-600 hover:text-sky-600 hover:bg-white rounded transition-colors cursor-pointer border border-transparent hover:border-slate-200"
                      title="Edit Data Kapal"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteVessel(v)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-white rounded transition-colors cursor-pointer border border-transparent hover:border-slate-200"
                      title="Hapus Data Kapal"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Nama Kapal & IMO</th>
                  <th className="py-3 px-4">Tipe Kapal</th>
                  <th className="py-3 px-4">Kapasitas DWT</th>
                  <th className="py-3 px-4">Nahkoda</th>
                  <th className="py-3 px-4">Posisi Saat Ini</th>
                  <th className="py-3 px-4">BBM</th>
                  <th className="py-3 px-4">Status Operasional</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredVessels.map((v) => {
                  const badge = getStatusBadge(v.status);
                  return (
                    <tr key={v.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{v.name}</div>
                        <div className="text-[11px] font-mono text-slate-500">{v.imoNumber}</div>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-700">{v.vesselType}</td>
                      <td className="py-3 px-4 font-semibold text-slate-800">
                        {v.capacityDwt.toLocaleString('id-ID')} DWT
                      </td>
                      <td className="py-3 px-4 text-slate-700">{v.captainName}</td>
                      <td className="py-3 px-4 font-medium text-slate-800">{v.currentLocation}</td>
                      <td className="py-3 px-4 font-bold text-slate-700">{v.fuelLevelPercent}%</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badge.classes}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                          {badge.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onEditVessel(v)}
                            className="p-1.5 text-slate-600 hover:text-sky-600 rounded hover:bg-slate-100 cursor-pointer"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeleteVessel(v)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-slate-100 cursor-pointer"
                            title="Hapus"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
