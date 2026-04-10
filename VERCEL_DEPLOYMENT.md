# 🚀 KIRA - Vercel Deployment Guide

## 📋 Prerequisites

- Vercel account (https://vercel.com)
- GitHub account with your code pushed
- Supabase project credentials

## 🔍 Check Your Existing Deployment

### Option 1: Via Vercel Dashboard
1. Go to https://vercel.com/dashboard
2. Look for your previous KIRA project
3. You'll see all deployments and their URLs

### Option 2: Via Vercel CLI
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# List your projects
vercel projects list
```

---

## 🛠️ Deployment Setup

### Backend Deployment

#### Step 1: Prepare Backend for Production

```bash
# Build the backend
cd kira-backend
npm install
npm run build
```

#### Step 2: Deploy Backend to Vercel

**Option A: Using Git (Recommended)**

1. Push your code to GitHub:
```bash
git init
git add .
git commit -m "Initial KIRA deployment"
git push origin main
```

2. Deploy via Vercel CLI:
```bash
cd kira-backend
vercel --prod
```

3. Or connect via Vercel Dashboard:
   - Go to https://vercel.com/new
   - Select your GitHub repository
   - Click "Deploy"

**Option B: Direct Vercel Deployment**
```bash
cd kira-backend
vercel --prod --name kira-api
```

#### Step 3: Configure Backend Environment Variables

In Vercel Dashboard:
1. Go to your backend project settings
2. Click "Environment Variables"
3. Add these variables:

```
NODE_ENV=production
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_KEY=your-service-key-here
JWT_SECRET=your-strong-secret-32-chars-minimum
FRONTEND_URL=https://your-frontend-domain.vercel.app
```

⚠️ **SECURITY WARNING**: 
- Get these values from your Supabase project settings
- Never commit credentials to GitHub
- After deployment, regenerate these keys in Supabase!
- Use GitHub Secrets for any CI/CD pipelines

---

### Frontend Deployment

#### Step 1: Update Frontend API URL

Edit `index.html` and find the API_BASE line (~line 1046):

Change from:
```javascript
const API_BASE = 'http://localhost:3002/api/v1';
```

To:
```javascript
const API_BASE = 'https://your-backend-url.vercel.app/api/v1';
```

Replace `your-backend-url` with your actual backend deployment URL from Vercel.

#### Step 2: Deploy Frontend

**Option A: Vercel CLI**
```bash
cd kira-frontend
vercel --prod
```

**Option B: Vercel Dashboard**
1. Create a new project
2. Upload just the `index.html` file
3. Or connect your GitHub repo with frontend folder

**Option C: Vercel GitHub Integration**
1. Push `kira-frontend` to GitHub
2. Create `vercel.json`:
```json
{
  "buildCommand": "echo 'No build needed'",
  "installCommand": "echo 'No install needed'",
  "outputDirectory": "."
}
```

---

## 📱 Complete Deployment Checklist

### Backend Checks
- [ ] Backend builds successfully (`npm run build`)
- [ ] `vercel.json` is configured correctly
- [ ] All environment variables added in Vercel Dashboard
- [ ] Database connection test succeeds
- [ ] Health check endpoint works: `https://your-api.vercel.app/health`

### Frontend Checks
- [ ] API_BASE URL updated to production backend
- [ ] CORS configured correctly on backend
- [ ] Frontend deploys successfully
- [ ] Registration form works end-to-end
- [ ] Authentication tokens are stored properly

---

## 🧪 Testing After Deployment

### 1. Test Health Endpoint
```bash
curl https://your-api.vercel.app/health
```

Expected response:
```json
{
  "success": true,
  "message": "KIRA Backend is running",
  "environment": "production"
}
```

### 2. Test Registration
Open your frontend URL and try creating an account.

### 3. Test Login
Try logging in with the credentials you created.

---

## 🔄 Redeploy Updated Version

### When You Update Code

1. **Backend changes:**
```bash
cd kira-backend
git add .
git commit -m "Update backend"
git push origin main
# Vercel auto-deploys or:
vercel --prod
```

2. **Frontend changes:**
```bash
cd kira-frontend
git add index.html
git commit -m "Update frontend"
git push origin main
# Vercel auto-deploys or:
vercel --prod
```

---

## 📊 Your Current Setup Summary

| Component | Current | Production |
|-----------|---------|-----------|
| **Backend** | http://localhost:3002 | https://kira-api.vercel.app |
| **Frontend** | http://127.0.0.1:5500 | https://kira.vercel.app |
| **Database** | Supabase (Cloud) | Supabase (Cloud) |
| **Auth** | JWT | JWT |

---

## 🆘 Common Issues & Fixes

### Issue: CORS Error in Production
**Fix:** Update `FRONTEND_URL` in backend environment variables to match your frontend URL

### Issue: 502 Bad Gateway
**Fix:** 
1. Check backend logs in Vercel Dashboard
2. Verify all environment variables are set
3. Check database connection

### Issue: Frontend Can't Connect to Backend
**Fix:**
1. Verify frontend has correct backend URL
2. Check CORS headers in backend response
3. Verify backend is running

### Issue: Authentication Not Working
**Fix:**
1. Verify JWT_SECRET is set (and consistent across deploys)
2. Check token is being stored in localStorage
3. Verify Authorization header format: `Bearer <token>`

---

## 📞 Useful Links

- Vercel Dashboard: https://vercel.com/dashboard
- Vercel Docs: https://vercel.com/docs
- Supabase Console: https://app.supabase.com
- API Logs: Check Vercel → Your Project → Functions

---

**Last Updated**: 2026-04-10  
**Status**: Ready for Production Deployment ✅
