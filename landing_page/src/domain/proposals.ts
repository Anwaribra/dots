/**
 * Domain types for Dots adaptation proposals and trade-off explanations.
 */

import { ScheduleItem } from './schedule';

export interface ProposedChange {
  id: string;
  type: 'inserted' | 'deferred' | 'shortened' | 'preserved';
  itemTitle: string;
  originalTime?: string;
  adjustedTime?: string;
  explanation: string;
}

export interface TradeOffExplanation {
  headline: string;
  summary: string;
  keyPoints: string[];
  protectedCount: number;
}

export interface AdaptationProposal {
  id: string;
  triggerReason: string;
  createdAt: string;
  status: 'pending_review' | 'approved' | 'rejected';
  proposedSchedule: ScheduleItem[];
  changes: ProposedChange[];
  explanation: TradeOffExplanation;
}
