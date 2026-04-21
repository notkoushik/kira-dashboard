/**
 * Tabs Index
 * Centralized exports for all tab components
 */

export { CommandTab } from './CommandTab';
export { JobsTab } from './JobsTab';
export { PlannerTab, QueueTab, HRTab, InboxTab, AnalyticsTab, SettingsTab } from './TabsPlaceholder';

export default {
  CommandTab: () => import('./CommandTab').then(m => m.CommandTab),
  JobsTab: () => import('./JobsTab').then(m => m.JobsTab),
  PlannerTab: () => import('./TabsPlaceholder').then(m => m.PlannerTab),
  QueueTab: () => import('./TabsPlaceholder').then(m => m.QueueTab),
  HRTab: () => import('./TabsPlaceholder').then(m => m.HRTab),
  InboxTab: () => import('./TabsPlaceholder').then(m => m.InboxTab),
  AnalyticsTab: () => import('./TabsPlaceholder').then(m => m.AnalyticsTab),
  SettingsTab: () => import('./TabsPlaceholder').then(m => m.SettingsTab),
};
