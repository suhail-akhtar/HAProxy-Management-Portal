import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import { createServer } from 'http';
import { config } from './config';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { generalLimiter } from './middleware/rateLimiter';
import { WebSocketService } from './services/websocketService';

// Import routes
import authRoutes from './routes/auth';
import frontendRoutes from './routes/frontends';
import backendRoutes from './routes/backends';
import dataRoutes from './routes/data';

const app: Application = express();
const server = createServer(app);

// Middleware
app.use(helmet());
app.use(cors({
  origin: config.cors.origin,
  credentials: true,
}));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply general rate limiting to all API routes
app.use('/api', generalLimiter);

// Logging
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/frontends', frontendRoutes);
app.use('/api/backends', backendRoutes);
app.use('/api', dataRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Initialize WebSocket service
const wsService = new WebSocketService(server);

// Start server
server.listen(config.port, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   HAProxy Management Portal - Backend API                 ║
║                                                            ║
║   Server running on port: ${config.port}                         ║
║   Environment: ${config.nodeEnv}                              ║
║   WebSocket: ws://localhost:${config.port}/ws                 ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  wsService.stop();
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  wsService.stop();
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

export default app;
