# InternShipHub – Audit and Change Report

## Changes made

### Company verification flow
- Added a company verification submission form to Company Profile (Website, NTN/Registration, Domain Email, or Other evidence).
- Company profile details are saved before a verification request is submitted.
- Added validation for evidence URLs and prevented duplicate pending requests.
- Added an Admin API that lists every registered company, including companies that have not submitted verification yet.
- Admin can review pending verification requests and open submitted evidence.
- Connected the existing Admin company edit action to its backend route.
- Company Profile now distinguishes Not Submitted, Pending, Rejected, and Verified states.
- When internship posting is blocked because the company is not verified, the page now offers direct navigation to Company Verification or the Dashboard.

### Company internship management
- Added All, Pending, Approved, Rejected, and Closed filters with counts.
- Added the internship posting date to each posting card.
- Kept View Details, Edit, Close, and Delete actions.
- Closed internships remain visible in the Closed filter.
- Backend prevents editing a closed internship.
- Deletion is transactional, preserves internships that have applications, and removes saved bookmarks before deleting an otherwise deletable internship.
- Application and bookmark creation now lock the internship row during the operation to reduce races with close/delete actions.

### Other fixes
- Corrected Company Profile field names sent to the backend (official email, company size, and LinkedIn URL).
- Company and Student dashboards retain their Logout actions; Student logout now replaces the current history entry when redirecting to Login.
- Admin dashboard pending-company count now counts actual pending verification requests.
- Removed the non-functional Admin company Delete button; no permanent account deletion feature was added.

## Checks performed
- Parsed all frontend `.jsx` and `.js` source files with TypeScript's JSX parser: passed.
- Ran `node --check` on 42 JavaScript files: passed.
- Checked 131 relative imports: no missing local imports found.
- Started the backend successfully in the audit environment.
- Root API endpoint returned HTTP 200.
- Protected Admin, Company Verification, and Company Internship endpoints returned HTTP 401 without a token, as expected.

## Checks that still require the user's environment
- The ZIP did not include a `.env` file, and no database credentials or live database were available in the audit environment. Database-backed flows (company verification persistence, admin approval, internship posting, applications, close/delete) still need to be exercised against the user's PostgreSQL database.
- A Vite production build could not be completed in this audit environment because the uploaded `node_modules` were platform-specific and lacked the Linux native Rolldown binding. The output ZIP excludes `node_modules`; install dependencies on Windows before running the build.

## Setup after extraction
1. In the project root, run `npm install`.
2. In `backend`, run `npm install`.
3. Copy the existing `backend/.env` from the user's own project into the extracted `backend` folder. Do not upload or share that file.
4. Start backend with `npm.cmd run dev` in `backend`.
5. Start frontend with `npm.cmd run dev` in the project root.


## 17 Nov 2026 update – posting redirect and certificate name lock

- Added automatic navigation from the successful internship-posted confirmation to Company > Manage Internships after 2.5 seconds.
- Added company action to mark a selected student's actual internship completion; closing an internship posting does not set this completion field.
- Added a student full-name confirmation step for completed internships. The confirmed name is stored on the application and is immutable through the provided API.
- Company certificate issuance now requires both recorded completion and the student's locked certificate name.
- Added PNG certificate generation from the Student, Company, and Admin certificate views. PNG is generated client-side at download time; persistent object storage is not configured.
- Added PostgreSQL migration: `backend/database/migrations/20261117_student_certificate_name_and_completion.sql`.
- Validation in this update: `node --check` passed for 39 backend JavaScript files; TypeScript JSX transpilation/parser check passed for 35 frontend JS/JSX files. A live database migration/API workflow and Windows Vite build still require testing in the user's environment.
