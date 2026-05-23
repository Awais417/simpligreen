# SimpliGreen CRM API

A role-based **CRM & Workforce Management** backend built with **NestJS**, **PostgreSQL (AWS RDS)**, and **AWS S3**.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | NestJS (TypeScript) |
| Database | PostgreSQL 18 on AWS RDS |
| File Storage | AWS S3 |
| Auth | JWT (Access + Refresh tokens) |
| Docs | Swagger / OpenAPI |

---

## Roles

| Role | Description |
|---|---|
| `admin` | Full access — creates users, jobs, generates PDF reports |
| `manager` | Creates tasks, reviews submissions, submits jobs to QA |
| `installer` | Executes tasks, uploads images & certificates |
| `qa` | Monitors progress, approves or rejects final job |

---

## Setup

```bash
# Install dependencies
npm install

# Copy environment file and fill in values
cp .env.example .env

# Run in development (watch mode)
npm run start:dev

# Build for production
npm run build
npm run start:prod
```

### Environment Variables (`.env`)

```env
NODE_ENV=development
PORT=3000

DB_HOST=your-rds-endpoint.eu-north-1.rds.amazonaws.com
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_db_password
DB_NAME=simpligreen

ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret
JWT_EXPIRATION=1d
JWT_REFRESH_EXPIRATION=7d

S3_ACCESS_KEY=your_access_key_id
S3_SECRET_KEY=your_secret_access_key
S3_BUCKET=your_bucket_name
```

---

## Swagger UI

Interactive API documentation with all endpoints, request schemas, and Bearer token authorization.

```
http://localhost:3000/api/docs
```

> Click the **Authorize** button, enter your Bearer token, and test any endpoint directly in the browser.

---

## Base URL

```
http://localhost:3000/api/v1
```

---

## API Reference

### Authentication

> All protected endpoints require the header:
> `Authorization: Bearer <access_token>`

---

#### Sign Up

```bash
curl -X POST http://localhost:3000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@simpligreen.com",
    "firstName": "Admin",
    "lastName": "User",
    "password": "Admin123!",
    "role": "admin"
  }'
```

---

#### Log In

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@simpligreen.com",
    "password": "Admin123!"
  }'
```

> Response contains `accessToken` and `refreshToken`. Use `accessToken` in all subsequent requests.

---

#### Refresh Access Token

```bash
curl -X POST http://localhost:3000/api/v1/auth/refresh \
  -H "Authorization: Bearer <refresh_token>"
```

---

#### Log Out

```bash
curl -X POST http://localhost:3000/api/v1/auth/logout \
  -H "Authorization: Bearer <access_token>"
```

---

#### Get My Profile

```bash
curl http://localhost:3000/api/v1/auth/me \
  -H "Authorization: Bearer <access_token>"
```

---

### Users *(Admin only)*

---

#### Create User

```bash
curl -X POST http://localhost:3000/api/v1/users \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "manager@simpligreen.com",
    "firstName": "Jane",
    "lastName": "Smith",
    "password": "Manager1!",
    "role": "manager"
  }'
```

> For installers, include `"installerTypeId": "<uuid>"`.

---

#### List All Users

```bash
curl http://localhost:3000/api/v1/users \
  -H "Authorization: Bearer <admin_token>"
```

> Filter by role: append `?role=installer` | `?role=manager` | `?role=qa`

```bash
curl "http://localhost:3000/api/v1/users?role=installer" \
  -H "Authorization: Bearer <admin_token>"
```

---

#### Get User by ID

```bash
curl http://localhost:3000/api/v1/users/<user_id> \
  -H "Authorization: Bearer <admin_token>"
```

---

#### Update User

```bash
curl -X PATCH http://localhost:3000/api/v1/users/<user_id> \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Updated",
    "role": "qa"
  }'
```

---

#### Toggle User Active / Suspended

```bash
curl -X PATCH http://localhost:3000/api/v1/users/<user_id>/toggle-status \
  -H "Authorization: Bearer <admin_token>"
```

---

#### Delete User

```bash
curl -X DELETE http://localhost:3000/api/v1/users/<user_id> \
  -H "Authorization: Bearer <admin_token>"
```

---

### Installer Types *(Admin / Manager)*

> Seed categories: `Roofers`, `Scaffolders`, `Electricians`, `Gas Engineers`

---

#### Create Installer Type

```bash
curl -X POST http://localhost:3000/api/v1/installer-types \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Electricians",
    "requiresCertificate": true
  }'
```

---

#### List All Installer Types

```bash
curl http://localhost:3000/api/v1/installer-types \
  -H "Authorization: Bearer <admin_token>"
```

---

#### Get Installer Type by ID

```bash
curl http://localhost:3000/api/v1/installer-types/<type_id> \
  -H "Authorization: Bearer <admin_token>"
```

---

#### Update Installer Type

```bash
curl -X PATCH http://localhost:3000/api/v1/installer-types/<type_id> \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "requiresCertificate": false
  }'
```

---

#### Delete Installer Type

```bash
curl -X DELETE http://localhost:3000/api/v1/installer-types/<type_id> \
  -H "Authorization: Bearer <admin_token>"
```

---

### Jobs

---

#### Create Job *(Admin)*

```bash
curl -X POST http://localhost:3000/api/v1/jobs \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Rooftop Solar Installation",
    "description": "Full installation of 20 solar panels on the north roof.",
    "managerId": "<manager_uuid>",
    "qaId": "<qa_uuid>"
  }'
