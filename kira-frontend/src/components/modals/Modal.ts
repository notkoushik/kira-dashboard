/**
 * Base Modal Component
 * Abstract base class for modal/dialog components
 */

import Component from '../Component';
import { createElement, query, on } from '../../utils/dom';

export interface ModalOptions {
  title?: string;
  onClose?: () => void;
  showCloseButton?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export abstract class Modal extends Component {
  protected options: ModalOptions;
  protected overlay: HTMLElement | null = null;

  constructor(options: ModalOptions = {}) {
    super();
    this.options = {
      showCloseButton: true,
      size: 'medium',
      ...options,
    };
  }

  /**
   * Render modal content (to be implemented by subclasses)
   */
  abstract renderContent(): HTMLElement;

  /**
   * Handle form submission
   */
  protected onSubmit?(data: any): void | Promise<void>;

  render(): HTMLElement {
    // Overlay
    this.overlay = createElement('div', {
      class: ['modal-overlay', 'active'],
      attrs: {
        role: 'presentation',
      },
    });

    // Modal
    const modal = createElement('div', {
      class: ['modal', `modal--${this.options.size}`],
      attrs: {
        role: 'dialog',
        'aria-modal': 'true',
        'aria-labelledby': 'modal-title',
      },
    });

    // Header
    const header = createElement('div', {
      class: 'modal-header',
    });

    if (this.options.title) {
      const title = createElement('h2', {
        class: 'modal-title',
        attrs: { id: 'modal-title' },
        text: this.options.title,
      });
      header.appendChild(title);
    }

    if (this.options.showCloseButton) {
      const closeBtn = createElement('button', {
        class: 'modal-close',
        text: '✕',
        attrs: {
          type: 'button',
          'aria-label': 'Close modal',
        },
      });

      closeBtn.addEventListener('click', () => this.close());
      header.appendChild(closeBtn);
    }

    modal.appendChild(header);

    // Body
    const body = createElement('div', {
      class: 'modal-body',
    });

    const content = this.renderContent();
    body.appendChild(content);
    modal.appendChild(body);

    this.overlay.appendChild(modal);

    // Close on overlay click
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) {
        this.close();
      }
    });

    // Close on Escape key
    this.subscriptions.push(
      on(document, 'keydown' as any, (e: any) => {
        if (e.key === 'Escape') {
          this.close();
        }
      })
    );

    return this.overlay;
  }

  open(): void {
    if (!this.el) {
      this.mount('body');
    }
  }

  close(): void {
    if (this.options.onClose) {
      this.options.onClose();
    }

    this.emit('modal:close');
    this.unmount();
  }
}

export default Modal;
