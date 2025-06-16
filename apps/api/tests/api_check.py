"""
Simple tests for API functions
"""
import sys
import os

# Add the project root directory to Python path
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../..'))
sys.path.insert(0, project_root)

from apps.api.api import get_user_id, get_user_email

print("Testing API functions...")

# Test get_user_id
print("\nTesting get_user_id:")
try:
    # Test valid case
    event = {
        'requestContext': {
            'authorizer': {
                'claims': {
                    'sub': 'test-user-id'
                }
            }
        }
    }
    user_id = get_user_id(event)
    assert user_id == 'test-user-id', f"Expected 'test-user-id', got '{user_id}'"
    print("✓ get_user_id works with valid event")

    # Test invalid case
    try:
        get_user_id({})
        print("✗ get_user_id should have failed with empty event")
    except Exception as e:
        print("✓ get_user_id correctly fails with empty event")
except Exception as e:
    print(f"✗ get_user_id test failed: {str(e)}")

# Test get_user_email
print("\nTesting get_user_email:")
try:
    # Test valid case
    event = {
        'requestContext': {
            'authorizer': {
                'claims': {
                    'email': 'test@example.com'
                }
            }
        }
    }
    email = get_user_email(event)
    assert email == 'test@example.com', f"Expected 'test@example.com', got '{email}'"
    print("✓ get_user_email works with valid event")

    # Test missing email case
    email = get_user_email({})
    assert email is None, f"Expected None for missing email, got '{email}'"
    print("✓ get_user_email returns None for missing email")
except Exception as e:
    print(f"✗ get_user_email test failed: {str(e)}")

print("\nAll tests completed!") 