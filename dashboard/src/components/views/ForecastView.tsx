import React, { useState } from 'react';
import { Satellite, ForecastLog } from '../../types';
import { Play, Sparkles, Sliders, CheckCircle2, Clock, Activity, Download, Orbit, Cpu, Compass } from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ReferenceLine,
} from 'recharts';

interface ForecastViewProps {
  satellites: Satellite[];
  onAddForecast: (forecast: ForecastLog) => void;
}

export const ForecastView: React.FC<ForecastViewProps> = ({ satellites, onAddForecast }) => {
  const [selectedSat, setSelectedSat] = useState<string>('NavIC-1A');
  const [modelType, setModelType] = useState<'EPHEMERIS TIMeR-XL' | 'GAT Spatio-Temporal' | 'Autoformer-Harmonic'>('EPHEMERIS TIMeR-XL');
  const [horizonHours, setHorizonHours] = useState<number>(24);
  const [solarKpIndex, setSolarKpIndex] = useState<number>(2.5);
  const [noiseLevel, setNoiseLevel] = useState<number>(0.04);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [forecastResult, setForecastResult] = useState<any | null>(null);

  const currentSatellite = satellites.find((s) => s.id === selectedSat) || satellites[0];

  const handleRunInference = () => {
    setIsRunning(true);
    setTimeout(() => {
      const points = [];
      const steps = horizonHours;
      const baseOrbit = currentSatellite.currentOrbitResidual;
      const baseClock = currentSatellite.currentClockResidual;

      for (let i = 0; i <= steps; i += 2) {
        const t = i / steps;
        const solarFactor = (solarKpIndex / 9) * 0.15;
        const predictedOrbit = +(
          baseOrbit +
          Math.sin(t * Math.PI * 3) * 0.08 +
          solarFactor * t +
          (Math.random() - 0.5) * noiseLevel
        ).toFixed(3);

        const predictedClock = +(
          baseClock +
          t * 0.04 +
          (Math.random() - 0.5) * (noiseLevel * 0.4)
        ).toFixed(3);

        points.push({
          hour: `+${i}h`,
          orbitResidual: predictedOrbit,
          orbitUpper: +(predictedOrbit + 0.06 + t * 0.08).toFixed(3),
          orbitLower: +(predictedOrbit - 0.06 - t * 0.08).toFixed(3),
          clockResidual: predictedClock,
          confidence: Math.max(88, Math.round(99 - t * 6 - (solarKpIndex > 5 ? 4 : 0))),
        });
      }

      setForecastResult({
        satelliteId: currentSatellite.id,
        model: modelType,
        horizonHours,
        rmsOrbitMeters: +(0.14 + (solarKpIndex / 9) * 0.06).toFixed(3),
        rmsClockNs: +(0.08 + (solarKpIndex / 9) * 0.04).toFixed(3),
        dataPoints: points,
        generatedAt: new Date().toISOString(),
      });

      const now = new Date();
      const timeStr = `${String(now.getUTCHours()).padStart(2, '0')}:${String(
        now.getUTCMinutes()
      ).padStart(2, '0')}:${String(now.getUTCSeconds()).padStart(2, '0')} UTC`;

      onAddForecast({
        id: `fc-${Date.now()}`,
        timeUtc: timeStr,
        satType: currentSatellite.type,
        model: modelType,
        rows: 14500,
        status: 'Completed',
        executionTimeMs: 420,
        rmsErrorMeters: +(0.14 + (solarKpIndex / 9) * 0.06).toFixed(3),
      });

      setIsRunning(false);
    }, 600);
  };

  return (
    <div className="space-y-6 select-none animate-in fade-in duration-200">
      {/* Header Statement */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 liquid-glass bg-[#060408]/95 border border-white/10 rounded-2xl p-6 shadow-2xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full liquid-glass border border-white/10 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-[10px] font-mono tracking-widest text-[#6FF2C0] uppercase">
              24-HOUR DEEP INFERENCE ENGINE
            </span>
          </div>
          <h2 className="font-instrument text-3xl md:text-4xl text-white text-glow">
            Neural Horizon Propagation
          </h2>
          <p className="text-xs text-white/60 font-inter mt-1 max-w-2xl leading-relaxed">
            Execute continuous spatio-temporal deep transfer forecasts across secular drift and orbital harmonics under extreme data scarcity.
          </p>
        </div>

        <button
          onClick={handleRunInference}
          disabled={isRunning}
          className="bg-white text-black px-8 py-3.5 rounded-full font-mono text-xs font-semibold tracking-wider hover:bg-white/90 transition-all duration-300 button-glow active:scale-95 disabled:opacity-50 cursor-pointer flex items-center justify-center space-x-2"
        >
          {isRunning ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              <span>INFERRING 14500 VECTORS...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span>RUN DEEP INFERENCE</span>
            </>
          )}
        </button>
      </div>

      {/* Main Grid: Control Panel (4 Cols) + Visualization (8 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Parameter Configuration */}
        <div className="lg:col-span-4 space-y-4">
          <div className="liquid-glass bg-[#060408]/95 border border-white/10 rounded-2xl p-5 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-xs font-mono font-bold tracking-wider text-white uppercase flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#6FF2C0]" />
                <span>HYPERPARAMETERS</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-400">TIMeR-XL v2.4</span>
            </div>

            {/* Target Satellite Selector */}
            <div className="space-y-1.5 font-mono text-xs">
              <label className="text-[10px] uppercase tracking-wider text-white/50">TARGET SATELLITE</label>
              <select
                value={selectedSat}
                onChange={(e) => setSelectedSat(e.target.value)}
                className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                {satellites.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.id} • {s.name} [{s.type}]
                  </option>
                ))}
              </select>
            </div>

            {/* Transfer Model Selection */}
            <div className="space-y-1.5 font-mono text-xs">
              <label className="text-[10px] uppercase tracking-wider text-white/50">TRANSFER ARCHITECTURE</label>
              <div className="grid grid-cols-1 gap-1.5">
                {(['EPHEMERIS TIMeR-XL', 'GAT Spatio-Temporal', 'Autoformer-Harmonic'] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setModelType(m)}
                    className={`px-3 py-2 rounded-xl text-left transition-all border ${
                      modelType === m
                        ? 'bg-emerald-500/20 text-[#6FF2C0] border-emerald-500/40 font-bold'
                        : 'bg-white/[0.02] border-white/5 text-white/60 hover:bg-white/5'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Horizon Hours */}
            <div className="space-y-1.5 font-mono text-xs">
              <div className="flex justify-between text-[10px] uppercase text-white/50">
                <span>INFERENCE HORIZON</span>
                <span className="text-white font-bold">{horizonHours} HOURS</span>
              </div>
              <input
                type="range"
                min="6"
                max="48"
                step="6"
                value={horizonHours}
                onChange={(e) => setHorizonHours(Number(e.target.value))}
                className="w-full accent-[#6FF2C0] h-1.5 bg-white/10 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[9px] text-white/30">
                <span>6H</span>
                <span>12H</span>
                <span>24H</span>
                <span>48H</span>
              </div>
            </div>

            {/* Solar Geomagnetic Index */}
            <div className="space-y-1.5 font-mono text-xs">
              <div className="flex justify-between text-[10px] uppercase text-white/50">
                <span>SOLAR Kp INDEX</span>
                <span className="text-[#6FF2C0] font-bold">{solarKpIndex.toFixed(1)} Kp</span>
              </div>
              <input
                type="range"
                min="0"
                max="9"
                step="0.5"
                value={solarKpIndex}
                onChange={(e) => setSolarKpIndex(Number(e.target.value))}
                className="w-full accent-[#6FF2C0] h-1.5 bg-white/10 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Prediction Graph */}
        <div className="lg:col-span-8 space-y-4">
          <div className="liquid-glass bg-[#060408]/95 border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
              <div>
                <span className="text-[10px] font-mono text-emerald-400 tracking-widest uppercase">
                  EPHEMERIS RESIDUAL PREDICTION
                </span>
                <h3 className="font-instrument text-2xl text-white mt-0.5">
                  {currentSatellite.id} &bull; 24-Hour Propagation
                </h3>
              </div>
              <div className="flex items-center gap-3 text-xs font-mono">
                <span className="flex items-center gap-1.5 text-[#6FF2C0]">
                  <span className="w-2.5 h-1 bg-[#6FF2C0] rounded-full" />
                  <span>Orbit (m)</span>
                </span>
                <span className="flex items-center gap-1.5 text-[#38BDF8]">
                  <span className="w-2.5 h-1 bg-[#38BDF8] rounded-full" />
                  <span>Clock Bias (ns)</span>
                </span>
              </div>
            </div>

            {/* Recharts Canvas */}
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={forecastResult ? forecastResult.dataPoints : currentSatellite.predictionSeries}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis
                    dataKey={forecastResult ? 'hour' : 'timeOffset'}
                    stroke="rgba(255,255,255,0.3)"
                    tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.5)', fontFamily: 'monospace' }}
                  />
                  <YAxis
                    stroke="rgba(255,255,255,0.3)"
                    tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.5)', fontFamily: 'monospace' }}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="liquid-glass bg-[#060408]/98 border border-white/20 p-3 rounded-xl shadow-2xl text-xs font-mono">
                            <div className="text-white/60 font-semibold border-b border-white/10 pb-1 mb-1.5">
                              Horizon: {label}
                            </div>
                            <div className="text-[#6FF2C0]">
                              Radial Orbit: {payload[0]?.value} m
                            </div>
                            <div className="text-[#38BDF8]">
                              Clock Drift: {payload[1]?.value} ns
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="orbitResidual"
                    stroke="#6FF2C0"
                    fill="rgba(111, 242, 192, 0.08)"
                    strokeWidth={2.2}
                  />
                  <Line
                    type="monotone"
                    dataKey="clockResidual"
                    stroke="#38BDF8"
                    strokeWidth={1.8}
                    strokeDasharray="4 4"
                    dot={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* Inference Readout Statistics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-black/50 border border-white/5 font-mono text-xs">
              <div>
                <div className="text-[10px] text-white/40 uppercase">RADIAL RMSE</div>
                <div className="text-[#6FF2C0] font-bold text-sm mt-0.5">
                  {forecastResult ? `${forecastResult.rmsOrbitMeters} m` : '0.14 m'}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-white/40 uppercase">CLOCK BIAS RMSE</div>
                <div className="text-[#38BDF8] font-bold text-sm mt-0.5">
                  {forecastResult ? `${forecastResult.rmsClockNs} ns` : '0.08 ns'}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-white/40 uppercase">SAMPLING RATIO</div>
                <div className="text-white font-bold text-sm mt-0.5">
                  100× TIMeR-XL
                </div>
              </div>
              <div>
                <div className="text-[10px] text-white/40 uppercase">TRANSFER CONFIDENCE</div>
                <div className="text-emerald-400 font-bold text-sm mt-0.5">
                  98.8% (FID 0.012)
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
