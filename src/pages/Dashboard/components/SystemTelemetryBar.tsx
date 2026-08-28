import React from 'react';
import { SystemTelemetry } from '../types';
import { RefreshCw, Activity, ShieldCheck, Cpu } from 'lucide-react';

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
    <footer className="h-14 bg-[#050608]/90 border-t border-white/20 px-4 md:px-8 flex items-center justify-between text-xs font-mono select-none backdrop-blur-xl z-20">
      {/* Left: Brand Identity & Live Status */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span className="font-semibold text-white tracking-wide">
            EPHEMERIS <span className="text-white/40 font-normal"></span>
          </span>
        </div>
        <span className="text-white/20 hidden sm:inline">&bull;</span>
        <span className="text-white/50 hidden sm:inline text-[11px]">
          Greedy Minds &bull; 2026
        </span>
      </div>

      {/* Center: Essential Telemetry Metrics */}
      <div className="hidden lg:flex items-center space-x-6 text-[11px] text-white/60">
        <div className="flex items-center space-x-1.5">
          <span className="text-white/40">ENGINE:</span>
          <span className="text-[#6FF2C0] font-semibold">TIMeR-XL 100×</span>
        </div>
        <span className="text-white/20">&bull;</span>
        <div className="flex items-center space-x-1.5">
          <span className="text-white/40">FIDELITY:</span>
          <span className="text-white font-medium">99.4% (FID 0.012)</span>
        </div>
        <span className="text-white/20">&bull;</span>
        <div className="flex items-center space-x-1.5">
          <span className="text-white/40">FLEET:</span>
          <span className="text-cyan-300 font-medium">8/8 NavIC Locked</span>
        </div>
        <span className="text-white/20">&bull;</span>
        <div className="flex items-center space-x-1.5">
          <span className="text-white/40">GPU:</span>
          <span className="text-white font-medium">{telemetry.gpuUsagePercent}%</span>
        </div>
        <span className="text-white/20">&bull;</span>
        <div className="flex items-center space-x-1.5">
          <span className="text-white/40">UPTIME:</span>
          <span className="text-white/80">{formatUptime(telemetry.uptimeSeconds)}</span>
        </div>
      </div>

      {/* Right: Ingest Epoch & Refresh Action */}
      <div className="flex items-center space-x-3">
        <div className="text-right hidden sm:block">
          <span className="text-white/40 text-[10px]">SYNC: </span>
          <span className="text-white/80 text-[11px] font-semibold">
            {telemetry.lastUpdatedUtc}
          </span>
        </div>

        <button
          onClick={onRefreshData}
          disabled={isRefreshing}
          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-[#6FF2C0] border border-white/15 transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-1.5 text-[11px]"
          title="Refresh Telemetry"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#6FF2C0]' : ''}`} />
          <span className="hidden md:inline">Sync</span>
        </button>
      </div>
    </footer>
  );
};
