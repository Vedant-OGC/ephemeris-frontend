/**
 * EPHEMERIS Backend API Client Service Layer
 * Connects the Frontend Dashboard to the FastAPI GNSS Forecast Backend Service.
 * Features automatic fallback to local simulated data when the backend is offline.
 */
import {
  Satellite,
  SatelliteHealth,
  SatelliteType,
  SatellitePredictionPoint,
  ForecastLog,
  AlertItem,
  SystemTelemetry,
} from '../types';
import {
  INITIAL_SATELLITES,
  INITIAL_FORECASTS,
  INITIAL_ALERTS,
  INITIAL_SYSTEM_TELEMETRY,
  GENERATE_TIME_SERIES_DATA,
} from '../data/initialData';

export const API_BASE_URL =
  ((import.meta as any).env?.VITE_API_URL as string) || 'http://127.0.0.1:8000';

// Helper for safe JSON fetch with timeout
async function safeFetch<T>(
  endpoint: string,
  options?: RequestInit,
  timeoutMs = 4000
): Promise<T | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const url = endpoint.startsWith('http')
      ? endpoint
      : `${API_BASE_URL}${endpoint}`;

    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      console.warn(`[API] Endpoint ${endpoint} returned status ${res.status}`);
      return null;
    }

    return (await res.json()) as T;
  } catch (err) {
    clearTimeout(timeoutId);
    return null;
  }
}

// ==========================================
// 1. Dashboard Overview & Health
// ==========================================
export async function getDashboardOverview() {
  const data = await safeFetch<{
    total_satellites: number;
    active_forecasts: number;
    avg_orbit_error_m: number;
    avg_clock_error_ns: number;
    last_prediction_utc: string;
    system_status: string;
    system_status_message: string;
    utc_time: string;
  }>('/api/dashboard/overview');

  return data;
}

export async function checkBackendHealth(): Promise<boolean> {
  const data = await safeFetch<{ status: string }>('/health', {}, 2000);
  return data?.status === 'ok';
}

// ==========================================
// 2. Satellites & Constellation
// ==========================================
export async function getConstellation(): Promise<Satellite[]> {
  const data = await safeFetch<{
    total_count: number;
    satellites: Array<{
      id: string;
      name: string;
      type: string;
      health_status: string;
      inclination_deg: number;
      eccentricity: number;
      current_orbit_residual_m: number;
      current_clock_residual_ns: number;
      prediction_horizon_hrs: number;
      confidence_level_pct: number;
      position: {
        x: number;
        y: number;
        z: number;
        lat: number;
        lon: number;
        alt_km: number;
      };
      last_updated_utc: string;
    }>;
  }>('/api/satellites');

  if (data && data.satellites && data.satellites.length > 0) {
    return data.satellites.map((sat, idx) => {
      const existing =
        INITIAL_SATELLITES.find((s) => s.id === sat.name || s.id === sat.id) ||
        INITIAL_SATELLITES[idx % INITIAL_SATELLITES.length];

      let mappedHealth: SatelliteHealth = 'Healthy';
      const statusLower = (sat.health_status || '').toLowerCase();
      if (statusLower === 'warning') mappedHealth = 'Warning';
      else if (statusLower === 'critical') mappedHealth = 'Critical';
      else if (statusLower === 'unknown') mappedHealth = 'Unknown';

      const satDisplayName = sat.name && sat.name.startsWith('NavIC') ? sat.name : existing.id;

      return {
        ...existing,
        id: satDisplayName,
        name: sat.name || existing.name,
        type: (sat.type as SatelliteType) || existing.type,
        health: mappedHealth,
        altitudeKm: sat.position?.alt_km || existing.altitudeKm,
        inclination: sat.inclination_deg || existing.inclination,
        currentOrbitResidual: sat.current_orbit_residual_m > 0 ? sat.current_orbit_residual_m : existing.currentOrbitResidual,
        currentClockResidual: sat.current_clock_residual_ns > 0 ? sat.current_clock_residual_ns : existing.currentClockResidual,
        confidenceLevel: sat.confidence_level_pct > 0 ? sat.confidence_level_pct : existing.confidenceLevel,
      };
    });
  }

  return INITIAL_SATELLITES;
}

export async function getSatelliteForecast(satId: string): Promise<SatellitePredictionPoint[] | null> {
  const data = await safeFetch<{
    satellite_id: string;
    satellite_name: string;
    orbit_type: string;
    prediction_horizon_hours: number;
    confidence_level_pct: number;
    current_orbit_residual_m: number;
    current_clock_residual_ns: number;
    forecast_points: Array<{
      forecast_horizon_minutes: number;
      time_label: string;
      x_error: number;
      y_error: number;
      z_error: number;
      satclockerror: number;
      orbit_residual_3d: number;
    }>;
  }>(`/api/satellites/${satId}/forecast`);

  if (data && data.forecast_points && data.forecast_points.length > 0) {
    return data.forecast_points.map((pt) => ({
      timeOffset: pt.time_label,
      timestamp: `${pt.forecast_horizon_minutes}m`,
      orbitResidual: pt.orbit_residual_3d,
      clockResidual: pt.satclockerror,
      confidenceUpper: pt.orbit_residual_3d + 0.05,
      confidenceLower: Math.max(0, pt.orbit_residual_3d - 0.05),
    }));
  }

  return null;
}

