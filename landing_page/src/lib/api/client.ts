/**
 * Api Client Factory & Export
 * Returns the active Dots platform adapter based on configuration.
 */

import { IDotsPlatformAdapter } from './adapter';
import { FixtureDotsAdapter } from '../../fixtures/fixtureAdapter';
import { env } from '../config/env';

class HttpDotsAdapter implements IDotsPlatformAdapter {
  constructor(private baseUrl: string) {}

  async getCurrentSchedule() {
    const res = await fetch(`${this.baseUrl}/api/v1/schedule/current`);
    if (!res.ok) throw new Error('Failed to fetch schedule');
    return res.json();
  }

  async requestAdaptation(taskTitle: string, durationMinutes: number) {
    const res = await fetch(`${this.baseUrl}/api/v1/schedule/adapt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskTitle, durationMinutes }),
    });
    if (!res.ok) throw new Error('Failed to request adaptation');
    return res.json();
  }

  async approveProposal(proposalId: string) {
    const res = await fetch(`${this.baseUrl}/api/v1/schedule/proposals/${proposalId}/approve`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to approve proposal');
    return res.json();
  }

  async resetSchedule() {
    const res = await fetch(`${this.baseUrl}/api/v1/schedule/reset`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to reset schedule');
    return res.json();
  }

  async submitWaitlist(email: string) {
    const res = await fetch(`${this.baseUrl}/api/v1/waitlist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) throw new Error('Waitlist submission failed');
    return res.json();
  }
}

// Select active adapter
export const dotsAdapter: IDotsPlatformAdapter =
  env.apiUrl && !env.useFixtures
    ? new HttpDotsAdapter(env.apiUrl)
    : new FixtureDotsAdapter();
