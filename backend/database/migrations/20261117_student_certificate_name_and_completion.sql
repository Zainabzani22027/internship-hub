-- InternShipHub: internship completion and immutable certificate display name
-- Run once against the internship_hub PostgreSQL database.
ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS internship_completed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS internship_completed_by INTEGER REFERENCES users(id),
  ADD COLUMN IF NOT EXISTS certificate_full_name VARCHAR(160);

ALTER TABLE certificates
  ADD COLUMN IF NOT EXISTS certificate_full_name VARCHAR(160);

CREATE INDEX IF NOT EXISTS idx_applications_completion
  ON applications (student_id, internship_completed_at);
