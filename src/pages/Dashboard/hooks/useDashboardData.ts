import { useState, useEffect, useCallback, useRef } from 'react';
import {
  fetchConstellation,
  fetchSystemTelemetry,
  fetchAlerts,
  fetchForecastHistory,
  fetchDashboardOverview,
  fetchOrbitResiduals,
  fetchSatelliteForecast,
  markAlertRead,
  uploadSatelliteForecast,
  type DashboardOverviewResponse,
  type MultiSatelliteResidualsResponse,
  type SatelliteForecastSummary,
} from '../api/client';
import {
  mapConstellation,
  mapSystemTelemetry,
  mapAlerts,
  mapForecastHistory,
  mergeDashboardOverviewIntoTelemetry,
} from '../api/adapters';
import { Satellite, ForecastLog, AlertItem, SystemTelemetry, SatelliteHealth } from '../types';

const EMPTY_TELEMETRY: SystemTelemetry = {
  gpuModel: '',
  gpuUsagePercent: 0,
  gpuMemoryUsedGb: 0,
  gpuMemoryTotalGb: 0,
  cpuUsagePercent: 0,
  ramUsagePercent: 0,
  uptimeSeconds: 0,
  apiStatus: 'Online',
  inferenceQueue: 0,
  lastUpdatedUtc: '',
  activeSatellites: 0,
  totalSatellites: 0,
  activeForecasts: 0,
  avgOrbitError: 0,
  avgClockError: 0,
  models: [],
};

