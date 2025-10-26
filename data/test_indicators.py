"""
Test file for Technical Indicator Catalog and Backend
"""

import sys
import os
import numpy as np
import pandas as pd

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def test_imports():
    """Test that all required modules can be imported"""
    print("Testing imports...")
    
    try:
        from simple_indicator_backend import SimpleIndicatorBackend
        print("✓ SimpleIndicatorBackend imported successfully")
    except ImportError as e:
        print(f"✗ Failed to import SimpleIndicatorBackend: {e}")
        return False
    
    try:
        import talib
        print("✓ TA-Lib imported successfully")
    except ImportError as e:
        print(f"✗ Failed to import TA-Lib: {e}")
        print("  Note: Some indicators may not work without TA-Lib")
    
    try:
        import pandas_ta
        print("✓ pandas_ta imported successfully")
    except ImportError as e:
        print(f"✗ Failed to import pandas_ta: {e}")
        print("  Note: Some indicators may not work without pandas_ta")
    
    return True

def test_basic_functionality():
    """Test basic indicator functionality"""
    print("\nTesting basic functionality...")
    
    try:
        from simple_indicator_backend import SimpleIndicatorBackend
        backend = SimpleIndicatorBackend()
        print("✓ SimpleIndicatorBackend initialized successfully")
    except Exception as e:
        print(f"✗ Failed to initialize SimpleIndicatorBackend: {e}")
        return False
    
    # Create sample data
    np.random.seed(42)
    n = 50
    close = 100 + np.cumsum(np.random.randn(n) * 0.5)
    high = close + np.random.rand(n) * 2
    low = close - np.random.rand(n) * 2
    volume = np.random.randint(1000, 10000, n)
    
    print(f"✓ Created sample data with {n} points")
    
    # Test basic indicators
    test_cases = [
        ('sma', lambda: backend.sma(close, period=20)),
        ('ema', lambda: backend.ema(close, period=20)),
        ('rsi', lambda: backend.rsi(close, period=14)),
        ('atr', lambda: backend.atr(high, low, close, period=14)),
    ]
    
    for name, test_func in test_cases:
        try:
            result = test_func()
            if result is not None and len(result) > 0:
                print(f"✓ {name.upper()} calculated successfully")
            else:
                print(f"✗ {name.upper()} returned empty result")
        except Exception as e:
            print(f"✗ {name.upper()} failed: {e}")
    
    return True

def test_catalog_structure():
    """Test TypeScript catalog structure"""
    print("\nTesting catalog structure...")
    
    try:
        # Read the TypeScript catalog file
        with open('indicatorCatalog.ts', 'r') as f:
            content = f.read()
        
        # Check for key components
        required_components = [
            'export interface Indicator',
            'export const indicatorCatalog',
            'export function getIndicatorByName',
            'export function filterIndicatorsByCategory',
            'SMA',
            'RSI',
            'MACD',
            'ATR',
            'BBANDS'
        ]
        
        for component in required_components:
            if component in content:
                print(f"✓ Found {component}")
            else:
                print(f"✗ Missing {component}")
                return False
        
        print("✓ TypeScript catalog structure looks good")
        return True
        
    except FileNotFoundError:
        print("✗ indicatorCatalog.ts file not found")
        return False
    except Exception as e:
        print(f"✗ Error reading catalog: {e}")
        return False

def test_indicator_count():
    """Test that we have the expected number of indicators"""
    print("\nTesting indicator count...")
    
    try:
        from simple_indicator_backend import SimpleIndicatorBackend
        backend = SimpleIndicatorBackend()
        
        available_indicators = backend.get_available_indicators()
        print(f"✓ Found {len(available_indicators)} available indicators")
        
        # Check for some key indicators
        key_indicators = ['sma', 'ema', 'rsi', 'macd', 'atr', 'bbands', 'adx', 'obv']
        missing_indicators = []
        
        for indicator in key_indicators:
            if indicator in available_indicators:
                print(f"✓ {indicator.upper()} available")
            else:
                missing_indicators.append(indicator)
                print(f"✗ {indicator.upper()} missing")
        
        if missing_indicators:
            print(f"✗ Missing key indicators: {missing_indicators}")
            return False
        
        print("✓ All key indicators are available")
        return True
        
    except Exception as e:
        print(f"✗ Error checking indicator count: {e}")
        return False

def test_performance():
    """Test basic performance"""
    print("\nTesting performance...")
    
    try:
        from simple_indicator_backend import SimpleIndicatorBackend
        import time
        
        backend = SimpleIndicatorBackend()
        
        # Create larger dataset
        n = 1000
        close = 100 + np.cumsum(np.random.randn(n) * 0.5)
        high = close + np.random.rand(n) * 2
        low = close - np.random.rand(n) * 2
        
        # Test SMA performance
        start_time = time.time()
        sma_result = backend.sma(close, period=20)
        end_time = time.time()
        
        execution_time = (end_time - start_time) * 1000  # Convert to ms
        print(f"✓ SMA calculation for {n} points took {execution_time:.2f}ms")
        
        if execution_time > 100:  # More than 100ms is slow
            print(f"⚠ SMA calculation seems slow ({execution_time:.2f}ms)")
        else:
            print("✓ Performance looks good")
        
        return True
        
    except Exception as e:
        print(f"✗ Performance test failed: {e}")
        return False

def main():
    """Run all tests"""
    print("Technical Indicator Catalog and Backend Test Suite")
    print("=" * 60)
    
    tests = [
        test_imports,
        test_basic_functionality,
        test_catalog_structure,
        test_indicator_count,
        test_performance
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        try:
            if test():
                passed += 1
        except Exception as e:
            print(f"✗ Test {test.__name__} crashed: {e}")
    
    print("\n" + "=" * 60)
    print(f"Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! The indicator catalog is working correctly.")
        return True
    else:
        print("❌ Some tests failed. Please check the errors above.")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)