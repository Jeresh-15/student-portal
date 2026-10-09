# Student AI Orchestrator Handoff: Tushar to Ashik

**Status:** COMPLETE  
**Current Owner:** TUSHAR (Step 1 — Student AI Orchestrator)  
**Next Owner:** ASHIK (Step 2 — Student Data Tools)  
**Branch for Ashik:** `feature/student-tools`  
**Base Contract:** `docs/student/STUDENT_AI_TOOL_CONTRACT.md`  

---

> **MANDATORY INSTRUCTION FOR ASHIK:**  
> Read `STUDENT_AI_TOOL_CONTRACT.md` and `HANDOFF_01_TUSHAR_TO_ASHIK.md` first. Implement only the documented Student data tools. Reuse `studentContext`, `studentService`, and `studentRepository`; do not invent a second authorization or database interface.

---

## 1. What Was Implemented

Tushar (Step 1) established the core Student AI Chatbot backend entry point, safe tool execution pipeline, prompt injection defense, and canonical tool registry contracts for all 14 tools:

1. **Primary Student AI Chat Route:** `POST /api/student/chat` (and alias `POST /api/student/ai/chat`) mounted behind `authenticateFirebaseUser` + `buildStudentContext`.
2. **Tool Discovery Route:** `GET /api/student/ai/tools` returning schemas and metadata for all 14 canonical tools.
3. **Direct Controlled Execution Route:** `POST /api/student/ai/tools/execute`.
4. **Canonical Tool Registry:** `StudentToolRegistry` managing contracts for all 14 tools with schema-compliant default stubs for seamless early testing.
5. **Registration Extension Hook:** Implemented `registerToolHandler(toolName, handler)` method enabling Ashik (Step 2) to plug in live service implementations without touching the orchestrator engine.
6. **Zod Validation Pipeline:** Request and conversation validation schemas, plus strict Zod input and output schemas for all 14 tools.
7. **Prompt Injection Defense & Guardrails:** Rejection and sanitization for instruction overrides, role escalation (pretend admin/superadmin/hod/faculty), cross-student IDOR attempts, database password leaks, and arbitrary SQL keywords.
8. **Automated Unit & Integration Test Suite:** 43 automated Vitest tests covering auth boundaries, role verification, input validation, tool execution, injection defense, and registration hooks. All 205 backend tests are green.

---

## 2. Implemented & Modified Files

### Files Created:
- `backend/src/modules/student/ai/studentAi.types.ts`: Canonical TypeScript types and tool interfaces.
- `backend/src/modules/student/ai/studentAi.validation.ts`: Zod validation schemas for requests and all 14 tools.
- `backend/src/modules/student/ai/toolRegistry.ts`: Canonical `StudentToolRegistry` class, default stubs, execution pipeline.
- `backend/src/modules/student/ai/studentAi.service.ts`: `StudentAiOrchestratorService` with prompt sanitizer, tool dispatcher, response synthesizer.
- `backend/src/modules/student/ai/studentAi.controller.ts`: `StudentAiController` handling `chat`, `listTools`, `executeTool`.
- `backend/src/modules/student/ai/studentAi.routes.ts`: Express routes for `/chat`, `/tools`, `/tools/execute`.
- `backend/src/modules/student/ai/index.ts`: Barrel export.
- `backend/tests/student-ai-orchestrator.test.ts`: 43 automated Vitest unit & integration tests.
- `docs/student/STUDENT_AI_TOOL_CONTRACT.md`: Complete canonical API and tool contract documentation.
- `docs/student/HANDOFF_01_TUSHAR_TO_ASHIK.md`: This handoff document.

### Files Modified:
- `backend/src/modules/student/student.routes.ts`:
  - Exported `buildStudentContext` middleware.
  - Mounted `POST /chat` endpoint directly on `/api/student/chat`.
  - Mounted `/ai` sub-router on `/api/student/ai`.

---

## 3. Exact Functions & Classes Available to Ashik

### Classes & Singletons

#### `StudentToolRegistry` (`backend/src/modules/student/ai/toolRegistry.ts`)
- **Singleton:** `studentToolRegistry`
- **Methods:**
  - `registerToolHandler<TInput, TOutput>(toolName: StudentToolName, handler: ToolHandler<TInput, TOutput>): void`
  - `executeTool(toolName: string, rawArgs: Record<string, any>, context: StudentContext): Promise<ToolExecutionResult>`
  - `getRegisteredTools(): ToolMetadata[]`
  - `getToolMetadata(toolName: string): ToolMetadata`
  - `resetToDefaultStub(toolName?: StudentToolName): void`

#### `StudentAiOrchestratorService` (`backend/src/modules/student/ai/studentAi.service.ts`)
- **Singleton:** `studentAiOrchestratorService`
- **Methods:**
  - `processChat(request: StudentChatRequest, context: StudentContext): Promise<StudentChatResponseData>`
  - `sanitizeAndValidateInput(message: string): { sanitized: string; isSuspicious: boolean }`
  - `detectToolIntent(message: string): { toolName: StudentToolName | null; args: Record<string, any> }`
  - `synthesizeResponse(userMessage: string, toolsExecuted: ToolExecutionResult[], context: StudentContext, isSuspicious: boolean): string`

