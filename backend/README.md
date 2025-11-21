# HAProxy Management Portal - Backend

Enterprise-grade backend API for HAProxy Management Portal with real-time monitoring and control.

## Features

✅ **Comprehensive REST API** - Full CRUD operations for all HAProxy resources
✅ **Real-time Updates** - WebSocket integration for live stats and monitoring
✅ **JWT Authentication** - Secure token-based authentication
✅ **Role-based Access Control** - Admin, Editor, and Viewer roles
✅ **TypeScript** - Full type safety and better developer experience
✅ **Modular Architecture** - Easy to extend and maintain
✅ **Configuration Management** - Version control and rollback support
✅ **Monitoring & Analytics** - Real-time stats, logs, and analytics
✅ **User Management** - Multi-user support with permissions
✅ **Report Generation** - Export data as PDF/CSV

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your configuration
nano .env
```

### Development

```bash
# Run in development mode with hot reload
npm run dev
```

The server will start at `http://localhost:5555`

### Production

```bash
# Build the project
npm run build

# Run production server
npm start
```

## API Documentation

See [API.md](./API.md) for complete API documentation.

### Quick API Overview

- **Authentication**: `/api/auth/*`
- **Frontends**: `/api/frontends/*`
- **Backends**: `/api/backends/*`
- **Monitoring**: `/api/stats`, `/api/health`, `/api/logs`
- **Configuration**: `/api/config/*`
- **ACLs**: `/api/acls/*`
- **Alerts**: `/api/alerts/*`
- **Certificates**: `/api/certificates`
- **HA Nodes**: `/api/ha-nodes`
- **Analytics**: `/api/analytics`
- **Users**: `/api/users/*`
- **Reports**: `/api/reports/*`
- **Settings**: `/api/settings`

## WebSocket

Connect to `ws://localhost:5555/ws` for real-time updates:

- Stats updates every second
- Live log streaming
- Frontend/Backend status changes
- System health monitoring

## Authentication

Default users:

| Email | Password | Role |
|-------|----------|------|
| admin@haproxy.local | admin123 | admin |
| devops@haproxy.local | devops123 | editor |
| viewer@haproxy.local | viewer123 | viewer |

### Using the API

1. Login to get a JWT token:
```bash
curl -X POST http://localhost:5555/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@haproxy.local","password":"admin123"}'
```

2. Use the token in subsequent requests:
```bash
curl http://localhost:5555/api/frontends \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Project Structure

```
backend/
├── src/
│   ├── config/              # Configuration files
│   │   └── index.ts
│   ├── controllers/         # Request handlers
│   │   ├── authController.ts
│   │   ├── backendController.ts
│   │   ├── frontendController.ts
│   │   └── dataController.ts
│   ├── middleware/          # Express middleware
│   │   ├── auth.ts
│   │   └── errorHandler.ts
│   ├── models/              # Data types and interfaces
│   │   └── types.ts
│   ├── routes/              # API routes
│   │   ├── auth.ts
│   │   ├── backends.ts
│   │   ├── frontends.ts
│   │   └── data.ts
│   ├── services/            # Business logic
│   │   ├── dataStore.ts
│   │   └── websocketService.ts
│   └── server.ts            # Application entry point
├── .env.example             # Example environment variables
├── API.md                   # API documentation
├── package.json
├── tsconfig.json
└── README.md
```

## Configuration

Environment variables (see `.env.example`):

```env
PORT=5555                              # Server port
NODE_ENV=development                   # Environment
JWT_SECRET=your-secret-key             # JWT secret key
JWT_EXPIRES_IN=7d                      # Token expiration
HAPROXY_SOCKET_PATH=/var/run/haproxy/admin.sock
HAPROXY_CONFIG_PATH=/etc/haproxy/haproxy.cfg
CORS_ORIGIN=http://localhost:5173     # Frontend URL
```

## Data Storage

Currently uses an in-memory data store. Can be easily replaced with:
- PostgreSQL
- MongoDB
- Redis
- MySQL

The data store interface is abstracted in `services/dataStore.ts`.

## Security Features

- JWT-based authentication
- Role-based access control (RBAC)
- CORS protection
- Helmet.js security headers
- Request compression
- Error sanitization

## Testing

```bash
npm test
```

## Building for Production

```bash
# Build TypeScript to JavaScript
npm run build

# Output will be in dist/ directory
# Run with: npm start
```

## Deployment

### Docker (Coming Soon)

```dockerfile
# Dockerfile example
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 5555
CMD ["node", "dist/server.js"]
```

### PM2 (Process Manager)

```bash
npm install -g pm2
npm run build
pm2 start dist/server.js --name haproxy-backend
```

## Integration with HAProxy

To integrate with a real HAProxy instance:

1. Update `HAPROXY_SOCKET_PATH` in `.env`
2. Implement HAProxy stats socket communication in `services/haproxyService.ts`
3. Replace mock data in `dataStore.ts` with real HAProxy stats

## Development Roadmap

- [ ] Database integration
- [ ] Real HAProxy stats socket integration
- [ ] File-based configuration management
- [ ] SSL certificate upload
- [ ] Email notifications
- [ ] Webhook integrations
- [ ] API rate limiting per user
- [ ] Audit logging
- [ ] Backup/restore functionality
- [ ] Multi-tenancy support

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License

## Support

For issues and questions:
- GitHub Issues: [Create an issue](https://github.com/suhail-akhtar/HAProxy-Management-Portal/issues)
- Documentation: See [API.md](./API.md)

## Credits

Built with:
- Express.js
- TypeScript
- WebSocket (ws)
- JWT
- And other great open-source libraries
