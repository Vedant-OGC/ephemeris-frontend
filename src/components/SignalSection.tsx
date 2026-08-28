import React from 'react';
import { SignalDecompositionCanvas } from './SignalDecompositionCanvas';
import { SpatioTemporalGraph } from './SpatioTemporalGraph';
import { SyntheticDataTransferCanvas } from './SyntheticDataTransferCanvas';
import { ArchitectureFlow } from './ArchitectureFlow';
import { ForecastHorizonCanvas } from './ForecastHorizonCanvas';
import { NormalityDistributionCanvas } from './NormalityDistributionCanvas';
import { Database, Cpu, Activity, Compass, BarChart2 } from 'lucide-react';

export const SignalSection: React.FC = () => {
  return (
    <section
      id="signal"
      className="relative w-full min-h-screen bg-[#050608] technical-grid py-24 sm:py-32 px-4 sm:px-8 lg:px-12 text-white overflow-hidden"
    >
      {/* Background Radial Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-emerald-500/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-10 w-[600px] h-[400px] bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto space-y-28 relative z-10">
        
        {/* ================= SECTION 2 OPENING STATEMENT ================= */}
        <div className="text-center space-y-6 max-w-4xl mx-auto">
          {/* THE PROBLEM in IBM Plex Mono */}
          <div className="inline-block">
            <span className="font-mono text-xs tracking-[0.25em] text-emerald-400/90 uppercase px-3 py-1 rounded border border-emerald-500/20 bg-emerald-950/20">
              THE PROBLEM
            </span>
          </div>

          {/* Large Instrument Serif Heading */}
          <h2 className="font-instrument text-4xl sm:text-6xl md:text-7xl lg:text-[84px] leading-[0.95] tracking-tight text-white text-glow">
            The satellite does not send us the future.
          </h2>

          {/* Subtext with visual emphasis on "seven days" */}
          <p className="font-inter text-lg sm:text-2xl text-white/80 font-light max-w-2xl mx-auto leading-relaxed">
            We had{' '}
            <span className="font-medium text-[#6FF2C0] border-b border-[#6FF2C0]/50 pb-0.5 px-1 bg-emerald-950/30 rounded">
              seven days
            </span>{' '}
            of real observations.
          </p>

          <p className="font-mono text-xs text-white/50 tracking-wider">
            145 DISCRETE SATELLITE ERROR EPOCHS • EXTREME DATA SCARCITY
          </p>
        </div>

        {/* ================= 1. DATA VISUALIZATION & SIGNAL DECOMPOSITION ================= */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-white/10 pb-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 tracking-wider uppercase">
                <Activity className="w-4 h-4 text-emerald-400" />
                <span>01 / TELEMETRY DECOMPOSITION</span>
              </div>
              <h3 className="font-instrument text-3xl sm:text-4xl text-white mt-1">
                Decomposing the Chaotic Signal
              </h3>
            </div>
            <p className="text-xs font-mono text-white/50 max-w-md">
              Separating orbital secular drift, periodic harmonic resonance, and high-frequency stochastic noise.
            </p>
          </div>

          <SignalDecompositionCanvas />
        </div>

        {/* ================= 2. SPATIO-TEMPORAL GRAPH & TIMeR-XL SYNTHETIC TRANSFER ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Spatio-Temporal GAT (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 tracking-wider uppercase">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <span>02 / GRAPH ATTENTION</span>
              </div>
              <h3 className="font-instrument text-2xl sm:text-3xl text-white mt-1">
                Spatio-Temporal Coupling
              </h3>
            </div>
            <div className="rounded-2xl liquid-glass border border-white/10 overflow-hidden bg-[#030406]/95 shadow-xl">
              <SpatioTemporalGraph />
            </div>
          </div>

          {/* TIMeR-XL Synthetic Data Transfer (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 tracking-wider uppercase">
                <Database className="w-4 h-4 text-emerald-400" />
                <span>03 / SYNTHETIC DATA TRANSFER</span>
              </div>
              <h3 className="font-instrument text-2xl sm:text-3xl text-white mt-1">
                TIMeR-XL 100× Expansion
              </h3>
            </div>
            <SyntheticDataTransferCanvas />
          </div>
        </div>

        {/* ================= 3. ARCHITECTURE PIPELINE STREAM ================= */}
        <div id="architecture" className="space-y-6 pt-4">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="font-mono text-xs tracking-widest text-emerald-400 uppercase px-2.5 py-1 rounded bg-emerald-950/30 border border-emerald-500/20">
              04 / DEEP LEARNING ARCHITECTURE
            </span>
            <h3 className="font-instrument text-3xl sm:text-5xl text-white text-glow">
              The EPHEMERIS Processing Stream
            </h3>
            <p className="font-inter text-xs sm:text-sm text-white/60">
              A continuous scientific pipeline from raw sparse telemetry to stable 24-hour predictive ephemeris.
            </p>
          </div>

          <ArchitectureFlow />
        </div>

        {/* ================= 4. FORECAST HORIZON (OBSERVED | PREDICTION) ================= */}
        <div className="space-y-6 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-white/10 pb-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 tracking-wider uppercase">
                <Compass className="w-4 h-4 text-emerald-400" />
                <span>05 / 24-HOUR FORECAST BOUNDARY</span>
              </div>
              <h3 className="font-instrument text-3xl sm:text-4xl text-white mt-1">
                Beyond the Observation Horizon
              </h3>
            </div>
            <p className="text-xs font-mono text-white/50 max-w-md">
              Everything before the boundary is real telemetry; everything after is continuous deep neural forecast.
            </p>
          </div>

          <ForecastHorizonCanvas />
        </div>

        {/* ================= 5. NORMALITY — THE FINAL VISUAL ================= */}
        <div className="space-y-6 pt-4">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="font-mono text-xs tracking-widest text-[#6FF2C0] uppercase px-2.5 py-1 rounded bg-emerald-950/40 border border-[#6FF2C0]/30">
              06 / STATISTICAL CLIMAX
            </span>
            <h3 className="font-instrument text-3xl sm:text-5xl text-white text-glow">
              Normality &amp; Residual Whiteness
            </h3>
            <p className="font-inter text-xs sm:text-sm text-white/60">
              Demonstrating that the predictive model has captured all deterministic structures, leaving only zero-mean Gaussian noise.
            </p>
          </div>

          <NormalityDistributionCanvas />
        </div>

      </div>
    </section>
  );
};
