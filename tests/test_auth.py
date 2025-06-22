#!/usr/bin/env python3
"""
Authentication tests for NovaDom API
"""

import requests
import pytest


class TestAuthentication:
    """Test suite for authentication endpoints"""
    
    BASE_URL = "http://localhost:8000/api/v1"
    
    def test_developer_login(self):
        """Test developer login to get access token"""
        
        url = f"{self.BASE_URL}/auth/token"
        
        # OAuth2 form data (using username field for email)
        data = {
            "username": "debug.test@example.com",  # Use email as username
            "password": "testpass123"
        }
        
        headers = {
            "Content-Type": "application/x-www-form-urlencoded"
        }
        
        try:
            response = requests.post(url, data=data, headers=headers)
            
            if response.status_code == 200:
                result = response.json()
                assert "access_token" in result
                assert "token_type" in result
                assert result["token_type"] == "bearer"
                
                # Test authenticated endpoint
                auth_headers = {
                    "Authorization": f"Bearer {result['access_token']}"
                }
                me_response = requests.get(f"{self.BASE_URL}/auth/me", headers=auth_headers)
                assert me_response.status_code == 200
                
        except requests.exceptions.RequestException as e:
            pytest.fail(f"Request failed: {e}") 