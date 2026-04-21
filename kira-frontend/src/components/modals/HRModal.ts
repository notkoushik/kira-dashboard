/**
 * HR Contact Modal Component
 * Modal for creating/editing HR contacts
 */

import Modal, { ModalOptions } from './Modal';
import { createElement } from '../../utils/dom';
import { HR_STATUSES } from '../../config/constants';
import type { HRContact } from '../../types/domain';

export interface HRModalOptions extends ModalOptions {
  contact?: HRContact;
  onSave?: (contactData: any) => Promise<void>;
}

export class HRModal extends Modal {
  private contactData: Partial<HRContact>;
  private isLoading = false;

  constructor(options: HRModalOptions = {}) {
    super({
      title: options.contact ? 'Edit HR Contact' : 'Add HR Contact',
      size: 'medium',
      ...options,
    });

    this.contactData = options.contact || {};
  }

  renderContent(): HTMLElement {
    const form = createElement('form', {
      class: 'hr-form',
      attrs: { id: 'hrForm' },
    });

    // Name field
    form.appendChild(this.createFormGroup('name', 'Name *', 'text', this.contactData.name || ''));

    // Email field
    form.appendChild(this.createFormGroup('email', 'Email *', 'email', this.contactData.email || ''));

    // Phone field
    form.appendChild(this.createFormGroup('phone', 'Phone', 'tel', this.contactData.phone || ''));

    // Company field
    form.appendChild(this.createFormGroup('company', 'Company', 'text', this.contactData.company || ''));

    // Role field
    form.appendChild(this.createFormGroup('role', 'Role', 'text', this.contactData.role || ''));

    // LinkedIn URL
    form.appendChild(this.createFormGroup('linkedin', 'LinkedIn URL', 'url', this.contactData.linkedin || ''));

    // Status dropdown
    form.appendChild(
      this.createSelectGroup(
        'status',
        'Status',
        Object.values(HR_STATUSES),
        this.contactData.status || 'Saved'
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
        placeholder: 'Notes about this contact...',
      },
      text: this.contactData.notes || '',
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
      text: 'Save Contact',
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
    type: string = 'text',
    value: string = ''
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
        value,
        required: isRequired ? 'true' : 'false',
        placeholder: label.replace('*', '').trim(),
      },
    });
    group.appendChild(input);

    return group;
  }

  private createSelectGroup(name: string, label: string, options: string[], value: string = ''): HTMLElement {
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
          selected: option === value ? 'true' : 'false',
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
      if ((this.options as HRModalOptions).onSave) {
        await (this.options as HRModalOptions).onSave!(data);
      }

      this.emit('hr:saved', data);
      this.close();
    } catch (error) {
      this.emit('error:occurred', {
        message: error instanceof Error ? error.message : 'Failed to save contact',
        severity: 'error',
      });
    } finally {
      this.isLoading = false;
    }
  }
}

export default HRModal;
