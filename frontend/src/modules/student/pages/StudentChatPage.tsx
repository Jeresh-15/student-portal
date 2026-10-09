import React, { useState, useRef, useEffect } from 'react';
import { useStudent } from '../hooks/useStudent';
import { studentApi } from '../api/studentApi';
import type {
  StudentChatMessage,
  StudentChatToolExecution,
  StudentRagCitation,
} from '../types/studentChat.types';

// Suggested quick inquiry prompts
const SUGGESTED_PROMPTS = [
  'What is my current attendance percentage?',
  'What is my class schedule for today?',
  'What are my registered subjects this semester?',
  'What are the rules for attendance condonation on medical grounds?',
  'How many days of On-Duty (OD) leave can a student take?',
  'When are hall tickets released and what are the exam entry rules?',
];

export const StudentChatPage: React.FC = () => {
  const { profile } = useStudent();
  const [messages, setMessages] = useState<StudentChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>(undefined);
  const [apiError, setApiError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const studentName =
    profile?.displayName ||
    `${profile?.firstName || ''} ${profile?.lastName || ''}`.trim() ||
    'Student';

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Focus input on load
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = async (messageText?: string) => {
    const textToSend = (messageText || inputText).trim();
    if (!textToSend || isLoading) return;

    setApiError(null);
    const userMessageId = `msg-user-${Date.now()}`;
    const newUserMessage: StudentChatMessage = {
      id: userMessageId,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent',
    };

    // Build history for backend AI context (last 6 messages)
    const history = messages
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .slice(-6)
      .map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }));

    setMessages((prev) => [...prev, newUserMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await studentApi.chat({
        message: textToSend,
        conversationId,
        history,
      });

      if (response.conversationId) {
        setConversationId(response.conversationId);
      }

      const content = response.message || response.response || 'No response generated.';
      const rawTools = response.toolExecutions || response.toolsExecuted || [];
      const toolExecutions: StudentChatToolExecution[] = rawTools.map((t: any) => ({
        toolName: t.toolName,
        params: t.params || t.arguments || {},
        result: t.result,
        status: t.status,
        durationMs: t.durationMs || t.executionDurationMs || 0,
        error: t.error ? (typeof t.error === 'string' ? t.error : t.error.message) : undefined,
      }));

      const assistantMessage: StudentChatMessage = {
        id: `msg-asst-${Date.now()}`,
        role: 'assistant',
        content,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        toolExecutions,
        status: 'sent',
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error('Student AI chat error:', err);
      const errorMessage =
        err?.message || 'Unable to connect to Student AI Assistant. Please check your connection and retry.';
      setApiError(errorMessage);

      const errorAsstMessage: StudentChatMessage = {
        id: `msg-err-${Date.now()}`,
        role: 'assistant',
        content: 'I encountered an issue retrieving your academic information. Please try again or rephrase your question.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'error',
        errorMessage,
      };

      setMessages((prev) => [...prev, errorAsstMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    setConversationId(undefined);
    setApiError(null);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] max-w-6xl mx-auto pb-4">
      {/* ─── Header Banner ─── */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border border-slate-200 rounded-t-xl shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-md">
            <span className="material-symbols-outlined text-[1.5rem]">smart_toy</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900 tracking-tight">
                Aura Student AI Assistant
              </h1>
              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live & Verified
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Institutional AI Assistant for verified student records, schedules, and regulations.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <button
              onClick={handleClearChat}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
              title="Start a new conversation"
            >
              <span className="material-symbols-outlined text-[1.1rem]">restart_alt</span>
              New Chat
            </button>
          )}
        </div>
      </div>

      {/* ─── Messages Viewport ─── */}
      <div className="flex-1 bg-slate-50/60 border-x border-slate-200 overflow-y-auto p-4 sm:p-6 space-y-4">
        {/* Empty State */}
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center max-w-xl mx-auto text-center py-8">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 mb-4 shadow-xs">
              <span className="material-symbols-outlined text-[2rem]">school</span>
            </div>
            <h2 className="text-lg font-bold text-slate-800 mb-1">
              Welcome, {studentName}!
            </h2>
            <p className="text-xs text-slate-500 max-w-md mb-6 leading-relaxed">
              Ask anything about your live attendance status, daily class schedule, enrolled subjects,
              or verified institutional policies from the academic handbook.
            </p>

            {/* Quick Prompt Cards */}
            <div className="w-full text-left">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 px-1">
                Suggested Inquiries:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {SUGGESTED_PROMPTS.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(prompt)}
                    className="p-3 bg-white hover:bg-blue-50/60 border border-slate-200 hover:border-blue-300 rounded-lg text-xs font-medium text-slate-700 text-left transition-all hover:shadow-xs flex items-center justify-between group"
                  >
                    <span className="line-clamp-2">{prompt}</span>
                    <span className="material-symbols-outlined text-slate-300 group-hover:text-blue-600 text-[1.1rem] transition-colors ml-2 shrink-0">
                      arrow_forward
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Message Stream */}
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`flex gap-3 max-w-3xl ${
                message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold shadow-xs ${
                  message.role === 'user'
                    ? 'bg-blue-700 text-white'
                    : 'bg-gradient-to-tr from-[#0b1727] to-[#162740] text-blue-300 border border-[#1e3250]'
                }`}
              >
                {message.role === 'user' ? (
                  profile?.displayName?.[0] || 'ME'
                ) : (
                  <span className="material-symbols-outlined text-[1.2rem]">smart_toy</span>
                )}
              </div>

              {/* Message Bubble Container */}
              <div className="flex flex-col gap-1.5 max-w-2xl">
                <div
                  className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-xs shadow-xs'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-tl-xs shadow-xs'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>

                  {/* Render Structured Tool Executions if any */}
                  {message.toolExecutions && message.toolExecutions.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col gap-2">
                      {message.toolExecutions.map((exec, idx) => (
                        <ToolExecutionWidget key={idx} execution={exec} />
                      ))}
                    </div>
                  )}
                </div>

                {/* Metadata & Timestamp */}
                <div
                  className={`flex items-center gap-2 text-[10px] text-slate-400 px-1 ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <span>{message.timestamp}</span>
                  {message.status === 'error' && (
                    <span className="text-rose-500 font-semibold">• Failed to deliver</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-start gap-3 max-w-xl">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#0b1727] to-[#162740] text-blue-300 border border-[#1e3250] flex items-center justify-center shrink-0 shadow-xs">
              <span className="material-symbols-outlined text-[1.2rem] animate-spin">
                sync
              </span>
            </div>
            <div className="p-4 bg-white border border-slate-200 rounded-2xl rounded-tl-xs shadow-xs flex items-center gap-2 text-xs text-slate-500">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
              <span>Checking verified records and academic regulations...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ─── Input Bar & Error Notification ─── */}
      <div className="p-4 bg-white border border-slate-200 rounded-b-xl shadow-xs">
        {apiError && (
          <div className="mb-2 px-3 py-2 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[1.1rem]">error</span>
              <span>{apiError}</span>
            </div>
            <button
              onClick={() => handleSend()}
              className="text-xs font-semibold text-rose-800 underline hover:no-underline"
            >
              Retry
            </button>
          </div>
        )}

        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about attendance, timetable, registered subjects, or college policies..."
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 text-xs sm:text-sm bg-slate-50 hover:bg-slate-50/80 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-xl focus:outline-none transition-all placeholder:text-slate-400"
          />
          <button
            onClick={() => handleSend()}
            disabled={isLoading || !inputText.trim()}
            className={`px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm flex items-center gap-1.5 transition-all shadow-xs ${
              isLoading || !inputText.trim()
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                : 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer active:scale-98'
            }`}
          >
            <span>Send</span>
            <span className="material-symbols-outlined text-[1.1rem]">send</span>
          </button>
        </div>

        {/* Security and Grounding Footnote */}
        <div className="mt-2 text-[10px] text-slate-400 text-center flex items-center justify-center gap-1.5">
          <span className="material-symbols-outlined text-[0.85rem] text-slate-400">verified_user</span>
          <span>
            Responses are verified with authoritative student database tools and the institutional academic handbook.
          </span>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// Tool Execution Visualization Subcomponents
// ============================================================================

interface ToolExecutionWidgetProps {
  execution: StudentChatToolExecution;
}

const ToolExecutionWidget: React.FC<ToolExecutionWidgetProps> = ({ execution }) => {
  const { toolName, result, status } = execution;
  if (status !== 'success' || !result) return null;

  // 1. Attendance Summary Card
  if ((toolName === 'student.getAttendance' || toolName === 'student.getMyAttendance') && result.summary) {
    const summary = result.summary;
    const isEligible = summary.isEligible;
    const percentage = summary.percentage;

    return (
      <div className="mt-2 p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-col gap-2">
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
          <div className="flex items-center gap-1.5 text-slate-700 font-semibold text-xs">
            <span className="material-symbols-outlined text-blue-600 text-[1.1rem]">fact_check</span>
            <span>Attendance Summary</span>
          </div>
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
              isEligible
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : 'bg-rose-100 text-rose-800 border border-rose-300'
            }`}
          >
            {isEligible ? 'Eligible for Exams' : 'Attendance Shortage'}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center pt-1">
          <div className="bg-white p-2 rounded-lg border border-slate-200">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Attended</span>
            <span className="text-xs font-bold text-slate-800">
              {summary.attendedSessions} / {summary.totalSessions}
            </span>
          </div>
          <div className="bg-white p-2 rounded-lg border border-slate-200">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Percentage</span>
            <span
              className={`text-xs font-bold ${
                percentage >= 75 ? 'text-emerald-700' : 'text-rose-600'
              }`}
            >
              {percentage}%
            </span>
          </div>
          <div className="bg-white p-2 rounded-lg border border-slate-200">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Safe Margin</span>
            <span className="text-xs font-bold text-slate-800">
              {summary.safeMargin > 0 ? `+${summary.safeMargin}` : summary.safeMargin} sessions
            </span>
          </div>
        </div>
      </div>
    );
  }

  // 2. Timetable Card
  if ((toolName === 'student.getTimetable' || toolName === 'student.getMyTimetable') && Array.isArray(result.timetable)) {
    const slots = result.timetable.slice(0, 5); // Display first 5 periods
    if (slots.length === 0) return null;

    return (
      <div className="mt-2 p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-col gap-2">
        <div className="flex items-center gap-1.5 text-slate-700 font-semibold text-xs border-b border-slate-200/80 pb-2">
          <span className="material-symbols-outlined text-indigo-600 text-[1.1rem]">schedule</span>
          <span>Class Schedule Overview</span>
        </div>
        <div className="flex flex-col gap-1.5">
          {slots.map((slot: any, idx: number) => (
            <div
              key={idx}
              className="p-2 bg-white rounded-lg border border-slate-200 flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-mono font-bold">
                  P{slot.period || idx + 1}
                </span>
                <span className="font-semibold text-slate-800">{slot.subjectName || slot.subject_name}</span>
              </div>
              <div className="text-slate-500 text-[11px] text-right">
                <span>{slot.startTime || slot.start_time} - {slot.endTime || slot.end_time}</span>
                {slot.room && <span className="text-slate-400 ml-1">({slot.room})</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 3. Subjects Card
  if ((toolName === 'student.getSubjects' || toolName === 'student.getMySubjects') && Array.isArray(result.subjects)) {
    const subjects = result.subjects;
    if (subjects.length === 0) return null;

    return (
      <div className="mt-2 p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-col gap-2">
        <div className="flex items-center gap-1.5 text-slate-700 font-semibold text-xs border-b border-slate-200/80 pb-2">
          <span className="material-symbols-outlined text-blue-600 text-[1.1rem]">auto_stories</span>
          <span>Enrolled Subjects ({subjects.length})</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {subjects.map((sub: any, idx: number) => (
            <div
              key={idx}
              className="p-2 bg-white rounded-lg border border-slate-200 flex items-center justify-between text-xs"
            >
              <div>
                <span className="text-slate-400 text-[10px] font-mono block">{sub.code}</span>
                <span className="font-semibold text-slate-800">{sub.name}</span>
              </div>
              <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] font-semibold">
                {sub.credits} credits
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 4. RAG Institutional Policy Citations Card
  if (toolName === 'student.searchKnowledge' && Array.isArray(result.results) && result.results.length > 0) {
    const citations: StudentRagCitation[] = result.results;

    return (
      <div className="mt-2 p-3 bg-amber-50/50 border border-amber-200/80 rounded-xl flex flex-col gap-2">
        <div className="flex items-center gap-1.5 text-amber-900 font-semibold text-xs border-b border-amber-200/60 pb-2">
          <span className="material-symbols-outlined text-amber-700 text-[1.1rem]">menu_book</span>
          <span>Official Institutional Citations ({citations.length})</span>
        </div>
        <div className="flex flex-col gap-1.5">
          {citations.map((cite, idx) => (
            <div
              key={idx}
              className="p-2.5 bg-white rounded-lg border border-amber-200/60 text-xs flex flex-col gap-1 shadow-2xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800">{cite.title}</span>
                <span className="px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded text-[10px] font-mono">
                  {cite.sourceDocument}
                </span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed line-clamp-3">
                {cite.content}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
};

export default StudentChatPage;
