#!/usr/bin/env python3
"""
Add sample data to new staging database using direct SQL
"""

import os
from supabase import create_client, Client
from dotenv import load_dotenv

# Use hardcoded staging database credentials
SUPABASE_URL = "https://bkiglesjdwgvomsyfxkc.supabase.co"
SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJraWdsZXNqZHdndm9tc3lmeGtjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczNDk5NjAsImV4cCI6MjA3MjkyNTk2MH0.k89ZlaOQwlJjRux02JqGHLEizrhy7D9cVCXa8Cq9KgU"

def add_sample_data_direct():
    """Add sample loans and payments using direct SQL"""

    if not SUPABASE_URL or not SUPABASE_ANON_KEY:
        print("❌ Error: Missing staging environment variables")
        return

    try:
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
        print("🔗 Connected to new staging Supabase")

        # Sample loans data
        loans_data = [
            {'borrower_id': 'L001', 'borrower': 'සුමිත් රාජපක්ෂ', 'amount': 50000.00, 'interest': 10.0, 'weeks': 20, 'start_date': '2025-01-01'},
            {'borrower_id': 'L002', 'borrower': 'නිලන්ත වීරසිංහ', 'amount': 75000.00, 'interest': 12.0, 'weeks': 25, 'start_date': '2025-01-05'},
            {'borrower_id': 'L003', 'borrower': 'කමල් පෙරේරා', 'amount': 30000.00, 'interest': 8.0, 'weeks': 15, 'start_date': '2025-01-10'},
            {'borrower_id': 'L004', 'borrower': 'අමිල රත්නායක', 'amount': 100000.00, 'interest': 15.0, 'weeks': 30, 'start_date': '2025-01-15'},
            {'borrower_id': 'L005', 'borrower': 'සඳුනි සිල්වා', 'amount': 25000.00, 'interest': 9.0, 'weeks': 12, 'start_date': '2025-01-20'},
            {'borrower_id': 'L006', 'borrower': 'රුවන් කුමාර', 'amount': 60000.00, 'interest': 11.0, 'weeks': 22, 'start_date': '2025-01-25'},
            {'borrower_id': 'L007', 'borrower': 'මධුරංග සමරසිංහ', 'amount': 45000.00, 'interest': 10.5, 'weeks': 18, 'start_date': '2025-02-01'},
            {'borrower_id': 'L008', 'borrower': 'යසෝදර දසනායක', 'amount': 80000.00, 'interest': 13.0, 'weeks': 28, 'start_date': '2025-02-05'},
            {'borrower_id': 'L009', 'borrower': 'චන්දිම නානායක්කාර', 'amount': 35000.00, 'interest': 9.5, 'weeks': 16, 'start_date': '2025-02-10'},
            {'borrower_id': 'L010', 'borrower': 'ප්‍රසන්න වික්‍රමසිංහ', 'amount': 55000.00, 'interest': 11.5, 'weeks': 20, 'start_date': '2025-02-15'},
            {'borrower_id': 'L011', 'borrower': 'මලිත් පෙරේරා', 'amount': 40000.00, 'interest': 10.0, 'weeks': 17, 'start_date': '2025-02-20'},
            {'borrower_id': 'L012', 'borrower': 'සුනිල් රණසිංහ', 'amount': 65000.00, 'interest': 12.5, 'weeks': 24, 'start_date': '2025-02-25'},
            {'borrower_id': 'L013', 'borrower': 'කුෂාන් ජයසිංහ', 'amount': 28000.00, 'interest': 8.5, 'weeks': 14, 'start_date': '2025-03-01'},
            {'borrower_id': 'L014', 'borrower': 'නිෂාන්ත කුමාරසිංහ', 'amount': 72000.00, 'interest': 13.5, 'weeks': 26, 'start_date': '2025-03-05'},
            {'borrower_id': 'L015', 'borrower': 'හසිත රාජපක්ෂ', 'amount': 32000.00, 'interest': 9.0, 'weeks': 15, 'start_date': '2025-03-10'},
            {'borrower_id': 'L016', 'borrower': 'දිල්ෂාන් මුනසිංහ', 'amount': 58000.00, 'interest': 11.0, 'weeks': 21, 'start_date': '2025-03-15'},
            {'borrower_id': 'L017', 'borrower': 'අනුරාධ වීරතුංග', 'amount': 42000.00, 'interest': 10.5, 'weeks': 18, 'start_date': '2025-03-20'},
            {'borrower_id': 'L018', 'borrower': 'සමන් පෙරේරා', 'amount': 68000.00, 'interest': 12.0, 'weeks': 25, 'start_date': '2025-03-25'},
            {'borrower_id': 'L019', 'borrower': 'තිලිණි ද සිල්වා', 'amount': 36000.00, 'interest': 9.5, 'weeks': 16, 'start_date': '2025-03-30'},
            {'borrower_id': 'L020', 'borrower': 'ධනුෂ්ක රත්නායක', 'amount': 52000.00, 'interest': 11.5, 'weeks': 19, 'start_date': '2025-04-01'}
        ]

        # Insert loans using standard Supabase client
        print("📝 Adding sample loans...")
        for loan in loans_data:
            try:
                result = supabase.table('loans').insert({
                    'borrower_id': loan['borrower_id'],
                    'borrower': loan['borrower'],
                    'amount': loan['amount'],
                    'interest': loan['interest'],
                    'weeks': loan['weeks'],
                    'start_date': loan['start_date']
                }).execute()
                print(f"✅ Added loan {loan['borrower_id']}")
            except Exception as e:
                print(f"⚠️  Error adding loan {loan['borrower_id']}: {e}")

        # Generate and insert payments for each loan
        print("📝 Adding sample payments...")
        payments_count = 0
        for loan in loans_data:
            loan_id = loan['borrower_id']
            amount = loan['amount']
            interest = loan['interest']
            weeks = loan['weeks']
            weekly_payment = (amount * (1 + interest/100)) / weeks

            # First get the loan ID from the database
            try:
                loan_record = supabase.table('loans').select('id').eq('borrower_id', loan_id).execute()
                if loan_record.data and len(loan_record.data) > 0:
                    actual_loan_id = loan_record.data[0]['id']

                    # Add payments for first 10 weeks of each loan
                    for week in range(1, min(11, weeks + 1)):
                        payment_date = f"2025-01-{week:02d}"  # Simple date pattern
                        try:
                            result = supabase.table('payments').insert({
                                'loan_id': actual_loan_id,
                                'week': week,
                                'amount': round(weekly_payment, 2),
                                'payment_date': payment_date
                            }).execute()
                            payments_count += 1
                        except Exception as e:
                            print(f"⚠️  Error adding payment for {loan_id} week {week}: {e}")
                else:
                    print(f"⚠️  Could not find loan record for {loan_id}")
            except Exception as e:
                print(f"⚠️  Error getting loan ID for {loan_id}: {e}")

        print("🎉 Sample data added successfully!")
        print(f"📊 Added {len(loans_data)} loans and {payments_count} payments")

    except Exception as e:
        print(f"❌ Error adding sample data: {e}")

if __name__ == "__main__":
    add_sample_data_direct()