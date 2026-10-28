# InternShip Hub

### Opportunities Without Borders

InternShip Hub is a full-stack internship marketplace designed to connect students with companies offering internship opportunities. The platform provides separate dashboards and workflows for **Students, Companies, and Administrators**.

Students can discover and apply for internships, companies can publish and manage internship opportunities, and administrators can verify companies, approve internships, manage users, and monitor platform activity.

---

## 1. Project Overview

InternShip Hub provides a centralized platform where students can:

- Create and manage their profiles
- Upload their CV
- Search and filter internships
- Save internships
- Apply for internships
- Track application status
- View certificates
- Receive notifications

Companies can:

- Create company profiles
- Submit verification requests
- Post internship opportunities
- Manage their internships
- View student applications
- Update application statuses
- Issue internship certificates

Administrators can:

- Manage students
- Manage companies
- Verify companies
- Approve or reject internships
- Manage certificates
- View reports
- Monitor platform activity

---

## 2. Objectives

The main objectives of InternShip Hub are:

1. To provide a centralized internship marketplace.
2. To connect students with companies worldwide.
3. To simplify internship searching and application.
4. To provide companies with an organized recruitment workflow.
5. To allow administrators to control and monitor platform activities.
6. To maintain internship and application records in a structured database.
7. To provide digital internship certificates.
8. To improve communication through notifications.

---

## 3. Key Features

### Authentication

- Student registration and login
- Company login
- Admin login
- JWT-based authentication
- Role-based authorization
- Protected API routes

### Student Features

- Student dashboard
- Profile management
- Profile completion
- CV upload
- Internship search
- Internship filtering
- Internship details
- One-click application
- Application tracking
- Saved internships
- Certificates
- Notifications

### Company Features

- Company dashboard
- Company profile
- Company verification
- Internship posting
- Internship management
- Internship editing
- Application management
- Application details
- Candidate status management
- Certificate issuing

### Admin Features

- Admin dashboard
- Student management
- Company management
- Company verification
- Internship approval/rejection
- Certificate management
- Reports and statistics
- User status management
- Student/company editing

---

## 4. User Roles

InternShip Hub contains three main user roles.

### Student

Students can search for internship opportunities, apply for internships, manage their profiles, upload CVs, save internships, and track applications.

### Company

Companies can create profiles, complete verification, publish internships, review applications, manage candidates, and issue certificates.

### Administrator

Administrators manage the overall platform and control companies, students, internships, certificates, and reports.

---

## 5. Internship Workflow

The main internship workflow is:

```text
Company Registration
        ↓
Company Profile
        ↓
Company Verification
        ↓
Admin Verification
        ↓
Company Posts Internship
        ↓
Admin Approves Internship
        ↓
Student Searches Internship
        ↓
Student Applies
        ↓
Company Reviews Application
        ↓
Application Status Updated
        ↓
Internship Completed
        ↓
Certificate Issued
```

---

## 6. Technology Stack

### Frontend

- React.js
- Vite
- Tailwind CSS
- React Router
- Lucide React
- React Icons
- JavaScript

### Backend

- Node.js
- Express.js
- JWT Authentication
- Multer
- REST APIs

### Database

- PostgreSQL

### Development Tools

- Visual Studio Code
- PostgreSQL
- pgAdmin 4
- PowerShell
- Git/GitHub

---

## 7. System Architecture

InternShip Hub follows a client-server architecture.

```text
                ┌──────────────────────┐
                │      React Client    │
                │      Vite + Tailwind │
                └──────────┬───────────┘
                           │
                           │ REST API
                           ▼
                ┌──────────────────────┐
                │    Node.js + Express │
                │       Backend        │
                └──────────┬───────────┘
                           │
                           │ SQL
                           ▼
                ┌──────────────────────┐
                │      PostgreSQL      │
                │       Database       │
                └──────────────────────┘
```

Authentication is handled using JWT tokens, and protected endpoints use role-based authorization.

---

## 8. Database Tables

The project uses PostgreSQL.

Main database tables include:

```text
users
student_profiles
companies
company_verifications
categories
internships
applications
saved_internships
certificates
notifications
reports
```

### Categories

The current internship categories include:

1. Computer Science
2. Information Technology
3. Software Engineering
4. Cyber Security
5. AI & Machine Learning
6. Marketing
7. Design
8. Data Science

---

## 9. API Structure

The backend provides REST API endpoints for the major platform modules.

### Authentication

```text
/api/auth
```

### Students

```text
/api/students
/api/student
```

### Companies

```text
/api/companies
/api/company
```

### Categories

```text
/api/categories
```

### Internships

```text
/api/internships
/api/student
```

### Applications

```text
/api/applications
/api/company
```

### Saved Internships

```text
/api/saved-internships
```

### Certificates

```text
/api/certificates
```

### Notifications

```text
/api/notifications
```

### Administration

```text
/api/admin
```

---

## 10. Authentication and Security

InternShip Hub uses JWT-based authentication.

The authentication flow is:

```text
Login
  ↓
Backend validates credentials
  ↓
JWT token generated
  ↓
Token stored by frontend
  ↓
Token sent with protected requests
  ↓
Backend verifies token
  ↓
Role authorization
  ↓
Request accepted/rejected
```

