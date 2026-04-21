/**
 * Command Tab Component
 * Main dashboard with KPIs, greetings, and quick stats
 */

import Component from '../Component';
import { createElement } from '../../utils/dom';
import { stateManager } from '../../services/state';
import { formatDate } from '../../utils/format';

export class CommandTab extends Component {
  render(): HTMLElement {
    const container = createElement('div', {
      class: 'tab-panel',
      attrs: { id: 'commandPanel' },
    });

    // Greeting section
    container.appendChild(this.renderGreeting());

    // KPIs Grid
    container.appendChild(this.renderKPIs());

    // Work Log section
    container.appendChild(this.renderWorkLog());

    return container;
  }

  private renderGreeting(): HTMLElement {
    const now = new Date();
    const hour = now.getHours();
    let greeting = 'Good morning';

    if (hour >= 12 && hour < 18) greeting = 'Good afternoon';
    else if (hour >= 18) greeting = 'Good evening';

    const section = createElement('div', {
      class: 'greeting-section p-6',
    });

    const title = createElement('h2', {
      class: 'text-2xl font-bold',
      text: `${greeting}, Koushik! 👋`,
    });
    section.appendChild(title);

    const date = createElement('p', {
      class: 'text-muted mt-2',
      text: formatDate(now.toISOString(), 'long'),
    });
    section.appendChild(date);

    return section;
  }

  private renderKPIs(): HTMLElement {
    const state = stateManager.getState();
    const section = createElement('div', {
      class: 'p-6',
    });

    const title = createElement('h3', {
      class: 'text-lg font-semibold mb-4',
      text: 'Today\'s Stats',
    });
    section.appendChild(title);

    const kpiGrid = createElement('div', {
      class: 'grid grid-4',
    });

    const kpis = [
      { label: 'Applications', value: state.jobs.length, icon: '📨' },
      { label: 'HR Contacts', value: state.hrContacts.length, icon: '👥' },
      { label: 'In Queue', value: state.queue.length, icon: '📮' },
      { label: 'Logs', value: state.logs.length, icon: '📝' },
    ];

    kpis.forEach(kpi => {
      const card = createElement('div', {
        class: 'card p-4 text-center',
      });

      const icon = createElement('div', {
        class: 'text-3xl mb-2',
        text: kpi.icon,
      });
      card.appendChild(icon);

      const value = createElement('div', {
        class: 'text-2xl font-bold mb-1',
        text: kpi.value.toString(),
      });
      card.appendChild(value);

      const label = createElement('div', {
        class: 'text-sm text-muted',
        text: kpi.label,
      });
      card.appendChild(label);

      kpiGrid.appendChild(card);
    });

    section.appendChild(kpiGrid);
    return section;
  }

  private renderWorkLog(): HTMLElement {
    const section = createElement('div', {
      class: 'p-6',
    });

    const title = createElement('h3', {
      class: 'text-lg font-semibold mb-4',
      text: 'Work Log',
    });
    section.appendChild(title);

    const form = createElement('div', {
      class: 'form-group',
    });

    const textarea = createElement('textarea', {
      class: 'form-textarea',
      attrs: {
        id: 'workLog',
        name: 'workLog',
        placeholder: 'What did you accomplish today?',
        rows: '4',
      },
    });
    form.appendChild(textarea);

    const button = createElement('button', {
      class: 'btn btn-primary mt-2',
      text: 'Save Log',
      attrs: { type: 'button' },
    });

    button.addEventListener('click', () => {
      const content = (textarea as HTMLTextAreaElement).value;
      if (content.trim()) {
        this.emit('log:save', { content });
      }
    });

    form.appendChild(button);
    section.appendChild(form);

    return section;
  }
}

export default CommandTab;
