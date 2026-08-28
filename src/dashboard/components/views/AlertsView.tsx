import React, { useState } from 'react';
import { AlertItem } from '../../types';
import { Bell, AlertTriangle, ArrowUp, CheckCircle2, ShieldAlert, Sliders, Check, Trash2, Zap } from 'lucide-react';

interface AlertsViewProps {
  alerts: AlertItem[];
  onAcknowledgeAlert: (id: string) => void;
  onClearAll: () => void;
}

export const AlertsView: React.FC<AlertsViewProps> = ({
  alerts,
  onAcknowledgeAlert,
  onClearAll,
}) => {
  const [filter, setFilter] = useState<'ALL' | 'critical' | 'warning' | 'info'>('ALL');
  const [orbitThreshold, setOrbitThreshold] = useState<number>(0.35);
  const [clockThreshold, setClockThreshold] = useState<number>(0.20);

  const filteredAlerts = alerts.filter(
    (a) => filter === 'ALL' || a.type === filter
  );

  return (
    <div className="space-y-6 select-none animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 liquid-glass bg-[#060408]/95 border border-white/10 rounded-2xl p-6 shadow-2xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full liquid-glass border border-white/10 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span className="text-[10px] font-mono tracking-widest text-amber-300 uppercase">
              ANOMALY &amp; THRESHOLD ENGINE
            </span>
          </div>
          <h2 className="font-instrument text-3xl md:text-4xl text-white text-glow">
            Alerts, Thresholds &amp; Fault Monitor
          </h2>
          <p className="text-xs text-white/60 font-inter mt-1">
            Real-time orbital perturbation alarms, atomic clock drift triggers, and automated ground-telemetry webhooks.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onClearAll}
            className="px-5 py-2 bg-white/5 hover:bg-white/10 text-white/80 border border-white/10 rounded-full text-xs font-mono flex items-center space-x-1.5 transition-all cursor-pointer button-glow"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Acknowledge All</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Threshold Configuration */}
        <div className="liquid-glass bg-[#060408]/95 border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4">
          <h3 className="text-xs font-mono font-bold tracking-wider text-white uppercase flex items-center space-x-2 border-b border-white/10 pb-3">
            <Sliders className="w-4 h-4 text-[#6FF2C0]" />
            <span>TRIGGER THRESHOLDS</span>
          </h3>

          <div className="space-y-4 text-xs font-mono">
            <div>
              <div className="flex justify-between text-white/60 mb-1">
                <span>ORBIT RESIDUAL CRITICAL</span>
                <span className="text-rose-400 font-bold">{orbitThreshold.toFixed(2)} m</span>
              </div>
              <input
                type="range"
                min={0.1}
                max={0.8}
                step={0.02}
                value={orbitThreshold}
                onChange={(e) => setOrbitThreshold(Number(e.target.value))}
                className="w-full accent-rose-500 bg-white/10 rounded h-1.5 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-white/60 mb-1">
                <span>CLOCK DRIFT WARNING</span>
                <span className="text-amber-400 font-bold">{clockThreshold.toFixed(2)} ns</span>
              </div>
              <input
                type="range"
                min={0.05}
                max={0.5}
                step={0.02}
                value={clockThreshold}
                onChange={(e) => setClockThreshold(Number(e.target.value))}
                className="w-full accent-amber-500 bg-white/10 rounded h-1.5 cursor-pointer"
              />
            </div>

            <div className="p-4 rounded-xl bg-black/40 border border-white/5 text-[11px] text-white/60 space-y-2 font-inter">
              <div className="text-white font-mono font-bold">Autonomous Actions:</div>
              <div>• Critical: Highlight satellite beacon in 3D constellation view.</div>
              <div>• Warning: Trigger TIMeR-XL re-inference on next 70-min epoch.</div>
            </div>
          </div>
        </div>

        {/* Right Column: Active Alerts Feed */}
        <div className="lg:col-span-2 liquid-glass bg-[#060408]/95 border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="text-xs font-mono font-bold text-white uppercase">
              ACTIVE TELEMETRY ALERTS ({filteredAlerts.length})
            </div>

            <div className="flex items-center space-x-1 bg-black/60 p-1 rounded-lg border border-white/10 text-xs font-mono">
              {(['ALL', 'critical', 'warning', 'info'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1 rounded transition-colors cursor-pointer ${
                    filter === f
                      ? 'bg-emerald-500/20 text-[#6FF2C0] border border-emerald-500/40 font-semibold'
                      : 'text-white/50 hover:text-white'
                  }`}
                >
                  {f.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {filteredAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-2xl border transition-all ${
                  alert.type === 'critical'
                    ? 'bg-rose-950/20 border-rose-500/40'
                    : alert.type === 'warning'
                    ? 'bg-amber-950/20 border-amber-500/40'
                    : 'bg-white/[0.02] border-white/10'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="mt-0.5">
                      {alert.type === 'critical' ? (
                        <div className="w-6 h-6 rounded-full bg-rose-950/60 border border-rose-500/40 flex items-center justify-center text-rose-400">
                          <ArrowUp className="w-3.5 h-3.5" />
                        </div>
                      ) : alert.type === 'warning' ? (
                        <div className="w-6 h-6 rounded-full bg-amber-950/60 border border-amber-500/40 flex items-center justify-center text-amber-400">
                          <AlertTriangle className="w-3.5 h-3.5" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-cyan-950/60 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                          <Zap className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-mono font-bold text-white">
                        {alert.title}
                      </div>
                      <div className="text-xs text-white/70 font-inter mt-0.5">
                        {alert.description}
                      </div>
                      {alert.metric && (
                        <div className="text-[10px] font-mono text-white/40 mt-1.5">
                          Metric: <span className="text-white">{alert.metric}</span> &bull; Current: <span className="text-[#6FF2C0] font-bold">{alert.value}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 shrink-0">
                    <span className="text-[10px] font-mono text-white/40">{alert.timestamp}</span>
                    {!alert.read && (
                      <button
                        onClick={() => onAcknowledgeAlert(alert.id)}
                        className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded-full text-[10px] font-mono transition-colors cursor-pointer"
                      >
                        Dismiss
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