Protected roles include:

```text
STUDENT
COMPANY
ADMIN
```

Unauthorized requests are rejected by the authentication middleware.

---

## 11. CV Upload

Students can upload their CV through the Student Profile section.

Supported formats:

```text
PDF
DOC
DOCX
```

The backend uses Multer for file handling.

Uploaded files are served through:

```text
/uploads
```

A file-size limit is also applied to prevent unnecessarily large uploads.

---

## 12. Project Structure

The project is divided into frontend and backend applications.

```text
internship-hub/
│
├── src/
│   ├── components/
│   ├── layouts/
│   │
│   ├── pages/
│   │   ├── admin/
│   │   ├── company/
│   │   └── student/
│   │
│   ├── utils/
│   │   └── api.js
│   │
│   ├── App.jsx
│   └── main.jsx
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   └── server.js
│   │
│   ├── uploads/
│   ├── .env
│   └── package.json
│
├── public/
├── package.json
├── vite.config.js
└── README.md
```

---

## 13. Installation

### Prerequisites

Install the following before running the project:

- Node.js
- npm
- PostgreSQL
- pgAdmin 4
- Visual Studio Code

---

## 14. Frontend Setup

Open PowerShell and navigate to the project:

```powershell
cd C:\Users\zaina\internship-hub
```

Install dependencies:

```powershell
npm.cmd install
```

Start the frontend:

```powershell
npm.cmd run dev
```

The frontend runs on:

```text
http://localhost:5173
```

---

## 15. Backend Setup

Open another terminal:

```powershell
cd C:\Users\zaina\internship-hub\backend
```

Install dependencies:

```powershell
npm.cmd install
```

Start the backend:

```powershell
npm.cmd run dev
```

The backend runs on:

```text
http://localhost:5000
```

---

## 16. Environment Variables

Create a `.env` file inside the backend directory.

Example:

```env
PORT=5000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=internship_hub
DB_USER=postgres
DB_PASSWORD=YOUR_POSTGRES_PASSWORD

JWT_SECRET=YOUR_SECURE_JWT_SECRET
JWT_EXPIRES_IN=7d
```

Do not upload the `.env` file to GitHub.

---

## 17. Database Setup

Create a PostgreSQL database named:

```text
internship_hub
```

Make sure PostgreSQL is running on:

```text
localhost:5432
```

The backend connects to the database using the PostgreSQL configuration stored in `.env`.

---

## 18. Running the Complete Project

Two terminals are required.

### Terminal 1 — Backend

```powershell
cd C:\Users\zaina\internship-hub\backend
npm.cmd run dev
```

### Terminal 2 — Frontend

```powershell
cd C:\Users\zaina\internship-hub
npm.cmd run dev
```

Then open:

```text
http://localhost:5173
```

---

## 19. Testing

The project was tested through the main user workflows.

### Student Testing

- Login
- Dashboard
- Internship search
- Internship details
- Apply
- Saved internships
- Applications
- Profile
- CV upload
- Certificates
- Notifications

### Company Testing

- Login
- Dashboard
- Company profile
- Internship posting
- Internship management
- Internship editing
- Applications
- Application details
- Application status
- Certificates

### Admin Testing

- Dashboard
- Student management
- Company management
- Company verification
- Internship approval
- Certificate management
- Reports
- Student/company editing

### API Testing

The backend was also tested for:

- Authentication
- Protected routes
- Categories
- Internships
- Applications
- Certificates
- Notifications
- Admin APIs

---

## 20. Production Build

The frontend production build can be generated using:

```powershell
npm.cmd run build
```

The successful build generates:

```text
dist/
```

The project currently builds successfully with Vite.

---

## 21. Future Enhancements

Possible future improvements include:

- Google authentication
- Apple authentication
- Email verification
- Password reset through email
- Advanced internship recommendation system
- AI-based CV analysis
- AI internship recommendations
- Real-time notifications
- Company reviews and ratings
- Student/company messaging
- Advanced analytics
- Cloud file storage
- Production deployment
- Database backups
- Automated email notifications
- Advanced search and filtering
- Application interview scheduling

---

## 22. Limitations

The current development version is designed primarily for local development and demonstration.

Before production deployment, additional work would be recommended for:

- Production database configuration
- Secure cloud file storage
- HTTPS
- Production authentication configuration
- Rate limiting
- Advanced input validation
- Email services
- Monitoring and logging
- Automated backups
- Production hosting

---

## 23. Conclusion

InternShip Hub provides a complete internship marketplace connecting students, companies, and administrators through a centralized platform.

The system combines a modern React frontend, Node.js/Express backend, PostgreSQL database, JWT authentication, role-based access control, internship management, application tracking, company verification, certificates, notifications, and administrative reporting.

The project successfully demonstrates how a full-stack web application can solve the problem of managing internship opportunities and applications through a centralized digital platform.

---

## 24. Project Tagline

> **InternShip Hub — Opportunities Without Borders**

---

## 25. Author

**Zainab Bibi**

BS Computer Science  
Army Burn Hall College, Affiliated with University of Peshawar  
2023–2027

InternShip Hub — Full-Stack Internship Marketplace
