# 🚀 KIRA Backend - Setup & Testing Guide

## ✅ Status Report

| Component | Status | Notes |
|-----------|--------|-------|
| TypeScript Compilation | ✅ Working | `ts-node-dev` running with transpile-only mode |
| Express App | ✅ Initialized | All middleware loaded successfully |
| Environment Variables | ✅ Loaded | Using `.env` configuration |
| Database Connection | ⏳ Test Mode | Using placeholder Supabase URL (expected to fail) |
| Port | ✅ Available | Running on port 3000 |

---

## 📋 Quick Start

### Step 1: Verify `.env` File
```bash
cd kira-backend
cat .env
```

You should see:
```
NODE_ENV=development
API_PORT=3000
SUPABASE_URL=https://your-project.supabase.co
...
```

### Step 2: Get Real Supabase Credentials

1. Go to [Supabase Console](https://app.supabase.com)
2. Create or select your project
3. Go to **Settings → API**
4. Copy these values:
   - **Project URL** → `SUPABASE_URL`
   - **Anon Key** → `SUPABASE_ANON_KEY`
   - **Service Role Key** → `SUPABASE_SERVICE_KEY`

### Step 3: Update `.env` File
```bash
# Edit .env with your Supabase credentials
SUPABASE_URL=https://your-real-project-id.supabase.co
SUPABASE_ANON_KEY=your-real-anon-key-here
SUPABASE_SERVICE_KEY=your-real-service-role-key-here
JWT_SECRET=your-strong-random-secret-min-32-chars
```

### Step 4: Start the Backend
```bash
npm run dev
```

Expected output when working:
```
🚀 KIRA Backend running on port 3000
✅ Database connection successful
```

### Step 5: Test Health Endpoint
```bash
# In another terminal
curl http://localhost:3000/health
```

Response (if working):
```json
{
  "success": true,
  "message": "KIRA Backend is running",
  "environment": "development",
  "timestamp": "2024-04-10T12:30:00.000Z"
}
```

---

## 🗄️ Database Setup

Before the backend can fully work, you need:

### 1. Create Supabase Tables

Run this SQL in Supabase SQL Editor:

```sql
-- Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  password_hash VARCHAR(255) NOT NULL,
  profile_data JSONB,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Jobs Table
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company VARCHAR(255) NOT NULL,
  role VARCHAR(255) NOT NULL,
  portal VARCHAR(100) NOT NULL,
  status VARCHAR(50) NOT NULL,
  apply_link VARCHAR(500),
  hr_name VARCHAR(255),
  hr_linkedin VARCHAR(500),
  notes TEXT,
  date_added TIMESTAMP DEFAULT now(),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_jobs_user_id ON jobs(user_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_portal ON jobs(portal);
CREATE INDEX idx_users_email ON users(email);
```

### 2. Set Row Level Security (RLS)

```sql
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

-- Users can only see their own jobs
CREATE POLICY "Users can view own jobs" ON jobs
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own jobs
CREATE POLICY "Users can insert own jobs" ON jobs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own jobs
CREATE POLICY "Users can update own jobs" ON jobs
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own jobs
CREATE POLICY "Users can delete own jobs" ON jobs
  FOR DELETE USING (auth.uid() = user_id);
```

---

## 🧪 Testing Endpoints

### 1. **Register User**
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d {
    "email": "test@example.com",
    "password": "TestPassword123!",
    "name": "Test User"
  }
```

Response:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid-here",
      "email": "test@example.com",
      "name": "Test User"
    },
    "token": "jwt-token-here"
  }
}
```

### 2. **Login User**
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d {
    "email": "test@example.com",
    "password": "TestPassword123!"
  }
```

### 3. **Get User Profile** (Requires Auth)
```bash
curl http://localhost:3000/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 4. **Create a Job** (Requires Auth)
```bash
curl -X POST http://localhost:3000/api/v1/jobs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d {
    "company": "Google",
    "role": "Senior Software Engineer",
    "portal": "LinkedIn",
    "status": "Applied",
    "apply_link": "https://..."
  }
```

### 5. **Get All Jobs** (Requires Auth)
```bash
curl http://localhost:3000/api/v1/jobs \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 6. **Get Job Stats** (Requires Auth)
```bash
curl http://localhost:3000/api/v1/jobs/stats/summary \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 🔒 Security Checklist

- ✅ Environment variables secured in `.env` (not in git)
- ✅ Passwords hashed with bcryptjs (salt 10)
- ✅ JWT tokens with 24h expiry
- ✅ Rate limiting on auth endpoints (5 req/15 min)
- ✅ CORS configured for frontend
- ✅ Helmet security headers enabled
- ✅ Input validation with Zod schemas
- ✅ XSS sanitization on request bodies
- ✅ UUID validation on all ID parameters

---

## 📝 Environment Variables Reference

| Variable | Example | Required | Notes |
|----------|---------|----------|-------|
| `NODE_ENV` | `development` | ✅ Yes | Set to `production` for production |
| `API_PORT` | `3000` | ✅ Yes | API listening port |
| `SUPABASE_URL` | `https://xxx.supabase.co` | ✅ Yes | From Supabase console |
| `SUPABASE_ANON_KEY` | `eyJ...` | ✅ Yes | From Supabase console |
| `SUPABASE_SERVICE_KEY` | `eyJ...` | ✅ Yes | From Supabase console |
| `JWT_SECRET` | `your-secret-here` | ✅ Yes | Min 32 characters |
| `JWT_EXPIRY` | `24h` | ✅ Yes | Token expiry time |
| `FRONTEND_URL` | `http://localhost:5173` | ✅ Yes | Frontend origin for CORS |
| `GMAIL_USER` | `your-email@gmail.com` | ⏳ Optional | For email notifications |
| `GMAIL_PASS` | `app-password` | ⏳ Optional | Gmail app password |
| `REDIS_URL` | `redis://localhost:6379` | ⏳ Optional | For background jobs |
| `SENTRY_DSN` | `https://...` | ⏳ Optional | Error tracking |
| `LOG_LEVEL` | `info` | ⏳ Optional | `debug`, `info`, `warn`, `error` |

---

## 🐛 Troubleshooting

### "Database connection failed"
- ✅ Check Supabase credentials in `.env`
- ✅ Verify Supabase project is running
- ✅ Check internet connection

### "Missing critical environment variable"
- ✅ Copy `.env.example` to `.env`
- ✅ Fill in all required variables
- ✅ Restart `npm run dev`

### "Rate limit exceeded"
- ✅ Auth endpoints: 5 requests per 15 minutes
- ✅ API endpoints: 100 requests per 15 minutes

### "Invalid token"
- ✅ Token might have expired (24h expiry)
- ✅ Check CORS configuration
- ✅ Ensure token is in `Authorization: Bearer TOKEN` format

---

## 📚 Available Scripts

```bash
# Development with hot reload
npm run dev

# Build for production
npm build

# Start production server
npm start

# Run linter
npm run lint

# Run tests (when configured)
npm test
```

---

## ✨ Next Steps

1. ✅ Backend running locally
2. ⏳ Connect to frontend (React)
3. ⏳ Implement job scraper with Apify
4. ⏳ Setup email notifications
5. ⏳ Deploy to production

---

Created: 2026-04-10
Last Updated: 2026-04-10
