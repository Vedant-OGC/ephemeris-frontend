import React, { useState } from 'react';
import { Settings, Server, Cpu, Database, Save, CheckCircle2, Shield, Radio, Sparkles } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const [fastApiEndpoint, setFastApiEndpoint] = useState('http://localhost:8000/api/v1/ephemeris');
  const [precisionMode, setPrecisionMode] = useState<'FP16' | 'BF16' | 'FP32'>('BF16');
  const [coordFrame, setCoordFrame] = useState<'ITRF2020' | 'WGS84' | 'GTRF'>('ITRF2020');
  const [ingestInterval, setIngestInterval] = useState<number>(5);
  const [autoRecompute, setAutoRecompute] = useState<boolean>(true);
  const [saved, setSaved] = useState<boolean>(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 select-none animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 liquid-glass bg-[#060408]/95 border border-white/10 rounded-2xl p-6 shadow-2xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full liquid-glass border border-white/10 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-[10px] font-mono tracking-widest text-[#6FF2C0] uppercase">
              MODEL HYPERPARAMETERS & RUNTIME
            </span>
          </div>
          <h2 className="font-instrument text-3xl md:text-4xl text-white text-glow">
            EPHEMERIS Engine Configuration
          </h2>
          <p className="text-xs text-white/60 font-inter mt-1">
            CUDA microservices, TIMeR-XL synthetic generation parameters, and ITRF2020 geodetic frame mapping.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-6 py-2.5 bg-white text-black font-mono text-xs font-semibold rounded-full hover:bg-white/90 transition-all button-glow cursor-pointer flex items-center space-x-2"
        >
          <Save className="w-4 h-4" />
          <span>{saved ? 'PARAMETERS PERSISTED' : 'SAVE CONFIGURATION'}</span>
        </button>
      </div>

      {saved && (
        <div className="liquid-glass-emerald bg-emerald-950/40 p-4 rounded-2xl text-xs font-mono text-[#6FF2C0] flex items-center space-x-3 shadow-xl">
          <CheckCircle2 className="w-5 h-5 text-[#6FF2C0] shrink-0" />
          <span>EPHEMERIS hyperparameters successfully synchronized in CUDA VRAM.</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Backend & API Configuration */}
        <div className="liquid-glass bg-[#060408]/95 border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4">
          <h3 className="text-xs font-mono font-bold tracking-wider text-white uppercase flex items-center space-x-2 border-b border-white/10 pb-3">
            <Server className="w-4 h-4 text-[#6FF2C0]" />
            <span>INFERENCE API &amp; TELEMETRY INGEST</span>
          </h3>

          <div className="space-y-3.5 text-xs font-mono">
            <div>
              <label className="text-white/50 block mb-1.5">FASTAPI ENGINE ENDPOINT</label>
              <input
                type="text"
                value={fastApiEndpoint}
                onChange={(e) => setFastApiEndpoint(e.target.value)}
                className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-[#6FF2C0] focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-white/50 block mb-1.5">TELEMETRY INGEST INTERVAL</label>
              <select
                value={ingestInterval}
                onChange={(e) => setIngestInterval(Number(e.target.value))}
                className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value={1}>1 Second (High Rate Real-time)</option>
                <option value={5}>5 Seconds (Standard Telemetry)</option>
                <option value={15}>15 Seconds (Low Bandwidth)</option>
              </select>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <div>
                <div className="text-white font-semibold">Auto-Recompute on Orbit Anomaly</div>
                <div className="text-[10px] text-white/50">Trigger background GPU inference when residual exceeds threshold</div>
              </div>
              <input
                type="checkbox"
                checked={autoRecompute}
                onChange={(e) => setAutoRecompute(e.target.checked)}
                className="w-4 h-4 accent-[#6FF2C0] rounded cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Compute & Geodetic Reference */}
        <div className="liquid-glass bg-[#060408]/95 border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4">
          <h3 className="text-xs font-mono font-bold tracking-wider text-white uppercase flex items-center space-x-2 border-b border-white/10 pb-3">
            <Cpu className="w-4 h-4 text-[#6FF2C0]" />
            <span>CUDA ENGINE &amp; GEODETIC FRAMES</span>
          </h3>

          <div className="space-y-3.5 text-xs font-mono">
            <div>
              <label className="text-white/50 block mb-1.5">FLOATING POINT PRECISION</label>
              <div className="grid grid-cols-3 gap-2">
                {(['FP16', 'BF16', 'FP32'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPrecisionMode(p)}
                    className={`py-2 rounded-xl text-center border cursor-pointer ${precisionMode === p
                        ? 'bg-emerald-500/20 text-[#6FF2C0] border-emerald-500/40 font-bold'
                        : 'bg-black/40 border-white/10 text-white/60 hover:text-white'
                      }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-white/50 block mb-1.5">GEODETIC COORDINATE FRAME</label>
              <select
                value={coordFrame}
                onChange={(e) => setCoordFrame(e.target.value as any)}
                className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="ITRF2020">ITRF2020 (International Terrestrial Reference Frame)</option>
                <option value="WGS84">WGS84 (GPS Reference Ellipsoid)</option>
                <option value="GTRF">GTRF (Galileo Terrestrial Reference Frame)</option>
              </select>
            </div>

            <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 text-[11px] text-white/60 font-inter">
              <span className="text-[#6FF2C0] font-mono font-bold">100× TIMeR-XL Expansion:</span> Multi-scale wavelet kernel ensures zero information loss during sparse-to-dense trajectory translation.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
