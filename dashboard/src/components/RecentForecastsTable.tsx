import React from 'react';
import { ForecastLog, DashboardTab } from '../types';
import { ArrowRight, Activity } from 'lucide-react';

interface RecentForecastsTableProps {
  forecasts: ForecastLog[];
  onNavigateTab: (tab: DashboardTab) => void;
  onSelectForecast?: (forecast: ForecastLog) => void;
}

export const RecentForecastsTable: React.FC<RecentForecastsTableProps> = ({
  forecasts,
  onNavigateTab,
  onSelectForecast,
}) => {
  return (
    <div className="liquid-glass bg-[#060408]/95 border border-white/20 hover:border-white/30 rounded-2xl p-6 flex flex-col justify-between shadow-2xl h-[320px] select-none transition-all">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/15 pb-3 mb-3">
          <div className="text-[10px] uppercase font-mono tracking-widest text-white/50 font-medium flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#6FF2C0]" />
            <span>RECENT 24H INFERENCES</span>
          </div>
          <button
            onClick={() => onNavigateTab('history')}
            className="text-xs font-mono text-[#6FF2C0] hover:text-emerald-300 hover:underline transition-colors cursor-pointer"
          >
            Full Log &rarr;
          </button>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-[10px] font-mono text-white/40 border-b border-white/10 uppercase">
                <th className="pb-2 font-medium">TIME</th>
                <th className="pb-2 font-medium">ORBIT</th>
                <th className="pb-2 font-medium">MODEL ARCHITECTURE</th>
                <th className="pb-2 font-medium text-right">RMS (m)</th>
                <th className="pb-2 font-medium text-right">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono text-[11px]">
              {forecasts.slice(0, 5).map((row) => (
                <tr
                  key={row.id}
                  onClick={() => onSelectForecast && onSelectForecast(row)}
                  className="hover:bg-white/[0.04] cursor-pointer transition-colors group"
                >
                  <td className="py-2 text-white/70">{row.timeUtc}</td>
                  <td className="py-2">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-white/5 text-cyan-300 border border-white/10">
                      {row.satType}
                    </span>
                  </td>
                  <td className="py-2 text-white/90 group-hover:text-[#6FF2C0] transition-colors font-medium">
                    {row.model}
                  </td>
                  <td className="py-2 text-[#6FF2C0] text-right font-bold">
                    {row.rmsErrorMeters}m
                  </td>
                  <td className="py-2 text-right">
                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] bg-emerald-950/40 text-[#6FF2C0] border border-emerald-500/30">
                      <span>Inferred</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Action */}
      <div className="pt-3 border-t border-white/15">
        <button
          onClick={() => onNavigateTab('history')}
          className="w-full py-2 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-xs font-mono text-white/80 hover:text-white flex items-center justify-center space-x-2 transition-all cursor-pointer group"
        >
          <span>Review Forecast History</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-[#6FF2C0]" />
        </button>
      </div>
    </div>
  );
};
