# Handoff 03: Jeresh (Student RAG & Knowledge Retrieval) to Aravind (Student Chat UI & Final Integration)

**Date:** 2026-10-10  
**From:** Jeresh (Developer 3 - Student RAG & Knowledge Retrieval)  
**To:** Aravind (Developer 4 - Student Chat UI, Integration & E2E Verification)  
**Branch:** `feature/student-rag`  
**Target Feature Branch for Step 4:** `feature/student-integration`

---

## 1. Executive Summary & Status

Step 3 is **100% Complete and Verified**.
All institutional RAG knowledge retrieval tools (`student.searchKnowledge` and `student.getKnowledgeContext`) have been implemented, registered in the canonical `studentToolRegistry`, and thoroughly tested.

- **Zero-Stub Enforcement:** Both Tool 13 and Tool 14 return `_isStub: false` with genuine institutional regulation chunks and citation metadata.
- **RAG vs Data Boundaries:** Live attendance records, schedules, subjects, and personal student data remain strictly governed by the deterministic student data tools from Step 2. RAG handles academic regulations, examination manuals, attendance/condonation policies, OD limits, and conduct guidelines.
- **Strict Tenant & Role Isolation:** Students can only access approved institutional knowledge (`allowedRoles.includes('STUDENT')`) and documents matching their college tenant (`collegeId === student.collegeId` or `collegeId === 'ALL'`). Confidential HOD faculty appraisals, private faculty grading keys, and foreign college documents are unconditionally blocked.
- **Test Results:** 22/22 unit and security tests passing in `tests/student-rag.test.ts`, 244/244 total backend test suite tests passing with 0 regressions.

---

## 2. Canonical RAG Tools & Contracts

The RAG subsystem implements exactly the 2 canonical tools frozen in Step 1:

### Tool 13: `student.searchKnowledge`

- **Purpose:** Semantic and keyword search across approved academic regulations, attendance policies, examination procedures, and student conduct guidelines.
- **Input Schema:**
  ```typescript
  {
    query: string;           // Student inquiry, e.g. "What is the minimum attendance required?"
    category?: 'policy' | 'regulations' | 'exam' | 'attendance_rules' | 'general';
    limit?: number;          // Default: 5, Max: 20
  }
  ```
- **Output Schema:**
  ```typescript
  {
    query: string;
    results: Array<{
      id: string;               // e.g. "chunk-att-001"
      title: string;            // e.g. "75% Minimum Attendance & Eligibility for End-Semester Examinations"
      content: string;          // Policy text snippet
      category: 'policy' | 'regulations' | 'exam' | 'attendance_rules' | 'general';
      sourceDocument: string;   // e.g. "Academic_Regulations_2025.pdf"
      relevanceScore: number;   // Normalized score [0.0 - 1.0]
    }>;
    totalResults: number;
    _isStub: false;
  }
  ```

### Tool 14: `student.getKnowledgeContext`

- **Purpose:** Full context retrieval for a specific regulation document or chunk ID.
- **Input Schema:**
  ```typescript
  {
    documentId: string;      // e.g. "academic-regulations-2025" or chunk ID
  }
  ```
- **Output Schema:**
  ```typescript
  {
    documentId: string;
    title: string;
    content: string;
    category: 'policy' | 'regulations' | 'exam' | 'attendance_rules' | 'general';
    metadata: {
      version: string;       // e.g. "v2025.1"
      lastUpdated: string;   // e.g. "2025-06-01"
      approvedBy: string;    // e.g. "Academic Council"
    };
    _isStub: false;
  }
  ```

---

## 3. Exact Import Paths & Architecture

- **Service Implementation:**
  `backend/src/modules/student/ai/studentRagService.ts`
  Exports:
  - `StudentRagService` class
  - `studentRagService` singleton instance
  - `registerRagToolHandlers()` registration function
  - `INSTITUTIONAL_KNOWLEDGE_BASE` chunk repository
- **Barrel Export:**
  `backend/src/modules/student/ai/index.ts`
  Re-exports `studentRagService` and `registerRagToolHandlers`.
- **Registry Integration:**
  Handlers are auto-registered to `studentToolRegistry` upon module import.

---

## 4. Tenant & Role Security Rules

1. **RBAC Verification:** The service executes `assertContext(context)` verifying that `context.uid` is present and `context.role.toUpperCase() === 'STUDENT'`. Unauthenticated callers or non-student roles throw an HTTP 403 `FORBIDDEN` error.
2. **Role Whitelisting:** Every document chunk possesses an `allowedRoles: string[]` array. Any chunk missing `'STUDENT'` (such as HOD confidential appraisals or faculty examination keys) is excluded at the query filtering layer.
3. **Tenant Sandboxing:** Document chunks are tagged with `collegeId`. If a document is college-specific (e.g., `college-beta-999`), students belonging to `college-alpha-001` are blocked from retrieving it. Only documents with `collegeId === 'ALL'` or `collegeId === student.collegeId` are returned.
4. **Zero-IDOR:** All tenant parameters are derived strictly from the verified `StudentContext` created from the authenticated Firebase token. No tenant or role parameters can be passed or overridden by the client.

