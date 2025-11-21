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
    socketPath: process.env.HAPROXY_SOCKET_PATH || '/var/run/haproxy/admin.sock',
    configPath: process.env.HAPROXY_CONFIG_PATH || '/etc/haproxy/haproxy.cfg',
    backupDir: process.env.HAPROXY_BACKUP_DIR || './backups/config',
  },
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  },
};
