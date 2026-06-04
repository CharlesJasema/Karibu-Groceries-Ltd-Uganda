# 🚀 KGL System - Quick Start Guide

## ✅ CURRENT STATUS

### **Local Development** ✅
- Server running on http://localhost:3000
- Database connected
- All features working
- 4 users seeded

### **Production Deployment** ❌
- Railway deployment has issues
- Need to redeploy to a reliable platform

---

## 🎯 RECOMMENDED ACTION: Deploy to Render.com

**Why Render?**
- ✅ 100% FREE (no credit card)
- ✅ More reliable than Railway
- ✅ Includes free MongoDB
- ✅ Automatic SSL
- ✅ 5-minute setup

---

## 📋 DEPLOYMENT STEPS (5 MINUTES)

### **1. Create Render Account**
Go to: https://render.com/register

### **2. Create MongoDB Database**
- Click "New +" → "MongoDB"
- Name: `kgl-mongodb`
- Plan: **Free**
- Copy connection string

### **3. Deploy Web Service**
- Click "New +" → "Web Service"
- Connect GitHub: `CharlesJasema/Karibu-Groceries-Ltd-Uganda`
- Name: `kgl-groceries-system`
- Build: `npm install`
- Start: `npm start`
- Plan: **Free**

### **4. Add Environment Variables**
Copy these into Render:

```
NODE_ENV=production
PORT=3000
DATABASE_URI=[Your MongoDB connection string]
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
LOG_LEVEL=info
LOG_FILE=logs/app.log
CLIENT_URL=https://kgl-groceries-system.onrender.com
```

### **5. Deploy & Test**
- Click "Create Web Service"
- Wait 3-5 minutes
- Visit: `https://kgl-groceries-system.onrender.com`

---

## 📚 DOCUMENTATION

- **Full Deployment Guide**: See `RENDER_DEPLOYMENT.md`
- **System Status Report**: See `SYSTEM_STATUS_REPORT.md`
- **General Setup**: See `README.md`
- **Security Info**: See `SECURITY.md`

---

## 🔑 DEFAULT LOGIN CREDENTIALS

After deployment, create users or use these defaults:

| Role | Username | Password | Branch |
|------|----------|----------|---------|
| Manager | `manager` | `Manager@2026` | Maganjo |
| Manager | `manager2` | `Manager@2026` | Matugga |
| Agent | `agent` | `Manager@2026` | Maganjo |
| Director | `director` | `Manager@2026` | N/A |

**⚠️ IMPORTANT**: Change all passwords after first login!

---

## 🆘 NEED HELP?

**Developer Contact:**
- Email: brocharles001@gmail.com
- Phone: +256785446877, +256745063600

**Common Issues:**
1. **Deployment fails**: Check build logs in Render
2. **Database error**: Verify DATABASE_URI
3. **Login fails**: Ensure users are seeded
4. **404 errors**: Check start command is `npm start`

---

## ✨ FEATURES

- ✅ Multi-branch management (Maganjo & Matugga)
- ✅ Role-based access (Manager, Agent, Director)
- ✅ Sales tracking (Cash & Credit)
- ✅ Inventory management
- ✅ Payment processing
- ✅ Financial reports
- ✅ Email & SMS notifications
- ✅ Audit logging
- ✅ Password recovery

---

**Next Step**: Follow `RENDER_DEPLOYMENT.md` to deploy! 🚀
