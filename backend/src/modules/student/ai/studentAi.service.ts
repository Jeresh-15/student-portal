import type { StudentContext } from '../student.types';
import { AppError } from '../../../utils/errors';
import {
  StudentChatRequest,
  StudentChatResponseData,
  StudentToolName,
  ToolExecutionResult,
} from './studentAi.types';
import { studentToolRegistry } from './toolRegistry';

/**
 * Common prompt injection, role escalation, and boundary-escape patterns.
 */
const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|prior|above)\s+instructions/i,
  /you\s+are\s+now\s+(an?\s+)?(admin|superadmin|super_admin|hod|faculty|root|developer)/i,
  /pretend\s+(i\s+am|to\s+be)\s+(an?\s+)?(admin|superadmin|super_admin|hod|faculty|root)/i,
  /bypass\s+(student|class|department|college|tenant)\s+(isolation|restriction|rule|boundary)/i,
  /show\s+(another|other)\s+student'?s?\s+(attendance|profile|record|grade|mark)/i,
  /show\s+(another|other)\s+class\s+timetable/i,
  /give\s+me\s+(the\s+)?(database\s+password|database_url|db\s+password|api\s+key|credentials|secret)/i,
  /reveal\s+(system\s+prompt|database\s+password|api\s+key|credentials)/i,
  /disregard\s+(the\s+)?(rules|policies|guardrails)/i,
  /<script[\s>]/i,
  /drop\s+table/i,
  /select\s+\*\s+from/i,
  /delete\s+from/i,
  /insert\s+into/i,
];

