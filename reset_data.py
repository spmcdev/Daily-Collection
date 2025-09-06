import requests

# Reset loan data
def reset_data():
    base_url = "https://daily-collection.vercel.app"

    print("Resetting loan data...")

    try:
        # Delete all payments first (due to foreign key constraints)
        payments_response = requests.delete(f"{base_url}/api/payments")
        print(f"Payments deletion: {payments_response.status_code}")

        # Delete all loans
        loans_response = requests.delete(f"{base_url}/api/loans")
        print(f"Loans deletion: {loans_response.status_code}")

        print("Data reset complete!")

    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    reset_data()