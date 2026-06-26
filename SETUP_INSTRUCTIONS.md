# ReferAI - Complete Source Code

AI-Powered Job Referral & Career Acceleration Platform

## Project Structure

```
referai-local/
├── frontend/           # React + TypeScript + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── lib/
│   │   └── pages/
│   ├── package.json
│   └── vite.config.ts
│
├── backend/            # Node.js + Express backend
│   ├── src/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── config/
│   │   └── server.js
│   ├── database/
│   │   └── schema.sql
│   ├── package.json
│   └── .env.example
│
└── README.md
```

## Prerequisites

1. **Node.js** (v18 or higher)
2. **MySQL** (v8.0 or higher)
3. **npm** or **yarn**

## Setup Instructions

### Step 1: Database Setup

1. Start MySQL server
2. Create the database by running the schema:

```bash
# Login to MySQL
mysql -u root -p

# Run the schema (from outside MySQL shell)
mysql -u root -p < backend/database/schema.sql
```

Or run this SQL directly in MySQL:

```sql
CREATE DATABASE IF NOT EXISTS referai;
USE referai;
-- Then copy and paste the contents of backend/database/schema.sql
```

### Step 2: Backend Setup

```bash
cd backend

# Copy environment file
cp .env.example .env

# Edit .env with your MySQL credentials
# DB_HOST=localhost
# DB_PORT=3306
# DB_USER=root
# DB_PASSWORD=your_mysql_password
# DB_NAME=referai
# JWT_SECRET=your_secret_key_here

# Install dependencies
npm install

# Start the server
npm run dev
```

Backend will run on: http://localhost:3001

### Step 3: Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will run on: http://localhost:5173

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/me` - Update user profile

### Jobs
- `GET /api/jobs` - Get all jobs
- `GET /api/jobs/:id` - Get job by ID
- `POST /api/jobs` - Create job (auth required)
- `PUT /api/jobs/:id` - Update job (auth required)
- `DELETE /api/jobs/:id` - Delete job (auth required)

### Internships
- `GET /api/internships` - Get all internships
- `GET /api/internships/:id` - Get internship by ID
- `POST /api/internships` - Create internship (auth required)

### Profiles
- `GET /api/profiles/candidate` - Get candidate profile
- `POST /api/profiles/candidate` - Save candidate profile
- `GET /api/profiles/employee` - Get employee profile
- `POST /api/profiles/employee` - Save employee profile
- `GET/POST/PUT/DELETE /api/profiles/education`
- `GET/POST/PUT/DELETE /api/profiles/experience`
- `GET/POST/DELETE /api/profiles/projects`
- `GET/POST/DELETE /api/profiles/certifications`

### Referrals
- `GET /api/referrals` - Get user's referral requests
- `POST /api/referrals` - Create referral request
- `PUT /api/referrals/:id` - Update referral status
- `GET /api/referrals/employees` - Get employees list

### Assessments
- `GET /api/assessments` - Get user's assessments
- `GET /api/assessments/:id` - Get assessment by ID
- `POST /api/assessments` - Create assessment
- `PUT /api/assessments/:id/complete` - Complete assessment

### Interviews
- `GET /api/interviews` - Get user's interviews
- `POST /api/interviews` - Create interview session
- `PUT /api/interviews/:id/complete` - Complete interview

### Resume Analysis
- `GET /api/resume` - Get resume analyses
- `POST /api/resume` - Create resume analysis

### Community
- `GET /api/community` - Get forum posts
- `GET /api/community/:id` - Get single post
- `POST /api/community` - Create post
- `POST /api/community/:id/like` - Like post
- `GET /api/community/:id/replies` - Get replies
- `POST /api/community/:id/replies` - Add reply

## User Roles

- **candidate** - Job seekers looking for referrals
- **employee** - Employees who can refer candidates
- **recruiter** - HR professionals posting jobs
- **student** - Students looking for internships
- **admin** - Platform administrators

## Features

1. **AI Resume Analysis** - ATS scoring, skill extraction, improvement suggestions
2. **Mock Interviews** - Technical and HR interview practice with AI
3. **Assessments** - Aptitude, coding, and domain-specific tests
4. **Referral System** - Connect candidates with verified employees
5. **Job Board** - Browse and post jobs/internships
6. **Community Forum** - Share experiences and ask questions
7. **Profile Management** - Education, experience, projects, certifications
8. **Badges & Achievements** - Gamification system

## Environment Variables

### Backend (.env)
```
PORT=3001
NODE_ENV=development
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=referai
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d
```

### Frontend (optional - for production)
```
VITE_API_URL=http://localhost:3001/api
```

## Tech Stack

**Frontend:**
- React 18
- TypeScript
- Tailwind CSS
- Vite
- Lucide React (icons)
- React Router (hash-based)

**Backend:**
- Node.js
- Express
- MySQL 2
- JWT (jsonwebtoken)
- bcryptjs
- cors

## License

MIT License
