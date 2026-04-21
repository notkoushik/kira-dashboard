/**
 * Modals Index
 * Centralized exports for all modal components
 */

export { Modal } from './Modal';
export type { ModalOptions } from './Modal';

export { JobModal } from './JobModal';
export type { JobModalOptions } from './JobModal';

export { HRModal } from './HRModal';
export type { HRModalOptions } from './HRModal';

export { QueueModal } from './QueueModal';
export type { QueueModalOptions } from './QueueModal';

export { ConfirmModal } from './ConfirmModal';
export type { ConfirmModalOptions } from './ConfirmModal';

export { EmailModal } from './EmailModal';
export type { EmailModalOptions } from './EmailModal';

export default {
  Modal: () => import('./Modal').then(m => m.Modal),
  JobModal: () => import('./JobModal').then(m => m.JobModal),
  HRModal: () => import('./HRModal').then(m => m.HRModal),
  QueueModal: () => import('./QueueModal').then(m => m.QueueModal),
  ConfirmModal: () => import('./ConfirmModal').then(m => m.ConfirmModal),
  EmailModal: () => import('./EmailModal').then(m => m.EmailModal),
};
