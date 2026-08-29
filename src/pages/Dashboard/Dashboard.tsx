import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { MetricCards } from './components/MetricCards';
import { ConstellationGlobe } from './components/ConstellationGlobe';
import { SatelliteInspector } from './components/SatelliteInspector';
import { RecentForecastsTable } from './components/RecentForecastsTable';
import { OrbitResidualAllChart } from './components/OrbitResidualAllChart';
import { AlertsWidget } from './components/AlertsWidget';
import { SystemTelemetryBar } from './components/SystemTelemetryBar';

// Views
import { ForecastView } from './components/views/ForecastView';
import { SatellitesView } from './components/views/SatellitesView';
import { AnalyticsView } from './components/views/AnalyticsView';
import { UploadDatasetView } from './components/views/UploadDatasetView';
import { HistoryView } from './components/views/HistoryView';
import { AlertsView } from './components/views/AlertsView';
import { SettingsView } from './components/views/SettingsView';
import { HealthView } from './components/views/HealthView';

// API Service Layer
import {
  getConstellation,
  getAlerts,
  markAlertAsRead,
  getForecastHistory,
  getSystemTelemetry,
  getDashboardOverview,
  getSatelliteForecast,
  checkBackendHealth,
} from './services/api';

// Initial Mock Data Fallbacks
import {
  INITIAL_SATELLITES,
  INITIAL_FORECASTS,
  INITIAL_ALERTS,
  INITIAL_SYSTEM_TELEMETRY,
} from './data/initialData';

import {
  Satellite,
  ForecastLog,
  AlertItem,
  SystemTelemetry,
  SatelliteHealth,
  DashboardTab,
} from './types';

