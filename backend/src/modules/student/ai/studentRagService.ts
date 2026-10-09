import type { StudentContext } from '../student.types';
import { AppError } from '../../../utils/errors';
import { studentToolRegistry } from './toolRegistry';
import type {
  StudentSearchKnowledgeInput,
  StudentSearchKnowledgeOutput,
  StudentGetKnowledgeContextInput,
  StudentGetKnowledgeContextOutput,
  StudentKnowledgeChunk,
} from './studentAi.types';

/**
 * Knowledge Document Chunk definition in the Institutional RAG Knowledge Base
 */
export interface KnowledgeDocumentChunk {
  id: string;
  documentId: string;
  title: string;
  content: string;
  category: 'policy' | 'regulations' | 'exam' | 'attendance_rules' | 'general';
  sourceDocument: string;
  collegeId: string; // 'ALL' or specific collegeId like 'college-alpha-001'
  departmentId?: string; // Optional departmental restriction
  allowedRoles: string[]; // e.g. ['STUDENT', 'FACULTY', 'HOD'] or ['HOD_ONLY']
  version: string;
  lastUpdated: string;
  approvedBy: string;
  keywords: string[];
}

/**
 * Approved Institutional Knowledge Base Repository
 */
export const INSTITUTIONAL_KNOWLEDGE_BASE: KnowledgeDocumentChunk[] = [
  // ── 1. Attendance & Condonation Regulations ─────────────────────────────────
  {
    id: 'chunk-att-001',
    documentId: 'academic-regulations-2025',
    title: '75% Minimum Attendance & Eligibility for End-Semester Examinations',
    content:
      'Under Regulation 7.2 of Academic Regulations 2025, every student must secure a minimum of 75% overall attendance across all registered courses in the semester to be eligible to appear for the end-semester examinations. Students with overall attendance falling below 75% are classified as CRITICAL and are ineligible unless granted condonation by the Academic Council.',
    category: 'attendance_rules',
    sourceDocument: 'Academic_Regulations_2025.pdf',
    collegeId: 'ALL',
    allowedRoles: ['STUDENT', 'FACULTY', 'HOD'],
    version: 'v2025.1',
    lastUpdated: '2025-06-01',
    approvedBy: 'Academic Council',
    keywords: [
      'attendance',
      'percentage',
      '75',
      'eligibility',
      'exam',
      'eligible',
      'shortage',
      'minimum',
      'rules',
    ],
  },
  {
    id: 'chunk-att-002',
    documentId: 'academic-regulations-2025',
    title: 'Attendance Shortage Condonation on Medical Grounds',
    content:
      'Under Regulation 7.5, condonation of attendance shortage between 65% and 74.9% may be recommended by the Department HOD and sanctioned by the Dean (Academic Affairs) strictly on valid medical grounds or official institutional representation in national sports/academic events. A medical certificate from a registered practitioner must be submitted within 7 calendar days of resuming classes.',
    category: 'attendance_rules',
    sourceDocument: 'Academic_Regulations_2025.pdf',
    collegeId: 'ALL',
    allowedRoles: ['STUDENT', 'FACULTY', 'HOD'],
    version: 'v2025.1',
    lastUpdated: '2025-06-01',
    approvedBy: 'Academic Council',
    keywords: [
      'condonation',
      'medical',
      'shortage',
      '65',
      'hospital',
      'doctor',
      'certificate',
      'leave',
      'sports',
    ],
  },
  {
    id: 'chunk-att-003',
    documentId: 'student-od-manual',
    title: 'On-Duty (OD) Attendance Policy and Leave Entitlement',
    content:
      'Students representing the college in authorized co-curricular competitions, technical symposiums, hackathons, or university sports meets are eligible for On-Duty (OD) attendance credit. The maximum OD credit permitted per semester is 10 instructional days. All OD applications must be recommended by the faculty advisor and verified by the Class Incharge prior to the event.',
    category: 'attendance_rules',
    sourceDocument: 'Student_Leave_and_OD_Manual.pdf',
    collegeId: 'ALL',
    allowedRoles: ['STUDENT', 'FACULTY', 'HOD'],
    version: 'v2025.2',
    lastUpdated: '2025-07-15',
    approvedBy: 'Dean of Student Affairs',
    keywords: [
      'on-duty',
      'od',
      'duty',
      'sports',
      'hackathon',
      'symposium',
      'competition',
      'leave',
      'absence',
    ],
  },

  // ── 2. Academic Grading & Degree Progression ───────────────────────────────
  {
    id: 'chunk-acad-001',
    documentId: 'academic-regulations-2025',
    title: '10-Point Letter Grading System and CGPA Computation',
    content:
      'Under Regulation 11.2, course performance is graded on a 10-point scale: O (Outstanding, 10 points), A+ (Excellent, 9 points), A (Very Good, 8 points), B+ (Good, 7 points), B (Above Average, 6 points), C (Average, 5 points), P (Pass, 4 points), and F (Fail, 0 points). The Cumulative Grade Point Average (CGPA) is computed as the total sum of products of course credits and grade points divided by total registered credits.',
    category: 'regulations',
    sourceDocument: 'Academic_Regulations_2025.pdf',
    collegeId: 'ALL',
    allowedRoles: ['STUDENT', 'FACULTY', 'HOD'],
    version: 'v2025.1',
    lastUpdated: '2025-06-01',
    approvedBy: 'Academic Council',
    keywords: [
      'grading',
      'cgpa',
      'gpa',
      'grade',
      'scale',
      'points',
      'credit',
      'score',
      'marks',
      'fail',
      'pass',
    ],
  },
  {
    id: 'chunk-acad-002',
    documentId: 'academic-regulations-2025',
    title: 'Continuous Internal Assessment (CIA) Weightage',
    content:
      'Theory courses are evaluated based on 40% Continuous Internal Assessment (CIA) and 60% End-Semester Examination. The CIA component consists of two Periodic Tests (20 marks), Quizzes and Assignments (15 marks), and Attendance compliance (5 marks). A minimum of 40% in CIA is required to clear internal thresholds.',
    category: 'regulations',
    sourceDocument: 'Academic_Regulations_2025.pdf',
    collegeId: 'ALL',
    allowedRoles: ['STUDENT', 'FACULTY', 'HOD'],
    version: 'v2025.1',
    lastUpdated: '2025-06-01',
    approvedBy: 'Academic Council',
    keywords: [
      'internal',
      'cia',
      'assessment',
      'test',
      'assignment',
      'quiz',
      'marks',
      'weightage',
      '40',
      '60',
    ],
  },
  {
    id: 'chunk-acad-003',
    documentId: 'academic-regulations-2025',
    title: 'Elective Course Drop and Add Timeline',
    content:
      'Under Regulation 4.3, undergraduate students may change or drop an elective course within the first 10 instructional days of the semester without penalty, subject to prerequisite compliance and Class Incharge endorsement. Post the 10-day deadline, elective changes are strictly disallowed.',
    category: 'policy',
    sourceDocument: 'Academic_Regulations_2025.pdf',
    collegeId: 'ALL',
    allowedRoles: ['STUDENT', 'FACULTY', 'HOD'],
    version: 'v2025.1',
    lastUpdated: '2025-06-01',
    approvedBy: 'Academic Council',
    keywords: [
      'elective',
      'drop',
      'add',
      'course',
      'change',
      'deadline',
      'subject',
      'registration',
    ],
  },

  // ── 3. Examination Procedures & Hall Tickets ────────────────────────────────
  {
    id: 'chunk-exam-001',
    documentId: 'examination-manual-2025',
    title: 'Hall Ticket Generation and Examination Entry Protocols',
    content:
      'Hall tickets are released on the Student Portal 7 days prior to examination commencement for all students meeting attendance and fee clearance criteria. Entry into the examination hall requires the physical hall ticket and valid institutional student ID card. Entry is prohibited after 30 minutes from exam commencement.',
    category: 'exam',
    sourceDocument: 'Examination_Manual_v3.pdf',
    collegeId: 'ALL',
    allowedRoles: ['STUDENT', 'FACULTY', 'HOD'],
    version: 'v2025.3',
    lastUpdated: '2025-05-20',
    approvedBy: 'Controller of Examinations',
    keywords: [
      'hall ticket',
      'admit card',
      'exam',
      'entry',
      'timing',
      'id card',
      'examination',
      'test',
    ],
  },
  {
    id: 'chunk-exam-002',
    documentId: 'examination-manual-2025',
    title: 'Answer Script Re-evaluation and Transparency Copy Procedure',
    content:
      'Students may apply for transparency copy of their evaluated answer scripts within 10 days of results declaration via the Student Portal upon payment of INR 300 per subject. Subsequent re-evaluation requests must be filed within 5 days of transparency script receipt. If marks increase by 15% or more, the re-evaluation fee is refunded.',
    category: 'exam',
    sourceDocument: 'Examination_Manual_v3.pdf',
    collegeId: 'ALL',
    allowedRoles: ['STUDENT', 'FACULTY', 'HOD'],
    version: 'v2025.3',
    lastUpdated: '2025-05-20',
    approvedBy: 'Controller of Examinations',
    keywords: [
      'reevaluation',
      're-evaluation',
      'recheck',
      're-totaling',
      'transparency',
      'answer script',
      'paper',
      'marks',
      'correction',
    ],
  },
  {
    id: 'chunk-exam-003',
    documentId: 'examination-manual-2025',
    title: 'Examination Malpractice Disciplinary Guidelines',
    content:
      'Possession of unauthorized study materials, mobile phones, smartwatches, or programmable devices inside the examination hall is categorized as severe malpractice. Penalties range from cancellation of the specific course examination to debarment from all examinations for the semester, determined by the Malpractice Enquiry Committee.',
    category: 'exam',
    sourceDocument: 'Examination_Manual_v3.pdf',
    collegeId: 'ALL',
    allowedRoles: ['STUDENT', 'FACULTY', 'HOD'],
    version: 'v2025.3',
    lastUpdated: '2025-05-20',
    approvedBy: 'Controller of Examinations',
    keywords: [
      'malpractice',
      'cheating',
      'copying',
      'mobile',
      'phone',
      'smartwatch',
      'penalty',
      'debarred',
      'punishment',
    ],
  },

  // ── 4. Campus Conduct & Student Welfare ────────────────────────────────────
  {
    id: 'chunk-conduct-001',
    documentId: 'campus-code-of-conduct',
    title: 'Zero-Tolerance Policy on Ragging and Harassment',
    content:
      'In strict compliance with UGC and AICTE regulations, ragging in any form (verbal, psychological, physical, or digital) is strictly prohibited across campus and hostels. Any act of ragging will result in immediate suspension, lodging of a First Information Report (FIR) with law enforcement, and permanent expulsion.',
    category: 'policy',
    sourceDocument: 'Campus_Code_of_Conduct_2025.pdf',
    collegeId: 'ALL',
    allowedRoles: ['STUDENT', 'FACULTY', 'HOD'],
    version: 'v2025.1',
    lastUpdated: '2025-06-01',
    approvedBy: 'Disciplinary Committee',
    keywords: [
      'ragging',
      'anti-ragging',
      'harassment',
      'bullying',
      'helpline',
      'safety',
      'conduct',
      'discipline',
    ],
  },
  {
    id: 'chunk-conduct-002',
    documentId: 'campus-code-of-conduct',
    title: 'Laboratory Etiquette and Computing Safety Guidelines',
    content:
      'Students must wear formal attire, closed footwear, and prescribed lab aprons during all laboratory sessions. Computing laboratories strictly forbid food, unauthorized USB storage devices, software tampering, or visiting unapproved internet domains. Violators face laboratory suspension.',
    category: 'policy',
    sourceDocument: 'Campus_Code_of_Conduct_2025.pdf',
    collegeId: 'ALL',
    allowedRoles: ['STUDENT', 'FACULTY', 'HOD'],
    version: 'v2025.1',
    lastUpdated: '2025-06-01',
    approvedBy: 'Disciplinary Committee',
    keywords: [
      'laboratory',
      'lab',
      'safety',
      'dress code',
      'computer',
      'usb',
      'software',
      'apron',
      'footwear',
    ],
  },

  // ── 5. CONFIDENTIAL / RESTRICTED DOCUMENTS (Must be BLOCKED from Students!) ──
  {
    id: 'chunk-conf-001',
    documentId: 'hod-confidential-faculty-appraisal',
    title: 'Confidential Departmental Faculty Appraisal Records',
    content:
      'CONFIDENTIAL HOD ONLY: Annual confidential faculty performance ratings, student feedback multipliers, and salary increments for the Department of Computer Science and Engineering.',
    category: 'general',
    sourceDocument: 'HOD_Confidential_Faculty_Appraisal.pdf',
    collegeId: 'college-alpha-001',
    allowedRoles: ['HOD', 'ADMIN', 'COLLEGE_ADMIN'], // DOES NOT INCLUDE STUDENT!
    version: 'v2025.1',
    lastUpdated: '2025-06-01',
    approvedBy: 'Principal Office',
    keywords: ['salary', 'appraisal', 'faculty rating', 'confidential', 'hod'],
  },
  {
    id: 'chunk-conf-002',
    documentId: 'faculty-private-grading-rubric',
    title: 'Faculty Private Question Paper Key and Moderation Notes',
    content:
      'FACULTY PRIVATE: Confidential answer schemes, mark allocations, and question paper moderation comments strictly reserved for evaluation evaluators.',
    category: 'exam',
    sourceDocument: 'Faculty_Private_Evaluation_Notes.pdf',
    collegeId: 'college-alpha-001',
    allowedRoles: ['FACULTY', 'HOD', 'ADMIN'], // DOES NOT INCLUDE STUDENT!
    version: 'v2025.1',
    lastUpdated: '2025-06-01',
    approvedBy: 'Board of Examiners',
    keywords: ['question paper', 'key', 'answer key', 'moderation', 'private', 'faculty'],
  },
  {
    id: 'chunk-foreign-001',
    documentId: 'foreign-college-private-policy',
    title: 'Foreign College Institutional Fee Structure and Internal Policies',
    content:
      'Private financial and internal scholarship policies exclusively for College Beta (college-beta-999). Not accessible to students of College Alpha.',
    category: 'policy',
    sourceDocument: 'College_Beta_Internal_Policy.pdf',
    collegeId: 'college-beta-999', // FOREIGN COLLEGE!
    allowedRoles: ['STUDENT'],
    version: 'v2025.1',
    lastUpdated: '2025-06-01',
    approvedBy: 'Beta Governing Body',
    keywords: ['fee', 'scholarship', 'foreign', 'beta'],
  },
];

