"""
Market Data Service

Comprehensive market data service for real-time and historical data
from multiple sources including Indian exchanges and international markets.
"""

import asyncio
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Union
from dataclasses import dataclass
from enum import Enum

import aiohttp
import pandas as pd
from sqlalchemy.orm import Session

from app.models import BrokerAccount
from app.utils.calculations import calculate_technical_indicators
from app.utils.validators import validate_symbol, validate_timeframe

logger = logging.getLogger(__name__)


class DataSource(str, Enum):
    """Market data sources."""
    ZERODHA = "zerodha"
    ANGEL_ONE = "angel_one"
    UPSTOX = "upstox"
    ALPHA_VANTAGE = "alpha_vantage"
    YAHOO_FINANCE = "yahoo_finance"
    POLYGON = "polygon"
    QUANDL = "quandl"
    NSE_API = "nse_api"
    BSE_API = "bse_api"


class TimeFrame(str, Enum):
    """Time frame options."""
    MINUTE_1 = "1m"
    MINUTE_5 = "5m"
    MINUTE_15 = "15m"
    MINUTE_30 = "30m"
    HOUR_1 = "1h"
    HOUR_4 = "4h"
    DAY_1 = "1d"
    WEEK_1 = "1w"
    MONTH_1 = "1M"


@dataclass
class MarketData:
    """Market data structure."""
    symbol: str
    timestamp: datetime
    open: float
    high: float
    low: float
    close: float
    volume: int
    source: DataSource
    exchange: str
    metadata: Optional[Dict[str, Any]] = None


@dataclass
class Quote:
    """Real-time quote structure."""
    symbol: str
    last_price: float
    bid: float
    ask: float
    volume: int
    timestamp: datetime
    source: DataSource
    exchange: str
    metadata: Optional[Dict[str, Any]] = None


