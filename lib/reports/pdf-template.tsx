import {
  Document,
  Font,
  Link,
  Page,
  StyleSheet,
  Text,
  View,
} from '@react-pdf/renderer';
import path from 'node:path';
import type { ReportData } from './types';
import { BAND_COPY } from '@/lib/scoring/bands';

const FONTS_DIR = path.join(process.cwd(), 'public', 'fonts');

Font.register({
  family: 'DM Sans',
  fonts: [
    { src: path.join(FONTS_DIR, 'DMSans-Regular.ttf'), fontWeight: 'normal' },
    { src: path.join(FONTS_DIR, 'DMSans-Bold.ttf'), fontWeight: 'bold' },
  ],
});

// react-pdf + DM Sans drops the 'i' in lowercase "fi"/"fl" ligature pairs
// (Specifcally, suffcient, profciency, certifcate, offcial...). Insert a
// zero-width non-joiner between the f and following i/l to break the GSUB
// ligature substitution.
const ZWNJ = '‌';
function lig(s: string | undefined | null): string {
  if (!s) return '';
  return s.replace(/fi/g, `f${ZWNJ}i`).replace(/fl/g, `f${ZWNJ}l`);
}

const COLOURS = {
  bg: '#F8F5F0',
  ink: '#2C2C2C',
  muted: '#6B6B6B',
  green: '#1B4D3E',
  gold: '#C9A84C',
  orange: '#ff751f',
  red: '#B53A2B',
  rule: '#EDE8E0',
};

const styles = StyleSheet.create({
  page: {
    fontFamily: 'DM Sans',
    fontSize: 10,
    color: COLOURS.ink,
    padding: 40,
    lineHeight: 1.45,
  },
  kicker: {
    fontSize: 8,
    color: COLOURS.gold,
    letterSpacing: 2,
    textTransform: 'uppercase',
    fontWeight: 'bold',
  },
  h1: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLOURS.ink,
    marginTop: 4,
    marginBottom: 28,
  },
  h2: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLOURS.ink,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 18,
    marginBottom: 8,
  },
  bandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  bandTagline: {
    fontSize: 10,
    color: COLOURS.muted,
    marginBottom: 8,
  },
  bandPill: {
    fontSize: 9,
    fontWeight: 'bold',
    paddingTop: 3,
    paddingBottom: 3,
    paddingLeft: 8,
    paddingRight: 8,
    borderRadius: 6,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  scoreLine: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLOURS.ink,
    marginBottom: 14,
  },
  scoreNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ff751f',
  },
  meta: {
    fontSize: 9,
    color: COLOURS.muted,
    marginBottom: 4,
  },
  focusBox: {
    backgroundColor: '#EDE8E0',
    borderRadius: 6,
    paddingTop: 8,
    paddingBottom: 8,
    paddingLeft: 12,
    paddingRight: 12,
    marginBottom: 12,
  },
  focusRow: {
    fontSize: 9,
    color: COLOURS.ink,
    marginBottom: 2,
  },
  focusLabel: {
    fontWeight: 'bold',
    color: COLOURS.green,
  },
  gateBox: {
    backgroundColor: '#FBEEEC',
    borderLeftWidth: 3,
    borderLeftColor: COLOURS.red,
    borderRadius: 6,
    paddingTop: 8,
    paddingBottom: 8,
    paddingLeft: 12,
    paddingRight: 12,
    marginBottom: 12,
  },
  gateLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    color: COLOURS.red,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  gateBullet: {
    fontSize: 9,
    color: COLOURS.ink,
    marginTop: 3,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: COLOURS.rule,
    marginVertical: 14,
  },
  dimRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  dimLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLOURS.ink,
  },
  dimScore: {
    fontSize: 10,
    color: COLOURS.muted,
  },
  dimBarTrack: {
    height: 4,
    backgroundColor: COLOURS.rule,
    borderRadius: 2,
    marginBottom: 10,
  },
  dimBarFill: {
    height: 4,
    borderRadius: 2,
  },
  para: {
    fontSize: 10,
    color: COLOURS.ink,
    marginBottom: 6,
  },
  actionTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLOURS.ink,
    marginTop: 6,
  },
  actionBody: {
    fontSize: 10,
    color: COLOURS.ink,
  },
  contactHeading: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLOURS.green,
    marginTop: 6,
  },
  contactExcerpt: {
    fontSize: 9,
    color: COLOURS.ink,
  },
  contactLink: {
    fontSize: 9,
    color: COLOURS.green,
    textDecoration: 'underline',
    marginTop: 2,
  },
  redFlagBullet: {
    fontSize: 10,
    color: COLOURS.ink,
    marginTop: 4,
    marginLeft: 2,
  },
  partnerCard: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: COLOURS.orange,
    borderRadius: 6,
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 12,
    paddingRight: 12,
    marginBottom: 8,
  },
  partnerBadgeRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  partnerBadge: {
    fontSize: 7,
    fontWeight: 'bold',
    color: '#FFFFFF',
    backgroundColor: COLOURS.orange,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    // lineHeight: 1 collapses the page's inherited 1.45 leading so the
    // all-caps glyphs sit on the badge's vertical centre. Asymmetric
    // padding nudges them down to compensate for DM Sans Bold's high
    // cap-height (no descenders in "TRUSTED PARTNER").
    lineHeight: 1,
    paddingTop: 3,
    paddingBottom: 5,
    paddingLeft: 9,
    paddingRight: 9,
    borderRadius: 10,
  },
  partnerName: {
    fontSize: 11,
    fontWeight: 'bold',
    color: COLOURS.ink,
  },
  partnerSubline: {
    fontSize: 9,
    color: COLOURS.muted,
    marginBottom: 4,
  },
  partnerBullet: {
    fontSize: 9,
    color: COLOURS.ink,
    marginTop: 2,
  },
  partnerNotes: {
    fontSize: 9,
    color: COLOURS.ink,
    marginTop: 4,
  },
  partnerLink: {
    fontSize: 9,
    color: COLOURS.orange,
    textDecoration: 'underline',
    marginTop: 4,
  },
  disclaimer: {
    fontSize: 8,
    color: COLOURS.muted,
    marginTop: 18,
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 40,
    right: 40,
    fontSize: 8,
    color: COLOURS.muted,
    textAlign: 'center',
  },
});

