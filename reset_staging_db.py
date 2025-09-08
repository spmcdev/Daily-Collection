#!/usr/bin/env python3
"""
Complete reset script for staging database
Drops all tables and recreates them from scratch
"""

import os
from supabase import create_client, Client
from dotenv import load_dotenv

# Load staging environment variables
load_dotenv('.env.staging')

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_ANON_KEY = os.getenv('SUPABASE_ANON_KEY')

def reset_staging_database():
    """Completely reset the staging database"""

    if not SUPABASE_URL or not SUPABASE_ANON_KEY:
        print("❌ Error: Missing staging environment variables")
        return

    try:
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
        print("🔗 Connected to staging Supabase")

        # Drop all existing tables and views
        drop_commands = [
            "DROP VIEW IF EXISTS loan_payment_summary CASCADE;",
            "DROP VIEW IF EXISTS payments_with_details CASCADE;",
            "DROP VIEW IF EXISTS loans_with_details CASCADE;",
            "DROP TABLE IF EXISTS payments CASCADE;",
            "DROP TABLE IF EXISTS loans CASCADE;",
        ]

        print("🗑️  Dropping existing tables and views...")
        for i, sql in enumerate(drop_commands, 1):
            try:
                result = supabase.rpc('exec_sql', {'sql': sql})
                print(f"✅ Drop command {i}/{len(drop_commands)} completed")
            except Exception as e:
                print(f"⚠️  Drop command {i} warning: {e}")

        # Recreate tables and views
        setup_commands = [
            # Create loans table
            """
            CREATE TABLE loans (
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
            """,

            # Create payments table
            """
            CREATE TABLE payments (
                id SERIAL PRIMARY KEY,
                loan_id INTEGER NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
                week INTEGER NOT NULL,
                amount DECIMAL(10,2) NOT NULL,
                payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                CONSTRAINT unique_loan_week UNIQUE (loan_id, week)
            );
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
            ) p ON l.id = p.loan_id;
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
            JOIN loans l ON p.loan_id = l.id;
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
            ) p ON l.id = p.loan_id;
            """
        ]

        print("🔨 Recreating tables and views...")
        for i, sql in enumerate(setup_commands, 1):
            try:
                result = supabase.rpc('exec_sql', {'sql': sql})
                print(f"✅ Setup command {i}/{len(setup_commands)} completed")
            except Exception as e:
                print(f"⚠️  Setup command {i} warning: {e}")

        print("🎉 Staging database reset completed!")
        print("\n📊 Database structure:")
        print("   • loans table")
        print("   • payments table")
        print("   • loans_with_details view")
        print("   • payments_with_details view")
        print("   • loan_payment_summary view")

    except Exception as e:
        print(f"❌ Error resetting staging database: {e}")

if __name__ == "__main__":
    reset_staging_database()