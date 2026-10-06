import React, { useState, useEffect } from 'react';
import { Voyage, VoyageStatus, Vessel } from '../../types';
import { Calendar, X, Check, Navigation } from 'lucide-react';

interface VoyageFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (voyage: Omit<Voyage, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  initialData?: Voyage | null;
  vessels: Vessel[];
  isLoading: boolean;
}

export const VoyageFormModal: React.FC<VoyageFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  vessels,
  isLoading,
}) => {
  const [voyageNumber, setVoyageNumber] = useState('');
  const [vesselId, setVesselId] = useState('');
  const [originPort, setOriginPort] = useState('Pelabuhan Tanjung Priok (Jakarta)');
  const [destinationPort, setDestinationPort] = useState('Pelabuhan Tanjung Perak (Surabaya)');
  const [departureDate, setDepartureDate] = useState('');
  const [arrivalDate, setArrivalDate] = useState('');
  const [status, setStatus] = useState<VoyageStatus>('Scheduled');
  const [cargoLoadPercent, setCargoLoadPercent] = useState<string>('75');
  const [notes, setNotes] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setVoyageNumber(initialData.voyageNumber || '');
      setVesselId(initialData.vesselId || '');
      setOriginPort(initialData.originPort || '');
      setDestinationPort(initialData.destinationPort || '');
      setDepartureDate(initialData.departureDate ? initialData.departureDate.substring(0, 16) : '');
      setArrivalDate(initialData.arrivalDate ? initialData.arrivalDate.substring(0, 16) : '');
      setStatus(initialData.status || 'Scheduled');
      setCargoLoadPercent(initialData.cargoLoadPercent !== undefined ? initialData.cargoLoadPercent.toString() : '50');
      setNotes(initialData.notes || '');
    } else {
      const randomSuffix = Math.floor(100 + Math.random() * 900);
      setVoyageNumber(`VYG-2025-JKT-SUB-${randomSuffix}`);
      setVesselId(vessels.length > 0 ? vessels[0].id : '');
      setOriginPort('Pelabuhan Tanjung Priok (Jakarta)');
      setDestinationPort('Pelabuhan Tanjung Perak (Surabaya)');
      
      const now = new Date();
      const dep = new Date(now.getTime() + 1000 * 60 * 60 * 6);
      const arr = new Date(now.getTime() + 1000 * 60 * 60 * 36);
      setDepartureDate(dep.toISOString().substring(0, 16));
      setArrivalDate(arr.toISOString().substring(0, 16));
      setStatus('Scheduled');
      setCargoLoadPercent('80');
      setNotes('Rute reguler logistik kargo antarpulau.');
    }
    setErrors({});
  }, [initialData, isOpen, vessels]);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!voyageNumber.trim()) {
      newErrors.voyageNumber = 'Nomor pelayaran wajib diisi.';
    }

    if (!vesselId) {
      newErrors.vesselId = 'Pilih kapal armada untuk pelayaran ini.';
    }

    if (!originPort.trim()) {
      newErrors.originPort = 'Pelabuhan asal wajib diisi.';
    }

    if (!destinationPort.trim()) {
      newErrors.destinationPort = 'Pelabuhan tujuan wajib diisi.';
    } else if (destinationPort.trim().toLowerCase() === originPort.trim().toLowerCase()) {
      newErrors.destinationPort = 'Pelabuhan tujuan tidak boleh sama dengan pelabuhan asal.';
    }

    if (!departureDate) {
      newErrors.departureDate = 'Jadwal keberangkatan wajib diisi.';
    }

    if (!arrivalDate) {
      newErrors.arrivalDate = 'Jadwal tiba wajib diisi.';
    } else if (new Date(arrivalDate) <= new Date(departureDate)) {
      newErrors.arrivalDate = 'Jadwal tiba harus setelah jadwal keberangkatan.';
    }

    const load = Number(cargoLoadPercent);
    if (isNaN(load) || load < 0 || load > 100) {
      newErrors.cargoLoadPercent = 'Beban muatan harus antara 0% dan 100%.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const selectedVessel = vessels.find((v) => v.id === vesselId);
    const vesselName = selectedVessel ? selectedVessel.name : 'Kapal Samudera';

    await onSubmit({
      voyageNumber: voyageNumber.trim(),
      vesselId,
      vesselName,
      originPort: originPort.trim(),
      destinationPort: destinationPort.trim(),
      departureDate: new Date(departureDate).toISOString(),
      arrivalDate: new Date(arrivalDate).toISOString(),
      status,
      cargoLoadPercent: Number(cargoLoadPercent),
      notes: notes.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 my-8">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {initialData ? 'Perbarui Jadwal Pelayaran' : 'Jadwalkan Pelayaran Baru'}
              </h3>
              <p className="text-xs text-slate-500">
                Pencatatan rute lintasan dan estimasi kedatangan kapal
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
            {/* Nomor Pelayaran */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nomor Pelayaran (Voyage No) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={voyageNumber}
                onChange={(e) => setVoyageNumber(e.target.value)}
                placeholder="Contoh: VYG-2025-JKT-SUB-042"
                className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:bg-white font-mono ${
                  errors.voyageNumber ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-300 focus:ring-sky-500'
                }`}
              />
              {errors.voyageNumber && <p className="text-[11px] text-rose-500 mt-1">{errors.voyageNumber}</p>}
            </div>

            {/* Pilih Kapal */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Pilih Kapal Armada <span className="text-rose-500">*</span>
              </label>
              <select
                value={vesselId}
                onChange={(e) => setVesselId(e.target.value)}
                className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:bg-white ${
                  errors.vesselId ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-300 focus:ring-sky-500'
                }`}
              >
                <option value="">-- Pilih Kapal --</option>
                {vessels.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.vesselType} - {v.status})
                  </option>
                ))}
              </select>
              {errors.vesselId && <p className="text-[11px] text-rose-500 mt-1">{errors.vesselId}</p>}
            </div>

            {/* Pelabuhan Asal */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Pelabuhan Asal (Origin) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={originPort}
                onChange={(e) => setOriginPort(e.target.value)}
                placeholder="Contoh: Pelabuhan Tanjung Priok (Jakarta)"
                className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:bg-white ${
                  errors.originPort ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-300 focus:ring-sky-500'
                }`}
              />
              {errors.originPort && <p className="text-[11px] text-rose-500 mt-1">{errors.originPort}</p>}
            </div>

            {/* Pelabuhan Tujuan */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Pelabuhan Tujuan (Destination) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={destinationPort}
                onChange={(e) => setDestinationPort(e.target.value)}
                placeholder="Contoh: Pelabuhan Tanjung Perak (Surabaya)"
                className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:bg-white ${
                  errors.destinationPort ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-300 focus:ring-sky-500'
                }`}
              />
              {errors.destinationPort && <p className="text-[11px] text-rose-500 mt-1">{errors.destinationPort}</p>}
            </div>

            {/* Jadwal Berangkat (ETD) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Waktu Berangkat (ETD) <span className="text-rose-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={departureDate}
                onChange={(e) => setDepartureDate(e.target.value)}
                className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:bg-white ${
                  errors.departureDate ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-300 focus:ring-sky-500'
                }`}
              />
              {errors.departureDate && <p className="text-[11px] text-rose-500 mt-1">{errors.departureDate}</p>}
            </div>

            {/* Jadwal Tiba (ETA) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Estimasi Tiba (ETA) <span className="text-rose-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={arrivalDate}
                onChange={(e) => setArrivalDate(e.target.value)}
                className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:bg-white ${
                  errors.arrivalDate ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-300 focus:ring-sky-500'
                }`}
              />
              {errors.arrivalDate && <p className="text-[11px] text-rose-500 mt-1">{errors.arrivalDate}</p>}
            </div>

            {/* Status Pelayaran */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Status Pelayaran <span className="text-rose-500">*</span>
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as VoyageStatus)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white font-medium"
              >
                <option value="Scheduled">Terjadwal (Scheduled)</option>
                <option value="In Transit">Sedang Berlayar (In Transit)</option>
                <option value="Berthed">Tiba / Sandar di Tujuan</option>
                <option value="Completed">Selesai (Completed)</option>
                <option value="Delayed">Tertunda / Cuaca Buruk (Delayed)</option>
              </select>
            </div>

            {/* Beban Muatan % */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kapasitas Muatan Terisi (%) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={cargoLoadPercent}
                onChange={(e) => setCargoLoadPercent(e.target.value)}
                placeholder="0 - 100"
                className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:bg-white ${
                  errors.cargoLoadPercent ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-300 focus:ring-sky-500'
                }`}
              />
              {errors.cargoLoadPercent && <p className="text-[11px] text-rose-500 mt-1">{errors.cargoLoadPercent}</p>}
            </div>
          </div>

          {/* Catatan Pelayaran */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Catatan Operasional & Rute
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Kondisi cuaca, muatan prioritas, instruksi khusus Syahbandar..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
            />
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
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{isLoading ? 'Menyimpan ke Firestore...' : initialData ? 'Simpan Perubahan' : 'Jadwalkan Rute'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
