import json
from typing import Dict, Any, Optional
from decimal import Decimal

class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return int(obj) if obj % 1 == 0 else float(obj)
        return super(DecimalEncoder, self).default(obj)

def get_cors_headers() -> Dict[str, str]:
    """Get CORS headers for the response"""
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
    }

def create_response(data: Dict[str, Any], status_code: int = 200) -> Dict[str, Any]:
    """Create a standardized API response"""
    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            **get_cors_headers()
        },
        'body': json.dumps(data, cls=DecimalEncoder)
    }

def error_response(error: Exception, status_code: Optional[int] = None) -> Dict[str, Any]:
    """Create a standardized error response"""
    if hasattr(error, 'status_code'):
        status_code = error.status_code
    else:
        status_code = status_code or 500

    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            **get_cors_headers()
        },
        'body': json.dumps({'error': str(error)}, cls=DecimalEncoder)
    } 