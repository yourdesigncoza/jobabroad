import type { ScoreResult } from '@/lib/scoring/types';

export interface ReportData {
  userName: string;
  categoryLabel: string;
  generatedAt: string;
  /**
   * The buyer's stated goal, echoed back on the cover so the report reads as
   * "your plan for X" rather than generic advice. Omitted when the assessment
   * captured neither destinations nor specialisms.
   */
  focus?: {
    destinations: string[];
    specialisms: string[];
  };
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
   * Category-specific red flags surfaced from lib/reports/red-flags.ts. Empty
   * when the category has no curated flags (PDF skips the section).
   */
  redFlags: string[];
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
