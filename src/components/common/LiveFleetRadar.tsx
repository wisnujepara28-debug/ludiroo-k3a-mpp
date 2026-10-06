import React, { useState } from 'react';
import { Vessel, Voyage } from '../../types';
import { 
  Ship, 
  Compass, 
  MapPin, 
  Navigation, 
  Radio, 
  Fuel, 
  Wind, 
  Waves,
  Eye,
  Info
} from 'lucide-react';

interface LiveFleetRadarProps {
  vessels: Vessel[];
  voyages: Voyage[];
}

export const LiveFleetRadar: React.FC<LiveFleetRadarProps> = ({ vessels, voyages }) => {
  const [selectedVesselId, setSelectedVesselId] = useState<string | null>(
    vessels.length > 0 ? vessels[0].id : null
  );

  const selectedVessel = vessels.find((v) => v.id === selectedVesselId) || vessels[0];

  // Pre-mapped Indonesian maritime coordinates for visual radar
  const portNodes = [
    { name: 'Belawan (Medan)', x: 14, y: 32, code: 'BLW', weather: 'Cerah, 29°C', wave: '0.8m' },
    { name: 'Batam', x: 28, y: 36, code: 'BTM', weather: 'Berawan, 30°C', wave: '0.6m' },
    { name: 'Tanjung Priok (Jakarta)', x: 38, y: 72, code: 'JKT', weather: 'Cerah Berawan, 31°C', wave: '1.0m' },
    { name: 'Tanjung Perak (Surabaya)', x: 58, y: 76, code: 'SUB', weather: 'Tenang, 32°C', wave: '0.7m' },
    { name: 'Balikpapan (Kaltim)', x: 64, y: 46, code: 'BPN', weather: 'Hujan Ringan, 28°C', wave: '1.2m' },
    { name: 'Makassar (Sulsel)', x: 74, y: 64, code: 'MKS', weather: 'Cerah, 31°C', wave: '0.9m' },
    { name: 'Bitung (Manado)', x: 86, y: 28, code: 'BTG', weather: 'Berawan, 29°C', wave: '1.4m' },
  ];

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 text-white p-5 shadow-xl relative overflow-hidden">
      {/* Decorative Radar Sweep Line */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center ring-1 ring-sky-500/30">
            <Compass className="w-5 h-5 animate-spin" style={{ animationDuration: '24s' }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-white tracking-tight">
                RADAR OPERASIONAL ARMADA & RUTE LAUT
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Live AIS Track
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Visualisasi lintasan perkapalan kepulauan nusantara & telemetri posisi real-time
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span>Sedang Berlayar</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
            <span>Sandar</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span>Lego Jangkar</span>
          </div>
        </div>
      </div>

      {/* Radar Map Canvas Representation */}
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left (8 cols): Graphical Marine Map */}
        <div className="lg:col-span-8 bg-slate-950/80 rounded-xl p-4 border border-slate-800 relative min-h-[300px] flex flex-col justify-between overflow-hidden">
          {/* Nautical Grid Lines */}
          <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:20px_20px] opacity-40 pointer-events-none" />

          {/* Sea Lane SVG Pathways */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
            {/* Belawan to Tanjung Priok */}
            <path d="M 14% 32% Q 25% 55% 38% 72%" fill="none" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="4 4" />
            {/* Tanjung Priok to Tanjung Perak */}
            <path d="M 38% 72% L 58% 76%" fill="none" stroke="#38bdf8" strokeWidth="2" strokeDasharray="5 5" />
            {/* Tanjung Perak to Makassar */}
            <path d="M 58% 76% Q 65% 70% 74% 64%" fill="none" stroke="#38bdf8" strokeWidth="2" strokeDasharray="5 5" />
            {/* Makassar to Balikpapan */}
            <path d="M 74% 64% L 64% 46%" fill="none" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="4 4" />
          </svg>

          {/* Ports on Map */}
          {portNodes.map((port) => (
            <div
              key={port.code}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10 group"
              style={{ left: `${port.x}%`, top: `${port.y}%` }}
            >
              <div className="w-3.5 h-3.5 rounded-full bg-slate-800 border-2 border-sky-400 flex items-center justify-center group-hover:scale-125 transition-transform cursor-pointer shadow-lg shadow-sky-500/50">
                <div className="w-1.5 h-1.5 rounded-full bg-sky-300" />
              </div>
              <div className="absolute left-1/2 -translate-x-1/2 -bottom-5 whitespace-nowrap bg-slate-900/90 text-[10px] font-bold px-1.5 py-0.5 rounded border border-slate-700 pointer-events-none shadow-md">
                {port.name}
              </div>
            </div>
          ))}

          {/* Vessel Markers on Maritime Sea Lanes */}
          {vessels.map((v, idx) => {
            // Distribute visually along corridors
            const positions = [
              { x: 48, y: 74 }, // Java Sea between JKT & SUB
              { x: 59, y: 77 }, // In Surabaya port
              { x: 26, y: 52 }, // Bangka Strait (Belawan route)
              { x: 65, y: 47 }, // Balikpapan
              { x: 57, y: 80 }, // Surabaya Drydock
            ];
            const pos = positions[idx % positions.length];
            const isSelected = selectedVessel?.id === v.id;
            const isUnderway = v.status === 'Underway';

            return (
              <button
                key={v.id}
                onClick={() => setSelectedVesselId(v.id)}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 z-20 transition-all duration-200 cursor-pointer ${
                  isSelected ? 'scale-125 ring-4 ring-sky-400/40' : 'hover:scale-115'
                }`}
                style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                title={`${v.name} (${v.status})`}
              >
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center shadow-lg ${
                    isSelected
                      ? 'bg-sky-500 text-white ring-2 ring-white'
                      : isUnderway
                      ? 'bg-emerald-600 text-white'
                      : v.status === 'Berthed'
                      ? 'bg-sky-600 text-white'
                      : 'bg-amber-600 text-white'
                  }`}
                >
                  <Ship className="w-4 h-4" />
                </div>
                {isUnderway && (
                  <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                )}
              </button>
            );
          })}

          <div className="z-10 mt-auto pt-6 flex flex-wrap items-center justify-between text-[11px] text-slate-400">
            <span>Wilayah: Alur Laut Kepulauan Indonesia (ALKI I, II & III)</span>
            <span>Koordinat Pusat: 0°47'S 115°13'E</span>
          </div>
        </div>

        {/* Right (4 cols): Selected Vessel Telemetry & Info */}
        <div className="lg:col-span-4 bg-slate-800/60 rounded-xl p-4 border border-slate-700 flex flex-col justify-between space-y-4">
          {selectedVessel ? (
            <>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider">
                    Telemetri Kapal Terpilih
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      selectedVessel.status === 'Underway'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : selectedVessel.status === 'Berthed'
                        ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {selectedVessel.status}
                  </span>
                </div>

                <h4 className="text-base font-black text-white">{selectedVessel.name}</h4>
                <p className="text-xs font-mono text-slate-400">{selectedVessel.imoNumber}</p>

                <div className="mt-3 space-y-2 text-xs">
                  <div className="flex items-center justify-between py-1.5 border-b border-slate-700/60">
                    <span className="text-slate-400">Tipe Armada:</span>
                    <span className="font-semibold text-slate-200">{selectedVessel.vesselType}</span>
                  </div>
                  <div className="flex items-center justify-between py-1.5 border-b border-slate-700/60">
                    <span className="text-slate-400">Kapasitas Muatan:</span>
                    <span className="font-semibold text-slate-200">
                      {selectedVessel.capacityDwt.toLocaleString('id-ID')} DWT
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1.5 border-b border-slate-700/60">
                    <span className="text-slate-400">Posisi Terkini:</span>
                    <span className="font-semibold text-sky-300 truncate max-w-[160px]" title={selectedVessel.currentLocation}>
                      {selectedVessel.currentLocation}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1.5 border-b border-slate-700/60">
                    <span className="text-slate-400">Nahkoda / Master:</span>
                    <span className="font-semibold text-slate-200">{selectedVessel.captainName}</span>
                  </div>
                  <div className="flex items-center justify-between py-1.5 border-b border-slate-700/60">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Fuel className="w-3.5 h-3.5 text-amber-400" /> Bunker BBM:
                    </span>
                    <span className="font-bold text-slate-100">{selectedVessel.fuelLevelPercent}%</span>
                  </div>
                </div>
              </div>

              {/* Weather info at sea */}
              <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-700/80 text-xs space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Kondisi Meteorologi Laut</span>
                <div className="flex items-center justify-between text-slate-300">
                  <span className="flex items-center gap-1">
                    <Wind className="w-3.5 h-3.5 text-sky-400" /> Angin: 12 Knot Timur
                  </span>
                  <span className="flex items-center gap-1">
                    <Waves className="w-3.5 h-3.5 text-blue-400" /> Ombak: 0.9 m
                  </span>
                </div>
              </div>
            </>
          ) : (
            <p className="text-xs text-slate-400 text-center py-8">
              Pilih salah satu armada kapal pada peta radar.
            </p>
          )}

          {/* Quick Selector Pills */}
          <div className="pt-2">
            <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1.5">Pilih Kapal:</span>
            <div className="flex flex-wrap gap-1.5">
              {vessels.slice(0, 5).map((v) => (
                <button
                  key={v.id}
                  onClick={() => setSelectedVesselId(v.id)}
                  className={`text-[10px] font-bold px-2 py-1 rounded transition-colors cursor-pointer ${
                    selectedVessel?.id === v.id
                      ? 'bg-sky-500 text-white'
                      : 'bg-slate-700/70 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {v.name.replace('KM ', '')}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
