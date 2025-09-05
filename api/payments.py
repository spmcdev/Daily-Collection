import json
import os

def handler(event, context):
    # Get environment variables
    SUPABASE_URL = os.environ.get("SUPABASE_URL")
    SUPABASE_ANON_KEY = os.environ.get("SUPABASE_ANON_KEY")

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
            response = supabase.table("payments").select("*").execute()
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

            # Check if payment already exists for this loan_id and week
            print(f"Checking for existing payment: loan_id={body['loan_id']}, week={body['week']}")
            existing_payment = supabase.table("payments").select("*").eq("loan_id", body['loan_id']).eq("week", body['week']).execute()
            print(f"Existing payment query result: {existing_payment.data}")

            if existing_payment.data and len(existing_payment.data) > 0:
                print(f"DUPLICATE DETECTED: Payment already exists for loan_id {body['loan_id']}, week {body['week']}")
                # Return the existing payment data
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Headers': '*',
                        'Access-Control-Allow-Methods': '*'
                    },
                    'body': json.dumps(existing_payment.data)
                }
            else:
                # Create new payment
                print(f"Creating NEW payment for loan_id {body['loan_id']}, week {body['week']}")
                response = supabase.table("payments").insert(body).execute()
                print(f"Insert result: {response.data}")
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
            payment_id = path.split('/')[-1]
            if payment_id:
                response = supabase.table("payments").delete().eq("id", int(payment_id)).execute()
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'message': 'Payment deleted'})
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