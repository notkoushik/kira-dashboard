/**
 * Jobs Tab Component
 * Display and manage job applications with filtering and searching
 */

import Component from '../Component';
import { createElement } from '../../utils/dom';
import { stateManager } from '../../services/state';
import { searchJobs, sortJobs } from '../../utils/data';
import { formatDate } from '../../utils/format';
import { statusColor, statusEmoji } from '../../utils/color';

export class JobsTab extends Component {
  private searchTerm = '';
  private selectedJobs: Set<string> = new Set();

  render(): HTMLElement {
    const container = createElement('div', {
      class: 'tab-panel',
      attrs: { id: 'jobsPanel' },
    });

    // Toolbar
    container.appendChild(this.renderToolbar());

    // Jobs Table
    container.appendChild(this.renderTable());

    return container;
  }

  private renderToolbar(): HTMLElement {
    const toolbar = createElement('div', {
      class: 'p-4 border-bottom flex-between',
    });

    // Search
    const searchGroup = createElement('div', {
      class: 'flex-gap-2',
    });

    const searchInput = createElement('input', {
      class: 'form-input',
      attrs: {
        type: 'text',
        placeholder: 'Search jobs...',
        id: 'jobSearch',
      },
    });

    searchInput.addEventListener('input', (e) => {
      this.searchTerm = (e.target as HTMLInputElement).value;
      this.update();
    });

    searchGroup.appendChild(searchInput);
    toolbar.appendChild(searchGroup);

    // Add button
    const addBtn = createElement('button', {
      class: 'btn btn-primary',
      text: '+ Add Job',
      attrs: { id: 'addJobBtn' },
    });

    addBtn.addEventListener('click', () => {
      this.emit('job:add');
    });

    toolbar.appendChild(addBtn);

    return toolbar;
  }

  private renderTable(): HTMLElement {
    const state = stateManager.getState();
    const jobs = searchJobs(state.jobs, this.searchTerm);

    const container = createElement('div', {
      class: 'table-container p-4',
    });

    if (jobs.length === 0) {
      const empty = createElement('div', {
        class: 'text-center py-8 text-muted',
        text: 'No jobs found. Add one to get started!',
      });
      container.appendChild(empty);
      return container;
    }

    const table = createElement('table', {
      class: 'table',
    });

    // Header
    const thead = createElement('thead', {});
    const headerRow = createElement('tr', {});

    ['Company', 'Role', 'Portal', 'Status', 'Date', 'HR', 'Actions'].forEach(header => {
      const th = createElement('th', {
        text: header,
      });
      headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Body
    const tbody = createElement('tbody', {});
    jobs.slice(0, 20).forEach(job => {
      const row = createElement('tr', {});

      // Company
      const companyCell = createElement('td', {
        text: job.company,
      });
      row.appendChild(companyCell);

      // Role
      const roleCell = createElement('td', {
        text: job.role,
      });
      row.appendChild(roleCell);

      // Portal
      const portalCell = createElement('td', {
        text: job.portal || '-',
      });
      row.appendChild(portalCell);

      // Status
      const statusCell = createElement('td', {});
      const statusBadge = createElement('span', {
        class: 'badge badge-primary',
        text: job.status,
      });
      statusCell.appendChild(statusBadge);
      row.appendChild(statusCell);

      // Date
      const dateCell = createElement('td', {
        text: job.appliedDate ? formatDate(job.appliedDate) : '-',
      });
      row.appendChild(dateCell);

      // HR
      const hrCell = createElement('td', {
        text: job.hrName || '-',
      });
      row.appendChild(hrCell);

      // Actions
      const actionsCell = createElement('td', {
        class: 'flex-gap-1',
      });

      const editBtn = createElement('button', {
        class: 'btn btn-ghost btn-small',
        text: 'Edit',
        attrs: { 'data-job-id': job.id || '' },
      });
      editBtn.addEventListener('click', () => {
        this.emit('job:edit', { jobId: job.id });
      });
      actionsCell.appendChild(editBtn);

      const deleteBtn = createElement('button', {
        class: 'btn btn-ghost btn-small text-danger',
        text: 'Delete',
        attrs: { 'data-job-id': job.id || '' },
      });
      deleteBtn.addEventListener('click', () => {
        this.emit('job:delete', { jobId: job.id });
      });
      actionsCell.appendChild(deleteBtn);

      row.appendChild(actionsCell);
      tbody.appendChild(row);
    });

    table.appendChild(tbody);
    container.appendChild(table);

    return container;
  }
}

export default JobsTab;
