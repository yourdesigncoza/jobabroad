-- Cache the LLM-generated "what's working" + "what's blocking" narratives on
-- the assessment row. Computed by /score page server component on first load;
-- read directly on every subsequent visit. Since a submitted assessment's
-- answers are immutable, the narrative is too — until the user resubmits, at
-- which point the wizard should null this column.
--
-- Shape: { whatsWorking: string, whatsBlocking: string, generatedAt: iso }

alter table assessments
  add column cached_narratives jsonb;
