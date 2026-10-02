# Aura Academia — Student Module (College LMS)

A modern, high-performance Student Academic Portal for College LMS platforms. Built with React (TypeScript + Vite + Tailwind CSS + Redux Toolkit) and Node.js (Express + TypeScript + Prisma ORM + Supabase PostgreSQL + Firebase Authentication).

---

## 🌟 Key Features

- **Strict Academic Context**: The student's academic hierarchy (`department_id`, `class_id`, `batch_id`, `program_id`) is derived strictly from the authenticated Firebase UID in `authed_users`. The frontend cannot override or tamper with academic context.
- **Real Database Integration**: Connected to live Supabase PostgreSQL database with zero schema modifications and zero mock data.
- **Department Curriculum Subjects**: Filter subjects by department and semester dynamically without simulating fake enrollment tables.
- **Class Incharge Details**: Real-time faculty supervisor lookup assigned to the student's class section.
- **Academic Timeline**: Institutional academic calendar sessions, terms, and date intervals.
- **Profile Management**: View full student record and update permitted contact information with backend field validation.
- **UI Design**: Modern dark navy sidebar with `AA` brand badge, clean card layouts, responsive navigation, and robust error/loading states.

---

## 🏗️ Architecture & Tech Stack

### Frontend
- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **State Management**: Redux Toolkit (Async Thunks)
- **Icons**: Google Material Symbols Outlined
- **Authentication**: Firebase Client SDK

### Backend
- **Runtime**: Node.js + Express.js + TypeScript
- **ORM & Database**: Prisma ORM + Supabase PostgreSQL Client
- **Authentication**: Firebase Admin SDK (ID Token Verification)
- **Validation**: Zod Schema Validation
- **Testing**: Vitest Integration Test Suite (15/15 tests passing)

---

## 📁 Repository Structure

```text
.
├── backend/
│   ├── prisma/
│   │   └── schema.prisma         # Existing LMS database schema
│   ├── src/
│   │   ├── config/               # Firebase Admin & Environment config
│   │   ├── lib/                  # Prisma & Supabase client instances
│   │   ├── middleware/           # Auth, Role, Error, Rate-limiting
│   │   ├── modules/
│   │   │   └── student/          # Controller, Service, Repository, Routes, Types
│   │   ├── app.ts                # Express app configuration
│   │   └── server.ts             # Server entry point
│   ├── tests/
│   │   └── student.test.ts       # 15 Vitest Integration Tests
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── config/               # Firebase Client config
│   │   ├── modules/
│   │   │   └── student/
│   │   │       ├── api/          # studentApi client methods
│   │   │       ├── components/   # Cards, Tables, Layout, Skeletons
│   │   │       ├── hooks/        # useStudent hook
│   │   │       ├── pages/        # 10 dedicated student pages
│   │   │       ├── slices/       # Redux Toolkit student slice
│   │   │       └── types/        # TypeScript interfaces
│   │   ├── pages/                # Login page with Google SSO
│   │   ├── store/                # Redux Store
│   │   ├── App.tsx               # Client routes
│   │   └── main.tsx              # React bootstrap
│   └── package.json
│
└── README.md
```

---

## 🚀 Getting Started

### 1. Backend Setup
```bash
cd backend
npm install
# Configure your .env file from .env.example
npm run dev
# Run tests
npm test
```

### 2. Frontend Setup
```bash
cd frontend
npm install
# Configure your .env file from .env.example
npm run dev
# Production build
npm run build
```

---

## 🔒 Security Principles
- All `/api/student/*` endpoints require a valid Firebase Bearer token.
- Role verification ensures only users with `role = 'STUDENT'` can query student routes.
- Resource isolation enforces that students can only read their own records, class, batch, and department curriculum.
