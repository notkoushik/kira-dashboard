/**
 * Placeholder Tab Components
 * Quick stubs for remaining tabs (to be fully implemented in next phase)
 */

import Component from '../Component';
import { createElement } from '../../utils/dom';

export class PlannerTab extends Component {
  render(): HTMLElement {
    return createElement('div', {
      class: 'tab-panel p-6',
      attrs: { id: 'plannerPanel' },
      html: '<h2 class="text-2xl font-bold mb-4">📋 Daily Planner</h2><p class="text-muted">Planner tasks coming soon...</p>',
    });
  }
}

export class QueueTab extends Component {
  render(): HTMLElement {
    return createElement('div', {
      class: 'tab-panel p-6',
      attrs: { id: 'queuePanel' },
      html: '<h2 class="text-2xl font-bold mb-4">📮 Apply Queue</h2><p class="text-muted">Queue management coming soon...</p>',
    });
  }
}

export class HRTab extends Component {
  render(): HTMLElement {
    return createElement('div', {
      class: 'tab-panel p-6',
      attrs: { id: 'hrPanel' },
      html: '<h2 class="text-2xl font-bold mb-4">👥 HR Contacts</h2><p class="text-muted">HR contact management coming soon...</p>',
    });
  }
}

export class InboxTab extends Component {
  render(): HTMLElement {
    return createElement('div', {
      class: 'tab-panel p-6',
      attrs: { id: 'inboxPanel' },
      html: '<h2 class="text-2xl font-bold mb-4">📩 Inbox (BETA)</h2><p class="text-muted">Email tracking coming soon...</p>',
    });
  }
}

export class AnalyticsTab extends Component {
  render(): HTMLElement {
    return createElement('div', {
      class: 'tab-panel p-6',
      attrs: { id: 'analyticsPanel' },
      html: '<h2 class="text-2xl font-bold mb-4">📈 Analytics</h2><p class="text-muted">Charts and analytics coming soon...</p>',
    });
  }
}

export class SettingsTab extends Component {
  render(): HTMLElement {
    return createElement('div', {
      class: 'tab-panel p-6',
      attrs: { id: 'settingsPanel' },
      html: '<h2 class="text-2xl font-bold mb-4">⚙️ Settings</h2><p class="text-muted">Settings panel coming soon...</p>',
    });
  }
}

export default {
  PlannerTab,
  QueueTab,
  HRTab,
  InboxTab,
  AnalyticsTab,
  SettingsTab,
};
