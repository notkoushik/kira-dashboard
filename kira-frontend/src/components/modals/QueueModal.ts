/**
 * Queue Modal Component
 * Modal for adding jobs to apply queue
 */

import Modal, { ModalOptions } from './Modal';
import { createElement } from '../../utils/dom';
import { DIFFICULTY_LEVELS, PRIORITY_LEVELS } from '../../config/constants';
import type { QueueItem } from '../../types/domain';

export interface QueueModalOptions extends ModalOptions {
  jobId?: string;
  onSave?: (queueData: any) => Promise<void>;
}

export class QueueModal extends Modal {
  private isLoading = false;

  constructor(options: QueueModalOptions = {}) {
    super({
      title: 'Add to Apply Queue',
      size: 'medium',
      ...options,
    });
  }

  renderContent(): HTMLElement {
    const form = createElement('form', {
      class: 'queue-form',
      attrs: { id: 'queueForm' },
    });

    // Company field
    form.appendChild(this.createFormGroup('company', 'Company Name *', 'text'));

    // Role field
    form.appendChild(this.createFormGroup('role', 'Job Title *', 'text'));

    // Priority dropdown
    form.appendChild(
      this.createSelectGroup('priority', 'Priority', ['1 (Low)', '2 (Medium)', '3 (High)'], '2')
    );

    // Difficulty dropdown
    form.appendChild(
      this.createSelectGroup(
        'difficulty',
        'Difficulty',
        Object.values(DIFFICULTY_LEVELS),
        'Medium'
      )
    );

    // Notes
    const notesGroup = createElement('div', {
      class: 'form-group',
    });

    const notesLabel = createElement('label', {
      class: 'form-label',
      text: 'Notes',
      attrs: { for: 'notes' },
    });
    notesGroup.appendChild(notesLabel);

    const notesTextarea = createElement('textarea', {
      class: 'form-textarea',
      attrs: {
        id: 'notes',
        name: 'notes',
        placeholder: 'Why add this to queue?',
      },
    });
    notesGroup.appendChild(notesTextarea);
    form.appendChild(notesGroup);

    // Buttons
    const buttonGroup = createElement('div', {
      class: 'modal-footer',
    });

    const cancelBtn = createElement('button', {
      class: 'btn btn-ghost',
      text: 'Cancel',
      attrs: { type: 'button' },
    });
    cancelBtn.addEventListener('click', () => this.close());
    buttonGroup.appendChild(cancelBtn);

    const saveBtn = createElement('button', {
      class: 'btn btn-primary',
      text: 'Add to Queue',
      attrs: { type: 'submit' },
    });
    buttonGroup.appendChild(saveBtn);
    form.appendChild(buttonGroup);

    form.addEventListener('submit', (e) => this.handleSubmit(e, form));

    return form;
  }

  private createFormGroup(
    name: string,
    label: string,
    type: string = 'text'
  ): HTMLElement {
    const group = createElement('div', {
      class: 'form-group',
    });

    const labelEl = createElement('label', {
      class: 'form-label',
      text: label,
      attrs: { for: name },
    });
    group.appendChild(labelEl);

    const isRequired = label.includes('*');
    const input = createElement('input', {
      class: 'form-input',
      attrs: {
        type,
        id: name,
        name,
        required: isRequired ? 'true' : 'false',
        placeholder: label.replace('*', '').trim(),
      },
    });
    group.appendChild(input);

    return group;
  }

  private createSelectGroup(
    name: string,
    label: string,
    options: string[],
    defaultValue: string = ''
  ): HTMLElement {
    const group = createElement('div', {
      class: 'form-group',
    });

    const labelEl = createElement('label', {
      class: 'form-label',
      text: label,
      attrs: { for: name },
    });
    group.appendChild(labelEl);

    const select = createElement('select', {
      class: 'form-select',
      attrs: {
        id: name,
        name,
      },
    });

    options.forEach(option => {
      const optEl = createElement('option', {
        attrs: {
          value: option,
          selected: option === defaultValue ? 'true' : 'false',
        },
        text: option,
      });
      select.appendChild(optEl);
    });

    group.appendChild(select);
    return group;
  }

  private async handleSubmit(e: SubmitEvent, form: HTMLFormElement): Promise<void> {
    e.preventDefault();

    if (this.isLoading) return;

    const formData = new FormData(form);
    const data = Object.fromEntries(formData);

    this.isLoading = true;

    try {
      if ((this.options as QueueModalOptions).onSave) {
        await (this.options as QueueModalOptions).onSave!(data);
      }

      this.emit('queue:added', data);
      this.close();
    } catch (error) {
      this.emit('error:occurred', {
        message: error instanceof Error ? error.message : 'Failed to add to queue',
        severity: 'error',
      });
    } finally {
      this.isLoading = false;
    }
  }
}

export default QueueModal;
