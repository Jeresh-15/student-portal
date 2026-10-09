# Student Data Tools Handoff: Ashik to Jeresh

**Status:** COMPLETE  
**Current Owner:** ASHIK (Step 2 — Student Data Tools)  
**Next Owner:** JERESH (Step 3 — Student RAG & Knowledge Retrieval)  
**Branch for Jeresh:** `feature/student-rag`  
**Base Contract:** `docs/student/STUDENT_AI_TOOL_CONTRACT.md`  
**Previous Handoff:** `docs/student/HANDOFF_01_TUSHAR_TO_ASHIK.md`  

---

> **MANDATORY INSTRUCTION FOR JERESH:**  
> RAG is NOT the source of truth for live Student attendance, timetable, profile, class, subjects, batch, program, department, academic years, semesters, or other current academic records. Do not create a database helper or SQL query tool for RAG. Use RAG strictly for institutional policies, academic regulations, examination procedures, and approved student handbooks.

---

## 1. What Was Implemented

Ashik (Step 2) implemented the deterministic backend tool execution layer for all **12 Student data tools** (Tools 1 to 12) specified in the canonical tool contract:

1. **Deterministic Data Tool Service:** Created `StudentDataToolService` in `backend/src/modules/student/ai/studentDataToolService.ts`.
2. **Direct Service Reusability:** Every tool delegates to the verified `studentService` singleton (`backend/src/modules/student/student.service.ts`) and `studentRepository` (`backend/src/modules/student/student.repository.ts`).
3. **Canonical Tool Registry Wiring:** Registered all 12 live tool handlers via `studentToolRegistry.registerToolHandler(toolName, handler)` in `registerStudentDataToolHandlers()`.
4. **Zero IDOR & Token Authorization:** Strict context assertion guarantees queries are strictly scoped to token-derived `studentContext` (`uid`, `classId`, `departmentId`, `collegeId`, `registerNumber`).
5. **Attendance Integrity:** Verified calculation logic for overall attendance, 75% exam eligibility (`isEligible`), safe margin buffers, per-subject breakdown, and daily Monday–Friday periods using `attendance_session_id`.
6. **Testing & Validation:** Created `backend/tests/student-data-tools.test.ts` (17 tests). Full backend test suite passing with 222 / 222 tests green.

---

## 2. Implemented & Modified Files

### Files Created:
- `backend/src/modules/student/ai/studentDataToolService.ts`: Core service implementing Tools 1–12 and registering handlers into `studentToolRegistry`.
- `backend/tests/student-data-tools.test.ts`: 17 automated Vitest tests verifying deterministic data tool execution, attendance boundaries, context enforcement, and error isolation.
- `docs/student/HANDOFF_02_ASHIK_TO_JERESH.md`: This handoff document.

### Files Modified:
- `backend/src/modules/student/ai/index.ts`: Exported `studentDataToolService` and `registerStudentDataToolHandlers`.

---

## 3. Exact Tools Implemented (Tools 1–12)

All 12 deterministic tools return `_isStub: false` and are live:

| Tool Name | Handler Method | Reused Service Method | Tables & Columns Used |
|:---|:---|:---|:---|
| `student.getDashboard` | `studentDataToolService.getDashboard(input, ctx)` | `studentService.getDashboard(ctx)` | `authed_users`, `classes`, `batches`, `programs`, `departments`, `attendance_records` |
| `student.getProfile` | `studentDataToolService.getProfile(input, ctx)` | `studentService.getProfile(ctx)` | `authed_users`, `users`, `profiles` (`phone`, `address`, `city`, `state`, `bio`, etc.) |
| `student.getClass` | `studentDataToolService.getClass(input, ctx)` | `studentService.getClass(ctx)` | `classes`, `batches`, `programs`, `departments` |
| `student.getBatch` | `studentDataToolService.getBatch(input, ctx)` | `studentService.getBatch(ctx)` | `batches` (`start_year`, `end_year`, `program_id`) |
| `student.getProgram` | `studentDataToolService.getProgram(input, ctx)` | `studentService.getProgram(ctx)` | `programs` (`name`, `type`, `duration_years`) |
| `student.getDepartment` | `studentDataToolService.getDepartment(input, ctx)` | `studentService.getDepartment(ctx)` | `departments` (`name`, `code`, `college_id`) |
| `student.getSubjects` | `studentDataToolService.getSubjects(input, ctx)` | `studentService.getSubjects(ctx, input.semesterNumber)` | `subjects` (`name`, `code`, `credits`, `semester_number`) |
| `student.getClassIncharge` | `studentDataToolService.getClassIncharge(input, ctx)` | `studentService.getClassIncharge(ctx)` | `classes`, `authed_users`, `profiles` |
| `student.getAcademicYears` | `studentDataToolService.getAcademicYears(input, ctx)` | `studentService.getAcademicYears(ctx)` | `academic_years` (`name`, `start_date`, `end_date`, `is_current`) |
| `student.getSemesters` | `studentDataToolService.getSemesters(input, ctx)` | `studentService.getSemesters(ctx)` | `semesters` (`term_number`, `start_date`, `end_date`) |
| `student.getTimetable` | `studentDataToolService.getTimetable(input, ctx)` | `studentService.getClassTimetable(ctx)` | `class_timetables` (`day_of_week`, `period`, `start_time`, `end_time`, `subject_name`, `room`) |
| `student.getAttendance` | `studentDataToolService.getAttendance(input, ctx)` | `studentService.getAttendance(ctx, input.date)` | `attendance_records`, `attendance_sessions` (`attendance_session_id`, `student_uid`, `status`, `date`) |

