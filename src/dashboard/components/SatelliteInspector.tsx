import React from 'react';
import { Satellite } from '../types';
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Area,
  ComposedChart,
  Line,
} from 'recharts';
import { ChevronRight, ChevronLeft } from 'lucide-react';

interface SatelliteInspectorProps {
  satellite: Satellite;
  allSatellites: Satellite[];
  onSelectSatellite: (id: string) => void;
}

export const SatelliteInspector: React.FC<SatelliteInspectorProps> = ({
  satellite,
  allSatellites,
  onSelectSatellite,
}) => {
  const currentIndex = allSatellites.findIndex((s) => s.id === satellite.id);
  const handlePrev = () => {
    const prevIndex = (currentIndex - 1 + allSatellites.length) % allSatellites.length;
    onSelectSatellite(allSatellites[prevIndex].id);
  };
  const handleNext = () => {
    const nextIndex = (currentIndex + 1) % allSatellites.length;
    onSelectSatellite(allSatellites[nextIndex].id);
  };

  const chartData = satellite.predictionSeries?.length
    ? satellite.predictionSeries
    : [
        { timeOffset: 'Now', orbitResidual: satellite.currentOrbitResidual, clockResidual: satellite.currentClockResidual },
        { timeOffset: '+6h', orbitResidual: +(satellite.currentOrbitResidual * 1.15).toFixed(2), clockResidual: +(satellite.currentClockResidual * 1.05).toFixed(2) },
        { timeOffset: '+12h', orbitResidual: +(satellite.currentOrbitResidual * 1.08).toFixed(2), clockResidual: +(satellite.currentClockResidual * 1.12).toFixed(2) },
        { timeOffset: '+18h', orbitResidual: +(satellite.currentOrbitResidual * 1.25).toFixed(2), clockResidual: +(satellite.currentClockResidual * 1.18).toFixed(2) },
        { timeOffset: '+24h', orbitResidual: +(satellite.currentOrbitResidual * 1.18).toFixed(2), clockResidual: +(satellite.currentClockResidual * 1.10).toFixed(2) },
      ];

  return (
    <div className="liquid-glass bg-[#060408]/95 border border-white/20 hover:border-white/30 rounded-2xl p-6 flex flex-col justify-between shadow-2xl relative overflow-hidden h-[480px] md:h-[520px] select-none transition-all">
      {/* 1. Header with Live Status & Quick Switcher */}
      <div>
        <div className="flex items-center justify-between border-b border-white/15 pb-3">
          <span className="text-[10px] uppercase font-mono tracking-widest text-white/50 font-medium">
            TELEMETRY INSPECTOR
          </span>

          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1.5 text-xs font-mono text-[#6FF2C0] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span className="text-[10px] tracking-wider uppercase">L-BAND SYNC</span>
            </div>

            {/* Prev/Next Navigation */}
            <div className="flex items-center space-x-1 ml-2">
              <button
                onClick={handlePrev}
                className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-white/10 transition-colors cursor-pointer"
                title="Previous Satellite"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleNext}
                className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-white/10 transition-colors cursor-pointer"
                title="Next Satellite"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* 2. Satellite Title & Identity */}
        <div className="flex items-start justify-between mt-4 mb-4">
          <div>
            <h3 className="font-instrument text-3xl text-white text-glow">
              {satellite.id}
            </h3>
            <p className="text-xs font-mono text-white/60 mt-0.5">
              {satellite.name}
            </p>
          </div>
          <div className="px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-950/60 text-[#6FF2C0] border border-emerald-500/40">
            {satellite.type} ORBIT
          </div>
        </div>

        {/* 3. Telemetry Parameter Badges */}
        <div className="grid grid-cols-3 gap-2.5 text-left mb-4">
          <div className="p-2.5 rounded-xl bg-black/50 border border-white/10 font-mono">
            <div className="text-[9px] text-white/40 uppercase">ORBIT RESIDUAL</div>
            <div className="text-sm font-bold text-[#6FF2C0] mt-0.5">
              {satellite.currentOrbitResidual} m
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-black/50 border border-white/10 font-mono">
            <div className="text-[9px] text-white/40 uppercase">CLOCK BIAS</div>
            <div className="text-sm font-bold text-cyan-300 mt-0.5">
              {satellite.currentClockResidual} ns
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-black/50 border border-white/10 font-mono">
            <div className="text-[9px] text-white/40 uppercase">CONFIDENCE</div>
            <div className="text-sm font-bold text-white mt-0.5">
              {satellite.confidenceLevel}%
            </div>
          </div>
        </div>
      </div>

      {/* 4. Forecast Propagation Recharts Horizon */}
      <div className="flex-1 flex flex-col justify-end">
        <div className="flex items-center justify-between text-[10px] font-mono text-white/40 mb-1.5">
          <span>24H INFERENCE PROPAGATION</span>
          <span className="text-[#6FF2C0]">EPHEMERIS TIMeR-XL</span>
        </div>

        <div className="h-40 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis
                dataKey="timeOffset"
                stroke="rgba(255,255,255,0.3)"
                tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.5)', fontFamily: 'monospace' }}
                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
              />
              <YAxis
                stroke="rgba(255,255,255,0.3)"
                tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.5)', fontFamily: 'monospace' }}
                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="liquid-glass bg-[#060408]/98 border border-white/20 p-2.5 rounded-xl shadow-2xl text-[10px] font-mono">
                        <div className="text-white/70 font-semibold border-b border-white/10 pb-1 mb-1">
                          Horizon: {label}
                        </div>
                        <div className="text-[#6FF2C0]">
                          Orbit Residual: {payload[0]?.value} m
                        </div>
                        <div className="text-cyan-300">
                          Clock Bias: {payload[1]?.value} ns
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="orbitResidual"
                stroke="#6FF2C0"
                fill="rgba(111, 242, 192, 0.08)"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="clockResidual"
                stroke="#38BDF8"
                strokeWidth={1.5}
                strokeDasharray="3 3"
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 5. Footer Quick Coordinates */}
      <div className="pt-3 border-t border-white/15 flex items-center justify-between text-[11px] font-mono text-white/50">
        <div>ELEV: {satellite.elevationDeg}° &bull; AZIM: {satellite.azimuthDeg}°</div>
        <div className="text-emerald-400">SNR: {satellite.snrDbHz} dB-Hz</div>
      </div>
    </div>
  );
};
