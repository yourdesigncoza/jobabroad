## Table `assessments`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `category` | `text` |  |
| `schema_version` | `int4` |  |
| `completed_step_slugs` | `_text` |  |
| `status` | `text` |  |
| `data` | `jsonb` |  |
| `submitted_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  |
| `user_id` | `uuid` |  |
| `score_email_sent_at` | `timestamptz` |  Nullable |
| `cached_narratives` | `jsonb` |  Nullable |

## Table `bookings`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `user_id` | `uuid` |  |
| `slot_at` | `timestamptz` |  Nullable |
| `consented_at` | `timestamptz` |  |
| `external_ref` | `text` |  Nullable |
| `created_at` | `timestamptz` |  |

## Table `demo_rate_limits`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `ip_hash` | `text` | Primary |
| `day` | `date` | Primary |
| `search_count` | `int4` |  |
| `wiki_count` | `int4` |  |

## Table `paid_reports`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `user_id` | `uuid` | Primary |
| `pdf_path` | `text` |  Nullable |
| `generated_at` | `timestamptz` |  |
| `call_notes` | `text` |  Nullable |
| `generation_status` | `text` |  |
| `generation_error` | `text` |  Nullable |
| `generation_attempts` | `int4` |  |
| `generation_started_at` | `timestamptz` |  Nullable |
| `generation_completed_at` | `timestamptz` |  Nullable |

## Table `pathway_chunks`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `int8` | Primary Identity |
| `category` | `text` |  |
| `source_type` | `text` |  |
| `source_path` | `text` |  |
| `heading` | `text` |  |
| `anchor` | `text` |  Nullable |
| `slug` | `text` |  Nullable |
| `content` | `text` |  |
| `embedding` | `vector` |  |
| `created_at` | `timestamptz` |  |

## Table `profiles`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `user_id` | `uuid` | Primary |
| `name` | `text` |  |
| `phone` | `text` |  Unique |
| `category` | `text` |  |
| `created_at` | `timestamptz` |  |
| `tier` | `text` |  |
| `paid_email_credits` | `int4` |  |
| `last_payment_ref` | `text` |  Nullable |
