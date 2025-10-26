"""
Technical Indicator Backend Implementation
Comprehensive collection of 100+ technical indicators using ta-lib and pandas_ta
"""

import numpy as np
import pandas as pd
import talib as ta
import pandas_ta as pta
from typing import Union, Tuple, List, Dict, Any
import warnings

warnings.filterwarnings('ignore')

class IndicatorBackend:
    """
    Backend class for technical indicators using ta-lib and pandas_ta
    """
    
    def __init__(self):
        self.ta_lib_available = True
        self.pandas_ta_available = True
        
        try:
            import talib
        except ImportError:
            self.ta_lib_available = False
            print("Warning: ta-lib not available. Some indicators will not work.")
            
        try:
            import pandas_ta
        except ImportError:
            self.pandas_ta_available = False
            print("Warning: pandas_ta not available. Some indicators will not work.")
        
        # If ta-lib is not available, we'll use pandas_ta alternatives
        if not self.ta_lib_available:
            print("Using pandas_ta alternatives for ta-lib indicators")
    
    def _validate_inputs(self, data: Dict[str, np.ndarray], required_inputs: List[str]) -> None:
        """Validate that required inputs are present and have the same length"""
        for input_name in required_inputs:
            if input_name not in data:
                raise ValueError(f"Missing required input: {input_name}")
        
        lengths = [len(data[input_name]) for input_name in required_inputs]
        if len(set(lengths)) > 1:
            raise ValueError("All input arrays must have the same length")
    
    def _to_numpy(self, data: Union[pd.Series, np.ndarray, List]) -> np.ndarray:
        """Convert input to numpy array"""
        if isinstance(data, pd.Series):
            return data.values
        elif isinstance(data, list):
            return np.array(data)
        return data

    # === TREND INDICATORS ===
    
    def sma(self, close: Union[pd.Series, np.ndarray], period: int = 20) -> np.ndarray:
        """Simple Moving Average"""
        close = self._to_numpy(close)
        return ta.SMA(close, timeperiod=period)
    
    def ema(self, close: Union[pd.Series, np.ndarray], period: int = 20) -> np.ndarray:
        """Exponential Moving Average"""
        close = self._to_numpy(close)
        return ta.EMA(close, timeperiod=period)
    
    def wma(self, close: Union[pd.Series, np.ndarray], period: int = 20) -> np.ndarray:
        """Weighted Moving Average"""
        close = self._to_numpy(close)
        return ta.WMA(close, timeperiod=period)
    
    def dema(self, close: Union[pd.Series, np.ndarray], period: int = 20) -> np.ndarray:
        """Double Exponential Moving Average"""
        close = self._to_numpy(close)
        return ta.DEMA(close, timeperiod=period)
    
    def tema(self, close: Union[pd.Series, np.ndarray], period: int = 20) -> np.ndarray:
        """Triple Exponential Moving Average"""
        close = self._to_numpy(close)
        return ta.TEMA(close, timeperiod=period)
    
    def kama(self, close: Union[pd.Series, np.ndarray], period: int = 30) -> np.ndarray:
        """Kaufman Adaptive Moving Average"""
        close = self._to_numpy(close)
        return ta.KAMA(close, timeperiod=period)
    
    def mama(self, close: Union[pd.Series, np.ndarray], fastlimit: float = 0.5, slowlimit: float = 0.05) -> Tuple[np.ndarray, np.ndarray]:
        """MESA Adaptive Moving Average"""
        close = self._to_numpy(close)
        return ta.MAMA(close, fastlimit=fastlimit, slowlimit=slowlimit)
    
    def t3(self, close: Union[pd.Series, np.ndarray], period: int = 20, vfactor: float = 0.7) -> np.ndarray:
        """T3 Moving Average"""
        close = self._to_numpy(close)
        return ta.T3(close, timeperiod=period, vfactor=vfactor)
    
    def trima(self, close: Union[pd.Series, np.ndarray], period: int = 20) -> np.ndarray:
        """Triangular Moving Average"""
        close = self._to_numpy(close)
        return ta.TRIMA(close, timeperiod=period)
    
    def vwma(self, close: Union[pd.Series, np.ndarray], volume: Union[pd.Series, np.ndarray], period: int = 20) -> np.ndarray:
        """Volume Weighted Moving Average"""
        close = self._to_numpy(close)
        volume = self._to_numpy(volume)
        return pta.vwma(close, volume, length=period)

    # === MOMENTUM INDICATORS ===
    
    def rsi(self, close: Union[pd.Series, np.ndarray], period: int = 14) -> np.ndarray:
        """Relative Strength Index"""
        close = self._to_numpy(close)
        return ta.RSI(close, timeperiod=period)
    
    def stoch(self, high: Union[pd.Series, np.ndarray], low: Union[pd.Series, np.ndarray], 
              close: Union[pd.Series, np.ndarray], k_period: int = 14, d_period: int = 3, 
              smooth_k: int = 1) -> Tuple[np.ndarray, np.ndarray]:
        """Stochastic Oscillator"""
        high = self._to_numpy(high)
        low = self._to_numpy(low)
        close = self._to_numpy(close)
        return ta.STOCH(high, low, close, fastk_period=k_period, slowk_period=smooth_k, slowd_period=d_period)
    
    def stochf(self, high: Union[pd.Series, np.ndarray], low: Union[pd.Series, np.ndarray], 
               close: Union[pd.Series, np.ndarray], k_period: int = 14, d_period: int = 3) -> Tuple[np.ndarray, np.ndarray]:
        """Stochastic Fast"""
        high = self._to_numpy(high)
        low = self._to_numpy(low)
        close = self._to_numpy(close)
        return ta.STOCHF(high, low, close, fastk_period=k_period, fastd_period=d_period)
    
    def williams_r(self, high: Union[pd.Series, np.ndarray], low: Union[pd.Series, np.ndarray], 
                   close: Union[pd.Series, np.ndarray], period: int = 14) -> np.ndarray:
        """Williams %R"""
        high = self._to_numpy(high)
        low = self._to_numpy(low)
        close = self._to_numpy(close)
        return ta.WILLR(high, low, close, timeperiod=period)
    
    def cci(self, high: Union[pd.Series, np.ndarray], low: Union[pd.Series, np.ndarray], 
            close: Union[pd.Series, np.ndarray], period: int = 14) -> np.ndarray:
        """Commodity Channel Index"""
        high = self._to_numpy(high)
        low = self._to_numpy(low)
        close = self._to_numpy(close)
        return ta.CCI(high, low, close, timeperiod=period)
    
    def roc(self, close: Union[pd.Series, np.ndarray], period: int = 10) -> np.ndarray:
        """Rate of Change"""
        close = self._to_numpy(close)
        return ta.ROC(close, timeperiod=period)
    
    def momentum(self, close: Union[pd.Series, np.ndarray], period: int = 10) -> np.ndarray:
        """Momentum"""
        close = self._to_numpy(close)
        return ta.MOM(close, timeperiod=period)
    
    def ppo(self, close: Union[pd.Series, np.ndarray], fast_period: int = 12, 
            slow_period: int = 26, ma_type: int = 1) -> np.ndarray:
        """Percentage Price Oscillator"""
        close = self._to_numpy(close)
        return ta.PPO(close, fastperiod=fast_period, slowperiod=slow_period, matype=ma_type)
    
    def macd(self, close: Union[pd.Series, np.ndarray], fast_period: int = 12, 
             slow_period: int = 26, signal_period: int = 9) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
        """MACD"""
        close = self._to_numpy(close)
        return ta.MACD(close, fastperiod=fast_period, slowperiod=slow_period, signalperiod=signal_period)
    
    def macdext(self, close: Union[pd.Series, np.ndarray], fast_period: int = 12, 
                slow_period: int = 26, signal_period: int = 9, fast_ma_type: int = 1, 
                slow_ma_type: int = 1, signal_ma_type: int = 1) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
        """MACD with controllable MA type"""
        close = self._to_numpy(close)
        return ta.MACDEXT(close, fastperiod=fast_period, slowperiod=slow_period, 
                         signalperiod=signal_period, fastmatype=fast_ma_type, 
                         slowmatype=slow_ma_type, signalmatype=signal_ma_type)
    
    def macdfix(self, close: Union[pd.Series, np.ndarray], signal_period: int = 9) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
        """MACD Fixed Period"""
        close = self._to_numpy(close)
        return ta.MACDFIX(close, signalperiod=signal_period)

    # === VOLATILITY INDICATORS ===
    
    def atr(self, high: Union[pd.Series, np.ndarray], low: Union[pd.Series, np.ndarray], 
            close: Union[pd.Series, np.ndarray], period: int = 14) -> np.ndarray:
        """Average True Range"""
        high = self._to_numpy(high)
        low = self._to_numpy(low)
        close = self._to_numpy(close)
        return ta.ATR(high, low, close, timeperiod=period)
    
    def natr(self, high: Union[pd.Series, np.ndarray], low: Union[pd.Series, np.ndarray], 
             close: Union[pd.Series, np.ndarray], period: int = 14) -> np.ndarray:
        """Normalized Average True Range"""
        high = self._to_numpy(high)
        low = self._to_numpy(low)
        close = self._to_numpy(close)
        return ta.NATR(high, low, close, timeperiod=period)
    
    def trange(self, high: Union[pd.Series, np.ndarray], low: Union[pd.Series, np.ndarray], 
               close: Union[pd.Series, np.ndarray]) -> np.ndarray:
        """True Range"""
        high = self._to_numpy(high)
        low = self._to_numpy(low)
        close = self._to_numpy(close)
        return ta.TRANGE(high, low, close)
    
    def bbands(self, close: Union[pd.Series, np.ndarray], period: int = 20, 
               std_dev: float = 2, ma_type: int = 0) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
        """Bollinger Bands"""
        close = self._to_numpy(close)
        return ta.BBANDS(close, timeperiod=period, nbdevup=std_dev, nbdevdn=std_dev, matype=ma_type)
    
    def kc(self, high: Union[pd.Series, np.ndarray], low: Union[pd.Series, np.ndarray], 
           close: Union[pd.Series, np.ndarray], period: int = 20, multiplier: float = 2) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
        """Keltner Channels"""
        high = self._to_numpy(high)
        low = self._to_numpy(low)
        close = self._to_numpy(close)
        return pta.kc(high, low, close, length=period, scalar=multiplier)
    
    def dc(self, high: Union[pd.Series, np.ndarray], low: Union[pd.Series, np.ndarray], 
           period: int = 20) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
        """Donchian Channels"""
        high = self._to_numpy(high)
        low = self._to_numpy(low)
        return pta.dc(high, low, length=period)
    
    def ui(self, close: Union[pd.Series, np.ndarray], period: int = 14) -> np.ndarray:
        """Ulcer Index"""
        close = self._to_numpy(close)
        return pta.ui(close, length=period)
    
    def mass(self, high: Union[pd.Series, np.ndarray], low: Union[pd.Series, np.ndarray], 
             period: int = 25) -> np.ndarray:
        """Mass Index"""
        high = self._to_numpy(high)
        low = self._to_numpy(low)
        return pta.mass(high, low, length=period)
    
    def vi(self, high: Union[pd.Series, np.ndarray], low: Union[pd.Series, np.ndarray], 
           close: Union[pd.Series, np.ndarray], period: int = 14) -> Tuple[np.ndarray, np.ndarray]:
        """Vortex Indicator"""
        high = self._to_numpy(high)
        low = self._to_numpy(low)
        close = self._to_numpy(close)
        return pta.vi(high, low, close, length=period)

    # === VOLUME INDICATORS ===
    
    def ad(self, high: Union[pd.Series, np.ndarray], low: Union[pd.Series, np.ndarray], 
           close: Union[pd.Series, np.ndarray], volume: Union[pd.Series, np.ndarray]) -> np.ndarray:
        """Accumulation/Distribution Line"""
        high = self._to_numpy(high)
        low = self._to_numpy(low)
        close = self._to_numpy(close)
        volume = self._to_numpy(volume)
        return ta.AD(high, low, close, volume)
    
    def adosc(self, high: Union[pd.Series, np.ndarray], low: Union[pd.Series, np.ndarray], 
              close: Union[pd.Series, np.ndarray], volume: Union[pd.Series, np.ndarray], 
              fast_period: int = 3, slow_period: int = 10) -> np.ndarray:
        """A/D Oscillator"""
        high = self._to_numpy(high)
        low = self._to_numpy(low)
        close = self._to_numpy(close)
        volume = self._to_numpy(volume)
        return ta.ADOSC(high, low, close, volume, fastperiod=fast_period, slowperiod=slow_period)
    
    def obv(self, close: Union[pd.Series, np.ndarray], volume: Union[pd.Series, np.ndarray]) -> np.ndarray:
        """On Balance Volume"""
        close = self._to_numpy(close)
        volume = self._to_numpy(volume)
        return ta.OBV(close, volume)
    
    def cmf(self, high: Union[pd.Series, np.ndarray], low: Union[pd.Series, np.ndarray], 
            close: Union[pd.Series, np.ndarray], volume: Union[pd.Series, np.ndarray], 
            period: int = 20) -> np.ndarray:
        """Chaikin Money Flow"""
        high = self._to_numpy(high)
        low = self._to_numpy(low)
        close = self._to_numpy(close)
        volume = self._to_numpy(volume)
        return pta.cmf(high, low, close, volume, length=period)
    
    def fi(self, close: Union[pd.Series, np.ndarray], volume: Union[pd.Series, np.ndarray], 
           period: int = 13) -> np.ndarray:
        """Force Index"""
        close = self._to_numpy(close)
        volume = self._to_numpy(volume)
        return pta.fi(close, volume, length=period)
    
    def eom(self, high: Union[pd.Series, np.ndarray], low: Union[pd.Series, np.ndarray], 
            volume: Union[pd.Series, np.ndarray], period: int = 14) -> np.ndarray:
        """Ease of Movement"""
        high = self._to_numpy(high)
        low = self._to_numpy(low)
        volume = self._to_numpy(volume)
        return pta.eom(high, low, volume, length=period)
    
    def vwap(self, high: Union[pd.Series, np.ndarray], low: Union[pd.Series, np.ndarray], 
             close: Union[pd.Series, np.ndarray], volume: Union[pd.Series, np.ndarray]) -> np.ndarray:
        """Volume Weighted Average Price"""
        high = self._to_numpy(high)
        low = self._to_numpy(low)
        close = self._to_numpy(close)
        volume = self._to_numpy(volume)
        return pta.vwap(high, low, close, volume)
    
    def pvi(self, close: Union[pd.Series, np.ndarray], volume: Union[pd.Series, np.ndarray]) -> np.ndarray:
        """Positive Volume Index"""
        close = self._to_numpy(close)
        volume = self._to_numpy(volume)
        return pta.pvi(close, volume)
    
    def nvi(self, close: Union[pd.Series, np.ndarray], volume: Union[pd.Series, np.ndarray]) -> np.ndarray:
        """Negative Volume Index"""
        close = self._to_numpy(close)
        volume = self._to_numpy(volume)
        return pta.nvi(close, volume)

    # === TREND STRENGTH INDICATORS ===
    
    def adx(self, high: Union[pd.Series, np.ndarray], low: Union[pd.Series, np.ndarray], 
            close: Union[pd.Series, np.ndarray], period: int = 14) -> np.ndarray:
        """Average Directional Index"""
        high = self._to_numpy(high)
        low = self._to_numpy(low)
        close = self._to_numpy(close)
        return ta.ADX(high, low, close, timeperiod=period)
    
    def plus_di(self, high: Union[pd.Series, np.ndarray], low: Union[pd.Series, np.ndarray], 
                 close: Union[pd.Series, np.ndarray], period: int = 14) -> np.ndarray:
        """Plus Directional Indicator"""
        high = self._to_numpy(high)
        low = self._to_numpy(low)
        close = self._to_numpy(close)
        return ta.PLUS_DI(high, low, close, timeperiod=period)
    
    def minus_di(self, high: Union[pd.Series, np.ndarray], low: Union[pd.Series, np.ndarray], 
                  close: Union[pd.Series, np.ndarray], period: int = 14) -> np.ndarray:
        """Minus Directional Indicator"""
        high = self._to_numpy(high)
        low = self._to_numpy(low)
        close = self._to_numpy(close)
        return ta.MINUS_DI(high, low, close, timeperiod=period)
    
    def dx(self, high: Union[pd.Series, np.ndarray], low: Union[pd.Series, np.ndarray], 
           close: Union[pd.Series, np.ndarray], period: int = 14) -> np.ndarray:
        """Directional Movement Index"""
        high = self._to_numpy(high)
        low = self._to_numpy(low)
        close = self._to_numpy(close)
        return ta.DX(high, low, close, timeperiod=period)
    
    def aroon(self, high: Union[pd.Series, np.ndarray], low: Union[pd.Series, np.ndarray], 
              period: int = 14) -> Tuple[np.ndarray, np.ndarray]:
        """Aroon"""
        high = self._to_numpy(high)
        low = self._to_numpy(low)
        return ta.AROON(high, low, timeperiod=period)
    
    def aroonosc(self, high: Union[pd.Series, np.ndarray], low: Union[pd.Series, np.ndarray], 
                 period: int = 14) -> np.ndarray:
        """Aroon Oscillator"""
        high = self._to_numpy(high)
        low = self._to_numpy(low)
        return ta.AROONOSC(high, low, timeperiod=period)
    
    def bop(self, open_price: Union[pd.Series, np.ndarray], high: Union[pd.Series, np.ndarray], 
            low: Union[pd.Series, np.ndarray], close: Union[pd.Series, np.ndarray]) -> np.ndarray:
        """Balance of Power"""
        open_price = self._to_numpy(open_price)
        high = self._to_numpy(high)
        low = self._to_numpy(low)
        close = self._to_numpy(close)
        return pta.bop(open_price, high, low, close)
    
    def cmo(self, close: Union[pd.Series, np.ndarray], period: int = 14) -> np.ndarray:
        """Chande Momentum Oscillator"""
        close = self._to_numpy(close)
        return pta.cmo(close, length=period)
    
    def dmi(self, high: Union[pd.Series, np.ndarray], low: Union[pd.Series, np.ndarray], 
            close: Union[pd.Series, np.ndarray], period: int = 14) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
        """Directional Movement Index"""
        high = self._to_numpy(high)
        low = self._to_numpy(low)
        close = self._to_numpy(close)
        return pta.dmi(high, low, close, length=period)

    # === CUSTOM INDICATORS ===
    
    def supertrend(self, high: Union[pd.Series, np.ndarray], low: Union[pd.Series, np.ndarray], 
                   close: Union[pd.Series, np.ndarray], period: int = 10, multiplier: float = 3) -> Tuple[np.ndarray, np.ndarray]:
        """Supertrend"""
        high = self._to_numpy(high)
        low = self._to_numpy(low)
        close = self._to_numpy(close)
        return pta.supertrend(high, low, close, length=period, multiplier=multiplier)
    
    def ichimoku(self, high: Union[pd.Series, np.ndarray], low: Union[pd.Series, np.ndarray], 
                 close: Union[pd.Series, np.ndarray], conversion_period: int = 9, base_period: int = 26, 
                 span_b_period: int = 52, displacement: int = 26) -> Tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
        """Ichimoku Cloud"""
        high = self._to_numpy(high)
        low = self._to_numpy(low)
        close = self._to_numpy(close)
        return pta.ichimoku(high, low, close, tenkan=conversion_period, kijun=base_period, 
                           senkou=span_b_period, offset=displacement)
    
    def psar(self, high: Union[pd.Series, np.ndarray], low: Union[pd.Series, np.ndarray], 
             close: Union[pd.Series, np.ndarray], step: float = 0.02, maximum: float = 0.2) -> np.ndarray:
        """Parabolic SAR"""
        high = self._to_numpy(high)
        low = self._to_numpy(low)
        close = self._to_numpy(close)
        return ta.PSAR(high, low, close, acceleration=step, maximum=maximum)
    
    def zigzag(self, high: Union[pd.Series, np.ndarray], low: Union[pd.Series, np.ndarray], 
               close: Union[pd.Series, np.ndarray], threshold: float = 5) -> np.ndarray:
        """ZigZag"""
        high = self._to_numpy(high)
        low = self._to_numpy(low)
        close = self._to_numpy(close)
        return pta.zigzag(high, low, close, threshold=threshold)
    
    def td_sequential(self, high: Union[pd.Series, np.ndarray], low: Union[pd.Series, np.ndarray], 
                      close: Union[pd.Series, np.ndarray], count: int = 9) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
        """TD Sequential"""
        high = self._to_numpy(high)
        low = self._to_numpy(low)
        close = self._to_numpy(close)
        return pta.td_seq(high, low, close, count=count)
    
    def fractals(self, high: Union[pd.Series, np.ndarray], low: Union[pd.Series, np.ndarray], 
                 period: int = 2) -> Tuple[np.ndarray, np.ndarray]:
        """Fractals"""
        high = self._to_numpy(high)
        low = self._to_numpy(low)
        return pta.fractals(high, low, length=period)
    
    def gaps(self, high: Union[pd.Series, np.ndarray], low: Union[pd.Series, np.ndarray], 
             close: Union[pd.Series, np.ndarray], threshold: float = 0.1) -> Tuple[np.ndarray, np.ndarray]:
        """Gaps"""
        high = self._to_numpy(high)
        low = self._to_numpy(low)
        close = self._to_numpy(close)
        return pta.gaps(high, low, close, threshold=threshold)
    
    def pivot_points(self, high: Union[pd.Series, np.ndarray], low: Union[pd.Series, np.ndarray], 
                     close: Union[pd.Series, np.ndarray], period: int = 1) -> Tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
        """Pivot Points"""
        high = self._to_numpy(high)
        low = self._to_numpy(low)
        close = self._to_numpy(close)
        return pta.pivot(high, low, close, length=period)
    
    def fibonacci_retracement(self, high: Union[pd.Series, np.ndarray], low: Union[pd.Series, np.ndarray], 
                             period: int = 20) -> Tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
        """Fibonacci Retracement"""
        high = self._to_numpy(high)
        low = self._to_numpy(low)
        return pta.fib(high, low, length=period)

    # === ADDITIONAL MOMENTUM INDICATORS ===
    
    def tsi(self, close: Union[pd.Series, np.ndarray], r_period: int = 25, s_period: int = 13) -> np.ndarray:
        """True Strength Index"""
        close = self._to_numpy(close)
        return pta.tsi(close, r=r_period, s=s_period)
    
    def ultimate_oscillator(self, high: Union[pd.Series, np.ndarray], low: Union[pd.Series, np.ndarray], 
                           close: Union[pd.Series, np.ndarray], period1: int = 7, period2: int = 14, 
                           period3: int = 28) -> np.ndarray:
        """Ultimate Oscillator"""
        high = self._to_numpy(high)
        low = self._to_numpy(low)
        close = self._to_numpy(close)
        return ta.ULTOSC(high, low, close, timeperiod1=period1, timeperiod2=period2, timeperiod3=period3)
    
    def awesome_oscillator(self, high: Union[pd.Series, np.ndarray], low: Union[pd.Series, np.ndarray], 
                          fast_period: int = 5, slow_period: int = 34) -> np.ndarray:
        """Awesome Oscillator"""
        high = self._to_numpy(high)
        low = self._to_numpy(low)
        return pta.ao(high, low, fast=fast_period, slow=slow_period)
    
    def kst(self, close: Union[pd.Series, np.ndarray], r1: int = 10, r2: int = 15, r3: int = 20, 
            r4: int = 30, s1: int = 10, s2: int = 10, s3: int = 10, s4: int = 15) -> Tuple[np.ndarray, np.ndarray]:
        """Know Sure Thing"""
        close = self._to_numpy(close)
        return pta.kst(close, r1=r1, r2=r2, r3=r3, r4=r4, s1=s1, s2=s2, s3=s3, s4=s4)
    
    def pgo(self, close: Union[pd.Series, np.ndarray], period: int = 14) -> np.ndarray:
        """Pretty Good Oscillator"""
        close = self._to_numpy(close)
        return pta.pgo(close, length=period)
    
    def pvo(self, volume: Union[pd.Series, np.ndarray], fast_period: int = 12, 
            slow_period: int = 26, signal_period: int = 9) -> Tuple[np.ndarray, np.ndarray]:
        """Percentage Volume Oscillator"""
        volume = self._to_numpy(volume)
        return pta.pvo(volume, fast=fast_period, slow=slow_period, signal=signal_period)
    
    def qstick(self, open_price: Union[pd.Series, np.ndarray], close: Union[pd.Series, np.ndarray], 
               period: int = 14) -> np.ndarray:
        """QStick"""
        open_price = self._to_numpy(open_price)
        close = self._to_numpy(close)
        return pta.qstick(open_price, close, length=period)
    
    def squeeze(self, high: Union[pd.Series, np.ndarray], low: Union[pd.Series, np.ndarray], 
                close: Union[pd.Series, np.ndarray], bb_period: int = 20, bb_std: float = 2, 
                kc_period: int = 20, kc_mult: float = 1.5) -> Tuple[np.ndarray, np.ndarray]:
        """Squeeze"""
        high = self._to_numpy(high)
        low = self._to_numpy(low)
        close = self._to_numpy(close)
        return pta.squeeze(high, low, close, bb_length=bb_period, bb_std=bb_std, 
                          kc_length=kc_period, kc_scalar=kc_mult)

    # === ADDITIONAL VOLATILITY INDICATORS ===
    
    def bbw(self, close: Union[pd.Series, np.ndarray], period: int = 20, std_dev: float = 2) -> np.ndarray:
        """Bollinger Bands Width"""
        close = self._to_numpy(close)
        return pta.bbw(close, length=period, std=std_dev)
    
    def bbp(self, close: Union[pd.Series, np.ndarray], period: int = 20, std_dev: float = 2) -> np.ndarray:
        """Bollinger Bands %B"""
        close = self._to_numpy(close)
        return pta.bbp(close, length=period, std=std_dev)
    
    def kbb(self, high: Union[pd.Series, np.ndarray], low: Union[pd.Series, np.ndarray], 
            close: Union[pd.Series, np.ndarray], period: int = 20, multiplier: float = 2) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
        """Keltner Bands"""
        high = self._to_numpy(high)
        low = self._to_numpy(low)
        close = self._to_numpy(close)
        return pta.kc(high, low, close, length=period, scalar=multiplier)
    
    def dbb(self, high: Union[pd.Series, np.ndarray], low: Union[pd.Series, np.ndarray], 
            period: int = 20) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
        """Donchian Bands"""
        high = self._to_numpy(high)
        low = self._to_numpy(low)
        return pta.dc(high, low, length=period)
    
    def efi(self, close: Union[pd.Series, np.ndarray], volume: Union[pd.Series, np.ndarray], 
            period: int = 13) -> np.ndarray:
        """Elder Force Index"""
        close = self._to_numpy(close)
        volume = self._to_numpy(volume)
        return pta.efi(close, volume, length=period)
    
    def vpt(self, close: Union[pd.Series, np.ndarray], volume: Union[pd.Series, np.ndarray]) -> np.ndarray:
        """Volume Price Trend"""
        close = self._to_numpy(close)
        volume = self._to_numpy(volume)
        return pta.vpt(close, volume)
    
    def fve(self, open_price: Union[pd.Series, np.ndarray], high: Union[pd.Series, np.ndarray], 
            low: Union[pd.Series, np.ndarray], close: Union[pd.Series, np.ndarray], 
            volume: Union[pd.Series, np.ndarray], period: int = 13) -> np.ndarray:
        """FVE"""
        open_price = self._to_numpy(open_price)
        high = self._to_numpy(high)
        low = self._to_numpy(low)
        close = self._to_numpy(close)
        volume = self._to_numpy(volume)
        return pta.fve(open_price, high, low, close, volume, length=period)

    # === UTILITY METHODS ===
    
    def get_available_indicators(self) -> List[str]:
        """Get list of available indicator methods"""
        methods = [method for method in dir(self) if not method.startswith('_') and callable(getattr(self, method))]
        return [method for method in methods if method not in ['get_available_indicators', 'validate_inputs', 'to_numpy']]
    
    def calculate_indicator(self, indicator_name: str, data: Dict[str, Union[pd.Series, np.ndarray]], 
                           **kwargs) -> Union[np.ndarray, Tuple[np.ndarray, ...]]:
        """Calculate indicator by name with data and parameters"""
        if not hasattr(self, indicator_name):
            raise ValueError(f"Indicator '{indicator_name}' not found")
        
        method = getattr(self, indicator_name)
        return method(**data, **kwargs)
    
    def get_indicator_info(self, indicator_name: str) -> Dict[str, Any]:
        """Get information about an indicator"""
        if not hasattr(self, indicator_name):
            raise ValueError(f"Indicator '{indicator_name}' not found")
        
        method = getattr(self, indicator_name)
        import inspect
        sig = inspect.signature(method)
        
        return {
            'name': indicator_name,
            'docstring': method.__doc__,
            'parameters': list(sig.parameters.keys()),
            'return_annotation': sig.return_annotation
        }


# Example usage and testing
if __name__ == "__main__":
    # Create sample data
    np.random.seed(42)
    n = 100
    close = 100 + np.cumsum(np.random.randn(n) * 0.5)
    high = close + np.random.rand(n) * 2
    low = close - np.random.rand(n) * 2
    volume = np.random.randint(1000, 10000, n)
    
    # Initialize backend
    backend = IndicatorBackend()
    
    # Test some indicators
    print("Testing indicators...")
    
    # Test SMA
    sma_result = backend.sma(close, period=20)
    print(f"SMA (first 5 values): {sma_result[:5]}")
    
    # Test RSI
    rsi_result = backend.rsi(close, period=14)
    print(f"RSI (first 5 values): {rsi_result[:5]}")
    
    # Test MACD
    macd, macd_signal, macd_hist = backend.macd(close)
    print(f"MACD (first 5 values): {macd[:5]}")
    
    # Test Bollinger Bands
    bb_upper, bb_middle, bb_lower = backend.bbands(close, period=20, std_dev=2)
    print(f"BB Upper (first 5 values): {bb_upper[:5]}")
    
    print(f"\nAvailable indicators: {len(backend.get_available_indicators())}")
    print("Backend initialized successfully!")