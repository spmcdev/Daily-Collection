import json
import os

def handler(event, context):
    # Get environment variables
    SUPABASE_URL = os.environ.get("SUPABASE_URL")
    SUPABASE_ANON_KEY = os.environ.get("SUPABASE_ANON_KEY")

    # Temporary fallback for testing - REMOVE IN PRODUCTION
    if not SUPABASE_URL:
        SUPABASE_URL = "https://extzvxpizdxqzlvebioo.supabase.co"
    if not SUPABASE_ANON_KEY:
        SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4dHp2eHBpemR4cXpsdmViaW9vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwNzk4MzUsImV4cCI6MjA3MjY1NTgzNX0.TXUQOCEtQH6su0Ojonu_9sAOJAo-67_zZk90f_BZlU8"

    print(f"SUPABASE_URL: {SUPABASE_URL}")
    print(f"SUPABASE_ANON_KEY present: {bool(SUPABASE_ANON_KEY)}")

    # Check environment variables
    if not SUPABASE_URL or not SUPABASE_ANON_KEY:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Missing Supabase environment variables'})
        }

    # Import and create client inside handler
    try:
        from supabase import create_client
        supabase = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Failed to create Supabase client: {str(e)}'})
        }

    try:
        method = event.get('httpMethod', 'GET')
        print(f"Method: {method}")

        if method == 'GET':
            response = supabase.table("loans").select("*").execute()
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': '*',
                    'Access-Control-Allow-Methods': '*'
                },
                'body': json.dumps(response.data)
            }

        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            print(f"Request body: {body}")
            response = supabase.table("loans").insert(body).execute()
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': '*',
                    'Access-Control-Allow-Methods': '*'
                },
                'body': json.dumps(response.data[0] if response.data else {})
            }

        elif method == 'DELETE':
            path = event.get('path', '')
            loan_id = path.split('/')[-1]
            if loan_id:
                loan_id_int = int(loan_id)
                print(f"Deleting loan {loan_id_int} and all related payments")

                # Delete related payments first
                supabase.table("payments").delete().eq("loan_id", loan_id_int).execute()

                # Then delete the loan
                response = supabase.table("loans").delete().eq("id", loan_id_int).execute()

                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'message': 'Loan and all payments deleted successfully'})
                }

        else:
            return {
                'statusCode': 405,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Method not allowed'})
            }

    except Exception as e:
        print(f"Handler error: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }