# ReferAI Full Frontend and Backend Flow Documentation

This document explains the complete end-to-end flow of the ReferAI project.

The project is split into two major applications:

- `frontend`: React + TypeScript + Vite application
- `backend`: Node.js + Express + MySQL API server

The complete request flow is:

```text
User Browser
  -> React frontend page/component
  -> frontend API client
  -> Express backend route
  -> MySQL database
  -> JSON response
  -> React state update
  -> UI re-render
```

---

## 1. Project Structure

```text
refer-ai-develop/
  README.md
  SETUP_INSTRUCTIONS.md

  frontend/
    index.html
    package.json
    vite.config.ts
    tailwind.config.js
    src/
      main.tsx
      App.tsx
      index.css
      lib/
        api.ts
        router.tsx
      contexts/
        AuthContext.tsx
      components/
        DashboardLayout.tsx
      pages/
        LandingPage.tsx
        DashboardPage.tsx
        ProfilePage.tsx
        ResumePage.tsx
        ReferralsPage.tsx
        InterviewPage.tsx
        AssessmentsPage.tsx
        JobsPage.tsx
        InternshipsPage.tsx
        CommunityPage.tsx
        BadgesPage.tsx
        SettingsPage.tsx
        TalentSearchPage.tsx
        PostJobPage.tsx
        AnalyticsPage.tsx
        auth/
          LoginPage.tsx
          RegisterPage.tsx

  backend/
    package.json
    database/
      schema.sql
    src/
      server.js
      config/
        database.js
      middleware/
        auth.js
      routes/
        auth.js
        jobs.js
        profiles.js
        referrals.js
        assessments.js
        analytics.js
        interviews.js
        resume.js
        community.js
        internships.js
        badges.js
```

---

## 2. Technology Stack

### Frontend

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Lucide React icons
- Custom hash-based router
- Browser `sessionStorage` for JWT token storage

### Backend

- Node.js
- Express
- MySQL
- `mysql2/promise`
- JWT authentication
- `bcryptjs` password hashing
- `uuid` for ID generation
- `cors`
- `dotenv`

### Database

- MySQL database named `referai`
- Schema is defined in `backend/database/schema.sql`

---

## 3. Application Startup Flow

### 3.1 Backend Startup

Backend entry file:

```text
backend/src/server.js
```

When the backend starts:

```text
npm run dev
```

or:

```text
npm start
```

the following happens:

```text
server.js loads environment variables
  -> creates Express app
  -> configures CORS
  -> configures JSON body parsing
  -> adds request logging middleware
  -> registers health endpoint
  -> mounts API route modules
  -> tests MySQL connection
  -> starts server on PORT or 3001
```

Backend server listens on:

```text
http://localhost:3001
```

API base URL:

```text
http://localhost:3001/api
```

Health check endpoint:

```text
GET /api/health
```

### 3.2 Database Connection Startup

Database config file:

```text
backend/src/config/database.js
```

It creates a MySQL connection pool:

```js
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'referai',
  waitForConnections: true,
  connectionLimit: 10,
});
```

Every backend route imports this pool:

```js
const { pool } = require('../config/database');
```

Then it runs SQL queries using:

```js
await pool.query(...)
```

### 3.3 Frontend Startup

Frontend entry file:

```text
frontend/src/main.tsx
```

Flow:

```text
main.tsx
  -> imports App
  -> imports index.css
  -> renders <App /> into #root
```

The browser starts from:

```text
frontend/index.html
```

That file contains the root DOM element:

```html
<div id="root"></div>
```

Vite loads the React app and mounts it there.

Frontend dev server usually runs on:

```text
http://localhost:5173
```

---

## 4. Root Frontend Flow

Main app file:

```text
frontend/src/App.tsx
```

The root component is:

```tsx
export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}
```

This means the full frontend app is wrapped with:

1. `Router`
2. `AuthProvider`
3. `AppRoutes`

### 4.1 Router

Router file:

```text
frontend/src/lib/router.tsx
```

This project does not use the browser history router directly. It uses a custom hash router.

Example URLs:

```text
http://localhost:5173/#/
http://localhost:5173/#/login
http://localhost:5173/#/dashboard
http://localhost:5173/#/profile
```

The router reads:

```js
window.location.hash
```

and converts it into an app path.

For example:

```text
window.location.hash = "#/dashboard"
```

becomes:

```text
/dashboard
```

The important router exports are:

- `Router`
- `Routes`
- `Route`
- `Navigate`
- `Link`
- `useNavigate`
- `useLocation`
- `useRouter`

### 4.2 Auth Provider

Auth file:

```text
frontend/src/contexts/AuthContext.tsx
```

This manages:

- current user
- session
- loading state
- login
- registration
- logout
- user refresh

It exposes:

```ts
session
user
loading
signIn()
signUp()
signOut()
refreshUser()
```

Every component can access auth using:

```tsx
const { user, session, signIn, signOut } = useAuth();
```

---

## 5. Frontend Route Map

Route definitions are in:

```text
frontend/src/App.tsx
```

### Public Routes

```text
/          -> LandingPage
/login     -> LoginPage
/register  -> RegisterPage
```

### Protected Routes

All protected routes are wrapped with:

```tsx
<ProtectedRoute>
  <DashboardLayout>
    <Page />
  </DashboardLayout>
</ProtectedRoute>
```

Protected routes:

```text
/dashboard    -> DashboardPage
/profile      -> ProfilePage
/resume       -> ResumePage
/referrals    -> ReferralsPage
/interview    -> InterviewPage
/assessments  -> AssessmentsPage
/jobs         -> JobsPage
/internships  -> InternshipsPage
/community    -> CommunityPage
/badges       -> BadgesPage
/settings     -> SettingsPage
/talent       -> TalentSearchPage
/post-job     -> PostJobPage
/analytics    -> AnalyticsPage
```

