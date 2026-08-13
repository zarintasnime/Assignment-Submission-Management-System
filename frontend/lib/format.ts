import type { AssignmentStatus, SubmissionStatus } from './types';

export function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export function timeRemaining(deadline: string): {
  label: string;
  tone: 'safe' | 'soon' | 'late';
  percent: number;
} {
  const end = new Date(deadline).getTime();
  const now = Date.now();
  const diff = end - now;

  if (diff <= 0) {
    return { label: 'Deadline passed', tone: 'late', percent: 100 };
  }

  const hours = Math.ceil(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);

  if (hours <= 24) {
    return {
      label: `${hours} hour${hours === 1 ? '' : 's'} remaining`,
      tone: 'soon',
      percent: Math.max(72, 100 - Math.min(hours, 24)),
    };
  }

  return {
    label: `${days} day${days === 1 ? '' : 's'} remaining`,
    tone: 'safe',
    percent: Math.min(68, Math.max(18, 70 - days * 3)),
  };
}

export function assignmentTone(status: AssignmentStatus): string {
  return status.toLowerCase();
}

export function submissionTone(status: SubmissionStatus): string {
  return status.toLowerCase();
}
