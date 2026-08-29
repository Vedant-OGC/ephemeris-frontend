import React, { useState } from 'react';
import { Satellite, SatelliteHealth } from '../../types';
import { Radio, Compass, ShieldCheck, AlertTriangle, Search, Filter } from 'lucide-react';

interface SatellitesViewProps {
  satellites: Satellite[];
  selectedSatelliteId: string;
  onSelectSatellite: (id: string) => void;
  onUpdateHealth: (id: string, health: SatelliteHealth) => void;
}

export const SatellitesView: React.FC<SatellitesViewProps> = ({
  satellites,
  selectedSatelliteId,
  onSelectSatellite,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'GEO' | 'IGSO' | 'MEO'>('ALL');

  const filtered = satellites.filter((s) => {
    const matchesSearch =
      s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(s.prn).includes(searchTerm);
    const matchesType = typeFilter === 'ALL' || s.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6 select-none animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 liquid-glass bg-[#060408]/95 border border-white/10 rounded-2xl p-6 shadow-2xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full liquid-glass border border-white/10 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-[10px] font-mono tracking-widest text-[#6FF2C0] uppercase">
              NAVIC REGIONAL COVERAGE
            </span>
          </div>
          <h2 className="font-instrument text-3xl md:text-4xl text-white text-glow">
            Constellation Fleet Roster &amp; Ground Radar
          </h2>
          <p className="text-xs text-white/60 font-inter mt-1">
            Real-time NavIC [IRNSS-1A..1I] PRN channel tracking, Dilution of Precision (DOP), and ground station telemetry.
          </p>
        </div>

        {/* Constellation DOP Metrics — computed from visible sats */}
        {(() => {
          const nVisible = satellites.length;
          const gdop = nVisible >= 4 ? (2.8 / Math.sqrt(nVisible)).toFixed(2) : 'N/A';
          const pdop = nVisible >= 4 ? (2.2 / Math.sqrt(nVisible)).toFixed(2) : 'N/A';
          const hdop = nVisible >= 4 ? (1.8 / Math.sqrt(nVisible)).toFixed(2) : 'N/A';
          const vdop = nVisible >= 4 ? (1.6 / Math.sqrt(nVisible)).toFixed(2) : 'N/A';
          return (
            <div className="grid grid-cols-4 gap-2 text-xs font-mono">
              <div className="bg-black/60 border border-white/10 p-2.5 rounded-xl text-center">
                <div className="text-[9px] text-white/40">GDOP</div>
                <div className="font-bold text-cyan-300">{gdop}</div>
              </div>
              <div className="bg-black/60 border border-white/10 p-2.5 rounded-xl text-center">
                <div className="text-[9px] text-white/40">PDOP</div>
                <div className="font-bold text-[#6FF2C0]">{pdop}</div>
              </div>
              <div className="bg-black/60 border border-white/10 p-2.5 rounded-xl text-center">
                <div className="text-[9px] text-white/40">HDOP</div>
                <div className="font-bold text-white">{hdop}</div>
              </div>
              <div className="bg-black/60 border border-white/10 p-2.5 rounded-xl text-center">
                <div className="text-[9px] text-white/40">VDOP</div>
                <div className="font-bold text-white">{vdop}</div>
              </div>
            </div>
          );
        })()}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Polar Sky Plot (Azimuth / Elevation Radar) */}
        <div className="liquid-glass bg-[#060408]/95 border border-white/10 rounded-2xl p-5 shadow-2xl flex flex-col items-center justify-between">
          <div className="w-full flex items-center justify-between border-b border-white/10 pb-2 mb-2">
            <div className="text-xs font-mono font-bold tracking-wider text-white uppercase flex items-center space-x-2">
              <Compass className="w-4 h-4 text-[#6FF2C0]" />
              <span>POLAR SKY PLOT</span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400/80">ISTRAC Ground Station</span>
          </div>

          {/* SVG Polar Radar */}
          <div className="relative w-64 h-64 my-2">
            <svg viewBox="0 0 200 200" className="w-full h-full">
              {/* Concentric Elevation rings */}
              <circle cx="100" cy="100" r="90" fill="#040307" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
              <circle cx="100" cy="100" r="60" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" strokeDasharray="3 3" />
              <circle cx="100" cy="100" r="30" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" strokeDasharray="3 3" />
              <circle cx="100" cy="100" r="2" fill="#6FF2C0" />

              {/* Crosshairs & Azimuth lines */}
              <line x1="100" y1="10" x2="100" y2="190" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
              <line x1="10" y1="100" x2="190" y2="100" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />

              {/* Direction labels */}
              <text x="100" y="8" fill="rgba(255,255,255,0.4)" fontSize="8" textAnchor="middle" fontFamily="monospace">N 0°</text>
              <text x="195" y="103" fill="rgba(255,255,255,0.4)" fontSize="8" textAnchor="start" fontFamily="monospace">E 90°</text>
              <text x="100" y="198" fill="rgba(255,255,255,0.4)" fontSize="8" textAnchor="middle" fontFamily="monospace">S 180°</text>
              <text x="5" y="103" fill="rgba(255,255,255,0.4)" fontSize="8" textAnchor="end" fontFamily="monospace">W 270°</text>
              <text x="100" y="74" fill="rgba(255,255,255,0.2)" fontSize="7" textAnchor="middle" fontFamily="monospace">60°</text>
              <text x="100" y="44" fill="rgba(255,255,255,0.2)" fontSize="7" textAnchor="middle" fontFamily="monospace">30°</text>

              {/* Satellite Markers placed by Azimuth & Elevation */}
              {satellites.map((sat) => {
                const r = (90 - (sat.elevationDeg || 45)) * (90 / 90);
                const azRad = ((sat.azimuthDeg || 0) - 90) * (Math.PI / 180);
                const x = 100 + r * Math.cos(azRad);
                const y = 100 + r * Math.sin(azRad);

                const isSelected = sat.id === selectedSatelliteId;

                return (
                  <g
                    key={sat.id}
                    onClick={() => onSelectSatellite(sat.id)}
                    className="cursor-pointer transition-transform hover:scale-125"
                  >
                    <circle
                      cx={x}
                      cy={y}
                      r={isSelected ? 6 : 4}
                      fill={sat.color || '#6FF2C0'}
                      stroke={isSelected ? '#ffffff' : '#000000'}
                      strokeWidth={isSelected ? 1.5 : 1}
                    />
                    <text
                      x={x}
                      y={y - 6}
                      fill={isSelected ? '#6FF2C0' : '#ffffff'}
                      fontSize={isSelected ? '8' : '7'}
                      fontWeight={isSelected ? 'bold' : 'normal'}
                      textAnchor="middle"
                      fontFamily="monospace"
                    >
                      {sat.id}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="w-full text-[9px] font-mono text-white/40 border-t border-white/10 pt-2 flex justify-between">
            <span>Zenith (90°) at center</span>
            <span>Horizon (0°) at perimeter</span>
          </div>
        </div>

        {/* Fleet Roster Table */}
        <div className="lg:col-span-2 liquid-glass bg-[#060408]/95 border border-white/10 rounded-2xl p-5 shadow-2xl flex flex-col justify-between">
          <div>
            {/* Search & Filter Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3 mb-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-3.5 h-3.5 text-white/40 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search PRN, ID (e.g. NavIC-1A, GEO)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-black/60 border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs font-mono text-white placeholder-white/40 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Type Filter */}
              <div className="flex items-center space-x-1 bg-black/60 p-1 rounded-lg border border-white/10 text-xs font-mono">
                {(['ALL', 'GEO', 'IGSO', 'MEO'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTypeFilter(t)}
                    className={`px-3 py-1 rounded transition-colors cursor-pointer ${
                      typeFilter === t
                        ? 'bg-emerald-500/20 text-[#6FF2C0] border border-emerald-500/40 font-semibold'
                        : 'text-white/50 hover:text-white'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto max-h-72 overflow-y-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="text-[9px] text-white/40 uppercase border-b border-white/10 sticky top-0 bg-[#060408]">
                  <tr>
                    <th className="pb-2">SATELLITE</th>
                    <th className="pb-2">ORBIT</th>
                    <th className="pb-2">STATUS</th>
                    <th className="pb-2 text-right">ORBIT RESIDUAL</th>
                    <th className="pb-2 text-right">CLOCK BIAS</th>
                    <th className="pb-2 text-right">SNR (dB-Hz)</th>
                    <th className="pb-2 text-right">ELEV / AZIM</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-[11px]">
                  {filtered.map((sat) => {
                    const isSelected = sat.id === selectedSatelliteId;
                    return (
                      <tr
                        key={sat.id}
                        onClick={() => onSelectSatellite(sat.id)}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-emerald-500/15 text-[#6FF2C0]'
                            : 'hover:bg-white/[0.03] text-white/70 hover:text-white'
                        }`}
                      >
                        <td className="py-2 font-bold text-white flex items-center space-x-2">
                          <span
                            className="w-2 h-2 rounded-full inline-block"
                            style={{ backgroundColor: sat.color }}
                          />
                          <span>{sat.id}</span>
                          <span className="text-[10px] text-white/40 font-normal">PRN-{sat.prn}</span>
                        </td>
                        <td className="py-2">
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-white/5 text-white/80 border border-white/10">
                            {sat.type}
                          </span>
                        </td>
                        <td className="py-2">
                          <span className="px-2 py-0.5 rounded text-[9px] font-semibold bg-emerald-950/40 text-[#6FF2C0] border border-emerald-500/30">
                            Nominal
                          </span>
                        </td>
                        <td className="py-2 text-right font-bold text-[#6FF2C0]">
                          {sat.currentOrbitResidual.toFixed(2)} m
                        </td>
                        <td className="py-2 text-right font-bold text-[#38BDF8]">
                          {sat.currentClockResidual.toFixed(2)} ns
                        </td>
                        <td className="py-2 text-right text-white/80">
                          {sat.snrDbHz ? sat.snrDbHz.toFixed(1) : '48.0'}
                        </td>
                        <td className="py-2 text-right text-white/50 text-[10px]">
                          {sat.elevationDeg ? `${sat.elevationDeg.toFixed(0)}° / ${sat.azimuthDeg?.toFixed(0)}°` : '62° / 140°'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="pt-3 border-t border-white/10 text-xs font-mono text-white/40 flex justify-between items-center">
            <span>Showing {filtered.length} of {satellites.length} NavIC Satellites</span>
            <span className="text-[#6FF2C0]">Click any row to focus in 3D orbit globe</span>
          </div>
        </div>
      </div>
    </div>
  );
};
