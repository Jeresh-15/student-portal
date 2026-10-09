# Student AI Chatbot: Canonical API & Tool Contract

**Document Version:** 1.0.0  
**Status:** FROZEN  
**Author:** Tushar (Step 1 — Student AI Orchestrator)  
**Target Consumers:** Ashik (Step 2 — Data Tools), Jeresh (Step 3 — RAG), Aravind (Step 4 — Chat UI & Integration)  

---

## 1. Executive Summary & Architecture

This document defines the canonical interface, authentication boundaries, and data contracts for the **Student AI Chatbot** in the College LMS.

```
                           [Student Client (Browser)]
                                       │
                         POST /api/student/chat
                         (Bearer Firebase ID Token)
                                       ▼
                       [authenticateFirebaseUser]
                                       │
                                       ▼
                          [buildStudentContext]
                     (Verifies STUDENT role, Active Status,
                     Department & Class Hierarchy Consistency)
                                       │
                                       ▼
                       [StudentAiOrchestratorService]
                 ├── Prompt Injection & Boundary Sanitization
                 ├── Intent Detection / Tool Selection ('auto' / forced)
                 └── [StudentToolRegistry]
                           ├── Tools 1–12: Deterministic Data Tools (Ashik)
                           │   └── Reuses studentService & studentRepository
                           └── Tools 13–14: Knowledge RAG Tools (Jeresh)
                                       │
                                       ▼
                          [Synthesized Chat Response]
```

### Core Security Rules

1. **Zero Client Trust:** The frontend must never provide or override `uid`, `role`, `college_id`, `department_id`, `class_id`, or `register_number`. All access is scoped strictly to the token-derived `StudentContext`.
2. **Strict RBAC & Tenant Isolation:** Only authenticated accounts with `role === 'STUDENT'`, `approval_status === 'APPROVED' | 'ACTIVE'`, and complete academic hierarchy consistency are authorized. Cross-student, cross-class, cross-department, or cross-college access is blocked with `403 FORBIDDEN`.
3. **Deterministic vs. RAG Boundary:**
   - **Deterministic Tools (1–12):** Live attendance, timetable, subjects, profile, class, batch, program, and department records MUST come from deterministic database tools.
   - **RAG Tools (13–14):** Institutional policies, academic regulations, examination procedures, and student handbooks MUST come from RAG tools.
4. **No Arbitrary Database Access:** The LLM is never given Prisma clients, raw SQL tools, `getDb()`, or connection strings.

---

## 2. API Endpoints

### 2.1 Chat Submission Endpoint

- **Primary Route:** `POST /api/student/chat`
- **Alias Route:** `POST /api/student/ai/chat`
- **Access Level:** `STUDENT` (requires valid Firebase Bearer token and approved account)
- **Content-Type:** `application/json`

#### Request Schema (`StudentChatRequest`)

```typescript
{
  message: string;          // Required. Trimmed, 1 - 2000 characters.
  history?: Array<{         // Optional. Max 30 messages.
    role: 'user' | 'assistant' | 'system';
    content: string;        // 1 - 5000 characters.
  }>;
  toolChoice?:              // Optional. Default: 'auto'
    | 'auto'
    | 'none'
    | { type: 'tool'; name: StudentToolName };
}
```

#### Response Schema (`ApiSuccessResponse<StudentChatResponseData>`)

```typescript
{
  success: true,
  data: {
    message: string,        // Synthesized conversational assistant response
    toolsExecuted: Array<{  // Array of executed tools with execution telemetry
      toolName: StudentToolName,
      arguments: Record<string, any>,
      status: 'success' | 'error',
      result?: any,
      error?: {
        code: string,
        message: string,
        details?: any
      },
      executionDurationMs: number
    }>,
    metadata: {
      uid: string,
      role: 'STUDENT',
      collegeId: string | null,
      departmentId: string | null,
      classId: string | null,
      registerNumber: string | null,
      timestamp: string,    // ISO-8601 timestamp
      model: string         // e.g. "lms-student-ai-v1"
    }
  }
}
```

---

### 2.2 Tool Inspection Endpoint

- **Route:** `GET /api/student/ai/tools`
- **Access Level:** `STUDENT`
- **Description:** Returns metadata and JSON schemas for all 14 canonical tools.

#### Response Example

```typescript
{
  success: true,
  data: [
    {
      name: "student.getAttendance",
      description: "Retrieves verified attendance records, overall percentage, 75% exam eligibility...",
      category: "deterministic",
      parameters: { ... },
      returns: { ... }
    },
    ...
  ]
}
```

---

### 2.3 Direct Controlled Tool Execution Endpoint

- **Route:** `POST /api/student/ai/tools/execute`
- **Access Level:** `STUDENT`
- **Description:** Directly executes a specific canonical tool under the caller's verified `StudentContext`.