---

## 5. Grounding & Zero-Hallucination No-Result States

- When a student query is off-topic, nonsensical, or cannot be matched with an approved institutional chunk (e.g., "warp drive mechanics in space"), the service returns:
  ```json
  {
    "query": "...",
    "results": [],
    "totalResults": 0,
    "_isStub": false
  }
  ```
- It **never fabricates rules**, policies, or citations.
- If `student.getKnowledgeContext` is invoked with an invalid or unauthorized document ID, an HTTP 404 `DOCUMENT_NOT_FOUND` error is thrown rather than inventing dummy text.

---

## 6. Files Changed in Step 3

| File | Status | Description |
|---|---|---|
| `backend/src/modules/student/ai/studentRagService.ts` | **Created** | RAG knowledge base, scoring engine, role/tenant filtering, and Tool 13/14 handlers. |
| `backend/src/modules/student/ai/index.ts` | **Updated** | Added exports for `studentRagService` and `registerRagToolHandlers`. |
| `backend/tests/student-rag.test.ts` | **Created** | 22 comprehensive test cases validating tools, security, boundaries, and no-result states. |
| `docs/student/HANDOFF_03_JERESH_TO_ARAVIND.md` | **Created** | This mandatory handoff specification. |

---

## 7. Test & Build Verification Results

- **Step 3 Test Suite:**
  `npm test -- tests/student-rag.test.ts --run`
  -> **22 passed (22)** in 430ms.
- **Full Backend Test Suite:**
  `npm test -- --run`
  -> **13 test files passed, 244 passed (244)** with 0 failures, 0 regressions.

---

## 8. Exact UI Fields Aravind Must Render (Step 4 Requirements)

In the Student Chat UI, Aravind should render:
1. **Chat Messages:** Support markdown rendering for AI responses with clear distinction between user and assistant messages.
2. **RAG Citations / Sources Badge:** When `toolExecutions` include `student.searchKnowledge` or `student.getKnowledgeContext`, display structured source citations:
   - Document Title (`title`)
   - Source PDF / Regulation Name (`sourceDocument`)
   - Category tag (`category`)
   - Relevance match indicator (`relevanceScore`)
3. **Deterministic Data Badges:**
   - Attendance summary cards (`percentage`, `attendedSessions`/`totalSessions`, `status`, `isEligible`).
   - Timetable cards (`dayOfWeek`, `period`, `time`, `subjectName`, `facultyName`, `room`).
   - Subject listings (`code`, `name`, `credits`, `type`).
4. **Suggested Prompts:** Quick chips for common student questions:
   - "What is my current attendance percentage?"
   - "What is my schedule for today?"
   - "What are the rules for attendance condonation?"
   - "How many OD leaves am I allowed?"
   - "What are the hall ticket exam requirements?"

---

## 9. Critical Rules & Guardrails for Aravind (Step 4)

> [!CAUTION]
> **STRICT ARCHITECTURAL RESTRICTIONS FOR ARAVIND:**
> 1. **DO NOT query Supabase directly:** The frontend must never call `supabase.from(...)` or `supabase.rpc(...)`. All communication must go through backend REST endpoints (`POST /api/student/chat`).
> 2. **DO NOT calculate attendance in frontend:** All attendance statistics, percentages, margins, and eligibility flags are computed by the backend deterministic tools.
> 3. **DO NOT query vector databases or store LLM API keys in frontend:** The frontend is a consumer of the backend AI orchestrator.
> 4. **DO NOT modify frozen contracts:** Do not change `studentAi.types.ts`, `studentAi.validation.ts`, `studentDataToolService.ts`, or `studentRagService.ts`.
> 5. **DO NOT bypass RBAC or forge client IDs:** Authentication must use the standard bearer token header `Authorization: Bearer <firebase_id_token>`.

---

## 10. Next Steps

1. Checkout feature branch: `git checkout -b feature/student-integration`.
2. Inspect `frontend/src/modules/student/` and implement the Student AI Chat interface.
3. Validate complete end-to-end integration across all 14 tools.
4. Prepare `docs/student/STUDENT_FINAL_INTEGRATION_REPORT.md` and `docs/student/HANDOFF_04_STUDENT_MODULE_COMPLETE.md`.
