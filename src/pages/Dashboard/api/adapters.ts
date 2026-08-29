import {
  SatelliteState,
  ConstellationResponse,
  SystemTelemetryResponse,
  AlertRecord,
  RecentForecastRecord,
  MultiSatelliteResidualsResponse,
  DashboardOverviewResponse,
} from './client';
import { Satellite, SystemTelemetry, AlertItem, ForecastLog } from '../types';

// Color map for satellite visualization
const SATELLITE_COLORS: Record<string, string> = {
  G01: '#6FF2C0',
  G03: '#6FF2C0',
  G05: '#A78BFA',
  G07: '#38BDF8',
  G08: '#FBBF24',
  G10: '#F472B6',
  G11: '#38BDF8',
  G12: '#6FF2C0',
};

// Orbit type mapping: backend uses 'MEO' where frontend uses 'IGSO' for some NavIC sats
const ORBIT_TYPE_MAP: Record<string, string> = {
  MEO: 'IGSO',
  GEO: 'GEO',
  IGSO: 'IGSO',
};

// Satellite CSS overlay positions over the Earth video (layout constants)
const SATELLITE_POSITIONS: Record<string, { x: number; y: number; orbitLabel: string }> = {
  G01: { x: 28, y: 35, orbitLabel: 'GEO 55°E' },
  G03: { x: 52, y: 40, orbitLabel: 'GEO 83°E' },
  G05: { x: 74, y: 48, orbitLabel: 'GSO 111.75°E' },
  G07: { x: 82, y: 62, orbitLabel: 'GEO 129.5°E' },
  G08: { x: 20, y: 55, orbitLabel: 'GEO 32.5°E' },
  G10: { x: 38, y: 22, orbitLabel: 'MEO' },
  G11: { x: 42, y: 68, orbitLabel: 'MEO' },
  G12: { x: 68, y: 25, orbitLabel: 'GEO 55°E' },
};

export function mapSatelliteState(sat: SatelliteState): Satellite {
  const color = SATELLITE_COLORS[sat.id] || '#6FF2C0';
  const pos = SATELLITE_POSITIONS[sat.id];
  const frontendType = (ORBIT_TYPE_MAP[sat.type] || sat.type) as 'GEO' | 'IGSO' | 'MEO' | 'LEO';

  return {
    id: sat.id,
    name: sat.name,
    prn: parseInt(sat.id.replace(/\D/g, ''), 10) || 0,
    type: frontendType,
    health: sat.health_status as Satellite['health'],
    inclination: sat.inclination_deg,
    eccentricity: sat.eccentricity,
    semiMajorAxis: sat.position.alt_km + 6371,
    altitudeKm: sat.position.alt_km,
    currentOrbitResidual: sat.current_orbit_residual_m,
    currentClockResidual: sat.current_clock_residual_ns,
    predictionHorizon: `${sat.prediction_horizon_hrs} hrs`,
    confidenceLevel: sat.confidence_level_pct,
    color,
    orbitRadius: 2.5,
    orbitSpeed: 0.0015,
    currentAngle: (pos?.x || 50) / 100 * Math.PI * 2,
    inclinationRad: sat.inclination_deg * (Math.PI / 180),
    snrDbHz: 46 + Math.random() * 4,
    elevationDeg: 35 + Math.random() * 45,
    azimuthDeg: pos ? pos.x * 3.6 : Math.random() * 360,
    clockDriftRate: sat.current_clock_residual_ns * 0.1,
    lastContactUtc: sat.last_updated_utc,
    predictionSeries: [],
    historySeries: [],
  };
}

export function mapConstellation(resp: ConstellationResponse): Satellite[] {
  return resp.satellites.map(mapSatelliteState);
}

