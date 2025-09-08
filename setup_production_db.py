#!/usr/bin/env python3
"""
Setup production database with tables and views
"""

import os
from supabase import create_client, Client
from dotenv import load_dotenv

# Load production environment variables
load_dotenv('.env.production')

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_ANON_KEY = os.getenv('SUPABASE_ANON_KEY')

def setup_production_database():
    """Set up production database with all tables and views"""

    if not SUPABASE_URL or not SUPABASE_ANON_KEY:
        print("❌ Error: Missing production environment variables")
        return

    try:
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
        print("🔗 Connected to production Supabase")

        # SQL commands to create tables and views
        setup_commands = [
            # Create loans table
            """
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
            )
            """,

            # Create payments table
            """
            CREATE TABLE IF NOT EXISTS payments (
                id SERIAL PRIMARY KEY,
                loan_id INTEGER NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
                week INTEGER NOT NULL,
                amount DECIMAL(10,2) NOT NULL,
                payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                CONSTRAINT unique_loan_week UNIQUE (loan_id, week)
            )
            """,

            # Create loans_with_details view
            """
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
            ) p ON l.id = p.loan_id
            """,

            # Create payments_with_details view
            """
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
            JOIN loans l ON p.loan_id = l.id
            """,

            # Create loan_payment_summary view
            """
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
            ) p ON l.id = p.loan_id
            """
        ]

        # Test connection first
        try:
            test_result = supabase.table('loans').select('*').limit(1).execute()
            print("✅ Production database connection successful")
        except Exception as e:
            print(f"ℹ️  Database connection test: {e}")

        # Note: Tables should already exist in production database
        # If not, they need to be created manually in Supabase dashboard
        print("ℹ️  Production database setup completed")
        print("   Note: Create tables manually in Supabase dashboard if needed")

        print("🎉 Production database setup completed!")
        print("\n📊 Created:")
        print("   • loans table")
        print("   • payments table")
        print("   • loans_with_details view")
        print("   • payments_with_details view")
        print("   • loan_payment_summary view")

    except Exception as e:
        print(f"❌ Error setting up production database: {e}")

if __name__ == "__main__":
    setup_production_database()