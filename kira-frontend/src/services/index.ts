/**
 * Services Index
 * Centralized exports for all service layer modules
 */

// API & HTTP
export { APIClient, apiClient } from './api';
export type { RequestOptions } from './api';

// State Management
export { StateManager, EventBus, stateManager, eventBus, useStateSubscriber, useEventListener } from './state';

// Error Monitoring
export { MonitorService, monitor, setupGlobalErrorHandlers } from './monitor';
export type { ErrorContext, ErrorLog } from './monitor';

// Authentication
export { AuthService, authService } from './auth';

// Domain Services
export { JobsService, jobsService } from './jobs';
export { HRContactsService, hrContactsService } from './hrcontacts';
export { QueueService, queueService } from './queue';
export { LogsService, logsService } from './logs';
export { PlannerService, plannerService } from './planner';

// Specialized Services
export { AIService, aiService } from './ai';
export type { JobScore } from './ai';

export { EmailService, emailService } from './email';
export type { EmailTemplate } from './email';

export default {
  apiClient,
  stateManager,
  eventBus,
  monitor,
  authService,
  jobsService,
  hrContactsService,
  queueService,
  logsService,
  plannerService,
  aiService,
  emailService,
};
