import { 
  AppState, 
  Frontend, 
  Backend, 
  Server, 
  ACL, 
  ConfigVersion,
  Alert,
  Certificate,
  HANode,
  AnalyticsData,
  User,
  Report,
  LogEntry,
  Stats,
  AppSettings
} from '../models/types';

// Generate random ID
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 11);
};

// Initial mock configuration
const MOCK_CONFIG = `global
    log /dev/log local0
    log /dev/log local1 notice
    chroot /var/lib/haproxy
    stats socket /run/haproxy/admin.sock mode 660 level admin
    stats timeout 30s
    user haproxy
    group haproxy
    daemon

defaults
    log     global
    mode    http
    option  httplog
    option  dontlognull
    timeout connect 5000
    timeout client  50000
    timeout server  50000

frontend web_front
    bind *:80
    default_backend app_servers

backend app_servers
    balance roundrobin
    server s1 10.0.1.10:80 check
    server s2 10.0.1.11:80 check
`;

class DataStore {
  private state: AppState;

  constructor() {
    this.state = this.generateInitialState();
  }

  private generateInitialState(): AppState {
    // Generate Frontends
    const frontends: Frontend[] = [
      { id: generateId(), name: 'web_front', status: 'active', bind: '*', port: 80, mode: 'http', defaultBackend: 'app_servers', maxConnections: 2000, sessions: 150, requestsPerSec: 25 },
      { id: generateId(), name: 'api_gateway', status: 'active', bind: '10.0.0.5', port: 81, mode: 'http', defaultBackend: 'auth_service', maxConnections: 2000, sessions: 89, requestsPerSec: 18 },
      { id: generateId(), name: 'admin_panel', status: 'active', bind: '10.0.0.5', port: 82, mode: 'http', defaultBackend: 'static_assets', maxConnections: 2000, sessions: 42, requestsPerSec: 8 },
    ];

    // Generate Backends and Servers
    const backends: Backend[] = [
      {
        id: generateId(),
        name: 'app_servers',
        mode: 'http',
        balance: 'roundrobin',
        servers: [
          { id: generateId(), name: 'app_servers_s1', address: '10.0.1.10', port: 8080, status: 'up', weight: 5, currentSessions: 12, totalSessions: 4523, lastStatusChange: new Date(Date.now() - 86400000).toISOString() },
          { id: generateId(), name: 'app_servers_s2', address: '10.0.1.11', port: 8080, status: 'up', weight: 5, currentSessions: 15, totalSessions: 4891, lastStatusChange: new Date(Date.now() - 86400000).toISOString() },
          { id: generateId(), name: 'app_servers_s3', address: '10.0.1.12', port: 8080, status: 'up', weight: 3, currentSessions: 8, totalSessions: 2345, lastStatusChange: new Date(Date.now() - 43200000).toISOString() },
        ],
        activeServers: 3,
        totalRequests: 125000,
      },
      {
        id: generateId(),
        name: 'auth_service',
        mode: 'http',
        balance: 'leastconn',
        servers: [
          { id: generateId(), name: 'auth_service_s1', address: '10.0.2.10', port: 8080, status: 'up', weight: 7, currentSessions: 18, totalSessions: 7821, lastStatusChange: new Date(Date.now() - 172800000).toISOString() },
          { id: generateId(), name: 'auth_service_s2', address: '10.0.2.11', port: 8080, status: 'up', weight: 7, currentSessions: 16, totalSessions: 7156, lastStatusChange: new Date(Date.now() - 172800000).toISOString() },
          { id: generateId(), name: 'auth_service_s3', address: '10.0.2.12', port: 8080, status: 'maint', weight: 5, currentSessions: 0, totalSessions: 3456, lastStatusChange: new Date(Date.now() - 3600000).toISOString() },
        ],
        activeServers: 2,
        totalRequests: 89000,
      },
      {
        id: generateId(),
        name: 'static_assets',
        mode: 'http',
        balance: 'source',
        servers: [
          { id: generateId(), name: 'static_assets_s1', address: '10.0.3.10', port: 8080, status: 'up', weight: 10, currentSessions: 5, totalSessions: 12345, lastStatusChange: new Date(Date.now() - 259200000).toISOString() },
          { id: generateId(), name: 'static_assets_s2', address: '10.0.3.11', port: 8080, status: 'down', weight: 10, currentSessions: 0, totalSessions: 9876, lastStatusChange: new Date(Date.now() - 600000).toISOString() },
          { id: generateId(), name: 'static_assets_s3', address: '10.0.3.12', port: 8080, status: 'up', weight: 8, currentSessions: 3, totalSessions: 8765, lastStatusChange: new Date(Date.now() - 259200000).toISOString() },
        ],
        activeServers: 2,
        totalRequests: 45000,
      },
    ];

    // Initial Stats History
    const statsHistory: Stats[] = Array.from({ length: 60 }).map((_, i) => {
      const now = Date.now();
      const time = now - (59 - i) * 1000;
      return {
        timestamp: time,
        timeLabel: new Date(time).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        requestsPerSec: Math.floor(Math.random() * 100) + 50,
        responseTime: Math.floor(Math.random() * 40) + 10,
        errorRate: Math.random() * 2,
        activeConnections: Math.floor(Math.random() * 500) + 200,
      };
    });

    const logs: LogEntry[] = [
      { id: generateId(), timestamp: new Date().toISOString(), level: 'info', message: 'HAProxy reload completed successfully', source: 'System' },
      { id: generateId(), timestamp: new Date(Date.now() - 10000).toISOString(), level: 'warn', message: 'Server app_servers_s1 is responding slowly', source: 'Health Check' },
      { id: generateId(), timestamp: new Date(Date.now() - 50000).toISOString(), level: 'success', message: 'Configuration saved', source: 'Admin' },
    ];

    const acls: ACL[] = [
      { id: generateId(), name: 'block_admin', frontendId: frontends[0].id, frontendName: frontends[0].name, criterion: 'path_beg', value: '/admin', action: 'deny' },
      { id: generateId(), name: 'api_traffic', frontendId: frontends[0].id, frontendName: frontends[0].name, criterion: 'path_beg', value: '/api', action: 'use_backend', actionValue: 'api_gateway' },
    ];

    const configHistory: ConfigVersion[] = [
      { id: generateId(), version: 3, content: MOCK_CONFIG, timestamp: new Date().toISOString(), author: 'admin', comment: 'Updated timeouts' },
      { id: generateId(), version: 2, content: MOCK_CONFIG, timestamp: new Date(Date.now() - 86400000).toISOString(), author: 'admin', comment: 'Added new backend' },
      { id: generateId(), version: 1, content: MOCK_CONFIG, timestamp: new Date(Date.now() - 172800000).toISOString(), author: 'system', comment: 'Initial config' },
    ];

    const alerts: Alert[] = [
      { id: generateId(), severity: 'warning', title: 'High Memory Usage', description: 'Memory usage exceeded 85% on Node 1', timestamp: new Date().toISOString(), active: true, metric: 'Memory', threshold: '85%' },
      { id: generateId(), severity: 'info', title: 'Backup Completed', description: 'Daily configuration backup successful', timestamp: new Date(Date.now() - 3600000).toISOString(), active: false },
    ];

    const certificates: Certificate[] = [
      { id: generateId(), domain: '*.example.com', issuer: "Let's Encrypt R3", expiryDate: new Date(Date.now() + 86400000 * 45).toISOString(), status: 'valid', autoRenew: true, serialNumber: '04:3a:7b:2c:1f:9e' },
      { id: generateId(), domain: 'api.example.com', issuer: "DigiCert High Assurance", expiryDate: new Date(Date.now() + 86400000 * 5).toISOString(), status: 'expiring', autoRenew: false, serialNumber: '08:2c:4d:1a:5f:8b' },
      { id: generateId(), domain: 'legacy.example.com', issuer: "Self Signed", expiryDate: new Date(Date.now() - 86400000).toISOString(), status: 'expired', autoRenew: false, serialNumber: '01:1a:2b:3c:4d:5e' },
    ];

    const haNodes: HANode[] = [
      { id: generateId(), name: 'haproxy-n1', role: 'master', status: 'online', address: '192.168.1.10', lastHeartbeat: new Date().toISOString(), configSyncStatus: 'synced' },
      { id: generateId(), name: 'haproxy-n2', role: 'backup', status: 'online', address: '192.168.1.11', lastHeartbeat: new Date().toISOString(), configSyncStatus: 'synced' },
      { id: generateId(), name: 'haproxy-n3', role: 'peer', status: 'syncing', address: '192.168.1.12', lastHeartbeat: new Date(Date.now() - 5000).toISOString(), configSyncStatus: 'out_of_sync' },
    ];

    const analytics: AnalyticsData = {
      topBrowsers: [
        { name: 'Chrome', value: 65 },
        { name: 'Firefox', value: 15 },
        { name: 'Safari', value: 12 },
        { name: 'Edge', value: 8 },
      ],
      geoDistribution: [
        { country: 'USA', requests: 45000 },
        { country: 'Germany', requests: 12000 },
        { country: 'Japan', requests: 8000 },
        { country: 'Brazil', requests: 5000 },
        { country: 'UK', requests: 4500 },
      ],
      trafficByHour: Array.from({ length: 24 }).map((_, i) => ({
        hour: `${i}:00`,
        requests: Math.floor(Math.random() * 5000) + 1000
      }))
    };

    const users: User[] = [
      { id: generateId(), name: 'Admin User', email: 'admin@haproxy.local', role: 'admin', lastLogin: new Date().toISOString(), password: 'admin123' },
      { id: generateId(), name: 'DevOps Team', email: 'devops@haproxy.local', role: 'editor', lastLogin: new Date(Date.now() - 86400000).toISOString(), password: 'devops123' },
      { id: generateId(), name: 'Monitor Viewer', email: 'viewer@haproxy.local', role: 'viewer', lastLogin: new Date(Date.now() - 172800000).toISOString(), password: 'viewer123' },
    ];

    const reports: Report[] = [
      { id: generateId(), title: 'Weekly Traffic Summary', type: 'pdf', generatedBy: 'Admin User', date: new Date(Date.now() - 86400000 * 2).toISOString(), size: '2.4 MB', status: 'ready' },
      { id: generateId(), title: 'Security Audit Log', type: 'csv', generatedBy: 'System', date: new Date(Date.now() - 86400000 * 7).toISOString(), size: '156 KB', status: 'ready' },
      { id: generateId(), title: 'Performance Analysis', type: 'pdf', generatedBy: 'DevOps Team', date: new Date().toISOString(), size: '0 KB', status: 'generating' },
    ];

    return {
      frontends,
      backends,
      statsHistory,
      logs,
      systemHealth: {
        cpuUsage: 15,
        memoryUsage: 24,
        uptime: '14d 2h 12m'
      },
      acls,
      configHistory,
      currentConfig: MOCK_CONFIG,
      settings: {
        refreshInterval: 5,
        theme: 'system',
        apiUrl: 'http://localhost:5555/api',
        notificationsEnabled: true,
      },
      alerts,
      certificates,
      haNodes,
      analytics,
      users,
      reports
    };
  }

