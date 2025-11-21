# HAProxy Management Portal - Backend API Documentation

## Overview

This is a RESTful API backend for the HAProxy Management Portal. It provides comprehensive endpoints for managing HAProxy load balancers, including frontends, backends, servers, configuration, monitoring, and more.

## Base URL

```
http://localhost:5555/api
```

## WebSocket

```
ws://localhost:5555/ws
```

## Authentication

All API endpoints (except `/auth/login`) require JWT authentication.

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@haproxy.local",
  "password": "admin123"
}
```

Response:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "u1",
    "name": "Admin User",
    "email": "admin@haproxy.local",
    "role": "admin",
    "lastLogin": "2024-01-01T00:00:00.000Z"
  }
}
```

### Using the Token

Include the token in the Authorization header:
```http
Authorization: Bearer YOUR_JWT_TOKEN
```

## API Endpoints

### Dashboard

#### Get Dashboard Data
```http
GET /api/dashboard
Authorization: Bearer YOUR_JWT_TOKEN
```

Returns aggregated data for the dashboard including frontends, backends, stats, logs, system health, and active alerts.

### Frontends

#### List All Frontends
```http
GET /api/frontends
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Get Frontend by ID
```http
GET /api/frontends/:id
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Create Frontend
```http
POST /api/frontends
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "name": "web_front",
  "status": "active",
  "bind": "*",
  "port": 80,
  "mode": "http",
  "defaultBackend": "app_servers",
  "maxConnections": 2000
}
```

#### Update Frontend
```http
PUT /api/frontends/:id
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "status": "stopped"
}
```

#### Delete Frontend
```http
DELETE /api/frontends/:id
Authorization: Bearer YOUR_JWT_TOKEN
```

### Backends

#### List All Backends
```http
GET /api/backends
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Get Backend by ID
```http
GET /api/backends/:id
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Create Backend
```http
POST /api/backends
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "name": "app_servers",
  "mode": "http",
  "balance": "roundrobin",
  "servers": [
    {
      "name": "server1",
      "address": "10.0.1.10",
      "port": 8080,
      "status": "up",
      "weight": 5
    }
  ]
}
```

#### Delete Backend
```http
DELETE /api/backends/:id
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Update Server Status
```http
PUT /api/backends/:backendId/servers/:serverId/status
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "status": "maint"
}
```

### Monitoring

#### Get Real-time Stats
```http
GET /api/stats
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Get System Health
```http
GET /api/health
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Get Logs
```http
GET /api/logs
Authorization: Bearer YOUR_JWT_TOKEN
```

### Access Control Lists (ACLs)

#### List All ACLs
```http
GET /api/acls
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Create ACL
```http
POST /api/acls
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "name": "block_admin",
  "frontendId": "abc123",
  "frontendName": "web_front",
  "criterion": "path_beg",
  "value": "/admin",
  "action": "deny"
}
```

#### Delete ACL
```http
DELETE /api/acls/:id
Authorization: Bearer YOUR_JWT_TOKEN
```

### Configuration

#### Get Current Configuration
```http
GET /api/config/current
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Get Configuration History
```http
GET /api/config/history
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Save Configuration
```http
POST /api/config/save
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "content": "global\n  log /dev/log local0\n...",
  "comment": "Updated timeouts",
  "author": "admin"
}
```

#### Rollback Configuration
```http
POST /api/config/rollback/:versionId
Authorization: Bearer YOUR_JWT_TOKEN
```

### Alerts

#### List All Alerts
```http
GET /api/alerts
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Delete Alert (Acknowledge)
```http
DELETE /api/alerts/:id
Authorization: Bearer YOUR_JWT_TOKEN
```

### SSL Certificates

#### List All Certificates
```http
GET /api/certificates
Authorization: Bearer YOUR_JWT_TOKEN
```

### High Availability

#### List HA Nodes
```http
GET /api/ha-nodes
Authorization: Bearer YOUR_JWT_TOKEN
```

### Analytics

#### Get Analytics Data
```http
GET /api/analytics
Authorization: Bearer YOUR_JWT_TOKEN
```

### Users

#### List All Users (Admin only)
```http
GET /api/users
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Create User (Admin only)
```http
POST /api/users
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "role": "editor",
  "password": "password123"
}
```

#### Delete User (Admin only)
```http
DELETE /api/users/:id
Authorization: Bearer YOUR_JWT_TOKEN
```

### Reports

#### List All Reports
```http
GET /api/reports
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Generate Report
```http
POST /api/reports
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "title": "Weekly Traffic Summary",
  "type": "pdf",
  "generatedBy": "Admin User"
}
```

#### Delete Report
```http
DELETE /api/reports/:id
Authorization: Bearer YOUR_JWT_TOKEN
```

### Settings

#### Get Settings
```http
GET /api/settings
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Update Settings (Admin only)
```http
PUT /api/settings
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "refreshInterval": 5,
  "notificationsEnabled": true
}
```

## WebSocket Events

Connect to `ws://localhost:5555/ws` to receive real-time updates.

### Events Sent by Server

#### INITIAL_STATE
Sent when client first connects. Contains current state of frontends, backends, stats, logs, and system health.

#### STATS_UPDATE
Sent every second with new statistics data.

```json
{
  "type": "STATS_UPDATE",
  "data": {
    "stat": {
      "timestamp": 1234567890,
      "timeLabel": "12:34:56",
      "requestsPerSec": 150,
      "responseTime": 25,
      "errorRate": 0.5,
      "activeConnections": 375
    },
    "frontends": [...],
    "logs": [...]
  }
}
```

### Events Sent by Client

#### PING
Heartbeat to check connection.

```json
{
  "type": "PING"
}
```

Server responds with:
```json
{
  "type": "PONG"
}
```

## User Roles

- **admin**: Full access to all endpoints
- **editor**: Can read and modify most resources, but cannot manage users
- **viewer**: Read-only access to all data

## Default Users

```
Email: admin@haproxy.local
Password: admin123
Role: admin

Email: devops@haproxy.local
Password: devops123
Role: editor

Email: viewer@haproxy.local
Password: viewer123
Role: viewer
```

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": "Error message here"
}
```

Common HTTP status codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

## Rate Limiting

The API implements rate limiting to prevent abuse:
- Window: 15 minutes (900000ms)
- Max requests: 100 per window

## Environment Variables

See `.env.example` for configuration options:

- `PORT`: Server port (default: 5555)
- `JWT_SECRET`: Secret key for JWT signing
- `JWT_EXPIRES_IN`: Token expiration time (default: 7d)
- `CORS_ORIGIN`: Allowed origin for CORS (default: http://localhost:5173)

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build

# Run production build
npm start
```

## Testing

```bash
npm test
```

## Architecture

The backend is built with:
- **Express.js**: Web framework
- **TypeScript**: Type safety
- **WebSocket (ws)**: Real-time updates
- **JWT**: Authentication
- **In-memory data store**: Can be easily replaced with a database

### Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Express middleware
│   ├── models/          # Data types
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   └── server.ts        # Entry point
├── package.json
├── tsconfig.json
└── .env.example
```

## Future Enhancements

- Database integration (PostgreSQL, MongoDB)
- Real HAProxy stats socket integration
- File-based configuration management
- SSL certificate upload and management
- Advanced alerting and notifications
- Rate limiting per user
- API key authentication
- Audit logging
- Backup and restore functionality
