# 🌾 KGL Groceries Management System

A comprehensive web-based management system for Karibu Groceries Limited (KGL), designed to streamline operations across multiple branches with role-based access control, inventory management, sales tracking, and financial reporting.

## 🚀 Features

### 👥 **User Management**
- **Multi-role Authentication**: Manager, Sales Agent, Director roles
- **Branch-based Access Control**: Maganjo and Matugga branches
- **Profile Management**: Photo uploads, contact updates, password changes
- **User Administration**: Create, activate, deactivate, and manage users

### 📦 **Inventory & Procurement**
- **Real-time Stock Tracking**: Monitor inventory levels across branches
- **Procurement Management**: Record and track supplier purchases
- **Low Stock Alerts**: Automated notifications for inventory management
- **Multi-branch Inventory**: Separate stock management per location

### 💰 **Sales Management**
- **Cash Sales**: Immediate payment transactions
- **Credit Sales**: Deferred payment with customer tracking
- **Payment Processing**: Multiple payment methods (Cash, Mobile Money, Bank)
- **Sales Analytics**: Revenue tracking and performance metrics

### 📊 **Reporting & Analytics**
- **Financial Reports**: Revenue, expenses, and profit analysis
- **Branch Performance**: Comparative analytics across locations
- **Sales Trends**: Historical data and forecasting
- **Export Capabilities**: PDF and Excel report generation

### 🔐 **Security & Compliance**
- **JWT Authentication**: Secure token-based authentication
- **Role-based Permissions**: Granular access control
- **Audit Logging**: Complete activity tracking
- **Data Validation**: Input sanitization and validation
- **Rate Limiting**: API protection against abuse

### 📱 **Communication**
- **Email Notifications**: Automated alerts and reports
- **SMS Integration**: Africa's Talking SMS service
- **Password Recovery**: Email and SMS OTP system
- **Real-time Updates**: Live data synchronization

## 🛠️ Technology Stack

### **Backend**
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Multer** - File uploads
- **Nodemailer** - Email service
- **Swagger** - API documentation

### **Frontend**
- **Vanilla JavaScript** - Client-side logic
- **HTML5/CSS3** - Modern web standards
- **Responsive Design** - Mobile-friendly interface
- **Progressive Enhancement** - Graceful degradation

### **Infrastructure**
- **Docker** - Containerization
- **PM2** - Process management
- **Nginx** - Reverse proxy (production)
- **MongoDB Atlas** - Cloud database option

## 📋 Prerequisites

Before running the application, ensure you have:

