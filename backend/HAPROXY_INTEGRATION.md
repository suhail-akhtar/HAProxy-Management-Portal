# HAProxy Integration Guide

## Overview

This backend now supports **real HAProxy integration** using both HAProxy APIs:

1. **HAProxy Data Plane API** - For configuration management (persistent changes)
2. **HAProxy Runtime API (Stats Socket)** - For real-time statistics and quick operations

The integration uses a **hybrid approach** that combines both APIs for optimal performance and functionality.

## Architecture

```
Backend API
    │
    ├─> HAProxyService (Unified Interface)
    │       │
    │       ├─> HAProxyDataPlaneClient
    │       │   └─> REST API calls to Data Plane API
    │       │       - Configuration CRUD
    │       │       - Persistent changes
    │       │       - Transaction support
    │       │
    │       └─> HAProxyRuntimeClient
    │           └─> Unix socket commands
    │               - Real-time stats
    │               - Quick state changes
    │               - In-memory operations
    │
    └─> Falls back to mock data if HAProxy unavailable
```

## Modes

The backend supports three operation modes (configured via `HAPROXY_MODE` environment variable):

### 1. Mock Mode (Default for Development)
```bash
HAPROXY_MODE=mock
```
- Uses in-memory mock data only
- Perfect for frontend development and testing
- No HAProxy installation required

### 2. Hybrid Mode (Recommended)
```bash
HAPROXY_MODE=hybrid
```
- Attempts to connect to HAProxy APIs
- Falls back to mock data if HAProxy unavailable
- Best for gradual migration and development

### 3. Real Mode (Production)
```bash
HAPROXY_MODE=real
```
- Requires HAProxy APIs to be available
- Fails if cannot connect to HAProxy
- For production deployments with real HAProxy

## Setup Instructions

### Prerequisites

1. **HAProxy 2.0+** installed and running
2. **HAProxy Data Plane API** installed
3. **Stats socket** configured in HAProxy

### Step 1: Install HAProxy

```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install haproxy

# CentOS/RHEL
sudo yum install haproxy

# macOS
brew install haproxy
```

### Step 2: Configure HAProxy Stats Socket

Edit `/etc/haproxy/haproxy.cfg`:

```haproxy
global
    # Enable stats socket with admin level access
    stats socket /var/run/haproxy/admin.sock mode 660 level admin
    stats timeout 30s
    
    # Other global settings...
    log /dev/log local0
    chroot /var/lib/haproxy
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
```

Create socket directory:
```bash
sudo mkdir -p /var/run/haproxy
sudo chown haproxy:haproxy /var/run/haproxy
```

Restart HAProxy:
```bash
sudo systemctl restart haproxy
```

### Step 3: Install HAProxy Data Plane API

**Option A: Binary Installation**
```bash
# Download latest release
wget https://github.com/haproxytech/dataplaneapi/releases/download/v2.9.0/dataplaneapi_2.9.0_linux_x86_64.tar.gz
tar -xzf dataplaneapi_2.9.0_linux_x86_64.tar.gz
sudo mv dataplaneapi /usr/local/bin/

# Make executable
sudo chmod +x /usr/local/bin/dataplaneapi
```

**Option B: Docker**
```bash
docker run -d \
  --name haproxy-dataplane \
  -v /etc/haproxy:/etc/haproxy \
  -v /var/run/haproxy:/var/run/haproxy \
  -p 5555:5555 \
  haproxytech/dataplaneapi \
  --host 0.0.0.0 \
  --port 5555 \
  --haproxy-bin /usr/sbin/haproxy \
  --config-file /etc/haproxy/haproxy.cfg \
  --reload-cmd "systemctl reload haproxy" \
  --reload-delay 5 \
  --userlist admin:adminpwd
```

**Option C: Go Install**
```bash
go install github.com/haproxytech/dataplaneapi@latest
```

### Step 4: Configure Data Plane API

Create `/etc/haproxy/dataplaneapi.yml`:

```yaml
dataplaneapi:
  host: 0.0.0.0
  port: 5555
  
  user:
    - name: admin
      password: adminpwd
      insecure: true
  
haproxy:
  config_file: /etc/haproxy/haproxy.cfg
  haproxy_bin: /usr/sbin/haproxy
  reload:
    reload_cmd: systemctl reload haproxy
    reload_delay: 5
    restart_cmd: systemctl restart haproxy
  
  # Stats socket for runtime commands
  runtime_api:
    - address: /var/run/haproxy/admin.sock

log:
  level: warning
  format: text
```

