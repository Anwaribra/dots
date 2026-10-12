/**
 * Domain types for waitlist early access submissions.
 */

export interface WaitlistSubmission {
  email: string;
  source?: string;
  timestamp: string;
}

export type WaitlistStatus =
  | 'idle'
  | 'validating'
  | 'submitting'
  | 'success'
  | 'error'
  | 'duplicate'
  | 'unavailable';

export interface WaitlistResult {
  status: WaitlistStatus;
  message: string;
  isPrototypeNotice?: boolean;
}