/**
 * Stop-words list for search query tokenization
 */
const STOP_WORDS = new Set([
  'a',
  'an',
  'and',
  'are',
  'as',
  'at',
  'be',
  'by',
  'for',
  'from',
  'has',
  'he',
  'in',
  'is',
  'it',
  'its',
  'of',
  'on',
  'that',
  'the',
  'to',
  'was',
  'were',
  'will',
  'with',
  'what',
  'where',
  'when',
  'how',
  'who',
  'can',
  'i',
  'my',
  'our',
  'you',
  'your',
]);

/**
 * ============================================================================
 * StudentRagService
 * ============================================================================
 * Implements canonical Student RAG knowledge retrieval tools:
 * - `student.searchKnowledge` (Tool 13)
 * - `student.getKnowledgeContext` (Tool 14)
 *
 * Author: Jeresh (Step 3)
 * Branch: feature/student-rag
 * ============================================================================
 */
export class StudentRagService {
  /**
   * Enforce verified Student authorization context and boundaries.
   */
  private assertContext(context: StudentContext): void {
    if (!context || !context.uid) {
      throw new AppError(403, 'FORBIDDEN', 'Missing verified student authorization context');
    }
    const role = (context.role || '').toUpperCase();
    if (role !== 'STUDENT') {
      throw new AppError(403, 'FORBIDDEN', 'Unauthorized: STUDENT role required for Student RAG');
    }
  }