  // Getter methods
  getState(): AppState {
    return this.state;
  }

  getFrontends(): Frontend[] {
    return this.state.frontends;
  }

  getFrontendById(id: string): Frontend | undefined {
    return this.state.frontends.find(f => f.id === id);
  }

  getBackends(): Backend[] {
    return this.state.backends;
  }

  getBackendById(id: string): Backend | undefined {
    return this.state.backends.find(b => b.id === id);
  }

  getStats(): Stats[] {
    return this.state.statsHistory;
  }

  getLogs(): LogEntry[] {
    return this.state.logs;
  }

  getACLs(): ACL[] {
    return this.state.acls;
  }

  getConfigHistory(): ConfigVersion[] {
    return this.state.configHistory;
  }

  getCurrentConfig(): string {
    return this.state.currentConfig;
  }

  getAlerts(): Alert[] {
    return this.state.alerts;
  }

  getCertificates(): Certificate[] {
    return this.state.certificates;
  }

  getHANodes(): HANode[] {
    return this.state.haNodes;
  }

  getAnalytics(): AnalyticsData {
    return this.state.analytics;
  }

  getUsers(): User[] {
    return this.state.users.map(({ password, ...user }) => user as User);
  }

  getUserByEmail(email: string): User | undefined {
    return this.state.users.find(u => u.email === email);
  }

