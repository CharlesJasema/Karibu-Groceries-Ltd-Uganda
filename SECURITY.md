# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability, please email security@kgl-groceries.com or create a private security advisory on GitHub.

**Please do not report security vulnerabilities through public GitHub issues.**

## Security Measures

### Authentication
- JWT tokens with 8-hour expiration
- Bcrypt password hashing (12 rounds)
- Role-based access control (RBAC)

### API Security
- Rate limiting on authentication endpoints
- Input validation with express-validator
- CORS configuration
- Helmet.js security headers

### Database Security
- MongoDB connection with authentication
- Parameterized queries (Mongoose ODM)
- Audit logging for all critical operations

### Best Practices
- Environment variables for sensitive data
- No hardcoded credentials in production
- Regular dependency updates
- HTTPS enforcement in production

## Security Checklist for Deployment

- [ ] Change all default passwords
- [ ] Set strong JWT_SECRET (min 32 characters)
- [ ] Enable HTTPS/TLS
- [ ] Configure firewall rules
- [ ] Set up database backups
- [ ] Enable audit logging
- [ ] Configure rate limiting
- [ ] Remove demo accounts
- [ ] Set NODE_ENV=production
- [ ] Review CORS origins
- [ ] Enable MongoDB authentication
- [ ] Set up monitoring and alerts
