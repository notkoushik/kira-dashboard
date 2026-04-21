/**
 * Top Navigation Component
 * Main navigation bar with tab switching
 */

import Component from './Component';
import { TABS } from '../config/constants';
import { createElement, query } from '../utils/dom';

export interface TopNavOptions {
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
}

export class TopNav extends Component {
  private options: TopNavOptions;

  constructor(options: TopNavOptions = {}) {
    super();
    this.options = options;
    this.state = {
      activeTab: options.activeTab || TABS.COMMAND,
    };
  }

  render(): HTMLElement {
    const nav = createElement('nav', {
      class: 'top-nav',
      attrs: { id: 'topNav' },
    });

    // Logo
    const logo = createElement('div', {
      class: 'top-nav__logo',
      attrs: { id: 'logo' },
      html: '🚀 KIRA',
    });
    nav.appendChild(logo);

    // Tabs
    const tabs = [
      { id: TABS.COMMAND, label: 'Command', icon: '📊' },
      { id: TABS.PLANNER, label: 'Planner', icon: '📋' },
      { id: TABS.JOBS, label: 'Jobs', icon: '💼' },
      { id: TABS.QUEUE, label: 'Queue', icon: '📮' },
      { id: TABS.HR, label: 'HR', icon: '👥' },
      { id: TABS.INBOX, label: 'Inbox', icon: '📩' },
      { id: TABS.ANALYTICS, label: 'Analytics', icon: '📈' },
      { id: TABS.SETTINGS, label: 'Settings', icon: '⚙️' },
    ];

    tabs.forEach(tab => {
      const button = createElement('button', {
        class: [
          'tab-btn',
          this.state.activeTab === tab.id && 'tab-btn--active',
        ],
        attrs: {
          'data-tab': tab.id,
          title: tab.label,
        },
        text: `${tab.icon} ${tab.label}`,
      });

      button.addEventListener('click', () => this.selectTab(tab.id));
      nav.appendChild(button);
    });

    // Right section (user info, logout)
    const rightSection = createElement('div', {
      class: 'top-nav__right ml-auto flex-gap-2',
    });

    const userInfo = createElement('span', {
      class: 'text-sm text-muted',
      text: 'Koushik',
      attrs: { id: 'userInfo' },
    });
    rightSection.appendChild(userInfo);

    const logoutBtn = createElement('button', {
      class: 'btn btn-ghost btn-small',
      text: 'Logout',
      attrs: { id: 'logoutBtn' },
    });
    logoutBtn.addEventListener('click', () => this.handleLogout());
    rightSection.appendChild(logoutBtn);

    nav.appendChild(rightSection);

    return nav;
  }

  private selectTab(tabId: string): void {
    this.state.activeTab = tabId;
    this.update();

    if (this.options.onTabChange) {
      this.options.onTabChange(tabId);
    }

    this.emit('nav:tabChange', { tabId });
  }

  private handleLogout(): void {
    if (confirm('Are you sure you want to logout?')) {
      this.emit('nav:logout');
    }
  }

  setActiveTab(tabId: string): void {
    this.state.activeTab = tabId;
    this.update();
  }

  getActiveTab(): string {
    return this.state.activeTab;
  }

  protected onMount(): void {
    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey || e.metaKey) {
        const tabMap: Record<string, string> = {
          '1': TABS.COMMAND,
          '2': TABS.PLANNER,
          '3': TABS.JOBS,
          '4': TABS.QUEUE,
          '5': TABS.HR,
          '6': TABS.INBOX,
          '7': TABS.ANALYTICS,
          '8': TABS.SETTINGS,
        };

        if (tabMap[e.key]) {
          e.preventDefault();
          this.selectTab(tabMap[e.key]);
        }
      }
    });
  }
}

export default TopNav;
