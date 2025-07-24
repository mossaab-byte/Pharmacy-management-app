#!/usr/bin/env python3
"""
Test script to check if Django server can start and API endpoints are accessible
"""
import os
import sys
import subprocess
import time
import requests

def test_django_server():
    print("🔧 Testing Django Server...")
    
    # Change to backend directory
    backend_dir = os.path.join(os.path.dirname(__file__), 'backend')
    os.chdir(backend_dir)
    
    # Activate virtual environment and start server
    venv_python = os.path.join('..', 'venv', 'Scripts', 'python.exe')
    
    try:
        # Check if Django can start
        print("📋 Running Django check...")
        result = subprocess.run([venv_python, 'manage.py', 'check'], 
                              capture_output=True, text=True, timeout=30)
        
        if result.returncode != 0:
            print(f"❌ Django check failed: {result.stderr}")
            return False
        else:
            print("✅ Django check passed")
        
        # Try to start server in background
        print("🚀 Starting Django server...")
        server_process = subprocess.Popen([venv_python, 'manage.py', 'runserver', '127.0.0.1:8000'],
                                        stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        
        # Wait a bit for server to start
        time.sleep(5)
        
        # Test if server is accessible
        try:
            response = requests.get('http://127.0.0.1:8000/api/dashboard/kpis/', timeout=10)
            print(f"📡 API Response Status: {response.status_code}")
            if response.status_code == 401:
                print("🔐 Authentication required - this is expected")
            elif response.status_code == 403:
                print("🚫 Permission denied - user needs proper permissions")
            elif response.status_code == 200:
                print("✅ API working correctly")
            else:
                print(f"⚠️  Unexpected status code: {response.status_code}")
                print(f"Response: {response.text}")
                
        except requests.exceptions.ConnectionError:
            print("❌ Cannot connect to Django server")
            return False
        except requests.exceptions.Timeout:
            print("⏰ Request timed out")
            return False
        finally:
            # Stop the server
            server_process.terminate()
            server_process.wait()
            
        return True
        
    except subprocess.TimeoutExpired:
        print("❌ Django check timed out")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    success = test_django_server()
    if success:
        print("\n✅ Django server test completed successfully")
    else:
        print("\n❌ Django server test failed")
    
    sys.exit(0 if success else 1)
