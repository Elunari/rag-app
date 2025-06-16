"""
Simple tests for utility functions
"""
import sys
import os

# Add the project root directory to Python path
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../..'))
sys.path.insert(0, project_root)

from apps.api.utils.errors import APIError
from apps.api.utils.response import create_response, error_response

print("Testing Utils...")

# Test APIError
print("\nTesting APIError:")
try:
    error = APIError("Test error", 400)
    assert str(error) == "Test error", f"Expected 'Test error', got '{str(error)}'"
    assert error.status_code == 400, f"Expected 400, got {error.status_code}"
    print("✓ APIError works")
except Exception as e:
    print(f"✗ APIError test failed: {str(e)}")

# Test create_response
print("\nTesting create_response:")
try:
    # Test success response
    response = create_response({"data": "test"}, 200)
    assert response["statusCode"] == 200, f"Expected 200, got {response['statusCode']}"
    assert "data" in response["body"], "data not in response body"
    print("✓ create_response works with success")

    # Test created response
    response = create_response({"id": "123"}, 201)
    assert response["statusCode"] == 201, f"Expected 201, got {response['statusCode']}"
    assert "id" in response["body"], "id not in response body"
    print("✓ create_response works with created")
except Exception as e:
    print(f"✗ create_response test failed: {str(e)}")

# Test error_response
print("\nTesting error_response:")
try:
    # Test with APIError
    error = APIError("Test error", 400)
    response = error_response(error)
    assert response["statusCode"] == 400, f"Expected 400, got {response['statusCode']}"
    assert "Test error" in response["body"], "error message not in response body"
    print("✓ error_response works with APIError")

    # Test with generic exception
    response = error_response(Exception("Generic error"))
    assert response["statusCode"] == 500, f"Expected 500, got {response['statusCode']}"
    assert "Generic error" in response["body"], "error message not in response body"
    print("✓ error_response works with generic exception")
except Exception as e:
    print(f"✗ error_response test failed: {str(e)}")

print("\nAll utils tests completed!") 