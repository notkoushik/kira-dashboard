# Duplicate Job Detection Implementation

## Overview
Added comprehensive duplicate job detection to prevent users from accidentally applying to the same position multiple times. The system checks for duplicates based on company and role (case-insensitive match) before allowing a new job entry.

---

## Backend Implementation

### 1. JobService.ts - New `checkDuplicate()` Method
**File**: `kira-backend/src/services/JobService.ts` (lines 92-118)

```typescript
static async checkDuplicate(userId: string, company: string, role: string)
```

**Features:**
- Case-insensitive duplicate detection using `.ilike()` (Supabase case-insensitive like operator)
- Query: `SELECT id, status FROM jobs WHERE user_id=? AND LOWER(company) LIKE LOWER(?) AND LOWER(role) LIKE LOWER(?)`
- Returns: `{ isDuplicate: boolean, existingId?: string, existingStatus?: string }`
- Handles database errors gracefully with proper logging

### 2. JobService.ts - Modified `createJob()` Method
**File**: `kira-backend/src/services/JobService.ts` (lines 120-148)

**Changes:**
- Added `force` boolean parameter (default: `false`)
- Calls `checkDuplicate()` before inserting (unless `force=true`)
- If duplicate found and `force=false`: returns duplicate info object
- If `force=true`: skips duplicate check and inserts anyway
- Original insert logic remains unchanged when no duplicate is found

### 3. Jobs Route - Updated POST Handler
**File**: `kira-backend/src/routes/jobs.ts` (lines 86-121)

**Changes:**
- Extracts `force` query parameter: `req.query.force === 'true'`
- Passes `force` flag to `JobService.createJob()`
- **409 Conflict Response** when duplicate detected:
  ```json
  {
    "success": false,
    "error": "Duplicate job found",
    "code": "DUPLICATE_JOB",
    "data": {
      "isDuplicate": true,
      "existingId": "uuid-string",
      "existingStatus": "Applied" | "Screening" | etc
    },
    "timestamp": "2026-04-15T..."
  }
  ```
- **201 Created Response** when job is successfully created (no duplicate)

---

## Frontend Implementation

### 1. Duplicate Warning Modal
**File**: `index.html` (lines 968-987)

**Modal Features:**
- Title: "Duplicate Job Detected"
- Displays: Company name, Role, and Current Status (as colored pill)
- Warning background with yellow border
- Three action buttons:
  - **"Update Existing"**: Opens edit drawer for the existing job
  - **"Add Anyway"**: Forces insert with `?force=true` query parameter
  - **"Cancel"**: Closes modal without action

**Styling:**
- Uses glass-modal effect with backdrop blur
- Yellow warning color scheme (rgba(245,158,11,0.1) background)
- Responsive layout with flex buttons

### 2. Updated `submitJob()` Function
**File**: `index.html` (lines 1700-1758)

**Key Changes:**
- For **new jobs**: Calls backend API instead of direct Supabase insert
- Uses JWT token from localStorage for authentication
- Detects `409` status code specifically for duplicates
- Displays `showDuplicateModal()` when duplicate detected
- Falls back to Supabase for **editing existing jobs** (no API call needed)
- Proper error handling with user-friendly toast messages

**API Call:**
```javascript
fetch(`${window.API_BASE_URL || 'http://localhost:3000'}/api/v1/jobs`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify(jobData),
})
```

### 3. Helper Functions
**File**: `index.html` (lines 1759-1820)

#### `showDuplicateModal(jobData, duplicateInfo)`
- Stores job data and duplicate info in global variables
- Populates modal with company, role, and status
- Styles status pill with appropriate color using `UIRenderer.statusColor()`
- Shows modal overlay

#### `closeDuplicateModal()`
- Hides modal overlay
- Clears stored data

#### `updateExistingJob()`
- Closes duplicate modal
- Calls `editJob()` with existing job ID
- Opens job edit drawer for user to update

#### `addAnywayJob()`
- Retries API call with `?force=true` query parameter
- Bypasses duplicate check on backend
- Shows "Job added (duplicate allowed) ✓" toast
- Closes both modal and drawer
- Reloads data

---

## API Endpoints

### Create Job (with Duplicate Detection)
```
POST /api/v1/jobs
POST /api/v1/jobs?force=true

Headers:
  Authorization: Bearer {jwt_token}
  Content-Type: application/json

Body:
{
  "company": "Google",
  "role": "Flutter Developer",
  "portal": "LinkedIn",
  "status": "Applied",
  "apply_link": "https://...",
  "hr_name": "John Doe",
  "hr_linkedin": "https://...",
  "notes": "..."
}

Response (409 Conflict - Duplicate):
{
  "success": false,
  "error": "Duplicate job found",
  "code": "DUPLICATE_JOB",
  "data": {
    "isDuplicate": true,
    "existingId": "550e8400-e29b-41d4-a716-446655440000",
    "existingStatus": "Applied"
  },
  "timestamp": "2026-04-15T..."
}

Response (201 Created - Success):
{
  "success": true,
  "data": {
    "id": "...",
    "user_id": "...",
    "company": "Google",
    "role": "Flutter Developer",
    ...
  },
  "timestamp": "2026-04-15T..."
}
```

---

## User Workflow

### When Duplicate Detected:

1. **User tries to add job**: "Google | Flutter Developer"
2. **System detects duplicate** (case-insensitive matching)
3. **Modal appears showing**:
   - Company: "Google"
   - Role: "Flutter Developer"
   - Current Status: "Applied" (colored pill)
4. **User options**:
   - ✏️ **Update Existing**: Opens the existing job for editing
   - ➕ **Add Anyway**: Forces save as new entry (bypass check)
   - ❌ **Cancel**: Closes modal, returns to form

### Case-Insensitive Examples:
- ✅ "google" matches existing "Google"
- ✅ "FLUTTER DEVELOPER" matches existing "Flutter Developer"
- ✅ "  Google  " (with spaces) matches existing "Google"
- ❌ "Google" does NOT match "Apple" (different company)

---

## Files Changed

| File | Changes | Lines |
|------|---------|-------|
| `kira-backend/src/services/JobService.ts` | Added `checkDuplicate()` method, modified `createJob()` | 92-148 |
| `kira-backend/src/routes/jobs.ts` | Updated POST handler for 409 responses | 86-121 |
| `index.html` | Added duplicate modal, updated `submitJob()`, added helper functions | 968-1820 |

---

## Testing Checklist

- [ ] Try adding a job normally → Should succeed
- [ ] Try adding same job again → Should show modal
- [ ] Click "Update Existing" → Should open edit drawer
- [ ] Click "Add Anyway" → Should add duplicate with notification
- [ ] Test case-insensitive: "google" vs "Google" → Should detect as duplicate
- [ ] Test edited values with spaces → Should work
- [ ] Test with different company → Should not trigger duplicate modal
- [ ] Test with different role → Should not trigger duplicate modal
- [ ] Test with force=true query param → Should bypass check
- [ ] Verify JWT token is sent with HTTP 401 if missing

---

## Notes

- **Case-Insensitive Matching**: Uses Supabase `.ilike()` operator (LIKE with case-insensitive)
- **No localStorage Data**: Job data is only stored in database, not in frontend storage
- **Force Parameter**: Available for future use or admin overrides
- **Performance**: Duplicate check happens at server-level before database insert
- **Security**: JWT authentication required for all API calls
- **Status Display**: Uses existing `UIRenderer.statusColor()` for consistent styling
