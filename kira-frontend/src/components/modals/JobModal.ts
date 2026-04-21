/**
 * Job Modal Component
 * Modal for creating/editing job applications
 */

import Modal, { ModalOptions } from './Modal';
import { createElement, query } from '../../utils/dom';
import { JOB_PORTALS } from '../../config/constants';
import type { Job } from '../../types/domain';

export interface JobModalOptions extends ModalOptions {
  job?: Job;
  onSave?: (jobData: any) => Promise<void>;
}

export class JobModal extends Modal {
  private jobData: Partial<Job>;
  private isLoading = false;

  constructor(options: JobModalOptions = {}) {
    super({
      title: options.job ? 'Edit Job' : 'Add New Job',
      size: 'large',
      ...options,
    });

    this.jobData = options.job || {};
  }

  renderContent(): HTMLElement {
    const form = createElement('form', {
      class: 'job-form',
      attrs: { id: 'jobForm' },
    });

    // Company field
    form.appendChild(this.createFormGroup('company', 'Company Name', 'text', this.jobData.company || ''));

    // Role field
    form.appendChild(this.createFormGroup('role', 'Job Title', 'text', this.jobData.role || ''));

    // Portal dropdown
    form.appendChild(this.createSelectGroup('portal', 'Job Portal', JOB_PORTALS as any, this.jobData.portal || ''));

    // Portal URL field
    form.appendChild(this.createFormGroup('portalUrl', 'Job URL', 'url', this.jobData.portalUrl || ''));

    // Status field
    form.appendChild(
      this.createSelectGroup(
        'status',
        'Status',
        ['Applied', 'Screening', 'Interview', 'Offer', 'Rejected', 'Saved'],
        this.jobData.status || 'Applied'
      )
    );

    // HR Name
    form.appendChild(this.createFormGroup('hrName', 'HR Contact Name', 'text', this.jobData.hrName || ''));

    // HR Email
    form.appendChild(this.createFormGroup('hrEmail', 'HR Email', 'email', this.jobData.hrEmail || ''));

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
        placeholder: 'Any notes about this job...',
      },
      text: this.jobData.notes || '',
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
      text: 'Save Job',
      attrs: { type: 'submit', id: 'saveJobBtn' },
    });
    buttonGroup.appendChild(saveBtn);
    form.appendChild(buttonGroup);

    // Handle form submission
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

    const input = createElement('input', {
      class: 'form-input',
      attrs: {
        type,
        id: name,
        name,
        value,
        required: name === 'company' || name === 'role' ? 'true' : 'false',
        placeholder: label,
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
      if ((this.options as JobModalOptions).onSave) {
        await (this.options as JobModalOptions).onSave!(data);
      }

      this.emit('job:saved', data);
      this.close();
    } catch (error) {
      this.emit('error:occurred', {
        message: error instanceof Error ? error.message : 'Failed to save job',
        severity: 'error',
      });
    } finally {
      this.isLoading = false;
    }
  }
}

export default JobModal;
