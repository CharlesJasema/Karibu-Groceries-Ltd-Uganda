# 🚀 Deploy KGL to Vercel + MongoDB Atlas (100% FREE)

## ✅ Why This Combo?
- **100% Free Forever** - No credit card required
- **No Payment Verification** - Just sign up with GitHub/Google
- **Professional Grade** - Used by millions of developers
- **Easy Setup** - 10 minutes total
- **Automatic HTTPS** - Free SSL certificates
- **Auto-deploy** - Updates automatically from GitHub

---

## 📋 STEP-BY-STEP DEPLOYMENT

### **PART 1: Create Free MongoDB Database (5 minutes)**

#### **Step 1: Sign Up for MongoDB Atlas**
1. Go to https://www.mongodb.com/cloud/atlas/register
2. Click **"Sign up with Google"** or **"Sign up with GitHub"**
3. No credit card required!

#### **Step 2: Create Free Cluster**
1. Choose **"Build a Database"**
2. Select **"M0 FREE"** tier (forever free)
3. Configuration:
   - **Provider**: AWS
   - **Region**: Choose closest to you (e.g., `us-east-1` or `eu-west-1`)
   - **Cluster Name**: `kgl-cluster`
4. Click **"Create Cluster"** (takes 3-5 minutes)

#### **Step 3: Create Database User**
1. Click **"Database Access"** (left sidebar)
2. Click **"Add New Database User"**
3. Authentication Method: **Password**
4. Username: `kgl_user`
5. Password: `KGL@2026Secure` (or generate a secure one)
6. Database User Privileges: **Read and write to any database**
7. Click **"Add User"**

#### **Step 4: Allow Network Access**
1. Click **"Network Access"** (left sidebar)
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (adds 0.0.0.0/0)
4. Click **"Confirm"**

#### **Step 5: Get Connection String**
1. Click **"Database"** (left sidebar)
2. Click **"Connect"** button on your cluster
3. Choose **"Connect your application"**
4. Driver: **Node.js**, Version: **4.1 or later**
5. Copy the connection string (looks like):
   ```
   mongodb+srv://kgl_user:<password>@kgl-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Replace `<password>` with your actual password: `KGL@2026Secure`
7. Add database name at the end: `/karibu_groceries_db`
8. Final connection string:
   ```
   mongodb+srv://kgl_user:KGL@2026Secure@kgl-cluster.xxxxx.mongodb.net/karibu_groceries_db?retryWrites=true&w=majority
   ```

**✅ Save this connection string - you'll need it for Vercel!**

---

### **PART 2: Deploy to Vercel (5 minutes)**

#### **Step 1: Sign Up for Vercel**
1. Go to https://vercel.com/signup
2. Click **"Continue with GitHub"**
3. Authorize Vercel to access your repositories
4. No credit card required!

#### **Step 2: Import Your Project**
1. Click **"Add New..."** → **"Project"**
2. Find your repository: `CharlesJasema/Karibu-Groceries-Ltd-Uganda`
3. Click **"Import"**

#### **Step 3: Configure Project**
1. **Framework Preset**: Other
2. **Root Directory**: `./` (leave as is)
3. **Build Command**: Leave empty or use `npm install`
4. **Output Directory**: Leave empty
5. **Install Command**: `npm install`

#### **Step 4: Add Environment Variables**
Click **"Environment Variables"** and add these:

| Variable | Value |
|----------|-------|
| `NODE_ENV` | `production` |
| `PORT` | `3000` |
| `DATABASE_URI` | `[Your MongoDB Atlas connection string from Part 1]` |
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
| `CLIENT_URL` | `https://your-app-name.vercel.app` (update after deployment) |

#### **Step 5: Deploy**
1. Click **"Deploy"**
2. Wait 2-3 minutes for deployment
3. You'll get a URL like: `https://karibu-groceries-ltd-uganda.vercel.app`

#### **Step 6: Update CLIENT_URL**
1. Go to your Vercel project settings
2. Click **"Environment Variables"**
3. Edit `CLIENT_URL` to your actual Vercel URL
4. Click **"Save"**
5. Redeploy (Vercel will auto-redeploy)

---

### **PART 3: Seed Database (2 minutes)**

