import type { UnifiedErrorCode } from './codes'

export const USER_ERROR_MESSAGES_ZH: Record<UnifiedErrorCode, string> = {
  UNAUTHORIZED: 'Please log in first.',
  FORBIDDEN: 'You do not have permission for this action.',
  NOT_FOUND: 'Data not found.',
  INVALID_PARAMS: 'Invalid request parameters. Please check and try again.',
  MISSING_CONFIG: 'System configuration incomplete. Please contact admin.',
  CONFLICT: 'Status conflict. Please refresh and try again.',
  TASK_NOT_READY: 'Task is still processing. Please wait.',
  NO_RESULT: 'Task completed but no results available.',
  RATE_LIMIT: 'Too many requests. Please try again later.',
  MODEL_NOT_OPEN: 'Model permissions not activated. Please enable the model first.',
  MODEL_NOT_REGISTERED: 'Model not registered. Please add it in settings.',
  MODEL_NOT_CONFIGURED: 'No model configured. Please set up in settings.',
  QUOTA_EXCEEDED: 'Credits exhausted. Please recharge.',
  EXTERNAL_ERROR: 'External service temporarily unavailable. Please try later.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  EMPTY_RESPONSE: 'Model returned empty response. Please try again.',
  INSUFFICIENT_BALANCE: 'Insufficient balance.',
  SENSITIVE_CONTENT: 'Content may contain sensitive information and was blocked.',
  GENERATION_TIMEOUT: 'Generation timed out. Please try again.',
  VIDEO_API_FORMAT_UNSUPPORTED: 'Current video API format is not supported.',
  GENERATION_FAILED: 'Generation failed. Please try again.',
  WATCHDOG_TIMEOUT: 'Task execution timed out.',
  WORKER_EXECUTION_ERROR: 'Task execution failed.',
  INTERNAL_ERROR: 'Internal system error. Please try again later.',
}

export function getUserMessageByCode(code: UnifiedErrorCode) {
  return USER_ERROR_MESSAGES_ZH[code]
}