  /**
   * Tokenize and normalize query text
   */
  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, ' ')
      .split(/\s+/)
      .filter((t) => t.length > 1 && !STOP_WORDS.has(t));
  }

  /**
   * Compute relevance score between search query and knowledge chunk.
   * Considers keyword overlap, title match weighting, and content occurrence.
   */
  private computeRelevance(
    queryTokens: string[],
    chunk: KnowledgeDocumentChunk,
  ): number {
    if (queryTokens.length === 0) return 0;

    let score = 0;
    const titleLower = chunk.title.toLowerCase();
    const contentLower = chunk.content.toLowerCase();
    const chunkKeywords = chunk.keywords.map((k) => k.toLowerCase());

    for (const token of queryTokens) {
      // Direct keyword tag match (High weight: +3)
      if (chunkKeywords.some((k) => k === token || k.includes(token))) {
        score += 3;
      }
      // Title match (Weight: +2)
      if (titleLower.includes(token)) {
        score += 2;
      }
      // Content occurrence (Weight: +1)
      if (contentLower.includes(token)) {
        score += 1;
      }
    }

    // Maximum expected score based on query length
    const maxPossibleScore = queryTokens.length * 6;
    const normalizedScore = Number((score / maxPossibleScore).toFixed(2));

    return Math.min(1.0, Math.max(0.0, normalizedScore));
  }

  // ==========================================================================
  // Tool 13: student.searchKnowledge
  // ==========================================================================
  async searchKnowledge(
    input: StudentSearchKnowledgeInput,
    context: StudentContext,
  ): Promise<StudentSearchKnowledgeOutput> {
    this.assertContext(context);

    const query = input.query.trim();
    if (!query) {
      return {
        query: input.query,
        results: [],
        totalResults: 0,
        _isStub: false,
      };
    }

    const queryTokens = this.tokenize(query);
    if (queryTokens.length === 0) {
      return {
        query: input.query,
        results: [],
        totalResults: 0,
        _isStub: false,
      };
    }

    const studentCollegeId = context.collegeId || 'college-alpha-001';
    const limit = input.limit && input.limit > 0 ? Math.min(input.limit, 20) : 5;

    // Filter institutional knowledge chunks strictly by:
    // 1. Role: allowedRoles MUST include 'STUDENT' (Blocks HOD-only and Faculty-private material)
    // 2. Tenant: collegeId must be 'ALL' or match the student's collegeId
    // 3. Category: if category filter is provided, match it
    const candidateChunks = INSTITUTIONAL_KNOWLEDGE_BASE.filter((chunk) => {
      // 1. Role boundary
      if (!chunk.allowedRoles.includes('STUDENT')) {
        return false;
      }
      // 2. Tenant boundary
      if (chunk.collegeId !== 'ALL' && chunk.collegeId !== studentCollegeId) {
        return false;
      }
      // 3. Category filter
      if (input.category && chunk.category !== input.category) {
        return false;
      }
      return true;
    });

    // Score and rank candidates
    const scoredChunks = candidateChunks
      .map((chunk) => {
        const relevanceScore = this.computeRelevance(queryTokens, chunk);
        return {
          chunk,
          relevanceScore,
        };
      })
      .filter((item) => item.relevanceScore >= 0.15) // Relevance threshold to prevent hallucination
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, limit);

    const results: StudentKnowledgeChunk[] = scoredChunks.map((item) => ({
      id: item.chunk.id,
      title: item.chunk.title,
      content: item.chunk.content,
      category: item.chunk.category,
      sourceDocument: item.chunk.sourceDocument,
      relevanceScore: item.relevanceScore,
    }));

    return {
      query: input.query,
      results,
      totalResults: results.length,
      _isStub: false,
    };
  }

  // ==========================================================================
  // Tool 14: student.getKnowledgeContext
  // ==========================================================================
  async getKnowledgeContext(
    input: StudentGetKnowledgeContextInput,
    context: StudentContext,
  ): Promise<StudentGetKnowledgeContextOutput> {
    this.assertContext(context);

    const documentId = input.documentId.trim().toLowerCase();
    const studentCollegeId = context.collegeId || 'college-alpha-001';

    // Find document chunk matching documentId and role/tenant boundaries
    const matchingChunk = INSTITUTIONAL_KNOWLEDGE_BASE.find((chunk) => {
      // 1. DocumentId match
      if (chunk.documentId.toLowerCase() !== documentId && chunk.id.toLowerCase() !== documentId) {
        return false;
      }
      // 2. Role boundary: MUST allow STUDENT
      if (!chunk.allowedRoles.includes('STUDENT')) {
        return false;
      }
      // 3. Tenant boundary
      if (chunk.collegeId !== 'ALL' && chunk.collegeId !== studentCollegeId) {
        return false;
      }
      return true;
    });

    if (!matchingChunk) {
      throw new AppError(
        404,
        'DOCUMENT_NOT_FOUND',
        `No approved institutional regulation or policy found matching '${input.documentId}' for student role`,
      );
    }

    return {
      documentId: matchingChunk.documentId,
      title: matchingChunk.title,
      content: matchingChunk.content,
      category: matchingChunk.category,
      metadata: {
        version: matchingChunk.version,
        lastUpdated: matchingChunk.lastUpdated,
        approvedBy: matchingChunk.approvedBy,
      },
      _isStub: false,
    };
  }
}

export const studentRagService = new StudentRagService();

/**
 * Register RAG tools with canonical tool registry.
 */
export function registerRagToolHandlers(): void {
  studentToolRegistry.registerToolHandler(
    'student.searchKnowledge',
    (input: StudentSearchKnowledgeInput, ctx: StudentContext) =>
      studentRagService.searchKnowledge(input, ctx),
  );
  studentToolRegistry.registerToolHandler(
    'student.getKnowledgeContext',
    (input: StudentGetKnowledgeContextInput, ctx: StudentContext) =>
      studentRagService.getKnowledgeContext(input, ctx),
  );
}

// Auto-register upon module load
registerRagToolHandlers();
