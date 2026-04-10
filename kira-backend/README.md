# KIRA Backend API

Secure, scalable backend for Koushik's Intelligent Recruitment Agent.

## Features

✅ **JWT Authentication** - Secure user authentication with JWT tokens  
✅ **Role-Based Access Control** - All data isolated by user  
✅ **Input Validation** - Zod schema validation for all requests  
✅ **Error Handling** - Centralized error handling with Sentry integration  
✅ **Rate Limiting** - Built-in API rate limiting  
✅ **Docker Ready** - Deploy anywhere with Docker  
✅ **TypeScript** - Full type safety  

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- PostgreSQL (via Supabase)
- Redis (for background jobs - optional)

### Installation

1. **Clone and install**
```bash
npm install
```

2. **Create .env file**
```bash
cp .env.example .env
# Edit .env with your credentials
```

3. **Start development server**
```bash
npm run dev
```

Server will run on http://localhost:3000

## Environment Variables

See `.env.example` for all required variables.

**Critical variables:**
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_KEY` - Server-side Supabase key (NOT ANON KEY)
- `JWT_SECRET` - Secret for JWT tokens
- `FRONTEND_URL` - Frontend URL (for CORS)

## API Endpoints

### Auth
```
POST   /api/v1/auth/register        - Register new user
POST   /api/v1/auth/login           - Login user
POST   /api/v1/auth/logout          - Logout user
GET    /api/v1/auth/me              - Get current user
PUT    /api/v1/auth/profile         - Update profile
```

### Jobs
```
GET    /api/v1/jobs                 - List jobs (with pagination)
GET    /api/v1/jobs/:id             - Get single job
POST   /api/v1/jobs                 - Create job
PATCH  /api/v1/jobs/:id             - Update job
DELETE /api/v1/jobs/:id             - Delete job
POST   /api/v1/jobs/bulk/delete     - Delete multiple jobs
GET    /api/v1/jobs/stats/summary   - Get job statistics
```

### HR Contacts (Coming Soon)

### Analytics (Coming Soon)

## Security

- ✅ All credentials in `.env` file (never in code)
- ✅ Service-side Supabase key used (not anon key in frontend)
- ✅ JWT token validation on all protected routes
- ✅ Input validation and sanitization
- ✅ Database Row-Level Security (RLS) enabled
- ✅ Rate limiting on auth and API endpoints
- ✅ CORS enabled only for specified frontend URL
- ✅ Helmet.js security headers

## Testing

```bash
# Test with curl
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Test protected endpoint
curl -X GET http://localhost:3000/api/v1/jobs \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Deployment

### Railway.app (Recommended)

1. **Push to GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git push -u origin main
```

2. **Connect to Railway**
- Go to https://railway.app
- Create new project
- Connect your GitHub repo
- Set environment variables in Railway dashboard
- Deploy!

### Docker

```bash
# Build
docker build -t kira-backend .

# Run
docker run -p 3000:3000 --env-file .env kira-backend
```

### Other Platforms

Works with any Node.js hosting (Vercel, Heroku, Render, etc.)

## Architecture

```
src/
├── config/               # Configuration
│   ├── env.ts           - Load & validate .env
│   ├── database.ts      - Supabase client
│   └── logger.ts        - Pino logger
├── middleware/          # Express middleware
│   ├── auth.ts          - JWT verification
│   ├── validation.ts    - Zod validation
│   ├── errorHandler.ts  - Error handling
│   └── rateLimiter.ts   - Rate limiting
├── services/            # Business logic
│   ├── AuthService.ts
│   ├── JobService.ts
│   └── ...
├── routes/              # API routes
│   ├── auth.ts
│   ├── jobs.ts
│   └── ...
├── types/               # TypeScript types
│   └── index.ts
└── index.ts             # Main app
```

## Error Handling

All errors return standard format:
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "timestamp": "2026-04-10T10:30:00Z"
}
```

Error codes:
- `INVALID_CREDENTIALS` - Login failed
- `INVALID_TOKEN` - JWT verification failed
- `NOT_FOUND` - Resource not found
- `VALIDATION_ERROR` - Input validation failed
- `DB_ERROR` - Database error
- `INTERNAL_ERROR` - Server error

## Contributing

1. Fork the repo
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

MIT

## Support

For issues and questions, please create an issue on GitHub.

---

**Built with** ❤️ for KIRA - Koushik's Intelligent Recruitment Agent
