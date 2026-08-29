import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { Layers } from 'lucide-react';

interface SatConfig {
  id: string;
  color: string;
  name: string;
}

interface OrbitResidualAllChartProps {
  onSelectSatellite?: (id: string) => void;
  selectedSatelliteId?: string;
  chartData: Record<string, string | number>[];
  satConfigs: SatConfig[];
}

export const OrbitResidualAllChart: React.FC<OrbitResidualAllChartProps> = ({
  onSelectSatellite,
  selectedSatelliteId,
  chartData,
  satConfigs,
}) => {
  return (
    <div className="liquid-glass bg-[#060408]/95 border border-white/10 rounded-2xl p-6 flex flex-col justify-between shadow-2xl w-full select-none">
      <div>
        {/* Header with Satellite Chips */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4 mb-4">
          <div>
            <div className="text-[10px] uppercase font-mono tracking-widest text-[#6FF2C0] font-semibold flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#6FF2C0]" />
              <span>ORBIT RESIDUAL TELEMETRY (MULTI-CHANNEL WAVEFORMS)</span>
            </div>
            <h3 className="font-instrument text-2xl text-white mt-0.5">
              Radial &amp; Periodic Harmonic Drift (All NavIC Satellites)
            </h3>
          </div>

          <div className="flex items-center space-x-3">
            <div className="hidden md:flex flex-wrap items-center gap-1.5 font-mono text-[10px]">
              {satConfigs.map((sat) => {
                const isSelected = selectedSatelliteId === sat.id;
                return (
                  <button
                    key={sat.id}
                    onClick={() => onSelectSatellite && onSelectSatellite(sat.id)}
                    className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-white/15 text-white font-bold ring-1 ring-[#6FF2C0]'
                        : 'text-white/50 hover:text-white hover:bg-white/5 border border-white/5'
                    }`}
                  >
                    <span
                      className="w-2 h-2 rounded-full inline-block"
                      style={{ backgroundColor: sat.color }}
                    />
                    <span>{sat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Multi-line Recharts Chart */}
        <div className="h-64 sm:h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis
                dataKey="time"
                stroke="rgba(255,255,255,0.3)"
                tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.5)', fontFamily: 'monospace' }}
                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
              />
              <YAxis
                domain={[-0.6, 0.6]}
                ticks={[-0.6, -0.3, 0, 0.3, 0.6]}
                stroke="rgba(255,255,255,0.3)"
                tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.5)', fontFamily: 'monospace' }}
                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="liquid-glass bg-[#060408]/98 border border-white/20 p-3 rounded-xl shadow-2xl text-xs font-mono max-w-sm">
                        <div className="text-white/60 font-semibold border-b border-white/10 pb-1 mb-2 flex justify-between">
                          <span>Timeline Horizon:</span>
                          <span className="text-[#6FF2C0] font-bold">{label}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                          {payload.map((entry: any) => (
                            <div key={entry.dataKey} className="flex items-center justify-between space-x-2">
                              <div className="flex items-center space-x-1.5">
                                <span
                                  className="w-2 h-2 rounded-full inline-block"
                                  style={{ backgroundColor: entry.stroke }}
                                />
                                <span className="text-white/80">{entry.dataKey}:</span>
                              </div>
                              <span className="font-bold" style={{ color: entry.stroke }}>
                                {entry.value} m
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <ReferenceLine y={0} stroke="rgba(255,255,255,0.2)" strokeWidth={1} />
              <ReferenceLine y={0.35} stroke="#FBBF24" strokeDasharray="3 3" opacity={0.3} />
              <ReferenceLine y={-0.35} stroke="#FBBF24" strokeDasharray="3 3" opacity={0.3} />

              {satConfigs.map((sat) => {
                const isHighlighted = selectedSatelliteId === sat.id;
                return (
                  <Line
                    key={sat.id}
                    type="monotone"
                    dataKey={sat.id}
                    stroke={sat.color}
                    strokeWidth={isHighlighted ? 2.5 : 1.2}
                    dot={false}
                    activeDot={{ r: 4, stroke: '#fff', strokeWidth: 1.5 }}
                    opacity={selectedSatelliteId ? (isHighlighted ? 1 : 0.35) : 0.85}
                  />
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
