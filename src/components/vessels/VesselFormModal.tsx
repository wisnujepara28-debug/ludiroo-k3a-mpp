import React, { useState, useEffect } from 'react';
import { Vessel, VesselType, VesselStatus } from '../../types';
import { Ship, X, AlertCircle, Check } from 'lucide-react';

interface VesselFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (vessel: Omit<Vessel, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  initialData?: Vessel | null;
  isLoading: boolean;
}

export const VesselFormModal: React.FC<VesselFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading,
}) => {
  const [name, setName] = useState('');
  const [imoNumber, setImoNumber] = useState('');
  const [vesselType, setVesselType] = useState<VesselType>('Container');
  const [capacityDwt, setCapacityDwt] = useState<string>('');
  const [capacityTeu, setCapacityTeu] = useState<string>('');
  const [buildYear, setBuildYear] = useState<string>(new Date().getFullYear().toString());
  const [flagPort, setFlagPort] = useState('Pelabuhan Tanjung Priok, Jakarta');
  const [captainName, setCaptainName] = useState('');
  const [status, setStatus] = useState<VesselStatus>('Berthed');
  const [currentLocation, setCurrentLocation] = useState('');
  const [fuelLevelPercent, setFuelLevelPercent] = useState<string>('85');

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setImoNumber(initialData.imoNumber || '');
      setVesselType(initialData.vesselType || 'Container');
      setCapacityDwt(initialData.capacityDwt ? initialData.capacityDwt.toString() : '');
      setCapacityTeu(initialData.capacityTeu ? initialData.capacityTeu.toString() : '');
      setBuildYear(initialData.buildYear ? initialData.buildYear.toString() : '2020');
      setFlagPort(initialData.flagPort || 'Pelabuhan Tanjung Priok, Jakarta');
      setCaptainName(initialData.captainName || '');
      setStatus(initialData.status || 'Berthed');
      setCurrentLocation(initialData.currentLocation || '');
      setFuelLevelPercent(initialData.fuelLevelPercent !== undefined ? initialData.fuelLevelPercent.toString() : '80');
    } else {
      setName('');
      setImoNumber('');
      setVesselType('Container');
      setCapacityDwt('');
      setCapacityTeu('');
      setBuildYear('2021');
      setFlagPort('Pelabuhan Tanjung Priok, Jakarta');
      setCaptainName('');
      setStatus('Berthed');
      setCurrentLocation('Pelabuhan Tanjung Priok (Dermaga Barat)');
      setFuelLevelPercent('90');
    }
    setErrors({});
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Nama kapal wajib diisi.';
    } else if (name.trim().length > 100) {
      newErrors.name = 'Nama kapal maksimal 100 karakter.';
    }

    if (!imoNumber.trim()) {
      newErrors.imoNumber = 'Nomor IMO wajib diisi.';
    } else if (imoNumber.trim().length > 30) {
      newErrors.imoNumber = 'Nomor IMO maksimal 30 karakter.';
    }

    const dwt = Number(capacityDwt);
    if (!capacityDwt || isNaN(dwt) || dwt <= 0) {
      newErrors.capacityDwt = 'Kapasitas DWT harus berupa angka positif.';
    } else if (dwt > 500000) {
      newErrors.capacityDwt = 'Kapasitas DWT melebihi batas wajar kapal (maks. 500.000 DWT).';
    }

    const year = Number(buildYear);
    const currentYear = new Date().getFullYear();
    if (!buildYear || isNaN(year) || year < 1960 || year > currentYear + 2) {
      newErrors.buildYear = `Tahun pembuatan harus antara 1960 dan ${currentYear + 2}.`;
    }

    if (!flagPort.trim()) {
      newErrors.flagPort = 'Pelabuhan pendaftaran/bendera wajib diisi.';
    }

    if (!captainName.trim()) {
      newErrors.captainName = 'Nama Nahkoda/Kapten wajib diisi.';
    }

    if (!currentLocation.trim()) {
      newErrors.currentLocation = 'Posisi/Lokasi saat ini wajib diisi.';
    }

    const fuel = Number(fuelLevelPercent);
    if (isNaN(fuel) || fuel < 0 || fuel > 100) {
      newErrors.fuelLevelPercent = 'Bahan bakar harus antara 0% dan 100%.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    await onSubmit({
      name: name.trim(),
      imoNumber: imoNumber.trim(),
      vesselType,
      capacityDwt: Number(capacityDwt),
      capacityTeu: capacityTeu ? Number(capacityTeu) : undefined,
      buildYear: Number(buildYear),
      flagPort: flagPort.trim(),
      captainName: captainName.trim(),
      status,
      currentLocation: currentLocation.trim(),
      fuelLevelPercent: Number(fuelLevelPercent),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 my-8">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
              <Ship className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {initialData ? 'Perbarui Data Armada Kapal' : 'Registrasi Armada Kapal Baru'}
              </h3>
              <p className="text-xs text-slate-500">
                Sistem database armada kapal PT Japara Bahari Line
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
            {/* Nama Kapal */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Kapal <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: KM Samudera Raya 01"
                className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:bg-white transition-colors ${
                  errors.name ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-300 focus:ring-sky-500'
                }`}
              />
              {errors.name && <p className="text-[11px] text-rose-500 mt-1">{errors.name}</p>}
            </div>

            {/* Nomor IMO */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nomor IMO <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={imoNumber}
                onChange={(e) => setImoNumber(e.target.value)}
                placeholder="Contoh: IMO 9412356"
                className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:bg-white transition-colors ${
                  errors.imoNumber ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-300 focus:ring-sky-500'
                }`}
              />
              {errors.imoNumber && <p className="text-[11px] text-rose-500 mt-1">{errors.imoNumber}</p>}
            </div>

            {/* Tipe Kapal */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tipe Kapal <span className="text-rose-500">*</span>
              </label>
              <select
                value={vesselType}
                onChange={(e) => setVesselType(e.target.value as VesselType)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
              >
                <option value="Container">Kapal Petikemas (Container Ship)</option>
                <option value="Bulk Carrier">Curah Kering (Bulk Carrier)</option>
                <option value="General Cargo">Kargo Umum (General Cargo)</option>
                <option value="Tanker">Kapal Tanker Minyak / CPO</option>
                <option value="Ro-Ro">Kapal Ro-Ro / Penumpang</option>
                <option value="Tug & Barge">Tongkang & Tug Boat</option>
              </select>
            </div>

            {/* Status Operasional */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Status Operasional <span className="text-rose-500">*</span>
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as VesselStatus)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white font-medium"
              >
                <option value="Underway">Sedang Berlayar (Underway)</option>
                <option value="Berthed">Sandar di Dermaga (Berthed)</option>
                <option value="Anchored">Lego Jangkar (Anchored)</option>
                <option value="Maintenance">Dalam Perawatan / Dok (Maintenance)</option>
              </select>
            </div>

            {/* Kapasitas DWT */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kapasitas DWT (Tonase) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                value={capacityDwt}
                onChange={(e) => setCapacityDwt(e.target.value)}
                placeholder="Misal: 25000"
                className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:bg-white ${
                  errors.capacityDwt ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-300 focus:ring-sky-500'
                }`}
              />
              {errors.capacityDwt && <p className="text-[11px] text-rose-500 mt-1">{errors.capacityDwt}</p>}
            </div>

            {/* Kapasitas TEU (Khusus Kontainer) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kapasitas Kontainer TEUs (Opsional)
              </label>
              <input
                type="number"
                value={capacityTeu}
                onChange={(e) => setCapacityTeu(e.target.value)}
                placeholder="Misal: 1800"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
              />
            </div>

            {/* Tahun Pembuatan */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tahun Pembuatan <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                value={buildYear}
                onChange={(e) => setBuildYear(e.target.value)}
                placeholder="Misal: 2020"
                className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:bg-white ${
                  errors.buildYear ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-300 focus:ring-sky-500'
                }`}
              />
              {errors.buildYear && <p className="text-[11px] text-rose-500 mt-1">{errors.buildYear}</p>}
            </div>

            {/* Level Bunker BBM % */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Bunker Bahan Bakar (%) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={fuelLevelPercent}
                onChange={(e) => setFuelLevelPercent(e.target.value)}
                placeholder="0 - 100"
                className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:bg-white ${
                  errors.fuelLevelPercent ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-300 focus:ring-sky-500'
                }`}
              />
              {errors.fuelLevelPercent && <p className="text-[11px] text-rose-500 mt-1">{errors.fuelLevelPercent}</p>}
            </div>

            {/* Pelabuhan Pangkalan / Bendera */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Pelabuhan Pendaftaran / Bendera <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={flagPort}
                onChange={(e) => setFlagPort(e.target.value)}
                placeholder="Pelabuhan Tanjung Priok, Jakarta"
                className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:bg-white ${
                  errors.flagPort ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-300 focus:ring-sky-500'
                }`}
              />
              {errors.flagPort && <p className="text-[11px] text-rose-500 mt-1">{errors.flagPort}</p>}
            </div>

            {/* Nama Kapten / Master */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nahkoda / Master Kapal <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={captainName}
                onChange={(e) => setCaptainName(e.target.value)}
                placeholder="Capt. Hendra Gunawan, M.Mar"
                className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:bg-white ${
                  errors.captainName ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-300 focus:ring-sky-500'
                }`}
              />
              {errors.captainName && <p className="text-[11px] text-rose-500 mt-1">{errors.captainName}</p>}
            </div>
          </div>

          {/* Posisi Terkini */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Posisi / Lokasi Pelabuhan Saat Ini <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={currentLocation}
              onChange={(e) => setCurrentLocation(e.target.value)}
              placeholder="Contoh: Dermaga Jamrud Tanjung Perak / Selat Makassar (Lat -2.4, Long 118.5)"
              className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:bg-white ${
                errors.currentLocation ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-300 focus:ring-sky-500'
              }`}
            />
            {errors.currentLocation && <p className="text-[11px] text-rose-500 mt-1">{errors.currentLocation}</p>}
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
              className="px-5 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 active:bg-sky-800 rounded-lg shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{isLoading ? 'Menyimpan ke Firestore...' : initialData ? 'Simpan Perubahan' : 'Daftarkan Kapal'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
