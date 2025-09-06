class Handler:
    def __init__(self):
        pass

    def __call__(self, event, context):
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': '{"message": "Test function working"}'
        }

handler = Handler()