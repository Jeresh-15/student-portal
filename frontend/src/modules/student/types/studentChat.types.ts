/**
 * Student AI Chatbot Types & Contract
 * Strictly synchronized with backend/src/modules/student/ai/studentAi.types.ts
 */

export interface StudentChatMessageHistory {
  role: 'user' | 'assistant';
  content: string;
}

export interface StudentChatRequest {
  message: string;
  conversationId?: string;
  history?: StudentChatMessageHistory[];
}

export interface StudentChatToolExecution {
  toolName: string;
  params: Record<string, any>;
  result: any;
  status: 'success' | 'error';
  durationMs: number;
  error?: string;
}

export interface StudentChatResponse {
  conversationId?: string;
  response?: string;
  message?: string;
  toolExecutions?: StudentChatToolExecution[];
  toolsExecuted?: Array<{
    toolName: string;
    arguments?: Record<string, any>;
    params?: Record<string, any>;
    result: any;
    status: 'success' | 'error';
    executionDurationMs?: number;
    durationMs?: number;
    error?: any;
  }>;
  metadata?: any;
}

export interface StudentChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  toolExecutions?: StudentChatToolExecution[];
  status?: 'sending' | 'sent' | 'error';
  errorMessage?: string;
}

/**
 * Citation shape rendered for RAG results
 */
export interface StudentRagCitation {
  id: string;
  title: string;
  content: string;
  category: 'policy' | 'regulations' | 'exam' | 'attendance_rules' | 'general';
  sourceDocument: string;
  relevanceScore?: number;
}
