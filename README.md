<p align="center">
  <img src="kyc-system/frontend/public/logo.png" width="72" height="72" alt="Microloan Foundation" />
</p>

<h1 align="center">KYC System</h1>

<p align="center">
  Know Your Customer system for loan applicants at Microloan Foundation Zimbabwe.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/NestJS-E0234E?style=flat&logo=nestjs&logoColor=white" />
  <img src="https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=flat&logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/Prisma-2D3748?style=flat&logo=prisma&logoColor=white" />
</p>

---

## Overview

Loan applicants submit their personal and financial details, then go through a 2-step verification process before a final status of `VERIFIED` or `REJECTED` is stored and displayed.

**Step 1 - OTP Verification:** A 6-digit one-time password is generated and shown in dev mode (would be delivered via SMS or email in production). The applicant enters the code to confirm their identity.

**Step 2 - Document Verification:** The applicant uploads an identity document (National ID, Passport, or Driver's License). A mock verification engine scores the submission based on document completeness, age eligibility, and loan-to-income ratio.

---

## Architecture

```
kyc-system/
├── backend/                    # NestJS API
│   ├── prisma/
│   │   └── schema.prisma       # Database schema
│   └── src/
│       ├── main.ts             # Entry point + Swagger setup
│       ├── app.module.ts       # Root module
│       ├── prisma.service.ts   # Prisma client wrapper
│       ├── applicants/         # Applicant CRUD
│       │   ├── applicants.controller.ts
│       │   ├── applicants.service.ts
│       │   ├── applicants.module.ts
│       │   └── applicant.dto.ts
│       └── verification/       # OTP + Document verification
│           ├── verification.controller.ts
│           ├── verification.service.ts
│           ├── verification.module.ts
│           └── verification.dto.ts
└── frontend/                   # React + Vite + Tailwind CSS
    └── src/
        ├── App.tsx
        ├── pages/
        │   ├── ApplyPage.tsx       # Multi-step KYC flow
        │   ├── StatusPage.tsx      # Check application status
        │   └── AdminPage.tsx       # Admin dashboard
        ├── components/
        │   ├── forms/              # ApplicationForm, OtpVerification, DocumentVerification
        │   ├── ui/                 # Shared UI components
        │   └── layout/             # Layout wrapper
        ├── services/api.ts         # Axios API client
        └── types/index.ts          # TypeScript types
```

---

## Database Schema

| Table | Purpose |
|-------|---------|
| `Applicant` | Personal and financial data for each loan applicant |
| `VerificationStep` | Audit trail of each verification step and its result |
| `OtpRecord` | OTP codes with expiry timestamp and used flag |

**Applicant status flow:**

```
PENDING -> STEP1_VERIFIED -> VERIFIED
                          -> REJECTED
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/applicants` | Submit new application |
| GET | `/api/applicants` | List all applicants (admin) |
| GET | `/api/applicants/:id` | Get applicant by ID |
| GET | `/api/applicants/by-email?email=` | Look up by email |
| POST | `/api/verification/request-otp` | Generate and send OTP |
| POST | `/api/verification/verify-otp` | Verify OTP (Step 1) |
| POST | `/api/verification/submit-document` | Submit document (Step 2) |

Full interactive API docs at `http://localhost:3001/api/docs` once the backend is running.

---

## Setup

### Prerequisites

- Node.js 18+
- PostgreSQL running locally or a connection string
- npm

### 1. Clone the repository

```bash
git clone <repo-url>
cd kyc-system
```

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:

```env
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/kyc_db"
PORT=3001
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

Run migrations and start:

```bash
npm run prisma:generate
npm run prisma:migrate
npm run start:dev
```

Backend runs at `http://localhost:3001`. Swagger docs at `http://localhost:3001/api/docs`.

### 3. Frontend

```bash
cd ../frontend
npm install
echo "VITE_API_URL=http://localhost:3001" > .env
npm run dev
```

Frontend runs at `http://localhost:3000`.

---

## Full Flow

1. Open `http://localhost:3000`
2. Fill in the loan application form and submit
3. An OTP will appear on screen (dev mode only)
4. Enter the OTP to complete Step 1
5. Select a document type and upload a file for Step 2
6. The system evaluates and returns `VERIFIED` or `REJECTED`
7. Check any application at `http://localhost:3000/status` by email
8. Admin view at `http://localhost:3000/admin`

---

## Design Decisions

**Prisma** - clean TypeScript integration, automatic migrations, and readable schema definition. Well suited for a financial data model where integrity matters.

**Mock document verification** - a real system would call an external KYC provider (Smile Identity, Onfido, etc.). The mock engine scores on three criteria: document completeness, applicant age (18 to 70), and loan-to-income ratio (50% of annual income or below passes). This demonstrates the verification logic without external dependencies.

**OTP in dev mode** - the OTP is returned in the API response and shown in the UI when `NODE_ENV !== 'production'`. In production this field is omitted and the code would be delivered via SMS or email.

**Status immutability** - once an applicant reaches `VERIFIED` or `REJECTED`, no further verification steps can be triggered. Every step is recorded in `VerificationStep` for a full audit trail.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | NestJS, TypeScript, Prisma ORM |
| Database | PostgreSQL |
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| Validation | class-validator (backend), Zod (frontend) |
| API Docs | Swagger / OpenAPI |
