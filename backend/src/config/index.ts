import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 5555,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as string,
  },
  haproxy: {
    // Runtime API (Stats Socket)
    socketPath: process.env.HAPROXY_SOCKET_PATH || '/var/run/haproxy/admin.sock',
    socketTimeout: parseInt(process.env.HAPROXY_SOCKET_TIMEOUT || '5000'),
    
    // Data Plane API
    dataPlaneUrl: process.env.HAPROXY_DATAPLANE_URL || 'http://localhost:5555/v2',
    dataPlaneUser: process.env.HAPROXY_DATAPLANE_USER || 'admin',
    dataPlanePass: process.env.HAPROXY_DATAPLANE_PASS || 'adminpwd',
    
    // Configuration
    configPath: process.env.HAPROXY_CONFIG_PATH || '/etc/haproxy/haproxy.cfg',
    backupDir: process.env.HAPROXY_BACKUP_DIR || './backups/config',
    
    // Mode: 'mock' | 'hybrid' | 'real'
    // - mock: Use in-memory mock data only (for demo/development)
    // - hybrid: Use mock data as fallback when HAProxy APIs unavailable
    // - real: Require HAProxy APIs (fail if not available)
    mode: (process.env.HAPROXY_MODE || 'hybrid') as 'mock' | 'hybrid' | 'real',
  },
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  },
};
