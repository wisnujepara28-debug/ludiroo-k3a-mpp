import React, { useState, useEffect } from 'react';
import { Manifest, CargoCategory, CargoStatus, PaymentStatus, Voyage } from '../../types';
import { FileText, X, Check, DollarSign } from 'lucide-react';

interface ManifestFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (manifest: Omit<Manifest, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  initialData?: Manifest | null;
  voyages: Voyage[];
  isLoading: boolean;
}

export const ManifestFormModal: React.FC<ManifestFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  voyages,
  isLoading,
}) => {
  const [blNumber, setBlNumber] = useState('');
  const [voyageId, setVoyageId] = useState('');
  const [shipperName, setShipperName] = useState('');
  const [consigneeName, setConsigneeName] = useState('');
  const [cargoDescription, setCargoDescription] = useState('');
  const [cargoCategory, setCargoCategory] = useState<CargoCategory>('Kontainer FCL');
  const [weightTon, setWeightTon] = useState<string>('');
  const [containerCount, setContainerCount] = useState<string>('');
  const [freightRateIdr, setFreightRateIdr] = useState<string>('');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('Paid');
  const [cargoStatus, setCargoStatus] = useState<CargoStatus>('Booked');

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setBlNumber(initialData.blNumber || '');
      setVoyageId(initialData.voyageId || '');
      setShipperName(initialData.shipperName || '');
      setConsigneeName(initialData.consigneeName || '');
      setCargoDescription(initialData.cargoDescription || '');
      setCargoCategory(initialData.cargoCategory || 'Kontainer FCL');
      setWeightTon(initialData.weightTon ? initialData.weightTon.toString() : '');
      setContainerCount(initialData.containerCount ? initialData.containerCount.toString() : '');
      setFreightRateIdr(initialData.freightRateIdr ? initialData.freightRateIdr.toString() : '');
      setPaymentStatus(initialData.paymentStatus || 'Paid');
      setCargoStatus(initialData.cargoStatus || 'Booked');
    } else {
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      setBlNumber(`BL-SBL-2025-${randomSuffix}`);
      setVoyageId(voyages.length > 0 ? voyages[0].id : '');
      setShipperName('');
      setConsigneeName('');
      setCargoDescription('');
      setCargoCategory('Kontainer FCL');
      setWeightTon('120');
      setContainerCount('5');
      setFreightRateIdr('45000000');
      setPaymentStatus('Paid');
      setCargoStatus('Booked');
    }
    setErrors({});
  }, [initialData, isOpen, voyages]);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!blNumber.trim()) {
      newErrors.blNumber = 'Nomor Bill of Lading (B/L) wajib diisi.';
    }

    if (!voyageId) {
      newErrors.voyageId = 'Pilih jadwal pelayaran untuk manifest kargo ini.';
    }

    if (!shipperName.trim()) {
      newErrors.shipperName = 'Nama perusahaan pengirim (Shipper) wajib diisi.';
    }

    if (!consigneeName.trim()) {
      newErrors.consigneeName = 'Nama perusahaan penerima (Consignee) wajib diisi.';
    }

    if (!cargoDescription.trim()) {
      newErrors.cargoDescription = 'Deskripsi muatan kargo wajib diisi.';
    }

    const weight = Number(weightTon);
    if (!weightTon || isNaN(weight) || weight <= 0) {
      newErrors.weightTon = 'Berat muatan harus berupa angka positif (Ton).';
    }

    const freight = Number(freightRateIdr);
    if (!freightRateIdr || isNaN(freight) || freight < 0) {
      newErrors.freightRateIdr = 'Tarif ongkos angkut (Freight Rate IDR) harus berupa angka valid.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const selectedVoyage = voyages.find((v) => v.id === voyageId);
    const voyageNumber = selectedVoyage ? selectedVoyage.voyageNumber : '-';
    const vesselName = selectedVoyage ? selectedVoyage.vesselName : '-';

    await onSubmit({
      blNumber: blNumber.trim(),
      voyageId,
      voyageNumber,
      vesselName,
      shipperName: shipperName.trim(),
      consigneeName: consigneeName.trim(),
      cargoDescription: cargoDescription.trim(),
      cargoCategory,
      weightTon: Number(weightTon),
      containerCount: containerCount ? Number(containerCount) : undefined,
      freightRateIdr: Number(freightRateIdr),
      paymentStatus,
      cargoStatus,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 my-8">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {initialData ? 'Perbarui Dokumen B/L Kargo' : 'Penerbitan Manifest & Bill of Lading (B/L)'}
              </h3>
              <p className="text-xs text-slate-500">
                Dokumen muatan resmi pengapalan laut PT Japara Bahari Line
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Nomor B/L */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nomor Bill of Lading (B/L) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={blNumber}
                onChange={(e) => setBlNumber(e.target.value)}
                placeholder="Contoh: BL-SBL-2025-0911"
                className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:bg-white font-mono ${
                  errors.blNumber ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-300 focus:ring-emerald-500'
                }`}
              />
              {errors.blNumber && <p className="text-[11px] text-rose-500 mt-1">{errors.blNumber}</p>}
            </div>

            {/* Hubungkan ke Jadwal Pelayaran */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Jadwal & Kapal Pelayaran <span className="text-rose-500">*</span>
              </label>
              <select
                value={voyageId}
                onChange={(e) => setVoyageId(e.target.value)}
                className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:bg-white ${
                  errors.voyageId ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-300 focus:ring-emerald-500'
                }`}
              >
                <option value="">-- Pilih Pelayaran --</option>
                {voyages.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.voyageNumber} • {v.vesselName} ({v.originPort} → {v.destinationPort})
                  </option>
                ))}
              </select>
              {errors.voyageId && <p className="text-[11px] text-rose-500 mt-1">{errors.voyageId}</p>}
            </div>

            {/* Nama Shipper */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Pengirim (Shipper) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={shipperName}
                onChange={(e) => setShipperName(e.target.value)}
                placeholder="PT Indofood Sukses Makmur Tbk"
                className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:bg-white ${
                  errors.shipperName ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-300 focus:ring-emerald-500'
                }`}
              />
              {errors.shipperName && <p className="text-[11px] text-rose-500 mt-1">{errors.shipperName}</p>}
            </div>

            {/* Nama Consignee */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Penerima (Consignee) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={consigneeName}
                onChange={(e) => setConsigneeName(e.target.value)}
                placeholder="PT Sumber Alfaria Trijaya Sidoarjo"
                className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:bg-white ${
                  errors.consigneeName ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-300 focus:ring-emerald-500'
                }`}
              />
              {errors.consigneeName && <p className="text-[11px] text-rose-500 mt-1">{errors.consigneeName}</p>}
            </div>

            {/* Kategori Muatan */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kategori Kargo <span className="text-rose-500">*</span>
              </label>
              <select
                value={cargoCategory}
                onChange={(e) => setCargoCategory(e.target.value as CargoCategory)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              >
                <option value="Kontainer FCL">Petikemas Full Container Load (FCL)</option>
                <option value="Kontainer LCL">Petikemas Less Container Load (LCL)</option>
                <option value="Curah Kering">Curah Kering (Semen, Batubara, Gandum)</option>
                <option value="Curah Cair">Curah Cair (CPO, BBM, Kimia)</option>
                <option value="Kargo Umum">Kargo Umum / General Breakbulk</option>
                <option value="Kendaraan">Kendaraan & Alat Berat</option>
              </select>
            </div>

            {/* Berat Tonase */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Berat Muatan (Ton) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                value={weightTon}
                onChange={(e) => setWeightTon(e.target.value)}
                placeholder="Misal: 150.5"
                className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:bg-white ${
                  errors.weightTon ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-300 focus:ring-emerald-500'
                }`}
              />
              {errors.weightTon && <p className="text-[11px] text-rose-500 mt-1">{errors.weightTon}</p>}
            </div>

            {/* Jumlah Kontainer */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Jumlah Kontainer / Box (Opsional)
              </label>
              <input
                type="number"
                value={containerCount}
                onChange={(e) => setContainerCount(e.target.value)}
                placeholder="Misal: 10"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
            </div>

            {/* Biaya Freight IDR */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Ongkos Angkut / Freight Rate (IDR) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                value={freightRateIdr}
                onChange={(e) => setFreightRateIdr(e.target.value)}
                placeholder="Misal: 85000000"
                className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:bg-white ${
                  errors.freightRateIdr ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-300 focus:ring-emerald-500'
                }`}
              />
              {errors.freightRateIdr && <p className="text-[11px] text-rose-500 mt-1">{errors.freightRateIdr}</p>}
            </div>

            {/* Status Pembayaran */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Status Pembayaran Ongkos Angkut <span className="text-rose-500">*</span>
              </label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              >
                <option value="Paid">Lunas (Paid)</option>
                <option value="Pending">Menunggu Pembayaran (Pending)</option>
                <option value="Credit">Kredit Perusahaan (Credit 30 Hari)</option>
              </select>
            </div>

            {/* Status Pergerakan Kargo */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Status Pergerakan Kargo <span className="text-rose-500">*</span>
              </label>
              <select
                value={cargoStatus}
                onChange={(e) => setCargoStatus(e.target.value as CargoStatus)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white font-medium"
              >
                <option value="Booked">Telah Dipesan (Booked)</option>
                <option value="Loaded">Dimuat di Palka (Loaded)</option>
                <option value="In Transit">Dalam Pelayaran (In Transit)</option>
                <option value="Discharged">Dibongkar di Tujuan (Discharged)</option>
                <option value="Released">Diserahkan ke Consignee (Released)</option>
              </select>
            </div>
          </div>

          {/* Deskripsi Barang */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Rincian Deskripsi Barang Kargo <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={cargoDescription}
              onChange={(e) => setCargoDescription(e.target.value)}
              placeholder="Contoh: 10 x 40ft Kontainer Bahan Pangan Pokok (Tepung Terigu & Minyak Nabati)..."
              className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:bg-white ${
                errors.cargoDescription ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-300 focus:ring-emerald-500'
              }`}
            />
            {errors.cargoDescription && <p className="text-[11px] text-rose-500 mt-1">{errors.cargoDescription}</p>}
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-lg shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{isLoading ? 'Menyimpan...' : initialData ? 'Simpan Perubahan' : 'Terbitkan B/L'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
