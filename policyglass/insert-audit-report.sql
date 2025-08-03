INSERT INTO AuditReport (policy_id, total_score, letter_grade, overall_summary, raw_audit_json)
VALUES (
  8,
  63,
  'C',
  'Facebook terms show strong transparency over collected data and provide broad user controls, but lack appeal mechanisms for bans, impose liability limits, claim expansive content rights, and omit psychological or algorithmic disclosures.',
  readfile('raw_audit.json')
)
RETURNING id AS report_id;
