/**
 * State Management & Event Bus
 * Centralized pub/sub pattern for application state and events
 */

import type { AppState, StateKey, StateSubscriber, EventType, EventPayload, EventBusListener } from '../types/state';
import type { User, Job, HRContact, QueueItem, DailyLog, PlannerTask } from '../types/domain';

/**
 * Initial application state
 */
const initialState: AppState = {
  user: null,
  jobs: [],
  hrContacts: [],
  queue: [],
  logs: [],
  planner: [],
  isLoading: false,
  error: null,
};

/**
 * StateManager - Centralized state container with immutable updates
 * Uses pub/sub pattern for reactivity
 */
export class StateManager {
  private state: AppState = { ...initialState };
  private subscribers: Set<StateSubscriber> = new Set();

  /**
   * Get current state (returns deep copy to prevent mutations)
   */
  getState(): AppState {
    return JSON.parse(JSON.stringify(this.state));
  }

  /**
   * Update state by key and notify subscribers
   */
  setState(key: StateKey, value: any): void {
    const newState = { ...this.state, [key]: value };
    this.state = newState;
    this.notifySubscribers();
  }

  /**
   * Subscribe to state changes
   * Returns unsubscribe function
   */
  subscribe(subscriber: StateSubscriber): () => void {
    this.subscribers.add(subscriber);

    // Return unsubscribe function
    return () => {
      this.subscribers.delete(subscriber);
    };
  }

  /**
   * Notify all subscribers of state change
   */
  private notifySubscribers(): void {
    const stateCopy = this.getState();
    this.subscribers.forEach(subscriber => {
      try {
        subscriber(stateCopy);
      } catch (error) {
        console.error('Subscriber error:', error);
      }
    });
  }

  /**
   * Reset state to initial values
   */
  reset(): void {
    this.state = { ...initialState };
    this.notifySubscribers();
  }

  /**
   * Clear all subscribers
   */
  clearSubscribers(): void {
    this.subscribers.clear();
  }
}

/**
 * EventBus - Pub/sub event system for cross-component communication
 */
export class EventBus {
  private listeners: Map<EventType, Set<EventBusListener>> = new Map();

  /**
   * Subscribe to event
   * Returns unsubscribe function
   */
  on(event: EventType, listener: EventBusListener): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }

    this.listeners.get(event)!.add(listener);

    // Return unsubscribe function
    return () => {
      this.listeners.get(event)!.delete(listener);
    };
  }

  /**
   * Subscribe to event only once
   */
  once(event: EventType, listener: EventBusListener): () => void {
    const wrapper: EventBusListener = (payload: EventPayload) => {
      listener(payload);
      unsubscribe();
    };

    const unsubscribe = this.on(event, wrapper);
    return unsubscribe;
  }

  /**
   * Emit event to all listeners
   */
  emit(event: EventType, payload?: EventPayload): void {
    const listeners = this.listeners.get(event);
    if (!listeners) return;

    listeners.forEach(listener => {
      try {
        listener(payload || {});
      } catch (error) {
        console.error(`Error in listener for event ${event}:`, error);
      }
    });
  }

  /**
   * Remove specific event listeners or all listeners
   */
  clear(event?: EventType): void {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }

  /**
   * Get count of listeners for an event
   */
  listenerCount(event: EventType): number {
    return this.listeners.get(event)?.size || 0;
  }
}

/**
 * Global state manager instance
 */
export const stateManager = new StateManager();

/**
 * Global event bus instance
 */
export const eventBus = new EventBus();

/**
 * Helper hook for subscribing to state changes
 */
export function useStateSubscriber(callback: (state: AppState) => void): () => void {
  return stateManager.subscribe(callback);
}

/**
 * Helper hook for subscribing to events
 */
export function useEventListener(event: EventType, callback: EventBusListener): () => void {
  return eventBus.on(event, callback);
}

export default {
  stateManager,
  eventBus,
  useStateSubscriber,
  useEventListener,
};
