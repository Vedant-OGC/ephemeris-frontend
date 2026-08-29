const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`API ${res.status} ${res.statusText}: ${body}`);
  }

  return res.json() as Promise<T>;
}

// --- Dashboard Overview ---

export interface DashboardOverviewResponse {
  total_satellites: number;
  active_forecasts: number;
  avg_orbit_error_m: number;
  avg_clock_error_ns: number;
  last_prediction_utc: string;
  system_status: string;
  system_status_message: string;
  utc_time: string;
}

export function fetchDashboardOverview(): Promise<DashboardOverviewResponse> {
  return request<DashboardOverviewResponse>('/api/dashboard/overview');
}

// --- Satellites ---

export interface SatellitePosition3D {
  x: number;
  y: number;
  z: number;
  lat: number;
  lon: number;
  alt_km: number;
}

export interface SatelliteState {
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
  position: SatellitePosition3D;
  last_updated_utc: string;
}

export interface ConstellationResponse {
  total_count: number;
  healthy_count: number;
  warning_count: number;
  critical_count: number;
  satellites: SatelliteState[];
}

export function fetchConstellation(): Promise<ConstellationResponse> {
  return request<ConstellationResponse>('/api/satellites');
}

export function fetchSatellite(satId: string): Promise<SatelliteState> {
  return request<SatelliteState>(`/api/satellites/${satId}`);
}

// --- Satellite Forecast ---

export interface ForecastPoint {
  forecast_horizon_minutes: number;
  time_label: string;
  x_error: number;
  y_error: number;
  z_error: number;
  satclockerror: number;
  orbit_residual_3d: number;
  x_error_ci_lower: number;
  x_error_ci_upper: number;
  y_error_ci_lower: number;
  y_error_ci_upper: number;
  z_error_ci_lower: number;
  z_error_ci_upper: number;
  satclockerror_ci_lower: number;
  satclockerror_ci_upper: number;
  orbit_residual_ci_lower: number;
  orbit_residual_ci_upper: number;
}

export interface SatelliteForecastSummary {
  satellite_id: string;
  satellite_name: string;
  orbit_type: string;
  prediction_horizon_hours: number;
  confidence_level_pct: number;
  current_orbit_residual_m: number;
  current_clock_residual_ns: number;
  forecast_points: ForecastPoint[];
}

export function fetchSatelliteForecast(satId: string): Promise<SatelliteForecastSummary> {
  return request<SatelliteForecastSummary>(`/api/satellites/${satId}/forecast`);
}

export async function uploadSatelliteForecast(
  satId: string,
  file: File,
  orbitType?: string,
): Promise<SatelliteForecastSummary> {
  const formData = new FormData();
  formData.append('file', file);
  if (orbitType) {
    const params = new URLSearchParams({ orbit_type: orbitType });
    const url = `${BASE_URL}/api/satellites/${satId}/forecast/upload?${params}`;
    const res = await fetch(url, { method: 'POST', body: formData });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(`API ${res.status}: ${body}`);
    }
    return res.json() as Promise<SatelliteForecastSummary>;
  }
  const url = `${BASE_URL}/api/satellites/${satId}/forecast/upload`;
  const res = await fetch(url, { method: 'POST', body: formData });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`API ${res.status}: ${body}`);
  }
  return res.json() as Promise<SatelliteForecastSummary>;
}

// --- Analytics / Orbit Residuals ---

export interface SatelliteResidualSeries {
  satellite_id: string;
  orbit_type: string;
  health_status: string;
  data_points: { time: string; residual_m?: number; residual?: number }[];
}

export interface MultiSatelliteResidualsResponse {
  time_range: string;
  timestamps: string[];
  series: SatelliteResidualSeries[];
}

export function fetchOrbitResiduals(range: string = '24h'): Promise<MultiSatelliteResidualsResponse> {
  return request<MultiSatelliteResidualsResponse>(`/api/analytics/orbit-residuals?range=${range}`);
}

// --- Alerts ---

export interface AlertRecord {
  id: string;
  type: string;
  severity: string;
  title: string;
  satellite_id?: string;
  message: string;
  timestamp_utc: string;
  relative_time: string;
  is_read: boolean;
}

export interface AlertsResponse {
  total_unread: number;
  alerts: AlertRecord[];
}

export function fetchAlerts(): Promise<AlertsResponse> {
  return request<AlertsResponse>('/api/alerts');
}

export function markAlertRead(alertId: string): Promise<{ status: string; alert_id: string; is_read: boolean }> {
  return request(`/api/alerts/${alertId}/read`, { method: 'POST' });
}

// --- Forecast History ---

export interface RecentForecastRecord {
  id: string;
  time_utc: string;
  satellite_id?: string;
  sat_type: string;
  model: string;
  rows: number;
  status: string;
  avg_orbit_error_m?: number;
  avg_clock_error_ns?: number;
}

export interface ForecastHistoryResponse {
  total_records: number;
  records: RecentForecastRecord[];
}

export function fetchForecastHistory(limit: number = 50): Promise<ForecastHistoryResponse> {
  return request<ForecastHistoryResponse>(`/api/history/forecasts?limit=${limit}`);
}

// --- System Telemetry ---

export interface GpuTelemetry {
  available: boolean;
  device_name: string;
  utilization_pct: number;
  memory_allocated_mb: number;
  memory_total_mb: number;
}

export interface ModelStatus {
  name: string;
  orbit_type: string;
  status: string;
  device: string;
}

export interface SystemTelemetryResponse {
  gpu_status: GpuTelemetry;
  loaded_models: ModelStatus[];
  uptime: string;
  uptime_seconds: number;
  api_status: string;
  inference_queue: number;
  data_last_updated: string;
}

export function fetchSystemTelemetry(): Promise<SystemTelemetryResponse> {
  return request<SystemTelemetryResponse>('/api/system/telemetry');
}

// --- General Forecast ---

export async function runForecastJson(
  file: File,
  orbitType: string,
): Promise<{ orbit_type: string; prediction_horizon_points: number; forecast: ForecastPoint[] }> {
  const formData = new FormData();
  formData.append('file', file);
  const params = new URLSearchParams({ orbit_type: orbitType });
  const url = `${BASE_URL}/forecast/json?${params}`;
  const res = await fetch(url, { method: 'POST', body: formData });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`API ${res.status}: ${body}`);
  }
  return res.json();
}

// --- Server-side Forecast (no file upload) ---

/**
 * Run forecast using server-stored 7-day data for a satellite.
 * No file upload required — backend loads the CSV from its data store.
 */
export function runSatelliteForecast(
  satId: string,
  orbitType?: string,
): Promise<SatelliteForecastSummary> {
  const qs = orbitType ? `?orbit_type=${orbitType}` : '';
  return request<SatelliteForecastSummary>(
    `/api/satellites/${satId}/forecast${qs}`,
    { method: 'POST' },
  );
}

// --- Raw 7-day History Data ---

export interface SatelliteRawHistoryResponse {
  satellite_id: string;
  epochs: number;
  columns: string[];
  data: Record<string, any>[];
}

export function fetchSatelliteRawHistory(
  satId: string,
): Promise<SatelliteRawHistoryResponse> {
  return request<SatelliteRawHistoryResponse>(
    `/api/satellites/${satId}/history/raw`,
  );
}
