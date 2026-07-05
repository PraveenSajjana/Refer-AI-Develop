# ReferAI - Complete Referral Flow Documentation

## What is a Referral?

A **referral** is a formal recommendation from a company employee that connects a job candidate to open positions at their company. In the recruiting world, employee referrals are one of the most effective ways to get hired - referred candidates are 3-4x more likely to be hired than those who apply through job boards.

## User Roles in the System

| Role | Description |
|------|-------------|
| **Candidate** | Job seeker looking for referrals to companies |
| **Employee** | Company employee who can provide referrals |
| **Recruiter** | HR/Talent acquisition professional posting jobs |
| **Student** | College student seeking internships |
| **Admin** | Platform administrator |

---

## Complete Referral Flow - Step by Step

### Phase 1: Candidate Preparation

Before requesting a referral, candidates should optimize their profile:

```
1. Upload Resume → Resume Score (ATS analysis)
2. Complete Profile → Profile Completeness Score
3. Take Assessments → Assessment Score  
4. Mock Interviews → Interview Score
5. Link LinkedIn → LinkedIn Score
```

All scores combine into a **Referral Readiness Score** (0-100). Employees are more likely to accept requests from candidates with higher scores.

---

### Phase 2: Finding an Employee Referrer

**Frontend:** `ReferralsPage.tsx` → Tab: "Find Referrers"

**API Call:**
```http
GET /api/referrals/employees?search=google
```

**Backend Route:** `backend/src/routes/referrals.js`
- Returns employees with highest trust scores and successful referrals
- Can filter by company name, skills, or designation

**Response Fields:**
| Field | Description |
|-------|-------------|
| `id` | Employee's user ID (UUID) |
| `full_name` | Employee name |
| `company` | Current company |
| `designation` | Job title |
| `trust_score` | 0-100 score based on referral history |
| `total_referrals` | Total referral requests received |
| `successful_referrals` | Referrals that led to hires |
| `linkedin_verified` | LinkedIn account verified |
| `company_email_verified` | Work email verified |

---

### Phase 3: Sending a Referral Request

**Frontend:** User clicks "Request Referral" → Modal opens → Message entered → Submit

**API Call:**
```http
POST /api/referrals
Content-Type: application/json

{
  "employee_id": "uuid-of-employee",
  "job_id": "uuid-of-job",        // optional
  "candidate_message": "Hi! I'm a React developer..."
}
```

**Backend Validation (referrals.js:65-130):**
1. Validates `employee_id` is a valid UUID format
2. Verifies employee exists in `users` table with `role='employee'`
3. Validates `job_id` if provided
4. Checks for duplicate pending requests
5. Creates record with status `'requested'`

**Database Table:** `referral_requests`
| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `candidate_id` | uuid | FK → users.id (job seeker) |
| `employee_id` | uuid | FK → users.id (referrer) |
| `job_id` | uuid | FK → jobs.id (optional) |
| `status` | text | Current stage |
| `candidate_message` | text | Intro message to employee |
| `cover_letter` | text | Formal cover letter |
| `employee_notes` | text | Private notes by employee |
| `jd_match_score` | integer | Job-description match % |
| `created_at` | timestamptz | Request timestamp |
| `updated_at` | timestamptz | Last status change |

---

### Phase 4: Referral Status Lifecycle

```
┌─────────────┐
│  REQUESTED  │  ← Initial state when candidate sends request
└──────┬──────┘
       │ Employee reviews & decides
       ▼
┌─────────────┐     ┌─────────────┐
│  ACCEPTED   │ OR  │  REJECTED   │
└──────┬──────┘     └─────────────┘
       │ Employee submits to company ATS
       ▼
┌─────────────┐
│  REFERRED   │
└──────┬──────┘
       │ Company recruiter screens
       ▼
┌─────────────┐
│ SHORTLISTED │
└──────┬──────┘
       │ Interview scheduled
       ▼
┌─────────────┐
│  INTERVIEW  │
└──────┬──────┘
       │ Interview process
       ▼
┌─────────────┐
│   OFFER     │
└──────┬──────┘
       │ Candidate accepts
       ▼
┌─────────────┐
│   HIRED     │  ← Final state, triggers badges & points
└─────────────┘
```

---

### Phase 5: Employee Manages Requests

**Frontend:** `ReferralsPage.tsx` → Tab: "Manage Requests" (employees only)

**API Call:**
```http
GET /api/referrals
```

**Backend Logic:**
- If user is `employee`: returns requests where `employee_id = user.id`
- If user is `candidate`: returns requests where `candidate_id = user.id`

**Employee Actions:**

#### Accept Request
```http
PUT /api/referrals/:id
{ "status": "accepted" }
```
- Employee agrees to refer
- Should review candidate's profile/resume

#### Reject Request
```http
PUT /api/referrals/:id
{ "status": "rejected", "employee_notes": "Looking for ML experience" }
```
- Employee declines to refer
- Optional notes for candidate feedback

