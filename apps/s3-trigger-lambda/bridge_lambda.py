import json
import boto3
import os

sfn_client = boto3.client('stepfunctions')

def lambda_handler(event, context):
    # Get the Step Function ARN from environment variables
    state_machine_arn = os.environ['STATE_MACHINE_ARN']
    
    # Start Step Function execution
    response = sfn_client.start_execution(
        stateMachineArn=state_machine_arn,
        input=json.dumps(event)
    )
    
    return {
        'statusCode': 200,
        'body': json.dumps({
            'message': 'Step Function execution started',
            'executionArn': response['executionArn']
        })
    } 