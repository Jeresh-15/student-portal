import { Router } from 'express';
import { validate } from '../../../middleware/validation.middleware';
import { studentAiController } from './studentAi.controller';
import {
  studentChatRequestSchema,
  directToolExecutionSchema,
} from './studentAi.validation';

const router = Router();

/**
 * @route   POST /api/student/ai/chat
 * @desc    Submit a query to the Student AI Orchestrator
 * @access  STUDENT
 */
router.post(
  '/chat',
  validate(studentChatRequestSchema),
  (req, res, next) => studentAiController.chat(req, res, next),
);

/**
 * @route   GET /api/student/ai/tools
 * @desc    List canonical tools and parameter descriptions
 * @access  STUDENT
 */
router.get(
  '/tools',
  (req, res, next) => studentAiController.listTools(req, res, next),
);

/**
 * @route   POST /api/student/ai/tools/execute
 * @desc    Direct controlled tool execution
 * @access  STUDENT
 */
router.post(
  '/tools/execute',
  validate(directToolExecutionSchema),
  (req, res, next) => studentAiController.executeTool(req, res, next),
);

export default router;
