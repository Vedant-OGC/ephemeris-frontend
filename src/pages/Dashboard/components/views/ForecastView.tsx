import React, { useState } from 'react';
import { Satellite, ForecastLog } from '../../types';
import { runSatelliteForecast, uploadSatelliteForecast } from '../../api/client';
import { Play, Sparkles, Sliders, CheckCircle2, Upload, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

interface ForecastViewProps {
  satellites: Satellite[];
  selectedSatelliteId: string;
  onSelectSatellite: (id: string) => void;
  onAddForecast: (forecast: ForecastLog) => void;
}

export const ForecastView: React.FC<ForecastViewProps> = ({
  satellites,
  selectedSatelliteId,
  onSelectSatellite,
  onAddForecast,
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [forecastResult, setForecastResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Admin upload fallback state
  const [showUpload, setShowUpload] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  const currentSatellite = satellites.find((s) => s.id === selectedSatelliteId) || satellites[0];

  const handleRunInference = async () => {
    if (!selectedSatelliteId) return;
    setIsRunning(true);
    setError(null);
    setForecastResult(null);
    try {
      const result = await runSatelliteForecast(selectedSatelliteId);
      const points = result.forecast_points.map((p: any) => ({
        hour: p.time_label,
        orbitResidual: p.orbit_residual_3d,
        clockResidual: p.satclockerror,
        orbitUpper: p.orbit_residual_ci_upper,
        orbitLower: p.orbit_residual_ci_lower,
      }));
      setForecastResult({
        satelliteId: result.satellite_id,
        model: 'EPHEMERIS TIMeR-XL',
        rmsOrbitMeters: result.current_orbit_residual_m,
        rmsClockNs: result.current_clock_residual_ns,
        dataPoints: points,
        confidence: result.confidence_level_pct,
      });

      const now = new Date();
      const timeStr = `${String(now.getUTCHours()).padStart(2, '0')}:${String(now.getUTCMinutes()).padStart(2, '0')}:${String(now.getUTCSeconds()).padStart(2, '0')} UTC`;
      onAddForecast({
        id: `fc-${Date.now()}`,
        timeUtc: timeStr,
        satType: currentSatellite?.type || 'GEO',
        model: 'EPHEMERIS TIMeR-XL',
        rows: result.forecast_points.length,
        status: 'Completed',
        executionTimeMs: 0,
        rmsErrorMeters: result.current_orbit_residual_m,
      });
    } catch (e: any) {
      setError(e.message || 'Inference failed');
    } finally {
      setIsRunning(false);
    }
  };

  const handleUploadInference = async () => {
    if (!uploadFile || !selectedSatelliteId) return;
    setIsRunning(true);
    setError(null);
    setForecastResult(null);
    try {
      const result = await uploadSatelliteForecast(selectedSatelliteId, uploadFile);
      const points = result.forecast_points.map((p: any) => ({
        hour: p.time_label,
        orbitResidual: p.orbit_residual_3d,
        clockResidual: p.satclockerror,
        orbitUpper: p.orbit_residual_ci_upper,
        orbitLower: p.orbit_residual_ci_lower,
      }));
      setForecastResult({
        satelliteId: result.satellite_id,
        model: 'EPHEMERIS TIMeR-XL (Custom)',
        rmsOrbitMeters: result.current_orbit_residual_m,
        rmsClockNs: result.current_clock_residual_ns,
        dataPoints: points,
        confidence: result.confidence_level_pct,
      });
      const now = new Date();
      const timeStr = `${String(now.getUTCHours()).padStart(2, '0')}:${String(now.getUTCMinutes()).padStart(2, '0')}:${String(now.getUTCSeconds()).padStart(2, '0')} UTC`;
      onAddForecast({
        id: `fc-${Date.now()}`,
        timeUtc: timeStr,
        satType: currentSatellite?.type || 'GEO',
        model: 'EPHEMERIS TIMeR-XL (Custom)',
        rows: result.forecast_points.length,
        status: 'Completed',
        executionTimeMs: 0,
        rmsErrorMeters: result.current_orbit_residual_m,
      });
    } catch (e: any) {
      setError(e.message || 'Inference failed');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-6 select-none animate-in fade-in duration-200">
      {/* Header */}
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
            Select a satellite and run the ML inference pipeline. The backend uses stored 7-day cleaned data to produce a 24-hour forecast at 15-min intervals.
          </p>
        </div>
        <button
          onClick={handleRunInference}
          disabled={isRunning || !selectedSatelliteId}
          className="bg-white text-black px-8 py-3.5 rounded-full font-mono text-xs font-semibold tracking-wider hover:bg-white/90 transition-all duration-300 button-glow active:scale-95 disabled:opacity-50 cursor-pointer flex items-center justify-center space-x-2"
        >
          {isRunning ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              <span>INFERRING...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span>RUN DEEP INFERENCE</span>
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="liquid-glass bg-rose-950/40 p-4 rounded-2xl text-xs font-mono text-rose-300 flex items-center space-x-3 shadow-xl">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Satellite Selector + Admin Upload */}
        <div className="lg:col-span-4 space-y-4">
          <div className="liquid-glass bg-[#060408]/95 border border-white/10 rounded-2xl p-5 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-xs font-mono font-bold tracking-wider text-white uppercase flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#6FF2C0]" />
                <span>INPUT</span>
              </span>
            </div>

            {/* Satellite Selector */}
            <div className="space-y-1.5 font-mono text-xs">
              <label className="text-[10px] uppercase tracking-wider text-white/50">TARGET SATELLITE</label>
              <select
                value={selectedSatelliteId}
                onChange={(e) => onSelectSatellite(e.target.value)}
                className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                {satellites.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.id} - {s.name} [{s.type}]
                  </option>
                ))}
              </select>
            </div>

            <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-[10px] text-white/50 font-inter">
              Backend loads the stored 7-day cleaned dataset for <span className="text-white font-mono">{selectedSatelliteId || '...'}</span> and runs TIMeR-XL inference server-side.
            </div>
            {/* Admin Upload Fallback */}
            <div className="border-t border-white/10 pt-4">
              <button
                onClick={() => setShowUpload(!showUpload)}
                className="flex items-center gap-2 text-[10px] font-mono text-white/40 hover:text-white/60 transition-colors cursor-pointer w-full"
              >
                <span>ADMIN: Upload Custom CSV</span>
                {showUpload ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
              {showUpload && (
                <div className="mt-3 space-y-2">
                  <div
                    onClick={() => document.getElementById('admin-csv-input')?.click()}
                    className="border-2 border-dashed rounded-xl p-3 text-center cursor-pointer transition-all border-white/15 hover:border-white/30 bg-black/40"
                  >
                    {uploadFile ? (
                      <div className="space-y-1">
                        <CheckCircle2 className="w-4 h-4 text-[#6FF2C0] mx-auto" />
                        <div className="text-[#6FF2C0] font-bold text-[11px]">{uploadFile.name}</div>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <Upload className="w-4 h-4 text-white/40 mx-auto" />
                        <div className="text-white/60 text-[11px]">Drop CSV or click to browse</div>
                      </div>
                    )}
                  </div>
                  <input
                    id="admin-csv-input"
                    type="file"
                    accept=".csv"
                    onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                  {uploadFile && (
                    <button
                      onClick={handleUploadInference}
                      disabled={isRunning}
                      className="w-full px-4 py-2 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 text-[#6FF2C0] border border-emerald-500/40 text-xs font-mono font-semibold transition-all disabled:opacity-50 cursor-pointer"
                    >
                      RUN WITH CUSTOM CSV
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Prediction Graph */}
        <div className="lg:col-span-8 space-y-4">
          <div className="liquid-glass bg-[#060408]/95 border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
              <div>
                <span className="text-[10px] font-mono text-emerald-400 tracking-widest uppercase">EPHEMERIS RESIDUAL PREDICTION</span>
                <h3 className="font-instrument text-2xl text-white mt-0.5">{selectedSatelliteId} - Forecast</h3>
              </div>
              <div className="flex items-center gap-3 text-xs font-mono">
                <span className="flex items-center gap-1.5 text-[#6FF2C0]"><span className="w-2.5 h-1 bg-[#6FF2C0] rounded-full" /><span>Orbit (m)</span></span>
                <span className="flex items-center gap-1.5 text-[#38BDF8]"><span className="w-2.5 h-1 bg-[#38BDF8] rounded-full" /><span>Clock (ns)</span></span>
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={forecastResult ? forecastResult.dataPoints : []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="hour" stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.5)', fontFamily: 'monospace' }} />
                  <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.5)', fontFamily: 'monospace' }} />
                  <Tooltip content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="liquid-glass bg-[#060408]/98 border border-white/20 p-3 rounded-xl shadow-2xl text-xs font-mono">
                          <div className="text-white/60 font-semibold border-b border-white/10 pb-1 mb-1.5">Horizon: {label}</div>
                          <div className="text-[#6FF2C0]">Orbit: {payload[0]?.value} m</div>
                          <div className="text-[#38BDF8]">Clock: {payload[1]?.value} ns</div>
                        </div>
                      );
                    }
                    return null;
                  }} />
                  <Area type="monotone" dataKey="orbitResidual" stroke="#6FF2C0" fill="rgba(111, 242, 192, 0.08)" strokeWidth={2.2} />
                  <Line type="monotone" dataKey="clockResidual" stroke="#38BDF8" strokeWidth={1.8} strokeDasharray="4 4" dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {!forecastResult && (
              <div className="text-center py-12 text-white/30 text-xs font-mono">Select a satellite and click "Run Deep Inference" to see forecast results</div>
            )}

            {forecastResult && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-black/50 border border-white/5 font-mono text-xs">
                <div><div className="text-[10px] text-white/40 uppercase">RADIAL RMSE</div><div className="text-[#6FF2C0] font-bold text-sm mt-0.5">{forecastResult.rmsOrbitMeters} m</div></div>
                <div><div className="text-[10px] text-white/40 uppercase">CLOCK BIAS RMSE</div><div className="text-[#38BDF8] font-bold text-sm mt-0.5">{forecastResult.rmsClockNs} ns</div></div>
                <div><div className="text-[10px] text-white/40 uppercase">CONFIDENCE</div><div className="text-emerald-400 font-bold text-sm mt-0.5">{forecastResult.confidence}%</div></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
