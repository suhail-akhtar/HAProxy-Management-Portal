# HAProxy Management Portal - Architecture Diagram

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (React)                          │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Components: Dashboard, Frontends, Backends, Servers...  │  │
│  │  Contexts: Auth, Data, Navigation, Theme, Toast          │  │
│  │  Services: mockDataService (to be replaced with API)     │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                   │
│                              │ HTTP/WebSocket                    │
│                              ▼                                   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                         Backend (Node.js)                        │
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    Express Server                          │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │  Middleware Stack                                    │  │  │
│  │  │  - Helmet (Security Headers)                         │  │  │
│  │  │  - CORS (Cross-Origin)                               │  │  │
│  │  │  - Compression                                        │  │  │
│  │  │  - Morgan (Logging)                                   │  │  │
│  │  │  - Rate Limiting (3-tier)                             │  │  │
│  │  │    • General: 100 req/15min                           │  │  │
│  │  │    • Auth: 5 attempts/15min                           │  │  │
│  │  │    • API: 60 req/min                                  │  │  │
│  │  └─────────────────────────────────────────────────────┘  │  │
│  │                          │                                 │  │
│  │                          ▼                                 │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │  Routes                                              │  │  │
│  │  │  /api/auth         → authRoutes                      │  │  │
│  │  │  /api/frontends    → frontendRoutes                  │  │  │
│  │  │  /api/backends     → backendRoutes                   │  │  │
│  │  │  /api/*           → dataRoutes                       │  │  │
│  │  └─────────────────────────────────────────────────────┘  │  │
│  │                          │                                 │  │
│  │                          ▼                                 │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │  Authentication & Authorization Middleware           │  │  │
│  │  │  - JWT Token Verification                            │  │  │
│  │  │  - Role-Based Access Control (RBAC)                  │  │  │
│  │  │    • Admin: Full access                              │  │  │
│  │  │    • Editor: Read/Write (no user mgmt)               │  │  │
│  │  │    • Viewer: Read-only                               │  │  │
│  │  └─────────────────────────────────────────────────────┘  │  │
│  │                          │                                 │  │
│  │                          ▼                                 │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │  Controllers                                          │  │  │
│  │  │  - authController: Login, Logout, Validate           │  │  │
│  │  │  - frontendController: CRUD operations               │  │  │
│  │  │  - backendController: CRUD operations                │  │  │
│  │  │  - dataController: All other operations              │  │  │
│  │  └─────────────────────────────────────────────────────┘  │  │
│  │                          │                                 │  │
│  │                          ▼                                 │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │  Services                                             │  │  │
│  │  │  ┌─────────────────────────────────────────────────┐ │  │  │
│  │  │  │  DataStore (In-Memory)                          │ │  │  │
│  │  │  │  - Frontends, Backends, Servers                 │ │  │  │
│  │  │  │  - Stats, Logs, System Health                   │ │  │  │
│  │  │  │  - ACLs, Config History                         │ │  │  │
│  │  │  │  - Alerts, Certificates, HA Nodes               │ │  │  │
│  │  │  │  - Analytics, Users, Reports, Settings          │ │  │  │
│  │  │  └─────────────────────────────────────────────────┘ │  │  │
│  │  └─────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                 WebSocket Service                          │  │
│  │  - Real-time Stats Updates (every 1s)                     │  │
│  │  - Live Log Streaming                                      │  │
│  │  - Frontend/Backend Status Changes                         │  │
│  │  - PING/PONG Heartbeat                                     │  │
│  └───────────────────────────────────────────────────────────┘  │
│                              │                                   │
└──────────────────────────────┼───────────────────────────────────┘
                               │
                               ▼
                ┌──────────────────────────┐
                │  Future: Database Layer  │
                │  - PostgreSQL/MongoDB    │
                │  - Data Persistence      │
                │  - Migrations            │
                └──────────────────────────┘
```

## API Endpoint Structure

```
/api
├── /auth
│   ├── POST   /login          → Login with email/password
│   ├── POST   /logout         → Logout (authenticated)
│   └── GET    /validate       → Validate JWT token
│
├── /frontends
│   ├── GET    /               → List all frontends
│   ├── GET    /:id            → Get frontend by ID
│   ├── POST   /               → Create new frontend (admin/editor)
│   ├── PUT    /:id            → Update frontend (admin/editor)
│   └── DELETE /:id            → Delete frontend (admin)
│
├── /backends
│   ├── GET    /               → List all backends
│   ├── GET    /:id            → Get backend by ID
│   ├── POST   /               → Create new backend (admin/editor)
│   ├── DELETE /:id            → Delete backend (admin)
│   └── PUT    /:backendId/servers/:serverId/status
│                              → Update server status (admin/editor)
│
├── /dashboard                 → Aggregated dashboard data
│
├── /stats                     → Real-time statistics
├── /health                    → System health metrics
├── /logs                      → System logs
│
├── /acls
│   ├── GET    /               → List all ACLs
│   ├── POST   /               → Create ACL (admin/editor)
│   └── DELETE /:id            → Delete ACL (admin)
│
├── /config
│   ├── GET    /current        → Get current configuration
│   ├── GET    /history        → Get configuration history
│   ├── POST   /save           → Save new configuration (admin/editor)
│   └── POST   /rollback/:id   → Rollback to version (admin)
│
├── /alerts
│   ├── GET    /               → List all alerts
│   └── DELETE /:id            → Delete alert (admin/editor)
│
├── /certificates              → List SSL certificates
├── /ha-nodes                  → List HA cluster nodes
├── /analytics                 → Traffic analytics data
│
├── /users (admin only)
│   ├── GET    /               → List all users
│   ├── POST   /               → Create user
│   └── DELETE /:id            → Delete user
│
├── /reports
│   ├── GET    /               → List all reports
│   ├── POST   /               → Generate report (admin/editor)
│   └── DELETE /:id            → Delete report (admin/editor)
│
└── /settings
    ├── GET    /               → Get settings
    └── PUT    /               → Update settings (admin)
```

## WebSocket Event Flow

```
Client                          Server
  │                               │
  │─────── Connect ──────────────>│
  │                               │
  │<──── INITIAL_STATE ───────────│ (on connect)
  │     {frontends, backends,     │
  │      stats, logs, health}     │
  │                               │
  │                               │
  │<──── STATS_UPDATE ────────────│ (every 1s)
  │     {newStat, frontends,      │
  │      logs}                    │
  │                               │
  │                               │
  │──────── PING ────────────────>│ (heartbeat)
  │<──────── PONG ────────────────│
  │                               │
  │                               │
  │─────── Disconnect ────────────│
  │                               │
```

## Data Flow

```
Frontend Action
    │
    ▼
API Request (with JWT)
    │
    ▼
Rate Limiter
    │
    ▼
Authentication Middleware (verify JWT)
    │
    ▼
Authorization Middleware (check role)
    │
    ▼
Route Handler
    │
    ▼
Controller
    │
    ▼
Service/DataStore
    │
    ▼
Response
    │
    ▼
Frontend Update
```

## Security Layers

```
┌─────────────────────────────────────────┐
│  Layer 1: Rate Limiting                 │
│  - Prevents DDoS attacks                │
│  - 3-tier system                        │
└─────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────┐
│  Layer 2: Authentication (JWT)          │
│  - Token-based authentication           │
│  - 7-day expiration                     │
└─────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────┐
│  Layer 3: Authorization (RBAC)          │
│  - Role-based access control            │
│  - Admin/Editor/Viewer roles            │
└─────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────┐
│  Layer 4: Security Headers (Helmet)     │
│  - XSS protection                       │
│  - Content security policy              │
└─────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────┐
│  Layer 5: CORS                          │
│  - Cross-origin protection              │
│  - Whitelisted origins                  │
└─────────────────────────────────────────┘
```

## Technology Stack

```
Frontend:
├── React 19
├── TypeScript
├── Vite
├── Recharts (visualization)
├── Lucide React (icons)
└── Context API (state)

Backend:
├── Node.js 18+
├── Express.js
├── TypeScript
├── WebSocket (ws)
├── JWT (jsonwebtoken)
├── bcryptjs (for future use)
├── express-rate-limit
├── Helmet (security)
├── Morgan (logging)
├── CORS
└── Compression
```

## Deployment Architecture (Future)

```
                    ┌─────────────┐
                    │   Client    │
                    │  (Browser)  │
                    └──────┬──────┘
                           │
                           ▼
                    ┌─────────────┐
                    │   CDN/Edge  │
                    │  (Cloudflare)│
                    └──────┬──────┘
                           │
                           ▼
                    ┌─────────────┐
                    │ Load Balancer│
                    │  (HAProxy)   │
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
         ┌────────┐   ┌────────┐   ┌────────┐
         │ App    │   │ App    │   │ App    │
         │ Node 1 │   │ Node 2 │   │ Node 3 │
         └────┬───┘   └────┬───┘   └────┬───┘
              │            │            │
              └────────────┼────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │  Database   │
                    │ (PostgreSQL)│
                    └─────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │    Redis    │
                    │   (Cache)   │
                    └─────────────┘
```
