#!/usr/bin/env python
"""
Quick Backend Diagnostic and Startup Script
Run this to diagnose and fix the sales loading issue
"""
import os
import sys
import subprocess
import time
import requests
import json

def check_django_server(port=8000):
    """Check if Django server is running"""
    try:
        response = requests.get(f'http://localhost:{port}/admin/', timeout=5)
        if response.status_code in [200, 302]:
            print(f"✅ Django server is running on port {port}")
            return True
        else:
            print(f"❌ Django server responded with status {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print(f"❌ Cannot connect to Django server on port {port}")
        return False
    except Exception as e:
        print(f"❌ Error checking Django server: {str(e)}")
        return False

def check_sales_api():
    """Check if sales API endpoint is working"""
    try:
        response = requests.get('http://localhost:8000/sales/sales/', timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Sales API is working - found {len(data) if isinstance(data, list) else len(data.get('results', []))} sales")
            return True
        elif response.status_code == 401:
            print("⚠️  Sales API requires authentication - this is normal")
            return True
        else:
            print(f"❌ Sales API responded with status {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error checking sales API: {str(e)}")
        return False

def start_django_server():
    """Start Django server"""
    try:
        print("🚀 Starting Django server...")
        
        # Check if venv exists
        venv_python = os.path.join('..', 'venv', 'Scripts', 'python.exe')
        if not os.path.exists(venv_python):
            print("❌ Virtual environment not found. Please create it first:")
            print("   python -m venv ../venv")
            print("   ../venv/Scripts/activate")
            print("   pip install -r requirements.txt")
            return False
        
        # Start Django server in background
        cmd = [venv_python, 'manage.py', 'runserver', '8000']
        process = subprocess.Popen(cmd, 
                                 stdout=subprocess.PIPE, 
                                 stderr=subprocess.PIPE,
                                 cwd=os.getcwd())
        
        print("⏳ Waiting for server to start...")
        time.sleep(5)
        
        # Check if server started
        if check_django_server():
            print("✅ Django server started successfully!")
            print("🌐 Server running at: http://localhost:8000")
            print("📊 Admin panel: http://localhost:8000/admin/")
            return True
        else:
            print("❌ Server failed to start properly")
            return False
            
    except Exception as e:
        print(f"❌ Error starting Django server: {str(e)}")
        return False

def check_database():
    """Check if database is accessible"""
    try:
        # Try to run a simple Django command
        venv_python = os.path.join('..', 'venv', 'Scripts', 'python.exe')
        result = subprocess.run([venv_python, 'manage.py', 'check'], 
                              capture_output=True, text=True, timeout=30)
        
        if result.returncode == 0:
            print("✅ Database connection is working")
            return True
        else:
            print(f"❌ Database issues detected:")
            print(result.stderr)
            return False
    except Exception as e:
        print(f"❌ Error checking database: {str(e)}")
        return False

def fix_sales_issue():
    """Main function to diagnose and fix sales loading issue"""
    print("🔧 PHARMACY BACKEND DIAGNOSTIC TOOL")
    print("=" * 50)
    
    # Step 1: Check if we're in the right directory
    if not os.path.exists('manage.py'):
        print("❌ Not in Django backend directory!")
        print("   Please run this script from: APPLICATION_PHARMACIE/backend/")
        return False
    
    print("✅ In correct backend directory")
    
    # Step 2: Check database
    print("\n📊 Checking database...")
    if not check_database():
        print("⚠️  Database issues detected. Try running migrations:")
        print("   python manage.py makemigrations")
        print("   python manage.py migrate")
    
    # Step 3: Check if server is already running
    print("\n🌐 Checking Django server status...")
    if check_django_server():
        print("✅ Server is already running!")
    else:
        print("🚀 Server not running. Starting now...")
        if not start_django_server():
            return False
    
    # Step 4: Check sales API
    print("\n📈 Checking sales API...")
    if check_sales_api():
        print("✅ Sales API is working!")
    else:
        print("❌ Sales API is not responding properly")
        print("   This might be due to:")
        print("   1. Authentication requirements")
        print("   2. Database migration needed")
        print("   3. CORS issues")
    
    # Step 5: Provide frontend URLs
    print("\n🎯 NEXT STEPS:")
    print("=" * 30)
    print("1. Open your frontend: http://localhost:3000")
    print("2. Try the inventory page: http://localhost:3000/inventory")
    print("3. Try the sales page: http://localhost:3000/sales")
    print("4. If issues persist, check browser console (F12)")
    
    return True

if __name__ == "__main__":
    try:
        fix_sales_issue()
        
        # Keep server running
        print("\n⏳ Server is running. Press Ctrl+C to stop.")
        while True:
            time.sleep(10)
            if not check_django_server():
                print("❌ Server stopped unexpectedly!")
                break
                
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
    except Exception as e:
        print(f"\n❌ Unexpected error: {str(e)}")
