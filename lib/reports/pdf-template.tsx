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
  callNotesBlock: {
    backgroundColor: '#FFF8E8',
    borderLeftWidth: 3,
    borderLeftColor: COLOURS.gold,
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 12,
    paddingRight: 12,
    marginBottom: 8,
  },
  callNotesPara: {
    fontSize: 10,
    color: COLOURS.ink,
    marginBottom: 6,
  },
  partnerName: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLOURS.green,
    marginTop: 8,
  },
  partnerSubline: {
    fontSize: 9,
    color: COLOURS.muted,
    marginBottom: 2,
  },
  partnerNotes: {
    fontSize: 9,
    color: COLOURS.ink,
  },
  partnerLink: {
    fontSize: 9,
    color: COLOURS.green,
    textDecoration: 'underline',
    marginTop: 2,
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

const BAND_PRESETS: Record<
  ReportData['score']['band'],
  { label: string; tagline: string; colour: string; bg: string }
> = {
  high_blockers: {
    label: 'High blockers',
    tagline: 'Significant gaps to close before applying.',
    colour: '#FFFFFF',
    bg: COLOURS.red,
  },
  needs_prep: {
    label: 'Needs prep',
    tagline: 'Real potential, with clear gaps to address.',
    colour: COLOURS.ink,
    bg: COLOURS.gold,
  },
  strong_potential: {
    label: 'Strong potential',
    tagline: "You're application-ready in most respects.",
    colour: '#FFFFFF',
    bg: COLOURS.green,
  },
};

function dimBarColour(score: number): string {
  if (score < 40) return COLOURS.red;
  if (score < 70) return COLOURS.gold;
  return COLOURS.green;
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

        <Text style={styles.meta}>Generated {data.generatedAt}</Text>

        <View style={styles.divider} />

        {/* Score Breakdown */}
        <Text style={styles.h2}>Your score breakdown</Text>
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

        {/* What's working */}
        <Text style={styles.h2}>What&apos;s working</Text>
        <Text style={styles.para}>{lig(data.whatsWorking)}</Text>

        {/* What's blocking */}
        <Text style={styles.h2}>What&apos;s blocking you</Text>
        <Text style={styles.para}>{lig(data.whatsBlocking)}</Text>

        {/* From your review call — admin-captured notes from the 15-min call.
            Preserve paragraph breaks: react-pdf doesn't honour \n inside a
            single Text, so split on blank lines and render each block. */}
        {data.callNotes && data.callNotes.trim() && (
          <>
            <Text style={styles.h2}>From your review call</Text>
            <View style={styles.callNotesBlock}>
              {data.callNotes
                .trim()
                .split(/\n\s*\n/)
                .map((para, i, arr) => (
                  <Text
                    key={i}
                    style={
                      i === arr.length - 1
                        ? [styles.callNotesPara, { marginBottom: 0 }]
                        : styles.callNotesPara
                    }
                  >
                    {lig(para.replace(/\n/g, ' '))}
                  </Text>
                ))}
            </View>
          </>
        )}

        {/* Next actions */}
        <Text style={styles.h2}>Recommended next actions</Text>
        {data.nextActions.map((a, i) => (
          <View key={i}>
            <Text style={styles.actionTitle}>
              {i + 1}. {lig(a.title)}
            </Text>
            <Text style={styles.actionBody}>{lig(a.body)}</Text>
          </View>
        ))}

        {/* Contacts & Resources */}
        {data.contacts.length > 0 && (
          <>
            <Text style={styles.h2}>Helpful sections in your guide</Text>
            {data.contacts.map((c, i) => (
              <View key={i}>
                <Text style={styles.contactHeading}>{lig(c.heading)}</Text>
                <Text style={styles.contactExcerpt}>{lig(c.excerpt)}</Text>
                <Link src={c.url} style={styles.contactLink}>
                  Read the full section in your guide →
                </Link>
              </View>
            ))}
          </>
        )}

        {/* Recommended partners — premium-only vetted recruiters for this category. */}
        {data.partners && data.partners.length > 0 && (
          <>
            <Text style={styles.h2}>Recommended partners</Text>
            {data.partners.map((p, i) => (
              <View key={i}>
                <Text style={styles.partnerName}>{lig(p.name)}</Text>
                <Text style={styles.partnerSubline}>{lig(p.subline)}</Text>
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
            "Jobabroad is an information service. We don't place candidates, act as recruiters or guarantee employment. Always verify with official sources (SACE, NMC, AHPRA, embassies) before paying anyone or signing contracts.",
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
