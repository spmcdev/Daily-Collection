import json
import os
from supabase import create_client, Client

# Get environment variables directly (dotenv not needed in Vercel)
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_ANON_KEY = os.environ.get("SUPABASE_ANON_KEY")

print(f"SUPABASE_URL: {SUPABASE_URL}")
print(f"SUPABASE_ANON_KEY present: {bool(SUPABASE_ANON_KEY)}")

if not SUPABASE_URL or not SUPABASE_ANON_KEY:
    print("Missing Supabase environment variables")
    supabase = None
else:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)

def handler(event, context):
    try:
        print(f"Event: {event}")
        print(f"Method: {event.get('httpMethod')}")

        if supabase is None:
            return {
                'statusCode': 500,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Supabase not configured'})
            }

        if event['httpMethod'] == 'GET':
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
        elif event['httpMethod'] == 'POST':
            body = json.loads(event.get('body', '{}'))
            print(f"Request body: {body}")
            response = supabase.table("payments").insert(body).execute()
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
        elif event['httpMethod'] == 'DELETE':
            path = event.get('path', '')
            payment_id = path.split('/')[-1]
            if payment_id:
                response = supabase.table("payments").delete().eq("id", int(payment_id)).execute()
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'message': 'Payment deleted'})
                }
        else:
            return {
                'statusCode': 405,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Method not allowed'})
            }
    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': str(e)})
        }