#### **Option A: Using Vercel CLI (Recommended)**

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Login:
   ```bash
   vercel login
   ```

3. Link your project:
   ```bash
   vercel link
   ```

4. Run seed script:
   ```bash
   vercel env pull .env.production
   node seedUsers.js
   ```

#### **Option B: Using API Call**

Use this curl command (replace URL with your Vercel URL):

```bash
curl -X POST https://your-app-name.vercel.app/users \
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

Repeat for other users (manager2, agent, director).

#### **Option C: Using Postman**

1. Open Postman
2. Import your collection: `postman/KGL-Groceries-API.postman_collection.json`
3. Update base URL to your Vercel URL
4. Run the "Create User" requests

---

## 🎯 ALTERNATIVE: Cyclic.sh (Even Easier)

If Vercel doesn't work, try Cyclic.sh:

### **Steps:**

1. Go to https://app.cyclic.sh/
2. Click **"Sign in with GitHub"**
3. Click **"Link Your Own"** repository
4. Select: `CharlesJasema/Karibu-Groceries-Ltd-Uganda`
5. Click **"Connect"**
6. Add environment variables (same as above, including MongoDB Atlas connection string)
7. Click **"Deploy"**
8. Your app is live!

**Note:** Cyclic also requires MongoDB Atlas for the database (follow Part 1 above).

---

## 🎯 ALTERNATIVE: Glitch.com (Fastest - 1 Minute)

For quick testing (not recommended for production):

### **Steps:**

1. Go to https://glitch.com/
2. Click **"New Project"** → **"Import from GitHub"**
3. Paste: `https://github.com/CharlesJasema/Karibu-Groceries-Ltd-Uganda`
4. Click **".env"** file in the editor
5. Add all your environment variables
6. Your app is live instantly at: `https://your-project-name.glitch.me`

**Cons:**
- App sleeps after 5 minutes of inactivity
- Limited to 4000 requests/hour
- Not suitable for production

---

## 📊 COMPARISON TABLE

| Platform | Free Tier | Credit Card | Database | SSL | Best For |
|----------|-----------|-------------|----------|-----|----------|
| **Vercel + Atlas** | ✅ Forever | ❌ No | ✅ MongoDB | ✅ | **Production** |
| **Cyclic + Atlas** | ✅ Forever | ❌ No | ✅ MongoDB | ✅ | **Production** |
| **Glitch** | ✅ Limited | ❌ No | ❌ Need Atlas | ✅ | Testing |
| Render | ✅ 750hrs | ⚠️ Yes | ✅ | ✅ | Production |
| Railway | ✅ $5 credit | ⚠️ Yes | ✅ | ✅ | Production |

---

## 🎯 MY RECOMMENDATION

**Use Vercel + MongoDB Atlas** because:

1. ✅ 100% free forever
2. ✅ No credit card required
3. ✅ Professional and reliable
4. ✅ Used by millions of developers
5. ✅ Automatic deployments from GitHub
6. ✅ Great performance
7. ✅ Easy to set up

---

## 🆘 TROUBLESHOOTING

### **Issue: Vercel Build Fails**
**Solution**: Check build logs, ensure `package.json` has correct start script

### **Issue: Database Connection Error**
**Solution**: 
1. Verify MongoDB Atlas connection string is correct
2. Ensure IP whitelist includes 0.0.0.0/0
3. Check database user has correct permissions

### **Issue: Environment Variables Not Working**
**Solution**: 
1. Redeploy after adding variables
2. Ensure no typos in variable names
3. Check variable values don't have extra spaces

### **Issue: 404 Not Found**
**Solution**: 
1. Ensure `server.js` is in root directory
2. Check Vercel is using correct start command
3. Verify API routes are mounted correctly

---

## 📞 NEED HELP?

If you encounter any issues:
1. Check Vercel deployment logs
2. Check MongoDB Atlas connection
3. Test health endpoint: `https://your-app.vercel.app/health`
4. Contact me: brocharles001@gmail.com

---

**Deployment Time**: 10 minutes  
**Cost**: $0 (100% Free Forever)  
**Credit Card**: Not Required  
**Reliability**: High (99.9% uptime)

---

*Ready to deploy? Start with Part 1 (MongoDB Atlas)!* 🚀