  getReports(): Report[] {
    return this.state.reports;
  }

  getSystemHealth() {
    return this.state.systemHealth;
  }

  // Mutation methods
  addFrontend(frontend: Omit<Frontend, 'id' | 'sessions' | 'requestsPerSec'>): Frontend {
    const newFrontend: Frontend = {
      ...frontend,
      id: generateId(),
      sessions: 0,
      requestsPerSec: 0,
    };
    this.state.frontends.push(newFrontend);
    return newFrontend;
  }

  updateFrontend(id: string, updates: Partial<Frontend>): Frontend | null {
    const index = this.state.frontends.findIndex(f => f.id === id);
    if (index === -1) return null;
    this.state.frontends[index] = { ...this.state.frontends[index], ...updates };
    return this.state.frontends[index];
  }

  deleteFrontend(id: string): boolean {
    const index = this.state.frontends.findIndex(f => f.id === id);
    if (index === -1) return false;
    this.state.frontends.splice(index, 1);
    return true;
  }

  addBackend(backend: Omit<Backend, 'id' | 'activeServers' | 'totalRequests'>): Backend {
    const newBackend: Backend = {
      ...backend,
      id: generateId(),
      activeServers: backend.servers.filter(s => s.status === 'up').length,
      totalRequests: 0,
    };
    this.state.backends.push(newBackend);
    return newBackend;
  }

