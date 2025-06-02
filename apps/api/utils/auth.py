from typing import Dict, Any
from .errors import APIError

def get_user_id(claims: Dict[str, Any]) -> str:
    user_id = claims.get('sub')
    if not user_id:
        raise APIError('Unauthorized - No user ID found', 401)
    return user_id 