#### Request Schema

```typescript
{
  toolName: StudentToolName;    // Must be one of the 14 canonical tool names
  arguments?: Record<string, any>; // Tool-specific input payload
}
```

---

## 3. The 14 Canonical Tool Contracts

### Category A: Deterministic Student Data Tools (Owned by Ashik — Step 2)

All deterministic tools receive trusted `StudentContext: { uid, email, displayName, photoURL, role, collegeId, departmentId, classId, registerNumber }`.

#### Tool 1: `student.getDashboard`
- **Description:** Retrieves the authenticated student's unified academic dashboard.
- **Input Schema:** `{}` (no parameters)
- **Output Schema:**
```typescript
{
  student: {
    name: string | null,
    email: string,
    studentId: string | null,
    photoUrl: string | null,
    completionPercentage: number
  },
  academic: {
    className: string,
    currentSemester: number,
    batchYears: string,
    programName: string,
    degree: string,
    departmentName: string,
    departmentCode: string,
    academicYear: string,
    classIncharge: {
      name: string,
      email: string,
      designation: string,
      cabin: string | null
    } | null
  },
  attendanceSummary: {
    overallPercentage: number,
    totalPresent: number,
    totalAbsent: number,
    totalHeld: number,
    status: 'SAFE' | 'CRITICAL' | 'NO_DATA',
    safeMargin: number
  },
  subjectsCount: number,
  semestersCount: number
}
```

#### Tool 2: `student.getProfile`
- **Description:** Retrieves the authenticated student's personal profile and contact details.
- **Input Schema:** `{}`
- **Output Schema:**
```typescript
{
  userId?: string,
  firstName: string | null,
  lastName: string | null,
  displayName: string | null,
  studentId: string | null,
  email: string,
  phone: string | null,
  address: string | null,
  city: string | null,
  state: string | null,
  dateOfBirth: string | null,
  gender: string | null,
  profilePhotoUrl: string | null,
  enrollmentYear: number | null,
  profileCompletionPercentage: number,
  accountStatus: string,
  bio: string | null
}
```

#### Tool 3: `student.getClass`
- **Description:** Retrieves the student's enrolled class information and academic hierarchy.
- **Input Schema:** `{}`
- **Output Schema:**
```typescript
{
  id: string,
  batchId: string,
  name: string,
  currentSemester: number,
  facultyUid: string | null,
  isActive: boolean,
  batchName?: string,
  programName?: string,
  departmentName?: string
}
```

#### Tool 4: `student.getBatch`
- **Description:** Retrieves batch years and program linkage.
- **Input Schema:** `{}`
- **Output Schema:**
```typescript
{
  id: string,
  programId: string,
  startYear: number,
  endYear: number,
  batchYears: string
}
```

#### Tool 5: `student.getProgram`
- **Description:** Retrieves degree program details.
- **Input Schema:** `{}`
- **Output Schema:**
```typescript
{
  id: string,
  departmentId: string,
  name: string,
  code: string,
  degreeType: string,
  durationYears: number
}
```

#### Tool 6: `student.getDepartment`
- **Description:** Retrieves academic department information.
- **Input Schema:** `{}`
- **Output Schema:**
```typescript
{
  id: string,
  collegeId: string,
  name: string,
  code: string,
  description: string | null
}
```

#### Tool 7: `student.getSubjects`
- **Description:** Retrieves registered courses and credit allocations.
- **Input Schema:**
```typescript
{
  semesterNumber?: number; // Optional integer 1-12
}
```
- **Output Schema:**
```typescript
{
  subjects: Array<{
    id: string,
    departmentId: string,
    name: string,
    code: string,
    credits: number,
    type: string,
    semesterNumber?: number
  }>,
  totalSubjects: number,
  semesterNumber?: number
}
```

#### Tool 8: `student.getClassIncharge`
- **Description:** Retrieves contact and office cabin details of assigned Class Incharge.
- **Input Schema:** `{}`
- **Output Schema:**
```typescript
{
  facultyUid: string,
  name: string,
  email: string,
  designation: string,
  phone: string | null,
  cabin: string | null,
  departmentName: string
}
```

#### Tool 9: `student.getAcademicYears`
- **Description:** Retrieves institutional academic calendar years.
- **Input Schema:** `{}`
- **Output Schema:**
```typescript
{
  academicYears: Array<{
    id: string,
    collegeId: string,
    name: string,
    startDate: string,
    endDate: string,
    isCurrent: boolean
  }>,
  currentAcademicYear: { ... } | null
}
```

#### Tool 10: `student.getSemesters`
- **Description:** Retrieves list of semesters with current active indicator.
- **Input Schema:** `{}`
- **Output Schema:**
```typescript
{
  semesters: Array<{
    id: string,
    semesterNumber: number,
    name: string,
    startDate: string,
    endDate: string,
    isCurrent: boolean
  }>,
  currentSemester: { ... } | null
}
```