- **Node.js** (v16 or higher)
- **MongoDB** (v5.0 or higher)
- **Git** for version control
- **Email Account** (Gmail recommended for SMTP)
- **SMS Service** (Africa's Talking account for SMS features)

## ⚡ Quick Start

### 1. **Clone the Repository**
```bash
git clone https://github.com/yourusername/kgl-groceries-system.git
cd kgl-groceries-system
```

### 2. **Install Dependencies**
```bash
npm install
```

### 3. **Environment Setup**
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your configuration
nano .env
```

### 4. **Configure Environment Variables**
```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database
DATABASE_URI=mongodb://localhost:27017/karibu_groceries_db

# JWT Security
JWT_SECRET=your-super-secure-jwt-secret-key
JWT_EXPIRES_IN=8h
JWT_REFRESH_SECRET=your-refresh-token-secret
JWT_REFRESH_EXPIRES_IN=7d

# Email Configuration (Gmail)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# SMS Configuration (Africa's Talking)
SMS_API_KEY=your-africastalking-api-key
SMS_USERNAME=your-username-or-sandbox
SMS_SENDER_ID=KGL

# Frontend
CLIENT_URL=http://localhost:3000
```

### 5. **Start MongoDB**
```bash
# Local MongoDB
mongod

# Or use MongoDB Atlas (cloud)
# Update DATABASE_URI in .env with your Atlas connection string
```

### 6. **Seed Initial Data**
```bash
# Create initial users
node seedUsers.js

# Optional: Add demo data
node seedDemoData.js
```

### 7. **Start the Application**
```bash
# Development mode
npm run dev

# Production mode
npm start
```

### 8. **Access the Application**
- **Web Interface**: http://localhost:3000
- **API Documentation**: http://localhost:3000/api-docs
- **Health Check**: http://localhost:3000/health

## 👤 Default User Accounts

After seeding with `node seedUsers.js`, you can login with these accounts:

| Role | Username | Password | Branch |
|------|----------|----------|---------|
| Manager | `manager` | `[Set via DEFAULT_USER_PASSWORD in .env]` | Maganjo |
| Manager | `manager2` | `[Set via DEFAULT_USER_PASSWORD in .env]` | Matugga |
| Sales Agent | `agent` | `[Set via DEFAULT_USER_PASSWORD in .env]` | Maganjo |
| Director | `director` | `[Set via DEFAULT_USER_PASSWORD in .env]` | N/A |

**⚠️ CRITICAL SECURITY WARNING**: 
1. Set `DEFAULT_USER_PASSWORD` in your `.env` file before seeding
2. Change all default passwords immediately after first login
3. Never use default passwords in production!

## 🔧 Configuration

### **Email Setup (Gmail)**
1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password: https://myaccount.google.com/apppasswords
3. Use the app password in `EMAIL_PASSWORD` (remove spaces)

### **SMS Setup (Africa's Talking)**
1. Sign up at https://africastalking.com
2. Get your API key from the dashboard
3. Add credits for production SMS sending
4. Update `SMS_API_KEY` and `SMS_USERNAME` in .env

### **Database Options**

#### **Local MongoDB**
```env
DATABASE_URI=mongodb://localhost:27017/karibu_groceries_db
```

#### **MongoDB Atlas (Cloud)**
```env
DATABASE_URI=mongodb+srv://username:password@cluster.mongodb.net/karibu_groceries_db
```

## 🚀 Deployment

### **Option 1: Railway (Recommended)**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

### **Option 2: Render**
1. Connect your GitHub repository
2. Set environment variables in dashboard
3. Deploy automatically on push

### **Option 3: DigitalOcean App Platform**
1. Create new app from GitHub
2. Configure environment variables
3. Deploy with automatic scaling

### **Option 4: Docker Deployment**
```bash
# Build and run with Docker
docker-compose up -d
```

## 📚 API Documentation

The system includes comprehensive API documentation available at `/api-docs` when running. Key endpoints include:

### **Authentication**
- `POST /users/login` - User authentication
- `POST /users/forgot-password` - Password recovery
- `POST /users/reset-password` - Password reset

### **User Management**
- `GET /users` - List users (Manager only)
- `POST /users` - Create user (Manager only)
- `PATCH /users/:id/activate` - Activate user
- `PATCH /users/:id/deactivate` - Deactivate user

### **Sales**
- `GET /sales/cash` - List cash sales
- `POST /sales/cash` - Record cash sale
- `GET /sales/credit` - List credit sales
- `POST /sales/credit` - Record credit sale

### **Inventory**
- `GET /inventory` - List inventory items
- `POST /inventory` - Add inventory item
- `PUT /inventory/:id` - Update inventory

### **Reports**
- `GET /reports/branch/:branch` - Branch reports
- `GET /reports/financial` - Financial reports
- `GET /reports/sales` - Sales analytics

## 🔒 Security Features

### **Authentication & Authorization**
- JWT-based authentication with refresh tokens
- Role-based access control (RBAC)
- Branch-level data isolation
- Session management and timeout

### **Data Protection**
- Input validation and sanitization
- SQL injection prevention
- XSS protection with Helmet.js
- Rate limiting on sensitive endpoints
- Password hashing with bcrypt

### **API Security**
- CORS configuration
- Request size limits
- File upload restrictions
- Error handling without data leakage

## 🧪 Testing

### **Postman Collection**
A comprehensive Postman collection is included for testing all API endpoints:

```bash
# Import these files into Postman:
postman/KGL-Groceries-API.postman_collection.json    # Complete API collection
postman/KGL-Development.postman_environment.json     # Development environment
postman/KGL-Production.postman_environment.json      # Production template
```

**Quick Start:**
1. Import collection and environment into Postman
2. Set `KGL Development Environment` as active
3. Run `Authentication > Login` request first
4. Token will be auto-saved for other requests

See `postman/README.md` for detailed testing instructions.

### **Run Tests**
```bash
# Unit tests
npm test

# Integration tests
npm run test:integration

# Coverage report
npm run test:coverage
```

### **Manual Testing**
1. **Authentication Flow**: Login with different roles
2. **Sales Operations**: Record cash and credit sales
3. **User Management**: Create and manage users (as manager)
4. **Profile Updates**: Update profiles and change passwords
5. **Password Recovery**: Test email and SMS OTP

## 📊 Monitoring & Logging

### **Application Logs**
- Request/response logging
- Error tracking and reporting
- Performance monitoring
- User activity audit trails

### **Health Monitoring**
```bash
# Check application health
curl http://localhost:3000/health

# Monitor with PM2
pm2 monit
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support & Troubleshooting

### **Common Issues**

#### **Database Connection Failed**
```bash
# Check MongoDB status
mongod --version
# Verify connection string in .env
```

#### **Email Not Sending**
```bash
# Verify Gmail app password (no spaces)
# Check EMAIL_USER and EMAIL_PASSWORD in .env
```

#### **SMS Not Working**
```bash
# Verify Africa's Talking API key
# Check account balance and credits
# Ensure phone numbers are in correct format
```

#### **Authentication Issues**
```bash
# Clear browser localStorage
# Verify JWT_SECRET is set
# Check token expiration settings
```

### **Performance Optimization**
- Enable MongoDB indexing for large datasets
- Use Redis for session storage in production
- Implement CDN for static assets
- Configure Nginx for load balancing

### **Backup & Recovery**
```bash
# MongoDB backup
mongodump --db karibu_groceries_db --out ./backup

# MongoDB restore
mongorestore --db karibu_groceries_db ./backup/karibu_groceries_db
```

## 📞 Contact

- **Developer**: Charles Jada Sebit Emmanuel
- **Email**: brocharles001@gmail.com
- **Organization**: Karibu Groceries Limited (KGL)

---

**Built with ❤️ for efficient grocery business management**