```

---

#### List Jobs

```bash
# Admin — returns all jobs
curl http://localhost:3000/api/v1/jobs \
  -H "Authorization: Bearer <admin_token>"

# Manager — returns own assigned jobs
curl http://localhost:3000/api/v1/jobs \
  -H "Authorization: Bearer <manager_token>"

# QA — returns own assigned jobs
curl http://localhost:3000/api/v1/jobs \
  -H "Authorization: Bearer <qa_token>"
```

---

#### Get Job by ID

```bash
curl http://localhost:3000/api/v1/jobs/<job_id> \
  -H "Authorization: Bearer <token>"
```

---

#### Download Job PDF Report *(Admin)*

```bash
curl http://localhost:3000/api/v1/jobs/<job_id>/pdf \
  -H "Authorization: Bearer <admin_token>" \
  -o job-report.pdf
```

---

#### Submit Job to QA *(Manager)*

```bash
curl -X POST http://localhost:3000/api/v1/jobs/<job_id>/submit-to-qa \
  -H "Authorization: Bearer <manager_token>"
```

> All tasks must be approved before submitting.

---

#### QA Approve Job *(QA)*

```bash
curl -X POST http://localhost:3000/api/v1/jobs/<job_id>/qa-approve \
  -H "Authorization: Bearer <qa_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "comments": "All tasks verified and fully compliant."
  }'
```

---

#### QA Reject Job *(QA)*

```bash
curl -X POST http://localhost:3000/api/v1/jobs/<job_id>/qa-reject \
  -H "Authorization: Bearer <qa_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "comments": "Task 3 certificate is missing. Please resubmit."
  }'
```

> `comments` is **required** for rejection. Job is returned to manager's queue.

---

### Tasks

> Tasks follow a **strict sequential pipeline**. Task 2 is locked until Task 1 is approved.

---

#### Create Task in a Job *(Manager)*

```bash
curl -X POST http://localhost:3000/api/v1/jobs/<job_id>/tasks \
  -H "Authorization: Bearer <manager_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "sequenceNumber": 1,
    "installerId": "<installer_uuid>",
    "installerTypeId": "<installer_type_uuid>",
    "description": "Install scaffolding on the north face of the building."
  }'
```

> `sequenceNumber: 1` is immediately **ACTIVE**. All others start as **PENDING**.

---

#### List Tasks for a Job *(Admin / Manager / QA)*

```bash
curl http://localhost:3000/api/v1/jobs/<job_id>/tasks \
  -H "Authorization: Bearer <manager_token>"
```

---

#### Get My Active Tasks *(Installer)*

```bash
curl http://localhost:3000/api/v1/tasks/my-tasks \
  -H "Authorization: Bearer <installer_token>"
```

> Returns only tasks with status `ACTIVE` assigned to the authenticated installer.

---

#### Get Task by ID

```bash
curl http://localhost:3000/api/v1/tasks/<task_id> \
  -H "Authorization: Bearer <token>"
```

---

#### Submit Task for Review *(Installer)*

```bash
curl -X POST http://localhost:3000/api/v1/tasks/<task_id>/submit \
  -H "Authorization: Bearer <installer_token>"
```

> Upload all media files **before** submitting.

---

#### Approve Task *(Manager)*

```bash
curl -X POST http://localhost:3000/api/v1/tasks/<task_id>/approve \
  -H "Authorization: Bearer <manager_token>"
```

> Automatically unlocks and activates the next sequential task.

---

#### Reject Task *(Manager)*

```bash
curl -X POST http://localhost:3000/api/v1/tasks/<task_id>/reject \
  -H "Authorization: Bearer <manager_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "comments": "Scaffolding is unstable. Please redo sections 3 and 4.",
    "newInstallerId": "<optional_new_installer_uuid>"
  }'
```

> `comments` is **required**. `newInstallerId` is optional — omit to keep the same installer.

---

#### Reassign Task to Different Installer *(Manager)*

```bash
curl -X PATCH http://localhost:3000/api/v1/tasks/<task_id>/reassign \
  -H "Authorization: Bearer <manager_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "installerId": "<new_installer_uuid>"
  }'
```

---

### Task Media

> Files are stored in **AWS S3**. Upload images and certificates per task.

---

#### Upload Image

```bash
curl -X POST http://localhost:3000/api/v1/tasks/<task_id>/media \
  -H "Authorization: Bearer <installer_token>" \
  -F "file=@/path/to/photo.jpg" \
  -F "fileType=image"
```

---

#### Upload Certificate

```bash
curl -X POST http://localhost:3000/api/v1/tasks/<task_id>/media \
  -H "Authorization: Bearer <installer_token>" \
  -F "file=@/path/to/certificate.pdf" \
  -F "fileType=certificate"
```

> Certificates are only required if the installer's type has `requiresCertificate: true`.

---

#### List Media for a Task

```bash
curl http://localhost:3000/api/v1/tasks/<task_id>/media \
  -H "Authorization: Bearer <token>"
```

---

#### Delete Media File *(Installer)*

```bash
curl -X DELETE http://localhost:3000/api/v1/tasks/<task_id>/media/<media_id> \
  -H "Authorization: Bearer <installer_token>"
```

> Only allowed while the task is in `ACTIVE` status.

---

## Task Status Flow

```
PENDING → ACTIVE → SUBMITTED → APPROVED
                       ↓
                   REJECTED → ACTIVE (re-open for resubmission)
```

## Job Status Flow

```
IN_PROGRESS → PENDING_QA → COMPLETED
                   ↓
              IN_PROGRESS  (QA rejected, returned to manager)
```

---

## License

MIT
