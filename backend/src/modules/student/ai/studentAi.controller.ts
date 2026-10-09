import { Response, NextFunction } from 'express';
import { AppError } from '../../../utils/errors';
import { sendSuccess } from '../../../utils/response';
import { studentAiOrchestratorService } from './studentAi.service';
import { studentToolRegistry } from './toolRegistry';

export class StudentAiController {
  /**
   * Main Chat Endpoint
   * POST /api/student/chat or POST /api/student/ai/chat
   */
  public async chat(
    req: any,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      if (!req.studentContext) {
        throw new AppError(403, 'FORBIDDEN', 'Student authorization context is required');
      }

      const result = await studentAiOrchestratorService.processChat(
        req.body,
        req.studentContext,
      );

      sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * List Canonical Registered Tools
   * GET /api/student/ai/tools
   */
  public async listTools(
    req: any,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      if (!req.studentContext) {
        throw new AppError(403, 'FORBIDDEN', 'Student authorization context is required');
      }

      const tools = studentToolRegistry.getRegisteredTools();
      sendSuccess(res, tools, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Controlled Direct Tool Execution
   * POST /api/student/ai/tools/execute
   */
  public async executeTool(
    req: any,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      if (!req.studentContext) {
        throw new AppError(403, 'FORBIDDEN', 'Student authorization context is required');
      }

      const { toolName, arguments: args } = req.body;
      const result = await studentToolRegistry.executeTool(
        toolName,
        args || {},
        req.studentContext,
      );

      sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }
}

export const studentAiController = new StudentAiController();
