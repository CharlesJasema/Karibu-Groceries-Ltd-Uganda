# 🚀 Deploy KGL to Render.com (FREE)

## ✅ Why Render?
- **100% Free** - No credit card required
- **Automatic SSL** - Free HTTPS
- **Easy Setup** - 5 minutes to deploy
- **Auto-deploy** - Updates automatically from GitHub
- **Reliable** - Better uptime than Railway

---

## 📋 STEP-BY-STEP DEPLOYMENT

### **Step 1: Create Render Account**
1. Go to https://render.com/register
2. Sign up with GitHub (recommended) or email
3. Verify your email

### **Step 2: Create MongoDB Database**
1. Click **"New +"** → **"MongoDB"**
2. **Name**: `kgl-mongodb`
3. **Database Name**: `karibu_groceries_db`
4. **User**: `kgl_user`
5. **Region**: Oregon (or closest to you)
6. **Plan**: **Free**
7. Click **"Create Database"**
8. **Copy the Internal Connection String** (starts with `mongodb://`)

### **Step 3: Deploy Web Service**
1. Click **"New +"** → **"Web Service"**
2. **Connect GitHub Repository**: `CharlesJasema/Karibu-Groceries-Ltd-Uganda`
3. **Name**: `kgl-groceries-system`
4. **Region**: Oregon
5. **Branch**: `master`
6. **Runtime**: Node
7. **Build Command**: `npm install`
8. **Start Command**: `npm start`
9. **Plan**: **Free**

### **Step 4: Add Environment Variables**
Click **"Advanced"** and add these variables:

| Variable | Value |
|----------|-------|
| `NODE_ENV` | `production` |
| `PORT` | `3000` |
| `DATABASE_URI` | `[Paste MongoDB connection string from Step 2]` |
| `JWT_SECRET` | `a8f5f167f44f4964e6c998dee827110c` |
| `JWT_EXPIRES_IN` | `8h` |
| `JWT_REFRESH_SECRET` | `b9e6g278g55g5075f7d009eef938221d` |
| `JWT_REFRESH_EXPIRES_IN` | `7d` |
| `EMAIL_SERVICE` | `gmail` |
| `EMAIL_USER` | `brocharles001@gmail.com` |
| `EMAIL_PASSWORD` | `plgxggahhltcrsis` |
| `SMS_API_KEY` | `atsk_9c21df656cb8d71a00e3cc35b04c622667ba5f1e914bd306ea982f2a129cfa2df8974162` |
| `SMS_USERNAME` | `sandbox` |
| `SMS_SENDER_ID` | `AFRICASTKNG` |
| `DEFAULT_USER_PASSWORD` | `Manager@2026` |
| `LOG_LEVEL` | `info` |
| `LOG_FILE` | `logs/app.log` |
| `CLIENT_URL` | `https://kgl-groceries-system.onrender.com` |

### **Step 5: Deploy**
1. Click **"Create Web Service"**
2. Wait 3-5 minutes for deployment
3. Your app will be live at: `https://kgl-groceries-system.onrender.com`

### **Step 6: Seed Database**
Once deployed, create the first user:

```bash
curl -X POST https://kgl-groceries-system.onrender.com/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Manager Maganjo",
    "username": "manager",
    "email": "manager@kgl.co.ug",
    "password": "Manager@2026",
    "role": "manager",
    "branch": "Maganjo",
    "contact": "+256701234567"
  }'
```

---

## 🎯 ALTERNATIVE FREE PLATFORMS

### **Option 2: Vercel (Frontend) + MongoDB Atlas (Database)**

**Best for**: Static sites with API routes

**Steps:**
1. Go to https://vercel.com
2. Import GitHub repository
3. Add environment variables
4. Deploy

**Pros:**
- Extremely fast CDN
- Automatic HTTPS
- Great for Next.js/React

**Cons:**
- Serverless functions (not ideal for Express)
- 10-second timeout on free tier

---

### **Option 3: Fly.io**

**Best for**: Full-stack apps with databases

**Steps:**
```bash
# Install Fly CLI
curl -L https://fly.io/install.sh | sh

# Login
fly auth login

# Launch app
fly launch

# Deploy
fly deploy
```

**Pros:**
- 3 free VMs
- PostgreSQL/Redis included
- Good performance

**Cons:**
- Requires credit card (but won't charge)
- CLI-based setup

---

### **Option 4: Cyclic.sh**

**Best for**: Node.js apps

**Steps:**
1. Go to https://cyclic.sh
2. Connect GitHub
3. Deploy

**Pros:**
- No credit card required
- Automatic HTTPS
- DynamoDB included

**Cons:**
- Limited to Node.js
- Smaller community

---

### **Option 5: Glitch.com**

**Best for**: Quick prototypes

**Steps:**
1. Go to https://glitch.com
2. Import from GitHub
3. Deploy

**Pros:**
- Instant deployment
- Live code editor
- No credit card

**Cons:**
- App sleeps after 5 minutes of inactivity
- Limited resources

---

## 📊 COMPARISON TABLE

| Platform | Free Tier | Database | SSL | Auto-Deploy | Best For |
|----------|-----------|----------|-----|-------------|----------|
| **Render** | ✅ 750hrs | ✅ MongoDB | ✅ | ✅ | **Production** |
| Railway | ✅ $5 credit | ✅ | ✅ | ✅ | Production |
| Vercel | ✅ Unlimited | ❌ | ✅ | ✅ | Frontend |
| Fly.io | ✅ 3 VMs | ✅ | ✅ | ✅ | Full-stack |
| Cyclic | ✅ Unlimited | ✅ DynamoDB | ✅ | ✅ | Node.js |
| Glitch | ✅ Limited | ❌ | ✅ | ✅ | Prototypes |

---

## 🎯 MY RECOMMENDATION

**Use Render.com** because:
1. ✅ Truly free (no credit card)
2. ✅ Includes MongoDB database
3. ✅ Automatic SSL
4. ✅ Easy GitHub integration
5. ✅ Good reliability
6. ✅ Perfect for your Node.js + MongoDB stack

---

## 🆘 TROUBLESHOOTING

### **Issue: Deployment Failed**
**Solution**: Check build logs in Render dashboard

### **Issue: Database Connection Error**
**Solution**: Verify DATABASE_URI is correct

### **Issue: App Crashes**
**Solution**: Check environment variables are all set

### **Issue: 404 Not Found**
**Solution**: Ensure start command is `npm start`

---

## 📞 NEED HELP?

If you encounter any issues:
1. Check Render dashboard logs
2. Verify all environment variables
3. Test health endpoint: `https://your-app.onrender.com/health`
4. Contact me: brocharles001@gmail.com

---

**Deployment Time**: 5-10 minutes  
**Cost**: $0 (100% Free)  
**Reliability**: High (99.9% uptime)

---

*Ready to deploy? Follow Step 1 above!* 🚀