Fallback route:

```text
* -> Navigate to /
```

---

## 6. Protected Route Flow

Protected route logic is in:

```text
frontend/src/App.tsx
```

Flow:

```text
User opens protected route
  -> ProtectedRoute checks AuthContext
  -> if loading, show loading screen
  -> if no session, redirect to /login
  -> if session exists, render requested page
```

Pseudo flow:

```tsx
if (loading) {
  return <LoadingScreen />;
}

if (!session) {
  return <Navigate to="/login" replace />;
}

return children;
```

---

## 7. Public Only Route Flow

Login and register are wrapped in `PublicOnlyRoute`.

Flow:

```text
User opens /login or /register
  -> if auth is loading, render nothing
  -> if already logged in, redirect to /dashboard
  -> if not logged in, show login/register page
```

This prevents logged-in users from visiting login/register again.

---

## 8. Frontend API Client Flow

API file:

```text
frontend/src/lib/api.ts
```

Base URL:

```ts
const API_BASE = 'http://localhost:3001/api';
```

All API wrappers use a central `ApiClient`.

Main request flow:

```text
frontend component
  -> calls feature API wrapper
  -> api.ts builds fetch request
  -> token is read from sessionStorage
  -> Authorization header is added
  -> request goes to backend
  -> response JSON is parsed
  -> error is thrown if response is not ok
  -> data returned to component
```

Token read:

```ts
sessionStorage.getItem('token')
```

Authorization header:

```http
Authorization: Bearer <token>
```

Example request:

```ts
profilesApi.getCandidate()
```

becomes:

```text
GET http://localhost:3001/api/profiles/candidate
Authorization: Bearer <token>
```

---

## 9. Authentication End-to-End Flow

### 9.1 Register Flow

Frontend files:

```text
frontend/src/pages/auth/RegisterPage.tsx
frontend/src/contexts/AuthContext.tsx
frontend/src/lib/api.ts
```

Backend files:

```text
backend/src/routes/auth.js
backend/src/middleware/auth.js
backend/src/config/database.js
```

Database table:

```text
users
```

Complete flow:

```text
User opens /register
  -> RegisterPage renders role selection
  -> user selects role
  -> user enters full name, email, password
  -> form submit calls signUp()
  -> AuthContext.signUp calls authApi.register()
  -> api.ts sends POST /api/auth/register
  -> backend validates required fields
  -> backend checks if email already exists
  -> backend hashes password using bcrypt
  -> backend creates UUID
  -> backend inserts user into users table
  -> backend generates JWT
  -> backend returns user and token
  -> frontend stores token in sessionStorage
  -> AuthContext sets user/session
  -> frontend navigates to /dashboard
```

Request:

```http
POST /api/auth/register
```

Body:

```json
{
  "email": "user@example.com",
  "password": "password123",
  "full_name": "User Name",
  "role": "candidate"
}
```

Response:

```json
{
  "message": "User registered successfully",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "full_name": "User Name",
    "role": "candidate"
  },
  "token": "jwt-token"
}
```

### 9.2 Login Flow

Complete flow:

```text
User opens /login
  -> LoginPage renders form
  -> user enters email/password
  -> form submit calls signIn()
  -> AuthContext.signIn calls authApi.login()
  -> api.ts sends POST /api/auth/login
  -> backend queries users table by email
  -> backend compares password with bcrypt
  -> backend generates JWT
  -> backend returns user and token
  -> frontend stores token in sessionStorage
  -> AuthContext sets user/session
  -> frontend navigates to /dashboard
```

Request:

```http
POST /api/auth/login
```

Body:

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### 9.3 Current User Flow

When the app reloads:

```text
AuthProvider mounts
  -> checks sessionStorage for token
  -> if token exists, calls authApi.getCurrentUser()
  -> sends GET /api/auth/me
  -> backend authMiddleware validates JWT
  -> backend queries users table by req.user.id
  -> returns current user
  -> frontend restores session
```

Request:

```http
GET /api/auth/me
Authorization: Bearer <token>
```

### 9.4 Logout Flow

Flow:

```text
User clicks sign out
  -> DashboardLayout opens logout modal
  -> user confirms
  -> signOut() is called
  -> authApi.logout() attempts POST /api/auth/logout
  -> token is removed from sessionStorage
  -> AuthContext clears user/session
  -> user navigates to /
```

Important note:

The frontend calls:

```text
POST /api/auth/logout
```

but the backend currently does not define this route. The frontend ignores logout errors, so logout still works locally by clearing the token.

---

## 10. Backend Authentication Middleware

File:

```text
backend/src/middleware/auth.js
```

This file provides:

- `hashPassword(password)`
- `comparePassword(password, hash)`
- `generateToken(payload)`
- `verifyToken(token)`
- `authMiddleware`
- `optionalAuth`

### authMiddleware

Used when login is required.

Flow:

```text
Read Authorization header
  -> require Bearer token
  -> verify JWT
  -> if invalid, return 401
  -> if valid, attach decoded payload to req.user
  -> continue to route handler
```

After middleware succeeds:

```js
req.user = {
  id,
  email,
  role
}
```

### optionalAuth

Used when auth is optional.

Example:

```text
GET /api/jobs
GET /api/community
```

If token exists and is valid, it sets `req.user`.
If token is missing, request still continues.

---

## 11. Dashboard Layout Flow

File:

```text
frontend/src/components/DashboardLayout.tsx
```

All protected pages use this layout.

It renders:

- sidebar
- logo
- role-based navigation
- user information
- points
- sign-out button
- top bar
- notification dropdown
- main content area

