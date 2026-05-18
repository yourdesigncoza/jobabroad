import type { ScoreResult } from '@/lib/scoring/types';

export interface ReportData {
  userName: string;
  categoryLabel: string;
  generatedAt: string;
  score: ScoreResult;
  whatsWorking: string;
  whatsBlocking: string;
  nextActions: Array<{ title: string; body: string }>;
  contacts: Array<{
    heading: string;
    excerpt: string;
    /** Deep-link to the section in the buyer's pathway guide. */
    url: string;
  }>;
  /**
   * Admin's post-call notes — captured on /admin/post-call and persisted on
   * paid_reports.call_notes. Optional: undefined when the report is generated
   * before the call (rare, manual override).
   */
  callNotes?: string;
  /**
   * Trusted partner recruiters/agencies sourced via getTrustedPartnersForBuyer()
   * — paid retainers, vetted by John, surfaced only in the R495 deliverable.
   * Empty when no trusted partner matches the buyer's category + destinations.
   */
  partners?: Array<{
    name: string;
    /** "Type · destination 1, destination 2" — single subline below the name. */
    subline: string;
    notes: string;
    /** Optional 1-3 short value bullets from the trusted-partners overlay. */
    bullets?: string[];
    /** Optional clickable site URL. */
    url?: string;
  }>;
}
