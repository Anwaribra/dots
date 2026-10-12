/**
 * FixtureDotsAdapter — isolated development fixture adapter.
 * Provides coherent, deterministic domain data adhering strictly to IDotsPlatformAdapter.
 * Labeled explicitly as fixture data to separate from live production APIs.
 */

import { IDotsPlatformAdapter } from '../lib/api/adapter';
import { ScheduleDay, ScheduleItem } from '../domain/schedule';
import { AdaptationProposal } from '../domain/proposals';
import { WaitlistResult } from '../domain/waitlist';

export const BASELINE_SCHEDULE: ScheduleDay = {
  date: '2026-10-14',
  dayName: 'Tuesday, Oct 14',
  capacity: {
    totalHours: 9.0,
    availableHours: 7.5,
    protectedHours: 2.5,
    flexibleHours: 3.5,
    realityBufferHours: 1.5,
  },
  items: [
    {
      id: 'item-1-fixed',
      title: 'Client Review & Feedback Call',
      subtitle: 'Fixed calendar meeting (Non-negotiable)',
      startTime: '10:00',
      endTime: '11:30',
      durationMinutes: 90,
      status: 'protected',
      category: 'fixed',
      reason: 'Anchored external client commitment',
    },
    {
      id: 'item-2-research',
      title: 'User Interview Synthesis',
      subtitle: 'Flexible deep work block',
      startTime: '12:30',
      endTime: '14:30',
      durationMinutes: 120,
      status: 'flexible',
      category: 'focus',
      reason: 'Prioritized high-leverage focus task',
    },
    {
      id: 'item-3-admin',
      title: 'Weekly Admin & Email Triage',
      subtitle: 'Routine maintenance block (60m)',
      startTime: '15:00',
      endTime: '16:00',
      durationMinutes: 60,
      status: 'routine',
      category: 'routine',
      reason: 'Regular weekly inbox and operational upkeep',
    },
    {
      id: 'item-4-standup',
      title: 'Team Standup & Daily Wrap-up',
      subtitle: 'Fixed calendar commitment',
      startTime: '16:30',
      endTime: '17:00',
      durationMinutes: 30,
      status: 'protected',
      category: 'fixed',
      reason: 'End-of-day team alignment',
    },
  ],
  activeProposalCount: 0,
};

export class FixtureDotsAdapter implements IDotsPlatformAdapter {
  private currentSchedule: ScheduleDay = JSON.parse(JSON.stringify(BASELINE_SCHEDULE));
  private activeProposal: AdaptationProposal | null = null;

  async getCurrentSchedule(): Promise<ScheduleDay> {
    // Simulate brief network delay
    await new Promise((resolve) => setTimeout(resolve, 80));
    return JSON.parse(JSON.stringify(this.currentSchedule));
  }

