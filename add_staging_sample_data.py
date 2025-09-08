#!/usr/bin/env python3
"""
Add sample data to staging database for testing
"""

import os
from supabase import create_client, Client
from dotenv import load_dotenv
from datetime import datetime, timedelta

# Load staging environment variables
load_dotenv('.env.staging')

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_ANON_KEY = os.getenv('SUPABASE_ANON_KEY')

def add_sample_data():
    """Add sample loans and payments to staging database"""

    if not SUPABASE_URL or not SUPABASE_ANON_KEY:
        print("❌ Error: Missing staging environment variables")
        return

    try:
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
        print("🔗 Connected to staging Supabase")

        # Sample loans data - 20 loans for testing
        sample_loans = [
            {
                "borrower_id": "DEMO001",
                "borrower": "John Smith (Demo)",
                "amount": 50000.00,
                "interest": 5.0,
                "weeks": 10,
                "start_date": (datetime.now() - timedelta(days=30)).strftime('%Y-%m-%d')
            },
            {
                "borrower_id": "DEMO002",
                "borrower": "Sarah Johnson (Demo)",
                "amount": 25000.00,
                "interest": 4.5,
                "weeks": 8,
                "start_date": (datetime.now() - timedelta(days=20)).strftime('%Y-%m-%d')
            },
            {
                "borrower_id": "DEMO003",
                "borrower": "Mike Wilson (Demo)",
                "amount": 75000.00,
                "interest": 6.0,
                "weeks": 12,
                "start_date": (datetime.now() - timedelta(days=10)).strftime('%Y-%m-%d')
            },
            {
                "borrower_id": "DEMO004",
                "borrower": "Emma Davis (Demo)",
                "amount": 30000.00,
                "interest": 4.0,
                "weeks": 6,
                "start_date": (datetime.now() - timedelta(days=45)).strftime('%Y-%m-%d')
            },
            {
                "borrower_id": "DEMO005",
                "borrower": "Robert Brown (Demo)",
                "amount": 45000.00,
                "interest": 5.5,
                "weeks": 9,
                "start_date": (datetime.now() - timedelta(days=15)).strftime('%Y-%m-%d')
            },
            {
                "borrower_id": "DEMO006",
                "borrower": "Lisa Garcia (Demo)",
                "amount": 60000.00,
                "interest": 6.5,
                "weeks": 15,
                "start_date": (datetime.now() - timedelta(days=25)).strftime('%Y-%m-%d')
            },
            {
                "borrower_id": "DEMO007",
                "borrower": "David Miller (Demo)",
                "amount": 35000.00,
                "interest": 4.2,
                "weeks": 7,
                "start_date": (datetime.now() - timedelta(days=35)).strftime('%Y-%m-%d')
            },
            {
                "borrower_id": "DEMO008",
                "borrower": "Maria Rodriguez (Demo)",
                "amount": 80000.00,
                "interest": 7.0,
                "weeks": 16,
                "start_date": (datetime.now() - timedelta(days=5)).strftime('%Y-%m-%d')
            },
            {
                "borrower_id": "DEMO009",
                "borrower": "James Martinez (Demo)",
                "amount": 40000.00,
                "interest": 4.8,
                "weeks": 8,
                "start_date": (datetime.now() - timedelta(days=40)).strftime('%Y-%m-%d')
            },
            {
                "borrower_id": "DEMO010",
                "borrower": "Jennifer Anderson (Demo)",
                "amount": 55000.00,
                "interest": 5.2,
                "weeks": 11,
                "start_date": (datetime.now() - timedelta(days=12)).strftime('%Y-%m-%d')
            },
            {
                "borrower_id": "DEMO011",
                "borrower": "Michael Taylor (Demo)",
                "amount": 65000.00,
                "interest": 6.2,
                "weeks": 13,
                "start_date": (datetime.now() - timedelta(days=18)).strftime('%Y-%m-%d')
            },
            {
                "borrower_id": "DEMO012",
                "borrower": "Patricia Thomas (Demo)",
                "amount": 28000.00,
                "interest": 3.8,
                "weeks": 7,
                "start_date": (datetime.now() - timedelta(days=50)).strftime('%Y-%m-%d')
            },
            {
                "borrower_id": "DEMO013",
                "borrower": "Christopher Jackson (Demo)",
                "amount": 72000.00,
                "interest": 6.8,
                "weeks": 14,
                "start_date": (datetime.now() - timedelta(days=8)).strftime('%Y-%m-%d')
            },
            {
                "borrower_id": "DEMO014",
                "borrower": "Linda White (Demo)",
                "amount": 38000.00,
                "interest": 4.3,
                "weeks": 8,
                "start_date": (datetime.now() - timedelta(days=28)).strftime('%Y-%m-%d')
            },
            {
                "borrower_id": "DEMO015",
                "borrower": "Daniel Harris (Demo)",
                "amount": 52000.00,
                "interest": 5.1,
                "weeks": 10,
                "start_date": (datetime.now() - timedelta(days=22)).strftime('%Y-%m-%d')
            },
            {
                "borrower_id": "DEMO016",
                "borrower": "Barbara Clark (Demo)",
                "amount": 47000.00,
                "interest": 4.9,
                "weeks": 9,
                "start_date": (datetime.now() - timedelta(days=32)).strftime('%Y-%m-%d')
            },
            {
                "borrower_id": "DEMO017",
                "borrower": "Matthew Lewis (Demo)",
                "amount": 68000.00,
                "interest": 6.3,
                "weeks": 12,
                "start_date": (datetime.now() - timedelta(days=14)).strftime('%Y-%m-%d')
            },
            {
                "borrower_id": "DEMO018",
                "borrower": "Susan Robinson (Demo)",
                "amount": 42000.00,
                "interest": 4.6,
                "weeks": 8,
                "start_date": (datetime.now() - timedelta(days=38)).strftime('%Y-%m-%d')
            },
            {
                "borrower_id": "DEMO019",
                "borrower": "Joseph Walker (Demo)",
                "amount": 58000.00,
                "interest": 5.4,
                "weeks": 11,
                "start_date": (datetime.now() - timedelta(days=16)).strftime('%Y-%m-%d')
            },
            {
                "borrower_id": "DEMO020",
                "borrower": "Margaret Hall (Demo)",
                "amount": 32000.00,
                "interest": 4.1,
                "weeks": 6,
                "start_date": (datetime.now() - timedelta(days=42)).strftime('%Y-%m-%d')
            }
        ]

        # Insert loans
        print("📝 Adding sample loans...")
        loans_result = supabase.table('loans').insert(sample_loans).execute()
        print(f"✅ Added {len(loans_result.data)} loans")

        # Get loan IDs for payments
        loans_data = loans_result.data

        # Sample payments data - generate payments based on loan start dates
        sample_payments = []

        for loan in loans_data:
            loan_id = loan['id']
            weekly_installment = (loan['amount'] * (1 + loan['interest']/100) / loan['weeks'])
            loan_start_date = datetime.strptime(loan['start_date'], '%Y-%m-%d')

            # Add some payments for each loan (not all weeks)
            paid_weeks = min(loan['weeks'] - 1, 3)  # Pay 3 weeks or max-1

            for week in range(1, paid_weeks + 1):
                # Calculate payment date based on loan start date + weeks
                payment_date = loan_start_date + timedelta(days=week * 7)
                sample_payments.append({
                    "loan_id": loan_id,
                    "week": week,
                    "amount": round(weekly_installment, 2),
                    "payment_date": payment_date.strftime('%Y-%m-%d')
                })

        # Insert payments
        if sample_payments:
            print("📝 Adding sample payments...")
            payments_result = supabase.table('payments').insert(sample_payments).execute()
            print(f"✅ Added {len(payments_result.data)} payments")

        print("🎉 Sample data added successfully!")
        print("\n📊 Sample Data Summary:")
        print(f"   • {len(loans_data)} demo loans")
        print(f"   • {len(sample_payments)} demo payments")
        print("   • Mix of completed and in-progress loans")
        print("\n🔗 Your staging site should now show data!")

    except Exception as e:
        print(f"❌ Error adding sample data: {e}")

if __name__ == "__main__":
    add_sample_data()