#### Tool 11: `student.getTimetable`
- **Description:** Retrieves verified timetable periods, room numbers, and faculty assignments.
- **Input Schema:**
```typescript
{
  dayOfWeek?: number; // Optional: 1 (Mon) through 5 (Fri)
}
```
- **Output Schema:**
```typescript
{
  className: string,
  slots: Array<{
    id: string,
    dayOfWeek: number,
    periodNumber: number,
    startTime: string,
    endTime: string,
    subjectId: string,
    subjectName: string,
    subjectCode: string,
    facultyName: string,
    roomNumber: string | null
  }>,
  dayOfWeek?: number,
  totalSlots: number
}
```

#### Tool 12: `student.getAttendance`
- **Description:** Retrieves verified attendance metrics, 75% exam eligibility, and per-subject breakdown.
- **Input Schema:**
```typescript
{
  date?: string; // Optional: YYYY-MM-DD
}
```
- **Output Schema:**
```typescript
{
  summary: {
    overallPercentage: number,
    totalPresent: number,
    totalAbsent: number,
    totalHeld: number,
    status: 'SAFE' | 'CRITICAL' | 'NO_DATA',
    safeMargin: number,
    isEligible: boolean
  },
  subjectBreakdown: Array<{
    subjectId: string,
    subjectCode: string,
    subjectName: string,
    percentage: number,
    present: number,
    absent: number,
    total: number,
    status: 'SAFE' | 'CRITICAL' | 'NO_DATA'
  }>,
  dailySchedule?: Array<{
    dayName: string,
    dayOfWeek: number,
    dateStr: string,
    periods: Array<{
      periodNumber: number,
      startTime: string,
      endTime: string,
      subjectName: string,
      status: 'PRESENT' | 'ABSENT' | 'UNRECORDED'
    }>
  }>,
  selectedDate?: string
}
```

---

### Category B: RAG Institutional Knowledge Tools (Owned by Jeresh — Step 3)

#### Tool 13: `student.searchKnowledge`
- **Description:** Semantic search over approved institutional regulations, exam rules, and student guides.
- **Input Schema:**
```typescript
{
  query: string;       // Required: Search query (1 - 500 chars)
  category?: 'policy' | 'regulations' | 'exam' | 'attendance_rules' | 'general';
  limit?: number;      // Optional: Max chunks (1 - 20, default: 5)
}
```
- **Output Schema:**
```typescript
{
  query: string,
  results: Array<{
    id: string,
    title: string,
    content: string,
    category: string,
    sourceDocument: string,
    relevanceScore: number // 0.0 - 1.0
  }>,
  totalResults: number
}
```

#### Tool 14: `student.getKnowledgeContext`
- **Description:** Retrieves complete contextual text and approval metadata from an official regulation document.
- **Input Schema:**
```typescript
{
  documentId: string;  // Required: Document ID or slug
  topic?: string;      // Optional section topic
}
```
- **Output Schema:**
```typescript
{
  documentId: string,
  title: string,
  content: string,
  category: string,
  metadata: {
    version: string,
    lastUpdated: string,
    approvedBy: string
  }
}
```

---

## 4. Extension Hook for Step 2 (Ashik) & Step 3 (Jeresh)

`studentToolRegistry` exposes a dedicated registration method:

```typescript
import { studentToolRegistry } from './toolRegistry';

// In Ashik's step (Step 2):
studentToolRegistry.registerToolHandler('student.getAttendance', async (input, context) => {
  return await studentService.getAttendance(context, input.date);
});

// In Jeresh's step (Step 3):
studentToolRegistry.registerToolHandler('student.searchKnowledge', async (input, context) => {
  return await ragService.searchKnowledge(input.query, context);
});
```

The orchestrator guarantees:
1. Arguments are validated against Zod input schema **before** your handler is called.
2. Handler receives verified, non-spoofed `StudentContext`.
3. Output is validated against Zod output schema **after** your handler returns.
4. Execution time is recorded in telemetry.

---

## 5. Error Codes & HTTP Statuses

| HTTP Status | Error Code | Description |
|:---|:---|:---|
| `401` | `UNAUTHORIZED` | Missing or invalid Authorization header / expired Firebase token. |
| `403` | `FORBIDDEN` | Non-STUDENT role, unapproved account, or academic hierarchy mismatch. |
| `400` | `VALIDATION_ERROR` | Malformed request body, message too long, or invalid tool arguments. |
| `400` | `UNKNOWN_TOOL` | Tool specified in `toolChoice` or execute endpoint is not canonical. |
| `500` | `INTERNAL_ERROR` | Unhandled runtime error (masked securely by error middleware). |
