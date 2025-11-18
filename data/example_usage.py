"""
Example Usage of Technical Indicator Catalog and Backend
Demonstrates how to use the TypeScript catalog with Python backend
"""

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from simple_indicator_backend import SimpleIndicatorBackend
import json

def create_sample_data(n=200):
    """Create sample OHLCV data for testing"""
    np.random.seed(42)
    
    # Generate price data with trend and volatility
    trend = np.linspace(100, 120, n)
    noise = np.cumsum(np.random.randn(n) * 0.5)
    close = trend + noise
    
    # Generate high, low, open based on close
    high = close + np.random.rand(n) * 2
    low = close - np.random.rand(n) * 2
    open_price = np.roll(close, 1)
    open_price[0] = close[0]
    
    # Generate volume
    volume = np.random.randint(1000, 10000, n)
    
    return {
        'open': open_price,
        'high': high,
        'low': low,
        'close': close,
        'volume': volume
    }

def test_trend_indicators():
    """Test trend indicators"""
    print("=== Testing Trend Indicators ===")
    backend = SimpleIndicatorBackend()
    data = create_sample_data()
    
    # Test SMA
    sma_20 = backend.sma(data['close'], period=20)
    sma_50 = backend.sma(data['close'], period=50)
    print(f"SMA(20) latest: {sma_20[-1]:.2f}")
    print(f"SMA(50) latest: {sma_50[-1]:.2f}")
    
    # Test EMA
    ema_20 = backend.ema(data['close'], period=20)
    print(f"EMA(20) latest: {ema_20[-1]:.2f}")
    
    # Test WMA
    wma_20 = backend.wma(data['close'], period=20)
    print(f"WMA(20) latest: {wma_20[-1]:.2f}")
    
    # Test VWMA
    vwma_20 = backend.vwma(data['close'], data['volume'], period=20)
    print(f"VWMA(20) latest: {vwma_20[-1]:.2f}")

def test_momentum_indicators():
    """Test momentum indicators"""
    print("\n=== Testing Momentum Indicators ===")
    backend = SimpleIndicatorBackend()
    data = create_sample_data()
    
    # Test RSI
    rsi = backend.rsi(data['close'], period=14)
    print(f"RSI(14) latest: {rsi[-1]:.2f}")
    
    # Test Stochastic
    stoch_k, stoch_d = backend.stoch(data['high'], data['low'], data['close'], k_period=14, d_period=3)
    print(f"Stochastic %K latest: {stoch_k[-1]:.2f}")
    print(f"Stochastic %D latest: {stoch_d[-1]:.2f}")
    
    # Test MACD
    macd, macd_signal, macd_hist = backend.macd(data['close'])
    print(f"MACD latest: {macd[-1]:.2f}")
    print(f"MACD Signal latest: {macd_signal[-1]:.2f}")
    print(f"MACD Histogram latest: {macd_hist[-1]:.2f}")
    
    # Test CCI
    cci = backend.cci(data['high'], data['low'], data['close'], period=14)
    print(f"CCI(14) latest: {cci[-1]:.2f}")

def test_volatility_indicators():
    """Test volatility indicators"""
    print("\n=== Testing Volatility Indicators ===")
    backend = SimpleIndicatorBackend()
    data = create_sample_data()
    
    # Test ATR
    atr = backend.atr(data['high'], data['low'], data['close'], period=14)
    print(f"ATR(14) latest: {atr[-1]:.2f}")
    
    # Test Bollinger Bands
    bb_upper, bb_middle, bb_lower = backend.bbands(data['close'], period=20, std_dev=2)
    print(f"BB Upper latest: {bb_upper[-1]:.2f}")
    print(f"BB Middle latest: {bb_middle[-1]:.2f}")
    print(f"BB Lower latest: {bb_lower[-1]:.2f}")
    
    # Test Keltner Channels
    kc_upper, kc_middle, kc_lower = backend.kc(data['high'], data['low'], data['close'], period=20, multiplier=2)
    print(f"KC Upper latest: {kc_upper[-1]:.2f}")
    print(f"KC Middle latest: {kc_middle[-1]:.2f}")
    print(f"KC Lower latest: {kc_lower[-1]:.2f}")

def test_volume_indicators():
    """Test volume indicators"""
    print("\n=== Testing Volume Indicators ===")
    backend = SimpleIndicatorBackend()
    data = create_sample_data()
    
    # Test OBV
    obv = backend.obv(data['close'], data['volume'])
    print(f"OBV latest: {obv[-1]:.2f}")
    
    # Test A/D Line
    ad = backend.ad(data['high'], data['low'], data['close'], data['volume'])
    print(f"A/D Line latest: {ad[-1]:.2f}")
    
    # Test CMF
    cmf = backend.cmf(data['high'], data['low'], data['close'], data['volume'], period=20)
    print(f"CMF(20) latest: {cmf[-1]:.2f}")
    
    # Test VWAP
    vwap = backend.vwap(data['high'], data['low'], data['close'], data['volume'])
    print(f"VWAP latest: {vwap[-1]:.2f}")

