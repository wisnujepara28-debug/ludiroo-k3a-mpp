import React, { useState } from 'react';
import { Manifest, CargoStatus, PaymentStatus, Voyage } from '../../types';
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  DollarSign, 
  Package, 
  Ship, 
  Calendar,
  CheckCircle2,
  Clock,
  Printer,
  X
} from 'lucide-react';

interface ManifestsTabProps {
  manifests: Manifest[];
  voyages: Voyage[];
  onOpenAddModal: () => void;
  onEditManifest: (manifest: Manifest) => void;
  onDeleteManifest: (manifest: Manifest) => void;
  onQuickUpdateCargoStatus: (id: string, newStatus: CargoStatus) => Promise<void>;
}

export const ManifestsTab: React.FC<ManifestsTabProps> = ({
  manifests,
  voyages,
  onOpenAddModal,
  onEditManifest,
  onDeleteManifest,
  onQuickUpdateCargoStatus,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCargoStatus, setSelectedCargoStatus] = useState<string>('all');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<string>('all');
  const [viewDetailModal, setViewDetailModal] = useState<Manifest | null>(null);

  const filteredManifests = manifests.filter((m) => {
    const matchesSearch =
      m.blNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.shipperName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.consigneeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.vesselName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.cargoDescription.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCargo = selectedCargoStatus === 'all' || m.cargoStatus === selectedCargoStatus;
    const matchesPayment = selectedPaymentStatus === 'all' || m.paymentStatus === selectedPaymentStatus;

    return matchesSearch && matchesCargo && matchesPayment;
  });

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const getCargoStatusBadge = (status: CargoStatus) => {
    switch (status) {
      case 'Released':
        return {
          label: 'Telah Diterima (Released)',
          classes: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        };
      case 'In Transit':
        return {
          label: 'Dalam Pelayaran',
          classes: 'bg-sky-50 text-sky-700 border-sky-200',
        };
      case 'Loaded':
        return {
          label: 'Dimuat di Palka (Loaded)',
          classes: 'bg-blue-50 text-blue-700 border-blue-200',
        };
      case 'Discharged':
        return {
          label: 'Telah Dibongkar',
          classes: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        };
      default:
        return {
          label: 'Dipesan (Booked)',
          classes: 'bg-slate-50 text-slate-700 border-slate-200',
        };
    }
  };

  const getPaymentBadge = (status: PaymentStatus) => {
    switch (status) {
      case 'Paid':
        return 'bg-emerald-100 text-emerald-800 font-bold';
      case 'Pending':
        return 'bg-amber-100 text-amber-800 font-semibold';
      case 'Credit':
        return 'bg-purple-100 text-purple-800 font-medium';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-emerald-600" />
            Manifest Kargo & Bill of Lading (B/L Control)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Dokumentasi sah muatan kargo kapal, verifikasi shipper & consignee, tonase muatan, dan freight rate pelayaran.
          </p>
        </div>
        <button
          onClick={onOpenAddModal}
          className="bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white px-4 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Terbitkan B/L Baru</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari nomor B/L, shipper, consignee, kargo..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            />
          </div>

          <div>
            <select
              value={selectedCargoStatus}
              onChange={(e) => setSelectedCargoStatus(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            >
              <option value="all">Semua Status Kargo</option>
              <option value="Booked">Dipesan (Booked)</option>
              <option value="Loaded">Dimuat (Loaded)</option>
              <option value="In Transit">Dalam Pelayaran</option>
              <option value="Discharged">Dibongkar (Discharged)</option>
              <option value="Released">Telah Diterima (Released)</option>
            </select>
          </div>

          <div>
            <select
              value={selectedPaymentStatus}
              onChange={(e) => setSelectedPaymentStatus(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            >
              <option value="all">Semua Status Pembayaran</option>
              <option value="Paid">Lunas (Paid)</option>
              <option value="Pending">Menunggu (Pending)</option>
              <option value="Credit">Kredit Perusahaan</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>Ditemukan: <strong className="text-slate-800">{filteredManifests.length}</strong> manifes B/L</span>
          {(searchTerm || selectedCargoStatus !== 'all' || selectedPaymentStatus !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCargoStatus('all');
                setSelectedPaymentStatus('all');
              }}
              className="text-emerald-700 hover:underline cursor-pointer"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* Manifest Table */}
      {filteredManifests.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">Tidak ada dokumen B/L kargo</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Belum ada manifest atau Bill of Lading yang terdaftar. Terbitkan dokumen B/L baru untuk muatan kapal.
          </p>
          <button
            onClick={onOpenAddModal}
            className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
          >
            Terbitkan B/L Baru
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">No. B/L & Pelayaran</th>
                  <th className="py-3 px-4">Pengirim (Shipper)</th>
                  <th className="py-3 px-4">Penerima (Consignee)</th>
                  <th className="py-3 px-4">Rincian Muatan</th>
                  <th className="py-3 px-4">Tonase & Kontainer</th>
                  <th className="py-3 px-4">Biaya Freight</th>
                  <th className="py-3 px-4">Status Kargo</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredManifests.map((m) => {
                  const badge = getCargoStatusBadge(m.cargoStatus);
                  return (
                    <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <button
                          onClick={() => setViewDetailModal(m)}
                          className="font-mono font-bold text-sky-700 hover:underline cursor-pointer block text-left"
                        >
                          {m.blNumber}
                        </button>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {m.voyageNumber} • {m.vesselName}
                        </div>
                      </td>

                      <td className="py-3 px-4 font-semibold text-slate-900 max-w-[160px] truncate">
                        {m.shipperName}
                      </td>

                      <td className="py-3 px-4 font-medium text-slate-800 max-w-[160px] truncate">
                        {m.consigneeName}
                      </td>

                      <td className="py-3 px-4 max-w-[200px]">
                        <span className="text-[10px] font-bold text-slate-500 uppercase block">
                          {m.cargoCategory}
                        </span>
                        <span className="text-slate-800 truncate block font-medium" title={m.cargoDescription}>
                          {m.cargoDescription}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-semibold text-slate-800">
                        {m.weightTon.toLocaleString('id-ID')} Ton
                        {m.containerCount ? ` (${m.containerCount} Box)` : ''}
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">
                          {formatCurrency(m.freightRateIdr)}
                        </div>
                        <span className={`inline-block text-[10px] px-2 py-0.2 rounded-full mt-0.5 ${getPaymentBadge(m.paymentStatus)}`}>
                          {m.paymentStatus === 'Paid' ? 'LUNAS' : m.paymentStatus === 'Credit' ? 'KREDIT' : 'PENDING'}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <select
                          value={m.cargoStatus}
                          onChange={(e) => onQuickUpdateCargoStatus(m.id, e.target.value as CargoStatus)}
                          className="text-[11px] font-semibold bg-white border border-slate-300 rounded px-2 py-1 text-slate-800 focus:outline-none cursor-pointer"
                        >
                          <option value="Booked">Dipesan (Booked)</option>
                          <option value="Loaded">Dimuat (Loaded)</option>
                          <option value="In Transit">Dalam Pelayaran</option>
                          <option value="Discharged">Telah Dibongkar</option>
                          <option value="Released">Diterima Consignee</option>
                        </select>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onEditManifest(m)}
                            className="p-1.5 text-slate-600 hover:text-emerald-600 rounded hover:bg-slate-100 cursor-pointer"
                            title="Edit Dokumen B/L"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeleteManifest(m)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-slate-100 cursor-pointer"
                            title="Hapus B/L"
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

      {/* Bill of Lading Detail Modal */}
      {viewDetailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-black text-slate-900">
                  SURAT MUATAN KAPAL (BILL OF LADING)
                </h3>
              </div>
              <button
                onClick={() => setViewDetailModal(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="text-slate-500 font-semibold">Nomor Registrasi B/L:</span>
                <span className="font-mono font-bold text-sky-800 text-sm">{viewDetailModal.blNumber}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-400 font-bold block text-[10px]">PENGIRIM (SHIPPER)</span>
                  <span className="font-bold text-slate-900 text-xs">{viewDetailModal.shipperName}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block text-[10px]">PENERIMA (CONSIGNEE)</span>
                  <span className="font-bold text-slate-900 text-xs">{viewDetailModal.consigneeName}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                <div>
                  <span className="text-slate-400 font-bold block text-[10px]">KAPAL PENGANGKUT</span>
                  <span className="font-semibold text-slate-800">{viewDetailModal.vesselName}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block text-[10px]">NOMOR VOYAGE</span>
                  <span className="font-mono font-bold text-slate-800">{viewDetailModal.voyageNumber}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200">
                <span className="text-slate-400 font-bold block text-[10px]">DESKRIPSI KARGO & BARANG</span>
                <p className="font-medium text-slate-800 mt-0.5">{viewDetailModal.cargoDescription}</p>
                <div className="mt-1 flex items-center gap-3 text-slate-600">
                  <span>Kategori: <strong>{viewDetailModal.cargoCategory}</strong></span>
                  <span>•</span>
                  <span>Tonase: <strong>{viewDetailModal.weightTon} Ton</strong></span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                <span className="text-slate-600 font-semibold">Total Biaya Freight:</span>
                <span className="font-extrabold text-slate-900 text-sm">
                  {formatCurrency(viewDetailModal.freightRateIdr)}
                </span>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                Dicetak via Sistem PT Japara Bahari Line
              </span>
              <button
                onClick={() => setViewDetailModal(null)}
                className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
