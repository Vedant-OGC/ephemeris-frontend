import React, { useState, useEffect } from 'react';
import { Radio, Network, Cpu, Split, Gauge, ArrowRight, CheckCircle2, ChevronRight } from 'lucide-react';

interface PipelineStage {
  id: string;
  step: string;
  name: string;
  subtitle: string;
  tensor: string;
  metric: string;
  icon: React.ElementType;
  description: string;
  color: string;
}

export const ArchitectureFlow: React.FC = () => {
  const [activeStage, setActiveStage] = useState<number>(0);
  const [pulsePos, setPulsePos] = useState<number>(0);

  const stages: PipelineStage[] = [
    {
      id: 'obs',
      step: '01',
      name: 'REAL OBSERVATIONS',
      subtitle: '7 Days Telemetry Input',
      tensor: 'X ∈ ℝ^(145 × 4)',
      metric: 'Δt = 70 min',
      icon: Radio,
      description: 'Raw sparse ground station telemetry for NavIC satellite coordinates [X, Y, Z] and atomic clock bias [Δt].',
      color: '#FFFFFF',
    },
    {
      id: 'gat',
      step: '02',
      name: 'GAT',
      subtitle: 'Graph Attention Network',
      tensor: 'A_ij = Softmax(e_ij)',
      metric: '4 Nodes Coupled',
      icon: Network,
      description: 'Learns dynamic spatio-temporal dependencies across spatial axes and clock drift. Inter-axis coupling weights.',
      color: '#6FF2C0',
    },
    {
      id: 'decomp',
      step: '03',
      name: 'DECOMPOSITION',
      subtitle: 'Moving Avg & Harmonic Kernel',
      tensor: 'X = X_trend + X_season + X_res',
      metric: '3 Isolated Layers',
      icon: Split,
      description: 'Isolates predictable orbital secular drifts and periodic orbital harmonics from stochastic white noise.',
      color: '#38BDF8',
    },
    {
      id: 'autoformer',
      step: '04',
      name: 'AUTOFORMER',
      subtitle: 'Auto-Correlation Mechanism',
      tensor: 'O(L log L) Complexity',
      metric: 'Transfer Weights',
      icon: Cpu,
      description: 'Deep series attention mechanism with sub-series level aggregation and generative synthetic pre-training.',
      color: '#A78BFA',
    },
    {
      id: 'forecast',
      step: '05',
      name: '24H FORECAST',
      subtitle: 'Continuous Prediction Horizon',
      tensor: 'Ŷ ∈ ℝ^(21 × 4)',
      metric: 'RMSE < 0.28m',
      icon: Gauge,
      description: 'Stable 24-hour ephemeris position & clock error trajectory forecast with strict Gaussian residual guarantee.',
      color: '#6FF2C0',
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setPulsePos((prev) => (prev + 1) % 100);
    }, 40);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full flex flex-col items-center">
      {/* Header Info */}
      <div className="w-full flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-xs font-mono tracking-widest text-white/70 uppercase">
            CONTINUOUS SCIENTIFIC PIPELINE STREAM
          </span>
        </div>
        <span className="text-[11px] font-mono text-white/40">
          STAGE {stages[activeStage].step} / 05 ACTIVE
        </span>
      </div>

      {/* Horizontal Flowing Track */}
      <div className="relative w-full rounded-2xl liquid-glass border border-white/10 bg-[#040609]/90 p-4 sm:p-6 shadow-2xl overflow-x-auto scrollbar-hide">
        {/* Animated Connecting Laser / Particle Stream */}
        <div className="hidden lg:block absolute top-[52px] left-12 right-12 h-[2px] bg-white/10 pointer-events-none z-0">
          <div
            className="absolute top-0 h-full bg-gradient-to-r from-transparent via-emerald-400 to-transparent w-36 -translate-x-1/2 transition-all duration-75 shadow-[0_0_12px_#6FF2C0]"
            style={{ left: `${pulsePos}%` }}
          />
        </div>

        {/* Stages Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 relative z-10 min-w-[700px] lg:min-w-0">
          {stages.map((stg, idx) => {
            const Icon = stg.icon;
            const isSelected = activeStage === idx;

            return (
              <div
                key={stg.id}
                onClick={() => setActiveStage(idx)}
                className={`relative group rounded-xl p-4 cursor-pointer transition-all duration-300 border flex flex-col justify-between ${isSelected
                    ? 'bg-white/[0.07] border-emerald-400/60 shadow-[0_0_20px_rgba(111,242,192,0.15)] scale-[1.02]'
                    : 'bg-white/[0.02] border-white/10 hover:border-white/30 hover:bg-white/[0.04]'
                  }`}
              >
                {/* Top Badge */}
                <div className="flex items-center justify-between mb-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center border transition-colors"
                    style={{
                      borderColor: isSelected ? stg.color : 'rgba(255,255,255,0.15)',
                      backgroundColor: isSelected ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.03)',
                    }}
                  >
                    <Icon className="w-4 h-4" style={{ color: stg.color }} />
                  </div>
                  <span className="text-[10px] font-mono tracking-widest text-white/40">
                    {stg.step}
                  </span>
                </div>

                {/* Stage Title & Subtitle */}
                <div>
                  <h4 className="text-xs font-mono font-bold text-white tracking-wider">
                    {stg.name}
                  </h4>
                  <p className="text-[10px] font-mono text-white/50 mt-0.5">
                    {stg.subtitle}
                  </p>
                </div>

                {/* Scientific Instrument Spec Readout */}
                <div className="mt-4 pt-3 border-t border-white/10 space-y-1">
                  <div className="text-[9px] font-mono text-white/40 uppercase">Tensor Dimension</div>
                  <div className="text-[11px] font-mono text-emerald-300 font-medium truncate">
                    {stg.tensor}
                  </div>
                  <div className="text-[10px] font-mono text-cyan-400 mt-1">
                    {stg.metric}
                  </div>
                </div>

                {/* Active Indicator Bar */}
                {isSelected && (
                  <div className="absolute -bottom-[1px] left-4 right-4 h-[2px] bg-emerald-400 rounded-full shadow-[0_0_8px_#6FF2C0]" />
                )}
              </div>
            );
          })}
        </div>

        {/* Selected Stage Detail Drawer */}
        <div className="mt-5 p-4 rounded-xl bg-black/60 border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 mt-0.5">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-white uppercase">
                  {stages[activeStage].name} SPECIFICATION
                </span>
                <span className="text-[10px] font-mono text-emerald-400">
                  [{stages[activeStage].tensor}]
                </span>
              </div>
              <p className="text-xs text-white/70 font-inter mt-1 leading-relaxed max-w-2xl">
                {stages[activeStage].description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-center">
            <button
              onClick={() => setActiveStage((prev) => (prev > 0 ? prev - 1 : stages.length - 1))}
              className="px-3 py-1.5 rounded text-xs font-mono bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              Prev
            </button>
            <button
              onClick={() => setActiveStage((prev) => (prev + 1) % stages.length)}
              className="px-3 py-1.5 rounded text-xs font-mono bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 transition-colors flex items-center gap-1"
            >
              <span>Next Stage</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
