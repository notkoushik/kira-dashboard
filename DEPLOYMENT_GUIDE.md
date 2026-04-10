# 🚀 KIRA - Production Deployment Guide

## 📋 Pre-Deployment Checklist

### Backend Requirements
- [ ] All environment variables configured
- [ ] Database created and migrated
- [ ] JWT secret is strong (>32 chars, random)
- [ ] SSL/TLS certificates ready
- [ ] Supabase service role key secured
- [ ] Email service configured (Gmail)
- [ ] Sentry project created and DSN obtained
- [ ] Redis instance setup (optional but recommended)
- [ ] Rate limiting adjusted for production
- [ ] Logging centralized

### Frontend Requirements
- [ ] Backend API endpoints updated in code
- [ ] Environment configuration created
- [ ] All third-party services configured
- [ ] Built and tested locally
- [ ] Performance optimized
- [ ] Error tracking (Sentry) configured

---

## 🌍 Deployment Options

### Option 1: Heroku (Easiest)

#### Backend Deployment
```bash
# 1. Install Heroku CLI
# 2. Login
heroku login

# 3. Create app
heroku create kira-backend-prod

# 4. Set environment variables
heroku config:set \
  NODE_ENV=production \
  SUPABASE_URL=your-url \
  SUPABASE_ANON_KEY=your-key \
  SUPABASE_SERVICE_KEY=your-service-key \
  JWT_SECRET=your-strong-secret

# 5. Deploy
git push heroku main
```

#### Frontend Deployment
```bash
# Option A: Use Netlify (free)
netlify deploy --prod --dir kira-frontend

# Option B: Use Vercel (free)
vercel --prod
```

---

### Option 2: AWS EC2

#### Backend Deployment
```bash
# 1. Create EC2 instance (Ubuntu 22.04)
# 2. SSH into instance
ssh -i key.pem ec2-user@your-instance-ip

# 3. Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 4. Clone repository
git clone your-repo-url
cd kira-backend

# 5. Install dependencies
npm install --production

# 6. Create environment file
nano .env
# (add production credentials)

# 7. Build
npm run build

# 8. Install PM2 (process manager)
npm install -g pm2

# 9. Start application
pm2 start dist/index.js --name "kira-backend"
pm2 save

# 10. Setup auto-restart on reboot
pm2 startup
```

#### Frontend Deployment
```bash
# Option A: S3 + CloudFront (CDN)
aws s3 cp kira-frontend/index.html s3://your-bucket/
aws cloudfront create-distribution --config-file config.json

# Option B: Static hosting with Nginx
sudo cp kira-frontend/index.html /var/www/html/
sudo systemctl restart nginx
```

---

### Option 3: Railway.app (Recommended)

#### Backend
```bash
# 1. Connect GitHub repo to Railway
# 2. Add environment variables in Railway dashboard
# 3. Deploy - automatic on git push
```

#### Frontend
```bash
# Deploy as static site on Railway
# Or use Vercel/Netlify for free frontend hosting
```

---

### Option 4: Docker + Google Cloud Run

#### Create Dockerfile for Backend
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

#### Deploy
```bash
# 1. Build image
docker build -t kira-backend .

# 2. Push to Google Cloud Registry
docker tag kira-backend gcr.io/your-project/kira-backend
docker push gcr.io/your-project/kira-backend

# 3. Deploy on Cloud Run
gcloud run deploy kira-backend \
  --image gcr.io/your-project/kira-backend \
  --platform managed \
  --region us-central1 \
  --set-env-vars "NODE_ENV=production,..."
```

---

## 🔐 Security Checklist for Production

### Environment
- [ ] NODE_ENV=production
- [ ] JWT_SECRET: Strong random string (>32 chars)
- [ ] All credentials in environment variables (never in code)
- [ ] CORS_ORIGIN limited to your domain only
- [ ] HTTPS/SSL enabled
- [ ] Rate limiting enabled and tuned

### Database
- [ ] Row Level Security (RLS) enabled
- [ ] Backups automated and tested
- [ ] Regular backups scheduled (daily minimum)
- [ ] Database encryption at rest
- [ ] Connection pooling configured
- [ ] Indexes created for performance

### API Security
- [ ] Helmet security headers enabled
- [ ] CORS properly configured
- [ ] Input validation enabled
- [ ] Rate limiting active
- [ ] Request size limits set
- [ ] Sanitization enabled

