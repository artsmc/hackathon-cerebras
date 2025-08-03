INSERT INTO AuditReport (policy_id, total_score, letter_grade, overall_summary, raw_audit_json)
VALUES (
  9,
  63,
  'C',
  'Facebook terms show strong transparency over collected data and provide broad user controls, but lack appeal mechanisms for bans, impose liability limits, claim expansive content rights, and omit psychological or algorithmic disclosures.',
  '{"methodology":"Automated analysis using AI SDK","timestamp":"2025-08-03T03:01:55.615Z","version":"1.0"}'
)
RETURNING id AS report_id;
