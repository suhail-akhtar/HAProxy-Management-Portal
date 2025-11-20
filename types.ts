
export interface Frontend {
  id: string;
  name: string;
  status: 'active' | 'stopped';
  bind: string;
  port: number;
  mode: 'http' | 'tcp';
  defaultBackend: string;
  maxConnections: number;
  sessions: number;
  requestsPerSec: number;
}

export interface Server {
  id: string;
  name: string;
  address: string;
  port: number;
  status: 'up' | 'down' | 'maint';
  weight: number;
  currentSessions: number;
  totalSessions: number;
  lastStatusChange: string;
}

export interface Backend {
  id: string;
  name: string;
  mode: 'http' | 'tcp';
  balance: string;
  servers: Server[];
  activeServers: number;
  totalRequests: number;
}

export interface Stats {
  timestamp: number;
  timeLabel: string;
  requestsPerSec: number;
  responseTime: number;
  errorRate: number;
  activeConnections: number;
}

export interface SystemHealth {
  cpuUsage: number;
  memoryUsage: number;
  uptime: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
  source: string;
}

export interface ACL {
  id: string;
  name: string;
  frontendId: string;
  frontendName: string;
  criterion: string;
  value: string;
  action: 'allow' | 'deny' | 'http-request' | 'use_backend';
  actionValue?: string;
}

export interface ConfigVersion {
  id: string;
  version: number;
  content: string;
  timestamp: string;
  author: string;
  comment: string;
}

export interface AppSettings {
  refreshInterval: number;
  theme: 'light' | 'dark' | 'system';
  apiUrl: string;
  notificationsEnabled: boolean;
}

export interface Alert {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  timestamp: string;
  active: boolean;
  metric?: string;
  threshold?: string;
}

export interface Certificate {
  id: string;
  domain: string;
  issuer: string;
  expiryDate: string;
  status: 'valid' | 'expiring' | 'expired';
  autoRenew: boolean;
  serialNumber: string;
}

export interface HANode {
  id: string;
  name: string;
  role: 'master' | 'backup' | 'peer';
  status: 'online' | 'offline' | 'syncing';
  address: string;
  lastHeartbeat: string;
  configSyncStatus: 'synced' | 'out_of_sync' | 'unknown';
}

export interface AnalyticsData {
  topBrowsers: { name: string; value: number }[];
  geoDistribution: { country: string; requests: number }[];
  trafficByHour: { hour: string; requests: number }[];
}

export type Role = 'admin' | 'editor' | 'viewer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  lastLogin: string;
}

export interface Report {
  id: string;
  title: string;
  type: 'pdf' | 'csv' | 'json';
  generatedBy: string;
  date: string;
  size: string;
  status: 'ready' | 'generating' | 'failed';
}

export interface AppState {
  frontends: Frontend[];
  backends: Backend[];
  statsHistory: Stats[];
  logs: LogEntry[];
  systemHealth: SystemHealth;
  acls: ACL[];
  configHistory: ConfigVersion[];
  currentConfig: string;
  settings: AppSettings;
  alerts: Alert[];
  certificates: Certificate[];
  haNodes: HANode[];
  analytics: AnalyticsData;
  users: User[];
  reports: Report[];
}

export type RouteName = 
  | 'dashboard' 
  | 'frontends' 
  | 'frontend-details' 
  | 'backends' 
  | 'backend-details' 
  | 'servers' 
  | 'configuration' 
  | 'acls' 
  | 'settings'
  | 'monitoring'
  | 'alerts'
  | 'certificates'
  | 'ha'
  | 'analytics'
  | 'users'
  | 'reports'
  | 'help';
