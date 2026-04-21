/**
 * Components Index
 * Centralized exports for all components
 */

// Base classes
export { Component } from './Component';
export type { ComponentState } from './Component';

// Navigation
export { TopNav } from './TopNav';
export type { TopNavOptions } from './TopNav';

// Notifications
export { Toast, ToastManager, getToastManager } from './Toast';
export type { ToastType, ToastOptions } from './Toast';

// Modals
export { Modal } from './modals/Modal';
export { JobModal } from './modals/JobModal';
export { HRModal } from './modals/HRModal';
export { QueueModal } from './modals/QueueModal';
export { ConfirmModal } from './modals/ConfirmModal';
export { EmailModal } from './modals/EmailModal';

// Tabs
export { CommandTab } from './tabs/CommandTab';
export { JobsTab } from './tabs/JobsTab';
export { PlannerTab, QueueTab, HRTab, InboxTab, AnalyticsTab, SettingsTab } from './tabs/TabsPlaceholder';

export default {
  // Base
  Component: () => import('./Component').then(m => m.Component),

  // Navigation
  TopNav: () => import('./TopNav').then(m => m.TopNav),

  // Notifications
  Toast: () => import('./Toast').then(m => m.Toast),
  ToastManager: () => import('./Toast').then(m => m.ToastManager),

  // Modals
  Modal: () => import('./modals/Modal').then(m => m.Modal),
  JobModal: () => import('./modals/JobModal').then(m => m.JobModal),
  HRModal: () => import('./modals/HRModal').then(m => m.HRModal),
  QueueModal: () => import('./modals/QueueModal').then(m => m.QueueModal),
  ConfirmModal: () => import('./modals/ConfirmModal').then(m => m.ConfirmModal),
  EmailModal: () => import('./modals/EmailModal').then(m => m.EmailModal),

  // Tabs
  CommandTab: () => import('./tabs/CommandTab').then(m => m.CommandTab),
  JobsTab: () => import('./tabs/JobsTab').then(m => m.JobsTab),
  PlannerTab: () => import('./tabs/TabsPlaceholder').then(m => m.PlannerTab),
  QueueTab: () => import('./tabs/TabsPlaceholder').then(m => m.QueueTab),
  HRTab: () => import('./tabs/TabsPlaceholder').then(m => m.HRTab),
  InboxTab: () => import('./tabs/TabsPlaceholder').then(m => m.InboxTab),
  AnalyticsTab: () => import('./tabs/TabsPlaceholder').then(m => m.AnalyticsTab),
  SettingsTab: () => import('./tabs/TabsPlaceholder').then(m => m.SettingsTab),
};
