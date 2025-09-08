-- ===========================================
-- STAGING DATABASE SETUP SCRIPT
-- Run this in Supabase SQL Editor for your staging project
-- ===========================================

-- Create loans table
CREATE TABLE IF NOT EXISTS loans (
    id SERIAL PRIMARY KEY,
    borrower_id VARCHAR(50) NOT NULL,
    borrower VARCHAR(255) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    interest DECIMAL(5,2) NOT NULL,
    weeks INTEGER NOT NULL,
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    loan_id INTEGER NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
    week INTEGER NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_loan_week UNIQUE (loan_id, week)
);

-- Create loans_with_details view
CREATE OR REPLACE VIEW loans_with_details AS
SELECT
    l.*,
    COALESCE(p.paid_weeks, 0) as paid_weeks,
    (l.weeks - COALESCE(p.paid_weeks, 0)) as remaining_weeks,
    COALESCE(p.total_paid, 0) as total_paid,
    CASE
        WHEN COALESCE(p.paid_weeks, 0) >= l.weeks THEN 'Completed'
        ELSE 'In Progress'
    END as status
FROM loans l
LEFT JOIN (
    SELECT
        loan_id,
        COUNT(*) as paid_weeks,
        SUM(amount) as total_paid
    FROM payments
    GROUP BY loan_id
) p ON l.id = p.loan_id;

-- Create payments_with_details view
CREATE OR REPLACE VIEW payments_with_details AS
SELECT
    p.*,
    l.borrower_id,
    l.borrower,
    l.amount as loan_amount,
    l.interest,
    l.weeks as loan_weeks,
    (l.amount * (1 + l.interest/100) / l.weeks) as weekly_installment
FROM payments p
JOIN loans l ON p.loan_id = l.id;

-- Create loan_payment_summary view
CREATE OR REPLACE VIEW loan_payment_summary AS
SELECT
    l.id as loan_id,
    l.borrower_id,
    l.borrower,
    l.amount as loan_amount,
    l.interest,
    l.weeks as total_weeks,
    COALESCE(p.paid_weeks, 0) as paid_weeks,
    (l.weeks - COALESCE(p.paid_weeks, 0)) as remaining_weeks,
    COALESCE(p.total_paid, 0) as total_paid,
    (l.amount * (1 + l.interest/100) / l.weeks) as weekly_installment,
    CASE
        WHEN COALESCE(p.paid_weeks, 0) >= l.weeks THEN 'Completed'
        ELSE 'In Progress'
    END as status
FROM loans l
LEFT JOIN (
    SELECT
        loan_id,
        COUNT(*) as paid_weeks,
        SUM(amount) as total_paid
    FROM payments
    GROUP BY loan_id
) p ON l.id = p.loan_id;

-- ===========================================
-- ADD SAMPLE DATA
-- ===========================================

-- Insert sample loans
INSERT INTO loans (borrower_id, borrower, amount, interest, weeks, start_date) VALUES
('DEMO001', 'John Smith (Demo)', 50000.00, 5.0, 10, '2024-08-01'),
('DEMO002', 'Sarah Johnson (Demo)', 25000.00, 4.5, 8, '2024-08-10'),
('DEMO003', 'Mike Wilson (Demo)', 75000.00, 6.0, 12, '2024-08-20');

-- Insert sample payments
INSERT INTO payments (loan_id, week, amount, payment_date) VALUES
(1, 1, 5250.00, '2024-08-08'),
(1, 2, 5250.00, '2024-08-15'),
(1, 3, 5250.00, '2024-08-22'),
(2, 1, 3281.25, '2024-08-17'),
(2, 2, 3281.25, '2024-08-24'),
(3, 1, 6500.00, '2024-08-27'),
(3, 2, 6500.00, '2024-09-03'),
(3, 3, 6500.00, '2024-09-10');

-- ===========================================
-- VERIFICATION QUERIES
-- ===========================================

-- Check loans
SELECT * FROM loans;

-- Check payments
SELECT * FROM payments;

-- Check views
SELECT * FROM loans_with_details;
SELECT * FROM payments_with_details;
SELECT * FROM loan_payment_summary;