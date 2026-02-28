# KGL Groceries LTD - Wholesale Produce Management System

A comprehensive enterprise management system for Karibu Groceries LTD, managing procurement, inventory, sales, and credit tracking across two branches (Maganjo and Matugga).

## 🚀 Features

### Core Functionality
- **Procurement Management** - Record and track produce purchases from dealers
- **Inventory Tracking** - Real-time stock monitoring with low-stock alerts
- **Cash Sales** - Immediate payment transaction recording
- **Credit Sales** - Deferred payment tracking with due dates
- **Reporting & Analytics** - Branch and enterprise-level performance reports
- **Audit Logging** - Complete activity tracking for compliance

### Security Features
- JWT-based authentication with role-based access control (RBAC)
- Password hashing with bcrypt
- Rate limiting on authentication endpoints
- Input sanitization (XSS and NoSQL injection prevention)
- Helmet.js security headers
- Audit trail for all critical operations

### User Roles
- **Director** - Enterprise-wide visibility and reporting
- **Manager** - Branch management, procurement, user management
- **Sales Agent** - Record sales, check inventory, view reports

## 📋 Tech Stack

**Backend:**
- Node.js + Express.js
- MongoDB + Mongoose ODM
- JWT for authentication
- Swagger/OpenAPI documentation

**Frontend:**
- Vanilla HTML/CSS/JavaScript
- Responsive design
- LocalStorage for session management

**DevOps:**
- Docker & Docker Compose
- PM2 for process management
- Nginx-ready for reverse proxy

## 🛠️ Installation

### Prerequisites
- Node.js 18+
- MongoDB 7+
- npm or yarn

### Quick Start

1. **Clone the repository**
```bash
git clone https://github.com/CharlesJasema/Karibu-Groceries-Ltd-Uganda.git
cd Karibu-Groceries-Ltd-Uganda
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Create default manager account**
```bash
npm run create-manager
```

5. **Start development server**
```bash
npm run dev
```

The API will be available at `http://localhost:3000`

## 📚 API Documentation

Interactive API documentation is available at:
```
http://localhost:3000/api-docs
```

## 🔐 Default Credentials

**Manager (Maganjo):**
- Username: `manager`
- Password: `Manager@2026`

**Sales Agent (Maganjo):**
- Username: `agent`
- Password: `Agent@2026`

**Manager (Matugga):**
- Username: `manager2`
- Password: `Manager@2026`

**Director:**
- Username: `director`
- Password: `Director@2026`

⚠️ **Change these passwords immediately in production!**

## 🚢 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions including:
- PM2 process management
- Docker containerization
- Docker Compose orchestration
- Production security checklist

### Quick Deploy with Docker Compose

```bash
docker-compose up -d
```

## 📁 Project Structure

```
├── config/              # Configuration files
│   ├── db.js           # MongoDB connection
│   ├── logger.js       # Logging configuration
│   └── validateEnv.js  # Environment validation
├── middleware/          # Express middleware
│   ├── authMiddleware.js
│   ├── roleMiddleware.js
│   ├── rateLimiter.js
│   ├── sanitize.js
│   ├── errorHandler.js
│   └── auditHelper.js
├── models/             # Mongoose models
│   ├── user.js
│   ├── procurement.js
│   ├── inventory.js
│   ├── sale.js
│   ├── creditSale.js
│   └── auditLog.js
├── routes/             # API routes
│   ├── userRoutes.js
│   ├── procurementRoutes.js
│   ├── salesRoutes.js
│   └── reportsRoutes.js
├── public/             # Frontend files
│   ├── auth/          # Login pages
│   ├── manager/       # Manager dashboard
│   ├── salesAgent/    # Agent dashboard
│   └── director/      # Director dashboard
├── swagger/           # API documentation
├── logs/              # Application logs
├── server.js          # Application entry point
└── package.json       # Dependencies
```

## 🔧 Available Scripts

```bash
npm start              # Start production server
npm run dev            # Start development server with nodemon
npm run create-manager # Create default manager account
npm run seed           # Seed demo data
npm run pm2:start      # Start with PM2
npm run pm2:stop       # Stop PM2 process
npm run pm2:restart    # Restart PM2 process
npm run pm2:logs       # View PM2 logs
npm run docker:build   # Build Docker image
npm run docker:run     # Run Docker container
```

## 🔒 Security

See [SECURITY.md](./SECURITY.md) for:
- Security policies
- Vulnerability reporting
- Security best practices
- Deployment security checklist

## 📊 Database Schema

### Collections
- **users** - System users (managers, agents, directors)
- **procurements** - Produce purchases from dealers
- **inventory** - Current stock levels per branch
- **sales** - Cash sale transactions
- **creditSales** - Credit sale transactions
- **auditLogs** - Activity audit trail

### Indexes
All collections have optimized indexes for:
- Branch-based queries
- Date range queries
- User activity tracking
- Performance optimization

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Run with coverage
npm run test:coverage
```

## 📈 Monitoring

### Application Logs
Logs are stored in the `logs/` directory:
- `app.log` - All application logs
- `error.log` - Error logs only

### Health Check
```bash
curl http://localhost:3000/health
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.

## 👥 Authors

- Charles Jasema - [GitHub](https://github.com/CharlesJasema)

## 🙏 Acknowledgments

- Built for Karibu Groceries LTD, Uganda
- Designed for wholesale produce management
- Supports Maganjo and Matugga branches

## 📞 Support

For support and questions:
- GitHub Issues: [Create an issue](https://github.com/CharlesJasema/Karibu-Groceries-Ltd-Uganda/issues)
- Email: support@kgl-groceries.com

## 🗺️ Roadmap

- [ ] Email notifications for password resets
- [ ] Two-factor authentication (2FA)
- [ ] Mobile application
- [ ] Advanced analytics dashboard
- [ ] Export functionality (PDF/Excel)
- [ ] Webhook integrations
- [ ] Multi-language support
- [ ] SMS notifications for credit due dates
- [ ] Barcode/QR code scanning
- [ ] Automated backup system

---

**Made with ❤️ for Karibu Groceries LTD**
