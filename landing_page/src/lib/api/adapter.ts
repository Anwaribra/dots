/**
 * IDotsPlatformAdapter defines the contract for interacting with the Dots platform.
 * Decouples all presentation components from backend transport and persistence.
 */

import { ScheduleDay } from '../../domain/schedule';
import { AdaptationProposal } from '../../domain/proposals';
import { WaitlistResult } from '../../domain/waitlist';

export interface IDotsPlatformAdapter {
  /**
   * Fetches the current schedule for the active execution day.
   */
  getCurrentSchedule(): Promise<ScheduleDay>;

  /**
   * Requests a dynamic adaptation proposal when an urgent task or disruption occurs.
   * Does NOT alter the active plan until approved.
   */
  requestAdaptation(taskTitle: string, durationMinutes: number): Promise<AdaptationProposal>;

  /**
   * Explicitly approves a proposed adaptation, locking the new schedule into the active plan.
   */
  approveProposal(proposalId: string): Promise<ScheduleDay>;

  /**
   * Resets the schedule back to the baseline balanced plan.
   */
  resetSchedule(): Promise<ScheduleDay>;

  /**
   * Submits an email for waitlist early access.
   */
  submitWaitlist(email: string): Promise<WaitlistResult>;
}
