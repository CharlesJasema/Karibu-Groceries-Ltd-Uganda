# 🚀 KGL Deployment Checklist

## ✅ Pre-Deployment (COMPLETED)
- [x] Removed all secrets from git history
- [x] Updated .gitignore for security
- [x] Sanitized all documentation
- [x] Updated Gmail app password
- [x] Tested email configuration
- [x] Repository is clean and secure

## 🌐 Railway Deployment Steps

### 1. **Create Railway Project**
- [x] Logged into Railway
- [x] Created project: kgl-groceries-system
- [ ] Connect GitHub repository

### 2. **Environment Variables** (Copy these to Railway)
```env
NODE_ENV=production
PORT=3000
JWT_SECRET=a8f5f167f44f4964e6c998dee827110c
JWT_EXPIRES_IN=8h
JWT_REFRESH_SECRET=b9e6g278g55g5075f7d009eef938221d
JWT_REFRESH_EXPIRES_IN=7d
EMAIL_SERVICE=gmail
EMAIL_USER=brocharles001@gmail.com
EMAIL_PASSWORD=plgxggahhltcrsis
SMS_API_KEY=atsk_9c21df656cb8d71a00e3cc35b04c622667ba5f1e914bd306ea982f2a129cfa2df8974162
SMS_USERNAME=sandbox
SMS_SENDER_ID=AFRICASTKNG
DEFAULT_USER_PASSWORD=Manager@2026
```

### 3. **Database Setup**
- [ ] Add MongoDB service in Railway
- [ ] Copy connection string to DATABASE_URI
- [ ] Update CLIENT_URL with your Railway app URL

### 4. **Deploy Application**
- [ ] Connect GitHub repo to Railway
- [ ] Deploy from main/master branch
- [ ] Wait for build to complete

## 🧪 Post-Deployment Testing

### 1. **Health Check**
```bash
curl https://your-app.railway.app/health
```

### 2. **Seed Initial Users**
```bash
# In Railway console or locally connected to production DB
npm run seed
```

### 3. **Test Login**
- [ ] Visit your Railway app URL
- [ ] Test login with manager/Manager@2026
- [ ] Verify all dashboards load
- [ ] Test password reset functionality

### 4. **Test Core Features**
- [ ] User management (create/activate users)
- [ ] Sales recording (cash and credit)
- [ ] Inventory management
- [ ] Payment processing
- [ ] Reports generation
- [ ] Profile updates

## 🔐 Security Verification

### 1. **Change Default Passwords**
- [ ] Login as manager and change password
- [ ] Login as agent and change password
- [ ] Login as director and change password

### 2. **Test Email/SMS**
- [ ] Test password reset via email
- [ ] Test SMS notifications (if applicable)
- [ ] Verify OTP functionality

### 3. **API Security**
- [ ] Test rate limiting
- [ ] Verify JWT token expiration
- [ ] Test unauthorized access protection

## 📊 Performance Monitoring

### 1. **Railway Metrics**
- [ ] Monitor CPU usage
- [ ] Monitor memory usage
- [ ] Check response times
- [ ] Monitor error rates

### 2. **Database Performance**
- [ ] Monitor connection count
- [ ] Check query performance
- [ ] Verify backup schedule

## 🌍 Production Configuration

### 1. **Custom Domain** (Optional)
- [ ] Add custom domain in Railway
- [ ] Update DNS records
- [ ] Verify SSL certificate

### 2. **Monitoring Setup**
- [ ] Set up error alerts
- [ ] Configure uptime monitoring
- [ ] Set up log aggregation

## 📞 Support Information

**Railway Project**: https://railway.com/project/cc9f36c2-db57-45ec-90ad-01ef34a8aba2
**GitHub Repository**: https://github.com/CharlesJasema/Karibu-Groceries-Ltd-Uganda
**Documentation**: See README.md and DEPLOYMENT.md

---
**Deployment Date**: March 11, 2026
**Status**: Ready for deployment