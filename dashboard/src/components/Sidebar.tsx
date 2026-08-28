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
  X,
} from 'lucide-react';
import { DashboardTab } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: DashboardTab;
  onSelectTab: (tab: DashboardTab) => void;
  unreadAlertCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  activeTab,
  onSelectTab,
  unreadAlertCount,
}) => {
  const menuItems: { id: DashboardTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'dashboard', label: 'Mission Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'forecast', label: '24H Inference Engine', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'satellites', label: 'NavIC Constellation', icon: <Radio className="w-4 h-4" /> },
    { id: 'analytics', label: 'Decomposition & GAT', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'upload', label: 'Telemetry Ingestion', icon: <Upload className="w-4 h-4" /> },
    { id: 'history', label: 'Forecast History', icon: <History className="w-4 h-4" /> },
    { id: 'alerts', label: 'Telemetry Alerts', icon: <Bell className="w-4 h-4" />, badge: unreadAlertCount },
    { id: 'settings', label: 'Model Hyperparams', icon: <Settings className="w-4 h-4" /> },
    { id: 'health', label: 'Transfer Fidelity', icon: <Activity className="w-4 h-4" /> },
  ];

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop for mobile & sleek focus */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
        onClick={onClose}
      />

      {/* Slide-out Sidebar Drawer */}
      <aside className="w-64 bg-[#060408]/98 border-r border-white/20 flex flex-col justify-between shrink-0 select-none backdrop-blur-2xl fixed inset-y-0 left-0 z-50 shadow-2xl animate-in slide-in-from-left duration-300">
        {/* Top Header inside Drawer */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="font-dancing text-white text-2xl font-semibold">
              Ephemeris
            </span>
            <span className="text-[10px] font-mono tracking-widest text-[#6FF2C0] uppercase px-2 py-0.5 rounded bg-emerald-950/40 border border-emerald-500/30">
              NavIC
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="p-4 space-y-1.5 flex-1 overflow-y-auto">
          <div className="px-3 pt-2 pb-1.5 text-[10px] font-mono tracking-widest text-white/40 uppercase">
            NAVIGATION MODULES
          </div>

          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-mono transition-all text-left cursor-pointer border ${
                  isActive
                    ? 'bg-emerald-500/15 text-[#6FF2C0] border-emerald-500/40 font-semibold'
                    : 'text-white/70 hover:text-white hover:bg-white/[0.05] border-transparent'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className={isActive ? 'text-[#6FF2C0]' : 'text-white/50'}>
                    {item.icon}
                  </span>
                  <span className="tracking-wide">{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="px-2 py-0.5 text-[9px] font-bold font-mono bg-rose-500/20 border border-rose-500/40 text-rose-300 rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Service Card */}
        <div className="p-4 m-3 liquid-glass bg-black/50 border border-white/20 rounded-2xl">
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
          </div>
        </div>
      </aside>
    </>
  );
};