export function mapSystemTelemetry(resp: SystemTelemetryResponse): SystemTelemetry {
  const gpu = resp.gpu_status;
  return {
    gpuModel: gpu.device_name,
    gpuUsagePercent: gpu.utilization_pct,
    gpuMemoryUsedGb: +(gpu.memory_allocated_mb / 1024).toFixed(1),
    gpuMemoryTotalGb: +(gpu.memory_total_mb / 1024).toFixed(1),
    cpuUsagePercent: 0,
    ramUsagePercent: 0,
    uptimeSeconds: resp.uptime_seconds,
    apiStatus: resp.api_status as SystemTelemetry['apiStatus'],
    inferenceQueue: resp.inference_queue,
    lastUpdatedUtc: resp.data_last_updated,
    activeSatellites: 0,
    totalSatellites: 0,
    activeForecasts: 0,
    avgOrbitError: 0,
    avgClockError: 0,
    models: resp.loaded_models.map((m) => ({
      name: m.name,
      type: m.orbit_type,
      version: '',
      status: m.status as 'Loaded' | 'Loading' | 'Offline',
      vramMb: 0,
    })),
  };
}

export function mergeDashboardOverviewIntoTelemetry(
  telemetry: SystemTelemetry,
  overview: DashboardOverviewResponse,
): SystemTelemetry {
  return {
    ...telemetry,
    totalSatellites: overview.total_satellites,
    activeForecasts: overview.active_forecasts,
    activeSatellites: overview.active_forecasts,
    avgOrbitError: overview.avg_orbit_error_m,
    avgClockError: overview.avg_clock_error_ns,
  };
}

export function mapAlertRecord(record: AlertRecord): AlertItem {
  return {
    id: record.id,
    type: record.severity as AlertItem['type'],
    title: record.title,
    description: record.message,
    satelliteId: record.satellite_id,
    timestamp: record.relative_time,
    read: record.is_read,
  };
}

export function mapAlerts(records: AlertRecord[]): AlertItem[] {
  return records.map(mapAlertRecord);
}

export function mapForecastRecord(record: RecentForecastRecord): ForecastLog {
  return {
    id: record.id,
    timeUtc: record.time_utc,
    satType: record.sat_type as ForecastLog['satType'],
    model: record.model,
    rows: record.rows,
    status: record.status as ForecastLog['status'],
    executionTimeMs: 0,
    rmsErrorMeters: record.avg_orbit_error_m ?? 0,
  };
}

export function mapForecastHistory(records: RecentForecastRecord[]): ForecastLog[] {
  return records.map(mapForecastRecord);
}

// Residual chart satellite configs with colors
export const RESIDUAL_SAT_CONFIGS = [
  { id: 'G01', color: '#6FF2C0', name: 'NavIC-1A', satId: 'G01' },
  { id: 'G03', color: '#6FF2C0', name: 'NavIC-1C', satId: 'G03' },
  { id: 'G05', color: '#A78BFA', name: 'NavIC-1E', satId: 'G05' },
  { id: 'G07', color: '#38BDF8', name: 'NavIC-1G', satId: 'G07' },
  { id: 'G08', color: '#FBBF24', name: 'NavIC-1H', satId: 'G08' },
  { id: 'G10', color: '#F472B6', name: 'NavIC-1J', satId: 'G10' },
  { id: 'G11', color: '#38BDF8', name: 'NavIC-1K', satId: 'G11' },
  { id: 'G12', color: '#6FF2C0', name: 'NavIC-1L', satId: 'G12' },
];

// Map backend residual series to Recharts-compatible data
export function mapResidualsToChartData(
  resp: MultiSatelliteResidualsResponse,
): { data: Record<string, string | number>[]; satConfigs: typeof RESIDUAL_SAT_CONFIGS } {
  const data: Record<string, string | number>[] = [];

  for (let i = 0; i < resp.timestamps.length; i++) {
    const row: Record<string, string | number> = { time: resp.timestamps[i] };
    for (const series of resp.series) {
      const point = series.data_points[i];
      row[series.satellite_id] = point?.residual_m ?? point?.residual ?? 0;
    }
    data.push(row);
  }

  return {
    data,
    satConfigs: RESIDUAL_SAT_CONFIGS.map((c) => ({
      ...c,
      id: c.satId,
    })),
  };
}