// Label + tagline come from the shared BAND_COPY (single source of truth with
// the dashboard summary); only the PDF-specific colours live here.
const BAND_PRESETS: Record<
  ReportData['score']['band'],
  { label: string; tagline: string; colour: string; bg: string }
> = {
  high_blockers: { ...BAND_COPY.high_blockers, colour: '#FFFFFF', bg: COLOURS.red },
  needs_prep: { ...BAND_COPY.needs_prep, colour: COLOURS.ink, bg: COLOURS.gold },
  strong_potential: { ...BAND_COPY.strong_potential, colour: '#FFFFFF', bg: COLOURS.green },
};

function dimBarColour(score: number): string {
  if (score < 40) return COLOURS.red;
  if (score < 70) return COLOURS.gold;
  return COLOURS.green;
}

// Section heading that won't be left stranded at the bottom of a page —
// minPresenceAhead reserves space below it, so a heading near a page break is
// pushed to the next page to stay with the content that follows.
function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <Text style={styles.h2} minPresenceAhead={72}>
      {children}
    </Text>
  );
}

export function ReportTemplate({ data }: { data: ReportData }) {
  const preset = BAND_PRESETS[data.score.band];

  return (
    <Document
      title={`Jobabroad — ${data.categoryLabel} report for ${data.userName}`}
      author="Jobabroad"
    >
      <Page size="A4" style={styles.page}>
        {/* Cover */}
        <Text style={styles.kicker}>
          {lig(data.categoryLabel)} — Eligibility report
        </Text>
        <Text style={styles.h1}>{lig(data.userName)}</Text>

        <View style={styles.bandRow}>
          <Text
            style={[styles.bandPill, { color: preset.colour, backgroundColor: preset.bg }]}
          >
            {lig(preset.label)}
          </Text>
        </View>
        <Text style={styles.bandTagline}>{lig(preset.tagline)}</Text>

        <Text style={styles.scoreLine}>
          <Text style={styles.scoreNumber}>{data.score.overall}</Text>
          {' / 100'}
        </Text>

        {/* Critical gates — absolute requirements that capped the band below
            what the weighted number alone would suggest. Mirrors the on-screen
            /score notice so the PDF and page tell the same story. */}
        {data.score.applied_caps && data.score.applied_caps.length > 0 && (
          <View style={styles.gateBox}>
            <Text style={styles.gateLabel}>
              {data.score.applied_caps.length === 1
                ? 'A critical gate to clear first'
                : 'Critical gates to clear first'}
            </Text>
            {data.score.applied_caps.map((cap) => (
              <Text key={cap.field_id} style={styles.gateBullet}>
                • {lig(cap.reason)}
              </Text>
            ))}
          </View>
        )}

        {/* "Your focus" — echoes the buyer's stated goal (target destinations +
            specialism) back to them so the report reads as their plan, not a
            generic handout. Rendered only when the assessment captured either. */}
        {data.focus && (data.focus.destinations.length > 0 || data.focus.specialisms.length > 0) && (
          <View style={styles.focusBox}>
            {data.focus.destinations.length > 0 && (
              <Text style={styles.focusRow}>
                <Text style={styles.focusLabel}>Targeting: </Text>
                {lig(data.focus.destinations.join(', '))}
              </Text>
            )}
            {data.focus.specialisms.length > 0 && (
              <Text style={styles.focusRow}>
                <Text style={styles.focusLabel}>Specialism: </Text>
                {lig(data.focus.specialisms.join(', '))}
              </Text>
            )}
          </View>
        )}

        <Text style={styles.meta}>Generated {data.generatedAt}</Text>

        <View style={styles.divider} />

        {/* Score Breakdown */}
        <SectionHeading>Your score breakdown</SectionHeading>
        {data.score.dimensions.map((d) => (
          <View key={d.key}>
            <View style={styles.dimRow}>
              <Text style={styles.dimLabel}>{lig(d.label)}</Text>
              <Text style={styles.dimScore}>
                {d.score} / 100 · weight {Math.round(d.weight * 100)}%
              </Text>
            </View>
            <View style={styles.dimBarTrack}>
              <View
                style={[
                  styles.dimBarFill,
                  { width: `${d.score}%`, backgroundColor: dimBarColour(d.score) },
                ]}
              />
            </View>
          </View>
        ))}

        {/* What's working — heading + summary kept on one page. */}
        <View wrap={false}>
          <SectionHeading>What&apos;s working</SectionHeading>
          <Text style={styles.para}>{lig(data.whatsWorking)}</Text>
        </View>

        {/* What's blocking — heading + summary kept on one page. */}
        <View wrap={false}>
          <SectionHeading>What&apos;s blocking you</SectionHeading>
          <Text style={styles.para}>{lig(data.whatsBlocking)}</Text>
        </View>

        {/* Next actions */}
        <SectionHeading>Recommended next actions</SectionHeading>
        {data.nextActions.map((a, i) => (
          <View key={i} wrap={false}>
            <Text style={styles.actionTitle}>
              {i + 1}. {lig(a.title)}
            </Text>
            <Text style={styles.actionBody}>{lig(a.body)}</Text>
          </View>
        ))}

        {/* Red flags — category-specific scam patterns from red-flags.ts so
            buyers see them inside the deliverable without bouncing to
            /scam-warnings. Skipped silently when the category has no flags. */}
        {data.redFlags.length > 0 && (
          <View wrap={false}>
            <SectionHeading>Red flags to avoid</SectionHeading>
            {data.redFlags.map((flag, i) => (
              <Text key={i} style={styles.redFlagBullet}>• {lig(flag)}</Text>
            ))}
          </View>
        )}

        {/* Contacts & Resources */}
        {data.contacts.length > 0 && (
          <>
            <SectionHeading>Helpful sections in your guide</SectionHeading>
            {data.contacts.map((c, i) => (
              <View key={i} wrap={false}>
                <Text style={styles.contactHeading}>{lig(c.heading)}</Text>
                <Text style={styles.contactExcerpt}>{lig(c.excerpt)}</Text>
                <Link src={c.url} style={styles.contactLink}>
                  Read the full section in your guide →
                </Link>
              </View>
            ))}
          </>
        )}

        {/* Trusted partners — vetted recruiters/service providers matched to the
            buyer's category + target destinations via getTrustedPartnersForBuyer. */}
        {data.partners && data.partners.length > 0 && (
          <>
            <SectionHeading>Recommended partners</SectionHeading>
            {data.partners.map((p, i) => (
              <View key={i} style={styles.partnerCard} wrap={false}>
                <View style={styles.partnerBadgeRow}>
                  <Text style={styles.partnerBadge}>Trusted partner</Text>
                </View>
                <Text style={styles.partnerName}>{lig(p.name)}</Text>
                <Text style={styles.partnerSubline}>{lig(p.subline)}</Text>
                {p.bullets?.map((b, bi) => (
                  <Text key={bi} style={styles.partnerBullet}>• {lig(b)}</Text>
                ))}
                <Text style={styles.partnerNotes}>{lig(p.notes)}</Text>
                {p.url && (
                  <Link src={p.url} style={styles.partnerLink}>
                    Visit {lig(p.url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, ''))} →
                  </Link>
                )}
              </View>
            ))}
          </>
        )}

        {/* Disclaimer */}
        <Text style={styles.disclaimer}>
          {lig(
            "Jobabroad is an information service. We don't place candidates, act as recruiters or guarantee employment. Always verify with the relevant professional body and official sources (regulators, embassies) before paying anyone or signing contracts.",
          )}
        </Text>

        <Text
          style={styles.footer}
          render={({ pageNumber, totalPages }) =>
            lig(`Jobabroad · ${data.categoryLabel} · page ${pageNumber} of ${totalPages}`)
          }
          fixed
        />
      </Page>
    </Document>
  );
}