### Role-Based Navigation

Navigation items are defined in:

```tsx
const NAV_ITEMS = [...]
```

Each item has:

```ts
label
icon
path
roles
```

Example:

```ts
{
  label: 'Analytics',
  icon: BarChart2,
  path: '/analytics',
  roles: ['admin', 'recruiter']
}
```

Visible navigation is calculated using:

```tsx
const visibleNav = NAV_ITEMS.filter(item =>
  user && item.roles.includes(user.role)
);
```

So each role sees different sidebar links.

---

## 12. Dashboard Page Flow

File:

```text
frontend/src/pages/DashboardPage.tsx
```

Dashboard renders different content by user role:

```tsx
switch (user.role) {
  case 'candidate':
    return <CandidateDashboard user={user} />;
  case 'employee':
    return <EmployeeDashboard user={user} />;
  case 'recruiter':
    return <RecruiterDashboard user={user} />;
  case 'student':
    return <StudentDashboard user={user} />;
  case 'admin':
    return <AdminDashboard user={user} />;
  default:
    return <CandidateDashboard user={user} />;
}
```

### Candidate Dashboard

Flow:

```text
CandidateDashboard mounts
  -> calls profilesApi.getCandidate()
  -> GET /api/profiles/candidate
  -> reads candidate_profiles table
  -> displays referral readiness, resume score, ATS score, LinkedIn score, assessment score, interview score
```

### Employee Dashboard

Flow:

```text
EmployeeDashboard mounts
  -> calls profilesApi.getEmployee()
  -> calls referralsApi.getAll()
  -> displays employee profile stats and referral requests
```

### Recruiter Dashboard

Mostly UI links to:

- post job
- talent search
- analytics

### Student Dashboard

Mostly UI links to:

- internships
- jobs
- mock interview
- resume check

### Admin Dashboard

Flow:

```text
AdminDashboard mounts
  -> calls analyticsApi.getStats()
  -> GET /api/analytics/stats
  -> backend checks req.user.role === 'admin'
  -> returns platform counts and analytics
  -> dashboard renders charts and metrics
```

---

## 13. Backend Route Mounting

File:

```text
backend/src/server.js
```

Routes are mounted like this:

```js
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/referrals', referralRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/internships', internshipRoutes);
app.use('/api/badges', badgeRoutes);
```

So a route defined inside `routes/auth.js` as:

```js
router.post('/login', ...)
```

becomes:

```text
POST /api/auth/login
```

---

## 14. Backend API Endpoint Map

### Auth

File:

```text
backend/src/routes/auth.js
```

```text
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
PUT  /api/auth/me
```

### Jobs

File:

```text
backend/src/routes/jobs.js
```

```text
GET    /api/jobs
GET    /api/jobs/:id
POST   /api/jobs
PUT    /api/jobs/:id
DELETE /api/jobs/:id
```

### Profiles

File:

```text
backend/src/routes/profiles.js
```

```text
GET    /api/profiles/candidate
POST   /api/profiles/candidate
GET    /api/profiles/employee
POST   /api/profiles/employee

GET    /api/profiles/education
POST   /api/profiles/education
PUT    /api/profiles/education/:id
DELETE /api/profiles/education/:id

GET    /api/profiles/experience
POST   /api/profiles/experience
PUT    /api/profiles/experience/:id
DELETE /api/profiles/experience/:id

GET    /api/profiles/projects
POST   /api/profiles/projects
DELETE /api/profiles/projects/:id

GET    /api/profiles/certifications
POST   /api/profiles/certifications
DELETE /api/profiles/certifications/:id
```

### Referrals

File:

```text
backend/src/routes/referrals.js
```

```text
GET  /api/referrals
POST /api/referrals
PUT  /api/referrals/:id
GET  /api/referrals/employees
```

Important note:

`GET /api/referrals/employees` is declared after `GET /api/referrals/:id` is not present in this file, so it is fine.

### Assessments

File:

```text
backend/src/routes/assessments.js
```

```text
GET  /api/assessments
GET  /api/assessments/:id
POST /api/assessments
PUT  /api/assessments/:id/complete
```

### Interviews

File:

```text
backend/src/routes/interviews.js
```

```text
GET  /api/interviews
POST /api/interviews
PUT  /api/interviews/:id/complete
```

### Resume

File:

```text
backend/src/routes/resume.js
```

```text
GET  /api/resume
POST /api/resume
```

### Community

File:

```text
backend/src/routes/community.js
```

```text
GET  /api/community
GET  /api/community/:id
POST /api/community
POST /api/community/:id/like
GET  /api/community/:id/replies
POST /api/community/:id/replies
```

Important note:

In Express, route order matters. Since `GET /:id` is declared before `GET /:id/replies`, a request like:

```text
GET /api/community/abc/replies
```

can still match `/:id/replies` because the route has more path segments, so it is acceptable here.

### Internships

File:

```text
backend/src/routes/internships.js
```

```text
GET  /api/internships
GET  /api/internships/:id
POST /api/internships
```

### Badges

File:

```text
backend/src/routes/badges.js
```

```text
GET  /api/badges
POST /api/badges
```

### Analytics

File:

```text
backend/src/routes/analytics.js
```

```text
GET /api/analytics/stats
GET /api/analytics/public
```

---

## 15. Frontend API Wrapper Map

File:

```text
frontend/src/lib/api.ts
```

### `authApi`

```text
register()        -> POST /auth/register
login()           -> POST /auth/login
logout()          -> POST /auth/logout
getCurrentUser()  -> GET  /auth/me
updateProfile()   -> PUT  /auth/me
```

### `jobsApi`