class MarketDataService:
    """Main market data service."""
    
    def __init__(self, db: Session):
        self.db = db
        self.data_sources = {}
        self.cache = {}
        self.cache_ttl = 60  # 1 minute cache TTL
        
        # Initialize data sources
        self._initialize_data_sources()
    
    def _initialize_data_sources(self):
        """Initialize available data sources."""
        self.data_sources = {
            DataSource.ZERODHA: ZerodhaDataProvider(),
            DataSource.ANGEL_ONE: AngelOneDataProvider(),
            DataSource.UPSTOX: UpstoxDataProvider(),
            DataSource.ALPHA_VANTAGE: AlphaVantageDataProvider(),
            DataSource.YAHOO_FINANCE: YahooFinanceDataProvider(),
            DataSource.NSE_API: NSEDataProvider(),
            DataSource.BSE_API: BSEDataProvider()
        }
    
    async def get_real_time_quote(self, symbol: str, source: Optional[DataSource] = None) -> Quote:
        """
        Get real-time quote for a symbol.
        
        Args:
            symbol: Trading symbol
            source: Data source (auto-detect if None)
            
        Returns:
            Real-time quote
        """
        try:
            if not source:
                source = self._detect_best_source(symbol)
            
            provider = self.data_sources.get(source)
            if not provider:
                raise ValueError(f"Data source {source} not available")
            
            quote = await provider.get_quote(symbol)
            return quote
            
        except Exception as e:
            logger.error(f"Error getting real-time quote for {symbol}: {e}")
            raise
    
    async def get_historical_data(
        self, 
        symbol: str, 
        timeframe: TimeFrame,
        start_date: datetime,
        end_date: Optional[datetime] = None,
        source: Optional[DataSource] = None
    ) -> List[MarketData]:
        """
        Get historical market data.
        
        Args:
            symbol: Trading symbol
            timeframe: Data timeframe
            start_date: Start date
            end_date: End date (default: now)
            source: Data source (auto-detect if None)
            
        Returns:
            List of historical market data
        """
        try:
            if not end_date:
                end_date = datetime.utcnow()
            
            if not source:
                source = self._detect_best_source(symbol)
            
            provider = self.data_sources.get(source)
            if not provider:
                raise ValueError(f"Data source {source} not available")
            
            # Check cache first
            cache_key = f"{symbol}:{timeframe.value}:{start_date.date()}:{end_date.date()}"
            if self._is_cached(cache_key):
                return self.cache[cache_key]["data"]
            
            # Fetch data
            data = await provider.get_historical_data(symbol, timeframe, start_date, end_date)
            
            # Cache data
            self._cache_data(cache_key, data)
            
            return data
            
        except Exception as e:
            logger.error(f"Error getting historical data for {symbol}: {e}")
            raise
    
    async def get_symbol_data(self, symbol: str) -> Dict[str, Any]:
        """
        Get comprehensive symbol data including quotes and technical indicators.
        
        Args:
            symbol: Trading symbol
            
        Returns:
            Comprehensive symbol data
        """
        try:
            # Get real-time quote
            quote = await self.get_real_time_quote(symbol)
            
            # Get recent historical data for technical indicators
            end_date = datetime.utcnow()
            start_date = end_date - timedelta(days=30)  # 30 days of data
            
            historical_data = await self.get_historical_data(
                symbol, TimeFrame.DAY_1, start_date, end_date
            )
            
            # Calculate technical indicators
            indicators = self._calculate_indicators(historical_data)
            
            return {
                "symbol": symbol,
                "quote": quote,
                "historical_data": historical_data[-10:],  # Last 10 days
                "indicators": indicators,
                "metadata": {
                    "last_updated": datetime.utcnow().isoformat(),
                    "data_points": len(historical_data)
                }
            }
            
        except Exception as e:
            logger.error(f"Error getting symbol data for {symbol}: {e}")
            raise
    
    async def get_multiple_quotes(self, symbols: List[str]) -> Dict[str, Quote]:
        """
        Get real-time quotes for multiple symbols.
        
        Args:
            symbols: List of trading symbols
            
        Returns:
            Dictionary of symbol to quote mapping
        """
        try:
            # Group symbols by exchange for efficient fetching
            symbols_by_exchange = self._group_symbols_by_exchange(symbols)
            
            quotes = {}
            for exchange, exchange_symbols in symbols_by_exchange.items():
                source = self._get_source_for_exchange(exchange)
                provider = self.data_sources.get(source)
                
                if provider:
                    exchange_quotes = await provider.get_multiple_quotes(exchange_symbols)
                    quotes.update(exchange_quotes)
            
            return quotes
            
        except Exception as e:
            logger.error(f"Error getting multiple quotes: {e}")
            raise
    
    def _detect_best_source(self, symbol: str) -> DataSource:
        """Detect the best data source for a symbol."""
        # Simple logic - in production, this should be more sophisticated
        if symbol.endswith('.NSE') or symbol.endswith('.BSE'):
            return DataSource.NSE_API
        elif symbol.endswith('.NS') or symbol.endswith('.BS'):
            return DataSource.YAHOO_FINANCE
        else:
            return DataSource.ALPHA_VANTAGE
    
    def _group_symbols_by_exchange(self, symbols: List[str]) -> Dict[str, List[str]]:
        """Group symbols by exchange."""
        groups = {}
        for symbol in symbols:
            if symbol.endswith('.NSE'):
                exchange = 'NSE'
            elif symbol.endswith('.BSE'):
                exchange = 'BSE'
            else:
                exchange = 'UNKNOWN'
            
            if exchange not in groups:
                groups[exchange] = []
            groups[exchange].append(symbol)
        
        return groups
    
    def _get_source_for_exchange(self, exchange: str) -> DataSource:
        """Get data source for exchange."""
        if exchange == 'NSE':
            return DataSource.NSE_API
        elif exchange == 'BSE':
            return DataSource.BSE_API
        else:
            return DataSource.YAHOO_FINANCE
    
    def _calculate_indicators(self, data: List[MarketData]) -> Dict[str, Any]:
        """Calculate technical indicators from historical data."""
        try:
            if len(data) < 20:  # Need minimum data points
                return {}
            
            # Convert to DataFrame for easier calculation
            df = pd.DataFrame([{
                'timestamp': d.timestamp,
                'open': d.open,
                'high': d.high,
                'low': d.low,
                'close': d.close,
                'volume': d.volume
            } for d in data])
            
            df.set_index('timestamp', inplace=True)
            
            # Calculate indicators
            indicators = calculate_technical_indicators(df)
            
            return indicators
            
        except Exception as e:
            logger.error(f"Error calculating indicators: {e}")
            return {}
    
    def _is_cached(self, cache_key: str) -> bool:
        """Check if data is cached and still valid."""
        if cache_key in self.cache:
            cached_time = self.cache[cache_key]["timestamp"]
            if (datetime.utcnow() - cached_time).seconds < self.cache_ttl:
                return True
            else:
                del self.cache[cache_key]
        return False
    
    def _cache_data(self, cache_key: str, data: Any) -> None:
        """Cache data with timestamp."""
        self.cache[cache_key] = {
            "data": data,
            "timestamp": datetime.utcnow()
        }


