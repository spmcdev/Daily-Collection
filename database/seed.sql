-- Sample data for testing the loan management system

-- Insert default admin user (password: admin123)
-- and sample user accounts (password: user123)
INSERT INTO users (username, password_hash, role, borrower_name) VALUES
('admin', '$2a$10$NYi1fPwxkPqToAmBVhUn/.hU8HpnaHpUbbTyle/jx9o/g/kMcIMZm', 'admin', 'System Administrator'),
('B001', '$2a$10$HjpwK5rdYc0glkO8Ocgxm.AywtmPBYq/er4TpsvSVNBd4GjIyecbS', 'user', 'John Smith'),
('B002', '$2a$10$HjpwK5rdYc0glkO8Ocgxm.AywtmPBYq/er4TpsvSVNBd4GjIyecbS', 'user', 'Jane Doe'),
('B003', '$2a$10$HjpwK5rdYc0glkO8Ocgxm.AywtmPBYq/er4TpsvSVNBd4GjIyecbS', 'user', 'Mike Johnson'),
('B004', '$2a$10$HjpwK5rdYc0glkO8Ocgxm.AywtmPBYq/er4TpsvSVNBd4GjIyecbS', 'user', 'Sarah Wilson'),
('B005', '$2a$10$HjpwK5rdYc0glkO8Ocgxm.AywtmPBYq/er4TpsvSVNBd4GjIyecbS', 'user', 'David Brown');

-- Insert sample loans
INSERT INTO loans (borrower_id, borrower, amount, interest, weeks, start_date) VALUES
('B001', 'John Smith', 100000.00, 10.0, 10, '2024-01-01'),
('B002', 'Jane Doe', 50000.00, 8.0, 8, '2024-01-08'),
('B003', 'Mike Johnson', 75000.00, 12.0, 12, '2024-01-15'),
('B004', 'Sarah Wilson', 120000.00, 9.0, 10, '2024-01-22'),
('B005', 'David Brown', 80000.00, 11.0, 8, '2024-02-01');

-- Insert sample payments
-- For loan 1 (John Smith) - 6 weeks paid out of 10
INSERT INTO payments (loan_id, week, amount, date) VALUES
(1, 1, 11000.00, '2024-01-08'),
(1, 2, 11000.00, '2024-01-15'),
(1, 3, 11000.00, '2024-01-22'),
(1, 4, 11000.00, '2024-01-29'),
(1, 5, 11000.00, '2024-02-05'),
(1, 6, 11000.00, '2024-02-12');

-- For loan 2 (Jane Doe) - fully paid (8 weeks)
INSERT INTO payments (loan_id, week, amount, date) VALUES
(2, 1, 6750.00, '2024-01-15'),
(2, 2, 6750.00, '2024-01-22'),
(2, 3, 6750.00, '2024-01-29'),
(2, 4, 6750.00, '2024-02-05'),
(2, 5, 6750.00, '2024-02-12'),
(2, 6, 6750.00, '2024-02-19'),
(2, 7, 6750.00, '2024-02-26'),
(2, 8, 6750.00, '2024-03-05');

-- For loan 3 (Mike Johnson) - 3 weeks paid out of 12
INSERT INTO payments (loan_id, week, amount, date) VALUES
(3, 1, 7000.00, '2024-01-22'),
(3, 2, 7000.00, '2024-01-29'),
(3, 3, 7000.00, '2024-02-05');

-- For loan 4 (Sarah Wilson) - 5 weeks paid out of 10
INSERT INTO payments (loan_id, week, amount, date) VALUES
(4, 1, 13080.00, '2024-01-29'),
(4, 2, 13080.00, '2024-02-05'),
(4, 3, 13080.00, '2024-02-12'),
(4, 4, 13080.00, '2024-02-19'),
(4, 5, 13080.00, '2024-02-26');

-- For loan 5 (David Brown) - 2 weeks paid out of 8
INSERT INTO payments (loan_id, week, amount, date) VALUES
(5, 1, 11100.00, '2024-02-08'),
(5, 2, 11100.00, '2024-02-15');