```text
getAll()    -> GET    /jobs
getById()   -> GET    /jobs/:id
create()    -> POST   /jobs
update()    -> PUT    /jobs/:id
delete()    -> DELETE /jobs/:id
```

### `internshipsApi`

```text
getAll()   -> GET  /internships
getById()  -> GET  /internships/:id
create()   -> POST /internships
```

### `profilesApi`

```text
getCandidate()          -> GET    /profiles/candidate
saveCandidate()         -> POST   /profiles/candidate
getEmployee()           -> GET    /profiles/employee
saveEmployee()          -> POST   /profiles/employee

getEducation()          -> GET    /profiles/education
addEducation()          -> POST   /profiles/education
updateEducation()       -> PUT    /profiles/education/:id
deleteEducation()       -> DELETE /profiles/education/:id

getExperience()         -> GET    /profiles/experience
addExperience()         -> POST   /profiles/experience
updateExperience()      -> PUT    /profiles/experience/:id
deleteExperience()      -> DELETE /profiles/experience/:id

getProjects()           -> GET    /profiles/projects
addProject()            -> POST   /profiles/projects
updateProject()         -> PUT    /profiles/projects/:id
deleteProject()         -> DELETE /profiles/projects/:id

getCertifications()     -> GET    /profiles/certifications
addCertification()      -> POST   /profiles/certifications
deleteCertification()   -> DELETE /profiles/certifications/:id
```

Important note:

The frontend has `updateProject()`, but the backend currently does not define:

```text
PUT /api/profiles/projects/:id
```

So project update calls will fail unless that route is added.

### `referralsApi`

```text
getAll()        -> GET  /referrals
create()        -> POST /referrals
updateStatus()  -> PUT  /referrals/:id
getEmployees()  -> GET  /referrals/employees
```

### `assessmentsApi`

```text
getAll()    -> GET  /assessments
getById()   -> GET  /assessments/:id
create()    -> POST /assessments
complete()  -> PUT  /assessments/:id/complete
```

### `interviewsApi`

```text
getAll()    -> GET  /interviews
create()    -> POST /interviews
complete()  -> PUT  /interviews/:id/complete
```

### `resumeApi`

```text
getAll()  -> GET  /resume
create()  -> POST /resume
```

### `communityApi`

```text
getAll()      -> GET  /community
getById()     -> GET  /community/:id
create()      -> POST /community
like()        -> POST /community/:id/like
getReplies()  -> GET  /community/:id/replies
addReply()    -> POST /community/:id/replies
```

### `badgesApi`

```text
getAll()  -> GET  /badges
earn()    -> POST /badges
```

### `analyticsApi`

```text
getStats()       -> GET /analytics/stats
getPublicStats() -> GET /analytics/public
```

---

## 16. Database Schema Overview

Schema file:

```text
backend/database/schema.sql
```

Database name:

```text
referai
```

### Main Tables

#### `users`

Base account table for every role.

Important columns:

```text
id
email
password_hash
full_name
avatar_url
role
is_verified
points
plan
created_at
updated_at
```

Roles:

```text
candidate
employee
recruiter
admin
student
```

#### `candidate_profiles`

Candidate profile and scoring data.

Stores:

- phone
- location
- links
- headline
- bio
- skills
- resume score
- ATS score
- LinkedIn score
- assessment score
- interview score
- referral readiness score
- recommendation

#### `employee_profiles`

Employee referrer profile.

Stores:

- company
- designation
- company email
- LinkedIn URL
- verification status
- trust score
- referral counts

#### `student_profiles`

Student profile data.

Stores:

- college
- degree
- branch
- graduation year
- CGPA
- skills
- GitHub/LinkedIn/resume
- internship readiness score

#### `companies`

Company master table.

Stores:

- name
- logo
- industry
- size
- website
- description
- verified flag

#### `jobs`

Job postings.

Stores:

- title
- company
- location
- job type
- salary
- description
- requirements
- skills
- posted_by
- active/featured flags
- application count
- views

#### `internships`

Internship postings.

Stores:

- title
- company
- location
- remote flag
- duration
- stipend
- skills
- openings
- posted_by

#### `referral_requests`

Candidate-to-employee referral workflow.

Stores:

- candidate_id
- employee_id
- job_id
- status
- cover letter
- candidate message
- employee notes

Statuses:

```text
requested
accepted
rejected
referred
shortlisted
interview
offer
hired
```

#### `assessments`

Assessment sessions.

Stores:

- user_id
- job_id
- assessment type
- questions
- total questions
- time limit
- status
- score
- integrity score

#### `interview_sessions`

Mock interview sessions.

Stores:

- user_id
- job_id
- mode
- interview type
- questions
- answers
- technical score
- communication score
- confidence score
- problem-solving score
- overall score
- report
- status

#### `resume_analyses`

Resume and ATS analysis results.

Stores:

- resume URL
- extracted skills
- experience years
- education data
- certifications
- projects
- resume score
- missing skills
- suggestions
- ATS score
- missing ATS keywords
- ATS suggestions

#### `notifications`

Notification data.

Currently there is a table, but the frontend notification dropdown is static/mock UI.

#### `forum_posts`

Community posts.

Stores:

- author
- title
- content
- category
- tags
- upvotes
- views
- reply count
- pinned flag

#### `forum_replies`

Community replies.

Stores:

- post_id
- author_id
- content
- upvotes

#### `user_badges`

User badge records.

Stores:

- user_id
- badge_type
- badge_name
- awarded_at

Important note:

The schema defines:

```text
awarded_at
```

but backend `badges.js` uses:

```text
earned_at
```

So the badges route and schema are currently mismatched.

#### `subscriptions`

Subscription and plan data.

#### `education`

