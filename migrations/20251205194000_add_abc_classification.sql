-- Add ABC classification to supplies
ALTER TABLE supplies 
ADD COLUMN abc_classification text DEFAULT 'A' CHECK (abc_classification IN ('A', 'B', 'C'));
