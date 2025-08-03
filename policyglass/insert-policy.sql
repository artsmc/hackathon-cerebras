INSERT INTO Policy (company_name, source_url, terms_text, raw_response)
VALUES (
  'Facebook / Meta Platforms, Inc.',
  'https://www.facebook.com/legal/terms',
  replace(readfile('terms_escaped.txt'), char(10), char(13)||char(10)),
  readfile('raw_response.json')
)
RETURNING id AS policy_id;