User education entries.

#### `work_experience`

User work experience entries.

#### `projects`

User projects.

#### `certifications`

User certifications.

---

## 17. Feature Flow: Profile

Frontend file:

```text
frontend/src/pages/ProfilePage.tsx
```

Backend file:

```text
backend/src/routes/profiles.js
```

Database tables:

```text
candidate_profiles
employee_profiles
education
work_experience
projects
certifications
```

### Page Load Flow

```text
User opens /profile
  -> ProtectedRoute validates session
  -> DashboardLayout renders sidebar/topbar
  -> ProfilePage mounts
  -> ProfilePage calls:
       profilesApi.getCandidate()
       profilesApi.getEducation()
       profilesApi.getExperience()
       profilesApi.getProjects()
       profilesApi.getCertifications()
  -> backend validates JWT for each request
  -> backend reads rows by req.user.id
  -> frontend stores returned data in state
  -> UI renders profile sections
```

### Save Candidate Profile Flow

```text
User edits profile fields
  -> React local state updates
  -> user clicks Save Changes
  -> saveProfile() runs
  -> profilesApi.saveCandidate(profile)
  -> POST /api/profiles/candidate
  -> backend checks if candidate profile exists
  -> if exists, UPDATE candidate_profiles
  -> if not, INSERT candidate_profiles
  -> backend returns saved profile
  -> frontend displays Saved state
```

### Education Flow

```text
Add education
  -> POST /api/profiles/education
  -> insert into education table

Update education
  -> PUT /api/profiles/education/:id
  -> update education row where id and user_id match

Delete education
  -> DELETE /api/profiles/education/:id
  -> delete education row where id and user_id match
```

### Experience Flow

```text
Add experience
  -> POST /api/profiles/experience
  -> insert into work_experience table

Update experience
  -> PUT /api/profiles/experience/:id
  -> update work_experience row

Delete experience
  -> DELETE /api/profiles/experience/:id
```

### Project Flow

```text
Add project
  -> POST /api/profiles/projects
  -> insert into projects table

Delete project
  -> DELETE /api/profiles/projects/:id
```

Important note:

Frontend attempts project updates with:

```text
PUT /api/profiles/projects/:id
```

but backend route is missing.

### Certification Flow

```text
Add certification
  -> POST /api/profiles/certifications

Delete certification
  -> DELETE /api/profiles/certifications/:id
```

Important note:

Frontend update certification currently calls `addCertification()` again instead of a real update route.

---

## 18. Feature Flow: Jobs

Frontend file:

```text
frontend/src/pages/JobsPage.tsx
```

Frontend API wrapper:

```text
frontend/src/lib/api.ts -> jobsApi
```

Backend file:

```text
backend/src/routes/jobs.js
```

Database table:

```text
jobs
```

### Backend Job List Flow

```text
GET /api/jobs
  -> optionalAuth reads token if present
  -> backend reads query params:
       search
       location
       type
       limit
       offset
  -> builds SQL query
  -> selects active jobs
  -> applies filters
  -> orders by created_at desc
  -> returns jobs
```

### Backend Job Details Flow

```text
GET /api/jobs/:id
  -> selects job by id
  -> if not found, returns 404
  -> increments views
  -> returns job
```

### Backend Create Job Flow

```text
POST /api/jobs
  -> authMiddleware requires login
  -> validates title and company_name
  -> creates UUID
  -> inserts row into jobs table
  -> posted_by = req.user.id
  -> returns created job
```

### Backend Update Job Flow

```text
PUT /api/jobs/:id
  -> authMiddleware requires login
  -> checks job exists and posted_by = req.user.id
  -> updates allowed fields only
  -> returns updated job
```

### Backend Delete Job Flow

```text
DELETE /api/jobs/:id
  -> authMiddleware requires login
  -> deletes only if posted_by = req.user.id
```

### Important Frontend Note

`JobsPage.tsx` currently uses local `MOCK_JOBS`, not `jobsApi.getAll()`.

So the backend jobs API exists, but the visible Jobs page is not connected to live database jobs yet.

---

## 19. Feature Flow: Referrals

Frontend API wrapper:

```text
frontend/src/lib/api.ts -> referralsApi
```

Backend file:

```text
backend/src/routes/referrals.js
```

Database table:

```text
referral_requests
```

### Get Referrals Flow

```text
GET /api/referrals
  -> authMiddleware validates JWT
  -> backend reads req.user.role
  -> if role is employee:
       SELECT referrals WHERE employee_id = req.user.id
  -> else:
       SELECT referrals WHERE candidate_id = req.user.id
  -> returns referral list
```

### Create Referral Flow

```text
POST /api/referrals
  -> authMiddleware validates JWT
  -> reads employee_id, job_id, cover_letter, candidate_message
  -> creates UUID
  -> inserts referral_requests row
  -> candidate_id = req.user.id
  -> returns created referral
```

### Update Referral Status Flow

```text
PUT /api/referrals/:id
  -> authMiddleware validates JWT
  -> checks referral belongs to current user as employee or candidate
  -> updates status and employee_notes
  -> returns updated referral
```

### Find Employees Flow

```text
GET /api/referrals/employees
  -> authMiddleware validates JWT
  -> joins users and employee_profiles
  -> filters users with role = employee
  -> optional search by name or company
  -> returns employee referrers
```

---

## 20. Feature Flow: Resume

Frontend API wrapper:

```text
frontend/src/lib/api.ts -> resumeApi
```

Backend file:

```text
backend/src/routes/resume.js
```

Database tables:

```text
resume_analyses
candidate_profiles
```

### Get Resume Analyses Flow

```text
GET /api/resume
  -> authMiddleware validates JWT
  -> selects latest 10 resume_analyses for req.user.id
  -> returns analyses
```

