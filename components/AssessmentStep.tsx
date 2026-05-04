'use client';

import type { StepDef, FieldDef } from '@/lib/assessments/steps/healthcare';

interface Props {
  step: StepDef;
  values: Record<string, unknown>;
  onChange: (fieldId: string, value: unknown) => void;
  whatsappNumber: string;
}

const inputClass = 'w-full font-body text-sm rounded-xl px-4 py-3 outline-none transition-colors';
const inputStyle = { backgroundColor: '#F8F5F0', border: '1.5px solid #EDE8E0', color: '#2C2C2C' };
const labelStyle = { color: '#2C2C2C' };
const hintStyle = { color: '#6B6B6B' };

function Field({ field, value, onChange }: { field: FieldDef; value: unknown; onChange: (v: unknown) => void }) {
  if (field.type === 'text' || field.type === 'number') {
    return (
      <input
        type={field.type === 'number' ? 'number' : 'text'}
        placeholder={field.placeholder}
        value={(value as string) ?? ''}
        onChange={(e) => onChange(field.type === 'number' ? Number(e.target.value) : e.target.value)}
        className={inputClass}
        style={inputStyle}
      />
    );
  }

  if (field.type === 'date') {
    return (
      <input
        type="date"
        value={(value as string) ?? ''}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
        style={inputStyle}
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
                border: `1.5px solid ${active ? '#1B4D3E' : '#EDE8E0'}`,
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
                border: `1.5px solid ${active ? '#1B4D3E' : '#EDE8E0'}`,
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
                border: `1.5px solid ${active ? '#1B4D3E' : '#EDE8E0'}`,
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

export default function AssessmentStep({ step, values, onChange, whatsappNumber }: Props) {
  const waLink = step.supportHint
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(step.supportHint + ' Can you help?')}`
    : null;

  return (
    <div className="flex flex-col gap-6">
      {step.fields.map((field) => {
        if (field.showIf) {
          const depValue = values[field.showIf.field];
          if (depValue !== field.showIf.value) return null;
        }
        return (
          <div key={field.id} className="flex flex-col gap-2">
            <label className="font-body text-sm font-semibold" style={labelStyle}>
              {field.label}
              {field.optional && <span className="font-normal ml-1" style={hintStyle}>(optional)</span>}
            </label>
            {field.hint && <p className="font-body text-xs" style={hintStyle}>{field.hint}</p>}
            <Field field={field} value={values[field.id]} onChange={(v) => onChange(field.id, v)} />
          </div>
        );
      })}
      {waLink && (
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="font-body text-xs underline self-start"
          style={{ color: '#1B4D3E' }}
        >
          {step.supportHint} WhatsApp us.
        </a>
      )}
    </div>
  );
}
