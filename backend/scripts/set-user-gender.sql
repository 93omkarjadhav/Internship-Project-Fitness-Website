-- Script to manually set user gender for testing
-- This should be run in your MySQL database

-- Check current user genders
SELECT id, email, full_name, gender FROM users;

-- Update specific user gender to Male (replace email with your test user email)
UPDATE users 
SET gender = 'Male' 
WHERE email = 'your-male-test-user@example.com';

-- Update specific user gender to Female
UPDATE users 
SET gender = 'Female' 
WHERE email = 'your-female-test-user@example.com';

-- Verify the change
SELECT id, email, full_name, gender FROM users;