### Create Resume Analysis Flow

```text
POST /api/resume
  -> authMiddleware validates JWT
  -> receives resume analysis data
  -> inserts resume_analyses row
  -> updates candidate_profiles.resume_score
  -> updates candidate_profiles.ats_score
  -> returns created analysis
```

---

## 21. Feature Flow: Assessments

Frontend API wrapper:

```text
frontend/src/lib/api.ts -> assessmentsApi
```

Backend file:

```text
backend/src/routes/assessments.js
```

Database tables:

```text
assessments
candidate_profiles
```

### Get Assessments Flow

```text
GET /api/assessments
  -> authMiddleware validates JWT
  -> selects assessments for req.user.id
```

### Create Assessment Flow

```text
POST /api/assessments
  -> authMiddleware validates JWT
  -> receives assessment_type, title, questions, total_questions, time_limit, job_id
  -> creates assessment with status = in_progress
  -> started_at = NOW()
  -> returns created assessment
```

### Complete Assessment Flow

```text
PUT /api/assessments/:id/complete
  -> authMiddleware validates JWT
  -> updates assessment status to completed
  -> saves score and integrity_score
  -> completed_at = NOW()
  -> updates candidate_profiles.assessment_score
  -> returns updated assessment
```

---

## 22. Feature Flow: Interviews

Frontend API wrapper:

```text
frontend/src/lib/api.ts -> interviewsApi
```

Backend file:

```text
backend/src/routes/interviews.js
```

Database tables:

```text
interview_sessions
candidate_profiles
```

### Get Interviews Flow

```text
GET /api/interviews
  -> authMiddleware validates JWT
  -> selects interview_sessions for req.user.id
```

### Create Interview Flow

```text
POST /api/interviews
  -> authMiddleware validates JWT
  -> receives mode, interview_type, questions, job_id
  -> creates interview session
  -> status = pending
  -> returns created interview session
```

### Complete Interview Flow

```text
PUT /api/interviews/:id/complete
  -> authMiddleware validates JWT
  -> stores answers and scores
  -> sets status = completed
  -> completed_at = NOW()
  -> updates candidate_profiles.interview_score
  -> returns updated interview
```

---

## 23. Feature Flow: Community

Frontend API wrapper:

```text
frontend/src/lib/api.ts -> communityApi
```

Backend file:

```text
backend/src/routes/community.js
```

Database tables:

```text
forum_posts
forum_replies
users
```

### Get Posts Flow

```text
GET /api/community
  -> optionalAuth reads token if present
  -> reads category, search, limit, offset
  -> joins forum_posts with users
  -> filters by category/search if provided
  -> orders pinned posts first, then newest
  -> returns posts with author_name
```

### Get Single Post Flow

```text
GET /api/community/:id
  -> gets post by id
  -> increments views
  -> returns post
```

### Create Post Flow

```text
POST /api/community
  -> authMiddleware validates JWT
  -> validates title and content
  -> creates UUID
  -> inserts forum_posts row
  -> author_id = req.user.id
  -> returns created post with author_name
```

### Like Post Flow

```text
POST /api/community/:id/like
  -> authMiddleware validates JWT
  -> increments upvotes
  -> returns updated upvote count
```

### Replies Flow

```text
GET /api/community/:id/replies
  -> gets replies for post
  -> joins users for author_name

POST /api/community/:id/replies
  -> authMiddleware validates JWT
  -> inserts forum_replies row
  -> increments forum_posts.reply_count
  -> returns created reply
```

---

## 24. Feature Flow: Internships

Frontend API wrapper:

```text
frontend/src/lib/api.ts -> internshipsApi
```

Backend file:

```text
backend/src/routes/internships.js
```

Database table:

```text
internships
```

### Get Internships Flow

```text
GET /api/internships
  -> optionalAuth reads token if present
  -> reads search, remote_only, limit, offset
  -> selects active internships
  -> applies filters
  -> returns internships
```

### Get Internship Details Flow

```text
GET /api/internships/:id
  -> selects internship by id
  -> returns 404 if not found
  -> returns internship
```

### Create Internship Flow

```text
POST /api/internships
  -> authMiddleware validates JWT
  -> validates title and company_name
  -> creates UUID
  -> inserts internship
  -> posted_by = req.user.id
  -> returns created internship
```

---

## 25. Feature Flow: Badges

Frontend API wrapper:

```text
frontend/src/lib/api.ts -> badgesApi
```

Backend file:

```text
backend/src/routes/badges.js
```

Database tables:

```text
user_badges
users
```

### Get Badges Flow

```text
GET /api/badges
  -> authMiddleware validates JWT
  -> selects user_badges for req.user.id
```

### Earn Badge Flow

```text
POST /api/badges
  -> authMiddleware validates JWT
  -> receives badge_type
  -> checks if user already earned it
  -> inserts user_badges row
  -> calculates points for badge type
  -> updates users.points
  -> returns created badge
```

Important schema mismatch:

The backend uses `earned_at`, but schema uses `awarded_at`.

---

## 26. Feature Flow: Analytics

Frontend API wrapper:

```text
frontend/src/lib/api.ts -> analyticsApi
```

Backend file:

```text
backend/src/routes/analytics.js
```

Database tables used:

```text
users
jobs
referral_requests
companies
```

### Public Analytics Flow

```text
GET /api/analytics/public
  -> no auth required
  -> counts users
  -> counts jobs
  -> counts companies
  -> returns public stats
```

### Admin Analytics Flow

