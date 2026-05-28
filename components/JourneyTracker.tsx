'use client';

import { useState } from 'react';
import type { Milestone, MilestoneStatus } from '@/lib/agent/milestones';

const STATUS_LABEL: Record<MilestoneStatus, string> = {
  not_started: 'Not started',
  in_progress: 'In progress',
  done: 'Done',
};

const STATUS_COLOR: Record<MilestoneStatus, string> = {
  not_started: '#6B6B6B',
  in_progress: '#C9A84C',
  done: '#1B4D3E',
};

export interface JourneyState {
  category: string;
  milestones: Milestone[];
  nextMilestoneKey: string | null;
  incompleteCount: number;
  lastTopic: string | null;
}

export default function JourneyTracker({
  milestones,
  onJourney,
}: {
  milestones: Milestone[];
  onJourney: (j: JourneyState) => void;
}) {
  const [busy, setBusy] = useState<string | null>(null);

  async function setStatus(key: string, status: MilestoneStatus) {
    setBusy(key);
    try {
      const r = await fetch('/api/agent/journey', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ key, status }),
      });
      const j = (await r.json()) as { journey?: JourneyState };
      if (r.ok && j.journey) onJourney(j.journey);
    } catch {
      /* leave UI as-is on failure */
    } finally {
      setBusy(null);
    }
  }

  if (!milestones.length) return null;

  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-3"
      style={{ backgroundColor: '#FFFFFF', border: '1.5px solid #EDE8E0' }}
    >
      <div className="flex items-center gap-2">
        <div className="w-6 h-px" style={{ backgroundColor: '#ff751f' }} />
        <h3
          className="font-display font-bold uppercase tracking-wide text-sm"
          style={{ color: '#2C2C2C' }}
        >
          Your journey
        </h3>
      </div>
      <ul className="flex flex-col gap-2.5">
        {milestones.map((m) => (
          <li key={m.key} className="flex items-center gap-3">
            <span
              aria-hidden
              className="inline-block rounded-full"
              style={{ width: 9, height: 9, backgroundColor: STATUS_COLOR[m.status] }}
            />
            <span className="font-body text-sm flex-1" style={{ color: '#2C2C2C' }}>
              {m.label}
            </span>
            <select
              aria-label={`${m.label} status`}
              value={m.status}
              disabled={busy === m.key}
              onChange={(e) => setStatus(m.key, e.target.value as MilestoneStatus)}
              className="font-body text-xs rounded-md px-2 py-1 outline-none disabled:opacity-50"
              style={{ backgroundColor: '#F8F5F0', border: '1px solid #EDE8E0', color: '#2C2C2C' }}
            >
              {(Object.keys(STATUS_LABEL) as MilestoneStatus[]).map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABEL[s]}
                </option>
              ))}
            </select>
          </li>
        ))}
      </ul>
    </div>
  );
}
