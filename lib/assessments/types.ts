export type FieldType =
  | 'text'
  | 'number'
  | 'date'
  | 'select'
  | 'multiselect'
  | 'boolean';

export interface FieldDef {
  id: string;
  version: number;
  label: string;
  type: FieldType;
  options?: string[];
  placeholder?: string;
  hint?: string;
  optional?: boolean;
  showIf?: { field: string; value: string | boolean };
}

export interface StepDef {
  slug: string;
  title: string;
  supportHint?: string;
  fields: FieldDef[];
}

export const SCHEMA_VERSION = 1;