  deleteBackend(id: string): boolean {
    const index = this.state.backends.findIndex(b => b.id === id);
    if (index === -1) return false;
    this.state.backends.splice(index, 1);
    return true;
  }

  updateServerStatus(backendId: string, serverId: string, status: 'up' | 'down' | 'maint'): boolean {
    const backend = this.state.backends.find(b => b.id === backendId);
    if (!backend) return false;
    
    const server = backend.servers.find(s => s.id === serverId);
    if (!server) return false;
    
    server.status = status;
    server.lastStatusChange = new Date().toISOString();
    backend.activeServers = backend.servers.filter(s => s.status === 'up').length;
    return true;
  }

  addACL(acl: Omit<ACL, 'id'>): ACL {
    const newACL: ACL = {
      ...acl,
      id: generateId(),
    };
    this.state.acls.push(newACL);
    return newACL;
  }

  deleteACL(id: string): boolean {
    const index = this.state.acls.findIndex(a => a.id === id);
    if (index === -1) return false;
    this.state.acls.splice(index, 1);
    return true;
  }

  saveConfig(content: string, comment: string, author: string): ConfigVersion {
    const newVersion: ConfigVersion = {
      id: generateId(),
      version: this.state.configHistory[0].version + 1,
      content,
      timestamp: new Date().toISOString(),
      author,
      comment,
    };
    this.state.configHistory.unshift(newVersion);
    this.state.currentConfig = content;
    return newVersion;
  }

  rollbackConfig(versionId: string): boolean {
    const version = this.state.configHistory.find(v => v.id === versionId);
    if (!version) return false;
    this.state.currentConfig = version.content;
    return true;
  }

  deleteAlert(id: string): boolean {
    const index = this.state.alerts.findIndex(a => a.id === id);
    if (index === -1) return false;
    this.state.alerts.splice(index, 1);
    return true;
  }

  addUser(user: Omit<User, 'id' | 'lastLogin'>): User {
    const newUser: User = {
      ...user,
      id: generateId(),
      lastLogin: new Date().toISOString(),
    };
    this.state.users.push(newUser);
    const { password, ...userWithoutPassword } = newUser;
    return userWithoutPassword as User;
  }

  deleteUser(id: string): boolean {
    const index = this.state.users.findIndex(u => u.id === id);
    if (index === -1) return false;
    this.state.users.splice(index, 1);
    return true;
  }

  addReport(report: Omit<Report, 'id'>): Report {
    const newReport: Report = {
      ...report,
      id: generateId(),
    };
    this.state.reports.push(newReport);
    return newReport;
  }

  deleteReport(id: string): boolean {
    const index = this.state.reports.findIndex(r => r.id === id);
    if (index === -1) return false;
    this.state.reports.splice(index, 1);
    return true;
  }

  updateSettings(settings: Partial<AppSettings>): AppSettings {
    this.state.settings = { ...this.state.settings, ...settings };
    return this.state.settings;
  }

  addLog(log: Omit<LogEntry, 'id'>): void {
    const newLog: LogEntry = {
      ...log,
      id: generateId(),
    };
    this.state.logs.unshift(newLog);
    if (this.state.logs.length > 100) {
      this.state.logs = this.state.logs.slice(0, 100);
    }
  }

  addStats(stat: Stats): void {
    this.state.statsHistory.push(stat);
    if (this.state.statsHistory.length > 60) {
      this.state.statsHistory.shift();
    }
  }
}

// Singleton instance
export const dataStore = new DataStore();
