# HAProxy Management Portal - Quick Start Guide

## 🚀 Quick Start (5 minutes)

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- Git

### Step 1: Clone and Install

```bash
# Clone the repository
git clone https://github.com/suhail-akhtar/HAProxy-Management-Portal.git
cd HAProxy-Management-Portal

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
```

### Step 2: Configure Backend

```bash
# In the backend directory
cp .env.example .env

# Edit .env if needed (defaults work for development)
# Key settings:
# - PORT=5555
# - HAPROXY_MODE=mock  (no HAProxy installation required)
# - CORS_ORIGIN=http://localhost:5173
```

### Step 3: Start the Servers

**Terminal 1 - Backend Server:**
```bash
cd backend
npm run dev
```

You should see:
```
╔════════════════════════════════════════════════════════════╗
║   HAProxy Management Portal - Backend API                 ║
║   Server running on port: 5555                             ║
║   Environment: development                                 ║
╚════════════════════════════════════════════════════════════╝
```

**Terminal 2 - Frontend Server:**
```bash
# From the root directory
npm run dev
```

You should see:
```
VITE v6.4.1  ready in 171 ms
➜  Local:   http://localhost:5173/
```

### Step 4: Access the Application

Open your browser and navigate to:
```
http://localhost:5173
```

### Step 5: Login

Use any of these test credentials:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@haproxy.local | admin123 |
| Editor | devops@haproxy.local | devops123 |
| Viewer | viewer@haproxy.local | viewer123 |

That's it! 🎉 You're now running the HAProxy Management Portal.

## 🧪 Verify Installation

### Run Integration Tests

```bash
# From the root directory (make sure backend is running)
node test-integration.cjs
```

Expected output:
```
============================================================
Test Summary
============================================================
Total Tests: 36
Passed: 36
Failed: 0
Success Rate: 100.0%
============================================================
```

### Check Health Status

```bash
# Check backend health
curl http://localhost:5555/health

# Expected response:
# {"status":"ok","timestamp":"...","uptime":123.456}
```

## 📊 Explore Features

Once logged in, try these features:

1. **Dashboard** - View real-time statistics and KPIs
2. **Frontends** - Manage HAProxy frontends (create, edit, delete)
3. **Backends** - Manage backend servers and pools
4. **Monitoring** - Real-time charts and metrics
5. **Configuration** - View and edit HAProxy configuration
6. **ACLs** - Manage access control lists
7. **Analytics** - View traffic analytics and reports
8. **Users** (Admin only) - Manage user accounts

## 🔧 Troubleshooting

### Backend won't start
```bash
# Check if port 5555 is already in use
lsof -i :5555

# Kill existing process
kill -9 <PID>

# Or use a different port in backend/.env
PORT=5556
```

### Frontend won't start
```bash
# Check if port 5173 is in use
lsof -i :5173

# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Can't login
- Make sure backend is running on port 5555
- Check browser console for errors (F12)
- Verify CORS settings in backend/.env
- Try clearing browser cache and localStorage

### No data showing
- Verify backend is running: `curl http://localhost:5555/health`
- Check browser network tab (F12) for API errors
- Look at backend console for error messages

## 🎯 What's Running in Mock Mode?

The application is currently running in **mock mode**, which means:

✅ **Working Features:**
- All UI components and pages
- Authentication and authorization
- CRUD operations (Create, Read, Update, Delete)
- Real-time data updates and charts
- WebSocket connections
- Error handling and notifications
- All API endpoints

📝 **Mock Data:**
- Uses in-memory data store
- Simulated statistics and metrics
- Pre-populated frontends, backends, servers
- Does NOT connect to real HAProxy instance

## 🔄 Upgrading to Real HAProxy

To connect to a real HAProxy instance:

1. **Install HAProxy 2.0+**
   ```bash
   # Ubuntu/Debian
   sudo apt-get install haproxy
   ```

2. **Configure Stats Socket**
   
   Edit `/etc/haproxy/haproxy.cfg`:
   ```haproxy
   global
       stats socket /var/run/haproxy/admin.sock mode 660 level admin
   ```

3. **Install Data Plane API**
   
   See `backend/HAPROXY_INTEGRATION.md` for detailed instructions

4. **Update Backend Configuration**
   
   Edit `backend/.env`:
   ```bash
   HAPROXY_MODE=hybrid  # or 'real'
   HAPROXY_SOCKET_PATH=/var/run/haproxy/admin.sock
   HAPROXY_DATAPLANE_URL=http://localhost:5555/v2
   HAPROXY_DATAPLANE_USER=admin
   HAPROXY_DATAPLANE_PASS=adminpwd
   ```

5. **Restart Backend**
   ```bash
   cd backend
   npm run dev
   ```

For complete instructions, see: `backend/HAPROXY_INTEGRATION.md`

## 📖 Additional Documentation

- **Backend API:** `backend/API.md`
- **HAProxy Integration:** `backend/HAPROXY_INTEGRATION.md`
- **Architecture:** `backend/ARCHITECTURE.md`
- **Verification Report:** `VERIFICATION_REPORT.md`

## 🆘 Need Help?

1. Check the documentation files above
2. Review the troubleshooting section
3. Check GitHub issues
4. Look at backend console logs
5. Check browser console (F12)

## 🎓 Next Steps

1. **Explore the UI** - Try all the features and pages
2. **Read the Documentation** - Understand the architecture
3. **Run Tests** - Execute the integration test suite
4. **Connect Real HAProxy** - Follow the integration guide
5. **Customize** - Modify to fit your needs

## 🔐 Production Deployment

For production deployment:

1. Set environment variables properly
2. Use strong JWT_SECRET
3. Configure CORS for your domain
4. Set HAPROXY_MODE=real or hybrid
5. Use HTTPS
6. Set up proper logging
7. Configure firewall rules
8. Follow the production checklist in `VERIFICATION_REPORT.md`

## 📝 Default Test Accounts

| Email | Password | Role | Access |
|-------|----------|------|--------|
| admin@haproxy.local | admin123 | Admin | Full access + user management |
| devops@haproxy.local | devops123 | Editor | Create, read, update resources |
| viewer@haproxy.local | viewer123 | Viewer | Read-only access |

**⚠️ Important:** Change these credentials in production!

## ✅ Success Checklist

- [ ] Backend running on port 5555
- [ ] Frontend running on port 5173
- [ ] Can access login page
- [ ] Can login with test credentials
- [ ] Dashboard shows data
- [ ] Can create/edit/delete frontends
- [ ] Can create/edit/delete backends
- [ ] Real-time charts are updating
- [ ] WebSocket is connected
- [ ] All test accounts work
- [ ] Integration tests pass (36/36)

If all checked, you're ready to go! 🚀

## 🎉 Congratulations!

You've successfully set up the HAProxy Management Portal. The application is now ready for:
- ✅ Development
- ✅ Testing
- ✅ Demo/Presentation
- ✅ Production (after following production checklist)

Enjoy managing your HAProxy instances with this modern, user-friendly interface!