export class StudentAiOrchestratorService {
  /**
   * Sanitizes user inputs and verifies that prompt injection attempts
   * do not compromise system security or student boundaries.
   */
  public sanitizeAndValidateInput(message: string): {
    sanitized: string;
    isSuspicious: boolean;
  } {
    const trimmed = message.trim();

    if (!trimmed) {
      throw new AppError(400, 'VALIDATION_ERROR', 'Message cannot be empty');
    }

    const isSuspicious = INJECTION_PATTERNS.some((pattern) =>
      pattern.test(trimmed),
    );

    // Strip HTML/script tags and control characters
    const sanitized = trimmed
      .replace(/<[^>]*>?/gm, '')
      .replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F]/g, '');

    return { sanitized, isSuspicious };
  }

  /**
   * Determine tool intent and arguments from user prompt when toolChoice is 'auto'.
   */
  public detectToolIntent(message: string): {
    toolName: StudentToolName | null;
    args: Record<string, any>;
  } {
    const lower = message.toLowerCase();

    // 1. Attendance Intent
    if (
      lower.includes('attendance') ||
      lower.includes('percentage') ||
      lower.includes('absent') ||
      lower.includes('present') ||
      lower.includes('safe margin') ||
      lower.includes('eligibility')
    ) {
      const dateMatch = message.match(/\b(\d{4}-\d{2}-\d{2})\b/);
      return {
        toolName: 'student.getAttendance',
        args: dateMatch ? { date: dateMatch[1] } : {},
      };
    }

    // 2. Timetable / Schedule Intent
    if (
      lower.includes('timetable') ||
      lower.includes('schedule') ||
      lower.includes('routine') ||
      lower.includes('class today') ||
      lower.includes('period')
    ) {
      let dayOfWeek: number | undefined;
      if (lower.includes('monday') || lower.includes('mon')) dayOfWeek = 1;
      else if (lower.includes('tuesday') || lower.includes('tue')) dayOfWeek = 2;
      else if (lower.includes('wednesday') || lower.includes('wed')) dayOfWeek = 3;
      else if (lower.includes('thursday') || lower.includes('thu')) dayOfWeek = 4;
      else if (lower.includes('friday') || lower.includes('fri')) dayOfWeek = 5;

      return {
        toolName: 'student.getTimetable',
        args: dayOfWeek ? { dayOfWeek } : {},
      };
    }

    // 3. Subjects / Courses Intent
    if (
      lower.includes('subject') ||
      lower.includes('course') ||
      lower.includes('syllabus') ||
      lower.includes('credits')
    ) {
      const semMatch = message.match(/(?:sem(?:ester)?)\s*[:=]?\s*(\d{1,2})/i);
      const semesterNumber = semMatch ? parseInt(semMatch[1], 10) : undefined;

      return {
        toolName: 'student.getSubjects',
        args: semesterNumber ? { semesterNumber } : {},
      };
    }

    // 4. Class Incharge / Mentor Intent
    if (
      lower.includes('class incharge') ||
      lower.includes('incharge') ||
      lower.includes('mentor') ||
      lower.includes('advisor') ||
      lower.includes('counselor')
    ) {
      return {
        toolName: 'student.getClassIncharge',
        args: {},
      };
    }

    // 5. Dashboard / Academic Overview Intent
    if (
      lower.includes('dashboard') ||
      lower.includes('overview') ||
      lower.includes('academic summary')
    ) {
      return {
        toolName: 'student.getDashboard',
        args: {},
      };
    }

    // 6. Profile Intent
    if (
      lower.includes('profile') ||
      lower.includes('my detail') ||
      lower.includes('personal info') ||
      lower.includes('register number')
    ) {
      return {
        toolName: 'student.getProfile',
        args: {},
      };
    }

    // 7. Class Info Intent
    if (
      lower.includes('my class') ||
      lower.includes('section') ||
      lower.includes('classroom')
    ) {
      return {
        toolName: 'student.getClass',
        args: {},
      };
    }

    // 8. Batch Intent
    if (
      lower.includes('batch') ||
      lower.includes('graduation year') ||
      lower.includes('admission year')
    ) {
      return {
        toolName: 'student.getBatch',
        args: {},
      };
    }

    // 9. Program Intent
    if (
      lower.includes('program') ||
      lower.includes('degree') ||
      lower.includes('curriculum')
    ) {
      return {
        toolName: 'student.getProgram',
        args: {},
      };
    }

    // 10. Department Intent
    if (lower.includes('department') || lower.includes('dept')) {
      return {
        toolName: 'student.getDepartment',
        args: {},
      };
    }

    // 11. Academic Years Intent
    if (lower.includes('academic year') || lower.includes('calendar year')) {
      return {
        toolName: 'student.getAcademicYears',
        args: {},
      };
    }

    // 12. Semesters Intent
    if (lower.includes('semester') || lower.includes('terms')) {
      return {
        toolName: 'student.getSemesters',
        args: {},
      };
    }

    // 13. Institutional Knowledge / Policies / Regulations / RAG Intent
    if (
      lower.includes('policy') ||
      lower.includes('regulation') ||
      lower.includes('exam rule') ||
      lower.includes('handbook') ||
      lower.includes('guideline') ||
      lower.includes('code of conduct') ||
      lower.includes('leave rule') ||
      lower.includes('condonation')
    ) {
      let category: 'policy' | 'regulations' | 'exam' | 'attendance_rules' | 'general' = 'general';
      if (lower.includes('exam')) category = 'exam';
      else if (lower.includes('attendance') || lower.includes('condonation')) category = 'attendance_rules';
      else if (lower.includes('regulation')) category = 'regulations';
      else if (lower.includes('policy')) category = 'policy';

      return {
        toolName: 'student.searchKnowledge',
        args: {
          query: message,
          category,
          limit: 3,
        },
      };
    }

    return { toolName: null, args: {} };
  }

  /**
   * Main chat processing pipeline
   */
  public async processChat(
    request: StudentChatRequest,
    context: StudentContext,
  ): Promise<StudentChatResponseData> {
    const { sanitized, isSuspicious } = this.sanitizeAndValidateInput(
      request.message,
    );

    const toolsExecuted: ToolExecutionResult[] = [];

    // Security Guardrail: Refuse prompt injection safely
    if (isSuspicious) {
      return {
        message:
          "I am your official Student AI Assistant. I can only assist you with your verified personal academic records (attendance, timetable, subjects, class details) and official institutional regulations. Requests to modify access levels, access other students' records, or execute arbitrary database commands are strictly prohibited.",
        toolsExecuted: [],
        metadata: {
          uid: context.uid,
          role: context.role,
          collegeId: context.collegeId,
          departmentId: context.departmentId,
          classId: context.classId,
          registerNumber: context.registerNumber,
          timestamp: new Date().toISOString(),
          model: 'lms-student-ai-v1',
        },
      };
    }

    // Determine tool to execute
    const toolChoice = request.toolChoice || 'auto';

    if (toolChoice !== 'none') {
      let targetTool: StudentToolName | null = null;
      let toolArgs: Record<string, any> = {};

      if (typeof toolChoice === 'object' && toolChoice.type === 'tool') {
        targetTool = toolChoice.name;
      } else if (toolChoice === 'auto') {
        const detected = this.detectToolIntent(sanitized);
        targetTool = detected.toolName;
        toolArgs = detected.args;
      }

      if (targetTool) {
        const executionResult = await studentToolRegistry.executeTool(
          targetTool,
          toolArgs,
          context,
        );
        toolsExecuted.push(executionResult);
      }
    }

    // Synthesize user-facing response
    const message = this.synthesizeResponse(
      sanitized,
      toolsExecuted,
      context,
      isSuspicious,
    );

    return {
      message,
      toolsExecuted,
      metadata: {
        uid: context.uid,
        role: context.role,
        collegeId: context.collegeId,
        departmentId: context.departmentId,
        classId: context.classId,
        registerNumber: context.registerNumber,
        timestamp: new Date().toISOString(),
        model: 'lms-student-ai-v1',
      },
    };
  }

  /**
   * Synthesizes conversational yet precise responses tailored for students.
   */
  public synthesizeResponse(
    userMessage: string,
    toolsExecuted: ToolExecutionResult[],
    context: StudentContext,
    isSuspicious: boolean,
  ): string {
    if (isSuspicious) {
      return "Security Notice: Your query contained restricted instructions or boundary bypass attempts. Only verified academic information for your student account can be accessed.";
    }

    if (toolsExecuted.length === 0) {
      return `Hello ${context.displayName || 'Student'}! How can I help you today? You can ask me about your current attendance percentage, weekly class timetable, registered subjects, Class Incharge details, or college policies and regulations.`;
    }

    const firstTool = toolsExecuted[0];

    if (firstTool.status === 'error') {
      return `I encountered an issue retrieving your academic information (${firstTool.error?.message || 'Unknown error'}). Please try again or contact your Class Incharge if the issue persists.`;
    }

    const res = firstTool.result;

    switch (firstTool.toolName) {
      case 'student.getAttendance': {
        const summary = res.summary;
        const statusText =
          summary.status === 'SAFE'
            ? '✅ SAFE (Eligible for exams)'
            : summary.status === 'CRITICAL'
            ? '⚠️ CRITICAL (Below 75% threshold)'
            : 'ℹ️ NO DATA';

        return `Your current overall attendance is **${summary.overallPercentage}%** (${statusText}).
• Total Attended: ${summary.totalPresent} / ${summary.totalHeld} periods
• Status Margin: ${summary.safeMargin >= 0 ? `+${summary.safeMargin} periods above 75%` : `${summary.safeMargin} periods needed for 75%`}
• Breakdown across ${res.subjectBreakdown?.length || 0} subjects is available in your records.`;
      }

      case 'student.getTimetable': {
        return `Here is your verified timetable for **${res.className}** (${res.totalSlots} periods scheduled). You have classes scheduled across ${res.slots?.length || 0} time slots.`;
      }

      case 'student.getSubjects': {
        return `You have **${res.totalSubjects} registered subjects** for the current curriculum. Check your dashboard for detailed credits and course codes.`;
      }

      case 'student.getClassIncharge': {
        return `Your Class Incharge is **${res.name}** (${res.designation}, ${res.departmentName}).
• Email: ${res.email}
• Cabin: ${res.cabin || 'Department Office'}
• Phone: ${res.phone || 'Available on LMS'}`;
      }

      case 'student.getDashboard': {
        return `Here is your academic overview for **${res.academic.className}** (Semester ${res.academic.currentSemester}):
• Program: ${res.academic.programName}
• Attendance: ${res.attendanceSummary.overallPercentage}% (${res.attendanceSummary.status})
• Registered Subjects: ${res.subjectsCount}
• Class Incharge: ${res.academic.classIncharge?.name || 'Assigned'}`;
      }

      case 'student.getProfile': {
        return `Profile details for **${res.displayName}** (Register No: ${res.studentId}):
• Email: ${res.email}
• Degree & Batch: ${res.accountStatus} account, ${res.profileCompletionPercentage}% profile completion.`;
      }

      case 'student.searchKnowledge': {
        return `I found **${res.totalResults} institutional knowledge sources** matching your query.
${res.results.map((r: any) => `• **${r.title}** (${r.sourceDocument}): "${r.content}"`).join('\n')}`;
      }

      case 'student.getKnowledgeContext': {
        return `Policy Document: **${res.title}** (${res.metadata.version}, approved by ${res.metadata.approvedBy}):
${res.content}`;
      }

      default:
        return `Retrieved ${firstTool.toolName} data successfully for your account.`;
    }
  }
}

export const studentAiOrchestratorService = new StudentAiOrchestratorService();
