/**
 * State Management Types
 * Application state structure and types
 */

import type {
  User,
  Job,
  HRContact,
  QueueItem,
  DailyLog,
  PlannerTask,
} from './domain';

export interface AppState {
  user: User | null;
  jobs: Job[];
  hrContacts: HRContact[];
  queue: QueueItem[];
  logs: DailyLog[];
  planner: PlannerTask[];
  isLoading: boolean;
  error: string | null;
}

export type StateKey = keyof AppState;

export interface StateSubscriber {
  (state: AppState): void;
}

export interface StateManager {
  getState(): AppState;
  setState(key: StateKey, value: any): void;
  subscribe(subscriber: StateSubscriber): () => void;
}

export type EventType =
  | 'user:login'
  | 'user:logout'
  | 'user:updated'
  | 'job:created'
  | 'job:updated'
  | 'job:deleted'
  | 'job:statusChanged'
  | 'hr:created'
  | 'hr:updated'
  | 'hr:deleted'
  | 'queue:item:added'
  | 'queue:item:updated'
  | 'queue:item:deleted'
  | 'log:created'
  | 'log:updated'
  | 'planner:task:completed'
  | 'data:refresh'
  | 'error:occurred';

export interface EventPayload {
  [key: string]: any;
}

export interface EventBusListener {
  (payload: EventPayload): void;
}

export interface EventBus {
  on(event: EventType, listener: EventBusListener): () => void;
  emit(event: EventType, payload?: EventPayload): void;
  clear(event?: EventType): void;
}