```text
GET /api/analytics/stats
  -> authMiddleware validates JWT
  -> backend checks req.user.role === 'admin'
  -> if not admin, returns 403
  -> counts total users/jobs/referrals/companies
  -> counts users by role
  -> groups referrals by status
  -> counts new users/referrals in last 7 days
  -> gets top companies
  -> gets monthly growth
  -> returns analytics object
```

Important note:

Top companies query currently uses:

```sql
LEFT JOIN referral_requests r ON 1=0
```

That means referral counts will always be zero. It likely needs a real relationship between companies, jobs, and referrals.

---

## 27. Full Request Lifecycle Example: Login

```text
1. User opens:
   http://localhost:5173/#/login

2. Router detects path:
   /login

3. AppRoutes renders:
   <PublicOnlyRoute><LoginPage /></PublicOnlyRoute>

4. User submits form.

5. LoginPage calls:
   signIn(email, password)

6. AuthContext calls:
   authApi.login(email, password)

7. api.ts sends:
   POST http://localhost:3001/api/auth/login

8. Express receives request in:
   backend/src/routes/auth.js

9. Backend:
   - checks email/password exist
   - queries users table by email
   - compares password with bcrypt
   - generates JWT
   - returns user and token

10. Frontend:
    - stores token in sessionStorage
    - sets user state
    - sets session state
    - navigates to /dashboard

11. Dashboard route:
    - ProtectedRoute sees session
    - DashboardLayout renders
    - DashboardPage renders role-specific dashboard
```

---

## 28. Full Request Lifecycle Example: Save Candidate Profile

```text
1. User opens:
   http://localhost:5173/#/profile

2. Router detects:
   /profile

3. ProtectedRoute checks AuthContext session.

4. DashboardLayout renders around ProfilePage.

5. ProfilePage mounts and calls:
   profilesApi.getCandidate()
   profilesApi.getEducation()
   profilesApi.getExperience()
   profilesApi.getProjects()
   profilesApi.getCertifications()

6. api.ts adds:
   Authorization: Bearer <token>

7. Backend authMiddleware:
   - verifies JWT
   - attaches decoded user to req.user

8. Backend profile routes query data by:
   req.user.id

9. Frontend stores returned data in React state.

10. User edits form fields.

11. React state updates locally.

12. User clicks Save Changes.

13. ProfilePage calls:
    profilesApi.saveCandidate(profile)

14. api.ts sends:
    POST /api/profiles/candidate

15. Backend:
    - checks if profile exists for user
    - updates existing row or inserts new row
    - returns saved profile

16. Frontend:
    - shows saved state
    - continues rendering updated profile
```

---

## 29. Full Request Lifecycle Example: Create Referral

```text
1. Candidate finds an employee referrer.

2. Frontend calls:
   referralsApi.create(data)

3. api.ts sends:
   POST /api/referrals
   Authorization: Bearer <token>

4. Backend authMiddleware:
   - validates JWT
   - sets req.user.id

5. Backend creates referral request:
   - id = uuid
   - candidate_id = req.user.id
   - employee_id = request body employee_id
   - job_id = request body job_id
   - cover_letter = request body cover_letter
   - candidate_message = request body candidate_message

6. Backend inserts into:
   referral_requests

7. Backend returns created referral.

8. Frontend updates UI.
```

---

## 30. Full Request Lifecycle Example: Admin Analytics

```text
1. Admin user opens:
   /dashboard

2. DashboardPage checks:
   user.role === 'admin'

3. AdminDashboard mounts.

4. AdminDashboard calls:
   analyticsApi.getStats()

5. api.ts sends:
   GET /api/analytics/stats
   Authorization: Bearer <token>

6. Backend authMiddleware validates JWT.

7. Backend route checks:
   req.user.role === 'admin'

8. Backend runs SQL count queries:
   users
   jobs
   referral_requests
   companies

9. Backend returns stats.

10. Frontend renders:
    - total users
    - active jobs
    - referrals
    - companies
    - user role breakdown
    - referral status breakdown
    - monthly growth chart
```

---

## 31. Error Handling Flow

### Frontend Error Handling

In `api.ts`:

```ts
if (!res.ok) {
  throw new Error(data.error || 'Request failed');
}
```

So backend errors become JavaScript exceptions.

Example:

```tsx
try {
  await profilesApi.saveCandidate(profile);
} catch (error) {
  console.error('Failed to save profile:', error);
}
```

### Backend Error Handling

Most backend routes use:

```js
try {
  ...
} catch (error) {
  console.error(...);
  res.status(500).json({ error: '...' });
}
```

Global error handler in `server.js`:

```js
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});
```

404 handler:

```js
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});
```

---

## 32. Security Flow

### Password Security

Passwords are never stored directly.

Flow:

```text
plain password
  -> bcrypt hash
  -> stored in users.password_hash
```

Login compares:

```text
submitted password
  -> bcrypt compare against stored hash
```

### JWT Security

JWT contains:

```js
{
  id,
  email,
  role
}
```

Token is signed with:

```text
JWT_SECRET
```

Default fallback is:

```text
your_super_secret_jwt_key
```

For production, this must be changed in `.env`.

### Route Security

Routes use either:

```js
authMiddleware
```

or:

```js
optionalAuth
```

Protected routes require a valid JWT.

Some routes also check ownership:

```text
jobs update/delete:
  posted_by must equal req.user.id

referral update:
  current user must be employee_id or candidate_id

profile sections:
  user_id must equal req.user.id
```

---

## 33. Role System

Roles are defined in the `users` table:

```text
candidate
employee
recruiter
admin
student
```

Roles affect:

- visible sidebar navigation
- dashboard content
- backend analytics access
- referral request behavior
- feature availability

### Candidate

Can access:

- dashboard
- profile
- resume
- referrals
- mock interview
- assessments
- jobs
- community
- badges
- settings

