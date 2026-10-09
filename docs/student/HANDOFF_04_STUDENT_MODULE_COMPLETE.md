# Handoff 04: Student Module Complete — Final Operational & Maintenance Specification

**Module:** Student Module — AI Chatbot Assistant  
**Author / Signoff:** Aravind (Step 4 — Student Chat UI, Integration & Verification)  
**Date:** Saturday, 10 October 2026  
**Final Feature Branch:** `feature/student-integration`  
**Target Pull Request:** Base branch `student` or `main`  
**Status:** **READY FOR PRODUCTION REVIEW & MERGE**

---

## 1. Stable API & Tool Contracts

### 1.1 HTTP Endpoints
- **Primary Chat Endpoint:**
  `POST /api/student/chat`
  - **Auth:** Requires Bearer Firebase ID Token (`Authorization: Bearer <firebase_id_token>`)
  - **Request Body:**
    ```json
    {
      "message": "What is my current attendance percentage and are there any classes today?",
      "conversationId": "optional-uuid",
      "history": [
        { "role": "user", "content": "Hello" },
        { "role": "assistant", "content": "Hi Alex!" }
      ]
    }
    ```
  - **Response Body:**
    ```json
    {
      "success": true,
      "data": {
        "message": "Your overall attendance is currently 82.5% across 40 sessions...",
        "toolsExecuted": [
          {
            "toolName": "student.getAttendance",
            "arguments": {},
            "result": { ... },
            "status": "success",
            "executionDurationMs": 14
          }
        ],
        "metadata": {
          "uid": "student-uid",
          "role": "STUDENT",
          "collegeId": "college-alpha-001",
          "timestamp": "2026-10-10T00:00:00.000Z",
          "model": "lms-student-ai-v1"
        }
      }
    }
    ```
- **Tool Discovery Endpoint:**
  `GET /api/student/ai/tools`
- **Controlled Tool Execution:**
  `POST /api/student/ai/tools/execute`

### 1.2 Canonical Tool Registry Contract (14 Tools)
The 14 canonical tools are frozen and registered in `studentToolRegistry`:
1. `student.getDashboard`
2. `student.getProfile`
3. `student.getClass`
4. `student.getBatch`
5. `student.getProgram`
6. `student.getDepartment`
7. `student.getSubjects`
8. `student.getClassIncharge`
9. `student.getAcademicYears`
10. `student.getSemesters`
11. `student.getTimetable`
12. `student.getAttendance`
13. `student.searchKnowledge`
14. `student.getKnowledgeContext`

---

## 2. Authentication & Security Guardrails

1. **Authentication Boundary:**
   - Only Firebase ID tokens from active sessions are accepted via HTTP `Authorization: Bearer <token>`.
   - Client code must retrieve tokens via `auth.currentUser.getIdToken()` after `auth.authStateReady()`. Tokens are never stored or read from `localStorage`.
2. **Strict RBAC & Account Status:**
   - Handled exclusively by server-side `buildStudentContext` middleware.
   - Enforces `authed_user.role === 'STUDENT'` and `approval_status IN ('APPROVED', 'ACTIVE')`.
   - Cross-role requests (`FACULTY`, `HOD`, `GUEST`) are blocked with HTTP 403 `FORBIDDEN`.
3. **Zero IDOR:**
   - All student queries (profile, attendance, class, timetable, subjects) are resolved using `studentContext.uid` and `studentContext.classId`.
   - Any client-submitted `uid`, `studentId`, `classId`, or `collegeId` in the request body is discarded.
4. **Attendance Foreign Key Invariant:**
   - Database queries for student attendance records must reference foreign key column **`attendance_session_id`** (never `session_id`).
5. **Direct Supabase Prohibition:**
   - The frontend must never call `supabase.from(...)` or `supabase.rpc(...)`. All data queries route through verified backend API endpoints.
6. **RAG Boundary:**
   - Institutional RAG is strictly restricted to academic regulations, examination policies, attendance condonation rules, and conduct handbooks.
   - Live personal data (attendance, timetable, enrollments) is retrieved exclusively via deterministic database tools.
   - Knowledge chunks are filtered by `allowedRoles.includes('STUDENT')` and `collegeId === student.collegeId`.

---

## 3. Exact Integration Points & Files

### Backend:
- `backend/src/modules/student/ai/studentAi.types.ts`: DTOs, tools, and interfaces.
- `backend/src/modules/student/ai/studentAi.validation.ts`: Zod schemas for validation.
- `backend/src/modules/student/ai/toolRegistry.ts`: Canonical tool registry.
- `backend/src/modules/student/ai/studentDataToolService.ts`: Live database data tools 1–12.
- `backend/src/modules/student/ai/studentRagService.ts`: Institutional RAG tools 13 & 14.
- `backend/src/modules/student/ai/studentAi.service.ts`: Intent detection & prompt defense.
- `backend/src/modules/student/ai/studentAi.controller.ts`: REST controller.
- `backend/src/modules/student/ai/studentAi.routes.ts`: Router mounting.
- `backend/src/modules/student/student.routes.ts`: Main module routes mounting `/chat`.

### Frontend:
- `frontend/src/modules/student/types/studentChat.types.ts`: Chat request/response interfaces.
- `frontend/src/modules/student/api/studentApi.ts`: `studentApi.chat(...)` API call.
- `frontend/src/modules/student/pages/StudentChatPage.tsx`: Full-featured reactive chatbot page.
- `frontend/src/modules/student/components/StudentLayout.tsx`: Sidebar navigation link.
- `frontend/src/App.tsx`: Routes for `/student/ai-chat` and `/student/chat`.

---

## 4. Test Commands & Verification Results

### Backend Tests:
```bash
cd backend
npm test -- --run
```
**Results:** **14 test files passed, 264 passed (264)** (0 failures, 0 regressions).

### Frontend Build:
```bash
cd frontend
npm run build
```
**Results:** **Built in 1.13s (0 errors)**.

---

## 5. Environment Variables

- `VITE_API_BASE_URL`: Base API route (defaults to `/api`).
- `PORT`: Backend server port (defaults to `5000` or `3000`).
- `DATABASE_URL`: PostgreSQL connection string (Prisma managed).
- `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`: Firebase Admin SDK credentials.

---

## 6. Explicit Future-Change Restrictions

1. **DO NOT rename canonical tools:** The 14 tool names are frozen. Adding new tools requires registering them through `studentToolRegistry.registerToolHandler` with valid Zod input/output schemas.
2. **DO NOT bypass `buildStudentContext`:** Never read or trust client-provided tenant or identity fields.
3. **DO NOT allow RAG to calculate attendance:** Attendance calculation must remain deterministic in `studentService` and `studentRepository`.
4. **DO NOT add direct Supabase calls in student frontend.**
5. **DO NOT allow profile updates to alter role or academic hierarchy:** Only contact details and bio may be updated.
