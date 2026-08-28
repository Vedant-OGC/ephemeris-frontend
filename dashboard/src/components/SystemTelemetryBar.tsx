import React from 'react';
import { SystemTelemetry } from '../types';
import { RefreshCw, CheckCircle2, Cpu, Server, Activity } from 'lucide-react';

interface SystemTelemetryBarProps {
  telemetry: SystemTelemetry;
  onRefreshData: () => void;
  isRefreshing?: boolean;
}

export const SystemTelemetryBar: React.FC<SystemTelemetryBarProps> = ({
  telemetry,
  onRefreshData,
  isRefreshing = false,
}) => {
  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${mins}m`;
  };

  return (
    <footer className="h-14 bg-[#060408]/98 border-t border-white/10 px-4 md:px-8 flex items-center justify-between text-xs font-mono select-none overflow-x-auto backdrop-blur-xl">
      <div className="flex items-center space-x-6 md:space-x-8 min-w-max">
        {/* 1. GPU ACCELERATION */}
        <div className="flex items-center space-x-3">
          <div className="text-[10px] text-white/40 uppercase tracking-wider">
            GPU INFERENCE
          </div>
          <div className="flex items-center space-x-2 text-white/90">
            <span className="font-semibold text-[11px]">{telemetry.gpuModel}</span>
            {/* Usage Progress Bar */}
            <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden border border-white/10">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full transition-all duration-500"
                style={{ width: `${telemetry.gpuUsagePercent}%` }}
              />
            </div>
            <span className="text-[10px] text-[#6FF2C0] font-bold">
              {telemetry.gpuUsagePercent}%
            </span>
          </div>
        </div>

        {/* 2. LOADED MODELS */}
        <div className="flex items-center space-x-3 border-l border-white/10 pl-6">
          <div className="text-[10px] text-white/40 uppercase tracking-wider">
            DEEP LEARNING PIPELINE
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1.5">
              <span className="text-white/80 font-medium text-[11px]">TIMeR-XL 100×</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span className="text-[9px] text-[#6FF2C0] font-semibold">Ready</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="text-white/80 font-medium text-[11px]">GAT Spatio-Temporal</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span className="text-[9px] text-[#6FF2C0] font-semibold">Active</span>
            </div>
          </div>
        </div>

        {/* 3. UPTIME */}
        <div className="flex items-center space-x-2.5 border-l border-white/10 pl-6">
          <div className="text-[10px] text-white/40 uppercase tracking-wider">
            UPTIME
          </div>
          <span className="text-white font-semibold">
            {formatUptime(telemetry.uptimeSeconds)}
          </span>
        </div>

        {/* 4. TRANSFER STATUS */}
        <div className="flex items-center space-x-2.5 border-l border-white/10 pl-6">
          <div className="text-[10px] text-white/40 uppercase tracking-wider">
            TRANSFER FIDELITY
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span className="text-[#6FF2C0] font-semibold">99.4% (FID: 0.012)</span>
          </div>
        </div>
      </div>

      {/* 5. DATA INGESTION & Refresh Button */}
      <div className="flex items-center space-x-3 pl-6 border-l border-white/10">
        <div className="text-right">
          <div className="text-[9px] text-white/40 uppercase tracking-wider">
            TELEMETRY EPOCH
          </div>
          <div className="text-[10px] text-white/80 font-semibold">
            {telemetry.lastUpdatedUtc}
          </div>
        </div>

        <button
          onClick={onRefreshData}
          disabled={isRefreshing}
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-[#6FF2C0] border border-white/10 transition-colors disabled:opacity-50 cursor-pointer"
          title="Manual Telemetry Ingest & Re-compute"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#6FF2C0]' : ''}`} />
        </button>
      </div>
    </footer>
  );
};