export function useDashboardData() {
  const [satellites, setSatellites] = useState<Satellite[]>([]);
  const [selectedSatelliteId, setSelectedSatelliteId] = useState<string>('');
  const [telemetry, setTelemetry] = useState<SystemTelemetry>(EMPTY_TELEMETRY);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [forecasts, setForecasts] = useState<ForecastLog[]>(() => {
    try {
      const stored = localStorage.getItem('ephemeris_forecasts');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [dashboardOverview, setDashboardOverview] = useState<DashboardOverviewResponse | null>(null);
  const [orbitResiduals, setOrbitResiduals] = useState<MultiSatelliteResidualsResponse | null>(null);
  const [satelliteForecasts, setSatelliteForecasts] = useState<Record<string, SatelliteForecastSummary>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [utcTime, setUtcTime] = useState<Date>(new Date());
  const [isSimulating, setIsSimulating] = useState(true);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const intervalRefs = useRef<ReturnType<typeof setInterval>[]>([]);

  // Clock ticker
  useEffect(() => {
    const id = setInterval(() => {
      setUtcTime((prev) => new Date(prev.getTime() + 1000 * (isSimulating ? simulationSpeed : 0)));
    }, 1000);
    intervalRefs.current.push(id);
    return () => clearInterval(id);
  }, [isSimulating, simulationSpeed]);

  // Initial data fetch
  const loadInitialData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [constellationRes, telemetryRes, alertsRes, historyRes, overviewRes, residualsRes] =
        await Promise.allSettled([
          fetchConstellation(),
          fetchSystemTelemetry(),
          fetchAlerts(),
          fetchForecastHistory(50),
          fetchDashboardOverview(),
          fetchOrbitResiduals('24h'),
        ]);

      if (constellationRes.status === 'fulfilled') {
        const sats = mapConstellation(constellationRes.value);
        setSatellites(sats);
        if (sats.length > 0 && !selectedSatelliteId) {
          setSelectedSatelliteId(sats[0].id);
        }
      }

      if (telemetryRes.status === 'fulfilled') {
        let tel = mapSystemTelemetry(telemetryRes.value);
        if (overviewRes.status === 'fulfilled') {
          setDashboardOverview(overviewRes.value);
          tel = mergeDashboardOverviewIntoTelemetry(tel, overviewRes.value);
        }
        setTelemetry(tel);
      }

      if (alertsRes.status === 'fulfilled') {
        setAlerts(mapAlerts(alertsRes.value.alerts));
      }

      if (historyRes.status === 'fulfilled') {
        setForecasts(mapForecastHistory(historyRes.value.records));
      }

      if (overviewRes.status === 'fulfilled') {
        setDashboardOverview(overviewRes.value);
      }

      if (residualsRes.status === 'fulfilled') {
        setOrbitResiduals(residualsRes.value);
      }

      const failures = [constellationRes, telemetryRes, alertsRes, historyRes].filter(
        (r) => r.status === 'rejected',
      );
      if (failures.length > 0) {
        console.warn('Some API calls failed:', failures.map((f) => (f as PromiseRejectedResult).reason));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  }, [selectedSatelliteId]);

  useEffect(() => {
    loadInitialData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Polling: telemetry every 5s, alerts every 15s, constellation every 30s
  useEffect(() => {
    const telemetryInterval = setInterval(async () => {
      try {
        const [telemetryRes, overviewRes] = await Promise.allSettled([
          fetchSystemTelemetry(),
          fetchDashboardOverview(),
        ]);

        if (telemetryRes.status === 'fulfilled') {
          let tel = mapSystemTelemetry(telemetryRes.value);
          if (overviewRes.status === 'fulfilled') {
            tel = mergeDashboardOverviewIntoTelemetry(tel, overviewRes.value);
          }
          setTelemetry(tel);
        }
      } catch {
        // Silent fail for polling
      }
    }, 5000);

    const alertsInterval = setInterval(async () => {
      try {
        const res = await fetchAlerts();
        setAlerts(mapAlerts(res.alerts));
      } catch {
        // Silent fail for polling
      }
    }, 15000);

    const constellationInterval = setInterval(async () => {
      try {
        const [constellationRes, residualsRes] = await Promise.allSettled([
          fetchConstellation(),
          fetchOrbitResiduals('24h'),
        ]);
        if (constellationRes.status === 'fulfilled') {
          setSatellites(mapConstellation(constellationRes.value));
        }
        if (residualsRes.status === 'fulfilled') {
          setOrbitResiduals(residualsRes.value);
        }
      } catch {
        // Silent fail for polling
      }
    }, 30000);

    intervalRefs.current.push(telemetryInterval, alertsInterval, constellationInterval);

    return () => {
      intervalRefs.current.forEach(clearInterval);
      intervalRefs.current = [];
    };
  }, []);

  const selectedSatellite =
    satellites.find((s) => s.id === selectedSatelliteId) || satellites[0] || null;

  const handleRefreshData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const [telemetryRes, overviewRes] = await Promise.allSettled([
        fetchSystemTelemetry(),
        fetchDashboardOverview(),
      ]);
      if (telemetryRes.status === 'fulfilled') {
        let tel = mapSystemTelemetry(telemetryRes.value);
        if (overviewRes.status === 'fulfilled') {
          setDashboardOverview(overviewRes.value);
          tel = mergeDashboardOverviewIntoTelemetry(tel, overviewRes.value);
        }
        setTelemetry(tel);
      }
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  const handleAddForecast = useCallback((newForecast: ForecastLog) => {
    setForecasts((prev) => {
      const updated = [newForecast, ...prev];
      try {
        localStorage.setItem('ephemeris_forecasts', JSON.stringify(updated.slice(0, 100)));
      } catch { /* ignore quota errors */ }
      return updated;
    });
  }, []);

  const handleAcknowledgeAlert = useCallback(async (id: string) => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, read: true } : a)));
    try {
      await markAlertRead(id);
    } catch {
      // Optimistic update already applied
    }
  }, []);

  const handleClearAllAlerts = useCallback(() => {
    setAlerts((prev) => prev.map((a) => ({ ...a, read: true })));
  }, []);

  // Also persist the initial history from backend
  useEffect(() => {
    if (forecasts.length === 0) {
      // History will be loaded from backend on initial fetch
    }
  }, []);

  // Sync forecasts to localStorage when they change from backend
  useEffect(() => {
    if (forecasts.length > 0) {
      try {
        localStorage.setItem('ephemeris_forecasts', JSON.stringify(forecasts.slice(0, 100)));
      } catch { /* ignore quota errors */ }
    }
  }, [forecasts]);

  const handleSelectAlert = useCallback(
    (alert: AlertItem) => {
      if (alert.satelliteId) {
        setSelectedSatelliteId(alert.satelliteId);
      }
    },
    [],
  );

  const handleUpdateHealth = useCallback((id: string, health: SatelliteHealth) => {
    setSatellites((prev) =>
      prev.map((s) => (s.id === id ? { ...s, health } : s)),
    );
  }, []);

  const handleRunInference = useCallback(
    async (satId: string, file?: File, orbitType?: string) => {
      let result: SatelliteForecastSummary;
      if (file) {
        // Admin upload path
        result = await uploadSatelliteForecast(satId, file, orbitType);
      } else {
        // Server-side path (uses stored data)
        result = await fetchSatelliteForecast(satId);
      }
      // Store forecast for this satellite
      setSatelliteForecasts((prev) => ({ ...prev, [satId]: result }));
      // Refresh constellation after inference
      try {
        const constellationRes = await fetchConstellation();
        setSatellites(mapConstellation(constellationRes));
      } catch {
        // Continue even if refresh fails
      }
      return result;
    },
    [],
  );

  return {
    // Data
    satellites,
    selectedSatellite,
    selectedSatelliteId,
    setSelectedSatelliteId,
    telemetry,
    alerts,
    forecasts,
    dashboardOverview,
    orbitResiduals,

    // UI State
    isLoading,
    error,
    utcTime,
    isSimulating,
    setIsSimulating,
    simulationSpeed,
    setSimulationSpeed,
    isRefreshing,

    // Actions
    refreshAll: loadInitialData,
    refreshTelemetry: handleRefreshData,
    addForecast: handleAddForecast,
    acknowledgeAlert: handleAcknowledgeAlert,
    clearAllAlerts: handleClearAllAlerts,
    selectAlert: handleSelectAlert,
    updateHealth: handleUpdateHealth,
    runInference: handleRunInference,
    satelliteForecasts,
  };
}
