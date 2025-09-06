import requests
import json
from datetime import datetime, timedelta

# Sample loan data
sample_loans = [
    {
        "borrower_id": "B001",
        "borrower": "John Smith",
        "amount": 50000.00,
        "interest": 5.0,
        "weeks": 20,
        "start_date": (datetime.now() - timedelta(days=30)).strftime("%Y-%m-%d")
    },
    {
        "borrower_id": "B002",
        "borrower": "Sarah Johnson",
        "amount": 75000.00,
        "interest": 6.5,
        "weeks": 25,
        "start_date": (datetime.now() - timedelta(days=20)).strftime("%Y-%m-%d")
    },
    {
        "borrower_id": "B003",
        "borrower": "Michael Brown",
        "amount": 30000.00,
        "interest": 4.5,
        "weeks": 15,
        "start_date": (datetime.now() - timedelta(days=10)).strftime("%Y-%m-%d")
    },
    {
        "borrower_id": "B004",
        "borrower": "Emma Davis",
        "amount": 100000.00,
        "interest": 7.0,
        "weeks": 30,
        "start_date": (datetime.now() - timedelta(days=45)).strftime("%Y-%m-%d")
    },
    {
        "borrower_id": "B005",
        "borrower": "David Wilson",
        "amount": 25000.00,
        "interest": 5.5,
        "weeks": 12,
        "start_date": (datetime.now() - timedelta(days=5)).strftime("%Y-%m-%d")
    }
]

def add_sample_loans():
    base_url = "http://localhost:8000"

    print("Adding sample loans to database...")

    for i, loan in enumerate(sample_loans, 1):
        try:
            response = requests.post(f"{base_url}/api/loans", json=loan)
            if response.status_code == 200:
                print(f"✅ Added loan {i}: {loan['borrower']} - LKR {loan['amount']}")
            else:
                print(f"❌ Failed to add loan {i}: {response.text}")
        except Exception as e:
            print(f"❌ Error adding loan {i}: {str(e)}")

    print("\nSample loans added successfully!")
    print("You can now view them in your dashboard at http://localhost:8000")

if __name__ == "__main__":
    add_sample_loans()