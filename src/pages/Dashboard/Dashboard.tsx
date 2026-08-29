import React from 'react';
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

// Data hook & adapters
import { useDashboardData } from './hooks/useDashboardData';
import { RESIDUAL_SAT_CONFIGS, mapResidualsToChartData } from './api/adapters';

import { DashboardTab } from './types';

interface DashboardProps {
  onBackToLanding?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onBackToLanding }) => {
  const data = useDashboardData();
  const [activeTab, setActiveTab] = React.useState<DashboardTab>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  const {
    satellites,
    selectedSatellite,
    selectedSatelliteId,
    setSelectedSatelliteId,
    telemetry,
    alerts,
    forecasts,
    dashboardOverview,
    orbitResiduals,
    isLoading,
    utcTime,
    isSimulating,
    setIsSimulating,
    simulationSpeed,
    setSimulationSpeed,
    isRefreshing,
    refreshTelemetry,
    addForecast,
    acknowledgeAlert,
    clearAllAlerts,
    selectAlert,
    updateHealth,
  } = data;

  const unreadAlertCount = alerts.filter((a) => !a.read).length;

  // Map residual data for charts
  const residualChartData = orbitResiduals ? mapResidualsToChartData(orbitResiduals) : null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050608] text-white flex items-center justify-center font-inter">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-[#6FF2C0] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-mono text-white/60">CONNECTING TO EPHEMERIS BACKEND...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050608] text-white flex flex-col font-inter selection:bg-emerald-500/30 selection:text-emerald-200">
      <Header
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onBackToLanding={onBackToLanding}
        utcTime={utcTime}
        isSimulating={isSimulating}
        onToggleSimulation={() => setIsSimulating(!isSimulating)}
        simulationSpeed={simulationSpeed}
        onChangeSpeed={(speed) => setSimulationSpeed(speed)}
        alerts={alerts}
        onSelectAlert={selectAlert}
      />

      <div className="flex-1 flex overflow-hidden relative">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          activeTab={activeTab}
          onSelectTab={(tab) => setActiveTab(tab)}
          unreadAlertCount={unreadAlertCount}
        />

        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 technical-grid bg-[#060407]/80">
          {activeTab === 'dashboard' && (
            <div className="space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-200">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8">
                  <ConstellationGlobe
                    satellites={satellites}
                    selectedSatelliteId={selectedSatelliteId}
                    onSelectSatellite={(id) => setSelectedSatelliteId(id)}
                    isSimulating={isSimulating}
                  />
                </div>
                <div className="lg:col-span-4">
                  {selectedSatellite && (
                    <SatelliteInspector
                      satellite={selectedSatellite}
                      allSatellites={satellites}
                      onSelectSatellite={(id) => setSelectedSatelliteId(id)}
                    />
                  )}
                </div>
              </div>

              <MetricCards
                telemetry={telemetry}
                lastPredictionTime={dashboardOverview?.last_prediction_utc || 'N/A'}
                lastPredictionDate={dashboardOverview?.utc_time || ''}
              />

              <div className="w-full">
                <OrbitResidualAllChart
                  selectedSatelliteId={selectedSatelliteId}
                  onSelectSatellite={(id) => setSelectedSatelliteId(id)}
                  chartData={residualChartData?.data || []}
                  satConfigs={residualChartData?.satConfigs || RESIDUAL_SAT_CONFIGS}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <RecentForecastsTable
                  forecasts={forecasts}
                  onNavigateTab={(tab) => setActiveTab(tab)}
                  onSelectForecast={() => setActiveTab('history')}
                />
                <AlertsWidget
                  alerts={alerts}
                  onNavigateTab={(tab) => setActiveTab(tab)}
                  onSelectAlert={selectAlert}
                />
              </div>
            </div>
          )}

          {activeTab === 'forecast' && (
            <div className="max-w-[1600px] mx-auto">
              <ForecastView
                satellites={satellites}
                onAddForecast={addForecast}
              />
            </div>
          )}

          {activeTab === 'satellites' && (
            <div className="max-w-[1600px] mx-auto">
              <SatellitesView
                satellites={satellites}
                selectedSatelliteId={selectedSatelliteId}
                onSelectSatellite={(id) => setSelectedSatelliteId(id)}
                onUpdateHealth={updateHealth}
              />
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="max-w-[1600px] mx-auto">
              <AnalyticsView
                satellites={satellites}
                residuals={orbitResiduals}
              />
            </div>
          )}

          {activeTab === 'upload' && (
            <div className="max-w-[1600px] mx-auto">
              <UploadDatasetView />
            </div>
          )}

          {activeTab === 'history' && (
            <div className="max-w-[1600px] mx-auto">
              <HistoryView forecasts={forecasts} />
            </div>
          )}

          {activeTab === 'alerts' && (
            <div className="max-w-[1600px] mx-auto">
              <AlertsView
                alerts={alerts}
                onAcknowledgeAlert={acknowledgeAlert}
                onClearAll={clearAllAlerts}
              />
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="max-w-[1600px] mx-auto">
              <SettingsView />
            </div>
          )}

          {activeTab === 'health' && (
            <div className="max-w-[1600px] mx-auto">
              <HealthView telemetry={telemetry} />
            </div>
          )}
        </main>
      </div>

      <SystemTelemetryBar
        telemetry={telemetry}
        onRefreshData={refreshTelemetry}
        isRefreshing={isRefreshing}
      />
    </div>
  );
};

export default Dashboard;
