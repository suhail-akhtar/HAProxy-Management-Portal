<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# HAProxy Management Portal

Enterprise-grade HAProxy Load Balancer Management Interface with real-time visualization and comprehensive backend API.

## 🚀 Features

### Frontend
- **Real-time Dashboard** - Live stats, metrics, and KPIs
- **Frontend Management** - CRUD operations for HAProxy frontends
- **Backend & Server Management** - Configure backends and manage servers
- **Configuration Editor** - Edit HAProxy config with version control
- **Access Control Lists** - Manage traffic rules and routing
- **SSL Certificates** - Monitor and manage TLS certificates
- **High Availability** - Cluster node monitoring and sync status
- **Analytics** - Traffic analysis, geographic distribution, browser stats
- **User Management** - Multi-user support with role-based access
- **Reports** - Generate and export PDF/CSV reports
- **Dark Mode** - Beautiful dark/light theme support
- **Responsive Design** - Works on desktop, tablet, and mobile

### Backend
- **RESTful API** - Complete CRUD operations for all resources
- **WebSocket Support** - Real-time updates for stats and logs
- **JWT Authentication** - Secure token-based authentication
- **Role-Based Access Control** - Admin, Editor, and Viewer roles
- **Configuration Management** - Version control and rollback support
- **TypeScript** - Full type safety
- **Modular Architecture** - Easy to extend and maintain

## 📁 Project Structure

```
HAProxy-Management-Portal/
├── backend/                 # Backend API (Node.js + Express + TypeScript)
│   ├── src/
│   │   ├── config/          # Configuration
│   │   ├── controllers/     # Request handlers
│   │   ├── middleware/      # Express middleware
│   │   ├── models/          # Data types
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   └── server.ts        # Entry point
│   ├── API.md              # API documentation
│   ├── README.md           # Backend documentation
│   └── package.json
├── components/              # React components
├── contexts/               # React contexts
├── pages/                  # Application pages
├── services/               # Frontend services
├── App.tsx                 # Main app component
├── index.tsx              # App entry point
└── README.md              # This file
```

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/suhail-akhtar/HAProxy-Management-Portal.git
cd HAProxy-Management-Portal
```

2. **Install frontend dependencies**
```bash
npm install
```

3. **Install backend dependencies**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
```

### Development

**Terminal 1 - Run Backend:**
```bash
cd backend
npm run dev
```
Backend will start at `http://localhost:5555`

**Terminal 2 - Run Frontend:**
```bash
npm run dev
```
Frontend will start at `http://localhost:5173`

### Production Build

**Build Backend:**
```bash
cd backend
npm run build
npm start
```

**Build Frontend:**
```bash
npm run build
npm run preview
```

## 🔑 Default Credentials

| Email | Password | Role |
|-------|----------|------|
| admin@haproxy.local | admin123 | admin |
| devops@haproxy.local | devops123 | editor |
| viewer@haproxy.local | viewer123 | viewer |

## 📚 Documentation

- **Backend API Documentation**: [backend/API.md](backend/API.md)
- **Backend README**: [backend/README.md](backend/README.md)

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/validate` - Validate token

### Resources
- `/api/frontends` - Frontend management
- `/api/backends` - Backend management
- `/api/stats` - Real-time statistics
- `/api/logs` - System logs
- `/api/acls` - Access control lists
- `/api/config` - Configuration management
- `/api/alerts` - Alert management
- `/api/certificates` - SSL certificates
- `/api/ha-nodes` - HA cluster nodes
- `/api/analytics` - Analytics data
- `/api/users` - User management
- `/api/reports` - Report generation
- `/api/settings` - Settings

### WebSocket
- `ws://localhost:5555/ws` - Real-time updates

## 🎨 Frontend Technologies

- React 19
- TypeScript
- Vite
- Recharts (Charts)
- Lucide React (Icons)
- Context API (State Management)

## 🔧 Backend Technologies

- Node.js
- Express.js
- TypeScript
- WebSocket (ws)
- JWT
- bcryptjs
- Helmet (Security)
- CORS
- Morgan (Logging)

## 🚧 Development Roadmap

- [ ] Database integration (PostgreSQL/MongoDB)
- [ ] Real HAProxy stats socket integration
- [ ] File-based configuration management
- [ ] SSL certificate upload
- [ ] Email/Webhook notifications
- [ ] Advanced alerting rules
- [ ] Multi-tenancy support
- [ ] Docker containerization
- [ ] Kubernetes deployment

## 📝 License

MIT License

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 🐛 Issues

Report issues at: https://github.com/suhail-akhtar/HAProxy-Management-Portal/issues

## 👨‍💻 Author

Built with ❤️ by the HAProxy Management Portal team

## 🙏 Acknowledgments

- HAProxy for the amazing load balancer
- React community for excellent tools and libraries
- All contributors and users
