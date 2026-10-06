import React, { useState, useEffect } from 'react';
import { OperationalLog, OperationalActivityType, Vessel } from '../../types';
import { Activity, X, Check } from 'lucide-react';

interface LogFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (log: Omit<OperationalLog, 'id' | 'createdAt'>) => Promise<void>;
  vessels: Vessel[];
  isLoading: boolean;
  currentOfficerName?: string;
}

export const LogFormModal: React.FC<LogFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  vessels,
  isLoading,
  currentOfficerName = 'Admin Operasional',
}) => {
  const [vesselId, setVesselId] = useState('');
  const [portName, setPortName] = useState('Pelabuhan Tanjung Priok (Jakarta)');
  const [activityType, setActivityType] = useState<OperationalActivityType>('Safety Inspection');
  const [recordedBy, setRecordedBy] = useState(currentOfficerName);
  const [details, setDetails] = useState('');
  const [timestamp, setTimestamp] = useState(new Date().toISOString().substring(0, 16));

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      setVesselId(vessels.length > 0 ? vessels[0].id : '');
      setPortName('Pelabuhan Tanjung Priok (Jakarta)');
      setActivityType('Safety Inspection');
      setRecordedBy(currentOfficerName);
      setDetails('');
      setTimestamp(new Date().toISOString().substring(0, 16));
      setErrors({});
    }
  }, [isOpen, vessels, currentOfficerName]);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!vesselId) {
      newErrors.vesselId = 'Pilih kapal yang bersangkutan.';
    }

    if (!portName.trim()) {
      newErrors.portName = 'Nama pelabuhan / terminal wajib diisi.';
    }

    if (!recordedBy.trim()) {
      newErrors.recordedBy = 'Nama petugas pencatat wajib diisi.';
    }

    if (!details.trim()) {
      newErrors.details = 'Rincian catatan aktivitas operasional wajib diisi.';
    } else if (details.trim().length > 500) {
      newErrors.details = 'Rincian maksimal 500 karakter.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const vessel = vessels.find((v) => v.id === vesselId);
    const vesselName = vessel ? vessel.name : 'Kapal Samudera';

    await onSubmit({
      vesselId,
      vesselName,
      portName: portName.trim(),
      activityType,
      recordedBy: recordedBy.trim(),
      details: details.trim(),
      timestamp: new Date(timestamp).toISOString(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 my-8">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Catat Log Operasional Maritim</h3>
              <p className="text-xs text-slate-500">
                Pencatatan resmi aktivitas bunker BBM, inspeksi kelaiklautan, dan pelabuhan
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
            {/* Pilih Kapal */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Pilih Kapal <span className="text-rose-500">*</span>
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
                    {v.name} ({v.imoNumber})
                  </option>
                ))}
              </select>
              {errors.vesselId && <p className="text-[11px] text-rose-500 mt-1">{errors.vesselId}</p>}
            </div>

            {/* Tipe Aktivitas */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Jenis Aktivitas <span className="text-rose-500">*</span>
              </label>
              <select
                value={activityType}
                onChange={(e) => setActivityType(e.target.value as OperationalActivityType)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
              >
                <option value="Safety Inspection">Pemeriksaan Kelaiklautan (Safety Inspection)</option>
                <option value="Bunkering">Pengisian Bahan Bakar (Bunkering)</option>
                <option value="Loading">Pemuatan Kargo (Loading)</option>
                <option value="Discharging">Pembongkaran Kargo (Discharging)</option>
                <option value="Crew Change">Pergantian Kru / Awak (Crew Change)</option>
                <option value="Maintenance">Perbaikan Mesin / Fasilitas (Maintenance)</option>
              </select>
            </div>

            {/* Pelabuhan */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Pelabuhan / Terminal Lokasi <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={portName}
                onChange={(e) => setPortName(e.target.value)}
                placeholder="Pelabuhan Tanjung Priok"
                className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:bg-white ${
                  errors.portName ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-300 focus:ring-sky-500'
                }`}
              />
              {errors.portName && <p className="text-[11px] text-rose-500 mt-1">{errors.portName}</p>}
            </div>

            {/* Petugas Pencatat */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Petugas / Officer Pencatat <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={recordedBy}
                onChange={(e) => setRecordedBy(e.target.value)}
                placeholder="Nama Petugas Maritim"
                className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:bg-white ${
                  errors.recordedBy ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-300 focus:ring-sky-500'
                }`}
              />
              {errors.recordedBy && <p className="text-[11px] text-rose-500 mt-1">{errors.recordedBy}</p>}
            </div>
          </div>

          {/* Waktu Aktivitas */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Waktu Kejadian / Pelaksanaan
            </label>
            <input
              type="datetime-local"
              value={timestamp}
              onChange={(e) => setTimestamp(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
            />
          </div>

          {/* Rincian Catatan */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Rincian Log Aktivitas <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Contoh: Pengisian bunker MGO sebesar 80 kiloliter selesai dengan aman tanpa ceceran minyak. Tingkat uji lab sesuai spesifikasi IMO 2020."
              className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:bg-white ${
                errors.details ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-300 focus:ring-sky-500'
              }`}
            />
            {errors.details && <p className="text-[11px] text-rose-500 mt-1">{errors.details}</p>}
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
              <span>{isLoading ? 'Menyimpan...' : 'Simpan Log'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
