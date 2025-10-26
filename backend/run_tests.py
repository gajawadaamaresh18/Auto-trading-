#!/usr/bin/env python3
"""
Test runner script for the Risk Control Backend
"""

import subprocess
import sys
import os


def run_command(command, description):
    """Run a command and handle errors"""
    print(f"\n{'='*60}")
    print(f"Running: {description}")
    print(f"Command: {command}")
    print('='*60)
    
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(result.stdout)
        if result.stderr:
            print("STDERR:", result.stderr)
        return True
    except subprocess.CalledProcessError as e:
        print(f"Error running command: {e}")
        print("STDOUT:", e.stdout)
        print("STDERR:", e.stderr)
        return False


def main():
    """Main test runner"""
    print("Risk Control Backend - Test Runner")
    print("="*60)
    
    # Change to backend directory
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(backend_dir)
    
    # Check if virtual environment exists
    venv_path = os.path.join(backend_dir, "venv")
    if not os.path.exists(venv_path):
        print("Creating virtual environment...")
        if not run_command("python -m venv venv", "Creating virtual environment"):
            print("Failed to create virtual environment")
            return 1
    
    # Determine activation command based on OS
    if os.name == 'nt':  # Windows
        activate_cmd = "venv\\Scripts\\activate"
        python_cmd = "venv\\Scripts\\python"
        pip_cmd = "venv\\Scripts\\pip"
    else:  # Unix-like
        activate_cmd = "source venv/bin/activate"
        python_cmd = "venv/bin/python"
        pip_cmd = "venv/bin/pip"
    
    # Install dependencies
    print("\nInstalling dependencies...")
    if not run_command(f"{pip_cmd} install -r requirements.txt", "Installing dependencies"):
        print("Failed to install dependencies")
        return 1
    
    # Run tests
    print("\nRunning tests...")
    test_commands = [
        (f"{python_cmd} -m pytest tests/test_risk_service.py -v", "Risk Service Tests"),
        (f"{python_cmd} -m pytest tests/test_api.py -v", "API Tests"),
        (f"{python_cmd} -m pytest tests/ -v --tb=short", "All Tests"),
    ]
    
    all_passed = True
    for command, description in test_commands:
        if not run_command(command, description):
            all_passed = False
    
    # Run with coverage if available
    print("\nChecking for coverage...")
    try:
        run_command(f"{pip_cmd} install pytest-cov", "Installing coverage")
        run_command(f"{python_cmd} -m pytest --cov=services tests/ --cov-report=html", "Coverage Report")
        print("\nCoverage report generated in htmlcov/index.html")
    except:
        print("Coverage not available, skipping...")
    
    # Summary
    print("\n" + "="*60)
    if all_passed:
        print("✅ All tests passed successfully!")
        return 0
    else:
        print("❌ Some tests failed. Please check the output above.")
        return 1


if __name__ == "__main__":
    sys.exit(main())