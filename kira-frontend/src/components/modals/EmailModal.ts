/**
 * Email Modal Component
 * Modal for composing and sending emails to HR contacts
 */

import Modal, { ModalOptions } from './Modal';
import { createElement } from '../../utils/dom';
import { emailService } from '../../services/email';

export interface EmailModalOptions extends ModalOptions {
  hrName?: string;
  hrEmail?: string;
  companyName?: string;
  templateType?: 'outreach' | 'followup' | 'interview' | 'thankyou' | 'custom';
  onSend?: (emailData: any) => Promise<void>;
}

export class EmailModal extends Modal {
  private isLoading = false;

  constructor(options: EmailModalOptions = {}) {
    super({
      title: 'Compose Email',
      size: 'large',
      ...options,
    });
  }

  renderContent(): HTMLElement {
    const form = createElement('form', {
      class: 'email-form',
      attrs: { id: 'emailForm' },
    });

    const opts = this.options as EmailModalOptions;

    // To field
    if (opts.hrEmail) {
      form.appendChild(
        this.createDisabledField('to', 'To', opts.hrEmail)
      );
    } else {
      form.appendChild(this.createFormGroup('to', 'To (Email)', 'email'));
    }

    // Template selection
    if (!opts.templateType || opts.templateType === 'custom') {
      form.appendChild(
        this.createSelectGroup('template', 'Template', [
          'Blank',
          'Outreach',
          'Follow-up',
          'Interview Confirmation',
          'Thank You',
        ])
      );
    }

    // Subject field
    const defaultSubject = opts.hrName && opts.companyName
      ? emailService.generateOutreachSubject(opts.companyName)
      : '';

    form.appendChild(
      this.createFormGroup('subject', 'Subject *', 'text', defaultSubject)
    );

    // Body textarea
    const defaultBody = opts.hrName && opts.companyName
      ? emailService.generateOutreachBody(opts.hrName, opts.companyName, '').body
      : '';

    const bodyGroup = createElement('div', {
      class: 'form-group',
    });

    const bodyLabel = createElement('label', {
      class: 'form-label',
      text: 'Message *',
      attrs: { for: 'body' },
    });
    bodyGroup.appendChild(bodyLabel);

    const bodyTextarea = createElement('textarea', {
      class: 'form-textarea',
      attrs: {
        id: 'body',
        name: 'body',
        placeholder: 'Email message...',
        required: 'true',
        rows: '10',
      },
      text: defaultBody,
    });
    bodyGroup.appendChild(bodyTextarea);
    form.appendChild(bodyGroup);

    // Preview button
    const previewBtn = createElement('button', {
      class: 'btn btn-ghost btn-small',
      text: 'Preview',
      attrs: { type: 'button' },
    });

    previewBtn.addEventListener('click', (e) => {
      e.preventDefault();
      this.showPreview();
    });
    form.appendChild(previewBtn);

    // Buttons
    const buttonGroup = createElement('div', {
      class: 'modal-footer',
    });

    const saveDraftBtn = createElement('button', {
      class: 'btn btn-ghost',
      text: 'Save Draft',
      attrs: { type: 'button' },
    });

    saveDraftBtn.addEventListener('click', (e) => {
      e.preventDefault();
      this.handleSaveDraft();
    });
    buttonGroup.appendChild(saveDraftBtn);

    const cancelBtn = createElement('button', {
      class: 'btn btn-ghost',
      text: 'Cancel',
      attrs: { type: 'button' },
    });
    cancelBtn.addEventListener('click', () => this.close());
    buttonGroup.appendChild(cancelBtn);

    const sendBtn = createElement('button', {
      class: 'btn btn-primary',
      text: 'Send Email',
      attrs: { type: 'submit' },
    });
    buttonGroup.appendChild(sendBtn);
    form.appendChild(buttonGroup);

    form.addEventListener('submit', (e) => this.handleSend(e, form));

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

  private createDisabledField(name: string, label: string, value: string): HTMLElement {
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
        type: 'email',
        id: name,
        name,
        value,
        disabled: 'true',
      },
    });
    group.appendChild(input);

    return group;
  }

  private createSelectGroup(name: string, label: string, options: string[]): HTMLElement {
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
      attrs: { id: name, name },
    });

    options.forEach(option => {
      const optEl = createElement('option', {
        attrs: { value: option },
        text: option,
      });
      select.appendChild(optEl);
    });

    group.appendChild(select);
    return group;
  }

  private showPreview(): void {
    const subject = (document.getElementById('subject') as HTMLInputElement)?.value || '';
    const body = (document.getElementById('body') as HTMLTextAreaElement)?.value || '';

    alert(`Subject: ${subject}\n\n${body}`);
  }

  private async handleSaveDraft(): Promise<void> {
    this.emit('email:draft-saved');
  }

  private async handleSend(e: SubmitEvent, form: HTMLFormElement): Promise<void> {
    e.preventDefault();

    if (this.isLoading) return;

    const formData = new FormData(form);
    const data = Object.fromEntries(formData);

    this.isLoading = true;

    try {
      if ((this.options as EmailModalOptions).onSend) {
        await (this.options as EmailModalOptions).onSend!(data);
      }

      this.emit('email:sent', data);
      this.close();
    } catch (error) {
      this.emit('error:occurred', {
        message: error instanceof Error ? error.message : 'Failed to send email',
        severity: 'error',
      });
    } finally {
      this.isLoading = false;
    }
  }
}

export default EmailModal;