---

## 4. Attendance Rules Preserved

1. **75% Compliance Rule:**
   - `SAFE`: Attendance >= 75.0%.
   - `CRITICAL`: Attendance < 75.0%.
   - `NO_DATA`: Total sessions held = 0 (`isEligible: true`).
2. **Safe Margin Calculation:**
   - If percentage >= 75%: `safeMargin = Math.floor((attended - 0.75 * total) / 0.75)` (positive buffer).
   - If percentage < 75%: `safeMargin = -Math.ceil((0.75 * total - attended) / 0.25)` (sessions needed).
3. **Session FK:** Query relies strictly on `attendance_records.attendance_session_id = attendance_sessions.id`.

---

## 5. Profile Write Restrictions

The chatbot tools are read-only. In case of profile mutations:
- Editable fields in Student module are strictly limited to: `phone`, `address`, `city`, `state`, `profilePhotoUrl`, `bio`.
- Read-only fields that must **NEVER** be updated via chatbot: `role`, `department_id`, `class_id`, `batch_id`, `program_id`, `college_id`, `register_number`, `email`.

---

## 6. Exact Instructions for Jeresh (Step 3: Student RAG)

Jeresh is assigned to implement Tools 13 & 14 in `feature/student-rag`:
- `student.searchKnowledge` (Input: `{ query: string, category?: string, limit?: number }`)
- `student.getKnowledgeContext` (Input: `{ documentId: string, topic?: string }`)

### How Jeresh Plugs In:
Jeresh will register live handlers using the exact hook established by Tushar and used by Ashik:

```typescript
import { studentToolRegistry } from './toolRegistry';

// In Step 3 (Jeresh):
studentToolRegistry.registerToolHandler('student.searchKnowledge', async (input, context) => {
  // Use vector search / RAG service for institutional policies
  return await ragService.searchKnowledge(input.query, context);
});

studentToolRegistry.registerToolHandler('student.getKnowledgeContext', async (input, context) => {
  // Retrieve regulation context
  return await ragService.getKnowledgeContext(input.documentId, input.topic, context);
});
```

### Files Jeresh Must NOT Modify:
- Do NOT modify `backend/src/modules/student/ai/studentAi.types.ts` or `studentAi.validation.ts`.
- Do NOT modify `backend/src/modules/student/ai/studentDataToolService.ts` (Tools 1–12 are complete and tested).
- Do NOT create generic database helpers such as `getDb()`, `getDatabase()`, or raw SQL tools for RAG.
- Do NOT query attendance, timetables, or student marks from RAG.
- Do NOT touch HOD, Faculty, or Prisma schema files.

---

## 7. Tests & Build Results

- **Data Tools Test Suite:** `npm test -- tests/student-data-tools.test.ts`
  - 17 / 17 tests passed.
- **Orchestrator Test Suite:** `npm test -- tests/student-ai-orchestrator.test.ts`
  - 43 / 43 tests passed.
- **Full Backend Suite:** `npm test -- --run`
  - 222 / 222 tests passed across 12 test suites.
- **TypeScript Compilation:** `npx tsc --noEmit`
  - 0 errors.