interface DashboardProps {
  onBackToLanding?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onBackToLanding }) => {
  // Navigation
  const [activeTab, setActiveTab] = useState<DashboardTab>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  // Core Data States
  const [satellites, setSatellites] = useState<Satellite[]>(INITIAL_SATELLITES);
  const [selectedSatelliteId, setSelectedSatelliteId] = useState<string>('NavIC-1A');
  const [forecasts, setForecasts] = useState<ForecastLog[]>(INITIAL_FORECASTS);
  const [alerts, setAlerts] = useState<AlertItem[]>(INITIAL_ALERTS);
  const [telemetry, setTelemetry] = useState<SystemTelemetry>(INITIAL_SYSTEM_TELEMETRY);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);

  // Live UTC Clock & Simulation Controls
  const [utcTime, setUtcTime] = useState<Date>(new Date());
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [simulationSpeed, setSimulationSpeed] = useState<number>(1);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Fetch all initial data from FastAPI backend
  const loadBackendData = useCallback(async () => {
    try {
      const isOnline = await checkBackendHealth();
      setIsBackendConnected(isOnline);

      // 1. Constellation
      const sats = await getConstellation();
      if (sats && sats.length > 0) {
        setSatellites(sats);
      }

      // 2. Alerts
      const liveAlerts = await getAlerts();
      if (liveAlerts && liveAlerts.length > 0) {
        setAlerts(liveAlerts);
      }

      // 3. Forecast History
      const hist = await getForecastHistory();
      if (hist && hist.length > 0) {
        setForecasts(hist);
      }

      // 4. Telemetry & Overview
      const telem = await getSystemTelemetry();
      const overview = await getDashboardOverview();
      if (telem) {
        setTelemetry({
          ...telem,
          totalSatellites: overview?.total_satellites ?? telem.totalSatellites,
          avgOrbitError: overview?.avg_orbit_error_m && overview.avg_orbit_error_m > 0 ? overview.avg_orbit_error_m : telem.avgOrbitError,
          avgClockError: overview?.avg_clock_error_ns && overview.avg_clock_error_ns > 0 ? overview.avg_clock_error_ns : telem.avgClockError,
        });
      }
    } catch (e) {
      console.warn('[Dashboard] Using local dataset fallback:', e);
    }
  }, []);

  useEffect(() => {
    loadBackendData();
    // Poll telemetry and health every 10 seconds
    const interval = setInterval(loadBackendData, 10000);
    return () => clearInterval(interval);
  }, [loadBackendData]);

  // When satellite selection changes, fetch its live forecast series if available
  useEffect(() => {
    let isMounted = true;
    getSatelliteForecast(selectedSatelliteId).then((series) => {
      if (isMounted && series && series.length > 0) {
        setSatellites((prev) =>
          prev.map((s) =>
            s.id === selectedSatelliteId
              ? { ...s, predictionSeries: series }
              : s
          )
        );
      }
    });
    return () => {
      isMounted = false;
    };
  }, [selectedSatelliteId]);

  // Active satellite record
  const selectedSatellite =
    satellites.find((s) => s.id === selectedSatelliteId) || satellites[0];

  // Real-time UTC clock ticker
  useEffect(() => {
    const interval = setInterval(() => {
      setUtcTime((prev) => new Date(prev.getTime() + 1000 * (isSimulating ? simulationSpeed : 0)));
    }, 1000);

    return () => clearInterval(interval);
  }, [isSimulating, simulationSpeed]);

  const handleRefreshData = async () => {
    setIsRefreshing(true);
    await loadBackendData();
    setTimeout(() => {
      setIsRefreshing(false);
    }, 500);
  };

  const handleAddForecast = (newForecast: ForecastLog) => {
    setForecasts((prev) => [newForecast, ...prev]);
  };

  const handleAcknowledgeAlert = async (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, read: true } : a))
    );
    await markAlertAsRead(id);
  };

  const handleClearAllAlerts = () => {
    setAlerts((prev) => prev.map((a) => ({ ...a, read: true })));
  };

  const handleSelectAlert = (alert: AlertItem) => {
    if (alert.satelliteId) {
      setSelectedSatelliteId(alert.satelliteId);
      setActiveTab('dashboard');
    }
  };

  const handleUpdateHealth = (id: string, health: SatelliteHealth) => {
    setSatellites((prev) =>
      prev.map((s) => (s.id === id ? { ...s, health } : s))
    );
  };

  const unreadAlertCount = alerts.filter((a) => !a.read).length;

  return (
    <div className="min-h-screen bg-[#050608] text-white flex flex-col font-inter selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* 1. Translucent Rectangular Minimal Navigation Bar */}
      <Header
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onBackToLanding={onBackToLanding}
        isBackendConnected={isBackendConnected}
        utcTime={utcTime}
        isSimulating={isSimulating}
        onToggleSimulation={() => setIsSimulating(!isSimulating)}
        simulationSpeed={simulationSpeed}
        onChangeSpeed={(speed) => setSimulationSpeed(speed)}
        alerts={alerts}
        onSelectAlert={handleSelectAlert}
      />

      {/* Main Layout Area: Togglable Sidebar Drawer + Main Content */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Navigation Sidebar Drawer (Hidden by default) */}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          activeTab={activeTab}
          onSelectTab={(tab) => setActiveTab(tab)}
          unreadAlertCount={unreadAlertCount}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 technical-grid bg-[#060407]/80">
          {/* TAB 1: Mission Control Overview */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-200">
              {/* 1. TOP FEATURED: 3D NavIC Constellation Tracker & Satellite Inspector */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* 3D Earth Constellation Globe (Top Left: 8 cols) */}
                <div className="lg:col-span-8">
                  <ConstellationGlobe
                    satellites={satellites}
                    selectedSatelliteId={selectedSatelliteId}
                    onSelectSatellite={(id) => setSelectedSatelliteId(id)}
                    isSimulating={isSimulating}
                  />
                </div>

                {/* Selected Satellite Inspector (Top Right: 4 cols) */}
                <div className="lg:col-span-4">
                  <SatelliteInspector
                    satellite={selectedSatellite}
                    allSatellites={satellites}
                    onSelectSatellite={(id) => setSelectedSatelliteId(id)}
                  />
                </div>
              </div>

              {/* 2. Key Performance Indicators Strip */}
              <MetricCards
                telemetry={telemetry}
                lastPredictionTime="14:03 UTC"
                lastPredictionDate="28 May 2025"
              />

              {/* 3. FULL HORIZONTAL SECTION: Orbit Residual Telemetry Waveforms */}
              <div className="w-full">
                <OrbitResidualAllChart
                  selectedSatelliteId={selectedSatelliteId}
                  onSelectSatellite={(id) => setSelectedSatelliteId(id)}
                />
              </div>

              {/* 4. Secondary Operations Row: Recent Inferences & Trigger Alerts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <RecentForecastsTable
                  forecasts={forecasts}
                  onNavigateTab={(tab) => setActiveTab(tab)}
                  onSelectForecast={() => setActiveTab('history')}
                />
                <AlertsWidget
                  alerts={alerts}
                  onNavigateTab={(tab) => setActiveTab(tab)}
                  onSelectAlert={handleSelectAlert}
                />
              </div>
            </div>
          )}

          {/* TAB 2: 24H Neural Inference Playground */}
          {activeTab === 'forecast' && (
            <div className="max-w-[1600px] mx-auto">
              <ForecastView
                satellites={satellites}
                onAddForecast={handleAddForecast}
              />
            </div>
          )}

          {/* TAB 3: Constellation Fleet & Polar Sky Plot */}
          {activeTab === 'satellites' && (
            <div className="max-w-[1600px] mx-auto">
              <SatellitesView
                satellites={satellites}
                selectedSatelliteId={selectedSatelliteId}
                onSelectSatellite={(id) => setSelectedSatelliteId(id)}
                onUpdateHealth={handleUpdateHealth}
              />
            </div>
          )}

          {/* TAB 4: Statistical Analytics & Error Decomposition */}
          {activeTab === 'analytics' && (
            <div className="max-w-[1600px] mx-auto">
              <AnalyticsView satellites={satellites} />
            </div>
          )}

          {/* TAB 5: Telemetry Dataset Ingestion */}
          {activeTab === 'upload' && (
            <div className="max-w-[1600px] mx-auto">
              <UploadDatasetView />
            </div>
          )}

          {/* TAB 6: Prediction History & Audit */}
          {activeTab === 'history' && (
            <div className="max-w-[1600px] mx-auto">
              <HistoryView forecasts={forecasts} />
            </div>
          )}

          {/* TAB 7: Telemetry Alerts */}
          {activeTab === 'alerts' && (
            <div className="max-w-[1600px] mx-auto">
              <AlertsView
                alerts={alerts}
                onAcknowledgeAlert={handleAcknowledgeAlert}
                onClearAll={handleClearAllAlerts}
              />
            </div>
          )}

          {/* TAB 8: Model Settings */}
          {activeTab === 'settings' && (
            <div className="max-w-[1600px] mx-auto">
              <SettingsView />
            </div>
          )}

          {/* TAB 9: Infrastructure Health & Telemetry */}
          {activeTab === 'health' && (
            <div className="max-w-[1600px] mx-auto">
              <HealthView telemetry={telemetry} />
            </div>
          )}
        </main>
      </div>

      {/* Bottom Sticky Infrastructure Telemetry Bar */}
      <SystemTelemetryBar
        telemetry={telemetry}
        onRefreshData={handleRefreshData}
        isRefreshing={isRefreshing}
      />
    </div>
  );
};

export default Dashboard;
