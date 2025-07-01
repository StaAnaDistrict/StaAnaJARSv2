-- Migration: Add published_in and published_on columns to researches table
-- Date: 2025-01-XX
-- Description: Add columns to store auto-generated "Published In" and "Published On" text

ALTER TABLE researches 
ADD COLUMN published_in TEXT NULL COMMENT 'Auto-generated text: "Category Action Research. Completed in Month of Year."',
ADD COLUMN published_on TEXT NULL COMMENT 'Auto-generated text: "Category Action Research Sta. Ana JARS Journal Issue X, Date"';

-- Update existing records with auto-generated values
UPDATE researches r
JOIN action_research_types art ON r.action_research_type_id = art.type_id
SET 
  r.published_in = CONCAT(art.type_name, ' Action Research. Completed in ', r.completion_month, ' of ', r.completion_year, '.'),
  r.published_on = CONCAT(art.type_name, ' Action Research Sta. Ana JARS Journal Issue ', r.journal_issue_number, ', ', DATE_FORMAT(r.online_publication_date, '%M %d, %Y'))
WHERE r.completion_month IS NOT NULL 
  AND r.completion_year IS NOT NULL 
  AND r.journal_issue_number IS NOT NULL 
  AND r.online_publication_date IS NOT NULL; 