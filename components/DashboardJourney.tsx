'use client';

import { useState } from 'react';
import JourneyTracker, { type JourneyState } from './JourneyTracker';

/**
 * Dashboard wrapper around JourneyTracker. Holds the journey state locally so a
 * status change (which POSTs to /api/agent/journey) reflects immediately without
 * a full page reload. Moved here from the assistant chat page — the checklist
 * now lives on every full-access user's dashboard.
 */
export default function DashboardJourney({ initial }: { initial: JourneyState }) {
  const [journey, setJourney] = useState<JourneyState>(initial);
  return <JourneyTracker milestones={journey.milestones} onJourney={setJourney} />;
}
