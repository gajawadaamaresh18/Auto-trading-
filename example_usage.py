"""
Example usage of the Trading Formula Platform API

This script demonstrates how to use the various endpoints of the API.
"""

import asyncio
import httpx
import json
from typing import Dict, Any

# API base URL
BASE_URL = "http://localhost:8000"

class TradingAPIClient:
    def __init__(self, base_url: str = BASE_URL):
        self.base_url = base_url
        self.token = None
        self.client = httpx.AsyncClient()
    
    async def __aenter__(self):
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.client.aclose()
    
    def _get_headers(self) -> Dict[str, str]:
        headers = {"Content-Type": "application/json"}
        if self.token:
            headers["Authorization"] = f"Bearer {self.token}"
        return headers
    
    async def register_user(self, email: str, username: str, password: str) -> Dict[str, Any]:
        """Register a new user"""
        response = await self.client.post(
            f"{self.base_url}/auth/register",
            json={"email": email, "username": username, "password": password},
            headers=self._get_headers()
        )
        return response.json()
    
    async def login(self, email: str, password: str) -> str:
        """Login and get access token"""
        response = await self.client.post(
            f"{self.base_url}/auth/login",
            json={"email": email, "password": password},
            headers=self._get_headers()
        )
        data = response.json()
        self.token = data["access_token"]
        return self.token
    
    async def get_my_profile(self) -> Dict[str, Any]:
        """Get current user profile"""
        response = await self.client.get(
            f"{self.base_url}/auth/me",
            headers=self._get_headers()
        )
        return response.json()
    
    async def create_formula(self, name: str, description: str, formula_code: str) -> Dict[str, Any]:
        """Create a new trading formula"""
        response = await self.client.post(
            f"{self.base_url}/formulas/",
            json={
                "name": name,
                "description": description,
                "formula_code": formula_code,
                "category": "technical",
                "tags": ["example", "demo"],
                "is_public": True
            },
            headers=self._get_headers()
        )
        return response.json()
    
    async def get_formulas(self, search: str = None, category: str = None) -> Dict[str, Any]:
        """Get formulas with optional filtering"""
        params = {}
        if search:
            params["search"] = search
        if category:
            params["category"] = category
        
        response = await self.client.get(
            f"{self.base_url}/formulas/",
            params=params,
            headers=self._get_headers()
        )
        return response.json()
    
    async def subscribe_to_formula(self, formula_id: int) -> Dict[str, Any]:
        """Subscribe to a formula"""
        response = await self.client.post(
            f"{self.base_url}/subscriptions/",
            json={"formula_id": formula_id},
            headers=self._get_headers()
        )
        return response.json()
    
    async def get_my_subscriptions(self) -> Dict[str, Any]:
        """Get my subscriptions"""
        response = await self.client.get(
            f"{self.base_url}/subscriptions/",
            headers=self._get_headers()
        )
        return response.json()
    
    async def add_portfolio_position(self, symbol: str, quantity: float, price: float) -> Dict[str, Any]:
        """Add a position to portfolio"""
        response = await self.client.post(
            f"{self.base_url}/portfolio/positions",
            json={
                "symbol": symbol,
                "quantity": quantity,
                "average_price": price
            },
            headers=self._get_headers()
        )
        return response.json()
    
    async def get_portfolio_stats(self) -> Dict[str, Any]:
        """Get portfolio statistics"""
        response = await self.client.get(
            f"{self.base_url}/portfolio/stats",
            headers=self._get_headers()
        )
        return response.json()
    
    async def create_review(self, formula_id: int, rating: int, comment: str) -> Dict[str, Any]:
        """Create a review for a formula"""
        response = await self.client.post(
            f"{self.base_url}/reviews/",
            json={
                "formula_id": formula_id,
                "rating": rating,
                "comment": comment
            },
            headers=self._get_headers()
        )
        return response.json()
    
    async def get_notifications(self) -> Dict[str, Any]:
        """Get user notifications"""
        response = await self.client.get(
            f"{self.base_url}/notifications/",
            headers=self._get_headers()
        )
        return response.json()


async def main():
    """Example usage of the API"""
    async with TradingAPIClient() as client:
        print("🚀 Trading Formula Platform API Example")
        print("=" * 50)
        
        try:
            # 1. Register and login
            print("\n1. Registering new user...")
            await client.register_user(
                email="trader@example.com",
                username="demo_trader",
                password="securepassword123"
            )
            print("✅ User registered successfully")
            
            print("\n2. Logging in...")
            await client.login("trader@example.com", "securepassword123")
            print("✅ Login successful")
            
            # 2. Get user profile
            print("\n3. Getting user profile...")
            profile = await client.get_my_profile()
            print(f"✅ Profile: {profile['username']} ({profile['email']})")
            
            # 3. Create a trading formula
            print("\n4. Creating trading formula...")
            formula = await client.create_formula(
                name="RSI Oversold Strategy",
                description="Buy when RSI is below 30, sell when above 70",
                formula_code="""
                def rsi_strategy(data):
                    rsi = calculate_rsi(data, 14)
                    if rsi < 30:
                        return "BUY"
                    elif rsi > 70:
                        return "SELL"
                    else:
                        return "HOLD"
                """
            )
            print(f"✅ Formula created: {formula['name']} (ID: {formula['id']})")
            
            # 4. Get formulas
            print("\n5. Getting formulas...")
            formulas = await client.get_formulas(search="RSI")
            print(f"✅ Found {formulas['total']} formulas")
            
            # 5. Subscribe to formula
            print("\n6. Subscribing to formula...")
            subscription = await client.subscribe_to_formula(formula['id'])
            print("✅ Subscribed to formula")
            
            # 6. Add portfolio position
            print("\n7. Adding portfolio position...")
            position = await client.add_portfolio_position("AAPL", 100, 150.50)
            print(f"✅ Position added: {position['quantity']} shares of {position['symbol']} at ${position['average_price']}")
            
            # 7. Get portfolio stats
            print("\n8. Getting portfolio statistics...")
            stats = await client.get_portfolio_stats()
            print(f"✅ Portfolio stats: ${stats['total_value']} total value, {stats['positions_count']} positions")
            
            # 8. Create review
            print("\n9. Creating formula review...")
            review = await client.create_review(
                formula['id'], 
                5, 
                "Excellent strategy! Very profitable in backtesting."
            )
            print("✅ Review created")
            
            # 9. Get notifications
            print("\n10. Getting notifications...")
            notifications = await client.get_notifications()
            print(f"✅ Found {notifications['total']} notifications")
            
            print("\n🎉 API example completed successfully!")
            
        except Exception as e:
            print(f"❌ Error: {e}")


if __name__ == "__main__":
    asyncio.run(main())