Start Data Plane API:
```bash
dataplaneapi -f /etc/haproxy/dataplaneapi.yml
```

### Step 5: Configure Backend Environment

Update `backend/.env`:

```bash
# HAProxy Mode
HAPROXY_MODE=hybrid  # or 'real' for production

# Runtime API (Stats Socket)
HAPROXY_SOCKET_PATH=/var/run/haproxy/admin.sock
HAPROXY_SOCKET_TIMEOUT=5000

# Data Plane API
HAPROXY_DATAPLANE_URL=http://localhost:5555/v2
HAPROXY_DATAPLANE_USER=admin
HAPROXY_DATAPLANE_PASS=adminpwd

# Configuration
HAPROXY_CONFIG_PATH=/etc/haproxy/haproxy.cfg
HAPROXY_BACKUP_DIR=./backups/config
```

### Step 6: Test Connection

Start the backend:
```bash
cd backend
npm run dev
```

You should see:
```
✓ HAProxy Data Plane API connected
✓ HAProxy Runtime API connected
```

If you see warnings, check:
1. HAProxy is running: `sudo systemctl status haproxy`
2. Data Plane API is running: `curl http://localhost:5555/v2/info`
3. Socket is accessible: `echo "show info" | socat stdio /var/run/haproxy/admin.sock`

## API Features

### Supported Operations

#### ✅ Frontends
- List all frontends with real-time stats
- Get frontend details
- Create new frontend
- Update frontend configuration
- Delete frontend

#### ✅ Backends  
- List all backends with stats
- Get backend with server list
- Create new backend
- Update backend configuration
- Delete backend

#### ✅ Servers
- List servers in backend
- Add server to backend
- Update server status (enable/disable/maintenance)
- Update server weight
- Delete server
- Real-time server statistics

#### ✅ Real-time Statistics
- Frontend stats (sessions, requests, bytes)
- Backend stats (active servers, load distribution)
- Server stats (health, connections, traffic)
- System metrics (CPU, memory, connections)

#### ✅ Configuration Management
- Get current HAProxy configuration
- Update configuration (with backup)
- Configuration version control
- Rollback to previous version
- Transaction support for atomic changes

#### ✅ Runtime Operations
- Enable/disable servers instantly
- Set server maintenance mode
- Adjust server weights
- Drain connections gracefully
- View active sessions

#### ✅ ACLs
- List ACLs
- Add new ACL rules
- Delete ACL rules
- Runtime ACL modifications

## Usage Examples

### Example 1: List Frontends with Stats

```typescript
import { haproxyService } from './services/haproxyService';

// Get all frontends with real-time statistics
const frontends = await haproxyService.getFrontends();
console.log(frontends);

// Output:
// [
//   {
//     name: 'web_front',
//     bind: { address: '*', port: 80 },
//     default_backend: 'app_servers',
//     currentSessions: 150,
//     maxSessions: 500,
//     totalSessions: 125000,
//     requestRate: 25
//   }
// ]
```

### Example 2: Update Server Status

```typescript
// Put server in maintenance mode (graceful drain)
await haproxyService.updateServerStatus('app_servers', 's1', 'maint');

// Re-enable server
await haproxyService.updateServerStatus('app_servers', 's1', 'up');

// Disable server immediately
await haproxyService.updateServerStatus('app_servers', 's1', 'down');
```

### Example 3: Add New Backend Server

```typescript
await haproxyService.addServer('app_servers', {
  name: 's4',
  address: '10.0.1.13',
  port: 8080,
  weight: 5,
  check: 'enabled'
});
```

### Example 4: Get Real-Time Statistics

```typescript
const stats = await haproxyService.getStats();

// Filter for specific backend
const backendStats = stats.filter(s => s.pxname === 'app_servers');

// Get current sessions
backendStats.forEach(server => {
  console.log(`${server.svname}: ${server.scur} sessions`);
});
```

### Example 5: Configuration Management

```typescript
// Get current configuration
const config = await haproxyService.getConfiguration();

// Update configuration
await haproxyService.updateConfiguration(newConfig);

// Reload HAProxy (graceful)
await haproxyService.reload();
```

## Data Mapping

The HAProxy service automatically maps HAProxy API data to our frontend models:

### Frontend Mapping
```typescript
HAProxy Frontend -> Our Frontend Model
├── name -> name
├── bind -> bind + port
├── default_backend -> defaultBackend
├── mode -> mode
└── stats.scur -> currentSessions
```

### Backend Mapping
```typescript
HAProxy Backend -> Our Backend Model
├── name -> name
├── mode -> mode
├── balance -> balance
├── servers[] -> servers[]
└── stats.act -> activeServers
```

### Server Mapping
```typescript
HAProxy Server -> Our Server Model
├── name -> name
├── address + port -> address + port
├── status -> status
├── weight -> weight
└── stats.scur -> currentSessions
```

## Troubleshooting

### Issue: "Data Plane API not available"

**Check:**
1. Is Data Plane API running?
   ```bash
   curl http://localhost:5555/v2/info
   ```

2. Is the URL correct in `.env`?
   ```bash
   HAPROXY_DATAPLANE_URL=http://localhost:5555/v2
   ```

3. Are credentials correct?
   ```bash
   HAPROXY_DATAPLANE_USER=admin
   HAPROXY_DATAPLANE_PASS=adminpwd
   ```

### Issue: "Runtime API not available"

**Check:**
1. Is HAProxy running?
   ```bash
   sudo systemctl status haproxy
   ```

2. Is stats socket configured?
   ```bash
   grep "stats socket" /etc/haproxy/haproxy.cfg
   ```

3. Is socket accessible?
   ```bash
   ls -la /var/run/haproxy/admin.sock
   echo "show info" | socat stdio /var/run/haproxy/admin.sock
   ```

4. Check permissions:
   ```bash
   sudo chmod 660 /var/run/haproxy/admin.sock
   sudo chown haproxy:haproxy /var/run/haproxy/admin.sock
   ```

### Issue: "Cannot connect to socket"

**Solution:**
```bash
# Add your user to haproxy group
sudo usermod -a -G haproxy $USER

# Restart
newgrp haproxy

# Or run with sudo (not recommended for production)
sudo npm run dev
```

## Performance Considerations

### Data Plane API
- **Use for**: Configuration changes, adding/removing servers, ACL management
- **Performance**: Moderate (writes to config file)
- **Persistence**: Yes (changes saved to config)

### Runtime API
- **Use for**: Real-time stats, quick state changes, monitoring
- **Performance**: Very fast (in-memory operations)
- **Persistence**: No (changes lost on reload)

### Hybrid Approach (Recommended)
- Use Runtime API for immediate effect (enable/disable server)
- Use Data Plane API to persist changes
- Best of both worlds: fast + persistent

## Production Deployment

### Checklist

- [ ] HAProxy 2.0+ installed and configured
- [ ] Stats socket configured with admin level
- [ ] Data Plane API installed and running
- [ ] Environment variables set correctly
- [ ] Set `HAPROXY_MODE=real` in production
- [ ] Use strong passwords for Data Plane API
- [ ] Secure Data Plane API with HTTPS
- [ ] Set up firewall rules (Data Plane API port)
- [ ] Configure log aggregation
- [ ] Set up monitoring and alerts
- [ ] Test failover scenarios
- [ ] Document your HAProxy configuration

### Security Best Practices

1. **Use HTTPS for Data Plane API**
   ```yaml
   dataplaneapi:
     scheme: https
     tls:
       certificate: /path/to/cert.pem
       key: /path/to/key.pem
   ```

2. **Restrict socket access**
   ```haproxy
   stats socket /var/run/haproxy/admin.sock mode 600 level admin
   ```

3. **Use strong passwords**
   ```bash
   HAPROXY_DATAPLANE_PASS=$(openssl rand -base64 32)
   ```

4. **Firewall rules**
   ```bash
   # Only allow backend server to access Data Plane API
   sudo ufw allow from 10.0.0.10 to any port 5555
   ```

## Additional Resources

- [HAProxy Official Documentation](https://www.haproxy.org/documentation/)
- [Data Plane API Documentation](https://www.haproxy.com/documentation/dataplaneapi/)
- [Runtime API Reference](https://www.haproxy.com/documentation/haproxy-runtime-api/)
- [HAProxy GitHub](https://github.com/haproxy/haproxy)
- [Data Plane API GitHub](https://github.com/haproxytech/dataplaneapi)

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review HAProxy logs: `sudo journalctl -u haproxy -f`
3. Check Data Plane API logs
4. Verify socket permissions
5. Test with `socat` command-line tool
