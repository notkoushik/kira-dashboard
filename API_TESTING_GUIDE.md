# KIRA Backend - API Testing Guide

## Authentication
All endpoints require a Bearer token in the Authorization header. First, register/login to get a token:

```bash
# Register
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "name": "Test User"
  }'

# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'

# Response includes JWT token:
# {
#   "success": true,
#   "data": {
#     "user": {...},
#     "token": "eyJhbGc..."
#   }
# }
```

Save the token:
```bash
TOKEN="eyJhbGc..."
```

---

## HR Contacts API (/api/v1/hrcontacts)

### List all HR contacts
```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/v1/hrcontacts
```

### Filter HR contacts by status
```bash
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3000/api/v1/hrcontacts?status=Email%20Drafted&limit=10"
```

### Search HR contacts
```bash
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3000/api/v1/hrcontacts?search=google"
```

### Get HR contact statistics
```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/v1/hrcontacts/stats/summary
```

### Get single HR contact
```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/v1/hrcontacts/{contactId}
```

### Create HR contact
```bash
curl -X POST -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "title": "HR Manager",
    "company": "Google",
    "linkedin_url": "https://linkedin.com/in/johndoe",
    "email": "john@google.com",
    "status": "Not Contacted",
    "notes": "Met at tech conference"
  }' http://localhost:3000/api/v1/hrcontacts
```

### Update HR contact
```bash
curl -X PATCH -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "Email Sent",
    "last_contact": "2026-04-15T10:30:00Z"
  }' http://localhost:3000/api/v1/hrcontacts/{contactId}
```

### Delete HR contact
```bash
curl -X DELETE -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/v1/hrcontacts/{contactId}
```

### Bulk delete HR contacts
```bash
curl -X POST -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "ids": ["id1", "id2", "id3"]
  }' http://localhost:3000/api/v1/hrcontacts/bulk/delete
```

---

## Daily Logs API (/api/v1/logs)

### List all daily logs
```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/v1/logs
```

### Filter logs by date range
```bash
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3000/api/v1/logs?dateFrom=2026-04-01&dateTo=2026-04-15"
```

### Get daily log statistics
```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/v1/logs/stats/summary
```

### Create daily log
```bash
curl -X POST -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "log_text": "Sent 5 applications, got 2 interviews scheduled",
    "log_date": "2026-04-15",
    "tasks_completed": 5,
    "streak_count": 12
  }' http://localhost:3000/api/v1/logs
```

### Update daily log
```bash
curl -X PATCH -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tasks_completed": 6,
    "streak_count": 13
  }' http://localhost:3000/api/v1/logs/{logId}
```

### Delete daily log
```bash
curl -X DELETE -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/v1/logs/{logId}
```

---

## Apply Queue API (/api/v1/queue)

### List all queue items
```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/v1/queue
```

### Filter queue items by status
```bash
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3000/api/v1/queue?status=To%20Apply&difficulty=Easy"
```

### Search queue items
```bash
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3000/api/v1/queue?search=Frontend%20Engineer"
```

### Get queue statistics
```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/v1/queue/stats/summary
```

### Create queue item
```bash
curl -X POST -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "company": "Google",
    "role": "Senior Frontend Engineer",
    "portal": "LinkedIn",
    "difficulty": "Hard",
    "priority": "High",
    "fit_reason": "Strong match for tech stack",
    "apply_link": "https://linkedin.com/jobs/1234",
    "status": "To Apply"
  }' http://localhost:3000/api/v1/queue
```

### Update queue item (mark as applied)
```bash
curl -X PATCH -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "Applied"
  }' http://localhost:3000/api/v1/queue/{queueId}
```

### Delete queue item
```bash
curl -X DELETE -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/v1/queue/{queueId}
```

---

## Planner Tasks API (/api/v1/planner)

### List all planner tasks
```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/v1/planner
```

### Filter tasks by date
```bash
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3000/api/v1/planner?taskDate=2026-04-15"
```

### Get planner statistics
```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/v1/planner/stats/summary
```

### Create planner task
```bash
curl -X POST -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "task_slot": "8:00 AM",
    "task_date": "2026-04-15",
    "completed": false
  }' http://localhost:3000/api/v1/planner
```

### Mark task as completed
```bash
curl -X PATCH -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "completed": true
  }' http://localhost:3000/api/v1/planner/{taskId}
```

### Delete planner task
```bash
curl -X DELETE -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/v1/planner/{taskId}
```

---

## Error Testing

### Test authentication failure (no token)
```bash
curl http://localhost:3000/api/v1/hrcontacts
# Response: 401 MISSING_TOKEN
```

### Test invalid ID format
```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/v1/hrcontacts/invalid-id
# Response: 400 INVALID_ID
```

### Test validation error
```bash
curl -X POST -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "",
    "status": "invalid"
  }' http://localhost:3000/api/v1/hrcontacts
# Response: 400 Validation error with field details
```

### Test not found
```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/v1/hrcontacts/00000000-0000-0000-0000-000000000000
# Response: 404 NOT_FOUND
```

---

## Pagination

### Request first 25 items
```bash
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3000/api/v1/hrcontacts?limit=25"
```

### Request next page (skip first 25)
```bash
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3000/api/v1/hrcontacts?skip=25&limit=25"
```

Response includes pagination metadata:
```json
{
  "success": true,
  "data": {
    "items": [...],
    "total": 150,
    "skip": 25,
    "limit": 25,
    "hasMore": true
  },
  "timestamp": "2026-04-15T..."
}
```

---

## Response Examples

### Success Response
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "user_id": "user123",
    "name": "John Doe",
    "status": "Email Sent",
    "created_at": "2026-04-15T10:00:00Z",
    "updated_at": "2026-04-15T14:30:00Z"
  },
  "timestamp": "2026-04-15T14:30:00Z"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Invalid email format",
  "code": "VALIDATION_ERROR",
  "details": [
    {
      "field": "email",
      "message": "Invalid email"
    }
  ],
  "requestId": "abc123def",
  "timestamp": "2026-04-15T14:30:00Z"
}
```

---

## Tips

- All timestamps are ISO 8601 format
- Date fields should be YYYY-MM-DD format
- All IDs are UUIDs
- Maximum items per request: 100 (limit is capped at 100)
- All data is filtered by user_id (can only access own data)
- Passwords are hashed with bcrypt
- Tokens expire after 24 hours
