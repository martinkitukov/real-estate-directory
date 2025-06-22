#!/usr/bin/env python3
"""
Development testing scripts for NovaDom API
Run this during development to test basic functionality
"""

import requests
import json
import sys
from typing import Optional


class NovaDomAPITester:
    """Development API testing class"""
    
    def __init__(self, base_url: str = "http://localhost:8000"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api/v1"
        self.access_token: Optional[str] = None
    
    def test_health(self) -> bool:
        """Test if the API is running"""
        try:
            response = requests.get(f"{self.base_url}/health")
            if response.status_code == 200:
                print("✅ API Health check passed")
                return True
            else:
                print(f"❌ Health check failed: {response.status_code}")
                return False
        except requests.RequestException as e:
            print(f"❌ Health check error: {e}")
            return False
    
    def register_test_developer(self) -> bool:
        """Register a test developer account"""
        url = f"{self.api_url}/auth/register/developer"
        
        data = {
            "email": "dev.test@novadom.com",
            "password": "testpass123",
            "company_name": "Test Construction Ltd",
            "contact_person": "Test Developer",
            "phone": "+359888123456",
            "address": "Test Address 123, Sofia",
            "website": "https://test-construction.com"
        }
        
        try:
            response = requests.post(url, json=data)
            if response.status_code == 201:
                print("✅ Test developer registration successful")
                return True
            else:
                print(f"❌ Developer registration failed: {response.status_code}")
                print(f"Response: {response.text}")
                return False
        except requests.RequestException as e:
            print(f"❌ Registration error: {e}")
            return False
    
    def login_test_developer(self) -> bool:
        """Login with test developer credentials"""
        url = f"{self.api_url}/auth/token"
        
        data = {
            "username": "dev.test@novadom.com",
            "password": "testpass123"
        }
        
        try:
            response = requests.post(url, data=data)
            if response.status_code == 200:
                result = response.json()
                self.access_token = result["access_token"]
                print("✅ Test developer login successful")
                return True
            else:
                print(f"❌ Developer login failed: {response.status_code}")
                return False
        except requests.RequestException as e:
            print(f"❌ Login error: {e}")
            return False
    
    def test_authenticated_endpoint(self) -> bool:
        """Test accessing authenticated endpoint"""
        if not self.access_token:
            print("❌ No access token available")
            return False
        
        url = f"{self.api_url}/auth/me"
        headers = {"Authorization": f"Bearer {self.access_token}"}
        
        try:
            response = requests.get(url, headers=headers)
            if response.status_code == 200:
                print("✅ Authenticated endpoint test passed")
                user_info = response.json()
                print(f"   User: {user_info.get('email', 'Unknown')}")
                return True
            else:
                print(f"❌ Authenticated endpoint failed: {response.status_code}")
                return False
        except requests.RequestException as e:
            print(f"❌ Authenticated endpoint error: {e}")
            return False
    
    def run_all_tests(self):
        """Run all development tests"""
        print("🚀 Running NovaDom API Development Tests")
        print("=" * 50)
        
        tests = [
            ("Health Check", self.test_health),
            ("Developer Registration", self.register_test_developer),
            ("Developer Login", self.login_test_developer),
            ("Authenticated Endpoint", self.test_authenticated_endpoint),
        ]
        
        passed = 0
        total = len(tests)
        
        for test_name, test_func in tests:
            print(f"\n🧪 Running: {test_name}")
            if test_func():
                passed += 1
            else:
                print(f"   Test '{test_name}' failed")
        
        print("\n" + "=" * 50)
        print(f"📊 Results: {passed}/{total} tests passed")
        
        if passed == total:
            print("🎉 All tests passed!")
            return True
        else:
            print("❌ Some tests failed")
            return False


if __name__ == "__main__":
    tester = NovaDomAPITester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1) 