class BaseDataProvider:
    """Base class for data providers."""
    
    async def get_quote(self, symbol: str) -> Quote:
        """Get real-time quote."""
        raise NotImplementedError
    
    async def get_historical_data(
        self, 
        symbol: str, 
        timeframe: TimeFrame,
        start_date: datetime,
        end_date: datetime
    ) -> List[MarketData]:
        """Get historical data."""
        raise NotImplementedError
    
    async def get_multiple_quotes(self, symbols: List[str]) -> Dict[str, Quote]:
        """Get multiple quotes."""
        raise NotImplementedError


class ZerodhaDataProvider(BaseDataProvider):
    """Zerodha Kite Connect data provider."""
    
    BASE_URL = "https://api.kite.trade"
    
    def __init__(self):
        self.api_key = None
        self.access_token = None
    
    async def get_quote(self, symbol: str) -> Quote:
        """Get quote from Zerodha."""
        try:
            async with aiohttp.ClientSession() as session:
                headers = {
                    "Authorization": f"token {self.api_key}:{self.access_token}",
                    "X-Kite-Version": "3"
                }
                
                async with session.get(
                    f"{self.BASE_URL}/quote/ltp?i={symbol}",
                    headers=headers
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        quote_data = data["data"][symbol]
                        
                        return Quote(
                            symbol=symbol,
                            last_price=quote_data["last_price"],
                            bid=quote_data.get("bid_price", 0),
                            ask=quote_data.get("ask_price", 0),
                            volume=quote_data.get("volume", 0),
                            timestamp=datetime.utcnow(),
                            source=DataSource.ZERODHA,
                            exchange="NSE"
                        )
                    else:
                        raise Exception(f"Zerodha API error: {response.status}")
        
        except Exception as e:
            logger.error(f"Error getting Zerodha quote: {e}")
            raise
    
    async def get_historical_data(
        self, 
        symbol: str, 
        timeframe: TimeFrame,
        start_date: datetime,
        end_date: datetime
    ) -> List[MarketData]:
        """Get historical data from Zerodha."""
        try:
            async with aiohttp.ClientSession() as session:
                headers = {
                    "Authorization": f"token {self.api_key}:{self.access_token}",
                    "X-Kite-Version": "3"
                }
                
                params = {
                    "from": start_date.strftime("%Y-%m-%d"),
                    "to": end_date.strftime("%Y-%m-%d"),
                    "interval": self._convert_timeframe(timeframe)
                }
                
                async with session.get(
                    f"{self.BASE_URL}/instruments/historical/{symbol}/{timeframe.value}",
                    headers=headers,
                    params=params
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        return self._parse_historical_data(data, symbol)
                    else:
                        raise Exception(f"Zerodha historical data error: {response.status}")
        
        except Exception as e:
            logger.error(f"Error getting Zerodha historical data: {e}")
            raise
    
    async def get_multiple_quotes(self, symbols: List[str]) -> Dict[str, Quote]:
        """Get multiple quotes from Zerodha."""
        quotes = {}
        for symbol in symbols:
            try:
                quotes[symbol] = await self.get_quote(symbol)
            except Exception as e:
                logger.error(f"Error getting quote for {symbol}: {e}")
                continue
        return quotes
    
    def _convert_timeframe(self, timeframe: TimeFrame) -> str:
        """Convert timeframe to Zerodha format."""
        mapping = {
            TimeFrame.MINUTE_1: "minute",
            TimeFrame.MINUTE_5: "5minute",
            TimeFrame.MINUTE_15: "15minute",
            TimeFrame.MINUTE_30: "30minute",
            TimeFrame.HOUR_1: "hour",
            TimeFrame.DAY_1: "day"
        }
        return mapping.get(timeframe, "day")
    
    def _parse_historical_data(self, data: Dict[str, Any], symbol: str) -> List[MarketData]:
        """Parse historical data from Zerodha response."""
        market_data = []
        
        for candle in data["data"]["candles"]:
            market_data.append(MarketData(
                symbol=symbol,
                timestamp=datetime.fromisoformat(candle[0]),
                open=candle[1],
                high=candle[2],
                low=candle[3],
                close=candle[4],
                volume=candle[5],
                source=DataSource.ZERODHA,
                exchange="NSE"
            ))
        
        return market_data


class AngelOneDataProvider(BaseDataProvider):
    """Angel One SmartAPI data provider."""
    
    BASE_URL = "https://apiconnect.angelbroking.com"
    
    def __init__(self):
        self.api_key = None
        self.access_token = None
    
    async def get_quote(self, symbol: str) -> Quote:
        """Get quote from Angel One."""
        try:
            async with aiohttp.ClientSession() as session:
                headers = {
                    "Authorization": f"Bearer {self.access_token}",
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "X-UserType": "USER",
                    "X-SourceID": "WEB",
                    "X-PrivateKey": self.api_key
                }
                
                params = {
                    "mode": "LTP",
                    "exchangeTokens": f"NSE|{symbol}"
                }
                
                async with session.get(
                    f"{self.BASE_URL}/rest/secure/angelbroking/market/v1/quote/",
                    headers=headers,
                    params=params
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        quote_data = data["data"]["fetched"][0]
                        
                        return Quote(
                            symbol=symbol,
                            last_price=quote_data["ltp"],
                            bid=quote_data.get("bid", 0),
                            ask=quote_data.get("ask", 0),
                            volume=quote_data.get("volume", 0),
                            timestamp=datetime.utcnow(),
                            source=DataSource.ANGEL_ONE,
                            exchange="NSE"
                        )
                    else:
                        raise Exception(f"Angel One API error: {response.status}")
        
        except Exception as e:
            logger.error(f"Error getting Angel One quote: {e}")
            raise
    
    async def get_historical_data(
        self, 
        symbol: str, 
        timeframe: TimeFrame,
        start_date: datetime,
        end_date: datetime
    ) -> List[MarketData]:
        """Get historical data from Angel One."""
        try:
            async with aiohttp.ClientSession() as session:
                headers = {
                    "Authorization": f"Bearer {self.access_token}",
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "X-UserType": "USER",
                    "X-SourceID": "WEB",
                    "X-PrivateKey": self.api_key
                }
                
                params = {
                    "exchange": "NSE",
                    "symboltoken": self._get_symbol_token(symbol),
                    "interval": self._convert_timeframe(timeframe),
                    "fromdate": start_date.strftime("%Y-%m-%d %H:%M"),
                    "todate": end_date.strftime("%Y-%m-%d %H:%M")
                }
                
                async with session.get(
                    f"{self.BASE_URL}/rest/secure/angelbroking/historical/v1/getCandleData",
                    headers=headers,
                    params=params
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        return self._parse_historical_data(data, symbol)
                    else:
                        raise Exception(f"Angel One historical data error: {response.status}")
        
        except Exception as e:
            logger.error(f"Error getting Angel One historical data: {e}")
            raise
    
    async def get_multiple_quotes(self, symbols: List[str]) -> Dict[str, Quote]:
        """Get multiple quotes from Angel One."""
        quotes = {}
        for symbol in symbols:
            try:
                quotes[symbol] = await self.get_quote(symbol)
            except Exception as e:
                logger.error(f"Error getting quote for {symbol}: {e}")
                continue
        return quotes
    
    def _convert_timeframe(self, timeframe: TimeFrame) -> str:
        """Convert timeframe to Angel One format."""
        mapping = {
            TimeFrame.MINUTE_1: "ONE_MINUTE",
            TimeFrame.MINUTE_5: "FIVE_MINUTE",
            TimeFrame.MINUTE_15: "FIFTEEN_MINUTE",
            TimeFrame.MINUTE_30: "THIRTY_MINUTE",
            TimeFrame.HOUR_1: "ONE_HOUR",
            TimeFrame.DAY_1: "ONE_DAY"
        }
        return mapping.get(timeframe, "ONE_DAY")
    
    def _get_symbol_token(self, symbol: str) -> str:
        """Get symbol token for Angel One."""
        # This should be fetched from Angel One's symbol master
        return "12345"
    
    def _parse_historical_data(self, data: Dict[str, Any], symbol: str) -> List[MarketData]:
        """Parse historical data from Angel One response."""
        market_data = []
        
        for candle in data["data"]:
            market_data.append(MarketData(
                symbol=symbol,
                timestamp=datetime.fromisoformat(candle[0]),
                open=candle[1],
                high=candle[2],
                low=candle[3],
                close=candle[4],
                volume=candle[5],
                source=DataSource.ANGEL_ONE,
                exchange="NSE"
            ))
        
        return market_data


class UpstoxDataProvider(BaseDataProvider):
    """Upstox API data provider."""
    
    BASE_URL = "https://api.upstox.com"
    
    def __init__(self):
        self.api_key = None
        self.access_token = None
    
    async def get_quote(self, symbol: str) -> Quote:
        """Get quote from Upstox."""
        try:
            async with aiohttp.ClientSession() as session:
                headers = {
                    "Authorization": f"Bearer {self.access_token}",
                    "Accept": "application/json"
                }
                
                async with session.get(
                    f"{self.BASE_URL}/index/market-quote/ltp/{symbol}",
                    headers=headers
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        quote_data = data["data"][symbol]
                        
                        return Quote(
                            symbol=symbol,
                            last_price=quote_data["last_price"],
                            bid=quote_data.get("bid", 0),
                            ask=quote_data.get("ask", 0),
                            volume=quote_data.get("volume", 0),
                            timestamp=datetime.utcnow(),
                            source=DataSource.UPSTOX,
                            exchange="NSE"
                        )
                    else:
                        raise Exception(f"Upstox API error: {response.status}")
        
        except Exception as e:
            logger.error(f"Error getting Upstox quote: {e}")
            raise
    
    async def get_historical_data(
        self, 
        symbol: str, 
        timeframe: TimeFrame,
        start_date: datetime,
        end_date: datetime
    ) -> List[MarketData]:
        """Get historical data from Upstox."""
        try:
            async with aiohttp.ClientSession() as session:
                headers = {
                    "Authorization": f"Bearer {self.access_token}",
                    "Accept": "application/json"
                }
                
                params = {
                    "interval": self._convert_timeframe(timeframe),
                    "to_date": end_date.strftime("%Y-%m-%d"),
                    "from_date": start_date.strftime("%Y-%m-%d")
                }
                
                async with session.get(
                    f"{self.BASE_URL}/index/historical-candle/{symbol}/1/{self._convert_timeframe(timeframe)}",
                    headers=headers,
                    params=params
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        return self._parse_historical_data(data, symbol)
                    else:
                        raise Exception(f"Upstox historical data error: {response.status}")
        
        except Exception as e:
            logger.error(f"Error getting Upstox historical data: {e}")
            raise
    
    async def get_multiple_quotes(self, symbols: List[str]) -> Dict[str, Quote]:
        """Get multiple quotes from Upstox."""
        quotes = {}
        for symbol in symbols:
            try:
                quotes[symbol] = await self.get_quote(symbol)
            except Exception as e:
                logger.error(f"Error getting quote for {symbol}: {e}")
                continue
        return quotes
    
    def _convert_timeframe(self, timeframe: TimeFrame) -> str:
        """Convert timeframe to Upstox format."""
        mapping = {
            TimeFrame.MINUTE_1: "1minute",
            TimeFrame.MINUTE_5: "5minute",
            TimeFrame.MINUTE_15: "15minute",
            TimeFrame.MINUTE_30: "30minute",
            TimeFrame.HOUR_1: "1hour",
            TimeFrame.DAY_1: "1day"
        }
        return mapping.get(timeframe, "1day")
    
    def _parse_historical_data(self, data: Dict[str, Any], symbol: str) -> List[MarketData]:
        """Parse historical data from Upstox response."""
        market_data = []
        
        for candle in data["data"]["candles"]:
            market_data.append(MarketData(
                symbol=symbol,
                timestamp=datetime.fromisoformat(candle[0]),
                open=candle[1],
                high=candle[2],
                low=candle[3],
                close=candle[4],
                volume=candle[5],
                source=DataSource.UPSTOX,
                exchange="NSE"
            ))
        
        return market_data


class AlphaVantageDataProvider(BaseDataProvider):
    """Alpha Vantage API data provider."""
    
    BASE_URL = "https://www.alphavantage.co/query"
    
    def __init__(self):
        self.api_key = None
    
    async def get_quote(self, symbol: str) -> Quote:
        """Get quote from Alpha Vantage."""
        try:
            async with aiohttp.ClientSession() as session:
                params = {
                    "function": "GLOBAL_QUOTE",
                    "symbol": symbol,
                    "apikey": self.api_key
                }
                
                async with session.get(self.BASE_URL, params=params) as response:
                    if response.status == 200:
                        data = await response.json()
                        quote_data = data["Global Quote"]
                        
                        return Quote(
                            symbol=symbol,
                            last_price=float(quote_data["05. price"]),
                            bid=float(quote_data.get("09. change", 0)),
                            ask=float(quote_data.get("10. change percent", 0)),
                            volume=int(quote_data.get("06. volume", 0)),
                            timestamp=datetime.utcnow(),
                            source=DataSource.ALPHA_VANTAGE,
                            exchange="NYSE"
                        )
                    else:
                        raise Exception(f"Alpha Vantage API error: {response.status}")
        
        except Exception as e:
            logger.error(f"Error getting Alpha Vantage quote: {e}")
            raise
    
    async def get_historical_data(
        self, 
        symbol: str, 
        timeframe: TimeFrame,
        start_date: datetime,
        end_date: datetime
    ) -> List[MarketData]:
        """Get historical data from Alpha Vantage."""
        try:
            async with aiohttp.ClientSession() as session:
                params = {
                    "function": "TIME_SERIES_DAILY",
                    "symbol": symbol,
                    "apikey": self.api_key,
                    "outputsize": "full"
                }
                
                async with session.get(self.BASE_URL, params=params) as response:
                    if response.status == 200:
                        data = await response.json()
                        return self._parse_historical_data(data, symbol)
                    else:
                        raise Exception(f"Alpha Vantage historical data error: {response.status}")
        
        except Exception as e:
            logger.error(f"Error getting Alpha Vantage historical data: {e}")
            raise
    
    async def get_multiple_quotes(self, symbols: List[str]) -> Dict[str, Quote]:
        """Get multiple quotes from Alpha Vantage."""
        quotes = {}
        for symbol in symbols:
            try:
                quotes[symbol] = await self.get_quote(symbol)
            except Exception as e:
                logger.error(f"Error getting quote for {symbol}: {e}")
                continue
        return quotes
    
    def _parse_historical_data(self, data: Dict[str, Any], symbol: str) -> List[MarketData]:
        """Parse historical data from Alpha Vantage response."""
        market_data = []
        
        time_series = data["Time Series (Daily)"]
        for date_str, values in time_series.items():
            market_data.append(MarketData(
                symbol=symbol,
                timestamp=datetime.fromisoformat(date_str),
                open=float(values["1. open"]),
                high=float(values["2. high"]),
                low=float(values["3. low"]),
                close=float(values["4. close"]),
                volume=int(values["5. volume"]),
                source=DataSource.ALPHA_VANTAGE,
                exchange="NYSE"
            ))
        
        return sorted(market_data, key=lambda x: x.timestamp)


class YahooFinanceDataProvider(BaseDataProvider):
    """Yahoo Finance data provider."""
    
    BASE_URL = "https://query1.finance.yahoo.com/v8/finance/chart"
    
    async def get_quote(self, symbol: str) -> Quote:
        """Get quote from Yahoo Finance."""
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(f"{self.BASE_URL}/{symbol}") as response:
                    if response.status == 200:
                        data = await response.json()
                        quote_data = data["chart"]["result"][0]["meta"]
                        
                        return Quote(
                            symbol=symbol,
                            last_price=quote_data["regularMarketPrice"],
                            bid=quote_data.get("bid", 0),
                            ask=quote_data.get("ask", 0),
                            volume=quote_data.get("regularMarketVolume", 0),
                            timestamp=datetime.utcnow(),
                            source=DataSource.YAHOO_FINANCE,
                            exchange="NYSE"
                        )
                    else:
                        raise Exception(f"Yahoo Finance API error: {response.status}")
        
        except Exception as e:
            logger.error(f"Error getting Yahoo Finance quote: {e}")
            raise
    
    async def get_historical_data(
        self, 
        symbol: str, 
        timeframe: TimeFrame,
        start_date: datetime,
        end_date: datetime
    ) -> List[MarketData]:
        """Get historical data from Yahoo Finance."""
        try:
            async with aiohttp.ClientSession() as session:
                params = {
                    "period1": int(start_date.timestamp()),
                    "period2": int(end_date.timestamp()),
                    "interval": self._convert_timeframe(timeframe)
                }
                
                async with session.get(f"{self.BASE_URL}/{symbol}", params=params) as response:
                    if response.status == 200:
                        data = await response.json()
                        return self._parse_historical_data(data, symbol)
                    else:
                        raise Exception(f"Yahoo Finance historical data error: {response.status}")
        
        except Exception as e:
            logger.error(f"Error getting Yahoo Finance historical data: {e}")
            raise
    
    async def get_multiple_quotes(self, symbols: List[str]) -> Dict[str, Quote]:
        """Get multiple quotes from Yahoo Finance."""
        quotes = {}
        for symbol in symbols:
            try:
                quotes[symbol] = await self.get_quote(symbol)
            except Exception as e:
                logger.error(f"Error getting quote for {symbol}: {e}")
                continue
        return quotes
    
    def _convert_timeframe(self, timeframe: TimeFrame) -> str:
        """Convert timeframe to Yahoo Finance format."""
        mapping = {
            TimeFrame.MINUTE_1: "1m",
            TimeFrame.MINUTE_5: "5m",
            TimeFrame.MINUTE_15: "15m",
            TimeFrame.MINUTE_30: "30m",
            TimeFrame.HOUR_1: "1h",
            TimeFrame.DAY_1: "1d"
        }
        return mapping.get(timeframe, "1d")
    
    def _parse_historical_data(self, data: Dict[str, Any], symbol: str) -> List[MarketData]:
        """Parse historical data from Yahoo Finance response."""
        market_data = []
        
        result = data["chart"]["result"][0]
        timestamps = result["timestamp"]
        quotes = result["indicators"]["quote"][0]
        
        for i, timestamp in enumerate(timestamps):
            market_data.append(MarketData(
                symbol=symbol,
                timestamp=datetime.fromtimestamp(timestamp),
                open=quotes["open"][i],
                high=quotes["high"][i],
                low=quotes["low"][i],
                close=quotes["close"][i],
                volume=quotes["volume"][i],
                source=DataSource.YAHOO_FINANCE,
                exchange="NYSE"
            ))
        
        return market_data


class NSEDataProvider(BaseDataProvider):
    """NSE API data provider."""
    
    BASE_URL = "https://www.nseindia.com/api"
    
    async def get_quote(self, symbol: str) -> Quote:
        """Get quote from NSE."""
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(f"{self.BASE_URL}/quote-equity?symbol={symbol}") as response:
                    if response.status == 200:
                        data = await response.json()
                        quote_data = data["priceInfo"]
                        
                        return Quote(
                            symbol=symbol,
                            last_price=quote_data["lastPrice"],
                            bid=quote_data.get("bidPrice", 0),
                            ask=quote_data.get("askPrice", 0),
                            volume=quote_data.get("totalTradedVolume", 0),
                            timestamp=datetime.utcnow(),
                            source=DataSource.NSE_API,
                            exchange="NSE"
                        )
                    else:
                        raise Exception(f"NSE API error: {response.status}")
        
        except Exception as e:
            logger.error(f"Error getting NSE quote: {e}")
            raise
    
    async def get_historical_data(
        self, 
        symbol: str, 
        timeframe: TimeFrame,
        start_date: datetime,
        end_date: datetime
    ) -> List[MarketData]:
        """Get historical data from NSE."""
        try:
            async with aiohttp.ClientSession() as session:
                params = {
                    "symbol": symbol,
                    "from": start_date.strftime("%d-%m-%Y"),
                    "to": end_date.strftime("%d-%m-%Y")
                }
                
                async with session.get(f"{self.BASE_URL}/historical-charts/equity", params=params) as response:
                    if response.status == 200:
                        data = await response.json()
                        return self._parse_historical_data(data, symbol)
                    else:
                        raise Exception(f"NSE historical data error: {response.status}")
        
        except Exception as e:
            logger.error(f"Error getting NSE historical data: {e}")
            raise
    
    async def get_multiple_quotes(self, symbols: List[str]) -> Dict[str, Quote]:
        """Get multiple quotes from NSE."""
        quotes = {}
        for symbol in symbols:
            try:
                quotes[symbol] = await self.get_quote(symbol)
            except Exception as e:
                logger.error(f"Error getting quote for {symbol}: {e}")
                continue
        return quotes
    
    def _parse_historical_data(self, data: Dict[str, Any], symbol: str) -> List[MarketData]:
        """Parse historical data from NSE response."""
        market_data = []
        
        for candle in data["data"]:
            market_data.append(MarketData(
                symbol=symbol,
                timestamp=datetime.fromisoformat(candle["CH_TIMESTAMP"]),
                open=candle["CH_OPENING_PRICE"],
                high=candle["CH_TRADE_HIGH_PRICE"],
                low=candle["CH_TRADE_LOW_PRICE"],
                close=candle["CH_CLOSING_PRICE"],
                volume=candle["CH_TOT_TRADED_QTY"],
                source=DataSource.NSE_API,
                exchange="NSE"
            ))
        
        return market_data


class BSEDataProvider(BaseDataProvider):
    """BSE API data provider."""
    
    BASE_URL = "https://api.bseindia.com/BseIndiaAPI/api"
    
    async def get_quote(self, symbol: str) -> Quote:
        """Get quote from BSE."""
        try:
            async with aiohttp.ClientSession() as session:
                params = {
                    "scripcode": symbol,
                    "seriesid": "EQ"
                }
                
                async with session.get(f"{self.BASE_URL}/StockReachGraph/w", params=params) as response:
                    if response.status == 200:
                        data = await response.json()
                        quote_data = data["Table"][0]
                        
                        return Quote(
                            symbol=symbol,
                            last_price=quote_data["LTP"],
                            bid=quote_data.get("BidPrice", 0),
                            ask=quote_data.get("AskPrice", 0),
                            volume=quote_data.get("Volume", 0),
                            timestamp=datetime.utcnow(),
                            source=DataSource.BSE_API,
                            exchange="BSE"
                        )
                    else:
                        raise Exception(f"BSE API error: {response.status}")
        
        except Exception as e:
            logger.error(f"Error getting BSE quote: {e}")
            raise
    
    async def get_historical_data(
        self, 
        symbol: str, 
        timeframe: TimeFrame,
        start_date: datetime,
        end_date: datetime
    ) -> List[MarketData]:
        """Get historical data from BSE."""
        try:
            # BSE doesn't provide historical data API
            # Return empty list or implement alternative
            return []
        
        except Exception as e:
            logger.error(f"Error getting BSE historical data: {e}")
            raise
    
    async def get_multiple_quotes(self, symbols: List[str]) -> Dict[str, Quote]:
        """Get multiple quotes from BSE."""
        quotes = {}
        for symbol in symbols:
            try:
                quotes[symbol] = await self.get_quote(symbol)
            except Exception as e:
                logger.error(f"Error getting quote for {symbol}: {e}")
                continue
        return quotes


# Export classes
__all__ = [
    "MarketDataService",
    "BaseDataProvider",
    "ZerodhaDataProvider",
    "AngelOneDataProvider", 
    "UpstoxDataProvider",
    "AlphaVantageDataProvider",
    "YahooFinanceDataProvider",
    "NSEDataProvider",
    "BSEDataProvider",
    "MarketData",
    "Quote",
    "DataSource",
    "TimeFrame"
]