  async requestAdaptation(taskTitle: string, durationMinutes: number): Promise<AdaptationProposal> {
    await new Promise((resolve) => setTimeout(resolve, 140));

    const proposedItems: ScheduleItem[] = [
      {
        id: 'item-1-fixed',
        title: 'Client Review & Feedback Call',
        subtitle: 'Fixed calendar meeting (Protected)',
        startTime: '10:00',
        endTime: '11:30',
        durationMinutes: 90,
        status: 'protected',
        category: 'fixed',
      },
      {
        id: 'item-urgent-deck',
        title: taskTitle || 'Urgent: Board Deck Revisions',
        subtitle: 'High-priority request (2h required today)',
        startTime: '12:30',
        endTime: '14:30',
        durationMinutes: durationMinutes || 120,
        status: 'proposed',
        category: 'urgent',
        isUrgent: true,
        reason: 'Accommodated in prime afternoon focus window',
      },
      {
        id: 'item-3-admin',
        title: 'Weekly Admin & Email Triage',
        subtitle: 'Adjusted focus window (Shortened to 30m)',
        startTime: '15:00',
        endTime: '15:30',
        durationMinutes: 30,
        status: 'proposed',
        category: 'routine',
        reason: 'Shortened from 60m to 30m to preserve evening commitments',
      },
      {
        id: 'item-2-research',
        title: 'User Interview Synthesis',
        subtitle: 'Deferred to tomorrow morning (09:30)',
        startTime: 'Tomorrow 09:30',
        endTime: 'Tomorrow 11:30',
        durationMinutes: 120,
        status: 'moved',
        category: 'focus',
        reason: 'Shifted to open morning window tomorrow',
      },
      {
        id: 'item-4-standup',
        title: 'Team Standup & Daily Wrap-up',
        subtitle: 'Fixed calendar commitment (Protected)',
        startTime: '16:30',
        endTime: '17:00',
        durationMinutes: 30,
        status: 'protected',
        category: 'fixed',
      },
    ];

    const proposal: AdaptationProposal = {
      id: 'prop-urgent-deck-01',
      triggerReason: `Incoming urgent request: ${taskTitle} (${durationMinutes}m)`,
      createdAt: new Date().toISOString(),
      status: 'pending_review',
      proposedSchedule: proposedItems,
      changes: [
        {
          id: 'ch-1',
          type: 'inserted',
          itemTitle: taskTitle || 'Urgent: Board Deck Revisions',
          adjustedTime: '12:30 – 14:30',
          explanation: 'Inserted into available afternoon focus window.',
        },
        {
          id: 'ch-2',
          type: 'deferred',
          itemTitle: 'User Interview Synthesis',
          originalTime: '12:30 – 14:30',
          adjustedTime: 'Tomorrow 09:30',
          explanation: 'Moved to first open focus block tomorrow to protect today’s capacity.',
        },
        {
          id: 'ch-3',
          type: 'shortened',
          itemTitle: 'Weekly Admin & Email Triage',
          originalTime: '60 minutes',
          adjustedTime: '30 minutes',
          explanation: 'Trimmed by 30m; remaining critical items handled.',
        },
        {
          id: 'ch-4',
          type: 'preserved',
          itemTitle: 'Client Review & Standup Meetings',
          explanation: 'All 2 fixed calendar commitments left strictly untouched.',
        },
      ],
      explanation: {
        headline: 'Urgent 2h request accommodated with zero meeting conflicts',
        summary:
          'Dots evaluated your afternoon flexibility. Fixed meetings remain untouched. Flexible interview synthesis shifted to tomorrow morning; admin trimmed by 30m.',
        keyPoints: [
          'Inserted: Urgent Board Deck Revisions (12:30–14:30).',
          'Deferred: User Interview Synthesis to Wednesday morning.',
          'Shortened: Admin session reduced from 60m to 30m.',
          'Protected: All fixed calendar commitments preserved.',
        ],
        protectedCount: 2,
      },
    };

    this.activeProposal = proposal;
    return proposal;
  }

  async approveProposal(proposalId: string): Promise<ScheduleDay> {
    await new Promise((resolve) => setTimeout(resolve, 100));

    if (this.activeProposal && this.activeProposal.id === proposalId) {
      // Apply proposed items into locked active items
      const updatedItems: ScheduleItem[] = this.activeProposal.proposedSchedule
        .filter((item) => item.status !== 'moved') // moved items deferred to tomorrow
        .map((item) => ({
          ...item,
          status: item.status === 'proposed' ? 'approved' : item.status,
        }));

      this.currentSchedule.items = updatedItems;
      this.currentSchedule.activeProposalCount = 0;
      this.activeProposal.status = 'approved';
    }

    return JSON.parse(JSON.stringify(this.currentSchedule));
  }

  async resetSchedule(): Promise<ScheduleDay> {
    await new Promise((resolve) => setTimeout(resolve, 60));
    this.currentSchedule = JSON.parse(JSON.stringify(BASELINE_SCHEDULE));
    this.activeProposal = null;
    return JSON.parse(JSON.stringify(this.currentSchedule));
  }

  async submitWaitlist(email: string): Promise<WaitlistResult> {
    await new Promise((resolve) => setTimeout(resolve, 350));

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return {
        status: 'error',
        message: 'Please enter a valid email address (e.g. name@domain.com).',
      };
    }

    // Truthful early access result (in accordance with Section 8: no fake backend claim)
    return {
      status: 'success',
      message:
        'Thank you for your interest in Dots. Your email format has been validated. Backend waitlist integration will activate during private beta onboarding.',
      isPrototypeNotice: true,
    };
  }
}
