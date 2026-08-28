import React from 'react';
import { Radio, Activity, Orbit, Clock, Calendar, CheckCircle2, ShieldCheck, Compass, Sparkles } from 'lucide-react';
import { SystemTelemetry } from '../types';

interface MetricCardsProps {
  telemetry: SystemTelemetry;
  lastPredictionTime: string;
  lastPredictionDate: string;
}

export const MetricCards: React.FC<MetricCardsProps> = ({
  telemetry,
  lastPredictionTime,
  lastPredictionDate,
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 select-none">
      {/* 1. NAVIC SATELLITES */}
      <div className="liquid-glass bg-[#060408]/90 border border-white/10 rounded-2xl p-4 flex items-start justify-between relative overflow-hidden group hover:border-emerald-500/40 transition-all shadow-xl">
        <div className="space-y-1">
          <div className="text-[10px] uppercase font-mono tracking-widest text-white/50">
            NAVIC FLEET
          </div>
          <div className="text-2xl font-bold font-mono text-white tracking-tight">
            {telemetry.totalSatellites} <span className="text-xs font-normal text-white/40">SATS</span>
          </div>
          <div className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>3 GEO + 5 GSO</span>
          </div>
        </div>
        <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-[#6FF2C0]">
          <Orbit className="w-4 h-4" />
        </div>
      </div>

      {/* 2. ACTIVE INFERENCES */}
      <div className="liquid-glass bg-[#060408]/90 border border-white/10 rounded-2xl p-4 flex items-start justify-between relative overflow-hidden group hover:border-cyan-500/40 transition-all shadow-xl">
        <div className="space-y-1">
          <div className="text-[10px] uppercase font-mono tracking-widest text-white/50">
            24H INFERENCES
          </div>
          <div className="text-2xl font-bold font-mono text-cyan-300 tracking-tight">
            {telemetry.activeForecasts} <span className="text-xs font-normal text-cyan-400/60">CHANNELS</span>
          </div>
          <div className="text-[10px] text-white/50 font-mono">
            TIMeR-XL 100× Active
          </div>
        </div>
        <div className="p-2 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-400">
          <Activity className="w-4 h-4" />
        </div>
      </div>

      {/* 3. RADIAL ORBIT ERROR */}
      <div className="liquid-glass bg-[#060408]/90 border border-white/10 rounded-2xl p-4 flex items-start justify-between relative overflow-hidden group hover:border-emerald-500/40 transition-all shadow-xl">
        <div className="space-y-1">
          <div className="text-[10px] uppercase font-mono tracking-widest text-white/50">
            RADIAL RMSE
          </div>
          <div className="text-2xl font-bold font-mono text-[#6FF2C0] tracking-tight flex items-baseline space-x-1">
            <span>{telemetry.avgOrbitError.toFixed(2)}</span>
            <span className="text-xs font-semibold text-[#6FF2C0]/80">m</span>
          </div>
          <div className="text-[10px] text-white/50 font-mono">
            Sub-decimeter error
          </div>
        </div>
        <div className="p-2 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-[#6FF2C0]">
          <Compass className="w-4 h-4" />
        </div>
      </div>

      {/* 4. ATOMIC CLOCK ERROR */}
      <div className="liquid-glass bg-[#060408]/90 border border-white/10 rounded-2xl p-4 flex items-start justify-between relative overflow-hidden group hover:border-cyan-500/40 transition-all shadow-xl">
        <div className="space-y-1">
          <div className="text-[10px] uppercase font-mono tracking-widest text-white/50">
            CLOCK BIAS RMSE
          </div>
          <div className="text-2xl font-bold font-mono text-cyan-300 tracking-tight flex items-baseline space-x-1">
            <span>{telemetry.avgClockError.toFixed(2)}</span>
            <span className="text-xs font-semibold text-cyan-400/80">ns</span>
          </div>
          <div className="text-[10px] text-white/50 font-mono">
            Rubidium flicker isolated
          </div>
        </div>
        <div className="p-2 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-400">
          <Clock className="w-4 h-4" />
        </div>
      </div>

      {/* 5. LAST EPOCH INGEST */}
      <div className="liquid-glass bg-[#060408]/90 border border-white/10 rounded-2xl p-4 flex items-start justify-between relative overflow-hidden group hover:border-white/30 transition-all shadow-xl">
        <div className="space-y-1">
          <div className="text-[10px] uppercase font-mono tracking-widest text-white/50">
            EPOCH HORIZON
          </div>
          <div className="text-xl font-bold font-mono text-white tracking-tight">
            24 Hours
          </div>
          <div className="text-[10px] text-white/50 font-mono">
            Δt = 70 min (145 Epochs)
          </div>
        </div>
        <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/70">
          <Calendar className="w-4 h-4" />
        </div>
      </div>

      {/* 6. NORMALITY / VALIDATION */}
      <div className="liquid-glass bg-[#060408]/90 border border-white/10 rounded-2xl p-4 flex items-start justify-between relative overflow-hidden group hover:border-emerald-500/40 transition-all shadow-xl">
        <div className="space-y-1">
          <div className="text-[10px] uppercase font-mono tracking-widest text-white/50">
            VALIDATION NORM
          </div>
          <div className="text-2xl font-bold font-mono text-[#6FF2C0] tracking-tight">
            p &gt; 0.05
          </div>
          <div className="text-[10px] text-emerald-400/80 font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-[#6FF2C0]" />
            <span>Gaussian Zero-Mean</span>
          </div>
        </div>
        <div className="p-2 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-[#6FF2C0]">
          <ShieldCheck className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
};
