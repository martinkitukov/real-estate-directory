#!/usr/bin/env python3
"""
Registration tests for NovaDom API
"""

import requests
import pytest


class TestRegistration:
    """Test suite for user registration endpoints"""
    
    BASE_URL = "http://localhost:8000/api/v1"
    
    def test_developer_registration(self):
        """Test the developer registration endpoint"""
        
        url = f"{self.BASE_URL}/auth/register/developer"
        
        data = {
            "email": "test.developer.new@example.com",
            "password": "testpass123",
            "company_name": "Test Construction Ltd",
            "contact_person": "Jane Doe",
            "phone": "+1234567890",
            "address": "456 Test Ave",
            "website": "https://testconstruction.com"
        }
        
        headers = {
            "Content-Type": "application/json"
        }
        
        try:
            response = requests.post(url, json=data, headers=headers)
            
            if response.status_code == 201:
                result = response.json()
                assert "id" in result
                assert "email" in result
                assert result["email"] == data["email"]
                assert "company_name" in result
                assert result["company_name"] == data["company_name"]
                
        except requests.exceptions.RequestException as e:
            pytest.fail(f"Request failed: {e}")
    
    def test_buyer_registration(self):
        """Test the buyer registration endpoint"""
        
        url = f"{self.BASE_URL}/auth/register/buyer"
        
        data = {
            "email": "test.buyer.new@example.com",
            "password": "testpass123",
            "first_name": "John",
            "last_name": "Doe"
        }
        
        headers = {
            "Content-Type": "application/json"
        }
        
        try:
            response = requests.post(url, json=data, headers=headers)
            
            if response.status_code == 201:
                result = response.json()
                assert "id" in result
                assert "email" in result
                assert result["email"] == data["email"]
                assert "first_name" in result
                assert result["first_name"] == data["first_name"]
                
        except requests.exceptions.RequestException as e:
            pytest.fail(f"Request failed: {e}") 