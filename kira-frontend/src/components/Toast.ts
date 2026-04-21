/**
 * Toast Notification Component
 * Non-blocking notifications for user feedback
 */

import Component from './Component';
import { createElement } from '../utils/dom';
import { TOAST_DURATION } from '../config/constants';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastOptions {
  type?: ToastType;
  duration?: number;
  onClose?: () => void;
}

export class Toast extends Component {
  private message: string;
  private options: ToastOptions;
  private timeoutId: NodeJS.Timeout | null = null;

  constructor(message: string, options: ToastOptions = {}) {
    super();
    this.message = message;
    this.options = {
      type: options.type || 'info',
      duration: options.duration || TOAST_DURATION.NORMAL,
      ...options,
    };
  }

  render(): HTMLElement {
    const toast = createElement('div', {
      class: ['toast', `toast--${this.options.type}`],
      attrs: {
        role: 'alert',
        'aria-live': 'polite',
      },
    });

    // Icon
    const icon = this.getIcon();
    toast.appendChild(icon);

    // Message
    const msgEl = createElement('span', {
      class: 'toast__message',
      text: this.message,
    });
    toast.appendChild(msgEl);

    // Close button
    const closeBtn = createElement('button', {
      class: 'toast__close',
      text: '✕',
      attrs: { 'aria-label': 'Close notification' },
    });
    closeBtn.addEventListener('click', () => this.close());
    toast.appendChild(closeBtn);

    return toast;
  }

  private getIcon(): HTMLElement {
    const icons: Record<ToastType, string> = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ',
    };

    return createElement('span', {
      class: 'toast__icon',
      text: icons[this.options.type || 'info'],
    });
  }

  protected onMount(): void {
    if (this.options.duration && this.options.duration > 0) {
      this.timeoutId = setTimeout(() => this.close(), this.options.duration);
    }
  }

  private close(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    if (this.options.onClose) {
      this.options.onClose();
    }

    this.unmount();
  }

  protected onBeforeUnmount(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }
}

/**
 * Toast Manager - Manages a container of toasts
 */
export class ToastManager extends Component {
  private toasts: Toast[] = [];
  private containerId = 'toast-container';

  render(): HTMLElement {
    return createElement('div', {
      id: this.containerId,
      class: 'toast-container',
      attrs: { 'aria-label': 'Notifications' },
    });
  }

  show(message: string, options?: ToastOptions): Toast {
    const toast = new Toast(message, options);

    if (!this.el) {
      this.mount('body');
    }

    toast.mount(this.el!);
    this.toasts.push(toast);

    // Auto-remove from array after close
    const originalOnClose = options?.onClose;
    options = {
      ...options,
      onClose: () => {
        this.toasts = this.toasts.filter(t => t !== toast);
        originalOnClose?.();
      },
    };

    return toast;
  }

  success(message: string, duration?: number): void {
    this.show(message, { type: 'success', duration });
  }

  error(message: string, duration?: number): void {
    this.show(message, { type: 'error', duration });
  }

  warning(message: string, duration?: number): void {
    this.show(message, { type: 'warning', duration });
  }

  info(message: string, duration?: number): void {
    this.show(message, { type: 'info', duration });
  }

  clear(): void {
    this.toasts.forEach(toast => toast.unmount());
    this.toasts = [];
  }

  getToastCount(): number {
    return this.toasts.length;
  }
}

// Global toast manager instance
export const toastManager = new ToastManager();

// Initialize on first use
let toastInitialized = false;
export function getToastManager(): ToastManager {
  if (!toastInitialized) {
    toastManager.mount('body');
    toastInitialized = true;
  }
  return toastManager;
}

export default ToastManager;