// ==========================================
// 3. Analytics & Multi-Satellite Residuals
// ==========================================
export async function getMultiSatelliteResiduals(timeRange = '24h') {
  const data = await safeFetch<{
    time_range: string;
    timestamps: string[];
    series: Array<{
      satellite_id: string;
      orbit_type: string;
      health_status: string;
      data_points: Array<{ time: string; residual_m: number }>;
    }>;
  }>(`/api/analytics/orbit-residuals?range=${timeRange}`);

  if (data && data.series && data.series.length > 0) {
    const timeMap: Record<string, any> = {};

    data.series.forEach((s) => {
      s.data_points.forEach((dp) => {
        if (!timeMap[dp.time]) {
          timeMap[dp.time] = { time: dp.time };
        }
        timeMap[dp.time][s.satellite_id] = dp.residual_m;
      });
    });

    return Object.values(timeMap);
  }

  const hours = timeRange === '6h' ? 6 : timeRange === '12h' ? 12 : timeRange === '48h' ? 48 : 24;
  return GENERATE_TIME_SERIES_DATA(hours);
}

// ==========================================
// 4. Alerts & Notifications
// ==========================================
export async function getAlerts(): Promise<AlertItem[]> {
  const data = await safeFetch<{
    total_unread: number;
    alerts: Array<{
      id: string;
      type: string;
      severity: string;
      title: string;
      satellite_id?: string;
      message: string;
      timestamp_utc: string;
      relative_time: string;
      is_read: boolean;
    }>;
  }>('/api/alerts');

  if (data && data.alerts && data.alerts.length > 0) {
    return data.alerts.map((a) => ({
      id: a.id,
      title: a.title,
      description: a.message,
      timestamp: a.relative_time || a.timestamp_utc,
      type: (a.severity.toLowerCase() as 'critical' | 'warning' | 'info' | 'success') || 'info',
      read: a.is_read,
      satelliteId: a.satellite_id,
    }));
  }

  return INITIAL_ALERTS;
}

export async function markAlertAsRead(alertId: string): Promise<boolean> {
  const data = await safeFetch<{ status: string }>(`/api/alerts/${alertId}/read`, {
    method: 'POST',
  });
  return data?.status === 'ok';
}

// ==========================================
// 5. Prediction History
// ==========================================
export async function getForecastHistory(limit = 50): Promise<ForecastLog[]> {
  const data = await safeFetch<{
    total_records: number;
    records: Array<{
      id: string;
      time_utc: string;
      satellite_id?: string;
      sat_type: string;
      model: string;
      rows: number;
      status: string;
      avg_orbit_error_m?: number;
      avg_clock_error_ns?: number;
    }>;
  }>(`/api/history/forecasts?limit=${limit}`);

  if (data && data.records && data.records.length > 0) {
    return data.records.map((r) => ({
      id: r.id,
      timeUtc: r.time_utc,
      satType: (r.sat_type as SatelliteType) || 'GEO',
      model: r.model,
      rows: r.rows || 14500,
      executionTimeMs: 420,
      rmsErrorMeters: r.avg_orbit_error_m ?? 0.12,
      status: 'Completed',
    }));
  }

  return INITIAL_FORECASTS;
}

// ==========================================
// 6. System Telemetry & Hardware Stats
// ==========================================
export async function getSystemTelemetry(): Promise<SystemTelemetry> {
  const data = await safeFetch<{
    gpu_status: {
      available: boolean;
      device_name: string;
      utilization_pct: number;
      memory_allocated_mb: number;
      memory_total_mb: number;
    };
    loaded_models: Array<{
      name: string;
      orbit_type: string;
      status: string;
      device: string;
    }>;
    uptime: string;
    uptime_seconds: number;
    api_status: string;
    inference_queue: number;
    data_last_updated: string;
  }>('/api/system/telemetry');

  if (data) {
    return {
      ...INITIAL_SYSTEM_TELEMETRY,
      gpuModel: data.gpu_status?.device_name || INITIAL_SYSTEM_TELEMETRY.gpuModel,
      gpuUsagePercent: Math.round(data.gpu_status?.utilization_pct ?? INITIAL_SYSTEM_TELEMETRY.gpuUsagePercent),
      activeForecasts: data.inference_queue > 0 ? data.inference_queue : INITIAL_SYSTEM_TELEMETRY.activeForecasts,
      uptimeSeconds: data.uptime_seconds || INITIAL_SYSTEM_TELEMETRY.uptimeSeconds,
      lastUpdatedUtc: data.data_last_updated || INITIAL_SYSTEM_TELEMETRY.lastUpdatedUtc,
    };
  }

  return INITIAL_SYSTEM_TELEMETRY;
}

// ==========================================
// 7. ML Inference & CSV Upload
// ==========================================
export async function runForecastInference(file: File, orbitType = 'GEO') {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE_URL}/forecast/json?orbit_type=${orbitType}`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Inference error (${res.status}): ${errText}`);
  }

  return await res.json();
}

export async function uploadSatelliteForecastCSV(
  satId: string,
  file: File,
  orbitType?: string
) {
  const formData = new FormData();
  formData.append('file', file);

  const query = orbitType ? `?orbit_type=${orbitType}` : '';
  const res = await fetch(
    `${API_BASE_URL}/api/satellites/${satId}/forecast/upload${query}`,
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Upload error (${res.status}): ${errText}`);
  }

  return await res.json();
}
