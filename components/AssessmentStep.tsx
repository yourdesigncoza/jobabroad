'use client';

import type { StepDef, FieldDef } from '@/lib/assessments/types';
import { isFieldVisible } from '@/lib/assessments/field-utils';

interface Props {
  step: StepDef;
  values: Record<string, unknown>;
  onChange: (fieldId: string, value: unknown) => void;
  /** Field IDs flagged as required-but-empty on the last advance attempt. */
  errors: string[];
}

/** Fields prefilled from the user's registration — shown locked, not editable. */
const LOCKED_FIELD_IDS = new Set(['personal.full_name']);

const inputClass = 'w-full font-body text-sm rounded-xl px-4 py-3 outline-none transition-colors';
const labelStyle = { color: '#2C2C2C' };
const hintStyle = { color: '#6B6B6B' };
const errorColour = '#dc2626';

function inputStyle(invalid: boolean, readOnly: boolean) {
  return {
    backgroundColor: readOnly ? '#EDE8E0' : '#F8F5F0',
    border: `1.5px solid ${invalid ? errorColour : '#EDE8E0'}`,
    color: readOnly ? '#6B6B6B' : '#2C2C2C',
  };
}

function Field({
  field,
  value,
  onChange,
  invalid,
  readOnly,
}: {
  field: FieldDef;
  value: unknown;
  onChange: (v: unknown) => void;
  invalid: boolean;
  readOnly: boolean;
}) {
  if (field.type === 'text' || field.type === 'number') {
    return (
      <input
        type={field.type === 'number' ? 'number' : 'text'}
        placeholder={field.placeholder}
        value={(value as string) ?? ''}
        readOnly={readOnly}
        aria-readonly={readOnly || undefined}
        onChange={(e) => {
          if (field.type === 'number') {
            onChange(e.target.value === '' ? undefined : Number(e.target.value));
          } else {
            onChange(e.target.value);
          }
        }}
        className={`${inputClass}${readOnly ? ' cursor-not-allowed' : ''}`}
        style={inputStyle(invalid, readOnly)}
      />
    );
  }

  if (field.type === 'textarea') {
    const text = (value as string) ?? '';
    return (
      <div className="flex flex-col gap-1">
        <textarea
          placeholder={field.placeholder}
          value={text}
          rows={5}
          maxLength={field.maxLength}
          onChange={(e) => onChange(e.target.value)}
          className={`${inputClass} resize-y`}
          style={inputStyle(invalid, false)}
        />
        {field.maxLength && (
          <span className="font-body text-xs self-end" style={hintStyle}>
            {text.length}/{field.maxLength}
          </span>
        )}
      </div>
    );
  }

  if (field.type === 'date') {
    return (
      <input
        type="date"
        value={(value as string) ?? ''}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
        style={inputStyle(invalid, false)}
      />
    );
  }

  if (field.type === 'boolean') {
    return (
      <div className="flex gap-3">
        {['Yes', 'No'].map((opt) => {
          const boolVal = opt === 'Yes';
          const active = value === boolVal;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(boolVal)}
              className="flex-1 font-body text-sm rounded-xl px-4 py-3 transition-colors"
              style={{
                backgroundColor: active ? '#1B4D3E' : '#F8F5F0',
                color: active ? '#F8F5F0' : '#2C2C2C',
                border: `1.5px solid ${active ? '#1B4D3E' : invalid ? errorColour : '#EDE8E0'}`,
              }}
            >
              {opt}
            </button>
          );
        })}
      </div>
    );
  }

  if (field.type === 'select') {
    return (
      <div className="flex flex-col gap-2">
        {field.options!.map((opt) => {
          const active = value === opt;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(opt)}
              className="w-full text-left font-body text-sm rounded-xl px-4 py-3 transition-colors"
              style={{
                backgroundColor: active ? '#1B4D3E' : '#F8F5F0',
                color: active ? '#F8F5F0' : '#2C2C2C',
                border: `1.5px solid ${active ? '#1B4D3E' : invalid ? errorColour : '#EDE8E0'}`,
              }}
            >
              {opt}
            </button>
          );
        })}
      </div>
    );
  }

  if (field.type === 'multiselect') {
    const selected = (value as string[]) ?? [];
    return (
      <div className="flex flex-wrap gap-2">
        {field.options!.map((opt) => {
          const active = selected.includes(opt);
          return (
            <button
              key={opt}
              type="button"
              onClick={() => {
                const next = active ? selected.filter((s) => s !== opt) : [...selected, opt];
                onChange(next);
              }}
              className="font-body text-sm rounded-xl px-4 py-2 transition-colors"
              style={{
                backgroundColor: active ? '#1B4D3E' : '#F8F5F0',
                color: active ? '#F8F5F0' : '#2C2C2C',
                border: `1.5px solid ${active ? '#1B4D3E' : invalid ? errorColour : '#EDE8E0'}`,
              }}
            >
              {opt}
            </button>
          );
        })}
      </div>
    );
  }

  return null;
}

export default function AssessmentStep({ step, values, onChange, errors }: Props) {
  return (
    <div className="flex flex-col gap-6">
      {step.fields.map((field) => {
        if (!isFieldVisible(field, values)) return null;

        const invalid = errors.includes(field.id);
        const locked = LOCKED_FIELD_IDS.has(field.id);

        return (
          <div key={field.id} id={`field-${field.id}`} className="flex flex-col gap-2 scroll-mt-24">
            <label className="font-body text-sm font-semibold" style={labelStyle}>
              {field.label}
              {field.optional && <span className="font-normal ml-1" style={hintStyle}>(optional)</span>}
            </label>
            {field.hint && <p className="font-body text-xs" style={hintStyle}>{field.hint}</p>}
            {locked && (
              <p className="font-body text-xs" style={hintStyle}>
                From your registration — contact us if this needs to change.
              </p>
            )}
            <Field
              field={field}
              value={values[field.id]}
              onChange={(v) => onChange(field.id, v)}
              invalid={invalid}
              readOnly={locked}
            />
            {invalid && (
              <p className="font-body text-xs" style={{ color: errorColour }}>
                Please answer this before continuing.
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
