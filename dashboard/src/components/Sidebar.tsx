import React from 'react';
import {
  LayoutDashboard,
  TrendingUp,
  Upload,
  Radio,
  BarChart3,
  History,
  Bell,
  Settings,
  Activity,
  Network,
  Sparkles
} from 'lucide-react';
import { DashboardTab } from '../types';

interface SidebarProps {
  activeTab: DashboardTab;
  onSelectTab: (tab: DashboardTab) => void;
  unreadAlertCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  unreadAlertCount,
}) => {
  const menuItems: { id: DashboardTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'dashboard', label: 'Mission Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'forecast', label: '24H Inference Engine', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'upload', label: 'Telemetry Ingestion', icon: <Upload className="w-4 h-4" /> },
    { id: 'satellites', label: 'NavIC Constellation', icon: <Radio className="w-4 h-4" /> },
    { id: 'analytics', label: 'Decomposition & GAT', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'history', label: 'Forecast History', icon: <History className="w-4 h-4" /> },
    { id: 'alerts', label: 'Telemetry Alerts', icon: <Bell className="w-4 h-4" />, badge: unreadAlertCount },
    { id: 'settings', label: 'Model Hyperparams', icon: <Settings className="w-4 h-4" /> },
    { id: 'health', label: 'Transfer Fidelity', icon: <Activity className="w-4 h-4" /> },
  ];

  return (
    <aside className="w-60 bg-[#060408]/95 border-r border-white/10 flex flex-col justify-between shrink-0 select-none backdrop-blur-xl">
      {/* Navigation Links */}
      <div className="p-3.5 space-y-1.5">
        <div className="px-3 pt-2 pb-1.5 text-[10px] font-mono tracking-widest text-white/40 uppercase">
          NAVIGATION / TELEMETRY
        </div>

        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-mono transition-all text-left cursor-pointer ${
                isActive
                  ? 'bg-emerald-500/15 text-[#6FF2C0] border border-emerald-500/40 shadow-[0_0_15px_rgba(111,242,192,0.12)] font-semibold'
                  : 'text-white/60 hover:text-white hover:bg-white/[0.04] border border-transparent'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className={isActive ? 'text-[#6FF2C0]' : 'text-white/50'}>
                  {item.icon}
                </span>
                <span className="tracking-wide">{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="px-1.5 py-0.5 text-[9px] font-bold font-mono bg-rose-500/20 border border-rose-500/40 text-rose-300 rounded-full">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Service Card (EPHEMERIS Transfer Engine) */}
      <div className="p-3.5 m-3 liquid-glass bg-black/40 border border-white/10 rounded-2xl">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="font-bold text-white tracking-widest font-mono text-[11px]">EPHEMERIS v2.4</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
        </div>
        <div className="text-[10px] font-mono text-white/60 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-white/40">ENGINE:</span>
            <span className="text-emerald-300 font-medium">TIMeR-XL 100×</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-white/40">COUPLING:</span>
            <span className="text-cyan-300 font-medium">GAT Attention</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-white/40">WINDOW:</span>
            <span className="text-white/80">7 Days / 145 Epochs</span>
          </div>
          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[#6FF2C0] font-semibold text-[10px]">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>Online & Inferred</span>
            </div>
            <span className="text-white/40">14ms</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
