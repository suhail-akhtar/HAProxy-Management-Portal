
import { Backend, Frontend, LogEntry, Server, Stats, ACL, ConfigVersion, AppState, Alert, Certificate, HANode, AnalyticsData, User, Report } from '../types';

export const generateId = () => Math.random().toString(36).substr(2, 9);

const FRONTEND_NAMES = ['web_front', 'api_gateway', 'admin_panel'];
const BACKEND_NAMES = ['app_servers', 'auth_service', 'static_assets', 'payment_gateway', 'notifications'];
const ALGORITHMS = ['roundrobin', 'leastconn', 'source'];

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

export const generateInitialData = (): AppState => {
  // Generate Frontends
  const frontends: Frontend[] = FRONTEND_NAMES.map((name, idx) => ({
    id: generateId(),
    name,
    status: 'active',
    bind: idx === 0 ? '*' : '10.0.0.5',
    port: 80 + idx,
    mode: 'http',
    defaultBackend: BACKEND_NAMES[idx] || BACKEND_NAMES[0],
    maxConnections: 2000,
    sessions: Math.floor(Math.random() * 1000),
    requestsPerSec: Math.floor(Math.random() * 50) + 10,
  }));

  // Generate Backends and Servers
  const backends: Backend[] = BACKEND_NAMES.map((name) => {
    const serverCount = 3;
    const servers: Server[] = Array.from({ length: serverCount }).map((_, idx) => ({
      id: generateId(),
      name: `${name}_s${idx + 1}`,
      address: `10.0.1.${Math.floor(Math.random() * 255)}`,
      port: 8080,
      status: Math.random() > 0.9 ? 'down' : (Math.random() > 0.9 ? 'maint' : 'up'),
      weight: Math.floor(Math.random() * 10) + 1,
      currentSessions: Math.floor(Math.random() * 50),
      totalSessions: Math.floor(Math.random() * 10000),
      lastStatusChange: new Date(Date.now() - Math.floor(Math.random() * 86400000)).toISOString(),
    }));

    const activeServers = servers.filter(s => s.status === 'up').length;

    return {
      id: generateId(),
      name,
      mode: 'http',
      balance: ALGORITHMS[Math.floor(Math.random() * ALGORITHMS.length)],
      servers,
      activeServers,
      totalRequests: Math.floor(Math.random() * 500000),
    };
  });

  // Initial Stats History (last 60 seconds)
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

  // Phase 4 Data
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

  // Phase 5 Data
  const users: User[] = [
    { id: generateId(), name: 'Admin User', email: 'admin@haproxy.local', role: 'admin', lastLogin: new Date().toISOString() },
    { id: generateId(), name: 'DevOps Team', email: 'devops@haproxy.local', role: 'editor', lastLogin: new Date(Date.now() - 86400000).toISOString() },
    { id: generateId(), name: 'Monitor Viewer', email: 'viewer@haproxy.local', role: 'viewer', lastLogin: new Date(Date.now() - 172800000).toISOString() },
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
      apiUrl: 'http://localhost:5555/v2',
      notificationsEnabled: true,
    },
    alerts,
    certificates,
    haNodes,
    analytics,
    users,
    reports
  };
};

export const generateNextTick = (currentStats: Stats[], currentFrontends: Frontend[]) => {
  const now = Date.now();
  
  // Random variation
  const baseRps = 150;
  const variance = Math.floor(Math.random() * 40) - 20;
  const newRps = Math.max(0, baseRps + variance);
  
  const newResponseTime = Math.max(5, 25 + (Math.random() * 20 - 10));
  const newErrorRate = Math.random() > 0.95 ? Math.random() * 5 : 0;

  const newStat: Stats = {
    timestamp: now,
    timeLabel: new Date(now).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    requestsPerSec: newRps,
    responseTime: newResponseTime,
    errorRate: newErrorRate,
    activeConnections: Math.floor(newRps * 2.5),
  };

  const newStatsHistory = [...currentStats.slice(1), newStat];

  // Update frontend real-time metrics
  const newFrontends = currentFrontends.map(fe => ({
    ...fe,
    requestsPerSec: fe.status === 'active' ? (Math.floor(newRps / currentFrontends.length) + (Math.floor(Math.random() * 10) - 5)) : 0,
    sessions: fe.status === 'active' ? fe.sessions + Math.floor(Math.random() * 5) : fe.sessions,
  }));

  // Generate random log if lucky
  let newLog = null;
  if (Math.random() > 0.7) {
    const levels: LogEntry['level'][] = ['info', 'info', 'info', 'success', 'warn', 'error'];
    const sources = ['web_front', 'api_gateway', 'app_servers', 'System', 'Security'];
    const messages = [
      'Connection established',
      'SSL Handshake successful',
      'Request proxied to backend',
      'Health check passed',
      'Response time threshold exceeded',
      'Connection refused',
      'ACL denied request'
    ];
    const level = levels[Math.floor(Math.random() * levels.length)];
    
    newLog = {
      id: generateId(),
      timestamp: new Date().toISOString(),
      level,
      source: sources[Math.floor(Math.random() * sources.length)],
      message: messages[Math.floor(Math.random() * messages.length)]
    };
  }

  return {
    newStatsHistory,
    newFrontends,
    newLog
  };
};
