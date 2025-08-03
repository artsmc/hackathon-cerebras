INSERT INTO Policy (company_name, source_url, terms_text, raw_response)
VALUES (
  'Facebook / Meta Platforms, Inc.',
  'https://www.facebook.com/legal/terms',
  replace(readfile('terms_escaped.txt'), char(10), char(13)||char(10)),
  '{"methodology":"Automated analysis using AI SDK","timestamp":"2025-08-03T03:01:55.615Z","version":"1.0"}'
)
RETURNING id AS policy_id;