#### Mark as Referred
```http
PUT /api/referrals/:id
{ "status": "referred" }
```
- Employee has submitted referral in company's internal system
- This is when the actual referral happens

---

### Phase 6: Tracking Progress

**Frontend:** Visual timeline in `ReferralsPage.tsx` showing all stages

Both parties see the same referral record with status progression. The employee updates status as the hiring process advances.

---

## Badge System Integration

When certain referral milestones are reached, badges are automatically awarded:

| Badge Type | Trigger | Points |
|------------|---------|--------|
| `first_referral` | First referral request sent | 50 |
| `referral_accepted` | Employee accepts your request | 100 |
| `hired` | Status reaches 'hired' | 500 |
| `community_contributor` | Active in forums | 75 |
| `referral_readiness_75` | Readiness score ≥ 75 | 150 |

**API:**
```http
POST /api/badges
{ "badge_type": "first_referral" }
```

---

## Trust Score System

Employees have a `trust_score` (0-100) calculated based on:

```
trust_score = base_score + (successful_referrals * 10) - (rejected_requests * 2)
```

Higher trust score employees appear first in search results, making them more discoverable to candidates.

---

## Security & RLS Policies

**Row Level Security on `referral_requests` table:**

```sql
-- Users can only see their own requests
CREATE POLICY "rr_select_own" ON referral_requests 
  FOR SELECT TO authenticated 
  USING (auth.uid() = candidate_id OR auth.uid() = employee_id);

-- Only candidates can create requests
CREATE POLICY "rr_insert_own" ON referral_requests 
  FOR INSERT TO authenticated 
  WITH CHECK (auth.uid() = candidate_id);

-- Both can update (candidate cancels, employee updates status)
CREATE POLICY "rr_update_own" ON referral_requests 
  FOR UPDATE TO authenticated 
  USING (auth.uid() = candidate_id OR auth.uid() = employee_id);
```

---

## API Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/referrals` | Get user's referrals (candidate or employee) |
| POST | `/api/referrals` | Create new referral request |
| PUT | `/api/referrals/:id` | Update referral status |
| GET | `/api/referrals/employees` | List employee referrers |
| GET | `/api/referrals/employees/:id` | Get specific employee |
| GET | `/api/badges` | Get user's earned badges |
| POST | `/api/badges` | Earn a badge |

---

## Data Flow Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                         CANDIDATE                                │
│  1. Complete profile →  2. Search employees →  3. Send request   │
└────────────────────────────────┬─────────────────────────────────┘
                                 │
                                 ▼
┌──────────────────────────────────────────────────────────────────┐
│                     BACKEND API SERVER                           │
│  - Validates employee exists                                     │
│  - Checks for duplicates                                         │
│  - Creates referral_requests record                              │
│  - Status: 'requested'                                           │
└────────────────────────────────┬─────────────────────────────────┘
                                 │
                                 ▼
┌──────────────────────────────────────────────────────────────────┐
│                         EMPLOYEE                                 │
│  4. Reviews request → 5. Accept/Reject → 6. Updates status       │
└────────────────────────────────┬─────────────────────────────────┘
                                 │
                                 ▼
┌──────────────────────────────────────────────────────────────────┐
│                    STATUS PROGRESSION                            │
│  requested → accepted → referred → shortlisted → interview       │
│                                                → offer → hired   │
└──────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌──────────────────────────────────────────────────────────────────┐
│                    BADGES & POINTS                               │
│  - first_referral badge (50 pts)                                 │
│  - referral_accepted badge (100 pts)                             │
│  - hired badge (500 pts)                                         │
└──────────────────────────────────────────────────────────────────┘
```

---

## Error Handling

The referral API now validates inputs:

1. **Invalid UUID format** → 400 Bad Request
2. **Employee not found** → 404 Not Found
3. **User is not an employee** → 400 Bad Request
4. **Duplicate pending request** → 400 Bad Request
5. **Invalid status value** → 400 Bad Request
6. **Unauthorized access** → 404 Not Found

---

## Frontend Components

### `src/pages/ReferralsPage.tsx`

**For Candidates:**
- Tab 1: "Find Referrers" - Search and request
- Tab 2: "My Requests" - Track status

**For Employees:**
- Tab 1: "Manage Requests" - Accept/Reject/Update

### Key Functions:
- `sendReferralRequest()` - Creates POST request
- `updateStatus()` - Updates referral status
- Search filtering by name, company, skills

---

## Database Schema Reference

### `users` table
```sql
id uuid PRIMARY KEY
email text UNIQUE
full_name text
role text  -- 'candidate', 'employee', 'recruiter', 'admin', 'student'
points integer
plan text  -- 'free', 'premium', 'recruiter_pro', etc.
```

### `employee_profiles` table
```sql
user_id uuid REFERENCES users(id)
company text
designation text
trust_score integer
total_referrals integer
successful_referrals integer
linkedin_verified boolean
company_email_verified boolean
```

### `user_badges` table
```sql
user_id uuid REFERENCES users(id)
badge_type text
badge_name text
awarded_at timestamptz
```
