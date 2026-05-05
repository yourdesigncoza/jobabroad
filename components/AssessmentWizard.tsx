'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { SCHEMA_VERSION } from '@/lib/assessments/types';
import { getStepsForCategory } from '@/lib/assessments/steps';
import AssessmentProgress from './AssessmentProgress';
import AssessmentStep from './AssessmentStep';
import AssessmentConfirmation from './AssessmentConfirmation';

interface Props {
  token: string;
  category: string;
  whatsappNumber: string;
  initialData: Record<string, unknown>;
  initialSlugs: string[];
  initialAssessmentId: string | null;
  initialStatus: 'draft' | 'submitted' | null;
  leadPhone: string;
}

function toPayload(fieldId: string, version: number, value: unknown) {
  return { q: `${fieldId}.v${version}`, v: value };
}

export default function AssessmentWizard({
  token, category, whatsappNumber,
  initialData, initialSlugs, initialAssessmentId,
  initialStatus, leadPhone,
}: Props) {
  const steps = useMemo(() => getStepsForCategory(category) ?? [], [category]);
  const hasSteps = steps.length > 0;

  const firstIncomplete = hasSteps ? steps.findIndex((s) => !initialSlugs.includes(s.slug)) : -1;
  const startIndex = initialStatus === 'submitted' ? 0 : (firstIncomplete === -1 ? 0 : firstIncomplete);

  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const [values, setValues] = useState<Record<string, unknown>>(() => {
    const out: Record<string, unknown> = {};
    Object.entries(initialData).forEach(([key, entry]) => {
      if (entry && typeof entry === 'object' && 'v' in entry) {
        out[key] = (entry as { v: unknown }).v;
      }
    });
    if (!out['personal.whatsapp_number'] && leadPhone) {
      out['personal.whatsapp_number'] = leadPhone;
    }
    return out;
  });
  const [assessmentId, setAssessmentId] = useState<string | null>(initialAssessmentId);
  const [completedSlugs, setCompletedSlugs] = useState<string[]>(initialSlugs);
  const [submitted, setSubmitted] = useState(initialStatus === 'submitted');
  const [submitting, setSubmitting] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentStep = hasSteps ? steps[currentIndex] : null;

  const saveStep = useCallback(async (slug: string, currentValues: Record<string, unknown>, assessId: string | null) => {
    const step = steps.find((s) => s.slug === slug);
    if (!step) return assessId;

    const stepData: Record<string, { q: string; v: unknown }> = {};
    step.fields.forEach((field) => {
      const val = currentValues[field.id];
      if (val !== undefined && val !== '') {
        stepData[field.id] = toPayload(field.id, field.version, val);
      }
    });

    const res = await fetch('/api/assessment/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, stepSlug: slug, stepData, schemaVersion: SCHEMA_VERSION }),
    });
    if (!res.ok) { setSaveError('Auto-save failed. Your progress may not be saved.'); return assessId; }
    setSaveError(null);
    const json = await res.json();
    return json.assessmentId as string;
  }, [token, steps]);

  useEffect(() => {
    if (!currentStep) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const newId = await saveStep(currentStep.slug, values, assessmentId);
      if (newId && newId !== assessmentId) setAssessmentId(newId);
    }, 500);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [values]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleChange(fieldId: string, value: unknown) {
    setValues((prev) => ({ ...prev, [fieldId]: value }));
  }

  async function handleNext() {
    if (!currentStep) return;
    const newId = await saveStep(currentStep.slug, values, assessmentId);
    if (newId) setAssessmentId(newId);
    const newSlugs = Array.from(new Set([...completedSlugs, currentStep.slug]));
    setCompletedSlugs(newSlugs);

    if (currentIndex < steps.length - 1) {
      setCurrentIndex((i) => i + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setSubmitting(true);
      await fetch('/api/assessment/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      setSubmitted(true);
      setSubmitting(false);
    }
  }

  function handleBack() {
    setCurrentIndex((i) => Math.max(0, i - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleStartNew() {
    setSubmitted(false);
    setCurrentIndex(0);
    setAssessmentId(null);
    setCompletedSlugs([]);
  }

  if (!hasSteps || !currentStep) {
    return (
      <p className="font-body text-sm" style={{ color: '#6B6B6B' }}>
        An eligibility assessment isn&apos;t available for this pathway yet. Reply to your WhatsApp thread and we&apos;ll work through the assessment with you directly.
      </p>
    );
  }

  if (submitted) {
    return <AssessmentConfirmation whatsappNumber={whatsappNumber} onStartNew={handleStartNew} />;
  }

  return (
    <div className="flex flex-col gap-8">
      <AssessmentProgress
        current={currentIndex + 1}
        total={steps.length}
        label={currentStep.title}
      />

      <AssessmentStep
        step={currentStep}
        values={values}
        onChange={handleChange}
        whatsappNumber={whatsappNumber}
      />

      {saveError && (
        <p className="font-body text-xs" style={{ color: '#dc2626' }}>{saveError}</p>
      )}

      <div className="flex gap-3">
        {currentIndex > 0 && (
          <button
            onClick={handleBack}
            className="flex-1 font-display font-bold uppercase text-xs tracking-wide rounded-xl px-4 py-3"
            style={{ backgroundColor: '#EDE8E0', color: '#2C2C2C' }}
          >
            Back
          </button>
        )}
        <button
          onClick={handleNext}
          disabled={submitting}
          className="flex-1 font-display font-bold uppercase text-xs tracking-wide rounded-xl px-4 py-3"
          style={{ backgroundColor: '#1B4D3E', color: '#F8F5F0' }}
        >
          {submitting ? 'Submitting...' : currentIndex === steps.length - 1 ? 'Submit Assessment' : 'Next'}
        </button>
      </div>
    </div>
  );
}
