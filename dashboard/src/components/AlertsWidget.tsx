import React from 'react';
import { AlertItem, DashboardTab } from '../types';
import { AlertTriangle, CheckCircle2, Activity, ArrowUp, Zap, Bell } from 'lucide-react';

interface AlertsWidgetProps {
  alerts: AlertItem[];
  onNavigateTab: (tab: DashboardTab) => void;
  onSelectAlert: (alert: AlertItem) => void;
}

export const AlertsWidget: React.FC<AlertsWidgetProps> = ({
  alerts,
  onNavigateTab,
  onSelectAlert,
}) => {
  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return (
          <div className="w-6 h-6 rounded-full bg-rose-950/60 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
            <ArrowUp className="w-3.5 h-3.5" />
          </div>
        );
      case 'warning':
        return (
          <div className="w-6 h-6 rounded-full bg-amber-950/60 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
            <AlertTriangle className="w-3 h-3" />
          </div>
        );
      case 'info':
        return (
          <div className="w-6 h-6 rounded-full bg-cyan-950/60 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0">
            <Zap className="w-3 h-3" />
          </div>
        );
      default:
        return (
          <div className="w-6 h-6 rounded-full bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-center text-[#6FF2C0] shrink-0">
            <CheckCircle2 className="w-3 h-3" />
          </div>
        );
    }
  };

  return (
    <div className="liquid-glass bg-[#060408]/95 border border-white/10 rounded-2xl p-4 flex flex-col justify-between shadow-xl h-[280px] select-none">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2">
          <div className="text-[10px] uppercase font-mono tracking-widest text-white/50 font-semibold flex items-center gap-1.5">
            <Bell className="w-3.5 h-3.5 text-amber-400" />
            <span>TELEMETRY ALERTS & TRIGGERS</span>
          </div>
          <button
            onClick={() => onNavigateTab('alerts')}
            className="text-[10px] font-mono text-[#6FF2C0] hover:text-emerald-300 hover:underline transition-colors cursor-pointer"
          >
            All Alerts →
          </button>
        </div>

        {/* Alert Items List */}
        <div className="space-y-2">
          {alerts.slice(0, 4).map((alert) => (
            <div
              key={alert.id}
              onClick={() => onSelectAlert(alert)}
              className="flex items-start justify-between p-1.5 rounded-xl hover:bg-white/[0.04] cursor-pointer transition-colors group"
            >
              <div className="flex items-start space-x-2.5 pr-2">
                {getAlertIcon(alert.type)}
                <div className="min-w-0">
                  <div className="text-xs font-mono font-medium text-white group-hover:text-[#6FF2C0] transition-colors truncate">
                    {alert.title}
                  </div>
                  <div className="text-[10px] text-white/60 line-clamp-1 font-inter">
                    {alert.description}
                  </div>
                </div>
              </div>
              <div className="text-[9px] font-mono text-white/40 shrink-0 whitespace-nowrap pt-0.5">
                {alert.timestamp}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Quick Status Indicator */}
      <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-white/40">
        <span className="flex items-center space-x-1.5 text-[#6FF2C0]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          <span>EPHEMERIS Autonomous Rules Active</span>
        </span>
        <button
          onClick={() => onNavigateTab('alerts')}
          className="text-white/40 hover:text-white transition-colors cursor-pointer"
        >
          Configure
        </button>
      </div>
    </div>
  );
};