### Monitoring & Logging
- [ ] Sentry configured and monitoring
- [ ] Centralized logging setup
- [ ] Error alerts configured
- [ ] Performance monitoring active
- [ ] Uptime monitoring enabled
- [ ] Log retention policy set

### SSL/TLS
- [ ] Valid SSL certificate
- [ ] Certificate auto-renewal configured
- [ ] HTTPS redirect enabled
- [ ] HSTS header configured
- [ ] Mixed content blocked

---

## 📊 Performance Optimization

### Backend
```bash
# 1. Enable compression
npm install compression

# 2. Use CDN for static assets
# Configure CloudFlare, AWS CloudFront, or similar

# 3. Setup caching headers
app.use(express.static('public', {
  maxAge: '1d'
}));

# 4. Enable connection pooling
# Supabase handles this automatically

# 5. Monitor with New Relic or DataDog
npm install newrelic
```

### Frontend
```bash
# 1. Minimize HTML/CSS/JS
# 2. Enable gzip compression
# 3. Use CDN for libraries
# 4. Cache-bust on updates
# 5. Optimize images
```

---

## 🚨 Monitoring & Alerts

### Essential Metrics to Monitor
```
- API response time (target: <200ms)
- Error rate (target: <0.1%)
- Database connection pool
- Memory usage (target: <500MB)
- CPU usage (target: <50%)
- Request throughput
- Failed login attempts
- Rate limit hits
```

### Setup Alerts
```bash
# Using Sentry
sentry-cli releases files upload-sourcemaps .

# Using Datadog
npm install @datadog/browser-rum

# Using Prometheus + Grafana
npm install prom-client
```

---

## 🔄 Continuous Deployment (CI/CD)

See `.github/workflows/deploy.yml` for GitHub Actions setup

---

## 📈 Scaling Strategy

### Horizontal Scaling (Multiple Servers)
```
Frontend: CDN (Cloudflare, Akamai)
Backend: Load balancer (Nginx, AWS ELB)
Database: Read replicas (Supabase handles)
Cache: Redis cluster
```

### Vertical Scaling (Bigger Servers)
```
Increase CPU cores
Increase RAM
Increase storage
```

### Database Optimization
```
- Connection pooling (PgBouncer)
- Read replicas
- Partitioning large tables
- Materialized views for reports
- Full-text search indexes
```

---

## 💰 Cost Estimation (Monthly)

### Option 1: Heroku
```
Backend:   $25-100 (dynos)
Database:  $50-200 (Postgres)
Storage:   $0-50 (attachments)
Bandwidth: included
Total:     $75-350/month
```

### Option 2: AWS
```
EC2:       $10-50 (t3.micro-small)
RDS:       $15-100 (db.t3.micro-small)
S3:        $1-10 (storage)
CloudFront: $0-20 (CDN)
NAT:       $30-45
Total:     $56-225/month
```

### Option 3: Google Cloud Run
```
Cloud Run: $0-50 (pay per request)
Cloud SQL: $30-150 (Postgres)
Storage:   $0-10
Total:     $30-210/month
```

### Option 4: Railway.app
```
Backend:   $5-50
Database:  $0-100
Storage:   included
Total:     $5-150/month
```

---

## 🛠️ Post-Deployment Tasks

- [ ] Verify all endpoints working
- [ ] Test authentication flow
- [ ] Verify database connectivity
- [ ] Check error tracking
- [ ] Monitor logs for errors
- [ ] Run smoke tests
- [ ] Check performance metrics
- [ ] Validate HTTPS/SSL
- [ ] Setup automatic backups
- [ ] Document deployment procedure

---

## 🆘 Rollback Procedure

```bash
# If deployment fails:

# Option 1: Revert to previous version
git revert HEAD
git push

# Option 2: Use blue-green deployment
# Keep previous version running
# Route traffic back to previous version
# Fix and redeploy

# Option 3: Database rollback
# Restore from backup if needed
```

---

## 📞 Support Resources

- Heroku Docs: https://devcenter.heroku.com
- AWS Docs: https://docs.aws.amazon.com
- Railway Docs: https://railway.app/docs
- Docker Docs: https://docs.docker.com
- Supabase Docs: https://supabase.com/docs
- PM2 Guide: https://pm2.keymetrics.io

---

**Last Updated**: 2026-04-10  
**Status**: Production Ready ✅
