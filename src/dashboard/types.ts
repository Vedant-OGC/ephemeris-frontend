export type SatelliteHealth = 'Healthy' | 'Warning' | 'Critical' | 'Unknown';
export type SatelliteType = 'GEO' | 'MEO' | 'IGSO' | 'LEO';

export interface SatellitePredictionPoint {
  timeOffset: string; // 'Now', '+6h', '+12h', '+18h', '+24h'
  timestamp: string;
  orbitResidual: number; // in meters
  clockResidual: number; // in nanoseconds
  confidenceUpper?: number;
  confidenceLower?: number;
}

export interface Satellite {
  id: string; // e.g. 'G01'
  name: string;
  prn: number;
  type: SatelliteType;
  health: SatelliteHealth;
  inclination: number; // in degrees e.g. 0.00 or 55.0
  eccentricity: number; // e.g. 0.0001
  semiMajorAxis: number; // in km
  altitudeKm: number;
  currentOrbitResidual: number; // in meters e.g. 0.23
  currentClockResidual: number; // in ns e.g. 0.18
  predictionHorizon: string; // e.g. '24 hrs'
  confidenceLevel: number; // percentage e.g. 96
  color: string;
  // 3D Orbital parameters for visualization
  orbitRadius: number;
  orbitSpeed: number;
  currentAngle: number;
  inclinationRad: number;
  // Telemetry
  snrDbHz: number;
  elevationDeg: number;
  azimuthDeg: number;
  clockDriftRate: number; // ns/day
  lastContactUtc: string;
  predictionSeries: SatellitePredictionPoint[];
  historySeries: { time: string; residual: number }[];
}

export interface ForecastLog {
  id: string;
  timeUtc: string;
  satType: SatelliteType;
  model: string; // 'PRESTO GEO' | 'PRESTO MEO'
  rows: number;
  status: 'Completed' | 'Processing' | 'Failed';
  executionTimeMs: number;
  rmsErrorMeters: number;
}

export interface AlertItem {
  id: string;
  type: 'critical' | 'warning' | 'info' | 'success';
  title: string;
  description: string;
  satelliteId?: string;
  timestamp: string;
  read: boolean;
  metric?: string;
  value?: string;
  threshold?: string;
}

export interface SystemTelemetry {
  gpuModel: string;
  gpuUsagePercent: number;
  gpuMemoryUsedGb: number;
  gpuMemoryTotalGb: number;
  cpuUsagePercent: number;
  ramUsagePercent: number;
  uptimeSeconds: number;
  apiStatus: 'Online' | 'Degraded' | 'Offline';
  inferenceQueue: number;
  lastUpdatedUtc: string;
  activeSatellites: number;
  totalSatellites: number;
  activeForecasts: number;
  avgOrbitError: number;
  avgClockError: number;
  models: {
    name: string;
    type: string;
    version: string;
    status: 'Loaded' | 'Loading' | 'Offline';
    vramMb: number;
  }[];
}

export type DashboardTab =
  | 'dashboard'
  | 'forecast'
  | 'upload'
  | 'satellites'
  | 'analytics'
  | 'history'
  | 'alerts'
  | 'settings'
  | 'health';