def test_trend_strength_indicators():
    """Test trend strength indicators"""
    print("\n=== Testing Trend Strength Indicators ===")
    backend = SimpleIndicatorBackend()
    data = create_sample_data()
    
    # Test ADX
    adx = backend.adx(data['high'], data['low'], data['close'], period=14)
    try:
        adx_value = float(adx[-1]) if not np.isnan(adx[-1]) else 0
    except (ValueError, TypeError):
        adx_value = 0
    print(f"ADX(14) latest: {adx_value:.2f}")
    
    # Test +DI and -DI
    plus_di = backend.plus_di(data['high'], data['low'], data['close'], period=14)
    minus_di = backend.minus_di(data['high'], data['low'], data['close'], period=14)
    print(f"+DI(14) latest: {plus_di[-1]:.2f}")
    print(f"-DI(14) latest: {minus_di[-1]:.2f}")
    
    # Test Aroon
    aroon_down, aroon_up = backend.aroon(data['high'], data['low'], period=14)
    print(f"Aroon Up(14) latest: {aroon_up[-1]:.2f}")
    print(f"Aroon Down(14) latest: {aroon_down[-1]:.2f}")

def test_custom_indicators():
    """Test custom indicators"""
    print("\n=== Testing Custom Indicators ===")
    backend = SimpleIndicatorBackend()
    data = create_sample_data()
    
    # Test Supertrend
    try:
        supertrend, direction = backend.supertrend(data['high'], data['low'], data['close'], period=10, multiplier=3)
        print(f"Supertrend latest: {supertrend[-1]:.2f}")
        print(f"Supertrend Direction latest: {direction[-1]}")
    except Exception as e:
        print(f"Supertrend error: {e}")
    
    # Test Parabolic SAR
    psar = backend.psar(data['high'], data['low'], data['close'], step=0.02, maximum=0.2)
    try:
        psar_value = float(psar[-1]) if not np.isnan(psar[-1]) else 0
    except (ValueError, TypeError):
        psar_value = 0
    print(f"PSAR latest: {psar_value:.2f}")
    
    # Test Ichimoku (simplified)
    try:
        ichimoku_result = backend.ichimoku(data['high'], data['low'], data['close'])
        print(f"Ichimoku components: {len(ichimoku_result)}")
    except Exception as e:
        print(f"Ichimoku error: {e}")

def create_visualization():
    """Create a comprehensive visualization of indicators"""
    print("\n=== Creating Visualization ===")
    backend = SimpleIndicatorBackend()
    data = create_sample_data(100)
    
    # Calculate indicators
    sma_20 = backend.sma(data['close'], period=20)
    rsi = backend.rsi(data['close'], period=14)
    bb_upper, bb_middle, bb_lower = backend.bbands(data['close'], period=20, std_dev=2)
    macd, macd_signal, macd_hist = backend.macd(data['close'])
    
    # Create subplots
    fig, ((ax1, ax2), (ax3, ax4)) = plt.subplots(2, 2, figsize=(15, 10))
    
    # Price chart with SMA and Bollinger Bands
    ax1.plot(data['close'], label='Close', linewidth=1)
    ax1.plot(sma_20, label='SMA(20)', linewidth=1)
    ax1.plot(bb_upper, label='BB Upper', alpha=0.7, linewidth=0.8)
    ax1.plot(bb_middle, label='BB Middle', alpha=0.7, linewidth=0.8)
    ax1.plot(bb_lower, label='BB Lower', alpha=0.7, linewidth=0.8)
    ax1.fill_between(range(len(bb_upper)), bb_upper, bb_lower, alpha=0.1)
    ax1.set_title('Price with SMA and Bollinger Bands')
    ax1.legend()
    ax1.grid(True, alpha=0.3)
    
    # RSI
    ax2.plot(rsi, label='RSI(14)', color='purple', linewidth=1)
    ax2.axhline(y=70, color='r', linestyle='--', alpha=0.7, label='Overbought')
    ax2.axhline(y=30, color='g', linestyle='--', alpha=0.7, label='Oversold')
    ax2.axhline(y=50, color='k', linestyle='-', alpha=0.5)
    ax2.set_title('RSI Oscillator')
    ax2.set_ylim(0, 100)
    ax2.legend()
    ax2.grid(True, alpha=0.3)
    
    # MACD
    ax3.plot(macd, label='MACD', linewidth=1)
    ax3.plot(macd_signal, label='Signal', linewidth=1)
    ax3.bar(range(len(macd_hist)), macd_hist, label='Histogram', alpha=0.6, width=0.8)
    ax3.axhline(y=0, color='k', linestyle='-', alpha=0.5)
    ax3.set_title('MACD')
    ax3.legend()
    ax3.grid(True, alpha=0.3)
    
    # Volume
    ax4.bar(range(len(data['volume'])), data['volume'], alpha=0.6, width=0.8)
    ax4.set_title('Volume')
    ax4.grid(True, alpha=0.3)
    
    plt.tight_layout()
    plt.savefig('/workspace/data/indicators_visualization.png', dpi=300, bbox_inches='tight')
    print("Visualization saved as 'indicators_visualization.png'")