#### `StudentAiController` (`backend/src/modules/student/ai/studentAi.controller.ts`)
- **Singleton:** `studentAiController`
- **Methods:**
  - `chat(req: any, res: Response, next: NextFunction): Promise<void>`
  - `listTools(req: any, res: Response, next: NextFunction): Promise<void>`
  - `executeTool(req: any, res: Response, next: NextFunction): Promise<void>`

---

## 4. Exact Service & Repository Mapping for Ashik (Tools 1–12)

Ashik is responsible for implementing live handlers for Tools 1–12 by reusing `studentService` in `backend/src/modules/student/student.service.ts`:

| Tool Name | Existing Service Method | Signature |
|:---|:---|:---|
| `student.getDashboard` | `studentService.getDashboard(context)` | `(studentContext: StudentContext) => Promise<StudentDashboardResponse>` |
| `student.getProfile` | `studentService.getProfile(context)` | `(studentContext: StudentContext) => Promise<StudentProfile>` |
| `student.getClass` | `studentService.getClass(context)` | `(studentContext: StudentContext) => Promise<ClassInfo>` |
| `student.getBatch` | `studentService.getBatch(context)` | `(studentContext: StudentContext) => Promise<BatchInfo>` |
| `student.getProgram` | `studentService.getProgram(context)` | `(studentContext: StudentContext) => Promise<ProgramInfo>` |
| `student.getDepartment` | `studentService.getDepartment(context)` | `(studentContext: StudentContext) => Promise<DepartmentInfo>` |
| `student.getSubjects` | `studentService.getSubjects(context, semesterNumber)` | `(studentContext: StudentContext, semesterNumber?: number) => Promise<SubjectInfo[]>` |
| `student.getClassIncharge` | `studentService.getClassIncharge(context)` | `(studentContext: StudentContext) => Promise<ClassInchargeInfo>` |
| `student.getAcademicYears` | `studentService.getAcademicYears(context)` | `(studentContext: StudentContext) => Promise<AcademicYearInfo[]>` |
| `student.getSemesters` | `studentService.getSemesters(context)` | `(studentContext: StudentContext) => Promise<SemesterInfo[]>` |
| `student.getTimetable` | `studentService.getClassTimetable(context)` | `(studentContext: StudentContext) => Promise<ClassTimetableSlot[]>` |
| `student.getAttendance` | `studentService.getAttendance(context, date)` | `(studentContext: StudentContext, selectedDateStr?: string) => Promise<StudentAttendanceResponse>` |

### How Ashik Registers Handlers:

Ashik simply calls `studentToolRegistry.registerToolHandler(toolName, handler)`:

```typescript
import { studentToolRegistry } from '../ai/toolRegistry';
import { studentService } from '../student.service';

// Example for Tool 12 (Attendance):
studentToolRegistry.registerToolHandler('student.getAttendance', async (input, context) => {
  const attendanceData = await studentService.getAttendance(context, input.date);
  return {
    summary: {
      overallPercentage: attendanceData.summary.overallPercentage,
      totalPresent: attendanceData.summary.totalPresent,
      totalAbsent: attendanceData.summary.totalAbsent,
      totalHeld: attendanceData.summary.totalHeld,
      status: attendanceData.summary.status,
      safeMargin: attendanceData.summary.safeMargin,
      isEligible: attendanceData.summary.overallPercentage >= 75,
    },
    subjectBreakdown: attendanceData.subjectBreakdown.map((s) => ({
      subjectId: s.subjectId,
      subjectCode: s.subjectCode,
      subjectName: s.subjectName,
      percentage: s.percentage,
      present: s.present,
      absent: s.absent,
      total: s.total,
      status: s.status,
    })),
    dailySchedule: attendanceData.dailySchedule,
    selectedDate: input.date,
    _isStub: false,
  };
});
```

---

## 5. Security & Authorization Rules for Ashik

1. **Token Identity Non-Negotiable:** `context.uid`, `context.classId`, `context.departmentId`, `context.collegeId`, and `context.registerNumber` come strictly from `buildStudentContext`.
2. **Attendance FK:** The verified database FK for attendance sessions is `attendance_session_id`. Do NOT reintroduce `session_id`.
3. **No IDOR:** Never accept `classId`, `departmentId`, or `studentId` from the LLM or request body to query other students' data.
4. **No Generic DB Helper:** Do not create `getDb()`, `getDatabase()`, or raw query tools.

---

## 6. Tests & Build Results

- **Unit/Integration Tests:** `npm test -- tests/student-ai-orchestrator.test.ts`
  - 43 / 43 tests passing.
- **Full Backend Suite:** `npm test -- --run`
  - 205 / 205 tests passing across 11 test suites.
- **TypeScript Typecheck:** `npx tsc --noEmit`
  - Clean with 0 errors.

---

## 7. Known Limitations & Next Steps for Ashik

1. **Tools 1–12 Default Stubs:** Handlers are currently bound to `defaultStubHandlers`. Ashik will wire them to live calls using `studentService`.
2. **Tools 13–14 (RAG):** RAG tools (`student.searchKnowledge` and `student.getKnowledgeContext`) remain as stubs; they will be wired by Jeresh in Step 3. Ashik must leave Tools 13–14 untouched.
3. **Files Ashik Must NOT Modify:**
   - Do NOT modify `backend/src/modules/student/ai/studentAi.types.ts` or `studentAi.validation.ts` contracts.
   - Do NOT rename any of the 14 tool names.
   - Do NOT bypass `buildStudentContext` in `student.routes.ts`.
   - Do NOT modify HOD, Faculty, or Prisma schema files.
