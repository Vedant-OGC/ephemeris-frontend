import React from 'react';
import { SystemTelemetry } from '../../types';
import { Activity, Cpu, Server, HardDrive, Wifi, Zap, CheckCircle2, ShieldCheck, Thermometer } from 'lucide-react';

interface HealthViewProps {
  telemetry: SystemTelemetry;
}

export const HealthView: React.FC<HealthViewProps> = ({ telemetry }) => {
  return (
    <div className="space-y-6 select-none animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 liquid-glass bg-[#060408]/95 border border-white/10 rounded-2xl p-6 shadow-2xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full liquid-glass border border-white/10 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-[10px] font-mono tracking-widest text-[#6FF2C0] uppercase">
              HARDWARE &amp; SYNTHETIC FIDELITY
            </span>
          </div>
          <h2 className="font-instrument text-3xl md:text-4xl text-white text-glow">
            Infrastructure &amp; Transfer Health
          </h2>
          <p className="text-xs text-white/60 font-inter mt-1">
            GPU compute allocation, TIMeR-XL Fréchet Inception Distance (FID), and continuous validation telemetry.
          </p>
        </div>
      </div>

      {/* Grid of hardware metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* GPU */}
        <div className="liquid-glass bg-[#060408]/95 border border-white/10 rounded-2xl p-4 shadow-xl space-y-3 font-mono">
          <div className="flex items-center justify-between text-xs text-white/50">
            <span className="flex items-center space-x-1.5 text-[#6FF2C0]">
              <Zap className="w-4 h-4" />
              <span>NVIDIA GPU</span>
            </span>
            <span className="text-emerald-400 font-bold">54°C</span>
          </div>
          <div className="text-2xl font-bold text-white">{telemetry.gpuUsagePercent}%</div>
          <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${telemetry.gpuUsagePercent}%` }} />
          </div>
          <div className="text-[10px] text-white/40 flex justify-between">
            <span>VRAM: {telemetry.gpuMemoryUsedGb} GB / {telemetry.gpuMemoryTotalGb} GB</span>
            <span>CUDA 12.4</span>
          </div>
        </div>

        {/* CPU */}
        <div className="liquid-glass bg-[#060408]/95 border border-white/10 rounded-2xl p-4 shadow-xl space-y-3 font-mono">
          <div className="flex items-center justify-between text-xs text-white/50">
            <span className="flex items-center space-x-1.5 text-cyan-300">
              <Cpu className="w-4 h-4" />
              <span>HOST COMPUTE</span>
            </span>
            <span className="text-white/80 font-bold">4.2 GHz</span>
          </div>
          <div className="text-2xl font-bold text-white">{telemetry.cpuUsagePercent}%</div>
          <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
            <div className="bg-cyan-400 h-full rounded-full" style={{ width: `${telemetry.cpuUsagePercent}%` }} />
          </div>
          <div className="text-[10px] text-white/40 flex justify-between">
            <span>Load: 0.42, 0.38, 0.35</span>
            <span>16 Cores</span>
          </div>
        </div>

        {/* RAM */}
        <div className="liquid-glass bg-[#060408]/95 border border-white/10 rounded-2xl p-4 shadow-xl space-y-3 font-mono">
          <div className="flex items-center justify-between text-xs text-white/50">
            <span className="flex items-center space-x-1.5 text-[#A78BFA]">
              <HardDrive className="w-4 h-4" />
              <span>SYSTEM MEMORY</span>
            </span>
            <span className="text-white/80 font-bold">DDR5</span>
          </div>
          <div className="text-2xl font-bold text-white">{telemetry.ramUsagePercent}%</div>
          <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
            <div className="bg-purple-400 h-full rounded-full" style={{ width: `${telemetry.ramUsagePercent}%` }} />
          </div>
          <div className="text-[10px] text-white/40 flex justify-between">
            <span>16.6 GB / 64.0 GB</span>
            <span>ECC Verified</span>
          </div>
        </div>

        {/* Transfer Fidelity */}
        <div className="liquid-glass bg-[#060408]/95 border border-white/10 rounded-2xl p-4 shadow-xl space-y-3 font-mono">
          <div className="flex items-center justify-between text-xs text-white/50">
            <span className="flex items-center space-x-1.5 text-[#6FF2C0]">
              <Activity className="w-4 h-4" />
              <span>TRANSFER FIDELITY</span>
            </span>
            <span className="text-emerald-400 font-bold">FID 0.012</span>
          </div>
          <div className="text-2xl font-bold text-[#6FF2C0]">99.4%</div>
          <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-400 h-full rounded-full" style={{ width: '99.4%' }} />
          </div>
          <div className="text-[10px] text-white/40 flex justify-between">
            <span>100× Expansion</span>
            <span>No Mode Collapse</span>
          </div>
        </div>
      </div>

      {/* Model Pipelines Status */}
      <div className="liquid-glass bg-[#060408]/95 border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4">
        <h3 className="text-xs font-mono font-bold tracking-wider text-white uppercase flex items-center space-x-2 border-b border-white/10 pb-3">
          <Server className="w-4 h-4 text-[#6FF2C0]" />
          <span>ACTIVE NEURAL PIPELINES IN CUDA VRAM</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
          {telemetry.models.map((model, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm">{model.name}</span>
                <span className="px-2 py-0.5 rounded text-[9px] bg-emerald-950/40 text-[#6FF2C0] border border-emerald-500/30">
                  {model.status}
                </span>
              </div>
              <div className="text-[11px] text-white/60 font-inter">{model.type}</div>
              <div className="text-[10px] text-white/40 flex justify-between border-t border-white/10 pt-2">
                <span>Version: {model.version}</span>
                <span>VRAM: {model.vramMb} MB</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
