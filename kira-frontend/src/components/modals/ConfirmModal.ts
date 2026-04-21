/**
 * Confirm Modal Component
 * Generic confirmation dialog
 */

import Modal, { ModalOptions } from './Modal';
import { createElement } from '../../utils/dom';

export interface ConfirmModalOptions extends ModalOptions {
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
  onConfirm?: () => Promise<void> | void;
}

export class ConfirmModal extends Modal {
  private isLoading = false;

  constructor(options: ConfirmModalOptions) {
    super({
      title: 'Confirm Action',
      ...options,
    });
  }

  renderContent(): HTMLElement {
    const container = createElement('div', {
      class: 'confirm-modal',
    });

    const message = createElement('p', {
      class: 'confirm-modal__message',
      text: (this.options as ConfirmModalOptions).message,
    });
    container.appendChild(message);

    const buttonGroup = createElement('div', {
      class: 'modal-footer gap-2',
    });

    const cancelBtn = createElement('button', {
      class: 'btn btn-ghost',
      text: (this.options as ConfirmModalOptions).cancelText || 'Cancel',
      attrs: { type: 'button' },
    });
    cancelBtn.addEventListener('click', () => this.close());
    buttonGroup.appendChild(cancelBtn);

    const confirmBtn = createElement('button', {
      class: [
        'btn',
        (this.options as ConfirmModalOptions).isDangerous ? 'btn-danger' : 'btn-primary',
      ],
      text: (this.options as ConfirmModalOptions).confirmText || 'Confirm',
      attrs: { type: 'button' },
    });

    confirmBtn.addEventListener('click', () => this.handleConfirm());
    buttonGroup.appendChild(confirmBtn);

    container.appendChild(buttonGroup);

    return container;
  }

  private async handleConfirm(): Promise<void> {
    if (this.isLoading) return;

    this.isLoading = true;

    try {
      const onConfirm = (this.options as ConfirmModalOptions).onConfirm;
      if (onConfirm) {
        await onConfirm();
      }

      this.emit('confirm:confirmed');
      this.close();
    } catch (error) {
      this.emit('error:occurred', {
        message: error instanceof Error ? error.message : 'Action failed',
        severity: 'error',
      });
    } finally {
      this.isLoading = false;
    }
  }
}

export default ConfirmModal;
