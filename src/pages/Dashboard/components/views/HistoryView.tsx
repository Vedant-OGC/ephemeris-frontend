import React, { useState } from 'react';
import { ForecastLog } from '../../types';
import { History, Download, Search, Filter, CheckCircle2, Clock, Calendar, FileText } from 'lucide-react';

interface HistoryViewProps {
  forecasts: ForecastLog[];
}

export const HistoryView: React.FC<HistoryViewProps> = ({ forecasts }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<'ALL' | 'GEO' | 'IGSO'>('ALL');

  const filtered = forecasts.filter((f) => {
    const matchesSearch =
      f.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.timeUtc.includes(searchTerm);
    const matchesType = selectedType === 'ALL' || f.satType === selectedType;
    return matchesSearch && matchesType;
  });

  const exportForecastHistory = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'ID,Time (UTC),Satellite Type,Model,Rows Processed,Status,Execution Time (ms),RMS Error (m)\n' +
      forecasts
        .map(
          (f) =>
            `${f.id},${f.timeUtc},${f.satType},${f.model},${f.rows},${f.status},${f.executionTimeMs},${f.rmsErrorMeters}`
        )
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ephemeris_navic_forecast_history_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 select-none animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 liquid-glass bg-[#060408]/95 border border-white/10 rounded-2xl p-6 shadow-2xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full liquid-glass border border-white/10 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-[10px] font-mono tracking-widest text-[#6FF2C0] uppercase">
              EPHEMERIS LOG ARCHIVE
            </span>
          </div>
          <h2 className="font-instrument text-3xl md:text-4xl text-white text-glow">
            Prediction Archive &amp; Export Audit
          </h2>
          <p className="text-xs text-white/60 font-inter mt-1">
            Complete historical log of NavIC spatio-temporal inference runs and generated SP3 trajectory archives.
          </p>
        </div>

        <button
          onClick={exportForecastHistory}
          className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-[#6FF2C0] border border-white/10 rounded-full text-xs font-mono flex items-center space-x-2 transition-all cursor-pointer button-glow"
        >
          <Download className="w-4 h-4" />
          <span>Export Audit (CSV/SP3)</span>
        </button>
      </div>

      {/* Main Table Card */}
      <div className="liquid-glass bg-[#060408]/95 border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4">
        {/* Search & Filter */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-3.5 h-3.5 text-white/40 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search forecast ID, model, or UTC timestamp..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-black/60 border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs font-mono text-white placeholder-white/40 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center space-x-1 bg-black/60 p-1 rounded-lg border border-white/10 text-xs font-mono">
            {(['ALL', 'GEO', 'IGSO'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setSelectedType(t)}
                className={`px-3 py-1 rounded transition-colors cursor-pointer ${
                  selectedType === t
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
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="text-[10px] text-white/40 uppercase border-b border-white/10">
              <tr>
                <th className="pb-2">INFERENCE ID</th>
                <th className="pb-2">TIME (UTC)</th>
                <th className="pb-2">ORBIT TYPE</th>
                <th className="pb-2">MODEL ARCHITECTURE</th>
                <th className="pb-2">SYNTHETIC VECTORS</th>
                <th className="pb-2 text-right">LATENCY</th>
                <th className="pb-2 text-right">RMS ERROR</th>
                <th className="pb-2 text-right">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-[11px]">
              {filtered.map((row) => (
                <tr key={row.id} className="hover:bg-white/[0.03] transition-colors">
                  <td className="py-2.5 font-bold text-white flex items-center space-x-2">
                    <FileText className="w-3.5 h-3.5 text-[#6FF2C0]" />
                    <span>{row.id}</span>
                  </td>
                  <td className="py-2.5 text-white/70">{row.timeUtc}</td>
                  <td className="py-2.5">
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-white/5 text-cyan-300 border border-white/10">
                      {row.satType}
                    </span>
                  </td>
                  <td className="py-2.5 text-white/90 font-medium">{row.model}</td>
                  <td className="py-2.5 text-white/60">{row.rows.toLocaleString()} vectors</td>
                  <td className="py-2.5 text-right text-white/50">{row.executionTimeMs}ms</td>
                  <td className="py-2.5 text-right text-[#6FF2C0] font-bold">{row.rmsErrorMeters} m</td>
                  <td className="py-2.5 text-right">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/40 text-[#6FF2C0] border border-emerald-500/30">
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