def demonstrate_catalog_usage():
    """Demonstrate how to use the TypeScript catalog with Python"""
    print("\n=== Demonstrating Catalog Usage ===")
    
    # Simulate TypeScript catalog data (in real usage, this would be imported)
    catalog_data = {
        "indicators": [
            {
                "key": "sma",
                "name": "Simple Moving Average",
                "description": "Calculates the average price over a specified period",
                "inputs": [{"name": "close", "type": "price", "description": "Closing prices", "required": True}],
                "params": [{"name": "period", "type": "number", "description": "Number of periods", "default": 20, "min": 1, "max": 200, "required": True}],
                "category": "trend",
                "pythonFunction": "sma",
                "pythonInputs": ["close", "period"],
                "pythonOutput": "sma_values",
                "usagePattern": "backend.sma(close, period=20)",
                "library": "ta-lib"
            },
            {
                "key": "rsi",
                "name": "Relative Strength Index",
                "description": "Measures the speed and magnitude of price changes",
                "inputs": [{"name": "close", "type": "price", "description": "Closing prices", "required": True}],
                "params": [{"name": "period", "type": "number", "description": "Number of periods", "default": 14, "min": 1, "max": 100, "required": True}],
                "category": "momentum",
                "pythonFunction": "rsi",
                "pythonInputs": ["close", "period"],
                "pythonOutput": "rsi_values",
                "usagePattern": "backend.rsi(close, period=14)",
                "library": "ta-lib"
            }
        ]
    }
    
    # Function to find indicator by name
    def get_indicator_by_name(name):
        for indicator in catalog_data["indicators"]:
            if indicator["name"].lower() == name.lower() or indicator["key"].lower() == name.lower():
                return indicator
        return None
    
    # Function to filter by category
    def filter_by_category(category):
        return [ind for ind in catalog_data["indicators"] if ind["category"].lower() == category.lower()]
    
    # Demonstrate usage
    sma_indicator = get_indicator_by_name("SMA")
    print(f"Found SMA indicator: {sma_indicator['name']}")
    print(f"Description: {sma_indicator['description']}")
    print(f"Required inputs: {[inp['name'] for inp in sma_indicator['inputs']]}")
    print(f"Parameters: {[param['name'] for param in sma_indicator['params']]}")
    
    trend_indicators = filter_by_category("trend")
    print(f"\nFound {len(trend_indicators)} trend indicators:")
    for ind in trend_indicators:
        print(f"  - {ind['name']} ({ind['key']})")
    
    momentum_indicators = filter_by_category("momentum")
    print(f"\nFound {len(momentum_indicators)} momentum indicators:")
    for ind in momentum_indicators:
        print(f"  - {ind['name']} ({ind['key']})")

def performance_test():
    """Test performance of indicators"""
    print("\n=== Performance Test ===")
    import time
    
    backend = SimpleIndicatorBackend()
    data = create_sample_data(1000)  # Larger dataset
    
    indicators_to_test = [
        ('sma', {'period': 20}),
        ('ema', {'period': 20}),
        ('rsi', {'period': 14}),
        ('macd', {}),
        ('bbands', {'period': 20, 'std_dev': 2}),
        ('atr', {'period': 14}),
        ('adx', {'period': 14}),
    ]
    
    for indicator_name, params in indicators_to_test:
        start_time = time.time()
        
        try:
            if indicator_name == 'sma':
                result = backend.sma(data['close'], **params)
            elif indicator_name == 'ema':
                result = backend.ema(data['close'], **params)
            elif indicator_name == 'rsi':
                result = backend.rsi(data['close'], **params)
            elif indicator_name == 'macd':
                result = backend.macd(data['close'], **params)
            elif indicator_name == 'bbands':
                result = backend.bbands(data['close'], **params)
            elif indicator_name == 'atr':
                result = backend.atr(data['high'], data['low'], data['close'], **params)
            elif indicator_name == 'adx':
                result = backend.adx(data['high'], data['low'], data['close'], **params)
            
            end_time = time.time()
            execution_time = (end_time - start_time) * 1000  # Convert to milliseconds
            print(f"{indicator_name.upper()}: {execution_time:.2f}ms")
            
        except Exception as e:
            print(f"{indicator_name.upper()}: Error - {e}")

def main():
    """Main function to run all tests"""
    print("Technical Indicator Catalog and Backend Demo")
    print("=" * 50)
    
    # Test all indicator categories
    test_trend_indicators()
    test_momentum_indicators()
    test_volatility_indicators()
    test_volume_indicators()
    test_trend_strength_indicators()
    test_custom_indicators()
    
    # Demonstrate catalog usage
    demonstrate_catalog_usage()
    
    # Performance test
    performance_test()
    
    # Create visualization
    try:
        create_visualization()
    except Exception as e:
        print(f"Visualization error: {e}")
    
    print("\n" + "=" * 50)
    print("Demo completed successfully!")

if __name__ == "__main__":
    main()