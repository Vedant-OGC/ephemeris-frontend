import React, { useState } from 'react';
import { Bell, Play, Pause, Radio, Shield, HelpCircle, X, ChevronDown, Menu } from 'lucide-react';
import { AlertItem, DashboardTab } from '../types';

interface HeaderProps {
  activeTab: DashboardTab;
  onSelectTab: (tab: DashboardTab) => void;
  onToggleSidebar?: () => void;
  onBackToLanding?: () => void;
  isBackendConnected?: boolean;
  utcTime: Date;
  isSimulating: boolean;
  onToggleSimulation: () => void;
  simulationSpeed: number;
  onChangeSpeed: (speed: number) => void;
  alerts: AlertItem[];
  onSelectAlert: (alert: AlertItem) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  onToggleSidebar,
  onBackToLanding,
  isBackendConnected = false,
  utcTime,
  isSimulating,
  onToggleSimulation,
  simulationSpeed,
  onChangeSpeed,
  alerts,
  onSelectAlert,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);

  const unreadAlerts = alerts.filter((a) => !a.read);

  // Format UTC Time
  const hours = String(utcTime.getUTCHours()).padStart(2, '0');
  const minutes = String(utcTime.getUTCMinutes()).padStart(2, '0');
  const seconds = String(utcTime.getUTCSeconds()).padStart(2, '0');
  const timeString = `${hours}:${minutes}:${seconds} UTC`;

  const navItems: { id: DashboardTab; label: string }[] = [
    { id: 'dashboard', label: 'Mission' },
    { id: 'forecast', label: 'Inference' },
    { id: 'satellites', label: 'Constellation' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'upload', label: 'Datasets' },
    { id: 'history', label: 'Audit Logs' },
    { id: 'health', label: 'Telemetry' },
  ];

  return (
    <header className="h-16 bg-[#050608]/90 border-b border-white/20 px-4 md:px-8 flex items-center justify-between z-30 sticky top-0 backdrop-blur-xl select-none">
      {/* Left: Brand Identity & Sidebar Toggle */}
      <div className="flex items-center space-x-4 md:space-x-6">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/20 transition-colors cursor-pointer"
            title="Toggle navigation sidebar"
          >
            <Menu className="w-4 h-4" />
          </button>
        )}

        <div
          className="flex items-center space-x-2.5 cursor-pointer"
          onClick={() => {
            if (onBackToLanding) {
              onBackToLanding();
            } else {
              onSelectTab('dashboard');
            }
          }}
          title={onBackToLanding ? 'Return to Main Website' : 'Mission Control'}
        >
          <span className="font-dancing text-white text-2xl font-semibold tracking-wide">
            Ephemeris
          </span>
          <span className="text-[10px] font-mono tracking-widest text-[#6FF2C0] uppercase px-2 py-0.5 rounded bg-emerald-950/40 border border-emerald-500/40">
            NavIC
          </span>
        </div>

        {/* Live Backend Connection Indicator */}
        <div
          className={`hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-[10px] font-mono border ${
            isBackendConnected
              ? 'bg-emerald-950/50 text-[#6FF2C0] border-emerald-500/40'
              : 'bg-white/5 text-white/50 border-white/10'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isBackendConnected ? 'bg-emerald-400 shadow-[0_0_8px_#6FF2C0]' : 'bg-white/40'
            }`}
          />
          <span>{isBackendConnected ? 'FASTAPI: ONLINE' : 'SIMULATION MODE'}</span>
        </div>

        {onBackToLanding && (
          <button
            onClick={onBackToLanding}
            className="hidden sm:flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/15 text-xs font-mono transition-colors cursor-pointer"
          >
            <span>&larr; Overview</span>
          </button>
        )}

        {/* Primary Navigation Tabs */}
        <nav className="hidden lg:flex items-center space-x-1 border-l border-white/10 pl-6 font-mono text-xs">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-white/10 text-[#6FF2C0] font-semibold border border-white/10'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Right: Telemetry & Actions */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        {/* Stream Live / Paused Toggle */}
        <button
          onClick={onToggleSimulation}
          className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg border font-mono text-[10px] transition-all cursor-pointer ${
            isSimulating
              ? 'bg-emerald-500/10 border-emerald-500/30 text-[#6FF2C0] font-bold'
              : 'bg-white/5 border-white/10 text-white/50 hover:text-white'
          }`}
          title={isSimulating ? 'Click to Pause Feed' : 'Click to Resume Live Feed'}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isSimulating ? 'bg-emerald-400 animate-pulse' : 'bg-white/40'
            }`}
          />
          <span>{isSimulating ? 'LIVE STREAM' : 'FEED PAUSED'}</span>
        </button>

        {/* UTC Clock (Steady, clean) */}
        <div className="hidden sm:flex items-center space-x-2 text-white/80 border-l border-white/10 pl-4 font-mono">
          <span className="text-white/40 text-[10px]">UTC</span>
          <span className="font-bold text-white text-[13px]">{timeString}</span>
        </div>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
            title="Telemetry Alerts"
          >
            <Bell className="w-3.5 h-3.5" />
            {unreadAlerts.length > 0 && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 text-black rounded-full text-[8px] font-bold flex items-center justify-center border border-black">
                {unreadAlerts.length}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-[#060408]/98 border border-white/15 rounded-xl shadow-2xl z-50 p-4 animate-in fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold tracking-wider text-white uppercase">System Alerts</span>
                  <span className="text-[10px] px-1.5 py-0.5 bg-emerald-950/60 text-[#6FF2C0] border border-emerald-500/30 rounded font-mono">
                    {unreadAlerts.length} Active
                  </span>
                </div>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-white/40 hover:text-white cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="mt-3 space-y-2 max-h-72 overflow-y-auto pr-1">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    onClick={() => {
                      onSelectAlert(alert);
                      setShowNotifications(false);
                    }}
                    className={`p-2.5 rounded-lg border cursor-pointer transition-all ${
                      alert.type === 'critical'
                        ? 'bg-rose-950/30 border-rose-500/40 hover:bg-rose-950/50'
                        : alert.type === 'warning'
                        ? 'bg-amber-950/30 border-amber-500/40 hover:bg-amber-950/50'
                        : 'bg-white/[0.03] border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <span className={`text-xs font-semibold ${
                        alert.type === 'critical' ? 'text-rose-400' :
                        alert.type === 'warning' ? 'text-amber-400' :
                        'text-[#6FF2C0]'
                      }`}>
                        {alert.title}
                      </span>
                      <span className="text-[9px] text-white/40">{alert.timestamp}</span>
                    </div>
                    <p className="text-[11px] text-white/70 mt-1 font-inter">{alert.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center space-x-2 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer"
          >
            <div className="w-6 h-6 rounded bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-center text-[10px] font-bold text-[#6FF2C0]">
              GM
            </div>
            <span className="hidden sm:inline text-white/80 text-[11px]">Greedy Minds</span>
            <ChevronDown className="w-3 h-3 text-white/40" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-3 w-52 bg-[#060408]/98 border border-white/15 rounded-xl shadow-2xl z-50 p-2 text-xs">
              <div className="px-3 py-2 border-b border-white/10">
                <div className="font-bold text-white">Team Greedy Minds</div>
                <div className="text-white/40 text-[10px]">EPHEMERIS Research</div>
              </div>
              <div className="py-1">
                <button
                  onClick={() => setShowInfoModal(true)}
                  className="w-full text-left px-3 py-1.5 hover:bg-white/10 text-white/80 hover:text-white rounded flex items-center space-x-2 cursor-pointer"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Framework Specs</span>
                </button>
                <button
                  onClick={() => setShowUserMenu(false)}
                  className="w-full text-left px-3 py-1.5 hover:bg-white/10 text-white/80 hover:text-white rounded flex items-center space-x-2 cursor-pointer"
                >
                  <Shield className="w-3.5 h-3.5 text-[#6FF2C0]" />
                  <span>Clearance</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Framework Specs Modal */}
      {showInfoModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#060408]/95 border border-white/20 rounded-2xl max-w-lg w-full p-6 text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center space-x-2">
                <Radio className="w-4 h-4 text-[#6FF2C0]" />
                <h3 className="font-instrument text-2xl text-white">EPHEMERIS Engine Specs</h3>
              </div>
              <button onClick={() => setShowInfoModal(false)} className="text-white/40 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="mt-4 text-xs space-y-3 leading-relaxed text-white/70 font-inter">
              <p>
                <strong className="text-white">EPHEMERIS</strong> is an end-to-end deep learning framework designed to forecast NavIC satellite ephemeris and atomic clock offsets under 7-day data scarcity (145 epochs).
              </p>
              <p>
                It decomposes signals into secular drift, harmonic resonance, and white noise using Autoformer and Spatio-Temporal Graph Attention (GAT) to achieve sub-decimeter 24-hour predictive horizons.
              </p>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowInfoModal(false)}
                className="px-5 py-1.5 bg-white text-black text-xs font-mono font-medium rounded-lg hover:bg-white/90 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
