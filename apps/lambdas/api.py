import json

def lambda_handler(event, context):
    print("Received event:", json.dumps(event))  # For debugging
    
    try:
        # Parse the JSON body from the event
        body = json.loads(event.get('body', '{}'))
        
        # Get path directly from event
        path = event.get('path', '')
        
        if path == '/send_prompt':
            return send_prompt(body)
        elif path == '/add_to_knowledge_base':
            return add_to_knowledge_base(body)
        else:
            return {
                'statusCode': 404,
                'body': json.dumps({'message': 'Route not found'})
            }
    except Exception as e:
        print("Error:", str(e))  # For debugging
        return {
            'statusCode': 500,
            'body': json.dumps({'message': f'Internal server error: {str(e)}'})
        }

def send_prompt(body):
    # Get message from request body
    message = body.get('prompt', '')  # Changed from 'message' to 'prompt' to match your request
    
    # Your logic for sending prompt (this is just an example)
    return {
        'statusCode': 200,
        'body': json.dumps({
            'message': f'Received message: {message}',
            'timestamp': '2024-03-30T00:00:00Z'  # Example timestamp
        })
    }

def add_to_knowledge_base(body):
    # Get data from request body
    data = body.get('data', '')
    
    # Your logic for adding to the knowledge base (this is just an example)
    return {
        'statusCode': 200,
        'body': json.dumps({
            'message': f'Added to knowledge base: {data}',
            'timestamp': '2024-03-30T00:00:00Z'  # Example timestamp
        })
    }