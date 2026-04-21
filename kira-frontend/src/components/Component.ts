/**
 * Base Component Class
 * Abstract base class for all UI components with lifecycle methods
 */

import { eventBus } from '../services/state';

export type ComponentState = Record<string, any>;

export abstract class Component {
  protected el: HTMLElement | null = null;
  protected state: ComponentState = {};
  protected subscriptions: Array<() => void> = [];

  /**
   * Get component element
   */
  getElement(): HTMLElement | null {
    return this.el;
  }

  /**
   * Render component - must be implemented by subclasses
   */
  abstract render(): HTMLElement;

  /**
   * Mount component to DOM
   */
  mount(parent: HTMLElement | string): void {
    const parentEl = typeof parent === 'string' ? document.querySelector(parent) : parent;

    if (!parentEl) {
      console.error('Parent element not found');
      return;
    }

    this.el = this.render();
    if (this.el) {
      parentEl.appendChild(this.el);
      this.onMount();
    }
  }

  /**
   * Update component
   */
  update(newState?: Partial<ComponentState>): void {
    if (newState) {
      this.state = { ...this.state, ...newState };
    }

    if (this.el) {
      const newEl = this.render();
      if (this.el.parentNode) {
        this.el.parentNode.replaceChild(newEl, this.el);
      }
      this.el = newEl;
    }

    this.onUpdate();
  }

  /**
   * Unmount component from DOM
   */
  unmount(): void {
    this.onBeforeUnmount();
    this.unsubscribeAll();

    if (this.el && this.el.parentNode) {
      this.el.parentNode.removeChild(this.el);
    }

    this.el = null;
  }

  /**
   * Lifecycle hook - called after mount
   */
  protected onMount(): void {}

  /**
   * Lifecycle hook - called after update
   */
  protected onUpdate(): void {}

  /**
   * Lifecycle hook - called before unmount
   */
  protected onBeforeUnmount(): void {}

  /**
   * Subscribe to event
   */
  protected on(eventType: string, handler: (data: any) => void): void {
    const unsubscribe = eventBus.on(eventType as any, handler);
    this.subscriptions.push(unsubscribe);
  }

  /**
   * Unsubscribe all
   */
  protected unsubscribeAll(): void {
    this.subscriptions.forEach(unsub => unsub());
    this.subscriptions = [];
  }

  /**
   * Emit event
   */
  protected emit(eventType: string, data?: any): void {
    eventBus.emit(eventType as any, data);
  }
}

export default Component;