### Employee

Can access:

- dashboard
- referrals
- jobs
- post job
- community
- settings

### Recruiter

Can access:

- dashboard
- jobs
- internships
- talent search
- post job
- analytics
- community
- settings

### Student

Can access:

- dashboard
- profile
- resume
- mock interview
- assessments
- jobs
- internships
- community
- badges
- settings

### Admin

Can access:

- dashboard
- analytics
- community
- settings

---

## 34. Current Integration Status

Some features are fully connected to backend APIs. Some pages use mock/static data.

### Connected or Mostly Connected

- Auth login/register/current user
- Candidate profile load/save
- Education CRUD
- Experience CRUD
- Referrals API
- Assessments API
- Interviews API
- Resume API
- Community API
- Analytics API
- Internships backend API
- Jobs backend API

### Not Fully Connected / Needs Attention

#### Jobs Page

`JobsPage.tsx` uses `MOCK_JOBS`, not `jobsApi`.

Needed:

```text
Replace MOCK_JOBS filtering with jobsApi.getAll()
```

#### Logout Endpoint

Frontend calls:

```text
POST /api/auth/logout
```

Backend does not define it.

Current behavior still works because frontend clears token locally.

#### Project Update

Frontend calls:

```text
PUT /api/profiles/projects/:id
```

Backend does not define this route.

#### Certification Update

Frontend update function calls `addCertification()` instead of a true update endpoint.

#### Badges Schema Mismatch

Backend uses:

```text
earned_at
```

Schema uses:

```text
awarded_at
```

This will cause badge queries/inserts to fail unless fixed.

#### Candidate Skills Save

`profiles.js` has logic for `skills`, but the `fields` array for candidate profile does not include `skills`.

So skills may not be saved correctly through `saveCandidate()`.

#### Admin Top Companies

Analytics top companies query uses:

```sql
LEFT JOIN referral_requests r ON 1=0
```

This always produces zero referral counts.

---

## 35. How to Add a New Feature End-to-End

Use this pattern.

### Step 1: Add Database Table

Edit:

```text
backend/database/schema.sql
```

Add table or columns.

### Step 2: Add Backend Route

Create or update a route file in:

```text
backend/src/routes/
```

Example:

```js
router.get('/', authMiddleware, async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM table WHERE user_id = ?', [req.user.id]);
  res.json(rows);
});
```

### Step 3: Mount Route

Update:

```text
backend/src/server.js
```

Example:

```js
const featureRoutes = require('./routes/feature');
app.use('/api/feature', featureRoutes);
```

### Step 4: Add Frontend API Wrapper

Update:

```text
frontend/src/lib/api.ts
```

Example:

```ts
export const featureApi = {
  async getAll() {
    return api.get<any[]>('/feature');
  },
  async create(data: any) {
    return api.post<any>('/feature', data);
  },
};
```

### Step 5: Add Page or Component

Create or update a page in:

```text
frontend/src/pages/
```

Use:

```tsx
useEffect(() => {
  featureApi.getAll().then(setItems);
}, []);
```

### Step 6: Add Route

Update:

```text
frontend/src/App.tsx
```

Add:

```tsx
<Route path="/feature" element={<ProtectedRoute><DashboardLayout><FeaturePage /></DashboardLayout></ProtectedRoute>} />
```

### Step 7: Add Sidebar Navigation

Update:

```text
frontend/src/components/DashboardLayout.tsx
```

Add a new item to `NAV_ITEMS`.

---

## 36. Main Mental Model

To understand this codebase, remember this:

```text
App.tsx decides which page renders.
AuthContext decides whether user is logged in.
DashboardLayout decides the protected app shell.
api.ts decides how frontend talks to backend.
server.js decides which backend route handles each request.
auth.js middleware decides whether the request is allowed.
route files decide what SQL runs.
schema.sql decides what data can exist.
```

The most important code flow is:

```text
React Page
  -> API wrapper in frontend/src/lib/api.ts
  -> Express route in backend/src/routes
  -> MySQL query through backend/src/config/database.js
  -> JSON response
  -> React state
  -> UI update
```

---

## 37. Recommended Reading Order

If you are new to the project, read files in this order:

1. `frontend/src/main.tsx`
2. `frontend/src/App.tsx`
3. `frontend/src/lib/router.tsx`
4. `frontend/src/contexts/AuthContext.tsx`
5. `frontend/src/lib/api.ts`
6. `frontend/src/components/DashboardLayout.tsx`
7. `frontend/src/pages/DashboardPage.tsx`
8. `backend/src/server.js`
9. `backend/src/config/database.js`
10. `backend/src/middleware/auth.js`
11. `backend/src/routes/auth.js`
12. `backend/src/routes/profiles.js`
13. `backend/src/routes/referrals.js`
14. `backend/database/schema.sql`

After that, read feature files based on what you want to work on.

---

## 38. Quick Summary

ReferAI is a role-based career/referral platform.

Frontend:

```text
React renders pages.
Custom router handles hash URLs.
AuthContext manages login/session.
api.ts calls backend.
DashboardLayout provides protected shell.
Pages render role-specific workflows.
```

Backend:

```text
Express receives API requests.
authMiddleware validates JWT tokens.
Route files handle feature logic.
MySQL stores all persistent data.
Responses are JSON.
```

Database:

```text
users is the base table.
profiles, jobs, referrals, assessments, interviews, resumes, community, badges, analytics all connect around users.
```

End-to-end:

```text
Login creates JWT.
JWT is stored in sessionStorage.
Protected frontend routes require AuthContext session.
Protected backend routes require Authorization Bearer token.
Each request uses req.user.id to read/write only the logged-in user's data.
```
